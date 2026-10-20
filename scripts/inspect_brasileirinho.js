const fs = require('fs');
const path = require('path');

const htmlPath = 'c:/Users/Aquino/Downloads/Samambaia x Real Brasília · ao vivo · O Brasileirinho FC.html';
const filesDir = 'c:/Users/Aquino/Downloads/Samambaia x Real Brasília · ao vivo · O Brasileirinho FC_files';

console.log('HTML exists:', fs.existsSync(htmlPath));
console.log('Files dir exists:', fs.existsSync(filesDir));

const html = fs.readFileSync(htmlPath, 'utf8');

// Parse data-page
const idxStart = html.indexOf('data-page="');
if (idxStart !== -1) {
  const quoteStart = idxStart + 'data-page="'.length;
  const quoteEnd = html.indexOf('"', quoteStart);
  const rawData = html.slice(quoteStart, quoteEnd);
  try {
    const json = JSON.parse(rawData.replace(/&quot;/g, '"'));
    console.log('--- data-page content ---');
    console.log('Component:', json.component);
    console.log('Props:', JSON.stringify(json.props, null, 2).slice(0, 1500));
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
  }
}

// Check JS files in filesDir
console.log('\n--- Files in filesDir ---');
const files = fs.readdirSync(filesDir);
files.forEach(f => {
  const stat = fs.statSync(path.join(filesDir, f));
  console.log(`${f}: ${(stat.size / 1024).toFixed(1)} KB`);
});

// Search for stadium / three.js / match keywords in the downloaded JS files
console.log('\n--- Searching for 3D stadium keywords in downloaded files ---');
files.forEach(f => {
  if (f.endsWith('.js') || f.endsWith('.download')) {
    const code = fs.readFileSync(path.join(filesDir, f), 'utf8');
    const hasThree = code.includes('three') || code.includes('THREE') || code.includes('Scene');
    const hasGLTF = code.includes('gltf') || code.includes('GLTF') || code.includes('.glb');
    const hasStadium = code.includes('stadium') || code.includes('estadio') || code.includes('arena');
    const hasPitch = code.includes('pitch') || code.includes('gramado') || code.includes('campo');
    console.log(`${f} -> three: ${hasThree}, gltf/glb: ${hasGLTF}, stadium: ${hasStadium}, pitch: ${hasPitch}`);
  }
});
