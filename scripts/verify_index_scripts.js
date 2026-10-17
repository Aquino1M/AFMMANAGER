const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\s+src=["']([^"']+)["']/g;
let match;
const scripts = [];
while ((match = scriptRegex.exec(html)) !== null) {
  scripts.push(match[1].split('?')[0]);
}
console.log('Found scripts:', scripts.length);
let missing = 0;
scripts.forEach(s => {
  if (!s.startsWith('http')) {
    if (!fs.existsSync(s)) {
      console.error('MISSING SCRIPT:', s);
      missing++;
    }
  }
});
if (missing === 0) {
  console.log('All local scripts exist in index.html!');
}
