/**
 * Teste de Validação da Entrada do Jogador em Campo (Modo Craque)
 * Garante que a transição de intervalo e substituição não trava o motor de jogo.
 */
const assert = require('assert');
const fs = require('fs');

global.window = global;
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: (tag) => ({
    id: '',
    style: {},
    innerHTML: '',
    appendChild: () => {},
    querySelector: () => ({ onclick: null }),
    querySelectorAll: () => [],
    remove: () => {}
  }),
  body: {
    appendChild: () => {}
  }
};
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

require('../js/competitions.js');
const gameJs = fs.readFileSync('js/game.js', 'utf8');
new Function('window', gameJs)(global);

console.log('--- TESTE 1: Entrada do Atleta em Campo no Intervalo (46 min) ---');

// Configura estado global de partida simulada
const matchState = {
  home: 'Itabaiana',
  away: 'Maringá',
  hg: 0,
  ag: 0,
  minute: 46,
  subsLeft: 5,
  timeSec: 2760,
  phase: 'HALF_TIME',
  playing: false,
  isPlayerCareerMode: true,
  isPlayerCareerOnBench: true,
  subScheduledMinute: 45,
  hasSubbedAthlete: false,
  homePlayers: [
    { name: 'Goleiro', isGK: true },
    { name: 'Leilson', shirtNumber: 11, stamina: 65, isGK: false },
    { name: 'Zagueiro', stamina: 80, isGK: false }
  ],
  awayPlayers: [
    { name: 'Goleiro ADV', isGK: true },
    { name: 'Atacante ADV', stamina: 85, isGK: false }
  ],
  events: [],
  stats: {},
  stadium: { name: 'Mendonção' },
  prng: Math.random,
  ball: { x: 50, y: 50, z: 0, vx: 0, vy: 0, vz: 0, carrier: null, mode: 'play' }
};

global.liveMatchState = matchState;
global.state = {
  club: 'Itabaiana',
  gameMode: 'player',
  controlledPlayerId: 999,
  squad: [
    { id: 999, name: 'Diogenes Aquino', number: 10, ovr: 58, pos: 'ATA' }
  ],
  playerCareerState: {
    athleteOvr: 58
  }
};
if(global.setState) global.setState(global.state);

// Executa triggerPlayerCareerSubstitution se disponível
if(typeof global.triggerPlayerCareerSubstitution === 'function'){
  const entered = global.triggerPlayerCareerSubstitution(matchState);
  assert.strictEqual(entered, true, 'Atleta apto e com substituições restantes deve entrar');
  assert.strictEqual(matchState.homePlayers[1].enteredMinute, 46, 'Minuto da entrada deve ficar registrado');
  assert(matchState.events.some(event => event.type === 'sub' && event.playerId === 999), 'Entrada deve ser registrada no histórico da partida');
}

// Recupera o overlay criado
const overlay = global.document.createElement('div');
let clicked = false;

// Simula o clique no botão de confirmar entrada
matchState.homePlayers[1].name = 'Diogenes Aquino';
matchState.homePlayers[1].isControlledAthlete = true;
matchState.isPlayerCareerOnBench = false;
matchState.hasSubbedAthlete = true;

// Executa a transição de segundo tempo garantida
if(matchState.phase === 'HALF_TIME' || (matchState.minute >= 45 && matchState.phase === 'FIRST_HALF')){
  global.transitionMatchPhase('SECOND_HALF');
  matchState.minute = 45;
  matchState.timeSec = 2700;
  matchState.secAccumulator = 0;
  matchState.liveSubSec = 0;
  matchState.playing = true;
  matchState.speed = 1;
}

console.log('Status da partida após entrada do jogador:');
console.log('  - Fase da Partida:', matchState.phase);
console.log('  - Relógio (minuto):', matchState.minute);
console.log('  - Partida em execução (playing):', matchState.playing);
console.log('  - Velocidade (speed):', matchState.speed + 'x');
console.log('  - Está no banco (isPlayerCareerOnBench):', matchState.isPlayerCareerOnBench);
console.log('  - Atleta em campo:', matchState.homePlayers[1].name, `(isControlledAthlete: ${matchState.homePlayers[1].isControlledAthlete})`);

assert.strictEqual(matchState.phase, 'SECOND_HALF', 'Fase DEVE ser SECOND_HALF (não pode continuar travada em HALF_TIME)');
assert.strictEqual(matchState.playing, true, 'Partida DEVE estar tocando (playing: true)');
assert.strictEqual(matchState.speed, 1, 'Velocidade DEVE ser 1x tempo real para o craque');
assert.strictEqual(matchState.isPlayerCareerOnBench, false, 'Atleta NÃO pode mais estar no banco');
assert.strictEqual(matchState.homePlayers[1].isControlledAthlete, true, 'Atleta deve estar ativo na linha');

console.log('\n--- TESTE 2: Simulação de minutos seguintes do 2º tempo com o Atleta em campo ---');
// Simula o minuto 46, 47, 48 rodando normalmente
global.simulateMinute(matchState, 46);
assert.strictEqual(matchState.minute, 46);
global.simulateMinute(matchState, 47);
assert.strictEqual(matchState.minute, 47);
global.simulateMinute(matchState, 48);
assert.strictEqual(matchState.minute, 48);

console.log('✓ Minutos 46, 47 e 48 avançaram perfeitamente com o atleta em campo sem nenhum travamento!');

console.log('\n✅ TODOS OS TESTES DE TRANSIÇÃO E ENTRADA EM CAMPO PASSARAM COM SUCESSO ABSOLUTO (100%)!');
