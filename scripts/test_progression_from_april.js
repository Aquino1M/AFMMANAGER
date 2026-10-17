const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createMockElement(tag, id = '', className = '') {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    id: id || '',
    className: className || '',
    innerHTML: '',
    textContent: '',
    value: '',
    dataset: {},
    style: {},
    children: [],
    parentNode: null,
    querySelector: () => createMockElement('span'),
    querySelectorAll: () => [],
    appendChild: function(c) { this.children.push(c); return c; },
    remove: function() {},
    setAttribute: function() {},
    getAttribute: function() { return null; }
  };
}

const root = createMockElement('div', 'app');
const context = {
  console, Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
  setTimeout: (cb) => { if (typeof cb === 'function') cb(); return 1; },
  clearTimeout: () => {},
  requestAnimationFrame: cb => cb(),
  scrollTo: () => {},
  AFM_DB: { init: () => Promise.resolve() },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  openCustomModal: () => {}, closeCustomModal: () => {}, toast: (msg) => { console.log('TOAST:', msg); },
  document: {
    getElementById: id => (id === 'app' ? root : null),
    querySelector: sel => (sel === '#app' ? root : null),
    querySelectorAll: () => [],
    createElement: tag => createMockElement(tag),
    addEventListener: () => {},
    removeEventListener: () => {},
    body: createMockElement('body')
  }
};
context.window = context;
context.addEventListener = () => {};
context.removeEventListener = () => {};
vm.createContext(context);

[
  'js/competitions.js',
  'data/competition_teams.js',
  'data/international_teams_2026_27.js',
  'data/continental_2026.js',
  'js/core/tournament_engine.js',
  'js/core/real_football_engine.js',
  'js/game.js',
  'js/core/calendar_and_day_advance_fix.js'
].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), context);
});

context.newCareer({ clubName: 'Corinthians', compId: 'bra-a', manager: 'Teste' });
const st = context.state;

console.log('=== Simulating career from start up to April 4 ===');
// Simula que chegamos no dia 2026-04-04 e jogamos a rodada contra Internacional
// Primeiro vamos ver quais jogos foram disputados até 04 de abril
st.date = '2026-04-05';
st.round = 12; // Rodada 13 é Fluminense em 11 de abril

// O que getActualCurrentMatch retorna agora?
const act = context.getActualCurrentMatch(st);
console.log('getActualCurrentMatch on 2026-04-05:', act ? {
  type: act.type,
  comp: act.competitionName,
  opp: act.opponent,
  date: act.date
} : 'NULL');

const gate = context.canStartMatch(null, st);
console.log('canStartMatch on 2026-04-05:', {
  canStart: gate.canStart,
  status: gate.status,
  matchDate: gate.matchDate,
  nextDate: gate.nextDate,
  daysDiff: gate.daysDiff,
  reason: gate.reason
});

console.log('\n=== Now test advanceToNextMatchGuaranteed from 2026-04-05 ===');
const adv = context.AFM_CalendarFix.advanceToNextMatchGuaranteed(st);
console.log('After advanceToNextMatchGuaranteed, st.date is:', st.date, 'st.currentDateFormatted is:', st.currentDateFormatted);
