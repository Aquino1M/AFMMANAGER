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

console.log('=== TEST 1: Check initial calendar rendering for 08 de abril ===');
let html = context.calendarPage();
function checkRow(name) {
  const cards = html.split('<div class="calendar-card');
  const card = cards.find(c => c.includes(name));
  if (!card) return 'NOT FOUND';
  if (card.includes('Concluído')) {
    const m = card.match(/(\d+)\s+x\s+(\d+)\s+·\s+Concluído/);
    return `CONCLUIDO: ${m ? m[0] : 'SIM'}`;
  }
  if (card.includes('▶ Jogar')) {
    return 'PENDENTE (tem botão Jogar)';
  }
  return 'OUTRO';
}

console.log('Initial Bragantino:', checkRow('Bragantino'));
console.log('Initial Peñarol:', checkRow('Peñarol'));

console.log('\n=== TEST 2: Simulate Bragantino via simulateQuickStateLeagueRound ===');
const estId = context.clubStateCompId('Corinthians');
const estData = context.getStateCompData(estId);
const bragFix = (estData.fixtures || []).find(f => (f.home === 'Bragantino' || f.away === 'Bragantino' || f.home === 'Red Bull Bragantino' || f.away === 'Red Bull Bragantino') && (f.home === 'Corinthians' || f.away === 'Corinthians'));
console.log('Bragantino fix:', { roundIndex: bragFix.roundIndex, isoDate: bragFix.isoDate });
context.simulateQuickStateLeagueRound(estId, bragFix.roundIndex);
html = context.calendarPage();
console.log('After simulate Bragantino:', checkRow('Bragantino'));
const cards = html.split('<div class="calendar-card');
const bragCards = cards.filter(c => c.includes('Bragantino'));
console.log('Found Bragantino cards count:', bragCards.length);
bragCards.forEach((c, idx) => {
  console.log(`Brag Card #${idx}:`, c.includes('Concluído') ? 'CONCLUÍDO' : 'PENDENTE', c.slice(0, 200).replace(/\n/g, ' '));
});

const savedEstData = context.getStateCompData(estId);
const savedFix = savedEstData.fixtures.find(f => f.roundIndex === bragFix.roundIndex && (f.home === 'Bragantino' || f.away === 'Bragantino'));
console.log('savedFix:', savedFix);
console.log('history for brag:', st.history.find(h => h.competitionId === estId && (h.h === 'Bragantino' || h.a === 'Bragantino')));


console.log('\n=== TEST 3: Simulate Peñarol via playContinentalFixture ===');
const libTourn = context.getContinentalTournament('lib');
const penarolMatch = (libTourn.matches || []).find(m => (m.home === 'Peñarol' || m.away === 'Peñarol') && (m.home === 'Corinthians' || m.away === 'Corinthians'));
console.log('Peñarol match:', { id: penarolMatch.id, date: penarolMatch.date, round: penarolMatch.round });
context.playContinentalFixture('lib', penarolMatch.id);
html = context.calendarPage();
console.log('After simulate Peñarol:', checkRow('Peñarol'));

console.log('\n=== TEST 4: What if match is recorded in state.history only? ===');
// Simula caso em que o jogo foi salvo no state.history
st.history = st.history || [];
st.history.unshift({
  h: 'Corinthians',
  a: 'Red Bull Bragantino',
  hg: 2,
  ag: 0,
  round: 12,
  season: 2026,
  date: '2026-04-08',
  competitionId: 'bra-est-sp',
  competitionName: 'Campeonato Paulista'
});
html = context.calendarPage();
console.log('With history (Red Bull Bragantino):', checkRow('Bragantino'));

console.log('\n=== TEST 5: What if tournament match played but calendarPage check fails? ===');
console.log('Peñarol status in tournament:', penarolMatch.status, 'result:', penarolMatch.result);
html = context.calendarPage();
console.log('Peñarol row in calendar:', checkRow('Peñarol'));
