const fs = require('fs');
const assert = require('assert');

console.log('🧪 Iniciando teste de abertura de abas e exportação de openStadiumModal...');

// Mock environment
global.window = global;
const createdElements = [];

global.document = {
  body: {
    appendChild: (el) => { createdElements.push(el); }
  },
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      id: '',
      style: {},
      innerHTML: '',
      children: [],
      querySelector: (sel) => ({ scrollTop: 0 }),
      querySelectorAll: (sel) => [],
      remove: function() {}
    };
  },
  getElementById: (id) => createdElements.find(e => e.id === id) || null,
  querySelector: (sel) => {
    if (sel === '#btnCloseStadiumModal') return { onclick: null };
    return null;
  },
  querySelectorAll: (sel) => [],
  addEventListener: () => {}
};

global.$ = (sel) => {
  if (sel === '#stadiumVisualModalContainer') return createdElements.find(e => e.id === 'stadiumVisualModalContainer') || null;
  if (sel === '#btnCloseStadiumModal') return { onclick: null };
  return null;
};
global.$$ = (sel) => [];

global.state = {
  club: 'Corinthians',
  manager: 'Aquino',
  balance: 50000000,
  stadiumCapacity: 48000,
  infrastructure: {
    stadium: { level: 4, capacity: 48000 },
    store: { level: 2 },
    training: { level: 3 },
    academy: { level: 2 },
    marketing: { level: 2 },
    parking: { level: 2 },
    bank: { level: 1 }
  },
  stadiumUpgrades: {},
  stadiumMaintenance: 85,
  stadiumPitchType: 'natural',
  stadiumRingData: {
    ring: 4,
    maxRings: 6,
    sides: { norte: true, sul: true, leste: true, oeste: false },
    rings: {
      1: { norte: true, sul: true, leste: true, oeste: true },
      2: { norte: true, sul: true, leste: true, oeste: true },
      3: { norte: true, sul: true, leste: true, oeste: true },
      4: { norte: true, sul: true, leste: true, oeste: false },
      5: { norte: false, sul: false, leste: false, oeste: false },
      6: { norte: false, sul: false, leste: false, oeste: false }
    },
    purchasedSectors: ['r1_norte', 'r1_sul', 'r1_leste', 'r1_oeste', 'r2_norte', 'r2_sul', 'r2_leste', 'r2_oeste', 'r3_norte', 'r3_sul', 'r3_leste', 'r3_oeste', 'r4_norte', 'r4_sul', 'r4_leste'],
    activeWork: null
  }
};

let gameJs = fs.readFileSync('js/game.js', 'utf8');

// Test if openStadiumModal is exported to window in game.js
console.log('1. Verificando exportação de window.openStadiumModal em js/game.js...');
assert(gameJs.includes('window.openStadiumModal = openStadiumModal'), 'js/game.js deve exportar window.openStadiumModal');

// Run game.js
eval(gameJs);

assert.strictEqual(typeof window.openStadiumModal, 'function', 'window.openStadiumModal deve ser uma função após carregar game.js');
console.log('✓ window.openStadiumModal exportada com sucesso!');

// Define state no window mock para simular carreira ativa
window.state = {
  club: 'Corinthians',
  manager: 'Aquino',
  balance: 50000000,
  stadiumCapacity: 48000,
  infrastructure: {
    stadium: { level: 4, capacity: 48000 },
    store: { level: 2 },
    training: { level: 3 },
    academy: { level: 2 },
    marketing: { level: 2 },
    parking: { level: 2 },
    bank: { level: 1 }
  },
  stadiumUpgrades: {},
  stadiumMaintenance: 85,
  stadiumPitchType: 'natural',
  stadiumRingData: {
    ring: 4,
    maxRings: 6,
    sides: { norte: true, sul: true, leste: true, oeste: false },
    rings: {
      1: { norte: true, sul: true, leste: true, oeste: true },
      2: { norte: true, sul: true, leste: true, oeste: true },
      3: { norte: true, sul: true, leste: true, oeste: true },
      4: { norte: true, sul: true, leste: true, oeste: false },
      5: { norte: false, sul: false, leste: false, oeste: false },
      6: { norte: false, sul: false, leste: false, oeste: false }
    },
    purchasedSectors: ['r1_norte', 'r1_sul', 'r1_leste', 'r1_oeste', 'r2_norte', 'r2_sul', 'r2_leste', 'r2_oeste', 'r3_norte', 'r3_sul', 'r3_leste', 'r3_oeste', 'r4_norte', 'r4_sul', 'r4_leste'],
    activeWork: null
  }
};

console.log('window.state:', !!window.state);
console.log('createdElements before tabs:', createdElements.map(e => e.id));

// Test calling each tab
['summary', 'expansion', 'arena', 'upgrades', 'maintenance'].forEach(tab => {
  window.openStadiumModal(tab);
  console.log(`createdElements after ${tab}:`, createdElements.map(e => e.id));
  const container = createdElements.find(e => e.id === 'stadiumVisualModalContainer');
  assert(container, `Container do estádio deve ser criado ao abrir aba ${tab}`);
  assert(container.innerHTML.length > 50, `Conteúdo HTML deve ser injetado para aba ${tab}`);
  console.log(`✓ Aba '${tab}' aberta com sucesso (${container.innerHTML.length} bytes gerados)`);
});

console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
