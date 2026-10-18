const fs = require('fs');

const p1 = fs.readFileSync('data/player_photos_modular.js', 'utf8');
const p2 = fs.readFileSync('data/player_photos.js', 'utf8');
const p3 = fs.readFileSync('data/player_photos_verified.js', 'utf8');
const allText = p1 + '\n' + p2 + '\n' + p3;

console.log('--- Checking Fabricio in photo files ---');
const regex = /["']([^"']*fabr[íi]cio[^"']*)["']\s*:\s*["']([^"']+)["']/gi;
let match;
while ((match = regex.exec(allText)) !== null) {
  console.log(`Key: "${match[1]}" -> Value: "${match[2]}"`);
}

console.log('\n--- Checking Matheus Pereira in photo files ---');
const regexMP = /["']([^"']*Matheus Pereira[^"']*)["']\s*:\s*["']([^"']+)["']/gi;
while ((match = regexMP.exec(allText)) !== null) {
  console.log(`Key: "${match[1]}" -> Value: "${match[2]}"`);
}
