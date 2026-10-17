const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

let pos = 0;
while (true) {
  const idx = code.indexOf('btn-news-channel', pos);
  if (idx === -1) break;
  const line = code.slice(0, idx).split('\n').length;
  console.log(`Line ${line}:`, code.substring(idx - 40, idx + 80).replace(/\r?\n/g, ' '));
  pos = idx + 1;
}
