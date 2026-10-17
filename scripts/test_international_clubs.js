const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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
    appendChild: function(c) { this.children.push(c); return c; },
    removeChild: () => {},
    remove: () => {},
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
    getLastCustomModal: () => lastCustomModal
  };
  context.window = context;
  const root = createMockElement('body');
  context.document = {
    getElementById: id => createMockElement(id),
    querySelector: sel => createMockElement(sel),
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

const testCases = [
  { club: 'Boca Juniors', comp: 'arg-1', region: 'América do Sul' },
  { club: 'Real Madrid', comp: 'esp-1', region: 'Europa' },
  { club: 'Arsenal', comp: 'eng-1', region: 'Europa' },
  { club: 'Al-Hilal', comp: 'ksa-1', region: 'Ásia' }
];

testCases.forEach(({ club, comp, region }) => {
  console.log(`\n==================================================`);
  console.log(`Testing initialization for ${club} (${comp}) [${region}]`);
  console.log(`==================================================`);
  try {
    const env = initGameEnvironment();
    env.newCareer({ clubName: club, compId: comp, manager: 'Mister Aquino' });
    const s = env.state;
    console.log(`- State created: club=${s.club}, comp=${s.competition}`);
    console.log(`- Season: ${s.season}, Date: ${s.date}`);
    console.log(`- Fixtures count: ${s.fixtures ? s.fixtures.length : 0}`);
    console.log(`- Squad players count: ${s.players ? s.players.length : 0}`);
    console.log(`- Tournaments: ${s.tournaments ? Object.keys(s.tournaments) : 'none'}`);
    console.log(`- Copa data: ${s.copaData ? 'yes' : 'no'}`);
    console.log(`- Estadual data: ${s.estadualData ? 'yes' : 'no'}`);
    
    const nextMatch = env.getActualCurrentMatch(s);
    console.log(`- Next match:`, nextMatch ? `${nextMatch.home} vs ${nextMatch.away} (${nextMatch.competitionName} on ${nextMatch.date})` : 'none');
    
    const gate = env.canStartMatch(null, s);
    console.log(`- Gate status:`, gate.status, gate.daysDiff ? `(diff: ${gate.daysDiff})` : '', gate.nextFixture ? `(next: ${gate.nextFixture.competition})` : '');

    // Check calendar
    const calHtml = env.calendarPage();
    console.log(`- Calendar HTML length: ${calHtml.length}`);
    console.log(`- Calendar buttons: Play=${calHtml.includes('btnCalPlayNow') || calHtml.includes('btnCalTournamentPlay')}, Sim=${calHtml.includes('btnCalSimNow') || calHtml.includes('btnCalTournamentSim')}, Preview=${calHtml.includes('btnCalPreviewNow')}`);

    // Check preview
    env.openMatchPreviewModal();
    const modal = env.getLastCustomModal();
    console.log(`- Match Preview Modal: ${modal ? modal.title : 'FAILED'}`);
  } catch (err) {
    console.error(`Error testing ${club}:`, err);
  }
});
