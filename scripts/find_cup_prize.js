const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

['cupPrize', 'state.balance += prize', 'state.balance += 50000000'].forEach(str => {
  let pos = 0;
  while (true) {
    const idx = code.indexOf(str, pos);
    if (idx === -1) break;
    const line = code.slice(0, idx).split('\n').length;
    console.log(`=== "${str}" at line ${line} ===`);
    console.log(code.substring(idx - 150, idx + 250).replace(/\r?\n/g, '\n'));
    pos = idx + str.length;
  }
});
