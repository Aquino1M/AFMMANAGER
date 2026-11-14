const assert = require('node:assert/strict');
global.window = global;
global.document = { getElementById: () => null };
global.AFM_PlayerMode = {};

require('../js/player/national_teams_manager.js');

const state = {
  gameMode: 'player',
  season: 2026,
  date: '2026-03-23',
  club: 'Real Brasília',
  squad: [],
  news: [],
  playerCareerState: { athleteName: 'Atleta Não Convocado', nationality: 'Brasil', internationalStats: { caps: 0, goals: 0, assists: 0, history: [] } }
};

window.AFM_NationalTeams.processCalendarDay(state, '2026-03-24');
assert.equal(state.playerCareerState.fifaFixture.userIsCalledUp, false, 'atleta ausente da lista não pode ser marcado como convocado');
assert.equal(state.playerCareerState.nationalTeamHistory.length, 0, 'resultado só é registrado na data da partida');
window.AFM_NationalTeams.processCalendarDay(state, '2026-03-26');
assert.equal(state.playerCareerState.nationalTeamHistory.length, 0);
window.AFM_NationalTeams.processCalendarDay(state, '2026-03-27');
assert.equal(state.playerCareerState.nationalTeamHistory.length, 1, 'partida internacional deve entrar no histórico');
assert.equal(state.playerCareerState.internationalStats.caps, 0, 'não convocado não recebe cap');
assert.equal(state.playerCareerState.nationalTeamHistory[0].userPlayed, false);
assert.match(state.news[0], /não foi convocado/);
const result = [...state.playerCareerState.fifaFixture.result];
window.AFM_NationalTeams.processCalendarDay(state, '2026-03-28');
assert.equal(state.playerCareerState.nationalTeamHistory.length, 1, 'o mesmo fixture não pode ser duplicado');
assert.deepEqual(state.playerCareerState.fifaFixture.result, result);

const calledState = {
  gameMode: 'player', season: 2026, date: '2026-03-23', controlledPlayerId: 'selected', club: 'Real Brasília', news: [],
  squad: [{ id: 'selected', name: 'Atleta Convocado', pos: 'ATA', overall: 90, nationality: 'Brasil', isControlled: true }],
  playerCareerState: { athleteName: 'Atleta Convocado', nationality: 'Brasil', position: 'ATA', internationalStats: { caps: 0, goals: 0, assists: 0, titles: [], history: [] } }
};
const priorRandom = Math.random;
Math.random = () => 0.1;
window.AFM_NationalTeams.processCalendarDay(calledState, '2026-03-24');
assert.equal(calledState.playerCareerState.fifaFixture.userIsCalledUp, true);
window.AFM_NationalTeams.processCalendarDay(calledState, '2026-03-27');
assert.equal(calledState.playerCareerState.fifaFixture.played, false, 'convocado pode decidir a partida na data agendada');
calledState.date = '2026-03-27';
window.AFM_NationalTeams.simulateNationalTeamMatch(calledState);
window.AFM_NationalTeams.simulateNationalTeamMatch(calledState);
Math.random = priorRandom;
assert.equal(calledState.playerCareerState.internationalStats.caps, 1);
assert.equal(calledState.playerCareerState.nationalTeamHistory.length, 1, 'simulação manual deve ser registrada uma única vez');
assert.equal(calledState.playerCareerState.nationalTeamHistory[0].userPlayed, true);

const career = { season: 2026, gameMode: 'player', controlledPlayerId: 'athlete', playerCareerState: { athleteName: 'Atleta', seasonStats: { season: 2026, goals: 5, assists: 3, matches: 4, avgRating: 7.5 }, matchRatingHistory: [] } };
const score = window.AFM_NationalTeams.calculateCallUpScore({ id: 'athlete', isControlled: true, name: 'Atleta', overall: 50, seasonStats: { goals: 0, assists: 0, matches: 0, avgRating: 6 } }, career);
assert.ok(score > 90, 'pontuação de convocação deve considerar os dados atuais da carreira');

console.log('National team calendar, match history, no-cap rule, duplicate protection and call-up score passed.');
