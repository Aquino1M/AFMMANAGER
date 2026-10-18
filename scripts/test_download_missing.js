const fs = require('fs');
const https = require('https');
const path = require('path');

const scrapedData = JSON.parse(fs.readFileSync('scripts/tm_scraped_squads.json', 'utf8'));

const missing = [];
for (const [club, squad] of Object.entries(scrapedData)) {
  for (const p of squad) {
    if (p.tmId && p.imgUrl && !fs.existsSync(`img/players/tm_${p.tmId}.jpg`)) {
      // Ignore placeholder default images
      if (!p.imgUrl.includes('default') && !p.imgUrl.includes('placeholder')) {
        missing.push({ club, name: p.name, tmId: p.tmId, imgUrl: p.imgUrl });
      }
    }
  }
}

console.log(`Found ${missing.length} missing photos with valid imgUrl`);
console.log('Testing 5 downloads...');

function download(item) {
  return new Promise((resolve) => {
    const dest = path.join('img', 'players', `tm_${item.tmId}.jpg`);
    const file = fs.createWriteStream(dest);
    let resolved = false;

    const req = https.get(item.imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          if (!resolved) { resolved = true; resolve(true); }
        });
      } else {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        if (!resolved) { resolved = true; resolve(false); }
      }
    });

    req.setTimeout(5000, () => {
      req.destroy();
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      if (!resolved) { resolved = true; resolve(false); }
    });

    req.on('error', () => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      if (!resolved) { resolved = true; resolve(false); }
    });
  });
}

(async () => {
  for (let i = 0; i < Math.min(5, missing.length); i++) {
    const item = missing[i];
    const ok = await download(item);
    console.log(`[${ok ? 'OK' : 'FAIL'}] ${item.club} - ${item.name} (${item.tmId})`);
  }
})();
