// ============================================================================
// TESTES AUTOMATIZADOS: UNIFICAÇÃO DE ESTÁDIO & NOVA ARENA, MUSEU 16 NÍVEIS
// E TRAVAS DE BENS PESSOAIS (AFM MANAGER)
// Arquivo: tests/test_manager_structure_stadium_unified_fix.js
// ============================================================================

const assert = require('assert');
const fs = require('fs');

// Carrega o módulo structure_stadium_unified_fix.js em ambiente Node
const code = fs.readFileSync('js/structure_stadium_unified_fix.js', 'utf8');

// Cria ambiente simulado de window
global.window = global;
global.document = {
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null
};

eval(code);

console.log('--- TESTE 1: Configuração dos 16 Níveis do Museu ---');
const lvl1 = window.getMuseumConfig(1);
assert.strictEqual(lvl1.level, 1, 'Nível 1 deve ter level=1');
assert.strictEqual(lvl1.capacity, 2, 'Nível 1 deve ter capacidade para 2 taças');
assert.strictEqual(lvl1.cost, 50000, 'Nível 1 deve custar R$ 50.000');
assert.strictEqual(lvl1.fanBonusPct, 3, 'Nível 1 deve dar +3% de bônus');

const lvl16 = window.getMuseumConfig(16);
assert.strictEqual(lvl16.level, 16, 'Nível 16 deve ter level=16');
assert.strictEqual(lvl16.capacity, 32, 'Nível 16 deve ter capacidade para 32 taças');
assert(lvl16.cost > lvl1.cost, 'Nível 16 deve custar mais que Nível 1');
console.log('✓ Teste 1 passou: 16 níveis sincronizados com precisão.');

console.log('--- TESTE 2: Preços e Capacidades da Nova Arena ---');
const pricing = window.AFM_StructureStadium.pricing;
assert(pricing[15000], 'Deve conter preço para 15.000 lugares');
assert(pricing[30000], 'Deve conter preço para 30.000 lugares');
assert(pricing[50000], 'Deve conter preço para 50.000 lugares');
assert(pricing[80000], 'Deve conter preço para 80.000 lugares');
assert(pricing[100000], 'Deve conter preço para 100.000 lugares');

assert.strictEqual(pricing[15000].workCost, 75000000, 'Obra de 15k deve ser 75M');
assert.strictEqual(pricing[50000].workCost, 325000000, 'Obra de 50k deve ser 325M');
console.log('✓ Teste 2 passou: Matriz de preços da Nova Arena calibrada.');

console.log('--- TESTE 3: Prioridade de Taças do Save no Museu (Zero Taças no Chão no Início) ---');
const mockState = {
  club: 'Ceilândia',
  infrastructure: { museum: { level: 1 } }, // capacidade 2
  trophies: [
    { name: 'Campeonato Candango', year: 2026, badge: '🏆' }
  ],
  historicalTitles: [
    { name: 'Campeonato Brasiliense 2010', year: 2010 }
  ]
};

const museumData = window.getUnifiedMuseumData(mockState);
assert.strictEqual(museumData.level, 1, 'Nível deve ser 1');
assert.strictEqual(museumData.capacity, 2, 'Capacidade deve ser 2');
assert.strictEqual(museumData.totalCount, 2, 'Total deve ser 2 taças');
// A taça do save deve ser o primeiro item na vitrine
assert.strictEqual(museumData.showcased[0].name, 'Campeonato Candango', 'Taça do save deve vir primeiro');
assert.strictEqual(museumData.showcased[0].isFromSave, true, 'Deve ser marcada como conquistada no save');
assert.strictEqual(museumData.hasOverflowPenalty, false, 'Não deve haver penalidade com 2 taças na capacidade 2');
console.log('✓ Teste 3 passou: Taça do save priorizada na vitrine sem penalidade.');

console.log('--- TESTE 4: Overflow e Sugestão de Nível no Museu ---');
const mockOverflowState = {
  club: 'Ceilândia',
  infrastructure: { museum: { level: 1 } }, // capacidade 2
  trophies: [
    { name: 'Candango', year: 2026 },
    { name: 'Copa Verde', year: 2026 },
    { name: 'Série D', year: 2026 }
  ],
  historicalTitles: [
    { name: 'Candango 2010', year: 2010 }
  ]
};
const overflowData = window.getUnifiedMuseumData(mockOverflowState);
assert.strictEqual(overflowData.totalCount, 4, 'Total de 4 taças');
assert.strictEqual(overflowData.hasOverflowPenalty, true, 'Deve ter penalidade com 4 taças para 2 vagas');
assert.strictEqual(overflowData.neededLevel, 2, 'Nível necessário deve ser 2 (capacidade 4)');
assert(overflowData.skipCost > 0, 'Custo de ampliação deve ser maior que zero');
console.log('✓ Teste 4 passou: Detecção de overflow e cálculo de skip dinâmico funcionando.');

console.log('--- TESTE 5: Validação Dupla de Bens Pessoais (Carreira + Saldo) ---');
const itemLockedBySeasons = {
  id: 'house_pool',
  name: 'Casa com Piscina',
  cost: 450000,
  unlocked: false,
  reqType: 'seasons',
  reqVal: 1,
  reqText: 'Exige 1 temporada completa no comando'
};

const itemLockedByTitles = {
  id: 'luxury_mansion',
  name: 'Mansão Alphaville',
  cost: 1500000,
  unlocked: false,
  reqType: 'titles',
  reqVal: 2,
  reqText: 'Exige 2 títulos oficiais no currículo'
};

// Cenário A: Dia 1 (0 temporadas, 0 títulos), com R$ 10.000.000 na conta
const stateDay1 = {
  career: { cash: 10000000, seasonsCompleted: 0 },
  historySeasons: 0,
  titles: []
};

const statusA = window.evaluatePersonalAssetStatus(itemLockedBySeasons, stateDay1);
assert.strictEqual(statusA.unlocked, false, 'Deve estar bloqueado por temporadas');
assert.strictEqual(statusA.isCareerLocked, true, 'Deve marcar isCareerLocked=true');
assert.strictEqual(statusA.canBuy, false, 'NÃO pode comprar mesmo com 10M no banco');

// Cenário B: 1 temporada completa, mas saldo insuficiente (R$ 50.000 no banco para item de 450.000)
const stateLowCash = {
  career: { cash: 50000, seasonsCompleted: 1 },
  historySeasons: 1,
  titles: []
};
const statusB = window.evaluatePersonalAssetStatus(itemLockedBySeasons, stateLowCash);
assert.strictEqual(statusB.unlocked, true, 'Deve estar desbloqueado na carreira');
assert.strictEqual(statusB.isCareerLocked, false, 'isCareerLocked deve ser false');
assert.strictEqual(statusB.canAfford, false, 'Saldo deve ser insuficiente');
assert.strictEqual(statusB.canBuy, false, 'NÃO pode comprar por falta de saldo');

// Cenário C: Requisitos de carreira atingidos E saldo suficiente
const stateReady = {
  career: { cash: 600000, seasonsCompleted: 1 },
  historySeasons: 1,
  titles: []
};
const statusC = window.evaluatePersonalAssetStatus(itemLockedBySeasons, stateReady);
assert.strictEqual(statusC.unlocked, true, 'Desbloqueado');
assert.strictEqual(statusC.canAfford, true, 'Pode pagar');
assert.strictEqual(statusC.canBuy, true, 'Pode comprar com sucesso');
console.log('✓ Teste 5 passou: Travas de carreira e saldo bancário 100% validadas.');

console.log('--- TESTE 6: Renderização do Estádio com Dados Reais do Clube ---');
const stateCeilandia = {
  club: 'Ceilândia',
  stadium: { name: 'Abadião', capacity: 18000, ring: 2 },
  infrastructure: { stadium: { level: 2, capacity: 18000 } }
};

const htmlTab = window.renderUnifiedStadiumAndArenaTab(stateCeilandia);
assert(htmlTab.includes('Abadião'), 'HTML deve conter Abadião');
assert(htmlTab.includes('18.000'), 'HTML deve conter capacidade 18.000');
assert(!htmlTab.includes('Bezerrão • 15.000 lugares (15%)'), 'HTML NUNCA deve conter Bezerrão mockado para o Ceilândia');
assert(htmlTab.includes('data-stadium-submode="expand"'), 'Deve conter botão de modo expand');
assert(htmlTab.includes('data-stadium-submode="new-arena"'), 'Deve conter botão de modo new-arena');
console.log('✓ Teste 6 passou: Dados reais do estádio no card e seletor segmentado funcional.');

console.log('\n======================================================');
console.log(' TODOS OS 6 TESTES DA SUÍTE DE ESTRUTURA PASSARAM! ');
console.log('======================================================');
