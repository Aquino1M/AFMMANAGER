const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') searchDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.css'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('ATLETA') || content.includes('Idade:') || content.includes('Wesley')) {
        const lines = content.split('\n');
        lines.forEach((l, idx) => {
          if (l.includes('Idade:') && l.includes('Clube:')) {
            console.log('MATCH Idade+Clube:', fullPath, 'line', idx + 1, l.trim());
          }
          if (l.includes('ATLETA')) {
            console.log('MATCH ATLETA:', fullPath, 'line', idx + 1, l.trim());
          }
        });
      }
    }
  }
}
searchDir('.');
