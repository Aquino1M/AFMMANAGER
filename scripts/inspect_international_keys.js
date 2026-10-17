const fs = require('fs');
const content = fs.readFileSync('data/international_teams_2026_27.js', 'utf8');
const keys = [...content.matchAll(/"([a-zA-Z0-9_-]+)"\s*:\s*\[/g)].map(m => m[1]);
console.log('Keys in international_teams_2026_27:', keys);

const compTeams = fs.readFileSync('data/competition_teams.js', 'utf8');
const compKeys = [...compTeams.matchAll(/'([a-zA-Z0-9_-]+)'\s*:\s*\[|"([a-zA-Z0-9_-]+)"\s*:\s*\[/g)].map(m => m[1] || m[2]);
console.log('Keys in competition_teams:', [...new Set(compKeys)]);
