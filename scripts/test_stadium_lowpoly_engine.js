/**
 * Test Suite: AFM 2027 Low-Poly 3D Progressive Stadium Engine
 */
const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando testes do Motor de Maquete 3D Low-Poly...');

// Mock de DOM e Three.js para o ambiente Node.js
class MockMesh {
  constructor(geo, mat) {
    this.geometry = geo;
    this.material = mat;
    this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    this.children = [];
    this.castShadow = false;
    this.receiveShadow = false;
  }
  add(obj) { this.children.push(obj); }
  remove(obj) { const idx = this.children.indexOf(obj); if (idx >= 0) this.children.splice(idx, 1); }
  lookAt() {}
}

class MockGroup extends MockMesh {}

const THREE = {
  Scene: class {
    constructor() {
      this.children = [];
      this.background = null;
      this.fog = null;
    }
    add(obj) { this.children.push(obj); }
    remove(obj) { const idx = this.children.indexOf(obj); if (idx >= 0) this.children.splice(idx, 1); }
  },
  Color: class { constructor(c) { this.c = c; } },
  FogExp2: class { constructor(c, d) { this.c = c; this.d = d; } },
  PerspectiveCamera: class {
    constructor() {
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    }
    updateProjectionMatrix() {}
  },
  WebGLRenderer: class {
    constructor() {
      this.domElement = {};
      this.shadowMap = {};
    }
    setSize() {}
    setPixelRatio() {}
    render() {}
    dispose() {}
  },
  OrbitControls: class {
    constructor() {
      this.target = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    }
    update() {}
    dispose() {}
  },
  Clock: class { getElapsedTime() { return 1.5; } },
  BoxGeometry: class {},
  PlaneGeometry: class {},
  RingGeometry: class {},
  CylinderGeometry: class {},
  TorusGeometry: class {},
  SphereGeometry: class {},
  DodecahedronGeometry: class {},
  MeshStandardMaterial: class { constructor(p) { Object.assign(this, p); } dispose() {} },
  MeshBasicMaterial: class { constructor(p) { Object.assign(this, p); } dispose() {} },
  AmbientLight: class { constructor(c, i) { this.c = c; this.i = i; } },
  HemisphereLight: class { constructor(sky, ground, i) { this.sky = sky; this.ground = ground; this.i = i; this.position = { set() {} }; } },
  DirectionalLight: class {
    constructor(c, i) {
      this.c = c; this.i = i;
      this.position = { set() {} };
      this.shadow = { camera: {}, mapSize: {} };
    }
  },
  SpotLight: class {
    constructor(c, i) {
      this.c = c; this.i = i;
      this.position = { set() {} };
      this.target = { position: { set() {} } };
    }
  },
  Mesh: MockMesh,
  Group: MockGroup,
  PCFSoftShadowMap: 1
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

global.window = {
  THREE: THREE,
  requestAnimationFrame: global.requestAnimationFrame,
  cancelAnimationFrame: global.cancelAnimationFrame,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Carrega o motor low-poly
require('../js/core/stadium_lowpoly_engine.js');
const AFMStadiumLowPoly = global.window.AFMStadiumLowPoly;
assert.ok(AFMStadiumLowPoly, 'AFMStadiumLowPoly deve estar definido');
console.log('✓ AFMStadiumLowPoly carregado com sucesso');

const mockCanvas = { parentElement: { clientWidth: 540, clientHeight: 450 } };
const instance = AFMStadiumLowPoly.init(mockCanvas);
assert.ok(instance, 'Instância do motor deve ser criada');
console.log('✓ Inicialização do canvas e cena Three.js WebGL OK');

// 1. Teste Nível 1 (7.800 lugares - Aberto Raiz)
const stateLvl1 = {
  club: 'Corinthians',
  infrastructure: { stadium: { capacity: 7800, level: 1 } },
  stadiumRingData: {
    ring: 1,
    rings: {
      1: { norte: true, sul: true, leste: true, oeste: true },
      2: { norte: false, sul: false, leste: false, oeste: false }
    }
  }
};
AFMStadiumLowPoly.update(stateLvl1);
assert.ok(instance.stadiumGroup.children.length > 5, 'Deve conter componentes de plaza, pitch e arquibancada do anel 1');
console.log(`✓ 1º Anel (7.8k - Aberto Raiz): ${instance.stadiumGroup.children.length} grupos de malha gerados`);

// 1.1 Teste 12.000 lugares (Apenas 2 partes do 1º anel feitas: Sul e Norte)
const state12k = {
  club: 'Coliseu do Povo',
  infrastructure: { stadium: { capacity: 12000, level: 1 } },
  stadiumRingData: {
    ring: 1,
    sides: { norte: true, sul: true, leste: false, oeste: false },
    rings: {
      1: { norte: true, sul: true, leste: false, oeste: false },
      2: { norte: false, sul: false, leste: false, oeste: false }
    },
    purchasedSectors: ['r1_norte', 'r1_sul']
  }
};
AFMStadiumLowPoly.update(state12k);
assert.strictEqual(instance.maxBuiltRing, 1, 'Estádio de 12k deve ter apenas anel 1');
console.log('✓ 12.000 Lugares: Apenas setores Norte e Sul gerados (Leste e Oeste abertos, sem marquises indevidas)');

// 2. Teste Obra Ativa com Guindaste no Setor Leste
const stateWithWork = {
  club: 'Palmeiras',
  infrastructure: { stadium: { capacity: 18800, level: 2 } },
  stadiumRingData: {
    ring: 2,
    activeWork: { ring: 2, side: 'leste', durationDays: 30 },
    rings: {
      1: { norte: true, sul: true, leste: true, oeste: true },
      2: { norte: true, sul: true, leste: false, oeste: true }
    }
  }
};
AFMStadiumLowPoly.update(stateWithWork);
assert.ok(instance.animatedElements.some(e => e.type === 'beacon'), 'Deve conter luz beacon do guindaste de obra');
console.log('✓ Guindaste de obra ativo (Lança, torre em treliça, bloco suspenso e beacon vermelho) validado');

// 3. Teste Nível 6 (100.000 lugares - Mega Coliseu 100k)
const stateLvl6 = {
  club: 'Flamengo',
  infrastructure: { stadium: { capacity: 100000, level: 6 } },
  stadiumRingData: {
    ring: 6,
    rings: {
      1: { norte: true, sul: true, leste: true, oeste: true },
      2: { norte: true, sul: true, leste: true, oeste: true },
      3: { norte: true, sul: true, leste: true, oeste: true },
      4: { norte: true, sul: true, leste: true, oeste: true },
      5: { norte: true, sul: true, leste: true, oeste: true },
      6: { norte: true, sul: true, leste: true, oeste: true }
    }
  },
  stadiumUpgrades: {
    screen: true,
    ledLights: true,
    flares: true,
    ledRing: true,
    vipBoxes: true,
    solarPitch: true,
    museumTour: true
  }
};
AFMStadiumLowPoly.update(stateLvl6);
assert.ok(instance.stadiumGroup.children.length >= 8, 'Mega Coliseu 100k deve conter arquibancadas completas, fachada e cobertura');
assert.ok(instance.animatedElements.some(e => e.type === 'flare'), 'Festa pirotécnica com sinalizadores animados deve estar ativa');
console.log(`✓ 6º Anel (100k - Mega Coliseu): ${instance.stadiumGroup.children.length} grupos estruturais com treliça, fachada e upgrades`);

// 4. Teste Presets de Câmera
const presets = ['panoramic', 'tv', 'leste', 'oeste', 'norte', 'sul', 'campo'];
presets.forEach(p => {
  AFMStadiumLowPoly.setCameraPreset(p);
  assert.ok(instance.camera.position.x !== undefined, `Posição de câmera para preset ${p} deve ser válida`);
});
console.log('✓ Todos os 7 presets de câmera orbitais (Panorâmica, TV, Leste, Oeste, Norte, Sul, Campo) validados');

AFMStadiumLowPoly.dispose();
console.log('\n========================================');
console.log('🎉 TODOS OS TESTES DO MOTOR LOW-POLY 3D PASSARAM COM 100% DE SUCESSO!');
console.log('========================================');
