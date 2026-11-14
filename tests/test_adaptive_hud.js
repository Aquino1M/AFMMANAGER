/**
 * Teste do HUD Inteligente & Adaptativo (Top 4 Atalhos)
 */
const assert = require('assert');
const fs = require('fs');

// Mock DOM & Storage
global.window = global;
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null
};
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

// Carrega as dependências mínimas do game.js
require('../js/competitions.js');
const gameJs = fs.readFileSync('js/game.js', 'utf8');
new Function('window', gameJs)(global);

console.log('--- TESTE 1: HUD Inicial do Modo Jogador (Top 4 Atalhos) ---');
const playerState = {
  gameMode: 'player',
  playerCareerState: {
    agentOffers: [{ id: 'off1', isRead: false }]
  },
  userTabUsage: {}
};

const initialTabsPlayer = global.getAdaptiveRibbonTabs(true, 'player_hub', playerState);
console.log('Abas retornadas (Modo Jogador):', initialTabsPlayer.map(t => t.id));
assert.strictEqual(initialTabsPlayer.length, 4, 'Deve retornar exatamente 4 abas');
assert.strictEqual(initialTabsPlayer[0].id, 'player_hub', 'Primeira aba deve ser player_hub');
assert.strictEqual(initialTabsPlayer[1].id, 'player_evolution', 'Segunda aba deve ser player_evolution');
assert.strictEqual(initialTabsPlayer[2].id, 'player_agent', 'Terceira aba deve ser player_agent');
assert.strictEqual(initialTabsPlayer[3].id, 'player_social', 'Quarta aba deve ser player_social');
assert(initialTabsPlayer[2].label.includes('1'), 'Deve exibir a badge de 1 oferta não lida no empresário');
console.log('✓ Top 4 inicial do Modo Jogador verificado com sucesso!');

console.log('\n--- TESTE 2: Aprendizado do HUD conforme o usuário usa o jogo ---');
// Simula o usuário acessando 'player_lifestyle' 10 vezes e 'player_national' 8 vezes
playerState.userTabUsage['player_lifestyle'] = 10;
playerState.userTabUsage['player_national'] = 8;
playerState.userTabUsage['player_hub'] = 5;
playerState.userTabUsage['player_social'] = 4;

const learnedTabsPlayer = global.getAdaptiveRibbonTabs(true, 'player_lifestyle', playerState);
console.log('Abas após aprendizado:', learnedTabsPlayer.map(t => `${t.id} (${playerState.userTabUsage[t.id] || 0} acessos)`));
assert.strictEqual(learnedTabsPlayer.length, 4, 'Deve manter exatamente 4 abas');
assert.strictEqual(learnedTabsPlayer[0].id, 'player_lifestyle', 'Aba mais acessada (10) deve estar no topo');
assert.strictEqual(learnedTabsPlayer[1].id, 'player_national', 'Segunda mais acessada (8) deve estar no 2º slot');
assert.strictEqual(learnedTabsPlayer[2].id, 'player_hub', 'Terceira mais acessada (5) deve estar no 3º slot');
assert.strictEqual(learnedTabsPlayer[3].id, 'player_social', 'Quarta mais acessada (4) deve estar no 4º slot');
console.log('✓ Sistema aprendeu perfeitamente com o uso do jogador e reorganizou o HUD!');

console.log('\n--- TESTE 3: HUD Inicial do Modo Treinador ---');
const managerState = {
  gameMode: 'manager',
  userTabUsage: {}
};
const initialTabsManager = global.getAdaptiveRibbonTabs(false, 'meutime', managerState);
console.log('Abas retornadas (Modo Treinador):', initialTabsManager.map(t => t.id));
assert.strictEqual(initialTabsManager.length, 4, 'Deve retornar exatamente 4 abas no Modo Treinador');
assert.strictEqual(initialTabsManager[0].id, 'meutime');
assert.strictEqual(initialTabsManager[1].id, 'mercado');
assert.strictEqual(initialTabsManager[2].id, 'escritorio');
assert.strictEqual(initialTabsManager[3].id, 'calendario');
console.log('✓ Top 4 do Modo Treinador verificado com sucesso!');

console.log('\n--- TESTE 4: Navegação temporária para aba fora do Top 4 ---');
// Usuário está nas top 4, mas abre 'elenco' pelo drawer lateral
const customManagerView = global.getAdaptiveRibbonTabs(false, 'elenco', managerState);
console.log('Abas ao abrir elenco (fora do top 4):', customManagerView.map(t => t.id));
assert.strictEqual(customManagerView.length, 4, 'Deve manter exatamente 4 abas');
assert(customManagerView.some(t => t.id === 'elenco'), 'A aba ativa deve estar presente nos 4 atalhos');
console.log('✓ Aba ativa temporária garantida sem estourar o limite de 4 atalhos!');

console.log('\n✅ TODOS OS TESTES DO HUD ADAPTATIVO PASSARAM COM 100% DE SUCESSO!');
