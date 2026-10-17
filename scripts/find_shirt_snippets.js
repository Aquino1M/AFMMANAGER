const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

const regex = /(?:shirtNumber|\.number\b|numera[cç]|camisa)/gi;
let m;
while ((m = regex.exec(code)) !== null) {
  const line = code.slice(0, m.index).split('\n').length;
  console.log(`Line ${line}:`, code.substring(m.index - 30, m.index + 50).replace(/\r?\n/g, ' '));
}
