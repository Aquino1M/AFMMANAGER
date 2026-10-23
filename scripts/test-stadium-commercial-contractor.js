const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
function extractFunction(name){
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, `function ${name} exists`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for(let i = open; i < source.length; i++){
    if(source[i] === '{') depth++;
    if(source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Function incomplete: ${name}`);
}

const state = {
  round: 2, date: '2026-06-01', club: 'AQN FC', balance: 5000000, expense: 0,
  teams: [{ name: 'AQN FC' }, { name: 'Clube Visitante' }],
  infrastructure: { stadium: { capacity: 11000, level: 1 } },
  stadiumRingData: { ring: 1, activeWork: { ring: 1, side: 'norte', startedDate: '2026-05-01', durationDays: 30, finishDate: '2026-06-20' }, rings: { 1: { norte: false, sul: false, leste: false, oeste: false } }, purchasedSectors: [], debt: { remaining: 0, monthly: 0, monthsLeft: 0 } },
  news: []
};
const ctx = {
  state, STADIUM_OFFER_INTERVAL_ROUNDS: 4,
  norm: value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(),
  fmtMoney: value => `R$ ${Math.round(value)}`,
  toast() {}, save() {}, openStadiumModal() {},
  addNews: message => state.news.unshift(message),
  getStadiumWorkDaysRemaining: work => Math.max(0, Math.ceil((Date.parse(`${work.finishDate}T00:00:00`) - Date.parse(`${state.date}T00:00:00`)) / 86400000)),
  getStadiumSectorCost: ring => Math.round((ring <= 2 ? 850000 : ring <= 4 ? 1200000 : 1800000) * 1.3),
  processStadiumConstructionDay(){
    const work = state.stadiumRingData.activeWork;
    assert.equal(work.finishDate, state.date, 'instant finish sets finish date to today');
    state.stadiumRingData.rings[work.ring][work.side] = true;
    state.stadiumRingData.purchasedSectors.push(`r${work.ring}_${work.side}`);
    state.infrastructure.stadium.capacity += 3500;
    state.stadiumRingData.activeWork = null;
  }
};
vm.createContext(ctx);
vm.runInContext([
  extractFunction('generateStadiumRentalProposal'), extractFunction('generateStadiumEventProposal'),
  extractFunction('getStadiumContractorRushCost'), extractFunction('hireStadiumContractor'),
  'this.rental=generateStadiumRentalProposal;this.show=generateStadiumEventProposal;this.rushCost=getStadiumContractorRushCost;this.hire=hireStadiumContractor;'
].join('\n'), ctx);

const work = state.stadiumRingData.activeWork;
assert.equal(ctx.rushCost(work, 3), 88400, 'three-day acceleration costs 8% of sector cost');
assert.equal(ctx.rushCost(work, 7), 165750, 'seven-day acceleration costs 15% of sector cost');
assert.equal(ctx.rushCost(work, 14), 276250, 'fourteen-day acceleration costs 25% of sector cost');
assert.equal(ctx.rushCost(work, 'instant'), 828750, 'instant construction is a premium 75% of sector cost');
const balanceBefore = state.balance;
assert.equal(ctx.hire('instant'), true, 'premium contractor should complete the active work immediately');
assert.equal(state.balance, balanceBefore - 828750, 'premium fee is deducted from club balance');
assert.equal(state.expense, 828750, 'premium fee is recorded as an expense');
assert.equal(state.infrastructure.stadium.capacity, 14500, 'capacity increases after instant completion');
assert.equal(state.stadiumRingData.activeWork, null, 'completed construction clears active work');

state.round = 20; state.lastStadiumCommercialOfferRound = 35; state.lastStadiumCommercialOfferType = 'show';
state.stadiumClubRental = null; state.stadiumEventProposal = null;
assert(ctx.rental(), 'a season/round reset must not block a new rental offer');
assert.equal(state.lastStadiumCommercialOfferRound, 20);
state.stadiumClubRental = null; state.lastStadiumRentalOfferRound = 35;
state.lastStadiumCommercialOfferRound = 35; state.stadiumEventProposal = null; state.round = 20;
assert(ctx.rental(), 'rental cooldown also resets safely when current round is lower than legacy metadata');
assert(source.includes("btn.dataset.days === 'instant' ? 'instant' : Number(btn.dataset.days)"), 'instant option reaches handler without Number() coercion');
assert(source.includes("state.round < lastStadiumOfferRound || state.round - lastStadiumOfferRound >= 4"), 'automatic offers recover after a round counter reset');
assert(source.includes("state.round)>=Number(state.lastStadiumCommercialOfferRound)"), 'show button avoids negative cooldown after a round reset');
console.log('PASS: construtora premium, preços maiores, conclusão imediata e ofertas após reset de rodada.');
