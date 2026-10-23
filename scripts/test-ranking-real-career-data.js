const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('js/systems/cup_highlight_ranking_world_and_licenses.js', 'utf8');
global.window = {
  state: {
    club: 'AQN FC', manager: { name: 'Aquino' }, compId: 'bra-est-df', competition: 'Campeonato Candango',
    season: 2028, titles: ['Campeonato Candango', 'Copa do Brasil'],
    managerPersonal: { prestigeScore: 4, careerPoints: 54 },
    history: [
      { h: 'AQN FC', a: 'Clube A', hg: 2, ag: 0 },
      { h: 'Clube B', a: 'AQN FC', hg: 1, ag: 1 },
      { h: 'AQN FC', a: 'Clube C', hg: 0, ag: 1 }
    ],
    worldChampionHistory: [{ season: 2027, titlesWon: ['Campeonato Candango', 'Taça Regional'], competitions: [
      { name: 'Campeonato Candango', champion: 'AQN FC' }, { name: 'Taça Regional', champion: 'AQN FC' }
    ] }],
    seasonHistory: [{ season: 2027, userClub: 'AQN FC', titlesWon: ['Taça Regional', 'Copa da Cidade'] }]
  },
  COMPETITIONS: [{ id: 'bra-est-df', name: 'Campeonato Candango' }],
  addEventListener() {}
};
global.localStorage = { getItem() { return null; }, setItem() {} };
global.document = { addEventListener() {} };
vm.runInThisContext(source, { filename: 'cup_highlight_ranking_world_and_licenses.js' });

const rows = window.AFM_WorldSimulation.getCoachRankingEntries();
const user = rows.find(row => row.isUser);
assert.ok(user, 'O treinador do save precisa aparecer no ranking.');
assert.equal(user.titles, 4, 'Deve agregar títulos atuais e históricos sem duplicar campeonato.');
assert.equal(user.w, 1, 'Vitórias devem vir do histórico real da carreira.');
assert.equal(user.d, 1, 'Empates devem vir do histórico real da carreira.');
assert.equal(user.l, 1, 'Derrotas devem vir do histórico real da carreira.');
assert.ok(user.prestige >= 5, 'Prestígio deve usar e reconciliar os dados persistidos.');
assert.equal(user.pts, Math.max(50 + 4 * 160 + 14 + 4 - 6, 54, user.prestige * 35));
assert.equal(rows.filter(row => row.club === 'AQN FC').length, 1, 'O clube do usuário não pode aparecer duplicado.');
console.log('PASS: ranking nacional/mundial usa títulos únicos, resultados reais e prestígio reconciliado.');
