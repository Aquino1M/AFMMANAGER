const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes de Correção de Calendário e Notícias (Modo Treinador)...');

// Mock browser environment
global.window = global;
global.Element = function() {};
global.NodeList = function() {};

// Mock document
const domMocks = {
  afmDayAdvanceNewsModal: { id: 'afmDayAdvanceNewsModal', style: {}, innerHTML: 'old', remove: function() { this.removed = true; } },
  afmPostMatchHubModal: { id: 'afmPostMatchHubModal', style: {}, innerHTML: 'old', remove: function() { this.removed = true; } }
};

global.document = {
  createElement: (tag) => ({ tagName: tag.toUpperCase(), className: '', style: {}, innerHTML: '', appendChild: () => {}, remove: () => {} }),
  getElementById: (id) => domMocks[id] || null,
  querySelector: () => null,
  querySelectorAll: () => []
};

// Carregar competições
require('../js/competitions.js');

// Mock helpers
global.norm = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
global.esc = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
global.formatDatePtBr = isoStr => isoStr || '01 de janeiro de 2026';
global.playerKey = p => p ? (p.marketKey || p.id || p.name || 'player') : 'null';
global.playerOverall = p => Number(p?.ovr || p?.overall || 55);
global.playerSalary = p => Number(p?.salary || p?.wage || 5000);
global.calcValueMi = p => Number(p?.value || p?.marketValueMi || 0.2);
global.fmtMoney = val => `R$ ${Number(val||0).toLocaleString('pt-BR')}`;
global.clubBadge = (name, sz) => `<img src="badge.png" width="${sz}"/>`;
global.teamStrengthByName = name => 60;
global.resolveCalendarMatchResult = () => null;
global.isTransferWindowOpen = () => true;
global.getTransferWindowInfo = () => ({ open: true, text: 'Aberta até 31/Mar', nextOpenDate: '10/Jul/2026' });
global.curComp = () => ({ id: 'bra-d', name: 'Campeonato Brasileiro Série D', country: 'Brasil' });
global.compById = id => ({ id, name: 'Campeonato Candango', country: 'Brasil' });
global.getSavedSeasonMemberships = () => ({ stateId: 'bra-est-df-candango', nationalId: 'bra-d' });
global.getStateCompData = () => ({ fixtures: [] });
global.getCopaDoBrasilState = () => ({ phases: {} });
global.processCopaDoBrasilCalendar = () => {};
global.isClubRegisteredInCopaDoBrasil = () => false;
global.getContinentalTournament = () => null;
global.ensureMidweekDate = d => d;
global.getDateForRound = (r, s) => `2026-0${Math.min(9, Math.floor(r/4)+1)}-18`;
global.livePlayers = [];
global.clubs = [];
global.save = () => true;
global.render = () => {};
global.toast = () => {};

// Carregar código do js/game.js
const gameCode = fs.readFileSync('js/game.js', 'utf8');

// Teste 1: Element.prototype.forEach fallback
console.log('1. Testando Element.prototype.forEach fallback...');
// Avalia trecho de inicialização dos fallbacks
const fallbackSnippet = gameCode.slice(
  gameCode.indexOf('// Fallback seguro caso algum script chame $(...).forEach(...)'),
  gameCode.indexOf('let calendarFilter=\'ALL\';')
);
eval(fallbackSnippet);

assert(typeof Element.prototype.forEach === 'function', 'Element.prototype.forEach deve existir');
assert(typeof NodeList.prototype.forEach === 'function', 'NodeList.prototype.forEach deve existir');

let elementCallbackExecuted = false;
const testElement = new Element();
testElement.name = 'TestNode';
testElement.forEach((el, idx, arr) => {
  elementCallbackExecuted = true;
  assert.strictEqual(el, testElement);
  assert.strictEqual(idx, 0);
  assert.strictEqual(arr[0], testElement);
});
assert.strictEqual(elementCallbackExecuted, true, 'Callback em Element.prototype.forEach deve executar com o elemento atual');
console.log('✅ Element.prototype.forEach fallback validado com sucesso.');

// Teste 2: Variáveis Globais de Filtro declaradas e inicializadas
console.log('2. Testando existência das variáveis globais de filtro...');
assert.strictEqual(typeof window.newsCategoryFilter, 'string', 'window.newsCategoryFilter deve ser string');
assert.strictEqual(typeof window.newsChannelFilter, 'string', 'window.newsChannelFilter deve ser string');
assert.strictEqual(typeof window.calendarFilter, 'string', 'window.calendarFilter deve ser string');
assert.strictEqual(typeof window.calendarCompFilter, 'string', 'window.calendarCompFilter deve ser string');
assert.strictEqual(typeof window.newsSearchQuery, 'string', 'window.newsSearchQuery deve ser string');
assert.strictEqual(typeof window.newsOnlyMyClub, 'boolean', 'window.newsOnlyMyClub deve ser boolean');
console.log('✅ Variáveis globais de filtro inicializadas corretamente.');

// Teste 3: Ausência total de chamadas single $(...).forEach em js/game.js
console.log('3. Testando ausência de $(...).forEach em js/game.js...');
const lines = gameCode.split('\n');
const offendingLines = [];
lines.forEach((line, idx) => {
  if (/(?<!\$)\$\([^)]+\)\.forEach/.test(line) && !line.includes('//')) {
    offendingLines.push({ line: idx + 1, text: line.trim() });
  }
});
assert.strictEqual(offendingLines.length, 0, `Encontradas chamadas ilegais a $(...).forEach: ${JSON.stringify(offendingLines)}`);
console.log('✅ 0 ocorrências de $(...).forEach encontradas no código.');

// Teste 4: formatSafeMatchDate
console.log('4. Testando formatSafeMatchDate...');
// Extrair funções necessárias
function extractSnippet(source, startMarker, endMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker start not found: ${startMarker}`);
  const endIdx = source.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error(`Marker end not found: ${endMarker}`);
  return source.slice(startIdx, endIdx + endMarker.length);
}

const utilsSnippet = extractSnippet(
  gameCode,
  'function normalizeClubLookupKey(str)',
  'window.ensureManagerNewsHydrated = ensureManagerNewsHydrated;'
);
eval(utilsSnippet);

const d1 = formatSafeMatchDate('2026-01-18');
assert(d1.includes('jan') || d1.includes('2026') || d1.includes('18'), 'Data ISO deve ser formatada');
const d2 = formatSafeMatchDate(null, 2);
assert(d2.includes('2026'), 'Fallback deve gerar data de 2026');
console.log('✅ formatSafeMatchDate validado com sucesso.');

// Teste 5: ensureManagerCalendarHydrated no Dia 1
console.log('5. Testando ensureManagerCalendarHydrated...');
const mockState = {
  gameMode: 'manager',
  club: 'Ceilândia',
  season: 2026,
  date: '2026-01-01',
  schedule: [],
  fixtures: []
};
global.state = mockState;

ensureManagerCalendarHydrated(mockState);
assert(Array.isArray(mockState.schedule) && mockState.schedule.length >= 14, 'schedule deve conter pelo menos 14 rodadas');
assert(Array.isArray(mockState.fixtures) && mockState.fixtures.length >= 14, 'fixtures deve conter pelo menos 14 jogos');
assert.strictEqual(domMocks.afmDayAdvanceNewsModal.removed, true, 'afmDayAdvanceNewsModal deve ser removido');
assert.strictEqual(domMocks.afmPostMatchHubModal.removed, true, 'afmPostMatchHubModal deve ser removido');

const firstFixture = mockState.fixtures[0];
assert.strictEqual(firstFixture.home, 'Ceilândia');
assert(firstFixture.away && firstFixture.away !== 'Ceilândia');
assert(firstFixture.date.startsWith('2026-'));
console.log('✅ ensureManagerCalendarHydrated validado com sucesso.');

// Teste 6: ensureManagerNewsHydrated no Dia 1 e isolamento de resíduos
console.log('6. Testando ensureManagerNewsHydrated...');
const newsState = {
  gameMode: 'manager',
  club: 'Ceilândia',
  manager: 'Professor Pardal',
  date: '2026-01-01',
  news: [
    'Carlos Henrique nos treinamentos do Brasília repercutiu entre torcedores',
    'treinamentos do atleta do usuário'
  ],
  playerCareer: { name: 'Carlos Henrique' }
};

ensureManagerNewsHydrated(newsState);
assert.strictEqual(newsState.news.length, 3, 'Deve conter 3 manchetes iniciais limpas de resíduos');
newsState.news.forEach(n => {
  assert(!n.title.includes('Carlos Henrique'), 'Não deve conter nome do atleta residual');
  assert(!n.text.includes('treinamentos do atleta'), 'Não deve conter texto de jogador residual');
});
assert(newsState.news[0].title.includes('Ceilândia'), 'Manchete deve citar o Ceilândia');
assert(newsState.news[0].title.includes('Professor Pardal'), 'Manchete deve citar o novo técnico');
console.log('✅ ensureManagerNewsHydrated validado com sucesso.');

// Teste 7: Executar newsMediaPage() sem ReferenceError
console.log('7. Testando execução de newsMediaPage()...');
global.resolveModeContext = () => ({ isManager: true, isPlayer: false, clubName: 'Ceilândia' });
global.newsCategoryFilter = 'ALL';
global.newsChannelFilter = 'ALL';

// Extrair e avaliar newsMediaPage
const newsMediaSnippet = extractSnippet(
  gameCode,
  'function newsMediaPage(){',
  '  `;\n}'
);
eval(newsMediaSnippet);

const newsHtml = newsMediaPage();
assert(typeof newsHtml === 'string' && newsHtml.length > 100, 'newsMediaPage() deve retornar HTML');
assert(newsHtml.includes('Notícias & Mídia do Futebol'), 'Deve conter título principal');
assert(newsHtml.includes('btn-news-cat'), 'Deve conter botões de categoria');
assert(newsHtml.includes('inputNewsSearch'), 'Deve conter input de busca rápida');
console.log('✅ newsMediaPage() executada sem qualquer erro.');

// Teste 8: Executar calendarPage()
console.log('8. Testando execução de calendarPage()...');
global.teamStrengthByName = () => 55;
global.calendarFilter = 'ALL';

const calendarSnippet = extractSnippet(
  gameCode,
  'function calendarPage(){',
  '  `;\n}'
);
eval(calendarSnippet);

const calHtml = calendarPage();
assert(typeof calHtml === 'string' && calHtml.length > 100, 'calendarPage() deve retornar HTML');
assert(calHtml.includes('Calendário Oficial de Jogos & Janelas de Transferência'), 'Deve conter título');
assert(calHtml.includes('afm-calendar-windows'), 'Deve conter cards de janelas');
assert(calHtml.includes('btnCalPreviewNow'), 'Deve conter botões de prévia');
console.log('✅ calendarPage() executada sem qualquer erro.');

// Teste 9: Posicionamento do badge de clássico na coluna de confronto (sem colisão com mando de campo)
console.log('9. Testando posicionamento de badge de clássico na coluna do adversário...');
assert(gameCode.includes('<b>vs ${esc(opponent)}</b>\n                  ${derbyBadgeHtml}'), 'Badge de clássico deve estar agrupado junto ao nome do adversário');
assert(!gameCode.includes('<b>${dateFormatted}</b>\n                ${derbyBadgeHtml}'), 'Badge de clássico não deve estar na coluna de data para evitar colisão visual');
const cssCode = fs.readFileSync('css/app.css', 'utf8');
assert(cssCode.includes('minmax(125px, auto) minmax(95px, auto) 1fr 140px minmax(230px, auto)'), 'CSS da calendar-card deve usar colunas flexíveis');
console.log('✅ Posicionamento de clássico e layout de calendar-card validados com sucesso.');

console.log('🎉 TODOS OS TESTES DE CALENDÁRIO E NOTÍCIAS PASSARAM COM 100% DE SUCESSO!');
