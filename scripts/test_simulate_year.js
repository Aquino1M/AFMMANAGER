const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

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

  const projectRoot = __dirname.endsWith('scripts') ? path.resolve(__dirname, '..') : __dirname;
  for (const f of files) {
    const fullPath = path.join(projectRoot, f);
    vm.runInContext(fs.readFileSync(fullPath, 'utf8'), context);
  }

  return context;
}

if (typeof module !== 'undefined') {
  module.exports = { initGameEnvironment };
}

if (require.main === module) {
  const context = initGameEnvironment();
  console.log('Engine initialized.');

// Test with Flamengo
context.newCareer({ clubName: 'Flamengo', compId: 'bra-a', manager: 'Aquino' });
const s = context.state;

console.log('Testing full year simulation for:', s.club);
let daysSimulated = 0;
let matchesPlayed = 0;
const playedLog = [];

// Skip preseason
if (s.isPreSeason) {
  s.isPreSeason = false;
  s.preSeasonDays = 0;
}

while (daysSimulated < 400) {
  daysSimulated++;
  
  // Check if all competitions are complete
  if (context.seasonCompetitionsComplete(s)) {
    console.log(`\nAll competitions completed at date ${s.date}!`);
    break;
  }

  // What is the current active match?
  let activeMatch = context.getActualCurrentMatch(s);
  if (!activeMatch) {
    activeMatch = context.getNextPendingClubFixture(s);
  }

  if (!activeMatch) {
    console.log(`No active or pending match found at date ${s.date}. Pending:`, context.getPendingClubCompetitions(s).length);
    break;
  }

  // If match is in the future, advance date to match date
  if (activeMatch.date && activeMatch.date > s.date) {
    const d1 = new Date(s.date + 'T12:00:00');
    const d2 = new Date(activeMatch.date + 'T12:00:00');
    const diff = Math.max(1, Math.round((d2 - d1) / 86400000));
    context.advanceCalendarDays(diff, true);
  }

  // Now we are at match date
  activeMatch = context.getActualCurrentMatch(s) || context.getNextPendingClubFixture(s);
  if (!activeMatch) break;

  const matchType = activeMatch.type || (activeMatch.id === 'bra-cup' ? 'copa' : activeMatch.id?.startsWith('bra-est-') ? 'estadual' : 'league');
  const matchDesc = `${s.date} | ${activeMatch.competitionName || activeMatch.name} | ${activeMatch.home} x ${activeMatch.away} (${activeMatch.roundLabel || activeMatch.detail || ''})`;

  let played = false;
  if (matchType === 'estadual') {
    played = context.simulateQuickStateLeagueRound(activeMatch.competitionId, activeMatch.roundIndex);
  } else if (matchType === 'copa') {
    context.playCopaDoBrasilFixture(activeMatch.fixtureIndex, activeMatch.phaseName || activeMatch.detail);
    played = true;
  } else if (matchType === 'continental') {
    context.playContinentalFixture(activeMatch.competitionId, activeMatch.matchId);
    played = true;
  } else {
    // League match
    const beforeRound = s.round;
    context.simulateQuickRound();
    played = s.round > beforeRound || s.history.length > matchesPlayed;
  }

  if (played) {
    matchesPlayed++;
    playedLog.push(matchDesc);
  } else {
    console.log(`WARNING: Could not play match: ${matchDesc}`);
    // advance 1 day to not get stuck
    context.advanceCalendarDays(1, false);
  }

  if (matchesPlayed % 10 === 0) {
    console.log(`Played ${matchesPlayed} matches. Current date: ${s.date}`);
  }
}

console.log(`\nSimulation ended after ${daysSimulated} days. Total matches played: ${matchesPlayed}`);
const remaining = context.getPendingClubCompetitions(s);
console.log('Remaining pending fixtures:', remaining.length);
if (remaining.length > 0) {
  console.log('Remaining fixtures list:');
  remaining.forEach(r => console.log('  ' + r.date + ' | ' + r.name + ' | ' + r.detail));
} else {
  console.log('SUCCESS! All fixtures played!');
}
}
