const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const moduleDir = path.join(root, 'data', 'badges');
const window = {};
const sources = fs.readdirSync(moduleDir)
  .filter(file => /^badges_.*\.js$/i.test(file))
  .sort();

for(const file of sources){
  const source = fs.readFileSync(path.join(moduleDir, file), 'utf8');
  vm.runInNewContext(`(function(){${source}\n})();`, { window }, { filename: file });
}

const output = [
  '// Gerado por scripts/build-club-badges.js a partir de data/badges/*.js.',
  `// Mapas consolidados: ${sources.length}.`,
  `window.CLUB_BADGES = Object.assign(window.CLUB_BADGES || {}, ${JSON.stringify(window.CLUB_BADGES || {}, null, 2)});`,
  ''
].join('\n');

fs.writeFileSync(path.join(root, 'data', 'club_badges_competitions.js'), output, 'utf8');
console.log(`Escudos consolidados: ${Object.keys(window.CLUB_BADGES || {}).length}; mapas fonte: ${sources.length}.`);
