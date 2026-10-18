const https = require('https');
const fs = require('fs');

const SERIE_C_CLUBS = [
  { name: 'Amazonas FC', vereinId: '75775', slug: 'amazonas-fc' },
  { name: 'Figueirense', vereinId: '4064', slug: 'figueirense-fc' },
  { name: 'Ferroviária', vereinId: '19572', slug: 'associacao-ferroviaria-de-esportes-sp-' },
  { name: 'Botafogo-PB', vereinId: '7283', slug: 'botafogo-futebol-clube-pb-' },
  { name: 'Confiança', vereinId: '7300', slug: 'associacao-desportiva-confianca-se-' },
  { name: 'Caxias', vereinId: '4070', slug: 'sociedade-esportiva-e-recreativa-caxias-do-sul-rs-' },
  { name: 'Ypiranga-RS', vereinId: '15486', slug: 'ypiranga-futebol-clube-rs-' },
  { name: 'Maringá', vereinId: '42169', slug: 'maringa-futebol-clube-pr-' },
  { name: 'Anápolis', vereinId: '30129', slug: 'anapolis-futebol-clube-go-' },
  { name: 'Inter de Limeira', vereinId: '6264', slug: 'associacao-atletica-internacional-limeira-' },
  { name: 'Itabaiana', vereinId: '10427', slug: 'associacao-olimpica-de-itabaiana-se-' },
  { name: 'Maranhão', vereinId: '21976', slug: 'maranhao-atletico-clube-ma-' },
  { name: 'Floresta', vereinId: '61845', slug: 'floresta-esporte-clube-ce-' },
  { name: 'Barra-SC', vereinId: '90918', slug: 'barra-futebol-clube-sc-' },
  { name: 'Paysandu', vereinId: '4287', slug: 'paysandu-sc' },
  { name: 'Santa Cruz', vereinId: '1373', slug: 'santa-cruz-futebol-clube-pe-' },
  { name: 'Brusque', vereinId: '10491', slug: 'brusque-futebol-clube-sc-' },
  { name: 'Volta Redonda', vereinId: '4074', slug: 'volta-redonda-futebol-clube-rj-' },
  { name: 'Ituano', vereinId: '4124', slug: 'ituano-futebol-clube-sp-' },
  { name: 'Guarani', vereinId: '1754', slug: 'guarani-futebol-clube-sp-' }
];

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location));
      }
      if (res.statusCode !== 200) return resolve(null);
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', () => resolve(null));
  });
}

function parsePosition(tmPos) {
  const p = (tmPos || '').toLowerCase();
  if (p.includes('guarda') || p.includes('goleiro')) return 'GK';
  if (p.includes('defesa central') || p.includes('zagueiro')) return 'CB';
  if (p.includes('lateral esquerdo')) return 'LB';
  if (p.includes('lateral direito')) return 'RB';
  if (p.includes('médio defensivo') || p.includes('volante')) return 'DM';
  if (p.includes('médio centro')) return 'CM';
  if (p.includes('médio ofensivo') || p.includes('meia')) return 'AM';
  if (p.includes('extremo esquerdo') || p.includes('ponta esquerda')) return 'LW';
  if (p.includes('extremo direito') || p.includes('ponta direita')) return 'RW';
  if (p.includes('ponta de lança') || p.includes('avançado') || p.includes('atacante')) return 'ST';
  return 'CM';
}

function parseMarketValue(str) {
  if (!str) return 0.3;
  const s = str.replace(/\s+/g, ' ').trim();
  const mMatch = s.match(/([\d,\.]+)\s*M/i);
  if (mMatch) return parseFloat(mMatch[1].replace(',', '.'));
  const kMatch = s.match(/([\d,\.]+)\s*mil/i);
  if (kMatch) return parseFloat((parseFloat(kMatch[1].replace(',', '.')) / 1000).toFixed(2));
  return 0.3;
}

function parseSquadHtml(html, clubName) {
  const players = [];
  const rows = html.split(/<tr class="(?:odd|even)">/);
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const numMatch = row.match(/<div class=rn_nummer>(\d+)<\/div>/);
    const num = numMatch ? parseInt(numMatch[1], 10) : undefined;
    const imgMatch = row.match(/data-src="([^"]+)"/) || row.match(/src="([^"]+)"/);
    const nameMatch = row.match(/<a href="\/[^\/]+\/profil\/spieler\/(\d+)">\s*([^<]+)/);
    const posMatch = row.match(/<tr>\s*<td>\s*([^<]+)\s*<\/td>\s*<\/tr>/);
    const ageMatch = row.match(/<\/table>\s*<\/td><td class="zentriert">(\d+)<\/td>/);
    const countryMatch = row.match(/title="([^"]+)" alt="[^"]+" class="flaggenrahmen"/);
    const valMatch = row.match(/class="rechts hauptlink"><a [^>]*>([^<]+)<\/a><\/td>/);

    if (nameMatch) {
      const tmId = nameMatch[1];
      const name = nameMatch[2].trim();
      const pos = parsePosition(posMatch ? posMatch[1].trim() : '');
      const age = ageMatch ? parseInt(ageMatch[1], 10) : 25;
      const country = countryMatch ? countryMatch[1] : 'Brasil';
      const value = parseMarketValue(valMatch ? valMatch[1] : '');
      const base = Math.min(71, Math.max(60, Math.round(62 + value * 8)));
      const rawImg = imgMatch ? imgMatch[1] : '';
      const hasPhoto = rawImg && !rawImg.includes('default.jpg') && !rawImg.includes('data:image');

      const pObj = {
        name,
        club: clubName,
        country,
        pos,
        age,
        fc: base,
        pes: base,
        potential: Math.min(78, base + (age <= 21 ? 6 : 2)),
        value,
        tmId,
        imgUrl: hasPhoto ? rawImg : null
      };
      if (num) pObj.number = num;
      players.push(pObj);
    }
  }
  return players;
}

async function run() {
  console.log('Fetching Série C clubs...');
  const squads = {};
  for (const c of SERIE_C_CLUBS) {
    const url = `https://www.transfermarkt.pt/${c.slug}/kader/verein/${c.vereinId}/saison_id/2025`;
    const html = await fetchHtml(url);
    if (html) {
      const parsed = parseSquadHtml(html, c.name);
      console.log(`  -> ${c.name}: ${parsed.length} players`);
      squads[c.name] = parsed;
    } else {
      console.warn(`  -> ${c.name}: failed to fetch`);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  fs.writeFileSync('scripts/tm_scraped_serie_c.json', JSON.stringify(squads, null, 2), 'utf8');
  console.log('Saved Série C squads to scripts/tm_scraped_serie_c.json!');
}

run();
