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
    Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    openCustomModal: (title, html) => { lastCustomModal = { title, html }; },
    closeCustomModal: () => { lastCustomModal = null; },
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

function inspectCalendarItems(club, comp) {
  env.newCareer({ clubName: club, compId: comp, manager: 'Mister Aquino' });
  const s = env.state;
  
  // Let's get calendar cards by parsing calendarPage()
  const cal = env.calendarPage();
  
  // In calendarPage(), each card has:
  // <div class="cal-card ..."> or similar. Let's see the cards:
  const cardRegex = /<div class="cal-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
  // Or let's see how calendar items are constructed
  console.log(`\n================== ${club} (${comp}) ==================`);
  
  // Let's check getActualCurrentMatch
  const current = env.getActualCurrentMatch(s);
  console.log('Current Match:', current ? `${current.home} vs ${current.away} [${current.competitionName}] on ${current.date}` : 'NONE');
  
  const pending = env.getPendingClubCompetitions(s);
  console.log('Pending Competitions count:', pending.length);
  const byComp = {};
  pending.forEach(p => {
    const cName = p.competitionName || p.competition || p.compName || p.type || (p.match && p.match.competitionName) || 'unknown';
    byComp[cName] = (byComp[cName] || 0) + 1;
  });
  console.log('Pending by comp:', byComp);
  if (pending.length > 0) {
    console.log('Sample pending item:', JSON.stringify(pending[0]));
  }

}

inspectCalendarItems('Boca Juniors', 'arg-1');
inspectCalendarItems('Real Madrid', 'esp-1');
inspectCalendarItems('Arsenal', 'eng-1');
inspectCalendarItems('Al-Hilal', 'ksa-1');
inspectCalendarItems('Kashima Antlers', 'jpn-1');
