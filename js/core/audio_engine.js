/**
 * ==============================================================================
 * AFM MANAGER 2027 — MOTOR CENTRAL DE ÁUDIO (AUDIO ENGINE)
 * Arquivo: js/core/audio_engine.js
 * 
 * Gerenciador modular de efeitos de jogo (SFX), áudio de torcida (Ambient Crowd)
 * e síntese procedural (Web Audio API) para partidas ao vivo e interface.
 * ==============================================================================
 */

class AFMAudioManager {
  constructor() {
    this.STORAGE_KEYS = {
      CROWD_ENABLED: 'afm_crowd_audio_enabled',
      SFX_ENABLED: 'afm_sfx_audio_enabled',
      CROWD_VOLUME: 'afm_crowd_volume',
      SFX_VOLUME: 'afm_sfx_volume'
    };

    // Estados iniciais lidos do localStorage com defaults seguros
    this.crowdEnabled = this._loadBool(this.STORAGE_KEYS.CROWD_ENABLED, true);
    this.sfxEnabled = this._loadBool(this.STORAGE_KEYS.SFX_ENABLED, true);
    this.crowdVolume = this._loadFloat(this.STORAGE_KEYS.CROWD_VOLUME, 0.35);
    this.sfxVolume = this._loadFloat(this.STORAGE_KEYS.SFX_VOLUME, 0.80);

    // Canais de áudio
    this.ambientAudioEl = null;
    this.currentClubSlug = null;
    this.currentLeagueSlug = null;
    this.isAmbientPlaying = false;
    this.audioContext = null;
    this.proceduralAmbientNodes = null;

    // Cache de elementos de SFX para baixa latência
    this.sfxCache = new Map();

    // Mapeamento de efeitos de áudio suportados
    this.SFX_FILES = {
      'whistle_start': 'sounds/sfx/whistle_start.mp3',
      'whistle_foul': 'sounds/sfx/whistle_foul.mp3',
      'whistle_card': 'sounds/sfx/whistle_card.mp3',
      'whistle_halftime': 'sounds/sfx/whistle_halftime.mp3',
      'whistle_end': 'sounds/sfx/whistle_end.mp3',
      'goal_celebration': 'sounds/sfx/goal_celebration.mp3',
      'goal_post': 'sounds/sfx/goal_post.mp3',
      'crowd_gasp': 'sounds/sfx/crowd_gasp.mp3'
    };

    // Mapeamento de ligas conhecidas para pastas
    this.LEAGUE_FOLDER_MAP = {
      'bra-a': 'bra_a',
      'bra-b': 'bra_b',
      'bra-c': 'bra_c',
      'bra-d': 'bra_d',
      'arg-1': 'arg_1',
      'bra-est-sp': 'bra_estaduais',
      'bra-est-rj': 'bra_estaduais',
      'bra-est-mg': 'bra_estaduais',
      'bra-est-rs': 'bra_estaduais',
      'bra-est-pr': 'bra_estaduais',
      'bra-est-df': 'bra_estaduais',
      'bra-est-ba': 'bra_estaduais',
      'bra-est-ce': 'bra_estaduais',
      'bra-est-pe': 'bra_estaduais',
      'bra-est-go': 'bra_estaduais',
      'bra-est-sc': 'bra_estaduais'
    };

    this._bindAutoResumeOnUserGesture();
  }

  /* -------------------------------------------------------------
   * PERSISTÊNCIA & GETTERS / SETTERS
   * ------------------------------------------------------------- */
  _loadBool(key, defaultVal) {
    const val = localStorage.getItem(key);
    if (val === null || val === undefined) return defaultVal;
    return val === 'true' || val === '1';
  }

  _loadFloat(key, defaultVal) {
    const val = parseFloat(localStorage.getItem(key));
    if (isNaN(val) || val < 0 || val > 1) return defaultVal;
    return val;
  }

  isCrowdAudioEnabled() {
    return this.crowdEnabled;
  }

  isSFXAudioEnabled() {
    return this.sfxEnabled;
  }

  getCrowdVolume() {
    return this.crowdVolume;
  }

  getSFXVolume() {
    return this.sfxVolume;
  }

  toggleCrowdAudio(enabled) {
    this.crowdEnabled = !!enabled;
    localStorage.setItem(this.STORAGE_KEYS.CROWD_ENABLED, String(this.crowdEnabled));
    if (!this.crowdEnabled) {
      this.stopCrowdAmbient();
    } else if (this.currentClubSlug) {
      this.startCrowdAmbient(this.currentClubSlug, this.currentLeagueSlug);
    }
    return this.crowdEnabled;
  }

  toggleSFXAudio(enabled) {
    this.sfxEnabled = !!enabled;
    localStorage.setItem(this.STORAGE_KEYS.SFX_ENABLED, String(this.sfxEnabled));
    return this.sfxEnabled;
  }

  setCrowdVolume(vol) {
    const clamped = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    this.crowdVolume = clamped;
    localStorage.setItem(this.STORAGE_KEYS.CROWD_VOLUME, clamped.toFixed(2));
    if (this.ambientAudioEl) {
      this.ambientAudioEl.volume = clamped;
    }
    if (this.proceduralAmbientNodes && this.proceduralAmbientNodes.gain) {
      try {
        this.proceduralAmbientNodes.gain.gain.setValueAtTime(clamped * 0.12, this.getAudioContext().currentTime);
      } catch (e) { window.AFMErrorLog?.recordHandled(e, 'audio.setCrowdVolume'); }
    }
  }

  setSFXVolume(vol) {
    const clamped = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    this.sfxVolume = clamped;
    localStorage.setItem(this.STORAGE_KEYS.SFX_VOLUME, clamped.toFixed(2));
  }

  /* -------------------------------------------------------------
   * WEB AUDIO CONTEXT & GESTO DO USUÁRIO
   * ------------------------------------------------------------- */
  getAudioContext() {
    if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
      } catch (e) {
        window.AFMErrorLog?.recordHandled(e, 'audio.createContext');
        console.warn('AFMAudio: Web Audio API não suportada', e);
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(e => window.AFMErrorLog?.recordHandled(e, 'audio.resume'));
    }
    return this.audioContext;
  }

  _bindAutoResumeOnUserGesture() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const unlock = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(e => window.AFMErrorLog?.recordHandled(e, 'audio.resume'));
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  /* -------------------------------------------------------------
   * RESOLUÇÃO DE CAMINHOS & NORMALIZAÇÃO
   * ------------------------------------------------------------- */
  normalizeSlug(str) {
    if (typeof window.normSlug === 'function') {
      return window.normSlug(str);
    }
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  resolveLeagueFolder(homeClubName, compId) {
    if (compId && this.LEAGUE_FOLDER_MAP[compId]) {
      return this.LEAGUE_FOLDER_MAP[compId];
    }
    const slug = this.normalizeSlug(homeClubName);

    // Detecção heurística através do banco global se existir
    if (window.COMPETITION_TEAMS) {
      for (const [cId, list] of Object.entries(window.COMPETITION_TEAMS)) {
        if (Array.isArray(list)) {
          const match = list.some(name => this.normalizeSlug(name) === slug);
          if (match && this.LEAGUE_FOLDER_MAP[cId]) {
            return this.LEAGUE_FOLDER_MAP[cId];
          }
        }
      }
    }

    return 'bra_a';
  }

  /* -------------------------------------------------------------
   * CANAL SFX (EFEITOS SONOROS DA PARTIDA)
   * ------------------------------------------------------------- */
  playSFX(sfxKey, customVolume = null) {
    if (!this.sfxEnabled) return;
    if (window.liveMatchState && window.liveMatchState.soundMuted) return;

    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    this._sfxCooldown = this._sfxCooldown || new Map();
    const last = this._sfxCooldown.get(sfxKey) || 0;
    if (now - last < 180) return; // Cooldown de 180ms para velocidades 20x e 40x
    this._sfxCooldown.set(sfxKey, now);

    const vol = (customVolume !== null ? customVolume : this.sfxVolume);
    const audioPath = this.SFX_FILES[sfxKey];

    if (audioPath && typeof Audio !== 'undefined') {
      const audio = new Audio(audioPath);
      audio.volume = vol;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Fallback procedural se o arquivo físico não for encontrado no disco
          this._playProceduralSFX(sfxKey, vol);
        });
      }
    } else {
      this._playProceduralSFX(sfxKey, vol);
    }
  }

  /* -------------------------------------------------------------
   * SÍNTESE PROCEDURAL DE SFX (FALLBACK 100% FUNCIONAL SEM ARQUIVO)
   * ------------------------------------------------------------- */
  _playProceduralSFX(sfxKey, volume) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, t);
    masterGain.connect(ctx.destination);

    try {
      switch (sfxKey) {
        case 'whistle_start':
          // 2 apitos curtos e incisivos de início de partida
          this._synthWhistleBlast(ctx, masterGain, t, 2600, 0.10);
          this._synthWhistleBlast(ctx, masterGain, t + 0.14, 2800, 0.22);
          break;

        case 'whistle_foul':
          // 1 apito seco e firme de falta
          this._synthWhistleBlast(ctx, masterGain, t, 2450, 0.20);
          break;

        case 'whistle_card':
          // Apito agudo e cortante de cartão
          this._synthWhistleBlast(ctx, masterGain, t, 3100, 0.25);
          break;

        case 'whistle_halftime':
          // 2 apitos longos de fim do 1º tempo
          this._synthWhistleBlast(ctx, masterGain, t, 2400, 0.28);
          this._synthWhistleBlast(ctx, masterGain, t + 0.36, 2550, 0.45);
          break;

        case 'whistle_end':
          // 3 apitos clássicos de final de partida (curto, curto, longo)
          this._synthWhistleBlast(ctx, masterGain, t, 2400, 0.14);
          this._synthWhistleBlast(ctx, masterGain, t + 0.20, 2400, 0.14);
          this._synthWhistleBlast(ctx, masterGain, t + 0.40, 2600, 0.65);
          break;

        case 'goal_celebration':
          // Explosão sonora com ruído branco filtrado + ressonância de comemoração
          this._synthGoalCheer(ctx, masterGain, t);
          break;

        case 'goal_post':
          // Impacto metálico inarmônico no travessão / trave
          this._synthWoodworkPing(ctx, masterGain, t);
          break;

        case 'crowd_gasp':
          // Suspiro / reação de perigo coletiva da torcida
          this._synthCrowdGasp(ctx, masterGain, t);
          break;

        default:
          this._synthWhistleBlast(ctx, masterGain, t, 2500, 0.15);
          break;
      }
    } catch (err) {
      console.warn('AFMAudio: Falha na síntese procedural', err);
    }
  }

  _synthWhistleBlast(ctx, output, startTime, freq, duration) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Frequência modulada para o tom característico de apito Fox 40
    osc1.frequency.setValueAtTime(freq, startTime);
    osc1.frequency.linearRampToValueAtTime(freq + 150, startTime + (duration * 0.5));
    osc1.frequency.linearRampToValueAtTime(freq, startTime + duration);

    osc2.frequency.setValueAtTime(freq * 1.05, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.setValueAtTime(0.25, startTime + duration - 0.03);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(output);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  _synthGoalCheer(ctx, output, startTime) {
    const bufSize = Math.floor(ctx.sampleRate * 2.8);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const decay = Math.exp(-i / (bufSize * 0.5));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, startTime);
    filter.frequency.linearRampToValueAtTime(750, startTime + 0.6);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.40, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.7);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    src.start(startTime);
  }

  _synthWoodworkPing(ctx, output, startTime) {
    // Frequências inarmônicas simulando ferro oco da trave
    [840, 1260, 2140].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.20 / (idx + 1), startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);
      osc.connect(gain);
      gain.connect(output);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  _synthCrowdGasp(ctx, output, startTime) {
    const bufSize = Math.floor(ctx.sampleRate * 1.2);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, startTime);
    filter.frequency.linearRampToValueAtTime(950, startTime + 0.4);
    filter.frequency.linearRampToValueAtTime(300, startTime + 1.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.15);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    src.start(startTime);
  }

  /* -------------------------------------------------------------
   * CANAL AMBIENT (TORCIDA EM LOOP & DETECÇÃO MANDANTE PROGRESSIVA)
   * ------------------------------------------------------------- */
  startCrowdAmbient(homeClubName, compId = null) {
    if (!this.crowdEnabled) return;

    const clubSlug = this.normalizeSlug(homeClubName);
    const leagueSlug = this.resolveLeagueFolder(homeClubName, compId);
    this.currentClubSlug = clubSlug;
    this.currentLeagueSlug = leagueSlug;

    this.stopCrowdAmbient();

    // Fila inteligente de candidatos a reprodução
    const queue = [];
    const pushIfNew = (p) => { if (p && !queue.includes(p)) queue.push(p); };

    // 1. Caminho direto na pasta da competição resolvida
    pushIfNew(`sounds/crowd/${leagueSlug}/${clubSlug}.mp3`);

    // 2. Busca transversal em todas as pastas brasileiras
    const searchFolders = ['bra_a', 'bra_b', 'bra_c', 'bra_d', 'bra_estaduais'];
    searchFolders.forEach(fld => pushIfNew(`sounds/crowd/${fld}/${clubSlug}.mp3`));

    // 3. Aliases conhecidos para o clube
    const aliasMap = {
      'vasco_da_gama': ['vasco'],
      'vasco': ['vasco_da_gama'],
      'athletico_paranaense': ['athletico_pr', 'athletico'],
      'athletico_pr': ['athletico_paranaense', 'athletico'],
      'red_bull_bragantino': ['bragantino', 'rb_bragantino'],
      'bragantino': ['red_bull_bragantino', 'rb_bragantino'],
      'america_mg': ['america_mineiro', 'america'],
      'america_mineiro': ['america_mg', 'america'],
      'athletic_club': ['athletic'],
      'athletic': ['athletic_club'],
      'atletico_go': ['atletico_goianiense'],
      'atletico_goianiense': ['atletico_go'],
      'avai': ['avai_fc'],
      'avai_fc': ['avai'],
      'botafogo_sp': ['botafogo_ribeirao'],
      'botafogo_ribeirao': ['botafogo_sp'],
      'ceara': ['ceara_sc'],
      'ceara_sc': ['ceara'],
      'crb': ['crb_al'],
      'crb_al': ['crb'],
      'cuiaba': ['cuiaba_ec'],
      'cuiaba_ec': ['cuiaba'],
      'fortaleza': ['fortaleza_ec'],
      'fortaleza_ec': ['fortaleza'],
      'goias': ['goias_ec'],
      'goias_ec': ['goias'],
      'juventude': ['ec_juventude'],
      'ec_juventude': ['juventude'],
      'londrina': ['londrina_ec'],
      'londrina_ec': ['londrina'],
      'nautico': ['clube_nautico'],
      'clube_nautico': ['nautico'],
      'novorizontino': ['gremio_novorizontino'],
      'gremio_novorizontino': ['novorizontino'],
      'operario_pr': ['operario', 'operario_ferroviario'],
      'operario': ['operario_pr', 'operario_ferroviario'],
      'ponte_preta': ['ponte_preta_sp'],
      'ponte_preta_sp': ['ponte_preta'],
      'sao_bernardo': ['sao_bernardo_fc'],
      'sao_bernardo_fc': ['sao_bernardo'],
      'sport': ['sport_recife'],
      'sport_recife': ['sport'],
      'vila_nova': ['vila_nova_go'],
      'vila_nova_go': ['vila_nova'],
      'amazonas_fc': ['amazonas'],
      'amazonas': ['amazonas_fc'],
      'anapolis': ['anapolis_fc'],
      'anapolis_fc': ['anapolis'],
      'barra_sc': ['barra'],
      'barra': ['barra_sc'],
      'botafogo_pb': ['botafogo_da_paraiba'],
      'botafogo_da_paraiba': ['botafogo_pb'],
      'brusque': ['brusque_fc'],
      'brusque_fc': ['brusque'],
      'caxias': ['ser_caxias'],
      'ser_caxias': ['caxias'],
      'confianca': ['ad_confianca'],
      'ad_confianca': ['confianca'],
      'ferroviaria': ['ferroviaria_sp'],
      'ferroviaria_sp': ['ferroviaria'],
      'figueirense': ['figueirense_fc'],
      'figueirense_fc': ['figueirense'],
      'floresta': ['floresta_ce'],
      'floresta_ce': ['floresta'],
      'guarani': ['guarani_fc'],
      'guarani_fc': ['guarani'],
      'inter_de_limeira': ['internacional_de_limeira'],
      'internacional_de_limeira': ['inter_de_limeira'],
      'itabaiana': ['ao_itabaiana'],
      'ao_itabaiana': ['itabaiana'],
      'ituano': ['ituano_fc'],
      'ituano_fc': ['ituano'],
      'maranhao': ['maranhao_ac'],
      'maranhao_ac': ['maranhao'],
      'maringa': ['maringa_fc'],
      'maringa_fc': ['maringa'],
      'paysandu': ['paysandu_sc'],
      'paysandu_sc': ['paysandu'],
      'santa_cruz': ['santa_cruz_pe'],
      'santa_cruz_pe': ['santa_cruz'],
      'volta_redonda': ['volta_redonda_fc'],
      'volta_redonda_fc': ['volta_redonda'],
      'ypiranga_rs': ['ypiranga'],
      'ypiranga': ['ypiranga_rs'],
      'abc': ['abc_fc'],
      'abc_fc': ['abc'],
      'america_rn': ['america_de_natal'],
      'america_de_natal': ['america_rn'],
      'brasiliense': ['brasiliense_fc'],
      'brasiliense_fc': ['brasiliense'],
      'gama': ['se_gama'],
      'se_gama': ['gama'],
      'csa': ['centro_sportivo_alagoano'],
      'centro_sportivo_alagoano': ['csa'],
      'sampaio_correa': ['sampaio_correa_ma', 'sampaio_correa_rj'],
      'joinville': ['jec'],
      'jec': ['joinville'],
      'treze': ['treze_fc'],
      'treze_fc': ['treze'],
      'campinense': ['campinense_pb'],
      'campinense_pb': ['campinense'],
      'portuguesa': ['portuguesa_sp', 'portuguesa_de_desportos', 'portuguesa_rj'],
      'bangu': ['bangu_ac'],
      'bangu_ac': ['bangu'],
      'parana': ['parana_clube'],
      'parana_clube': ['parana'],
      'ferroviario': ['ferroviario_ce'],
      'ferroviario_ce': ['ferroviario'],
      'tombense': ['tombense_mg'],
      'tombense_mg': ['tombense'],
      'moto_club': ['moto_club_ma'],
      'moto_club_ma': ['moto_club'],
      'agua_santa': ['agua_santa_sp'],
      'agua_santa_sp': ['agua_santa'],
      'velo_clube': ['velo_clube_sp'],
      'velo_clube_sp': ['velo_clube'],
      'brasil_de_pelotas': ['ge_brasil'],
      'ge_brasil': ['brasil_de_pelotas'],
      'pelotas': ['ec_pelotas'],
      'ec_pelotas': ['pelotas'],
      'marcilio_dias': ['cn_marcilio_dias'],
      'cn_marcilio_dias': ['marcilio_dias'],
      'retro': ['retro_fc'],
      'retro_fc': ['retro']
    };

    if (aliasMap[clubSlug]) {
      aliasMap[clubSlug].forEach(alias => {
        searchFolders.forEach(fld => pushIfNew(`sounds/crowd/${fld}/${alias}.mp3`));
      });
    }

    // 4. Som ambiente padrão neutro
    pushIfNew('sounds/crowd/ambient_default.mp3');

    this._ambientCancelled = false;
    let curIdx = 0;
    if (typeof Audio === 'undefined') {
      this._startProceduralCrowdDrone();
      return;
    }
    const audio = new Audio();
    audio.loop = true;
    audio.volume = this.crowdVolume;
    this.ambientAudioEl = audio;

    const tryNext = () => {
      if (!this.crowdEnabled || this._ambientCancelled) return;
      if (curIdx >= queue.length) {
        if (!this.crowdEnabled || this._ambientCancelled) return;
        this._startProceduralCrowdDrone();
        return;
      }
      const nextSrc = queue[curIdx++];
      audio.src = nextSrc;
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          if (!this.crowdEnabled || this._ambientCancelled) {
            try { audio.pause(); audio.currentTime = 0; audio.src = ''; } catch(e){}
            return;
          }
          this.isAmbientPlaying = true;
        }).catch(() => {
          if (!this.crowdEnabled || this._ambientCancelled) return;
          tryNext();
        });
      }
    };

    audio.onerror = () => {
      if (!this.crowdEnabled || this._ambientCancelled) return;
      tryNext();
    };

    tryNext();
  }

  stopCrowdAmbient() {
    this._ambientCancelled = true;
    if (this.ambientAudioEl) {
      try {
        const el = this.ambientAudioEl;
        el.pause();
        el.currentTime = 0;
        el.src = '';
      } catch (e) {
        window.AFMErrorLog?.recordHandled(e, 'audio.stopCrowdAmbient');
      }
      this.ambientAudioEl = null;
    }

    this._stopProceduralCrowdDrone();
    this.isAmbientPlaying = false;
  }

  boostCrowdCheer(durationSec = 4) {
    if (!this.crowdEnabled || this._ambientCancelled) return;
    if (window.liveMatchState && window.liveMatchState.soundMuted) return;

    if (this.ambientAudioEl) {
      const origVol = this.crowdVolume;
      const boostedVol = Math.min(1.0, origVol * 2.2 + 0.25);
      this.ambientAudioEl.volume = boostedVol;

      setTimeout(() => {
        if (this.ambientAudioEl) {
          // Retorno suave ao volume original
          const step = (boostedVol - origVol) / 15;
          let current = boostedVol;
          const decayInt = setInterval(() => {
            current = Math.max(origVol, current - step);
            if (this.ambientAudioEl) this.ambientAudioEl.volume = current;
            if (current <= origVol + 0.01) {
              clearInterval(decayInt);
              if (this.ambientAudioEl) this.ambientAudioEl.volume = origVol;
            }
          }, 80);
        }
      }, durationSec * 1000);
    }
  }

  /* -------------------------------------------------------------
   * DRONE PROCEDURAL DE TORCIDA (CASO NÃO HAJA ARQUIVO MP3)
   * ------------------------------------------------------------- */
  _startProceduralCrowdDrone() {
    this._stopProceduralCrowdDrone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const bufSize = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    const gain = ctx.createGain();
    const droneVol = this.crowdVolume * 0.12;
    gain.gain.setValueAtTime(droneVol, ctx.currentTime);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start(0);

    this.proceduralAmbientNodes = { src, filter, gain };
    this.isAmbientPlaying = true;
  }

  _stopProceduralCrowdDrone() {
    if (this.proceduralAmbientNodes) {
      try {
        const { src, gain } = this.proceduralAmbientNodes;
        const ctx = this.getAudioContext();
        if (ctx && gain) {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        }
        setTimeout(() => {
          try { src.stop(); } catch (e) {}
        }, 220);
      } catch (e) { window.AFMErrorLog?.recordHandled(e, 'audio.stopCrowdDrone'); }
      this.proceduralAmbientNodes = null;
    }
  }
}

// Inicialização e registro em escopo global
window.AFMAudioManager = AFMAudioManager;
window.afmAudio = new AFMAudioManager();

// Aliases para compatibilidade reversa com códigos existentes
window.playWhistleSound = function() {
  if (window.liveMatchState && window.liveMatchState.soundMuted) return;
  if (window.afmAudio) window.afmAudio.playSFX('whistle_start');
};

window.playCheerSound = function() {
  if (window.liveMatchState && window.liveMatchState.soundMuted) return;
  if (window.afmAudio) {
    window.afmAudio.playSFX('goal_celebration');
    window.afmAudio.boostCrowdCheer(4);
  }
};
