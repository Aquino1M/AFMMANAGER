const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/game.js', 'utf8');
const start = source.indexOf('function cleanupConfirmedLocalSaveCopies(');
const end = source.indexOf('function rememberActiveSaveSlot(', start);
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

const loadStart = source.indexOf('function load(){');
const loadEnd = source.indexOf('function saveUserSlot(', loadStart);
assert.ok(loadStart >= 0 && loadEnd > loadStart, 'load function should exist before saveUserSlot');
store.set('afm_active_user_v1', owner);
store.set('afm_active_slot_aquino', '2');
store.set('afm_save_slot_1', JSON.stringify({ ...current, data: { squad: [], club: 'Save antigo' } }));
store.set('afm_save_aquino_slot_2', JSON.stringify({
  owner, slot: 2, updatedAt: '2026-11-14T12:00:00.000Z',
  data: { userOwner: owner, userSlot: 2, club: 'Save ativo', squad: [] }
}));
const load = vm.runInNewContext(`${source.slice(loadStart, loadEnd)}; load`, {
  localStorage: storage,
  STORAGE: 'aquino_futebol_manager_2026_v1',
  getActiveAccount: () => ({ username: owner }),
  parseSaveTimestamp: value => Date.parse(value) || 0,
  rememberActiveSaveSlot: (username, slot) => storage.setItem(`afm_active_slot_${username}`, slot),
  recordAFMError: () => {}
});
assert.equal(load().club, 'Save ativo', 'startup should restore the remembered slot instead of legacy slot 1');
store.delete('afm_active_slot_aquino');
assert.equal(load().club, 'Save ativo', 'first startup should infer the newest user-owned slot when no pointer exists yet');
console.log('Active save slot restore check passed.');
