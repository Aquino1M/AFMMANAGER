const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const stage = {
  innerHTML: '<svg>fallback</svg>',
  clientWidth: 260,
  clientHeight: 310,
  appendChild(){ throw new Error('No WebGL context'); }
};
const window = {
  THREE: { WebGLRenderer: function(){ throw new Error('WebGL unavailable'); } },
  devicePixelRatio: 1,
  console: { warn(){} }
};
const document = { createElement: () => ({}) };
vm.runInNewContext(fs.readFileSync('js/player/player_avatar_3d.js', 'utf8'), { window, document, console: window.console }, { filename: 'player_avatar_3d.js' });

assert.equal(window.AFM_PlayerAvatar3D.mount(stage, {}), false, 'failed WebGL initialization must use the fallback');
assert.equal(stage.innerHTML, '<svg>fallback</svg>', 'fallback preview must survive a WebGL error');
assert.equal(window.AFM_PlayerAvatar3D.update({}), false, 'update without a mounted preview must fail safely');
console.log('Player 3D avatar fallback checks passed.');
