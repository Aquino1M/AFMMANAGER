/**
 * AFM MANAGER 2027 — DOWNLOADER DE ESCUDOS AUTÊNTICOS
 * Arquivo: download_authentic_badges.js
 * 
 * Executa o download direto e seguro dos escudos 100% autênticos
 * salvando na árvore modular img/badges/<liga>/<slug>.png
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BADGES_DATABASE = {
  bra_a: [
    { name: 'Flamengo', slug: 'flamengo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/5981.png' },
    { name: 'Palmeiras', slug: 'palmeiras', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10279.png' },
    { name: 'Corinthians', slug: 'corinthians', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10276.png' },
    { name: 'São Paulo', slug: 'sao_paulo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10281.png' },
    { name: 'Santos', slug: 'santos', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10280.png' },
    { name: 'Vasco', slug: 'vasco', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10282.png' },
    { name: 'Botafogo', slug: 'botafogo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8517.png' },
    { name: 'Fluminense', slug: 'fluminense', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9863.png' },
    { name: 'Grêmio', slug: 'gremio', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9769.png' },
    { name: 'Internacional', slug: 'internacional', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8630.png' },
    { name: 'Atlético-MG', slug: 'atletico_mg', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10272.png' },
    { name: 'Cruzeiro', slug: 'cruzeiro', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9771.png' },
    { name: 'Bahia', slug: 'bahia', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7875.png' },
    { name: 'Vitória', slug: 'vitoria', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7877.png' },
    { name: 'Athletico-PR', slug: 'athletico_pr', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7870.png' },
    { name: 'Coritiba', slug: 'coritiba', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7874.png' },
    { name: 'Bragantino', slug: 'bragantino', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10270.png' },
    { name: 'Mirassol', slug: 'mirassol', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/164741.png' },
    { name: 'Remo', slug: 'remo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10284.png' },
    { name: 'Chapecoense', slug: 'chapecoense', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/492721.png' }
  ],
  bra_b: [
    { name: 'Sport Recife', slug: 'sport', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10274.png' },
    { name: 'América-MG', slug: 'america_mg', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9773.png' },
    { name: 'São Bernardo', slug: 'sao_bernardo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/346853.png' },
    { name: 'Athletic Club', slug: 'athletic_club', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/1173955.png' },
    { name: 'Atlético-GO', slug: 'atletico_go', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7872.png' },
    { name: 'Avaí', slug: 'avai', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7868.png' },
    { name: 'Botafogo-SP', slug: 'botafogo_sp', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10271.png' },
    { name: 'Ceará', slug: 'ceara', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10273.png' },
    { name: 'CRB', slug: 'crb', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10275.png' },
    { name: 'Criciúma', slug: 'criciuma', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7869.png' },
    { name: 'Cuiabá', slug: 'cuiaba', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/323382.png' },
    { name: 'Fortaleza', slug: 'fortaleza', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7901.png' },
    { name: 'Goiás', slug: 'goias', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7871.png' },
    { name: 'Juventude', slug: 'juventude', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7873.png' },
    { name: 'Londrina', slug: 'londrina', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10277.png' },
    { name: 'Náutico', slug: 'nautico', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10278.png' },
    { name: 'Novorizontino', slug: 'novorizontino', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/654877.png' },
    { name: 'Operário-PR', slug: 'operario_pr', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/492723.png' },
    { name: 'Ponte Preta', slug: 'ponte_preta', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7876.png' },
    { name: 'Vila Nova', slug: 'vila_nova', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10283.png' }
  ],
  bra_d: [
    { name: 'Pantanal', slug: 'pantanal_official', url: 'https://api.sofascore.app/api/v1/team/462419/image' },
    { name: 'Brasiliense', slug: 'brasiliense', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7867.png' },
    { name: 'Gama', slug: 'gama', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10285.png' },
    { name: 'Capital-DF', slug: 'capital_df', url: 'https://api.sofascore.app/api/v1/team/323381/image' },
    { name: 'Ceilândia', slug: 'ceilandia', url: 'https://api.sofascore.app/api/v1/team/7866/image' }
  ],
  arg_1: [
    { name: 'Boca Juniors', slug: 'boca_juniors', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10077.png' },
    { name: 'River Plate', slug: 'river_plate', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10080.png' },
    { name: 'Racing Club', slug: 'racing_club', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10079.png' },
    { name: 'Independiente', slug: 'independiente', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10078.png' },
    { name: 'San Lorenzo', slug: 'san_lorenzo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10081.png' },
    { name: 'Vélez Sarsfield', slug: 'velez_sarsfield', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10082.png' }
  ]
};

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/png,image/*;q=0.8'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Status HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 1024) {
          return reject(new Error(`Arquivo muito pequeno (${buf.length} bytes), provável erro`));
        }
        fs.writeFileSync(dest, buf);
        resolve(buf.length);
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function run() {
  const args = process.argv.slice(2);
  const filterLeague = (args[0] || '').replace('--league=', '').trim().toLowerCase();

  const leagues = filterLeague ? [filterLeague] : Object.keys(BADGES_DATABASE);

  for (const lk of leagues) {
    const list = BADGES_DATABASE[lk];
    if (!list) {
      console.log(`Liga '${lk}' não encontrada.`);
      continue;
    }
    const dir = path.join(__dirname, 'img', 'badges', lk);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    console.log(`\nBaixando escudos para: [${lk.toUpperCase()}]`);
    for (const item of list) {
      const target = path.join(dir, `${item.slug}.png`);
      process.stdout.write(`  Baixando ${item.name} (${item.slug}.png)... `);
      try {
        const size = await downloadImage(item.url, target);
        console.log(`OK (${(size / 1024).toFixed(1)} KB)`);
      } catch (e) {
        console.log(`FALHA: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

run();
