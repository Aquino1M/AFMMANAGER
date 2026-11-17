const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes da Aba Instalações & Estádio (Modo Treinador)...');

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

// 1. Carregar módulos
require('../js/competitions.js');
const gameCode = fs.readFileSync('js/game.js', 'utf8');

function extractSnippet(source, startMarker, endMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker start not found: ${startMarker}`);
  const endIdx = source.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error(`Marker end not found: ${endMarker}`);
  return source.slice(startIdx, endIdx + endMarker.length);
}

// Avaliar inicializações globais
const globalsSnippet = extractSnippet(
  gameCode,
  '// Fallback seguro caso algum script chame $(...).forEach(...)',
  'window.__afmFacilityLock = false;\n}'
);
eval(globalsSnippet);

// Avaliar FACILITIES
const facilitiesSnippet = extractSnippet(
  gameCode,
  'const FACILITIES={',
  'bank:{name:\'Banco & Financiamento\',icon:\'🏦\',base:500000,max:8,effect:\'Linhas de crédito para o clube, antecipação com bônus e controle de dívidas.\'}\n};'
);
eval(facilitiesSnippet.replace('const FACILITIES=', 'global.FACILITIES='));

// Avaliar ensureManagerEconomyHydrated e ensureClubStructureHydrated
const structureHydrationSnippet = extractSnippet(
  gameCode,
  'function ensureManagerEconomyHydrated(state)',
  'window.openTrainingModal = function() {\n  if (typeof openTrainingCenterModal === \'function\') return openTrainingCenterModal();\n};'
);
eval(structureHydrationSnippet);

// Teste 1: ensureClubStructureHydrated com estado vazio / corrompido
console.log('1. Testando ensureClubStructureHydrated...');
const corruptState = {
  club: 'Ceilândia',
  balance: 1400000,
  bankLoans: {}, // Objeto corrompido em vez de array
  trophies: null,
  clubTrophies: null,
  stadiumCapacity: 0,
  ticketPrice: NaN,
  parkingPrice: null,
  facilities: null,
  infrastructure: null
};

window.ensureClubStructureHydrated(corruptState);

assert.ok(Array.isArray(corruptState.bankLoans), 'bankLoans deve ser convertido em array');
assert.strictEqual(corruptState.bankLoans.length, 0);
assert.ok(Array.isArray(corruptState.trophies), 'trophies deve ser array');
assert.ok(Array.isArray(corruptState.clubTrophies), 'clubTrophies deve ser array');
assert.ok(corruptState.stadiumCapacity >= 5000, 'stadiumCapacity deve ser >= 5000');
assert.strictEqual(corruptState.ticketPrice, 25, 'ticketPrice padrão deve ser 25');
assert.strictEqual(corruptState.parkingPrice, 25, 'parkingPrice padrão deve ser 25');
assert.strictEqual(typeof corruptState.facilities, 'object');
assert.strictEqual(corruptState.facilities.stadium, 2);
assert.strictEqual(corruptState.facilities.training, 1);
assert.strictEqual(corruptState.facilities.medical, 1);
assert.strictEqual(corruptState.facilities.admin, 1);
assert.strictEqual(corruptState.facilities.store, 1);
assert.strictEqual(corruptState.facilities.press, 1);
assert.strictEqual(corruptState.facilities.bank, 1);
assert.strictEqual(corruptState.infrastructure.training.level, 1);
console.log('✅ ensureClubStructureHydrated validado com sucesso!');

// Teste 2: safeUpgradeFacility e trava anti-duplo clique
console.log('2. Testando safeUpgradeFacility & trava window.__afmFacilityLock...');
let upgradeCount = 0;
const mockUpgradeFn = () => { upgradeCount++; };

assert.strictEqual(window.__afmFacilityLock, false);
safeUpgradeFacility('training', mockUpgradeFn);
assert.strictEqual(upgradeCount, 1);
assert.strictEqual(window.__afmFacilityLock, true);

// Segundo clique imediato deve ser ignorado pela trava
safeUpgradeFacility('training', mockUpgradeFn);
assert.strictEqual(upgradeCount, 1, 'Segundo clique rápido não deve executar upgradeFn');
console.log('✅ Trava anti-duplo clique validada com sucesso!');

// Teste 3: Card 3D e botões padronizados
console.log('3. Testando AFMStadium3D.renderStadium3DCardHTML...');
require('../js/core/stadium_3d_manager.js');

const card3DHtml = window.AFMStadium3D.renderStadium3DCardHTML('Ceilândia', corruptState);
assert.ok(card3DHtml.includes('id="btnOpenStadium3DTop"'), 'Botão VER EM 3D deve ter id="btnOpenStadium3DTop"');
assert.ok(card3DHtml.includes('data-struct-action="stadium-3d"'), 'Botão VER EM 3D deve ter data-struct-action="stadium-3d"');
assert.ok(card3DHtml.includes('id="btnInspectStadium3D"'), 'Botão Inspecionar 3D deve ter id="btnInspectStadium3D"');
assert.ok(card3DHtml.includes('data-struct-action="stadium-expansion"'), 'Botão Setores & Obras deve ter data-struct-action="stadium-expansion"');
console.log('✅ Card 3D e atributos data-struct-action validados com sucesso!');

// Teste 4: Renderização de structurePage e botões de atalhos e bônus
console.log('4. Testando structurePage()...');
global.HOUSE_ITEMS = [
  { id: 'house_flat', name: 'Apartamento Duplex', cost: 150000, category: 'Imóvel', unlocked: true, reqText: 'Disponível' }
];
global.state = corruptState;
global.state.housePurchases = [];
global.structureSubTab = 'facilities';
global.syncStadiumCapacityAndLevel = () => {};
global.userFixture = () => ['Ceilândia', 'Gama'];
global.attendanceProjection = () => ({
  attendance: 8000,
  rate: 0.44,
  rec: 25,
  priceVerdict: 'Preço Justo',
  priceColor: '#22c55e',
  priceRatio: 1,
  revenue: 200000,
  parkRevenue: 25000,
  storeShop: 15000,
  totalRevenue: 240000,
  attendanceForceBonus: 3
});
global.getStadiumExpansionData = () => ({
  ring: 2,
  maxRings: 6,
  sides: { norte: true, sul: false, leste: false, oeste: false },
  activeWork: null
});
global.getStadiumWorkDaysRemaining = () => 0;
global.facilityCost = () => 650000;
global.totalFacilitiesMonthlyExpense = () => 74300;
global.facilitiesExpensesPerRound = () => 18575;
global.stadiumMonthlyCost = () => 24000;
global.facilityMonthlyCost = () => 8000;
global.trainingBonusPct = (lvl) => lvl;
global.squadCapacity = (lvl) => 25 + lvl * 2;
global.parkingSpots = (lvl) => lvl * 500;
global.normalizeYouthAcademyRoster = () => [];
global.YOUTH_ACADEMY_CAPACITY = 20;
global.totalBankDebt = () => 0;
global.bankAvailableCredit = () => 10000000;
global.getNewArenaData = () => ({ underConstruction: false });
global.getSelectedArenaCapacity = () => 18000;
global.getMuseumData = () => ({
  levelObj: { name: 'Estante de Troféus', level: 1, capacity: 2, cost: 500000 },
  allTitles: [],
  inVitrine: [],
  overflow: [],
  isUnhappy: false
});

const fullStructureSnippet = extractSnippet(
  gameCode,
  'function structurePage(){',
  '// -------------------------------------------------------------\n// ESCRITÓRIO & PATROCINADORES'
);
eval(fullStructureSnippet);

const structHtml = structurePage();

// Sub-abas
assert.ok(structHtml.includes('data-struct-tab="facilities"'));
assert.ok(structHtml.includes('data-struct-tab="stadium"'));
assert.ok(structHtml.includes('data-struct-tab="arena"'));
assert.ok(structHtml.includes('data-struct-tab="museum"'));
assert.ok(structHtml.includes('data-struct-tab="house"'));

// Atalhos rápidos
assert.ok(structHtml.includes('data-struct-action="parking-modal"'), 'Atalho de estacionamento com data-struct-action');
assert.ok(structHtml.includes('data-struct-action="stadium-interactive"'), 'Atalho de estádio com data-struct-action');
assert.ok(structHtml.includes('data-struct-action="store-modal"'), 'Atalho de loja com data-struct-action');
assert.ok(structHtml.includes('data-struct-action="training-modal"'), 'Atalho de treino com data-struct-action');
assert.ok(structHtml.includes('data-struct-action="bank-modal"'), 'Atalho de banco com data-struct-action');

// Botões rápidos dentro dos cards
assert.ok(structHtml.includes('⚽ Foco de Treino'), 'Botão rápido de Foco de Treino no card do CT');
assert.ok(structHtml.includes('🛍️ Preços & Loja'), 'Botão rápido de Preços & Loja no card da Loja');
assert.ok(structHtml.includes('data-struct-action="parking-concession"'), 'Botão de Concessão & Parcerias');

// Bônus transparentes nas instalações
assert.ok(structHtml.includes('Recuperação Física:'), 'Bônus do Departamento Médico presente');
assert.ok(structHtml.includes('Bônus Contratos:'), 'Bônus da Sede Administrativa presente');
assert.ok(structHtml.includes('Moral & Imprensa:'), 'Bônus da Sala de Imprensa presente');
assert.ok(structHtml.includes('Receita Merchandising:'), 'Bônus da Loja Oficial presente');
console.log('✅ structurePage, botões e transparência de bônus validados com sucesso!');

// Teste 5: Sub-aba house (Sua Casa & Bens Pessoais) no Modo Treinador
console.log('5. Testando sub-aba house...');
window.structActiveTab = 'house';
structureSubTab = 'house';
const houseHtml = structurePage();
assert.ok(houseHtml.includes('id="btnGoToManagerCareerFromHouse"'), 'Deve conter botão de ir para carreira na sub-aba house');
assert.ok(houseHtml.includes('data-view="carreira"'), 'Botão de ir para carreira deve ter data-view="carreira"');
assert.ok(houseHtml.includes('SUA CASA & PATRIMÔNIO PESSOAL'), 'Deve renderizar título de patrimônio pessoal');
console.log('✅ Sub-aba house e navegação para carreira validados com sucesso!');

console.log('\n🎉 TODOS OS TESTES DE INSTALAÇÕES E ESTÁDIO PASSARAM COM 100% DE SUCESSO!');
