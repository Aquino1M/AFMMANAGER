const https = require('https');
const fs = require('fs');
const path = require('path');

const mlsClubs = [
  { name: 'LA Galaxy', url: 'https://www.transfermarkt.pt/los-angeles-galaxy/kader/verein/1061/saison_id/2024/plus/1' },
  { name: 'Los Angeles FC', url: 'https://www.transfermarkt.pt/los-angeles-fc/kader/verein/51828/saison_id/2024/plus/1' }
];

function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', () => resolve(''));
  });
}

function parseSquad(html, clubName) {
  const players = [];
  const rows = html.split(/<tr class="(?:odd|even)">/);
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split('</tr>')[0];

    // Portrait image & TM ID
    const imgMatch = row.match(/<img[^>]+src="([^">]+portrait[^">]+)"[^>]*>/i);
    let imgUrl = imgMatch ? imgMatch[1].replace(/&amp;/g, '&') : null;
    let tmId = null;
    if (imgUrl) {
      const tmIdMatch = imgUrl.match(/portrait\/(?:medium|header|small|big)\/(\d+)/i);
      if (tmIdMatch) tmId = tmIdMatch[1];
    }

    // Player name & link
    const linkMatch = row.match(/<a[^>]+href="\/[^\/]+\/profil\/spieler\/(\d+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    if (!tmId) tmId = linkMatch[1];
    let name = linkMatch[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!name) continue;

    // Number
    const numMatch = row.match(/<div class="rn_nummer">(\d+)<\/div>/);
    const number = numMatch ? parseInt(numMatch[1], 10) : undefined;

    // Position
    let pos = 'CM';
    if (/Guarda-redes|Goleiro/i.test(row)) pos = 'GK';
    else if (/Defesa Central|Zagueiro/i.test(row)) pos = 'CB';
    else if (/Lateral Esq/i.test(row)) pos = 'LB';
    else if (/Lateral Dir/i.test(row)) pos = 'RB';
    else if (/Trinco|Volante/i.test(row)) pos = 'DM';
    else if (/Médio Centro|Meia Central/i.test(row)) pos = 'CM';
    else if (/Médio Ofensivo|Meia Ofensivo/i.test(row)) pos = 'AM';
    else if (/Extremo Esq|Ponta Esq/i.test(row)) pos = 'LW';
    else if (/Extremo Dir|Ponta Dir/i.test(row)) pos = 'RW';
    else if (/Ponta de Lança|Centroavante/i.test(row)) pos = 'ST';

    // Age
    const ageMatch = row.match(/<td class="zentriert">(\d{2})<\/td>/);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : 25;

    // Rating estimate based on TM market value / prominence
    let fc = 73;
    if (/Giroud|Lloris|Reus|Puig/i.test(name)) fc = 81;
    else if (/Bouanga|Hernández|Pec/i.test(name)) fc = 79;
    else if (/Olivera|Paintsil|Atuesta/i.test(name)) fc = 76;

    players.push({
      name,
      club: clubName,
      country: 'Estados Unidos',
      pos,
      age,
      fc,
      pes: fc,
      potential: Math.min(90, fc + Math.max(0, 28 - age)),
      value: fc >= 80 ? 8 : (fc >= 75 ? 3 : 1),
      number,
      tmId,
      imgUrl
    });
  }
  return players;
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return resolve(true);
    const file = fs.createWriteStream(dest);
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      } else {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        resolve(false);
      }
    });
    req.setTimeout(6000, () => {
      req.destroy();
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(false);
    });
    req.on('error', () => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(false);
    });
  });
}

(async () => {
  const allMls = {};
  for (const c of mlsClubs) {
    console.log(`Scraping ${c.name}...`);
    const html = await fetchPage(c.url);
    const squad = parseSquad(html, c.name);
    console.log(`Parsed ${squad.length} players for ${c.name}`);
    for (const p of squad) {
      if (p.imgUrl && p.tmId && !p.imgUrl.includes('default') && !p.imgUrl.includes('placeholder')) {
        const dest = path.join('img', 'players', `tm_${p.tmId}.jpg`);
        const ok = await downloadImage(p.imgUrl, dest);
        if (ok) p.photo = `img/players/tm_${p.tmId}.jpg`;
      }
    }
    allMls[c.name] = squad;
  }
  fs.writeFileSync('scripts/mls_scraped_squads.json', JSON.stringify(allMls, null, 2), 'utf8');
  console.log('Saved scripts/mls_scraped_squads.json');
})();
