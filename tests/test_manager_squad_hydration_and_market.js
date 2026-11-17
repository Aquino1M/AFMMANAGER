const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes de Integridade de Elenco, Tática e Mercado (Modo Treinador)...');

// Mock browser environment
global.window = global;
const createdDOMElements = [];
global.document = {
  createElement: (tag) => {
    const el = { tagName: tag.toUpperCase(), className: '', style: {}, innerHTML: '', id: '', appendChild: () => {}, remove: () => {} };
    createdDOMElements.push(el);
    return el;
  },
  getElementById: (id) => {
    if (id === 'afmDayAdvanceNewsModal' || id === 'afmPostMatchHubModal') {
      return { id, remove: () => { global[`__removed_${id}`] = true; } };
    }
    return null;
  },
  querySelector: () => null,
  querySelectorAll: () => []
};

// Mock helpers
global.norm = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
global.esc = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
global.formatDatePtBr = isoStr => isoStr || '01 de janeiro de 2026';
global.playerKey = p => p ? (p.marketKey || p.id || p.name || 'player') : 'null';
global.playerOverall = p => Number(p?.ovr || p?.overall || 55);
global.playerSalary = p => Number(p?.salary || p?.wage || 5000);
global.calcValueMi = p => Number(p?.value || p?.marketValueMi || 0.2);
global.fmtMoney = val => `R$ ${Number(val||0).toLocaleString('pt-BR')}`;
global.clamp = (v, min, max) => Math.min(max, Math.max(min, v));
global.livePlayers = [];
global.PLAYERS_DB = [];
global.ALL_PLAYERS = [];
global.save = () => true;
global.render = () => {};
global.toast = () => {};

// Carregar código do js/game.js
const gameCode = fs.readFileSync('js/game.js', 'utf8');

// Extrair e avaliar funções necessárias
function extractSnippet(source, startMarker, endMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker start not found: ${startMarker}`);
  const endIdx = source.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error(`Marker end not found: ${endMarker}`);
  return source.slice(startIdx, endIdx + endMarker.length);
}

const hydrationSnippet = extractSnippet(
  gameCode,
  'function normalizeClubLookupKey(str)',
  'window.autoNumberSquad = autoNumberSquad;'
);
eval(hydrationSnippet);

// 1. Testar normalizeClubLookupKey
console.log('1. Testando normalizeClubLookupKey...');
assert.strictEqual(normalizeClubLookupKey('Ceilândia'), 'ceilandia');
assert.strictEqual(normalizeClubLookupKey('CEILÂNDIA E.C.'), 'ceilandiaec');
assert.strictEqual(normalizeClubLookupKey('Real Brasília FC'), 'realbrasiliafc');
assert.strictEqual(normalizeClubLookupKey('São Paulo'), 'saopaulo');
console.log('✅ normalizeClubLookupKey passou nos testes.');

// 2. Testar generateFallbackSquadForClub
console.log('2. Testando generateFallbackSquadForClub...');
const squad = generateFallbackSquadForClub('Ceilândia', 55, 22);
assert.strictEqual(squad.length, 22, 'Deve gerar exatamente 22 jogadores');
const gks = squad.filter(p => ['GK', 'GOL'].includes(p.pos));
assert(gks.length >= 2, 'Deve conter pelo menos 2 goleiros');
squad.forEach((p, idx) => {
  assert(p.name, `Jogador ${idx} deve ter nome`);
  assert(p.ovr >= 45 && p.ovr <= 95, `OVR fora da faixa: ${p.ovr}`);
  assert(p.wage > 0, `Salário deve ser maior que 0`);
  assert(p.marketValue > 0, `Valor de mercado deve ser maior que 0`);
  assert.strictEqual(p.club, 'Ceilândia');
  assert.strictEqual(p.owned, true);
});
console.log('✅ generateFallbackSquadForClub passou nos testes.');

// 3. Testar syncLineupFromSquad
console.log('3. Testando syncLineupFromSquad...');
const testState = {
  squad: squad,
  lineup: []
};
syncLineupFromSquad(testState);
assert.strictEqual(testState.lineup.length, 11, 'Lineup deve ter exatamente 11 titulares');
const starter0 = testState.squad.find(p => playerKey(p) === testState.lineup[0]);
assert(starter0 && ['GK', 'GOL'].includes(starter0.pos), 'Slot 0 da escalação deve ser GK');
assert(testState.captainId, 'Deve definir um capitão');
assert(testState.penaltyTakerId, 'Deve definir cobrador de pênaltis');
console.log('✅ syncLineupFromSquad passou nos testes.');

// 4. Testar ensureManagerSquadHydrated
console.log('4. Testando ensureManagerSquadHydrated em clube vazio...');
const emptyManagerState = {
  gameMode: 'manager',
  club: 'Ceilândia',
  teamOvr: 54,
  squad: [],
  lineup: [],
  playerCareer: { name: 'Residual' },
  controlledPlayerId: 999,
  news: ['treinamentos do atleta do usuário repercutiram', 'Vitória importante']
};

ensureManagerSquadHydrated(emptyManagerState);
assert.strictEqual(emptyManagerState.squad.length, 22, 'Deve ter hidratado 22 jogadores no state.squad');
assert.strictEqual(emptyManagerState.lineup.length, 11, 'Deve ter escalado 11 titulares no state.lineup');
assert.strictEqual(emptyManagerState.playerCareer, null, 'Deve ter limpado resíduos de playerCareer');
assert.strictEqual(emptyManagerState.controlledPlayerId, null, 'Deve ter limpado controlledPlayerId');
assert.strictEqual(emptyManagerState.news.length, 1, 'Deve ter limpado notícias do atleta');
assert.strictEqual(global.__removed_afmDayAdvanceNewsModal, true, 'Deve ter removido afmDayAdvanceNewsModal');
assert.strictEqual(global.__removed_afmPostMatchHubModal, true, 'Deve ter removido afmPostMatchHubModal');
console.log('✅ ensureManagerSquadHydrated passou nos testes.');

// 5. Testar autoNumberSquad
console.log('5. Testando autoNumberSquad...');
autoNumberSquad(emptyManagerState);
const starterGk = emptyManagerState.squad.find(p => playerKey(p) === emptyManagerState.lineup[0]);
assert.strictEqual(starterGk.number, 1, 'Goleiro titular deve receber a camisa #1');
emptyManagerState.squad.forEach(p => {
  assert(p.number >= 1 && p.number <= 25, `Número de camisa fora do intervalo: ${p.number}`);
  assert.strictEqual(p.shirtNumber, p.number, 'shirtNumber e number devem ser idênticos');
});
console.log('✅ autoNumberSquad passou nos testes.');

// 6. Testar presença do código nas abas do jogo
console.log('6. Testando integridade do código nas telas Meu Time, Elenco e Mercado...');
assert(gameCode.includes('btnFixLineupImmediate'), 'Deve conter botão #btnFixLineupImmediate na tática');
assert(gameCode.includes('squadSearchInput'), 'Deve conter campo #squadSearchInput na aba de elenco');
assert(gameCode.includes('btnAutoNumberSquad'), 'Deve conter botão #btnAutoNumberSquad na aba de elenco');
assert(gameCode.includes('squadTableBody'), 'Deve conter tbody com id squadTableBody');
assert(gameCode.includes('btn-market-chip'), 'Deve conter chips de atalho rápido no mercado');
assert(gameCode.includes('quickChip === \'affordable\''), 'Deve suportar filtro rápido de caixa no mercado');
assert(gameCode.includes('quickChip === \'free\''), 'Deve suportar filtro rápido de fim de contrato no mercado');
assert(gameCode.includes('quickChip === \'u21\''), 'Deve suportar filtro rápido de jovens Sub-21 no mercado');
assert(gameCode.includes('quickChip === \'loan\''), 'Deve suportar filtro rápido de empréstimo no mercado');

console.log('🎉 Todos os testes de integridade de elenco e mercado passaram com sucesso!');
