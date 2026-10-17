const fs = require('fs');
const assert = require('assert');

function createMockElement(tag = 'div', id = '') {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    id: id,
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {}
    },
    children: [],
    appendChild: function(c) {
      if (c) c.parentNode = this;
      this.children.push(c);
      return c;
    },
    removeChild: function(c) {
      const idx = this.children.indexOf(c);
      if (idx >= 0) {
        this.children.splice(idx, 1);
        if (c) c.parentNode = null;
      }
    },
    remove: function() {
      if (this.parentNode && this.parentNode.removeChild) this.parentNode.removeChild(this);
    },
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => createMockElement('span'),
    querySelectorAll: () => []
  };
}

global.window = global;
global.window.AFM_DB = { init: () => Promise.resolve(null) };
global.window.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.window.esc = s => String(s || '');
global.document = {
  body: createMockElement('body'),
  getElementById: (id) => createMockElement('div', id),
  querySelector: (sel) => createMockElement('div'),
  querySelectorAll: (sel) => [createMockElement('div')]
};

// Carregar os arquivos do jogo
require('../data/competition_teams.js');
require('../data/international_teams_2026_27.js');
require('../js/competitions.js');
require('../data/players_live.js');
require('../js/game.js');

console.log('================================================================');
console.log('TEST SUITE: PREMIAÇÕES REAIS, MLS, PATROCÍNIOS & NÚMEROS CAMISA');
console.log('================================================================');

// 1. TESTE DE PREMIAÇÕES REAIS
console.log('\n--- 1. Teste de Premiações Reais ---');

// Série A
const braA_1 = calculateSeasonPrizeMoney(1, { id: 'bra-a' });
const braA_2 = calculateSeasonPrizeMoney(2, { id: 'bra-a' });
const braA_16 = calculateSeasonPrizeMoney(16, { id: 'bra-a' });
const braA_17 = calculateSeasonPrizeMoney(17, { id: 'bra-a' });

console.log(`Série A: 1º = R$ ${braA_1.toLocaleString()} | 2º = R$ ${braA_2.toLocaleString()} | 16º = R$ ${braA_16.toLocaleString()} | 17º (Z4) = R$ ${braA_17.toLocaleString()}`);
assert.strictEqual(braA_1, 48100000, 'Série A campeão deve ser R$ 48.100.000');
assert.strictEqual(braA_2, 45700000, 'Série A vice deve ser R$ 45.700.000');
assert.strictEqual(braA_16, 16300000, 'Série A 16º deve ser R$ 16.300.000');
assert.strictEqual(braA_17, 0, 'Série A Z4 não recebe premiação esportiva CBF');

// Série B
const braB_1 = calculateSeasonPrizeMoney(1, { id: 'bra-b' });
const braB_4 = calculateSeasonPrizeMoney(4, { id: 'bra-b' });
console.log(`Série B: 1º = R$ ${braB_1.toLocaleString()} | G4 = R$ ${braB_4.toLocaleString()}`);
assert.strictEqual(braB_1, 3500000, 'Série B campeão deve ser R$ 3.500.000');
assert.strictEqual(braB_4, 1350000, 'Série B G4 deve ser R$ 1.350.000');

// MLS
const mls_1 = calculateSeasonPrizeMoney(1, { id: 'usa-1' });
console.log(`MLS: 1º = R$ ${mls_1.toLocaleString()}`);
assert.strictEqual(mls_1, 55000000, 'MLS campeão deve ser R$ 55.000.000');

// Premier League
const pl_1 = calculateSeasonPrizeMoney(1, { id: 'eng-1' });
console.log(`Premier League: 1º = R$ ${pl_1.toLocaleString()}`);
assert.strictEqual(pl_1, 380000000, 'Premier League campeão deve ser R$ 380.000.000');

// Copas (calculateCupPhasePrize)
const copaFinalChamp = calculateCupPhasePrize('bra-cup', 'Final', true, true);
const copaFinalVice = calculateCupPhasePrize('bra-cup', 'Final', false, false);
const copaSemi = calculateCupPhasePrize('bra-cup', 'Semifinal', true, false);
const copaOitavas = calculateCupPhasePrize('bra-cup', 'Oitavas de Final', true, false);

console.log(`Copa do Brasil: Campeão = R$ ${copaFinalChamp.toLocaleString()} | Vice = R$ ${copaFinalVice.toLocaleString()} | Semis = R$ ${copaSemi.toLocaleString()} | Oitavas = R$ ${copaOitavas.toLocaleString()}`);
assert.strictEqual(copaFinalChamp, 73500000, 'Copa do Brasil Campeão deve receber R$ 73.500.000');
assert.strictEqual(copaFinalVice, 31500000, 'Copa do Brasil Vice deve receber R$ 31.500.000');
assert.strictEqual(copaSemi, 9450000, 'Copa do Brasil Semifinal deve ser R$ 9.450.000');

const libChamp = calculateCupPhasePrize('lib', 'Final', true, true);
console.log(`Libertadores: Campeão = R$ ${libChamp.toLocaleString()} (US$ 23M)`);
assert.strictEqual(libChamp, 126500000, 'Libertadores campeão deve ser R$ 126.500.000');

console.log('✓ Teste de Premiações Reais passou com 100% de sucesso!');

// 2. TESTE DA MLS E JOGADORES REAIS
console.log('\n--- 2. Teste da MLS e Jogadores Reais ---');
const mlsComp = COMPETITIONS.find(c => c.id === 'usa-1');
assert.ok(mlsComp, 'Competição usa-1 deve existir');
assert.strictEqual(mlsComp.country, 'Estados Unidos', 'País da MLS deve ser Estados Unidos');
assert.strictEqual(mlsComp.teams, 20, 'MLS deve ter 20 franquias');

const mlsTeams = COMPETITION_TEAMS['usa-1'];
assert.ok(Array.isArray(mlsTeams) && mlsTeams.length >= 20, 'COMPETITION_TEAMS deve ter a lista de times da MLS');
assert.ok(mlsTeams.includes('Inter Miami'), 'Inter Miami deve estar na MLS');
assert.ok(mlsTeams.includes('LA Galaxy'), 'LA Galaxy deve estar na MLS');
assert.ok(mlsTeams.includes('Los Angeles FC'), 'Los Angeles FC deve estar na MLS');

const livePlayers = window.LIVE_PLAYERS || [];
const messi = livePlayers.find(p => p.name === 'Lionel Messi');
assert.ok(messi, 'Lionel Messi deve existir no banco de jogadores');
assert.strictEqual(messi.club, 'Inter Miami', 'Messi deve jogar no Inter Miami');
assert.strictEqual(messi.number, 10, 'Messi deve vestir a camisa #10');

const suarez = livePlayers.find(p => p.name === 'Luis Suárez');
assert.ok(suarez, 'Luis Suárez deve existir');
assert.strictEqual(suarez.club, 'Inter Miami');
assert.strictEqual(suarez.number, 9);

const giroud = livePlayers.find(p => p.name === 'Olivier Giroud');
assert.ok(giroud, 'Olivier Giroud deve existir');
assert.strictEqual(giroud.club, 'Los Angeles FC');
assert.strictEqual(giroud.number, 9);

const reus = livePlayers.find(p => p.name === 'Marco Reus');
assert.ok(reus, 'Marco Reus deve existir');
assert.strictEqual(reus.club, 'LA Galaxy');
assert.strictEqual(reus.number, 18);

console.log(`✓ Encontrados craques da MLS: ${messi.name} (#${messi.number}, ${messi.club}), ${suarez.name} (#${suarez.number}, ${suarez.club}), ${giroud.name} (#${giroud.number}, ${giroud.club}), ${reus.name} (#${reus.number}, ${reus.club})`);
console.log('✓ Teste da MLS e Craques passou com 100% de sucesso!');

// 3. TESTE DE PATROCINADORES LOCAIS POR PAÍS
console.log('\n--- 3. Teste de Patrocinadores Locais por País ---');
assert.strictEqual(getClubCountry('Boca Juniors'), 'Argentina', 'Boca Juniors deve ser Argentina');
assert.strictEqual(getClubCountry('River Plate'), 'Argentina', 'River Plate deve ser Argentina');
assert.strictEqual(getClubCountry('Inter Miami'), 'Estados Unidos', 'Inter Miami deve ser Estados Unidos');
assert.strictEqual(getClubCountry('Los Angeles Galaxy'), 'Estados Unidos', 'LA Galaxy deve ser Estados Unidos');
assert.strictEqual(getClubCountry('Flamengo'), 'Brasil', 'Flamengo deve ser Brasil');
assert.strictEqual(getClubCountry('Al-Hilal'), 'Arábia Saudita', 'Al-Hilal deve ser Arábia Saudita');

// Ofertas na Argentina
const argOffers = generateSponsorOffers(5000000, 'Boca Juniors');
console.log('Ofertas geradas para Boca Juniors (Argentina):', argOffers.map(o => `${o.brand} (${o.category})`).join(', '));
assert.ok(argOffers.some(o => ['YPF', 'Cerveza Quilmes', 'Codere', 'Betsson Argentina', 'Banco Galicia', 'Banco Macro', 'Flecha Bus', 'Assist Card', 'DirecTV Argentina', 'Mercado Libre'].includes(o.brand)), 'Ofertas da Argentina devem conter marcas argentinas autênticas');

// Ofertas nos EUA (MLS)
const usaOffers = generateSponsorOffers(15000000, 'Inter Miami');
console.log('Ofertas geradas para Inter Miami (EUA):', usaOffers.map(o => `${o.brand} (${o.category})`).join(', '));
assert.ok(usaOffers.some(o => ['Apple TV', 'Audi', 'Target', 'BMO', 'Herbalife', 'Ford', 'DoorDash', 'AT&T', 'Delta Air Lines', 'Bank of America'].includes(o.brand)), 'Ofertas dos EUA devem conter marcas americanas autênticas');

// Ofertas no Brasil
const braOffers = generateSponsorOffers(10000000, 'Flamengo');
console.log('Ofertas geradas para Flamengo (Brasil):', braOffers.map(o => `${o.brand} (${o.category})`).join(', '));
assert.ok(braOffers.some(o => ['Betano', 'Nubank', 'Petrobras', 'Caixa', 'Superbet', 'iFood', 'Crefisa', 'Fatal Model', 'GOL Linhas Aéreas', 'BYD', 'Itaú'].includes(o.brand)), 'Ofertas do Brasil devem conter marcas brasileiras autênticas');

console.log('✓ Teste de Patrocinadores Locais passou com 100% de sucesso!');

// 4. TESTE DO SISTEMA DE ESCOLHA DO NÚMERO DA CAMISA
console.log('\n--- 4. Teste do Sistema de Número da Camisa ---');
const testState = {
  club: 'Inter Miami',
  squad: [
    { name: 'Lionel Messi', pos: 'RW', overall: 88, number: 10 },
    { name: 'Luis Suárez', pos: 'ST', overall: 82, number: 9 },
    { name: 'Sergio Busquets', pos: 'DM', overall: 81, number: 5 },
    { name: 'Jordi Alba', pos: 'LB', overall: 80, number: 18 },
    { name: 'Drake Callender', pos: 'GK', overall: 75 }, // sem número
    { name: 'Tomás Avilés', pos: 'CB', overall: 72 }, // sem número
    { name: 'Federico Redondo', pos: 'DM', overall: 75, number: 5 } // número duplicado propositalmente com Busquets!
  ],
  lineup: ['Lionel Messi', 'Luis Suárez', 'Sergio Busquets', 'Jordi Alba', 'Drake Callender', 'Tomás Avilés', 'Federico Redondo']
};

// Assegura que nenhum número fique duplicado e todos tenham número
ensureSquadShirtNumbers(testState);
const numbersSet = new Set(testState.squad.map(p => p.number));
console.log('Números atribuídos no elenco:', testState.squad.map(p => `${p.name} = #${p.number}`).join(' | '));

assert.strictEqual(numbersSet.size, testState.squad.length, 'Não pode haver nenhum número repetido no elenco!');
testState.squad.forEach(p => {
  assert.ok(typeof p.number === 'number' && p.number >= 1 && p.number <= 99, `Número de ${p.name} deve ser válido entre 1 e 99`);
});

// Teste de Swap / Troca Inteligente de Camisa
console.log('\nTestando troca de camisa (Swap):');
// Vamos dar o número 10 para o Luis Suárez (atualmente de Messi #10)
const suarezKey = 'Luis Suárez';
const swapOk = setPlayerShirtNumber(suarezKey, 10, testState);
assert.ok(swapOk, 'setPlayerShirtNumber deve ter sucesso');

const newSuarez = testState.squad.find(p => p.name === 'Luis Suárez');
const newMessi = testState.squad.find(p => p.name === 'Lionel Messi');
console.log(`Após a troca: Suárez é #${newSuarez.number} | Messi recebeu #${newMessi.number}`);

assert.strictEqual(newSuarez.number, 10, 'Suárez agora deve ser o camisa #10');
assert.strictEqual(newMessi.number, 9, 'Messi deve ter recebido a camisa #9 no swap inteligente');
const afterSwapSet = new Set(testState.squad.map(p => p.number));
assert.strictEqual(afterSwapSet.size, testState.squad.length, 'Zero duplicações de camisa após o swap!');

// Teste de Atribuição Tradicional (1 a 11)
console.log('\nTestando Numeração Tradicional 1 a 11:');
assignTraditionalShirtNumbers(testState);
console.log('Após Numeração Tradicional:', testState.squad.map(p => `${p.name} (${p.pos}) = #${p.number}`).join(' | '));

const gk = testState.squad.find(p => p.pos === 'GK');
assert.strictEqual(gk.number, 1, 'Goleiro deve receber camisa #1 na numeração tradicional');
const tradSet = new Set(testState.squad.map(p => p.number));
assert.strictEqual(tradSet.size, testState.squad.length, 'Zero duplicações na numeração tradicional!');

console.log('✓ Teste do Sistema de Número da Camisa passou com 100% de sucesso!');
console.log('\n================================================================');
console.log('TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ZERO BUGS!');
console.log('================================================================');
