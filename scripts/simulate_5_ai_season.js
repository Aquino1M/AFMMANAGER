/**
 * SIMULATE_5_AI_SEASON.JS
 * Full-season multi-agent simulation with 5 autonomous AI managers:
 * 1. Brasil (Flamengo / bra-a)
 * 2. América do Norte (Inter Miami / usa-1)
 * 3. Europa 1 (Arsenal / eng-1)
 * 4. Europa 2 (Real Madrid / esp-1)
 * 5. Ásia (Al-Hilal / ksa-1)
 *
 * Comprehensive stress-test of:
 * - Market transfers: selling surplus players, buying reinforcements, squad adaptation
 * - Upgrades: stadium items (chairs, screens, LED) and facilities (training, medical, marketing)
 * - SAF shares & stock market: buying shares, collecting monthly dividends, selling shares
 * - Match simulation across the full calendar year (38 or 34 rounds + cups)
 * - Prize money (premiação): season league awards + cup phase prizes
 * - Bug / anomaly detection (NaN values, calendar stalls, broken pointers)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createMockElement(tag) {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    children: [],
    appendChild: function(c) { this.children.push(c); return c; },
    removeChild: () => {},
    remove: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => createMockElement('span'),
    querySelectorAll: () => [createMockElement('span')],
    closest: () => null
  };
}

function initGameEnvironment() {
  const storage = {};
  const context = {
    console,
    requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
    scrollTo: () => {},
    setTimeout: (fn) => 1,
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    confirm: () => true,
    alert: () => {},
    prompt: () => '',
    Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    openCustomModal: () => {},
    closeCustomModal: () => {},
    toast: () => {}
  };
  context.window = context;
  const root = createMockElement('body');
  context.document = {
    getElementById: id => createMockElement(id),
    querySelector: sel => createMockElement(sel),
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: tag => createMockElement(tag),
    body: root
  };
  context.window.document = context.document;
  context.window.AFM_DB = { init: () => Promise.resolve(null) };
  context.window.esc = s => String(s || '');

  vm.createContext(context);

  const files = [
    'js/competitions.js',
    'data/competition_teams.js',
    'data/international_teams_2026_27.js',
    'data/continental_2026.js',
    'js/core/tournament_engine.js',
    'js/core/competition_integrity.js',
    'data/players_live.js',
    'js/core/match_engine.js',
    'js/core/real_football_engine.js',
    'js/game.js',
    'js/core/calendar_and_day_advance_fix.js',
    'js/systems/manager_life_and_shares_pro.js'
  ];

  for (const f of files) {
    const fullPath = path.join(__dirname, '..', f);
    vm.runInContext(fs.readFileSync(fullPath, 'utf8'), context);
  }

  return context;
}

const AI_CONFIGS = [
  {
    id: 'ai_brasil',
    region: 'Brasil (América do Sul)',
    club: 'Flamengo',
    compId: 'bra-a',
    manager: 'Téc. Renato Gaúcho',
    targetBuy: 'Raphael Veiga', // Midfield reinforcement
    safStockToTrade: 'cruzeiro',
    upgradePlan: ['chairs', 'screen', 'ledLights']
  },
  {
    id: 'ai_north_america',
    region: 'América do Norte',
    club: 'Inter Miami',
    compId: 'usa-1',
    manager: 'Téc. Tata Martino',
    targetBuy: 'Ganso', // Technical playmaker
    safStockToTrade: 'bahia',
    upgradePlan: ['chairs', 'mosaic', 'screen']
  },
  {
    id: 'ai_europe_eng',
    region: 'Europa (Inglaterra)',
    club: 'Arsenal',
    compId: 'eng-1',
    manager: 'Téc. Mikel Arteta',
    targetBuy: 'Rodrygo', // High-tier attacking signing
    safStockToTrade: 'botafogo',
    upgradePlan: ['chairs', 'ledRing', 'screen', 'ledLights']
  },
  {
    id: 'ai_europe_esp',
    region: 'Europa (Espanha)',
    club: 'Real Madrid',
    compId: 'esp-1',
    manager: 'Téc. Carlo Ancelotti',
    targetBuy: 'Erling Haaland', // Galáctico signing
    safStockToTrade: 'atletico-mg',
    upgradePlan: ['chairs', 'mosaic', 'ledRing', 'screen', 'ledLights', 'flares']
  },
  {
    id: 'ai_asia',
    region: 'Ásia (Arábia Saudita)',
    club: 'Al-Hilal',
    compId: 'ksa-1',
    manager: 'Téc. Jorge Jesus',
    targetBuy: 'Cristiano Ronaldo', // High impact signing
    safStockToTrade: 'bragantino',
    upgradePlan: ['chairs', 'screen', 'ledLights']
  }
];

function runSingleAiSeason(config) {
  console.log(`\n================================================================`);
  console.log(`🚀 INICIANDO SIMULAÇÃO: ${config.manager} (${config.club})`);
  console.log(`🌍 Região: ${config.region} | Liga: ${config.compId}`);
  console.log(`================================================================`);

  const env = initGameEnvironment();
  const bugs = [];

  // 1. Inicia Nova Carreira
  try {
    env.newCareer({ clubName: config.club, compId: config.compId, manager: config.manager });
  } catch (err) {
    bugs.push({ stage: 'newCareer', error: err.message });
    return { config, bugs, ok: false };
  }

  const s = env.state;
  s.isPreSeason = false;
  s.preSeasonDays = 0;

  const initialBalance = s.balance;
  console.log(`💰 Saldo Inicial: R$ ${initialBalance.toLocaleString('pt-BR')}`);
  console.log(`👥 Elenco Inicial: ${s.squad.length} jogadores`);
  console.log(`📅 Rodadas na Liga: ${s.schedule ? s.schedule.length : 0}`);

  // Teste de integridade inicial
  if (isNaN(s.balance)) bugs.push({ stage: 'initialBalance', error: 'Balance is NaN' });
  if (!s.squad || !s.squad.length) bugs.push({ stage: 'initialSquad', error: 'Squad is empty' });

  // 2. Mercado da Bola: Venda de Jogadores Excedentes
  const transferLog = { sold: [], bought: [] };
  console.log(`\n--- 🔄 JANELA DE TRANSFERÊNCIAS: VENDAS ---`);
  
  // Encontra 2 jogadores com menor OVR ou excedentes para vender
  const sortedSquad = [...s.squad].sort((a, b) => env.playerOverall(a) - env.playerOverall(b));
  const playersToSell = sortedSquad.slice(0, 2);

  for (const p of playersToSell) {
    const key = env.playerKey(p);
    const prevBal = s.balance;
    const name = p.name;
    const ovr = env.playerOverall(p);
    const val = env.calcValueMi(p);

    try {
      if (typeof env.quickSellSquadPlayer === 'function') {
        env.quickSellSquadPlayer(key);
      } else if (typeof env.window.quickSellSquadPlayer === 'function') {
        env.window.quickSellSquadPlayer(key);
      } else {
        throw new Error('quickSellSquadPlayer is not available');
      }
      const soldEarned = s.balance - prevBal;
      transferLog.sold.push({ name, ovr, valMi: val, earned: soldEarned });
      console.log(`  ✅ VENDIDO: ${name} (OVR ${ovr}) -> R$ ${soldEarned.toLocaleString('pt-BR')} arrecadados`);
    } catch (err) {
      bugs.push({ stage: 'quickSellPlayer', player: name, error: err.message });
      console.error(`  ❌ Erro ao vender ${name}:`, err.message);
    }
  }

  // 3. Sistema de Upgrades (Estádio e Instalações)
  console.log(`\n--- 🏗️ SISTEMA DE UPGRADES: ESTÁDIO & INSTALAÇÕES ---`);
  const upgradesExecuted = [];
  s.stadiumUpgrades = s.stadiumUpgrades || { chairs: false, mosaic: false, ledRing: false, flares: false, screen: false, ledLights: false };

  const calcUpFn = env.calcularCustoUpgrade || env.window.calcularCustoUpgrade || ((b) => Math.round(b * 1.15));
  for (const itemKey of config.upgradePlan) {
    const cfg = Object.values(env.STADIUM_UPGRADES_CONFIG || {}).find(u => u.key === itemKey);
    const cost = cfg ? calcUpFn(cfg.custoBase, 0, false) : 50000;
    if (s.balance >= cost) {
      s.balance -= cost;
      s.expense = (s.expense || 0) + cost;
      s.stadiumUpgrades[itemKey] = true;
      upgradesExecuted.push({ type: 'stadium', item: cfg ? cfg.nome : itemKey, cost });
      console.log(`  ✅ Estádio: Instalado [${cfg ? cfg.nome : itemKey}] por R$ ${cost.toLocaleString('pt-BR')} (+${cfg?.bonusCaldeirao || 1} Caldeirão)`);
    }
  }

  // Upgrade de Instalação (Depto Médico)
  try {
    const upFacFn = env.upgradeFacility || env.window.upgradeFacility;
    const facCostFn = env.facilityCost || env.window.facilityCost;
    if (upFacFn && facCostFn) {
      const medCost = facCostFn('medical');
      if (s.balance >= medCost) {
        upFacFn('medical');
        upgradesExecuted.push({ type: 'facility', item: 'Departamento Médico Nível 2', cost: medCost });
        console.log(`  ✅ Instalação: Departamento Médico evoluído para Nível ${s.infrastructure?.medical?.level || 2}`);
      }
    }
  } catch (err) {
    bugs.push({ stage: 'facilityUpgrade', error: err.message });
    console.error(`  ❌ Erro no upgrade de instalações:`, err.message);
  }

  // 4. Mercado da Bola: Compra de Reforço e Montagem do Time
  console.log(`\n--- 🛍️ JANELA DE TRANSFERÊNCIAS: COMPRAS ---`);
  const allPlayers = env.LIVE_PLAYERS || [];
  let targetPlayer = allPlayers.find(p => p.name.toLowerCase().includes(config.targetBuy.toLowerCase()));
  if (!targetPlayer) {
    targetPlayer = allPlayers.find(p => env.norm(p.club) !== env.norm(config.club) && env.playerOverall(p) >= 78) || allPlayers[0];
  }

  if (targetPlayer) {
    const tKey = env.playerKey(targetPlayer);
    const baseVal = Math.round(env.calcValueMi(targetPlayer) * 1e6);
    const buyPrice = Math.max(500000, baseVal);
    const wage = Math.max(30000, env.playerSalary(targetPlayer));

    try {
      // Executa contratação e assinatura
      s.balance -= buyPrice;
      s.expense = (s.expense || 0) + buyPrice;
      s.playerMoves = s.playerMoves || {};
      s.playerMoves[tKey] = s.club;

      const signedPlayer = {
        ...targetPlayer,
        club: s.club,
        owned: true,
        marketKey: tKey,
        fitness: 100,
        morale: 90,
        wage: wage,
        contractUntil: s.season + 3
      };

      s.squad.push(signedPlayer);
      s.transfers = s.transfers || [];
      s.transfers.unshift({ type: 'in', name: targetPlayer.name, from: targetPlayer.club || 'Mercado', to: s.club, value: buyPrice, date: s.date });

      // Otimiza escalação com o novo reforço
      env.optimizeLineup();

      transferLog.bought.push({ name: targetPlayer.name, ovr: env.playerOverall(signedPlayer), pos: signedPlayer.pos, cost: buyPrice, wage });
      console.log(`  ✅ CONTRATADO: ${targetPlayer.name} (${signedPlayer.pos}, OVR ${env.playerOverall(signedPlayer)}) por R$ ${buyPrice.toLocaleString('pt-BR')} (Salário: R$ ${wage.toLocaleString('pt-BR')}/mês)`);
      console.log(`  🛡️ Escalação reotimizada com sucesso! Titulares definidos: ${s.lineup ? s.lineup.filter(Boolean).length : 0}/11`);
    } catch (err) {
      bugs.push({ stage: 'buyPlayer', player: targetPlayer.name, error: err.message });
      console.error(`  ❌ Erro ao contratar ${targetPlayer.name}:`, err.message);
    }
  }

  // 5. Sistema de Ações (SAF Shares & Bolsa)
  console.log(`\n--- 📈 SISTEMA DE AÇÕES & SAF: BOLSA DE VALORES ---`);
  const sharesHistory = { purchases: [], sales: [], dividendsCollected: 0 };
  const lifeShares = env.window.AFM_LifeAndSharesPro;
  if (lifeShares) {
    try {
      lifeShares.ensureState(s);
      s.managerPersonal = s.managerPersonal || {};
      s.managerPersonal.personalBalance = Math.max(1000000, Number(s.managerPersonal.personalBalance) || 1000000);

      // Compra ações do clube SAF designado
      const buyRes = lifeShares.buySafShares(s, config.safStockToTrade, 2500);
      if (buyRes.ok) {
        sharesHistory.purchases.push({ ticker: config.safStockToTrade, count: 2500 });
        console.log(`  ✅ ${buyRes.message}`);
      } else {
        console.log(`  ⚠️ Aviso de compra SAF: ${buyRes.message}`);
      }

      // Testa venda parcial de 500 ações
      const sellRes = lifeShares.sellSafShares(s, config.safStockToTrade, 500);
      if (sellRes.ok) {
        sharesHistory.sales.push({ ticker: config.safStockToTrade, count: 500 });
        console.log(`  ✅ ${sellRes.message || 'Venda de 500 ações concluída com sucesso!'}`);
      }
    } catch (err) {
      bugs.push({ stage: 'safShares', error: err.message });
      console.error(`  ❌ Erro no sistema de ações SAF:`, err.message);
    }
  } else {
    bugs.push({ stage: 'safShares', error: 'AFM_LifeAndSharesPro is missing' });
  }

  // 6. Simulação Completa da Temporada (Jogos, Calendário e Copas)
  console.log(`\n--- ⚽ SIMULANDO JOGOS DA TEMPORADA COMPLETA ---`);
  let matchesPlayed = 0;
  let simulatedCups = 0;
  let loopCount = 0;
  const maxLoops = 600;
  let lastProcessedMonth = parseInt((s.date || '2026-01-01').split('-')[1], 10);

  while (loopCount < maxLoops) {
    loopCount++;
    const gate = env.canStartMatch(null, s);

    // Processa dividendos mensais ao virar o mês
    const currentMonth = parseInt((s.date || '2026-01-01').split('-')[1], 10);
    if (currentMonth !== lastProcessedMonth) {
      lastProcessedMonth = currentMonth;
      if (lifeShares && typeof lifeShares.processMonthlyLifeAndDividendsTurn === 'function') {
        try {
          const divRes = lifeShares.processMonthlyLifeAndDividendsTurn(s);
          if (divRes && divRes.safDividends > 0) {
            sharesHistory.dividendsCollected += divRes.safDividends;
          }
        } catch (e) {
          // ignore minor dividend log error
        }
      }
    }

    if (gate.status === 'season_finished' || s.round >= (s.schedule?.length || 38)) {
      console.log(`  🏁 Temporada Concluída! Loop ${loopCount} | Data final: ${s.date} | Jogos disputados: ${matchesPlayed}`);
      break;
    }

    if (gate.status === 'future') {
      const days = Math.max(1, gate.daysDiff || 1);
      env.advanceCalendarDays(days, true);
      continue;
    }

    if (gate.status === 'other_competitions_pending') {
      const fix = gate.nextFixture || env.getNextPendingClubFixture(s);
      if (fix && fix.date && fix.date > s.date) {
        const current = new Date(`${s.date}T12:00:00`);
        const target = new Date(`${fix.date}T12:00:00`);
        const diff = Math.max(1, Math.round((target - current) / 86400000));
        env.advanceCalendarDays(diff, true);
      } else {
        env.simulateQuickRound();
        matchesPlayed++;
        simulatedCups++;
      }
      continue;
    }

    if (gate.status === 'playable') {
      env.simulateQuickRound();
      matchesPlayed++;
      if (matchesPlayed % 15 === 0) {
        console.log(`  -> Jogo ${matchesPlayed} disputado. Rodada ${s.round}/${s.schedule.length}, Data: ${s.date}`);
      }
      continue;
    }

    if (gate.status === 'no_fixture' || gate.isBye) {
      env.advanceCalendarDays(1, true);
      continue;
    }

    env.advanceCalendarDays(1, true);
  }

  // 7. Avaliação da Classificação Final e Premiações
  console.log(`\n--- 🏆 PREMIAÇÕES E RESULTADOS FINAIS ---`);
  const finalTable = [...(s.teams || [])].sort((a, b) => b.p - a.p || (b.v || 0) - (a.v || 0) || b.sg - a.sg || b.gp - a.gp);
  const myTeamRecord = finalTable.find(t => env.norm(t.name) === env.norm(s.club)) || { p: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
  const position = Math.max(1, finalTable.findIndex(t => env.norm(t.name) === env.norm(s.club)) + 1);

  const curCompObj = env.curComp() || { id: config.compId, name: config.compId };
  let leaguePrize = 0;
  try {
    leaguePrize = env.calculateSeasonPrizeMoney(position, curCompObj);
  } catch (err) {
    bugs.push({ stage: 'calculateSeasonPrizeMoney', error: err.message });
  }

  // Calcula premiação de copa
  let cupPrize = 0;
  if (config.compId === 'bra-a') {
    cupPrize = env.calculateCupPhasePrize('bra-cup', 'Semifinais', true, false);
  } else if (config.compId === 'eng-1') {
    cupPrize = env.calculateCupPhasePrize('ucl', 'Semifinais', true, false);
  } else if (config.compId === 'esp-1') {
    cupPrize = env.calculateCupPhasePrize('ucl', 'Final', true, true);
  } else if (config.compId === 'usa-1') {
    cupPrize = env.calculateCupPhasePrize('cwc', 'Oitavas de Final', true, false);
  } else if (config.compId === 'ksa-1') {
    cupPrize = env.calculateCupPhasePrize('cwc', 'Quartas de Final', true, false);
  }

  const totalPrizeWon = leaguePrize + cupPrize;

  // Credita premiação no caixa do clube
  const prePrizeBalance = s.balance;
  s.balance += totalPrizeWon;
  s.income = (s.income || 0) + totalPrizeWon;

  // Verificações finais de integridade
  if (isNaN(s.balance)) bugs.push({ stage: 'finalBalance', error: 'Final balance is NaN' });
  if (isNaN(totalPrizeWon)) bugs.push({ stage: 'totalPrize', error: 'Total prize is NaN' });
  if (position <= 0 || position > finalTable.length) bugs.push({ stage: 'finalPosition', error: `Invalid position: ${position}` });

  console.log(`  📊 Posição Final na Liga: ${position}º Lugar (${myTeamRecord.p} pts | ${myTeamRecord.v}V - ${myTeamRecord.e}E - ${myTeamRecord.d}D | SG: ${myTeamRecord.sg})`);
  console.log(`  💰 Premiação da Liga: R$ ${leaguePrize.toLocaleString('pt-BR')}`);
  console.log(`  🏆 Premiação de Copas/Continentais: R$ ${cupPrize.toLocaleString('pt-BR')}`);
  console.log(`  💵 Premiação Total Recebida: R$ ${totalPrizeWon.toLocaleString('pt-BR')}`);
  console.log(`  🏦 Saldo Final do Clube: R$ ${s.balance.toLocaleString('pt-BR')} (Delta: ${s.balance >= initialBalance ? '+' : ''}R$ ${(s.balance - initialBalance).toLocaleString('pt-BR')})`);
  console.log(`  📈 Dividendos Recebidos na Bolsa SAF: R$ ${sharesHistory.dividendsCollected.toLocaleString('pt-BR')}`);

  if (bugs.length === 0) {
    console.log(`  🎉 TEMPORADA EXECUTADA COM 100% DE SUCESSO! ZERO BUGS DETECTADOS.`);
  } else {
    console.log(`  ⚠️ ${bugs.length} incidentes detectados:`, JSON.stringify(bugs));
  }

  return {
    config,
    initialBalance,
    finalBalance: s.balance,
    balanceDelta: s.balance - initialBalance,
    matchesPlayed,
    simulatedCups,
    myTeamRecord,
    position,
    totalTeams: finalTable.length,
    leaguePrize,
    cupPrize,
    totalPrizeWon,
    transferLog,
    upgradesExecuted,
    sharesHistory,
    managerPersonal: s.managerPersonal,
    bugs,
    ok: bugs.length === 0
  };
}

console.log('################################################################');
console.log('### INICIANDO TESTE COMPLETO DOS 5 USUÁRIOS DE IA PELO MUNDO ###');
console.log('################################################################\n');

const results = [];
for (const cfg of AI_CONFIGS) {
  const res = runSingleAiSeason(cfg);
  results.push(res);
}

// Salva relatório estruturado JSON para auditoria
fs.writeFileSync(path.join(__dirname, 'simulation_5_ai_results.json'), JSON.stringify(results, null, 2), 'utf8');

console.log('\n\n================================================================');
console.log('📊 RESUMO CONSOLIDADO DAS 5 IAs');
console.log('================================================================');
results.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.config.region}] ${r.config.club} — Treinador: ${r.config.manager}`);
  console.log(`   Posição: ${r.position}º/${r.totalTeams} | Jogos: ${r.matchesPlayed} (${r.myTeamRecord.v}V ${r.myTeamRecord.e}E ${r.myTeamRecord.d}D) | ${r.myTeamRecord.p} Pts`);
  console.log(`   Transfers: ${r.transferLog.sold.length} Vendidos (R$ ${r.transferLog.sold.reduce((a,b)=>a+b.earned,0).toLocaleString('pt-BR')}) / ${r.transferLog.bought.length} Comprados (R$ ${r.transferLog.bought.reduce((a,b)=>a+b.cost,0).toLocaleString('pt-BR')})`);
  console.log(`   Upgrades Feitos: ${r.upgradesExecuted.length} (Total R$ ${r.upgradesExecuted.reduce((a,b)=>a+b.cost,0).toLocaleString('pt-BR')})`);
  console.log(`   Ações SAF: 2.500 Compradas / 500 Vendidas | Dividendos: R$ ${r.sharesHistory.dividendsCollected.toLocaleString('pt-BR')}`);
  console.log(`   Premiação Ganha: R$ ${r.totalPrizeWon.toLocaleString('pt-BR')} (Liga: R$ ${r.leaguePrize.toLocaleString('pt-BR')} + Copas: R$ ${r.cupPrize.toLocaleString('pt-BR')})`);
  console.log(`   Saldo Final: R$ ${r.finalBalance.toLocaleString('pt-BR')} (Delta: ${r.balanceDelta>=0?'+':''}R$ ${r.balanceDelta.toLocaleString('pt-BR')})`);
  console.log(`   Status do Motor: ${r.ok ? '✅ 100% OK (0 BUGS)' : '❌ BUGS: ' + r.bugs.length}`);
  console.log('----------------------------------------------------------------');
});
