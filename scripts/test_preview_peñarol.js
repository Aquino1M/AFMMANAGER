const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createMockElement(tag, id = '', className = '') {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    id, className, innerHTML: '', textContent: '', value: '',
    children: [], style: {}, dataset: {},
    appendChild: function(c) { this.children.push(c); return c; },
    removeChild: function(c) { const i = this.children.indexOf(c); if(i >= 0) this.children.splice(i, 1); },
    remove: function() {
      if (this.parentNode && this.parentNode.removeChild) this.parentNode.removeChild(this);
    },
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k] || null; },
    querySelector: function(sel) {
      if (sel && sel.includes('#appCustomModal')) {
        return this.children.find(c => c.id === 'appCustomModal') || null;
      }
      return createMockElement('div');
    },
    querySelectorAll: function() { return []; }
  };
}

const root = createMockElement('body');
const appEl = createMockElement('div', 'app');
root.appendChild(appEl);

const context = {
  console,
  setTimeout: (fn) => 1,
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  scrollTo: () => {},
  requestAnimationFrame: (cb) => cb(),
  Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
  localStorage: {
    data: {},
    getItem: function(k) { return this.data[k] || null; },
    setItem: function(k, v) { this.data[k] = String(v); },
    removeItem: function(k) { delete this.data[k]; },
    clear: function() { this.data = {}; }
  }
};
context.window = context;
context.window.AFM_DB = { init: () => Promise.resolve(null) };

const doc = {
  getElementById: (id) => (id === 'app' ? appEl : root.children.find(c => c.id === id) || createMockElement('div', id)),
  querySelector: (sel) => (sel === '#app' ? appEl : root.children.find(c => c.id === sel.replace('#', '')) || createMockElement('div')),
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: (t) => createMockElement(t),
  body: root
};
context.document = doc;
context.window.document = doc;

vm.createContext(context);

const files = [
  'js/competitions.js',
  'data/competition_teams.js',
  'data/international_teams_2026_27.js',
  'data/continental_2026.js',
  'js/core/tournament_engine.js',
  'js/core/competition_integrity.js',
  'js/core/real_football_engine.js',
  'js/game.js',
  'js/systems/match_preview_pro.js'
];

for (const f of files) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), context);
}

console.log('Scripts loaded!');

vm.runInContext(`
  newCareer({ clubName: 'Corinthians', compId: 'bra-a', manager: 'Mister Aquino' });
  state.isPreSeason = false;
  state.preSeasonDays = 0;
  state.date = '2026-03-18';
  console.log('Club:', state.club, 'Date:', state.date);

  // Test opening match preview for Peñarol in Libertadores
  console.log('Testing openMatchPreviewModal with Corinthians vs Peñarol...');
  try {
    openMatchPreviewModal('Corinthians', 'Peñarol', 'Copa Libertadores', '2026-03-18');
    console.log('SUCCESS: openMatchPreviewModal executed!');
    const modal = document.body.children.find(c => c.id === 'appCustomModal');
    console.log('Modal element created?', !!modal);
    if (modal) {
      console.log('Modal innerHTML length:', modal.innerHTML.length);
      console.log('Contains Peñarol?', modal.innerHTML.includes('Peñarol'));
      console.log('Contains Corinthians?', modal.innerHTML.includes('Corinthians'));
    }
  } catch(e) {
    console.error('FAILED openMatchPreviewModal:', e);
  }
`, context);
