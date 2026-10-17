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
  openCustomModal: () => {}, closeCustomModal: () => {}, toast: () => {},
  document: {
    getElementById: id => (id === 'app' ? root : null),
    querySelector: sel => (sel === '#app' ? root : null),
    querySelectorAll: () => [],
    createElement: tag => createMockElement(tag),
    addEventListener: () => {},
    body: createMockElement('body')
  }
};
context.window = context;
vm.createContext(context);

[
  'js/competitions.js',
  'data/competition_teams.js',
  'data/international_teams_2026_27.js',
  'data/continental_2026.js',
  'js/core/tournament_engine.js',
  'js/core/real_football_engine.js',
  'js/game.js'
].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), context);
});

context.newCareer({ clubName: 'Corinthians', compId: 'bra-a', manager: 'Teste' });
const st = context.state;

console.log('\n--- 1. Investigating State League (Paulista vs Bragantino) ---');
const estId = context.clubStateCompId('Corinthians');
const estData = context.getStateCompData(estId);
const bragFix = (estData.fixtures || []).find(f => (f.home === 'Bragantino' || f.away === 'Bragantino' || f.home === 'Red Bull Bragantino' || f.away === 'Red Bull Bragantino') && (f.home === 'Corinthians' || f.away === 'Corinthians'));
console.log('Bragantino fixture:', bragFix);

if (bragFix) {
  context.simulateQuickStateLeagueRound(estId, bragFix.roundIndex);
  const savedEstData = context.getStateCompData(estId);
  const savedFix = savedEstData.fixtures.find(f => Number(f.roundIndex) === Number(bragFix.roundIndex) && (f.home === 'Bragantino' || f.away === 'Bragantino'));
  console.log('Saved bragFix in estData:', savedFix ? { played: savedFix.played, result: savedFix.result, isoDate: savedFix.isoDate } : 'not found');
}

console.log('\n--- 2. Investigating Libertadores (vs Peñarol) ---');
const libTourn = context.getContinentalTournament('lib');
const penarolMatch = (libTourn.matches || []).find(m => (m.home === 'Peñarol' || m.away === 'Peñarol') && (m.home === 'Corinthians' || m.away === 'Corinthians'));
console.log('Peñarol match before:', penarolMatch);
if (penarolMatch) {
  context.playContinentalFixture('lib', penarolMatch.id);
  console.log('Peñarol match after playContinentalFixture:', penarolMatch);
}

const html = context.calendarPage();
console.log('\n--- 3. All Calendar Matches for 08 de abril ---');
const cards = html.split('<div class="calendar-card');
cards.forEach(card => {
  if (card.includes('08 de abril') || card.includes('Peñarol') || card.includes('Bragantino')) {
    // console.log('\nFULL CARD:\n' + ('<div class="calendar-card' + card).trim());
  }
});

console.log('\n======================================================');
console.log('CRUCIAL TEST: What happens on 2026-04-05 after Round 12?');
console.log('======================================================');
st.date = '2026-04-05';
st.round = 12; // round 13 in 1-based (Fluminense on 2026-04-11)
const act = context.getActualCurrentMatch(st);
console.log('getActualCurrentMatch:', act ? { type: act.type, comp: act.competitionName, opp: act.opponent, date: act.date } : null);
const gate = context.canStartMatch(null, st);
console.log('canStartMatch:', { canStart: gate.canStart, status: gate.status, matchDate: gate.matchDate, daysDiff: gate.daysDiff, reason: gate.reason });


