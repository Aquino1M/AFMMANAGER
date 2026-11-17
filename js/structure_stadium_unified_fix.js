// ============================================================================
// AFM MANAGER 2027 - FIX UNIFICADO: INSTALAÇÕES, ESTÁDIO & NOVA ARENA,
// MUSEU DO CLUBE (16 NÍVEIS) E SUA CASA & BENS PESSOAIS
// Arquivo: js/structure_stadium_unified_fix.js
// ============================================================================

(function (window) {
  'use strict';

  window.afmStructureUIState = window.afmStructureUIState || {
    activeSubTab: 'facilities', // 'facilities' | 'stadium' | 'museum' | 'house'
    stadiumSubMode: 'expand'    // 'expand' (Anéis 1-6) | 'new-arena' (Nova Arena)
  };

  // Tabela Única e Sincronizada do Museu (16 Níveis) - Corrige conflito 1/8 vs 1/16
  const AFM_MUSEUM_LEVELS = Array.from({ length: 16 }, (_, i) => {
    const level = i + 1;
    return {
      level,
      capacity: level * 2,
      cost: Math.round(50000 * Math.pow(1.45, i)),
      maintenance: 3500 + i * 1500,
      fanBonusPct: level * 3
    };
  });

  function getMuseumConfig(level = 1) {
    const safeLvl = Math.max(1, Math.min(16, Number(level) || 1));
    return AFM_MUSEUM_LEVELS[safeLvl - 1];
  }

  // Tabela de Preços da Nova Arena (Sincronizada com os <select> em tempo real)
  const AFM_NEW_ARENA_PRICING = {
    15000:  { label: 'Arena Regional',            workCost: 75000000,  months: 18 },
    30000:  { label: 'Caldeirão de Médio Porte',  workCost: 165000000, months: 24 },
    50000:  { label: 'Super Arena Série A',       workCost: 325000000, months: 30 },
    80000:  { label: 'Templo Monumental Mundial', workCost: 600000000, months: 36 },
    100000: { label: 'Mega Arena Monumental',     workCost: 850000000, months: 42 }
  };

  function formatBRL(val) {
    return 'R$ ' + Math.round(Number(val) || 0).toLocaleString('pt-BR');
  }

  /**
   * 1. Sincroniza os valores da Nova Arena dinamicamente ao trocar Capacidade ou Financiamento
   */
  function updateNewArenaCalculatorUI(state) {
    const capSelect = document.getElementById('selectArenaCap');
    const finSelect = document.getElementById('selectArenaFinancing');
    if (!capSelect) return;

    const cap = Number(capSelect.value) || 15000;
    const spec = AFM_NEW_ARENA_PRICING[cap] || AFM_NEW_ARENA_PRICING[15000];
    const landCost = state?.arenaLandBought ? 0 : (typeof window.arenaLandCost === 'function' ? window.arenaLandCost(cap) : 12000000);
    const permitCost = state?.arenaPermitBought ? 0 : (typeof window.arenaPermitCost === 'function' ? window.arenaPermitCost(cap) : 4500000);
    const totalCost = landCost + permitCost + spec.workCost;

    const workEl = document.getElementById('arenaCalcWorkCost');
    const totalEl = document.getElementById('arenaCalcTotalCost');
    const timeEl = document.getElementById('arenaCalcDuration');
    const installmentEl = document.getElementById('arenaCalcInstallment');

    if (workEl) workEl.textContent = formatBRL(spec.workCost);
    if (totalEl) totalEl.textContent = formatBRL(totalCost);
    if (timeEl) timeEl.textContent = `${spec.months} meses (${(spec.months / 12).toFixed(1)} anos)`;

    if (installmentEl && finSelect) {
      const mode = finSelect.value;
      if (mode === 'cash') {
        installmentEl.textContent = `À vista: ${formatBRL(spec.workCost)}`;
      } else {
        const monthsMap = { '4years': 48, '6years': 72, '8years': 96 };
        const n = monthsMap[mode] || 48;
        const downPayment = spec.workCost * 0.20;
        const monthly = (spec.workCost * 0.80 * 1.12) / n;
        installmentEl.textContent = `Entrada 20% (${formatBRL(downPayment)}) + ${n}x de ${formatBRL(monthly)}/mês`;
      }
    }
  }

  /**
   * 2. Ordenação e Contagem Unificada do Museu do Clube (Prioriza Taças do Save!)
   */
  function getUnifiedMuseumData(state) {
    const museumLvl = Number(state?.infrastructure?.museum?.level || state?.facilities?.museum || state?.museumData?.level || 1);
    const cfg = getMuseumConfig(museumLvl);
    const nextCfg = getMuseumConfig(Math.min(16, museumLvl + 1));

    // Taças conquistadas no save
    const saveTrophies = [];
    const seenSave = new Set();

    const addSaveTrophy = (name, year, badge) => {
      if (!name) return;
      const key = `${String(name).toLowerCase()}_${String(year || '').toLowerCase()}`;
      if (seenSave.has(key)) return;
      seenSave.add(key);
      saveTrophies.push({
        name: String(name).trim(),
        year: year ? String(year).trim() : `Temporada ${state?.season || 2026}`,
        badge: badge || 'CONQUISTA NO COMANDO',
        source: 'save',
        isFromSave: true,
        icon: '🏆'
      });
    };

    if (Array.isArray(state?.titles)) {
      state.titles.forEach(t => {
        if (typeof t === 'string') addSaveTrophy(t, `Temporada ${state?.season || 2026}`, 'CAMPEÃO NO SAVE');
        else if (t) addSaveTrophy(t.name || t.title, t.year || `Temporada ${state?.season || 2026}`, t.badge || 'CAMPEÃO NO SAVE');
      });
    }

    if (Array.isArray(state?.trophies)) {
      state.trophies.forEach(t => {
        if (typeof t === 'string') addSaveTrophy(t, `Temporada ${state?.season || 2026}`, 'CONQUISTA NO SAVE');
        else if (t) addSaveTrophy(t.name || t.title, t.year || `Temporada ${state?.season || 2026}`, t.badge || 'CONQUISTA NO SAVE');
      });
    }

    if (Array.isArray(state?.clubTrophies)) {
      state.clubTrophies.forEach(t => {
        if (typeof t === 'string') addSaveTrophy(t, `Temporada ${state?.season || 2026}`, 'CONQUISTA NO SAVE');
        else if (t) addSaveTrophy(t.name || t.title, t.year, t.badge);
      });
    }

    // Taças históricas do clube
    const historicalTrophies = [];
    const clubName = state?.club || 'Clube';
    if (Array.isArray(state?.historicalTitles) && state.historicalTitles.length > 0) {
      state.historicalTitles.forEach(h => {
        historicalTrophies.push({
          name: h.name || h.title || 'Título Histórico',
          year: h.year || 'Acervo Oficial Reconhecido',
          badge: h.badge || 'HISTÓRICO OFICIAL',
          source: 'history',
          icon: h.icon || '🏆'
        });
      });
    } else if (typeof window.getClubOwnHistoricalTrophies === 'function') {
      const hList = window.getClubOwnHistoricalTrophies(clubName, state);
      (Array.isArray(hList) ? hList : []).forEach(h => {
        historicalTrophies.push({
          name: h.name || 'Título Histórico',
          year: h.year || 'Acervo Oficial Reconhecido',
          badge: h.badge || 'HISTÓRICO OFICIAL',
          source: 'history',
          icon: h.icon || '🏆'
        });
      });
    } else {
      historicalTrophies.push(
        { name: `Campeonato Estadual / Regional (${clubName})`, year: 'Conquistas Históricas Oficiais', badge: 'HISTÓRICO OFICIAL', source: 'history', icon: '🥇' },
        { name: `Taça de Tradição & Acesso Nacional (${clubName})`, year: 'Acervo Oficial Reconhecido', badge: 'HISTÓRICO OFICIAL', source: 'history', icon: '🏆' },
        { name: 'Torneio Regional & Copa Estadual', year: 'Galeria Histórica de Troféus', badge: 'HISTÓRICO OFICIAL', source: 'history', icon: '🎖️' }
      );
    }

    // Taças conquistadas pelo jogador vêm PRIMEIRO na vitrine oficial para não ficarem no chão!
    const allTrophies = [...saveTrophies, ...historicalTrophies];
    const showcased = allTrophies.slice(0, cfg.capacity);
    const storedOut = allTrophies.slice(cfg.capacity);

    // Calcula nível necessário para acomodar todas as taças
    const neededLevel = Math.max(museumLvl, Math.min(16, Math.ceil(allTrophies.length / 2)));
    let skipCost = 0;
    for (let l = museumLvl; l < neededLevel; l++) {
      skipCost += getMuseumConfig(l).cost;
    }

    return {
      level: museumLvl,
      maxLevel: 16,
      capacity: cfg.capacity,
      upgradeCost: cfg.cost,
      nextCapacity: nextCfg.capacity,
      fanBonusPct: cfg.fanBonusPct,
      saveCount: saveTrophies.length,
      historyCount: historicalTrophies.length,
      totalCount: allTrophies.length,
      allTrophies,
      showcased,
      storedOut,
      hasOverflowPenalty: storedOut.length > 0,
      neededLevel,
      skipCost
    };
  }

  /**
   * 3. Validação Completa da Aba "Sua Casa & Bens Pessoais"
   */
  function evaluatePersonalAssetStatus(item, state) {
    const bankBalance = Number(state?.career?.cash ?? state?.managerMoney ?? state?.personalCash ?? state?.manager?.bankBalance ?? state?.personalBank ?? 0);
    const seasons = Number(state?.career?.seasonsCompleted ?? state?.manager?.seasonsCompleted ?? state?.historySeasons ?? 0);
    const titles = Number((state?.career?.titles || state?.titles || state?.trophies || state?.clubTrophies || state?.manager?.titles || []).length);
    const ownedIds = state?.housePurchases || state?.manager?.ownedAssets || [];

    const isOwned = ownedIds.includes(item.id);
    const reqSeasons = Number(item.reqType === 'seasons' ? item.reqVal : (item.reqSeasons || 0));
    const reqTitles = Number(item.reqType === 'titles' ? item.reqVal : (item.reqTitles || 0));

    let lockReason = null;
    if (reqSeasons > 0 && seasons < reqSeasons) {
      lockReason = `Exige ${reqSeasons} temporada(s) completa(s) no comando (Atual: ${seasons})`;
    } else if (reqTitles > 0 && titles < reqTitles) {
      lockReason = `Exige ${reqTitles} título(s) conquistado(s) na carreira (Atual: ${titles})`;
    }

    const itemCost = Number(item.cost || item.price || 0);
    const canAfford = bankBalance >= itemCost;

    return {
      isOwned,
      unlocked: !lockReason,
      isCareerLocked: Boolean(lockReason),
      lockReason,
      canAfford,
      itemCost,
      canBuy: !isOwned && !lockReason && canAfford
    };
  }

  /**
   * 4. Renderizadores Modulares para a Aba Estrutura
   */
  function renderUnifiedStadiumAndArenaTab(state) {
    const club = typeof window.clubByName === 'function' ? window.clubByName(state.club) : {};
    const realStadiumName = state.stadium?.name || club?.stadium || state.clubStadium || 'Estádio do Clube';
    const realStadiumCap = Number(state.stadium?.capacity || state.infrastructure?.stadium?.capacity || 18000);
    const realStadiumRing = Number(state.stadium?.ring || state.infrastructure?.stadium?.level || 2);
    const mode = (window.afmStructureUIState && window.afmStructureUIState.stadiumSubMode) || 'expand';

    return `
      <!-- CARD ÚNICO DO ESTÁDIO REAL DO CLUBE (SEM DUPLICAÇÃO E SEM "BEZERRÃO 15K") -->
      ${(typeof window.AFMStadium3D !== 'undefined' && window.AFMStadium3D.renderStadium3DCardHTML)
        ? window.AFMStadium3D.renderStadium3DCardHTML(state.club, {
            ...state,
            stadiumName: realStadiumName,
            stadiumCapacity: realStadiumCap,
            infrastructure: { ...(state.infrastructure||{}), stadium: { ...(state.infrastructure?.stadium||{}), level: realStadiumRing, capacity: realStadiumCap } }
          })
        : `
          <div class="card afm-stadium-3d-card" style="margin-top:16px;padding:20px;border:1px solid rgba(56,189,248,0.35);border-radius:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <div>
                <h2 style="margin:0;font-size:20px;font-weight:900;color:#fff;">
                  🏟️ ${realStadiumName} • Anel ${realStadiumRing} de 6
                </h2>
                <div class="muted" style="font-size:12px;margin-top:4px;">
                  Capacidade Atual Oficial: <b style="color:#a7ff3f;">${realStadiumCap.toLocaleString('pt-BR')} lugares</b>
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="btn primary" id="btnInspectStadium3D" data-struct-action="stadium-3d">
                  🎮 Inspecionar 3D (360°)
                </button>
                <button type="button" class="btn" id="btnOpenStadiumInteractive" data-struct-action="stadium-interactive">
                  🛠️ Melhorias & Setores
                </button>
              </div>
            </div>
          </div>
        `}

      <!-- SELETOR SEGMENTADO UNIFICADO: REFORMAR ATUAL vs CONSTRUIR NOVA ARENA -->
      <div style="display:flex;gap:10px;margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;">
        <button type="button" class="btn ${mode === 'expand' ? 'primary' : ''}" data-stadium-submode="expand" style="flex:1;min-width:240px;font-weight:900;padding:12px;font-size:13px;border-radius:10px;cursor:pointer;${mode === 'expand' ? 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;border:none' : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1)'}">
          🔨 AMPLIAR ESTÁDIO ATUAL (ANÉIS ATÉ 100K)
        </button>
        <button type="button" class="btn ${mode === 'new-arena' ? 'primary' : ''}" data-stadium-submode="new-arena" style="flex:1;min-width:240px;font-weight:900;padding:12px;font-size:13px;border-radius:10px;cursor:pointer;${mode === 'new-arena' ? 'background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:none' : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1)'}">
          🏛️ CONSTRUIR NOVA ARENA MONUMENTAL
        </button>
      </div>

      ${mode === 'expand' ? renderRingExpansionPanel(state) : renderNewArenaBuilderPanel(state)}
    `;
  }

  function renderRingExpansionPanel(state) {
    const stData = typeof window.getStadiumExpansionData === 'function' ? window.getStadiumExpansionData() : { ring: 2, maxRings: 6, sides: {} };
    const stadiumWork = stData.activeWork;
    const stadiumWorkDays = stadiumWork && typeof window.getStadiumWorkDaysRemaining === 'function' ? window.getStadiumWorkDaysRemaining(stadiumWork) : 0;
    const stadiumWorkProgress = stadiumWork ? Math.max(0, Math.min(100, Math.round(((Number(stadiumWork.durationDays) || 1) - stadiumWorkDays) / Math.max(1, Number(stadiumWork.durationDays) || 1) * 100))) : 0;
    const currentCap = Number(state.infrastructure?.stadium?.capacity || 18000);

    return `
      <!-- AMPLIAÇÃO ANEL POR ANEL ATÉ 100 MIL LUGARES -->
      <div class="card" style="margin-top:16px;padding:24px;background:#120f20;border:1px solid rgba(139,92,246,0.3);border-radius:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="margin:0;font-size:22px;font-weight:900;color:#fff;text-transform:uppercase">
              AMPLIAÇÃO ANEL POR ANEL: ANEL ${stData.ring} DE ${stData.maxRings}
            </h2>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px">
              O seu estádio pode crescer até 100 mil lugares, anel por anel. Cada anel tem 4 lados (Norte, Sul, Leste e Oeste). O próximo anel abre quando os 4 lados do anterior ficam prontos.
            </div>
          </div>
          <span class="pill good" style="font-size:14px;padding:6px 14px">
            Capacidade Atual: <b>${currentCap.toLocaleString('pt-BR')} lugares</b>
          </span>
        </div>

        <!-- 4 Lados do Anel Atual -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-top:20px">
          ${['norte','sul','leste','oeste'].map(side => {
            const isDone = stData.sides && stData.sides[side];
            const sideName = side.toUpperCase();
            const seatsGain = 3500;
            const cost = Math.round(850000 * 1.30);
            const sideWork = stadiumWork && stadiumWork.ring === stData.ring && stadiumWork.side === side ? stadiumWork : null;

            return `
              <div style="background:#181428;border:1px solid ${isDone ? '#22c55e' : 'rgba(255,255,255,0.08)'};border-radius:14px;padding:16px;text-align:center">
                <div style="font-size:11px;font-weight:800;color:rgba(255,255,255,0.5);letter-spacing:1px">LADO ${sideName}</div>
                <div style="font-size:22px;font-weight:900;color:${isDone ? '#22c55e' : '#fff'};margin-top:6px">
                  ${isDone ? 'CONCLUÍDO' : `+${seatsGain.toLocaleString('pt-BR')}`}
                </div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">
                  ${isDone ? 'Obra entregue' : `+${seatsGain.toLocaleString('pt-BR')} lugares • custo de ${formatBRL(cost)}`}
                </div>
                ${sideWork ? `
                  <div style="margin-top:12px;text-align:left;font-size:11px;color:#fbbf24;font-weight:800">OBRA EM ANDAMENTO · ${stadiumWorkDays} dias restantes</div>
                  <div style="height:8px;background:rgba(255,255,255,.09);border-radius:6px;overflow:hidden;margin-top:6px"><div style="width:${stadiumWorkProgress}%;height:100%;background:linear-gradient(90deg,#f59e0b,#22c55e)"></div></div>
                  <div style="font-size:10px;color:rgba(255,255,255,.55);margin-top:4px">${stadiumWorkProgress}% concluído</div>
                ` : ''}

                ${!isDone && !stadiumWork ? `
                  <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
                    <button class="btn primary btnBuildSide" data-side="${side}" data-mode="cash" style="padding:6px;font-size:11px;font-weight:800">
                      À Vista: ${formatBRL(cost)}
                    </button>
                    <button class="btn btnBuildSide" data-side="${side}" data-mode="6x" style="padding:6px;font-size:10px;background:rgba(124,58,237,0.2);border:1px solid #7c3aed">
                      6x de ${formatBRL(Math.round(cost*1.06/6))}
                    </button>
                    <button class="btn btnBuildSide" data-side="${side}" data-mode="12x" style="padding:6px;font-size:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                      12x de ${formatBRL(Math.round(cost*1.12/12))}
                    </button>
                  </div>
                ` : (isDone ? `
                  <div style="margin-top:16px;font-size:12px;color:#22c55e;font-weight:800">
                    ✓ 100% Liberado
                  </div>
                ` : `<div style="margin-top:12px;padding:10px;background:rgba(245,158,11,.08);border-radius:8px;font-size:11px;color:#fbbf24">Outra obra precisa ser concluída antes de iniciar um novo setor.</div>`)}
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top:18px;background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">
          💡 <b>Regras de Engenharia & Finanças:</b> Dá para pagar à vista ou parcelar em 6 ou 12 vezes (20% de entrada e parcelas com juros de 1% ao mês cobradas no dia 1º). As parcelas somadas não podem ultrapassar 30% da receita mensal do clube. Durante a obra, cerca de 3.500 lugares ficam interditados por segurança.
        </div>
      </div>
    `;
  }

  function renderNewArenaBuilderPanel(state) {
    const arenaData = typeof window.getNewArenaData === 'function' ? window.getNewArenaData() : { underConstruction: false };
    const arenaCapacity = typeof window.getSelectedArenaCapacity === 'function' ? window.getSelectedArenaCapacity() : 15000;
    const landCost = typeof window.arenaLandCost === 'function' ? window.arenaLandCost(arenaCapacity) : 12000000;
    const permitCost = typeof window.arenaPermitCost === 'function' ? window.arenaPermitCost(arenaCapacity) : 4500000;
    const workCost = typeof window.calcArenaTotalCost === 'function' ? window.calcArenaTotalCost(arenaCapacity) : 75000000;
    const totalProjectCost = landCost + permitCost + workCost;

    if (arenaData.underConstruction) {
      return `
        <!-- CASO JÁ ESTEJA EM OBRAS -->
        <div class="card" style="margin-top:16px;padding:24px;background:#120f20;border:1px solid rgba(34,197,94,0.4);border-radius:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
            <div>
              <span class="pill good" style="font-size:11px;font-weight:900">🏗️ OBRAS EM ANDAMENTO A TODO VAPOR</span>
              <h2 style="margin:6px 0 0 0;font-size:24px;font-weight:900;color:#fff">${arenaData.name || 'Nova Arena'}</h2>
              <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px">
                Capacidade: <b style="color:#facc15">${(arenaData.capacity||45000).toLocaleString('pt-BR')} lugares</b> · Faltam <b>${arenaData.roundsRemaining} meses / rodadas</b> para a grande inauguração!
              </div>
            </div>
            <span class="pill" style="background:#22c55e;color:#000;font-weight:900">Em Construção</span>
          </div>

          <div style="margin-top:20px;background:#181428;padding:18px;border-radius:14px;border:1px solid rgba(255,255,255,0.08)">
            <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;color:rgba(255,255,255,0.7);margin-bottom:8px">
              <span>Progresso Físico da Obra:</span>
              <span>${Math.round(((arenaData.roundsTotal - arenaData.roundsRemaining) / (arenaData.roundsTotal || 1)) * 100)}% Concluído</span>
            </div>
            <div style="width:100%;height:14px;background:rgba(255,255,255,0.06);border-radius:7px;overflow:hidden">
              <div style="width:${Math.max(5, Math.round(((arenaData.roundsTotal - arenaData.roundsRemaining) / (arenaData.roundsTotal || 1)) * 100))}%;height:100%;background:linear-gradient(90deg, #0284c7, #22c55e);border-radius:7px"></div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-top:16px">
              <div style="background:#110e1d;padding:12px;border-radius:10px">
                <span class="muted" style="font-size:11px">Lote & Terreno:</span>
                <div style="font-size:13px;font-weight:800;color:#22c55e;margin-top:2px">✓ Escriturado & Registrado</div>
              </div>
              <div style="background:#110e1d;padding:12px;border-radius:10px">
                <span class="muted" style="font-size:11px">Alvará & Licenças:</span>
                <div style="font-size:13px;font-weight:800;color:#22c55e;margin-top:2px">✓ Licença Municipal Aprovada</div>
              </div>
              <div style="background:#110e1d;padding:12px;border-radius:10px">
                <span class="muted" style="font-size:11px">Forma de Pagamento:</span>
                <div style="font-size:13px;font-weight:800;color:#facc15;margin-top:2px">${arenaData.monthly ? `${formatBRL(arenaData.monthly)}/mês` : 'Quitado 100% à vista'}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <!-- PLANEJAMENTO E CONSTRUÇÃO DA NOVA ARENA (SEM CARD 3D DUPLICADO) -->
      <div class="card" style="margin-top:16px;padding:24px;background:#120f20;border:1px solid rgba(2,132,199,0.3);border-radius:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="margin:0;font-size:22px;font-weight:900;color:#fff;text-transform:uppercase">
              CONSTRUIR UMA NOVA ARENA DO CLUBE
            </h2>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px">
              Erga um estádio novo monumental para o seu clube de 15 mil até 100 mil lugares.
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="pill good" style="font-size:12px;font-weight:900">💰 Saldo em Caixa: ${formatBRL(state.balance)}</span>
            <span class="pill" style="background:#0284c7;color:#fff;font-weight:800">Projeto Megalomaníaco</span>
          </div>
        </div>

        <!-- ETAPA 1: REGULARIZAÇÃO LEGAL E AQUISIÇÃO DO LOTE/ALVARÁ -->
        <div style="margin-top:20px;background:#161224;padding:18px;border-radius:14px;border:1px solid rgba(139,92,246,0.35)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">
            <div style="font-size:13px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:1px">
              📋 ETAPA 1: PRÉ-REQUISITOS LEGAIS (OBRIGATÓRIO PARA APROVAÇÃO DO PROJETO)
            </div>
            <span class="pill ${state.arenaLandBought && state.arenaPermitBought ? 'good' : 'warning'}" style="font-size:11px;font-weight:900">
              ${state.arenaLandBought && state.arenaPermitBought ? '✓ REQUISITOS QUITADOS · LIBERADO PARA CONSTRUIR' : '⚠️ REGULARIZE O LOTE E O ALVARÁ ABAIXO'}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px">
            <!-- CARD 1: LOTE URBANO -->
            <div style="background:#110e1d;padding:14px;border-radius:12px;border:1px solid ${state.arenaLandBought?'rgba(34,197,94,0.4)':'rgba(255,255,255,0.1)'}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <b style="font-size:12px;color:#fff">🏙️ Lote Urbano (Terreno Comercial)</b>
                <span class="pill ${state.arenaLandBought?'good':'warning'}" style="font-size:10px;font-weight:900">
                  ${state.arenaLandBought ? 'ESCRITURADO ✓' : 'PENDENTE'}
                </span>
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:4px;line-height:1.4">
                ${state.arenaLandBought ? 'Área de 180.000 m² escriturada e averbada em cartório no nome do clube.' : 'Aquisição do terreno para o complexo, arquibancadas e estacionamento.'}
              </div>
              ${state.arenaLandBought ? `
                <div style="margin-top:10px;font-size:12px;color:#22c55e;font-weight:900">✓ Quitado & Regularizado (${formatBRL(landCost)})</div>
              ` : `
                <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
                  <button class="btn primary" id="btnBuyArenaLandPage" style="background:#0284c7;font-weight:900;font-size:11px;padding:8px 12px;border-radius:8px;cursor:pointer">
                    🛒 Comprar Lote à Vista • ${formatBRL(landCost)}
                  </button>
                  <button class="btn" id="btnFinanceArenaLandPage" style="background:rgba(2,132,199,0.18);border:1px solid #0284c7;color:#38bdf8;font-weight:800;font-size:10px;padding:6px 10px;border-radius:8px;cursor:pointer" title="Entrada de 10% e 24 parcelas">
                    🏛️ Financiamento Municipal (10% entrada: ${formatBRL(Math.round(landCost*0.1))})
                  </button>
                </div>
              `}
            </div>

            <!-- CARD 2: ALVARÁ DA PREFEITURA -->
            <div style="background:#110e1d;padding:14px;border-radius:12px;border:1px solid ${state.arenaPermitBought?'rgba(34,197,94,0.4)':'rgba(255,255,255,0.1)'}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <b style="font-size:12px;color:#fff">🏛️ Alvará de Construção & Licenças</b>
                <span class="pill ${state.arenaPermitBought?'good':'warning'}" style="font-size:10px;font-weight:900">
                  ${state.arenaPermitBought ? 'EMITIDO ✓' : 'PENDENTE'}
                </span>
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:4px;line-height:1.4">
                ${state.arenaPermitBought ? 'Licença ambiental, trânsito e Corpo de Bombeiros totalmente autorizados.' : 'Estudo de impacto de vizinhança (EIV) e taxas de aprovação civil na Prefeitura.'}
              </div>
              ${state.arenaPermitBought ? `
                <div style="margin-top:10px;font-size:12px;color:#22c55e;font-weight:900">✓ Aprovado & Emitido (${formatBRL(permitCost)})</div>
              ` : `
                <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
                  <button class="btn primary" id="btnBuyArenaPermitPage" style="background:#7c3aed;font-weight:900;font-size:11px;padding:8px 12px;border-radius:8px;cursor:pointer">
                    🏛️ Emitir Alvará à Vista • ${formatBRL(permitCost)}
                  </button>
                  <button class="btn" id="btnFinanceArenaPermitPage" style="background:rgba(124,58,237,0.18);border:1px solid #7c3aed;color:#c084fc;font-weight:800;font-size:10px;padding:6px 10px;border-radius:8px;cursor:pointer" title="Entrada de 10% e 24 parcelas">
                    📋 Parcelar Taxas e Alvará (10% entrada: ${formatBRL(Math.round(permitCost*0.1))})
                  </button>
                </div>
              `}
            </div>
          </div>

          ${(!state.arenaLandBought && !state.arenaPermitBought) ? `
            <div style="margin-top:10px">
              <button class="btn" id="btnBuyBothArenaReqsPage" style="width:100%;background:linear-gradient(135deg, #0284c7 0%, #7c3aed 100%);color:#fff;font-weight:900;font-size:12px;padding:10px;border-radius:10px;border:none;cursor:pointer">
                ⚡ Regularizar Terreno e Alvará Juntos (Pacote Completo) • ${formatBRL(landCost + permitCost)}
              </button>
            </div>
          ` : ''}
        </div>

        <!-- ETAPA 2: PROJETO ARQUITETÔNICO, CAPACIDADE & FINANCIAMENTO -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:20px;margin-top:20px">
          <div style="background:#181428;padding:20px;border-radius:14px;border:1px solid rgba(255,255,255,0.08)">
            <label style="font-size:12px;font-weight:800;color:rgba(255,255,255,0.7)">1. ESCOLHA O NOME DA SUA NOVA ARENA:</label>
            <select id="selectArenaName" class="btn" style="width:100%;margin-top:6px;background:#120f20;border:1px solid #0284c7;color:#fff;font-size:13px;font-weight:800;padding:10px">
              <option value="Arena ${state.club}">Arena ${state.club}</option>
              <option value="Novo Estádio do ${state.club}">Novo Estádio do ${state.club} Monumental</option>
              <option value="${state.club} Park">${state.club} Park</option>
              <option value="Coliseu do ${state.club}">Coliseu do ${state.club}</option>
              <option value="Arena Real">Arena Real</option>
              <option value="Arena do Cerrado">Arena do Cerrado</option>
            </select>

            <label style="display:block;margin-top:16px;font-size:12px;font-weight:800;color:rgba(255,255,255,0.7)">2. ESCOLHA O TAMANHO DO ESTÁDIO (CAPACIDADE PROJETADA):</label>
            <select id="selectArenaCap" class="btn" style="width:100%;margin-top:6px;background:#120f20;border:1px solid #0284c7;color:#fff;font-size:13px;font-weight:800;padding:10px">
              <option value="15000" ${arenaCapacity===15000?'selected':''}>15.000 lugares (Arena Regional) • ${formatBRL(AFM_NEW_ARENA_PRICING[15000].workCost)}</option>
              <option value="30000" ${arenaCapacity===30000?'selected':''}>30.000 lugares (Caldeirão de Médio Porte) • ${formatBRL(AFM_NEW_ARENA_PRICING[30000].workCost)}</option>
              <option value="50000" ${arenaCapacity===50000?'selected':''}>50.000 lugares (Super Arena Série A) • ${formatBRL(AFM_NEW_ARENA_PRICING[50000].workCost)}</option>
              <option value="80000" ${arenaCapacity===80000?'selected':''}>80.000 lugares (Templo Monumental Mundial) • ${formatBRL(AFM_NEW_ARENA_PRICING[80000].workCost)}</option>
              <option value="100000" ${arenaCapacity===100000?'selected':''}>100.000 lugares (Mega Arena Monumental) • ${formatBRL(AFM_NEW_ARENA_PRICING[100000].workCost)}</option>
            </select>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:10px">
              <div class="card" style="padding:10px"><div class="small muted">Terreno</div><b>${formatBRL(landCost)}</b></div>
              <div class="card" style="padding:10px"><div class="small muted">Alvará e licenças</div><b>${formatBRL(permitCost)}</b></div>
              <div class="card" style="padding:10px"><div class="small muted">Obra</div><b id="arenaCalcWorkCost">${formatBRL(workCost)}</b></div>
              <div class="card" style="padding:10px;border-color:rgba(34,197,94,.35)"><div class="small muted">Total do projeto</div><b id="arenaCalcTotalCost" style="color:#4ade80">${formatBRL(totalProjectCost)}</b></div>
            </div>

            <label style="display:block;margin-top:16px;font-size:12px;font-weight:800;color:rgba(255,255,255,0.7)">3. FORMA DE PAGAMENTO DA OBRA:</label>
            <select id="selectArenaFinancing" class="btn" style="width:100%;margin-top:6px;background:#120f20;border:1px solid #0284c7;color:#fff;font-size:13px;font-weight:800;padding:10px">
              <option value="cash">Pagamento à Vista (Sem juros e desconto imediato)</option>
              <option value="4years">Financiamento em 4 anos (20% de entrada + 48 parcelas mensais)</option>
              <option value="6years">Financiamento em 6 anos (20% de entrada + 72 parcelas mensais)</option>
              <option value="8years">Financiamento em 8 anos (20% de entrada + 96 parcelas mensais)</option>
            </select>
            <div id="arenaCalcInstallment" style="font-size:11px;color:#facc15;font-weight:800;margin-top:6px">
              À vista: ${formatBRL(workCost)}
            </div>

            <div style="margin-top:20px">
              <button class="btn ${state.arenaLandBought && state.arenaPermitBought ? 'success' : 'primary'}" id="btnStartNewArenaProject" style="width:100%;padding:14px;background:${state.arenaLandBought && state.arenaPermitBought ? '#22c55e' : '#0284c7'};border:none;font-weight:900;font-size:14px;border-radius:10px;cursor:pointer;box-shadow:${state.arenaLandBought && state.arenaPermitBought ? '0 4px 18px rgba(34,197,94,0.4)' : 'none'}">
                ${state.arenaLandBought && state.arenaPermitBought ? '🚀 Iniciar Construção da Nova Arena (Liberado ✓)' : '🏛️ Iniciar Construção da Nova Arena'}
              </button>
            </div>
          </div>

          <div style="background:#181428;padding:20px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;justify-content:center">
            <h3 style="margin:0 0 10px 0;font-size:16px;color:#fff">Como funciona a Nova Arena:</h3>
            <ul style="margin:0;padding-left:18px;font-size:12px;color:rgba(255,255,255,0.7);line-height:1.6">
              <li>Prazo estimado da obra: <b id="arenaCalcDuration">${(AFM_NEW_ARENA_PRICING[arenaCapacity] || AFM_NEW_ARENA_PRICING[15000]).months} meses</b>.</li>
              <li>Até a inauguração, o clube <b>continua jogando no estádio atual sem fechar nenhum lugar</b>.</li>
              <li>Na inauguração, o clube se muda com grande festa da torcida e novo público recorde.</li>
              <li>Dá para pagar à vista ou financiado em 4, 6 ou 8 anos com 20% de entrada.</li>
              <li><b>Lote Urbano e Alvará</b> são obrigatórios para licenciar o canteiro de obras.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  function renderUnifiedMuseumTab(state) {
    const uMuseum = getUnifiedMuseumData(state);
    const clubName = state?.club || 'Clube';

    return `
      <!-- MUSEU DO CLUBE: SINCRONIZADO EM 16 NÍVEIS COM TAÇAS DO SAVE PRIORIZADAS -->
      <div class="card" style="margin-top:16px;padding:24px;background:#120f20;border:1px solid rgba(245,158,11,0.3);border-radius:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="margin:0;font-size:22px;font-weight:900;color:#fff;text-transform:uppercase">
              MUSEU DO CLUBE: ESTANTE DE TROFÉUS (NÍVEL ${uMuseum.level}/16)
            </h2>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px">
              Capacidade da Vitrine: <b>${uMuseum.capacity} taças</b> • Total no acervo: <b>${uMuseum.totalCount} títulos</b>
            </div>
          </div>
          <button class="btn primary btnUpgradeMuseum" data-facility="museum" style="background:#f59e0b;color:#000;font-weight:900;padding:8px 18px;border:none">
            Evoluir Museu • ${formatBRL(uMuseum.upgradeCost)}
          </button>
        </div>

        ${uMuseum.hasOverflowPenalty ? `
          <div style="margin-top:16px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:12px;padding:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
            <div style="color:#fca5a5;font-size:13px">
              ⚠️ <b>Falta espaço na vitrine!</b> Há <b>${uMuseum.storedOut.length} taça(s) guardada(s) fora da vitrine</b>. Enquanto houver taça no chão, a felicidade da torcida fica reduzida pela metade!
            </div>
            <button class="btn danger" id="btnSkipUpgradeMuseum" style="font-weight:900;font-size:12px;padding:8px 14px;cursor:pointer">
              ⚡ Oferta: Ampliar para Nível ${uMuseum.neededLevel} (${formatBRL(uMuseum.skipCost)})
            </button>
          </div>
        ` : ''}

        <!-- Vitrine Oficial: PRIORIDADE MÁXIMA PARA TAÇAS CONQUISTADAS NO SAVE -->
        <h3 style="margin:20px 0 10px 0;font-size:15px;color:#fff;display:flex;align-items:center;gap:8px">
          <span>🏆</span> <span>Taças em Exibição na Vitrine Oficial (${uMuseum.showcased.length}/${uMuseum.capacity})</span>
        </h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:10px">
          ${uMuseum.showcased.length ? uMuseum.showcased.map(t => {
            const isSave = t.source === 'save';
            return `
              <div style="background:${isSave ? '#1e1b4b' : '#1c1730'};border:1px solid ${isSave ? '#a855f7' : '#f59e0b'};border-radius:10px;padding:12px;text-align:center;box-shadow:${isSave ? '0 4px 14px rgba(168,85,247,0.3)' : 'none'}">
                <div style="font-size:28px">${t.icon || '🏆'}</div>
                <div style="font-size:12px;font-weight:800;color:#fff;margin-top:4px">${t.name}</div>
                <div style="font-size:11px;color:${isSave ? '#c4b5fd' : '#cbd5e1'};margin-top:2px">(${t.year})</div>
                <div style="font-size:9px;color:${isSave ? '#34d399' : '#f59e0b'};font-weight:900;margin-top:6px">${t.badge}</div>
              </div>
            `;
          }).join('') : '<div style="grid-column:1/-1;padding:18px;text-align:center;color:#94a3b8;background:#1c1730;border:1px dashed #475569;border-radius:10px">Nenhuma taça conquistada ainda. Sua história começa nesta carreira.</div>'}
        </div>

        ${uMuseum.storedOut.length > 0 ? `
          <h3 style="margin:20px 0 10px 0;font-size:15px;color:#ef4444;display:flex;align-items:center;gap:8px">
            <span>📦</span> <span>Guardadas Fora da Vitrine (Falta Espaço)</span>
          </h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:10px">
            ${uMuseum.storedOut.map(t => `
              <div style="background:#181428;border:1px dashed rgba(239,68,68,0.5);border-radius:10px;padding:12px;text-align:center;opacity:0.7">
                <div style="font-size:28px;filter:grayscale(1)">${t.icon || '🏆'}</div>
                <div style="font-size:12px;font-weight:800;color:#fff;margin-top:4px">${t.name}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">(${t.year})</div>
                <div style="font-size:9px;color:#ef4444;font-weight:800;margin-top:6px">GUARDADA FORA</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderUnifiedHouseTab(state) {
    const bankBalance = Number(state?.managerMoney ?? state?.personalCash ?? state?.manager?.bankBalance ?? 57000);
    const houseItems = (typeof window.HOUSE_ITEMS !== 'undefined' ? window.HOUSE_ITEMS : []).filter(item => !item.isLicense && item.category !== 'Curso');
    const ownedIds = state?.housePurchases || state?.manager?.ownedAssets || [];
    const ownedItems = houseItems.filter(i => ownedIds.includes(i.id));
    const totalPurchasedValue = ownedItems.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
    const totalNetWorth = bankBalance + totalPurchasedValue;
    const prestigeBonus = ownedItems.length * 2;

    return `
      <!-- SUA CASA & BENS PESSOAIS DO TREINADOR -->
      <div class="card" style="margin-top:16px;padding:24px;background:#120f20;border:1px solid rgba(16,185,129,0.3);border-radius:18px">
        <!-- CABEÇALHO COM BOTÕES DE NAVEGAÇÃO E SALDO -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="margin:0;font-size:22px;font-weight:900;color:#fff;text-transform:uppercase">
              SUA CASA & PATRIMÔNIO PESSOAL
            </h2>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px">
              Imóveis de alto padrão, veículos esportivos, coleções e bens de luxo adquiridos na carreira.
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <button id="btnGoToManagerCareerFromHouse" type="button" class="btn" style="background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px">
              💼 Ir para Carreira & Negócios
            </button>
            <button id="btnOpenCbfLicensesFromHouse" type="button" style="background:rgba(15,23,42,0.85);color:#38bdf8;border:1px solid rgba(56,189,248,0.45);border-radius:10px;padding:10px 14px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;">
              🎓 CURSOS & LICENÇAS (CBF & UEFA)
            </button>
            <span class="pill" style="background:#059669;color:#fff;font-weight:800">
              🏦 Saldo no Banco: ${formatBRL(bankBalance)}
            </span>
          </div>
        </div>

        <!-- RESUMO DE PATRIMÔNIO SUPERIOR -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:16px;padding:14px;background:#181428;border:1px solid rgba(255,255,255,0.08);border-radius:12px">
          <div>
            <span class="muted" style="font-size:11px;text-transform:uppercase;font-weight:800">💎 Patrimônio Pessoal Total</span>
            <div style="font-size:18px;font-weight:900;color:#22c55e;margin-top:2px">${formatBRL(totalNetWorth)}</div>
          </div>
          <div>
            <span class="muted" style="font-size:11px;text-transform:uppercase;font-weight:800">🏡 Bens Adquiridos</span>
            <div style="font-size:18px;font-weight:900;color:#38bdf8;margin-top:2px">${ownedItems.length} de ${houseItems.length} bens</div>
          </div>
          <div>
            <span class="muted" style="font-size:11px;text-transform:uppercase;font-weight:800">⭐ Prestígio Social</span>
            <div style="font-size:18px;font-weight:900;color:#facc15;margin-top:2px">+${prestigeBonus} pts bônus</div>
          </div>
        </div>

        <!-- GRID DE BENS PESSOAIS COM VALIDAÇÃO DUPLA -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:14px;margin-top:20px">
          ${houseItems.map(item => {
            const status = evaluatePersonalAssetStatus(item, state);
            return `
              <div style="background:#181428;border:1px solid ${status.isOwned ? '#10b981' : status.isCareerLocked ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.1)'};border-radius:14px;padding:16px;${status.isCareerLocked ? 'box-shadow:inset 0 0 12px rgba(239,68,68,0.08);' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="pill" style="font-size:10px;background:rgba(255,255,255,0.06)">${item.category}</span>
                  ${status.isOwned ? '<span style="color:#10b981;font-weight:900;font-size:11px">ADQUIRIDO ✓</span>' : (status.isCareerLocked ? '<span style="color:#f87171;font-weight:900;font-size:10px">🔒 BLOQUEADO</span>' : '')}
                </div>
                <h3 style="margin:8px 0 4px 0;font-size:15px;color:#fff">${item.name}</h3>
                <div style="font-size:14px;font-weight:900;color:#22c55e">${formatBRL(status.itemCost)}</div>
                <div style="font-size:11px;color:${status.isCareerLocked ? '#fca5a5' : 'rgba(255,255,255,0.5)'};margin-top:6px;min-height:30px">
                  ${status.isCareerLocked ? `🔒 ${status.lockReason}` : item.reqText}
                </div>

                ${!status.isOwned ? `
                  <button class="btn ${status.canBuy ? 'primary' : ''} btnBuyHouseItem" data-item-id="${item.id}" ${!status.canBuy ? 'disabled' : ''} style="width:100%;margin-top:10px;padding:8px;font-size:12px;font-weight:800;${status.isCareerLocked ? 'background:rgba(239,68,68,0.15);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);cursor:not-allowed;' : ''}">
                    ${status.isCareerLocked ? '🔒 Requisito Pendente' : (!status.canAfford ? 'Saldo Insuficiente no Banco' : 'Comprar com Saldo Bancário')}
                  </button>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ============================================================================
  // DELEGAÇÃO DE EVENTOS UNIFICADA DA ABA ESTRUTURA
  // ============================================================================
  if (!window.__AFM_STRUCTURE_BOUND__) {
    window.__AFM_STRUCTURE_BOUND__ = true;

    document.addEventListener('click', (e) => {
      // 1. Sub-abas principais (com redirecionamento automático de 'arena' -> 'stadium')
      const structTabBtn = e.target.closest('[data-struct-tab]');
      if (structTabBtn) {
        e.preventDefault();
        const targetTab = structTabBtn.dataset.structTab;
        if (targetTab === 'arena') {
          window.afmStructureUIState.activeSubTab = 'stadium';
          window.afmStructureUIState.stadiumSubMode = 'new-arena';
          window.structureSubTab = 'stadium';
        } else {
          window.afmStructureUIState.activeSubTab = targetTab;
          window.structureSubTab = targetTab;
        }
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 2. Alternância interna dentro da aba unificada "Estádio & Nova Arena"
      const stadiumModeBtn = e.target.closest('[data-stadium-submode]');
      if (stadiumModeBtn) {
        e.preventDefault();
        window.afmStructureUIState.stadiumSubMode = stadiumModeBtn.dataset.stadiumSubmode;
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 3. Botão "Setores & Obras" no card 3D abre diretamente a aba unificada no modo Expansão
      const expBtn = e.target.closest('.btn-open-stadium-expansion');
      if (expBtn) {
        e.preventDefault();
        window.afmStructureUIState.activeSubTab = 'stadium';
        window.afmStructureUIState.stadiumSubMode = 'expand';
        window.structureSubTab = 'stadium';
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 4. Botão "Cursos & Licenças (CBF & UEFA)" dentro de "Sua Casa & Bens Pessoais"
      if (e.target.closest('#btnOpenCbfLicensesFromHouse')) {
        e.preventDefault();
        if (typeof window.openCbfLicensesModal === 'function') {
          window.openCbfLicensesModal();
        } else if (typeof window.openLicensesModal === 'function') {
          window.openLicensesModal();
        } else if (window.AFM_LicensesModal && typeof window.AFM_LicensesModal.open === 'function') {
          window.AFM_LicensesModal.open();
        } else {
          window.afmPendingOpenLicensesModal = true;
          const careerNav = document.querySelector('[data-view="carreira"]');
          if (careerNav) careerNav.click();
        }
        return;
      }

      // 5. Botão "Ir para Carreira & Negócios"
      if (e.target.closest('#btnGoToManagerCareerFromHouse')) {
        e.preventDefault();
        const careerNav = document.querySelector('[data-view="carreira"]');
        if (careerNav) careerNav.click();
        return;
      }

      // 6. Oferta de ampliar vitrine de uma vez no Museu
      const skipMuseumBtn = e.target.closest('#btnSkipUpgradeMuseum');
      if (skipMuseumBtn && window.state) {
        e.preventDefault();
        const mData = getUnifiedMuseumData(window.state);
        if (window.state.balance < mData.skipCost) {
          if (typeof window.toast === 'function') window.toast(`Caixa insuficiente! Necessário ${formatBRL(mData.skipCost)}`);
          return;
        }
        window.state.balance -= mData.skipCost;
        if (!window.state.infrastructure) window.state.infrastructure = {};
        if (!window.state.infrastructure.museum) window.state.infrastructure.museum = { level: 1 };
        window.state.infrastructure.museum.level = mData.neededLevel;
        if (window.state.museumData) window.state.museumData.level = mData.neededLevel;
        if (typeof window.save === 'function') window.save();
        if (typeof window.render === 'function') window.render();
        if (typeof window.toast === 'function') window.toast(`Vitrine ampliada com sucesso para o Nível ${mData.neededLevel}!`);
        return;
      }
    }, true);

    document.addEventListener('change', (e) => {
      if (e.target && (e.target.id === 'selectArenaCap' || e.target.id === 'selectArenaFinancing')) {
        updateNewArenaCalculatorUI(window.state);
      }
    });
  }

  // Exporta globalmente
  window.AFM_StructureStadium = {
    getMuseumConfig,
    updateNewArenaCalculatorUI,
    getUnifiedMuseumData,
    evaluatePersonalAssetStatus,
    renderUnifiedStadiumAndArenaTab,
    renderRingExpansionPanel,
    renderNewArenaBuilderPanel,
    renderUnifiedMuseumTab,
    renderUnifiedHouseTab,
    pricing: AFM_NEW_ARENA_PRICING,
    museumLevels: AFM_MUSEUM_LEVELS
  };

  window.getMuseumConfig = getMuseumConfig;
  window.getUnifiedMuseumData = getUnifiedMuseumData;
  window.evaluatePersonalAssetStatus = evaluatePersonalAssetStatus;
  window.renderUnifiedStadiumAndArenaTab = renderUnifiedStadiumAndArenaTab;
  window.renderUnifiedMuseumTab = renderUnifiedMuseumTab;
  window.renderUnifiedHouseTab = renderUnifiedHouseTab;
})(typeof window !== 'undefined' ? window : global);
