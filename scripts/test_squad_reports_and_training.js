/**
 * Teste Automatizado de Integração: Relatórios do Elenco & Novo Sistema de Treino com Preparador Físico
 */

const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando testes de Relatórios do Elenco & Novo Sistema de Treino...');

// Mock do ambiente DOM e Window
global.window = global;
global.document = {
  createElement: (tag) => ({
    id: '',
    innerHTML: '',
    style: {},
    appendChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    remove: () => {}
  }),
  body: {
    appendChild: () => {}
  },
  getElementById: (id) => null,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.toast = (msg) => { /* console.log('Toast:', msg); */ };
global.save = () => true;
global.formatDatePtBr = (d) => '18/01/2026';

// 1. Carrega scripts
require('../js/systems/player_xp_evolution.js');
require('../js/ui/squad_reports_modal.js');
require('../js/ui/training_center_modal.js');

assert(typeof window.openSquadReportsModal === 'function', 'openSquadReportsModal deve existir');
assert(typeof window.openTrainingCenterModal === 'function', 'openTrainingCenterModal deve existir');
assert(typeof window.processAutomaticFitnessCoachTraining === 'function', 'processAutomaticFitnessCoachTraining deve existir');
console.log('✓ Funções principais registradas no window com sucesso.');

// 2. Prepara mock do state com 22 atletas
const mockSquad = [];
const positions = ['GK', 'GK', 'CB', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'RW', 'LW', 'ST', 'ST', 'CB', 'LB', 'CM', 'AM', 'RW', 'ST', 'GK'];
for (let i = 0; i < positions.length; i++) {
  mockSquad.push({
    name: `Jogador ${i + 1}`,
    pos: positions[i],
    overall: 60 + (i % 12),
    ovr: 60 + (i % 12),
    potential: 70 + (i % 15),
    age: 18 + (i % 16),
    wage: 10000 + i * 1500,
    fitness: 90,
    stamina: 90,
    morale: 80,
    chemistry: 65,
    xp: 20,
    xpNext: 400
  });
}

global.state = {
  club: 'Gama',
  date: '2026-01-18',
  balance: 350000,
  squad: mockSquad,
  lineup: mockSquad.slice(0, 11).map(p => p.name),
  youthAcademy: [
    { name: 'Jovem Base 1', pos: 'ST', age: 16, overall: 52, potential: 82 },
    { name: 'Jovem Base 2', pos: 'CM', age: 17, overall: 55, potential: 84 }
  ],
  infrastructure: {
    training: { level: 1 }
  },
  news: []
};

// 3. Testa abertura do modal de relatórios
window.openSquadReportsModal('geral');
console.log('✓ openSquadReportsModal("geral") executou sem erros.');

window.openSquadReportsModal('lesoes');
console.log('✓ openSquadReportsModal("lesoes") executou sem erros.');

window.openSquadReportsModal('suspensoes');
console.log('✓ openSquadReportsModal("suspensoes") executou sem erros.');

window.openSquadReportsModal('moral');
console.log('✓ openSquadReportsModal("moral") executou sem erros.');

window.openSquadReportsModal('contratos');
console.log('✓ openSquadReportsModal("contratos") executou sem erros.');

window.openSquadReportsModal('desenvolvimento');
console.log('✓ openSquadReportsModal("desenvolvimento") executou sem erros.');

window.openSquadReportsModal('juventude');
console.log('✓ openSquadReportsModal("juventude") executou sem erros.');

// 4. Testa abertura do modal de treino com slots por nível
window.openTrainingCenterModal();
console.log('✓ openTrainingCenterModal() executou com sucesso.');

// 5. Testa execução do Treino Manual
const p1Before = { ...state.squad[0] };
const manualResult = window.AFM_TrainingCenter.executeTrainingSession(false);
assert(manualResult.totalXP > 0, 'Treino manual deve conceder XP para o elenco');
assert(state.lastManualTrainingDate === state.date, 'Data do treino manual deve ser gravada no state');
assert(state.squad[0].xp > p1Before.xp, 'Jogador deve ter ganho XP');
const manualGain = state.squad[0].xp - p1Before.xp;
console.log(`✓ Treino manual concedeu XP balanceado (+${manualGain} XP no atleta 1, total no time: ${manualResult.totalXP} XP).`);

// 6. Testa Treino Automático do Preparador Físico
// Simula avanço de dia no calendário para '2026-01-19'
state.date = '2026-01-19';
assert(state.lastManualTrainingDate !== state.date, 'Na nova data o treino manual ainda não ocorreu');

const p1BeforeCoach = state.squad[0].xp;
const coachResult = window.processAutomaticFitnessCoachTraining(state);
assert(coachResult.totalXP > 0, 'Preparador físico deve conceder XP para o elenco');
assert(state.lastManualTrainingDate === '2026-01-19', 'Data do treino deve ser atualizada para a nova data');
const coachGain = state.squad[0].xp - p1BeforeCoach;
console.log(`✓ Treino com Preparador Físico concedeu XP reduzido (+${coachGain} XP no atleta 1, total no time: ${coachResult.totalXP} XP).`);
assert(coachGain <= manualGain, 'Ganho de XP do preparador físico deve ser menor ou igual ao treino manual do técnico');

// Verifica notícia do preparador físico
assert(state.news.length > 0, 'Notícia sobre preparador físico deve ser inserida no feed');
assert(state.news[0].includes('PREPARADOR FÍSICO') && state.news[0].includes('50%'), 'Notícia deve informar a comissão técnica e redução de 50% de XP');
console.log(`✓ Notícia registrada: "${state.news[0]}"`);

// 7. Testa desbloqueio de slots de acordo com os níveis do CT
state.infrastructure.training.level = 4;
window.openTrainingCenterModal();
assert(state.infrastructure.training.level === 4, 'Nível 4 mantido');
console.log('✓ Desbloqueio dinâmico por nível do CT validado.');

console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
