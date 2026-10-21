/**
 * Aquino Futebol Manager 2026 — Modal de Relatórios do Elenco
 * Abas: Perspetiva geral | Lesões | Suspensões | Moral | Contratos | Desenvolvimento | Juventude
 * Inspirado nas diretrizes do FC27 e referência visual oficial.
 */

(function (window) {
  'use strict';

  let currentTab = 'geral';

  function norm(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
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

  function getPlayerOvr(p) {
    if (!p) return 60;
    if (typeof window.playerOverall === 'function') return window.playerOverall(p);
    return Number(p.overall || p.ovr || p.fc || p.pes) || 60;
  }

  function getPlayerWage(p, state) {
    if (!p) return 5000;
    if (typeof window.playerSalary === 'function') return window.playerSalary(p, state);
    return Number(p.wage || p.salary) || 5000;
  }

  function getPlayerVal(p) {
    if (!p) return 0.2;
    if (typeof window.calcValueMi === 'function') return window.calcValueMi(p);
    return Number(p.value) || 0.2;
  }

  function getPosBadgeColor(pos) {
    const p = String(pos || '').toUpperCase();
    if (/^(GK|GOLEIRO)$/.test(p)) return '#eab308'; // Amarelo
    if (/^(CB|LB|RB|ZAG|LE|LD|DEF)$/.test(p)) return '#38bdf8'; // Azul
    if (/^(CM|AM|DM|VOL|MEI|MC|ME|MD|CAM|CDM)$/.test(p)) return '#22c55e'; // Verde
    return '#f43f5e'; // Vermelho (Ataque)
  }

  function getPosCategory(pos) {
    const p = String(pos || '').toUpperCase();
    if (/^(GK|GOLEIRO)$/.test(p)) return 'Goleiro';
    if (/^(CB|LB|RB|ZAG|LE|LD|DEF)$/.test(p)) return 'Defesa';
    if (/^(CM|AM|DM|VOL|MEI|MC|ME|MD|CAM|CDM)$/.test(p)) return 'Médio';
    return 'Avançado';
  }

  function openSquadReportsModal(initialTab = 'geral') {
    const state = window.state;
    if (!state || !Array.isArray(state.squad)) {
      if (typeof window.toast === 'function') window.toast('Carregue ou inicie um jogo para ver os relatórios do elenco.');
      return;
    }

    currentTab = initialTab || 'geral';

    let container = document.getElementById('squadReportsModalContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'squadReportsModalContainer';
      document.body.appendChild(container);
    }

    renderModal(container);
  }

  function renderModal(container) {
    const state = window.state;
    if (!state || !container) return;

    const squad = Array.isArray(state.squad) ? state.squad.filter(Boolean) : [];
    const clubName = state.club || 'Seu Clube';

    container.innerHTML = `
      <div class="visual-modal-overlay squad-reports-overlay" id="squadReportsOverlay">
        <div class="visual-modal-card squad-reports-card" style="grid-template-columns: 1fr; max-width: 1100px; height: 90vh; display: flex; flex-direction: column; background: #0c0a17; border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 18px; box-shadow: 0 20px 60px rgba(0,0,0,0.85); overflow: hidden;">
          
          <!-- TOPO: TÍTULO, SUBTÍTULO E BOTÃO FECHAR -->
          <div style="padding: 16px 20px; background: linear-gradient(90deg, #16122c, #0e0b1d); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 14px rgba(124,58,237,0.5);">
                📊
              </div>
              <div>
                <div style="font-size: 11px; font-weight: 800; color: #a78bfa; letter-spacing: 0.8px; text-transform: uppercase;">RELATÓRIOS DO ELENCO & ANÁLISE TÁTICA</div>
                <h2 style="margin: 0; font-size: 19px; font-weight: 900; color: #fff;">${esc(clubName)}</h2>
              </div>
            </div>
            <button class="btn" id="btnCloseSquadReportsModal" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #fff; width: 34px; height: 34px; border-radius: 8px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <!-- NAVEGAÇÃO DE ABAS HORIZONTAIS (7 ABAS DO SCREENSHOT OFICIAL) -->
          <div style="background: #110d22; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 6px 16px; display: flex; gap: 6px; overflow-x: auto; flex-shrink: 0;" class="squad-reports-tabs-nav">
            ${renderTabBtn('geral', 'Perspetiva geral', '📋')}
            ${renderTabBtn('lesoes', 'Lesões', '🚑', countInjuries(state))}
            ${renderTabBtn('suspensoes', 'Suspensões', '🟥', countSuspensions(state))}
            ${renderTabBtn('moral', 'Moral', '⭐')}
            ${renderTabBtn('contratos', 'Contratos', '📝')}
            ${renderTabBtn('desenvolvimento', 'Desenvolvimento', '⚡')}
            ${renderTabBtn('juventude', 'Juventude', '🌱', countYouth(state))}
          </div>

          <!-- CORPO PRINCIPAL RENDERIZADO CONFORME A ABA SELECIONADA -->
          <div style="flex: 1; overflow-y: auto; padding: 20px;" id="squadReportsBody">
            ${renderActiveTabContent(state, squad)}
          </div>

        </div>
      </div>
    `;

    bindModalEvents(container);
  }

  function renderTabBtn(tabKey, label, icon, badgeCount = 0) {
    const isActive = currentTab === tabKey;
    const activeStyle = isActive 
      ? 'background: #7c3aed; color: #fff; font-weight: 900; box-shadow: 0 4px 12px rgba(124,58,237,0.4);' 
      : 'background: rgba(255,255,255,0.04); color: #94a3b8; font-weight: 700;';
    
    return `
      <button class="btn btnSquadReportTab" data-tab="${tabKey}" style="border: none; padding: 8px 14px; font-size: 12px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: all 0.2s; ${activeStyle}">
        <span>${icon}</span>
        <span>${label}</span>
        ${badgeCount > 0 ? `<span style="background: #ef4444; color: #fff; font-size: 10px; font-weight: 900; padding: 1px 6px; border-radius: 999px;">${badgeCount}</span>` : ''}
      </button>
    `;
  }

  function countInjuries(state) {
    if (!state || !Array.isArray(state.squad)) return 0;
    return state.squad.filter(p => p && ((p.injuryDays && p.injuryDays > 0) || p.injury)).length;
  }

  function countSuspensions(state) {
    if (!state || !Array.isArray(state.squad)) return 0;
    return state.squad.filter(p => p && (Number(p.suspended) > 0)).length;
  }

  function countYouth(state) {
    if (!state) return 0;
    const fromBase = Array.isArray(state.youthAcademy) ? state.youthAcademy.length : 0;
    const fromSquad = Array.isArray(state.squad) ? state.squad.filter(p => p && Number(p.age) <= 20).length : 0;
    return fromBase + fromSquad;
  }

  function bindModalEvents(container) {
    const closeBtn = container.querySelector('#btnCloseSquadReportsModal');
    if (closeBtn) closeBtn.onclick = () => container.remove();

    const overlay = container.querySelector('#squadReportsOverlay');
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) container.remove();
      };
    }

    container.querySelectorAll('.btnSquadReportTab').forEach(btn => {
      btn.onclick = () => {
        currentTab = btn.dataset.tab;
        renderModal(container);
      };
    });

    const keydownHandler = (e) => {
      if (e.key === 'Escape') {
        container.remove();
        document.removeEventListener('keydown', keydownHandler);
      }
    };
    document.addEventListener('keydown', keydownHandler);
  }

  function renderActiveTabContent(state, squad) {
    if (currentTab === 'geral') return renderGeralTab(state, squad);
    if (currentTab === 'lesoes') return renderInjuriesTab(state, squad);
    if (currentTab === 'suspensoes') return renderSuspensionsTab(state, squad);
    if (currentTab === 'moral') return renderMoraleTab(state, squad);
    if (currentTab === 'contratos') return renderContractsTab(state, squad);
    if (currentTab === 'desenvolvimento') return renderDevelopmentTab(state, squad);
    if (currentTab === 'juventude') return renderYouthTab(state, squad);
    return renderGeralTab(state, squad);
  }

  // =========================================================================
  // ABA 1: PERSPETIVA GERAL (REFERÊNCIA EXATA DA IMAGEM OFICIAL)
  // =========================================================================
  function renderGeralTab(state, squad) {
    const totalPlayers = squad.length;
    const avgOvr = totalPlayers > 0 
      ? (squad.reduce((acc, p) => acc + getPlayerOvr(p), 0) / totalPlayers).toFixed(1).replace('.', ',')
      : '55,0';
    const avgAge = totalPlayers > 0
      ? (squad.reduce((acc, p) => acc + (Number(p.age) || 24), 0) / totalPlayers).toFixed(1).replace('.', ',')
      : '25,0';
    
    const totalValMi = squad.reduce((acc, p) => acc + getPlayerVal(p), 0);
    const avgValMi = totalPlayers > 0 ? (totalValMi / totalPlayers) : 0;
    const fmtTotalVal = totalValMi >= 1 
      ? `R$ ${totalValMi.toFixed(1).replace('.', ',')} mi`
      : `R$ ${Math.round(totalValMi * 1000)} mil`;
    const fmtAvgVal = avgValMi >= 1
      ? `R$ ${avgValMi.toFixed(2).replace('.', ',')} mi`
      : `R$ ${Math.round(avgValMi * 1000)} mil`;

    // Identifica 3 jogadores-chave de setores distintos (Avançado, Médio, Defesa/Goleiro)
    const keyPlayers = selectKeyPlayers(squad);

    // Análise inteligente dos pontos fortes e a melhorar
    const { strengths, weaknesses } = analyzeSquad(state, squad);

    return `
      <!-- 1. OS 5 CARDS DE MÉTRICAS NO TOPO (SCREENSHOT 1) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
        
        <div style="background: #141026; border: 1px solid rgba(139,92,246,0.25); border-radius: 12px; padding: 14px; display: flex; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Classificação média</span>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 6px;">
            <b style="font-size: 26px; font-weight: 900; color: #fff;">${avgOvr}</b>
            <span style="font-size: 11px; color: #22c55e; font-weight: 800;">OVR Plantel</span>
          </div>
        </div>

        <div style="background: #141026; border: 1px solid rgba(139,92,246,0.25); border-radius: 12px; padding: 14px; display: flex; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Tamanho do plantel</span>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 6px;">
            <b style="font-size: 26px; font-weight: 900; color: #38bdf8;">${totalPlayers}</b>
            <span style="font-size: 11px; color: #94a3b8;">jogadores</span>
          </div>
        </div>

        <div style="background: #141026; border: 1px solid rgba(139,92,246,0.25); border-radius: 12px; padding: 14px; display: flex; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Média etária</span>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 6px;">
            <b style="font-size: 26px; font-weight: 900; color: #facc15;">${avgAge}</b>
            <span style="font-size: 11px; color: #94a3b8;">anos</span>
          </div>
        </div>

        <div style="background: #141026; border: 1px solid rgba(139,92,246,0.25); border-radius: 12px; padding: 14px; display: flex; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Valor médio</span>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 6px;">
            <b style="font-size: 22px; font-weight: 900; color: #4ade80;">${fmtAvgVal}</b>
          </div>
        </div>

        <div style="background: #141026; border: 1px solid rgba(139,92,246,0.25); border-radius: 12px; padding: 14px; display: flex; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Valor total</span>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 6px;">
            <b style="font-size: 22px; font-weight: 900; color: #22c55e;">${fmtTotalVal}</b>
          </div>
        </div>

      </div>

      <!-- 2. GRID PRINCIPAL: JOGADORES-CHAVE (ESQUERDA) + ANÁLISE DO PLANTEL (DIREITA) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
        
        <!-- BLOCO ESQUERDA: VISÃO GERAL DO PLANTEL / JOGADORES-CHAVE -->
        <div style="background: #130f24; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">Visão geral do plantel</h3>
            <span style="font-size: 11px; color: #a78bfa; font-weight: 800;">JOGADORES-CHAVE</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${keyPlayers.map(p => renderKeyPlayerCard(p)).join('')}
          </div>
        </div>

        <!-- BLOCO DIREITA: ANÁLISE DO PLANTEL (PONTOS FORTES E A MELHORAR) -->
        <div style="background: #130f24; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">Análise do plantel</h3>

          <!-- PONTOS FORTES (CHECK VERDE) -->
          <div style="background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.25); border-radius: 10px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 900; color: #4ade80; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>✓</span>
              <span>Pontos fortes</span>
            </div>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.6;">
              ${strengths.map(s => `<li>${esc(s)}</li>`).join('')}
            </ul>
          </div>

          <!-- PONTOS A MELHORAR (X VERMELHO) -->
          <div style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 900; color: #f87171; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>✗</span>
              <span>Pontos a melhorar</span>
            </div>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.6;">
              ${weaknesses.map(w => `<li>${esc(w)}</li>`).join('')}
            </ul>
          </div>

        </div>

      </div>
    `;
  }

  function renderKeyPlayerCard(p) {
    if (!p) return '';
    const ovr = getPlayerOvr(p);
    const cat = getPosCategory(p.pos);
    const badgeBg = getPosBadgeColor(p.pos);
    const valMi = getPlayerVal(p);
    const fmtVal = valMi >= 1 
      ? `R$ ${valMi.toFixed(1).replace('.', ',')} mi` 
      : `R$ ${Math.round(valMi * 1000)} mil`;

    const photoHtml = (typeof window.playerPhoto === 'function') 
      ? window.playerPhoto(p, 42) 
      : `<div style="width:42px;height:42px;border-radius:50%;background:#2e1065;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;">${p.name?.[0]||'P'}</div>`;

    return `
      <div style="background: #18142e; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="position: relative;">
            ${photoHtml}
            <span style="position: absolute; bottom: -2px; right: -2px; background: ${badgeBg}; color: #000; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 4px; line-height: 1;">${esc(p.pos || cat)}</span>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #a78bfa; text-transform: uppercase;">${esc(cat)}</div>
            <div style="font-size: 13px; font-weight: 900; color: #fff;">${esc(p.name || 'Jogador')}</div>
            <div style="font-size: 10px; color: #94a3b8;">${p.age || 24} anos · ${fmtVal}</div>
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: 900; color: #facc15;">${ovr}</div>
          <div style="font-size: 9px; font-weight: 800; color: #22c55e;">OVERALL</div>
        </div>
      </div>
    `;
  }

  function selectKeyPlayers(squad) {
    if (!squad.length) return [];
    const sorted = squad.slice().sort((a, b) => getPlayerOvr(b) - getPlayerOvr(a));
    
    // Procura o melhor atacante, melhor meia e melhor defensor/goleiro
    const bestAtk = sorted.find(p => getPosCategory(p.pos) === 'Avançado') || sorted[0];
    const bestMid = sorted.find(p => getPosCategory(p.pos) === 'Médio' && p !== bestAtk) || sorted.find(p => p !== bestAtk) || sorted[0];
    const bestDef = sorted.find(p => (getPosCategory(p.pos) === 'Defesa' || getPosCategory(p.pos) === 'Goleiro') && p !== bestAtk && p !== bestMid) || sorted.find(p => p !== bestAtk && p !== bestMid) || sorted[0];

    const result = [bestAtk, bestMid, bestDef].filter(Boolean);
    // Elimina duplicações se squad for muito pequeno
    return Array.from(new Set(result)).slice(0, 3);
  }

  function analyzeSquad(state, squad) {
    const strengths = [];
    const weaknesses = [];

    const total = squad.length;
    const gks = squad.filter(p => /^(GK|GOLEIRO)$/i.test(p.pos || ''));
    const defs = squad.filter(p => /^(CB|LB|RB|ZAG|LE|LD)$/i.test(p.pos || ''));
    const mids = squad.filter(p => /^(CM|AM|DM|VOL|MEI)$/i.test(p.pos || ''));
    const atks = squad.filter(p => /^(ST|CF|RW|LW|ATA|PD|PE)$/i.test(p.pos || ''));

    const avgOvr = total > 0 ? (squad.reduce((a, b) => a + getPlayerOvr(b), 0) / total) : 60;
    const avgAge = total > 0 ? (squad.reduce((a, b) => a + (Number(b.age) || 24), 0) / total) : 25;

    // Pontos fortes
    if (gks.length > 0 && getPlayerOvr(gks[0]) >= avgOvr) {
      strengths.push('Goleiro titular sólido com nível técnico acima da média do elenco.');
    } else if (gks.length >= 2) {
      strengths.push('Boa segurança na meta com opções experientes para a camisa 1.');
    }

    if (atks.length >= 3 && atks.some(a => getPlayerOvr(a) > avgOvr)) {
      strengths.push('Setor ofensivo com boa profundidade e poder de decisão nos metros finais.');
    } else if (atks.length >= 2) {
      strengths.push('Ataque com velocidade e capacidade de transição rápida.');
    }

    if (mids.length >= 4) {
      strengths.push('Meio-campo bem guarnecido com alternativas de passe, marcação e chegada na área.');
    }

    if (avgAge >= 22 && avgAge <= 27) {
      strengths.push('Média de idade equilibrada, unindo vigor físico a maturidade tática.');
    } else if (avgAge < 22) {
      strengths.push('Plantel extremamente jovem com margem formidável de valorização.');
    }

    const youngPotentials = squad.filter(p => Number(p.age) <= 21 && (Number(p.potential) || getPlayerOvr(p)) >= (avgOvr + 4));
    if (youngPotentials.length > 0) {
      strengths.push(`Presença de ${youngPotentials.length} promessa(s) de alto potencial pronta(s) para explodir.`);
    }

    if (total >= 22) {
      strengths.push('Profundidade suficiente de plantel para suportar o desgaste de múltiplas competições.');
    }

    // Pontos a melhorar
    const fullbacks = squad.filter(p => /^(LB|RB|LE|LD)$/i.test(p.pos || ''));
    if (fullbacks.length <= 2) {
      weaknesses.push('Poucas alternativas para as laterais em caso de suspensão ou desgaste físico.');
    }

    const centerbacks = squad.filter(p => /^(CB|ZAG)$/i.test(p.pos || ''));
    if (centerbacks.length <= 3) {
      weaknesses.push('Setor de zaga carece de peças de reposição imediatas para jogos de alta intensidade.');
    }

    if (avgAge > 28.5) {
      weaknesses.push('Média de idade elevada em setores-chave; risco de perda de rendimento no 2º tempo.');
    }

    if (total < 20) {
      weaknesses.push('Elenco enxuto para temporada cheia; pouca margem para rodízio e preservação de titulares.');
    }

    const payroll = squad.reduce((sum, p) => sum + getPlayerWage(p, state), 0);
    if (payroll > 250000 && (state.balance || 0) < 500000) {
      weaknesses.push('Folha salarial consome parcela considerável das receitas mensais do clube.');
    }

    if (atks.length < 2) {
      weaknesses.push('Carência de centroavantes e finalizadores natos no elenco principal.');
    }

    // Garante no mínimo 2 em cada
    if (strengths.length < 2) strengths.push('Grupo coeso e comprometido com as metas táticas da temporada.');
    if (weaknesses.length < 2) weaknesses.push('Necessidade de aprimoramento físico e entrosamento nas bolas paradas.');

    return { strengths: strengths.slice(0, 4), weaknesses: weaknesses.slice(0, 4) };
  }

  // =========================================================================
  // ABA 2: LESÕES (DEPARTAMENTO MÉDICO)
  // =========================================================================
  function renderInjuriesTab(state, squad) {
    const injured = squad.filter(p => (p.injuryDays && p.injuryDays > 0) || p.injury);

    if (injured.length === 0) {
      return `
        <div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3); border-radius: 14px; padding: 32px; text-align: center; margin: 20px 0;">
          <div style="font-size: 36px; margin-bottom: 8px;">🩺 ✓</div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 900; color: #4ade80;">DEPARTAMENTO MÉDICO VAZIO</h3>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">Nenhum atleta sob cuidados médicos no momento. Todo o elenco está saudável e à disposição da comissão técnica!</p>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 12px; font-size: 12px; color: #94a3b8;">
        Exibindo <b style="color:#ef4444">${injured.length} atleta(s)</b> em tratamento no Departamento Médico:
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${injured.map(p => {
          const days = p.injuryDays || p.injuryMatches || 7;
          const desc = p.injuryDesc || p.injury || 'Estiramento muscular';
          const badgeBg = getPosBadgeColor(p.pos);
          const photoHtml = (typeof window.playerPhoto === 'function') 
            ? window.playerPhoto(p, 42) 
            : `<div style="width:42px;height:42px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center;color:#fff;">🚑</div>`;

          return `
            <div style="background: #140e1e; border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${photoHtml}
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="background: ${badgeBg}; color: #000; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 4px;">${esc(p.pos)}</span>
                    <b style="color: #fff; font-size: 14px;">${esc(p.name)}</b>
                  </div>
                  <div style="font-size: 11px; color: #f87171; margin-top: 2px;">🚑 Diagnóstico: ${esc(desc)}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <span class="pill bad" style="font-size: 11px; font-weight: 900; padding: 4px 10px;">${days} dia(s) restante(s)</span>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Fisioterapia intensiva</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // =========================================================================
  // ABA 3: SUSPENSÕES
  // =========================================================================
  function renderSuspensionsTab(state, squad) {
    const suspended = squad.filter(p => Number(p.suspended) > 0 || Number(p.yellowCards) >= 3);

    if (suspended.length === 0) {
      return `
        <div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3); border-radius: 14px; padding: 32px; text-align: center; margin: 20px 0;">
          <div style="font-size: 36px; margin-bottom: 8px;">🛡️ ✓</div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 900; color: #4ade80;">DISCIPLINA EM DIA</h3>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">Nenhum atleta suspenso por cartões no momento. Todos os jogadores estão liberados para atuar!</p>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 12px; font-size: 12px; color: #94a3b8;">
        Exibindo <b style="color:#ef4444">${suspended.length} atleta(s)</b> com pendência disciplinar:
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${suspended.map(p => {
          const games = Number(p.suspended) || 1;
          const reason = p.suspendedReason || (Number(p.yellowCards) >= 3 ? 'Acúmulo de 3 cartões amarelos' : 'Cartão vermelho direto');
          const badgeBg = getPosBadgeColor(p.pos);

          return `
            <div style="background: #18101a; border: 1px solid rgba(244,63,94,0.3); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">🟥</div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="background: ${badgeBg}; color: #000; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 4px;">${esc(p.pos)}</span>
                    <b style="color: #fff; font-size: 14px;">${esc(p.name)}</b>
                  </div>
                  <div style="font-size: 11px; color: #fb7185; margin-top: 2px;">Motivo: ${esc(reason)}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <span class="pill bad" style="font-size: 11px; font-weight: 900; padding: 4px 10px;">${games} partida(s) de gancho</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // =========================================================================
  // ABA 4: MORAL & VESTIÁRIO
  // =========================================================================
  function renderMoraleTab(state, squad) {
    const avgMorale = squad.length > 0 
      ? Math.round(squad.reduce((a, b) => a + (Number(b.morale) || 75), 0) / squad.length)
      : 75;

    return `
      <div style="background: #141026; border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-size: 10px; font-weight: 800; color: #a78bfa; text-transform: uppercase;">CLIMA DO VESTIÁRIO</span>
          <h3 style="margin: 2px 0 0 0; font-size: 18px; font-weight: 900; color: #fff;">HARMONIA DO GRUPO</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="text-align: right;">
            <div style="font-size: 22px; font-weight: 900; color: ${avgMorale >= 80 ? '#22c55e' : avgMorale >= 60 ? '#facc15' : '#ef4444'};">${avgMorale}%</div>
            <div style="font-size: 10px; color: #94a3b8;">Moral Coletiva</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;">
        ${squad.map(p => {
          const m = Number(p.morale) || 75;
          const mColor = m >= 85 ? '#22c55e' : (m >= 70 ? '#38bdf8' : (m >= 55 ? '#facc15' : '#ef4444'));
          const mLabel = m >= 85 ? 'Excelente' : (m >= 70 ? 'Muito Alta' : (m >= 55 ? 'Regular' : 'Baixa'));

          return `
            <div style="background: #130f24; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b style="color: #fff; font-size: 13px;">${esc(p.name)}</b>
                <div style="font-size: 10px; color: #94a3b8;">${esc(p.pos)} · OVR ${getPlayerOvr(p)}</div>
              </div>
              <div style="text-align: right; min-width: 80px;">
                <span style="color: ${mColor}; font-weight: 900; font-size: 12px;">${m}%</span>
                <div style="font-size: 9px; color: ${mColor}; font-weight: 800;">${mLabel}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // =========================================================================
  // ABA 5: CONTRATOS & SALÁRIOS
  // =========================================================================
  function renderContractsTab(state, squad) {
    const totalWage = squad.reduce((sum, p) => sum + getPlayerWage(p, state), 0);
    const fmtWage = (typeof window.fmtMoney === 'function') ? window.fmtMoney(totalWage) : `R$ ${totalWage.toLocaleString('pt-BR')}`;

    return `
      <div style="background: #141026; border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-size: 10px; font-weight: 800; color: #a78bfa; text-transform: uppercase;">FOLHA SALARIAL MENSAL</span>
          <h3 style="margin: 2px 0 0 0; font-size: 20px; font-weight: 900; color: #22c55e;">${fmtWage} / mês</h3>
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
          Total de ${squad.length} vínculos profissionais ativos
        </div>
      </div>

      <div class="tablewrap" style="background: #130f24; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; text-align: left;">
              <th style="padding: 10px;">Atleta</th>
              <th style="padding: 10px;">Pos</th>
              <th style="padding: 10px;">Idade</th>
              <th style="padding: 10px;">Overall</th>
              <th style="padding: 10px;">Salário / Mês</th>
              <th style="padding: 10px;">Vínculo Até</th>
              <th style="padding: 10px;">Situação</th>
            </tr>
          </thead>
          <tbody>
            ${squad.map(p => {
              const wage = getPlayerWage(p, state);
              const until = (typeof window.playerContractUntil === 'function') ? window.playerContractUntil(p) : (p.contractUntil || '2027');
              const isShort = String(until).includes('2026') || until === 2026;

              return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                  <td style="padding: 10px;"><b style="color:#fff;">${esc(p.name)}</b></td>
                  <td style="padding: 10px;"><span style="color:#a78bfa;font-weight:800;">${esc(p.pos)}</span></td>
                  <td style="padding: 10px;color:#94a3b8;">${p.age || 24}a</td>
                  <td style="padding: 10px;"><b style="color:#facc15;">${getPlayerOvr(p)}</b></td>
                  <td style="padding: 10px;color:#4ade80;font-weight:800;">R$ ${wage.toLocaleString('pt-BR')}</td>
                  <td style="padding: 10px;color:#fff;">até ${esc(until)}</td>
                  <td style="padding: 10px;">
                    ${isShort ? `<span class="pill bad" style="font-size:10px;">⚠️ Expira em breve</span>` : `<span class="pill good" style="font-size:10px;">✓ Vínculo seguro</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // =========================================================================
  // ABA 6: DESENVOLVIMENTO & EVOLUÇÃO
  // =========================================================================
  function renderDevelopmentTab(state, squad) {
    return `
      <div style="margin-bottom: 14px; font-size: 12px; color: #94a3b8;">
        Acompanhe o ganho de XP dos atletas pelo trabalho no Centro de Treinamento e atuações oficiais:
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${squad.map(p => {
          const ovr = getPlayerOvr(p);
          const pot = Number(p.potential) || ovr;
          const xp = Number(p.xp) || 0;
          const xpNext = Number(p.xpNext) || 450;
          const pct = Math.min(100, Math.max(0, Math.round((xp / xpNext) * 100)));
          const m = p.monthlyEvolution || { matchXP: 0, trainingXP: 0 };
          const monthXP = (m.matchXP || 0) + (m.trainingXP || 0);

          return `
            <div style="background: #130f24; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div>
                  <b style="color: #fff; font-size: 13px;">${esc(p.name)}</b>
                  <span style="font-size: 10px; color: #94a3b8; margin-left: 6px;">${esc(p.pos)} · ${p.age || 24} anos</span>
                </div>
                <div style="font-size: 11px; font-weight: 800; color: #c084fc;">
                  +${monthXP} XP neste mês
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-bottom: 4px;">
                <span>Nível Atual: <b style="color:#fff;">${ovr} OVR</b> ➔ Potencial: <b style="color:#4ade80;">${pot} POT</b></span>
                <span><b style="color:#c084fc;">${xp}</b> / ${xpNext} XP (${pct}%)</span>
              </div>
              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; border: 1px solid rgba(168,85,247,0.3);">
                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #7c3aed, #38bdf8); border-radius: 999px;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // =========================================================================
  // ABA 7: JUVENTUDE (CATEGORIAS DE BASE & SUB-20)
  // =========================================================================
  function renderYouthTab(state, squad) {
    const baseAthletes = Array.isArray(state.youthAcademy) ? state.youthAcademy : [];
    const youngSquad = squad.filter(p => Number(p.age) <= 20);

    return `
      <!-- JOGADORES SUB-20 NO ELENCO PRINCIPAL -->
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 900; color: #38bdf8; text-transform: uppercase;">Promessas Sub-20 no Elenco Principal (${youngSquad.length})</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px;">
          ${youngSquad.map(p => {
            const ovr = getPlayerOvr(p);
            const pot = Number(p.potential) || ovr;
            return `
              <div style="background: #141026; border: 1px solid rgba(56,189,248,0.25); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <b style="color: #fff; font-size: 13px;">${esc(p.name)}</b>
                  <div style="font-size: 10px; color: #94a3b8;">${esc(p.pos)} · ${p.age} anos</div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 14px; font-weight: 900; color: #facc15;">${ovr}</span>
                  <div style="font-size: 9px; color: #4ade80; font-weight: 800;">POT: ${pot}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- CATEGORIAS DE BASE (YOUTH ACADEMY) -->
      <div>
        <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 900; color: #4ade80; text-transform: uppercase;">Jovens na Base (${baseAthletes.length})</h4>
        ${baseAthletes.length === 0 ? `
          <div style="background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            Nenhum atleta na base no momento. Promova peneiras ou amplie as categorias de base para revelar novos craques!
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px;">
            ${baseAthletes.map(p => `
              <div style="background: #111a14; border: 1px solid rgba(34,197,94,0.25); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <b style="color: #fff; font-size: 13px;">${esc(p.name)}</b>
                  <div style="font-size: 10px; color: #94a3b8;">${esc(p.pos)} · ${p.age} anos</div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 14px; font-weight: 900; color: #facc15;">${getPlayerOvr(p)}</span>
                  <div style="font-size: 9px; color: #4ade80; font-weight: 800;">POT: ${p.potential || 80}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  window.openSquadReportsModal = openSquadReportsModal;
  window.AFM_SquadReports = {
    open: openSquadReportsModal
  };

})(typeof window !== 'undefined' ? window : globalThis);
