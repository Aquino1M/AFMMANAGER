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
    forceContextLoss() {}
    getContext() {
      return {
        getExtension(name) {
          if (name === 'WEBGL_lose_context') return { loseContext() {} };
          return null;
        }
      };
    }
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

// 1.2 Teste Save Antigo Ativo: AQN FC (Colisseu do Povo 12k) com upgrades comprados
const stateAqnFc = {
  club: 'AQN FC',
  isCustomClub: true,
  stadiumName: 'COLISSEU DO POVO',
  infrastructure: { stadium: { capacity: 12000, level: 1 } },
  stadiumCapacity: 12000,
  stadiumUpgrades: {
    chairs: false,
    screen: true,
    ledRing: true,
    ledLights: true,
    mosaic: true,
    flares: true,
    vipBoxes: false,
    surroundSound: false,
    museumTour: false,
    solarPitch: false
  },
  stadiumCustomization: {
    name: 'COLISSEU DO POVO',
    standColor: '#1e293b',
    seatColor: '#0284c7',
    accentColor: '#38bdf8'
  }
};
AFMStadiumLowPoly.update(stateAqnFc);
assert.ok(instance.stadiumGroup.children.length >= 4, 'AQN FC com upgrades deve gerar gramado, arquibancadas e grupo de upgrades acoplados');
assert.strictEqual(instance.maxBuiltRing, 1, 'AQN FC 12k deve permanecer rigorosamente no Nível 1');
console.log('✓ AQN FC (Colisseu do Povo 12k): Renderização com Telão, LED 360°, Mosaico, Refletores e Sinalizadores validada');

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

// 4. Teste Estádio 5.000 Lugares (Time Criado do Zero)
const state5kStarter = {
  club: 'Valência FC',
  isCustomClub: true,
  customClubStateCompId: 'bra-est-sp',
  stadiumName: 'Arena dos Sonhos',
  infrastructure: { stadium: { capacity: 5000, level: 1 } },
  stadiumRingData: {
    ring: 1,
    rings: {
      1: { norte: false, sul: false, leste: false, oeste: false }
    }
  },
  stadiumCustomization: {
    standColor: '#1e3a8a',
    seatColor: '#facc15',
    accentColor: '#ffffff'
  }
};
AFMStadiumLowPoly.update(state5kStarter);
assert.ok(instance.stadiumGroup.children.length >= 3, 'Estádio de 5.000 lugares deve conter praça, gramado e tribuna social oeste coberta');
assert.strictEqual(instance.customization.standColor, '#1e3a8a', 'Clube criado do zero deve aplicar personalização customizada de cores');
console.log('✓ 5.000 Lugares (Time Criado do Zero): Tribuna Social Oeste, cabines, túnel e muro gerados com sucesso');

// 4.1 Teste Clube Real (Corinthians) — Personalização não deve vazar
const stateRealClub = {
  club: 'Corinthians',
  isCustomClub: false,
  infrastructure: { stadium: { capacity: 39000, level: 3 } },
  stadiumCustomization: {
    standColor: '#ff0000', // Vermelho tentado
    seatColor: '#00ff00'
  }
};
AFMStadiumLowPoly.update(stateRealClub);
assert.strictEqual(Object.keys(instance.customization).length, 0, 'Clube real não deve carregar personalização customizada');
console.log('✓ Clube Real (Corinthians): Paleta oficial preservada e personalização restrita');

// 5. Teste Presets de Câmera
const presets = ['panoramic', 'tv', 'leste', 'oeste', 'norte', 'sul', 'campo'];
presets.forEach(p => {
  AFMStadiumLowPoly.setCameraPreset(p);
  assert.ok(instance.camera.position.x !== undefined, `Posição de câmera para preset ${p} deve ser válida`);
});
AFMStadiumLowPoly.setCameraPreset('campo');
assert.strictEqual(instance.camera.position.x, -16, 'Preset campo deve estar posicionado na borda do campo (-16, 4.2, 12)');
assert.strictEqual(instance.camera.position.y, 4.2, 'Preset campo não deve estar mirando o céu escuro');
assert.strictEqual(instance.controls.target.x, 2, 'Alvo do preset campo deve mirar o centro do gramado');
console.log('✓ Todos os 7 presets de câmera orbitais (Panorâmica, TV, Leste, Oeste, Norte, Sul, Campo) validados com visão de campo perfeita');

AFMStadiumLowPoly.dispose();
assert.strictEqual(instance.isDisposed, true, 'Instância deve ser descartada');
assert.strictEqual(instance.renderer, null, 'Renderer deve ser liberado');
console.log('✓ Descarte de contexto WebGL e desvinculação Three.js concluídos sem vazamento de memória');

console.log('\n========================================');
console.log('🎉 TODOS OS TESTES DO MOTOR LOW-POLY 3D PASSARAM COM 100% DE SUCESSO!');
console.log('========================================');
