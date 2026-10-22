const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');

function extractFunction(name){
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if(start < 0) throw new Error(`${name} not found`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for(let i = open; i < source.length; i++){
    if(source[i] === '{') depth++;
    else if(source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${name} is incomplete`);
}

const context = {
  state: { season: 2026 },
  SPONSOR_CONTRACT_SLOTS: [['master', 'Master'], ['sleeves', 'Mangas'], ['back', 'Costas']]
};
const lifecycle = vm.runInNewContext(
  `${extractFunction('activateSponsorContract')}\n${extractFunction('expireSeasonSponsorContracts')}\n({ activateSponsorContract, expireSeasonSponsorContracts })`,
  context
);
const contract = lifecycle.activateSponsorContract({ brand: 'Marca A', category: 'Master', years: 1 }, 2026);
const career = {
  season: 2027,
  sponsors: { master: contract, sleeves: null, back: null },
  sponsorOffers: [],
  news: []
};

if(contract.contractStartSeason !== 2026 || contract.contractEndSeason !== 2026){
  throw new Error('New contract must store its start and end seasons');
}
if(lifecycle.expireSeasonSponsorContracts(career, 2027).length !== 1 || career.sponsors.master !== null){
  throw new Error('Expired sponsor must be removed from the active slot at the next season');
}
if(career.sponsorOffers.length !== 1 || career.sponsorOffers[0].renewalFor !== 'master' || career.news.length !== 1){
  throw new Error('Expiration must create a renewal proposal and notify the user');
}
if(lifecycle.expireSeasonSponsorContracts(career, 2027).length !== 0 || career.sponsorOffers.length !== 1 || career.news.length !== 1){
  throw new Error('Repeated migration/render must not duplicate expired offers or news');
}
const multiYear = lifecycle.activateSponsorContract({ brand: 'Marca B', years: 3 }, 2027);
if(multiYear.contractEndSeason !== 2029){
  throw new Error('Multi-year contract must expire after its final contracted season');
}

console.log('PASS: contratos de patrocínio vencem na virada, geram renovação sem duplicar e respeitam a duração.');
