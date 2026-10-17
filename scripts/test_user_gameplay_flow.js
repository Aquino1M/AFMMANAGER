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
    }
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
    'js/game.js'
  ];

  for (const f of files) {
    const fullPath = path.join(__dirname, '..', f);
    vm.runInContext(fs.readFileSync(fullPath, 'utf8'), context);
  }

  return context;
}

const context = initGameEnvironment();
console.log('Testing User Flow: Clicking "⚡ SIMULAR" / "▶ JOGAR" like a real user in the game UI');

// Test with Flamengo
context.newCareer({ clubName: 'Flamengo', compId: 'bra-a', manager: 'Aquino' });
const s = context.state;
if (s.isPreSeason) {
  s.isPreSeason = false;
  s.preSeasonDays = 0;
}

let steps = 0;
while (steps < 600) {
  steps++;
  const gate = context.canStartMatch(null, s);
  
  if (gate.status === 'season_finished') {
    console.log('\n>>> Season finished gate reached successfully! <<<');
    break;
  }
  
  if (gate.status === 'future') {
    // User clicks "⏩ ATÉ O JOGO"
    context.advanceCalendarDays(gate.daysDiff || 1, true);
    continue;
  }
  
  if (gate.status === 'playable') {
    // User clicks "⚡ SIMULAR" (simulateQuickRound)
    const active = context.getActualCurrentMatch(s);
    const beforeHist = s.history.length;
    context.simulateQuickRound();
    if (s.history.length === beforeHist) {
      console.log(`STUCK: simulateQuickRound did not add to history at date ${s.date}! Round: ${s.round}`);
      console.log('Gate inside simulateQuickRound:', context.canStartMatch(null, s));
      console.log('Active match was:', active);
      break;
    }
    const last = s.history[0];
    console.log(`Match ${s.history.length}: [${last.competitionName}] ${last.h} ${last.hg} x ${last.ag} ${last.a} (${last.date})`);
    continue;
  }

  if (gate.status === 'other_competitions_pending') {
    console.log('Gate: other_competitions_pending:', gate.reason);
    const nextFixture = gate.nextFixture || context.getNextPendingClubFixture(s);
    if (nextFixture) {
      context.openNextPendingCompetitionFixture(nextFixture);
      continue;
    }
    break;
  }

  console.log(`Unhandled gate status at ${s.date}:`, gate.status, gate.reason);
  break;
}

console.log(`\n================ SIMULATION RESULT ================`);
console.log(`Final date: ${s.date}`);
console.log(`Total history matches: ${s.history.length}`);
console.log(`National league round: ${s.round}`);
const pending = context.getPendingClubCompetitions(s);
console.log(`Remaining pending competitions: ${pending.length}`);
const byComp = {};
pending.forEach(p => { byComp[p.name] = (byComp[p.name] || 0) + 1; });
console.log('Pending breakdown:', byComp);

// Verify Calendar HTML rendering
console.log('\n--- Verifying Calendar Page Rendering ---');
context.state.date = s.date;
const calendarHtml = context.calendarPage();
const matchesFound = (calendarHtml.match(/calendar-card/g) || []).length;
const concludedCount = (calendarHtml.match(/Concluído/g) || []).length;
const scheduledCount = (calendarHtml.match(/Agendado/g) || []).length;
console.log(`Calendar HTML length: ${calendarHtml.length}`);
console.log(`Total matches rendered in calendar: ${matchesFound}`);
console.log(`Matches marked "Concluído": ${concludedCount}`);
console.log(`Matches marked "Agendado": ${scheduledCount}`);

if (pending.length === 0 && concludedCount >= s.history.length) {
  console.log('SUCCESS: Full year simulated, all calendar games played and displayed as Concluído!');
} else {
  console.log('NOTE: Check pending competitions or unconcluded matches.');
}
