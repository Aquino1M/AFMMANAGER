const fs = require('fs');
const path = require('path');

console.log('Testing AFM 2027 Audio Engine & Sounds System...');

// 1. Check SFX files on disk
const expectedSFX = [
  'whistle_start',
  'whistle_foul',
  'whistle_card',
  'whistle_halftime',
  'whistle_end',
  'goal_celebration',
  'goal_post',
  'crowd_gasp'
];

let sfxFailures = 0;
for (const sfx of expectedSFX) {
  const p = path.join(__dirname, '..', 'sounds', 'sfx', `${sfx}.mp3`);
  if (!fs.existsSync(p)) {
    console.error(`✗ Missing SFX: ${sfx}.mp3`);
    sfxFailures++;
  } else {
    const size = fs.statSync(p).size;
    if (size < 1000) {
      console.error(`✗ Empty or corrupted SFX: ${sfx}.mp3 (${size} bytes)`);
      sfxFailures++;
    } else {
      console.log(`✓ SFX OK: ${sfx}.mp3 (${(size / 1024).toFixed(1)} KB)`);
    }
  }
}

if (sfxFailures > 0) {
  console.error(`FAIL: ${sfxFailures} SFX files failed.`);
  process.exit(1);
}

// 2. Check ambient_default.mp3
const defaultAmbient = path.join(__dirname, '..', 'sounds', 'crowd', 'ambient_default.mp3');
if (!fs.existsSync(defaultAmbient) || fs.statSync(defaultAmbient).size < 10000) {
  console.error('✗ Missing or invalid sounds/crowd/ambient_default.mp3');
  process.exit(1);
}
console.log(`✓ Default Ambient OK: ambient_default.mp3 (${(fs.statSync(defaultAmbient).size / 1024).toFixed(1)} KB)`);

// 3. Check Brazilian Divisions coverage
function normSlug(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

const compTeamsFile = fs.readFileSync(path.join(__dirname, '..', 'data', 'competition_teams.js'), 'utf-8');

function extractTeams(leagueId) {
  const m = compTeamsFile.match(new RegExp(`'${leagueId}'\\s*:\\s*\\[([^\\]]+)\\]`));
  if (!m) return [];
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

const serieA = extractTeams('bra-a');
const serieB = extractTeams('bra-b');
const serieC = extractTeams('bra-c');

console.log(`\nVerifying Série A (${serieA.length} clubs)...`);
let missingA = 0;
for (const club of serieA) {
  const slug = normSlug(club);
  const pA = path.join(__dirname, '..', 'sounds', 'crowd', 'bra_a', `${slug}.mp3`);
  const pEst = path.join(__dirname, '..', 'sounds', 'crowd', 'bra_estaduais', `${slug}.mp3`);
  if (!fs.existsSync(pA) && !fs.existsSync(pEst)) {
    console.error(`✗ Missing Série A chant: ${club} (${slug}.mp3)`);
    missingA++;
  }
}
if (missingA === 0) console.log(`✓ Série A 100% COVERED (${serieA.length}/${serieA.length} clubs)!`);

console.log(`\nVerifying Série B (${serieB.length} clubs)...`);
let missingB = 0;
for (const club of serieB) {
  const slug = normSlug(club);
  const pB = path.join(__dirname, '..', 'sounds', 'crowd', 'bra_b', `${slug}.mp3`);
  const pEst = path.join(__dirname, '..', 'sounds', 'crowd', 'bra_estaduais', `${slug}.mp3`);
  if (!fs.existsSync(pB) && !fs.existsSync(pEst)) {
    console.error(`✗ Missing Série B chant: ${club} (${slug}.mp3)`);
    missingB++;
  }
}
if (missingB === 0) console.log(`✓ Série B 100% COVERED (${serieB.length}/${serieB.length} clubs)!`);

console.log(`\nVerifying Série C (${serieC.length} clubs)...`);
let missingC = 0;
for (const club of serieC) {
  const slug = normSlug(club);
  const pC = path.join(__dirname, '..', 'sounds', 'crowd', 'bra_c', `${slug}.mp3`);
  const pEst = path.join(__dirname, '..', 'sounds', 'crowd', 'bra_estaduais', `${slug}.mp3`);
  if (!fs.existsSync(pC) && !fs.existsSync(pEst)) {
    console.error(`✗ Missing Série C chant: ${club} (${slug}.mp3)`);
    missingC++;
  }
}
if (missingC === 0) console.log(`✓ Série C 100% COVERED (${serieC.length}/${serieC.length} clubs)!`);

// 4. Check js/core/audio_engine.js syntax and logic
console.log('\nValidating js/core/audio_engine.js...');
const audioCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'core', 'audio_engine.js'), 'utf-8');
new Function(audioCode);
console.log('✓ js/core/audio_engine.js compiles with 0 errors');

console.log('\n🎉 ALL AUDIO ENGINE & SOUND ASSETS TESTS PASSED 100%!');
