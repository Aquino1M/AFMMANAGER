const https = require('https');
const fs = require('fs');
const path = require('path');

const CLUBS_SERIE_A = [
  { name: 'Palmeiras', vereinId: '1023', slug: 'se-palmeiras', tier: 1 },
  { name: 'Flamengo', vereinId: '614', slug: 'cr-flamengo', tier: 1 },
  { name: 'Cruzeiro', vereinId: '609', slug: 'cruzeiro-ec', tier: 1 },
  { name: 'Corinthians', vereinId: '199', slug: 'sc-corinthians', tier: 1 },
  { name: 'Vasco da Gama', vereinId: '978', slug: 'clube-de-regatas-vasco-da-gama', tier: 1 },
  { name: 'Botafogo', vereinId: '537', slug: 'botafogo-fr', tier: 1 },
  { name: 'Bahia', vereinId: '10010', slug: 'ec-bahia', tier: 1 },
  { name: 'Fluminense', vereinId: '2462', slug: 'fluminense-fc', tier: 1 },
  { name: 'Santos', vereinId: '221', slug: 'santos-fc', tier: 1 },
  { name: 'Atlético-MG', vereinId: '330', slug: 'atletico-mineiro', tier: 1 },
  { name: 'Athletico Paranaense', vereinId: '679', slug: 'club-athletico-paranaense', tier: 1 },
  { name: 'Bragantino', vereinId: '8793', slug: 'red-bull-bragantino', tier: 1 },
  { name: 'São Paulo', vereinId: '585', slug: 'sao-paulo-fc', tier: 1 },
  { name: 'Grêmio', vereinId: '210', slug: 'gremio-fbpa', tier: 1 },
  { name: 'Internacional', vereinId: '6600', slug: 'sc-internacional', tier: 1 },
  { name: 'Vitória', vereinId: '2125', slug: 'esporte-clube-vitoria', tier: 1 },
  { name: 'Coritiba', vereinId: '776', slug: 'coritiba-foot-ball-club', tier: 1 },
  { name: 'Mirassol', vereinId: '3876', slug: 'mirassol-futebol-clube-sp-', tier: 1 },
  { name: 'Remo', vereinId: '10997', slug: 'clube-do-remo-pa-', tier: 1 },
  { name: 'Chapecoense', vereinId: '17776', slug: 'associacao-chapecoense-de-futebol', tier: 1 }
];

const CLUBS_SERIE_B = [
  { name: 'Fortaleza', vereinId: '10870', slug: 'fortaleza-ec', tier: 2 },
  { name: 'Sport', vereinId: '8718', slug: 'sc-recife', tier: 2 },
  { name: 'Juventude', vereinId: '10492', slug: 'ec-juventude', tier: 2 },
  { name: 'Ceará', vereinId: '2029', slug: 'ceara-sc', tier: 2 },
  { name: 'Goiás', vereinId: '3197', slug: 'goias-ec', tier: 2 },
  { name: 'Novorizontino', vereinId: '37474', slug: 'gremio-novorizontino', tier: 2 },
  { name: 'Athletic Club', vereinId: '64918', slug: 'athletic-club', tier: 2 },
  { name: 'Criciúma', vereinId: '7178', slug: 'criciuma-ec', tier: 2 },
  { name: 'CRB', vereinId: '11449', slug: 'cr-brasil-al-', tier: 2 },
  { name: 'Vila Nova', vereinId: '5677', slug: 'vila-nova-futebol-clube-go-', tier: 2 },
  { name: 'Atlético-GO', vereinId: '15172', slug: 'atletico-goianiense', tier: 2 },
  { name: 'Cuiabá', vereinId: '28022', slug: 'cuiaba-ec', tier: 2 },
  { name: 'Operário-PR', vereinId: '27214', slug: 'operario-ferroviario-esporte-clube-pr-', tier: 2 },
  { name: 'Avaí', vereinId: '2035', slug: 'avai-fc', tier: 2 },
  { name: 'São Bernardo', vereinId: '16439', slug: 'sao-bernardo-fc', tier: 2 },
  { name: 'Botafogo-SP', vereinId: '9030', slug: 'botafogo-fc', tier: 2 },
  { name: 'Londrina', vereinId: '1693', slug: 'londrina-esporte-clube-pr-', tier: 2 },
  { name: 'América-MG', vereinId: '2863', slug: 'america-mineiro-fc', tier: 2 },
  { name: 'Ponte Preta', vereinId: '1134', slug: 'associacao-atletica-ponte-preta-sp', tier: 2 },
  { name: 'Náutico', vereinId: '2646', slug: 'clube-nautico-capibaribe', tier: 2 }
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
  if (!str) return 0.5;
  const s = str.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const kMatch = s.match(/([\d,\.]+)\s*mil/i);
  if (kMatch) {
    return parseFloat((parseFloat(kMatch[1].replace(',', '.')) / 1000).toFixed(2));
  }
  const mMatch = s.match(/([\d,\.]+)\s*M\b/i) || s.match(/([\d,\.]+)\s*M\s*€/i);
  if (mMatch) {
    return parseFloat(mMatch[1].replace(',', '.'));
  }
  return 0.5;
}

function calcStats(valMi, age, tier) {
  let base = 65;
  if (valMi >= 30) base = 83;
  else if (valMi >= 18) base = 81;
  else if (valMi >= 10) base = 79;
  else if (valMi >= 5) base = 76;
  else if (valMi >= 2.5) base = 74;
  else if (valMi >= 1.0) base = 71;
  else if (valMi >= 0.5) base = 68;
  else base = 65;

  if (tier === 2) base = Math.min(base, 76);
  if (tier === 3) base = Math.min(base, 71);

  let pot = base;
  if (age <= 20) pot = Math.min(93, base + 8);
  else if (age <= 23) pot = Math.min(88, base + 4);
  else if (age <= 27) pot = Math.min(85, base + 2);
  else pot = base;

  return { fc: base, pes: base, potential: pot };
}

function parseSquadHtml(html, clubName, tier) {
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
    const valMatch = row.match(/class="rechts hauptlink"><a [^>]*>([^<]+)<\/a>/);

    if (nameMatch) {
      const tmId = nameMatch[1];
      const name = nameMatch[2].trim();
      const pos = parsePosition(posMatch ? posMatch[1].trim() : '');
      const age = ageMatch ? parseInt(ageMatch[1], 10) : 25;
      const country = countryMatch ? countryMatch[1] : 'Brasil';
      const value = parseMarketValue(valMatch ? valMatch[1] : '');
      const { fc, pes, potential } = calcStats(value, age, tier);

      const rawImg = imgMatch ? imgMatch[1] : '';
      const hasPhoto = rawImg && !rawImg.includes('default.jpg') && !rawImg.includes('data:image');

      const pObj = {
        name,
        club: clubName,
        country,
        pos,
        age,
        fc,
        pes,
        potential,
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
  console.log('Re-syncing Transfermarkt with accurate market value & rating parsing...');
  const allClubs = [...CLUBS_SERIE_A, ...CLUBS_SERIE_B];
  const newPlayersByClub = {};

  for (let i = 0; i < allClubs.length; i++) {
    const c = allClubs[i];
    const url = `https://www.transfermarkt.pt/${c.slug}/kader/verein/${c.vereinId}/saison_id/2025`;
    const html = await fetchHtml(url);
    if (html) {
      const parsed = parseSquadHtml(html, c.name, c.tier);
      newPlayersByClub[c.name] = parsed;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  fs.writeFileSync('scripts/tm_scraped_squads.json', JSON.stringify(newPlayersByClub, null, 2), 'utf8');
  console.log('Successfully re-saved squads with precise values to scripts/tm_scraped_squads.json!');
}

run();
