const fs = require('fs');

global.window = {};
// Helper normalization functions matching game.js
function norm(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
function normSlug(str) {
  return norm(str).replace(/[^a-z0-9]/g, '_');
}
global.norm = norm;
global.normSlug = normSlug;

// Load verified photos, modular photos, blocked photos
eval(fs.readFileSync('data/player_photos_verified.js', 'utf8'));
eval(fs.readFileSync('data/player_photos_blocked.js', 'utf8'));
eval(fs.readFileSync('data/player_photos_modular.js', 'utf8'));

// Trusted function from game.js
function trustedPlayerPhotoUrl(rawPhoto){
  if(typeof rawPhoto !== 'string' || !rawPhoto.trim()) return null;
  const photo = /^(?:https?:|data:|blob:|\/)/i.test(rawPhoto) ? rawPhoto.trim() : (rawPhoto.startsWith('img/') ? rawPhoto : `img/${rawPhoto.replace(/^\.?\//, '')}`);
  const localPath = photo.replace(/^\.\//, '');
  const isUnverifiedMappedPhoto = window.PLAYER_PHOTO_MAPPED_PATHS?.has(localPath) && !window.PLAYER_PHOTO_VERIFIED?.has(localPath);
  return isUnverifiedMappedPhoto || window.PLAYER_PHOTO_DUPLICATES?.has(localPath) ? null : photo;
}

// resolvePlayerPhotoUrl from game.js
function resolvePlayerPhotoUrl(p) {
  if (!p) return null;
  const name = typeof p === 'string' ? p : (p.name || '');
  if (!name) return null;

  if (typeof p === 'object' && p.photo && typeof p.photo === 'string') {
    const trusted = trustedPlayerPhotoUrl(p.photo);
    if (trusted) return trusted;
  }

  if (typeof p === 'object' && p.tmId) {
    const tmPath = `img/players/tm_${p.tmId}.jpg`;
    if (!window.PLAYER_PHOTO_DUPLICATES?.has(tmPath)) {
      const trusted = trustedPlayerPhotoUrl(tmPath);
      if (trusted) return trusted;
    }
  }

  const club = typeof p === 'object' ? (p.club || '') : '';
  const photos = window.PLAYER_PHOTOS || {};
  const normName = norm(name);
  const slugName = normSlug(name);

  if (club) {
    const clubNorm = norm(club);
    const clubMatch = photos[`${club}::${name}`] || photos[`${clubNorm}::${normName}`] || photos[`${club}::${normName}`] || photos[`${club}::${slugName}`];
    if (clubMatch) {
      const trusted = trustedPlayerPhotoUrl(clubMatch);
      if (trusted) return trusted;
    }
  }

  if (window.AMBIGUOUS_PLAYER_NAMES && (window.AMBIGUOUS_PLAYER_NAMES.has(normName) || window.AMBIGUOUS_PLAYER_NAMES.has(name.toLowerCase()))) {
    return null;
  }

  let match = photos[name] || photos[normName] || photos[name.toLowerCase()] || photos[slugName];
  if (!match) {
    const normalizedKey = Object.keys(photos).find(key => !key.includes('::') && (norm(key) === normName || normSlug(key) === slugName));
    if (normalizedKey) match = photos[normalizedKey];
  }
  return match ? trustedPlayerPhotoUrl(match) : null;
}

console.log('=== RUNNING COMPREHENSIVE ANTI-HOMONYM & STAR PHOTO TESTS ===\n');

const testCases = [
  { p: { name: 'Fabrício', club: 'Bragantino' }, expected: 'img/players/tm_722457.jpg' },
  { p: { name: 'Fabrício', club: 'Figueirense' }, expected: 'img/players/tm_150479.jpg' },
  { p: { name: 'Fabricio', club: 'Londrina' }, expected: 'img/players/tm_1093769.jpg' },
  { p: { name: 'Fabrício', club: 'Volta Redonda' }, expected: null },
  { p: { name: 'Matheus Pereira', club: 'Cruzeiro' }, expected: 'img/players/tm_225984.jpg' },
  { p: { name: 'Matheus Pereira', club: 'Corinthians' }, expected: null },
  { p: { name: 'Lionel Messi', club: 'Inter Miami' }, expected: 'img/players/tm_28003.jpg' },
  { p: { name: 'Luis Suárez', club: 'Inter Miami' }, expected: 'img/players/tm_44352.jpg' },
  { p: { name: 'Sergio Busquets', club: 'Inter Miami' }, expected: 'img/players/tm_65230.jpg' },
  { p: { name: 'Jordi Alba', club: 'Inter Miami' }, expected: 'img/players/tm_69751.jpg' },
  { p: { name: 'Marco Reus', club: 'LA Galaxy' }, expected: 'img/players/tm_35207.jpg' },
  { p: { name: 'Olivier Giroud', club: 'Los Angeles FC' }, expected: 'img/players/tm_82442.jpg' },
  { p: { name: 'Neymar Jr', club: 'Santos' }, expected: 'img/players/tm_68290.jpg' },
  { p: { name: 'Estêvão', club: 'Chelsea' }, expected: 'img/players/tm_1056993.jpg' },
  { p: { name: 'Memphis Depay', club: 'Corinthians' }, expected: 'img/players/bra_a/corinthians/memphis_depay.png' }
];

let allPassed = true;
for (const tc of testCases) {
  const result = resolvePlayerPhotoUrl(tc.p);
  const pass = result === tc.expected;
  if (!pass) allPassed = false;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${tc.p.club} - ${tc.p.name}`);
  console.log(`       Got:      ${result}`);
  console.log(`       Expected: ${tc.expected}`);
}

console.log(`\nFinal Test Suite Result: ${allPassed ? 'ALL TESTS PASSED 100%!' : 'SOME TESTS FAILED'}`);
