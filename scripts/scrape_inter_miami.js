const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function parseValMi(valStr) {
  if (!valStr) return 1.0;
  const clean = valStr.trim();
  const milMatch = clean.match(/([\d,.]+)\s*mil\s*€/i);
  if (milMatch) {
    const n = parseFloat(milMatch[1].replace(',', '.'));
    return Math.max(0.05, Math.round((n / 1000) * 100) / 100);
  }
  const mMatch = clean.match(/([\d,.]+)\s*M\s*€/i);
  if (mMatch) {
    const n = parseFloat(mMatch[1].replace(',', '.'));
    return Math.max(0.1, Math.round(n * 100) / 100);
  }
  return 1.0;
}

function posMap(pStr) {
  if (!pStr) return 'CM';
  const s = pStr.toLowerCase();
  if (s.includes('guarda-redes') || s.includes('goleiro')) return 'GK';
  if (s.includes('defesa central') || s.includes('zagueiro')) return 'CB';
  if (s.includes('lateral esquerdo')) return 'LB';
  if (s.includes('lateral direito')) return 'RB';
  if (s.includes('trinco') || s.includes('volante') || s.includes('defensivo')) return 'DM';
  if (s.includes('médio centro') || s.includes('meio-campo')) return 'CM';
  if (s.includes('médio ofensivo') || s.includes('meia ofensivo')) return 'AM';
  if (s.includes('extremo esquerdo') || s.includes('ponta esquerda')) return 'LW';
  if (s.includes('extremo direito') || s.includes('ponta direita')) return 'RW';
  if (s.includes('ponta de lança') || s.includes('centroavante') || s.includes('avançado')) return 'ST';
  return 'CM';
}

function calcOvr(valueMi, age, pos) {
  let base = 68;
  if (valueMi >= 20) base = 85;
  else if (valueMi >= 10) base = 80;
  else if (valueMi >= 5) base = 77;
  else if (valueMi >= 3) base = 75;
  else if (valueMi >= 1.5) base = 73;
  else if (valueMi >= 0.8) base = 71;
  else base = 68;

  let ovr = base;
  let pot = (age <= 21) ? Math.min(90, ovr + 7) : (age <= 25 ? Math.min(86, ovr + 4) : ovr);
  return { fc: ovr, pes: ovr, potential: pot };
}

(async () => {
  console.log('Fetching Inter Miami 2024 squad from Transfermarkt...');
  const html = await fetchHtml('https://www.transfermarkt.pt/inter-miami-cf/kader/verein/69261/saison_id/2024/plus/1');
  const rows = html.split(/<tr class="(?:odd|even)">/);

  const players = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const linkMatch = r.match(/<a href="\/[^\/]+\/profil\/spieler\/(\d+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!linkMatch) continue;
    const tmId = linkMatch[1];
    let name = linkMatch[2].replace(/<[^>]+>/g, '').trim();

    // extract image from data-src or src
    let imgUrl = null;
    const dataSrcMatch = r.match(/data-src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^\"]+)"/);
    const srcMatch = r.match(/src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^\"]+)"/);
    if (dataSrcMatch && !dataSrcMatch[1].includes('default.jpg')) {
      imgUrl = dataSrcMatch[1].replace('/small/', '/medium/').replace('/big/', '/medium/');
    } else if (srcMatch && !srcMatch[1].includes('default.jpg') && !srcMatch[1].includes('data:image')) {
      imgUrl = srcMatch[1].replace('/small/', '/medium/').replace('/big/', '/medium/');
    }

    const numMatch = r.match(/<div class="rn_nummer">(\d+)<\/div>/);
    const num = numMatch ? parseInt(numMatch[1]) : null;

    const ageMatch = r.match(/<td class="zentriert">\s*(\d{2})\s*<\/td>/);
    const age = ageMatch ? parseInt(ageMatch[1]) : 25;

    const natMatch = r.match(/title="([A-ZÀ-Úa-zà-ú\s]+)" class="flaggenrahmen"/);
    const country = natMatch ? natMatch[1].trim() : 'Estados Unidos';

    const posMatch = r.match(/<tr>\s*<td>([^<]+)<\/td>\s*<\/tr>/);
    const pos = posMap(posMatch ? posMatch[1].trim() : '');

    const valMatch = r.match(/<td class="rechts hauptlink">[\s\S]*?(?:<a[^>]*>)?([\d,.]+\s*(?:mil|M)?\s*€)/);
    const valMi = valMatch ? parseValMi(valMatch[1]) : 1.0;

    let { fc, pes, potential } = calcOvr(valMi, age, pos);

    // Star player manual adjustments
    if (name.includes('Messi')) { fc = 88; pes = 88; potential = 88; }
    if (name.includes('Suárez') || name.includes('Suarez')) { fc = 82; pes = 82; potential = 82; }
    if (name.includes('Busquets')) { fc = 81; pes = 81; potential = 81; }
    if (name.includes('Alba')) { fc = 80; pes = 80; potential = 80; }

    players.push({
      name,
      club: 'Inter Miami',
      country,
      pos,
      age,
      fc,
      pes,
      potential,
      value: valMi,
      number: num,
      tmId,
      imgUrl
    });
  }

  console.log(`Parsed ${players.length} players for Inter Miami:`);
  players.forEach(p => console.log(`#${p.number || '-'} ${p.name} (${p.pos}, ${p.age}a) OVR ${p.fc} €${p.value}M -> Img: ${p.imgUrl ? p.imgUrl.substring(0, 60) + '...' : 'NO'}`));

  fs.writeFileSync('scripts/inter_miami_squad.json', JSON.stringify(players, null, 2), 'utf8');
})();
