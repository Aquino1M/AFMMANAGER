const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes da Aba Escritório & Finanças (Modo Treinador)...');

// Mock browser environment
global.window = global;
global.Element = function() {};
global.NodeList = function() {};

// Mock document
const domMocks = {};
const eventListeners = {};
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    style: {},
    innerHTML: '',
    children: [],
    dataset: {},
    appendChild: function(c) { this.children.push(c); },
    insertBefore: function(c) { this.children.unshift(c); },
    classList: {
      contains: () => false,
      toggle: () => {},
      add: () => {},
      remove: () => {}
    },
    remove: function() {}
  }),
  getElementById: (id) => domMocks[id] || null,
  querySelector: (sel) => domMocks[sel] || null,
  querySelectorAll: () => [],
  addEventListener: (event, handler) => {
    eventListeners[event] = eventListeners[event] || [];
    eventListeners[event].push(handler);
  }
};

// Mock helpers
global.norm = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
global.esc = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
global.formatDatePtBr = isoStr => isoStr || '01 de janeiro de 2026';
global.fmtMoney = val => `R$ ${Number(val||0).toLocaleString('pt-BR')}`;
global.playerPhoto = () => '<img src="player.png" />';
global.clubBadge = () => '<img src="badge.png" />';
global.save = () => true;
global.render = () => {};
global.toast = () => {};
global.clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// Carregar código do js/game.js
const gameCode = fs.readFileSync('js/game.js', 'utf8').replace(/\r\n/g, '\n');

function extractSnippet(source, startMarker, endMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker start not found: ${startMarker}`);
  const endIdx = source.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error(`Marker end not found: ${endMarker}`);
  return source.slice(startIdx, endIdx + endMarker.length);
}

// Avaliar ensureReadableBrandColor e reconcileOfficeFinances
const officeSnippet = extractSnippet(
  gameCode,
  'function ensureReadableBrandColor(hexColor',
  'window.reconcileOfficeFinances = reconcileOfficeFinances;\n}'
);
eval(officeSnippet);

// Avaliar calcClubMonthlySquadWages
const squadWagesSnippet = extractSnippet(
  gameCode,
  'function calcClubMonthlySquadWages(club',
  'window.totalMonthlyPayroll = totalMonthlyPayroll;\n}'
);
eval(squadWagesSnippet);

// -------------------------------------------------------------
// 1. Testar ensureReadableBrandColor
// -------------------------------------------------------------
console.log('1. Testando ensureReadableBrandColor (auto-contraste)...');

function calcRelativeLuminance(hexColor) {
  let hex = hexColor.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

// Fatal Model (#6b21a8) tem luminância baixa (~0.05), deve ser clareada para >= 0.35
const fatalReadable = ensureReadableBrandColor('#6b21a8');
assert.notStrictEqual(fatalReadable, '#6b21a8', 'Fatal Model deve ser clareada');
const lumFatal = calcRelativeLuminance(fatalReadable);
assert(lumFatal >= 0.35, `Luminância de Fatal Model (${lumFatal}) deve ser >= 0.35`);

// FedEx (#4d148c) tem luminância baixa (~0.03), deve ser clareada
const fedexReadable = ensureReadableBrandColor('#4d148c');
assert.notStrictEqual(fedexReadable, '#4d148c', 'FedEx deve ser clareada');
const lumFedex = calcRelativeLuminance(fedexReadable);
assert(lumFedex >= 0.35, `Luminância de FedEx (${lumFedex}) deve ser >= 0.35`);

// Banco do Brasil (#fcee21) já é claro (luminância > 0.7), deve ser preservado
const bbReadable = ensureReadableBrandColor('#fcee21');
assert.strictEqual(bbReadable, '#fcee21', 'Banco do Brasil deve permanecer inalterado');

console.log('✅ ensureReadableBrandColor passou em todos os testes de luminância.');

// -------------------------------------------------------------
// 2. Testar calcClubMonthlySquadWages
// -------------------------------------------------------------
console.log('2. Testando calcClubMonthlySquadWages...');

const mockSquad = [
  { name: 'Goleiro 1', pos: 'GK', wage: 8000 },
  { name: 'Zagueiro 1', pos: 'CB', wage: 5500 },
  { name: 'Lateral 1', pos: 'LB', wage: 4500 },
  { name: 'Atacante 1', pos: 'ST', wage: 12000 }
];
const mockStateWithSquad = {
  club: 'Ceilândia',
  squad: mockSquad
};

const wagesDirect = calcClubMonthlySquadWages('Ceilândia', mockStateWithSquad);
assert.strictEqual(wagesDirect, 8000 + 5500 + 4500 + 12000, 'Deve somar exatamente os salários dos atletas');

// Teste quando squad está vazio no state mas o clube tem players
const mockClubWithPlayers = {
  name: 'Ceilândia',
  players: [
    { name: 'Player A', wage: 7000 },
    { name: 'Player B', wage: 6000 }
  ]
};
const wagesFromClub = calcClubMonthlySquadWages(mockClubWithPlayers, { club: 'Ceilândia', squad: [] });
assert.strictEqual(wagesFromClub, 13000, 'Deve calcular a partir dos players do clube quando state.squad está vazio');

// Teste fallback seguro para clube desconhecido sem atletas
const fallbackWages = calcClubMonthlySquadWages('Ceilândia', { club: 'Ceilândia', squad: [] });
assert(fallbackWages > 0, 'Fallback nunca deve retornar R$ 0 para um clube ativo');

console.log('✅ calcClubMonthlySquadWages passou em todos os testes.');

// -------------------------------------------------------------
// 3. Testar reconcileOfficeFinances
// -------------------------------------------------------------
console.log('3. Testando reconcileOfficeFinances...');

// Mock monthlyFinancialProjection
global.monthlyFinancialProjection = () => ({
  revenue: {
    sponsors: 0,
    structures: 13000,
    admin: 3500,
    tv: 1062225,
    members: 10800,
    naming: 0,
    store: 11250,
    gate: 0,
    parking: 0,
    matchSales: 0,
    winBonuses: 18000
  },
  expenses: {
    payroll: 0,
    facilities: 74300,
    scouts: 0,
    marketing: 144000,
    bankRepayments: 0,
    stadiumRepayments: 0
  },
  monthlyRevenue: 0,
  monthlyExpenses: 0,
  monthlyBalance: 0,
  projectedClosingBalance: 0
});

const mockOfficeState = {
  club: 'Ceilândia',
  balance: 1401099,
  sponsors: {
    master: { brand: 'Banco do Brasil', monthly: 58659, color: '#fcee21' },
    sleeves: { brand: 'Fatal Model', monthly: 27234, color: '#6b21a8' },
    back: { brand: 'FedEx', monthly: 29329, color: '#4d148c' }
  },
  squad: mockSquad,
  bankLoans: []
};

const reconciled = reconcileOfficeFinances(mockOfficeState, { name: 'Ceilândia', players: mockSquad });

// Verifica que Patrocínios fixos é a soma exata dos 3 contratos
const expectedSponsors = 58659 + 27234 + 29329; // 115.222
assert.strictEqual(reconciled.fixedSponsorsMonthly, expectedSponsors, 'fixedSponsorsMonthly deve somar 115.222');
assert.strictEqual(reconciled.finance.revenue.sponsors, expectedSponsors, 'finance.revenue.sponsors deve ser 115.222');

// Verifica que Salários do elenco é não-zero
assert(reconciled.finance.expenses.payroll > 0, 'Salários do elenco não deve ser 0');
assert.strictEqual(reconciled.finance.expenses.payroll, 30000, 'Salários do elenco deve bater com a soma do mockSquad');

// Verifica reconciliação matemática exata
const sumRev = Object.values(reconciled.finance.revenue).reduce((s, v) => s + v, 0);
assert.strictEqual(reconciled.finance.monthlyRevenue, sumRev, 'monthlyRevenue deve bater com a soma dos itens de receita');

const sumExp = Object.values(reconciled.finance.expenses).reduce((s, v) => s + v, 0);
assert.strictEqual(reconciled.finance.monthlyExpenses, sumExp, 'monthlyExpenses deve bater com a soma dos itens de despesa');

assert.strictEqual(reconciled.finance.monthlyBalance, sumRev - sumExp, 'monthlyBalance deve ser receita - despesa');
assert.strictEqual(reconciled.finance.projectedClosingBalance, mockOfficeState.balance + (sumRev - sumExp), 'projectedClosingBalance deve ser caixa + saldo mensal');

console.log('✅ reconcileOfficeFinances passou em todos os testes de reconciliação contábil.');

// -------------------------------------------------------------
// 4. Testar consistência com trophies_tv_1year_marketing_and_payroll.js
// -------------------------------------------------------------
console.log('4. Testando trophies_tv_1year_marketing_and_payroll.js com state.sponsors ativo...');

const trophiesCode = fs.readFileSync('js/systems/trophies_tv_1year_marketing_and_payroll.js', 'utf8');

// Testa que não há hardcoded 3.550.000 forçado sobre state.sponsors ativo
assert(trophiesCode.includes('if (state && state.sponsors)'), 'Deve verificar se state.sponsors existe');
assert(trophiesCode.includes('state.sponsors.master?.monthly'), 'Deve ler monthly do master');
assert(trophiesCode.includes('state.sponsors.sleeves?.monthly'), 'Deve ler monthly das mangas');
assert(trophiesCode.includes('state.sponsors.back?.monthly'), 'Deve ler monthly das costas');

console.log('✅ trophies_tv_1year_marketing_and_payroll.js atualizado com sucesso.');

// -------------------------------------------------------------
// 5. Testar renderização de officePage em js/game.js
// -------------------------------------------------------------
console.log('5. Testando renderização de officePage...');

// Assegura que o botão CBF possui id="btnOpenCbfLicensesFromOffice" e data-office-action="cbf-licenses"
assert(gameCode.includes('id="btnOpenCbfLicensesFromOffice"'), 'Deve conter id="btnOpenCbfLicensesFromOffice"');
assert(gameCode.includes('data-office-action="cbf-licenses"'), 'Deve conter data-office-action="cbf-licenses"');

// Assegura que sponsorCards usa ensureReadableBrandColor
assert(gameCode.includes('ensureReadableBrandColor(sponsor?.color || \'#fff\')'), 'Deve aplicar ensureReadableBrandColor nos cards oficiais');
assert(gameCode.includes('ensureReadableBrandColor(o.color || \'#fff\')'), 'Deve aplicar ensureReadableBrandColor nas propostas de patrocínio');

// Assegura trava temporal __afmOfficeActionLock
assert(gameCode.includes('window.__afmOfficeActionLock = false;'), 'Deve inicializar window.__afmOfficeActionLock');
assert(gameCode.includes('if(window.__afmOfficeActionLock) return;'), 'Deve verificar window.__afmOfficeActionLock antes de assinar patrocínio');

console.log('✅ Todos os requisitos de marcação e eventos da tela estão presentes.');

console.log('🎉 Todos os 5 testes da Aba Escritório & Finanças foram concluídos com 100% de sucesso!');
