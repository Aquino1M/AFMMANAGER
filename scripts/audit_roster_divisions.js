const fs = require('fs');

global.window = {};
eval(fs.readFileSync('data/players_live.js', 'utf8'));
const players = global.window.LIVE_PLAYERS || [];
console.log('Total players in players_live.js:', players.length);

eval(fs.readFileSync('data/competition_teams.js', 'utf8'));
const compTeams = global.window.COMPETITION_TEAMS || {};

const braA = compTeams['bra-a'] || [];
const braB = compTeams['bra-b'] || [];
const braC = compTeams['bra-c'] || [];
const braD = compTeams['bra-d'] || [];

function checkDiv(divName, teamList) {
  console.log(`\n=== Division ${divName} (${teamList.length} teams) ===`);
  const missing = [];
  const lowCount = [];
  const good = [];
  for (const t of teamList) {
    const count = players.filter(p => p.club && p.club.toLowerCase() === t.toLowerCase()).length;
    if (count === 0) {
      missing.push(t);
    } else if (count < 11) {
      lowCount.push({ team: t, count });
    } else {
      good.push({ team: t, count });
    }
  }
  console.log(`Good (>= 11 players): ${good.length}/${teamList.length}`);
  if (lowCount.length) console.log(`Low (< 11 players): ${lowCount.length}`, lowCount);
  if (missing.length) console.log(`Missing (0 players): ${missing.length}`, missing);
}

checkDiv('SÉRIE A (bra-a)', braA);
checkDiv('SÉRIE B (bra-b)', braB);
checkDiv('SÉRIE C (bra-c)', braC);
checkDiv('SÉRIE D (bra-d)', braD);
