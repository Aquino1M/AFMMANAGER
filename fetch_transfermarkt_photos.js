/**
 * ==============================================================================
 * AFM MANAGER 2027 — DOWNLOAD AUTOMÁTICO DE FOTOS REAIS DO TRANSFERMARKT
 * Arquivo: fetch_transfermarkt_photos.js
 * Execução: node fetch_transfermarkt_photos.js
 * 
 * Percorre os atletas de LIVE_PLAYERS, pesquisa o perfil esportivo no Transfermarkt,
 * extrai a imagem facial oficial em alta resolução e grava em:
 * img/players/<liga_slug>/<clube_slug>/<nome_jogador_normalizado>.png
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const vm = require('vm');

console.log('======================================================================');
console.log('📸 AFM MANAGER 2027 — DOWNLOAD DE FOTOS DE JOGADORES (TRANSFERMARKT)');
console.log('======================================================================\n');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const IMG_PLAYERS_DIR = path.join(ROOT_DIR, 'img', 'players');

// 1. CARREGAR JOGADORES E MAPEAMENTO DE LIGAS
const PATH_PLAYERS = path.join(DATA_DIR, 'players_live.js');
const PATH_COMPETITIONS = path.join(DATA_DIR, 'competition_teams.js');
const PATH_PHOTOS_MODULAR = path.join(DATA_DIR, 'player_photos_modular.js');

const sandbox = { window: {}, console: console };
vm.createContext(sandbox);

if (fs.existsSync(PATH_PLAYERS)) {
  vm.runInContext(fs.readFileSync(PATH_PLAYERS, 'utf8'), sandbox);
}
if (fs.existsSync(PATH_COMPETITIONS)) {
  vm.runInContext(fs.readFileSync(PATH_COMPETITIONS, 'utf8'), sandbox);
}
if (fs.existsSync(PATH_PHOTOS_MODULAR)) {
  vm.runInContext(fs.readFileSync(PATH_PHOTOS_MODULAR, 'utf8'), sandbox);
}

const players = sandbox.window.LIVE_PLAYERS || [];
const compTeams = sandbox.window.COMPETITION_TEAMS || {};
const playerPhotosMap = sandbox.window.PLAYER_PHOTOS || {};

// Mapeamento de liga
const LEAGUE_FOLDER_MAP = {
  'bra-a': 'bra_a',
  'bra-b': 'bra_b',
  'bra-c': 'bra_c',
  'bra-d': 'bra_d',
  'bra-est-df': 'bra_estaduais',
  'bra-est-sp': 'bra_estaduais',
  'bra-est-rj': 'bra_estaduais',
  'bra-est-mg': 'bra_estaduais',
  'bra-est-rs': 'bra_estaduais',
  'bra-est-pr': 'bra_estaduais',
  'bra-est-sc': 'bra_estaduais',
  'bra-est-ba': 'bra_estaduais',
  'bra-est-ce': 'bra_estaduais',
  'bra-est-go': 'bra_estaduais',
  'bra-est-pe': 'bra_estaduais',
  'arg-1': 'arg_1',
  'arg-2': 'arg_2',
  'eng-1': 'europe',
  'esp-1': 'europe',
  'ita-1': 'europe',
  'ger-1': 'europe',
  'fra-1': 'europe',
  'por-1': 'europe',
  'ned-1': 'europe',
  'ksa-1': 'asia',
  'jpn-1': 'asia',
  'kor-1': 'asia',
  'chn-1': 'asia',
  'lib': 'conmebol',
  'sud': 'conmebol'
};

const clubToLeague = {};
for (const [compId, clubs] of Object.entries(compTeams)) {
  const folder = LEAGUE_FOLDER_MAP[compId] || 'bra_a';
  for (const c of clubs) {
    if (!clubToLeague[c]) clubToLeague[c] = folder;
  }
}

function toSlug(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Cliente HTTP com Headers reais de navegador
function fetchUrl(targetUrl, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(targetUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const reqHeaders = Object.assign({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }, headers);

    const req = client.get(targetUrl, { headers: reqHeaders }, (res) => {
      // Seguir redirecionamentos HTTP 301, 302, 307
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, targetUrl).href;
        }
        return resolve(fetchUrl(redirectUrl, headers));
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status HTTP ${res.statusCode} para ${targetUrl}`));
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error('Timeout de 12s excedido'));
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fallback visual de alta fidelidade
function generateSilhouetteSvg(playerName, pos, clubName) {
  const inits = playerName.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'AF';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#31104b"/>
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0.1"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" rx="32" fill="url(#bgGrad)"/>
    <circle cx="120" cy="85" r="48" fill="url(#glowGrad)"/>
    <!-- Silhueta estilizada da cabeça -->
    <circle cx="120" cy="88" r="38" fill="#475569"/>
    <!-- Silhueta estilizada do tronco/ombros -->
    <path d="M52 210 C52 145, 188 145, 188 210 Z" fill="#334155"/>
    <text x="120" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#f8fafc" text-anchor="middle">${inits}</text>
    <rect x="75" y="168" width="90" height="26" rx="13" fill="#6366f1"/>
    <text x="120" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">${pos}</text>
  </svg>`;
}

async function searchTransfermarktPhoto(playerName, clubName) {
  try {
    const query = `${playerName} ${clubName}`;
    const searchUrl = `https://www.transfermarkt.com.br/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}`;
    const htmlBuffer = await fetchUrl(searchUrl);
    const html = htmlBuffer.toString('utf8');

    // 1. Procurar por imagem de perfil na tabela de resultados do Transfermarkt
    // Padrão comum: <img src="https://img.a.transfermarkt.technology/portrait/header/...jpg"
    const regexImg = /https:\/\/[a-z0-9\.\-]+\/portrait\/(?:header|small|medium)\/([0-9]+\-[0-9]+\.(?:jpg|png|webp|jpeg))/i;
    const match = html.match(regexImg);

    if (match) {
      const fullUrl = `https://img.a.transfermarkt.technology/portrait/header/${match[1]}`;
      const imgBuffer = await fetchUrl(fullUrl);
      if (imgBuffer && imgBuffer.length > 1000) {
        return { buffer: imgBuffer, ext: path.extname(match[1]) || '.png' };
      }
    }

    // 2. Fallback: buscar na CDN TheSportsDB Player Cutout
    const sportsDbQuery = encodeURIComponent(playerName);
    const sportsDbUrl = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${sportsDbQuery}`;
    try {
      const sdbBuffer = await fetchUrl(sportsDbUrl);
      const sdbJson = JSON.parse(sdbBuffer.toString('utf8'));
      if (sdbJson && Array.isArray(sdbJson.player) && sdbJson.player[0]?.strCutout) {
        const cutoutUrl = sdbJson.player[0].strCutout;
        const imgBuffer = await fetchUrl(cutoutUrl);
        if (imgBuffer && imgBuffer.length > 2000) {
          return { buffer: imgBuffer, ext: '.png' };
        }
      }
    } catch (e) {}

  } catch (err) {
    // Falha normal de busca remota
  }
  return null;
}

// LOOP PRINCIPAL DE PROCESSAMENTO
async function run() {
  console.log(`Total de atletas a processar: ${players.length}\n`);

  let downloadedCount = 0;
  let skippedCount = 0;
  let fallbackCount = 0;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p || !p.name || !p.club) continue;

    const leagueFolder = clubToLeague[p.club] || 'bra_a';
    const clubSlug = toSlug(p.club);
    const playerSlug = toSlug(p.name);

    const targetDir = path.join(IMG_PLAYERS_DIR, leagueFolder, clubSlug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPng = path.join(targetDir, `${playerSlug}.png`);
    const targetJpg = path.join(targetDir, `${playerSlug}.jpg`);

    // 1. Verificar se já possui foto local
    if (fs.existsSync(targetPng) || fs.existsSync(targetJpg)) {
      skippedCount++;
      playerPhotosMap[p.name] = `img/players/${leagueFolder}/${clubSlug}/${playerSlug}.png`;
      continue;
    }

    console.log(`[${i + 1}/${players.length}] Buscando: ${p.name} (${p.club} · ${leagueFolder})...`);

    // 2. Buscar no Transfermarkt / fontes públicas
    const photoResult = await searchTransfermarktPhoto(p.name, p.club);

    if (photoResult && photoResult.buffer) {
      fs.writeFileSync(targetPng, photoResult.buffer);
      playerPhotosMap[p.name] = `img/players/${leagueFolder}/${clubSlug}/${playerSlug}.png`;
      downloadedCount++;
      console.log(`   ✓ Foto real salva: ${leagueFolder}/${clubSlug}/${playerSlug}.png (${photoResult.buffer.length} bytes)`);
    } else {
      // 3. Gerar silhueta estilizada SVG local para nunca ficar sem imagem
      const svgContent = generateSilhouetteSvg(p.name, p.pos || 'CM', p.club);
      fs.writeFileSync(targetPng, svgContent, 'utf8');
      playerPhotosMap[p.name] = `img/players/${leagueFolder}/${clubSlug}/${playerSlug}.png`;
      fallbackCount++;
      console.log(`   ⚡ Silhueta esportiva gerada: ${leagueFolder}/${clubSlug}/${playerSlug}.png`);
    }

    // Intervalo educado entre requisições para evitar rate limit
    await sleep(650);
  }

  // 4. Salvar mapeamento atualizado em data/player_photos_modular.js
  const modularEntries = Object.entries(playerPhotosMap).map(([name, relPath]) => {
    return `  "${name.replace(/"/g, '\\"')}": "${relPath}"`;
  });

  const updatedCode = `// ==============================================================================
// AFM MANAGER 2027 — MAPEAMENTO MODULAR DE FOTOS DE JOGADORES (ATUALIZADO)
// Total de fotos mapeadas: ${Object.keys(playerPhotosMap).length}
// ==============================================================================
window.PLAYER_PHOTOS = Object.assign(window.PLAYER_PHOTOS || {}, {
${modularEntries.join(',\n')}
});
`;
  fs.writeFileSync(PATH_PHOTOS_MODULAR, updatedCode, 'utf8');

  console.log('\n======================================================================');
  console.log(`🎉 PROCESSAMENTO CONCLUÍDO!`);
  console.log(`   - Baixadas diretamente do Transfermarkt/Web: ${downloadedCount}`);
  console.log(`   - Ignoradas (já existiam no disco): ${skippedCount}`);
  console.log(`   - Silhuetas esportivas geradas: ${fallbackCount}`);
  console.log(`   - Mapeamento data/player_photos_modular.js atualizado.`);
  console.log('======================================================================');
}

run().catch(err => {
  console.error('Erro na execução:', err);
});
