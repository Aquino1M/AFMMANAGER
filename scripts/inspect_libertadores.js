const vm = require('vm');
const fs = require('fs');

const storage = {};
function createMock() {
  return {
    addEventListener: () => {}, removeEventListener: () => {},
    querySelector: () => createMock(), querySelectorAll: () => [],
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    style: {}, dataset: {}, children: [], appendChild: c => c, removeChild: () => {}, remove: () => {}
  };
}
const ctx = {
  window: {}, console, Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
  setTimeout: fn => 1, clearTimeout: () => {}, setInterval: () => 1, clearInterval: () => {},
  requestAnimationFrame: cb => cb(), scrollTo: () => {},
  localStorage: { getItem: k => storage[k] || null, setItem: (k,v) => storage[k] = String(v), removeItem: k => delete storage[k], clear: () => {} }
};
ctx.window = ctx;
ctx.document = { getElementById: id => createMock(), querySelector: sel => createMock(), querySelectorAll: () => [], addEventListener: () => {}, removeEventListener: () => {}, createElement: tag => createMock(), body: createMock() };
ctx.window.document = ctx.document;
ctx.window.esc = s => s;
ctx.window.AFM_DB = { init: () => Promise.resolve(null) };

vm.createContext(ctx);
['js/competitions.js','data/competition_teams.js','data/international_teams_2026_27.js','data/continental_2026.js','js/core/tournament_engine.js','js/core/competition_integrity.js','js/game.js'].forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));

ctx.newCareer({clubName:'Flamengo', compId:'bra-a', manager:'Me'});
const s = ctx.state;
const t = ctx.getContinentalTournament('lib');

console.log('--- Testing when date is 2026-03-03 ---');
s.date = '2026-03-03';
// suppose rounds 0..6 of national league have been played
s.round = 7; // next league match is round 7 (date 2026-03-07)
// and estadual rounds 0..5 have been played (round 6 is 2026-03-04)
const cand = [];
const act = ctx.getActualCurrentMatch(s);
console.log('act at 2026-03-03 with round 7:', act);

console.log('--- Testing when date is 2026-03-04 ---');
s.date = '2026-03-04';
const act2 = ctx.getActualCurrentMatch(s);
console.log('act at 2026-03-04 with round 7:', act2);

console.log('--- Let us check what getPendingClubCompetitions returns at 2026-03-03:');
console.log(ctx.getPendingClubCompetitions(s));
