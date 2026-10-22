const fs = require('fs');

const elements = {};
global.window = global;
global.document = {
  body: { appendChild: (el) => {} },
  createElement: (tag) => ({ id: '', style: {}, innerHTML: '', querySelector: () => null, querySelectorAll: () => [] }),
  getElementById: (id) => elements[id] || null
};
global.$ = (sel) => null;
global.$$ = (sel) => [];
global.NAMES = ['Carlos'];
global.LAST = ['Silva'];
global.rnd = (a, b) => a;
global.clamp = (v, min, max) => Math.max(min, Math.min(max, v));
global.norm = (s) => String(s).toLowerCase();
global.esc = (s) => String(s);
global.fmtMoney = (v) => 'R$ ' + v;

const code = fs.readFileSync('js/game.js', 'utf8');
try {
  eval(code);
  console.log('typeof openStadiumModal:', typeof openStadiumModal);
  console.log('typeof window.openStadiumModal:', typeof window.openStadiumModal);
} catch (e) {
  console.error('Error during eval of game.js:', e);
}
