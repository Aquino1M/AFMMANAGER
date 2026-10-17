const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

code = code.replace(
  /processFitness\(\);/g,
  "if(typeof processFitness === 'function') processFitness();"
);

code = code.replace(
  /processDevelopment\(\);/g,
  "if(typeof processDevelopment === 'function') processDevelopment();"
);

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('Guarded processFitness and processDevelopment successfully');
