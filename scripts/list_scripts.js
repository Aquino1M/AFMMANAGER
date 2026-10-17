const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/g)].map(m => m[1]);
console.log('Scripts loaded in index.html (in order):');
scripts.forEach((s, i) => console.log(`${i + 1}. ${s}`));
