// =========================================================================
// TESTE AUTOMATIZADO: ESCALAÇÃO CORRETA POR POSIÇÃO, PROTAGONISMO E COMANDOS
// =========================================================================
const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando testes de escalação, proteção de goleiro e comandos do craque...');

// Mock de ambiente de navegador para carregar as funções
global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, querySelector: () => null, appendChild: () => {} }),
  body: { appendChild: () => {} }
};
global.$ = () => null;
global.$$ = () => [];
global.clamp = (val, min, max) => Math.max(min, Math.min(max, val));
global.esc = (str) => String(str || '');

// Carrega as funções exportadas de js/game.js e js/player/player_mode_ui.js
require('../js/game.js');
require('../js/player/player_mode_ui.js');

// -------------------------------------------------------------
// Teste 1: Normalização de Posições
// -------------------------------------------------------------
console.log('1. Testando normalização de posições...');
assert.strictEqual(window.normalizePlayerPositionCode('ST'), 'ST');
assert.strictEqual(window.normalizePlayerPositionCode('ATA'), 'ST');
assert.strictEqual(window.normalizePlayerPositionCode('CA'), 'ST');
assert.strictEqual(window.normalizePlayerPositionCode('Centroavante'), 'ST');
assert.strictEqual(window.normalizePlayerPositionCode('GOL'), 'GK');
assert.strictEqual(window.normalizePlayerPositionCode('GK'), 'GK');
assert.strictEqual(window.normalizePlayerPositionCode('Goleiro'), 'GK');
assert.strictEqual(window.normalizePlayerPositionCode('ZAG'), 'CB');
assert.strictEqual(window.normalizePlayerPositionCode('CB'), 'CB');
assert.strictEqual(window.normalizePlayerPositionCode('MEI'), 'CAM');
assert.strictEqual(window.normalizePlayerPositionCode('CAM'), 'CAM');
assert.strictEqual(window.normalizePlayerPositionCode('VOL'), 'CDM');
assert.strictEqual(window.normalizePlayerPositionCode('PE'), 'LW');
assert.strictEqual(window.normalizePlayerPositionCode('PD'), 'RW');
console.log('   ✅ Normalização de posições 100% precisa!');

// -------------------------------------------------------------
// Teste 2: Proteção Absoluta do Slot 0 (Goleiro) com Atacante Carlos Henrique
// -------------------------------------------------------------
console.log('2. Testando placeUserPlayerInCorrectSlot com Atacante Carlos Henrique (ST)...');
const squadPool = [
  { id: 'gk-1', name: 'Alisson Becker', pos: 'GK', fc: 80 },
  { id: 'def-1', name: 'Zagueiro 1', pos: 'CB', fc: 70 },
  { id: 'def-2', name: 'Zagueiro 2', pos: 'CB', fc: 70 },
  { id: 'lat-1', name: 'Lateral E', pos: 'LB', fc: 70 },
  { id: 'lat-2', name: 'Lateral D', pos: 'RB', fc: 70 },
  { id: 'mid-1', name: 'Volante 1', pos: 'CDM', fc: 70 },
  { id: 'mid-2', name: 'Meia 1', pos: 'CM', fc: 70 },
  { id: 'mid-3', name: 'Meia 2', pos: 'CAM', fc: 70 },
  { id: 'att-1', name: 'Ponta 1', pos: 'LW', fc: 70 },
  { id: 'att-2', name: 'Ponta 2', pos: 'RW', fc: 70 },
  { id: 'att-3', name: 'Centroavante Antigo', pos: 'ST', fc: 72 },
  { id: 'gk-2', name: 'Goleiro Reserva', pos: 'GK', fc: 65 }
];

const userAttacker = {
  id: 'user-carlos-10',
  name: 'Carlos Henrique',
  fullName: 'Carlos Henrique',
  pos: 'ATA',
  position: 'ATA',
  number: 10,
  ovr: 35
};

// Cenário A: Lineup inicial veio desordenado ou com atacante no início
let initialLineup = [
  { id: 'def-1', name: 'Zagueiro 1', pos: 'CB' },
  { id: 'def-2', name: 'Zagueiro 2', pos: 'CB' },
  { id: 'lat-1', name: 'Lateral E', pos: 'LB' },
  { id: 'lat-2', name: 'Lateral D', pos: 'RB' },
  { id: 'mid-1', name: 'Volante 1', pos: 'CDM' },
  { id: 'mid-2', name: 'Meia 1', pos: 'CM' },
  { id: 'mid-3', name: 'Meia 2', pos: 'CAM' },
  { id: 'att-1', name: 'Ponta 1', pos: 'LW' },
  { id: 'att-2', name: 'Ponta 2', pos: 'RW' },
  { id: 'att-3', name: 'Centroavante Antigo', pos: 'ST' },
  { id: 'gk-1', name: 'Alisson Becker', pos: 'GK' }
];

let finalLineup = window.placeUserPlayerInCorrectSlot(initialLineup, userAttacker, squadPool);

assert.strictEqual(finalLineup.length, 11, 'Lineup deve conter exatamente 11 jogadores');
assert.strictEqual(window.normalizePlayerPositionCode(finalLineup[0].pos), 'GK', 'Slot 0 DEVE ser obrigatoriamente um Goleiro (GK)');
assert.notStrictEqual(finalLineup[0].id, userAttacker.id, 'O atleta do usuário atacante NUNCA pode ser o goleiro (Slot 0)');

const userIdx = finalLineup.findIndex(p => p.id === userAttacker.id || p.isUserPlayer);
assert(userIdx >= 8 && userIdx <= 10, `O atacante deve estar em um slot de ataque (8, 9 ou 10), mas foi encontrado em ${userIdx}`);
console.log(`   ✅ Atacante Carlos Henrique alocado corretamente no slot ${userIdx} e Goleiro ${finalLineup[0].name} garantido no slot 0!`);

// -------------------------------------------------------------
// Teste 3: Alocação com Meia (CAM), Zagueiro (CB) e Goleiro (GK)
// -------------------------------------------------------------
console.log('3. Testando alocação para outras posições (CAM, CB, GK)...');

// Meia (CAM)
const userMid = { id: 'user-mid', name: 'Meia Criativo', pos: 'MEI', number: 8 };
let midLineup = window.placeUserPlayerInCorrectSlot([...initialLineup], userMid, squadPool);
assert.strictEqual(window.normalizePlayerPositionCode(midLineup[0].pos), 'GK');
assert.notStrictEqual(midLineup[0].id, userMid.id);
const midIdx = midLineup.findIndex(p => p.id === userMid.id);
assert(midIdx >= 5 && midIdx <= 9, `Meia deve estar entre slots 5 e 9, encontrado em ${midIdx}`);

// Zagueiro (CB)
const userDef = { id: 'user-def', name: 'Zagueiro Firme', pos: 'ZAG', number: 3 };
let defLineup = window.placeUserPlayerInCorrectSlot([...initialLineup], userDef, squadPool);
assert.strictEqual(window.normalizePlayerPositionCode(defLineup[0].pos), 'GK');
assert.notStrictEqual(defLineup[0].id, userDef.id);
const defIdx = defLineup.findIndex(p => p.id === userDef.id);
assert(defIdx >= 1 && defIdx <= 4, `Zagueiro deve estar entre slots 1 e 4, encontrado em ${defIdx}`);

// Goleiro (GK): Quando o usuário escolhe ser goleiro
const userGk = { id: 'user-gk', name: 'Muralha', pos: 'GOL', number: 1 };
let gkLineup = window.placeUserPlayerInCorrectSlot([...initialLineup], userGk, squadPool);
assert.strictEqual(gkLineup[0].id, userGk.id, 'Quando o usuário é GK, ele DEVE ser o slot 0');
console.log('   ✅ Todas as posições respeitam rigorosamente a hierarquia tática e slots!');

// -------------------------------------------------------------
// Teste 4: Substituição no 2º Tempo aos 58' (Reserva Imediato)
// -------------------------------------------------------------
console.log('4. Testando substituição no 2º tempo sem substituir o goleiro...');
global.state = {
  gameMode: 'player',
  club: 'Brasília',
  controlledPlayerId: 'user-carlos-10',
  squad: [userAttacker, ...squadPool]
};

const mockHomePlayers = [
  { id: 'gk-1', name: 'Goleiro', pos: 'GK', isGK: true, stamina: 100 },
  { id: 'cb-1', name: 'Zagueiro 1', pos: 'CB', isGK: false, stamina: 90 },
  { id: 'cb-2', name: 'Zagueiro 2', pos: 'CB', isGK: false, stamina: 85 },
  { id: 'lb-1', name: 'Lateral E', pos: 'LB', isGK: false, stamina: 80 },
  { id: 'rb-1', name: 'Lateral D', pos: 'RB', isGK: false, stamina: 80 },
  { id: 'cm-1', name: 'Volante', pos: 'CDM', isGK: false, stamina: 75 },
  { id: 'cm-2', name: 'Meia 1', pos: 'CM', isGK: false, stamina: 70 },
  { id: 'cm-3', name: 'Meia 2', pos: 'CAM', isGK: false, stamina: 65 },
  { id: 'lw-1', name: 'Ponta E', pos: 'LW', isGK: false, stamina: 60 },
  { id: 'rw-1', name: 'Ponta D', pos: 'RW', isGK: false, stamina: 60 },
  { id: 'st-1', name: 'Centroavante Cansado', pos: 'ATA', isGK: false, stamina: 40 }
];

const mockLiveState = {
  home: 'Brasília',
  away: 'Samambaia',
  minute: 58,
  subsLeft: 5,
  homePlayers: mockHomePlayers,
  awayPlayers: [],
  events: []
};

const subResult = window.triggerPlayerCareerSubstitution(mockLiveState);
assert.strictEqual(subResult, true, 'Substituição deve retornar sucesso');
assert.strictEqual(mockLiveState.controlledAthleteOnPitch, true, 'Flag do atleta em campo deve ser verdadeira');
assert.strictEqual(mockHomePlayers[0].isGK, true, 'O goleiro (slot 0) NÃO pode ter sido substituído');
assert.notStrictEqual(mockHomePlayers[0].id, userAttacker.id, 'O atleta do usuário não pode estar no gol');

const subbedPlayer = mockHomePlayers.find(p => p.isControlledAthlete);
assert(subbedPlayer, 'Atleta controlado deve estar em campo após substituição');
assert.strictEqual(subbedPlayer.name, userAttacker.name);
assert.strictEqual(subbedPlayer.canScore, true);
assert.strictEqual(subbedPlayer.canShoot, true);
console.log(`   ✅ Substituição realizada aos 58': Atleta entrou no lugar de jogador de linha, goleiro 100% protegido!`);

// -------------------------------------------------------------
// Teste 5: Priorização de Passe para o Craque
// -------------------------------------------------------------
console.log('5. Testando priorização de passe para o craque do usuário...');
const passer = mockHomePlayers[6]; // Meia central
passer.team = 'home';
passer.x = 55;
passer.y = 50;

subbedPlayer.team = 'home';
subbedPlayer.x = 75;
subbedPlayer.y = 50;
subbedPlayer.isControlledAthlete = true;

const target = window.selectLivePassTarget(mockHomePlayers, passer);
assert.strictEqual(target.name, subbedPlayer.name, 'Companheiro deve priorizar passe para o craque do usuário');
console.log('   ✅ Craque do usuário prioritário nas jogadas ofensivas!');

console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO ABSOLUTO!');
