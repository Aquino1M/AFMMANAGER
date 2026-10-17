const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

function createMockElement(tag) {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {}
    },
    children: [],
    appendChild: function(c) {
      if (c) c.parentNode = this;
      this.children.push(c);
      return c;
    },
    removeChild: function(c) {
      const idx = this.children.indexOf(c);
      if (idx >= 0) {
        this.children.splice(idx, 1);
        if (c) c.parentNode = null;
      }
    },
    remove: function() {
      if (this.parentNode && this.parentNode.removeChild) this.parentNode.removeChild(this);
    },
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => createMockElement('span'),
    querySelectorAll: () => [createMockElement('span')],
    closest: () => null
  };
}

function initGameEnvironment() {
  const storage = {};
  let lastCustomModal = null;
  const context = {
    console,
    requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
    scrollTo: () => {},
    setTimeout: (fn) => 1,
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    JSON,
    Set,
    Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    openCustomModal: (title, html) => {
      lastCustomModal = { title, html };
    },
    closeCustomModal: () => {
      lastCustomModal = null;
    },
    getLastCustomModal: () => lastCustomModal,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  context.window = context;
  const root = createMockElement('body');
  context.document = {
    getElementById: id => (id === 'app' ? root : root.children.find(c => c.id === id) || null),
    querySelector: sel => {
      if (sel === '#app') return root;
      if (sel.startsWith('#')) return root.children.find(c => c.id === sel.slice(1)) || null;
      return null;
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: tag => createMockElement(tag),
    body: root
  };
  context.window.document = context.document;
  context.window.AFM_DB = { init: () => Promise.resolve(null) };
  context.window.esc = s => String(s || '');

  vm.createContext(context);

  const files = [
    'js/competitions.js',
    'data/competition_teams.js',
    'data/international_teams_2026_27.js',
    'data/continental_2026.js',
    'js/core/tournament_engine.js',
    'js/core/competition_integrity.js',
    'js/game.js',
    'js/systems/match_preview_pro.js'
  ];

  for (const f of files) {
    const fullPath = path.join(__dirname, '..', f);
    vm.runInContext(fs.readFileSync(fullPath, 'utf8'), context);
  }

  return context;
}

const clubsToTest = [
  // América do Sul
  { name: 'Boca Juniors', comp: 'arg-1', region: 'América do Sul' },
  { name: 'Colo-Colo', comp: 'chi-1', region: 'América do Sul' },
  { name: 'Peñarol', comp: 'uru-1', region: 'América do Sul' },
  { name: 'Atlético Nacional', comp: 'col-1', region: 'América do Sul' },
  
  // Europa
  { name: 'Real Madrid', comp: 'esp-1', region: 'Europa' },
  { name: 'Arsenal', comp: 'eng-1', region: 'Europa' },
  { name: 'Inter', comp: 'ita-1', region: 'Europa' },
  { name: 'Bayern München', comp: 'ger-1', region: 'Europa' },
  
  // Ásia
  { name: 'Al-Hilal', comp: 'ksa-1', region: 'Ásia' },
  { name: 'Al-Nassr', comp: 'ksa-1', region: 'Ásia' },
  { name: 'Vissel Kobe', comp: 'jpn-1', region: 'Ásia' },
  { name: 'Ulsan HD', comp: 'kor-1', region: 'Ásia' }
];

console.log('========================================================================');
console.log(`TESTANDO ${clubsToTest.length} CLUBES DA AMÉRICA DO SUL, EUROPA E ÁSIA`);
console.log('========================================================================\n');

const summary = [];

clubsToTest.forEach(({ name, comp, region }) => {
  const env = initGameEnvironment();
  env.newCareer({ clubName: name, compId: comp, manager: 'Mister Aquino' });
  const s = env.state;
  if (s.isPreSeason) {
    s.isPreSeason = false;
    s.preSeasonDays = 0;
  }

  // Check state league leakage
  const stateComp = env.clubStateCompId ? env.clubStateCompId(name) : null;
  const calHtml = env.calendarPage();
  const hasPaulista = calHtml.includes('Paulista');

  // Count scheduled matches for user club in primary league
  const leagueMatches = (s.calendar || []).filter(c => c.home === name || c.away === name);
  const byes = leagueMatches.filter(c => !c.home || !c.away || c.home.toLowerCase().includes('folga') || c.away.toLowerCase().includes('folga'));

  // Test preview
  env.openMatchPreviewModal();
  const modal = env.document.getElementById('appCustomModal') || env.getLastCustomModal();
  const modalHtml = modal?.innerHTML || modal?.html || '';
  const previewOk = Boolean(modal && (modalHtml.includes('Raio-X Setorial') || modalHtml.includes('Provável 11 Inicial')));
  if (typeof env.closeCustomModal === 'function') env.closeCustomModal();

  // Test match simulation
  let matchesPlayed = 0;
  let steps = 0;
  const compsFound = new Set();

  while (steps < 400) {
    steps++;
    const gate = env.canStartMatch(null, s);
    if (gate.status === 'season_finished') break;
    if (gate.status === 'future') {
      env.advanceCalendarDays(gate.daysDiff || 1, true);
      continue;
    }
    if (gate.status === 'other_competitions_pending') {
      const nextFixture = gate.nextFixture || env.getNextPendingClubFixture(s);
      if (nextFixture) {
        env.openNextPendingCompetitionFixture(nextFixture);
        continue;
      }
      break;
    }
    if (gate.status === 'playable') {
      const active = env.getActualCurrentMatch(s);
      if (active?.competitionName) compsFound.add(active.competitionName);

      if (active && active.isTournament) {
        env.playContinentalFixture(active);
      } else {
        env.simulateQuickRound();
      }
      matchesPlayed++;
    }
  }

  const success = !hasPaulista && byes.length === 0 && previewOk && matchesPlayed >= 20;

  summary.push({
    name,
    comp,
    region,
    hasPaulista,
    leagueMatchCount: leagueMatches.length,
    byes: byes.length,
    previewOk,
    matchesPlayed,
    competitions: Array.from(compsFound).join(', '),
    success
  });

  console.log(`[${region}] ${name} (${comp}):`);
  console.log(`  - Partidas jogadas na temporada: ${matchesPlayed}`);
  console.log(`  - Competições disputadas: ${Array.from(compsFound).join(' | ')}`);
  console.log(`  - Folgas (BYE): ${byes.length}`);
  console.log(`  - Vazamento de estadual (Paulista): ${hasPaulista ? 'SIM (ERRO)' : 'NÃO (OK)'}`);
  console.log(`  - Match Preview Pro: ${previewOk ? 'OK' : 'FALHA'}`);
  console.log(`  - Status: ${success ? '✅ 100% FUNCIONANDO' : '❌ ERRO'}\n`);
});

console.log('========================================================================');
console.log('TABELA RESUMO DE TODOS OS CLUBES INTERNACIONAIS TESTADOS:');
console.log('========================================================================');
console.table(summary);
