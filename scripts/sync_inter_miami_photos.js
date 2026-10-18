const https = require('https');
const fs = require('fs');
const path = require('path');

const squad = JSON.parse(fs.readFileSync('scripts/inter_miami_squad.json', 'utf8'));

// Clean &nbsp; from names
squad.forEach(p => {
  p.name = p.name.replace(/&nbsp;/g, '').trim();
});

async function downloadFileWithTimeout(url, dest, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve(true);
    }
    const file = fs.createWriteStream(dest);
    let resolved = false;

    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
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

    req.setTimeout(timeoutMs, () => {
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
  console.log('--- Baixando fotos autênticas do Inter Miami ---');
  let okCount = 0;
  for (const p of squad) {
    if (!p.imgUrl || !p.tmId) continue;
    const filename = `tm_${p.tmId}.jpg`;
    const dest = path.join(__dirname, '..', 'img', 'players', filename);
    const ok = await downloadFileWithTimeout(p.imgUrl, dest);
    if (ok) {
      okCount++;
      p.photo = `img/players/${filename}`;
      console.log(`[OK] ${p.name} (#${p.number || '-'}) -> ${filename}`);
    } else {
      console.log(`[FAIL] ${p.name}`);
    }
  }
  console.log(`\nTotal fotos baixadas para o Inter Miami: ${okCount}`);

  // Save updated squad with photo properties
  fs.writeFileSync('scripts/inter_miami_squad.json', JSON.stringify(squad, null, 2), 'utf8');
})();
