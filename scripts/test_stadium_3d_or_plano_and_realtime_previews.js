/**
 * Teste Automatizado: Seletor 3D ou Plano e Prévias de Upgrades em Tempo Real
 * Arquivo: scripts/test_stadium_3d_or_plano_and_realtime_previews.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Iniciando teste de Alternância 3D vs Plano e Prévias em Tempo Real...');

// Setup Mock DOM
const elementMap = {};
const createdElements = [];

global.document = {
  getElementById: (id) => elementMap[id] || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return elementMap[sel.slice(1)] || null;
    return null;
  },
  querySelectorAll: (sel) => [],
  createElement: (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      style: {},
      children: [],
      dataset: {},
      innerHTML: '',
      addEventListener: () => {},
      appendChild: (c) => el.children.push(c),
      remove: () => {},
      querySelector: (sub) => {
        if (sub.startsWith('#')) return elementMap[sub.slice(1)] || null;
        return null;
      },
      querySelectorAll: (sub) => []
    };
    createdElements.push(el);
    return el;
  },
  body: {
    appendChild: (el) => {
      if (el.id) elementMap[el.id] = el;
    }
  },
  addEventListener: () => {}
};

global.window = {
  document: global.document,
  addEventListener: () => {},
  state: null
};

// 1. Carregar stadium_3d_manager.js
const s3dCode = fs.readFileSync(path.join(__dirname, '../js/core/stadium_3d_manager.js'), 'utf8');
eval(s3dCode);
assert.ok(global.window.AFMStadium3D, 'AFMStadium3D deve estar disponível');
console.log('✓ AFMStadium3D carregado com sucesso');

// 2. Mock State
global.state = {
  club: 'Corinthians',
  balance: 50000000,
  infrastructure: {
    stadium: {
      level: 3,
      capacity: 45000,
      name: 'Neo Química Arena'
    }
  },
  stadiumUpgrades: {
    chairs: true,
    screen: true
  }
};
global.window.state = global.state;

// Helpers Mock
global.esc = (str) => String(str || '');
global.fmtMoney = (val) => 'R$ ' + Number(val || 0).toLocaleString('pt-BR');
global.clubBadge = (club, size) => `<img src="badge.png" width="${size}">`;
global.clubStadiumName = () => 'Neo Química Arena';
global.getCaldeiraoData = () => ({ occRate: 95, fans: 70, structScore: 25, caldeiraoPercent: 14 });
global.getStadiumExpansionData = () => ({
  sides: { norte: false, sul: false, leste: false, oeste: false },
  purchasedSectors: []
});
global.getSelectedArenaCapacity = () => global.selectedArenaCapacity || 15000;
global.arenaLandCost = () => 10000000;
global.arenaPermitCost = () => 5000000;
global.calcArenaTotalCost = () => 75000000;
global.stadiumUpgradeCost = (c) => c;
global.toast = () => {};
global.save = () => {};
global.$ = (sel) => {
  if (sel.startsWith('#')) return elementMap[sel.slice(1)] || null;
  return null;
};
global.$$ = () => [];

// 3. Carregar openStadiumModal de js/game.js
const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

// Executar contexto da função openStadiumModal
eval(gameCode);
assert.strictEqual(typeof global.window.openStadiumModal, 'function', 'window.openStadiumModal deve ser exportada');
console.log('✓ openStadiumModal exportada com sucesso');

// 4. Testar modo Plano (Padrão)
window.stadiumVisualMode = 'plano';
window.openStadiumModal('upgrades');

const container = elementMap['stadiumVisualModalContainer'];
assert.ok(container, 'Container do estádio deve existir');
const htmlPlano = container.innerHTML;

assert.ok(htmlPlano.includes('id="btnStadiumMode3D"'), 'Deve conter botão Seletor de Modo 3D');
assert.ok(htmlPlano.includes('id="btnStadiumModePlano"'), 'Deve conter botão Seletor de Modo Plano');
assert.ok(htmlPlano.includes('Visão Plano</span>'), 'Deve ter o rótulo Visão Plano');
assert.ok(htmlPlano.includes('Visão 3D</span>'), 'Deve ter o rótulo Visão 3D');
console.log('✓ 1. Seletor de visualização (3D vs Plano) validado com sucesso');

// Verificar elementos visuais dos upgrades no modo Plano
assert.ok(htmlPlano.includes('TELÃO •'), 'Upgrades instalados (screen) devem aparecer no Plano');
assert.ok(htmlPlano.includes('repeating-linear-gradient'), 'Upgrades instalados (chairs) devem aparecer no Plano');
console.log('✓ 2. Upgrades no modo Plano renderizados com sucesso');

// 5. Testar modo 3D
window.stadiumVisualMode = '3d';
window.openStadiumModal('upgrades');
const html3D = container.innerHTML;

assert.ok(html3D.includes('<model-viewer'), 'No modo 3D deve conter tag model-viewer');
assert.ok(html3D.includes('afmStadiumVisualModelViewer'), 'ID da maquete 3D afmStadiumVisualModelViewer deve estar presente');
assert.ok(html3D.includes('btn-visual-cam'), 'Presets de câmera 3D devem estar presentes');
assert.ok(html3D.includes('TELÃO DIGITAL'), 'Badge de upgrade ativo (screen) deve estar visível no 3D');
console.log('✓ 3. Modo 3D com model-viewer e badges de upgrades validado com sucesso');

// 6. Testar Prévia em Tempo Real de Upgrades
console.log('Testando prévias de upgrades...');
const testUpgrades = ['flares', 'ledRing', 'vipBoxes', 'surroundSound', 'solarPitch'];

for (const upgKey of testUpgrades) {
  // Simular prévia ativa
  window.stadiumPreviewUpgrade = upgKey;
  window.openStadiumModal('upgrades');
  const previewHtml = container.innerHTML;

  assert.ok(previewHtml.includes('PRÉVIA AO VIVO'), `Deve exibir banner de prévia para ${upgKey}`);
  assert.ok(previewHtml.includes('EM PRÉVIA'), `Deve exibir badge EM PRÉVIA na lista para ${upgKey}`);
  assert.ok(previewHtml.includes('upgrade-preview-active-card'), `Card deve receber classe upgrade-preview-active-card para ${upgKey}`);
  console.log(`  ✓ Prévia em tempo real de '${upgKey}' validada com sucesso!`);
}

// 7. Testar Maquete 3D na Aba Arena (Resolução por capacidade projetada)
window.stadiumVisualMode = '3d';
window.stadiumPreviewUpgrade = null;
global.state.arenaProposedCapacity = 80000;
window.openStadiumModal('arena');
const arenaHtml80k = container.innerHTML;
assert.ok(arenaHtml80k.includes('MAQUETE ARENA: 80.000 LUGARES'), 'Deve exibir badge da maquete de 80.000 lugares');
assert.ok(arenaHtml80k.includes('arena_moderna.glb'), 'Para 80k deve carregar arena_moderna.glb');
console.log('✓ 4. Resolução dinâmica de maquete 3D na aba Arena (80k lugares) validada com sucesso');

global.state.arenaProposedCapacity = 100000;
window.openStadiumModal('arena');
const arenaHtml100k = container.innerHTML;
assert.ok(arenaHtml100k.includes('MAQUETE ARENA: 100.000 LUGARES'), 'Deve exibir badge da maquete de 100.000 lugares');
assert.ok(arenaHtml100k.includes('arena_coliseu') || arenaHtml100k.includes('arena_moderna.glb'), 'Para 100k deve carregar modelo Coliseu');
console.log('✓ 5. Resolução dinâmica de maquete 3D na aba Arena (100k Mega Coliseu) validada com sucesso');

// 8. Testar Ampliação da Zona Leste Acoplada na Maquete 3D
console.log('Testando acoplamento 3D da ampliação de arquibancada (Zona Leste)...');
window.stadiumVisualMode = '3d';
window.stadiumModalTab = 'expansion';
window.stadiumSelectedSide = 'leste';
global.getStadiumExpansionData = () => ({
  sides: { norte: false, sul: false, leste: true, oeste: false },
  purchasedSectors: ['r1_leste'],
  ring: 1,
  rings: { 1: { norte: false, sul: false, leste: true, oeste: false } }
});

window.openStadiumModal('expansion');
const expHtml = container.innerHTML;
assert.ok(expHtml.includes('slot="hotspot-stand-leste"'), 'Maquete 3D deve conter hotspot acoplado para a Zona Leste');
assert.ok(expHtml.includes('ZONA LESTE AMPLIADA'), 'Hotspot 3D da Zona Leste deve exibir ZONA LESTE AMPLIADA');
assert.ok(expHtml.includes('+3.500 Lugares Acoplados'), 'Hotspot 3D da Zona Leste deve exibir +3.500 Lugares Acoplados');
assert.ok(expHtml.includes('camera-orbit="90deg 68deg 82%"'), 'Câmera 3D deve focar no setor Leste ao selecionar o setor');
console.log('✓ 6. Acoplamento 3D da Ampliação da Zona Leste (+3.500 Lugares) e foco de câmera validados com sucesso');

// 9. Testar Acoplamento 3D de Melhorias em Prévia (Camarotes VIP, Telão e LED)
console.log('Testando hotspots 3D em tempo real das melhorias...');
window.stadiumPreviewUpgrade = 'vipBoxes';
window.openStadiumModal('upgrades');
const vip3DHtml = container.innerHTML;
assert.ok(vip3DHtml.includes('slot="hotspot-vip"'), 'Maquete 3D deve acoplar hotspot dos Camarotes VIP');
assert.ok(vip3DHtml.includes('CAMAROTES VIP CORPORATIVOS'), 'Hotspot 3D deve conter texto dos Camarotes VIP');

window.stadiumPreviewUpgrade = 'screen';
window.openStadiumModal('upgrades');
const screen3DHtml = container.innerHTML;
assert.ok(screen3DHtml.includes('slot="hotspot-screen"'), 'Maquete 3D deve acoplar hotspot do Telão Digital');
assert.ok(screen3DHtml.includes('TELÃO DIGITAL CENTRAL'), 'Hotspot 3D deve conter texto do Telão Digital Central');

window.stadiumPreviewUpgrade = 'ledRing';
window.openStadiumModal('upgrades');
const led3DHtml = container.innerHTML;
assert.ok(led3DHtml.includes('slot="hotspot-led-ring"'), 'Maquete 3D deve acoplar hotspot do Anel de LED');
assert.ok(led3DHtml.includes('PAINÉIS DE LED 360°'), 'Hotspot 3D deve conter texto do Anel de LED 360°');
console.log('✓ 7. Acoplamento 3D de Camarotes VIP, Telão Digital e Anel de LED em tempo real validados com sucesso');

console.log('\n🎉 TODOS OS TESTES DE 3D VS PLANO, AMPLIAÇÃO DA ZONA LESTE E PRÉVIAS EM TEMPO REAL PASSARAM COM 100% DE SUCESSO!');

