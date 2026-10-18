const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Read Santos and Chelsea extracted players
const santosHtml = fs.readFileSync('C:/Users/Aquino/.gemini/antigravity/brain/ca91de2b-b003-4bb9-8b37-143e47ee66f5/.system_generated/steps/6106/content.md', 'utf8');
const chelseaHtml = fs.readFileSync('C:/Users/Aquino/.gemini/antigravity/brain/ca91de2b-b003-4bb9-8b37-143e47ee66f5/.system_generated/steps/6216/content.md', 'utf8');

function extractPlayersFromKader(html, clubName) {
  const regex = /<table[^>]*class="inline-table"[^>]*>([\s\S]*?)<\/table>/g;
  let m;
  const list = [];
  while ((m = regex.exec(html)) !== null) {
    const block = m[1];
    const imgMatch = block.match(/data-src="([^"]+)"/) || block.match(/src="([^"]+)"/);
    const nameMatch = block.match(/<a href="\/[^\/]+\/profil\/spieler\/(\d+)">\s*([^<]+)/);
    const posMatch = block.match(/<tr>\s*<td>\s*([^<]+)\s*<\/td>\s*<\/tr>/);

    if (nameMatch) {
      const tmId = nameMatch[1];
      const name = nameMatch[2].trim();
      const pos = posMatch ? posMatch[1].trim() : '';
      const imgUrl = imgMatch ? imgMatch[1] : '';
      const hasRealPhoto = imgUrl && !imgUrl.includes('default.jpg') && !imgUrl.includes('data:image');
      if (hasRealPhoto) {
        list.push({ tmId, name, pos, imgUrl, club: clubName });
      }
    }
  }
  return list;
}

const allVerified = [
  ...extractPlayersFromKader(santosHtml, 'Santos'),
  ...extractPlayersFromKader(chelseaHtml, 'Chelsea')
];

console.log(`Found ${allVerified.length} verified players to download.`);

async function downloadPhoto(p) {
  return new Promise((resolve) => {
    const outPath = path.join(__dirname, '..', 'img', 'players', `tm_${p.tmId}.jpg`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      return resolve({ success: true, path: `img/players/tm_${p.tmId}.jpg`, player: p });
    }
    
    const req = https.get(p.imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ success: false, error: `HTTP ${res.statusCode}` });
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(outPath, buf);
        resolve({ success: true, path: `img/players/tm_${p.tmId}.jpg`, player: p });
      });
    });
    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function run() {
  let downloaded = 0;
  const mapped = [];

  for (const p of allVerified) {
    const res = await downloadPhoto(p);
    if (res.success) {
      downloaded++;
      mapped.push({ name: p.name, relPath: res.path });
    }
  }

  console.log(`Successfully downloaded/verified ${downloaded} player photos!`);

  // Update data/player_photos_modular.js
  const modularPath = path.join(__dirname, '..', 'data', 'player_photos_modular.js');
  global.window = {};
  eval(fs.readFileSync(modularPath, 'utf8'));
  const currentMap = global.window.PLAYER_PHOTOS || {};

  mapped.forEach(m => {
    currentMap[m.name] = m.relPath;
    currentMap[m.name.toLowerCase()] = m.relPath;
  });

  let out = '// ==============================================================================\n';
  out += '// AFM MANAGER 2027 — MAPEAMENTO DE FOTOS VERIFICADAS (SEM FOTOS REPETIDAS)\n';
  out += `// Total de fotos válidas e verificadas: ${Object.keys(currentMap).length}\n`;
  out += '// ==============================================================================\n';
  out += 'window.PLAYER_PHOTOS = Object.assign(window.PLAYER_PHOTOS || {}, {\n';

  const entries = Object.entries(currentMap).map(([k, v]) => `  "${k.replace(/"/g, '\\"')}": "${v}"`);
  out += entries.join(',\n') + '\n});\n';

  fs.writeFileSync(modularPath, out, 'utf8');
  console.log('Updated data/player_photos_modular.js with newly downloaded photos!');
}

run();
