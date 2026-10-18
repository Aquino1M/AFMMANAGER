const fs = require('fs');

global.window = {};
eval(fs.readFileSync('data/players_live.js', 'utf8'));
const players = global.window.LIVE_PLAYERS || [];

eval(fs.readFileSync('data/competition_teams.js', 'utf8'));
const compTeams = global.window.COMPETITION_TEAMS || {};
const usaTeams = compTeams['usa-1'] || [];

console.log('=== MLS Teams Check ===');
for (const t of usaTeams) {
  const squad = players.filter(p => p.club && p.club.toLowerCase() === t.toLowerCase());
  console.log(`${t}: ${squad.length} players`);
  if (squad.length > 0 && squad.length <= 15) {
    console.log('  -> ' + squad.map(p => `${p.name} (${p.photo ? 'has photo' : 'NO photo'})`).join(', '));
  }
}
