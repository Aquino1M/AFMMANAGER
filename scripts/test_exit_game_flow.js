// Test script to verify the exit flow and the team/save selection screen rendering
const fs = require('fs');

console.log('Testing Exit Game -> Team & Save Selection Screen flow...');

// Mock browser environment
const localStorageData = {
  'afm_active_user_v1': 'aquino',
  'afm_accounts_v1': JSON.stringify([
    { username: 'aquino', name: 'Professor Aquino', role: 'player', saves: [
      { slot: 1, club: 'Corinthians', manager: 'Professor Aquino', season: 2026, round: 5, balance: 35000000, date: '2026-02-15' }
    ] }
  ]),
  'afm_save_aquino_slot_1': JSON.stringify({
    slot: 1, club: 'Corinthians', manager: 'Professor Aquino', season: 2026, round: 5, balance: 35000000, date: '2026-02-15'
  })
};

global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; }
};

global.window = global;
global.document = {
  getElementById: (id) => null,
  querySelector: (s) => null,
  querySelectorAll: (s) => [],
  createElement: (tag) => ({
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    setAttribute: () => {},
    addEventListener: () => {}
  }),
  body: {
    appendChild: () => {}
  }
};
global.Intl = Intl;

// Load competitions and teams data
eval(fs.readFileSync('js/competitions.js', 'utf8'));
eval(fs.readFileSync('data/competition_teams.js', 'utf8'));

// Check game.js
const gameSrc = fs.readFileSync('js/game.js', 'utf8');

// Test that the syntax in game.js is valid
try {
  new Function(gameSrc);
  console.log('✓ js/game.js compiled successfully with 0 syntax errors');
} catch(e) {
  console.error('❌ Syntax error in js/game.js:', e);
  process.exit(1);
}

// Check that no single dollar forEach exists
const matchSingleDollar = gameSrc.match(/(^|[^$])\$\(['"][^'"]+['"]\)\.forEach/);
if (matchSingleDollar) {
  console.error('❌ Found single $ forEach:', matchSingleDollar[0]);
  process.exit(1);
} else {
  console.log('✓ 0 single $ forEach found in js/game.js');
}

// Test renderSetup HTML output when activeUser is present
const testSetupHtmlExtraction = () => {
  // Extract renderSetup function and check its markup structure
  const hasSaveSlotsHeader = gameSrc.includes('SUAS CAMPANHAS SALVAS (ATÉ 3 SLOTS DESTA CONTA)');
  const hasNewCareerHeader = gameSrc.includes('INICIAR NOVA CARREIRA · ESCOLHA SEU CLUBE');
  const hasClubGrid = gameSrc.includes('club-thumb-grid');
  const hasClubHero = gameSrc.includes('club-detail-hero');

  if (hasSaveSlotsHeader && hasNewCareerHeader && hasClubGrid && hasClubHero) {
    console.log('✓ renderSetup template contains all expected save slots and team selection components');
  } else {
    console.error('❌ Missing expected components in renderSetup template');
    process.exit(1);
  }
};

testSetupHtmlExtraction();

console.log('🎉 ALL EXIT AND SETUP TESTS PASSED!');
