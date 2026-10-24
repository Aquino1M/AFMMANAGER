const fs = require('fs');
const path = require('path');
const vm = require('vm');

const gameJsSource = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');

const testContext = {
  state: null,
  window: {},
  document: {
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  },
  toast: () => {},
  fmtMoney: val => `R$ ${Number(val).toLocaleString('pt-BR')}`,
  FACILITIES: {
    stadium: { name: 'Estádio', icon: '🏟️', base: 1800000, max: 6 }
  },
  FACILITY_LEVEL_MULTIPLIER: 1.15,
  FACILITY_COST_INCREASE: 1.25,
  save: () => {},
  render: () => {}
};

// Carrega getStadiumSectorCost e getStadiumExpansionData
const expStart = gameJsSource.indexOf('function getStadiumExpansionData(){');
const expEnd = gameJsSource.indexOf('\nfunction getNewArenaData(){');
if (expStart < 0 || expEnd < 0) throw new Error('Funções de expansão do estádio não encontradas');

const stadiumCode = gameJsSource.slice(expStart, expEnd);
vm.runInNewContext(stadiumCode, testContext);

// 1. Testa escalonamento de +60% por nível de anel
const c1 = testContext.getStadiumSectorCost(1);
const c2 = testContext.getStadiumSectorCost(2);
const c3 = testContext.getStadiumSectorCost(3);
const c4 = testContext.getStadiumSectorCost(4);
const c5 = testContext.getStadiumSectorCost(5);
const c6 = testContext.getStadiumSectorCost(6);

if (c1 !== 1105000) throw new Error(`Anel 1 deve custar R$ 1.105.000, recebeu: ${c1}`);
if (c2 !== 1768000) throw new Error(`Anel 2 deve custar R$ 1.768.000 (+60%), recebeu: ${c2}`);
if (c3 !== 2828800) throw new Error(`Anel 3 deve custar R$ 2.828.800 (+60%), recebeu: ${c3}`);
if (c4 !== 4526080) throw new Error(`Anel 4 deve custar R$ 4.526.080 (+60%), recebeu: ${c4}`);
if (c5 !== 7241728) throw new Error(`Anel 5 deve custar R$ 7.241.728 (+60%), recebeu: ${c5}`);
if (c6 !== 11586765) throw new Error(`Anel 6 deve custar R$ 11.586.765 (+60%), recebeu: ${c6}`);

console.log('PASS: custo dos setores dos anéis escala exatamente +60% por nível.');

// 2. Testa que o anel 1 NÃO auto-completa 4/4 quando o clube tem capacidade base de 8.500 lugares
testContext.state = {
  club: 'AQN FC',
  infrastructure: {
    stadium: { level: 1, capacity: 8500 }
  },
  stadiumRingData: {
    ring: 1,
    maxRings: 6,
    sides: { norte: true, sul: true, leste: true, oeste: true },
    rings: {
      1: { norte: true, sul: true, leste: true, oeste: true },
      2: { norte: false, sul: false, leste: false, oeste: false }
    },
    purchasedSectors: ['r1_norte', 'r1_sul', 'r1_leste', 'r1_oeste']
  }
};

const stData = testContext.getStadiumExpansionData();
if (stData.rings[1].norte !== true) throw new Error('Setor Norte deve permanecer concluído!');
if (stData.rings[1].sul !== false || stData.rings[1].leste !== false || stData.rings[1].oeste !== false) {
  throw new Error('Setores Sul, Leste e Oeste não devem estar concluídos sem terem sido pagos!');
}
if (stData.purchasedSectors.length !== 1 || stData.purchasedSectors[0] !== 'r1_norte') {
  throw new Error(`purchasedSectors deve conter apenas r1_norte, recebeu: ${JSON.stringify(stData.purchasedSectors)}`);
}

console.log('PASS: reparação de anel 1 bem-sucedida (apenas Norte construído, Sul/Leste/Oeste disponíveis).');
