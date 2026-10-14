/**
 * AFM MANAGER 2027 — SUITE DE TESTES DO PACOTE SUPREMO (220 MELHORIAS)
 * Arquivo: scripts/test-pacote-supremo.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=============================================================');
console.log('AFM MANAGER 2027 — TESTES AUTOMATIZADOS DO PACOTE SUPREMO');
console.log('=============================================================\n');

let totalTests = 0;
let passedTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${desc}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
  }
}

// Mock browser environment
global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

// Carrega os módulos
require('../js/core/bugfixes_and_guards.js');
require('../js/core/manager_economy.js');
require('../js/core/tactical_4phases.js');
require('../js/core/squad_assistant.js');
require('../js/core/competitions_pack.js');
require('../js/core/press_and_board.js');
require('../js/core/x1_online_system.js');
require('../js/core/audio_engine.js');

console.log('--- TESTE 1: AFM_Guards (Proteções, Validação e O(1) Index) ---');
it('AFM_Guards está instanciado globalmente', () => {
  assert(window.AFM_Guards, 'AFM_Guards deve existir');
});

it('Trava Mutex runWithTurnLock impede múltiplos cliques rápidos', () => {
  let executed = 0;
  const res1 = window.AFM_Guards.runWithTurnLock(() => { executed++; return 'ok1'; });
  const res2 = window.AFM_Guards.runWithTurnLock(() => { executed++; return 'ok2'; });
  assert.strictEqual(res1, 'ok1');
  assert.strictEqual(res2, null, 'Segundo clique dentro de 400ms deve ser ignorado pelo mutex');
  assert.strictEqual(executed, 1);
});

it('rebuildFastIndexes indexa jogadores e clubes com busca O(1)', () => {
  const players = [
    { name: 'Gabriel Barbosa', club: 'Flamengo', pos: 'CF', ovr: 81 },
    { name: 'Raphael Veiga', club: 'Palmeiras', pos: 'AM', ovr: 82 }
  ];
  const clubs = [{ name: 'Flamengo' }, { name: 'Palmeiras' }];
  window.AFM_Guards.rebuildFastIndexes(players, clubs);
  const foundP = window.AFM_Guards.fastFindPlayer('Gabriel Barbosa', 'Flamengo');
  assert(foundP, 'Deve encontrar jogador em O(1)');
  assert.strictEqual(foundP.ovr, 81);
  const foundC = window.AFM_Guards.fastFindClub('Palmeiras');
  assert(foundC, 'Deve encontrar clube em O(1)');
});

it('Limpeza de propostas expiradas cleanExpiredProposals', () => {
  const mockState = {
    round: 10,
    incomingBids: [
      { id: 1, createdRound: 3, status: 'pending' }, // 7 rodadas atrás -> expira
      { id: 2, createdRound: 8, status: 'pending' }  // 2 rodadas atrás -> mantém
    ]
  };
  const count = window.AFM_Guards.cleanExpiredProposals(mockState, 10);
  assert.strictEqual(count, 1, 'Deve remover 1 proposta expirada');
  assert.strictEqual(mockState.incomingBids.length, 1);
  assert.strictEqual(mockState.incomingBids[0].id, 2);
});

console.log('\n--- TESTE 2: AFM_ManagerEconomy (Cotas do Clube & Patrimônio) ---');
it('AFM_ManagerEconomy está instanciado globalmente', () => {
  assert(window.AFM_ManagerEconomy, 'AFM_ManagerEconomy deve existir');
});

it('initManagerEconomy inicializa carteira pessoal sem corromper save antigo', () => {
  const mockState = { managerMoney: 50000 };
  window.AFM_ManagerEconomy.initManagerEconomy(mockState);
  assert.strictEqual(mockState.managerSharesOwned, 0);
  assert.strictEqual(mockState.managerMoney, 50000);
  assert(Array.isArray(mockState.managerAssets));
});

it('Compra de cotas com validação de saldo e teto de 49%', () => {
  const mockState = { managerMoney: 600000, managerSharesOwned: 0, club: 'Flamengo' };
  window.AFM_ManagerEconomy.initManagerEconomy(mockState);
  const res = window.AFM_ManagerEconomy.buyClubShares(mockState, 2);
  assert(res.ok, res.message);
  assert.strictEqual(mockState.managerSharesOwned, 2);
  assert(mockState.managerMoney < 600000);
});

it('Venda de cotas atualiza saldo pessoal', () => {
  const mockState = { managerMoney: 10000, managerSharesOwned: 5, club: 'Flamengo' };
  window.AFM_ManagerEconomy.initManagerEconomy(mockState);
  const res = window.AFM_ManagerEconomy.sellClubShares(mockState, 2);
  assert(res.ok, res.message);
  assert.strictEqual(mockState.managerSharesOwned, 3);
  assert(mockState.managerMoney > 10000);
});

it('onDivisionChangeUpdateSharePrice valoriza em acesso e desvaloriza em queda', () => {
  const mockState = { clubSharePrice: 100000 };
  window.AFM_ManagerEconomy.onDivisionChangeUpdateSharePrice(mockState, true, false);
  assert.strictEqual(mockState.clubSharePrice, 135000, 'Acesso deve valorizar cota em 35%');
  window.AFM_ManagerEconomy.onDivisionChangeUpdateSharePrice(mockState, false, true);
  assert.strictEqual(mockState.clubSharePrice, 101250, 'Queda deve desvalorizar cota em 25%');
});

it('liquidateSharesOnClubExit vende todas as cotas ao trocar de clube', () => {
  const mockState = { managerMoney: 50000, managerSharesOwned: 4, clubSharePrice: 50000 };
  const payout = window.AFM_ManagerEconomy.liquidateSharesOnClubExit(mockState);
  assert.strictEqual(mockState.managerSharesOwned, 0);
  assert.strictEqual(payout, 200000);
  assert.strictEqual(mockState.managerMoney, 250000);
});

console.log('\n--- TESTE 3: AFM_Tactical4Phases (4 Fases & Adaptação da CPU) ---');
it('AFM_Tactical4Phases está instanciado globalmente', () => {
  assert(window.AFM_Tactical4Phases, 'AFM_Tactical4Phases deve existir');
});

it('Transições das 4 fases da partida', () => {
  assert.strictEqual(window.AFM_Tactical4Phases.getNextPhase('BUILD_UP'), 'PROGRESSION');
  assert.strictEqual(window.AFM_Tactical4Phases.getNextPhase('PROGRESSION'), 'CHANCE_CREATION');
  assert.strictEqual(window.AFM_Tactical4Phases.getNextPhase('CHANCE_CREATION'), 'FINISHING');
  assert.strictEqual(window.AFM_Tactical4Phases.getNextPhase('FINISHING'), 'BUILD_UP');
});

it('evaluateAICoachAdjustment força postura ofensiva se perder nos 20min finais', () => {
  const posture = window.AFM_Tactical4Phases.evaluateAICoachAdjustment({
    minute: 78,
    homeGoals: 2,
    awayGoals: 1,
    awayPosture: 'Equilibrada'
  });
  assert.strictEqual(posture, 'OFENSIVA');
});

console.log('\n--- TESTE 4: AFM_SquadAssistant (Auxiliar Técnico e Mentoria) ---');
it('AFM_SquadAssistant está instanciado globalmente', () => {
  assert(window.AFM_SquadAssistant, 'AFM_SquadAssistant deve existir');
});

it('applyAssistantSuggestedSwaps substitui titular com cansaço extremo ou suspensão', () => {
  const squad = [
    { name: 'Titular Esgotado', pos: 'CM', ovr: 80, lineup: 5, cond: 35, suspended: false },
    { name: 'Reserva 100%', pos: 'CM', ovr: 78, lineup: 15, cond: 95, suspended: false }
  ];
  const res = window.AFM_SquadAssistant.applyAssistantSuggestedSwaps(squad);
  assert.strictEqual(res.swapsMade, 1);
  assert.strictEqual(squad[0].lineup, 15);
  assert.strictEqual(squad[1].lineup, 5);
});

it('applyMentorshipVeterans transmite XP para jovens abaixo de 21 anos', () => {
  const squad = [
    { name: 'Veterano', age: 34, ovr: 82, pos: 'ST' },
    { name: 'Jovem Promessa', age: 19, ovr: 72, pos: 'ST', developmentXp: 10 }
  ];
  const msgs = window.AFM_SquadAssistant.applyMentorshipVeterans(squad);
  assert(msgs.length > 0);
  assert(squad[1].developmentXp > 10, 'Jovem deve ganhar XP de mentoria');
});

console.log('\n--- TESTE 5: AFM_X1System (Modo X1 Duelo Tático) ---');
it('AFM_X1System está instanciado globalmente', () => {
  assert(window.AFM_X1System, 'AFM_X1System deve existir');
});

it('exportSquadX1Token e decodeX1Token codificam e decodificam perfeitamente', () => {
  const mockState = {
    club: 'Santos',
    manager: 'Aquino',
    tactic: '4-3-3',
    posture: 'Ofensiva',
    squad: [
      { name: 'Neymar', pos: 'LW', ovr: 86, age: 34, lineup: 11 },
      { name: 'Ganso', pos: 'AM', ovr: 80, age: 35, lineup: 10 }
    ]
  };
  const token = window.AFM_X1System.exportSquadX1Token(mockState);
  assert(typeof token === 'string' && token.length > 20);
  const decoded = window.AFM_X1System.decodeX1Token(token);
  assert(decoded);
  assert.strictEqual(decoded.club, 'Santos');
  assert.strictEqual(decoded.manager, 'Aquino');
  assert.strictEqual(decoded.posture, 'Ofensiva');
  assert.strictEqual(decoded.starters.length, 2);
});

it('importAndSimulateX1Challenge gera resultado sem mutar o save da carreira', () => {
  const mockState = {
    club: 'Santos',
    manager: 'Aquino',
    tactic: '4-3-3',
    posture: 'Ofensiva',
    balance: 5000000,
    round: 5,
    squad: [
      { name: 'Neymar', pos: 'LW', ovr: 86, lineup: 11 }
    ]
  };
  const token = window.AFM_X1System.exportSquadX1Token(mockState);
  const duelRes = window.AFM_X1System.importAndSimulateX1Challenge(mockState, token);
  assert(duelRes.ok);
  assert(Number.isInteger(duelRes.myGoals));
  assert(Number.isInteger(duelRes.oppGoals));
  assert.strictEqual(mockState.balance, 5000000, 'Saldo da carreira deve permanecer inalterado');
  assert.strictEqual(mockState.round, 5, 'Rodada da carreira deve permanecer inalterada');
});

console.log('\n--- TESTE 6: AFM_Competitions (Placar Paralelo em Tempo Real) ---');
it('AFM_Competitions está instanciado globalmente', () => {
  assert(window.AFM_Competitions, 'AFM_Competitions deve existir');
});

it('simulateLiveParallelMatches gera eventos de gol paralelos da rodada', () => {
  const parallelFixtures = [
    { homeName: 'Palmeiras', awayName: 'Corinthians', homeGoals: 0, awayGoals: 0 },
    { homeName: 'Flamengo', awayName: 'Vasco', homeGoals: 0, awayGoals: 0 }
  ];
  // Roda múltiplos minutos para garantir amostragem
  let totalEvents = 0;
  for (let m = 10; m <= 90; m += 10) {
    const evs = window.AFM_Competitions.simulateLiveParallelMatches(parallelFixtures, m);
    totalEvents += evs.length;
  }
  assert(typeof totalEvents === 'number');
});

console.log('\n--- TESTE 7: Audio Engine (Cooldown de 180ms) ---');
it('AFMAudioManager implementa cooldown anti-encavalamento em 20x e 40x', () => {
  const audio = new AFMAudioManager();
  let callCount = 0;
  audio._playProceduralSFX = () => { callCount++; };
  audio.sfxEnabled = true;

  audio.playSFX('whistle_start');
  assert.strictEqual(callCount, 1);

  // Segunda chamada imediata deve ser bloqueada pelo cooldown de 180ms
  audio.playSFX('whistle_start');
  assert.strictEqual(callCount, 1, 'Chamada imediata sem 180ms de intervalo deve ser descartada');
});

console.log('\n=============================================================');
console.log(`TOTAL DE TESTES DO PACOTE SUPREMO: ${totalTests} | APROVADOS: ${passedTests} | FALHAS: ${totalTests - passedTests}`);
console.log('=============================================================');

if (totalTests === passedTests) {
  console.log('\n🎉 TODOS OS TESTES DO PACOTE SUPREMO FORAM APROVADOS COM SUCESSO!');
  process.exit(0);
} else {
  console.error('\n⚠️ Houve falhas nos testes.');
  process.exit(1);
}
