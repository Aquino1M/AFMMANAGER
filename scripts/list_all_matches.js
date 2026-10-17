const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createMockElement(tag, id = '', className = '') {
  return {
    tagName: (tag || 'DIV').toUpperCase(), id: id || '', className: className || '', innerHTML: '', textContent: '', value: '', dataset: {}, style: {}, children: [], parentNode: null, querySelector: () => createMockElement('span'), querySelectorAll: () => [], appendChild: function(c) { this.children.push(c); return c; }, remove: function() {}, setAttribute: function() {}, getAttribute: function() { return null; }
  };
}
const root = createMockElement('div', 'app');
const context = {
  console, Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map, setTimeout: cb => cb && cb(), clearTimeout: () => {}, requestAnimationFrame: cb => cb(), scrollTo: () => {}, AFM_DB: { init: () => Promise.resolve() }, localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }, openCustomModal: () => {}, closeCustomModal: () => {}, toast: () => {}, document: { getElementById: id => (id === 'app' ? root : null), querySelector: sel => (sel === '#app' ? root : null), querySelectorAll: () => [], createElement: tag => createMockElement(tag), addEventListener: () => {}, removeEventListener: () => {}, body: createMockElement('body') }
};
context.window = context; context.addEventListener = () => {}; context.removeEventListener = () => {};
vm.createContext(context);
[
  'js/competitions.js', 'data/competition_teams.js', 'data/international_teams_2026_27.js', 'data/continental_2026.js', 'js/core/tournament_engine.js', 'js/core/real_football_engine.js', 'js/game.js', 'js/core/calendar_and_day_advance_fix.js'
].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), context));

context.newCareer({ clubName: 'Corinthians', compId: 'bra-a', manager: 'Teste' });
const st = context.state;

console.log('=== All Corinthians scheduled matches ===');
const all = [];
const clubKey = context.norm('Corinthians');

// 1. League
(st.schedule || []).forEach((r, idx) => {
  const f = (r || []).find(g => Array.isArray(g) && (context.norm(g[0]) === clubKey || context.norm(g[1]) === clubKey));
  if (f) {
    all.push({
      comp: 'Série A',
      date: context.getDateForRound(idx, st.season),
      round: idx + 1,
      home: f[0],
      away: f[1]
    });
  }
});

// 2. State
const estId = context.clubStateCompId('Corinthians');
const estData = context.getStateCompData(estId);
(estData.fixtures || []).forEach((fix, fixIdx) => {
  if (context.norm(fix.home) === clubKey || context.norm(fix.away) === clubKey) {
    all.push({
      comp: 'Paulista',
      date: fix.isoDate || context.getDateForRound(fix.roundIndex || 0, st.season),
      round: (fix.roundIndex || 0) + 1,
      home: fix.home,
      away: fix.away
    });
  }
});

const ensureMid = (d, s) => {
  if (!d) return d;
  const dt = new Date(d + 'T12:00:00');
  const day = dt.getDay();
  if (day !== 3) dt.setDate(dt.getDate() + (3 - day));
  return dt.toISOString().slice(0, 10);
};

// 3. Continental
const lib = context.getContinentalTournament('lib');
(lib.matches || []).forEach(m => {
  if (context.norm(m.home) === clubKey || context.norm(m.away) === clubKey) {
    all.push({
      comp: 'Libertadores',
      date: ensureMid(m.date, st.season),
      round: m.round,
      home: m.home,
      away: m.away
    });
  }
});

// 4. Copa
const copa = context.getCopaDoBrasilState ? context.getCopaDoBrasilState() : st.copaData;
if (typeof context.processCopaDoBrasilCalendar === 'function') context.processCopaDoBrasilCalendar(st.date);
Object.entries(copa.phases || {}).forEach(([pName, p]) => {
  (p.fixtures || []).forEach((fix, fIdx) => {
    if (context.norm(fix.home) === clubKey || context.norm(fix.away) === clubKey) {
      all.push({
        comp: 'Copa do Brasil',
        date: ensureMid(fix.isoDate || p.isoDate, st.season),
        round: pName,
        home: fix.home,
        away: fix.away
      });
    }
  });
});

all.sort((a,b) => a.date.localeCompare(b.date));
console.log(`Found ${all.length} matches for Corinthians:`);
all.slice(0, 30).forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.date}] ${m.comp} (R${m.round}): ${m.home} vs ${m.away}`);
});
