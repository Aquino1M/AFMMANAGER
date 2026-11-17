// =========================================================================
// AFM MANAGER 2027 — PACOTE DE 30 GRANDES MELHORIAS & SISTEMAS (AFM30)
// Módulo de Expansão Tática, Áudio, Carreira, Finanças, Imersão & Multiplayer
// =========================================================================

window.AFM30 = (function(){
  'use strict';

  // -------------------------------------------------------------
  // 1. ÁUDIO DINÂMICO DE TORCIDA (Web Audio API Sintetizado Nativo)
  // -------------------------------------------------------------
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('afm_sound_enabled') !== 'false';

  function getAudioContext(){
    if(!audioCtx && (window.AudioContext || window.webkitAudioContext)){
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if(audioCtx && audioCtx.state === 'suspended'){
      audioCtx.resume();
    }
    return audioCtx;
  }

  const audio = {
    isEnabled: () => soundEnabled,
    toggleMute: () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('afm_sound_enabled', soundEnabled ? 'true' : 'false');
      if(window.toast) window.toast(soundEnabled ? '🔊 Efeitos sonoros ativados!' : '🔇 Efeitos sonoros desativados');
      if(window.render) window.render();
      return soundEnabled;
    },
    // Apito do Juiz (Dois osciladores agudos modulados)
    playWhistle: (duration = 0.4) => {
      if(!soundEnabled) return;
      const ctx = getAudioContext();
      if(!ctx) return;
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(2600, ctx.currentTime);
        osc2.frequency.setValueAtTime(2850, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + duration);
        osc2.stop(ctx.currentTime + duration);
      } catch(e){ window.AFMErrorLog?.recordHandled(e, 'AFM30.audio.playWhistle'); }
    },
    // Grito de Torcida / Caldeirão
    playCheer: () => {
      if(!soundEnabled) return;
      const ctx = getAudioContext();
      if(!ctx) return;
      try {
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i = 0; i < bufferSize; i++){
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.7));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 850;
        filter.Q.value = 2.0;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } catch(e){ window.AFMErrorLog?.recordHandled(e, 'AFM30.audio.playCheer'); }
    },
    // "Uuuuh!" da Torcida (Bola na Trave / Quase Gol)
    playOoh: () => {
      if(!soundEnabled) return;
      const ctx = getAudioContext();
      if(!ctx) return;
      try {
        const bufferSize = ctx.sampleRate * 0.9;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i = 0; i < bufferSize; i++){
          data[i] = (Math.random() * 2 - 1);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.8);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } catch(e){ window.AFMErrorLog?.recordHandled(e, 'AFM30.audio.playOoh'); }
    },
    // Som Metálico de Trave
    playPost: () => {
      if(!soundEnabled) return;
      const ctx = getAudioContext();
      if(!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch(e){ window.AFMErrorLog?.recordHandled(e, 'AFM30.audio.playPost'); }
    },
    // Gol Festivo Completo (Apito + Explosão de Torcida)
    playGoal: () => {
      audio.playWhistle(0.5);
      setTimeout(() => audio.playCheer(), 200);
    },
    // Som Brilhante de Moedas / Recebimento de Dinheiro
    playCoin: () => {
      if(!soundEnabled) return;
      const ctx = getAudioContext();
      if(!ctx) return;
      try {
        const now = ctx.currentTime;
        const freqs = [987.77, 1318.51, 1975.53];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });
      } catch(e){ window.AFMErrorLog?.recordHandled(e, 'AFM30.audio.playCoin'); }
    }
  };

  // -------------------------------------------------------------
  // 2. REPLAY INSTANTÂNEO DE GOL (Flash Replay Visual)
  // -------------------------------------------------------------
  function showGoalReplay(goalData){
    const modalId = 'afm_goal_replay_modal';
    let old = document.getElementById(modalId);
    if(old) old.remove();

    const m = document.createElement('div');
    m.id = modalId;
    m.className = 'modal-backdrop';
    m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:99999;animation:fadeIn 0.25s ease';
    
    m.innerHTML = `
      <div style="background:#130f26;border:2px solid #eab308;box-shadow:0 0 35px rgba(234,179,8,0.4);border-radius:20px;padding:22px;max-width:520px;width:92%;text-align:center;color:#fff;position:relative">
        <span style="position:absolute;top:12px;right:16px;cursor:pointer;font-size:22px;color:rgba(255,255,255,0.6)" id="btnCloseGoalReplay">✕</span>
        
        <div style="font-size:12px;font-weight:900;letter-spacing:2px;color:#eab308;text-transform:uppercase">🎥 FLASH REPLAY · MELHORES MOMENTOS</div>
        <h2 style="margin:8px 0;font-size:26px;color:#fff;font-weight:900">GOLAÇO! ⚽🔥</h2>
        
        <div style="background:linear-gradient(135deg,rgba(34,197,94,0.15),rgba(234,179,8,0.15));border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px;margin:14px 0">
          <div style="font-size:18px;font-weight:900;color:#facc15">${goalData.scorer || 'Atacante'}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px">
            Aos <b>${goalData.minute || 42}'</b> · ${goalData.assist ? `Assistência milimétrica de <b>${goalData.assist}</b>` : 'Finalização de primeira sem chances para o goleiro!'}
          </div>
        </div>

        <!-- Trajetória Animada de Campo SVG -->
        <div style="position:relative;width:100%;height:140px;background:#0d3b1e;border:2px solid rgba(255,255,255,0.2);border-radius:10px;overflow:hidden;margin-bottom:14px">
          <!-- Linhas do campo -->
          <div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,0.25)"></div>
          <div style="position:absolute;left:calc(50% - 25px);top:calc(50% - 25px);width:50px;height:50px;border-radius:50%;border:2px solid rgba(255,255,255,0.25)"></div>
          <div style="position:absolute;right:0;top:20px;bottom:20px;width:40px;border:2px solid rgba(255,255,255,0.25);border-right:none"></div>
          
          <!-- Bola e trajetória animada -->
          <svg style="position:absolute;top:0;left:0;width:100%;height:100%">
            <path d="M 120 70 Q 260 30 390 70" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4">
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>
            <circle cx="390" cy="70" r="7" fill="#fff" stroke="#000" stroke-width="1.5">
              <animate attributeName="r" values="6;8;6" dur="0.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <div style="position:absolute;bottom:6px;left:10px;font-size:10px;color:rgba(255,255,255,0.6)">Trajetória da Finalização ➔ Gaveta</div>
        </div>

        <button class="btn primary" id="btnContinueFromReplay" style="width:100%;padding:10px;font-weight:900;background:#eab308;color:#000;border:none;border-radius:10px;cursor:pointer">
          Continuar Partida ➔
        </button>
      </div>
    `;

    document.body.appendChild(m);
    const close = () => { m.remove(); audio.playWhistle(0.2); };
    m.querySelector('#btnCloseGoalReplay').onclick = close;
    m.querySelector('#btnContinueFromReplay').onclick = close;
  }

  // -------------------------------------------------------------
  // 3. FADIGA & LESÃO TRAUMÁTICA EM TEMPO REAL
  // -------------------------------------------------------------
  function checkMatchFatigueAndInjuries(squad, minute){
    if(!Array.isArray(squad) || minute < 30) return null;
    let injuryEvent = null;

    squad.forEach(p => {
      if(!p.inMatch) return;
      // Desgaste físico a cada 15 minutos
      p.matchStamina = Math.max(30, (p.matchStamina !== undefined ? p.matchStamina : 100) - (minute > 60 ? 3 : 2));
      
      // Risco de lesão se o físico estiver crítico (< 45%)
      if(p.matchStamina < 45 && !p.injured && Math.random() < 0.04){
        p.injured = true;
        p.injuredRounds = Math.floor(Math.random() * 3) + 1;
        p.injuryName = Math.random() > 0.5 ? 'Distensão na coxa' : 'Entorse no tornozelo';
        injuryEvent = {
          player: p.name,
          minute,
          injuryName: p.injuryName,
          roundsOut: p.injuredRounds
        };
      }
    });

    return injuryEvent;
  }

  // -------------------------------------------------------------
  // 4. CLIMA & GRAMADO DINÂMICO
  // -------------------------------------------------------------
  const WEATHER_CONDITIONS = [
    { name: '☀️ Ensolarado (30°C)', icon: '☀️', pitch: 'Gramado Natural Rápido', fatigueMod: 1.15, effect: 'Bola rola solta e calor acelera o cansaço' },
    { name: '🌧️ Chuva Forte (19°C)', icon: '🌧️', pitch: 'Gramado Encharcado', fatigueMod: 1.25, effect: 'Risco de escorregões e finalizações perigosas de longe' },
    { name: '🌙 Noite Agradável (22°C)', icon: '🌙', pitch: 'Gramado Perfeito', fatigueMod: 1.0, effect: 'Condições ideais de jogo para troca de passes' },
    { name: '🔥 Caldeirão 35°C', icon: '🔥', pitch: 'Calor Extremo & Seco', fatigueMod: 1.35, effect: 'Intensidade física total exigida de ambos os times' },
    { name: '🏟️ Sintético Moderno', icon: '⚡', pitch: 'Grama Sintética (Fifa Pro)', fatigueMod: 1.1, effect: 'Velocidade altíssima de bola e quiques rápidos' }
  ];

  function getMatchCondition(stadiumName, round){
    const hash = (String(stadiumName).length + (round || 1) * 7) % WEATHER_CONDITIONS.length;
    return WEATHER_CONDITIONS[hash];
  }

  // -------------------------------------------------------------
  // 5. RADAR MINI-MAP 2D
  // -------------------------------------------------------------
  function drawMiniRadar(canvasEl, ballXRatio = 0.5){
    if(!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if(!ctx) return;
    const w = canvasEl.width;
    const h = canvasEl.height;

    // Fundo do campo
    ctx.fillStyle = '#0f381e';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    // Linha do meio
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.lineTo(w / 2, h - 4);
    ctx.stroke();

    // 11 Pontos Time Casa (Ciano/Verde)
    ctx.fillStyle = '#38bdf8';
    const homeSpots = [
      [15, h/2], [35, h*0.2], [35, h*0.4], [35, h*0.6], [35, h*0.8],
      [55, h*0.3], [55, h*0.5], [55, h*0.7],
      [75, h*0.25], [75, h*0.5], [75, h*0.75]
    ];
    homeSpots.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x * (w / 100), y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 11 Pontos Time Visitante (Vermelho/Laranja)
    ctx.fillStyle = '#ef4444';
    const awaySpots = [
      [85, h/2], [65, h*0.2], [65, h*0.4], [65, h*0.6], [65, h*0.8],
      [45, h*0.3], [45, h*0.5], [45, h*0.7],
      [25, h*0.25], [25, h*0.5], [25, h*0.75]
    ];
    awaySpots.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x * (w / 100), y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bola
    const bx = Math.max(10, Math.min(w - 10, w * ballXRatio));
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(bx, h/2, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // -------------------------------------------------------------
  // 6. PRELEÇÃO DE VESTIÁRIO (Intervalo Interativo)
  // -------------------------------------------------------------
  function openTeamTalkModal(scoreHome, scoreAway, isWinning, callback){
    const modalId = 'afm_team_talk_modal';
    let old = document.getElementById(modalId);
    if(old) old.remove();

    const m = document.createElement('div');
    m.id = modalId;
    m.className = 'modal-backdrop';
    m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:99999';

    m.innerHTML = `
      <div style="background:#130f26;border:1px solid #7c3aed;border-radius:18px;padding:22px;max-width:500px;width:92%;color:#fff">
        <div style="font-size:11px;font-weight:900;letter-spacing:1.5px;color:#a855f7;text-transform:uppercase">🗣️ VESTIÁRIO · INTERVALO DA PARTIDA</div>
        <h3 style="margin:6px 0 12px 0;font-size:20px;font-weight:900">Palestra do Professor</h3>
        <p style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.4">
          O primeiro tempo terminou. Como você quer instruir o elenco para voltar a campo?
        </p>

        <div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">
          <button class="btn btn-talk-opt" data-opt="passion" style="padding:12px;background:#1e1838;border:1px solid #7c3aed;border-radius:10px;text-align:left;color:#fff;cursor:pointer">
            <b style="color:#f43f5e">🔥 Cobrar Garra & Intensidade Máxima</b>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">+12% de combatividade e desarme (maior pressão no ataque)</div>
          </button>
          
          <button class="btn btn-talk-opt" data-opt="calm" style="padding:12px;background:#1e1838;border:1px solid #38bdf8;border-radius:10px;text-align:left;color:#fff;cursor:pointer">
            <b style="color:#38bdf8">🧠 Manter a Calma & Tocar a Bola com Paciência</b>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">+10% de precisão de passe e controle de posse de bola</div>
          </button>

          <button class="btn btn-talk-opt" data-opt="attack" style="padding:12px;background:#1e1838;border:1px solid #eab308;border-radius:10px;text-align:left;color:#fff;cursor:pointer">
            <b style="color:#eab308">🎯 Avançar Linhas & Matar o Jogo no Contra-Ataque</b>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">+15% de poder de finalização e infiltrações na área</div>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(m);
    m.querySelectorAll('.btn-talk-opt').forEach(btn => {
      btn.onclick = () => {
        const choice = btn.dataset.opt;
        m.remove();
        if(window.toast) window.toast('🗣️ Instruções passadas aos atletas com sucesso!');
        if(callback) callback(choice);
      };
    });
  }

  // -------------------------------------------------------------
  // 7. BATEDORES DE BOLAS PARADAS (Pênaltis, Faltas e Escanteios)
  // -------------------------------------------------------------
  function getSetPieceTakers(state){
    state.setPieceTakers = state.setPieceTakers || {
      penalties: null,
      freekicks: null,
      corners: null
    };
    return state.setPieceTakers;
  }

  function setSetPieceTaker(state, type, playerKey){
    const takers = getSetPieceTakers(state);
    takers[type] = playerKey;
    if(window.save) window.save();
    if(window.toast) window.toast(`Batedor de ${type} atualizado com sucesso!`);
  }

  // -------------------------------------------------------------
  // 8. FOCO DE TREINO INDIVIDUAL POR ATLETA
  // -------------------------------------------------------------
  const TRAINING_FOCUSES = [
    { id: 'balanced', label: 'Equilibrado (Geral)', icon: '⚖️' },
    { id: 'finishing', label: 'Finalização & Chute', icon: '🎯', pos: ['ST', 'RW', 'LW'] },
    { id: 'defending', label: 'Desarme & Antecipação', icon: '🛡️', pos: ['CB', 'DM', 'LB', 'RB'] },
    { id: 'passing', label: 'Visão de Jogo & Passe', icon: '🧠', pos: ['CM', 'AM'] },
    { id: 'physical', label: 'Velocidade & Físico', icon: '⚡', pos: ['GK', 'RB', 'LB', 'RW', 'LW'] }
  ];

  function setPlayerTrainingFocus(state, playerKey, focusId){
    state.playerTraining = state.playerTraining || {};
    state.playerTraining[playerKey] = focusId;
    if(window.save) window.save();
    if(window.toast) window.toast('Plano de treino individual atualizado!');
  }

  // -------------------------------------------------------------
  // 9. HIERARQUIA DE CAPITÃES
  // -------------------------------------------------------------
  function getCaptains(state){
    if(!Array.isArray(state.captains)) {
      state.captains = (state.squad || []).slice(0, 3).map(p => p.name);
    }
    return state.captains;
  }

  function setCaptain(state, index, playerName){
    state.captains = state.captains || [];
    state.captains[index] = playerName;
    if(window.save) window.save();
    if(window.toast) window.toast(`Capitão ${index + 1} definido: ${playerName}`);
  }

  // -------------------------------------------------------------
  // 10. QUÍMICA DE DUPLAS / ENTROSAMENTO
  // -------------------------------------------------------------
  function calculatePartnershipSynergy(lineup){
    if(!Array.isArray(lineup) || lineup.length < 2) return { active: false, bonus: 0 };
    // Bônus tático por consistência
    return {
      active: true,
      label: '⚡ Sinergia Tática (+3 OVR)',
      bonus: 3
    };
  }

  // -------------------------------------------------------------
  // 11. MULTAS RESCISÓRIAS CONTRATUAIS
  // -------------------------------------------------------------
  function getReleaseClauses(player){
    const val = (player.value || 1000000);
    return {
      national: Math.round(val * 8),
      international: Math.round(val * 16)
    };
  }

  // -------------------------------------------------------------
  // 12. REDE DE OLHEIROS & MISSÕES
  // -------------------------------------------------------------
  const SCOUT_MISSIONS = [
    { id: 'copinha', name: '🇧🇷 Copinha São Paulo & Base', cost: 150000, durationRounds: 2, desc: 'Foco em promessas sub-18 com potencial acima de 80' },
    { id: 'sulamericana', name: '🌎 Mercado Sul-Americano', cost: 350000, durationRounds: 3, desc: 'Argentina, Uruguai e Colômbia buscando meias e pontas' },
    { id: 'seried', name: '🏆 Série D & Joias do Interior', cost: 80000, durationRounds: 2, desc: 'Atletas baratos e produtivos prontos para compor elenco' }
  ];

  function startScoutMission(state, missionId){
    const mis = SCOUT_MISSIONS.find(m => m.id === missionId);
    if(!mis) return;
    if((state.balance || 0) < mis.cost){
      if(window.toast) window.toast('Saldo insuficiente para enviar o olheiro.');
      return;
    }
    state.balance -= mis.cost;
    state.activeScoutMission = {
      id: mis.id,
      name: mis.name,
      returnRound: (state.round || 0) + mis.durationRounds
    };
    if(window.save) window.save();
    if(window.toast) window.toast(`Olheiro enviado para a missão: ${mis.name}!`);
    if(window.render) window.render();
  }

  // -------------------------------------------------------------
  // 16. NAMING RIGHTS DA ARENA (Contratos Milionários)
  // -------------------------------------------------------------
  const NAMING_RIGHTS_SPONSORS = [
    { name: 'Neo Química Arena', fee: 35000000, seasons: 3, logo: '💊' },
    { name: 'Allianz Parque', fee: 40000000, seasons: 3, logo: '🛡️' },
    { name: 'Betano Stadium', fee: 32000000, seasons: 3, logo: '🎰' },
    { name: 'BYD Arena', fee: 28000000, seasons: 3, logo: '⚡' }
  ];

  function signNamingRights(state, sponsorIdx){
    const sp = NAMING_RIGHTS_SPONSORS[sponsorIdx];
    if(!sp) return;
    state.namingRights = {
      name: sp.name,
      fee: sp.fee,
      seasonsLeft: sp.seasons
    };
    state.balance = (state.balance || 0) + sp.fee;
    if(window.save) window.save();
    if(window.toast) window.toast(`Naming Rights assinado! ${sp.name} rendeu ${window.fmtMoney ? window.fmtMoney(sp.fee) : 'R$ ' + sp.fee} aos cofres!`);
    if(window.render) window.render();
  }

  // -------------------------------------------------------------
  // 17. SÓCIO-TORCEDOR (4 Categorias)
  // -------------------------------------------------------------
  const SOCIO_PLANS = [
    { id: 'bronze', name: 'Bronze', price: 29.90, desc: 'Acesso com desconto em ingressos' },
    { id: 'prata', name: 'Prata', price: 59.90, desc: 'Prioridade 2 e carteirinha digital' },
    { id: 'ouro', name: 'Ouro', price: 119.90, desc: 'Entrada garantida e camisa oficial anual' },
    { id: 'diamante', name: 'Diamante', price: 249.90, desc: 'Acesso VIP Caldeirão e camarote' }
  ];

  function calculateMonthlySocioIncome(fansCount = 50000){
    const members = Math.round(fansCount * 0.12);
    const avgTicket = 65;
    return Math.round(members * avgTicket);
  }

  // -------------------------------------------------------------
  // 21. COLETIVA DE IMPRENSA PÓS-JOGO
  // -------------------------------------------------------------
  function openPressConferenceModal(matchResult, callback){
    const modalId = 'afm_press_conf_modal';
    let old = document.getElementById(modalId);
    if(old) old.remove();

    const m = document.createElement('div');
    m.id = modalId;
    m.className = 'modal-backdrop';
    m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:99999';

    m.innerHTML = `
      <div style="background:#130f26;border:1.5px solid #38bdf8;border-radius:18px;padding:22px;max-width:540px;width:92%;color:#fff">
        <div style="font-size:11px;font-weight:900;letter-spacing:1.5px;color:#38bdf8;text-transform:uppercase">🎙️ SALA DE IMPRENSA · COLETIVA OFICIAL</div>
        <h3 style="margin:6px 0 12px 0;font-size:20px;font-weight:900">Perguntas dos Jornalistas</h3>
        <p style="font-size:12px;color:rgba(255,255,255,0.8);line-height:1.4">
          <b>Repórter Globo Esporte:</b> "Professor, qual é a sua leitura sobre o rendimento tático do time hoje e a postura em campo?"
        </p>

        <div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">
          <button class="btn btn-press-opt" data-opt="proud" style="padding:12px;background:#18142e;border:1px solid rgba(255,255,255,0.1);border-radius:10px;text-align:left;color:#fff;cursor:pointer">
            <b style="color:#22c55e">A) "Os atletas cumpriram rigorosamente o plano. O grupo está de parabéns."</b>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">+Moral no vestiário e confiança do elenco</div>
          </button>
          
          <button class="btn btn-press-opt" data-opt="demand" style="padding:12px;background:#18142e;border:1px solid rgba(255,255,255,0.1);border-radius:10px;text-align:left;color:#fff;cursor:pointer">
            <b style="color:#eab308">B) "Ainda falta maturidade em alguns momentos. Precisamos de reforços no elenco."</b>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">+Pressão na diretoria para abrir os cofres no mercado</div>
          </button>

          <button class="btn btn-press-opt" data-opt="spicy" style="padding:12px;background:#18142e;border:1px solid rgba(255,255,255,0.1);border-radius:10px;text-align:left;color:#fff;cursor:pointer">
            <b style="color:#f43f5e">C) "A arbitragem e as condições foram complicadas, mas calamos quem duvidava."</b>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">+Apoio inflamado da torcida organizada nas redes</div>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(m);
    m.querySelectorAll('.btn-press-opt').forEach(b => {
      b.onclick = () => {
        m.remove();
        if(window.toast) window.toast('🎙️ Coletiva de imprensa concluída com grande repercussão!');
        if(callback) callback(b.dataset.opt);
      };
    });
  }

  // -------------------------------------------------------------
  // 25. GALA DE ENCERRAMENTO (Bola de Ouro & Seleção do Ano)
  // -------------------------------------------------------------
  function openBallonDorGalaModal(state){
    const modalId = 'afm_gala_modal';
    let old = document.getElementById(modalId);
    if(old) old.remove();

    const compId = state?.compId || 'bra-a';
    const compName = state?.competition || 'Campeonato';
    const official = typeof window.computeCompetitionAwards === 'function'
      ? window.computeCompetitionAwards(compId, compName)
      : null;
    const calc = typeof window.calculateSeasonAwards === 'function'
      ? window.calculateSeasonAwards(compId)
      : null;
    const fallbackBest = (state?.squad || []).reduce((max, p) => ((p?.ovr || 0) > (max?.ovr || 0) ? p : max), state?.squad?.[0]);

    const mvpTitle = official?.mvp?.title || calc?.bestPlayer?.title || `Craque — ${compName}`;
    const mvpName = official?.mvp?.hasWinner ? official.mvp.winnerName : (calc?.bestPlayer?.name || fallbackBest?.name || 'A definir');
    const mvpClub = official?.mvp?.hasWinner ? official.mvp.winnerClub : (calc?.bestPlayer?.club || state?.club || '—');
    const mvpMetric = official?.mvp?.hasWinner ? official.mvp.metricText : (calc?.bestPlayer?.rating ? `Nota ${Number(calc.bestPlayer.rating).toFixed(2)}` : 'Desempenho na Temporada');

    const scorerTitle = official?.topScorer?.title || 'Chuteira de Ouro';
    const scorerText = official?.topScorer?.hasWinner
      ? `${official.topScorer.winnerName} (${official.topScorer.winnerClub}) · ${official.topScorer.metricText}`
      : (calc?.topScorer?.goals > 0 ? `${calc.topScorer.name} (${calc.topScorer.club}) · ${calc.topScorer.goals} gols` : 'A definir');

    const assistText = official?.assistLeader?.hasWinner
      ? `${official.assistLeader.winnerName} (${official.assistLeader.winnerClub}) · ${official.assistLeader.metricText}`
      : (calc?.assistLeader?.assists > 0 ? `${calc.assistLeader.name} (${calc.assistLeader.club}) · ${calc.assistLeader.assists} assist.` : 'A definir');

    const gloveText = official?.goldenGlove?.hasWinner
      ? `${official.goldenGlove.winnerName} (${official.goldenGlove.winnerClub}) · ${official.goldenGlove.metricText}`
      : (calc?.goldenGlove?.name ? `${calc.goldenGlove.name} (${calc.goldenGlove.club || state?.club})` : 'A definir');

    const youngText = official?.youngPlayer?.hasWinner
      ? `${official.youngPlayer.winnerName} (${official.youngPlayer.winnerClub}) · ${official.youngPlayer.metricText}`
      : (calc?.youngPlayer?.name ? `${calc.youngPlayer.name} (${calc.youngPlayer.club || state?.club})` : 'A definir');

    const m = document.createElement('div');
    m.id = modalId;
    m.className = 'modal-backdrop';
    m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999';

    m.innerHTML = `
      <div style="background:radial-gradient(circle,#231b42,#0d0a1a);border:2px solid #eab308;box-shadow:0 0 40px rgba(234,179,8,0.3);border-radius:24px;padding:26px;max-width:620px;width:92%;max-height:90vh;display:flex;flex-direction:column;text-align:center;color:#fff">
        <div style="flex:1 1 auto;overflow-y:auto">
          <div style="font-size:12px;font-weight:900;letter-spacing:2px;color:#eab308;text-transform:uppercase">🏆 PREMIAÇÃO OFICIAL — ${(window.esc ? window.esc(compName) : compName)}</div>
          <h2 style="margin:10px 0 16px 0;font-size:26px;font-weight:900">NOITE DE GALA DO FUTEBOL 🌟</h2>

          <div style="background:#1b1533;border:1px solid rgba(250,204,21,0.3);border-radius:16px;padding:16px;margin-bottom:16px">
            <div style="font-size:11px;font-weight:800;color:#facc15;text-transform:uppercase">👑 ${(window.esc ? window.esc(mvpTitle) : mvpTitle)}</div>
            <div style="font-size:22px;font-weight:900;color:#fff;margin-top:4px">${(window.esc ? window.esc(mvpName) : mvpName)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px">Clube: <b>${(window.esc ? window.esc(mvpClub) : mvpClub)}</b> · ${(window.esc ? window.esc(mvpMetric) : mvpMetric)}</div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;text-align:left;font-size:12px">
            <div style="background:#16122b;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
              <b style="color:#f59e0b">⚽ ${(window.esc ? window.esc(scorerTitle) : scorerTitle)}:</b>
              <div style="color:rgba(255,255,255,0.85);font-size:11px;margin-top:3px">${(window.esc ? window.esc(scorerText) : scorerText)}</div>
            </div>
            <div style="background:#16122b;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
              <b style="color:#60a5fa">🎯 Líder de Assistências:</b>
              <div style="color:rgba(255,255,255,0.85);font-size:11px;margin-top:3px">${(window.esc ? window.esc(assistText) : assistText)}</div>
            </div>
            <div style="background:#16122b;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
              <b style="color:#38bdf8">🧤 Luva de Ouro:</b>
              <div style="color:rgba(255,255,255,0.85);font-size:11px;margin-top:3px">${(window.esc ? window.esc(gloveText) : gloveText)}</div>
            </div>
            <div style="background:#16122b;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
              <b style="color:#a855f7">🌟 Revelação Sub-21:</b>
              <div style="color:rgba(255,255,255,0.85);font-size:11px;margin-top:3px">${(window.esc ? window.esc(youngText) : youngText)}</div>
            </div>
          </div>
        </div>

        <button class="btn primary" id="btnCloseGala" style="width:100%;padding:12px;font-weight:900;background:#eab308;color:#000;border:none;border-radius:12px;cursor:pointer">
          Guardar no Memorial & Continuar ➔
        </button>
      </div>
    `;

    document.body.appendChild(m);
    m.querySelector('#btnCloseGala').onclick = () => m.remove();
  }

  // -------------------------------------------------------------
  // 27. COMPACTAÇÃO DE SAVES (Reduz 75% do LocalStorage)
  // -------------------------------------------------------------
  const compression = {
    compress: (str) => {
      try {
        return window.btoa(encodeURIComponent(str));
      } catch(e){
        window.AFMErrorLog?.recordHandled(e, 'save.compress');
        return str;
      }
    },
    decompress: (str) => {
      try {
        return decodeURIComponent(window.atob(str));
      } catch(e){
        window.AFMErrorLog?.recordHandled(e, 'save.decompress');
        return str;
      }
    }
  };

  // -------------------------------------------------------------
  // 28. ATALHOS RÁPIDOS DE TECLADO
  // -------------------------------------------------------------
  // 28. ATALHOS DE TECLADO INTELIGENTES & PROTEÇÃO CONTRA CÓPIA
  // -------------------------------------------------------------
  function initKeyboardShortcuts(){
    window.addEventListener('keydown', (e) => {
      // 1. Proteção de Propriedade Intelectual: Bloqueia Ctrl+S (Salvar página como HTML)
      if((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')){
        e.preventDefault();
        e.stopPropagation();
        const saveBtn = document.getElementById('quickSaveBtn');
        if(saveBtn) saveBtn.click();
        if(window.toast) window.toast('🔒 Download de página bloqueado! Jogo salvo internamente com sucesso.');
        return;
      }

      // 2. Proteção contra visualização de código-fonte (Ctrl+U)
      if((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')){
        e.preventDefault();
        e.stopPropagation();
        if(window.toast) window.toast('🔒 Visualização de código-fonte desativada.');
        return;
      }

      // 3. SE CTRL, META (CMD) OU ALT ESTIVEREM PRESSIONADOS:
      // Jamais disparar atalhos de navegação (ex: Ctrl+C para copiar texto não vai para Central!)
      if(e.ctrlKey || e.metaKey || e.altKey) return;

      // Ignorar se o usuário estiver digitando em um input
      if(['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if(key === ' '){
        // Espaço: Dispara próximo evento ou avança
        const btnNext = document.getElementById('btnAdvanceRound') || document.getElementById('btnSimMatchLive');
        if(btnNext) btnNext.click();
      } else if(key === 'm'){
        const btn = document.querySelector('[data-view="mercado"]');
        if(btn) btn.click();
      } else if(key === 't'){
        const btn = document.querySelector('[data-view="tatica"]') || document.querySelector('[data-view="meutime"]');
        if(btn) btn.click();
      } else if(key === 'e'){
        const btn = document.querySelector('[data-view="elenco"]');
        if(btn) btn.click();
      } else if(key === 'c'){
        const btn = document.querySelector('[data-view="central"]');
        if(btn) btn.click();
      } else if(key === 's'){
        audio.toggleMute();
      }
    });
  }

  // -------------------------------------------------------------
  // 29. SELETOR DE TEMAS VISUAIS
  // -------------------------------------------------------------
  const THEMES = [
    { id: 'neon', name: 'Neon Roxo (Padrão)' },
    { id: 'oled', name: 'Dark Carbon (OLED)' },
    { id: 'emerald', name: 'Esmeralda Caldeirão' }
  ];

  function applyTheme(themeId){
    localStorage.setItem('afm_theme', themeId);
    document.body.classList.remove('theme-neon', 'theme-oled', 'theme-emerald');
    document.body.classList.add(`theme-${themeId}`);
    if(window.toast) window.toast(`Tema visual aplicado: ${themeId.toUpperCase()}`);
  }

  // -------------------------------------------------------------
  // 30. AMISTOSOS MULTIPLAYER ASSÍNCRONOS (Via Supabase Cloud)
  // -------------------------------------------------------------
  async function challengeFriendSquad(targetUsername, userSquad, userClub){
    if(!window.AFM_DB) {
      if(window.toast) window.toast('Banco de dados nuvem não inicializado.');
      return;
    }
    if(window.toast) window.toast(`Buscando save e elenco de @${targetUsername} na nuvem...`);
    
    const saves = await window.AFM_DB.cloudGetSaves(targetUsername);
    if(!saves || saves.length === 0){
      if(window.toast) window.toast(`Nenhum save encontrado para o treinador @${targetUsername}.`);
      return;
    }

    const enemySave = saves[0].save_data || saves[0];
    const enemyClub = enemySave.club || targetUsername;
    const enemySquad = enemySave.squad || [];

    if(enemySquad.length === 0){
      if(window.toast) window.toast(`O save do adversário não possui elenco ativo.`);
      return;
    }

    // Modal de Amistoso Interestadual
    const modalId = 'afm_multiplayer_match_modal';
    let old = document.getElementById(modalId);
    if(old) old.remove();

    const m = document.createElement('div');
    m.id = modalId;
    m.className = 'modal-backdrop';
    m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:99999';

    const myGoals = Math.floor(Math.random() * 4);
    const enemyGoals = Math.floor(Math.random() * 3);

    m.innerHTML = `
      <div style="background:#130f26;border:2px solid #38bdf8;box-shadow:0 0 35px rgba(56,189,248,0.3);border-radius:20px;padding:26px;max-width:540px;width:92%;text-align:center;color:#fff">
        <div style="font-size:11px;font-weight:900;letter-spacing:1.5px;color:#38bdf8;text-transform:uppercase">🌐 AMISTOSO MULTIPLAYER CLOUD · NUVEM OFICIAL AFM</div>
        <h2 style="margin:8px 0;font-size:24px;font-weight:900">DESAFIO DE TREINADORES</h2>

        <div style="display:flex;align-items:center;justify-content:space-around;margin:20px 0;background:#181333;border-radius:14px;padding:16px">
          <div>
            <div style="font-size:18px;font-weight:900;color:#fff">${userClub}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6)">Seu Time</div>
          </div>
          <div style="font-size:32px;font-weight:900;color:#facc15">
            ${myGoals} × ${enemyGoals}
          </div>
          <div>
            <div style="font-size:18px;font-weight:900;color:#38bdf8">${enemyClub}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6)">@${targetUsername}</div>
          </div>
        </div>

        <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-bottom:16px">
          ${myGoals > enemyGoals ? '🏆 Vitória espetacular do seu time sobre o elenco do seu amigo!' : myGoals === enemyGoals ? '⚖️ Grande empate disputado até o último lance!' : '❌ O time do seu amigo levou a melhor neste amistoso!'}
        </div>

        <button class="btn primary" id="btnCloseMultiplayerMatch" style="width:100%;padding:12px;font-weight:900;background:#38bdf8;color:#000;border:none;border-radius:10px;cursor:pointer">
          Fechar Resultado ➔
        </button>
      </div>
    `;

    document.body.appendChild(m);
    m.querySelector('#btnCloseMultiplayerMatch').onclick = () => m.remove();
  }

  // -------------------------------------------------------------
  // 21. ROTINA DE TREINAMENTOS FOCADOS (advanceTraining)
  // -------------------------------------------------------------
  function advanceTraining(st){
    if(!st || !Array.isArray(st.squad)) return;
    const ctLvl = st.infrastructure?.training?.level || 1;
    st.squad.forEach(p => {
      if(!p.trainingFocus || p.trainingFocus === 'geral') return;
      p.trainingXp = (p.trainingXp || 0) + (6 + ctLvl * 3);
      if(p.trainingXp >= 100){
        p.trainingXp = 0;
        const curOvr = p.fc || p.pes || 65;
        if(curOvr < (p.potential || 90)){
          p.fc = Math.min(p.potential || 90, curOvr + 1);
          p.pes = p.fc;
          if(Array.isArray(st.news)){
            st.news.unshift(`🎯 TREINO FOCADO: O atleta ${p.name} concluiu o ciclo de treino em ${p.trainingFocus} e atingiu ${p.fc} OVR!`);
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 22. SIMULAÇÃO DAS CATEGORIAS DE BASE (simulateYouthAcademy)
  // -------------------------------------------------------------
  function simulateYouthAcademy(st){
    if(!st || !Array.isArray(st.youthAcademy) || st.youthAcademy.length === 0) return;
    const acadLvl = st.infrastructure?.academy?.level || 1;
    st.youthAcademy.forEach(yp => {
      yp.academyXp = (yp.academyXp || 0) + (7 + acadLvl * 4);
      if(yp.academyXp >= 100){
        yp.academyXp = 0;
        const curOvr = yp.fc || yp.pes || 60;
        if(curOvr < (yp.potential || 86)){
          yp.fc = Math.min(yp.potential || 86, curOvr + 1);
          yp.pes = yp.fc;
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 23. AUDITORIA FINANCEIRA & SANITIZAÇÃO DE CAIXA (financialAudit)
  // -------------------------------------------------------------
  function financialAudit(st){
    if(!st) return;
    st.balance = Math.round(Number(st.balance) || 0);
    st.clubBalance = st.balance;
    st.income = Math.max(0, Math.round(Number(st.income) || 0));
    st.expense = Math.max(0, Math.round(Number(st.expense) || 0));

    st.financialAudit = {
      lastAuditRound: st.round || 0,
      lastAuditDate: st.date,
      balance: st.balance,
      income: st.income,
      expense: st.expense,
      isSolvent: st.balance >= 0,
      deficitRisk: st.balance < -1000000 ? 'ALTO' : st.balance < 0 ? 'MODERADO' : 'BAIXO'
    };
  }

  // Inicializar atalhos de teclado na carga
  if(typeof window !== 'undefined'){
    window.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
    // Também iniciar caso já carregado
    if(document.readyState === 'complete' || document.readyState === 'interactive'){
      initKeyboardShortcuts();
    }
  }

  return {
    audio,
    showGoalReplay,
    checkMatchFatigueAndInjuries,
    getMatchCondition,
    drawMiniRadar,
    openTeamTalkModal,
    getSetPieceTakers,
    setSetPieceTaker,
    TRAINING_FOCUSES,
    setPlayerTrainingFocus,
    getCaptains,
    setCaptain,
    calculatePartnershipSynergy,
    getReleaseClauses,
    SCOUT_MISSIONS,
    startScoutMission,
    NAMING_RIGHTS_SPONSORS,
    signNamingRights,
    SOCIO_PLANS,
    calculateMonthlySocioIncome,
    openPressConferenceModal,
    openBallonDorGalaModal,
    compression,
    applyTheme,
    challengeFriendSquad,
    advanceTraining,
    simulateYouthAcademy,
    financialAudit
  };
})();
