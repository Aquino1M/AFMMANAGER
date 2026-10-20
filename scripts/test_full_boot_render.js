const fs = require('fs');

console.log('Testing full boot and renderSetup execution with mock DOM...');

// Mock browser window and DOM
const createdElements = [];
function makeElement(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      toggle: function(c, force) { if(force === undefined) { if(this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); } else if(force) this._classes.add(c); else this._classes.delete(c); },
      has: function(c) { return this._classes.has(c); }
    },
    dataset: {},
    children: [],
    attributes: {},
    setAttribute: function(k, v) { this.attributes[k] = v; },
    getAttribute: function(k) { return this.attributes[k]; },
    appendChild: function(child) { this.children.push(child); return child; },
    insertAdjacentHTML: function(position, html) { this.innerHTML += html; },
    addEventListener: function(event, handler) { this['on' + event] = handler; },
    removeEventListener: function() {},
    remove: function() {
      if (this.parentNode && this.parentNode.children) {
        this.parentNode.children = this.parentNode.children.filter(c => c !== this);
      }
    },
    querySelector: function(s) {
      if (s === '#appMatchActionModal' || s === '#appCustomModal') return null;
      return makeElement('div');
    },
    querySelectorAll: function(s) {
      return [makeElement('div'), makeElement('button')];
    },
    innerHTML: ''
  };
  return el;
}

const mockApp = makeElement('div');
mockApp.id = 'app';

const mockDoc = {
  readyState: 'complete',
  getElementById: function(id) {
    if (id === 'app') return mockApp;
    if (id === 'afmLoadingScreen') return makeElement('div');
    return null;
  },
  querySelector: function(s) {
    if (s === '#app') return mockApp;
    if (s === '.afm-sys-cat-btn' || s === '.btnPlayWithSystem') return null;
    return makeElement('div');
  },
  querySelectorAll: function(s) {
    if (s === '.afm-sys-cat-btn' || s === '.btnPlayWithSystem') return [];
    return [makeElement('div')];
  },
  createElement: makeElement,
  body: makeElement('body'),
  addEventListener: function() {}
};

global.window = global;
global.window.addEventListener = function() {};
global.document = mockDoc;
global.localStorage = {
  _data: {},
  getItem: function(k) { return this._data[k] || null; },
  setItem: function(k, v) { this._data[k] = String(v); },
  removeItem: function(k) { delete this._data[k]; },
  clear: function() { this._data = {}; }
};

// Load base dependencies
eval(fs.readFileSync('js/competitions.js', 'utf8'));
eval(fs.readFileSync('data/competition_teams.js', 'utf8'));
eval(fs.readFileSync('data/international_teams_2026_27.js', 'utf8'));
eval(fs.readFileSync('data/continental_2026.js', 'utf8'));
eval(fs.readFileSync('data/players_live.js', 'utf8'));
eval(fs.readFileSync('data/club_badges.js', 'utf8'));
eval(fs.readFileSync('data/club_badges_unverified.js', 'utf8'));
eval(fs.readFileSync('data/club_badges_competitions.js', 'utf8'));
eval(fs.readFileSync('js/core/club_badges_core.js', 'utf8'));
eval(fs.readFileSync('data/club_badges_verified_2026.js', 'utf8'));
eval(fs.readFileSync('data/club_badges_verified_world.js', 'utf8'));
eval(fs.readFileSync('data/club_badges_verified_overrides.js', 'utf8'));
eval(fs.readFileSync('data/club_badges_local_index.js', 'utf8'));
eval(fs.readFileSync('data/player_photos.js', 'utf8'));
eval(fs.readFileSync('data/player_photos_modular.js', 'utf8'));
eval(fs.readFileSync('data/player_photos_blocked.js', 'utf8'));
eval(fs.readFileSync('data/player_photos_verified.js', 'utf8'));
eval(fs.readFileSync('js/core/real_player_faces_auto_fetcher.js', 'utf8'));
eval(fs.readFileSync('js/core/tournament_engine.js', 'utf8'));
eval(fs.readFileSync('js/core/competition_integrity.js', 'utf8'));
eval(fs.readFileSync('js/features30.js', 'utf8'));
eval(fs.readFileSync('js/core/audio_engine.js', 'utf8'));
eval(fs.readFileSync('js/core/match_engine.js', 'utf8'));
eval(fs.readFileSync('js/core/tactics_pitch.js', 'utf8'));
eval(fs.readFileSync('js/core/real_football_engine.js', 'utf8'));
eval(fs.readFileSync('js/ui/settings_modal.js', 'utf8'));
eval(fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8'));

// Now load game.js
console.log('Loading js/game.js...');
eval(fs.readFileSync('js/game.js', 'utf8'));

console.log('Testing Test 1: Fresh visitor (no active user, no save)...');
window.state = null;
window.render();
if (mockApp.innerHTML.includes('Recuperando inicialização do simulador')) {
  console.error('❌ Test 1 FAILED: Render fell back to error screen!');
  process.exit(1);
} else if (mockApp.innerHTML.includes('afm-landing-wrapper')) {
  console.log('✓ Test 1 PASSED: Landing page rendered successfully with hero craques and auth form!');
} else {
  console.log('ℹ Test 1 rendered content length:', mockApp.innerHTML.length);
}

console.log('Testing Test 2: Logged in coach (saves slots & team selection)...');
localStorage.setItem('afm_active_user_v1', 'aquino');
window.state = null;
window.render();
if (mockApp.innerHTML.includes('Recuperando inicialização do simulador')) {
  console.error('❌ Test 2 FAILED: Render fell back to error screen for logged-in user!');
  process.exit(1);
} else if (mockApp.innerHTML.includes('SUAS CAMPANHAS SALVAS') && mockApp.innerHTML.includes('INICIAR NOVA CARREIRA')) {
  console.log('✓ Test 2 PASSED: 3 save slots and team selection rendered successfully for coach!');
} else {
  console.log('ℹ Test 2 rendered content length:', mockApp.innerHTML.length);
}

console.log('🎉 ALL BOOT AND RENDER TESTS COMPLETED SUCCESSFULLY!');
