// ==============================================================================
// AFM MANAGER 2027 — COPA DO BRASIL DESTAQUE NEON, RANKING DE TÉCNICOS & LICENÇAS
// Arquivo: js/systems/cup_highlight_ranking_world_and_licenses.js
// BLOCO 03 — 100% ISOLADO NO SAVE DO USUÁRIO
// ==============================================================================

(function (window) {
  'use strict';

  const LICENSES_LIST = [
    { id: 'CBF_D', level: 1, name: 'Licença CBF Série D / Estadual', cost: 0, minOvrClub: 0 },
    { id: 'CBF_C', level: 2, name: 'Licença CBF Série C', cost: 45000, minOvrClub: 62 },
    { id: 'CBF_B', level: 3, name: 'Licença CBF Série B', cost: 110000, minOvrClub: 68 },
    { id: 'CBF_A', level: 4, name: 'Licença CBF Série A & CONMEBOL PRO', cost: 260000, minOvrClub: 74 },
    { id: 'UEFA_PRO', level: 5, name: 'Licença UEFA PRO Internacional', cost: 650000, minOvrClub: 80 }
  ];

  const AI_COACHES_DB = [
    { name: 'Abel Ferreira', club: 'Palmeiras', scope: 'NACIONAL', wins: 19, draws: 5, losses: 4, titles: 2 },
    { name: 'Filipe Luís', club: 'Flamengo', scope: 'NACIONAL', wins: 18, draws: 6, losses: 4, titles: 1 },
    { name: 'Artur Jorge', club: 'Botafogo', scope: 'NACIONAL', wins: 18, draws: 5, losses: 5, titles: 2 },
    { name: 'Juan Pablo Vojvoda', club: 'Fortaleza', scope: 'NACIONAL', wins: 15, draws: 7, losses: 6, titles: 1 },
    { name: 'Rogério Ceni', club: 'Bahia', scope: 'NACIONAL', wins: 14, draws: 7, losses: 7, titles: 1 },
    { name: 'Luis Zubeldía', club: 'São Paulo', scope: 'NACIONAL', wins: 14, draws: 8, losses: 6, titles: 0 },
    { name: 'Pep Guardiola', club: 'Manchester City', scope: 'MUNDIAL', wins: 25, draws: 4, losses: 2, titles: 3 },
    { name: 'Carlo Ancelotti', club: 'Real Madrid', scope: 'MUNDIAL', wins: 24, draws: 5, losses: 2, titles: 3 },
    { name: 'Simone Inzaghi', club: 'Inter de Milão', scope: 'MUNDIAL', wins: 22, draws: 5, losses: 3, titles: 2 },
    { name: 'Luis Enrique', club: 'PSG', scope: 'MUNDIAL', wins: 21, draws: 6, losses: 3, titles: 2 },
    { name: 'Jorge Jesus', club: 'Al-Hilal', scope: 'MUNDIAL', wins: 23, draws: 3, losses: 1, titles: 2 },
    { name: 'Diego Simeone', club: 'Atlético de Madrid', scope: 'MUNDIAL', wins: 19, draws: 6, losses: 5, titles: 1 }
  ];

  const WorldAndRankingSystem = {
    licenses: LICENSES_LIST,
    LICENSES_LIST: LICENSES_LIST,
    coachesPreset: AI_COACHES_DB,
    AI_COACHES_DB: AI_COACHES_DB,

    ensureWorldData(state) {
      if (!state) return;
      state.managerPersonal = state.managerPersonal || { name: 'Aquino', personalBalance: 57000, salary: 75000 };
      if (!Array.isArray(state.managerPersonal.ownedLicenses)) {
        state.managerPersonal.ownedLicenses = ['CBF_D', 'CBF_C', 'CBF_B', 'CBF_A'];
      }
      if (!Array.isArray(state.aiCoachesWorld)) {
        state.aiCoachesWorld = JSON.parse(JSON.stringify(AI_COACHES_DB));
      }
      if (!Array.isArray(state.globalMarketFeed)) {
        state.globalMarketFeed = [];
      }
    },

    // Simula o Mundo Vivo do Save a cada avanço de dia/rodada
    simulateWorldStepOnDayAdvance(state, dateIso) {
      this.ensureWorldData(state);
      // 1. Técnicos da IA disputam partidas e pontuam
      state.aiCoachesWorld.forEach((c) => {
        if (Math.random() < 0.45) {
          const r = Math.random();
          if (r < 0.52) c.wins += 1;
          else if (r < 0.78) c.draws += 1;
          else c.losses += 1;
        }
        if (Math.random() < 0.015) c.titles += 1;
      });

      // 2. Outros clubes compram e vendem no Mercado Global do Save
      const sampleClubs = ['Palmeiras', 'Flamengo', 'São Paulo', 'Botafogo', 'Cruzeiro', 'Bahia', 'Arsenal', 'Real Madrid', 'Chelsea', 'Al-Hilal'];
      if (Math.random() < 0.55) {
        const buyer = sampleClubs[Math.floor(Math.random() * sampleClubs.length)];
        let seller = sampleClubs[Math.floor(Math.random() * sampleClubs.length)];
        if (seller === buyer) seller = 'Porto';
        const fee = (4 + Math.floor(Math.random() * 18)) * 1000000;
        state.globalMarketFeed.unshift({
          date: dateIso,
          text: `🌐 [Mercado Global] ${buyer} concluiu a compra de reforço junto ao ${seller} por R$ ${fee.toLocaleString('pt-BR')}.`
        });
        state.globalMarketFeed = state.globalMarketFeed.slice(0, 25);
      }
    },

    getCoachPoints(c) {
      return Math.max(15, 100 + (c.wins || 0) * 14 + (c.draws || 0) * 4 - (c.losses || 0) * 6 + (c.titles || 0) * 160);
    },

    getPrestigeLevel(points) {
      return Math.min(99, Math.max(5, Math.round(points / 12)));
    },

    // Injeta o Nível de Prestígio + Botão de Rankings dos Técnicos do Save no card de Carreira
    injectPrestigeAndRankingButtonInCareerCard(state) {
      if (typeof document === 'undefined') return;
      this.ensureWorldData(state);
      const allHeaders = Array.from(document.querySelectorAll('h2, h3, div, span'));
      const aquinoLabel = allHeaders.find((el) => (el.textContent || '').trim().includes('CONTA PESSOAL DO TÉCNICO') || (el.textContent || '').trim().includes('PATRIMÔNIO PESSOAL DO TREINADOR'));
      if (!aquinoLabel) return;

      const card = aquinoLabel.closest('div[style*="border"], .card, section') || aquinoLabel.parentElement?.parentElement;
      if (!card || card.querySelector('#afm-career-ranking-injected')) return;

      const uWins = state?.stats?.wins || state?.wins || 0;
      const uDraws = state?.stats?.draws || state?.draws || 3;
      const uLosses = state?.stats?.losses || state?.losses || 7;
      const uTitles = (state?.managerPersonal?.trophies || []).length;
      const uPoints = this.getCoachPoints({ wins: uWins, draws: uDraws, losses: uLosses, titles: uTitles });
      const uPrestige = this.getPrestigeLevel(uPoints);

      const box = document.createElement('div');
      box.id = 'afm-career-ranking-injected';
      box.style.cssText = 'display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(167,139,250,0.25);';
      box.innerHTML = `
        <div style="background:rgba(15,23,42,0.75);border:1px solid #7c3aed;border-radius:10px;padding:8px 14px;">
          <div style="font-size:10px;color:#c4b5fd;font-weight:800;">NÍVEL DE PRESTÍGIO NO SAVE</div>
          <div style="font-size:15px;font-weight:900;color:#fbbf24;">⭐ Nível ${uPrestige}/99 (${uPoints} pts · ${uTitles} Títulos)</div>
        </div>
        <button id="btn-open-save-coaches-rk" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:1px solid #c4b5fd;padding:10px 18px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;box-shadow:0 4px 15px rgba(124,58,237,0.4);">
          🏆 VER RANKING DE TÉCNICOS DO SAVE (NACIONAL & MUNDIAL)
        </button>
        <button id="btn-open-cbf-licenses" style="background:#1e293b;color:#38bdf8;border:1px solid #334155;padding:10px 16px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;">
          🎓 CURSOS & LICENÇAS (CBF A/B/C/D & UEFA)
        </button>
      `;

      card.appendChild(box);
      box.querySelector('#btn-open-save-coaches-rk').onclick = () => this.openCoachesRankingModal(state);
      box.querySelector('#btn-open-cbf-licenses').onclick = () => this.openLicensesModal(state);
    },

    openCoachesRankingModal(state) {
      if (typeof document === 'undefined') return;
      this.ensureWorldData(state);
      const uWins = state?.stats?.wins || state?.wins || 0;
      const uDraws = state?.stats?.draws || state?.draws || 3;
      const uLosses = state?.stats?.losses || state?.losses || 7;
      const uTitles = (state?.managerPersonal?.trophies || []).length;
      const uClub = state?.club || state?.clubName || 'Corinthians';

      const userRow = {
        name: `Téc. ${state?.managerPersonal?.name || state?.managerName || 'Aquino'} (VOCÊ)`,
        club: uClub,
        scope: 'NACIONAL',
        wins: uWins,
        draws: uDraws,
        losses: uLosses,
        titles: uTitles,
        isUser: true
      };

      const fullList = [userRow, ...state.aiCoachesWorld].map((c) => {
        const pts = this.getCoachPoints(c);
        return { ...c, points: pts, prestige: this.getPrestigeLevel(pts) };
      }).sort((a, b) => b.points - a.points);

      const old = document.getElementById('afm-rk-modal');
      if (old) old.remove();

      const modal = document.createElement('div');
      modal.id = 'afm-rk-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,17,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,sans-serif;color:#fff;';

      let tab = 'NACIONAL';
      const render = () => {
        const list = tab === 'NACIONAL' ? fullList.filter((x) => x.scope === 'NACIONAL' || x.isUser) : fullList;
        modal.innerHTML = `
          <div style="background:#0f172a;border:1px solid #6d28d9;border-radius:16px;max-width:850px;width:100%;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;">
            <div style="padding:18px 22px;background:#1e1b4b;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:11px;color:#c4b5fd;font-weight:800;">PONTUAÇÃO POR TÍTULOS (+160), VITÓRIAS (+14), EMPATES (+4) E DERROTAS (-6)</div>
                <h3 style="margin:4px 0 0;font-size:19px;font-weight:900;">🏆 Ranking Vivo de Treinadores do Seu Save</h3>
              </div>
              <button id="close-rk" style="background:#090d16;color:#fff;border:1px solid #475569;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:800;">✕ Fechar</button>
            </div>
            <div style="padding:12px 22px;background:#090d16;display:flex;gap:10px;border-bottom:1px solid #1e293b;">
              <button id="btn-rk-nac" style="background:${tab === 'NACIONAL' ? '#7c3aed' : '#1e293b'};color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:800;cursor:pointer;">🇧🇷 Ranking Nacional</button>
              <button id="btn-rk-mun" style="background:${tab === 'MUNDIAL' ? '#7c3aed' : '#1e293b'};color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:800;cursor:pointer;">🌍 Ranking Mundial</button>
            </div>
            <div style="padding:16px 22px;overflow-y:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="color:#94a3b8;text-align:left;border-bottom:1px solid #1e293b;">
                    <th style="padding:8px;">POS</th>
                    <th style="padding:8px;">TÉCNICO</th>
                    <th style="padding:8px;">TIME TREINADO ATUALMENTE</th>
                    <th style="padding:8px;">NÍVEL DE PRESTÍGIO</th>
                    <th style="padding:8px;">TÍTULOS</th>
                    <th style="padding:8px;">V / E / D</th>
                    <th style="padding:8px;text-align:right;">PONTOS</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.map((c, i) => `
                    <tr style="background:${c.isUser ? 'rgba(124,58,237,0.3)' : 'transparent'};border-bottom:1px solid #1e293b;">
                      <td style="padding:10px 8px;font-weight:900;color:#fbbf24;">#${i + 1}</td>
                      <td style="padding:10px 8px;font-weight:800;color:${c.isUser ? '#a78bfa' : '#fff'};">${c.name}</td>
                      <td style="padding:10px 8px;color:#38bdf8;font-weight:700;">🛡️ ${c.club}</td>
                      <td style="padding:10px 8px;"><span style="background:#3b1d7a;color:#e9d5ff;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:800;">⭐ Prestígio ${c.prestige}</span></td>
                      <td style="padding:10px 8px;color:#fbbf24;font-weight:800;">🏆 ${c.titles}</td>
                      <td style="padding:10px 8px;color:#cbd5e1;">${c.wins}V · ${c.draws}E · ${c.losses}D</td>
                      <td style="padding:10px 8px;text-align:right;font-weight:900;color:#34d399;">${c.points} pts</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
        modal.querySelector('#close-rk').onclick = () => modal.remove();
        modal.querySelector('#btn-rk-nac').onclick = () => { tab = 'NACIONAL'; render(); };
        modal.querySelector('#btn-rk-mun').onclick = () => { tab = 'MUNDIAL'; render(); };
      };

      document.body.appendChild(modal);
      render();
    },

    openLicensesModal(state) {
      if (typeof document === 'undefined') return;
      this.ensureWorldData(state);
      const mp = state.managerPersonal;
      const old = document.getElementById('afm-lic-modal');
      if (old) old.remove();

      const modal = document.createElement('div');
      modal.id = 'afm-lic-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,17,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,sans-serif;color:#fff;';

      const render = () => {
        modal.innerHTML = `
          <div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px;max-width:680px;width:100%;padding:22px;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:12px;margin-bottom:14px;">
              <div>
                <div style="font-size:11px;color:#38bdf8;font-weight:800;">ESCOLARIDADE TÉCNICA OBRIGATÓRIA PARA ASSUMIR CLUBES</div>
                <h3 style="margin:4px 0 0;font-size:19px;font-weight:900;">🎓 Academia de Licenças CBF (Série D, C, B, A) & UEFA PRO</h3>
              </div>
              <button id="close-lic" style="background:#1e293b;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:800;">✕</button>
            </div>
            <p style="font-size:12px;color:#cbd5e1;margin-top:0;">
              Para ser aceito em clubes de divisões superiores ou da Europa, você precisa concluir o curso da licença correspondente. Caso receba uma proposta sem ter a licença, a negociação será recusada por falta de escolaridade técnica!
            </p>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${LICENSES_LIST.map((lic) => {
                const hasIt = mp.ownedLicenses.includes(lic.id);
                return `
                  <div style="background:#090d16;border:1px solid ${hasIt ? '#10b981' : '#1e293b'};border-radius:10px;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <div>
                      <div style="font-weight:800;font-size:14px;color:#fff;">📜 ${lic.name}</div>
                      <div style="font-size:11px;color:#94a3b8;">Habilita treinar clubes com Força até ${lic.minOvrClub === 80 ? 'Elite Mundial (99 OVR)' : lic.minOvrClub + 8 + ' OVR'}</div>
                    </div>
                    <button class="btn-buy-lic" data-id="${lic.id}" data-cost="${lic.cost}" data-name="${lic.name}" ${hasIt ? 'disabled' : ''} style="background:${hasIt ? '#065f46' : '#2563eb'};color:#fff;border:none;padding:9px 14px;border-radius:8px;font-weight:800;font-size:11px;cursor:${hasIt ? 'default' : 'pointer'};">
                      ${hasIt ? '✅ LICENÇA CONCLUÍDA' : `FAZER CURSO (R$ ${lic.cost.toLocaleString('pt-BR')})`}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        modal.querySelector('#close-lic').onclick = () => modal.remove();
        modal.querySelectorAll('.btn-buy-lic').forEach((b) => {
          b.onclick = () => {
            const cost = Number(b.dataset.cost);
            if ((mp.personalBalance || 0) < cost) {
              alert(`⚠️ Saldo pessoal insuficiente para pagar o curso de ${b.dataset.name} (Custo: R$ ${cost.toLocaleString('pt-BR')}).`);
              return;
            }
            mp.personalBalance -= cost;
            mp.ownedLicenses.push(b.dataset.id);
            render();
          };
        });
      };

      document.body.appendChild(modal);
      render();
    },

    // Garante que o Corinthians e o jogo do time do usuário apareçam com destaque Neon na Copa do Brasil
    ensureUserClubInCopaDoBrasilAndHighlight(state) {
      if (!state) return;
      const userClub = state?.club || state?.clubName || 'Corinthians';
      const tree = state?.isolatedWorld?.copaDoBrasilTree || state?.copaDoBrasilTree;
      if (Array.isArray(tree)) {
        tree.forEach((m) => {
          if (m && (m.home === userClub || m.away === userClub)) {
            m.isUserMatch = true;
            m.highlightNeon = true;
          }
        });
      }
      if (typeof document === 'undefined') return;
      const isCopaScreen = document.body.innerText.includes('COPA DO BRASIL') && (document.body.innerText.includes('CLUBES') || document.body.innerText.includes('FASE') || document.body.innerText.includes('MATA-MATA'));
      if (isCopaScreen) {
        const container = Array.from(document.querySelectorAll('div')).find(
          (el) => (el.textContent || '').trim() === '2ª FASE' || (el.textContent || '').trim() === '1ª FASE' || (el.textContent || '').trim() === '3ª FASE'
        )?.parentElement;

        if (container && !container.querySelector('#afm-user-copa-match-highlight')) {
          const highlightCard = document.createElement('div');
          highlightCard.id = 'afm-user-copa-match-highlight';
          highlightCard.style.cssText = 'background:linear-gradient(135deg,rgba(124,58,237,0.35),rgba(16,185,129,0.2));border:2px solid #a855f7;box-shadow:0 0 22px rgba(168,85,247,0.65);border-radius:12px;padding:14px 18px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;';
          highlightCard.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="background:#10b981;color:#052e16;font-weight:900;font-size:10px;padding:4px 8px;border-radius:99px;">⭐ SEU JOGO NA COPA DO BRASIL</span>
              <strong style="font-size:14px;color:#fff;">Chapecoense 🆚 ${userClub}</strong>
            </div>
            <div style="font-size:12px;color:#e9d5ff;font-weight:700;">
              Confronto Oficial Mapeado · Jogo Único Decisivo
            </div>
          `;
          container.insertBefore(highlightCard, container.firstChild);
        }
      }
    },

    canCoachAcceptClubWithLicense(state, newClubName) {
      const mp = (state && state.managerProfile) || (typeof window !== 'undefined' && window.state && window.state.managerProfile) || {};
      const owned = Array.isArray(mp.ownedLicenses) && mp.ownedLicenses.length ? mp.ownedLicenses : ['lic_cbf_d'];
      let targetTier = 'lic_cbf_d';
      const cName = String(newClubName || '').trim();
      const club = typeof clubByName === 'function' ? clubByName(cName) : null;
      const ovr = club ? (((club.atk || 65) + (club.mid || 65) + (club.def || 65)) / 3) : 65;

      if (ovr >= 78) targetTier = 'lic_uefa_pro';
      else if (ovr >= 74) targetTier = 'lic_cbf_a';
      else if (ovr >= 70) targetTier = 'lic_cbf_b';
      else if (ovr >= 66) targetTier = 'lic_cbf_c';
      else targetTier = 'lic_cbf_d';

      const hierarchy = ['lic_cbf_d', 'lic_cbf_c', 'lic_cbf_b', 'lic_cbf_a', 'lic_uefa_pro'];
      const reqLic = LICENSES_LIST.find((l) => l.id === targetTier) || LICENSES_LIST[0];
      const reqIdx = hierarchy.indexOf(targetTier);
      const userMaxIdx = Math.max(...owned.map((id) => hierarchy.indexOf(id)), 0);

      if (userMaxIdx >= reqIdx) {
        return { allowed: true, requiredLicenseName: reqLic.name };
      }
      const curLic = LICENSES_LIST.find((l) => l.id === hierarchy[userMaxIdx]) || LICENSES_LIST[0];
      return {
        allowed: false,
        requiredLicenseName: reqLic.name,
        currentLicenseName: curLic.name
      };
    }
  };

  window.AFM_WorldSimulation = WorldAndRankingSystem;
})(typeof window !== 'undefined' ? window : global);
