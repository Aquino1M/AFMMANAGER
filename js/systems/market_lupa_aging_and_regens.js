// ==============================================================================
// AFM MANAGER 2027 — LUPA NO MERCADO, MERCADO GLOBAL, IDADE E REGEN GENÉTICO
// Arquivo: js/systems/market_lupa_aging_and_regens.js
// BLOCO 04 — 100% ISOLADO NO SAVE DO USUÁRIO
// ==============================================================================

(function (window) {
  'use strict';

  function hashString(str = '') {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  const MarketLupaAgingAndRegens = {
    openPlayerDetailsFromRow(playerData) {
      if (typeof document === 'undefined') return;
      const name = playerData.name || 'Jogador';
      const h = hashString(name);
      const age = Number(playerData.age) || (19 + (h % 14));
      const ovr = Number(playerData.ovr) || (68 + (h % 18));
      const pos = playerData.pos || 'MEI';
      const club = playerData.club || 'Clube Atual';
      const valText = playerData.marketValue || `R$ ${(ovr * 0.45).toFixed(1)} mi`;

      const games = playerData.games ?? Math.max(15, (age - 17) * 31 + (h % 19));
      const isAttacker = ['ST', 'CF', 'LW', 'RW', 'ATA', 'PON', 'CA'].some((p) => pos.includes(p));
      const goals = playerData.goals ?? (isAttacker ? Math.round(games * 0.44) : Math.round(games * 0.11));
      const assists = playerData.assists ?? Math.round(games * 0.19);

      const speed = Math.min(99, Math.max(50, ovr + (age <= 25 ? 6 : -4) + (h % 5)));
      const strength = Math.min(99, Math.max(52, ovr + 2 + ((h >> 2) % 6)));
      const dribble = Math.min(99, Math.max(48, ovr + (isAttacker ? 5 : -2) + ((h >> 3) % 5)));
      const finishing = Math.min(99, Math.max(42, ovr + (isAttacker ? 6 : -9) + ((h >> 4) % 5)));
      const passing = Math.min(99, Math.max(50, ovr + 3 + ((h >> 5) % 4)));

      const old = document.getElementById('afm-market-lupa-modal');
      if (old) old.remove();

      const modal = document.createElement('div');
      modal.id = 'afm-market-lupa-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,17,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,sans-serif;color:#fff;';

      modal.innerHTML = `
        <div style="background:#0f172a;border:1px solid #7c3aed;border-radius:16px;max-width:650px;width:100%;padding:22px;box-shadow:0 20px 50px rgba(0,0,0,0.85);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:14px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div id="lupa-face-slot" style="width:66px;height:66px;border-radius:50%;background:#1e1b4b;border:2px solid #a78bfa;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;overflow:hidden;">
                ${ovr}
              </div>
              <div>
                <span style="background:#5b21b6;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:6px;">${pos} · OVR ${ovr}</span>
                <h3 style="margin:6px 0 2px;font-size:21px;font-weight:900;color:#fff;">${name}</h3>
                <div style="font-size:12px;color:#94a3b8;">Idade: <strong style="color:#fff;">${age} anos</strong> · Clube: <strong style="color:#38bdf8;">${club}</strong> · Valor: <strong style="color:#34d399;">${valText}</strong></div>
              </div>
            </div>
            <button id="close-lupa-modal" style="background:#1e293b;color:#fff;border:1px solid #475569;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:800;">✕ Fechar</button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;">
            <div style="background:#090d16;border:1px solid #1e293b;border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:10px;color:#94a3b8;font-weight:800;">PARTIDAS / JOGOS</div>
              <div style="font-size:20px;font-weight:900;color:#fff;margin-top:4px;">🏟️ ${games}</div>
            </div>
            <div style="background:#090d16;border:1px solid #1e293b;border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:10px;color:#94a3b8;font-weight:800;">GOLS NAS PARTIDAS</div>
              <div style="font-size:20px;font-weight:900;color:#34d399;margin-top:4px;">⚽ ${goals}</div>
            </div>
            <div style="background:#090d16;border:1px solid #1e293b;border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:10px;color:#94a3b8;font-weight:800;">ASSISTÊNCIAS</div>
              <div style="font-size:20px;font-weight:900;color:#38bdf8;margin-top:4px;">👟 ${assists}</div>
            </div>
          </div>

          <div style="background:#090d16;border:1px solid #1e293b;border-radius:10px;padding:14px;margin-top:14px;">
            <div style="font-size:11px;font-weight:800;color:#a78bfa;margin-bottom:10px;">ATRIBUTOS FÍSICOS & TÉCNICOS DO JOGADOR</div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center;font-size:12px;">
              <div style="background:#111827;padding:8px;border-radius:8px;">⚡ Velocidade<br><strong style="font-size:16px;color:#34d399;">${speed}</strong></div>
              <div style="background:#111827;padding:8px;border-radius:8px;">💪 Força<br><strong style="font-size:16px;color:#34d399;">${strength}</strong></div>
              <div style="background:#111827;padding:8px;border-radius:8px;">🪄 Drible<br><strong style="font-size:16px;color:#38bdf8;">${dribble}</strong></div>
              <div style="background:#111827;padding:8px;border-radius:8px;">🎯 Chute<br><strong style="font-size:16px;color:#fbbf24;">${finishing}</strong></div>
              <div style="background:#111827;padding:8px;border-radius:8px;">📐 Passe<br><strong style="font-size:16px;color:#38bdf8;">${passing}</strong></div>
            </div>
          </div>

          <div style="background:#090d16;border:1px solid #1e293b;border-radius:10px;padding:14px;margin-top:14px;">
            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:8px;">HISTÓRICO DE TRANSFERÊNCIAS</div>
            <div style="font-size:12px;color:#cbd5e1;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #111827;padding-bottom:4px;">
                <span>📅 2023/24 · Base / Clube Formador ➔ <strong>Clube Profissional</strong></span>
                <span style="color:#38bdf8;">Revelação</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>📅 2025/26 · Transferência Oficial ➔ <strong>${club}</strong></span>
                <span style="color:#34d399;font-weight:700;">${valText}</span>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.querySelector('#close-lupa-modal').onclick = () => modal.remove();
      if (window.AFM_RealPlayerFaces && typeof window.AFM_RealPlayerFaces.hydratePlayerAvatarElement === 'function') {
        window.AFM_RealPlayerFaces.hydratePlayerAvatarElement(modal.querySelector('#lupa-face-slot'), name);
      }
    },

    // Injeta o botão de Lupa `🔍` ao lado do botão "Sem caixa" / "Proposta" em todas as linhas do Mercado
    injectLupaButtonsInMarketDOM() {
      if (typeof document === 'undefined') return;
      document.querySelectorAll('button').forEach((btn) => {
        const txt = (btn.textContent || '').trim();
        if ((txt === 'Sem caixa' || txt === 'Contratar' || txt === 'Fazer Proposta' || txt === 'Negociar') && !btn.dataset.lupaAdded) {
          const row = btn.closest('tr, .market-row, div[style*="grid"], div[style*="flex"]');
          if (!row) return;
          btn.dataset.lupaAdded = '1';

          const lupaBtn = document.createElement('button');
          lupaBtn.type = 'button';
          lupaBtn.title = 'Inspecionar Ficha Completa, Gols, Atributos e Histórico do Jogador';
          lupaBtn.innerHTML = '🔍';
          lupaBtn.style.cssText = 'background:#3b1d7a;color:#fff;border:1px solid #a78bfa;border-radius:8px;padding:7px 11px;margin-right:8px;cursor:pointer;font-size:14px;font-weight:900;';

          lupaBtn.onclick = (e) => {
            e.stopPropagation();
            const rowText = (row.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
            this.openPlayerDetailsFromRow({
              name: rowText[0] || 'Atleta do Mercado',
              club: rowText[1] || 'Mercado Global',
              pos: rowText.find((x) => /^(GK|CB|LB|RB|DM|CM|AM|LW|RW|ST|CF|GOL|ZAG|LAT|VOL|MEI|ATA)$/i.test(x)) || 'ATLETA',
              age: rowText.find((x) => /^\d{2}$/.test(x) && Number(x) >= 15 && Number(x) <= 44) || 24,
              ovr: rowText.find((x) => /^\d{2}$/.test(x) && Number(x) >= 50 && Number(x) <= 99) || 75,
              marketValue: rowText.find((x) => x.includes('R$') || x.includes('mi')) || 'Consultado'
            });
          };

          btn.parentElement.insertBefore(lupaBtn, btn);
        }
      });

      // Troca "MERCADO SIMULADO ATIVO" por "🌐 Mercado Global"
      document.querySelectorAll('span, div, button, h3, h4').forEach((el) => {
        if (el.children.length === 0 && (el.textContent || '').includes('MERCADO SIMULADO ATIVO')) {
          el.textContent = el.textContent.replace(/MERCADO SIMULADO ATIVO/g, '🌐 Mercado Global');
        }
      });
    },

    // Sistema de Envelhecimento (Queda de Over e Valor com a idade) + Aposentadoria + Regen Genético na Base
    processAgingDeclineAndGeneticRegens(state) {
      const players = state?.isolatedWorld?.players || state?.players || state?.squad || [];
      const regensLog = [];

      players.forEach((p, idx) => {
        if (!p) return;
        p.age = (Number(p.age) || 23) + 1;
        const isGk = ['GK', 'GOL'].includes(p.position || p.pos);
        const oldAge = isGk ? 34 : 31;

        if (p.age >= oldAge) {
          const ovrDrop = p.age >= 35 ? 2 : 1;
          p.overall = Math.max(48, (Number(p.overall || p.ovr) || 70) - ovrDrop);
          p.ovr = p.overall;
          // O valor dele cai porque está ficando velho
          p.marketValue = Math.max(40000, Math.round((Number(p.marketValue) || 1500000) * 0.65));
        }

        // Aposentadoria e Criação de Regen Genético nas Categorias de Base de algum time aleatório
        if (p.age >= 36 && (p.age >= 37 || Math.random() < 0.65 || p.forceRetire)) {
          const randomClubs = ['Corinthians', 'Palmeiras', 'Santos', 'São Paulo', 'Flamengo', 'Grêmio', 'Cruzeiro', 'Vasco', 'Internacional', 'Atlético-MG'];
          const destClub = randomClubs[Math.floor(Math.random() * randomClubs.length)];
          const regen = {
            id: `regen_${Date.now()}_${idx}`,
            name: `${p.name.split(' ')[0]} Jr.`,
            regenOf: p.name,
            geneticOrigin: p.name,
            nationality: p.nationality || 'Brasil',
            age: 16,
            position: p.position || p.pos || 'MEI',
            overall: Math.max(58, Math.min(72, Math.round((p.overall || 72) * 0.85))),
            potential: Math.max(83, Math.min(95, (p.potential || 85) + 2)),
            marketValue: 500000,
            salary: 9500,
            clubName: `${destClub} (Categorias de Base)`,
            isGeneticRegen: true
          };
          players[idx] = regen;
          if (Array.isArray(state?.youthAcademy)) {
            state.youthAcademy.push(regen);
          }
          regensLog.push(`🧬 ${p.name} aposentou-se aos ${p.age} anos! Seu regen genético (${regen.name}, 16 anos, POT ${regen.potential}) surgiu nas Categorias de Base do ${destClub}!`);
        }
      });

      return regensLog;
    }
  };

  window.AFM_MarketLupaAndAging = MarketLupaAgingAndRegens;
})(typeof window !== 'undefined' ? window : global);
