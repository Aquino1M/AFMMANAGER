const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=== TESTE: REGRA DE VENDA FORA DA JANELA & CONTABILIDADE MENSAL ===');

// Mock DOM e variáveis globais básicas necessárias por game.js
const dom = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Math,
  Date,
  Array,
  Object,
  Number,
  String,
  Boolean,
  RegExp,
  JSON,
  window: {
    addEventListener: () => {},
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  },
  document: dom,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  navigator: { userAgent: 'node' }
};

sandbox.window.window = sandbox.window;
sandbox.window.document = dom;
sandbox.global = sandbox;

// Carregar game.js
const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
const gameJsCode = fs.readFileSync(gameJsPath, 'utf8');

const ctx = vm.createContext(sandbox);

try {
  vm.runInContext(gameJsCode, ctx);
  console.log('✅ js/game.js carregado com sucesso no contexto de teste!');
} catch (err) {
  console.error('❌ Falha ao carregar game.js:', err);
  process.exit(1);
}

// 1. Validar funções auxiliares de transferência
const isTransferWindowOpen = ctx.window.isTransferWindowOpen || ctx.isTransferWindowOpen;
const processPendingTransfersOnWindowOpen = ctx.window.processPendingTransfersOnWindowOpen || ctx.processPendingTransfersOnWindowOpen;
const getPlayerPendingTransfer = ctx.window.getPlayerPendingTransfer || ctx.getPlayerPendingTransfer;
const renderPendingTransferTag = ctx.window.renderPendingTransferTag || ctx.renderPendingTransferTag;
const processClubMonthlyFinances = ctx.window.processClubMonthlyFinances || ctx.processClubMonthlyFinances;

assert.strictEqual(typeof isTransferWindowOpen, 'function', 'isTransferWindowOpen deve existir');
assert.strictEqual(typeof processPendingTransfersOnWindowOpen, 'function', 'processPendingTransfersOnWindowOpen deve existir');
assert.strictEqual(typeof getPlayerPendingTransfer, 'function', 'getPlayerPendingTransfer deve existir');
assert.strictEqual(typeof renderPendingTransferTag, 'function', 'renderPendingTransferTag deve existir');
assert.strictEqual(typeof processClubMonthlyFinances, 'function', 'processClubMonthlyFinances deve existir');

console.log('✅ Todas as funções contratuais e financeiras existem.');

// 2. Cenário de Venda Fora da Janela (ex: 15 de Abril - Janela Fechada)
const testDateClosed = '2026-04-15';
const isClosed = isTransferWindowOpen(testDateClosed);
console.log(`Status da janela em ${testDateClosed}: ${isClosed ? 'ABERTA' : 'FECHADA'}`);
assert.strictEqual(isClosed, false, '15 de Abril deve estar com a janela FECHADA');

const mockPlayer = {
  id: 'p_star_1',
  name: 'Estrela da Base',
  pos: 'ATA',
  age: 21,
  overall: 84,
  salary: 150000,
  marketValue: 35000000
};

const mockSquad = [
  mockPlayer,
  { id: 'p_2', name: 'Goleiro Titular', pos: 'GOL', overall: 80, salary: 100000 },
  { id: 'p_3', name: 'Zagueiro Titular', pos: 'ZAG', overall: 79, salary: 90000 }
];

const mockState = {
  club: 'Flamengo',
  division: 'A',
  date: testDateClosed,
  season: 2026,
  balance: 10000000,
  income: 10000000,
  expenses: 0,
  squad: [...mockSquad],
  lineup: ['p_star_1', 'p_2', 'p_3'],
  transfers: [],
  incomingBids: [],
  news: [],
  marketWorldFeed: [],
  sponsors: {
    master: { brand: 'Banco Alfa', monthly: 2000000, contractYears: 1, monthsRemaining: 12, contractEndSeason: 2026 }
  },
  tvContract1Year: {
    id: 'globo_premiere',
    name: 'Grupo Globo',
    annualTotal: 120000000,
    monthly: 10000000,
    advancedAmount: 0,
    advancedPaid: 0,
    monthsPaid: 0,
    totalPaidToClub: 0
  }
};

ctx.state = mockState;
ctx.window.state = mockState;

// Simular aceitação de proposta milionária fora da janela
const bidFee = 45000000;
const buyer = 'Al-Nassr';

// Definir a venda como faria o modal
mockPlayer.isSold = true;
mockPlayer.soldTo = buyer;
mockPlayer.pendingTransfer = {
  type: 'sale',
  buyerClub: buyer,
  fee: bidFee,
  transferDate: testDateClosed,
  effectiveDate: '2026-06-01',
  playerData: { ...mockPlayer }
};
mockState.balance += bidFee;
mockState.income += bidFee;
mockState.transfers.unshift({
  date: testDateClosed,
  playerName: mockPlayer.name,
  from: mockState.club,
  to: buyer,
  fee: bidFee,
  pending: true
});

// Verificações Fora da Janela
assert.strictEqual(mockState.balance, 55000000, 'Saldo deve ter recebido o valor da venda imediatamente');
assert.strictEqual(mockState.squad.length, 3, 'Jogador NÃO deve ter saído do elenco');
assert.strictEqual(mockState.lineup.includes('p_star_1'), true, 'Jogador continua na escalação');
assert.strictEqual(mockPlayer.isSold, true, 'isSold deve ser true');

const pendingInfo = getPlayerPendingTransfer(mockPlayer);
assert.notStrictEqual(pendingInfo, null, 'getPlayerPendingTransfer deve retornar info da transferência pendente');
assert.strictEqual(pendingInfo.buyerClub, buyer, 'Comprador deve ser Al-Nassr');

const tagHtml = renderPendingTransferTag(mockPlayer);
console.log('Tag renderizada:', tagHtml);
assert.strictEqual(tagHtml.includes('VENDIDO'), true, 'Tag deve conter VENDIDO');
assert.strictEqual(tagHtml.includes('Al-Nassr'), true, 'Tag deve conter o nome do clube comprador');

// 3. Simulação de avanço de dia fora da janela
console.log('\n--- Testando que jogador permanece no elenco ao avançar dias fora da janela ---');
ctx.window.isTransferWindowOpen = () => false; // Forçar janela fechada
processPendingTransfersOnWindowOpen(mockState);
assert.strictEqual(mockState.squad.length, 3, 'Nenhum jogador pode sair enquanto janela estiver fechada');

// 4. Abertura da Janela de Transferências (ex: 2026-06-01)
console.log('\n--- Testando abertura da janela de transferências ---');
mockState.date = '2026-06-01';
console.log('isTransferWindowOpen(2026-06-01) =>', isTransferWindowOpen('2026-06-01'));
console.log('ctx.state.date =>', ctx.state.date);

const changed = processPendingTransfersOnWindowOpen(mockState);
console.log(`Transferências processadas com sucesso na abertura da janela: ${changed}`);
assert.strictEqual(changed, true, 'processPendingTransfersOnWindowOpen deve retornar true indicando alteração');
assert.strictEqual(mockState.squad.length, 2, 'Jogador deve ter sido removido do elenco');
assert.strictEqual(mockState.lineup.includes('p_star_1'), false, 'Jogador deve ter sido removido da escalação');
assert.strictEqual(mockState.marketWorldFeed.length >= 1, true, 'Transferência deve ser anunciada no feed mundial');
assert.strictEqual(mockState.transfers[0].pending, false, 'Registro de transferência deve estar concluído (pending: false)');

console.log('✅ Regra de Venda Fora da Janela e Liberação na Janela testada e APROVADA com 100% de sucesso!');

// 5. Teste da Contabilidade Mensal de TV e Patrocínios
console.log('\n--- Testando Contabilidade Mensal de TV e Patrocínios ---');
mockState.processedFinancialMonths = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
mockState.balance = 50000000;
const prevBalance = mockState.balance;
if(typeof ctx.setState === 'function') ctx.setState(mockState);

processClubMonthlyFinances(mockState, '2026-06-01');

console.log(`Saldo antes: ${prevBalance} | Saldo depois: ${mockState.balance}`);
assert.strictEqual(mockState.tvContract1Year.monthsPaid, 1, 'TV deve ter registrado 1 mês pago');
assert.strictEqual(mockState.tvContract1Year.totalPaidToClub, 10000000, 'TV deve ter pago 10.000.000');
assert.strictEqual(mockState.sponsors.master.monthsRemaining, 11, 'Patrocínio Master deve ter diminuído para 11 meses restantes');

// Idempotência no mesmo mês
const balanceAfterFirstProcess = mockState.balance;
processClubMonthlyFinances(mockState, '2026-06-02');
assert.strictEqual(mockState.balance, balanceAfterFirstProcess, 'Não deve processar novamente no mesmo mês (idempotente)');

console.log('✅ Contabilidade mensal e dedução de parcelas de TV testadas e APROVADAS!');
console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
