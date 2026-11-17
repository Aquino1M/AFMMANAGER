/**
 * Suite Completa de Regressão: Estatísticas Dark Neon & Títulos Individuais Oficiais
 * em TODAS as Ligas Nacionais, Internacionais, Estaduais, Copa do Brasil e Continentais/Mundial.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Iniciando Suite de Testes: Títulos Individuais & Estatísticas em Todas as Ligas e Copas...\n');

const ROOT = path.resolve(__dirname, '..');

function createHarness() {
  const storage = new Map();
  const noop = () => {};
  const makeEl = () => ({
    style: {},
    dataset: {},
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    appendChild: noop,
    removeChild: noop,
    remove: noop,
    setAttribute: noop,
    getAttribute: () => null,
    addEventListener: noop,
    querySelector: () => makeEl(),
    querySelectorAll: () => [],
    innerHTML: '',
    textContent: '',
  });

  const document = {
    body: makeEl(),
    head: makeEl(),
    documentElement: makeEl(),
    readyState: 'complete',
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => makeEl(),
    addEventListener: noop,
  };

  const localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
  };

  const ctx = {
    console,
    Math,
    Date,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Map,
    Set,
    RegExp,
    Error,
    TypeError,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    Uint8Array,
    Promise,
    setTimeout: noop,
    clearTimeout: noop,
    setInterval: () => 1,
    clearInterval: noop,
    requestAnimationFrame: noop,
    cancelAnimationFrame: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
    alert: noop,
    confirm: () => true,
    scrollTo: noop,
    btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
    atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
    localStorage,
    sessionStorage: localStorage,
    document,
    location: { href: 'http://localhost/', reload: noop, search: '', hash: '' },
    navigator: { userAgent: 'node-test', onLine: true },
    performance: { now: () => Date.now() },
    esc: (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])),
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.self = ctx;
  vm.createContext(ctx);

  const scripts = [
    'js/competitions.js',
    'data/competition_teams.js',
    'data/international_teams_2026_27.js',
    'data/continental_2026.js',
    'js/core/tournament_engine.js',
    'js/core/competition_integrity.js',
    'data/players_live.js',
    'data/club_badges.js',
    'js/core/club_badges_core.js',
    'js/features30.js',
    'js/player/lifestyleData.js',
    'js/player/player_career_engine.js',
    'js/ui/create_player_ui.js',
    'js/player/player_mode_ui.js',
    'js/season_view_fix.js',
    'js/game.js',
  ];

  for (const rel of scripts) {
    const full = path.join(ROOT, rel);
    const code = fs.readFileSync(full, 'utf8');
    vm.runInContext(code, ctx, { filename: rel });
  }

  return ctx;
}

const ctx = createHarness();
const w = ctx.window;

function squadOf(clubName) {
  return (w.livePlayers || [])
    .filter((p) => p.club === clubName)
    .map((p, i) => ({ ...p, id: p.id || `${clubName}_${i}`, ovr: p.ovr || p.fc || 70, overall: p.ovr || p.fc || 70 }));
}

// ============================================================================
// 1. TESTE DIA 1 (ZERO FABRICAÇÃO QUANDO 0 PARTIDAS FORAM DISPUTADAS)
// ============================================================================
console.log('1. Verificando Regra Zero-Fabricação com 0 partidas disputadas em todas as competições...');
w.setState({
  gameMode: 'manager',
  club: 'Flamengo',
  compId: 'bra-a',
  competition: 'Campeonato Brasileiro Série A',
  season: 2026,
  round: 0,
  date: '2026-01-01',
  competitionStats: {},
  estadualData: {},
  copaData: null,
  tournaments: {},
  teams: (w.COMPETITION_TEAMS['bra-a'] || []).map((name) => ({ name, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] })),
  squad: squadOf('Flamengo'),
  history: [],
  news: [],
});

const dayOneComps = ['bra-a', 'bra-b', 'bra-c', 'bra-d', 'bra-est-rj', 'bra-cup', 'lib', 'sud', 'ucl', 'cwc', 'esp-1', 'ger-1'];
for (const cid of dayOneComps) {
  const aw = w.computeCompetitionAwards(cid);
  assert.strictEqual(aw.hasPlayedMatches, false, `Competição ${cid} sem jogos deve marcar hasPlayedMatches=false`);
  assert.strictEqual(aw.mvp.winnerName, 'A definir', `MVP de ${cid} no Dia 1 deve ser 'A definir'`);
  assert.strictEqual(aw.topScorer.winnerName, 'A definir', `Artilheiro de ${cid} no Dia 1 deve ser 'A definir'`);
  assert.strictEqual(aw.assistLeader.winnerName, 'A definir', `Garçom de ${cid} no Dia 1 deve ser 'A definir'`);
  assert.strictEqual(aw.goldenGlove.winnerName, 'A definir', `Luva de Ouro de ${cid} no Dia 1 deve ser 'A definir'`);
  assert.strictEqual(aw.youngPlayer.winnerName, 'A definir', `Revelação de ${cid} no Dia 1 deve ser 'A definir'`);
}
console.log('✅ Dia 1 validado: 12 ligas/copas exibem estritamente "A definir" sem estatísticas fantasmas.');

// ============================================================================
// 2. TESTE DE RENDERIZAÇÃO UNIVERSAL EM TODAS AS ABAS DE TEMPORADA
// ============================================================================
console.log('2. Verificando presença do Bloco Dark Neon e Títulos Individuais em TODAS as abas da Temporada...');
const tabChecks = [
  { opts: { seasonTab: 'estadual', selectedEstadualId: 'bra-est-rj' }, expectedComp: 'bra-est-rj', label: 'Estadual (Carioca)' },
  { opts: { seasonTab: 'nacional', nationalDivision: 'bra-a' }, expectedComp: 'bra-a', label: 'Brasileirão Série A' },
  { opts: { seasonTab: 'nacional', nationalDivision: 'bra-b' }, expectedComp: 'bra-b', label: 'Brasileirão Série B' },
  { opts: { seasonTab: 'nacional', nationalDivision: 'bra-c' }, expectedComp: 'bra-c', label: 'Brasileirão Série C' },
  { opts: { seasonTab: 'nacional', nationalDivision: 'bra-d' }, expectedComp: 'bra-d', label: 'Brasileirão Série D' },
  { opts: { seasonTab: 'copadobrasil' }, expectedComp: 'bra-cup', label: 'Copa do Brasil' },
  { opts: { seasonTab: 'continental', continentalCategory: 'internacional', continentalTab: 'libertadores' }, expectedComp: 'lib', label: 'Copa Libertadores' },
  { opts: { seasonTab: 'continental', continentalCategory: 'internacional', continentalTab: 'sulamericana' }, expectedComp: 'sud', label: 'Copa Sul-Americana' },
  { opts: { seasonTab: 'continental', continentalCategory: 'internacional', continentalTab: 'mundial' }, expectedComp: 'cwc', label: 'Mundial FIFA' },
];

for (const check of tabChecks) {
  w.afmSeasonUIState = {
    activeMainTab: check.opts.seasonTab,
    selectedDivision: check.opts.nationalDivision || 'bra-a',
    continentalCategory: check.opts.continentalCategory || 'internacional',
    continentalTab: check.opts.continentalTab || 'libertadores',
  };
  w.configureSeasonView(check.opts);
  const html = w.seasonPage();
  assert.ok(html.includes('afm-comp-individual-awards-card'), `${check.label}: deve renderizar card de Títulos Individuais Oficiais`);
  assert.ok(html.includes('afm-comp-stats-neon-card'), `${check.label}: deve renderizar card Dark Neon de Estatísticas`);
  assert.ok(html.includes(`data-comp-id="${check.expectedComp}"`), `${check.label}: botão Top 30 deve apontar para ${check.expectedComp}`);
  assert.ok(html.includes('🧤 LUVA DE OURO'), `${check.label}: deve incluir aba Luva de Ouro`);
  assert.ok(html.includes('VER RANKING COMPLETO (TOP 30)'), `${check.label}: deve incluir botão Top 30`);
}
console.log('✅ Todas as 9 visões de Ligas e Copas exibem Títulos Individuais Oficiais + Ranking Dark Neon!');

// ============================================================================
// 3. TESTE DE LIGAS INTERNACIONAIS (18 E 20 CLUBES: BUNDESLIGA & LALIGA)
// ============================================================================
console.log('3. Verificando Ligas Internacionais (Bundesliga 18 clubes & LaLiga 20 clubes)...');
w.setState({
  gameMode: 'manager',
  club: 'Bayern München',
  compId: 'ger-1',
  competition: 'Bundesliga',
  season: 2026,
  date: '2026-09-20',
  competitionStats: {},
  teams: (w.COMPETITION_TEAMS['ger-1'] || []).map((name, idx) => ({
    name,
    j: 5,
    v: idx < 6 ? 4 : 1,
    e: 1,
    d: idx < 6 ? 0 : 3,
    p: idx < 6 ? 13 : 4,
    gp: idx === 0 ? 14 : (6 - Math.min(4, Math.floor(idx / 3))),
    gc: idx === 0 ? 2 : 7,
    sg: idx === 0 ? 12 : -1,
    form: ['V', 'V', 'E', 'V', 'V'],
  })),
  squad: squadOf('Bayern München'),
  history: [],
  news: [],
});
w.afmSeasonUIState = { activeMainTab: 'nacional', selectedDivision: 'ger-1' };
w.configureSeasonView({ seasonTab: 'nacional', nationalDivision: 'ger-1' });

const bundesligaStandings = w.getNationalCompetitionStandings('ger-1');
assert.strictEqual(bundesligaStandings.length, 18, 'Bundesliga deve retornar os 18 clubes reais');
assert.strictEqual(bundesligaStandings[0].p, 13, 'Líder da Bundesliga (18 clubes) deve refletir pontos reais da temporada ativa');

const gerHtml = w.seasonPage();
assert.ok(gerHtml.includes('Torjägerkanone'), 'Bundesliga deve exibir o título oficial Torjägerkanone');
assert.ok(gerHtml.includes('Spieler der Saison'), 'Bundesliga deve exibir o título oficial Spieler der Saison');
const gerAwards = w.computeCompetitionAwards('ger-1', 'Bundesliga');
assert.strictEqual(gerAwards.hasPlayedMatches, true, 'Bundesliga com 5 rodadas deve ter líderes reais');
assert.notStrictEqual(gerAwards.topScorer.winnerName, 'A definir', 'Artilheiro da Bundesliga deve ser atleta real');
console.log(`✅ Bundesliga (18 clubes) validada: Artilheiro parcial = ${gerAwards.topScorer.winnerName} (${gerAwards.topScorer.metricText}).`);

// ============================================================================
// 4. TESTE DE COPA DO BRASIL, LIBERTADORES & IDEMPOTÊNCIA ESTRITA
// ============================================================================
console.log('4. Verificando sincronização real e idempotência na Copa do Brasil e Libertadores...');
w.setState({
  gameMode: 'manager',
  club: 'Flamengo',
  compId: 'bra-a',
  competition: 'Campeonato Brasileiro Série A',
  season: 2026,
  date: '2026-04-15',
  squad: squadOf('Flamengo'),
  teams: (w.COMPETITION_TEAMS['bra-a'] || []).map((name) => ({ name, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] })),
  competitionStats: {},
  copaData: {
    season: 2026,
    phases: {
      '1ª Fase': {
        name: '1ª Fase',
        fixtures: [
          { home: 'Flamengo', away: 'Gama', score: [3, 0], played: true, winner: 'Flamengo' },
          { home: 'Palmeiras', away: 'Ceilândia', score: [2, 1], played: true, winner: 'Palmeiras' },
        ],
      },
    },
  },
  tournaments: {
    lib: {
      season: 2026,
      matches: [
        { id: 'm1', home: 'Flamengo', away: 'River Plate', result: [2, 0], status: 'played', round: 1 },
        { id: 'm2', home: 'Palmeiras', away: 'Boca Juniors', result: [3, 1], status: 'played', round: 1 },
      ],
    },
  },
  history: [],
  news: [],
});

const copaStats1 = w.syncCompetitionStatsComprehensive('bra-cup');
const copaGoals1 = copaStats1.scorers.reduce((s, r) => s + r.goals, 0);
assert.strictEqual(copaGoals1, 6, 'Total de gols na Copa do Brasil deve bater exatamente com os placares (3+0+2+1 = 6)');
assert.ok(copaStats1.cleanSheets.some((g) => g.club === 'Flamengo' && g.cleanSheets === 1), 'Goleiro do Flamengo deve ter 1 Clean Sheet na Copa do Brasil (3x0)');

// Re-sincroniza 5 vezes seguidas para provar idempotência absoluta
for (let i = 0; i < 5; i++) {
  w.syncCompetitionStatsComprehensive('bra-cup');
}
const copaGoalsAfter = w.getStateCompStats('bra-cup').scorers.reduce((s, r) => s + r.goals, 0);
assert.strictEqual(copaGoalsAfter, 6, 'Re-sincronizações da Copa do Brasil não podem inflar nem duplicar gols');

const libAwards = w.computeCompetitionAwards('lib', 'Copa Libertadores');
assert.ok(libAwards.mvp.title.includes('Rei da América'), 'Libertadores deve usar a honraria oficial Rei da América');
assert.strictEqual(libAwards.hasPlayedMatches, true, 'Libertadores com jogos disputados deve ter candidatos reais');

let lastModalTitle = '';
w.openCustomModal = (t) => { lastModalTitle = t; };
w.openFullStatsModal('luva', 'Copa do Brasil', 'bra-cup');
assert.ok(lastModalTitle.includes('Top 30 Luvas de Ouro — Copa do Brasil'), 'Modal Top 30 deve abrir Luva de Ouro da Copa do Brasil');
console.log('✅ Copa do Brasil e Libertadores sincronizadas com soma exata de gols, Clean Sheets e idempotência.');

// ============================================================================
// 5. TESTE MODO CARREIRA JOGADOR: TÍTULOS EM MÚLTIPLAS COMPETIÇÕES + BOLA DE OURO REALISTA
// ============================================================================
console.log('5. Verificando Modo Carreira Jogador: múltiplos títulos individuais no mesmo ano + realismo da Bola de Ouro...');
w.AFM_PlayerEngine.startPlayerCareer({
  name: 'Aquino Craque',
  age: 18,
  position: 'ATA',
  archetype: 'st_poacher',
  peneiraTier: 'tier_regional',
  clubName: 'Brasiliense',
  starterBoot: 'boot_crimson',
  shirtNumber: 9,
}, 2);
const pCareerState = w.getState();
pCareerState.compId = 'bra-d';
pCareerState.competition = 'Campeonato Brasileiro Série D';
pCareerState.playerCareerState.managerTrust = 85;

// 4 jogos no Campeonato Candango (8 gols)
for (let i = 0; i < 4; i++) {
  w.AFM_PlayerEngine.processMatchPerformance(pCareerState, {
    h: 'Brasiliense', a: 'Gama', hg: 2, ag: 0, goalsFor: 2, goalsAgainst: 0,
    goals: 2, assists: 1, playedMinutes: 90, started: true,
    competitionId: 'bra-est-df', competitionName: 'Campeonato Candango', date: '2026-02-1' + i,
  }, { showSummary: false });
}
// 3 jogos na Copa do Brasil (5 gols -> Artilheiro da Copa do Brasil)
for (let i = 0; i < 3; i++) {
  w.AFM_PlayerEngine.processMatchPerformance(pCareerState, {
    h: 'Brasiliense', a: 'Vila Nova', hg: 2, ag: 1, goalsFor: 2, goalsAgainst: 1,
    goals: i < 2 ? 2 : 1, assists: 0, playedMinutes: 90, started: true,
    competitionId: 'bra-cup', competitionName: 'Copa do Brasil', date: '2026-04-1' + i,
  }, { showSummary: false });
}
// 6 jogos na Série D (9 gols -> Artilheiro e Craque da Série D)
for (let i = 0; i < 6; i++) {
  w.AFM_PlayerEngine.processMatchPerformance(pCareerState, {
    h: 'Brasiliense', a: 'Anápolis', hg: 2, ag: 0, goalsFor: 2, goalsAgainst: 0,
    goals: i < 3 ? 2 : 1, assists: 1, playedMinutes: 90, started: true,
    competitionId: 'bra-d', competitionName: 'Campeonato Brasileiro Série D', date: '2026-07-1' + i,
  }, { showSummary: false });
}

const gala = w.AFM_PlayerEngine.processEndOfSeasonAwards(pCareerState, 2026);
const pAwards = pCareerState.playerCareerState.individualAwards;
const awardIds = pAwards.map((a) => a.id);

assert.ok(awardIds.includes('league_top_scorer_2026'), 'Deve ganhar Artilheiro da Série D (competição primária)');
assert.ok(awardIds.includes('comp_top_scorer_bra-cup_2026'), 'Deve ganhar Artilheiro da Copa do Brasil na mesma temporada');
assert.ok(awardIds.includes('comp_top_scorer_bra-est-df_2026'), 'Deve ganhar Artilheiro do Campeonato Candango na mesma temporada');
assert.ok(gala.allCompetitionAwards.length >= 3, 'Gala deve consolidar os prêmios das 3 competições disputadas');

// Realismo da Bola de Ouro: um jovem de ~40 OVR na Série D não pode ganhar Bola de Ouro Mundial acima de Mbappé/Yamal/Vini Jr
assert.strictEqual(gala.userWonBallonDor, false, 'Realismo: gols na Série D/Estadual com OVR ~40 não podem vencer a Bola de Ouro Mundial sobre astros 90+ da Champions/LaLiga');

// Verificação dos clubes atualizados de 17/11/2026 nos candidatos mundiais
const topNamesAndClubs = gala.ballonDorTop3.map((c) => `${c.name}:${c.club}`).join(' | ');
assert.ok(!topNamesAndClubs.includes('Bayer Leverkusen') && !topNamesAndClubs.includes('Rodri:Manchester City'), 'Candidatos da Bola de Ouro devem estar nos clubes reais de 17/11/2026');

console.log(`✅ Modo Carreira Jogador validado: ${pAwards.length} troféus individuais oficiais conquistados nas 3 competições + Bola de Ouro realista (${topNamesAndClubs}).`);

// ============================================================================
// 6. TESTE MODO TREINADOR: calculateSeasonAwards & applyScoringAwardUpgrades
// ============================================================================
console.log('6. Verificando calculateSeasonAwards e evolução +1 OVR no Modo Treinador...');
const managerAwardsState = {
  gameMode: 'manager',
  club: 'Flamengo',
  compId: 'bra-a',
  competition: 'Campeonato Brasileiro Série A',
  season: 2026,
  squad: squadOf('Flamengo'),
  teams: (w.COMPETITION_TEAMS['bra-a'] || []).map((name, i) => ({
    name, j: 10, v: i === 0 ? 8 : 4, e: 2, d: i === 0 ? 0 : 4, p: i === 0 ? 26 : 14, gp: i === 0 ? 22 : 10, gc: i === 0 ? 4 : 12, sg: i === 0 ? 18 : -2,
  })),
  competitionStats: {
    'bra-a': {
      season: 2026,
      scorers: [{ name: 'Pedro', club: 'Flamengo', pos: 'ST', age: 29, ovr: 83, goals: 14, matches: 10 }],
      assists: [{ name: 'Arrascaeta', club: 'Flamengo', pos: 'AM', age: 32, ovr: 84, assists: 9, matches: 10 }],
      mvp: [],
      cleanSheets: [],
      cards: [],
      _syncedTeamMatches: {},
      _syncedFixtureKeys: {},
    },
  },
  news: [],
};
w.setState(managerAwardsState);

const pedroObj = managerAwardsState.squad.find((p) => p.name === 'Pedro');
const pedroBefore = w.playerOverall(pedroObj);
const mAwards = w.calculateSeasonAwards('bra-a');
assert.strictEqual(mAwards.topScorer.name, 'Pedro', 'Pedro deve ser reconhecido como Troféu Roberto Dinamite');
assert.ok(mAwards.topScorer.title.includes('Roberto Dinamite'), 'Título oficial da Série A deve ser Troféu Roberto Dinamite');
w.applyScoringAwardUpgrades(mAwards);
const pedroAfter = w.playerOverall(pedroObj);
assert.strictEqual(pedroAfter, Math.min(99, pedroBefore + 1), 'Artilheiro do clube do treinador deve receber exatamente +1 OVR ao fim da temporada');
assert.strictEqual(pedroObj.ovr, pedroObj.overall, 'ovr e overall do atleta premiado devem permanecer 100% sincronizados');

// Segunda chamada idempotente não pode somar +1 de novo na mesma temporada
w.applyScoringAwardUpgrades(w.calculateSeasonAwards('bra-a'));
const pedroAfterSecond = w.playerOverall(pedroObj);
assert.strictEqual(pedroAfterSecond, pedroAfter, 'Upgrade de prêmio individual deve ser estritamente idempotente na temporada');

console.log('✅ Premiação e evolução +1 OVR do Modo Treinador 100% validadas!');
console.log('\n🎉 TODOS OS TESTES DE LIGAS, COPAS E TÍTULOS INDIVIDUAIS PASSARAM COM 100% DE SUCESSO! 🎉');
