/**
 * Aquino Futebol Manager 2026 — Novo Sistema de Treino Interativo
 * Abas: Equipa A (Titulares) | Equipa B (Reservas) | Juventude (Base)
 * Slots de Exercícios com Desbloqueio Gradual por Nível de CT (1 a 8)
 * Condução Manual (100% XP) e Preparador Físico Automático (50% XP)
 */

(function (window) {
  'use strict';

  let currentSubTab = 'equipaA'; // 'equipaA', 'equipaB', 'juventude'
  let activeSlots = null;

  const TRAINING_EXERCISES = [
    {
      id: 'physical',
      name: 'Físico & Resistência',
      icon: '⚡',
      desc: 'Melhora fôlego, fitness (+2% a +4%) e resistência a lesões',
      targetPositions: ['ALL'],
      baseXP: [10, 16],
      fitnessGain: [2, 4],
      chemGain: 0
    },
    {
      id: 'finishing',
      name: 'Finalização & Ataque',
      icon: '⚽',
      desc: 'Chutes a gol, cabeceio e infiltração para atacantes e pontas',
      targetPositions: ['ST', 'CF', 'RW', 'LW', 'ATA', 'PD', 'PE'],
      baseXP: [12, 18],
      fitnessGain: [1, 2],
      chemGain: 0
    },
    {
      id: 'defensive',
      name: 'Organização Defensiva',
      icon: '🛡️',
      desc: 'Linha de impedimento, desarmes e combate para zaga e laterais',
      targetPositions: ['CB', 'LB', 'RB', 'ZAG', 'LE', 'LD', 'DM', 'VOL'],
      baseXP: [12, 18],
      fitnessGain: [1, 2],
      chemGain: 0
    },
    {
      id: 'passing',
      name: 'Passe & Visão de Jogo',
      icon: '🎯',
      desc: 'Roda de bobo, transição veloz e lançamentos para meio-campistas',
      targetPositions: ['CM', 'AM', 'DM', 'VOL', 'MEI', 'MC', 'CAM'],
      baseXP: [12, 18],
      fitnessGain: [1, 2],
      chemGain: 0
    },
    {
      id: 'goalkeeper',
      name: 'Treino de Goleiros',
      icon: '🥅',
      desc: 'Reflexos, saídas do gol, quedas laterais e reposição de bola',
      targetPositions: ['GK', 'GOLEIRO'],
      baseXP: [14, 20],
      fitnessGain: [1, 2],
      chemGain: 0
    },
    {
      id: 'setpieces',
      name: 'Bolas Paradas & Cruzamentos',
      icon: '📐',
      desc: 'Cobranças de falta, pênaltis, escanteios e entrosamento tático',
      targetPositions: ['ALL'],
      baseXP: [10, 15],
      fitnessGain: [1, 2],
      chemGain: 1
    }
  ];

  // Regra de desbloqueio de slots por nível do CT:
  // Slot 1: Nível 1
  // Slot 2: Nível 1
  // Slot 3: Nível 2
  // Slot 4: Nível 4
  // Slot 5: Nível 6
  // Slot 6: Nível 8
  const SLOT_LEVEL_REQUIREMENTS = [1, 1, 2, 4, 6, 8];

  function getCTLevel(state) {
    if (!state) return 1;
    const infraLvl = state.infrastructure?.training?.level;
    const cfgLvl = state.trainingConfig?.level;
    return Math.max(1, Number(infraLvl || cfgLvl || 1));
  }

  function getPosBadgeColor(pos) {
    const p = String(pos || '').toUpperCase();
    if (/^(GK|GOLEIRO)$/.test(p)) return '#eab308'; // Amarelo
    if (/^(CB|LB|RB|ZAG|LE|LD|DEF)$/.test(p)) return '#38bdf8'; // Azul
    if (/^(CM|AM|DM|VOL|MEI|MC|ME|MD|CAM|CDM)$/.test(p)) return '#22c55e'; // Verde
    return '#f43f5e'; // Vermelho (Ataque)
  }

  function getPlayerOvr(p) {
    if (!p) return 60;
    if (typeof window.playerOverall === 'function') return window.playerOverall(p);
    return Number(p.overall || p.ovr || p.fc || p.pes) || 60;
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initDefaultSlots(state) {
    if (!state) return;
    if (Array.isArray(state.lastTrainingSetup) && state.lastTrainingSetup.length === 6) {
      activeSlots = [...state.lastTrainingSetup];
    } else {
      activeSlots = [
        'physical',   // Slot 1: Físico
        'passing',    // Slot 2: Passe
        'finishing',  // Slot 3: Finalização
        'defensive',  // Slot 4: Defesa
        'setpieces',  // Slot 5: Bolas Paradas
        'goalkeeper'  // Slot 6: Goleiros
      ];
      state.lastTrainingSetup = [...activeSlots];
    }
  }

  function openTrainingCenterModal() {
    const state = window.state;
    if (!state) {
      if (typeof window.toast === 'function') window.toast('Inicie uma carreira para acessar o Centro de Treinamento.');
      return;
    }

    initDefaultSlots(state);

    let container = document.getElementById('trainingCenterModalContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'trainingCenterModalContainer';
      document.body.appendChild(container);
    }

    renderModal(container);
  }

  function renderModal(container) {
    const state = window.state;
    if (!state || !container) return;

    const ctLvl = getCTLevel(state);
    const clubName = state.club || 'Seu Clube';
    const isTrainedToday = state.lastManualTrainingDate === state.date;

    container.innerHTML = `
      <div class="visual-modal-overlay training-modal-overlay" id="trainingModalOverlay">
        <div class="visual-modal-card training-modal-card" style="width: 96vw; max-width: 1280px; height: 90vh; display: grid; grid-template-columns: 1fr 420px; background: #0b0918; border: 1px solid rgba(16,185,129,0.4); border-radius: 20px; box-shadow: 0 25px 70px rgba(0,0,0,0.9), 0 0 35px rgba(16,185,129,0.2); overflow: hidden;">
          
          <!-- ================= LADO ESQUERDO: TABELA DE JOGADORES (EQUIPA A, B, JUVENTUDE) ================= -->
          <div style="display: flex; flex-direction: column; background: #0e0b1d; border-right: 1px solid rgba(255,255,255,0.08); overflow: hidden;">
            
            <!-- TOPO DO LADO ESQUERDO: TÍTULO E ABAS -->
            <div style="padding: 16px 20px; background: linear-gradient(90deg, #15112e, #0f0c22); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 22px;">⚽</span>
                <div>
                  <div style="font-size: 10px; font-weight: 800; color: #10b981; letter-spacing: 1px; text-transform: uppercase;">CENTRO DE TREINAMENTO</div>
                  <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #fff;">${esc(clubName)}</h2>
                </div>
              </div>

              <!-- ABAS: EQUIPA A, EQUIPA B, JUVENTUDE (SCREENSHOT OFICIAL) -->
              <div style="display: flex; gap: 6px; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                <button class="btn btnTrainingSubTab ${currentSubTab === 'equipaA' ? 'active' : ''}" data-subtab="equipaA" style="border: none; padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 6px; cursor: pointer; transition: all 0.2s; ${currentSubTab === 'equipaA' ? 'background: #10b981; color: #000;' : 'background: transparent; color: #94a3b8;'}">
                  Equipa A (Titulares)
                </button>
                <button class="btn btnTrainingSubTab ${currentSubTab === 'equipaB' ? 'active' : ''}" data-subtab="equipaB" style="border: none; padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 6px; cursor: pointer; transition: all 0.2s; ${currentSubTab === 'equipaB' ? 'background: #10b981; color: #000;' : 'background: transparent; color: #94a3b8;'}">
                  Equipa B (Reservas)
                </button>
                <button class="btn btnTrainingSubTab ${currentSubTab === 'juventude' ? 'active' : ''}" data-subtab="juventude" style="border: none; padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 6px; cursor: pointer; transition: all 0.2s; ${currentSubTab === 'juventude' ? 'background: #10b981; color: #000;' : 'background: transparent; color: #94a3b8;'}">
                  Juventude
                </button>
              </div>
            </div>

            <!-- TABELA DE ATLETAS COM RATING (+0.10), CHEMISTRY (+1) E FITNESS (+2%) -->
            <div style="flex: 1; overflow-y: auto; padding: 12px 18px;" id="trainingPlayersListContainer">
              ${renderPlayersTable(state, currentSubTab)}
            </div>

            <!-- RODAPÉ INFORMATIVO DA ESQUERDA -->
            <div style="padding: 10px 18px; background: #0c0919; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8;">
              <span>💡 Atletas ganham XP diário com os exercícios e evoluem o Overall no CT</span>
              <span style="color: #10b981; font-weight: 800;">Data: ${formatDatePtBrSafe(state.date)}</span>
            </div>

          </div>

          <!-- ================= LADO DIREITO: EXERCÍCIOS DE TREINAMENTO (6 SLOTS) ================= -->
          <div style="display: flex; flex-direction: column; background: #110d22; padding: 20px; overflow-y: auto;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span style="font-size: 10px; font-weight: 800; color: #10b981; letter-spacing: 0.8px; text-transform: uppercase;">PLANO DE TREINAMENTO</span>
                <h3 style="margin: 2px 0 0 0; font-size: 18px; font-weight: 900; color: #fff; text-transform: uppercase;">Exercícios de treinamento</h3>
              </div>
              <button class="btn" id="btnCloseTrainingModal" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #fff; width: 32px; height: 32px; border-radius: 8px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
            </div>

            <!-- STATUS DO NÍVEL DO CT -->
            <div style="background: #17122e; border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">INSTALAÇÃO ATUAL</div>
                <div style="font-size: 14px; font-weight: 900; color: #10b981; margin-top: 2px;">
                  🏢 CT Nível ${ctLvl} · ${getCTLabel(ctLvl)}
                </div>
              </div>
              <div style="text-align: right;">
                <span style="background: rgba(16,185,129,0.15); color: #10b981; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.4);">
                  ${countUnlockedSlots(ctLvl)}/6 Slots Ativos
                </span>
              </div>
            </div>

            <!-- LISTAGEM DOS 6 SLOTS DE EXERCÍCIO COM CADEADOS (SCREENSHOT OFICIAL) -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              ${[0, 1, 2, 3, 4, 5].map(idx => renderExerciseSlot(idx, ctLvl)).join('')}
            </div>

            <!-- STATUS DO TREINO DO DIA E BOTÃO INICIAR TREINO -->
            <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08);">
              ${isTrainedToday ? `
                <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; text-align: center;">
                  <div style="font-size: 11px; font-weight: 900; color: #10b981;">✓ SESSÃO CONCLUÍDA HOJE</div>
                  <div style="font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 2px;">O elenco já treinou no dia. Uma nova sessão estará disponível no próximo dia de calendário ou partida.</div>
                </div>
                <button class="btn" disabled style="width: 100%; padding: 12px; font-size: 13px; font-weight: 900; border-radius: 10px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); border: none; cursor: not-allowed;">
                  ✓ TREINO CONCLUÍDO HOJE
                </button>
              ` : `
                <div style="background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; font-size: 11px; color: rgba(255,255,255,0.8);">
                  ⏰ <b>Sessão Diária:</b> Treine com seus atletas agora para ganhar <b>100% de XP</b>. Se você avançar sem treinar, o preparador físico conduzirá o treino com <b>50% de XP</b>.
                </div>
                <button class="btn" id="btnExecuteManualTraining" style="width: 100%; padding: 14px; font-size: 14px; font-weight: 900; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(16,185,129,0.4); transition: transform 0.15s ease;">
                  ▶ INICIAR TREINO
                </button>
              `}
            </div>

          </div>

        </div>
      </div>
    `;

    bindModalEvents(container);
  }

  function getCTLabel(lvl) {
    if (lvl <= 1) return 'Básico';
    if (lvl <= 2) return 'Intermediário';
    if (lvl <= 4) return 'Avançado';
    if (lvl <= 6) return 'Profissional';
    return 'Elite Mundial';
  }

  function countUnlockedSlots(ctLvl) {
    return SLOT_LEVEL_REQUIREMENTS.filter(req => ctLvl >= req).length;
  }

  function formatDatePtBrSafe(dateStr) {
    if (!dateStr) return '18/01/2026';
    if (typeof window.formatDatePtBr === 'function') return window.formatDatePtBr(dateStr);
    return dateStr;
  }

  // =========================================================================
  // RENDERIZAÇÃO DA TABELA DE ATLETAS (COLUNAS: PLAYER, RATING, CHEMISTRY, FITNESS)
  // =========================================================================
  function renderPlayersTable(state, subTab) {
    const squad = Array.isArray(state.squad) ? state.squad.filter(Boolean) : [];
    const lineupKeys = Array.isArray(state.lineup) ? state.lineup : [];
    
    let athletes = [];
    if (subTab === 'equipaA') {
      // Titulares na escalação atual
      athletes = lineupKeys.map(k => squad.find(p => (typeof window.playerKey === 'function' ? window.playerKey(p) : p.name) === k)).filter(Boolean);
      if (athletes.length === 0) athletes = squad.slice(0, 11);
    } else if (subTab === 'equipaB') {
      // Reservas do elenco principal
      const starterSet = new Set(lineupKeys);
      athletes = squad.filter(p => !starterSet.has(typeof window.playerKey === 'function' ? window.playerKey(p) : p.name));
    } else if (subTab === 'juventude') {
      // Jovens do clube (base ou <= 20 anos)
      const baseAthletes = Array.isArray(state.youthAcademy) ? state.youthAcademy : [];
      const squadYouth = squad.filter(p => Number(p.age) <= 20);
      athletes = [...squadYouth, ...baseAthletes];
    }

    if (athletes.length === 0) {
      return `
        <div style="padding: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
          Nenhum jogador encontrado nesta categoria.
        </div>
      `;
    }

    return `
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 11px; text-transform: uppercase;">
            <th style="text-align: left; padding: 8px 10px;">Player</th>
            <th style="text-align: center; padding: 8px 10px; width: 100px;">Rating</th>
            <th style="text-align: center; padding: 8px 10px; width: 90px;">Chemistry</th>
            <th style="text-align: center; padding: 8px 10px; width: 90px;">Fitness</th>
          </tr>
        </thead>
        <tbody>
          ${athletes.map(p => renderPlayerTrainingRow(p)).join('')}
        </tbody>
      </table>
    `;
  }

  function renderPlayerTrainingRow(p) {
    const ovr = getPlayerOvr(p);
    const badgeBg = getPosBadgeColor(p.pos);
    const photoHtml = (typeof window.playerPhoto === 'function') 
      ? window.playerPhoto(p, 36) 
      : `<div style="width:36px;height:36px;border-radius:50%;background:#1e1838;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;">${p.name?.[0]||'P'}</div>`;

    // Chemistry e Fitness com os ganhos das imagens oficiais (ex: 60 +1, 88% +2%)
    const chemistry = Math.min(100, Math.max(30, Number(p.chemistry || p.morale || 65)));
    const fitness = Math.min(100, Math.max(40, Math.round(p.fitness ?? p.stamina ?? 90)));
    const recentXpGain = p.lastTrainingGain || '+0.10';

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
        
        <!-- COLUNA PLAYER: BADGE DE POSIÇÃO + FOTO + NOME -->
        <td style="padding: 8px 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="position: relative;">
              ${photoHtml}
              <span style="position: absolute; bottom: -2px; right: -2px; background: ${badgeBg}; color: #000; font-size: 8.5px; font-weight: 900; padding: 1px 4px; border-radius: 4px; line-height: 1;">${esc(p.pos || 'MEI')}</span>
            </div>
            <div>
              <b style="color: #fff; font-size: 13px;">${esc(p.name)}</b>
              <div style="font-size: 10px; color: #94a3b8;">${p.age || 24} anos · POT: ${p.potential || ovr}</div>
            </div>
          </div>
        </td>

        <!-- COLUNA RATING: OVR + SETINHA VERDE DE EVOLUÇÃO -->
        <td style="text-align: center; padding: 8px 10px;">
          <div style="display: inline-flex; align-items: baseline; gap: 4px;">
            <b style="font-size: 15px; font-weight: 900; color: #fff;">${ovr}</b>
            <span style="font-size: 10px; font-weight: 800; color: #22c55e;">↗ ${recentXpGain}</span>
          </div>
        </td>

        <!-- COLUNA CHEMISTRY: VALOR + ANEL AZUL + INDICADOR +1 -->
        <td style="text-align: center; padding: 8px 10px;">
          <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.3); padding: 3px 8px; border-radius: 6px;">
            <b style="font-size: 12px; font-weight: 900; color: #38bdf8;">${chemistry}</b>
            <span style="font-size: 9px; font-weight: 900; color: #38bdf8;">+1</span>
          </div>
        </td>

        <!-- COLUNA FITNESS: PORCENTAGEM + ANEL VERDE + INDICADOR +2% -->
        <td style="text-align: center; padding: 8px 10px;">
          <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); padding: 3px 8px; border-radius: 6px;">
            <b style="font-size: 12px; font-weight: 900; color: #4ade80;">${fitness}%</b>
            <span style="font-size: 9px; font-weight: 900; color: #4ade80;">+2%</span>
          </div>
        </td>

      </tr>
    `;
  }

  // =========================================================================
  // RENDERIZAÇÃO DOS 6 SLOTS DE EXERCÍCIOS COM CADEADOS
  // =========================================================================
  function renderExerciseSlot(slotIndex, ctLvl) {
    const reqLevel = SLOT_LEVEL_REQUIREMENTS[slotIndex];
    const isUnlocked = ctLvl >= reqLevel;
    const selectedExerciseId = activeSlots[slotIndex] || TRAINING_EXERCISES[slotIndex % TRAINING_EXERCISES.length].id;
    const ex = TRAINING_EXERCISES.find(e => e.id === selectedExerciseId) || TRAINING_EXERCISES[0];

    if (!isUnlocked) {
      // Slot Bloqueado com Cadeado
      return `
        <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.12); border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; opacity: 0.65;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #94a3b8;">
            🔒
          </div>
          <div style="flex: 1;">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">SLOT ${slotIndex + 1} BLOQUEADO</div>
            <div style="font-size: 12px; font-weight: 900; color: #e2e8f0; margin-top: 1px;">Desbloqueia com CT Nível ${reqLevel}</div>
            <div style="font-size: 10px; color: #64748b;">Acesse Estrutura & Estádio para ampliar as instalações</div>
          </div>
        </div>
      `;
    }

    // Slot Liberado: permite escolher o exercício
    return `
      <div style="background: #17132c; border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10px; font-weight: 900; color: #a78bfa; text-transform: uppercase;">SLOT ${slotIndex + 1} ATIVO</span>
          <span style="font-size: 10px; font-weight: 800; color: #10b981;">✓ Liberado</span>
        </div>

        <select class="btn selTrainingExercise" data-slot="${slotIndex}" style="width: 100%; padding: 8px 10px; background: #0f0c22; color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer;">
          ${TRAINING_EXERCISES.map(e => `
            <option value="${e.id}" ${e.id === ex.id ? 'selected' : ''}>
              ${e.icon} ${e.name}
            </option>
          `).join('')}
        </select>

        <div style="font-size: 10.5px; color: #94a3b8; line-height: 1.3;">
          ${ex.desc}
        </div>
      </div>
    `;
  }

  function bindModalEvents(container) {
    const closeBtn = container.querySelector('#btnCloseTrainingModal');
    if (closeBtn) closeBtn.onclick = () => container.remove();

    const overlay = container.querySelector('#trainingModalOverlay');
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) container.remove();
      };
    }

    container.querySelectorAll('.btnTrainingSubTab').forEach(btn => {
      btn.onclick = () => {
        currentSubTab = btn.dataset.subtab;
        renderModal(container);
      };
    });

    container.querySelectorAll('.selTrainingExercise').forEach(sel => {
      sel.onchange = () => {
        const slotIdx = Number(sel.dataset.slot);
        activeSlots[slotIdx] = sel.value;
        if (window.state) {
          window.state.lastTrainingSetup = [...activeSlots];
          if (typeof window.save === 'function') window.save();
        }
        renderModal(container);
      };
    });

    const btnExec = container.querySelector('#btnExecuteManualTraining');
    if (btnExec) {
      btnExec.onclick = () => {
        executeTrainingSession(false, container);
      };
    }

    const keydownHandler = (e) => {
      if (e.key === 'Escape') {
        container.remove();
        document.removeEventListener('keydown', keydownHandler);
      }
    };
    document.addEventListener('keydown', keydownHandler);
  }

  // =========================================================================
  // EXECUÇÃO DO TREINO (MANUAL COM O USUÁRIO = 100% XP; COM PREPARADOR = 50% XP)
  // =========================================================================
  function executeTrainingSession(isAutoFitnessCoach = false, containerToUpdate = null) {
    const state = window.state;
    if (!state || !Array.isArray(state.squad)) return { totalXP: 0, updatedPlayers: [] };

    const ctLvl = getCTLevel(state);
    const unlockedCount = countUnlockedSlots(ctLvl);
    initDefaultSlots(state);

    // Seleciona os exercícios ativos nos slots liberados
    const activeExercises = activeSlots.slice(0, unlockedCount).map(id => TRAINING_EXERCISES.find(e => e.id === id)).filter(Boolean);

    // Multiplicador de XP: 100% no manual; 50% com preparador físico automático
    const coachMult = isAutoFitnessCoach ? 0.50 : 1.0;

    let totalSquadXP = 0;
    const levelUps = [];

    state.squad.forEach(p => {
      if (!p) return;
      if (window.AFM_PlayerXPEvolution && typeof window.AFM_PlayerXPEvolution.initPlayerXP === 'function') {
        window.AFM_PlayerXPEvolution.initPlayerXP(p, state);
      }

      // Base aleatória e balanceada de XP (entre 8 e 16 XP)
      let playerGainXP = Math.floor(Math.random() * 9) + 8; // 8 a 16

      // Bônus se o jogador atuar no setor de algum exercício ativo
      const pos = String(p.pos || '').toUpperCase();
      let hasPositionBonus = false;
      activeExercises.forEach(ex => {
        if (ex.targetPositions.includes('ALL') || ex.targetPositions.includes(pos)) {
          hasPositionBonus = true;
        }
      });
      if (hasPositionBonus) playerGainXP += Math.floor(Math.random() * 4) + 3; // +3 a +6

      // Bônus para jovens talentos (< 21 anos)
      if (Number(p.age) <= 21) {
        playerGainXP += Math.floor(Math.random() * 3) + 2; // +2 a +4
      }

      // Aplica o multiplicador do preparador físico se for automático (50%)
      playerGainXP = Math.max(3, Math.round(playerGainXP * coachMult));

      // Fitness e Chemistry
      p.fitness = Math.min(100, Math.round((p.fitness ?? p.stamina ?? 90) + (isAutoFitnessCoach ? 1 : 2)));
      p.chemistry = Math.min(100, Math.round((p.chemistry || p.morale || 65) + 1));
      p.lastTrainingGain = `+0.${Math.min(99, Math.round(playerGainXP * 0.9))}`;

      // Aplica XP no atleta
      p.xp = (Number(p.xp) || 0) + playerGainXP;
      if (p.monthlyEvolution) {
        p.monthlyEvolution.trainingXP = (p.monthlyEvolution.trainingXP || 0) + playerGainXP;
      }

      totalSquadXP += playerGainXP;

      // Verifica Level Up
      if (window.AFM_PlayerXPEvolution && typeof window.AFM_PlayerXPEvolution.checkLevelUp === 'function') {
        window.AFM_PlayerXPEvolution.checkLevelUp(p, state, levelUps);
      }
    });

    // Marca a data em que o treino foi realizado
    state.lastManualTrainingDate = state.date;
    state.lastTrainingSetup = [...activeSlots];

    if (typeof window.save === 'function') window.save();

    if (!isAutoFitnessCoach) {
      if (typeof window.toast === 'function') {
        window.toast(`🏋️ Treino concluído! O elenco absorveu os exercícios e ganhou XP diário.`);
      }
      if (containerToUpdate) {
        renderModal(containerToUpdate);
      }
    }

    return { totalXP: totalSquadXP, levelUps };
  }

  // =========================================================================
  // TREINAMENTO AUTOMÁTICO DO PREPARADOR FÍSICO
  // "se o usuario esquecer de treinar , deixa o preparador fisico fazer automatico
  //  com a funçoes que o usuario colocou da ultima vez , so que ele ganhar menos xp"
  // =========================================================================
  function processAutomaticFitnessCoachTraining(gameState = window.state) {
    if (!gameState || !Array.isArray(gameState.squad)) return;
    
    // Se o treino já foi realizado na data atual, não faz nada
    if (gameState.lastManualTrainingDate === gameState.date) return;

    // Executa com o preparador físico automático (50% de ganho de XP)
    const result = executeTrainingSession(true, null);

    // Registra notícia discreta e informativa no feed
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`🏃‍♂️ PREPARADOR FÍSICO: Na ausência do técnico, o treino diário foi conduzido pela comissão técnica (50% de ganho de XP).`);
    gameState.news = gameState.news.slice(0, 50);

    if (typeof window.save === 'function') window.save();
    return result;
  }

  window.openTrainingCenterModal = openTrainingCenterModal;
  window.processAutomaticFitnessCoachTraining = processAutomaticFitnessCoachTraining;
  window.AFM_TrainingCenter = {
    openTrainingModal: openTrainingCenterModal,
    executeTrainingSession,
    processAutomaticFitnessCoachTraining
  };

})(typeof window !== 'undefined' ? window : globalThis);
