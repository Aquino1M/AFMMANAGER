const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes das Abas Carreira, Temporada e Novidades (Modo Treinador)...');

// Mock browser environment
global.window = global;
global.Element = function() {};
global.NodeList = function() {};

// Mock document
const domMocks = {};
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    style: {},
    innerHTML: '',
    children: [],
    appendChild: function(c) { this.children.push(c); },
    insertBefore: function(c) { this.children.unshift(c); },
    classList: { contains: () => false }
  }),
  getElementById: (id) => domMocks[id] || null,
  querySelector: () => null,
  querySelectorAll: () => []
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

// 1. Carregar módulos
require('../js/competitions.js');
const gameCode = fs.readFileSync('js/game.js', 'utf8').replace(/\r\n/g, '\n');

// Extrair helpers
function extractSnippet(source, startMarker, endMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker start not found: ${startMarker}`);
  const endIdx = source.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error(`Marker end not found: ${endMarker}`);
  return source.slice(startIdx, endIdx + endMarker.length);
}

// Avaliar inicialização de fallbacks e variáveis globais
const globalsSnippet = extractSnippet(
  gameCode,
  '// Fallback seguro caso algum script chame $(...).forEach(...)',
  'window.__afmOfficeActionLock = false;\n}'
);
eval(globalsSnippet);

const helpersSnippet = extractSnippet(
  gameCode,
  'function parseSafeLocalDate(rawDate)',
  'window.ensureManagerEconomyHydrated = ensureManagerEconomyHydrated;'
);
eval(helpersSnippet);

// Teste 1: parseSafeLocalDate
console.log('1. Testando parseSafeLocalDate...');
const dUtc = parseSafeLocalDate('2026-01-21');
assert.strictEqual(dUtc.getFullYear(), 2026);
assert.strictEqual(dUtc.getMonth(), 0); // Janeiro
assert.strictEqual(dUtc.getDate(), 21); // Dia 21 exato (sem recuo para dia 20)
assert.strictEqual(dUtc.getHours(), 12);
const dNull = parseSafeLocalDate(null);
assert.strictEqual(dNull.getFullYear(), 2026);
console.log('✅ parseSafeLocalDate validado com sucesso (zero desvio de fuso).');

// Teste 2: getUnifiedManagerPrestige
console.log('2. Testando getUnifiedManagerPrestige...');
const testStateNew = {
  managerPrestige: 5,
  managerTitles: [],
  season: 2026
};
const pInfo1 = getUnifiedManagerPrestige(testStateNew);
assert.strictEqual(pInfo1.pts, 5);
assert.strictEqual(pInfo1.level, 1);
assert.strictEqual(pInfo1.titlesCount, 0);
assert.strictEqual(pInfo1.license, 'LICENÇA CBF D (INICIANTE)');

const testStateVeteran = {
  managerPrestige: 42,
  managerTitles: ['Campeonato Candango', 'Série D'],
  season: 2026
};
const pInfo2 = getUnifiedManagerPrestige(testStateVeteran);
assert.strictEqual(pInfo2.pts, 42);
assert.strictEqual(pInfo2.level, 3);
assert.strictEqual(pInfo2.titlesCount, 2);
console.log('✅ getUnifiedManagerPrestige validado com sucesso.');

// Teste 3: ensureManagerEconomyHydrated
console.log('3. Testando ensureManagerEconomyHydrated...');
const bareState = { gameMode: 'manager' };
ensureManagerEconomyHydrated(bareState);
assert.strictEqual(typeof bareState.personalCash, 'number');
assert.ok(Array.isArray(bareState.ownedProperties));
assert.ok(Array.isArray(bareState.ownedBusinesses));
assert.ok(Array.isArray(bareState.ownedVehicles));
assert.ok(Array.isArray(bareState.safShares));
assert.strictEqual(bareState.careerSubTab, 'trainer');
assert.strictEqual(bareState.managerPersonal.personalBalance, bareState.personalCash);
console.log('✅ ensureManagerEconomyHydrated validado com sucesso.');

// Teste 4: Carreira do Treinador - Unificação de Prestígio e Ano
console.log('4. Testando Carreira do Treinador & manager_life_and_shares_pro.js...');
require('../js/systems/manager_life_and_shares_pro.js');
const mLifeContainer = {
  id: 'afm-career-economy-container',
  innerHTML: '',
  querySelector: () => null,
  querySelectorAll: () => []
};
domMocks['afm-career-economy-container'] = mLifeContainer;

const testCoachState = {
  gameMode: 'manager',
  club: 'Ceilândia',
  season: 2026,
  year: 2026,
  managerPrestige: 5,
  managerMoney: 104250,
  managerPersonal: {
    name: 'Aquino',
    personalBalance: 104250,
    salary: 18000,
    prestigeScore: 5
  },
  titles: []
};
global.state = testCoachState;

window.AFM_LifeAndSharesPro.renderLifeAndSharesUI('afm-career-economy-container', testCoachState);
const markup = mLifeContainer.innerHTML;

assert.ok(markup.includes('★ 5 Pontos'), 'Banner de perfil deve exibir ★ 5 Pontos');
assert.ok(markup.includes('Nível 1/99 (5 pts · 0 Títulos)'), 'Slot central deve exibir Nível 1/99 (5 pts · 0 Títulos)');
assert.ok(markup.includes('Salário recebido na temporada 2026'), 'Ano no card de salário deve ser 2026');
assert.ok(markup.includes('★ 5 pontos'), 'Card de prestígio atual deve exibir ★ 5 pontos');
console.log('✅ Carreira do Treinador e Banner de Prestígio 100% sincronizados.');

// Teste 5: Temporada - Botão de Tática, Divisão Série D e Filtro de Estatísticas
console.log('5. Testando Temporada (seasonPage)...');
global.selectedEstadualId = null;
global.estadualPhase = 'primeira_fase';
global.estadualTableFilter = 'geral';
global.statsFilterTab = 'artilharia';
global.nationalDivision = 'bra-d';
global.resolveModeContext = () => ({ isManager: true, isPlayer: false, clubName: 'Ceilândia' });
global.curComp = () => ({ id: 'bra-d', name: 'Campeonato Brasileiro Série D', country: 'Brasil' });
global.compById = id => ({ id, name: id === 'bra-d' ? 'Campeonato Brasileiro Série D' : 'Campeonato Candango', country: 'Brasil' });
global.getSavedSeasonMemberships = () => ({ stateId: 'bra-est-df-candango', nationalId: 'bra-d' });
global.getStateCompData = () => ({
  name: 'Campeonato Candango',
  fixtures: [{ roundIndex: 0, isoDate: '2026-01-21', dateStr: '21/01/2026', home: 'Ceilândia', away: 'Gama' }],
  teams: [{ name: 'Ceilândia', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pct: 0 }]
});
global.getStateCompStats = () => ({
  scorers: [
    { name: 'Romário', club: 'Ceilândia', goals: 2, pos: 'ATA' },
    { name: 'Nunes', club: 'Gama', goals: 1, pos: 'ATA' }
  ],
  assists: []
});

const seasonSnippet = extractSnippet(
  gameCode,
  'function seasonPage(){',
  '    ${typeof renderOtherCompetitionPlayerLeaders === \'function\' ? renderOtherCompetitionPlayerLeaders(seasonTab === \'estadual\' ? memberships.stateId : seasonTab === \'nacional\' ? userNatDivId : seasonTab === \'copadobrasil\' ? \'bra-cup\' : null) : \'\'}\n  `;\n}'
);
eval(seasonSnippet);

// Renderiza temporada
window.statsOnlyMyClub = false;
let seasonHtml = seasonPage();

assert.ok(seasonHtml.includes('id="btnSeasonGoToTactics"'), 'Deve conter id="btnSeasonGoToTactics"');
assert.ok(seasonHtml.includes('data-view="meutime"'), 'Deve conter data-view="meutime" no botão de tática');
assert.ok(seasonHtml.includes('btnToggleStatsOnlyClub'), 'Deve conter botão de alternar filtro de clube nas estatísticas');
assert.ok(seasonHtml.includes('Romário') && seasonHtml.includes('Nunes'), 'Sem filtro de clube deve exibir todos os atletas');

// Ativa filtro "Apenas Meu Clube"
window.statsOnlyMyClub = true;
seasonHtml = seasonPage();
assert.ok(seasonHtml.includes('Romário'), 'Atleta do meu clube deve aparecer');
assert.ok(!seasonHtml.includes('Nunes'), 'Atleta de outro clube não deve aparecer com filtro ativado');
console.log('✅ Temporada, navegação para Meu Time e filtro de estatísticas validados com sucesso.');

// Teste 6: Novidades & Correções (changelog_14outubro.js)
console.log('6. Testando Novidades & Correções e formatChangelogText...');
require('../js/ui/changelog_14outubro.js');

// Testar formatChangelogText
const formatted1 = window.formatChangelogText('Bancos com o boneco `TÉC. AQUINO` na área técnica.', 'Prof. Pardal');
assert.ok(formatted1.includes('PROF. PARDAL'), 'Deve substituir TÉC. AQUINO pelo nome do treinador');
assert.ok(formatted1.includes('<code style="background:rgba(139,92,246,0.2)'), 'Deve converter crases em <code>');

const changelogHtml = window.AFM_Changelog14Out.renderChangelogMarkup();
assert.ok(changelogHtml.includes('v3.9.16'), 'Deve conter a versão v3.9.16 no topo');
assert.ok(changelogHtml.includes('ATUAL · BLINDAGEM GERAL'), 'Deve conter badge de versão ativa');
assert.ok(changelogHtml.includes('btn-changelog-cat'), 'Deve conter botões de filtro por categoria');
assert.ok(changelogHtml.includes('inputChangelogSearch'), 'Deve conter input de busca rápida');
console.log('✅ Novidades & Correções, formatação de código e filtros validados com sucesso.');

console.log('🎉 TODOS OS TESTES DE CARREIRA, TEMPORADA E NOVIDADES PASSARAM COM 100% DE SUCESSO!');
