const fs = require('fs');

const code = fs.readFileSync('js/game.js', 'utf8');

// Find function page()
const pagePos = code.indexOf('function page(');
console.log('function page is at line:', code.slice(0, pagePos).split('\n').length);
const pageSlice = code.substring(pagePos, pagePos + 5000);
console.log(pageSlice.slice(0, 3000));
