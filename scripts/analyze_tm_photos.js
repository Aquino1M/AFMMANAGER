const fs = require('fs');

const scrapedData = JSON.parse(fs.readFileSync('scripts/tm_scraped_squads.json', 'utf8'));

let totalPlayers = 0;
let downloadedPhotos = 0;
let missingPhotos = 0;
const clubStats = {};

for (const [club, squad] of Object.entries(scrapedData)) {
  clubStats[club] = { total: squad.length, downloaded: 0, missing: 0 };
  for (const p of squad) {
    totalPlayers++;
    if (p.tmId && fs.existsSync(`img/players/tm_${p.tmId}.jpg`)) {
      downloadedPhotos++;
      clubStats[club].downloaded++;
    } else {
      missingPhotos++;
      clubStats[club].missing++;
    }
  }
}

console.log(`Total Scraped Players: ${totalPlayers}`);
console.log(`Downloaded Photos on disk: ${downloadedPhotos}`);
console.log(`Missing Photos: ${missingPhotos}`);
console.log('\nPer Club Stats:');
for (const [club, stat] of Object.entries(clubStats)) {
  console.log(`- ${club.padEnd(22)}: ${stat.downloaded}/${stat.total} photos (${Math.round(stat.downloaded/stat.total*100)}%)`);
}
