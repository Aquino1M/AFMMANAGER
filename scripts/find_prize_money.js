const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

const matches = code.match(/function\s+[a-zA-Z0-9_]*prize[a-zA-Z0-9_]*\s*\([^)]*\)|function\s+[a-zA-Z0-9_]*premia[a-zA-Z0-9_]*\s*\([^)]*\)/gi);
console.log('Prize functions:', matches);

// Search for PRIZE constants or objects
const prizeConsts = code.match(/(?:const|let|var)\s+[A-Za-z0-9_]*(?:PRIZE|PREMIACAO)[A-Za-z0-9_]*\s*=/g);
console.log('Prize constants:', prizeConsts);

// Search where calculateSeasonPrizeMoney is defined
const idx = code.indexOf('calculateSeasonPrizeMoney');
if (idx !== -1) {
  console.log('calculateSeasonPrizeMoney snippet:');
  console.log(code.substring(idx - 50, idx + 800));
}

// Search for copa or continental prizes
const copaIdx = code.indexOf('copaPrize');
if (copaIdx !== -1) {
  console.log('copaPrize snippet:');
  console.log(code.substring(copaIdx - 50, copaIdx + 300));
}
