const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');
let passed = 0;
let failed = 0;

function assert(condition, label){
  if(condition){
    console.log(`✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${label}`);
    failed++;
  }
}

function extractFunction(name){
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if(start < 0) throw new Error(`Function not found: ${name}`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for(let i = open; i < source.length; i++){
    if(source[i] === '{') depth++;
    if(source[i] === '}' && --depth === 0){
      return source.slice(start, i + 1);
    }
  }
  throw new Error(`Function is incomplete: ${name}`);
}
function loadFunction(name, context = {}){
  return vm.runInNewContext(`(${extractFunction(name)})`, context);
}

const splitPayment = loadFunction('bankLoanPaymentBreakdown');
const loan = {
  principal:480000, totalDebt:537600, remainingDebt:537600,
  totalInstallments:12, remainingInstallments:12, paidInstallments:0,
  installmentValue:44800, remainingPrincipal:480000
};
let principalTotal = 0;
let interestTotal = 0;
let paymentsConserved = true;
for(let i = 0; i < loan.totalInstallments; i++){
  const split = splitPayment(loan, loan.installmentValue);
  paymentsConserved = paymentsConserved && split.amount === split.principalPaid + split.interestPaid;
  loan.remainingPrincipal = split.remainingPrincipal;
  loan.remainingDebt -= split.amount;
  loan.paidInstallments++;
  principalTotal += split.principalPaid;
  interestTotal += split.interestPaid;
}
assert(paymentsConserved, 'Todas as parcelas fecham com principal + juros igual ao débito');
assert(principalTotal === 480000 && interestTotal === 57600 && loan.remainingDebt === 0,
  'Quitação separa o principal do custo de juros sem alterar o valor total pago');

const sponsorFactor = loadFunction('currentSeasonSponsorFactor');
assert(sponsorFactor(1, 20, 'bra-a') > sponsorFactor(18, 20, 'bra-a'),
  'Melhor colocação na Série A eleva o fator dos patrocínios');
assert(sponsorFactor(1, 20, 'bra-a') > sponsorFactor(1, 20, 'bra-b'),
  'Subida para a Série A eleva o fator anual dos patrocínios');

const projectionState = {
  season:2026, club:'Clube Teste', infrastructure:{admin:{level:1}}, storeConfig:{level:1, pricing:'normal', stock:'normal'},
  marketingWeekly:12000, bankLoans:[{remainingInstallments:4, installmentValue:30000}],
  scoutStaffCount:2,
  stadiumRingData:{debt:{remaining:80000, monthly:20000}},
  history:[{season:2026, isHome:true, won:true, h:'Clube Teste', gate:100000, parkRevenue:10000, shop:5000}]
};
const projection = loadFunction('monthlyFinancialProjection', {
  state:projectionState,
  curComp:()=>({id:'bra-a'}), totalSponsorMonthly:()=>300000, totalSponsorWinBonus:()=>20000,
  getSocioTorcedorMeta:()=>({currentIncome:50000}), monthlyFacilityIncome:()=>13000,
  totalMonthlyPayroll:()=>500000, getMonthlyScoutPayroll:s=>Math.max(0,Number(s?.scoutStaffCount)||0)*18000, norm:value=>String(value || '').toLowerCase()
});
const forecast = projection();
assert(forecast.revenue.gate === 200000 && forecast.revenue.parking === 20000 && forecast.revenue.matchSales === 10000 && forecast.revenue.winBonuses === 40000,
  'Previsão mensal calcula média de bilheteria/estacionamento e bônus por vitórias');
assert(forecast.expenses.bankRepayments === 60000 && forecast.expenses.stadiumRepayments === 20000 && forecast.expenses.scouts === 36000,
  'Previsão mensal mostra parcelas bancárias, obras e salários de olheiros separados');
assert(forecast.monthlyRevenue === 9453250 && forecast.monthlyExpenses === 664000 && forecast.monthlyBalance === 8789250,
  'Total e saldo previstos reconciliam todas as categorias mensais');

const scoutHelpers = loadFunction('activeScoutCount', {});
assert(scoutHelpers({scoutStaffCount:0,scoutMissions:[{type:'promises'}]}) === 0
  && scoutHelpers({scoutStaffCount:1}) === 1,
  'Missões antigas não contam como olheiro contratado e a contagem de equipe é independente das filas de trabalho');

assert(!/state\.income\s*=\s*\(state\.income\s*\|\|\s*0\)\s*\+\s*selectedLoanAmount/.test(source),
  'Liberação de empréstimo não é registrada como receita operacional');
assert(source.includes('state.financeLegacyTotals') && source.includes('state.financePeriodStartedDate = state.date'),
  'Totais antigos são preservados e a nova apuração tem uma data de início');

console.log(`\nTOTAL: ${passed + failed} | APROVADOS: ${passed} | FALHAS: ${failed}`);
process.exitCode = failed ? 1 : 0;
