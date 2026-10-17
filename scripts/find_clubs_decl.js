const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

const regex = /(?:const|let|var)\s+clubs\s*=/g;
let m;
while ((m = regex.exec(code)) !== null) {
  const line = code.slice(0, m.index).split('\n').length;
  console.log(`Line ${line}:`, code.substring(m.index, m.index + 200).replace(/\r?\n/g, ' '));
}
