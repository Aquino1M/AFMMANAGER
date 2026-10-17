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

const env = initGameEnvironment();

const clubsToCheck = [
  { name: 'Boca Juniors', comp: 'arg-1' },
  { name: 'Real Madrid', comp: 'esp-1' },
  { name: 'Arsenal', comp: 'eng-1' },
  { name: 'Al-Hilal', comp: 'ksa-1' },
  { name: 'Kashima Antlers', comp: 'jpn-1' }
];

clubsToCheck.forEach(({ name, comp }) => {
  env.newCareer({ clubName: name, compId: comp, manager: 'Mister Aquino' });
  const s = env.state;
  console.log(`\n=== ${name} (${comp}) ===`);
  console.log(`League: ${s.competition} (ID: ${s.compId})`);
  console.log(`Teams in league: ${s.teams.length}`);
  console.log(`Schedule rounds: ${s.schedule ? s.schedule.length : 0}`);
  
  // Inspect calendar competitions
  const cal = env.calendarPage();
  const compsInCal = new Set();
  const m = cal.match(/data-comp-id="([^"]+)"/g) || cal.match(/class="tag comp [^"]*">([^<]+)<\/span>/g);
  console.log(`Calendar matches found:`, m ? m.length : 0);
  console.log(`Has Paulista in Cal?`, cal.includes('Paulista'));
  console.log(`Has Copa do Brasil in Cal?`, cal.includes('Copa do Brasil'));
  console.log(`Has Continental in Cal?`, cal.includes('Libertadores') || cal.includes('Champions') || cal.includes('AFC') || cal.includes('Sul-Americana') || cal.includes('Mundial'));
});

