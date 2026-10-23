const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const crypto = require('crypto');

const source = fs.readFileSync('js/game.js', 'utf8');
const match = source.match(/const AFM_ARENAS_DATA = (\[[\s\S]*?\n\]);\s*\nfunction normalizeArenaSearch/);
assert.ok(match, 'AFM_ARENAS_DATA should be defined before gallery helper functions');
const arenas = vm.runInNewContext(match[1]);
const expected = [
  'Neo Química Arena', 'Maracanã (Mário Filho)', 'Allianz Parque',
  'MorumBIS (Cícero Pompeu de Toledo)', 'Arena do Grêmio', 'Beira-Rio (José Pinheiro Borda)',
  'Arena MRV', 'Mineirão (Magalhães Pinto)', 'Nilton Santos (Engenhão)', 'Arena Fonte Nova',
  'Santiago Bernabéu', 'Spotify Camp Nou', 'Allianz Arena', 'Etihad Stadium',
  'Old Trafford', 'Parc des Princes', 'Allianz Stadium', 'Saitama Stadium 2002',
  'Nissan Stadium', 'Ajinomoto Stadium', 'Kingdom Arena', 'Al-Awwal Park', 'King Abdullah Sports City'
];

assert.strictEqual(arenas.length, 23, `Expected exactly 23 stadiums, found ${arenas.length}`);
const names = arenas.map(arena => arena.name);
assert.strictEqual(new Set(names).size, names.length, 'Stadium names must be unique');
expected.forEach(name => assert.ok(names.includes(name), `Missing stadium: ${name}`));
arenas.forEach(arena => {
  assert.ok(arena.club, `${arena.name} should name its home club(s)`);
  assert.ok(arena.history && arena.history.length > 40, `${arena.name} should have a historical description`);
  assert.ok(arena.profileId && /^[a-z0-9-]+$/.test(arena.profileId), `${arena.name} should have a safe profile ID`);
});

const root = process.cwd();
const exclusiveDir = path.join(root, 'assets/stadiums/real');
const manifestPath = path.join(exclusiveDir, 'manifest.json');
assert.ok(fs.existsSync(manifestPath), 'Exclusive GLB manifest should exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.models.length, 23, 'Manifest should contain exactly 23 stadium GLBs');
const exclusiveHashes = new Set();
const profileIds = new Set();
for (const arena of arenas) {
  const filename = `${arena.profileId}.glb`;
  const modelPath = path.join(exclusiveDir, filename);
  assert.ok(fs.existsSync(modelPath), `${arena.name}: missing exclusive file ${modelPath}`);
  const bytes = fs.readFileSync(modelPath);
  assert.ok(bytes.length > 1000, `${arena.name}: GLB unexpectedly small`);
  assert.strictEqual(bytes.toString('ascii', 0, 4), 'glTF', `${arena.name}: invalid GLB magic`);
  assert.strictEqual(bytes.readUInt32LE(4), 2, `${arena.name}: GLB must be version 2`);
  assert.strictEqual(bytes.readUInt32LE(8), bytes.length, `${arena.name}: GLB header length mismatch`);
  const jsonChunkLength = bytes.readUInt32LE(12);
  assert.strictEqual(bytes.toString('ascii', 16, 20), 'JSON', `${arena.name}: GLB JSON chunk missing`);
  const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + jsonChunkLength).trim());
  assert.strictEqual(gltf.asset.version, '2.0', `${arena.name}: invalid glTF version`);
  assert.ok(gltf.meshes?.length && gltf.meshes[0].primitives?.length, `${arena.name}: geometry primitives missing`);
  assert.ok(gltf.materials?.length >= 5, `${arena.name}: profile materials missing`);
  assert.strictEqual(gltf.nodes[0].extras.profileId, arena.profileId, `${arena.name}: embedded profile ID mismatch`);
  const entry = manifest.models.find(model => model.file === filename);
  assert.ok(entry, `${arena.name}: no corresponding manifest entry`);
  assert.strictEqual(gltf.nodes[0].extras.style, entry.style, `${arena.name}: manifest profile mismatch`);
  assert.ok(gltf.buffers[0].byteLength > 1000, `${arena.name}: binary mesh data missing`);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.strictEqual(hash, entry.sha256, `${arena.name}: manifest hash mismatch`);
  exclusiveHashes.add(hash);
  profileIds.add(arena.profileId);
  for (const mirrorDir of ['assets/stadios/real', 'public/assets/stadios/real']) {
    const mirrorPath = path.join(root, mirrorDir, filename);
    assert.ok(fs.existsSync(mirrorPath), `${arena.name}: runtime mirror missing ${mirrorDir}`);
    assert.strictEqual(crypto.createHash('sha256').update(fs.readFileSync(mirrorPath)).digest('hex'), hash, `${arena.name}: GLB mirror differs in ${mirrorDir}`);
  }
}
assert.strictEqual(profileIds.size, 23, 'All exclusive profile IDs should be mapped once');
assert.strictEqual(exclusiveHashes.size, 23, 'The 23 stadium GLBs must have different file content');

for (const selector of [
  'afmStadiumGalleryGrid', 'afmStadiumGallerySearch', 'afm-stadium-region-filter',
  'afm-stadium-model-viewer', 'data-club="${arena.primaryClub',
  'function getArenaRegion', 'function normalizeArenaSearch'
]) assert.ok(source.includes(selector), `Login stadium gallery should contain ${selector}`);
assert.ok(source.includes('loading="lazy"'), '3D viewers should use lazy loading');
assert.ok(source.includes('src="assets/stadiums/real/${arena.profileId}.glb"'), 'Every gallery card must point at its own profile GLB');
assert.ok(!source.includes("src=\"${(arena.model === 'arena_moderna'"), 'Gallery must not fall back to the generic three stadium meshes');
assert.ok(source.includes('AFM_ARENAS_DATA.map(arena =>'), 'Gallery should render cards from the catalog');

const categoryCounts = arenas.reduce((counts, arena) => {
  const location = `${arena.city} ${arena.club}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const region = /japao|toquio|tokyo|saitama|yokohama|arabia saudita|riade|jida/.test(location)
    ? 'Asia'
    : /espanha|alemanha|inglaterra|franca|italia|madri|munique|manchester|paris|turim|barcelona/.test(location)
      ? 'Europa'
      : 'Brasil';
  counts[region] = (counts[region] || 0) + 1;
  return counts;
}, {});
assert.deepStrictEqual(categoryCounts, { Brasil: 10, Europa: 7, Asia: 6 });

console.log('Login stadium gallery passed: exactly 23 unique stadium GLBs (10 Brazil, 7 Europe, 6 Asia); valid GLB2 headers/JSON/mesh buffers, matching profile IDs/hashes, synchronized runtime mirrors, unique model URLs, history/club/region/search metadata.');
