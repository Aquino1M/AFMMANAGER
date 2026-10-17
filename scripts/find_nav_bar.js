const fs = require('fs');

const code = fs.readFileSync('js/game.js', 'utf8');

// Find navigation buttons / sidebar
const navMatches = code.match(/data-view=["'][^"']+["']/g);
console.log('data-view buttons found in game.js:', [...new Set(navMatches)]);

const sideNavMatch = code.match(/<nav class="nav"[\s\S]{1,1200}<\/nav>/);
if (sideNavMatch) {
  console.log('Side nav HTML:');
  console.log(sideNavMatch[0]);
} else {
  // search for class="nav"
  const navIdx = code.indexOf('class="nav"');
  if (navIdx !== -1) {
    console.log('nav class at', navIdx);
    console.log(code.substring(navIdx - 50, navIdx + 1200));
  }
}
