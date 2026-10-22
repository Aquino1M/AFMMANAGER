const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');
const marker = 'function getMuseumHistoricalTitles(';
const start = source.indexOf(marker);
if(start < 0) throw new Error('getMuseumHistoricalTitles not found');
const open = source.indexOf('{', start);
let depth = 0;
let end = -1;
for(let i = open; i < source.length; i++){
  if(source[i] === '{') depth++;
  else if(source[i] === '}' && --depth === 0){ end = i + 1; break; }
}
if(end < 0) throw new Error('getMuseumHistoricalTitles is incomplete');

const context = {
  state: null,
  window: { REAL_CLUB_TROPHIES_DB: { 'cachaceiros futebol clube': [{ name: 'Título histórico indevido', year: '2020' }], flamengo: [{ name: 'Copa oficial', year: '2022' }] } }
};
const getMuseumHistoricalTitles = vm.runInNewContext(`(${source.slice(start, end)})`, context);

if(getMuseumHistoricalTitles({ club: 'Cachaceiros Futebol Clube', customClub: { isCustom: true } }).length !== 0){
  throw new Error('Clube criado pelo usuário deve iniciar sem títulos históricos');
}
if(getMuseumHistoricalTitles({ club: 'Flamengo' })[0] !== 'Copa oficial (2022)'){
  throw new Error('Clube real deve manter seu acervo histórico oficial');
}

console.log('PASS: clubes criados do zero começam sem taças históricas e clubes reais preservam o acervo.');
