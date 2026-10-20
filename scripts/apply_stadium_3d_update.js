const fs = require('fs');

console.log('--- Applying 3D Stadium & HUD Update ---');

// 1. UPDATE js/game.js
let gameCode = fs.readFileSync('js/game.js', 'utf8');

// A. Replace drawDugouts
const oldDugoutsStart = gameCode.indexOf('function drawDugouts(ctx, s){');
if (oldDugoutsStart === -1) {
  console.error('drawDugouts not found in js/game.js');
  process.exit(1);
}
// Find the closing brace of drawDugouts (next function is drawPlayerSprite)
const nextFn = gameCode.indexOf('function drawPlayerSprite(ctx, p, hasBall){', oldDugoutsStart);
if (nextFn === -1) {
  console.error('drawPlayerSprite not found after drawDugouts');
  process.exit(1);
}

const newDrawDugouts = `// Desenha os Bancos de Reservas com reservas e técnicos (Estrutura 3D Acrílica Realista BRFC27)
function drawDugouts(ctx, s){
  const by = 538;
  const hKitColor = s.homeKit?.primary || '#f59e0b';
  const aKitColor = s.awayKit?.primary || '#15803d';
  const ticks = s.renderTicks || 0;

  // Função auxiliar para desenhar um abrigo 3D completo com acrílico curvo, 7 reservas e área técnica
  function renderBench(x0, w, h, kitColor, isHome, coachName){
    // 1. Área Técnica demarcada no gramado com linhas tracejadas
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    const techBoxX = isHome ? (x0 + w - 10) : (x0 - 50);
    ctx.strokeRect(techBoxX, by - 16, 60, 24);
    ctx.setLineDash([]);
    ctx.restore();

    // 2. Plataforma e Base do Banco de Reservas (Concreto e Aço)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x0, by + 4, w, 28, [4, 4, 6, 6]);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Faixa com a cor do clube na base
    ctx.fillStyle = kitColor;
    ctx.fillRect(x0 + 4, by + 30, w - 8, 2);

    // 3. Parede de Fundo do Abrigo
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x0 + 2, by - 14, w - 4, 20);

    // 4. 7 Assentos Tipo Concha e Atletas Reservas Sentados
    const seatW = (w - 16) / 7;
    for(let i = 0; i < 7; i++){
      const sx = x0 + 8 + i * seatW;

      // Encosto do assento esportivo
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(sx, by - 10, seatW - 3, 16, [4, 4, 1, 1]);
      ctx.fill();

      // Centro do assento com a cor do clube
      ctx.fillStyle = kitColor;
      ctx.fillRect(sx + 2, by - 8, seatW - 7, 12);

      // Silhueta do jogador reserva sentado
      ctx.fillStyle = kitColor;
      ctx.beginPath();
      ctx.roundRect(sx + 3, by - 6, seatW - 9, 13, [3, 3, 0, 0]);
      ctx.fill();

      // Cabeça com tom de pele variado
      const skinTones = ['#fed7aa', '#fcd34d', '#d97706', '#92400e', '#78350f'];
      ctx.fillStyle = skinTones[(i * 3 + (isHome ? 1 : 2)) % skinTones.length];
      ctx.beginPath();
      ctx.arc(sx + (seatW - 3) / 2, by - 11, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Cabelo
      ctx.fillStyle = (i % 2 === 0) ? '#111827' : '#451a03';
      ctx.beginPath();
      ctx.arc(sx + (seatW - 3) / 2, by - 12.5, 3.2, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // 5. Cobertura Curva de Acrílico Translúcido (Glass Acrylic Canopy)
    ctx.save();
    const canopyGrad = ctx.createLinearGradient(x0, by - 24, x0, by + 10);
    canopyGrad.addColorStop(0, 'rgba(207, 227, 242, 0.42)');
    canopyGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.22)');
    canopyGrad.addColorStop(1, 'rgba(207, 227, 242, 0.08)');
    ctx.fillStyle = canopyGrad;

    ctx.beginPath();
    ctx.moveTo(x0, by + 12);
    ctx.quadraticCurveTo(x0, by - 24, x0 + 18, by - 24);
    ctx.lineTo(x0 + w - 18, by - 24);
    ctx.quadraticCurveTo(x0 + w, by - 24, x0 + w, by + 12);
    ctx.closePath();
    ctx.fill();

    // Tubulação de aço metálico da cobertura (arco estrutural)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Nervuras metálicas intermediárias
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)';
    ctx.lineWidth = 1;
    for(let r = 1; r <= 3; r++){
      const rx = x0 + (r / 4) * w;
      ctx.beginPath();
      ctx.moveTo(rx, by + 10);
      ctx.lineTo(rx, by - 24);
      ctx.stroke();
    }

    // Brilho especular (reflexo de vidro / luz diagonal)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x0 + 14, by - 22);
    ctx.lineTo(x0 + 36, by - 22);
    ctx.lineTo(x0 + 20, by + 6);
    ctx.lineTo(x0 + 6, by + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. Treinador em pé na Área Técnica
    const coachWave = Math.sin(ticks * 0.08 + (isHome ? 0 : 2)) * 2;
    const coachX = isHome ? (x0 + w + 16) : (x0 - 24);
    const coachY = by - 8 + coachWave;

    // Sombra do técnico no gramado
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(coachX + 4.5, by + 8, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo / Terno do Treinador
    ctx.fillStyle = isHome ? '#0284c7' : '#dc2626';
    ctx.beginPath();
    ctx.roundRect(coachX, coachY, 9, 16, [2, 2, 0, 0]);
    ctx.fill();

    // Braço gesticulando
    ctx.strokeStyle = isHome ? '#0284c7' : '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(coachX + (isHome ? 9 : 0), coachY + 4);
    ctx.lineTo(coachX + (isHome ? 15 : -6), coachY + 8 + coachWave);
    ctx.stroke();

    // Cabeça do técnico
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(coachX + 4.5, coachY - 4, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo do técnico
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(coachX + 4.5, coachY - 5.5, 3.8, Math.PI, Math.PI * 2);
    ctx.fill();

    // Plaquinha elegante com nome do treinador
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(coachX - 24, by + 12, 58, 12, 3);
    ctx.fill();
    ctx.strokeStyle = kitColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 7.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(coachName, coachX + 5, by + 18);
  }

  // 1. Banco Mandante (Home - Esquerda)
  const homeManager = (typeof state !== 'undefined' && state.manager) ? \`TÉC. \${state.manager.split(' ')[0].toUpperCase()}\` : \`TÉC. \${(s.home || 'CASA').slice(0, 4).toUpperCase()}\`;
  renderBench(240, 195, 32, hKitColor, true, homeManager);

  // 2. Banco Visitante (Away - Direita)
  const awayManager = \`TÉC. \${(s.away || 'VISITANTE').slice(0, 6).toUpperCase()}\`;
  renderBench(845, 195, 32, aKitColor, false, awayManager);
}

`;

gameCode = gameCode.substring(0, oldDugoutsStart) + newDrawDugouts + gameCode.substring(nextFn);
console.log('✓ drawDugouts replaced successfully');

// B. Replace renderLiveMatchModal
const oldModalStart = gameCode.indexOf('function renderLiveMatchModal(){');
if (oldModalStart === -1) {
  console.error('renderLiveMatchModal not found in js/game.js');
  process.exit(1);
}
const nextModalFn = gameCode.indexOf('function showLiveBalloon(x, y, text, color){', oldModalStart);
if (nextModalFn === -1) {
  console.error('showLiveBalloon not found after renderLiveMatchModal');
  process.exit(1);
}

const newRenderLiveMatchModal = `function renderLiveMatchModal(){
  let el = $('#matchModalContainer');
  if(!el){
    el = document.createElement('div');
    el.id = 'matchModalContainer';
    document.body.appendChild(el);
  }

  const s = liveMatchState;
  if(!s){ el.remove(); return; }

  const comp = curComp();
  const occPct = Math.round(clamp(((s.stadium?.attendance || 15000) / (s.stadium?.capacity || 20000)) * 100, 1, 100));
  const minDisplay = String(Math.floor(s.timeSec / 60)).padStart(2, '0');
  const secDisplay = String(Math.floor(s.timeSec % 60)).padStart(2, '0');

  el.innerHTML = \`
    <div class="live-match-fullscreen">
      <!-- HEADER COM BREADCRUMB E PLACAR FLUTUANTE DOURADO -->
      <div class="live-match-header">
        <div class="live-match-breadcrumb">
          INÍCIO &gt; CARREIRA \${esc(state.club.toUpperCase())} &gt; \${esc(s.home.slice(0,3).toUpperCase())} X \${esc(s.away.slice(0,3).toUpperCase())} &gt; <span style="color:#22c55e">AO VIVO</span>
        </div>

        <div class="live-scoreboard-floating">
          <div class="live-scoreboard-comp">
            🏆 \${esc(comp.name.toUpperCase())} · RODADA \${state.round + 1}
          </div>
          <div class="live-scoreboard-main">
            <div class="live-scoreboard-team">
              \${clubBadge(s.home, 26)}
              <span>\${esc(s.home)}</span>
            </div>
            <div class="live-scoreboard-score">
              <span id="liveScoreH">\${s.hg}</span> . <span id="liveScoreA">\${s.ag}</span>
            </div>
            <div class="live-scoreboard-team">
              <span>\${esc(s.away)}</span>
              \${clubBadge(s.away, 26)}
            </div>
          </div>
          <div class="live-scoreboard-clock" id="liveClockDisplay">
            \${minDisplay}:\${secDisplay}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px">
          <button class="live-ctrl-btn" id="btnLiveClose" style="background:rgba(239,68,68,0.2);border-color:#ef4444;color:#fca5a5;padding:6px 14px;font-size:12px;font-weight:800;border-radius:8px" title="Sair / Fechar">
            ✕ Fechar
          </button>
        </div>
      </div>

      <!-- CORPO PRINCIPAL COM CAMPO 3D E SIDEBAR DE CONTROLES & NARRAÇÃO -->
      <div class="live-body-layout">
        <div class="live-canvas-area" id="liveCanvasArea">
          <div class="live-canvas-wrapper">
            <!-- CARD FLUTUANTE DE INFORMAÇÕES DO ESTÁDIO E TÁTICA (SUPERIOR ESQUERDO) -->
            <div class="live-pitch-pills">
              <div class="live-pitch-pill gold">
                🏟️ \${esc((s.stadium?.name || 'Estádio Municipal').toUpperCase())} · PÚBLICO <b>\${(s.stadium?.attendance || 12000).toLocaleString('pt-BR')}</b>
              </div>
              <div class="live-pitch-pill">
                \${esc(s.home.slice(0,3).toUpperCase())}: \${esc((s.homePosture || 'Equilibrada').toUpperCase())} · MARCAÇÃO \${esc((s.homeMarking || 'Equilibrada').toUpperCase())}
              </div>
              <div class="live-pitch-pill" id="livePillAwayPosture">
                \${esc(s.away.slice(0,3).toUpperCase())}: \${esc((s.awayPosture || 'Equilibrada').toUpperCase())} · MARCAÇÃO \${esc((s.awayMarking || 'Equilibrada').toUpperCase())}
              </div>
              \${s.prelecao && s.prelecao !== 'Sem preleção' ? \`
                <div class="live-pitch-pill" id="livePillPrelecao" style="background:rgba(168,85,247,0.3);border-color:#a855f7;color:#e9d5ff">
                  🗣️ PRELEÇÃO: \${esc(s.prelecao.toUpperCase())}
                </div>
              \` : ''}
            </div>

            <!-- OVERLAY DE PAUSA -->
            <div class="live-pause-pill" id="livePauseOverlay" style="display:\${s.playing ? 'none' : 'inline-flex'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"></path></svg>
              <span>Pausado · toque para continuar</span>
            </div>

            <!-- BADGE DE RESOLUÇÃO / TAXA DE QUADROS NO CANTO INFERIOR DIREITO -->
            <div class="live-fps-badge">
              \${(s.renderMode || '3d') === '2d' ? '📐 2D' : '🏟️ 3D'} · 60 quadros/s
            </div>

            <!-- CANVAS 1280x720 DA TRANSMISSÃO -->
            <canvas id="liveMatchCanvas" class="live-match-canvas" width="1280" height="720" aria-label="Transmissão da partida"></canvas>
          </div>
        </div>

        <!-- SIDEBAR COM CONTROLES UNIFICADOS E NARRAÇÃO AO VIVO -->
        <div class="live-sidebar">
          <!-- GRUPO DE CONTROLES NO TOPO DA SIDEBAR (LAYOUT BRFC27) -->
          <div class="live-sidebar-controls">
            <!-- LINHA 1: PAUSA E MEXER NO TIME -->
            <div class="live-sidebar-row main-actions">
              <button class="live-sidebar-play-btn" id="btnLivePlayToggle" title="Pausar / Continuar">
                \${s.playing ? '⏸ PAUSAR' : '▶ CONTINUAR'}
              </button>
              <button class="live-sidebar-tactics-btn" id="btnLiveTactics" title="Substituições e Tática">
                ⚡ MEXER NO TIME
              </button>
            </div>

            <!-- LINHA 2: VELOCIDADES -->
            <div class="live-sidebar-row">
              <span class="live-sidebar-label">VELOCIDADE</span>
              <div class="live-btn-group">
                <button class="live-ctrl-btn \${s.speed === 1 ? 'active' : ''}" id="btnLiveSpeed1">1x</button>
                <button class="live-ctrl-btn \${s.speed === 2 ? 'active' : ''}" id="btnLiveSpeed2">2x</button>
                <button class="live-ctrl-btn \${s.speed === 4 || s.speed === 5 ? 'active' : ''}" id="btnLiveSpeed5">4x</button>
                <button class="live-ctrl-btn \${s.speed === 20 ? 'active' : ''}" id="btnLiveSpeed20">20x</button>
                <button class="live-ctrl-btn \${s.speed === 40 ? 'active' : ''}" id="btnLiveSpeed40">40x</button>
              </div>
            </div>

            <!-- LINHA 3: CÂMERA -->
            <div class="live-sidebar-row">
              <span class="live-sidebar-label">CÂMERA</span>
              <div class="live-btn-group">
                <button class="live-ctrl-btn \${(!s.cameraMode || s.cameraMode === 'lateral' || s.cameraMode === 'tv') ? 'active' : ''}" id="btnCamLateral">Lateral</button>
                <button class="live-ctrl-btn \${s.cameraMode === 'ball' ? 'active' : ''}" id="btnCamBall">Bola</button>
                <button class="live-ctrl-btn \${s.cameraMode === 'goal' ? 'active' : ''}" id="btnCamGoal">Gol</button>
              </div>
            </div>

            <!-- LINHA 4: AÇÕES RÁPIDAS -->
            <div class="live-sidebar-row wrap" style="justify-content:space-between">
              <button class="live-ctrl-btn" id="btnLiveForward1" title="Avançar 1 minuto">+1 min</button>
              \${s.phase === 'FIRST_HALF' ? \`<button class="live-ctrl-btn" id="btnLiveSkipHalf" title="Pular para o intervalo">⏩ Intervalo</button>\` : (s.phase === 'HALF_TIME' ? \`<button class="live-ctrl-btn" id="btnLiveSkipHalf" title="Iniciar 2º Tempo">▶ Iniciar 2ºT</button>\` : '')}
              <button class="live-ctrl-btn" id="btnLiveSkipEnd" title="Simular até o apito final">⏭ Ao Fim</button>
              <button class="live-ctrl-btn" id="btnLiveSound" title="Ligar/Desligar som">
                \${s.soundMuted ? '🔇 Mudo' : '🔊 Som'}
              </button>
            </div>

            <!-- LINHA 5: MODO DE VISÃO 2D / 3D -->
            <div class="live-sidebar-row">
              <button class="live-ctrl-btn" id="btnToggle2D3D" style="width:100%;justify-content:center;background:\${(s.renderMode || '3d') === '2d' ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg,#7c3aed,#2563eb)'};border:1px solid #818cf8;color:#fff;font-weight:800;padding:6px 12px;border-radius:6px;font-size:11px">
                \${(s.renderMode || '3d') === '2d' ? '📐 MODO 2D (CLIQUE P/ 3D)' : '🏟️ MODO 3D (CLIQUE P/ 2D)'}
              </button>
            </div>
          </div>

          <!-- SIDEBAR DE NARRAÇÃO AO VIVO -->
          <div class="live-sidebar-header">
            <span>• NARRAÇÃO AO VIVO</span>
            <span style="font-size:11px;background:#ef4444;color:#fff;padding:2px 6px;border-radius:4px" id="liveEventCount">\${s.events.length}</span>
          </div>
          <div class="live-sidebar-feed" id="liveEventList">
            \${s.events.map(e => \`
              <div class="live-sidebar-item \${e.type === 'gol' ? 'gol' : e.type === 'yellow' ? 'yellow' : e.type === 'red' ? 'red' : e.type === 'save' ? 'save' : ''}">
                <b style="color:#fbbf24">\${e.min}'</b>
                <div>\${esc(e.text)}</div>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>

      <!-- BARRA FLUTUANTE INFERIOR DISCRETA (ESTATÍSTICAS E GRITOS) -->
      <div class="live-bottom-dock">
        <div class="live-dock-stats">
          <div class="live-dock-stats-row">
            <span id="liveShotsLabel">\${s.stats.shotsH} FINALIZAÇÕES \${s.stats.shotsA}</span>
            <span>
              🟨 \${s.stats.yellowsH} 🟥 \${s.stats.redsH} &nbsp;&nbsp; CARTÕES &nbsp;&nbsp; 🟨 \${s.stats.yellowsA} 🟥 \${s.stats.redsA}
            </span>
            <span>
              Público: <b>\${(s.stadium?.attendance || 12000).toLocaleString('pt-BR')}</b> (\${occPct}%)
            </span>
          </div>
          <div class="live-shots-bar">
            <div class="live-shots-fill-home" id="liveShotsFillH" style="width:\${(s.stats.shotsH+s.stats.shotsA) > 0 ? (s.stats.shotsH/(s.stats.shotsH+s.stats.shotsA)*100) : 50}%"></div>
            <div class="live-shots-fill-away" id="liveShotsFillA" style="width:\${(s.stats.shotsH+s.stats.shotsA) > 0 ? (s.stats.shotsA/(s.stats.shotsH+s.stats.shotsA)*100) : 50}%"></div>
          </div>
        </div>

        <!-- BARRA DE GRITOS DA BEIRA DO CAMPO -->
        <div class="live-coach-shouts" style="display:flex;gap:8px;align-items:center;padding:4px 8px;background:rgba(15,23,42,0.85);border-radius:6px;flex-wrap:wrap">
          <span style="font-size:10px;font-weight:900;color:#38bdf8;letter-spacing:0.5px">🗣️ BEIRA DO CAMPO:</span>
          <button class="live-shout-btn" data-shout="press" style="background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#fca5a5;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer">
            🔥 Subir Linhas & Pressão
          </button>
          <button class="live-shout-btn" data-shout="calm" style="background:rgba(56,189,248,0.2);border:1px solid #38bdf8;color:#bae6fd;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer">
            🧠 Calma & Posse
          </button>
          <button class="live-shout-btn" data-shout="counter" style="background:rgba(234,179,8,0.2);border:1px solid #eab308;color:#fef08a;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer">
            🎯 Fechar Espaços
          </button>
          \${s.coachShout ? \`<span style="font-size:10px;color:#22c55e;font-weight:800;margin-left:auto">✓ Instrução em andamento</span>\` : ''}
          \${s.done ? \`<button class="live-ctrl-btn" id="btnLiveAdvanceRound" style="background:#22c55e;color:#000;font-weight:900;padding:5px 12px;margin-left:auto">AVANÇAR RODADA ➔</button>\` : ''}
        </div>

        \${s.done ? \`
          <div class="live-postmatch-diag" style="margin:4px 0;padding:8px 12px;background:rgba(15,23,42,0.96);border:1px solid #38bdf8;border-radius:8px">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(56,189,248,0.25);padding-bottom:4px;margin-bottom:6px">
              <span style="font-size:12px;font-weight:900;color:#38bdf8;letter-spacing:0.5px">🧠 DIAGNÓSTICO TÁTICO PÓS-JOGO</span>
              <span style="font-size:11px;font-weight:800;color:#facc15">xG: \${s.stats.xGH} vs \${s.stats.xGA}</span>
            </div>
            <div style="font-size:11px;color:#e2e8f0;line-height:1.4">
              \${(function(){
                const isHomeUser = norm(s.home) === norm(state.club);
                const uGoals = isHomeUser ? s.hg : s.ag;
                const oGoals = isHomeUser ? s.ag : s.hg;
                const uXG = isHomeUser ? s.stats.xGH : s.stats.xGA;
                const oXG = isHomeUser ? s.stats.xGA : s.stats.xGH;
                if(uGoals > oGoals){
                  return \`<b>Vitória com autoridade tática!</b> A equipe executou com maestria a formação <i>\${esc(state.formation || '4-3-3')}</i>, gerando \${uXG} xG e vencendo o confronto.\`;
                } else if(uGoals < oGoals){
                  return \`<b>Revés tático!</b> A equipe cedeu espaços nas entrelinhas e sofreu com as transições adversárias (\${oXG} xG adversário).\`;
                } else {
                  return \`<b>Empate disputado!</b> Confronto equilibrado com forte marcação no meio de campo.\`;
                }
              })()}
            </div>
          </div>
        \` : ''}
      </div>
    </div>
  \`;

  // Inicializa o Canvas e inicia o renderizador loop
  setupLiveCanvasLoop();
  bindLiveMatchEvents();
}

`;

gameCode = gameCode.substring(0, oldModalStart) + newRenderLiveMatchModal + gameCode.substring(nextModalFn);
console.log('✓ renderLiveMatchModal replaced successfully');

// C. Update bindLiveMatchEvents to wire up camera, 2D/3D and all controls
const oldBindStart = gameCode.indexOf('function bindLiveMatchEvents(){');
if (oldBindStart === -1) {
  console.error('bindLiveMatchEvents not found in js/game.js');
  process.exit(1);
}
const nextBindFn = gameCode.indexOf('function openHalftimeModal(isQuickTactics = false){', oldBindStart);
if (nextBindFn === -1) {
  console.error('openHalftimeModal not found after bindLiveMatchEvents');
  process.exit(1);
}

const newBindLiveMatchEvents = `function bindLiveMatchEvents(){
  const s = liveMatchState;
  if(!s) return;

  // Toggle Pausa / Play
  const btnPlay = $('#btnLivePlayToggle');
  const overlay = $('#livePauseOverlay');
  const canvas = $('#liveMatchCanvas');

  function togglePlay(){
    s.playing = !s.playing;
    if(btnPlay) btnPlay.textContent = s.playing ? '⏸ PAUSAR' : '▶ CONTINUAR';
    if(overlay) overlay.style.display = s.playing ? 'none' : 'inline-flex';
  }

  if(btnPlay) btnPlay.onclick = togglePlay;
  if(overlay) overlay.onclick = togglePlay;
  if(canvas) canvas.onclick = togglePlay;

  // Velocidades (1x, 2x, 4x, 10x, 20x, 40x)
  const speedButtons = [
    { speed: 1, btn: $('#btnLiveSpeed1') },
    { speed: 2, btn: $('#btnLiveSpeed2') },
    { speed: 4, btn: $('#btnLiveSpeed5') },
    { speed: 10, btn: $('#btnLiveSpeed10') },
    { speed: 20, btn: $('#btnLiveSpeed20') },
    { speed: 40, btn: $('#btnLiveSpeed40') },
  ];
  function setSpeed(v){
    s.speed = v;
    speedButtons.forEach(({ speed, btn }) => {
      if(!btn) return;
      btn.classList.toggle('active', speed === v);
    });
  }
  speedButtons.forEach(({ speed, btn }) => {
    if(btn) btn.onclick = () => setSpeed(speed);
  });

  // Botões de avanço e retrocesso
  const btnRew10 = $('#btnLiveRewind10');
  if(btnRew10) btnRew10.onclick = () => {
    s.timeSec = Math.max(0, s.timeSec - 10);
    toast('Voltando 10 segundos!');
  };

  const btnFwd1 = $('#btnLiveForward1');
  if(btnFwd1) btnFwd1.onclick = () => {
    s.timeSec = Math.min(5400, s.timeSec + 60);
    toast('Avançando 1 minuto!');
  };

  // Botão Mexer no Time / Tática
  const btnTactics = $('#btnLiveTactics');
  if(btnTactics) btnTactics.onclick = () => {
    s.playing = false;
    if(btnPlay) btnPlay.textContent = '▶ CONTINUAR';
    if(overlay) overlay.style.display = 'inline-flex';
    openHalftimeModal(true);
  };

  // Câmera Lateral, Bola e Gol
  const btnCamLat = $('#btnCamLateral');
  if(btnCamLat) btnCamLat.onclick = () => {
    s.cameraMode = 'lateral';
    if(s.camera) s.camera.mode = 'tv';
    toast('🎥 Câmera Lateral / TV Dinâmica Ativada');
    renderLiveMatchModal();
  };
  const btnCamBall = $('#btnCamBall');
  if(btnCamBall) btnCamBall.onclick = () => {
    s.cameraMode = 'ball';
    if(s.camera) s.camera.mode = 'ball';
    toast('⚽ Câmera Foco na Bola Ativada');
    renderLiveMatchModal();
  };
  const btnCamGoal = $('#btnCamGoal');
  if(btnCamGoal) btnCamGoal.onclick = () => {
    s.cameraMode = 'goal';
    if(s.camera) s.camera.mode = 'goal';
    toast('🥅 Câmera Foco no Gol Ativada');
    renderLiveMatchModal();
  };

  // Alternar entre Estádio 3D e Visão 2D
  const btn2D3D = $('#btnToggle2D3D');
  if(btn2D3D) btn2D3D.onclick = () => {
    s.renderMode = (s.renderMode === '2d') ? '3d' : '2d';
    toast(s.renderMode === '2d' ? '📐 Visão Tática 2D Ativada' : '🏟️ Estádio 3D Imersivo Ativado');
    renderLiveMatchModal();
  };

  // Pular para o Intervalo ou Iniciar 2º Tempo (Contextual)
  const btnSkipHalf = $('#btnLiveSkipHalf');
  if(btnSkipHalf) btnSkipHalf.onclick = () => {
    if(s.phase === 'FIRST_HALF'){
      simulateMatchSegment(s.minute, 45);
      s.timeSec = 2700;
      s.minute = 45;
      s.halftimeTriggered = true;
      transitionMatchPhase('HALF_TIME');
      s.playing = false;
      if(window.afmAudio){
        window.afmAudio.playSFX('whistle_halftime');
      } else {
        playWhistleSound();
      }
      s.events.unshift({ min: 45, type: 'whistle', text: \`⏱ Fim do 1º tempo! \${s.home} \${s.hg} x \${s.ag} \${s.away}. As equipes descem para o vestiário.\` });
      updateScoreDisplay();
      updateLiveSidebarEvents();
      renderLiveMatchModal();
      openHalftimeModal();
    } else if(s.phase === 'HALF_TIME'){
      $('#halftimeModalContainer')?.remove();
      transitionMatchPhase('SECOND_HALF');
      s.playing = true;
      if(window.afmAudio){
        window.afmAudio.playSFX('whistle_start');
      } else {
        playWhistleSound();
      }
      renderLiveMatchModal();
      toast('Bola rolando para a etapa complementar!');
    } else {
      toast('A primeira etapa da partida já foi encerrada!');
    }
  };

  // Simular até o fim
  const btnSkipEnd = $('#btnLiveSkipEnd');
  if(btnSkipEnd) btnSkipEnd.onclick = () => {
    simulateMatchSegment(s.minute, 90);
    s.timeSec = 5400;
    s.minute = 90;
    updateScoreDisplay();
    updateLiveSidebarEvents();
    finishLiveMatch();
  };

  // Som Ligar/Desligar
  const btnSound = $('#btnLiveSound');
  if(btnSound) btnSound.onclick = () => {
    s.soundMuted = !s.soundMuted;
    if(window.afmAudio){
      if(s.soundMuted){
        window.afmAudio.stopCrowdAmbient();
      } else {
        window.afmAudio.startCrowdAmbient(s.home, curComp()?.id);
      }
    }
    btnSound.textContent = s.soundMuted ? '🔇 Mudo' : '🔊 Som';
    toast(s.soundMuted ? 'Áudio da partida desativado' : 'Áudio da partida ativado');
  };

  // Fechar
  const btnClose = $('#btnLiveClose');
  if(btnClose) btnClose.onclick = () => {
    if(s.done){
      finalizeMatchRound();
      return;
    }
    if(confirm('Deseja realmente sair da transmissão ao vivo e avançar a rodada?')){
      s.timeSec = 5400;
      finishLiveMatch();
      finalizeMatchRound();
    }
  };

  const btnAdv = $('#btnLiveAdvanceRound');
  if(btnAdv) btnAdv.onclick = () => {
    finalizeMatchRound();
  };

  // Gritos da Beira do Campo
  $$('.live-shout-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.shout;
      playWhistleSound();
      s.coachShout = type;
      const desc = type === 'press' 
        ? 'Professor gesticula na beira do gramado e manda adiantar as linhas com marcação alta!'
        : type === 'calm'
        ? 'Professor pede calma, valorização da posse de bola e paciência na armação.'
        : 'Professor fecha o bloco na entrada da área e aposta no contra-ataque em velocidade!';
      s.events.unshift({ min: Math.floor(s.timeSec/60), type: 'whistle', text: \`🗣️ INSTRUÇÃO DO TREINADOR: \${desc}\` });
      updateLiveSidebarEvents();
      showLiveBanner(\`🗣️ BEIRA DO CAMPO: \${btn.textContent.trim()}!\`, 'tactics', 3500);
      toast('Instrução repassada aos atletas em campo!');
    };
  });
}

`;

gameCode = gameCode.substring(0, oldBindStart) + newBindLiveMatchEvents + gameCode.substring(nextBindFn);
console.log('✓ bindLiveMatchEvents replaced successfully');

fs.writeFileSync('js/game.js', gameCode, 'utf8');
console.log('✓ js/game.js saved successfully');

// 2. UPDATE css/app.css
let cssCode = fs.readFileSync('css/app.css', 'utf8');

const newLiveStyles = `
/* =============================================================
   ESTILOS HUD E SIDEBAR REFINADOS AO VIVO (PADRÃO BRFC27)
   ============================================================= */
.live-sidebar-controls {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(13, 18, 30, 0.96);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.live-sidebar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-sidebar-row.wrap {
  flex-wrap: wrap;
}

.live-sidebar-row.main-actions {
  gap: 8px;
  margin-bottom: 2px;
}

.live-sidebar-play-btn {
  flex: 1;
  background: #7c3aed;
  border: 1px solid #a78bfa;
  color: #fff;
  font-weight: 900;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
}

.live-sidebar-play-btn:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

.live-sidebar-tactics-btn {
  flex: 1.2;
  background: rgba(34, 197, 94, 0.18);
  border: 1px solid #22c55e;
  color: #86efac;
  font-weight: 900;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
}

.live-sidebar-tactics-btn:hover {
  background: rgba(34, 197, 94, 0.3);
  transform: translateY(-1px);
}

.live-sidebar-label {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  min-width: 65px;
  text-transform: uppercase;
}

.live-btn-group {
  display: flex;
  flex: 1;
  gap: 4px;
}

.live-btn-group .live-ctrl-btn {
  flex: 1;
  text-align: center;
  justify-content: center;
  padding: 5px 4px;
}

.live-fps-badge {
  position: absolute;
  bottom: 12px;
  right: 16px;
  background: rgba(9, 13, 20, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 800;
  color: #a3e635;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 25;
}
`;

if (!cssCode.includes('.live-sidebar-controls')) {
  cssCode += '\n' + newLiveStyles;
  fs.writeFileSync('css/app.css', cssCode, 'utf8');
  console.log('✓ css/app.css updated with live HUD styles');
} else {
  console.log('css/app.css already has .live-sidebar-controls');
}

console.log('--- All stadium 3D & HUD updates applied successfully! ---');
