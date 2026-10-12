const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const projectRoot = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(projectRoot, 'js/game.js'), 'utf8');
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
  const state = { club: 'Criciúma', compId, season: 2032, news: [], competitionTeams: clone(map) };
  const context = {
    window: { COMPETITION_TEAMS: map }, state, teamMap: map, BASE_COMPETITION_TEAMS: clone(map), norm, clone,
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

// 1. Rebaixamento explícito B → C: carreira e listas precisam concordar.
{
  const { context, state, map } = createRunner('bra-b');
  const originalA = [...map['bra-a']];
  const originalD = [...map['bra-d']];
  const clubDisplacedFromC = map['bra-c'][map['bra-c'].length - 1];
  context.runTransition('bra-b', [{ name: 'Criciúma', p: 3 }], 'bra-c', 'bra-b');
  assert.equal(state.compId, 'bra-c');
  assert.deepEqual(membership(map, 'Criciúma'), ['bra-c']);
  assert.deepEqual(membership(map, clubDisplacedFromC), ['bra-b'], 'O clube que cedeu a vaga na Série C deve ocupar a vaga aberta na Série B.');
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
  assert.deepEqual(membership(map, 'Criciúma'), ['bra-b']);
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
  assert.deepEqual(membership(map, 'Criciúma'), ['bra-b']);
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
  assert.deepEqual(membership(context.window.COMPETITION_TEAMS, 'Criciúma'), ['bra-c']);
  auditRosterSizesAndDuplicates(context.window.COMPETITION_TEAMS);
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
  assert.deepEqual(membership(context.window.COMPETITION_TEAMS, 'Criciúma'), ['bra-c']);
  auditRosterSizesAndDuplicates(context.window.COMPETITION_TEAMS);
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
  assert.deepEqual(membership(map, 'Brasília'), ['bra-d']);
  assert.equal(map['bra-d'].length, 96);
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
  auditRosterSizesAndDuplicates(map);
  assert.deepEqual(membership(map, 'Brasília'), ['bra-d']);
  assert.equal(membership(map, truncatedClub).length, 0);
  assert.equal(map['bra-a'].filter(name => norm(name) === norm('Clube Duplicado')).length, 1);
  assert.equal(state.competitionTeams['bra-d'].length, 96);
  console.log('PASS: Série D acima de 96 e clubes duplicados normalizados.');
}
