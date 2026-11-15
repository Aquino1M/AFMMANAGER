/**
 * =========================================================================
 * AFM MANAGER 2026 / 2027 — SISTEMA INTERATIVO DE PÊNALTIS E FALTAS
 * =========================================================================
 * Minigame cinematográfico e interativo estilo EA FC / PES para cobranças de:
 * 1. Pênalti durante a partida ao vivo (como cobrador ou como goleiro)
 * 2. Falta perigosa na entrada da grande área (com barreira tática)
 * 3. Disputa de pênaltis de mata-mata
 * 4. Modo treino livre de bolas paradas
 */

(function(window){
  'use strict';

  function esc(str){
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Zonas de finalização no gol (6 alvos profissionais)
  const TARGET_ZONES = [
    { id: 'top_left', label: 'Gaveta Esquerda', icon: '↖️', xPct: 22, yPct: 28, risk: 0.18, powerBonus: 0.15 },
    { id: 'top_mid', label: 'Meio Alto / Cavadinha', icon: '⬆️', xPct: 50, yPct: 26, risk: 0.08, panenkaSafe: true },
    { id: 'top_right', label: 'Gaveta Direita', icon: '↗️', xPct: 78, yPct: 28, risk: 0.18, powerBonus: 0.15 },
    { id: 'bot_left', label: 'Canto Esquerdo Baixo', icon: '↙️', xPct: 20, yPct: 74, risk: 0.06, powerBonus: 0.05 },
    { id: 'bot_mid', label: 'Meio Rasteiro', icon: '⬇️', xPct: 50, yPct: 76, risk: 0.02, powerBonus: 0.00 },
    { id: 'bot_right', label: 'Canto Direito Baixo', icon: '↘️', xPct: 80, yPct: 74, risk: 0.06, powerBonus: 0.05 }
  ];

  /**
   * Abre o Modal Interativo de Cobrança de Pênalti
   */
  function openPenaltyModal(matchState, min, att, def, isHomeAttacking, onDone){
    const s = matchState;
    if(!s) return;

    // Pausa o relógio da partida para a tomada de decisão do lance
    s.playing = false;

    const isUserHome = (typeof window.norm === 'function' ? window.norm(s.home) === window.norm(window.state?.club) : s.home === window.state?.club);
    const isUserAttacking = (isHomeAttacking && isUserHome) || (!isHomeAttacking && !isUserHome);
    const isPlayerMode = Boolean(window.state && window.state.gameMode === 'player');

    const attTeam = isHomeAttacking ? s.home : s.away;
    const defTeam = isHomeAttacking ? s.away : s.home;
    const attPlayers = isHomeAttacking ? s.homePlayers : s.awayPlayers;
    const defPlayers = isHomeAttacking ? s.awayPlayers : s.homePlayers;

    // Se for Modo Jogador e o atleta estiver em campo, ele bate o pênalti!
    let kicker = null;
    if(isPlayerMode && isUserAttacking){
      kicker = attPlayers.find(p => p.isControlledAthlete);
    }
    if(!kicker){
      kicker = attPlayers.filter(p => !p.isGK && !p.redCard).sort((a,b) => (b.overall||65) - (a.overall||65))[0] || att;
    }

    const gk = defPlayers.find(p => p.isGK) || defPlayers[0] || { name: 'Goleiro', overall: 68 };

    // Toca som de apito do árbitro marcando o pênalti
    if(window.afmAudio){
      window.afmAudio.playSFX('whistle_start');
    } else if(typeof window.playWhistleSound === 'function'){
      window.playWhistleSound();
    }

    const oldModal = document.getElementById('afmInteractiveSetPieceModal');
    if(oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'afmInteractiveSetPieceModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.95);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.25s ease-out;font-family:system-ui,-apple-system,sans-serif;color:#fff;';

    let selectedStyle = 'placement'; // 'placement' (Colocada) | 'power' (Pancada) | 'panenka' (Cavadinha)
    let selectedZone = null;
    let isExecuting = false;

    overlay.innerHTML = `
      <div style="max-width:820px;width:95%;background:linear-gradient(135deg,#090d16 0%,#111827 100%);border:2px solid #facc15;border-radius:24px;padding:24px;box-shadow:0 0 60px rgba(250,204,21,0.3);position:relative;overflow:hidden">
        
        <!-- HEADER DO LANCE -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:16px">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(250,204,21,0.18);border:1px solid #facc15;color:#facc15;font-size:11px;font-weight:900;padding:3px 10px;border-radius:12px;text-transform:uppercase;letter-spacing:0.8px">
              ${s.isTraining ? `🏟️ CT DO CLUBE - TREINO PRÁTICO (Tentativa ${s.trainingAttempt || 1}/3)` : `⏱️ ${min}' · PÊNALTI MARCADO!`}
            </div>
            <div style="font-size:18px;font-weight:900;margin-top:4px;color:#fff">
              ${s.isTraining ? '⭐ É A SUA VEZ DE BATER O PÊNALTI!' : (isUserAttacking ? (isPlayerMode ? '⭐ É A SUA VEZ DE BATER O PÊNALTI!' : `⚽ PÊNALTI A FAVOR DO ${attTeam.toUpperCase()}!`) : `🧤 PÊNALTI CONTRA! SEU GOLEIRO DEVE DEFENDER!`)}
            </div>
          </div>

          <!-- PLACAR ATUAL OU BADGE DE RECOMPENSA -->
          <div style="background:#1e293b;border:1px solid ${s.isTraining ? '#facc15' : 'rgba(255,255,255,0.1)'};padding:6px 14px;border-radius:10px;font-weight:900;font-size:14px;color:${s.isTraining ? '#facc15' : '#fff'}">
            ${s.isTraining ? 'RECOMPENSA: +20 XP (Pênalti)' : `${s.home.slice(0,3).toUpperCase()} <b style="color:#facc15">${s.hg}</b> x <b style="color:#facc15">${s.ag}</b> ${s.away.slice(0,3).toUpperCase()}`}
          </div>
        </div>

        <!-- DUELO: COBRADOR VS GOLEIRO -->
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:10px 16px;margin-bottom:18px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:40px;height:40px;border-radius:10px;background:#334155;border:2px solid #facc15;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center">
              ${kicker.photo ? `<img src="${kicker.photo}" style="width:100%;height:100%;object-fit:cover">` : '<span style="font-size:20px">⚽</span>'}
            </div>
            <div>
              <div style="font-size:10px;font-weight:800;color:#facc15">COBRADOR</div>
              <div style="font-size:14px;font-weight:900;color:#fff">${esc(kicker.fullName || kicker.name)} ${kicker.isControlledAthlete ? '⭐' : ''}</div>
              <div style="font-size:11px;color:#94a3b8">Chute / Força: <b>${kicker.overall || 70}</b></div>
            </div>
          </div>

          <div style="font-size:14px;font-weight:900;color:#64748b;letter-spacing:1px">X</div>

          <div style="display:flex;align-items:center;gap:10px;justify-content:flex-end;text-align:right">
            <div>
              <div style="font-size:10px;font-weight:800;color:#38bdf8">GOLEIRO</div>
              <div style="font-size:14px;font-weight:900;color:#fff">${esc(gk.fullName || gk.name)}</div>
              <div style="font-size:11px;color:#94a3b8">Reflexo / Defesa: <b>${gk.overall || 68}</b></div>
            </div>
            <div style="width:40px;height:40px;border-radius:10px;background:#1e3a8a;border:2px solid #38bdf8;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center">
              ${gk.photo ? `<img src="${gk.photo}" style="width:100%;height:100%;object-fit:cover">` : '<span style="font-size:20px">🧤</span>'}
            </div>
          </div>
        </div>

        <!-- STAGE DO GOL INTERATIVO (VISÃO DA MARCA DO PÊNALTI) -->
        <div id="penaltyGoalStage" style="position:relative;width:100%;height:310px;background:radial-gradient(ellipse at bottom,#15803d 0%,#0f4924 60%,#092613 100%);border:2px solid #22c55e;border-radius:18px;overflow:hidden;box-shadow:inset 0 0 50px rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:flex-end">
          
          <!-- LINHAS DO CAMPO E MARCA DO PÊNALTI -->
          <div style="position:absolute;bottom:0;width:100%;height:100px;background:linear-gradient(to top,rgba(34,197,94,0.35),transparent);pointer-events:none"></div>
          <div style="position:absolute;bottom:24px;width:16px;height:6px;background:#fff;border-radius:50%;box-shadow:0 0 10px #fff;opacity:0.9"></div>

          <!-- BALIZA DE FUTEBOL REALISTA (TRAVES BRANCAS E REDE 3D) -->
          <div style="position:absolute;top:28px;width:76%;height:220px;border-top:8px solid #f8fafc;border-left:8px solid #f8fafc;border-right:8px solid #f8fafc;box-shadow:0 4px 20px rgba(0,0,0,0.9), inset 0 0 30px rgba(255,255,255,0.08);background:repeating-linear-gradient(0deg,transparent,transparent 12px,rgba(255,255,255,0.09) 12px,rgba(255,255,255,0.09) 13px),repeating-linear-gradient(90deg,transparent,transparent 12px,rgba(255,255,255,0.09) 12px,rgba(255,255,255,0.09) 13px)">
            
            <!-- GOLEIRO ANIMADO NO CENTRO DO GOL -->
            <div id="penaltyGkSprite" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:70px;height:120px;transition:all 0.45s cubic-bezier(0.25, 1, 0.5, 1);display:flex;flex-direction:column;align-items:center">
              <div style="width:20px;height:20px;background:#fed7aa;border-radius:50%;border:2px solid #1e293b;margin-bottom:2px"></div>
              <div style="width:40px;height:55px;background:#22c55e;border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center">
                <span style="font-size:10px;font-weight:900;color:#000">1</span>
                <!-- Luvas -->
                <div style="position:absolute;left:-8px;top:10px;width:10px;height:12px;background:#facc15;border-radius:4px"></div>
                <div style="position:absolute;right:-8px;top:10px;width:10px;height:12px;background:#facc15;border-radius:4px"></div>
              </div>
              <div style="display:flex;gap:4px;margin-top:2px">
                <div style="width:12px;height:35px;background:#0f172a"></div>
                <div style="width:12px;height:35px;background:#0f172a"></div>
              </div>
            </div>

            <!-- BOLA DE FUTEBOL NA MARCA DA CAL -->
            <div id="penaltyBallSprite" style="position:absolute;bottom:-35px;left:50%;transform:translateX(-50%);width:28px;height:28px;background:radial-gradient(circle at 35% 35%,#fff 0%,#cbd5e1 60%,#0f172a 100%);border-radius:50%;box-shadow:0 4px 14px rgba(0,0,0,0.8);z-index:10;transition:all 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)">
              <div style="position:absolute;top:9px;left:9px;width:10px;height:10px;background:#0f172a;clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"></div>
            </div>

            <!-- AS 6 ZONAS DE ALVO CLICÁVEIS -->
            ${TARGET_ZONES.map(z => `
              <button type="button" class="penalty-target-btn" data-zone="${z.id}" style="position:absolute;left:${z.xPct}%;top:${z.yPct}%;transform:translate(-50%, -50%);width:68px;height:56px;background:rgba(15,23,42,0.7);border:2px dashed #facc15;border-radius:12px;color:#fef08a;font-size:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s ease;z-index:20" title="${z.label}">
                <span>${z.icon}</span>
                <span style="font-size:9px;font-weight:900;margin-top:2px">${z.label.split(' ')[0]}</span>
              </button>
            `).join('')}
          </div>

          <!-- RESULTADO DO LANCE (BANNER SOBREPOSTO) -->
          <div id="penaltyOutcomeBanner" style="display:none;position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);background:rgba(2,6,23,0.95);border:3px solid #facc15;padding:16px 36px;border-radius:18px;text-align:center;box-shadow:0 0 40px rgba(250,204,21,0.6);z-index:30">
            <div id="penaltyOutcomeIcon" style="font-size:44px;margin-bottom:6px">⚽</div>
            <div id="penaltyOutcomeTitle" style="font-size:24px;font-weight:900;letter-spacing:1px;color:#facc15">GOOOOOL!</div>
            <div id="penaltyOutcomeDesc" style="font-size:13px;color:#cbd5e1;margin-top:4px">Bola no canto oposto!</div>
          </div>
        </div>

        <!-- SELEÇÃO DE ESTILO DE BATIDA E DICAS -->
        <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:12px;font-weight:800;color:#94a3b8">ESTILO:</span>
            <button type="button" class="btn-pen-style ${selectedStyle==='placement'?'active':''}" data-style="placement" style="background:#7c3aed;color:#fff;font-size:12px;font-weight:800;padding:7px 14px;border-radius:8px;border:none;cursor:pointer">
              🎯 Colocada
            </button>
            <button type="button" class="btn-pen-style" data-style="power" style="background:#1e293b;color:#fff;font-size:12px;font-weight:800;padding:7px 14px;border-radius:8px;border:none;cursor:pointer">
              ⚡ Bomba
            </button>
            <button type="button" class="btn-pen-style" data-style="panenka" style="background:#1e293b;color:#fff;font-size:12px;font-weight:800;padding:7px 14px;border-radius:8px;border:none;cursor:pointer">
              🥄 Cavadinha
            </button>
          </div>

          <div id="penaltyInstructions" style="font-size:12px;color:#fde047;font-weight:800;display:flex;align-items:center;gap:6px">
            👉 Clique em um dos 6 alvos no gol para executar a cobrança!
          </div>

          <!-- BOTÃO CONTINUAR (HABILITADO APÓS A COBRANÇA) -->
          <button type="button" id="btnContinueAfterPenalty" style="display:none;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#000;font-size:14px;font-weight:900;padding:10px 24px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(16,185,129,0.5)">
            CONTINUAR A PARTIDA ➔
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Binds dos estilos de batida
    const styleBtns = overlay.querySelectorAll('.btn-pen-style');
    styleBtns.forEach(btn => {
      btn.onclick = () => {
        if(isExecuting) return;
        selectedStyle = btn.dataset.style;
        styleBtns.forEach(b => {
          b.style.background = (b.dataset.style === selectedStyle) ? '#7c3aed' : '#1e293b';
        });
      };
    });

    // Binds das zonas de chute
    const targetBtns = overlay.querySelectorAll('.penalty-target-btn');
    targetBtns.forEach(btn => {
      btn.onmouseenter = () => {
        if(!isExecuting) btn.style.borderColor = '#10b981';
      };
      btn.onmouseleave = () => {
        if(!isExecuting) btn.style.borderColor = '#facc15';
      };
      btn.onclick = () => {
        if(isExecuting) return;
        selectedZone = btn.dataset.zone;
        executeInteractivePenalty(selectedZone, selectedStyle);
      };
    });

    // Lógica da Execução da Cobrança
    function executeInteractivePenalty(zoneId, style){
      isExecuting = true;
      targetBtns.forEach(b => { b.style.pointerEvents = 'none'; b.style.opacity = '0.3'; });

      const targetDef = TARGET_ZONES.find(z => z.id === zoneId) || TARGET_ZONES[0];
      const ballSprite = overlay.querySelector('#penaltyBallSprite');
      const gkSprite = overlay.querySelector('#penaltyGkSprite');
      const banner = overlay.querySelector('#penaltyOutcomeBanner');
      const btnCont = overlay.querySelector('#btnContinueAfterPenalty');

      // Decisão da IA do Goleiro: escolhe uma zona para pular
      const gkChoices = ['top_left', 'bot_left', 'top_right', 'bot_right', 'top_mid', 'bot_mid'];
      // Se for cavadinha, o goleiro pula para os lados na maioria das vezes
      let gkJumpZone = gkChoices[Math.floor(Math.random() * gkChoices.length)];
      if(style === 'panenka'){
        const sideJumps = ['top_left', 'bot_left', 'top_right', 'bot_right'];
        gkJumpZone = (Math.random() < 0.85) ? sideJumps[Math.floor(Math.random() * sideJumps.length)] : 'top_mid';
      }

      // Animação de Salto do Goleiro
      let gkShiftX = 0;
      let gkShiftY = 0;
      if(gkJumpZone.includes('left')){ gkShiftX = -110; }
      else if(gkJumpZone.includes('right')){ gkShiftX = 110; }

      if(gkJumpZone.includes('top')){ gkShiftY = -60; }
      else if(gkJumpZone.includes('bot')){ gkShiftY = 20; }

      gkSprite.style.transform = `translate(calc(-50% + ${gkShiftX}px), ${gkShiftY}px) ${gkShiftX < 0 ? 'rotate(-35deg)' : gkShiftX > 0 ? 'rotate(35deg)' : ''}`;

      // Animação da Bola em direção ao Alvo
      const goalBox = overlay.querySelector('#penaltyGoalStage').getBoundingClientRect();
      const ballTargetX = targetDef.xPct;
      const ballTargetY = targetDef.yPct;

      ballSprite.style.bottom = `${100 - ballTargetY}%`;
      ballSprite.style.left = `${ballTargetX}%`;
      ballSprite.style.width = '18px';
      ballSprite.style.height = '18px';

      // Avaliação do Resultado
      const kickerOvr = kicker.overall || 70;
      const gkOvr = gk.overall || 68;
      const sameZone = (gkJumpZone === zoneId);
      const isCorner = zoneId.includes('left') || zoneId.includes('right');

      let isGoal = false;
      let isSave = false;
      let isPost = false;

      if(style === 'panenka'){
        if(gkJumpZone === 'top_mid' || gkJumpZone === 'bot_mid'){
          // Goleiro ficou no meio e segurou a cavadinha!
          isSave = true;
        } else {
          // Goleiro pulou e a cavadinha entrou com classe no meio!
          isGoal = true;
        }
      } else if(style === 'power'){
        if(sameZone){
          // Chute forte pode passar pela mão do goleiro se kickerOvr for alto!
          isGoal = (kickerOvr + 10 * Math.random() > gkOvr + 8);
          isSave = !isGoal;
        } else {
          isGoal = true;
        }
      } else {
        // Colocada
        if(sameZone){
          isSave = (gkOvr + 5 * Math.random() >= kickerOvr);
          isGoal = !isSave;
        } else {
          // Pequena chance de bater na trave em cantos extremos
          if(isCorner && Math.random() < 0.08){
            isPost = true;
          } else {
            isGoal = true;
          }
        }
      }

      // Se for modo treino prático, dispara imediatamente o consumo da carga anti-glitch e cálculo de XP
      let trainingResult = null;
      if(s.isTraining && typeof s.onShotExecuted === 'function'){
        try { trainingResult = s.onShotExecuted(isGoal); } catch(err) { console.error('Erro ao executar treino pratico:', err); }
      }

      // Aplica o som e o resultado visual após 550ms (tempo de viagem da bola)
      setTimeout(() => {
        banner.style.display = 'block';
        btnCont.style.display = 'inline-block';
        overlay.querySelector('#penaltyInstructions').style.display = 'none';

        if(s.isTraining){
          btnCont.textContent = 'CONCLUIR TREINO ➔';
          if(isGoal){
            if(window.afmAudio){
              window.afmAudio.playSFX('goal_celebration');
            } else if(typeof window.playCheerSound === 'function'){
              window.playCheerSound();
            }
            banner.style.borderColor = '#10b981';
            banner.querySelector('#penaltyOutcomeIcon').textContent = '⚽';
            banner.querySelector('#penaltyOutcomeTitle').textContent = style === 'panenka' ? 'GOLAÇO DE CAVADINHA NO TREINO!' : 'GOLAÇO NO TREINO!';
            banner.querySelector('#penaltyOutcomeTitle').style.color = '#10b981';
            const remainingCount = trainingResult ? trainingResult.remainingToday : Math.max(0, 3 - (s.trainingAttempt || 1));
            banner.querySelector('#penaltyOutcomeDesc').textContent = `⚽ GOLAÇO NO TREINO! Você ganhou +20 XP em Finalização & Evolution!${trainingResult?.gainedAttributePoint ? ' ⭐ VOCÊ SUBIU DE NÍVEL E GANHOU 1 PONTO LIVRE!' : ''} (Restam ${remainingCount}/3 treinos hoje)`;
          } else {
            banner.style.borderColor = '#ef4444';
            banner.querySelector('#penaltyOutcomeIcon').textContent = isSave ? '🧤' : (isPost ? '💥' : '⚠️');
            banner.querySelector('#penaltyOutcomeTitle').textContent = isSave ? 'DEFENDEU NO TREINO!' : (isPost ? 'NA TRAVE!' : 'PARA FORA!');
            banner.querySelector('#penaltyOutcomeTitle').style.color = '#ef4444';
            const remainingCount = trainingResult ? trainingResult.remainingToday : Math.max(0, 3 - (s.trainingAttempt || 1));
            banner.querySelector('#penaltyOutcomeDesc').textContent = `🧤 DEFENDEU / PARA FORA! Você ganhou apenas +3 XP pela tentativa. Restam ${remainingCount}/3 treinos hoje.`;
          }
        } else if(isGoal){
          if(window.afmAudio){
            window.afmAudio.playSFX('goal_celebration');
            window.afmAudio.boostCrowdCheer(4);
          } else if(typeof window.playCheerSound === 'function'){
            window.playCheerSound();
          }

          banner.style.borderColor = '#10b981';
          banner.querySelector('#penaltyOutcomeIcon').textContent = '⚽';
          banner.querySelector('#penaltyOutcomeTitle').textContent = style === 'panenka' ? 'GOLAÇO DE CAVADINHA!' : 'GOOOOOOL!';
          banner.querySelector('#penaltyOutcomeTitle').style.color = '#10b981';
          banner.querySelector('#penaltyOutcomeDesc').textContent = `${kicker.name} converte a cobrança com frieza impecável!`;

          // Atualiza placar do jogo ao vivo
          if(isHomeAttacking){ s.hg++; s.stats.targetH++; } else { s.ag++; s.stats.targetA++; }
          if(isHomeAttacking) s.stats.shotsH++; else s.stats.shotsA++;
          s.stats.xGH = +(s.stats.xGH + (isHomeAttacking ? 0.76 : 0)).toFixed(2);
          s.stats.xGA = +(s.stats.xGA + (!isHomeAttacking ? 0.76 : 0)).toFixed(2);

          const goalEvt = {
            id: `${s.matchId}_ev_${s.events.length + 1}`,
            matchId: s.matchId,
            min,
            type: 'gol',
            teamId: attTeam,
            playerId: kicker.id,
            pattern: 'Pênalti',
            text: style === 'panenka'
              ? `🎯 GOLAÇO DE PÊNALTI! ${kicker.name} humilha com uma cavadinha sutil no meio do gol!`
              : `🎯 GOL DE PÊNALTI! ${kicker.name} desloca ${gk.name} e marca para o ${attTeam}!`,
            xG: 0.76,
            scorer: kicker.name
          };
          s.events.unshift(goalEvt);
          s.lastScorer = kicker;

          // Se for Modo Jogador e for o próprio atleta, registra gol
          if(kicker.isControlledAthlete && window.state?.playerCareerState){
            window.state.playerCareerState.careerStats.goals = (window.state.playerCareerState.careerStats.goals || 0) + 1;
            window.state.playerCareerState.managerTrust = Math.min(100, (window.state.playerCareerState.managerTrust || 35) + 3);
          }
        } else if(isSave){
          if(window.afmAudio) window.afmAudio.playSFX('crowd_gasp');
          banner.style.borderColor = '#38bdf8';
          banner.querySelector('#penaltyOutcomeIcon').textContent = '🧤';
          banner.querySelector('#penaltyOutcomeTitle').textContent = 'DEFESASSA DO GOLEIRO!';
          banner.querySelector('#penaltyOutcomeTitle').style.color = '#38bdf8';
          banner.querySelector('#penaltyOutcomeDesc').textContent = `${gk.name} acerta o canto e espalma no reflexo!`;

          if(isHomeAttacking) { s.stats.targetH++; s.stats.savesA++; s.stats.cornersH++; }
          else { s.stats.targetA++; s.stats.savesH++; s.stats.cornersA++; }

          s.events.unshift({
            min,
            type: 'save',
            text: `🧤 DEFENDEU O PÊNALTI! ${gk.name} salta com agilidade e espalma a cobrança de ${kicker.name}!`
          });
        } else {
          // Na trave / Fora
          banner.style.borderColor = '#ef4444';
          banner.querySelector('#penaltyOutcomeIcon').textContent = '💥';
          banner.querySelector('#penaltyOutcomeTitle').textContent = isPost ? 'NA TRAVE!' : 'PRA FORA!';
          banner.querySelector('#penaltyOutcomeTitle').style.color = '#ef4444';
          banner.querySelector('#penaltyOutcomeDesc').textContent = isPost ? 'O arremate explode no poste metálico e sai!' : 'Cobrança raspou a trave e foi direto pela linha de fundo.';

          if(isHomeAttacking) s.stats.shotsH++; else s.stats.shotsA++;
          s.events.unshift({
            min,
            type: 'whistle',
            text: `⚡ PÊNALTI DESPERDIÇADO! ${kicker.name} arrisca demais e manda ${isPost ? 'na trave' : 'para fora'}!`
          });
        }

        // Atualiza telas de fundo
        if(typeof window.updateScoreDisplay === 'function') window.updateScoreDisplay();
        if(typeof window.updateLiveSidebarEvents === 'function') window.updateLiveSidebarEvents();
      }, 550);

      btnCont.onclick = () => {
        overlay.remove();
        s.playing = true;
        if(typeof onDone === 'function') onDone({ isGoal, isSave, isPost });
      };
    }
  }

  /**
   * Abre o Modal Interativo de Cobrança de Falta Perigosa na Entrada da Área
   */
  function openFreeKickModal(matchState, min, att, def, isHomeAttacking, onDone){
    const s = matchState;
    if(!s) return;

    s.playing = false;

    const isUserHome = (typeof window.norm === 'function' ? window.norm(s.home) === window.norm(window.state?.club) : s.home === window.state?.club);
    const isUserAttacking = (isHomeAttacking && isUserHome) || (!isHomeAttacking && !isUserHome);
    const isPlayerMode = Boolean(window.state && window.state.gameMode === 'player');

    const attTeam = isHomeAttacking ? s.home : s.away;
    const defTeam = isHomeAttacking ? s.away : s.home;
    const attPlayers = isHomeAttacking ? s.homePlayers : s.awayPlayers;
    const defPlayers = isHomeAttacking ? s.awayPlayers : s.homePlayers;

    let kicker = null;
    if(isPlayerMode && isUserAttacking){
      kicker = attPlayers.find(p => p.isControlledAthlete);
    }
    if(!kicker){
      kicker = attPlayers.filter(p => !p.isGK && !p.redCard).sort((a,b) => (b.overall||65) - (a.overall||65))[0] || att;
    }

    const gk = defPlayers.find(p => p.isGK) || defPlayers[0] || { name: 'Goleiro', overall: 68 };

    const oldModal = document.getElementById('afmInteractiveSetPieceModal');
    if(oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'afmInteractiveSetPieceModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.95);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.25s ease-out;font-family:system-ui,-apple-system,sans-serif;color:#fff;';

    overlay.innerHTML = `
      <div style="max-width:820px;width:95%;background:linear-gradient(135deg,#090d16 0%,#111827 100%);border:2px solid #38bdf8;border-radius:24px;padding:24px;box-shadow:0 0 60px rgba(56,189,248,0.3);position:relative;overflow:hidden">
        
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:16px">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.18);border:1px solid #38bdf8;color:#38bdf8;font-size:11px;font-weight:900;padding:3px 10px;border-radius:12px;text-transform:uppercase;letter-spacing:0.8px">
              ${s.isTraining ? `🏟️ CT DO CLUBE - TREINO PRÁTICO (Tentativa ${s.trainingAttempt || 1}/3)` : `⏱️ ${min}' · FALTA PERIGOSA NA ENTRADA DA ÁREA (23M)`}
            </div>
            <div style="font-size:18px;font-weight:900;margin-top:4px;color:#fff">
              ${s.isTraining ? '⭐ COBRANÇA DE FALTA: ESCOLHA COMO BATER!' : (isUserAttacking ? (isPlayerMode ? '⭐ COBRANÇA DE FALTA: ESCOLHA COMO BATER!' : `🎯 FALTA PERIGOSA PARA O ${attTeam.toUpperCase()}!`) : `🛡️ BARREIRA MONTADA! DEFENDA A COBRANÇA!`)}
            </div>
          </div>

          <!-- PLACAR ATUAL OU BADGE DE RECOMPENSA -->
          <div style="background:#1e293b;border:1px solid ${s.isTraining ? '#38bdf8' : 'rgba(255,255,255,0.1)'};padding:6px 14px;border-radius:10px;font-weight:900;font-size:14px;color:${s.isTraining ? '#38bdf8' : '#fff'}">
            ${s.isTraining ? 'RECOMPENSA: +35 XP (Falta)' : `${s.home.slice(0,3).toUpperCase()} <b style="color:#38bdf8">${s.hg}</b> x <b style="color:#38bdf8">${s.ag}</b> ${s.away.slice(0,3).toUpperCase()}`}
          </div>
        </div>

        <!-- STAGE DO CAMPO: BARREIRA + GOL -->
        <div id="freeKickGoalStage" style="position:relative;width:100%;height:310px;background:radial-gradient(ellipse at bottom,#15803d 0%,#0f4924 60%,#092613 100%);border:2px solid #38bdf8;border-radius:18px;overflow:hidden;box-shadow:inset 0 0 50px rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:flex-end">
          
          <!-- BALIZA DE FUTEBOL NO FUNDO -->
          <div style="position:absolute;top:28px;width:76%;height:210px;border-top:8px solid #f8fafc;border-left:8px solid #f8fafc;border-right:8px solid #f8fafc;background:repeating-linear-gradient(0deg,transparent,transparent 12px,rgba(255,255,255,0.08) 12px,rgba(255,255,255,0.08) 13px),repeating-linear-gradient(90deg,transparent,transparent 12px,rgba(255,255,255,0.08) 12px,rgba(255,255,255,0.08) 13px)">
            
            <!-- GOLEIRO NO CANTO DO GOL -->
            <div id="freeKickGkSprite" style="position:absolute;bottom:0;right:18%;width:60px;height:115px;transition:all 0.45s ease;display:flex;flex-direction:column;align-items:center">
              <div style="width:18px;height:18px;background:#fed7aa;border-radius:50%"></div>
              <div style="width:36px;height:50px;background:#eab308;border-radius:8px"></div>
              <div style="display:flex;gap:4px"><div style="width:10px;height:32px;background:#0f172a"></div><div style="width:10px;height:32px;background:#0f172a"></div></div>
            </div>
          </div>

          <!-- BARREIRA DEFENSIVA COM 4 JOGADORES -->
          <div id="freeKickWall" style="position:absolute;bottom:85px;left:34%;display:flex;gap:4px;transition:all 0.3s ease;z-index:15">
            ${[1,2,3,4].map(() => `
              <div style="width:32px;height:95px;background:#1e3a8a;border-radius:8px;border:1px solid #3b82f6;display:flex;flex-direction:column;align-items:center">
                <div style="width:14px;height:14px;background:#fed7aa;border-radius:50%;margin-top:2px"></div>
                <div style="width:24px;height:40px;background:#1d4ed8;border-radius:6px;margin-top:2px"></div>
                <div style="display:flex;gap:2px;margin-top:2px"><div style="width:8px;height:28px;background:#0f172a"></div><div style="width:8px;height:28px;background:#0f172a"></div></div>
              </div>
            `).join('')}
          </div>

          <!-- BOLA DE FUTEBOL NA MARCA DA FALTA -->
          <div id="freeKickBallSprite" style="position:absolute;bottom:18px;left:50%;transform:translateX(-50%);width:26px;height:26px;background:radial-gradient(circle at 35% 35%,#fff 0%,#cbd5e1 60%,#0f172a 100%);border-radius:50%;z-index:20;transition:all 0.65s cubic-bezier(0.15, 0.7, 0.2, 1)"></div>

          <!-- RESULTADO DO LANCE -->
          <div id="freeKickOutcomeBanner" style="display:none;position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);background:rgba(2,6,23,0.96);border:3px solid #38bdf8;padding:16px 36px;border-radius:18px;text-align:center;box-shadow:0 0 40px rgba(56,189,248,0.6);z-index:30">
            <div id="freeKickOutcomeIcon" style="font-size:44px;margin-bottom:6px">⚽</div>
            <div id="freeKickOutcomeTitle" style="font-size:24px;font-weight:900;letter-spacing:1px;color:#38bdf8">GOLAÇO DE FALTA!</div>
            <div id="freeKickOutcomeDesc" style="font-size:13px;color:#cbd5e1;margin-top:4px">No ângulo, sem chances para o goleiro!</div>
          </div>
        </div>

        <!-- 3 OPÇÕES TÁTICAS DE BATIDA DE FALTA -->
        <div style="margin-top:18px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <button type="button" class="btn-fk-option" data-option="curve" style="background:#1e1b4b;border:2px solid #a855f7;padding:12px;border-radius:14px;color:#fff;text-align:left;cursor:pointer;transition:transform 0.15s ease">
            <div style="font-size:16px;font-weight:900;color:#c084fc">🎯 Curva por Cima da Barreira</div>
            <div style="font-size:11px;color:#cbd5e1;margin-top:4px">Chapa colocada buscando a gaveta no ângulo oposto ao goleiro.</div>
          </button>

          <button type="button" class="btn-fk-option" data-option="power" style="background:#18181b;border:2px solid #f59e0b;padding:12px;border-radius:14px;color:#fff;text-align:left;cursor:pointer;transition:transform 0.15s ease">
            <div style="font-size:16px;font-weight:900;color:#fcd34d">⚡ Pancada no Canto Aberto</div>
            <div style="font-size:11px;color:#cbd5e1;margin-top:4px">Bomba seca de peito de pé testando os reflexos do goleiro.</div>
          </button>

          <button type="button" class="btn-fk-option" data-option="under" style="background:#052e16;border:2px solid #22c55e;padding:12px;border-radius:14px;color:#fff;text-align:left;cursor:pointer;transition:transform 0.15s ease">
            <div style="font-size:16px;font-weight:900;color:#86efac">👟 Rasteira por Baixo</div>
            <div style="font-size:11px;color:#cbd5e1;margin-top:4px">Bate rasteiro surpreendendo se a barreira saltar no tempo da bola!</div>
          </button>
        </div>

        <div style="margin-top:14px;display:flex;justify-content:flex-end">
          <button type="button" id="btnContinueAfterFreeKick" style="display:none;background:linear-gradient(135deg,#38bdf8 0%,#0284c7 100%);color:#000;font-size:14px;font-weight:900;padding:10px 24px;border-radius:10px;border:none;cursor:pointer">
            CONTINUAR A PARTIDA ➔
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    let isExecutingFk = false;
    const fkOptions = overlay.querySelectorAll('.btn-fk-option');
    fkOptions.forEach(btn => {
      btn.onclick = () => {
        if(isExecutingFk) return;
        isExecutingFk = true;
        fkOptions.forEach(b => { b.style.pointerEvents = 'none'; b.style.opacity = '0.5'; });
        executeInteractiveFreeKick(btn.dataset.option);
      };
    });

    function executeInteractiveFreeKick(option){
      const wall = overlay.querySelector('#freeKickWall');
      const ball = overlay.querySelector('#freeKickBallSprite');
      const gkSprite = overlay.querySelector('#freeKickGkSprite');
      const banner = overlay.querySelector('#freeKickOutcomeBanner');
      const btnCont = overlay.querySelector('#btnContinueAfterFreeKick');

      const wallJumps = Math.random() < 0.65;
      if(wallJumps){
        wall.style.transform = 'translateY(-30px)';
      }

      let isGoal = false;
      let isSave = false;
      let isWall = false;

      const kickerOvr = kicker.overall || 70;

      if(option === 'curve'){
        // Curva no ângulo
        ball.style.bottom = '82%';
        ball.style.left = '28%';
        ball.style.width = '16px';
        ball.style.height = '16px';

        gkSprite.style.transform = 'translateX(-120px) translateY(-40px)';

        if(Math.random() < 0.35 + (kickerOvr - 65) * 0.015){
          isGoal = true;
        } else if(Math.random() < 0.70){
          isSave = true;
        } else {
          isWall = true;
        }
      } else if(option === 'power'){
        // Pancada no canto
        ball.style.bottom = '65%';
        ball.style.left = '74%';
        ball.style.width = '16px';
        ball.style.height = '16px';

        gkSprite.style.transform = 'translateX(20px) translateY(-10px)';

        if(Math.random() < 0.28 + (kickerOvr - 65) * 0.015){
          isGoal = true;
        } else {
          isSave = true;
        }
      } else {
        // Rasteira por baixo
        ball.style.bottom = '30%';
        ball.style.left = '42%';
        ball.style.width = '18px';
        ball.style.height = '18px';

        if(wallJumps){
          isGoal = true;
        } else {
          isWall = true;
        }
      }

      // Se for modo treino prático, dispara imediatamente o consumo da carga anti-glitch e cálculo de XP
      let trainingResult = null;
      if(s.isTraining && typeof s.onShotExecuted === 'function'){
        try { trainingResult = s.onShotExecuted(isGoal); } catch(err) { console.error('Erro ao executar treino pratico:', err); }
      }

      setTimeout(() => {
        banner.style.display = 'block';
        btnCont.style.display = 'inline-block';

        if(s.isTraining){
          btnCont.textContent = 'CONCLUIR TREINO ➔';
          if(isGoal){
            if(window.afmAudio){
              window.afmAudio.playSFX('goal_celebration');
            } else if(typeof window.playCheerSound === 'function'){
              window.playCheerSound();
            }
            banner.style.borderColor = '#10b981';
            banner.querySelector('#freeKickOutcomeIcon').textContent = '⚽';
            banner.querySelector('#freeKickOutcomeTitle').textContent = 'GOLAÇO NO TREINO!';
            banner.querySelector('#freeKickOutcomeTitle').style.color = '#10b981';
            const remainingCount = trainingResult ? trainingResult.remainingToday : Math.max(0, 3 - (s.trainingAttempt || 1));
            banner.querySelector('#freeKickOutcomeDesc').textContent = `⚽ GOLAÇO NO TREINO! Você ganhou +35 XP em Finalização & Evolution!${trainingResult?.gainedAttributePoint ? ' ⭐ VOCÊ SUBIU DE NÍVEL E GANHOU 1 PONTO LIVRE!' : ''} (Restam ${remainingCount}/3 treinos hoje)`;
          } else {
            banner.style.borderColor = '#ef4444';
            banner.querySelector('#freeKickOutcomeIcon').textContent = isSave ? '🧤' : '🧱';
            banner.querySelector('#freeKickOutcomeTitle').textContent = isSave ? 'DEFENDEU NO TREINO!' : 'NA BARREIRA / PARA FORA!';
            banner.querySelector('#freeKickOutcomeTitle').style.color = '#ef4444';
            const remainingCount = trainingResult ? trainingResult.remainingToday : Math.max(0, 3 - (s.trainingAttempt || 1));
            banner.querySelector('#freeKickOutcomeDesc').textContent = `🧤 DEFENDEU / PARA FORA! Você ganhou apenas +5 XP pela tentativa. Restam ${remainingCount}/3 treinos hoje.`;
          }
        } else if(isGoal){
          if(window.afmAudio){
            window.afmAudio.playSFX('goal_celebration');
            window.afmAudio.boostCrowdCheer(4);
          } else if(typeof window.playCheerSound === 'function'){
            window.playCheerSound();
          }

          banner.style.borderColor = '#10b981';
          banner.querySelector('#freeKickOutcomeIcon').textContent = '⚽';
          banner.querySelector('#freeKickOutcomeTitle').textContent = 'GOLAÇO DE FALTA!';
          banner.querySelector('#freeKickOutcomeTitle').style.color = '#10b981';
          banner.querySelector('#freeKickOutcomeDesc').textContent = `${kicker.name} acerta cobrança memorável e estufa a rede!`;

          if(isHomeAttacking){ s.hg++; s.stats.targetH++; } else { s.ag++; s.stats.targetA++; }
          if(isHomeAttacking) s.stats.shotsH++; else s.stats.shotsA++;

          s.events.unshift({
            min,
            type: 'gol',
            teamId: attTeam,
            playerId: kicker.id,
            pattern: 'Falta Direta',
            text: `🎯 GOLAÇO DE FALTA! ${kicker.name} acerta uma curva espetacular e marca para o ${attTeam}!`,
            xG: 0.15,
            scorer: kicker.name
          });
          s.lastScorer = kicker;

          if(kicker.isControlledAthlete && window.state?.playerCareerState){
            window.state.playerCareerState.careerStats.goals = (window.state.playerCareerState.careerStats.goals || 0) + 1;
            window.state.playerCareerState.managerTrust = Math.min(100, (window.state.playerCareerState.managerTrust || 35) + 3);
          }
        } else if(isSave){
          if(window.afmAudio) window.afmAudio.playSFX('crowd_gasp');
          banner.style.borderColor = '#38bdf8';
          banner.querySelector('#freeKickOutcomeIcon').textContent = '🧤';
          banner.querySelector('#freeKickOutcomeTitle').textContent = 'ESPALMA O GOLEIRO!';
          banner.querySelector('#freeKickOutcomeTitle').style.color = '#38bdf8';
          banner.querySelector('#freeKickOutcomeDesc').textContent = `${gk.name} voa no canto e joga para escanteio!`;

          if(isHomeAttacking) { s.stats.targetH++; s.stats.cornersH++; }
          else { s.stats.targetA++; s.stats.cornersA++; }

          s.events.unshift({
            min,
            type: 'save',
            text: `🧤 DEFESA! ${gk.name} salta com firmeza e espalma falta venenosa de ${kicker.name}!`
          });
        } else {
          banner.style.borderColor = '#f59e0b';
          banner.querySelector('#freeKickOutcomeIcon').textContent = '🛡️';
          banner.querySelector('#freeKickOutcomeTitle').textContent = 'TRAVADO NA BARREIRA!';
          banner.querySelector('#freeKickOutcomeTitle').style.color = '#f59e0b';
          banner.querySelector('#freeKickOutcomeDesc').textContent = 'A barreira defensiva subiu junta e bloqueou o chute!';

          s.events.unshift({
            min,
            type: 'whistle',
            text: `⚠️ Falta perigosa cobrada por ${kicker.name} explode no peito da barreira.`
          });
        }

        if(typeof window.updateScoreDisplay === 'function') window.updateScoreDisplay();
        if(typeof window.updateLiveSidebarEvents === 'function') window.updateLiveSidebarEvents();
      }, 650);

      btnCont.onclick = () => {
        overlay.remove();
        s.playing = true;
        if(typeof onDone === 'function') onDone({ isGoal, isSave, isWall });
      };
    }
  }

  // Exporta o sistema globalmente
  window.AFM_InteractiveSetPieces = {
    openPenaltyModal,
    openFreeKickModal,
    TARGET_ZONES
  };

})(typeof window !== 'undefined' ? window : globalThis);
