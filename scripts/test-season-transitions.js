const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const projectRoot = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(projectRoot, 'js/game.js'), 'utf8');
const integritySource = fs.readFileSync(path.join(projectRoot, 'js/core/competition_integrity.js'), 'utf8');
const tournamentEngineSource = fs.readFileSync(path.join(projectRoot, 'js/core/tournament_engine.js'), 'utf8');
const start = source.indexOf('function executeSeasonTransitions(');
const end = source.indexOf('\nfunction advanceSeasonYear(', start);
assert(start >= 0 && end > start, 'Não foi possível localizar executeSeasonTransitions() no código real.');
const actualFunctionSource = source.slice(start, end).trim();
const repairStart = source.indexOf('function repairLegacyNationalCompetitionRosters(');
const repairEnd = source.indexOf('\nfunction repairSaveIfCorrupted(', repairStart);
assert(repairStart >= 0 && repairEnd > repairStart, 'Não foi possível localizar o reparo de rosters legados.');
const actualRepairSource = source.slice(repairStart, repairEnd).trim();
const fullRepairEnd = source.indexOf('\nwindow.repairSaveIfCorrupted', repairStart);
assert(fullRepairEnd > repairStart, 'Não foi possível localizar a função completa de reparo do save.');
const actualFullRepairSource = source.slice(repairStart, fullRepairEnd).trim();
const advanceStart = source.indexOf('function advanceSeasonYear(');
const advanceEnd = source.indexOf('\nfunction generateWorldRegens(', advanceStart);
assert(advanceStart >= 0 && advanceEnd > advanceStart, 'Não foi possível localizar a virada real de temporada.');
const actualAdvanceSeasonYear = source.slice(advanceStart, advanceEnd).trim();
const singleRoundRobinStart = source.indexOf('function roundRobinSingleLeg(');
const singleRoundRobinEnd = source.indexOf('\nfunction leaguePhaseSchedule(', singleRoundRobinStart);
const groupScheduleStart = source.indexOf('function groupSchedule(');
const groupScheduleEnd = source.indexOf('\nfunction firstKnockoutRound(', groupScheduleStart);
const buildScheduleStart = source.indexOf('function buildSchedule(');
const buildScheduleEnd = source.indexOf('\nfunction defaultInfrastructure(', buildScheduleStart);
assert(singleRoundRobinStart >= 0 && singleRoundRobinEnd > singleRoundRobinStart, 'Não foi possível localizar o calendário de turno único.');
assert(groupScheduleStart >= 0 && groupScheduleEnd > groupScheduleStart, 'Não foi possível localizar o gerador de grupos do calendário.');
assert(buildScheduleStart >= 0 && buildScheduleEnd > buildScheduleStart, 'Não foi possível localizar buildSchedule().');
const actualSeriesDScheduleSource = [source.slice(singleRoundRobinStart,singleRoundRobinEnd), source.slice(groupScheduleStart,groupScheduleEnd), source.slice(buildScheduleStart,buildScheduleEnd)].join('\n');

const nationalIds = ['bra-a', 'bra-b', 'bra-c', 'bra-d'];
const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const clone = value => JSON.parse(JSON.stringify(value));
const names = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);

function makeTeams(){
  const map = {
    'bra-a': names('AFM-TEST-A', 20),
    'bra-b': names('AFM-TEST-B', 20),
    'bra-c': names('AFM-TEST-C', 20),
    'bra-d': names('AFM-TEST-D', 96),
    'bra-est-sc': ['Criciúma', ...names('AFM-TEST-SC', 19)],
    'bra-est-sp': names('AFM-TEST-SP', 20)
  };
  map['bra-b'][17] = 'Criciúma';
  return map;
}

function createRunner(compId){
  const map = makeTeams();
  const baseMap = clone(map);
  const state = { club: 'Criciúma', compId, season: 2032, news: [], competitionTeams: clone(map) };
  const context = {
    window: { COMPETITION_TEAMS: map, AFM_COMPETITION_INTEGRITY: null }, state, teamMap: map, BASE_COMPETITION_TEAMS: baseMap, norm, clone,
    compById: id => ({ id, name: ({ 'bra-a': 'Brasileirão Série A', 'bra-b': 'Brasileirão Série B', 'bra-c': 'Brasileirão Série C', 'bra-d': 'Brasileirão Série D' })[id] || id, teams: id === 'bra-d' ? 96 : 20 })
  };
  vm.runInNewContext(`${actualFunctionSource}\nthis.runTransition = executeSeasonTransitions;`, context, { filename: 'js/game.js:executeSeasonTransitions' });
  return { context, state, map };
}

function membership(map, club){
  return nationalIds.filter(id => (map[id] || []).some(name => norm(name) === norm(club)));
}

function auditRosterSizesAndDuplicates(map){
  const expectedSizes = { 'bra-a': 20, 'bra-b': 20, 'bra-c': 20, 'bra-d': 96 };
  for(const [id, expected] of Object.entries(expectedSizes)) assert.equal((map[id] || []).length, expected, `${id} deve ter ${expected} clubes`);
  const all = nationalIds.flatMap(id => map[id].map(norm));
  assert.equal(new Set(all).size, all.length, 'Não pode haver clubes duplicados entre as Séries A–D.');
}

// Permanent isolation rule: a season transition may modify only this career's
// competitionTeams. The shared/static catalog must remain byte-for-byte intact.
{
  const { context, state } = createRunner('bra-b');
  const baseSnapshot = JSON.stringify(context.BASE_COMPETITION_TEAMS);
  const globalSnapshot = JSON.stringify(context.window.COMPETITION_TEAMS);
  context.runTransition('bra-b', [{ name: 'Criciúma', p: 3 }], 'bra-c', 'bra-b');
  assert.notEqual(JSON.stringify(state.competitionTeams), globalSnapshot, 'A promoção/rebaixamento precisa gerar roster privado do save.');
  assert.equal(JSON.stringify(context.BASE_COMPETITION_TEAMS), baseSnapshot, 'A base imutável não pode ser alterada.');
  assert.equal(JSON.stringify(context.window.COMPETITION_TEAMS), globalSnapshot, 'O catálogo global não pode receber a transição da carreira.');
  assert.equal(JSON.stringify(context.teamMap), globalSnapshot, 'teamMap deve permanecer igual ao catálogo-base.');
  const secondCareer = { club: 'Outro Clube', compId: 'bra-b', competitionTeams: clone(context.BASE_COMPETITION_TEAMS) };
  assert.deepEqual(membership(secondCareer.competitionTeams, 'Criciúma'), ['bra-b'], 'Uma nova carreira deve começar com a divisão-base, não a divisão conquistada em outro save.');
  console.log('PASS: promoção/rebaixamento isolados; catálogo global e nova carreira permanecem no estado-base.');
}

assert.match(actualAdvanceSeasonYear, /finalSeasonSnapshot/);
assert.match(actualAdvanceSeasonYear, /executeSeasonTransitions\(finishedCompId, rankingTable, requestedDestinationCompId, sourceNationalDivision, finalSeasonSnapshot\)/);
assert.ok(actualAdvanceSeasonYear.indexOf('finalSeasonSnapshot') < actualAdvanceSeasonYear.indexOf('state.season++'), 'O snapshot precisa capturar o ranking antes da limpeza/virada do ano.');
console.log('PASS: advanceSeasonYear captura resultados antes da virada e encaminha snapshot persistível ao pipeline crítico.');

// A divisão nacional válida não pode ser revertida por reparos do catálogo estadual.
{
  const map = makeTeams();
  map['bra-d'] = [...map['bra-d'].slice(0, 95), 'Brasília'];
  map['bra-est-df'] = ['Brasília', ...names('AFM-DF', 9)];
  const state = {
    club: 'Brasília', compId: 'bra-d', season: 2028,
    competition: 'Campeonato Brasileiro Série D', currentLeague: 'Campeonato Brasileiro Série D',
    news: [], round: 0, history: [], competitionTeams: clone(map),
    teams: map['bra-d'].map(name => ({ name, strength: 60, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0, form: [] })),
    schedule: [[['Brasília', map['bra-d'][0]]]], squad: [], date: '2028-01-01',
    balance: 1000, income: 0, expense: 0, version: 4
  };
  const context = {
    window: { COMPETITION_TEAMS: map }, state, teamMap: map, BASE_COMPETITION_TEAMS: clone(map), norm, clone,
    compById: id => ({ id, name: ({'bra-a':'Campeonato Brasileiro Série A','bra-b':'Campeonato Brasileiro Série B','bra-c':'Campeonato Brasileiro Série C','bra-d':'Campeonato Brasileiro Série D','bra-est-df':'Campeonato Candango'})[id] || id, teams: id === 'bra-d' ? 96 : 20 }),
    getClubPrimaryCompetitionId: (_club, preferred) => preferred || 'bra-est-df',
    clubByName: () => ({ competition: 'Campeonato Candango', currentLeague: 'Campeonato Candango' }),
    strength: () => 60, teamStrengthByName: () => 60,
    buildSchedule: (_comp, teams) => [[['Brasília', teams.find(name => norm(name) !== norm('Brasília')) || 'Adversário']]],
    STORAGE: 'afm_test_save', localStorage: { setItem(){}, getItem(){ return null; } }, recordAFMError(){},
    getActiveAccount: () => null, getStoredAccounts: () => [], saveStoredAccounts(){}, playerSalary: () => 0, fmtMoney: value => String(value)
  };
  vm.runInNewContext(`${actualFullRepairSource}\nthis.repairSave = repairSaveIfCorrupted;`, context, { filename: 'js/game.js:repairSaveIfCorrupted-promoted-Brasilia' });
  context.repairSave(state);
  assert.equal(state.compId, 'bra-d', 'O reparo não pode mandar Brasília de volta ao Candango após o acesso.');
  assert.equal(state.competition, 'Campeonato Brasileiro Série D');
  assert.equal(state.teams.length, 96);
  assert.equal(state.teams.some(team => norm(team.name) === 'brasilia'), true);
  assert.deepEqual(membership(state.competitionTeams, 'Brasília'), ['bra-d']);
  assert.equal(JSON.stringify(context.window.COMPETITION_TEAMS), JSON.stringify(map), 'O reparo do save não pode alterar o catálogo global.');
  console.log('PASS: save do Brasília promovido permanece na Série D após reparo e sincroniza tabela/roster.');
}

// 1. Rebaixamento explícito B → C: carreira e listas precisam concordar.
{
  const { context, state, map } = createRunner('bra-b');
  const originalA = [...map['bra-a']];
  const originalD = [...map['bra-d']];
  const clubDisplacedFromC = map['bra-c'][map['bra-c'].length - 1];
  context.runTransition('bra-b', [{ name: 'Criciúma', p: 3 }], 'bra-c', 'bra-b');
  assert.equal(state.compId, 'bra-c');
  assert.deepEqual(membership(state.competitionTeams, 'Criciúma'), ['bra-c']);
  assert.deepEqual(membership(state.competitionTeams, clubDisplacedFromC), ['bra-b'], 'O clube que cedeu a vaga na Série C deve ocupar a vaga aberta na Série B.');
  assert.equal(JSON.stringify(map['bra-a']), JSON.stringify(originalA), 'A Série A não deve ser reclassificada artificialmente.');
  assert.equal(JSON.stringify(map['bra-d']), JSON.stringify(originalD), 'A Série D não deve ser reclassificada artificialmente.');
  auditRosterSizesAndDuplicates(map);
  assert.equal(state.competitionTeams['bra-c'].some(name => norm(name) === norm('Criciúma')), true, 'O mapa persistido no save deve refletir a Série C.');
  console.log('PASS: rebaixamento explícito B → C, roster e save sincronizados.');
}

// 2. Sem destino explícito não há movimento de divisão na virada.
{
  const { context, state, map } = createRunner('bra-b');
  const originalA = [...map['bra-a']];
  const originalC = [...map['bra-c']];
  context.runTransition('bra-b', [{ name: 'Criciúma', p: 3 }], null, 'bra-b');
  assert.equal(state.compId, 'bra-b');
  assert.deepEqual(membership(state.competitionTeams, 'Criciúma'), ['bra-b']);
  assert.equal(JSON.stringify(map['bra-a']), JSON.stringify(originalA));
  assert.equal(JSON.stringify(map['bra-c']), JSON.stringify(originalC));
  auditRosterSizesAndDuplicates(map);
  console.log('PASS: permanência na Série B sem destino explícito.');
}

// 3. Encerrar estadual sem acesso nacional não remove a divisão nacional do clube.
{
  const { context, state, map } = createRunner('bra-est-sc');
  context.runTransition('bra-est-sc', [], null, 'bra-b');
  assert.equal(state.compId, 'bra-est-sc', 'A competição estadual não deve ser trocada sem destino.');
  assert.deepEqual(membership(state.competitionTeams, 'Criciúma'), ['bra-b']);
  auditRosterSizesAndDuplicates(map);
  console.log('PASS: encerramento de estadual preserva a divisão nacional.');
}

console.log('Todos os testes de regressão de transição de divisões passaram.');

// 4. Save legado de uma temporada antiga: Série D encolhida/duplicatas devem recuperar A–D.
{
  const baseMap = makeTeams();
  const corruptedMap = clone(baseMap);
  corruptedMap['bra-d'] = names('AFM-LEGACY-D', 20);
  corruptedMap['bra-c'] = [...corruptedMap['bra-a']]; // simula composição incorreta de outra divisão
  const state = { club: 'Criciúma', compId: 'bra-c', season: 2031, news: [], competitionTeams: clone(corruptedMap) };
  const context = {
    window: { COMPETITION_TEAMS: corruptedMap }, state, teamMap: corruptedMap,
    BASE_COMPETITION_TEAMS: baseMap, norm, clone
  };
  vm.runInNewContext(`${actualRepairSource}\nthis.repairLegacy = repairLegacyNationalCompetitionRosters;`, context, { filename: 'js/game.js:repairLegacyNationalCompetitionRosters' });
  assert.equal(context.repairLegacy(state), true, 'A rotina precisa reconhecer a Série D encolhida e a sobreposição.');
  assert.equal(state.compId, 'bra-c');
  assert.deepEqual(membership(state.competitionTeams, 'Criciúma'), ['bra-c']);
  auditRosterSizesAndDuplicates(state.competitionTeams);
  assert.equal(state.competitionTeams['bra-c'].some(name => norm(name) === norm('Criciúma')), true);
  assert.equal(state.news.length, 1, 'O reparo deve deixar um aviso no histórico de notícias.');
  console.log('PASS: recuperação de rosters de save legado sem apagar a carreira.');
}

// 4b. Mesmo com 20 times em cada divisão, uma associação Criciúma=B e carreira=C é inconsistente.
{
  const map = makeTeams();
  const state = { club: 'Criciúma', compId: 'bra-c', season: 2031, news: [], competitionTeams: clone(map) };
  const context = { window: { COMPETITION_TEAMS: map }, state, teamMap: map, BASE_COMPETITION_TEAMS: clone(map), norm, clone };
  vm.runInNewContext(`${actualRepairSource}\nthis.repairLegacy = repairLegacyNationalCompetitionRosters;`, context, { filename: 'js/game.js:repairLegacyNationalCompetitionRosters' });
  assert.equal(context.repairLegacy(state), true, 'A associação errada da divisão do usuário deve ser reparada mesmo com tamanhos válidos.');
  assert.deepEqual(membership(state.competitionTeams, 'Criciúma'), ['bra-c']);
  auditRosterSizesAndDuplicates(state.competitionTeams);
  console.log('PASS: divisão salva prevalece sobre associação histórica do clube.');
}

// 5. A Série D tem 96 participantes: o reparo do save não pode truncá-la para 20.
{
  const map = makeTeams();
  map['bra-b'][17] = 'AFM-TEST-B-18';
  map['bra-d'][10] = 'Criciúma';
  const state = {
    club: 'Criciúma', compId: 'bra-d', season: 2031, version: 4,
    competition: 'Brasileirão Série D', currentLeague: 'Brasileirão Série D',
    news: [], round: 0, history: [], competitionTeams: clone(map),
    teams: map['bra-d'].slice(0, 20).map(name => ({ name, strength: 65, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0, form: [] })),
    schedule: [[['Criciúma', map['bra-d'][0]]]], squad: [], date: '2031-01-01',
    balance: 1000, income: 0, expense: 0
  };
  const context = {
    window: { COMPETITION_TEAMS: map }, state, teamMap: map, BASE_COMPETITION_TEAMS: clone(map), norm, clone,
    compById: id => ({ id, name: id === 'bra-d' ? 'Brasileirão Série D' : id, teams: id === 'bra-d' ? 96 : 20, type: 'groups-knockout' }),
    getClubPrimaryCompetitionId: (_club, preferred) => preferred || 'bra-d',
    clubByName: () => ({ competition: 'Brasileirão Série D', currentLeague: 'Brasileirão Série D' }),
    strength: () => 65,
    teamStrengthByName: () => 65,
    buildSchedule: (_comp, teams) => [[['Criciúma', teams.find(name => norm(name) !== norm('Criciúma')) || 'Adversário']]],
    STORAGE: 'afm_test_save',
    localStorage: { setItem(){}, getItem(){ return null; } },
    recordAFMError(){}, getActiveAccount: () => null, getStoredAccounts: () => [], saveStoredAccounts(){},
    playerSalary: () => 0, fmtMoney: value => String(value)
  };
  vm.runInNewContext(`${actualFullRepairSource}\nthis.repairSaveUnderTest = repairSaveIfCorrupted;`, context, { filename: 'js/game.js:repairSaveIfCorrupted' });
  assert.equal(context.repairSaveUnderTest(state), true, 'O save deve detectar o elenco Série D reduzido.');
  assert.equal(state.teams.length, 96, 'A tabela de Série D precisa ser reconstruída com 96 clubes.');
  assert.equal(state.teams.some(team => norm(team.name) === norm('Criciúma')), true);
  assert.equal(state.schedule.some(round => round.some(fixture => fixture.some(name => norm(name) === norm('Criciúma')))), true);
  console.log('PASS: reparo de save preserva 96 participantes na Série D.');
}
// 6. Clube promovido de um estadual deve aparecer na Série D depois da transição.
{
  const map = makeTeams();
  map['bra-d'] = map['bra-d'].slice(0, 95);
  map['bra-est-df'] = ['Brasília', ...names('AFM-DF', 9)];
  const state = { club: 'Brasília', compId: 'bra-est-df', season: 2027, nextSeasonCompId: 'bra-d', news: [], competitionTeams: clone(map) };
  const context = {
    window: { COMPETITION_TEAMS: map }, state, teamMap: map, BASE_COMPETITION_TEAMS: clone(map), norm, clone,
    compById: id => ({ id, name: ({'bra-a':'Campeonato Brasileiro Série A','bra-b':'Campeonato Brasileiro Série B','bra-c':'Campeonato Brasileiro Série C','bra-d':'Campeonato Brasileiro Série D'})[id] || id, teams: id === 'bra-d' ? 96 : 20 })
  };
  vm.runInNewContext(`${actualFunctionSource}\
this.runTransition = executeSeasonTransitions;`, context, { filename: 'js/game.js:executeSeasonTransitions-state-promotion' });
  context.runTransition('bra-est-df', [], 'bra-d', null);
  assert.equal(state.compId, 'bra-d');
  assert.deepEqual(membership(state.competitionTeams, 'Brasília'), ['bra-d']);
  assert.equal(state.competitionTeams['bra-d'].length, 96);
  assert.equal(state.competitionTeams['bra-d'].some(name => norm(name) === norm('Brasília')), true);
  console.log('PASS: clube promovido de estadual aparece na Série D e no roster persistido.');
}

// 7. Overflow e aliases normalizados não devem trazer de volta um clube truncado.
{
  const map = makeTeams();
  map['bra-d'] = [...names('AFM-OVERFLOW-D', 100), 'AFM-OVERFLOW-D-01', 'afm-overflow-d-02'];
  map['bra-a'][0] = 'Clúbe Duplicado';
  map['bra-b'][0] = 'clube duplicado';
  map['bra-c'][0] = 'Clube Duplicado ';
  map['bra-b'][17] = 'AFM-TEST-B-18';
  map['bra-d'][10] = 'Brasília';
  const truncatedClub = map['bra-d'][99];
  const state = { club: 'Brasília', compId: 'bra-d', season: 2032, news: [], competitionTeams: clone(map) };
  const context = {
    window: { COMPETITION_TEAMS: map }, state, teamMap: map, BASE_COMPETITION_TEAMS: clone(map), norm, clone,
    compById: id => ({ id, name: id, teams: id === 'bra-d' ? 96 : 20 })
  };
  vm.runInNewContext(`${actualFunctionSource}\
this.runTransition = executeSeasonTransitions;`, context, { filename: 'js/game.js:executeSeasonTransitions-overflow' });
  context.runTransition('bra-d', [], null, 'bra-d');
  auditRosterSizesAndDuplicates(state.competitionTeams);
  assert.deepEqual(membership(state.competitionTeams, 'Brasília'), ['bra-d']);
  assert.equal(membership(state.competitionTeams, truncatedClub).length, 0);
  assert.equal(map['bra-a'].filter(name => norm(name) === norm('Clube Duplicado')).length, 1);
  assert.equal(state.competitionTeams['bra-d'].length, 96);
  console.log('PASS: Série D acima de 96 e clubes duplicados normalizados.');
}

// Critical architecture invariants: season results must drive division changes,
// group/playoff rules must be respected, and qualified continental teams persist.
{
  const context = { window: {} };
  vm.runInNewContext(`${tournamentEngineSource}\n${integritySource}`, context, { filename: 'js/core/competition-integrity-test' });
  const integrity = context.window.AFM_COMPETITION_INTEGRITY;
  const roster = Object.fromEntries(integrity.NATIONAL_IDS.map(id => [id, names(`AFM-${id}`, integrity.CAPACITY[id])]));
  const movement = integrity.simulateBrazilSeason(roster, 2028, null, null, context.window.AFM_TOURNAMENT_ENGINE);
  assert.equal(movement.valid, true, 'O planejador de temporada precisa fechar todos os tamanhos e validar unicidade.');
  auditRosterSizesAndDuplicates(movement.rosters);
  assert.equal(movement.playoffWinners['bra-b'].length, 2, 'Série B deve simular exatamente dois vencedores de playoff.');
  assert.equal(movement.playoffWinners['bra-d'].length, 4, 'Série D deve promover diretamente os quatro campeões dos grupos.');
  assert.equal(movement.groupStandings['bra-d'].length, 4, 'Série D precisa manter quatro grupos independentes.');
  assert.equal(movement.groupStandings['bra-d'].every(group => group.length === 24), true, 'Cada grupo da Série D deve ter 24 clubes.');
  assert.equal(movement.decisions['bra-c'].relegated.length, 4, 'Série C deve rebaixar quatro clubes para equilibrar os quatro acessos da Série D.');
  const dFixture = context.window.AFM_TOURNAMENT_ENGINE.groupFixtures({id:'bra-d-groups',season:2028,groups:Object.fromEntries(['A','B','C','D'].map((g,i)=>[g,roster['bra-d'].slice(i*24,(i+1)*24)])),startDate:'2028-03-01',homeAway:false});
  assert.equal(dFixture.length, 1104, 'Grupos de 24 em turno único devem gerar 1.104 partidas independentes.');
  assert.equal(new Set(dFixture.map(f=>f.group)).size, 4, 'Calendários da Série D devem ficar separados em quatro grupos.');
  assert.equal(Math.max(...dFixture.map(f=>f.round)), 23, 'Cada clube deve disputar no máximo 23 rodadas de grupo.');
  assert.equal(movement.finalGroups['bra-c'].length, 2, 'Série C precisa de dois quadrangulares finais.');
  assert.equal(movement.finalGroups['bra-c'].every(group => group.length === 4), true, 'Cada quadrangular da Série C deve ter quatro clubes.');
  console.log('PASS: pipeline crítico simula ligas, quadrangulares e 4 grupos de 24 da Série D, com quatro acessos e pirâmide 20/20/20/96.');
}

{
  const context = {};
  vm.runInNewContext(`${actualSeriesDScheduleSource}\nthis.buildSeriesDSchedule = buildSchedule;`, context, { filename: 'js/game.js:series-d-calendar' });
  const clubs = names('SERIE-D', 96);
  const schedule = context.buildSeriesDSchedule({id:'bra-d',type:'groups-knockout'},clubs);
  assert.equal(schedule.length, 23, 'O calendário da Série D precisa ter 23 rodadas por grupo em turno único.');
  assert.equal(schedule.every(round => round.length === 48), true, 'Cada rodada agrupa os jogos internos dos quatro grupos, 12 jogos por grupo.');
  for(let groupIndex=0;groupIndex<4;groupIndex++){
    const groupNames=new Set(clubs.slice(groupIndex*24,(groupIndex+1)*24).map(norm));
    const played=new Set();
    for(const round of schedule) for(const [home,away] of round){
      const homeGroup=Math.floor(clubs.findIndex(name=>norm(name)===norm(home))/24);
      const awayGroup=Math.floor(clubs.findIndex(name=>norm(name)===norm(away))/24);
      assert.equal(homeGroup,awayGroup,'Não pode haver confrontos cruzados entre grupos da Série D.');
      if(homeGroup===groupIndex){
        const pair=[norm(home),norm(away)].sort().join('|');
        assert(!played.has(pair), 'Um confronto não pode aparecer duas vezes no mesmo grupo.');
        played.add(pair);
        assert(groupNames.has(norm(home))&&groupNames.has(norm(away)), 'Cada partida deve permanecer dentro do grupo original.');
      }
    }
    assert.equal(played.size,276, 'Cada grupo de 24 deve disputar 276 partidas em turno único.');
  }
  console.log('PASS: buildSchedule produz calendário da Série D com 4 grupos independentes, 23 rodadas e sem cruzamentos.');
}

{
  const context = { window: {} };
  vm.runInNewContext(`${tournamentEngineSource}\n${integritySource}`, context, { filename: 'js/core/state-access-test' });
  const integrity = context.window.AFM_COMPETITION_INTEGRITY;
  const roster = Object.fromEntries(integrity.NATIONAL_IDS.map(id => [id, names(`STATE-${id}`, integrity.CAPACITY[id])]));
  const stateRosters = { 'bra-est-df': ['Brasília', ...names('DF', 9)] };
  const transition = integrity.simulateBrazilSeason(roster, 2029, null, null, context.window.AFM_TOURNAMENT_ENGINE, {}, {
    requestedDestinationCompId: 'bra-d', userClub: 'Brasília', sourceCompId: 'bra-est-df', stateRosters
  });
  assert.equal(transition.valid, true, 'A vaga estadual explícita deve ser conciliada sem violar as capacidades da pirâmide.');
  assert.equal(transition.rosters['bra-d'].length, 96);
  assert.equal(transition.rosters['bra-d'].some(name => integrity.normalize(name) === 'brasilia'), true);
  assert.equal(transition.stateRosterUpdates['bra-est-df'].some(name => integrity.normalize(name) === 'brasilia'), false);
  assert.equal(integrity.audit(transition.rosters).valid, true);
  console.log('PASS: promoção estadual explícita persiste na Série D, substitui uma vaga e mantém roster estadual/nacional válido.');
}

{
  const context = { window: {} };
  vm.runInNewContext(`${integritySource}`, context, { filename: 'js/core/continental-qualification-test' });
  const integrity = context.window.AFM_COMPETITION_INTEGRITY;
  const makeTable = (id, size) => names(id, size).map((name, index) => ({ name, p: size-index, v: size-index, gp: size-index, gc: 0 }));
  const leagueTables = { 'bra-a': makeTable('BRA-A',20) };
  for (const [id, size] of Object.entries({ 'arg-1':30,'uru-1':16,'chi-1':16,'col-1':20,'par-1':12,'ecu-1':16,'per-1':18,'bol-1':16,'ven-1':14,'eng-1':20,'esp-1':20,'ita-1':20,'ger-1':18,'fra-1':18,'por-1':18,'ned-1':18,'bel-1':16,'tur-1':18,'sco-1':12,'aut-1':12,'sui-1':12,'gre-1':14,'cro-1':10,'ser-1':16,'cze-1':16,'den-1':12,'nor-1':16,'swe-1':16,'ksa-1':18,'jpn-1':20,'kor-1':12,'chn-1':16,'qat-1':12,'uae-1':14,'irn-1':16,'ind-1':14,'aus-1':14,'tha-1':16 })) leagueTables[id] = makeTable(id,size);
  const qualifiers = integrity.buildContinentalQualifications(2028, leagueTables, {}, {}, names('WORLD-RANK',32));
  assert.equal(qualifiers.lib.season, 2029);
  assert.equal(qualifiers.lib.participants.length, 32);
  assert.equal(new Set(qualifiers.lib.participants.map(integrity.normalize)).size, 32, 'Libertadores não pode ter duplicatas.');
  assert.equal(qualifiers.ucl.participants.length, 36);
  assert.equal(qualifiers.uel.participants.length, 36);
  assert.equal(qualifiers.uecl.participants.length, 36);
  assert.equal(qualifiers['afc-el'].participants.length, 24);
  assert.equal(qualifiers.afc2.participants.length, 32);
  assert.equal(new Set(qualifiers.afc2.participants.map(integrity.normalize)).size, 32, 'AFC Two não pode incluir duas vezes o mesmo clube.');
  assert.equal(qualifiers.cwc.status, 'qualified', 'Mundial deve fechar 32 vagas quando há ranking de mérito suficiente.');
  assert.equal(qualifiers.cwc.participants.length, 32);
  const incomplete = integrity.buildContinentalQualifications(2028, {}, {}, {}, []);
  assert.equal(incomplete.lib.status, 'pending-slots', 'Não deve inventar classificados quando faltam tabelas.');
  assert.equal(incomplete.cwc.status, 'pending-slots');
  console.log('PASS: qualificação continental dinâmica gera participantes únicos e deixa vagas ausentes pendentes.');
}

// Architectural guard: the season pipeline may never write to shared catalogs.
assert.doesNotMatch(actualFunctionSource, /window\.COMPETITION_TEAMS\s*=|Object\.assign\(teamMap/, 'Transições não podem escrever nos catálogos globais.');
assert.match(actualFunctionSource, /state\.competitionTeams\s*=\s*clone\(tMap\)/, 'A lista resultante deve ser persistida no save ativo.');
const newCareerSource = source.slice(source.indexOf('function newCareer('), source.indexOf('\nfunction repairLegacyNationalCompetitionRosters('));
assert.match(newCareerSource, /competitionTeams\s*:\s*careerCompetitionTeams/, 'Toda carreira nova deve ter uma cópia própria do catálogo-base.');
assert.match(newCareerSource, /competitionClubs\(comp,club\.name,careerCompetitionTeams\)/, 'A liga inicial deve vir do catálogo-base, nunca da carreira anterior.');
console.log('PASS: guarda arquitetural exige transições e novas carreiras isoladas do catálogo global.');
