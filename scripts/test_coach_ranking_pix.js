const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: COACH RANKING & PIX R$ 1.000 SYSTEM ===');

// 1. Test coach_ranking_pix.js module loading and exposed methods
console.log('\n1. Testing coach_ranking_pix.js module loading...');
const code = fs.readFileSync('js/systems/coach_ranking_pix.js', 'utf8');

// Mock browser global environment
global.window = {};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};
global.esc = (s) => String(s ?? '');
global.clamp = (n, a, b) => Math.max(a, Math.min(b, n));

eval(code);

assert(window.AFM_CoachRanking, 'AFM_CoachRanking should be defined on window');
assert(typeof window.AFM_CoachRanking.getPrestigeTier === 'function', 'getPrestigeTier must be a function');
assert(typeof window.AFM_CoachRanking.getPixPrize === 'function', 'getPixPrize must be a function');
assert(typeof window.AFM_CoachRanking.getLeaderboard === 'function', 'getLeaderboard must be a function');
assert(typeof window.AFM_CoachRanking.renderPage === 'function', 'renderPage must be a function');
assert(typeof window.AFM_CoachRanking.setUserPixKey === 'function', 'setUserPixKey must be a function');
assert(typeof window.AFM_CoachRanking.getUserPixKey === 'function', 'getUserPixKey must be a function');
assert(typeof window.AFM_CoachRanking.onMatchFinished === 'function', 'onMatchFinished must be a function');
console.log('✓ AFM_CoachRanking successfully loaded and exposed');

// 2. Test Prestige Tiers
console.log('\n2. Testing Prestige Tiers (Selos de Prestígio)...');
const t1 = window.AFM_CoachRanking.getPrestigeTier(500);
assert(t1.label === 'Interino', 'Tier at 500 must be Interino');

const t2 = window.AFM_CoachRanking.getPrestigeTier(1500);
assert(t2.label === 'Efetivado', 'Tier at 1500 must be Efetivado');

const t3 = window.AFM_CoachRanking.getPrestigeTier(3000);
assert(t3.label === 'Professor', 'Tier at 3000 must be Professor');

const t4 = window.AFM_CoachRanking.getPrestigeTier(6000);
assert(t4.label === 'Estrategista', 'Tier at 6000 must be Estrategista');

const t5 = window.AFM_CoachRanking.getPrestigeTier(12000);
assert(t5.label === 'Lenda', 'Tier at 12000 must be Lenda');
console.log('✓ All prestige tiers verified correctly');

// 3. Test PIX Prizes (Split for Top 5)
console.log('\n3. Testing PIX Prizes (R$ 1.000,00 split into TOP 5)...');
const p1 = window.AFM_CoachRanking.getPixPrize(1);
const p2 = window.AFM_CoachRanking.getPixPrize(2);
const p3 = window.AFM_CoachRanking.getPixPrize(3);
const p4 = window.AFM_CoachRanking.getPixPrize(4);
const p5 = window.AFM_CoachRanking.getPixPrize(5);
assert(p1.value === 450, '1st place must get R$ 450');
assert(p2.value === 250, '2nd place must get R$ 250');
assert(p3.value === 150, '3rd place must get R$ 150');
assert(p4.value === 100, '4th place must get R$ 100');
assert(p5.value === 50, '5th place must get R$ 50');
const totalPix = p1.value + p2.value + p3.value + p4.value + p5.value;
assert(totalPix === 1000, 'Total prize pool must be exactly R$ 1.000,00');
console.log('✓ PIX prizes verified: 1º=R$ 450,00, 2º=R$ 250,00, 3º=R$ 150,00, 4º=R$ 100,00, 5º=R$ 50,00 (Total: R$ 1000,00)');

// 4. Test User PIX Key Management
console.log('\n4. Testing User PIX Key Management...');
const saved = window.AFM_CoachRanking.setUserPixKey('EMAIL', 'aquino.treinador@pix.com.br');
assert(Boolean(saved), 'Save PIX key must return saved data');
const retrieved = window.AFM_CoachRanking.getUserPixKey();
assert(retrieved.key === 'aquino.treinador@pix.com.br', 'Retrieved key must match');
assert(retrieved.type === 'email', 'Retrieved type must match');
console.log('✓ User PIX key save and retrieve passed');

// 5. Test Leaderboard Generation and User Placement
console.log('\n5. Testing Leaderboard Generation...');
const mockState = {
  club: 'Criciúma',
  manager: 'Prof. Aquino',
  season: 2026,
  titles: ['Campeonato Catarinense 2026'],
  history: [
    { winner: 'Criciúma', h: 'Criciúma', a: 'Joinville', hg: 3, ag: 0 },
    { winner: 'Criciúma', h: 'Chapecoense', a: 'Criciúma', hg: 1, ag: 2 }
  ]
};

const leaderboard = window.AFM_CoachRanking.getLeaderboard('career', mockState);
assert(Array.isArray(leaderboard), 'Leaderboard must be an array');
assert(leaderboard.length > 20, 'Leaderboard must have at least 20 coaches');
console.log(`✓ Leaderboard generated with ${leaderboard.length} coaches.`);

// 6. Test onMatchFinished Awarding
console.log('\n6. Testing Match Points Awarding...');
const ptsAwarded = window.AFM_CoachRanking.onMatchFinished(mockState, {
  h: 'Criciúma',
  a: 'Joinville',
  hg: 4,
  ag: 0
});
assert(ptsAwarded > 0, 'Points awarded must be positive');
assert(mockState.managerPersonal.careerPoints >= ptsAwarded, 'Manager career points must increase');
console.log(`✓ Match finished points awarded: +${ptsAwarded} pts`);

// 7. Test renderPage HTML
console.log('\n7. Testing Ranking Page HTML Rendering...');
global.state = mockState;
const html = window.AFM_CoachRanking.renderPage(mockState);
assert(html.includes('afm-ranking-page'), 'HTML must contain afm-ranking-page container');
assert(html.includes('R$ 1.000,00 NO PIX'), 'HTML must display PIX R$ 1.000 prize banner');
assert(html.includes('Prof. Aquino'), 'HTML must contain user coach name');
assert(html.includes('1º LUGAR'), 'HTML must show 1st place in podium');
assert(html.includes('2º LUGAR'), 'HTML must show 2nd place in podium');
assert(html.includes('3º LUGAR'), 'HTML must show 3rd place in podium');
assert(html.includes('afm-ranking-list-section'), 'HTML must show full table');
console.log('✓ Ranking Page HTML structure verified completely');

// 8. Test codebase integration files
console.log('\n8. Verifying codebase integrations...');
const indexContent = fs.readFileSync('index.html', 'utf8');
assert(indexContent.includes('js/systems/coach_ranking_pix.js'), 'index.html must load coach_ranking_pix.js');

const gameContent = fs.readFileSync('js/game.js', 'utf8');
assert(gameContent.includes('btnNavGoRanking'), 'js/game.js must include btnNavGoRanking on landing page');
assert(gameContent.includes('ranking:'), 'js/game.js page() router must have ranking:');
assert(gameContent.includes('AFM_CoachRanking.onMatchFinished'), 'js/game.js finalizeRound must call AFM_CoachRanking.onMatchFinished');

const cssContent = fs.readFileSync('css/app.css', 'utf8');
assert(cssContent.includes('.afm-ranking-page'), 'css/app.css must contain .afm-ranking-page');
assert(cssContent.includes('.afm-podium-card'), 'css/app.css must contain .afm-podium-card');
assert(cssContent.includes('.sm-ribbon-pix'), 'css/app.css must contain .sm-ribbon-pix');

console.log('✓ All files and connections in index.html, js/game.js, and css/app.css verified 100%');

console.log('\n=== ALL COACH RANKING & PIX PRIZE TESTS PASSED (100%) ===\n');
