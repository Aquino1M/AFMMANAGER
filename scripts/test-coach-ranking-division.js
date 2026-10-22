const assert = require('node:assert/strict');

global.window = {
  COMPETITIONS: [
    { id: 'bra-est-df', name: 'Campeonato Candango' },
    { id: 'bra-a', name: 'Campeonato Brasileiro Série A' }
  ],
  COMPETITION_TEAMS: { 'bra-a': ['AQN FC'] },
  state: {
    club: 'AQN FC',
    manager: 'Aquino',
    compId: 'bra-est-df',
    competition: 'Campeonato Candango',
    currentLeague: 'Campeonato Candango',
    wins: 0,
    draws: 1,
    losses: 0
  },
  addEventListener() {}
};
global.document = { addEventListener() {} };
global.localStorage = { getItem() { return null; } };

require('../js/systems/cup_highlight_ranking_world_and_licenses.js');

const ranking = window.AFM_WorldSimulation.getCoachRankingEntries();
const userRow = ranking.find(row => row.isUser);
assert.ok(userRow, 'O treinador da carreira deve aparecer no ranking.');
assert.equal(userRow.club, 'AQN FC');
assert.equal(userRow.division, 'Campeonato Candango', 'O ranking deve usar a competição ativa do save, não a lista estática da Série A.');
assert.equal(userRow.scope, 'BR');

window.state.compId = 'bra-a';
assert.equal(window.AFM_WorldSimulation.resolveUserDivision(window.state), 'Campeonato Brasileiro Série A', 'A Série A deve continuar correta para saves que realmente disputam essa competição.');

console.log('PASS: ranking mostra a competição atual do save e corrige a liga estática do time do usuário.');
