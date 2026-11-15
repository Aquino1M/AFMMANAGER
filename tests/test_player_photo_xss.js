const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const created = [];
const context = {
  window: {},
  document: { createElement(tag) { const element = { tagName: tag.toUpperCase(), style: {}, set src(value) { this._src = value; }, get src() { return this._src; } }; created.push(element); return element; } }
};
vm.runInNewContext(fs.readFileSync('js/core/real_player_faces_auto_fetcher.js', 'utf8'), context);

const host = { replaceChildren(child) { this.child = child; } };
const attacker = { name: '<img src=x onerror=alert(1)>', photo: 'x" onerror="alert(1)' };
context.window.AFM_RealPlayerFaces.hydratePlayerAvatarElement(host, attacker);

assert.equal(created.length, 1);
assert.equal(host.child.src, attacker.photo);
assert.equal(host.child.alt, attacker.name);
assert.equal(host.child.tagName, 'IMG');
console.log('OK: foto e nome são atribuídos como propriedades DOM, sem interpretar HTML.');
