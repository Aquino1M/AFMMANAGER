const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const tabMatches = [...html.matchAll(/data-tab=["']([^"']+)["']/g)].map(m => m[1]);
const uniqueTabs = [...new Set(tabMatches)];
console.log('Unique tabs from index.html:', uniqueTabs);

// Also search for tab-related render functions in js/game.js
const gameJs = fs.readFileSync('js/game.js', 'utf8');
const switchTabMatches = [...gameJs.matchAll(/case\s+['"]([a-zA-Z0-9_-]+)['"]\s*:/g)].map(m => m[1]);
console.log('Case tabs found in game.js:', [...new Set(switchTabMatches)].filter(t => uniqueTabs.includes(t) || t.startsWith('tab-') || ['overview','squad','tactics','calendar','transfers','finances','facilities','standings','stats','history','settings'].includes(t)));
