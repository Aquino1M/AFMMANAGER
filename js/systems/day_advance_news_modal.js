/**
 * ==============================================================================
 * AFM MANAGER 2027 — SISTEMA OFICIAL DE NOTÍCIAS DIÁRIAS & FEED PÓS-JOGO
 * Arquivo: js/systems/day_advance_news_modal.js
 * 
 * Implementa:
 * 1. Modal "PASSANDO OS DIAS - X DE Y" com transferências reais, propostas de mercado,
 *    disciplinares e alerta de "HOJE TEM JOGO" (fiel ao layout do jogo).
 * 2. Hub Pós-Jogo permitindo ao usuário escolher dar entrevista coletiva, ver notícias
 *    ou ir direto para a Central.
 * ==============================================================================
 */

(function (window) {
  'use strict';

  const BRAZILIAN_FIRST_NAMES = [
    'Kauã', 'Léo', 'Rafael', 'Vitor', 'Vágner', 'Geovani', 'Richard', 'Glaycon',
    'Enzo', 'Gabriel', 'Rodrigo', 'Arthur', 'Felipe', 'Matheus', 'Lucas', 'Thiago',
    'Guilherme', 'Bruno', 'Nicolas', 'Gustavo', 'Luan', 'Danilo', 'Yuri', 'Igor',
    'Dudu', 'Rony', 'Everton', 'Alan', 'Murilo', 'Pedrinho', 'Wesley', 'Caio'
  ];

  const BRAZILIAN_LAST_NAMES = [
    'Oliveira', 'Aragão', 'Mariano', 'Caetano', 'Silva', 'Santos', 'Ferreira',
    'Souza', 'Almeida', 'Pereira', 'Ribeiro', 'Costa', 'Rodrigues', 'Barbosa',
    'Carvalho', 'Cardoso', 'Gomes', 'Martins', 'Melo', 'Vieira', 'Nascimento'
  ];

  const NOTABLE_CLUBS = [
    'Avaí', 'Águia Negra', 'Maguary', 'ASA', 'Vilavelhense', 'Vitória das Tabocas',
    'CRB', 'Operário-PR', 'Coruripe', 'Galvez', 'Ceará', 'Bataguassu', 'Mixto',
    'Luminense', 'Samambaia', 'Real Brasília', 'Criciúma', 'Chapecoense', 'Joinville',
    'Figueirense', 'Marcílio Dias', 'Ponte Preta', 'Guarani', 'Botafogo-SP', 'Novorizontino',
    'Mirassol', 'Ituano', 'Ferroviária', 'Portuguesa', 'Vila Nova', 'Goiás', 'Atlético-GO',
    'Cuiabá', 'Londrina', 'Paraná Clube', 'Sampaio Corrêa', 'Moto Club', 'Paysandu',
    'Remo', 'América-RN', 'ABC', 'Treze', 'Campinense', 'Confiança', 'Sergipe', 'Ypiranga-RS',
    'Caxias', 'Brasil de Pelotas', 'Pelotas', 'Volta Redonda', 'Bangu', 'Madureira'
  ];

  const MONTH_NAMES_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const WEEKDAY_NAMES_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(arr) {
    if (!arr || !arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function formatMoneyBr(val) {
    return 'R$ ' + Number(val || 0).toLocaleString('pt-BR');
  }

  function parseDateNoon(dateInput) {
    if (!dateInput) return new Date(2026, 0, 18, 12, 0, 0);
    if (dateInput instanceof Date) return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 12, 0, 0);
    const s = String(dateInput).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0);
    return new Date(2026, 0, 18, 12, 0, 0);
  }

  function formatHeadingDate(dateObj) {
    const d = parseDateNoon(dateObj);
    const dayOfWeek = WEEKDAY_NAMES_SHORT[d.getDay()];
    const day = d.getDate();
    const month = MONTH_NAMES_SHORT[d.getMonth()];
    const year = d.getFullYear();
    return `${dayOfWeek}, ${day} ${month} ${year}`;
  }

  const AFM_DayAdvanceNews = {
    formatHeadingDate,

    /**
     * Gera itens de notícias realistas para um dia específico
     */
    generateNewsForDay(dateObj, state, isMatchDay = false, matchFixture = null) {
      const items = [];
      const userClub = state?.club || 'Clube';

      // 1. Notícia de Destaque da Partida (se for dia de jogo)
      if (isMatchDay && matchFixture) {
        const homeName = (matchFixture.home || matchFixture[0] || userClub).toUpperCase();
        const awayName = (matchFixture.away || matchFixture[1] || 'ADVERSÁRIO').toUpperCase();
        items.push({
          type: 'match',
          highlight: true,
          text: `HOJE TEM JOGO · ${homeName} X ${awayName}`
        });
      }

      // 1.1 Notícia Especial de Vida do Atleta (Modo Jogador)
      if (state && state.gameMode === 'player' && state.playerCareerState) {
        const athleteName = state.playerCareerState.athleteName || 'Atleta';
        const athleteNewsTemplates = [
          `CT do ${userClub}: ${athleteName} treina forte e ganha moral com a comissão técnica`,
          `Bastidores: O jovem ${athleteName} recebe conselhos de companheiros no vestiário do ${userClub}`,
          `Imprensa destaca ritmo e dedicação de ${athleteName} nos treinamentos da semana`,
          `Torcida do ${userClub} pede sequência e protagonismo para a joia ${athleteName}`,
          `Foco total: ${athleteName} cumpre rotina física intensa e busca espaço no ${userClub}`
        ];
        items.push({
          type: 'player',
          highlight: isMatchDay,
          text: `⭐ ${pickRandom(athleteNewsTemplates)}`
        });
      }

      // 2. Notícias de Transferências / Mercado Fechado (borda roxa)
      const dealsCount = rndInt(1, 3);
      for (let i = 0; i < dealsCount; i++) {
        const pName = `${pickRandom(BRAZILIAN_FIRST_NAMES)} ${pickRandom(BRAZILIAN_LAST_NAMES)}`;
        const clubA = pickRandom(NOTABLE_CLUBS);
        let clubB = pickRandom(NOTABLE_CLUBS);
        while (clubB === clubA) clubB = pickRandom(NOTABLE_CLUBS);

        const fee = rndInt(8, 95) * 10000; // de R$ 80.000 até R$ 950.000
        const templates = [
          `Negócio fechado: ${pName} troca o ${clubA} pelo ${clubB} por ${formatMoneyBr(fee)}`,
          `${pName} deixa o ${clubA} e assina com o ${clubB} por ${formatMoneyBr(fee)}`,
          `${pName} é o novo reforço do ${clubB}: ${formatMoneyBr(fee)} pagos ao ${clubA}`
        ];
        items.push({
          type: 'deal',
          text: pickRandom(templates)
        });
      }

      // 3. Propostas / Especulações de Mercado (borda amarela/laranja)
      if (Math.random() < 0.75) {
        const pName = `${pickRandom(BRAZILIAN_FIRST_NAMES)} ${pickRandom(BRAZILIAN_LAST_NAMES)}`;
        const clubA = pickRandom(NOTABLE_CLUBS);
        const bidVal = rndInt(12, 120) * 10000;
        const bidTemplates = [
          `${clubA} quer ${pName} e põe ${formatMoneyBr(bidVal)} na mesa`,
          `${clubA} faz proposta oficial de ${formatMoneyBr(bidVal)} por ${pName}`,
          `${clubA} abre negociações para contratar ${pName} por ${formatMoneyBr(bidVal)}`
        ];
        items.push({
          type: 'bid',
          text: pickRandom(bidTemplates)
        });
      }

      // 4. Ocorrências Disciplinares / Médicas (borda vermelha)
      if (Math.random() < 0.6) {
        const pName = `${pickRandom(BRAZILIAN_FIRST_NAMES)} ${pickRandom(BRAZILIAN_LAST_NAMES)}`;
        const club = pickRandom(NOTABLE_CLUBS);
        const discTemplates = [
          `${pName} é expulso e desfalca o ${club}`,
          `${pName} recebe o 3º cartão amarelo e cumpre suspensão no ${club}`,
          `${pName} sofre estiramento e vira desfalque no ${club}`
        ];
        items.push({
          type: 'discipline',
          text: pickRandom(discTemplates)
        });
      }

      return items;
    },

    /**
     * Abre a Modal "PASSANDO OS DIAS - X DE Y" idêntica ao screenshot do usuário
     */
    openDayAdvanceModal(config = {}) {
      let modalEl = document.getElementById('afmDayAdvanceNewsModal');
      if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'afmDayAdvanceNewsModal';
        document.body.appendChild(modalEl);
      }

      const daysList = config.daysList || [];
      const totalDays = config.totalDays || daysList.length || 1;
      const currentDay = config.currentDay || totalDays;
      const onContinue = config.onContinue || (() => {});

      modalEl.innerHTML = `
        <div class="afm-advance-backdrop" style="position:fixed;inset:0;background:rgba(5,3,12,0.88);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box">
          <div class="afm-advance-card" style="background:#0e091b;border:2px solid #7c3aed;border-radius:18px;max-width:480px;width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 0 35px rgba(124,58,237,0.45), 0 20px 50px rgba(0,0,0,0.8);overflow:hidden;box-sizing:border-box">
            
            <!-- Modal Header -->
            <div style="padding:16px 20px 12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:12px;font-weight:900;letter-spacing:1px;color:#c084fc;text-transform:uppercase">
                PASSANDO OS DIAS · <span style="color:#fff">${currentDay} DE ${totalDays}</span>
              </div>
              <span class="pill" style="font-size:10px;font-weight:800;background:rgba(124,58,237,0.25);color:#a855f7;padding:3px 8px;border-radius:6px">
                AFM 2027
              </span>
            </div>

            <!-- Feed Scrollable List -->
            <div style="padding:16px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:18px;flex:1;max-height:calc(92vh - 140px)">
              ${daysList.map(day => `
                <div>
                  <!-- Day Header -->
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                    <span style="font-size:13px;font-weight:900;letter-spacing:0.8px;color:#f8fafc;text-transform:uppercase">
                      ${day.formattedDate}
                    </span>
                    <span style="font-size:11px;font-weight:600;color:${day.isMatchDay ? '#f59e0b' : '#64748b'}">
                      ${day.isMatchDay ? (day.matchCountText || '53 partidas marcadas · hoje') : 'Dia sem jogos'}
                    </span>
                  </div>

                  <!-- Day Items -->
                  <div style="display:flex;flex-direction:column;gap:6px">
                    ${day.items.map(item => {
                      if (item.type === 'match') {
                        return `
                          <div style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);border-left:4px solid #f59e0b;border-radius:8px;padding:12px 14px;color:#facc15;font-size:12px;font-weight:900;letter-spacing:0.8px;display:flex;align-items:center;gap:8px;box-shadow:0 0 12px rgba(245,158,11,0.15)">
                            <span>⚽</span>
                            <span>${item.text}</span>
                          </div>
                        `;
                      }

                      const borderCol = item.type === 'deal' 
                        ? '#8b5cf6' 
                        : (item.type === 'bid' ? '#f59e0b' : '#ef4444');

                      return `
                        <div style="background:#1a1329;border:1px solid rgba(255,255,255,0.05);border-left:4px solid ${borderCol};border-radius:8px;padding:9px 12px;color:#e2e8f0;font-size:12px;line-height:1.45;font-weight:500">
                          ${item.text}
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Footer Action Button -->
            <div style="padding:14px 18px;border-top:1px solid rgba(255,255,255,0.06);background:rgba(10,6,20,0.6)">
              <button id="btnDayAdvanceContinue" style="width:100%;background:linear-gradient(135deg,#7c3aed,#6366f1);border:1px solid #a855f7;border-radius:12px;padding:13px 20px;color:#fff;font-size:14px;font-weight:900;letter-spacing:1px;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 0 20px rgba(124,58,237,0.55);transition:all 0.15s ease">
                <span>CONTINUAR</span>
                <span style="font-size:15px">›</span>
              </button>
            </div>

          </div>
        </div>
      `;

      modalEl.style.display = 'block';

      const btnContinue = modalEl.querySelector('#btnDayAdvanceContinue');
      if (btnContinue) {
        btnContinue.onclick = () => {
          modalEl.style.display = 'none';
          if (typeof onContinue === 'function') {
            try { onContinue(); } catch (err) { console.error('Erro no callback onContinue:', err); }
          }
        };
      }
    },

    /**
     * Hub Pós-Jogo: Pop oficial exibido imediatamente após o fim da partida,
     * permitindo ao usuário escolher dar entrevista coletiva, ver notícias ou ir para a central.
     */
    openPostMatchHubModal(userRes, callbacks = {}) {
      let modalEl = document.getElementById('afmPostMatchHubModal');
      if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'afmPostMatchHubModal';
        document.body.appendChild(modalEl);
      }

      const h = userRes?.h || 'Mandante';
      const a = userRes?.a || 'Visitante';
      const hg = userRes?.hg ?? 0;
      const ag = userRes?.ag ?? 0;
      const userClub = (typeof window !== 'undefined' && window.state ? window.state.club : h);
      const isUserHome = (typeof window.norm === 'function' ? window.norm(userClub) === window.norm(h) : userClub.toLowerCase() === h.toLowerCase());
      const userGoals = isUserHome ? hg : ag;
      const oppGoals = isUserHome ? ag : hg;
      const isPlayerMode = window.state?.gameMode === 'player' || Boolean(window.state?.playerCareerState);

      let resultBadge = '';
      let resultBadgeClass = '';
      if (userGoals > oppGoals) {
        resultBadge = '🟢 VITÓRIA SENSACIONAL!';
        resultBadgeClass = 'color:#22c55e;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3)';
      } else if (userGoals === oppGoals) {
        resultBadge = '⚪ EMPATE DISPUTADO';
        resultBadgeClass = 'color:#38bdf8;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3)';
      } else {
        resultBadge = '🔴 DERROTA AMARGA';
        resultBadgeClass = 'color:#ef4444;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3)';
      }

      modalEl.innerHTML = `
        <div class="afm-postmatch-backdrop" style="position:fixed;inset:0;background:rgba(4,3,10,0.88);backdrop-filter:blur(10px);z-index:999998;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box">
          <div class="afm-postmatch-card" style="background:#0e091b;border:2px solid #7c3aed;border-radius:18px;max-width:540px;width:100%;max-height:94vh;overflow-y:auto;box-shadow:0 0 35px rgba(124,58,237,0.45), 0 20px 50px rgba(0,0,0,0.8);box-sizing:border-box">
            
            <!-- Header Placar -->
            <div class="afm-postmatch-header" style="padding:18px 20px 14px 20px;text-align:center;background:radial-gradient(circle at 50% 0%, rgba(124,58,237,0.35) 0%, rgba(14,9,27,0.95) 75%);border-bottom:1px solid rgba(255,255,255,0.06)">
              <div class="afm-postmatch-badge" style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:0.8px;margin-bottom:10px;${resultBadgeClass}">
                ${resultBadge}
              </div>

              <!-- Confronto -->
              <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:2px">
                <div style="flex:1;text-align:right">
                  <div class="afm-postmatch-team" style="font-size:14px;font-weight:900;color:#fff">${h}</div>
                  <div class="muted small" style="font-size:9.5px">MANDANTE</div>
                </div>

                <div class="afm-postmatch-scoreboard" style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:5px 14px;font-size:22px;font-weight:900;color:#facc15;font-family:monospace;letter-spacing:2px">
                  ${hg} x ${ag}
                </div>

                <div style="flex:1;text-align:left">
                  <div class="afm-postmatch-team" style="font-size:14px;font-weight:900;color:#fff">${a}</div>
                  <div class="muted small" style="font-size:9.5px">VISITANTE</div>
                </div>
              </div>
            </div>

            <!-- Opções do Usuário: Escolher dar entrevista ou ver notícias -->
            <div class="afm-postmatch-body" style="padding:16px;display:flex;flex-direction:column;gap:10px">
              <div class="afm-postmatch-prompt" style="font-size:11.5px;color:#94a3b8;font-weight:700;margin-bottom:2px">
                ${isPlayerMode ? 'Fim de jogo. O que você deseja fazer agora?' : 'O que você deseja fazer agora, Professor?'}
              </div>

              <!-- Opção 1: Dar Entrevista Coletiva -->
              ${isPlayerMode ? '' : `<button id="btnPostMatchInterview" class="afm-postmatch-btn" style="background:#16102b;border:1px solid #7c3aed;border-radius:12px;padding:11px 14px;text-align:left;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:all 0.15s ease">
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="afm-postmatch-btn-icon" style="font-size:24px">🎙️</span>
                  <div>
                    <div class="afm-postmatch-btn-title" style="font-size:13.5px;font-weight:900;color:#fff;display:flex;align-items:center;gap:6px">
                      Dar Entrevista Coletiva
                      <span style="font-size:8.5px;background:#7c3aed;color:#fff;padding:2px 5px;border-radius:4px">SALA DE IMPRENSA</span>
                    </div>
                    <div class="afm-postmatch-btn-desc" style="font-size:10.5px;color:#a5b4fc;margin-top:2px">
                      Responda aos repórteres (impacta moral do elenco, confiança da torcida e diretoria).
                    </div>
                  </div>
                </div>
                <span style="font-size:18px;color:#c084fc">›</span>
              </button>`}

              <!-- Opção 2: Ver Últimas Notícias do Dia -->
              <button id="btnPostMatchNews" class="afm-postmatch-btn" style="background:#131226;border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:11px 14px;text-align:left;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:all 0.15s ease">
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="afm-postmatch-btn-icon" style="font-size:24px">📰</span>
                  <div>
                    <div class="afm-postmatch-btn-title" style="font-size:13.5px;font-weight:900;color:#38bdf8;display:flex;align-items:center;gap:6px">
                      Ver Últimas Notícias & Passar Dias
                      <span style="font-size:8.5px;background:rgba(56,189,248,0.2);color:#38bdf8;padding:2px 5px;border-radius:4px">MERCADO & GIRO</span>
                    </div>
                    <div class="afm-postmatch-btn-desc" style="font-size:10.5px;color:#94a3b8;margin-top:2px">
                      Acompanhe as transferências, bastidores do futebol brasileiro e passe os dias.
                    </div>
                  </div>
                </div>
                <span style="font-size:18px;color:#38bdf8">›</span>
              </button>

              <!-- Opção 3: Ir Direto para a Central -->
              <button id="btnPostMatchCentral" class="afm-postmatch-btn" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;text-align:left;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:all 0.15s ease">
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="afm-postmatch-btn-icon" style="font-size:20px">🏠</span>
                  <div>
                    <div class="afm-postmatch-btn-title" style="font-size:12.5px;font-weight:800;color:#f8fafc">
                      Ir Direto para a Central do Clube
                    </div>
                    <div class="afm-postmatch-btn-desc" style="font-size:10.5px;color:#64748b;margin-top:2px">
                      Retornar imediatamente ao menu principal sem dar declarações.
                    </div>
                  </div>
                </div>
                <span style="font-size:16px;color:#64748b">›</span>
              </button>
            </div>

          </div>
        </div>
      `;

      modalEl.style.display = 'block';

      // 1. Dar Entrevista
      const btnInt = modalEl.querySelector('#btnPostMatchInterview');
      if (btnInt) {
        btnInt.onclick = () => {
          modalEl.style.display = 'none';
          if (typeof callbacks.onInterview === 'function') callbacks.onInterview();
        };
      }

      // 2. Ver Notícias
      const btnNews = modalEl.querySelector('#btnPostMatchNews');
      if (btnNews) {
        btnNews.onclick = () => {
          modalEl.style.display = 'none';
          if (typeof callbacks.onNews === 'function') callbacks.onNews();
        };
      }

      // 3. Central
      const btnCent = modalEl.querySelector('#btnPostMatchCentral');
      if (btnCent) {
        btnCent.onclick = () => {
          modalEl.style.display = 'none';
          if (typeof callbacks.onCentral === 'function') callbacks.onCentral();
        };
      }
    },

    /**
     * Executa o avanço de dias pós-partida gerando o feed "Passando os Dias - X de Y"
     */
    openAdvanceDaysFromMatch(state, userRes = null) {
      const daysCount = rndInt(3, 6);
      const currDate = parseDateNoon(state?.date || '2026-01-28');
      const daysList = [];

      for (let i = 1; i <= daysCount; i++) {
        const d = new Date(currDate.getTime());
        d.setDate(d.getDate() + i);
        const isLastDay = (i === daysCount);
        
        let matchFixture = null;
        if (isLastDay) {
          const act = (typeof window.getActualCurrentMatch === 'function' ? window.getActualCurrentMatch(state) : null);
          if (act) matchFixture = { home: act.home || state?.club, away: act.away || act.opponent || 'Adversário' };
        }

        const items = this.generateNewsForDay(d, state, isLastDay, matchFixture);
        daysList.push({
          dateObj: d,
          formattedDate: formatHeadingDate(d),
          isMatchDay: isLastDay,
          matchCountText: isLastDay ? `${rndInt(38, 64)} partidas marcadas · hoje` : null,
          items
        });
      }

      this.openDayAdvanceModal({
        daysList,
        currentDay: daysCount,
        totalDays: daysCount,
        onContinue: () => {
          if (typeof window.render === 'function') {
            const curState = (typeof window !== 'undefined' && window.state) || (typeof state !== 'undefined' ? state : null);
            const isPlayer = typeof window.isPlayerCareerActive === 'function'
              ? window.isPlayerCareerActive(curState)
              : Boolean(curState?.gameMode === 'player' || curState?.playerCareerState);
            const targetView = isPlayer ? 'player_hub' : 'central';
            if (typeof window.setGameView === 'function') {
              window.setGameView(targetView);
            } else {
              window.view = targetView;
              if (curState) curState.view = targetView;
            }
            window.render();
          }
        }
      });
    }
  };

  window.AFM_DayAdvanceNews = AFM_DayAdvanceNews;
})(typeof window !== 'undefined' ? window : globalThis);
