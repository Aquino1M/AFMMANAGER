const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: 3D STADIUM & HUD VERIFICATION ===');

// 1. Test real_football_engine.js exports
console.log('\n1. Testing real_football_engine.js...');
const engineContent = fs.readFileSync('js/core/real_football_engine.js', 'utf8');

// Mock window and global objects for headless testing
global.window = {};
global.Math = Math;
global.clamp = (n, min, max) => Math.max(min, Math.min(max, n));

eval(engineContent);

assert(window.AFM_REAL_FOOTBALL, 'AFM_REAL_FOOTBALL must be defined on window');
assert(window.AFM_REAL_FOOTBALL.renderer, 'AFM_REAL_FOOTBALL.renderer must be defined');
assert(typeof window.AFM_REAL_FOOTBALL.renderer.draw4SectorsStadium === 'function', 'draw4SectorsStadium must be a function');
assert(typeof window.AFM_REAL_FOOTBALL.renderer.drawRealistic3DGoals === 'function', 'drawRealistic3DGoals must be a function');
assert(typeof window.AFM_REAL_FOOTBALL.renderer.applyTvBroadcastCamera === 'function', 'applyTvBroadcastCamera must be a function');
console.log('✓ AFM_REAL_FOOTBALL renderer exports verified');

// 2. Test draw4SectorsStadium execution
console.log('\n2. Testing draw4SectorsStadium canvas rendering...');
let renderedTexts = [];
let drawnGradients = 0;
let floodlightTowers = 0;

const mockCtx = {
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => {
    drawnGradients++;
    return { addColorStop: () => {} };
  },
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  quadraticCurveTo: () => {},
  closePath: () => {},
  fill: () => {},
  stroke: () => {},
  fillRect: (x, y, w, h) => {
    if (w === 8 && h === 90) floodlightTowers++;
  },
  strokeRect: () => {},
  arc: () => {},
  ellipse: () => {},
  save: () => {},
  restore: () => {},
  fillText: (txt) => {
    renderedTexts.push(txt);
  },
  roundRect: () => {},
  font: '',
  textAlign: '',
  textBaseline: ''
};

const mockState = {
  stadium: {
    level: 3,
    capacity: 45000,
    attendance: 42000,
    upgrades: {
      screen: true,
      ledRing: true,
      mosaic: true,
      chairs: true,
      ledLights: true,
      flares: true
    }
  },
  home: 'Criciúma',
  away: 'Barra-SC',
  hg: 2,
  ag: 1,
  timeSec: 3600,
  renderTicks: 45,
  homeKit: { primary: '#facc15', secondary: '#000000' },
  awayKit: { primary: '#15803d', secondary: '#ffffff' }
};

const mockProj = (px, py) => ({ x: 640 + (px - 50) * 10, y: 360 + (py - 50) * 5 });

window.AFM_REAL_FOOTBALL.renderer.draw4SectorsStadium(mockCtx, mockState, mockProj);

console.log('Rendered text on canvas:', renderedTexts);
console.log('Total radial gradients rendered (flares + floodlights):', drawnGradients);
console.log('Floodlight volumetric light cones count:', floodlightTowers);

assert(floodlightTowers === 4, 'Must render exactly 4 3D floodlight towers');
assert(renderedTexts.includes('ESTÁDIO MUNICIPAL'), 'Generic opponent stadium must use neutral municipal boards');
assert(!renderedTexts.includes('BRFC27'), 'Generic opponent stadium must not inherit branded career boards');
assert(drawnGradients >= 15, 'Must render multiple flare and floodlight radial gradients');
console.log('✓ draw4SectorsStadium passed with 4 floodlights, flares, and ad boards!');

// 3. Test drawRealistic3DGoals
console.log('\n3. Testing drawRealistic3DGoals...');
let strokeCount = 0;
let fillCount = 0;
const mockGoalCtx = {
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  fill: () => { fillCount++; },
  stroke: () => { strokeCount++; },
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  shadowColor: '',
  shadowBlur: 0
};

window.AFM_REAL_FOOTBALL.renderer.drawRealistic3DGoals(mockGoalCtx, mockProj);
assert(strokeCount >= 8, 'Must draw goalposts, crossbar, and net mesh with stroke calls');
assert(fillCount >= 2, 'Must fill net translucent mesh');
console.log('✓ drawRealistic3DGoals verified');

// 4. Test js/game.js live match structure
console.log('\n4. Testing js/game.js live match structure...');
const gameContent = fs.readFileSync('js/game.js', 'utf8');

// Check that drawDugouts has curved acrylic and 7 substitute players
assert(gameContent.includes('// Desenha os Bancos de Reservas com reservas e técnicos (Estrutura 3D Acrílica Realista BRFC27)'), 'drawDugouts should have new header');
assert(gameContent.includes('for(let i = 0; i < 7; i++){'), 'drawDugouts should render 7 seats');
assert(gameContent.includes('Glass Acrylic Canopy'), 'drawDugouts should render glass acrylic canopy');
assert(gameContent.includes('Área Técnica demarcada no gramado'), 'drawDugouts should render technical area');

// Check renderLiveMatchModal
assert(gameContent.includes('class="live-scoreboard-floating"'), 'renderLiveMatchModal should have floating scoreboard');
assert(gameContent.includes('class="live-bottom-dock"'), 'renderLiveMatchModal should have bottom dock');
assert(gameContent.includes('class="live-dock-controls"'), 'renderLiveMatchModal should have dock controls');
assert(gameContent.includes('id="btnCamLateral"'), 'renderLiveMatchModal should have Lateral camera button');
assert(gameContent.includes('id="btnCamBall"'), 'renderLiveMatchModal should have Ball camera button');
assert(gameContent.includes('id="btnCamGoal"'), 'renderLiveMatchModal should have Goal camera button');
assert(gameContent.includes('id="btnToggle2D3D"'), 'renderLiveMatchModal should have 2D/3D toggle button');
assert(gameContent.includes('id="liveMatchCanvas"'), 'renderLiveMatchModal should have liveMatchCanvas');

// Check bindLiveMatchEvents
assert(gameContent.includes('btnCamLat.onclick = () => {'), 'bindLiveMatchEvents should bind btnCamLateral');
assert(gameContent.includes('btnCamBall.onclick = () => {'), 'bindLiveMatchEvents should bind btnCamBall');
assert(gameContent.includes('btnCamGoal.onclick = () => {'), 'bindLiveMatchEvents should bind btnCamGoal');
assert(gameContent.includes('btn2D3D.onclick = () => {'), 'bindLiveMatchEvents should bind btnToggle2D3D');

// Check css/app.css
const cssContent = fs.readFileSync('css/app.css', 'utf8');
assert(cssContent.includes('.live-canvas-area'), 'css/app.css should include .live-canvas-area');
assert(cssContent.includes('.live-match-canvas'), 'css/app.css should include .live-match-canvas');
assert(!cssContent.includes('.live-sidebar-controls'), 'css/app.css should not have cluttered .live-sidebar-controls');

console.log('✓ All checks passed in js/game.js and css/app.css!');

console.log('\n=== ALL 3D STADIUM & HUD TESTS PASSED (100%) ===\n');
