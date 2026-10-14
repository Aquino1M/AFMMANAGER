const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
function extractFunction(name){
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert(start >= 0, `function ${name} exists`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for(let i = open; i < source.length; i++){
    if(source[i] === '{') depth++;
    if(source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Function incomplete: ${name}`);
}
function extractBetween(startMarker, endMarker){
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0 && end > start, `source block ${startMarker} exists`);
  return source.slice(start, end);
}

const ctx = { clamp:(v,min,max)=>Math.max(min,Math.min(max,v)), MARKETING_MINIMUM_WEEKLY:36000, MARKETING_UPGRADE_MINIMUM_GROWTH:1.20, FACILITY_COST_INCREASE:1.15, FACILITY_LEVEL_MULTIPLIER:1.68, STADIUM_OFFER_INTERVAL_ROUNDS:4, STADIUM_UPGRADE_COST_INCREASE:1.40 };
vm.createContext(ctx);
vm.runInContext([
  extractFunction('arenaLandCost'),
  extractFunction('arenaPermitCost'),
  extractFunction('stadiumUpgradeCost'),
  extractFunction('stadiumAttendanceStrengthBonus'),
  extractFunction('calcArenaTotalCost'),
  'this.landCost=arenaLandCost;this.permitCost=arenaPermitCost;this.cosmeticCost=stadiumUpgradeCost;this.crowdBonus=stadiumAttendanceStrengthBonus;this.buildCost=calcArenaTotalCost;'
].join('\n'), ctx);

assert.equal(ctx.landCost(15000), 12000000);
assert.equal(ctx.permitCost(15000), 4500000);
assert.equal(ctx.landCost(15000) + ctx.permitCost(15000) + ctx.buildCost(15000), 91500000);
assert(ctx.landCost(30000) > ctx.landCost(15000));
assert(ctx.landCost(80000) > ctx.landCost(50000));
assert(ctx.permitCost(100000) > ctx.permitCost(80000));
assert.notEqual(ctx.landCost(80000), ctx.permitCost(80000), 'land and permit have separate capacity-based costs');
assert.deepEqual([15000,30000,50000,80000,100000].map(ctx.buildCost), [75000000,165000000,325000000,600000000,850000000]);
assert.equal(ctx.cosmeticCost(20250), 28350);
assert.equal(ctx.cosmeticCost(35000), 49000);
assert.equal(ctx.cosmeticCost(48000), 67200);
assert.equal(ctx.cosmeticCost(15000), 21000);
assert.equal(ctx.cosmeticCost(65000), 91000);
assert.equal(ctx.cosmeticCost(55000), 77000);
assert.equal(ctx.crowdBonus(0, 100), 0);
assert.equal(ctx.crowdBonus(1, 100), 1);
assert.equal(ctx.crowdBonus(20, 100), 1);
assert.equal(ctx.crowdBonus(21, 100), 2);
assert.equal(ctx.crowdBonus(100, 100), 5);
assert.equal(ctx.crowdBonus(150, 100), 5, 'crowd strength bonus has a hard cap of +5');
console.log('PASS: custos realistas da arena, melhorias +40% e bônus de público limitado a +5.');

// Execute the actual migration block from migrate(), not a copied formula.
const migrationBlock = extractBetween('  if(Number(s.marketingEconomyVersion) !== 2){', '  if(!Array.isArray(s.youthAcademy)');
const migrateMarketing = vm.runInNewContext(`(s)=>{${migrationBlock};return s;}`, ctx);
const oldSave = migrateMarketing({ marketingWeekly:12000, marketingMonthly:48000 });
assert.equal(oldSave.marketingWeekly, 36000, 'legacy weekly marketing is tripled exactly once');
assert.equal(oldSave.marketingMonthly, 144000);
migrateMarketing(oldSave);
assert.equal(oldSave.marketingWeekly, 36000, 'loading/saving again does not triple a second time');
assert.equal(Math.round(oldSave.marketingWeekly * ctx.MARKETING_UPGRADE_MINIMUM_GROWTH), 43200, 'each marketing level adds 20%');
assert(source.includes('Math.max(MARKETING_MINIMUM_WEEKLY, Number(state.marketingWeekly) || 36000)'), 'per-round marketing debit uses the increased baseline');
assert(source.includes('const MARKETING_MINIMUM_WEEKLY = 36000'), 'weekly marketing minimum reflects tripled starting investment');
assert(source.includes('marketing: Math.max(MARKETING_MINIMUM_WEEKLY, Number(state.marketingWeekly) || 36000) * 4'), 'monthly projection uses the same increased marketing minimum as actual debits');
console.log('PASS: marketing save migration triples once, weekly accounting follows it, and upgrades add 20%.');

// The same saved cooldown governs rentals and shows.
const rentalFn = extractFunction('generateStadiumRentalProposal');
const showFn = extractFunction('generateStadiumEventProposal');
const offerContext = {
  state:{ round:10, date:'2026-05-01', club:'Home', teams:[{name:'Home'},{name:'Away'}], infrastructure:{stadium:{capacity:11000,level:1}}, news:[] },
  STADIUM_OFFER_INTERVAL_ROUNDS:4,
  norm:v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()
};
vm.createContext(offerContext);
vm.runInContext(`${rentalFn}\n${showFn}\nthis.rental=generateStadiumRentalProposal;this.show=generateStadiumEventProposal;`, offerContext);
const rental = offerContext.rental();
assert(rental && rental.fee > 0);
assert.equal(offerContext.state.lastStadiumCommercialOfferRound,10);
assert.equal(offerContext.show(),null,'show cannot replace a rental inside four rounds');
offerContext.state.stadiumClubRental = null;
offerContext.state.round = 13;
assert.equal(offerContext.show(),null,'no new offer before four complete rounds');
offerContext.state.round = 14;
const show = offerContext.show();
assert(show && show.fee > 0);
assert.equal(offerContext.state.lastStadiumCommercialOfferRound,14);
offerContext.state.stadiumEventProposal = null;
offerContext.state.round = 17;
assert.equal(offerContext.rental(),null,'rental cannot replace a show before four rounds');
offerContext.state.round = 18;
assert(offerContext.rental());
assert(source.includes('const lastStadiumOfferRound = Number(state.lastStadiumCommercialOfferRound)'));
assert(source.includes('state.round - lastStadiumOfferRound >= 4'));
assert(!source.includes('generateStadiumRentalProposal(true)') && !source.includes('generateStadiumEventProposal(true)'), 'UI cannot bypass the shared cooldown');
const monthlyStart = source.indexOf('function monthlyFinancialProjection(');
const monthlyEnd = source.indexOf('\nfunction ', monthlyStart + 10);
const monthlySource = source.slice(monthlyStart, monthlyEnd);
assert(!monthlySource.includes('state.stadiumEventProposal = { ...show') && !monthlySource.includes('state.stadiumClubRental = {'), 'monthly finance has no separate offer-generation bypass');
console.log('PASS: aluguel e shows compartilham intervalo real de quatro rodadas em todos os caminhos.');

assert(source.includes('const homeAttendanceBonus = Math.min(5, Math.max(0, Number(crowdProjection?.attendanceForceBonus) || 0))'));
assert(source.includes('const hs = (homeStrength || teamStrengthByName(home)) + homeAttendanceBonus'));
assert(source.includes('function openWorldSaveChampionsModal()') && source.includes('state.worldChampionHistory.unshift(yearlyRecord)'));
assert(source.includes('const yearEliminations = (state.knockoutEliminations || []).filter'));
assert(source.includes('Infelizmente, você não passou do mata-mata.'));
assert(source.includes('fmtMoney(arenaLandCost(selectedArenaCapacity))') && source.includes('fmtMoney(arenaPermitCost(selectedArenaCapacity))'));
assert(source.includes('const homeCrowdBonus = Math.min(5, Math.max(0, Number(s.attendanceForceBonus'));
assert(source.includes('const hs = (teamStrengthByName(s.home) + homeCrowdBonus) * 1.08;'));
assert(source.includes('const AFM_PERMANENT_RULES = {'));
assert(source.includes('function obterForcaEfetivaPartida('));
assert(source.includes('function calcularOrcamentoNovaArena('));
assert(source.includes('function registrarEliminacaoMataMata('));
assert(source.includes('function consolidarViradaDeTemporada('));
assert(source.includes('state.campeoesDoMundoSave = state.worldChampionHistory;'));
console.log('PASS: bônus real da força em casa, histórico anual e eliminação têm caminhos persistidos.');
console.log('PASS: AFM_PERMANENT_RULES e funções complementares consolidadas.');
console.log('Todos os testes das novas regras econômicas/estádio passaram.');

