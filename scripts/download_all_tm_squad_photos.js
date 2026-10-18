const fs = require('fs');
const https = require('https');
const path = require('path');

const squadsA_B = JSON.parse(fs.readFileSync('scripts/tm_scraped_squads.json', 'utf8'));
let squadsC = {};
try {
  squadsC = JSON.parse(fs.readFileSync('scripts/tm_scraped_serie_c.json', 'utf8'));
} catch (e) {}

const missing = [];

function collectMissing(club, list) {
  for (const p of list) {
    if (!p.tmId || !p.imgUrl) continue;
    if (p.imgUrl.includes('default') || p.imgUrl.includes('placeholder')) continue;
    const dest = path.join('img', 'players', `tm_${p.tmId}.jpg`);
    if (!fs.existsSync(dest)) {
      missing.push({ club, name: p.name, tmId: p.tmId, imgUrl: p.imgUrl, dest });
    }
  }
}

for (const [club, squad] of Object.entries(squadsA_B)) {
  collectMissing(club, squad);
}

for (const [club, squad] of Object.entries(squadsC)) {
  collectMissing(club, squad);
}

// Remove duplicates by tmId
const uniqueMissing = [];
const seenTmIds = new Set();
for (const item of missing) {
  if (!seenTmIds.has(item.tmId)) {
    seenTmIds.add(item.tmId);
    uniqueMissing.push(item);
  }
}

console.log(`Unique missing athlete portraits to download: ${uniqueMissing.length}`);

function downloadOne(item, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(item.dest);
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
          if (!resolved) {
            resolved = true;
            if (fs.existsSync(item.dest) && fs.statSync(item.dest).size > 500) {
              resolve(true);
            } else {
              if (fs.existsSync(item.dest)) fs.unlinkSync(item.dest);
              resolve(false);
            }
          }
        });
      } else {
        file.close();
        if (fs.existsSync(item.dest)) fs.unlinkSync(item.dest);
        if (!resolved) { resolved = true; resolve(false); }
      }
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      file.close();
      if (fs.existsSync(item.dest)) fs.unlinkSync(item.dest);
      if (!resolved) { resolved = true; resolve(false); }
    });

    req.on('error', () => {
      file.close();
      if (fs.existsSync(item.dest)) fs.unlinkSync(item.dest);
      if (!resolved) { resolved = true; resolve(false); }
    });
  });
}

// Concurrency pool
async function runPool(items, concurrency = 6) {
  let index = 0;
  let successCount = 0;
  let failCount = 0;

  async function worker() {
    while (index < items.length) {
      const cur = items[index++];
      const ok = await downloadOne(cur);
      if (ok) successCount++;
      else failCount++;

      const done = successCount + failCount;
      if (done % 25 === 0 || done === items.length) {
        console.log(`[Progress ${done}/${items.length}] OK: ${successCount}, Failed: ${failCount} (latest: ${cur.club} - ${cur.name})`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  console.log(`\nDownload finished! Total OK: ${successCount}, Failed: ${failCount}`);
}

(async () => {
  await runPool(uniqueMissing, 6);
})();
