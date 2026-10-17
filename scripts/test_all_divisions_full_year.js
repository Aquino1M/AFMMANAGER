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

function simulateFullYearForClub(clubName, compId, maxSteps = 600) {
  console.log(`\n======================================================`);
  console.log(`SIMULATING FULL YEAR FOR: ${clubName} (${compId})`);
  console.log(`======================================================`);
  const env = initGameEnvironment();
  env.newCareer({ clubName, compId, manager: 'TestManager' });
  const s = env.state;
  if (s.isPreSeason) {
    s.isPreSeason = false;
    s.preSeasonDays = 0;
  }

  let steps = 0;
  let matchesPlayed = 0;
  while (steps < maxSteps) {
    steps++;
    const gate = env.canStartMatch(null, s);

    if (gate.status === 'season_finished') {
      console.log(`>>> Season finished reached at step ${steps}, date: ${s.date}!`);
      break;
    }

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
      const beforeHist = s.history.length;
      env.simulateQuickRound();
      if (s.history.length === beforeHist) {
        console.error(`STUCK: simulateQuickRound did not advance at date ${s.date}!`);
        break;
      }
      matchesPlayed++;
      continue;
    }

    console.error(`Unexpected gate status: ${gate.status} at ${s.date} (${gate.reason})`);
    break;
  }

  const pending = env.getPendingClubCompetitions(s);
  console.log(`Results for ${clubName}:`);
  console.log(`- Final Date: ${s.date}`);
  console.log(`- Matches Played: ${matchesPlayed}`);
  console.log(`- History Length: ${s.history.length}`);
  console.log(`- Pending Competitions: ${pending.length}`);
  console.log(`- Final Balance: R$ ${s.balance.toLocaleString('pt-BR')}`);

  // Test Calendar Rendering
  const calHtml = env.calendarPage();
  const cardCount = (calHtml.match(/calendar-card/g) || []).length;
  const concludedCount = (calHtml.match(/Concluído/g) || []).length;
  const agendadoCount = (calHtml.match(/Agendado/g) || []).length;
  console.log(`- Calendar Cards: ${cardCount}`);
  console.log(`- Calendar Concluído: ${concludedCount}`);
  console.log(`- Calendar Agendado: ${agendadoCount}`);

  assert(matchesPlayed > 0, `Expected at least 1 match played for ${clubName}`);
  assert.equal(pending.length, 0, `Expected 0 pending competitions at season end for ${clubName}`);
  assert.equal(agendadoCount, 0, `Expected 0 unplayed/agendado fixtures for ${clubName}`);
  console.log(`[PASS] ${clubName} completed full year successfully!`);
}

// 1. Test Brasília (Candangão + Série D)
simulateFullYearForClub('Brasília', 'bra-d');

// 2. Test Santos (Paulista + Série A)
simulateFullYearForClub('Santos', 'bra-a');

console.log('\n>>> ALL MULTI-DIVISION FULL YEAR SIMULATIONS PASSED! <<<');
