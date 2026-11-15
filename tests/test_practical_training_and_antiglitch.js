// Teste automatizado para o Sistema de Treinamento Prático em Campo e Trava Anti-Glitch (3x/dia)
const assert = require('assert');

global.window = global;

const elementRegistry = [];
function makeEl(tag, cls = '', id = '', dataset = {}) {
  const el = {
    tagName: tag.toUpperCase(),
    className: cls,
    id: id,
    dataset: dataset,
    classList: {
      contains: (c) => cls.split(' ').includes(c),
      add: (c) => {},
      remove: (c) => {},
      toggle: (c) => {}
    },
    style: {},
    children: [],
    appendChild: (c) => el.children.push(c),
    querySelector: (sel) => {
      if(sel.startsWith('#')) {
        const targetId = sel.slice(1);
        return el.children.find(c => c.id === targetId) || elementRegistry.find(e => e.id === targetId) || null;
      }
      return null;
    },
    querySelectorAll: () => [],
    addEventListener: (evt, fn) => { el['on' + evt] = fn; },
    remove: () => {},
    focus: () => {}
  };
  elementRegistry.push(el);
  return el;
}

global.document = {
  querySelectorAll: (selector) => {
    if(selector.startsWith('.')) {
      const cls = selector.slice(1).split(',')[0].trim().replace('.', '');
      return elementRegistry.filter(e => e.className.includes(cls));
    }
    return [];
  },
  querySelector: (selector) => {
    if(selector.startsWith('.')) {
      const cls = selector.slice(1).replace('.', '');
      return elementRegistry.find(e => e.className.includes(cls)) || null;
    }
    if(selector.startsWith('#')) {
      const id = selector.slice(1);
      return elementRegistry.find(e => e.id === id) || null;
    }
    return null;
  },
  getElementById: (id) => elementRegistry.find(e => e.id === id) || null,
  createElement: (tag) => makeEl(tag),
  addEventListener: () => {},
  body: { appendChild: () => {} }
};
global.addEventListener = () => {};

require('../js/player/player_career_engine.js');
require('../js/systems/interactive_set_pieces.js');
require('../js/player/player_mode_ui.js');
require('../js/core/calendar_and_day_advance_fix.js');

console.log('=== TESTES DO TREINAMENTO PRÁTICO EM CAMPO & ANTI-GLITCH ===\n');

// 1. Testar inicialização e sincronização da trava diária
console.log('1. Testando inicialização e sincronização com o calendário...');
const playerState = {
  athleteName: 'Diógenes Aquino',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  availablePoints: 0,
  skillPoints: 0
};

window.AFM_PlayerEngine.syncDailyTrainingLimit(playerState, '2026-01-01');
assert(playerState.trainingState, 'trainingState deve ser inicializado');
assert.strictEqual(playerState.trainingState.dailyCount, 0, 'dailyCount inicia em 0');
assert.strictEqual(playerState.trainingState.lastTrainingDate, '2026-01-01', 'lastTrainingDate sincronizado');
assert.strictEqual(playerState.trainingState.maxDailyLimit, 3, 'maxDailyLimit é 3');
console.log('✔ Sincronização inicial aprovada!');

// 2. Testar execução de treinos e limite de 3x por dia
console.log('2. Testando execuções de treino e limite rígido de 3 tentativas diárias...');
let savedCalls = 0;
window.save = () => { savedCalls++; };

// Treino 1: Pênalti com Gol (+20 XP)
const res1 = window.AFM_PlayerEngine.executePracticalTraining({
  type: 'penalty',
  isGoal: true,
  playerState,
  currentGameDate: '2026-01-01'
});
assert.strictEqual(res1.blocked, false, 'Treino 1 não deve ser bloqueado');
assert.strictEqual(res1.isGoal, true, 'Gol registrado');
assert.strictEqual(res1.xpEarned, 20, 'Pênalti com gol dá +20 XP');
assert.strictEqual(playerState.xp, 20, 'XP atualizado');
assert.strictEqual(res1.remainingToday, 2, 'Restam 2 tentativas');
assert(savedCalls > 0, 'window.save() chamado imediatamente');

// Treino 2: Pênalti com Erro (+3 XP)
const res2 = window.AFM_PlayerEngine.executePracticalTraining({
  type: 'penalty',
  isGoal: false,
  playerState,
  currentGameDate: '2026-01-01'
});
assert.strictEqual(res2.blocked, false, 'Treino 2 não bloqueado');
assert.strictEqual(res2.isGoal, false, 'Erro registrado');
assert.strictEqual(res2.xpEarned, 3, 'Pênalti com erro dá +3 XP');
assert.strictEqual(playerState.xp, 23, 'XP acumulado');
assert.strictEqual(res2.remainingToday, 1, 'Resta 1 tentativa');

// Treino 3: Falta com Gol (+35 XP)
const res3 = window.AFM_PlayerEngine.executePracticalTraining({
  type: 'freekick',
  isGoal: true,
  playerState,
  currentGameDate: '2026-01-01'
});
assert.strictEqual(res3.blocked, false, 'Treino 3 não bloqueado');
assert.strictEqual(res3.xpEarned, 35, 'Falta com gol dá +35 XP');
assert.strictEqual(playerState.xp, 58, 'XP acumulado (20 + 3 + 35 = 58)');
assert.strictEqual(res3.remainingToday, 0, 'Restam 0 tentativas');

// Treino 4: Tentativa de burlar (glitch) no mesmo dia -> DEVE SER BLOQUEADA
const res4 = window.AFM_PlayerEngine.executePracticalTraining({
  type: 'penalty',
  isGoal: true,
  playerState,
  currentGameDate: '2026-01-01'
});
assert.strictEqual(res4.blocked, true, 'Tentativa 4 deve ser bloqueada!');
assert.strictEqual(playerState.trainingState.dailyCount, 3, 'Contador não ultrapassa 3');
assert.strictEqual(playerState.xp, 58, 'Nenhum XP atribuído na tentativa bloqueada');
console.log('✔ Trava anti-glitch de 3 treinos por dia funcionando com rigor!');

// 3. Testar avanço de calendário resetando as cargas
console.log('3. Testando avanço de calendário resetando as cargas para 3...');
const advanceState = {
  gameMode: 'player',
  date: '2026-01-01',
  playerCareerState: playerState
};
window.AFM_CalendarFix.advanceDaysGuaranteed(advanceState, 1);
assert.strictEqual(advanceState.date, '2026-01-02', 'Data avançada para 2 de janeiro');
assert.strictEqual(playerState.trainingState.dailyCount, 0, 'dailyCount resetado para 0 no novo dia');
assert.strictEqual(playerState.trainingState.lastTrainingDate, '2026-01-02', 'lastTrainingDate atualizado');

// Novo treino no dia seguinte agora é permitido: Falta com erro (+5 XP)
const xpBefore = playerState.xp;
const resDay2 = window.AFM_PlayerEngine.executePracticalTraining({
  type: 'freekick',
  isGoal: false,
  playerState,
  currentGameDate: '2026-01-02'
});
assert.strictEqual(resDay2.blocked, false, 'Treino no dia 2 permitido');
assert.strictEqual(resDay2.xpEarned, 5, 'Falta com erro dá +5 XP');
assert.strictEqual(playerState.xp, xpBefore + 5, 'XP acumulado com +5 da tentativa');
assert.strictEqual(resDay2.remainingToday, 2, 'Restam 2 tentativas no dia 2');
console.log('✔ Reset diário via avanço de calendário validado!');

// 4. Testar Level Up e Ganho de Ponto de Atributo Livre
console.log('4. Testando Level Up e atribuição de ponto livre...');
playerState.xpToNextLevel = 100;
playerState.xp = 95; // Faltam 5 para 100 XP
const initialLevel = playerState.level || 1;
const initialPoints = playerState.availablePoints || 0;
const resLevelUp = window.AFM_PlayerEngine.executePracticalTraining({
  type: 'penalty',
  isGoal: true, // +20 XP -> total 115 XP -> Level Up! (sobra 15 XP)
  playerState,
  currentGameDate: '2026-01-02'
});
assert.strictEqual(resLevelUp.gainedAttributePoint, true, 'Subiu de nível!');
assert.strictEqual(playerState.level, initialLevel + 1, 'Nível aumentou em 1');
assert.strictEqual(playerState.availablePoints, initialPoints + 1, 'Ganhou 1 ponto de atributo livre');
assert.strictEqual(playerState.skillPoints, playerState.availablePoints, 'skillPoints sincronizado com availablePoints');
assert.strictEqual(playerState.xp, 15, 'XP restante pós level up correto');
assert.strictEqual(playerState.xpToNextLevel, 120, 'Meta do próximo nível escalada para 120 XP');
console.log('✔ Level Up e atribuição de pontos de atributo livres validados com sucesso!');

// 5. Testar Renderização UI do Bloco de Treino Prático Dark-Neon
console.log('5. Testando elementos e classes Dark-Neon na UI de Meu Atleta & Treino...');
const uiState = {
  gameMode: 'player',
  controlledPlayerId: 'p1',
  club: 'Real Brasília',
  date: '2026-01-02',
  squad: [{ id: 'p1', name: 'Diógenes Aquino', pos: 'ATA', attributes: { chu: 40 } }],
  playerCareerState: playerState
};
window.state = uiState;
const html = window.AFM_PlayerMode.renderPage('player_evolution');
assert(html.includes('id="training-charges-badge"'), 'Badge de cargas diárias presente na UI');
assert(html.includes('id="btn-train-penalty"'), 'Botão #btn-train-penalty presente na UI');
assert(html.includes('id="btn-train-freekick"'), 'Botão #btn-train-freekick presente na UI');
assert(html.includes('+20 XP no Gol'), 'Badge de recompensa de +20 XP do Pênalti presente');
assert(html.includes('+35 XP no Gol'), 'Badge de recompensa de +35 XP da Falta presente');

// Simular 0 tentativas restantes na UI para verificar aviso e disabled
playerState.trainingState.dailyCount = 3;
const htmlBlocked = window.AFM_PlayerMode.renderPage('player_evolution');
assert(htmlBlocked.includes('0/3 restantes hoje'), 'Badge mostra 0/3 restantes');
assert(htmlBlocked.includes('id="training-limit-warning"'), 'Aviso de limite esgotado #training-limit-warning visível');
assert(htmlBlocked.includes('disabled'), 'Botões desabilitados quando cargas esgotadas');
console.log('✔ Componentes de UI Dark-Neon validados com sucesso!');

console.log('\n🎉 TODOS OS TESTES DE TREINAMENTO PRÁTICO E ANTI-GLITCH PASSARAM COM 100% DE SUCESSO! 🎉');
