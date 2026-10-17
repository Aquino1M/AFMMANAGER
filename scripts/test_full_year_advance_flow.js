const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- TESTANDO FLUXO COMPLETO DE AVANÇO DE DIAS E CALENDÁRIO ---');

// Mock DOM
global.document = {
  getElementById: (id) => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.window = global;
global.window.addEventListener = () => {};
global.toast = () => {};

// Carrega scripts principais
const calendarFixCode = fs.readFileSync(path.join(__dirname, '../js/core/calendar_and_day_advance_fix.js'), 'utf8');
eval(calendarFixCode);

// Carrega database e competitions
const dbCode = fs.readFileSync(path.join(__dirname, '../js/database.js'), 'utf8');
eval(dbCode);

// Simulação de carreira iniciando no Ceará
global.state = {
  club: 'Ceará',
  season: 2026,
  seasonYear: 2026,
  date: '2026-01-11',
  currentDate: '2026-01-11',
  currentDateFormatted: '11 de janeiro de 2026',
  round: 0,
  compId: 'bra-est-ce',
  competitionTeams: {
    'bra-a': ['Flamengo', 'Palmeiras', 'Ceará', 'Fortaleza', 'São Paulo', 'Corinthians'],
    'bra-est-ce': ['Ceará', 'Fortaleza', 'Ferroviário', 'Floresta', 'Atlético-CE']
  },
  schedule: [
    [['Ceará', 'Fortaleza'], ['Ferroviário', 'Floresta']],
    [['Floresta', 'Ceará'], ['Fortaleza', 'Atlético-CE']],
    [['Ceará', 'Atlético-CE'], ['Ferroviário', 'Fortaleza']]
  ],
  isPreSeason: true,
  preSeasonDays: 4,
  transferWindowActive: true,
  transferWindowDay: 1,
  transferWindowHour: 0,
  squad: [
    { name: 'Goleiro', pos: 'GOL', overall: 75, stamina: 100, energy: 100 },
    { name: 'Zagueiro 1', pos: 'ZAG', overall: 74, stamina: 100, energy: 100 },
    { name: 'Zagueiro 2', pos: 'ZAG', overall: 73, stamina: 100, energy: 100 },
    { name: 'Lateral D', pos: 'LAD', overall: 72, stamina: 100, energy: 100 },
    { name: 'Lateral E', pos: 'LAE', overall: 72, stamina: 100, energy: 100 },
    { name: 'Volante', pos: 'VOL', overall: 74, stamina: 100, energy: 100 },
    { name: 'Meia 1', pos: 'MEI', overall: 76, stamina: 100, energy: 100 },
    { name: 'Meia 2', pos: 'MEI', overall: 75, stamina: 100, energy: 100 },
    { name: 'Ponta D', pos: 'ATA', overall: 77, stamina: 100, energy: 100 },
    { name: 'Ponta E', pos: 'ATA', overall: 76, stamina: 100, energy: 100 },
    { name: 'Centroavante', pos: 'ATA', overall: 78, stamina: 100, energy: 100 }
  ],
  lineup: ['Goleiro', 'Zagueiro 1', 'Zagueiro 2', 'Lateral D', 'Lateral E', 'Volante', 'Meia 1', 'Meia 2', 'Ponta D', 'Ponta E', 'Centroavante'],
  history: []
};

global.save = () => {};
global.render = () => {};
global.formatDatePtBr = (d) => d;
global.getDateForRound = (r, s) => {
  const dates = ['2026-01-18', '2026-01-25', '2026-02-01'];
  return dates[r] || '2026-02-15';
};
global.getActualCurrentMatch = () => {
  if (state.round >= state.schedule.length) return null;
  const f = state.schedule[state.round][0];
  return { date: getDateForRound(state.round, 2026), home: f[0], away: f[1], fixture: f, isHome: true };
};
global.getTransferWindowState = () => {
  if (!state.transferWindowActive) return { active: false };
  const day = Number(state.transferWindowDay) || 1;
  const hour = Number(state.transferWindowHour) || 0;
  const isDeadlineDay = day === 4;
  return {
    active: true,
    day,
    maxDays: 4,
    hour,
    isDeadlineDay,
    text: isDeadlineDay ? `Deadline Day (${hour}:00)` : `Dia ${day} de 4`
  };
};

const gameJsCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const funcRegex = /function advanceTransferWindowDay\(\)[\s\S]*?window\.skipPreSeason = skipPreSeason;\s*\}/;
const matchFuncs = gameJsCode.match(funcRegex);
eval(matchFuncs[0]);

// 1. Simula os 4 dias da janela
console.log('1. Avançando dia 1...');
advanceTransferWindow(24);
assert.strictEqual(state.transferWindowDay, 2);

console.log('2. Avançando dia 2...');
advanceTransferWindow(24);
assert.strictEqual(state.transferWindowDay, 3);

console.log('3. Avançando dia 3...');
advanceTransferWindow(24);
assert.strictEqual(state.transferWindowDay, 4);
assert.strictEqual(state.transferWindowHour, 0);

console.log('4. Avançando horas do Deadline Day (6h em 6h)...');
advanceTransferWindow(6);
assert.strictEqual(state.transferWindowHour, 6);
advanceTransferWindow(6);
assert.strictEqual(state.transferWindowHour, 12);
advanceTransferWindow(6);
assert.strictEqual(state.transferWindowHour, 18);
advanceTransferWindow(6);
assert.strictEqual(state.transferWindowHour, 24);
assert.strictEqual(state.transferWindowActive, false);
assert.strictEqual(state.isPreSeason, false);
assert.strictEqual(state.date, '2026-01-18');
console.log('✅ Janela de transferências encerrada com sucesso, data posicionada em 18/01/2026 para a estreia!');

// 5. Simula avanço de calendário no meio da temporada
console.log('5. Avançando calendário até a próxima rodada oficial...');
state.date = '2026-01-18';
global.AFM_CalendarFix.advanceDaysGuaranteed(state, 3);
assert.strictEqual(state.date, '2026-01-21');
console.log('✅ Calendário avançou +3 dias (21/01/2026) sem travar!');

console.log('\n--- SIMULAÇÃO DE FLUXO CONCLUÍDA COM 100% DE SUCESSO! ---');
