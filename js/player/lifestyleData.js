/**
 * AFM Manager 2026 - Lifestyle & Financial Engine
 * js/player/lifestyleData.js
 *
 * Catálogos e motor completo de Estilo de Vida, Chuteiras com Durabilidade,
 * Staff Pessoal de Alta Performance (8 profissionais), Bens de Luxo com Financiamento 12x,
 * Negócios, Investimentos (CDB, Aluguéis, Escolinha, Marca Própria), Campanhas de Mídia
 * e Livro-Razão de Transações Financeiras (Extrato dos últimos meses).
 */

(function () {
  "use strict";

  // =========================================================================
  // 1. CATÁLOGO DE CHUTEIRAS COM DURABILIDADE & BÔNUS REAIS
  // =========================================================================
  const AFM_BOOTS_CATALOG = [
    {
      id: "boots_basic",
      name: "Chuteira Sintética Clássica",
      price: 450,
      maxDurability: 15,
      bonusText: "+1 Velocidade & Arranque",
      stats: { pace: 1, vel: 1 },
      icon: "👟",
      tier: "Iniciante",
      description: "Modelo de entrada resistente e confiável para os primeiros treinos na base."
    },
    {
      id: "boots_kangaroo",
      name: "Chuteira Couro Canguru Pro",
      price: 1200,
      maxDurability: 25,
      bonusText: "+2 Passe & Visão",
      stats: { passing: 2, pas: 2 },
      icon: "⚽",
      tier: "Profissional",
      description: "Couro macio premium para toque refinado, lançamentos milimétricos e controle absoluto."
    },
    {
      id: "boots_precision",
      name: "Chuteira Precision Grip Elite",
      price: 2800,
      maxDurability: 35,
      bonusText: "+2 Finalização & +1 Drible",
      stats: { shooting: 2, chu: 2, dribbling: 1, dri: 1 },
      icon: "🎯",
      tier: "Elite",
      description: "Zonas emborrachadas de aderência para curvas letais na bola e arremates certeiros."
    },
    {
      id: "boots_carbon",
      name: "Chuteira Carbon Speed Pro",
      price: 6500,
      maxDurability: 45,
      bonusText: "+3 Velocidade & +2 Arranque",
      stats: { pace: 3, vel: 3 },
      icon: "⚡",
      tier: "Alta Performance",
      description: "Solado de fibra de carbono ultraleve para explosão máxima em arrancadas e contra-ataques."
    },
    {
      id: "boots_signature",
      name: "Chuteira Diamond Signature Ouro",
      price: 18000,
      maxDurability: 60,
      bonusText: "+3 Finalização, +2 Fama & +R$ 250/gol",
      stats: { shooting: 3, chu: 3, fameMult: 1.2, goalCashBonus: 250 },
      icon: "💎",
      tier: "Assinatura Mundial",
      description: "Personalizada com detalhes folheados a ouro, travas de titânio e bônus financeiro a cada gol."
    }
  ];

  // =========================================================================
  // 2. CATÁLOGO DE STAFF PESSOAL DE ALTA PERFORMANCE (8 PROFISSIONAIS)
  // =========================================================================
  const AFM_STAFF_CATALOG = [
    {
      id: "personal_trainer",
      name: "Personal Trainer de Alta Performance",
      role: "Preparação Física Particular",
      category: "fitness",
      hireCost: 3500,
      monthlyCost: 1000,
      monthlyCostBase: 1000,
      bonusText: "+20% de ganho de XP semanal/pós-jogos e menor perda de físico",
      icon: "🏋️‍♂️",
      description: "Treinos individualizados de potência muscular, pliometria e aceleração."
    },
    {
      id: "physio",
      name: "Fisioterapeuta & Recovery Exclusivo",
      role: "Recuperação Muscular & Crioterapia",
      category: "medical",
      hireCost: 4500,
      monthlyCost: 1200,
      monthlyCostBase: 1200,
      bonusText: "Recupera estamina 35% mais rápido entre jogos e previne fadiga crônica",
      icon: "🩺",
      description: "Banhos de gelo, botas pneumáticas de compressão e liberação miofascial imediata."
    },
    {
      id: "nutritionist",
      name: "Nutricionista Esportivo & Chef Particular",
      role: "Bioquímica e Nutrição de Elite",
      category: "nutrition",
      hireCost: 4000,
      monthlyCost: 1100,
      monthlyCostBase: 1100,
      bonusText: "+5% de precisão nos chutes, energia máxima e consistência nas notas",
      icon: "🥗",
      description: "Cardápio hipercalórico balanceado milimetricamente para dias de jogo e descanso."
    },
    {
      id: "marketing_team",
      name: "Equipe de Marketing & Social Media (FootGram)",
      role: "Assessoria de Imprensa, Mídia & RP",
      category: "marketing",
      hireCost: 5500,
      monthlyCost: 1500,
      monthlyCostBase: 1500,
      bonusText: "Crescimento orgânico contínuo no FootGram (+50 a +350 seg/semana) e atrai melhores marcas",
      icon: "📱",
      description: "Criação diária de conteúdo, reels profissionais, relacionamento com marcas e blindagem de crises."
    },
    {
      id: "mental_coach",
      name: "Psicólogo Esportivo & Mental Coach",
      role: "Psicologia Esportiva & Foco Mental",
      category: "mental",
      hireCost: 3800,
      monthlyCost: 950,
      monthlyCostBase: 950,
      bonusText: "Moral blindada em derrotas e bônus de frieza em clássicos, finais e pênaltis",
      icon: "🧠",
      description: "Controle de ansiedade pré-jogo, foco inabalável sob pressão e mindset campeão."
    },
    {
      id: "security_driver",
      name: "Segurança Pessoal & Motorista Executivo",
      role: "Logística & Proteção de Celebridade",
      category: "security",
      hireCost: 6000,
      monthlyCost: 1800,
      monthlyCostBase: 1800,
      bonusText: "Proteção contra assédio da torcida/mídia e pontualidade 100% garantida",
      icon: "🛡️",
      description: "Veículo blindado particular e segurança discreto para viagens e deslocamento aos treinos."
    },
    {
      id: "video_analyst",
      name: "Analista de Desempenho Tático Individual",
      role: "Análise Tática & Posicionamento",
      category: "tactics",
      hireCost: 4200,
      monthlyCost: 1050,
      monthlyCostBase: 1050,
      bonusText: "+1 em Passe/Visão de Jogo (visão tática avançada de posicionamento)",
      icon: "📹",
      description: "Análise detalhada de movimentação adversária, mapas de calor e leitura de jogo moderna."
    },
    {
      id: "accountant",
      name: "Consultor Financeiro & Contador Pessoal",
      role: "Gestão Patrimonial & Tributária",
      category: "finance",
      hireCost: 5000,
      monthlyCost: 1300,
      monthlyCostBase: 1300,
      bonusText: "Reduz em 15% a manutenção de bens/veículos e aumenta rendimentos do CDB de 1.1% para 1.5%/mês",
      icon: "💼",
      description: "Planejamento financeiro de carreira, elisão fiscal legal e blindagem de patrimônio esportivo."
    }
  ];

  // =========================================================================
  // 3. CATÁLOGO DE BENS DE LUXO, VEÍCULOS & IMÓVEIS (COM FINANCIAMENTO 12x)
  // =========================================================================
  const AFM_ASSETS_CATALOG = [
    {
      id: "gaming_rig",
      name: "Setup Gamer & Simulador no Quarto",
      price: 6500,
      monthlyUpkeep: 150,
      tierName: "Eletrônicos & Conforto",
      bonus: "+2 Moral em folgas",
      financeable: false,
      icon: "🎮",
      description: "Setup gamer completo para relaxar nas concentrações e dias de descanso."
    },
    {
      id: "swiss_watch",
      name: "Relógio Suíço de Ouro 18k",
      price: 18000,
      monthlyUpkeep: 200,
      tierName: "Joias & Status",
      bonus: "+5 Fama & Status",
      financeable: false,
      icon: "⌚",
      description: "Peça de alta relojoaria de prestígio internacional para premiações e eventos."
    },
    {
      id: "sport_hatch",
      name: "Hatch Esportivo Turbo 0km",
      price: 85000,
      monthlyUpkeep: 1200,
      tierName: "Carros & Mobilidade",
      bonus: "Agilidade no dia a dia",
      financeable: true,
      icon: "🚗",
      description: "Veículo veloz e moderno para os deslocamentos diários entre casa e o centro de treinamento."
    },
    {
      id: "first_car",
      name: "Primeiro Carro Esportivo (Coupe)",
      price: 140000,
      monthlyUpkeep: 2200,
      tierName: "Supercarros",
      bonus: "+8 Fama & Respeito no Elenco",
      financeable: true,
      icon: "🏎️",
      description: "Coupe esportivo com ronco inconfundível e presença no estacionamento do clube."
    },
    {
      id: "armored_suv",
      name: "SUV Blindado de Luxo (Black Edition)",
      price: 320000,
      monthlyUpkeep: 4500,
      tierName: "Segurança de Elite",
      bonus: "Máxima segurança familiar",
      financeable: true,
      icon: "🚙",
      description: "Blindagem de padrão militar, vidros escurecidos e conforto total para a família."
    },
    {
      id: "luxury_apt",
      name: "Apartamento de Frente para o Mar",
      price: 750000,
      monthlyUpkeep: 5800,
      tierName: "Imóveis de Alto Padrão",
      bonus: "+10 Descanso & Regeneração",
      financeable: true,
      icon: "🏢",
      description: "Apartamento panorâmico com spa privativo, isolamento acústico e descanso restaurador."
    },
    {
      id: "mansion_ct",
      name: "Mansão em Condomínio Fechado com Campo",
      price: 2400000,
      monthlyUpkeep: 14000,
      tierName: "Mansões & Propriedades",
      bonus: "+1 Ponto de Treino semanal extra",
      financeable: true,
      icon: "🏰",
      description: "Mansão com campo de futebol particular, academia moderna e piscina aquecida para treinos em casa."
    },
    {
      id: "private_jet",
      name: "Jatinho Executivo Particular (Citation CJ4)",
      price: 12000000,
      monthlyUpkeep: 65000,
      tierName: "Aviação & Super Luxo",
      bonus: "+25 Fama Mundial & Cansaço zero em viagens",
      financeable: true,
      icon: "✈️",
      description: "Aeronave executiva para viagens de lazer e negócios internacionais sem desgaste de voos comerciais."
    }
  ];

  // =========================================================================
  // 4. HELPER DE RESOLUÇÃO DE CONTEXTO DO SAVE
  // =========================================================================
  function resolveContext(target) {
    const defaultState = (typeof window !== "undefined" && window.state) ? window.state : {};
    if (!target) {
      return {
        state: defaultState,
        pState: defaultState?.playerCareerState || null,
        athlete: (defaultState?.squad || []).find(p => p.id === defaultState?.controlledPlayerId) || null
      };
    }
    if (target.playerCareerState) {
      const pState = target.playerCareerState;
      const athlete = (target.squad || []).find(p => p.id === target.controlledPlayerId) || null;
      return { state: target, pState, athlete };
    }
    if (target.lifestyle || target.personalBank !== undefined || target.athleteName) {
      const state = defaultState;
      const athlete = (state?.squad || []).find(p => p.id === state?.controlledPlayerId) || null;
      return { state, pState: target, athlete };
    }
    return {
      state: defaultState,
      pState: defaultState?.playerCareerState || null,
      athlete: target
    };
  }

  // =========================================================================
  // 5. INICIALIZAÇÃO & NORMALIZAÇÃO DO ESTADO PERSISTENTE DE LIFESTYLE
  // =========================================================================
  function ensurePlayerLifestyleState(player) {
    if (!player) return null;
    const initialBank = player.personalBank !== undefined
      ? Number(player.personalBank)
      : (player.cash !== undefined ? Number(player.cash) : 1045);

    if (!player.lifestyle) {
      player.lifestyle = {
        cash: initialBank,
        equippedBootsId: "boots_basic",
        ownedBoots: {
          boots_basic: { durability: 15, maxDurability: 15 }
        },
        hiredStaff: [],
        ownedAssets: [],
        financedAssets: [],
        investments: {
          cdbBalance: 0,
          rentalUnits: 0,
          academyOwned: false,
          brandOwned: false
        },
        weeklyMediaGigAvailable: true,
        lastMediaGigDate: null,
        transactions: []
      };
    }

    const ls = player.lifestyle;
    if (ls.cash === undefined || !Number.isFinite(Number(ls.cash))) {
      ls.cash = initialBank;
    }
    if (!ls.equippedBootsId) {
      ls.equippedBootsId = "boots_basic";
    }
    if (!ls.ownedBoots || Object.keys(ls.ownedBoots).length === 0) {
      ls.ownedBoots = { boots_basic: { durability: 15, maxDurability: 15 } };
    }
    // Garante que boots_basic possui maxDurability se criada antigamente
    Object.keys(ls.ownedBoots).forEach(id => {
      const cat = AFM_BOOTS_CATALOG.find(b => b.id === id);
      if (cat && !ls.ownedBoots[id].maxDurability) {
        ls.ownedBoots[id].maxDurability = cat.maxDurability;
      }
    });

    // Normaliza hiredStaff (array de IDs)
    if (!Array.isArray(ls.hiredStaff)) {
      if (player.hiredStaff && typeof player.hiredStaff === "object" && !Array.isArray(player.hiredStaff)) {
        ls.hiredStaff = Object.keys(player.hiredStaff).filter(k => player.hiredStaff[k]);
      } else {
        ls.hiredStaff = [];
      }
    }

    // Normaliza ownedAssets (array de IDs)
    if (!Array.isArray(ls.ownedAssets)) {
      ls.ownedAssets = Array.isArray(player.luxuryItems)
        ? [...player.luxuryItems.filter(id => id !== "luxury_boots")]
        : [];
    }

    // Normaliza financedAssets
    if (!Array.isArray(ls.financedAssets)) {
      ls.financedAssets = [];
    }

    // Normaliza investments
    if (!ls.investments) {
      ls.investments = {
        cdbBalance: 0,
        rentalUnits: 0,
        academyOwned: false,
        brandOwned: false
      };
    } else {
      ls.investments.cdbBalance = Number(ls.investments.cdbBalance) || 0;
      ls.investments.rentalUnits = Number(ls.investments.rentalUnits) || 0;
      ls.investments.academyOwned = Boolean(ls.investments.academyOwned);
      ls.investments.brandOwned = Boolean(ls.investments.brandOwned);
    }

    if (ls.weeklyMediaGigAvailable === undefined) {
      ls.weeklyMediaGigAvailable = true;
    }
    if (!Array.isArray(ls.transactions)) {
      ls.transactions = [];
    }

    // Sincronização estrita de dinheiro (100% de paridade)
    player.personalBank = ls.cash;
    player.cash = ls.cash;

    // Sincroniza retrocompatibilidade com objeto player.hiredStaff e flags lifestylePerks
    player.hiredStaff = player.hiredStaff || {};
    AFM_STAFF_CATALOG.forEach(st => {
      player.hiredStaff[st.id] = ls.hiredStaff.includes(st.id);
    });
    player.lifestylePerks = player.lifestylePerks || {};
    player.lifestylePerks.personalTrainer = ls.hiredStaff.includes("personal_trainer");
    player.lifestylePerks.physio = ls.hiredStaff.includes("physio");
    player.lifestylePerks.pressAgent = ls.hiredStaff.includes("marketing_team");

    return ls;
  }

  // =========================================================================
  // 6. ADIÇÃO DE TRANSAÇÕES NO LIVRO-RAZÃO & SINCRONIZAÇÃO DE SALDO
  // =========================================================================
  function getPlayerTotalPatrimony(player) {
    if (!player) return 0;
    const ls = ensurePlayerLifestyleState(player);
    const liquidCash = Number(player.personalBank ?? player.cash ?? ls.cash ?? 0);
    const cdb = Number(ls.investments?.cdbBalance || 0);

    let businessVal = 0;
    businessVal += (Number(ls.investments?.rentalUnits) || 0) * 25000;
    if (ls.investments?.academyOwned) businessVal += 90000;
    if (ls.investments?.brandOwned) businessVal += 180000;

    let assetsVal = 0;
    if (Array.isArray(ls.ownedAssets)) {
      ls.ownedAssets.forEach(id => {
        const item = AFM_ASSETS_CATALOG.find(a => a.id === id);
        if (item && item.price) assetsVal += item.price;
      });
    }
    if (Array.isArray(ls.financedAssets)) {
      ls.financedAssets.forEach(fin => {
        const item = AFM_ASSETS_CATALOG.find(a => a.id === fin.id);
        if (item && item.price) {
          const downPayment = Math.round(item.price * 0.3);
          const paidInstallments = (12 - (Number(fin.installmentsRemaining) || 12)) * (Number(fin.monthlyInstallment) || 0);
          assetsVal += (downPayment + Math.max(0, paidInstallments));
        }
      });
    }

    return Math.round(liquidCash + cdb + businessVal + assetsVal);
  }

  function updatePlayerFinancialDisplay(player) {
    if (!player && typeof window !== "undefined") {
      const gs = window.game?.state || window.gameState || window.state;
      player = gs?.playerCareerState || (gs?.squad || []).find(p => p.id === gs?.controlledPlayerId || p.isControlled);
    }
    if (!player) return { liquidCash: 0, totalInvested: 0, totalPatrimony: 0 };

    const ls = ensurePlayerLifestyleState(player);
    const liquidCash = Number(player.personalBank ?? player.cash ?? ls.cash ?? 0);
    const totalInvested = Number(ls.investments?.cdbBalance || 0);
    const totalPatrimony = getPlayerTotalPatrimony(player);

    // Paridade 100% estrita de saldo
    ls.cash = liquidCash;
    player.cash = liquidCash;
    player.personalBank = liquidCash;

    if (typeof window !== "undefined") {
      const gs = window.game?.state || window.gameState || window.state;
      if (gs) {
        if (gs.playerCareerState) {
          gs.playerCareerState.personalBank = liquidCash;
          gs.playerCareerState.cash = liquidCash;
          if (gs.playerCareerState.lifestyle) {
            gs.playerCareerState.lifestyle.cash = liquidCash;
          }
        }
        const controlled = (gs.squad || []).find(p => p.id === gs.controlledPlayerId || p.isControlled);
        if (controlled) {
          controlled.cash = liquidCash;
          controlled.personalBank = liquidCash;
          if (controlled.lifestyle) {
            controlled.lifestyle.cash = liquidCash;
          }
        }
      }

      if (typeof document !== "undefined") {
        const formattedLiquid = `R$ ${liquidCash.toLocaleString("pt-BR")}`;
        const formattedPatrimony = `R$ ${totalPatrimony.toLocaleString("pt-BR")}`;

        // Atualiza elementos da UI do Topo e Painéis
        if (typeof document.querySelectorAll === "function") {
          document.querySelectorAll('.sm-badge-cash .sm-res-val, [id*="Cash"], [id*="Saldo"]').forEach(el => {
            if (el && typeof el.matches === 'function' && !el.matches('input, textarea, select')) {
              el.textContent = `R$ ${liquidCash.toLocaleString('pt-BR')}`;
            }
          });
        }

        // Badge Topbar
        if (typeof document.querySelector === "function") {
          const cashValEl = document.querySelector(".sm-badge-cash .sm-res-val");
          if (cashValEl) {
            cashValEl.textContent = `R$ ${(liquidCash >= 1000000 ? (liquidCash / 1000000).toFixed(1) + 'M' : (liquidCash >= 1000 ? Math.round(liquidCash / 1000) + 'K' : liquidCash))}`;
          }
          const badgeCash = document.querySelector(".sm-badge-cash");
          if (badgeCash) {
            badgeCash.title = `Conta Pessoal: ${formattedLiquid} · Patrimônio: ${formattedPatrimony}`;
          }
        }

        // Drawer Lateral
        if (typeof document.getElementById === "function") {
          const dPatrimonyEl = document.getElementById("drawerPatrimonyVal");
          if (dPatrimonyEl) dPatrimonyEl.textContent = formattedPatrimony;

          const dCashEl = document.getElementById("drawerPersonalCashVal");
          if (dCashEl) dCashEl.textContent = formattedLiquid;

          // Card de Conta Bancária Pessoal na aba Vida & Patrocínios
          const personalBankEl = document.getElementById("personalBankBalanceCard");
          if (personalBankEl) {
            personalBankEl.textContent = formattedLiquid;
          }

          // Card do CDB Esportivo (Saldo Atual Investido)
          const cdbInvestedEl = document.getElementById("cdbInvestedBalanceVal");
          if (cdbInvestedEl) {
            cdbInvestedEl.textContent = `R$ ${totalInvested.toLocaleString("pt-BR")}`;
          }
        }
      }

      if (typeof window.updateTopBar === "function") {
        window.updateTopBar();
      }
    }

    return { liquidCash, totalInvested, totalPatrimony };
  }

  function addPlayerTransaction(player, date, desc, amount, type = "in") {
    if (!player) return 0;
    const ls = ensurePlayerLifestyleState(player);
    const amt = Math.max(0, Math.round(Number(amount) || 0));

    if (type === "in") {
      ls.cash = Math.round((Number(ls.cash) || 0) + amt);
    } else {
      ls.cash = Math.round((Number(ls.cash) || 0) - amt);
    }
    player.personalBank = ls.cash;
    player.cash = ls.cash;

    ls.transactions = Array.isArray(ls.transactions) ? ls.transactions : [];
    ls.transactions.unshift({
      date: date || new Date().toISOString().slice(0, 10),
      desc: String(desc || "Movimentação Financeira"),
      amount: amt,
      type: type === "out" ? "out" : "in"
    });

    if (ls.transactions.length > 20) {
      ls.transactions = ls.transactions.slice(0, 20);
    }

    updatePlayerFinancialDisplay(player);

    return ls.cash;
  }

  // =========================================================================
  // 7. AÇÕES DE CHUTEIRAS: COMPRAR, REFORMAR TRAVAS, EQUIPAR
  // =========================================================================
  function buyBoot(gameState, bootId) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado de carreira de jogador não encontrado." };
    const ls = ensurePlayerLifestyleState(pState);
    const boot = AFM_BOOTS_CATALOG.find(b => b.id === bootId);
    if (!boot) return { success: false, message: "Chuteira não encontrada no catálogo." };

    if (ls.cash < boot.price) {
      const shortfall = boot.price - ls.cash;
      return { success: false, message: `Saldo insuficiente! Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Compra de Chuteira: ${boot.name}`, boot.price, "out");
    ls.ownedBoots[boot.id] = { durability: boot.maxDurability, maxDurability: boot.maxDurability };
    ls.equippedBootsId = boot.id; // Auto-equipa ao comprar modelo superior

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`👟 EQUIPAMENTO NOVO: ${pState.athleteName || "Você"} adquiriu a ${boot.name} por R$ ${boot.price.toLocaleString("pt-BR")}!`);
    }

    return {
      success: true,
      message: `${boot.name} adquirida e equipada com sucesso! (${boot.bonusText})`,
      boot
    };
  }

  function repairBoot(gameState, bootId) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const boot = AFM_BOOTS_CATALOG.find(b => b.id === bootId);
    if (!boot) return { success: false, message: "Chuteira não encontrada no catálogo." };
    const owned = ls.ownedBoots?.[bootId];
    if (!owned) return { success: false, message: "Você não possui esta chuteira para reformar." };

    if (owned.durability >= boot.maxDurability) {
      return { success: false, message: "As travas e o couro desta chuteira já estão 100% conservados!" };
    }

    const repairCost = Math.round(boot.price * 0.35);
    if (ls.cash < repairCost) {
      const shortfall = repairCost - ls.cash;
      return { success: false, message: `Saldo insuficiente para a reforma das travas! Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Reforma & Travas Novas: ${boot.name}`, repairCost, "out");
    owned.durability = boot.maxDurability;

    return {
      success: true,
      message: `Chuteira reformada! Durabilidade restaurada para ${boot.maxDurability}/${boot.maxDurability} jogos.`
    };
  }

  function equipBoot(gameState, bootId) {
    const { pState } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    if (!ls.ownedBoots?.[bootId]) {
      return { success: false, message: "Você não possui esta chuteira para equipar." };
    }
    ls.equippedBootsId = bootId;
    return { success: true, message: "Chuteira equipada para as próximas partidas!" };
  }

  // =========================================================================
  // 8. AÇÕES DE STAFF PESSOAL: CONTRATAR & DISPENSAR
  // =========================================================================
  function hireStaffMember(gameState, staffId) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const staff = AFM_STAFF_CATALOG.find(s => s.id === staffId);
    if (!staff) return { success: false, message: "Membro de staff não encontrado." };

    if (ls.hiredStaff.includes(staffId)) {
      return { success: false, message: `${staff.name} já faz parte da sua comissão particular!` };
    }

    if (ls.cash < staff.hireCost) {
      const shortfall = staff.hireCost - ls.cash;
      return { success: false, message: `Saldo insuficiente na conta pessoal! Custo de contratação: R$ ${staff.hireCost.toLocaleString("pt-BR")}. Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Contratação de Staff: ${staff.name}`, staff.hireCost, "out");
    ls.hiredStaff.push(staffId);

    // Sincroniza retrocompatibilidade
    pState.hiredStaff = pState.hiredStaff || {};
    pState.hiredStaff[staffId] = true;
    pState.lifestylePerks = pState.lifestylePerks || {};
    if (staffId === "personal_trainer") pState.lifestylePerks.personalTrainer = true;
    if (staffId === "physio") pState.lifestylePerks.physio = true;
    if (staffId === "marketing_team") pState.lifestylePerks.pressAgent = true;

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`⭐ STAFF PESSOAL: ${pState.athleteName || "O atleta"} contratou ${staff.name} para sua comissão particular. Custo de contratação quitado.`);
    }

    return {
      success: true,
      message: `${staff.name} contratado com sucesso!`,
      staff
    };
  }

  function dismissStaffMember(gameState, staffId) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const staff = AFM_STAFF_CATALOG.find(s => s.id === staffId);
    const staffName = staff ? staff.name : staffId;

    if (!ls.hiredStaff.includes(staffId)) {
      return { success: false, message: `${staffName} não está contratado na sua equipe.` };
    }

    ls.hiredStaff = ls.hiredStaff.filter(id => id !== staffId);
    pState.hiredStaff = pState.hiredStaff || {};
    pState.hiredStaff[staffId] = false;
    pState.lifestylePerks = pState.lifestylePerks || {};
    if (staffId === "personal_trainer") pState.lifestylePerks.personalTrainer = false;
    if (staffId === "physio") pState.lifestylePerks.physio = false;
    if (staffId === "marketing_team") pState.lifestylePerks.pressAgent = false;

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    ls.transactions = ls.transactions || [];
    ls.transactions.unshift({
      date: curDate,
      desc: `Encerramento de Vínculo: ${staffName}`,
      amount: 0,
      type: "out"
    });
    if (ls.transactions.length > 20) ls.transactions = ls.transactions.slice(0, 20);

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`📋 GESTÃO DE CARREIRA: ${pState.athleteName || "O atleta"} encerrou o vínculo com ${staffName} para otimizar seus custos mensais.`);
    }

    return {
      success: true,
      message: `${staffName} dispensado da sua comissão particular.`
    };
  }

  // =========================================================================
  // 9. AÇÕES DE BENS DE LUXO & VEÍCULOS (À VISTA OU FINANCIAMENTO 12x)
  // =========================================================================
  function buyAssetCash(gameState, assetId) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const asset = AFM_ASSETS_CATALOG.find(a => a.id === assetId);
    if (!asset) return { success: false, message: "Bem não encontrado no catálogo." };

    if (ls.ownedAssets.includes(assetId)) {
      return { success: false, message: "Você já possui este bem de luxo!" };
    }

    if (ls.cash < asset.price) {
      const shortfall = asset.price - ls.cash;
      return { success: false, message: `Saldo insuficiente para compra à vista! Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Compra de Bem (À Vista): ${asset.name}`, asset.price, "out");
    ls.ownedAssets.push(assetId);

    // Retrocompatibilidade
    pState.luxuryItems = Array.isArray(pState.luxuryItems) ? pState.luxuryItems : [];
    if (!pState.luxuryItems.includes(assetId)) pState.luxuryItems.push(assetId);

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`💎 CONQUISTA & STATUS: ${pState.athleteName || "O atleta"} comprou ${asset.name} à vista por R$ ${asset.price.toLocaleString("pt-BR")}!`);
    }

    return {
      success: true,
      message: `${asset.name} adquirido à vista com sucesso! (${asset.bonus})`
    };
  }

  function financeAsset(gameState, assetId) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const asset = AFM_ASSETS_CATALOG.find(a => a.id === assetId);
    if (!asset) return { success: false, message: "Item não encontrado." };

    if (!asset.financeable) {
      return { success: false, message: "Este item não é elegível para financiamento bancário." };
    }

    if (ls.ownedAssets.includes(assetId) || ls.financedAssets.some(f => f.id === assetId)) {
      return { success: false, message: "Você já possui ou já está financiando este bem!" };
    }

    const downPayment = Math.round(asset.price * 0.30);
    if (ls.cash < downPayment) {
      const shortfall = downPayment - ls.cash;
      return { success: false, message: `Saldo insuficiente para a entrada (30%)! Necessário R$ ${downPayment.toLocaleString("pt-BR")}. Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const remaining = asset.price * 0.70;
    const monthlyPayment = Math.round((remaining * 1.10) / 12);

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Entrada Financiamento (30%): ${asset.name}`, downPayment, "out");
    ls.financedAssets.push({
      id: asset.id,
      name: asset.name,
      remainingInstallments: 12,
      monthlyPayment
    });

    // Retrocompatibilidade
    pState.luxuryItems = Array.isArray(pState.luxuryItems) ? pState.luxuryItems : [];
    if (!pState.luxuryItems.includes(assetId)) pState.luxuryItems.push(assetId);

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`🚗 FINANCIAMENTO APROVADO: ${pState.athleteName || "O atleta"} financiou ${asset.name} em 12 parcelas de R$ ${monthlyPayment.toLocaleString("pt-BR")} (Entrada quitada de R$ ${downPayment.toLocaleString("pt-BR")}).`);
    }

    return {
      success: true,
      message: `Financiamento aprovado! Entrada de R$ ${downPayment.toLocaleString("pt-BR")} paga. Parcelas de R$ ${monthlyPayment.toLocaleString("pt-BR")}/mês por 12 meses.`
    };
  }

  // =========================================================================
  // 10. AÇÕES DE NEGÓCIOS, INVESTIMENTOS & MÍDIA
  // =========================================================================
  function depositCdb(gameState, amount = 500) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const amt = Math.max(100, Math.round(Number(amount) || 500));

    if (ls.cash < amt) {
      const shortfall = amt - ls.cash;
      return { success: false, message: `Saldo insuficiente para aplicar no CDB! Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Aplicação em CDB Esportivo`, amt, "out");
    ls.investments.cdbBalance = (ls.investments.cdbBalance || 0) + amt;
    updatePlayerFinancialDisplay(pState);

    return {
      success: true,
      message: `R$ ${amt.toLocaleString("pt-BR")} aplicados no CDB Esportivo! Saldo total no CDB: R$ ${ls.investments.cdbBalance.toLocaleString("pt-BR")}.`
    };
  }

  function withdrawCdb(gameState) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const balance = Number(ls.investments.cdbBalance) || 0;

    if (balance <= 0) {
      return { success: false, message: "Você não possui saldo investido no CDB para resgatar." };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    ls.investments.cdbBalance = 0;
    addPlayerTransaction(pState, curDate, `Resgate Total CDB Esportivo`, balance, "in");
    updatePlayerFinancialDisplay(pState);

    return {
      success: true,
      message: `Resgate de R$ ${balance.toLocaleString("pt-BR")} creditado na sua conta com sucesso!`
    };
  }

  function buyRentalUnit(gameState) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const cost = 25000;

    if (ls.cash < cost) {
      const shortfall = cost - ls.cash;
      return { success: false, message: `Saldo insuficiente! Kitnet de aluguel custa R$ ${cost.toLocaleString("pt-BR")}. Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Compra de Kitnet para Aluguel`, cost, "out");
    ls.investments.rentalUnits = (ls.investments.rentalUnits || 0) + 1;

    return {
      success: true,
      message: `Kitnet adquirida com sucesso! Você possui agora ${ls.investments.rentalUnits} unidade(s) gerando R$ ${(ls.investments.rentalUnits * 650).toLocaleString("pt-BR")}/mês de renda passiva.`
    };
  }

  function buyAcademy(gameState) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const cost = 75000;

    if (ls.investments.academyOwned) {
      return { success: false, message: "Você já possui sua franquia de escolinha de futebol!" };
    }

    if (ls.cash < cost) {
      const shortfall = cost - ls.cash;
      return { success: false, message: `Saldo insuficiente! A franquia de escolinha custa R$ ${cost.toLocaleString("pt-BR")}. Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Abertura de Franquia de Escolinha`, cost, "out");
    ls.investments.academyOwned = true;

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`⚽ NEGÓCIOS & FORMAÇÃO: ${pState.athleteName || "O atleta"} inaugurou sua própria franquia de escolinha de futebol! Renda passiva de R$ 2.100/mês.`);
    }

    return {
      success: true,
      message: `Escolinha inaugurada com sucesso! Gera R$ 2.100/mês de renda passiva e fortalece seu nome nas categorias de base.`
    };
  }

  function buyBrand(gameState) {
    const { pState, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const cost = 180000;

    if (ls.investments.brandOwned) {
      return { success: false, message: "Você já possui sua marca própria de vestuário e lifestyle!" };
    }

    if (ls.cash < cost) {
      const shortfall = cost - ls.cash;
      return { success: false, message: `Saldo insuficiente! O lançamento da marca própria custa R$ ${cost.toLocaleString("pt-BR")}. Faltam R$ ${shortfall.toLocaleString("pt-BR")}.` };
    }

    const curDate = state?.date || state?.currentDate || "2026-01-01";
    addPlayerTransaction(pState, curDate, `Lançamento de Marca Própria de Roupas`, cost, "out");
    ls.investments.brandOwned = true;

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`✨ EMPREENDEDORISMO: ${pState.athleteName || "O atleta"} lançou oficialmente sua marca própria de vestuário e lifestyle! Renda passiva de R$ 5.400/mês.`);
    }

    return {
      success: true,
      message: `Marca própria lançada com sucesso! Gera R$ 5.400/mês de royalties e eleva sua fama mundial.`
    };
  }

  function executeMediaGig(gameState) {
    const { pState, athlete, state } = resolveContext(gameState);
    if (!pState) return { success: false, message: "Estado inválido." };
    const ls = ensurePlayerLifestyleState(pState);
    const curDate = state?.date || state?.currentDate || "2026-01-01";

    // Checagem de disponibilidade semanal (cooldown de 7 dias ou flag ativa)
    if (ls.weeklyMediaGigAvailable === false && ls.lastMediaGigDate) {
      const d1 = new Date(curDate);
      const d2 = new Date(ls.lastMediaGigDate);
      const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        const remaining = Math.max(1, 7 - Math.floor(diffDays));
        return { success: false, message: `Sua agenda de mídia está cheia! Aguarde mais ${remaining} dia(s) para uma nova gravação comercial.` };
      }
    }

    // Checagem de condição física / estamina (exige ao menos 15%)
    const currentEnergy = athlete?.energy !== undefined
      ? Number(athlete.energy)
      : (pState.energy !== undefined ? Number(pState.energy) : 100);

    if (currentEnergy < 15) {
      return { success: false, message: `Condição física muito baixa (${currentEnergy}%)! Descanse antes de gravar um comercial (exige 15% de energia).` };
    }

    // Consome 15% de estamina
    if (athlete) athlete.energy = Math.max(0, currentEnergy - 15);
    if (pState.energy !== undefined) pState.energy = Math.max(0, currentEnergy - 15);

    // Cálculo do Cachê: R$ 450 a R$ 12.000 baseado em OVR e Fama/Seguidores
    const ovr = Number(athlete?.ovr || pState?.athleteOvr || 45);
    const followers = Number(pState?.socialMedia?.followers || 500);
    const fameBonus = Math.min(6000, Math.round(followers / 20));
    const payout = Math.round(Math.min(12000, Math.max(450, 450 + (ovr - 40) * 120 + fameBonus)));

    addPlayerTransaction(pState, curDate, `Cachê: Comercial & Presença VIP`, payout, "in");
    ls.weeklyMediaGigAvailable = false;
    ls.lastMediaGigDate = curDate;

    if (state) {
      state.news = Array.isArray(state.news) ? state.news : [];
      state.news.unshift(`📸 MÍDIA & PUBLICIDADE: ${pState.athleteName || "O atleta"} gravou uma campanha publicitária e faturou R$ ${payout.toLocaleString("pt-BR")} de cachê.`);
    }

    return {
      success: true,
      payout,
      message: `Gravação concluída com sucesso! Cachê de R$ ${payout.toLocaleString("pt-BR")} recebido (-15% de energia).`
    };
  }

  // =========================================================================
  // 11. HOOK PÓS-PARTIDA: DESGASTE DE CHUTEIRAS & BÔNUS POR GOL
  // =========================================================================
  function processMatchLifestyleEffects(gameState, matchStats, currentDate) {
    const { pState } = resolveContext(gameState);
    if (!pState) return;
    const ls = ensurePlayerLifestyleState(pState);
    const curDate = currentDate || gameState?.date || gameState?.currentDate || "2026-01-01";

    // 1. Redução de 1 na durabilidade da chuteira equipada
    const equippedId = ls.equippedBootsId || "boots_basic";
    if (ls.ownedBoots && ls.ownedBoots[equippedId]) {
      const bootData = ls.ownedBoots[equippedId];
      if (bootData.durability > 0) {
        bootData.durability = Math.max(0, bootData.durability - 1);
      }
    }

    // 2. Bônus por gol da Chuteira Ouro / Signature (+R$ 250/gol)
    const bootCatalog = AFM_BOOTS_CATALOG.find(b => b.id === equippedId);
    const goals = Number(matchStats?.goalsScored || matchStats?.goals || 0);
    const goalBonus = bootCatalog?.goalCashBonus || bootCatalog?.stats?.goalCashBonus;
    if (goalBonus && goals > 0 && (ls.ownedBoots?.[equippedId]?.durability || 0) > 0) {
      const cashBonus = goals * goalBonus;
      addPlayerTransaction(pState, curDate, `Bônus Chuteira Ouro (${goals} gol(s))`, cashBonus, "in");
    }

    // Sincronização estrita
    pState.personalBank = ls.cash;
    pState.cash = ls.cash;
  }

  // =========================================================================
  // 12. HOOK DE VIRADA DE MÊS: ENTRADAS, RENDIMENTOS, DESPESAS & PARCELAS
  // =========================================================================
  function processMonthlyPlayerFinances(gameState, paymentDate) {
    const { pState, athlete, state } = resolveContext(gameState);
    if (!pState || (state && state.gameMode !== "player")) return null;
    const ls = ensurePlayerLifestyleState(pState);

    const curDate = paymentDate || state?.date || state?.currentDate || "2026-01-01";
    const monthKey = String(curDate).slice(0, 7);

    // Idempotência estrita: processa apenas uma vez por mês do calendário
    if (ls.lastProcessedMonth && monthKey <= ls.lastProcessedMonth) {
      return null;
    }
    ls.lastProcessedMonth = monthKey;
    pState.lastFinancialMonth = monthKey;

    const athleteOvr = Number(athlete?.ovr || pState?.athleteOvr || 45);
    const hasAccountant = ls.hiredStaff.includes("accountant");

    // -----------------------------------------------------------------------
    // ENTRADAS DO MÊS
    // -----------------------------------------------------------------------
    // Salário do Clube
    const salary = Math.round(Number(athlete?.wage || (pState.weeklySalary ? pState.weeklySalary * 4 : 1500)));
    addPlayerTransaction(pState, curDate, `Salário Mensal do Clube`, salary, "in");

    // Patrocínio Esportivo Ativo
    const sponsorMonthly = Math.round(Number(pState.sponsorContract?.monthlyStipend || pState.sponsorContract?.monthly || 0));
    if (sponsorMonthly > 0) {
      addPlayerTransaction(pState, curDate, `Mensalidade Patrocínio (${pState.sponsorContract?.brand || "Material Esportivo"})`, sponsorMonthly, "in");
    }

    // Rendimento CDB Esportivo (1.1%/mês, ou 1.5% com Contador)
    const cdbRate = hasAccountant ? 0.015 : 0.011;
    const cdbBalance = Number(ls.investments.cdbBalance) || 0;
    let cdbYield = 0;
    if (cdbBalance > 0) {
      cdbYield = Math.round(cdbBalance * cdbRate);
      ls.investments.cdbBalance += cdbYield; // Reinveste juros compostos
      addPlayerTransaction(pState, curDate, `Rendimento CDB Esportivo (${hasAccountant ? "1.5%" : "1.1%"})`, cdbYield, "in");
    }

    // Aluguéis e Negócios
    const rentalUnits = Number(ls.investments.rentalUnits) || 0;
    const rentalIncome = rentalUnits * 650;
    const academyIncome = ls.investments.academyOwned ? 2100 : 0;
    const brandIncome = ls.investments.brandOwned ? 5400 : 0;
    const totalBusinessIncome = rentalIncome + academyIncome + brandIncome;

    if (totalBusinessIncome > 0) {
      addPlayerTransaction(pState, curDate, `Rendimentos de Aluguéis & Negócios`, totalBusinessIncome, "in");
    }

    // -----------------------------------------------------------------------
    // SAÍDAS E DESPESAS DO MÊS
    // -----------------------------------------------------------------------
    // Custo de Vida Base do Atleta (Aspirante / Moradia)
    let baseLifestyleCost = 350;
    if (athleteOvr >= 85) baseLifestyleCost = 65000;
    else if (athleteOvr >= 78) baseLifestyleCost = 28000;
    else if (athleteOvr >= 70) baseLifestyleCost = 10000;
    else if (athleteOvr >= 62) baseLifestyleCost = 3500;
    else if (athleteOvr >= 52) baseLifestyleCost = 1200;

    addPlayerTransaction(pState, curDate, `Custo de Vida & Moradia`, baseLifestyleCost, "out");

    // Manutenção de Bens de Luxo e Veículos (-15% se tiver Contador)
    let totalUpkeep = 0;
    const allHeldAssetIds = [
      ...ls.ownedAssets,
      ...ls.financedAssets.map(f => f.id)
    ];
    allHeldAssetIds.forEach(aId => {
      const asset = AFM_ASSETS_CATALOG.find(a => a.id === aId);
      if (asset) totalUpkeep += asset.monthlyUpkeep;
    });

    if (hasAccountant && totalUpkeep > 0) {
      totalUpkeep = Math.round(totalUpkeep * 0.85);
    }
    if (totalUpkeep > 0) {
      addPlayerTransaction(pState, curDate, `Manutenção de Bens & Veículos${hasAccountant ? " (-15% Contador)" : ""}`, totalUpkeep, "out");
    }

    // Parcelas de Financiamento (12x)
    const financedToRemove = [];
    ls.financedAssets.forEach((item, idx) => {
      addPlayerTransaction(pState, curDate, `Parcela Financiamento: ${item.name}`, item.monthlyPayment, "out");
      item.remainingInstallments = Math.max(0, (Number(item.remainingInstallments) || 12) - 1);
      if (item.remainingInstallments <= 0) {
        financedToRemove.push(idx);
        if (!ls.ownedAssets.includes(item.id)) {
          ls.ownedAssets.push(item.id);
        }
        if (state) {
          state.news = Array.isArray(state.news) ? state.news : [];
          state.news.unshift(`🎉 QUITAÇÃO: ${pState.athleteName || "Você"} quitou integralmente o financiamento de ${item.name}! O bem agora é 100% seu.`);
        }
      }
    });
    // Remove os quitados de financedAssets
    for (let i = financedToRemove.length - 1; i >= 0; i--) {
      ls.financedAssets.splice(financedToRemove[i], 1);
    }

    // Folha de Pagamento do Staff Pessoal
    let totalStaffPayroll = 0;
    ls.hiredStaff.forEach(staffId => {
      const st = AFM_STAFF_CATALOG.find(s => s.id === staffId);
      if (st) {
        const ovrFactor = Math.max(1, 1 + (athleteOvr - 45) * 0.03);
        const monthly = Math.round(st.monthlyCostBase * ovrFactor);
        totalStaffPayroll += monthly;
        addPlayerTransaction(pState, curDate, `Honorários Staff: ${st.name}`, monthly, "out");
      }
    });

    // Reset da disponibilidade semanal de mídia no início do mês
    ls.weeklyMediaGigAvailable = true;

    // -----------------------------------------------------------------------
    // INADIMPLÊNCIA / CORTE DE CUSTOS POR FALTA DE SALDO
    // -----------------------------------------------------------------------
    if (ls.cash < 0 && ls.hiredStaff.length > 0) {
      const droppedStaffId = ls.hiredStaff.pop();
      const droppedStaff = AFM_STAFF_CATALOG.find(s => s.id === droppedStaffId);
      const droppedName = droppedStaff ? droppedStaff.name : droppedStaffId;

      pState.hiredStaff = pState.hiredStaff || {};
      pState.hiredStaff[droppedStaffId] = false;
      pState.lifestylePerks = pState.lifestylePerks || {};
      if (droppedStaffId === "personal_trainer") pState.lifestylePerks.personalTrainer = false;
      if (droppedStaffId === "physio") pState.lifestylePerks.physio = false;
      if (droppedStaffId === "marketing_team") pState.lifestylePerks.pressAgent = false;

      addPlayerTransaction(pState, curDate, `Suspensão por Falta de Fundos: ${droppedName}`, 0, "out");

      if (state) {
        state.news = Array.isArray(state.news) ? state.news : [];
        state.news.unshift(`⚠️ INADIMPLÊNCIA: Por saldo negativo em conta, ${droppedName} encerrou a prestação de serviços com ${pState.athleteName || "você"}.`);
      }
    }

    // Histórico Financeiro Mensal (Extrato dos últimos 12 meses para retrocompatibilidade)
    pState.financialHistory = Array.isArray(pState.financialHistory) ? pState.financialHistory : [];
    const totalMonthIncome = salary + sponsorMonthly + cdbYield + totalBusinessIncome;
    const totalMonthExpenses = baseLifestyleCost + totalUpkeep + totalStaffPayroll;
    pState.financialHistory.unshift({
      date: curDate,
      month: monthKey,
      salary,
      sponsorMonthly,
      totalIncome: totalMonthIncome,
      staffExpenses: totalStaffPayroll,
      lifestyleCost: baseLifestyleCost + totalUpkeep,
      totalExpenses: totalMonthExpenses,
      netBalance: totalMonthIncome - totalMonthExpenses,
      finalBank: ls.cash
    });
    pState.financialHistory = pState.financialHistory.slice(0, 12);
    pState.monthlyMatchBonuses = 0;

    return {
      monthKey,
      finalCash: ls.cash,
      salary,
      sponsorMonthly,
      cdbYield,
      totalBusinessIncome,
      baseLifestyleCost,
      totalUpkeep,
      totalStaffPayroll
    };
  }

  // =========================================================================
  // 13. EXPORTAÇÃO GLOBAL
  // =========================================================================
  const AFM_Lifestyle = {
    AFM_BOOTS_CATALOG,
    AFM_STAFF_CATALOG,
    AFM_ASSETS_CATALOG,
    resolveContext,
    ensurePlayerLifestyleState,
    getPlayerTotalPatrimony,
    updatePlayerFinancialDisplay,
    addPlayerTransaction,
    buyBoot,
    repairBoot,
    equipBoot,
    hireStaffMember,
    dismissStaffMember,
    buyAssetCash,
    financeAsset,
    depositCdb,
    withdrawCdb,
    buyRentalUnit,
    buyAcademy,
    buyBrand,
    executeMediaGig,
    processMatchLifestyleEffects,
    processMonthlyPlayerFinances
  };

  if (typeof window !== "undefined") {
    window.AFM_Lifestyle = AFM_Lifestyle;
    if (window.AFM_PlayerEngine) {
      window.AFM_PlayerEngine.lifestyle = AFM_Lifestyle;
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = AFM_Lifestyle;
  }
})();
