const fs = require('fs');

global.window = {};
eval(fs.readFileSync('data/players_live.js', 'utf8'));
const allPlayers = global.window.LIVE_PLAYERS || [];

eval(fs.readFileSync('data/competition_teams.js', 'utf8'));
const braA = global.window.COMPETITION_TEAMS['bra-a'] || [];

const braAPlayers = allPlayers.filter(p => braA.includes(p.club));

let content = `/* Jogadores Série A 2026/2027 atualizados Transfermarkt */\nwindow.PLAYERS_BRA_A = [\n`;
for (const p of braAPlayers) {
  content += `  ${JSON.stringify(p)},\n`;
}
content += `];\nif (typeof window.LIVE_PLAYERS !== 'undefined') {\n  // merged\n}\n`;

fs.writeFileSync('data/players/players_bra_a.js', content, 'utf8');
console.log(`Synced ${braAPlayers.length} players to data/players/players_bra_a.js`);
