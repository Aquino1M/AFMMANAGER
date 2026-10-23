const assert = require('assert');
const fs = require('fs');

// Load player_xp_evolution module
require('../js/systems/player_xp_evolution.js');

const XP = globalThis.AFM_PlayerXPEvolution;
assert(XP, 'AFM_PlayerXPEvolution should be defined globally');

console.log('--- TEST 1: XP Required per Level Curve ---');
assert.strictEqual(XP.getXPRequiredForNextLevel(58), 300);
assert.strictEqual(XP.getXPRequiredForNextLevel(65), 420);
assert.strictEqual(XP.getXPRequiredForNextLevel(72), 580);
assert.strictEqual(XP.getXPRequiredForNextLevel(78), 800);
assert.strictEqual(XP.getXPRequiredForNextLevel(84), 1150);
assert.strictEqual(XP.getXPRequiredForNextLevel(88), 1600);
assert.strictEqual(XP.getXPRequiredForNextLevel(92), 2200);
console.log('✓ XP Required Curve validated successfully.');

console.log('--- TEST 2: initPlayerXP on Existing Saves ---');
const oldPlayer = { name: 'Alisson', pos: 'GK', age: 23, overall: 71, potential: 76 };
XP.initPlayerXP(oldPlayer, { date: '2026-03-15' });
assert.strictEqual(oldPlayer.xp, 0);
assert.strictEqual(oldPlayer.xpNext, 580);
assert(oldPlayer.monthlyEvolution, 'Should create monthlyEvolution');
assert.strictEqual(oldPlayer.monthlyEvolution.month, '2026-03');
assert.strictEqual(oldPlayer.breakthroughsCount, 0);
console.log('✓ initPlayerXP backward compatibility validated.');

console.log('--- TEST 3: Performance-Balanced Match XP Calculation ---');
// Young forward (age 19), 90 min, 1 goal, 1 assist, team won 3-1, stellar rating 8.6
const starPerf = XP.calcPlayerMatchXP({ name: 'Prodígio', age: 19, pos: 'ST' }, {
  minutes: 90,
  teamResult: { gf: 3, ga: 1, won: true, draw: false },
  goals: 1,
  assists: 1,
  isGK: false,
  isDef: false
});

assert(starPerf.rating >= 8.0, `Rating should be >= 8.0, got ${starPerf.rating}`);
assert.strictEqual(starPerf.breakdown.goalsBonus, 40);
assert.strictEqual(starPerf.breakdown.assistsBonus, 25);
assert.strictEqual(starPerf.breakdown.resultBonus, 15);
assert.strictEqual(starPerf.breakdown.ageMult, 1.4);
assert(starPerf.matchXP > 200, `High performance youngster should earn substantial XP, got ${starPerf.matchXP}`);

// Poor performance: veteran player (age 33), 90 min, team lost 0-3, bad rating 5.3
const poorPerf = XP.calcPlayerMatchXP({ name: 'Veterano', age: 33, pos: 'CM' }, {
  minutes: 90,
  teamResult: { gf: 0, ga: 3, won: false, draw: false },
  goals: 0,
  assists: 0,
  isGK: false,
  isDef: false
});
assert(poorPerf.rating <= 6.0, `Rating should be low on heavy loss, got ${poorPerf.rating}`);
assert.strictEqual(poorPerf.breakdown.ratingBonus, 5, 'Rating < 6.0 should give only 5 XP rating bonus');
assert.strictEqual(poorPerf.breakdown.goalsBonus, 0);
assert.strictEqual(poorPerf.breakdown.resultBonus, 0);
assert.strictEqual(poorPerf.breakdown.ageMult, 0.4);
assert(poorPerf.matchXP < 30, `Poor performing veteran should gain minimal XP, got ${poorPerf.matchXP}`);
assert(starPerf.matchXP > poorPerf.matchXP * 5, 'Star performance must award far more XP than poor match');
console.log(`✓ Performance balance validated: Star earned ${starPerf.matchXP} XP vs Poor earned ${poorPerf.matchXP} XP.`);

console.log('--- TEST 4: Clean Sheet Bonus for GK & DEF ---');
const gkPerf = XP.calcPlayerMatchXP({ name: 'Goleiro Top', age: 25, pos: 'GK' }, {
  minutes: 90,
  teamResult: { gf: 2, ga: 0, won: true, draw: false },
  goals: 0,
  assists: 0,
  isGK: true,
  isDef: false
});
assert.strictEqual(gkPerf.cleanSheet, true);
assert.strictEqual(gkPerf.breakdown.cleanSheetBonus, 35);
console.log('✓ Clean sheet bonus (+35 XP) awarded to GK.');

console.log('--- TEST 5: Full Match XP Cycle with Level Up ---');
const mockState = {
  club: 'Criciúma',
  date: '2026-04-10',
  news: [],
  lineup: ['p1', 'p2'],
  squad: [
    { name: 'Lucas Atacante', key: 'p1', pos: 'ST', age: 20, overall: 65, potential: 78, xp: 400, xpNext: 420 },
    { name: 'Goleiro Alisson', key: 'p2', pos: 'GK', age: 24, overall: 71, potential: 75, xp: 50, xpNext: 580 },
    { name: 'Reserva Banco', key: 'p3', pos: 'CM', age: 22, overall: 64, potential: 70, xp: 20, xpNext: 420 }
  ]
};
// Global playerKey and playerOverall helpers for test
globalThis.playerKey = p => p.key || p.name;
globalThis.playerOverall = p => p.overall;
globalThis.toast = msg => console.log('  [TOAST]', msg);

const matchRes = {
  h: 'Criciúma',
  a: 'Adversário FC',
  hg: 2,
  ag: 0,
  won: true,
  events: [
    { type: 'gol', scorer: 'Lucas Atacante', assist: 'Goleiro Alisson' },
    { type: 'gol', scorer: 'Lucas Atacante' }
  ]
};

const result = XP.processMatchXP(mockState, matchRes);
assert.strictEqual(result.updatedPlayers.length, 2, 'Two starters should be processed');
assert(mockState.squad[0].overall === 66, 'Lucas Atacante should level up to OVR 66!');
assert(mockState.squad[0].xp >= 0, 'Lucas Atacante XP should roll over after level up');
assert.strictEqual(mockState.squad[2].lastMatchXP.matchXP, 0, 'Bench player earns 0 match XP for not playing');
console.log('✓ Match XP processing and level up verified.');

console.log('--- TEST 6: "Ir Além" (Breakthrough) Ceiling Breaker ---');
// Young talent at his potential ceiling (age 21, OVR 75, POT 75)
const prodigy = {
  name: 'Neymar Jr da Silva',
  key: 'prod1',
  pos: 'LW',
  age: 21,
  overall: 75,
  potential: 75,
  xp: 790,
  xpNext: 800,
  rating: 8.2,
  monthlyEvolution: { month: '2026-04', matchXP: 350, trainingXP: 50, matchesPlayed: 5, avgRating: 8.1, sumRatings: 40.5, ovrGains: 0, breakthroughs: 0 }
};

mockState.squad.push(prodigy);
// Add 50 XP to trigger level up past potential
prodigy.xp += 50;
const eventsLog = [];
XP.checkLevelUp(prodigy, mockState, eventsLog);

assert.strictEqual(eventsLog[0].type, 'breakthrough', 'Should trigger breakthrough event');
assert(prodigy.potential > 75, `Potential should increase beyond 75, got ${prodigy.potential}`);
assert.strictEqual(prodigy.overall, 76, 'Overall should increase to 76');
assert.strictEqual(prodigy.breakthroughsCount, 1);
assert(mockState.news.some(n => n.includes('PRODÍGIO INDOMÁVEL')), 'Should generate breakthrough news');
console.log(`✓ Breakthrough successfully broken ceiling: OVR ${prodigy.overall}, new POT ${prodigy.potential}!`);

console.log('--- TEST 7: Training XP via CT for Entire Squad ---');
mockState.infrastructure = { training: { level: 3 } }; // Level 3 CT gives more XP than level 1
const reserveBefore = mockState.squad[2].xp;
XP.processMonthlyTrainingXP(mockState);
assert(mockState.squad[2].xp > reserveBefore, 'Reserve player must gain training XP from CT');
assert(mockState.squad[2].monthlyEvolution.trainingXP > 0, 'monthlyEvolution.trainingXP must track CT points');
console.log(`✓ Training XP successfully processed (Reserve XP went from ${reserveBefore} to ${mockState.squad[2].xp}).`);

const trainingXpAtLevel = (level) => {
  const isolatedState = {
    date: '2026-05-01',
    squad: [{ name: `CT ${level}`, pos: 'CM', age: 25, overall: 60, potential: 90, xp: 0, xpNext: 99999 }],
    infrastructure: { training: { level } }
  };
  XP.processMonthlyTrainingXP(isolatedState);
  return isolatedState.squad[0].monthlyEvolution.trainingXP;
};
const monthlyTrainingByLevel = Array.from({ length: 8 }, (_, idx) => trainingXpAtLevel(idx + 1));
assert(monthlyTrainingByLevel.every((xp, idx) => idx === 0 || xp > monthlyTrainingByLevel[idx - 1]),
  `Monthly CT training XP must increase at every level 1–8, got ${monthlyTrainingByLevel.join(', ')}`);
console.log(`✓ Monthly CT bonus increases continuously from level 1 to 8: ${monthlyTrainingByLevel.join(' → ')} XP.`);

console.log('--- TEST 8: UI Components Rendering ---');
const miniHtml = XP.renderMiniXPBar(mockState.squad[0]);
assert(miniHtml.includes('afm-player-xp-mini'), 'Mini XP bar must contain afm-player-xp-mini class');
assert(miniHtml.includes('XP'), 'Mini bar must show XP');

const panelHtml = XP.renderEvolutionPanelHTML(mockState.squad[0], mockState);
assert(panelHtml.includes('PROGRESSO DE EVOLUÇÃO & XP'), 'Panel must include Evolution header');
assert(panelHtml.includes('RESUMO DE PONTOS DESTE MÊS'), 'Panel must include monthly points breakdown');
assert(panelHtml.includes('EM CAMPO'), 'Panel must show match points');
assert(panelHtml.includes('TREINO CT'), 'Panel must show CT points');
console.log('✓ UI components rendered properly.');

console.log('--- TEST 9: FORMATIONS GK Coordinates in game.js ---');
const gameJsContent = fs.readFileSync('js/game.js', 'utf8');
const oldGkCount = (gameJsContent.match(/\{r:'GK',x:50,y:89,g:'def'\}/g) || []).length;
assert.strictEqual(oldGkCount, 0, 'No FORMATIONS should have old GK y:89 coordinate');
const newGkCount = (gameJsContent.match(/\{r:'GK',x:50,y:81\.5,g:'def'\}/g) || []).length;
assert.strictEqual(newGkCount, 18, 'All 18 vertical formations must use GK y:81.5 coordinate');
console.log(`✓ All ${newGkCount} formations verified with GK y:81.5.`);

console.log('\n======================================================');
console.log('🎉 ALL 9 TEST SUITES PASSED 100% WITH ZERO REGRESSIONS!');
console.log('======================================================\n');
