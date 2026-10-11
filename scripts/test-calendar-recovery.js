const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
const start = source.indexOf('function advanceCalendarDays(');
const end = source.indexOf('\n// MÁQUINA DE ESTADOS DA PARTIDA AO VIVO', start);
assert(start >= 0 && end > start, 'Não foi possível localizar advanceCalendarDays() no código real.');
const actualFunctionSource = source.slice(start, end).trim();

function makeRunner(startDate, matchDate){
  const state = {
    club: 'Criciúma',
    date: startDate,
    season: Number(startDate.slice(0, 4)),
    round: 0,
    schedule: [[['Criciúma', 'Adversário']]],
    squad: [],
    news: [],
    isPreSeason: false,
    preSeasonDays: 0
  };
  const effects = { saves: 0, renders: 0, dayProcesses: 0, toasts: [] };
  const context = {
    state,
    isAdvancingTime: false,
    norm: value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(),
    repairSaveIfCorrupted: () => false,
    getDateForRound: () => matchDate,
    processStadiumConstructionDay: () => { effects.dayProcesses++; },
    processContinentalFixturesBefore: () => {},
    expireStadiumEventConfirmation: () => {},
    isTransferWindowOpen: () => false,
    processCopaDoBrasilCalendar: () => {},
    save: () => { effects.saves++; },
    render: () => { effects.renders++; },
    toast: message => effects.toasts.push(message),
    formatDatePtBr: date => date,
    console
  };
  vm.runInNewContext(`${actualFunctionSource}\nthis.advanceCalendarDaysUnderTest = advanceCalendarDays;`, context, { filename: 'js/game.js:advanceCalendarDays' });
  return { context, state, effects };
}

// Uma partida cuja data ficou para trás não pode fazer o calendário parar em zero dias.
{
  const { context, state, effects } = makeRunner('2031-04-10', '2031-04-05');
  context.advanceCalendarDaysUnderTest(2, true);
  assert.equal(state.date, '2031-04-12');
  assert.equal(effects.dayProcesses, 2, 'Os processadores diários devem ser executados uma vez por dia avançado.');
  assert.equal(effects.saves, 1);
  assert.equal(effects.renders, 1);
  console.log('PASS: data atrasada não trava advanceCalendarDays().');
}

// Uma data futura ainda deve fazer o avanço parar exatamente no dia do jogo.
{
  const { context, state, effects } = makeRunner('2031-04-01', '2031-04-03');
  context.advanceCalendarDaysUnderTest(5, true);
  assert.equal(state.date, '2031-04-03');
  assert.equal(effects.dayProcesses, 2, 'Só dois dias devem ser processados até a data marcada.');
  console.log('PASS: data futura mantém a parada no dia da partida.');
}

console.log('Todos os testes de recuperação do calendário passaram.');
