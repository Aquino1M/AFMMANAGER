const assert = require('assert');
const fs = require('fs');

global.window = {};
global.clamp = (n, min, max) => Math.max(min, Math.min(max, n));
eval(fs.readFileSync('js/core/real_football_engine.js', 'utf8'));

const renderer = window.AFM_REAL_FOOTBALL.renderer;
assert.strictEqual(renderer.getStadiumProfile('Real Madrid').id, 'bernabeu');
assert.strictEqual(renderer.getStadiumProfile('Bayern Munich').id, 'allianz-arena');
assert.strictEqual(renderer.getStadiumProfile('FC Bayern München').id, 'allianz-arena');
assert.strictEqual(renderer.getStadiumProfile('Palmeiras').style, 'allianz-parque');
assert.strictEqual(renderer.getStadiumProfile('Sociedade Esportiva Palmeiras').id, 'allianz-parque');
assert.strictEqual(renderer.getStadiumProfile('Sport Club Corinthians Paulista').id, 'neo-quimica');
assert.strictEqual(renderer.getStadiumProfile('Clube de Regatas do Flamengo').id, 'maracana');
assert.strictEqual(renderer.getStadiumProfile('Urawa Reds').id, 'saitama-stadium');
assert.strictEqual(renderer.getStadiumProfile('Al Hilal Saudi Club').id, 'kingdom-arena');
assert.strictEqual(renderer.getStadiumProfile('Al Nassr').id, 'al-awwal-park');
assert.strictEqual(renderer.getStadiumProfile('Clube do Interior').style, 'generic');

const career = renderer.getStadiumProfile('Meu Clube', {
  club: 'Meu Clube', stadiumName: 'Arena Aquino',
  stadiumCustomization: {
    name: 'Arena Aquino', standColor: '#123456', seatColor: '#abcdef',
    accentColor: '#ff00aa', grassColor: '#102030', grassStripeA: '#223344', grassStripeB: '#334455'
  },
  infrastructure: { stadium: { level: 4, capacity: 36000 } },
  stadiumUpgrades: { chairs: true, screen: true }
});
assert.strictEqual(career.id, 'career-stadium');
assert.strictEqual(career.name, 'Arena Aquino');
assert.strictEqual(career.primary, '#123456');
assert.strictEqual(career.grassColor, '#102030');
assert.strictEqual(career.capacity, 36000);
assert.strictEqual(career.upgrades.screen, true);

let fills = [];
let texts = [];
const ctx = {
  createLinearGradient: () => ({ addColorStop() {} }),
  createRadialGradient: () => ({ addColorStop() {} }),
  save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, closePath() {},
  fill() {}, stroke() {}, arc() {}, ellipse() {}, translate() {}, scale() {},
  fillRect(x,y,w,h) { fills.push([x,y,w,h,this.fillStyle]); }, strokeRect() {},
  fillText(txt) { texts.push(String(txt)); },
  set fillStyle(v) { this._fillStyle = v; }, get fillStyle() { return this._fillStyle; },
  set strokeStyle(v) { this._strokeStyle = v; }, get strokeStyle() { return this._strokeStyle; },
  set lineWidth(v) { this._lineWidth = v; }, set font(v) {}, set textAlign(v) {}, set textBaseline(v) {},
  set globalAlpha(v) {}
};
const liveState = {
  home: 'Meu Clube', away: 'Outro Clube', renderTicks: 5,
  homeKit: { primary: '#123456', secondary: '#ffffff' },
  stadium: { profile: career, customization: career.customization, capacity: career.capacity, attendance: 25000, upgrades: career.upgrades }
};
renderer.draw4SectorsStadium(ctx, liveState, () => ({ x: 0, y: 0 }));
assert.strictEqual(liveState.stadium.renderStyle, 'career');
assert.strictEqual(liveState.stadium.colors.grass, '#102030');
assert.ok(texts.includes('Arena Aquino'), 'Career stadium should show the saved stadium name');
assert.ok(fills.some(fill => fill[4] === '#123456'), 'Career stadium should use the saved stand color');

const genericState = {
  home: 'Clube do Interior', away: 'Meu Clube', renderTicks: 1,
  homeKit: { primary: '#ff0000', secondary: '#ffffff' },
  stadium: { profile: renderer.getStadiumProfile('Clube do Interior'), capacity: 10000, attendance: 5000, upgrades: {} }
};
renderer.draw4SectorsStadium(ctx, genericState, () => ({ x: 0, y: 0 }));
assert.strictEqual(genericState.stadium.renderStyle, 'generic');
assert.ok(texts.includes('ESTÁDIO MUNICIPAL'), 'Generic stadium should use neutral boards');

console.log('Match stadium profile tests passed: real profiles, generic fallback, career customization and canvas rendering.');
