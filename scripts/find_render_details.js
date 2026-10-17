const fs = require('fs');

const code = fs.readFileSync('js/game.js', 'utf8');

// Look for state.tab, state.view, state.currentTab, or render() switch
const renderPos = code.indexOf('function render(');
console.log('function render is at line:', code.slice(0, renderPos).split('\n').length);
const renderSlice = code.substring(renderPos, renderPos + 4000);
console.log(renderSlice.slice(0, 2000));
