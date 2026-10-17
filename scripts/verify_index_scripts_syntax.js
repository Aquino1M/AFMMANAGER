const fs = require('fs');
const cp = require('child_process');

const html = fs.readFileSync('index.html', 'utf8');
const scriptSrcs = [...html.matchAll(/<script[^>]+src=['"]([^'"]+)['"]/g)].map(m => m[1]);

console.log('Total scripts found in index.html:', scriptSrcs.length);

let errors = 0;
for (const src of scriptSrcs) {
  if (src.startsWith('http')) {
    console.log('External CDN script:', src);
    continue;
  }
  const cleanPath = src.split('?')[0];
  if (!fs.existsSync(cleanPath)) {
    console.log('❌ ERROR: File DOES NOT EXIST:', cleanPath);
    errors++;
  } else {
    try {
      cp.execSync('node --check "' + cleanPath + '"', { stdio: 'pipe' });
      console.log('✓ OK:', cleanPath);
    } catch (e) {
      console.log('❌ SYNTAX ERROR in file:', cleanPath);
      console.log(e.stderr ? e.stderr.toString() : e.message);
      errors++;
    }
  }
}
console.log('Total errors:', errors);
