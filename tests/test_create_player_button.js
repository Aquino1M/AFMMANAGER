global.window = global;
const mockElem = () => ({
  innerHTML: '',
  textContent: '',
  style: {},
  dataset: {},
  classList: { add: () => {}, remove: () => {}, contains: () => false },
  querySelector: () => mockElem(),
  querySelectorAll: () => [mockElem()],
  addEventListener: () => {}
});

global.appElement = mockElem();
global.btnGoCreatePlayer = mockElem();
global.slotButtons = [
  { ...mockElem(), dataset: { slot: '1' } },
  { ...mockElem(), dataset: { slot: '2' } },
  { ...mockElem(), dataset: { slot: '3' } }
];

global.document = {
  querySelector: (sel) => {
    if(sel === '#app') return global.appElement;
    if(sel === '#btnGoCreatePlayer') return global.btnGoCreatePlayer;
    return mockElem();
  },
  querySelectorAll: (sel) => {
    if(sel === '.btnSelectSlotForPlayer') return global.slotButtons;
    return [mockElem()];
  },
  getElementById: (id) => mockElem(),
  addEventListener: () => {}
};
global.localStorage = {
  _store: {},
  getItem(k){ return this._store[k] || null; },
  setItem(k, v){ this._store[k] = String(v); },
  removeItem(k){ delete this._store[k]; },
  clear(){ this._store = {}; }
};
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/competitions.js');
require('../data/competition_teams.js');
require('../data/players_live.js');
require('../js/player/player_career_engine.js');
require('../js/ui/create_player_ui.js');

const fs = require('fs');
const gameJs = fs.readFileSync('./js/game.js', 'utf8');
new Function('window', gameJs)(global);

console.log('=== TESTE 1: Clique no Banner "CRIAR MEU CRAQUE AGORA" ===');
global.bindSetup();

if(typeof global.btnGoCreatePlayer.onclick !== 'function'){
  console.error('ERRO: btnGoCreatePlayer.onclick não é uma função!');
  process.exit(1);
}

// Executa o clique
try {
  global.btnGoCreatePlayer.onclick();
  console.log('✓ Clique executado sem ReferenceError');
  if(!global.appElement.innerHTML.includes('CRIAR MEU ATLETA')){
    console.error('ERRO: Tela de criação de jogador não renderizou em #app');
    process.exit(1);
  }
  console.log('✅ SUCESSO: Tela "CRIAR MEU ATLETA" renderizada com sucesso!');
} catch(e){
  console.error('ERRO ao clicar em btnGoCreatePlayer:', e);
  process.exit(1);
}

console.log('\n=== TESTE 2: Clique no Botão de Slot "Iniciar Modo Craque (Slot 2)" ===');
global.appElement.innerHTML = '';
try {
  global.slotButtons[1].onclick();
  if(!global.appElement.innerHTML.includes('CRIAR MEU ATLETA')){
    console.error('ERRO: Slot 2 não renderizou a tela de criação');
    process.exit(1);
  }
  console.log('✅ SUCESSO: Botão do Slot abriu a tela de criação do Modo Craque perfeitamente!');
} catch(e){
  console.error('ERRO ao clicar no botão do slot:', e);
  process.exit(1);
}

console.log('\n🎉 TODOS OS TESTES DE CRIAÇÃO DE JOGADOR PASSARAM COM 100% DE SUCESSO!');
