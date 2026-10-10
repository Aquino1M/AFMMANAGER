const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const context = { window: {} };
for(const file of ['data/club_badges.js', 'data/club_badges_unverified.js', 'data/competition_teams.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const teams = context.window.COMPETITION_TEAMS || {};
const badges = context.window.CLUB_BADGES || {};
const unverifiedBadges = context.window.CLUB_BADGES_UNVERIFIED || new Set();
const aliases = vm.runInNewContext('typeof CLUB_ALIASES === "undefined" ? {} : CLUB_ALIASES', context);
const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const files = new Set();
function walk(dir){
  if(!fs.existsSync(dir)) return;
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) walk(full);
    else if(/\.(png|svg|webp)$/i.test(entry.name)) files.add(path.relative(root, full).replace(/\\/g, '/').toLowerCase());
  }
}
walk(path.join(root, 'img/badges'));

const allEntries = Object.entries(badges);
function badgeFile(club){
  const n = norm(club);
  const alias = Object.entries(aliases).find(([key]) => norm(key) === n)?.[1];
  const mapped = alias || badges[club] || allEntries.find(([key]) => norm(key) === n)?.[1];
  if(mapped){
    const candidate = String(mapped).startsWith('img/badges/') ? String(mapped).toLowerCase() : `img/badges/${mapped}`.toLowerCase();
    const found = [...files].find(file => file === candidate || file.endsWith('/' + String(mapped).replace(/\\/g, '/').toLowerCase()));
    if(found) return found;
  }
  const slug = n.replace(/ /g, '_');
  return [...files].find(file => file.split('/').pop().replace(/\.(png|svg|webp)$/i, '') === slug) || null;
}

const missing = [];
const checked = new Set();
const totals = new Map();
for(const [competition, names] of Object.entries(teams)){
  if(!Array.isArray(names)) continue;
  totals.set(competition, { total: names.length, missing: 0 });
  for(const club of names){
    const key = `${competition}|${club}`;
    if(checked.has(key)) continue;
    checked.add(key);
    if(!badgeFile(club)){
      missing.push({ competition, club });
      totals.get(competition).missing++;
    }
  }
}

const photosRoot = path.join(root, 'img/players');
let photoCount = 0;
function countPhotos(dir){
  if(!fs.existsSync(dir)) return;
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) countPhotos(full);
    else if(/\.(png|jpe?g|webp)$/i.test(entry.name)) photoCount++;
  }
}
countPhotos(photosRoot);

console.log(`Escudos locais: ${files.size}`);
console.log(`Associações clube/competição conferidas: ${checked.size}`);
console.log(`Associações sem arquivo correspondente: ${missing.length}`);
console.log(`Escudos repetidos ocultos até correção: ${unverifiedBadges.size}`);
for(const [competition, result] of totals){
  console.log(`  ${competition}: ${result.total - result.missing}/${result.total} com arquivo${result.missing ? ` (${result.missing} faltando)` : ''}`);
}
console.log(`Fotos de jogadores no disco: ${photoCount}`);
console.log('A verificação confirma caminho/arquivo; não confirma visualmente se o escudo pertence ao clube.');
if(missing.length) process.exitCode = 1;
