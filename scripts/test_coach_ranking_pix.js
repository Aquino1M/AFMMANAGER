const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: COACH RANKING & PIX R$ 1.000 SYSTEM ===');

// Mock browser globals
globalThis.window = globalThis;
globalThis.localStorage = {
  _store: {},
  getItem: function(key) { return this._store[key] || null; },
  setItem: function(key, val) { this._store[key] = String(val); },
  removeItem: function(key) { delete this._store[key]; },
  clear: function() { this._store = {}; }
};
globalThis.esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
globalThis.fmtMoney = (n) => 'R$ ' + Number(n || 0).toLocaleString('pt-BR');
globalThis.clubBadge = (name, size) => `<img src="badge-${size}.png" alt="${name}" />`;
globalThis.norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// 1. Load coach_ranking_pix.js
console.log('\n1. Testing coach_ranking_pix.js module loading...');
require('../js/systems/coach_ranking_pix.js');

assert(window.AFM_CoachRanking, 'AFM_CoachRanking should be defined on window');
assert(typeof window.rankingPage === 'function', 'window.rankingPage should be a function');
console.log('✓ AFM_CoachRanking successfully loaded and exposed');

// 2. Test Prestige Tiers
console.log('\n2. Testing Prestige Tiers (Selos de Prestígio)...');
const t1 = window.AFM_CoachRanking.getPrestigeTier(15000);
assert.strictEqual(t1.id, 'lenda', '15000 pts should be Lenda');
assert.strictEqual(t1.icon, '👑', 'Lenda should have crown icon');

const t2 = window.AFM_CoachRanking.getPrestigeTier(7500);
assert.strictEqual(t2.id, 'estrategista', '7500 pts should be Estrategista');

const t3 = window.AFM_CoachRanking.getPrestigeTier(3200);
assert.strictEqual(t3.id, 'professor', '3200 pts should be Professor');

const t4 = window.AFM_CoachRanking.getPrestigeTier(1200);
assert.strictEqual(t4.id, 'efetivado', '1200 pts should be Efetivado');

const t5 = window.AFM_CoachRanking.getPrestigeTier(450);
assert.strictEqual(t5.id, 'interino', '450 pts should be Interino');

const t6 = window.AFM_CoachRanking.getPrestigeTier(50);
assert.strictEqual(t6.id, 'estagiario', '50 pts should be Estagiário');
console.log('✓ All 6 prestige tiers verified correctly');

// 3. Test PIX Prizes (R$ 1.000 total split into TOP 5)
console.log('\n3. Testing PIX Prizes (R$ 1.000,00 split into TOP 5)...');
const p1 = window.AFM_CoachRanking.getPixPrize(1);
const p2 = window.AFM_CoachRanking.getPixPrize(2);
const p3 = window.AFM_CoachRanking.getPixPrize(3);
const p4 = window.AFM_CoachRanking.getPixPrize(4);
const p5 = window.AFM_CoachRanking.getPixPrize(5);
const p6 = window.AFM_CoachRanking.getPixPrize(6);

assert.strictEqual(p1.value, 450, '1st place should receive R$ 450');
assert.strictEqual(p2.value, 250, '2nd place should receive R$ 250');
assert.strictEqual(p3.value, 150, '3rd place should receive R$ 150');
assert.strictEqual(p4.value, 100, '4th place should receive R$ 100');
assert.strictEqual(p5.value, 50, '5th place should receive R$ 50');
assert.strictEqual(p6, null, '6th place should not receive prize');

const sumPrizes = p1.value + p2.value + p3.value + p4.value + p5.value;
assert.strictEqual(sumPrizes, 1000, 'Sum of Top 5 prizes must equal exactly R$ 1.000,00');
console.log(`✓ PIX prizes verified: 1º=${p1.label}, 2º=${p2.label}, 3º=${p3.label}, 4º=${p4.label}, 5º=${p5.label} (Total: R$ ${sumPrizes},00)`);

// 4. Test User PIX Key Management
console.log('\n4. Testing User PIX Key Management...');
assert.strictEqual(window.AFM_CoachRanking.getUserPixKey(), null, 'Initially should have no key');
const saved = window.AFM_CoachRanking.setUserPixKey('cpf', '123.456.789-00');
assert.strictEqual(saved.type, 'cpf');
assert.strictEqual(saved.key, '123.456.789-00');
const retrieved = window.AFM_CoachRanking.getUserPixKey();
assert.strictEqual(retrieved.key, '123.456.789-00');
console.log('✓ User PIX key save and retrieve passed');

// 5. Test Leaderboard Generation & User Synchronization
console.log('\n5. Testing Leaderboard Generation...');
const mockState = {
  club: 'Criciúma',
  manager: 'Aquino Treinador',
  managerPersonal: {
    careerPoints: 6800
  },
  history: [
    { h: 'Criciúma', a: 'Joinville', hg: 2, ag: 0 },
    { h: 'Avaí', a: 'Criciúma', hg: 1, ag: 2 }
  ],
  titles: ['Catarinense 2026']
};

const boardSemana = window.AFM_CoachRanking.getLeaderboard('semana', mockState);
assert(boardSemana.length >= 20, 'Should have at least 20 coaches in leaderboard');
const userEntry = boardSemana.find(c => c.isUser);
assert(userEntry, 'User entry should be in leaderboard');
assert.strictEqual(userEntry.club, 'Criciúma', 'User club should match state.club');
assert(userEntry.rank > 0, 'User should have a valid rank');
console.log(`✓ Leaderboard generated with ${boardSemana.length} coaches. User rank: #${userEntry.rank} (${userEntry.points} pts)`);

// 6. Test Match Points Awarding
console.log('\n6. Testing Match Points Awarding...');
const ptsGainedWin = window.AFM_CoachRanking.onMatchFinished(mockState, {
  h: 'Criciúma',
  a: 'Chapecoense',
  hg: 3,
  ag: 1,
  isDerby: true
});
assert(ptsGainedWin >= 50, 'Derby win should award at least 50 pts (30 win + 20 derby)');
console.log(`✓ Match finished points awarded: +${ptsGainedWin} pts`);

// 7. Test HTML Rendering
console.log('\n7. Testing Ranking Page HTML Rendering...');
window.state = mockState;
const html = window.AFM_CoachRanking.renderPage();

assert(html.includes('RANKING DE TÉCNICOS'), 'HTML should contain title');
assert(html.includes('R$ 1.000,00 NO PIX PARA O TOP 5'), 'HTML should contain PIX prize banner');
assert(html.includes('R$ 450,00'), 'HTML should display 1st place prize');
assert(html.includes('R$ 250,00'), 'HTML should display 2nd place prize');
assert(html.includes('R$ 150,00'), 'HTML should display 3rd place prize');
assert(html.includes('R$ 100,00'), 'HTML should display 4th place prize');
assert(html.includes('R$ 50,00'), 'HTML should display 5th place prize');
assert(html.includes('👑 LÍDER DO BRASIL'), 'HTML should contain leader crown');
assert(html.includes('CENSO DOS TÉCNICOS'), 'HTML should contain coach census sidebar');
assert(html.includes('COMO PONTUA'), 'HTML should contain scoring guide');
assert(html.includes('SELOS DE PRESTÍGIO'), 'HTML should contain prestige tiers guide');
assert(html.includes('afm-tab-btn'), 'HTML should contain tabs for Semana, Temporada, Carreira');
console.log('✓ Ranking Page HTML structure verified completely');

// 8. Test Integration into index.html, js/game.js, and css/app.css
console.log('\n8. Verifying codebase integrations...');
const indexContent = fs.readFileSync('index.html', 'utf8');
assert(indexContent.includes('js/systems/coach_ranking_pix.js'), 'index.html must load coach_ranking_pix.js');

const gameContent = fs.readFileSync('js/game.js', 'utf8');
assert(gameContent.includes("['ranking','👑 Ranking & PIX R$ 1.000']"), 'js/game.js drawer nav must include ranking');
assert(gameContent.includes('data-view="ranking"'), 'js/game.js must have data-view="ranking"');
assert(gameContent.includes('ranking:'), 'js/game.js page() router must have ranking:');
assert(gameContent.includes('btnTopPrestige'), 'js/game.js bind() must link top prestige badge');
assert(gameContent.includes('AFM_CoachRanking.onMatchFinished'), 'js/game.js finalizeRound must call AFM_CoachRanking.onMatchFinished');

const cssContent = fs.readFileSync('css/app.css', 'utf8');
assert(cssContent.includes('.afm-ranking-page'), 'css/app.css must contain .afm-ranking-page');
assert(cssContent.includes('.afm-podium-card'), 'css/app.css must contain .afm-podium-card');
assert(cssContent.includes('.sm-ribbon-pix'), 'css/app.css must contain .sm-ribbon-pix');

console.log('✓ All files and connections in index.html, js/game.js, and css/app.css verified 100%');

console.log('\n=== ALL COACH RANKING & PIX PRIZE TESTS PASSED (100%) ===\n');
