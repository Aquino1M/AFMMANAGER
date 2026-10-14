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

// When the primary competition ended, calendar advancement must target the pending
// Copa fixture (same effective Wednesday used by the calendar UI), not an invalid
// next-round index from the completed primary schedule.
{
  const sourceText = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
  const fnStart = sourceText.indexOf('function advanceCalendarDays(');
  const fnEnd = sourceText.indexOf('\n// MÁQUINA DE ESTADOS DA PARTIDA AO VIVO', fnStart);
  const fn = sourceText.slice(fnStart, fnEnd).trim();
  const state = {
    club:'Brasília', date:'2027-02-07', season:2027, round:0, schedule:[], squad:[], news:[],
    isPreSeason:false, preSeasonDays:0,
    copaData:{version:2,season:2027,phases:{'2ª Fase':{name:'2ª Fase',isoDate:'2027-03-11',fixtures:[{home:'Brasília',away:'Brasiliense',isoDate:'2027-03-11',score:null,winner:null}]}}},
    history:[]
  };
  const effects = {dayProcesses:0,saves:0,renders:0,simulatedCup:0,toasts:[]};
  const normalizer = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const midweek = iso => { const d=new Date(`${iso}T12:00:00`); const day=d.getDay(); if(day!==3)d.setDate(d.getDate()+(3-day)); return d.toISOString().slice(0,10); };
  const pendingStart = sourceText.indexOf('function getPendingClubCompetitions(');
  const pendingEnd = sourceText.indexOf('\nfunction seasonCompetitionsComplete',pendingStart);
  const pendingFn = sourceText.slice(pendingStart,pendingEnd).trim();
  const playCupStart = sourceText.indexOf('function playCopaDoBrasilFixture(');
  const playCupEnd = sourceText.indexOf('\nfunction ',playCupStart + 10);
  const playCupFn = sourceText.slice(playCupStart,playCupEnd).trim();
  const nextStart = sourceText.indexOf('function getNextPendingClubFixture(');
  const nextEnd = sourceText.indexOf('\nfunction openNextPendingCompetitionFixture',nextStart);
  const nextFn = sourceText.slice(nextStart,nextEnd).trim();
  const openPendingStart = sourceText.indexOf('function openNextPendingCompetitionFixture(');
  const openPendingEnd = sourceText.indexOf('\nfunction generatedRosterForClub',openPendingStart);
  const openPendingFn = sourceText.slice(openPendingStart,openPendingEnd).trim();
  const gateStart = sourceText.indexOf('function canStartMatch(');
  const gateEnd = sourceText.indexOf('\nlet isAdvancingTime',gateStart);
  const gateFn = sourceText.slice(gateStart,gateEnd).trim();
  const context = {
    state,window:{COMPETITION_TEAMS:{}},isAdvancingTime:false,
    norm:normalizer,compById:()=>({name:'Campeonato Candango'}),getDateForRound:(round,season)=>`${season}-01-17`,
    getStateCompData:()=>({teams:[],fixtures:[]}),getCopaDoBrasilState:()=>state.copaData,ensureMidweekDate:midweek,
    processStadiumConstructionDay:()=>effects.dayProcesses++,processContinentalFixturesBefore:()=>{},expireStadiumEventConfirmation:()=>{},
    isTransferWindowOpen:()=>false,processCopaDoBrasilCalendar:()=>{},repairSaveIfCorrupted:()=>false,
    save:()=>effects.saves++,render:()=>effects.renders++,toast:message=>effects.toasts.push(message),formatDatePtBr:date=>date,
    checkIncomingPlayerBids:()=>{},liveMatchState:null,calendarFilter:'ALL',copaCurrentPhase:'2ª Fase',
    simulateScore:()=>[2,1],calcValueMi:()=>1,playerOverall:()=>70,playerKey:p=>p.id,
    marketUniverse:()=>[],addPlayerMatchStats:()=>{},simulateUserGoalEvents:()=>[],openPressConferenceModal:()=>{},
    getPendingClubCompetitions:null,getNextPendingClubFixture:null,
    curComp:()=>({id:'bra-est-df',name:'Campeonato Candango'}),Math,Date,console
  };
  vm.runInNewContext(`${pendingFn}\n${nextFn}\n${openPendingFn}\n${gateFn}\n${fn}\n${playCupFn}\nthis.pending=getPendingClubCompetitions;this.nextFixture=getNextPendingClubFixture;this.openPending=openNextPendingCompetitionFixture;this.gate=canStartMatch;this.advance=advanceCalendarDays;this.playCup=playCopaDoBrasilFixture;`,context,{filename:'pending-cup-calendar-flow'});
  const pending = context.pending(state);
  assert.equal(pending.length,1,'Only the Copa fixture should remain pending in the minimal fixture.');
  assert.equal(pending[0].id,'bra-cup');
  assert.equal(pending[0].date,'2027-03-10','Pending detector must use the same Wednesday as the calendar card.');
  const gate = context.gate(undefined,state);
  assert.equal(gate.status,'other_competitions_pending','End of the primary schedule must route to pending competitions, not season_finished.');
  assert.equal(gate.nextDate,'2027-03-10');
  assert.equal(context.nextFixture(state).id,'bra-cup');
  context.view = 'central';
  const opened = context.openPending(context.nextFixture(state));
  assert.equal(opened,true,'Opening the next pending competition should succeed.');
  assert.equal(context.view,'central','Opening next competition must stay on Central, not Calendar.');
  assert.equal(state.date,'2027-03-10','The Central handler must advance to the pending Copa date.');
  const phase = Object.values(state.copaData.phases).find(item => item.fixtures?.some(f => f.home === 'Brasília' && f.away === 'Brasiliense'));
  assert(phase,'The migrated Copa phase containing Brasília x Brasiliense must remain present.');
  assert.equal(phase.fixtures[0].score,null,'Opening the next competition must not auto-simulate the user fixture.');
  assert.equal(phase.fixtures[0].winner,null,'Opening the next competition must not assign a winner.');
  assert(effects.toasts.some(message=>message.toLowerCase().includes('confronto aberto')),'The handler should acknowledge the competition that was opened.');
  const dateDiff=Math.round((new Date(`${pending[0].date}T12:00:00`)-new Date(`${state.date}T12:00:00`))/86400000);
  assert.equal(dateDiff,0,'The Central handler should have already advanced to the effective Cup date.');
  assert.equal(effects.dayProcesses,31,'The Central handler must process every day between 07/02 and 10/03, including the day-boundary logic in advanceCalendarDays.');
  assert(effects.toasts.some(message=>message.includes('próximo jogo')),'Calendar advancement should confirm its destination.');
  assert.equal(midweek(phase.fixtures[0].isoDate),state.date,'The pending Copa card is due on the exact date reached by the calendar.');
  context.playCup(0,'2ª Fase');
  assert(phase.fixtures[0].played === true && Boolean(phase.fixtures[0].score),'Explicitly playing the Copa fixture must persist a result.');
  assert(state.history.some(match=>match.competitionId==='bra-cup'&&match.h==='Brasília'&&match.a==='Brasiliense'),'Playing the fixture registers the match in the season history.');
  console.log('PASS: Candango ended + Brasília x Brasiliense pending: date moves 07/02→10/03, card date matches, game is not auto-simulated, and explicit play records result/history.');
}

// Rodada vazia deve recuperar o índice e sincronizar a data para o próximo round válido.
{
  const gameSource = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
  const fnStart = gameSource.indexOf('function simulateQuickRound(){');
  const fnEnd = gameSource.indexOf('\n// CERIMÔNIA DE CAMPEÃO', fnStart);
  assert(fnStart >= 0 && fnEnd > fnStart, 'Não foi possível localizar simulateQuickRound() real.');
  const fn = gameSource.slice(fnStart, fnEnd).trim();
  const state = { club:'Criciúma', round:0, season:2031, date:'2031-01-01', schedule:[[], [['Criciúma','Adversário']], [['Criciúma','Outro']]], news:[], isPreSeason:false, preSeasonDays:0 };
  const effects = { saves:0, renders:0, toasts:[] };
  const context = {
    state, isSimulatingQuickRound:false,
    canStartMatch:()=>({canStart:false,status:'no_fixture',isBye:true}),
    currentFixtures:()=>state.schedule[state.round] || [],
    curComp:()=>({id:'bra-a',type:'league',name:'Brasileirão Série A'}),
    repairSaveIfCorrupted:()=>false,
    getDateForRound:(round,season)=>`${season}-01-${String(round+1).padStart(2,'0')}`,
    save:()=>effects.saves++, render:()=>effects.renders++, toast:m=>effects.toasts.push(m),
    showEndOfSeasonModal:()=>{throw new Error('Não deveria encerrar temporada enquanto existe rodada válida futura.');},
    norm:value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(),
    console
  };
  vm.runInNewContext(`${fn}\nthis.run = simulateQuickRound;`, context, {filename:'js/game.js:simulateQuickRound'});
  context.run();
  assert.equal(state.round,1,'Deve recuperar para a próxima rodada não vazia.');
  assert.equal(state.date,'2031-01-02','A data precisa acompanhar a rodada recuperada.');
  assert.equal(effects.saves,1);
  assert(effects.toasts.some(message=>message.includes('Calendário recuperado')));
  console.log('PASS: rodada vazia recupera round e data no simulateQuickRound real.');
}
