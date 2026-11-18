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

// Configura o save no Modo Jogador com Brasília no Candangão após 2 rodadas jogadas
w.setState({
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
    seasonStats: { season: 2026, matches: 2, goals: 3, assists: 0, avgRating: 8.5, yellowCards: 0, redCards: 0, mvpCount: 1 },
    competitionStatsByComp: {
      'bra-est-df': { season: 2026, compId: 'bra-est-df', matches: 2, goals: 3, assists: 0, avgRating: 8.5, yellowCards: 0, redCards: 0, mvpCount: 1, compName: 'Campeonato Candango' }
    }
  },
  squad: [
    { id: 999, name: 'D.,Aquino', pos: 'ATA', age: 18, ovr: 65, isControlled: true },
    { id: 1, name: 'Marcos Monteiro', pos: 'ATA', age: 20, ovr: 62 },
    { id: 2, name: 'Goleiro Teste', pos: 'GOL', age: 25, ovr: 64 }
  ],
  controlledPlayerId: 999,
  teams: [
    { name: 'Brasília', p: 6, j: 2, v: 2, e: 0, d: 0, gp: 4, gc: 0, sg: 4, pct: 100, form: ['V', 'V'] },
    { name: 'Paranoá', p: 0, j: 2, v: 0, e: 0, d: 2, gp: 0, gc: 4, sg: -4, pct: 0, form: ['D', 'D'] },
    { name: 'ARUC', p: 4, j: 2, v: 1, e: 1, d: 0, gp: 3, gc: 2, sg: 1, pct: 67, form: ['V', 'E'] },
    { name: 'Gama', p: 3, j: 2, v: 1, e: 0, d: 1, gp: 2, gc: 2, sg: 0, pct: 50, form: ['V', 'D'] },
    { name: 'Brasiliense', p: 3, j: 2, v: 1, e: 0, d: 1, gp: 2, gc: 1, sg: 1, pct: 50, form: ['V', 'D'] },
    { name: 'Capital-DF', p: 2, j: 2, v: 0, e: 2, d: 0, gp: 2, gc: 2, sg: 0, pct: 33, form: ['E', 'E'] },
    { name: 'Ceilândia', p: 2, j: 2, v: 0, e: 2, d: 0, gp: 1, gc: 1, sg: 0, pct: 33, form: ['E', 'E'] },
    { name: 'Real Brasília', p: 1, j: 2, v: 0, e: 1, d: 1, gp: 1, gc: 2, sg: -1, pct: 17, form: ['E', 'D'] },
    { name: 'Samambaia', p: 1, j: 2, v: 0, e: 1, d: 1, gp: 0, gc: 1, sg: -1, pct: 17, form: ['E', 'D'] },
    { name: 'Sobradinho', p: 1, j: 2, v: 0, e: 1, d: 1, gp: 1, gc: 2, sg: -1, pct: 17, form: ['E', 'D'] }
  ],
  history: [
    { h: 'Brasília', a: 'Paranoá', hg: 3, ag: 0, round: 2, season: 2026, date: '2026-01-19', competitionId: 'bra-est-df', competitionName: 'Campeonato Candango', isHome: true, won: true, events: [{ type: 'gol', scorer: 'D.,Aquino', teamId: 'Brasília' }, { type: 'gol', scorer: 'D.,Aquino', teamId: 'Brasília' }, { type: 'gol', scorer: 'D.,Aquino', teamId: 'Brasília' }] },
    { h: 'Samambaia', a: 'Brasília', hg: 0, ag: 1, round: 1, season: 2026, date: '2026-01-12', competitionId: 'bra-est-df', competitionName: 'Campeonato Candango', isHome: false, won: true, events: [{ type: 'gol', scorer: 'Marcos Monteiro', teamId: 'Brasília' }] }
  ],
  competitionStats: {}
});

console.log('1. Testando getStateCompData:');
const estData = w.getStateCompData('bra-est-df');
const brasiliaTeam = estData.teams.find(t => t.name === 'Brasília');
assert.ok(brasiliaTeam, 'Brasília deve existir em estData.teams');
assert.strictEqual(brasiliaTeam.p, 6, 'Brasília deve ter 6 pontos em estData.teams');
assert.strictEqual(brasiliaTeam.j, 2, 'Brasília deve ter 2 jogos em estData.teams');
console.log('✅ getStateCompData sincronizou state.teams corretamente.');

console.log('2. Testando computeStandingsFromFixtures:');
const standings = w.computeStandingsFromFixtures(estData.teams, estData.fixtures);
assert.strictEqual(standings[0].name, 'Brasília', 'Brasília deve ser o líder da tabela');
assert.strictEqual(standings[0].p, 6, 'Líder deve ter 6 pontos');
assert.strictEqual(standings[0].j, 2, 'Líder deve ter 2 jogos');
const nonZeroCount = standings.filter(t => t.j > 0).length;
assert.strictEqual(nonZeroCount, 10, 'Todos os 10 clubes devem ter jogos disputados (não zeros)');
console.log('✅ computeStandingsFromFixtures preservou todos os 10 clubes com pontuação real.');

console.log('3. Testando seasonPage na aba estadual:');
w.configureSeasonView({ seasonTab: 'estadual', selectedEstadualId: 'bra-est-df' });
const html = w.seasonPage();
assert.ok(html.includes('Brasília'), 'HTML deve conter Brasília');
assert.ok(!html.includes('0º lugar'), 'Posição não pode ser 0º lugar');
console.log('✅ seasonPage() renderiza a tabela com classificação real.');

console.log('4. Testando syncCompetitionStatsComprehensive & Artilharia do Usuário:');
const stats = w.syncCompetitionStatsComprehensive('bra-est-df');
assert.ok(stats.scorers.length > 0, 'Deve conter artilheiros');
const topScorerInStats = stats.scorers[0];
assert.strictEqual(topScorerInStats.name, 'D.,Aquino', 'D.,Aquino deve ser o líder da artilharia com 3 gols');
assert.strictEqual(topScorerInStats.goals, 3, 'D.,Aquino deve ter 3 gols');
assert.strictEqual(topScorerInStats.isUser, true, 'isUser deve ser true');

const teammate = stats.scorers.find(s => s.name === 'Marcos Monteiro');
assert.ok(teammate, 'Marcos Monteiro deve existir');
assert.strictEqual(teammate.goals, 1, 'Marcos Monteiro deve ter 1 gol (saldo total de 4 gols - 3 do usuário = 1)');
console.log('✅ syncCompetitionStatsComprehensive registrou D.,Aquino como líder com 3 gols e Marcos Monteiro com 1 gol.');

console.log('5. Testando computeCompetitionAwards:');
const awards = w.computeCompetitionAwards('bra-est-df');
assert.strictEqual(awards.topScorer.hasWinner, true, 'Deve ter vencedor na artilharia');
assert.strictEqual(awards.topScorer.winnerName, 'D.,Aquino', 'Artilheiro oficial deve ser D.,Aquino');
assert.strictEqual(awards.topScorer.value, 3, 'Artilheiro oficial deve ter 3 gols');
assert.strictEqual(awards.topScorer.isUser, true, 'isUser do artilheiro oficial deve ser true');
console.log('✅ computeCompetitionAwards consagrou D.,Aquino como Artilheiro Oficial do Campeonato Candango!');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO ABSOLUTO!');
