const https = require('https');
const fs = require('fs');
const path = require('path');

const worldStars = [
  { name: 'Erling Haaland', club: 'Manchester City', tmId: '418560', query: 'Erling Haaland' },
  { name: 'Kylian Mbappé', club: 'Real Madrid', tmId: '342229', query: 'Kylian Mbappe' },
  { name: 'Vinicius Jr', club: 'Real Madrid', tmId: '371998', query: 'Vinicius Junior' },
  { name: 'Jude Bellingham', club: 'Real Madrid', tmId: '581678', query: 'Jude Bellingham' },
  { name: 'Rodri', club: 'Manchester City', tmId: '357565', query: 'Rodri' },
  { name: 'Kevin De Bruyne', club: 'Manchester City', tmId: '88755', query: 'Kevin De Bruyne' },
  { name: 'Phil Foden', club: 'Manchester City', tmId: '409036', query: 'Phil Foden' },
  { name: 'Harry Kane', club: 'Bayern München', tmId: '132098', query: 'Harry Kane' },
  { name: 'Jamal Musiala', club: 'Bayern München', tmId: '580195', query: 'Jamal Musiala' },
  { name: 'Joshua Kimmich', club: 'Bayern München', tmId: '161056', query: 'Joshua Kimmich' },
  { name: 'Manuel Neuer', club: 'Bayern München', tmId: '17259', query: 'Manuel Neuer' },
  { name: 'Robert Lewandowski', club: 'FC Barcelona', tmId: '38253', query: 'Robert Lewandowski' },
  { name: 'Lamine Yamal', club: 'FC Barcelona', tmId: '937958', query: 'Lamine Yamal' },
  { name: 'Raphinha', club: 'FC Barcelona', tmId: '411295', query: 'Raphinha' },
  { name: 'Pedri', club: 'FC Barcelona', tmId: '683840', query: 'Pedri' },
  { name: 'Rodrygo', club: 'Real Madrid', tmId: '412363', query: 'Rodrygo' },
  { name: 'Federico Valverde', club: 'Real Madrid', tmId: '369081', query: 'Federico Valverde' },
  { name: 'Eduardo Camavinga', club: 'Real Madrid', tmId: '640428', query: 'Eduardo Camavinga' },
  { name: 'Thibaut Courtois', club: 'Real Madrid', tmId: '108390', query: 'Thibaut Courtois' },
  { name: 'Cole Palmer', club: 'Chelsea', tmId: '568177', query: 'Cole Palmer' },
  { name: 'Mohamed Salah', club: 'Liverpool', tmId: '148455', query: 'Mohamed Salah' },
  { name: 'Virgil van Dijk', club: 'Liverpool', tmId: '139208', query: 'Virgil van Dijk' },
  { name: 'Alisson', club: 'Liverpool', tmId: '105470', query: 'Alisson' },
  { name: 'Ederson', club: 'Manchester City', tmId: '238223', query: 'Ederson' },
  { name: 'Bukayo Saka', club: 'Arsenal', tmId: '433177', query: 'Bukayo Saka' },
  { name: 'Martin Ødegaard', club: 'Arsenal', tmId: '316264', query: 'Martin Odegaard' },
  { name: 'William Saliba', club: 'Arsenal', tmId: '495666', query: 'William Saliba' },
  { name: 'Florian Wirtz', club: 'Bayer Leverkusen', tmId: '598577', query: 'Florian Wirtz' },
  { name: 'Lautaro Martínez', club: 'Inter', tmId: '406625', query: 'Lautaro Martinez' },
  { name: 'Cristiano Ronaldo', club: 'Al-Nassr', tmId: '8198', query: 'Cristiano Ronaldo' }
];

function fetchHtml(url) {
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

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
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

async function fetchStarImage(star) {
  const dest = path.join('img', 'players', `tm_${star.tmId}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 3000) {
    star.photo = `img/players/tm_${star.tmId}.jpg`;
    return true;
  }

  // Search TM
  const searchUrl = `https://www.transfermarkt.pt/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(star.query)}`;
  const searchHtml = await fetchHtml(searchUrl);

  // Look for portrait image with tmId
  const regex = new RegExp(`https:\\/\\/img\\.a\\.transfermarkt\\.technology\\/portrait\\/[^\\s"'>]+${star.tmId}[^\\s"'>]+`, 'i');
  let match = searchHtml.match(regex);

  // Fallback: check profile page directly if search didn't show full img
  if (!match) {
    const profMatch = searchHtml.match(new RegExp(`href="(\\/[^"\\/]+\\/profil\\/spieler\\/${star.tmId})"`, 'i'));
    if (profMatch) {
      const profHtml = await fetchHtml(`https://www.transfermarkt.pt${profMatch[1]}`);
      match = profHtml.match(regex) || profHtml.match(/https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^\s"'>]+header[^\s"'>]+/i) || profHtml.match(/https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^\s"'>]+medium[^\s"'>]+/i);
    }
  }

  if (match) {
    let imgUrl = match[0].replace(/&amp;/g, '&');
    // Upgrade small to header for crisp high quality
    const headerUrl = imgUrl.replace(/\/portrait\/small\//, '/portrait/header/');
    let ok = await downloadImage(headerUrl, dest);
    if (!ok) {
      // fallback to original match
      ok = await downloadImage(imgUrl, dest);
    }
    if (ok) {
      star.photo = `img/players/tm_${star.tmId}.jpg`;
      return true;
    }
  }
  return false;
}

(async () => {
  console.log('Downloading World Stars portraits...');
  for (const s of worldStars) {
    const ok = await fetchStarImage(s);
    console.log(`[${ok ? 'OK' : 'FAIL'}] ${s.club} - ${s.name} (${s.tmId}) -> ${s.photo || 'missing'}`);
  }
  fs.writeFileSync('scripts/world_stars.json', JSON.stringify(worldStars, null, 2), 'utf8');
  console.log('Saved scripts/world_stars.json');
})();
