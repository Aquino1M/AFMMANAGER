const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/game.js', 'utf8');
const start = source.indexOf('function cleanupConfirmedLocalSaveCopies(');
const end = source.indexOf('function save(){', start);
assert.ok(start >= 0 && end > start, 'cleanup function should exist before save');
const store = new Map();
const limit = 900;
const storage = {
  getItem: key => store.get(key) ?? null,
  removeItem: key => store.delete(key),
  setItem(key, value){
    const next = new Map(store); next.set(key, String(value));
    const size = [...next].reduce((sum, [k, v]) => sum + k.length + v.length, 0);
    if(size > limit) throw new Error('quota exceeded');
    store.set(key, String(value));
  }
};
const owner = 'aquino';
const current = { owner, slot: 1, club: 'Time A', data: { userOwner: owner, club: 'Time A' } };
const other = { owner: 'outra', slot: 1, data: { userOwner: 'outra' } };
store.set('afm_save_aquino_slot_1', JSON.stringify(current));
store.set('afm_save_aquino_slot_1_backup', JSON.stringify(current));
store.set('afm_save_slot_1_backup', JSON.stringify(current));
store.set('afm_save_outra_slot_1_backup', JSON.stringify(other));
store.set('afm2027_individual_save_slot_1_backup', JSON.stringify(current));
const entry = JSON.stringify(current);
const cleanupSource = source.slice(start, end).trim();
const cleanup = vm.runInNewContext(`(${cleanupSource})`, { localStorage: storage, JSON, Number, String });
assert.equal(cleanup(owner, 1, current, entry), true);
assert.equal(store.has('afm_save_slot_1'), true, 'the main local copy should remain');
assert.equal(store.has('afm_save_aquino_slot_1_backup'), false, 'confirmed duplicate backups should be removed');
assert.equal(store.has('afm_save_outra_slot_1_backup'), true, 'another user backup must remain untouched');
console.log('Save quota cleanup checks passed.');
