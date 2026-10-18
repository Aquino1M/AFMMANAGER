const fs = require('fs');

global.window = {};
eval(fs.readFileSync('data/players_live.js', 'utf8'));
const players = global.window.LIVE_PLAYERS || [];

const nameMap = new Map();
for (const p of players) {
  const normName = (p.name || '').trim().toLowerCase();
  if (!normName) continue;
  if (!nameMap.has(normName)) {
    nameMap.set(normName, []);
  }
  nameMap.get(normName).push(p);
}

const homonyms = [];
for (const [name, list] of nameMap.entries()) {
  if (list.length > 1) {
    // Check if they are in different clubs
    const clubs = new Set(list.map(p => p.club));
    homonyms.push({
      name: list[0].name,
      count: list.length,
      clubs: Array.from(clubs),
      players: list.map(p => ({ club: p.club, pos: p.pos, age: p.age, photo: p.photo, tmId: p.tmId }))
    });
  }
}

homonyms.sort((a, b) => b.count - a.count);
console.log(`Found ${homonyms.length} homonyms in players_live.js:`);
for (const h of homonyms.slice(0, 30)) {
  console.log(`- "${h.name}" (${h.count} occurrences): ${h.clubs.join(', ')}`);
}

fs.writeFileSync('scripts/homonyms_report.json', JSON.stringify(homonyms, null, 2), 'utf8');
console.log('Saved full report to scripts/homonyms_report.json');
