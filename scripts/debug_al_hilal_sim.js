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
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
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
    Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    openCustomModal: (title, html) => { lastCustomModal = { title, html }; },
    closeCustomModal: () => { lastCustomModal = null; },
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

const env = initGameEnvironment();
env.newCareer({ clubName: 'Al-Hilal', compId: 'ksa-1', manager: 'Mister Aquino' });
const s = env.state;
s.isPreSeason = false;
s.preSeasonDays = 0;

console.log('Al-Hilal initial schedule rounds:', s.schedule ? s.schedule.length : 0);
console.log('Al-Hilal initial round:', s.round);
s.schedule.slice(0, 10).forEach((roundGames, rIdx) => {
  const match = roundGames.find(g => g[0] === 'Al-Hilal' || g[1] === 'Al-Hilal');
  console.log('Round ' + (rIdx + 1) + ' match for Al-Hilal:', match ? match.join(' vs ') : 'NONE (BYE)');
});

for (let step = 1; step <= 25; step++) {
  const gate = env.canStartMatch(null, s);
  console.log(`Step ${step}: date=${s.date}, gate=${gate.status}, reason=${gate.reason}`);
  if (gate.status === 'season_finished') {
    console.log('Season finished!');
    break;
  }

  if (gate.status === 'future') {
    env.advanceCalendarDays(gate.daysDiff || 1, true);
    continue;
  }
  if (gate.status === 'other_competitions_pending') {
    const nextFix = gate.nextFixture || env.getNextPendingClubFixture(s);
    console.log('Opening next pending:', nextFix);
    env.openNextPendingCompetitionFixture(nextFix);
    continue;
  }
  if (gate.status === 'playable') {
    const active = env.getActualCurrentMatch(s);
    console.log(`  -> Playing: ${active.home} vs ${active.away} [${active.competitionName}]`);
    env.simulateQuickRound();
    matchesPlayed++;
    console.log(`  -> Match played! Total now: ${matchesPlayed}`);
    continue;
  }
  console.log('Unexpected gate:', gate);
  break;
}
