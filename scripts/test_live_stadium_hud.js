const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: 3D STADIUM & HUD VERIFICATION ===');

// Mock browser environment
globalThis.window = globalThis;
globalThis.document = {
  body: {
    appendChild: (el) => el
  },
  createElement: (tag) => {
    return {
      tagName: tag,
      id: '',
      className: '',
      style: {},
      innerHTML: '',
      children: [],
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      },
      appendChild: function(c) { this.children.push(c); return c; },
      remove: function() {}
    };
  },
  getElementById: (id) => null
};

// Canvas 2D Context Mock
function createContextMock() {
  const calls = [];
  const gradMock = {
    addColorStop: (stop, color) => {
      calls.push({ type: 'addColorStop', stop, color });
    }
  };
  return {
    calls,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowColor: '',
    shadowBlur: 0,
    save: () => calls.push({ type: 'save' }),
    restore: () => calls.push({ type: 'restore' }),
    clearRect: (x, y, w, h) => calls.push({ type: 'clearRect', x, y, w, h }),
    fillRect: (x, y, w, h) => calls.push({ type: 'fillRect', x, y, w, h }),
    strokeRect: (x, y, w, h) => calls.push({ type: 'strokeRect', x, y, w, h }),
    beginPath: () => calls.push({ type: 'beginPath' }),
    closePath: () => calls.push({ type: 'closePath' }),
    moveTo: (x, y) => calls.push({ type: 'moveTo', x, y }),
    lineTo: (x, y) => calls.push({ type: 'lineTo', x, y }),
    arc: (x, y, r, sa, ea) => calls.push({ type: 'arc', x, y, r }),
    ellipse: (x, y, rx, ry, rot, sa, ea) => calls.push({ type: 'ellipse', x, y, rx, ry }),
    quadraticCurveTo: (cpx, cpy, x, y) => calls.push({ type: 'quadraticCurveTo', cpx, cpy, x, y }),
    roundRect: (x, y, w, h, r) => calls.push({ type: 'roundRect', x, y, w, h }),
    fill: () => calls.push({ type: 'fill' }),
    stroke: () => calls.push({ type: 'stroke' }),
    fillText: (text, x, y) => calls.push({ type: 'fillText', text, x, y }),
    setLineDash: (d) => calls.push({ type: 'setLineDash', d }),
    createLinearGradient: (x0, y0, x1, y1) => {
      calls.push({ type: 'createLinearGradient', x0, y0, x1, y1 });
      return gradMock;
    },
    createRadialGradient: (x0, y0, r0, x1, y1, r1) => {
      calls.push({ type: 'createRadialGradient', x0, y0, r0, x1, y1, r1 });
      return gradMock;
    }
  };
}

// 1. Test real_football_engine.js
console.log('\n1. Testing real_football_engine.js...');
require('../js/core/real_football_engine.js');

assert(window.AFM_REAL_FOOTBALL, 'AFM_REAL_FOOTBALL should be exported');
assert(window.AFM_REAL_FOOTBALL.renderer, 'AFM_REAL_FOOTBALL.renderer should be defined');
assert(typeof window.AFM_REAL_FOOTBALL.renderer.draw4SectorsStadium === 'function', 'draw4SectorsStadium should be a function');
assert(typeof window.AFM_REAL_FOOTBALL.renderer.drawRealistic3DGoals === 'function', 'drawRealistic3DGoals should be a function');

console.log('✓ AFM_REAL_FOOTBALL renderer exports verified');

// 2. Test draw4SectorsStadium execution
console.log('\n2. Testing draw4SectorsStadium canvas rendering...');
const ctx4 = createContextMock();
const mockState = {
  home: 'Samambaia',
  away: 'Real Brasília',
  hg: 1,
  ag: 0,
  timeSec: 120,
  renderTicks: 45,
  stadium: {
    name: 'Estádio João Martins',
    capacity: 25000,
    attendance: 4887
  },
  homeKit: { primary: '#facc15', secondary: '#111827' },
  awayKit: { primary: '#0284c7', secondary: '#ffffff' }
};

const projMock = (px, py) => ({ x: 240 + px * 8, y: 190 + py * 3.4 });

window.AFM_REAL_FOOTBALL.renderer.draw4SectorsStadium(ctx4, mockState, projMock);

// Assert advertising boards were drawn
const boardTexts = ctx4.calls.filter(c => c.type === 'fillText').map(c => c.text);
console.log('Rendered text on canvas:', boardTexts);

assert(boardTexts.includes('BRFC27'), 'Should render BRFC27 ad board');
assert(boardTexts.includes('BETANO'), 'Should render BETANO ad board');
assert(boardTexts.includes('CENTRAL DAS PROMOS'), 'Should render CENTRAL DAS PROMOS ad board');
assert(boardTexts.includes('IFOOD'), 'Should render IFOOD ad board');
assert(boardTexts.includes('BYD'), 'Should render BYD ad board');

// Assert crowd flares were drawn
const radialGrads = ctx4.calls.filter(c => c.type === 'createRadialGradient');
console.log('Total radial gradients rendered (flares + floodlights):', radialGrads.length);
assert(radialGrads.length >= 10, 'Should have multiple radial gradients for flares and floodlights');

// Assert 4 corner floodlights were drawn
const floodlights = radialGrads.filter(g => g.r1 === 460);
console.log('Floodlight volumetric light cones count:', floodlights.length);
assert(floodlights.length === 4, 'Should render exactly 4 corner floodlight beams');

console.log('✓ draw4SectorsStadium passed with 4 floodlights, flares, and ad boards!');

// 3. Test drawRealistic3DGoals
console.log('\n3. Testing drawRealistic3DGoals...');
const ctxGoals = createContextMock();
window.AFM_REAL_FOOTBALL.renderer.drawRealistic3DGoals(ctxGoals, projMock);
const goalStrokes = ctxGoals.calls.filter(c => c.type === 'stroke');
assert(goalStrokes.length >= 4, 'Goals should have multiple structural strokes for net and posts');
console.log('✓ drawRealistic3DGoals verified');

// 4. Test js/game.js functions
console.log('\n4. Testing js/game.js live match structure...');
const gameContent = fs.readFileSync('js/game.js', 'utf8');

// Check that drawDugouts has curved acrylic and 7 substitute players
assert(gameContent.includes('// Desenha os Bancos de Reservas com reservas e técnicos (Estrutura 3D Acrílica Realista BRFC27)'), 'drawDugouts should have new header');
assert(gameContent.includes('for(let i = 0; i < 7; i++){'), 'drawDugouts should render 7 seats');
assert(gameContent.includes('Glass Acrylic Canopy'), 'drawDugouts should render glass acrylic canopy');
assert(gameContent.includes('Área Técnica demarcada no gramado'), 'drawDugouts should render technical area');

// Check renderLiveMatchModal
assert(gameContent.includes('class="live-scoreboard-floating"'), 'renderLiveMatchModal should have gold scoreboard card');
assert(gameContent.includes('class="live-sidebar-controls"'), 'renderLiveMatchModal should have unified sidebar controls');
assert(gameContent.includes('id="btnCamLateral"'), 'renderLiveMatchModal should have Lateral camera button');
assert(gameContent.includes('id="btnCamBall"'), 'renderLiveMatchModal should have Ball camera button');
assert(gameContent.includes('id="btnCamGoal"'), 'renderLiveMatchModal should have Goal camera button');
assert(gameContent.includes('id="btnToggle2D3D"'), 'renderLiveMatchModal should have 2D/3D toggle button');
assert(gameContent.includes('class="live-fps-badge"'), 'renderLiveMatchModal should have 60 quadros/s badge');

// Check bindLiveMatchEvents
assert(gameContent.includes('btnCamLat.onclick = () => {'), 'bindLiveMatchEvents should bind btnCamLateral');
assert(gameContent.includes('btnCamBall.onclick = () => {'), 'bindLiveMatchEvents should bind btnCamBall');
assert(gameContent.includes('btnCamGoal.onclick = () => {'), 'bindLiveMatchEvents should bind btnCamGoal');
assert(gameContent.includes('btn2D3D.onclick = () => {'), 'bindLiveMatchEvents should bind btnToggle2D3D');

// Check css/app.css
const cssContent = fs.readFileSync('css/app.css', 'utf8');
assert(cssContent.includes('.live-sidebar-controls'), 'css/app.css should include .live-sidebar-controls');
assert(cssContent.includes('.live-sidebar-play-btn'), 'css/app.css should include .live-sidebar-play-btn');
assert(cssContent.includes('.live-sidebar-tactics-btn'), 'css/app.css should include .live-sidebar-tactics-btn');
assert(cssContent.includes('.live-fps-badge'), 'css/app.css should include .live-fps-badge');

console.log('✓ All checks passed in js/game.js and css/app.css!');

console.log('\n=== ALL 3D STADIUM & HUD TESTS PASSED (100%) ===\n');
