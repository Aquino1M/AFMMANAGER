const fs = require('fs');

const gameCode = fs.readFileSync('js/game.js', 'utf8');

// Find CLUBS = { ... }
const startIdx = gameCode.indexOf('CLUBS = {');
if (startIdx === -1) {
  console.log('CLUBS = { not found');
  process.exit(1);
}

// Let's find keys of CLUBS
const sample = gameCode.slice(startIdx, startIdx + 30000);
// Look for keys like 'bra-a': [, 'eng-1': [, etc.
const keyRegex = /['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*\[/g;
let m;
const keys = [];
while ((m = keyRegex.exec(sample)) !== null) {
  keys.push(m[1]);
}
console.log('Top keys found in CLUBS sample:', keys);
