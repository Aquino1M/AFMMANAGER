// Mock DOM
function createElement(tag){
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      _classes: new Set(),
      add(c){ this._classes.add(c); },
      remove(c){ this._classes.delete(c); },
      contains(c){ return this._classes.has(c); },
      toggle(c, v){ if(v === undefined) v = !this.contains(c); if(v) this.add(c); else this.remove(c); }
    },
    dataset: {},
    children: [],
    _innerHTML: '',
    get innerHTML(){ return this._innerHTML; },
    set innerHTML(html){
      this._innerHTML = html;
      this.children = [];
    },
    querySelector(sel){
      return createElement('div');
    },
    querySelectorAll(sel){
      return [createElement('button'), createElement('button')];
    },
    addEventListener(){},
    removeEventListener(){},
    focus(){}
  };
  return el;
}

global.window = global;
global.document = {
  querySelector(sel){ return createElement('div'); },
  querySelectorAll(sel){ return [createElement('div')]; },
  getElementById(id){ return createElement('div'); },
  createElement(tag){ return createElement(tag); },
  body: createElement('body')
};
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/competitions.js');
require('../data/competition_teams.js');
require('../data/players_live.js');
require('../js/player/social_media_manager.js');
require('../js/player/national_teams_manager.js');
require('../js/player/player_career_engine.js');
require('../js/ui/create_player_ui.js');

console.log('Testing renderCreatePlayerScreen:');
try {
  const container = createElement('div');
  window.renderCreatePlayerScreen(container, { username: 'aquino', name: 'Aquino' });
  console.log('SUCCESS! renderCreatePlayerScreen executed without errors. Generated HTML length:', container.innerHTML.length);
} catch(err){
  console.error('ERROR in renderCreatePlayerScreen:', err);
}
