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

const capacity = source.match(/const YOUTH_ACADEMY_CAPACITY = \d+;/)?.[0];
if(!capacity) throw new Error('Youth academy capacity constant not found');
const context = {};
vm.runInNewContext([
  capacity,
  extractFunction('normTacticalPos'),
  extractFunction('normalizeYouthAcademyPositions'),
  extractFunction('normalizeYouthAcademyRoster'),
  extractFunction('addYouthAcademyPlayer'),
  extractFunction('restoreYouthAcademyOverflow')
].join('\n'), context);
const helpers = vm.runInNewContext('({ capacity: YOUTH_ACADEMY_CAPACITY, normalizeYouthAcademyRoster, addYouthAcademyPlayer, restoreYouthAcademyOverflow })', context);

const save = { youthAcademy: Array.from({ length: 178 }, (_, id) => ({ id })) };
helpers.normalizeYouthAcademyRoster(save);
if(save.youthAcademy.length !== 15 || save.youthAcademyOverflow.length !== 163){
  throw new Error('Legacy saves must be capped at 15 without losing excess players');
}
if(helpers.addYouthAcademyPlayer({ id: 'extra' }, save)) throw new Error('A full academy must reject new players');
save.youthAcademy.pop();
if(helpers.restoreYouthAcademyOverflow(save) !== 1 || save.youthAcademy.length !== 15 || save.youthAcademyOverflow.length !== 162){
  throw new Error('A free academy spot must restore exactly one waiting player');
}
const positionSave = { youthAcademy: [{ position: 'MEI' }, { pos: 'ZAG' }, {}], youthAcademyOverflow: [] };
helpers.normalizeYouthAcademyRoster(positionSave);
if(positionSave.youthAcademy[0].pos !== 'AM' || positionSave.youthAcademy[1].pos !== 'CB' || !positionSave.youthAcademy[2].pos){
  throw new Error('Legacy youth players must receive a normalized position');
}

console.log('PASS: base limitada a 15, excedentes preservados, vagas restauráveis e posições normalizadas.');
