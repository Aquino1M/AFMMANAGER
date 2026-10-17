const fs = require('fs');
const path = require('path');
const vm = require('vm');

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

const context = {
  console,
  requestAnimationFrame: cb => cb(),
  setTimeout: () => 1,
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
  scrollTo: () => {},
  openCustomModal: () => {},
  closeCustomModal: () => {}
};
context.window = context;
context.document = {
  getElementById: id => createMockElement(id),
  querySelector: sel => createMockElement(sel),
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: tag => createMockElement(tag),
  body: createMockElement('body')
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
  'js/game.js'
];

for (const f of files) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), context);
}

const clubsToTest = [
  { name: 'Boca Juniors', comp: 'arg-1' },
  { name: 'Real Madrid', comp: 'esp-1' },
  { name: 'Arsenal', comp: 'eng-1' },
  { name: 'Al-Hilal', comp: 'ksa-1' }
];

clubsToTest.forEach(({ name, comp }) => {
  console.log(`\n================== CHECKING: ${name} (${comp}) ==================`);
  context.newCareer({ clubName: name, compId: comp, manager: 'Mister Aquino' });
  const st = context.state;
  console.log('League:', st.competition, 'Fixtures count:', st.fixtures ? st.fixtures.length : 0);
  console.log('clubStateCompId:', context.clubStateCompId(name));
  
  ['lib', 'sud', 'ucl', 'uel', 'cwc', 'afc-el'].forEach(tId => {
    const t = context.getContinentalTournament(tId);
    if (t) {
      const userTMatches = (t.matches || []).filter(m => m.home === name || m.away === name);
      if (userTMatches.length > 0) {
        console.log(`  -> Plays in ${tId}: ${userTMatches.length} matches`);
      }
    }
  });
});


