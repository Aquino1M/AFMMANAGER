const fs = require('fs');

console.log('=== DATA/COMPETITION_TEAMS.JS ===');
const ct = fs.readFileSync('data/competition_teams.js', 'utf8');
console.log('Size:', ct.length, 'lines:', ct.split('\n').length);
console.log(ct.split('\n').slice(0, 40).join('\n'));

console.log('\n=== DATA/INTERNATIONAL_TEAMS_2026_27.JS ===');
const it = fs.readFileSync('data/international_teams_2026_27.js', 'utf8');
console.log('Size:', it.length, 'lines:', it.split('\n').length);
console.log(it.split('\n').slice(0, 40).join('\n'));
