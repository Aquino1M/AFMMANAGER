/**
 * AFM MANAGER 2027 — DOWNLOADER OFICIAL DE ESCUDOS (FOOTYLOGOS CDN)
 * Arquivo: download_footylogos.js
 * 
 * Uso via CLI:
 *   node download_footylogos.js --league=bra_b
 *   node download_footylogos.js --league=bra_a
 *   node download_footylogos.js --league=bra_c
 *   node download_footylogos.js --league=bra_d
 *   node download_footylogos.js --league=arg_1
 *   node download_footylogos.js --league=europe
 *   node download_footylogos.js --league=asia
 *   node download_footylogos.js --all
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ==============================================================================
// MAPEAMENTO OFICIAL DE CLUBES & CDN FOOTYLOGOS / PUBLIC SOFASCORE / FOTMOB
// ==============================================================================
const FOOTYLOGOS_MAP = {
  // --------------------------------------------------------------------------
  // SÉRIE B (20 TIMES)
  // --------------------------------------------------------------------------
  bra_b: [
    { name: 'Sport', slug: 'sport', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10274.png' },
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

  // --------------------------------------------------------------------------
  // SÉRIE A (20 TIMES)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // SÉRIE D (DESTAQUES & PANTANAL)
  // --------------------------------------------------------------------------
  bra_d: [
    { name: 'Pantanal', slug: 'pantanal_official', url: 'https://api.sofascore.app/api/v1/team/462419/image' },
    { name: 'Brasiliense', slug: 'brasiliense', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7867.png' },
    { name: 'Gama', slug: 'gama', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10285.png' },
    { name: 'Capital-DF', slug: 'capital_df', url: 'https://api.sofascore.app/api/v1/team/323381/image' },
    { name: 'Ceilândia', slug: 'ceilandia', url: 'https://api.sofascore.app/api/v1/team/7866/image' },
    { name: 'América-RN', slug: 'america_rn', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7865.png' },
    { name: 'Santa Cruz', slug: 'santa_cruz', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7878.png' }
  ],

  // --------------------------------------------------------------------------
  // LIGA ARGENTINA
  // --------------------------------------------------------------------------
  arg_1: [
    { name: 'Boca Juniors', slug: 'boca_juniors', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10077.png' },
    { name: 'River Plate', slug: 'river_plate', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10080.png' },
    { name: 'Racing Club', slug: 'racing_club', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10079.png' },
    { name: 'Independiente', slug: 'independiente', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10078.png' },
    { name: 'San Lorenzo', slug: 'san_lorenzo', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10081.png' },
    { name: 'Vélez Sarsfield', slug: 'velez_sarsfield', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/10082.png' }
  ],

  // --------------------------------------------------------------------------
  // EUROPA
  // --------------------------------------------------------------------------
  europe: [
    { name: 'Real Madrid', slug: 'real_madrid', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png' },
    { name: 'Barcelona', slug: 'barcelona', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png' },
    { name: 'Manchester City', slug: 'manchester_city', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png' },
    { name: 'Bayern München', slug: 'bayern_munchen', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png' },
    { name: 'Paris Saint-Germain', slug: 'paris_saint_germain', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png' }
  ],

  // --------------------------------------------------------------------------
  // ÁSIA / ARÁBIA SAUDITA
  // --------------------------------------------------------------------------
  asia: [
    { name: 'Al-Hilal', slug: 'al_hilal', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7474.png' },
    { name: 'Al-Nassr', slug: 'al_nassr', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/8395.png' },
    { name: 'Al-Ittihad', slug: 'al_ittihad', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7475.png' },
    { name: 'Al-Ahli', slug: 'al_ahli', url: 'https://images.fotmob.com/image_resources/logo/teamlogo/7476.png' }
  ]
};

// ==============================================================================
// FUNÇÃO DE DOWNLOAD ROBUSTA COM REDIRECT E VALIDAÇÃO DE INTEGRIDADE
// ==============================================================================
function downloadFile(fileUrl, destPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      return reject(new Error('Muitos redirecionamentos'));
    }

    const client = fileUrl.startsWith('https') ? https : http;
    const req = client.get(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }, (res) => {
      // Tratar redirecionamento (301, 302, 307, 308)
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
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);

        // Validação de Integridade: Tamanho mínimo > 1.5 KB
        if (buffer.length < 1500) {
          const textPreview = buffer.toString('utf8', 0, Math.min(200, buffer.length));
          if (textPreview.includes('<html') || textPreview.includes('<!DOCTYPE') || textPreview.includes('Access Denied')) {
            return reject(new Error(`Conteúdo HTML ou erro recebido (tamanho: ${buffer.length} bytes)`));
          }
        }

        // Checar se não é HTML vazio
        const header = buffer.toString('utf8', 0, 15);
        if (header.includes('<html') || header.includes('<!DOC')) {
          return reject(new Error('Página HTML recebida em vez de imagem'));
        }

        fs.writeFileSync(destPath, buffer);
        resolve({ size: buffer.length });
      });
    });

    req.on('error', err => reject(err));
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error('Timeout de conexão'));
    });
  });
}

// ==============================================================================
// PROCESSAMENTO POR LIGA
// ==============================================================================
async function processLeague(leagueKey) {
  const clubs = FOOTYLOGOS_MAP[leagueKey];
  if (!clubs || clubs.length === 0) {
    console.error(`❌ Liga '${leagueKey}' não encontrada no catálogo.`);
    console.log(`Ligas disponíveis: ${Object.keys(FOOTYLOGOS_MAP).join(', ')}`);
    return;
  }

  const outDir = path.join(__dirname, 'img', 'badges', leagueKey);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`📁 Pasta criada: ${outDir}`);
  }

  console.log(`\n============================================================`);
  console.log(`🚀 INICIANDO DOWNLOAD DA LIGA: [${leagueKey.toUpperCase()}] (${clubs.length} clubes)`);
  console.log(`============================================================`);

  let successCount = 0;
  let failCount = 0;

  for (const club of clubs) {
    const ext = club.url.includes('.svg') ? '.svg' : '.png';
    const filePath = path.join(outDir, `${club.slug}${ext}`);

    process.stdout.write(`⏳ Baixando ${club.name.padEnd(20)} [${club.slug}${ext}] ... `);

    try {
      const res = await downloadFile(club.url, filePath);
      console.log(`✅ OK (${(res.size / 1024).toFixed(1)} KB)`);
      successCount++;
    } catch (err) {
      console.log(`❌ FALHA: ${err.message}`);
      console.log(`   🔗 URL para inspeção: ${club.url}`);
      failCount++;
    }

    // Pequena pausa para respeitar a taxa de requisições
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n📊 Resumo [${leagueKey}]: ${successCount} baixados com sucesso, ${failCount} falhas.\n`);
}

// ==============================================================================
// CLI EXECUTION
// ==============================================================================
async function main() {
  const args = process.argv.slice(2);
  let targetLeague = null;

  for (const arg of args) {
    if (arg.startsWith('--league=')) {
      targetLeague = arg.split('=')[1].trim().toLowerCase();
    } else if (arg === '--all') {
      targetLeague = 'ALL';
    }
  }

  if (!targetLeague) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║ AFM MANAGER 2027 — DOWNLOADER DE ESCUDOS OFICIAIS (CLI)      ║
╚══════════════════════════════════════════════════════════════╝
Uso:
  node download_footylogos.js --league=bra_b
  node download_footylogos.js --league=bra_a
  node download_footylogos.js --league=bra_d
  node download_footylogos.js --league=arg_1
  node download_footylogos.js --all

Ligas catalogadas:
  - bra_a        (Brasileirão Série A - 20 clubes)
  - bra_b        (Brasileirão Série B - 20 clubes, com Sport e América-MG)
  - bra_d        (Série D - Pantanal, Brasiliense, etc.)
  - arg_1        (Liga Argentina)
  - europe       (Gigantes da Europa)
  - asia         (Arábia Saudita & Ásia)
`);
    return;
  }

  if (targetLeague === 'ALL') {
    for (const lk of Object.keys(FOOTYLOGOS_MAP)) {
      await processLeague(lk);
    }
  } else {
    await processLeague(targetLeague);
  }
}

main();
