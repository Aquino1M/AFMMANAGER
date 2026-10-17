const fs = require('fs');

const game = fs.readFileSync('js/game.js', 'utf8');
const lines = game.split('\n');

console.log('--- TOURNAMENTS IN GAME.JS ---');
lines.forEach((l, i) => {
  if (l.includes("'ucl'") || l.includes('"ucl"') || l.includes("'cwc'") || l.includes('"cwc"') || l.includes('continentalSlots') || l.includes('getContinentalTournament')) {
    console.log(`L${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
