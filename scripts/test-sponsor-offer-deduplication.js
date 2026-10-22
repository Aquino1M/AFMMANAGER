const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');
const marker = 'function uniqueAvailableSponsorOffers(';
const start = source.indexOf(marker);
if(start < 0) throw new Error('uniqueAvailableSponsorOffers not found');
const open = source.indexOf('{', start);
let depth = 0;
let end = -1;
for(let i = open; i < source.length; i++){
  if(source[i] === '{') depth++;
  else if(source[i] === '}' && --depth === 0){ end = i + 1; break; }
}
if(end < 0) throw new Error('uniqueAvailableSponsorOffers is incomplete');

const context = {
  norm(value){ return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); },
  SPONSOR_CONTRACT_SLOTS: [['master', 'Master'], ['sleeves', 'Mangas'], ['back', 'Costas']]
};
const uniqueAvailableSponsorOffers = vm.runInNewContext(`(${source.slice(start, end)})`, context);
const offers = uniqueAvailableSponsorOffers([
  { brand: 'Pepsi', category: 'Master', monthly: 80000 },
  { brand: 'pepsi', category: 'Master', monthly: 80000 },
  { brand: 'GOL Linhas Aéreas', category: 'Mangas' },
  { brand: 'Zé Delivery', category: 'Costas' }
], { master: { brand: 'Pepsi' } });

if(offers.length !== 2 || offers.some(offer => context.norm(offer.brand) === 'pepsi')){
  throw new Error('Offers must exclude active sponsors and duplicate brands');
}

console.log('PASS: propostas removem marcas já ativas e duplicatas entre si.');
