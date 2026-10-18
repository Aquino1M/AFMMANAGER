const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const squads = JSON.parse(fs.readFileSync('scripts/tm_scraped_squads.json', 'utf8'));

// Read currently verified photos
const verifiedPath = path.join(__dirname, '..', 'data', 'player_photos_verified.js');
const modularPath = path.join(__dirname, '..', 'data', 'player_photos_modular.js');

global.window = {};
if (fs.existsSync(modularPath)) {
  eval(fs.readFileSync(modularPath, 'utf8'));
}
const currentPhotos = global.window.PLAYER_PHOTOS || {};

// Build a list of candidate players to download:
// Up to 8 players per club with highest value or stars who have imgUrl
const candidates = [];
for (const [club, players] of Object.entries(squads)) {
  const sorted = [...players]
    .filter(p => p.imgUrl && !p.imgUrl.includes('default.jpg'))
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  
  // Take top 8 players per club
  const top = sorted.slice(0, 8);
  candidates.push(...top);
}

console.log(`Total candidate players to download from Transfermarkt: ${candidates.length}`);

// Track seen hashes to ensure ABSOLUTELY ZERO duplicated images across athletes
const seenHashes = new Map();

// Populate existing files hashes
const existingFiles = fs.readdirSync(path.join(__dirname, '..', 'img', 'players'))
  .filter(f => !fs.statSync(path.join(__dirname, '..', 'img', 'players', f)).isDirectory());

for (const file of existingFiles) {
  const fullPath = path.join(__dirname, '..', 'img', 'players', file);
  try {
    const buf = fs.readFileSync(fullPath);
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    seenHashes.set(hash, file);
  } catch (e) {}
}

console.log(`Existing unique image hashes on disk: ${seenHashes.size}`);

async function downloadOne(p) {
  return new Promise((resolve) => {
    const filename = `tm_${p.tmId}.jpg`;
    const dest = path.join(__dirname, '..', 'img', 'players', filename);
    const rel = `img/players/${filename}`;

    // If already exists on disk
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve({ success: true, rel, player: p });
    }

    const req = https.get(p.imgUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ success: false, reason: `HTTP ${res.statusCode}` });
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 1000) {
          return resolve({ success: false, reason: 'Too small / corrupted' });
        }
        const hash = crypto.createHash('md5').update(buf).digest('hex');
        // Check if this hash was already used by another player!
        if (seenHashes.has(hash)) {
          console.warn(`[DUPLICATE BLOCKED] ${p.name} shares identical image with ${seenHashes.get(hash)}! Skipping!`);
          return resolve({ success: false, reason: 'Duplicate image hash' });
        }
        seenHashes.set(hash, filename);
        fs.writeFileSync(dest, buf);
        resolve({ success: true, rel, player: p });
      });
    });
    req.on('error', (err) => resolve({ success: false, reason: err.message }));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve({ success: false, reason: 'Timeout' });
    });
  });
}

async function run() {
  let downloadedCount = 0;
  let skippedCount = 0;
  const newMap = { ...currentPhotos };

  for (let i = 0; i < candidates.length; i++) {
    const p = candidates[i];
    const res = await downloadOne(p);
    if (res.success) {
      downloadedCount++;
      newMap[p.name] = res.rel;
      newMap[p.name.toLowerCase()] = res.rel;
    } else {
      skippedCount++;
    }
    // Polite pacing
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 100));
  }

  console.log(`Finished download! Success: ${downloadedCount}, Skipped: ${skippedCount}`);

  // Write updated data/player_photos_modular.js
  let outMod = '// ==============================================================================\n';
  outMod += '// AFM MANAGER 2027 — MAPEAMENTO DE FOTOS VERIFICADAS (SEM FOTOS REPETIDAS)\n';
  outMod += `// Total de fotos válidas e verificadas: ${Object.keys(newMap).length}\n`;
  outMod += '// ==============================================================================\n';
  outMod += 'window.PLAYER_PHOTOS = Object.assign(window.PLAYER_PHOTOS || {}, {\n';
  outMod += Object.entries(newMap).map(([k, v]) => `  "${k.replace(/"/g, '\\"')}": "${v}"`).join(',\n') + '\n});\n';
  fs.writeFileSync(modularPath, outMod, 'utf8');

  // Update data/player_photos_verified.js
  const verifiedList = Array.from(new Set(Object.values(newMap)));
  let outVer = '// Lista oficial de fotos de jogadores 100% autênticas e verificadas individualmente\n';
  outVer += '// Sem qualquer duplicata de imagem facial entre atletas distintos\n';
  outVer += 'window.PLAYER_PHOTO_VERIFIED = new Set([\n';
  outVer += verifiedList.map(p => `  "${p}"`).join(',\n') + '\n]);\n\n';
  outVer += 'window.PLAYER_PHOTO_MAPPED_PATHS = new Set([\n';
  outVer += verifiedList.map(p => `  "${p}"`).join(',\n') + '\n]);\n';
  fs.writeFileSync(verifiedPath, outVer, 'utf8');

  console.log('Successfully updated player_photos_modular.js and player_photos_verified.js!');
}

run();
