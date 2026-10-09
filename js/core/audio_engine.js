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
      } catch (e) {}
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
        console.warn('AFMAudio: Web Audio API não suportada', e);
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  _bindAutoResumeOnUserGesture() {
    const unlock = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
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

    const vol = (customVolume !== null ? customVolume : this.sfxVolume);
    const audioPath = this.SFX_FILES[sfxKey];

    if (audioPath) {
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
   * CANAL AMBIENT (TORCIDA EM LOOP & DETECÇÃO MANDANTE)
   * ------------------------------------------------------------- */
  startCrowdAmbient(homeClubName, compId = null) {
    if (!this.crowdEnabled) return;

    const clubSlug = this.normalizeSlug(homeClubName);
    const leagueSlug = this.resolveLeagueFolder(homeClubName, compId);
    this.currentClubSlug = clubSlug;
    this.currentLeagueSlug = leagueSlug;

    const specificPath = `sounds/crowd/${leagueSlug}/${clubSlug}.mp3`;
    const defaultPath = 'sounds/crowd/ambient_default.mp3';

    this.stopCrowdAmbient();

    const audio = new Audio();
    audio.loop = true;
    audio.volume = this.crowdVolume;
    this.ambientAudioEl = audio;

    let fallbackTried = false;
    audio.onerror = () => {
      if (!fallbackTried) {
        fallbackTried = true;
        audio.src = defaultPath;
        audio.play().catch(() => {
          // Se o arquivo default também não existir no disco, inicia o drone procedural
          this._startProceduralCrowdDrone();
        });
      } else {
        this._startProceduralCrowdDrone();
      }
    };

    audio.src = specificPath;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isAmbientPlaying = true;
        })
        .catch(() => {
          if (!fallbackTried) {
            fallbackTried = true;
            audio.src = defaultPath;
            audio.play().then(() => {
              this.isAmbientPlaying = true;
            }).catch(() => {
              this._startProceduralCrowdDrone();
            });
          }
        });
    }
  }

  stopCrowdAmbient() {
    if (this.ambientAudioEl) {
      try {
        const el = this.ambientAudioEl;
        // Fade out suave de 200ms
        const curVol = el.volume;
        const fadeInterval = setInterval(() => {
          if (el.volume > 0.05) {
            el.volume = Math.max(0, el.volume - 0.05);
          } else {
            clearInterval(fadeInterval);
            el.pause();
            el.currentTime = 0;
          }
        }, 30);
      } catch (e) {
        this.ambientAudioEl.pause();
      }
      this.ambientAudioEl = null;
    }

    this._stopProceduralCrowdDrone();
    this.isAmbientPlaying = false;
  }

  boostCrowdCheer(durationSec = 4) {
    if (!this.crowdEnabled) return;

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
      } catch (e) {}
      this.proceduralAmbientNodes = null;
    }
  }
}

// Inicialização e registro em escopo global
window.AFMAudioManager = AFMAudioManager;
window.afmAudio = new AFMAudioManager();

// Aliases para compatibilidade reversa com códigos existentes
window.playWhistleSound = function() {
  if (window.afmAudio) window.afmAudio.playSFX('whistle_start');
};

window.playCheerSound = function() {
  if (window.afmAudio) {
    window.afmAudio.playSFX('goal_celebration');
    window.afmAudio.boostCrowdCheer(4);
  }
};
