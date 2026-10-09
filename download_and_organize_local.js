/**
 * AFM MANAGER 2027 — DOWNLOADER & ORGANIZADOR OFICIAL DE ASSETS LOCAIS (OFFLINE-FIRST)
 * Arquivo: download_and_organize_local.js
 * 
 * Executa o download de escudos oficiais (FootyLogos) e fotos de jogadores (Transfermarkt),
 * salva os arquivos físicos nas pastas img/badges e img/players, e gera automaticamente
 * os módulos JS de mapeamento com caminhos relativos locais.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ==============================================================================
// 1. ESTRUTURA FÍSICA DE PASTAS DO PROJETO
// ==============================================================================
const BASE_DIRS = [
  'img/badges/bra_a',
  'img/badges/bra_b',
  'img/badges/bra_c',
  'img/badges/bra_d',
  'img/badges/bra_estaduais',
  'img/badges/arg_1',
  'img/badges/europe',
  'img/badges/asia',
  'img/competitions',
  'img/players/bra_a/corinthians',
  'img/players/bra_a/flamengo',
  'img/players/bra_a/palmeiras',
  'img/players/bra_a/sao_paulo',
  'img/players/bra_a/vasco',
  'img/players/bra_b/sport',
  'img/players/bra_b/america_mg',
  'img/players/bra_b/vila_nova',
  'img/players/bra_b/ceara',
  'img/players/bra_b/goias',
  'data/badges'
];

function ensureDirectories() {
  console.log('📁 Criando e validando diretórios locais...');
  for (const dir of BASE_DIRS) {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
  console.log('✅ Todos os diretórios locais estão prontos.\n');
}

// ==============================================================================
// 2. CATÁLOGO OFICIAL DE ESCUDOS (FOOTYLOGOS CDN DIRETA)
// ==============================================================================
const BADGES_CATALOG = {
  bra_a: [
    { name: 'Flamengo', slug: 'flamengo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/5981.png' },
    { name: 'Palmeiras', slug: 'palmeiras', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10279.png' },
    { name: 'Corinthians', slug: 'corinthians', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10276.png' },
    { name: 'São Paulo', slug: 'sao_paulo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10281.png' },
    { name: 'Santos', slug: 'santos', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10280.png' },
    { name: 'Vasco', slug: 'vasco', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10282.png' },
    { name: 'Grêmio', slug: 'gremio', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9769.png' },
    { name: 'Internacional', slug: 'internacional', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8630.png' },
    { name: 'Atlético-MG', slug: 'atletico_mg', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10272.png' },
    { name: 'Cruzeiro', slug: 'cruzeiro', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9771.png' },
    { name: 'Bahia', slug: 'bahia', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7875.png' },
    { name: 'Botafogo', slug: 'botafogo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8517.png' },
    { name: 'Fluminense', slug: 'fluminense', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9863.png' }
  ],
  bra_b: [
    { name: 'Sport', slug: 'sport', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10274.png' },
    { name: 'Sport Recife', slug: 'sport', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10274.png' },
    { name: 'América-MG', slug: 'america_mg', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9773.png' },
    { name: 'São Bernardo', slug: 'sao_bernardo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/346853.png' },
    { name: 'Ceará', slug: 'ceara', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10273.png' },
    { name: 'Goiás', slug: 'goias', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7871.png' },
    { name: 'Vila Nova', slug: 'vila_nova', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10283.png' },
    { name: 'Avaí', slug: 'avai', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7868.png' },
    { name: 'CRB', slug: 'crb', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10275.png' },
    { name: 'Criciúma', slug: 'criciuma', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7869.png' },
    { name: 'Cuiabá', slug: 'cuiaba', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/323382.png' },
    { name: 'Fortaleza', slug: 'fortaleza', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7901.png' },
    { name: 'Juventude', slug: 'juventude', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7873.png' },
    { name: 'Novorizontino', slug: 'novorizontino', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/654877.png' },
    { name: 'Operário-PR', slug: 'operario_pr', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/492723.png' },
    { name: 'Ponte Preta', slug: 'ponte_preta', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7876.png' }
  ],
  bra_d: [
    { name: 'Pantanal', slug: 'pantanal', url: 'https://api.sofascore.app/api/v1/team/462419/image' },
    { name: 'Brasiliense', slug: 'brasiliense', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7867.png' },
    { name: 'Gama', slug: 'gama', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10285.png' },
    { name: 'Santa Cruz', slug: 'santa_cruz', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7878.png' }
  ]
};

// ==============================================================================
// 3. FOTOS DE JOGADORES LOCAIS (TRANSFERMARKT REPOST)
// ==============================================================================
const PLAYERS_CATALOG = [
  { name: 'Memphis Depay', club: 'corinthians', league: 'bra_a', slug: 'memphis_depay', url: 'https://img.a.transfermarkt.technology/portrait/header/167082-1718107567.jpg' },
  { name: 'Hugo Souza', club: 'corinthians', league: 'bra_a', slug: 'hugo_souza', url: 'https://img.a.transfermarkt.technology/portrait/header/608272-1678199732.jpg' },
  { name: 'Rodrigo Garro', club: 'corinthians', league: 'bra_a', slug: 'rodrigo_garro', url: 'https://img.a.transfermarkt.technology/portrait/header/608151-1706622839.jpg' },
  { name: 'Yuri Alberto', club: 'corinthians', league: 'bra_a', slug: 'yuri_alberto', url: 'https://img.a.transfermarkt.technology/portrait/header/495861-1678199651.jpg' },
  { name: 'Pedro', club: 'flamengo', league: 'bra_a', slug: 'pedro', url: 'https://img.a.transfermarkt.technology/portrait/header/432363-1678199343.jpg' },
  { name: 'Arrascaeta', club: 'flamengo', league: 'bra_a', slug: 'arrascaeta', url: 'https://img.a.transfermarkt.technology/portrait/header/228181-1678199368.jpg' },
  { name: 'Agustín Rossi', club: 'flamengo', league: 'bra_a', slug: 'rossi', url: 'https://img.a.transfermarkt.technology/portrait/header/352324-1678199317.jpg' },
  { name: 'Lucas Lima', club: 'sport', league: 'bra_b', slug: 'lucas_lima', url: 'https://img.a.transfermarkt.technology/portrait/header/232850-1678199201.jpg' },
  { name: 'Caíque França', club: 'sport', league: 'bra_b', slug: 'caique_franca', url: 'https://img.a.transfermarkt.technology/portrait/header/341712-1678199220.jpg' }
];

// ==============================================================================
// 4. FUNÇÃO ROBUSTA DE DOWNLOAD
// ==============================================================================
function downloadFile(fileUrl, destPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error('Muitos redirecionamentos'));

    const client = fileUrl.startsWith('https') ? https : http;
    const req = client.get(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(fileUrl);
          redirectUrl = `${u.origin}${redirectUrl}`;
        }
        return downloadFile(redirectUrl, destPath, maxRedirects - 1).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP Status ${res.statusCode}`));
      }

      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 1000) {
          return reject(new Error(`Tamanho insuficiente (${buffer.length} bytes)`));
        }
        fs.writeFileSync(destPath, buffer);
        resolve(buffer.length);
      });
    });

    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ==============================================================================
// 5. SCANNER E DOWNLOAD DE ASSETS
// ==============================================================================
async function syncBadges() {
  console.log('============================================================');
  console.log('🛡️ SINCRONIZANDO ESCUDOS LOCAIS (img/badges/)...');
  console.log('============================================================');

  for (const [league, clubs] of Object.entries(BADGES_CATALOG)) {
    const dir = path.join(__dirname, 'img', 'badges', league);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const c of clubs) {
      const dest = path.join(dir, `${c.slug}.png`);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
        console.log(`  [OK LOCAL] ${c.name.padEnd(20)} (${league}/${c.slug}.png)`);
        continue;
      }
      process.stdout.write(`  [BAIXANDO] ${c.name.padEnd(20)} ... `);
      try {
        const size = await downloadFile(c.url, dest);
        console.log(`✅ OK (${(size / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.log(`❌ FALHA: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

async function syncPlayers() {
  console.log('\n============================================================');
  console.log('👤 SINCRONIZANDO FOTOS LOCAIS DE JOGADORES (img/players/)...');
  console.log('============================================================');

  for (const p of PLAYERS_CATALOG) {
    const dir = path.join(__dirname, 'img', 'players', p.league, p.club);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const dest = path.join(dir, `${p.slug}.png`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      console.log(`  [OK LOCAL] ${p.name.padEnd(20)} (${p.league}/${p.club}/${p.slug}.png)`);
      continue;
    }
    process.stdout.write(`  [BAIXANDO] ${p.name.padEnd(20)} ... `);
    try {
      const size = await downloadFile(p.url, dest);
      console.log(`✅ OK (${(size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.log(`❌ FALHA: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 250));
  }
}

// ==============================================================================
// 6. GERAÇÃO DOS ARQUIVOS JS DE MAPEAMENTO 100% OFFLINE
// ==============================================================================
function generateOfflineMappingFiles() {
  console.log('\n============================================================');
  console.log('📝 GERANDO ARQUIVOS DE MAPEAMENTO JS (CAMINHOS RELATIVOS LOCAIS)...');
  console.log('============================================================');

  // 1. data/badges/badges_bra_b.js
  const badgesBraBContent = `// ==============================================================================
// AFM MANAGER 2027 — ESCUDOS LOCAIS OFFLINE: SÉRIE B
// ==============================================================================
window.CLUB_BADGES = Object.assign(window.CLUB_BADGES || {}, {
  "Sport": "bra_b/sport.png",
  "Sport Recife": "bra_b/sport.png",
  "América-MG": "bra_b/america_mg.png",
  "América Mineiro": "bra_b/america_mg.png",
  "São Bernardo": "bra_b/sao_bernardo.png",
  "Ceará": "bra_b/ceara.png",
  "Goiás": "bra_b/goias.png",
  "Vila Nova": "bra_b/vila_nova.png",
  "Avaí": "bra_b/avai.png",
  "CRB": "bra_b/crb.png",
  "Criciúma": "bra_b/criciuma.png",
  "Cuiabá": "bra_b/cuiaba.png",
  "Fortaleza": "bra_b/fortaleza.png",
  "Juventude": "bra_b/juventude.png",
  "Novorizontino": "bra_b/novorizontino.png",
  "Operário-PR": "bra_b/operario_pr.png",
  "Ponte Preta": "bra_b/ponte_preta.png"
});
`;
  fs.writeFileSync(path.join(__dirname, 'data', 'badges', 'badges_bra_b.js'), badgesBraBContent);
  console.log('  ✅ data/badges/badges_bra_b.js gerado.');

  // 2. js/core/player_photos.js (ou data/player_photos.js)
  const playerPhotosContent = `// ==============================================================================
// AFM MANAGER 2027 — FOTOS LOCAIS OFFLINE DE JOGADORES
// ==============================================================================
window.PLAYER_PHOTOS = Object.assign(window.PLAYER_PHOTOS || {}, {
  "Memphis Depay": "img/players/bra_a/corinthians/memphis_depay.png",
  "memphis_depay": "img/players/bra_a/corinthians/memphis_depay.png",
  "Hugo Souza": "img/players/bra_a/corinthians/hugo_souza.png",
  "hugo_souza": "img/players/bra_a/corinthians/hugo_souza.png",
  "Rodrigo Garro": "img/players/bra_a/corinthians/rodrigo_garro.png",
  "rodrigo_garro": "img/players/bra_a/corinthians/rodrigo_garro.png",
  "Yuri Alberto": "img/players/bra_a/corinthians/yuri_alberto.png",
  "yuri_alberto": "img/players/bra_a/corinthians/yuri_alberto.png",
  "Pedro": "img/players/bra_a/flamengo/pedro.png",
  "pedro": "img/players/bra_a/flamengo/pedro.png",
  "Arrascaeta": "img/players/bra_a/flamengo/arrascaeta.png",
  "arrascaeta": "img/players/bra_a/flamengo/arrascaeta.png",
  "Agustín Rossi": "img/players/bra_a/flamengo/rossi.png",
  "rossi": "img/players/bra_a/flamengo/rossi.png",
  "Lucas Lima": "img/players/bra_b/sport/lucas_lima.png",
  "lucas_lima": "img/players/bra_b/sport/lucas_lima.png",
  "Caíque França": "img/players/bra_b/sport/caique_franca.png",
  "caique_franca": "img/players/bra_b/sport/caique_franca.png"
});
`;
  const coreDir = path.join(__dirname, 'js', 'core');
  if (!fs.existsSync(coreDir)) fs.mkdirSync(coreDir, { recursive: true });
  fs.writeFileSync(path.join(coreDir, 'player_photos.js'), playerPhotosContent);
  fs.writeFileSync(path.join(__dirname, 'data', 'player_photos.js'), playerPhotosContent);
  console.log('  ✅ js/core/player_photos.js e data/player_photos.js gerados.');
  console.log('============================================================\n');
}

async function run() {
  ensureDirectories();
  await syncBadges();
  await syncPlayers();
  generateOfflineMappingFiles();
  console.log('🎉 SINCRONIZAÇÃO COMPLETA: O AFM Manager está 100% pronto para rodar offline!');
}

run();
