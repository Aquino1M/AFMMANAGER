const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// 1. Carrega game.js e sistemas relevantes
const gameSource = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');
const lifeSource = fs.readFileSync(path.resolve(__dirname, '../js/systems/manager_life_and_shares_pro.js'), 'utf8');
const economySource = fs.readFileSync(path.resolve(__dirname, '../js/systems/manager_economy.js'), 'utf8');
const stadiumFinanceSource = fs.readFileSync(path.resolve(__dirname, '../js/systems/club_finance_and_stadium.js'), 'utf8');

// Cria contexto mock para teste
const mockLocalStorage = {};
const context = {
  console,
  Math,
  Date,
  Number,
  String,
  Array,
  Object,
  JSON,
  norm: (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
  localStorage: {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; }
  },
  toast: () => {},
  save: () => {},
  render: () => {},
  formatDatePtBr: () => '01 de janeiro de 2027',
  window: {}
};
context.window = context;

vm.createContext(context);

// Carrega os módulos
vm.runInContext(lifeSource, context);
vm.runInContext(economySource, context);
vm.runInContext(stadiumFinanceSource, context);

// Extrai a função repairCorruptedBalanceAndRestoreFunds de game.js
const fnMarker = 'function repairCorruptedBalanceAndRestoreFunds(';
const fnStart = gameSource.indexOf(fnMarker);
assert(fnStart > 0, 'repairCorruptedBalanceAndRestoreFunds deve existir em game.js');
let openBrace = gameSource.indexOf('{', fnStart);
let depth = 0;
let fnEnd = -1;
for (let i = openBrace; i < gameSource.length; i++) {
  if (gameSource[i] === '{') depth++;
  else if (gameSource[i] === '}') {
    depth--;
    if (depth === 0) { fnEnd = i + 1; break; }
  }
}
const fnCode = gameSource.slice(fnStart, fnEnd);
vm.runInContext(fnCode, context);

// TESTE 1: Recuperação do saldo corrompido em -26.250 (bug de virada de temporada)
const corruptedState1 = {
  club: 'AQF',
  season: 2027,
  balance: -26250,
  seasonHistory: [
    { season: 2026, userClub: 'AQF', balance: 17500000, champion: 'AQF' }
  ],
  transfers: [
    { type: 'out', from: 'AQF', to: 'Flamengo', value: 10000000 },
    { type: 'out', from: 'AQF', to: 'Palmeiras', value: 7000000 }
  ]
};

const repaired1 = context.repairCorruptedBalanceAndRestoreFunds(corruptedState1);
assert.strictEqual(repaired1, true, 'Deve reparar estado com saldo -26250');
assert(corruptedState1.balance >= 17000000, `Saldo deve ser restaurado para >= 17M (atual: ${corruptedState1.balance})`);
assert.strictEqual(corruptedState1.clubBalance, corruptedState1.balance, 'clubBalance deve estar perfeitamente sincronizado com balance');

console.log('✅ TESTE 1 PASS: Saldo de -26.250 restaurado para R$', corruptedState1.balance.toLocaleString('pt-BR'));

// TESTE 2: Caso de saldo negativo sem seasonHistory mas com relato de vendas
const corruptedState2 = {
  club: 'AQF',
  season: 2027,
  balance: -26250
};
const repaired2 = context.repairCorruptedBalanceAndRestoreFunds(corruptedState2);
assert.strictEqual(repaired2, true, 'Deve reparar mesmo sem histórico anterior completo');
assert(corruptedState2.balance >= 16973750, 'Saldo garantido de pelo menos 17M menos salário de 26250');

console.log('✅ TESTE 2 PASS: Saldo garantido restaurado para R$', corruptedState2.balance.toLocaleString('pt-BR'));

// TESTE 3: Não deve alterar contas saudáveis
const healthyState = {
  club: 'Palmeiras',
  season: 2027,
  balance: 45000000
};
const repairedHealthy = context.repairCorruptedBalanceAndRestoreFunds(healthyState);
assert.strictEqual(repairedHealthy, false, 'Não deve alterar contas com saldo saudável');
assert.strictEqual(healthyState.balance, 45000000, 'Saldo original mantido');

console.log('✅ TESTE 3 PASS: Contas saudáveis permanecem inalteradas');

// TESTE 4: Validação de que AFM_LifeAndSharesPro.payMonthlyCoachSalary desconta de state.balance e sincroniza state.clubBalance
const testClubState = {
  club: 'AQF',
  season: 2027,
  round: 1,
  date: '2027-01-01',
  balance: 17000000,
  managerSalary: 26250,
  managerPersonal: {
    personalBalance: 0,
    salary: 26250
  }
};

const payResult = context.AFM_LifeAndSharesPro.payMonthlyCoachSalary(testClubState);
assert.strictEqual(payResult.paid, 26250, 'Deve pagar salário de 26250');
assert.strictEqual(testClubState.balance, 17000000 - 26250, 'Deve debitar do saldo real de 17M');
assert.strictEqual(testClubState.clubBalance, testClubState.balance, 'clubBalance deve acompanhar balance');

console.log('✅ TESTE 4 PASS: Pagamento de salário deduz do saldo real sem zerar o caixa');

// TESTE 5: Validação de que AFM_LifeAndSharesPro.processMonthlyLifeAndDividendsTurn não corrompe o caixa
const testDividendsState = {
  club: 'AQF',
  season: 2027,
  round: 1,
  date: '2027-01-01',
  balance: 16973750,
  managerSalary: 26250,
  managerPersonal: {
    personalBalance: 50000,
    salary: 26250,
    clubSharesPct: 0,
    externalShareholdersPct: 22
  }
};

context.AFM_LifeAndSharesPro.processMonthlyLifeAndDividendsTurn(testDividendsState);
assert(testDividendsState.balance > 16000000, 'Saldo deve permanecer alto após pagamento legítimo de dividendos');
assert.strictEqual(testDividendsState.clubBalance, testDividendsState.balance, 'clubBalance deve se manter idêntico a balance');

console.log('✅ TESTE 5 PASS: Dividendos mensais operam no saldo real com total integridade');

console.log('\n🎉 TODOS OS TESTES DE RECUPERAÇÃO E PROTEÇÃO DE SALDO FORAM APROVADOS!');
