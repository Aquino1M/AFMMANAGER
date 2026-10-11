const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
function extract(startText, endText){
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start);
  assert(start >= 0 && end > start, `Não foi possível extrair ${startText}.`);
  return source.slice(start, end).trim();
}

const expansionFn = extract('function getStadiumExpansionData(){', '\nfunction getStadiumSectorCost(');
const costFn = extract('function getStadiumSectorCost(', '\nfunction getStadiumSectorWorkDays(');
const durationFn = extract('function getStadiumSectorWorkDays(', '\nfunction getStadiumSectorWorkDaysRange(');
const durationRangeFn = extract('function getStadiumSectorWorkDaysRange(', '\nfunction getNewArenaData(');

const complete = () => ({ norte: true, sul: true, leste: true, oeste: true });
const incomplete = () => ({ norte: false, sul: false, leste: false, oeste: false });
const state = {
  infrastructure: { stadium: { capacity: 10000, level: 4 } },
  stadiumRingData: {
    ring: 3, maxRings: 6, maxUnlockedRing: 6, sides: incomplete(),
    rings: { 1: incomplete(), 2: complete(), 3: complete(), 4: complete(), 5: incomplete(), 6: incomplete() },
    purchasedSectors: [], activeWork: null,
    debt: { remaining: 0, monthly: 0, monthsLeft: 0 }
  }
};
const context = { state, rnd: (min, max) => min };
vm.runInNewContext(`${expansionFn}\n${costFn}\n${durationFn}\n${durationRangeFn}\nthis.expandStadium = getStadiumExpansionData;\nthis.stadiumCost = getStadiumSectorCost;\nthis.stadiumDays = getStadiumSectorWorkDays;\nthis.stadiumDaysRange = getStadiumSectorWorkDaysRange;`, context, { filename: 'js/game.js:stadium-functions' });

const repaired = context.expandStadium();
for(let ring = 1; ring <= 4; ring++){
  assert(['norte', 'sul', 'leste', 'oeste'].every(side => repaired.rings[ring][side] === true), `Anel ${ring} deveria estar completo por sequência/capacidade.`);
}
assert.equal(repaired.ring, 5, 'O anel atual deve avançar para o primeiro incompleto após os anéis 1–4.');
assert(['norte', 'sul', 'leste', 'oeste'].every(side => repaired.rings[5][side] === false), 'O anel 5 deve ficar pendente até construir seus setores.');
assert(['norte', 'sul', 'leste', 'oeste'].every(side => repaired.rings[6][side] === false), 'O anel 6 não pode continuar marcado acima de um anel incompleto.');
console.log('PASS: migração sequencial de anéis 1–4 e próximo anel 5.');

state.stadiumRingData = {
  ring: 4, maxRings: 6, maxUnlockedRing: 6, sides: incomplete(),
  rings: { 1: complete(), 2: incomplete(), 3: complete(), 4: complete(), 5: incomplete(), 6: incomplete() },
  purchasedSectors: [],
  activeWork: { ring: 4, side: 'sul', startedDate: '2031-01-01', durationDays: 30, finishDate: '2031-01-31' },
  debt: { remaining: 0, monthly: 0, monthsLeft: 0 }
};
const repairedWork = context.expandStadium();
assert.equal(repairedWork.activeWork.ring, 2, 'Uma obra legada em anel alto deve ser migrada para o primeiro anel incompleto.');
assert.equal(repairedWork.activeWork.side, 'sul');
assert.equal(repairedWork.ring, 2);
assert(['norte', 'sul', 'leste', 'oeste'].every(side => repairedWork.rings[3][side] === false), 'Anel 3 não pode manter setores se o anel 2 está incompleto.');
console.log('PASS: obra ativa legada fora de sequência é migrada para o primeiro anel incompleto.');

assert.equal(context.stadiumCost(1), 1105000);
assert.equal(context.stadiumCost(3), 1560000);
assert.equal(context.stadiumCost(5), 2340000);
console.log('PASS: custos dos setores aplicam multiplicador de 1,30.');

const expectedRanges = {
  1: { min: 15, max: 25 }, 2: { min: 15, max: 25 },
  3: { min: 30, max: 45 }, 4: { min: 30, max: 45 },
  5: { min: 50, max: 90 }, 6: { min: 50, max: 90 }
};
for(const [ring, expected] of Object.entries(expectedRanges)){
  const range = context.stadiumDaysRange(Number(ring));
  assert.equal(range.min, expected.min);
  assert.equal(range.max, expected.max);
  const sampled = context.stadiumDays(Number(ring));
  assert(sampled >= expected.min && sampled <= expected.max, `Prazo do anel ${ring} fora da faixa.`);
}
console.log('PASS: faixas de duração dos anéis 1–6.');
console.log('Todos os testes do estádio passaram.');
