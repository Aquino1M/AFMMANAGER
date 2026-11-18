const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function createHarness() {
  const storage = new Map();
  const noop = () => {};
  const makeEl = () => ({
    style: {},
    dataset: {},
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    appendChild: noop, removeChild: noop, remove: noop, setAttribute: noop, getAttribute: () => null,
    addEventListener: noop, querySelector: () => makeEl(), querySelectorAll: () => [],
    innerHTML: '', textContent: '',
  });

  const document = {
    body: makeEl(), head: makeEl(), documentElement: makeEl(), readyState: 'complete',
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: () => makeEl(), addEventListener: noop,
  };

  const localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k), clear: () => storage.clear(),
  };

  const ctx = {
    console, Math, Date, JSON, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, TypeError,
    parseInt, parseFloat, isNaN, isFinite, Uint8Array, Promise,
    setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
    requestAnimationFrame: noop, cancelAnimationFrame: noop, addEventListener: noop, removeEventListener: noop,
    dispatchEvent: noop, alert: noop, confirm: () => true, scrollTo: noop,
    btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
    atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
    localStorage, sessionStorage: localStorage, document,
    location: { href: 'http://localhost/', reload: noop, search: '', hash: '' },
    navigator: { userAgent: 'node-test', onLine: true },
    performance: { now: () => Date.now() },
    esc: (s) => String(s ?? ''),
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);

  const scripts = [
    'js/competitions.js', 'data/competition_teams.js', 'data/international_teams_2026_27.js', 'data/continental_2026.js',
    'js/core/tournament_engine.js', 'js/core/competition_integrity.js', 'data/players_live.js', 'data/club_badges.js',
    'js/core/club_badges_core.js', 'js/features30.js', 'js/player/lifestyleData.js', 'js/player/player_career_engine.js',
    'js/ui/create_player_ui.js', 'js/player/player_mode_ui.js', 'js/season_view_fix.js', 'js/game.js',
  ];
  for (const rel of scripts) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) {
      vm.runInContext(fs.readFileSync(full, 'utf8'), ctx, { filename: rel });
    }
  }
  return ctx;
}

const h = createHarness();
const w = h.window;

console.log('=== TESTE: ALTERNADOR NOTÍCIAS vs CLASSIFICAÇÃO NO HUB DO JOGADOR ===\n');

// 1. TESTE ESTADUAL (Candangão DF)
console.log('1. Testando Hub com Estadual (Candangão DF):');
const stateCandango = {
  gameMode: 'player',
  club: 'Brasília',
  compId: 'bra-est-df',
  competition: 'Campeonato Candango',
  season: 2026,
  round: 2,
  date: '2026-01-26',
  currentDate: '2026-01-26',
  playerCareerState: {
    athleteName: 'D.,Aquino',
    position: 'ATA',
    age: 18,
    seasonStats: { season: 2026, matches: 2, goals: 3, assists: 0, avgRating: 8.5 },
  },
  squad: [
    { id: 999, name: 'D.,Aquino', pos: 'ATA', age: 18, ovr: 65, isControlled: true },
    { id: 1, name: 'Marcos Monteiro', pos: 'ATA', age: 20, ovr: 62 },
  ],
  controlledPlayerId: 999,
  teams: [
    { name: 'Brasília', p: 6, j: 2, v: 2, e: 0, d: 0, gp: 4, gc: 0, sg: 4, pct: 100, form: ['V', 'V'] },
    { name: 'ARUC', p: 4, j: 2, v: 1, e: 1, d: 0, gp: 3, gc: 2, sg: 1, pct: 67, form: ['V', 'E'] },
    { name: 'Gama', p: 3, j: 2, v: 1, e: 0, d: 1, gp: 2, gc: 2, sg: 0, pct: 50, form: ['V', 'D'] },
    { name: 'Brasiliense', p: 3, j: 2, v: 1, e: 0, d: 1, gp: 2, gc: 1, sg: 1, pct: 50, form: ['V', 'D'] },
    { name: 'Capital-DF', p: 2, j: 2, v: 0, e: 2, d: 0, gp: 2, gc: 2, sg: 0, pct: 33, form: ['E', 'E'] },
    { name: 'Ceilândia', p: 2, j: 2, v: 0, e: 2, d: 0, gp: 1, gc: 1, sg: 0, pct: 33, form: ['E', 'E'] },
    { name: 'Real Brasília', p: 1, j: 2, v: 0, e: 1, d: 1, gp: 1, gc: 2, sg: -1, pct: 17, form: ['E', 'D'] },
    { name: 'Samambaia', p: 1, j: 2, v: 0, e: 1, d: 1, gp: 0, gc: 1, sg: -1, pct: 17, form: ['E', 'D'] },
    { name: 'Sobradinho', p: 1, j: 2, v: 0, e: 1, d: 1, gp: 1, gc: 2, sg: -1, pct: 17, form: ['E', 'D'] },
    { name: 'Paranoá', p: 0, j: 2, v: 0, e: 0, d: 2, gp: 0, gc: 4, sg: -4, pct: 0, form: ['D', 'D'] },
  ],
  history: [
    { h: 'Brasília', a: 'Paranoá', hg: 3, ag: 0, round: 2, season: 2026, date: '2026-01-19', competitionId: 'bra-est-df', competitionName: 'Campeonato Candango', isHome: true, won: true }
  ],
};

w.setState(stateCandango);
const standingsCandango = w.AFM_PlayerMode.getHubMatchCompetitionStandings(stateCandango);
assert.ok(standingsCandango, 'Deve retornar standings para Estadual');
assert.strictEqual(standingsCandango.kind, 'table');
assert.strictEqual(standingsCandango.type, 'estadual');
assert.strictEqual(standingsCandango.shortLabel, 'Candangão');
assert.strictEqual(standingsCandango.standings.length, 10, 'Deve conter 10 clubes');
assert.strictEqual(standingsCandango.standings[0].name, 'Brasília', 'Brasília deve ser o 1º colocado');
assert.strictEqual(standingsCandango.standings[0].p, 6, 'Brasília deve ter 6 pontos');
console.log('✅ Estadual (Candangão) gerou tabela correta com 10 times e Brasília na liderança com 6 pontos.');

// Render HTML da tabela
const htmlCandango = w.AFM_PlayerMode.renderHubCompetitionStandingsHtml(standingsCandango, stateCandango);
assert.ok(htmlCandango.includes('Brasília'), 'HTML deve conter o clube Brasília');
assert.ok(htmlCandango.includes('VOCÊ'), 'HTML deve marcar Brasília com a badge VOCÊ');
assert.ok(htmlCandango.includes('#1'), 'HTML deve mostrar que o clube é #1');
assert.ok(htmlCandango.includes('data-hub-goto-season="bra-est-df"'), 'HTML deve conter botão de atalho para season view');
console.log('✅ renderHubCompetitionStandingsHtml renderizou card com VOCÊ, #1 e atalho funcional.');

// 2. TESTE LIGA NACIONAL (Série A)
console.log('\n2. Testando Hub com Série A:');
const stateSerieA = {
  gameMode: 'player',
  club: 'Flamengo',
  compId: 'bra-a',
  competition: 'Brasileirão Betano Série A',
  season: 2026,
  round: 5,
  date: '2026-05-10',
  currentDate: '2026-05-10',
  playerCareerState: {
    athleteName: 'D.,Aquino',
    position: 'ATA',
    age: 18,
    seasonStats: { season: 2026, matches: 5, goals: 4, assists: 1, avgRating: 7.9 },
  },
  squad: [
    { id: 999, name: 'D.,Aquino', pos: 'ATA', age: 18, ovr: 75, isControlled: true },
  ],
  controlledPlayerId: 999,
  teams: [
    { name: 'Flamengo', p: 13, j: 5, v: 4, e: 1, d: 0, gp: 10, gc: 2, sg: 8, form: ['V', 'V', 'V', 'E', 'V'] },
    { name: 'Palmeiras', p: 12, j: 5, v: 4, e: 0, d: 1, gp: 9, gc: 4, sg: 5, form: ['V', 'V', 'D', 'V', 'V'] },
  ],
  schedule: [
    [['Flamengo', 'Palmeiras']],
    [['Flamengo', 'São Paulo']],
    [['Flamengo', 'Santos']],
    [['Flamengo', 'Corinthians']],
    [['Flamengo', 'Grêmio']],
    [['Flamengo', 'Internacional']],
  ],
  history: [],
};

w.setState(stateSerieA);
const vmSerieA = { activeMatch: { type: 'league', competitionId: 'bra-a', competitionName: 'Brasileirão Betano Série A' } };
const standingsSerieA = w.AFM_PlayerMode.getHubMatchCompetitionStandings(stateSerieA, vmSerieA);
assert.ok(standingsSerieA, 'Deve retornar standings para Série A');
assert.strictEqual(standingsSerieA.kind, 'table');
assert.strictEqual(standingsSerieA.type, 'league');
assert.strictEqual(standingsSerieA.shortLabel, 'Série A');
assert.ok(standingsSerieA.standings.length >= 20, 'Deve ter 20 equipes na Série A');
assert.ok(standingsSerieA.standings.some(t => t.name === 'Flamengo'), 'Flamengo deve estar presente na Série A');
console.log('✅ Série A gerou tabela correta com 20 clubes e Flamengo presente.');

// 3. TESTE COPA DO BRASIL
console.log('\n3. Testando Hub com Copa do Brasil:');
const stateCopa = {
  gameMode: 'player',
  club: 'Brasília',
  compId: 'bra-cup',
  competition: 'Copa Betano do Brasil',
  season: 2026,
  round: 1,
  date: '2026-02-18',
  currentDate: '2026-02-18',
  playerCareerState: {
    athleteName: 'D.,Aquino',
    position: 'ATA',
    age: 18,
    seasonStats: { season: 2026, matches: 2, goals: 3, assists: 0, avgRating: 8.5 },
  },
  squad: [
    { id: 999, name: 'D.,Aquino', pos: 'ATA', age: 18, ovr: 65, isControlled: true },
  ],
  controlledPlayerId: 999,
  history: [],
};

w.setState(stateCopa);
const vmCopa = { activeMatch: { type: 'copa', competitionId: 'bra-cup', competitionName: 'Copa Betano do Brasil' } };
const standingsCopa = w.AFM_PlayerMode.getHubMatchCompetitionStandings(stateCopa, vmCopa);
assert.ok(standingsCopa, 'Deve retornar dados para Copa do Brasil');
assert.strictEqual(standingsCopa.kind, 'cup');
assert.strictEqual(standingsCopa.type, 'copa');
assert.strictEqual(standingsCopa.shortLabel, 'Copa');
assert.ok(standingsCopa.phaseName, 'Deve ter nome de fase');
console.log('✅ Copa do Brasil retornou mata-mata (' + standingsCopa.phaseName + ') com sucesso.');

const htmlCopa = w.AFM_PlayerMode.renderHubCompetitionStandingsHtml(standingsCopa, stateCopa);
assert.ok(htmlCopa.includes('Mata-Mata'), 'HTML deve indicar formato mata-mata');
assert.ok(htmlCopa.includes('data-comp-type="copa"'), 'HTML deve apontar tipo copa no atalho');
console.log('✅ renderHubCompetitionStandingsHtml renderizou card mata-mata da Copa do Brasil.');

// 4. TESTE CONTINENTAL (Libertadores)
console.log('\n4. Testando Hub com Continental (Libertadores):');
const stateLib = {
  gameMode: 'player',
  club: 'Flamengo',
  compId: 'libertadores',
  competition: 'CONMEBOL Libertadores',
  season: 2026,
  round: 1,
  date: '2026-04-08',
  currentDate: '2026-04-08',
  playerCareerState: {
    athleteName: 'D.,Aquino',
    position: 'ATA',
    age: 18,
    seasonStats: { season: 2026, matches: 5, goals: 4, assists: 1, avgRating: 7.9 },
  },
  squad: [
    { id: 999, name: 'D.,Aquino', pos: 'ATA', age: 18, ovr: 75, isControlled: true },
  ],
  controlledPlayerId: 999,
  history: [],
};

w.setState(stateLib);
const vmLib = { activeMatch: { type: 'continental', competitionId: 'libertadores', competitionName: 'CONMEBOL Libertadores' } };
const standingsLib = w.AFM_PlayerMode.getHubMatchCompetitionStandings(stateLib, vmLib);
assert.ok(standingsLib, 'Deve retornar dados para Libertadores');
assert.strictEqual(standingsLib.type, 'continental');
assert.strictEqual(standingsLib.shortLabel, 'Libertadores');
console.log('✅ Libertadores retornou estrutura da competição (' + standingsLib.kind + ').');

// 5. TESTE RENDERIZAÇÃO COMPLETA DO HUB E ALTERNÂNCIA DE ABAS
console.log('\n5. Testando renderPlayerHub com toggle __afmHubRightTab:');
w.setState(stateCandango);

// Aba padrão (notícias)
w.__afmHubRightTab = 'news';
const htmlHubNews = w.AFM_PlayerMode.renderPlayerHub(stateCandango);
assert.ok(htmlHubNews.includes('id="afmHubNewsContainer"'), 'Deve conter o container de notícias');
assert.ok(htmlHubNews.includes('data-hub-right-tab="news"'), 'Deve conter botão de toggle notícias');
assert.ok(htmlHubNews.includes('data-hub-right-tab="standings"'), 'Deve conter botão de toggle classificação');
assert.ok(!htmlHubNews.includes('id="afmHubStandingsContainer"'), 'Não deve conter container de classificação quando tab for news');
console.log('✅ renderPlayerHub com tab "news" renderiza notícias e botões de toggle.');

// Alternar para classificação
w.__afmHubRightTab = 'standings';
const htmlHubStandings = w.AFM_PlayerMode.renderPlayerHub(stateCandango);
assert.ok(!htmlHubStandings.includes('id="afmHubNewsContainer"'), 'Não deve conter container de notícias quando tab for standings');
assert.ok(htmlHubStandings.includes('id="afmHubStandingsContainer"'), 'Deve conter container de classificação');
assert.ok(htmlHubStandings.includes('Candangão'), 'Deve exibir Candangão no botão');
assert.ok(htmlHubStandings.includes('Brasília'), 'Deve exibir Brasília na tabela');
console.log('✅ renderPlayerHub com tab "standings" renderiza tabela de classificação no lugar das notícias.');

console.log('\n🎉 TODOS OS 5 TESTES DE INTEGRAÇÃO PASSARAM COM SUCESSO ABSOLUTO!');
