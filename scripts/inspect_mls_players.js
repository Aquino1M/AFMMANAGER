const fs = require('fs');
const code = fs.readFileSync('data/players_live.js', 'utf8');

const mlsClubs = [
  'Inter Miami', 'LA Galaxy', 'Los Angeles FC', 'Columbus Crew',
  'New York City FC', 'New York Red Bulls', 'Seattle Sounders',
  'Atlanta United', 'FC Cincinnati', 'Orlando City'
];

mlsClubs.forEach(club => {
  const matches = [...code.matchAll(new RegExp(`{name:'([^']+)',club:'${club}'`, 'g'))].map(m => m[1]);
  console.log(`${club} players (${matches.length}):`, matches);
});
