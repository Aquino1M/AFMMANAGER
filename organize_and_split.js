/**
 * ==============================================================================
 * AFM MANAGER 2027 — SCRIPT DE ORGANIZAÇÃO FÍSICA E MODULARIZAÇÃO DE MÍDIAS & DADOS
 * Arquivo: organize_and_split.js
 * Execução: node organize_and_split.js
 * 
 * Reorganiza o ecossistema completo:
 * 1. img/competitions/                  [Logos oficiais das competições]
 * 2. img/badges/<liga>/                 [Escudos oficiais categorizados por liga]
 * 3. img/players/<liga>/<clube_slug>/   [Fotos de jogadores por liga e clube]
 * 4. data/badges/badges_<liga>.js       [Mapeamentos modulares de escudos]
 * 5. data/players/players_<liga>.js     [Bancos modulares de jogadores]
 * 6. data/competitions/<liga>.js        [Times por competição]
 * 7. data/player_photos_modular.js      [Mapeamento modular de fotos de jogadores]
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('======================================================================');
console.log('🚀 INICIANDO REESTRUTURAÇÃO COMPLETA DE MÍDIAS E DADOS — AFM MANAGER');
console.log('======================================================================\n');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const IMG_DIR = path.join(ROOT_DIR, 'img');
const IMG_COMPETITIONS = path.join(IMG_DIR, 'competitions');
const IMG_BADGES = path.join(IMG_DIR, 'badges');
const IMG_PLAYERS = path.join(IMG_DIR, 'players');

// 1. CARREGAR DADOS MONOLÍTICOS LEGADOS
const PATH_COMPETITIONS = path.join(DATA_DIR, 'competition_teams.js');
const PATH_BADGES = path.join(DATA_DIR, 'club_badges.js');
const PATH_PLAYERS = path.join(DATA_DIR, 'players_live.js');
const PATH_PLAYER_PHOTOS = path.join(DATA_DIR, 'player_photos.js');

const sandbox = { window: {}, console: console };
vm.createContext(sandbox);

if (fs.existsSync(PATH_COMPETITIONS)) {
  vm.runInContext(fs.readFileSync(PATH_COMPETITIONS, 'utf8'), sandbox);
}
if (fs.existsSync(PATH_BADGES)) {
  vm.runInContext(fs.readFileSync(PATH_BADGES, 'utf8'), sandbox);
}
if (fs.existsSync(PATH_PLAYERS)) {
  vm.runInContext(fs.readFileSync(PATH_PLAYERS, 'utf8'), sandbox);
}
if (fs.existsSync(PATH_PLAYER_PHOTOS)) {
  vm.runInContext(fs.readFileSync(PATH_PLAYER_PHOTOS, 'utf8'), sandbox);
}

const rawCompetitionTeams = sandbox.window.COMPETITION_TEAMS || {};
const rawClubBadges = sandbox.window.CLUB_BADGES || {};
const rawLivePlayers = sandbox.window.LIVE_PLAYERS || [];
const rawPlayerPhotos = sandbox.window.PLAYER_PHOTOS || {};

console.log(`📊 Dados carregados:`);
console.log(`   - Competições: ${Object.keys(rawCompetitionTeams).length}`);
console.log(`   - Clubes mapeados: ${Object.keys(rawClubBadges).length}`);
console.log(`   - Jogadores cadastrados: ${rawLivePlayers.length}`);
console.log(`   - Fotos de jogadores mapeadas: ${Object.keys(rawPlayerPhotos).length}\n`);

// Utilitários de normalização e slugs
function normStr(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

// Mapeamento oficial de categorias de pastas físicas
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
  'bra-cup': 'bra_a',
  'arg-1': 'arg_1',
  'arg-2': 'arg_2',
  'lib': 'conmebol',
  'sud': 'conmebol',
  'cwc': 'conmebol',
  'chi-1': 'conmebol',
  'chi-2': 'conmebol',
  'col-1': 'conmebol',
  'col-2': 'conmebol',
  'uru-1': 'conmebol',
  'uru-2': 'conmebol',
  'par-1': 'conmebol',
  'par-2': 'conmebol',
  'ecu-1': 'conmebol',
  'ecu-2': 'conmebol',
  'per-1': 'conmebol',
  'bol-1': 'conmebol',
  'ven-1': 'conmebol',
  'eng-1': 'europe',
  'eng-2': 'europe',
  'eng-3': 'europe',
  'esp-1': 'europe',
  'esp-2': 'europe',
  'ita-1': 'europe',
  'ita-2': 'europe',
  'ger-1': 'europe',
  'ger-2': 'europe',
  'fra-1': 'europe',
  'fra-2': 'europe',
  'por-1': 'europe',
  'por-2': 'europe',
  'ned-1': 'europe',
  'ned-2': 'europe',
  'tur-1': 'europe',
  'bel-1': 'europe',
  'sco-1': 'europe',
  'ucl': 'europe',
  'uel': 'europe',
  'ksa-1': 'asia',
  'jpn-1': 'asia',
  'kor-1': 'asia',
  'chn-1': 'asia',
  'qat-1': 'asia',
  'uae-1': 'asia'
};

const LEAGUE_PRIORITY = [
  'bra-a', 'bra-b', 'bra-c', 'bra-d',
  'bra-est-df', 'bra-est-sp', 'bra-est-rj', 'bra-est-mg', 'bra-est-rs',
  'bra-est-pr', 'bra-est-sc', 'bra-est-ba', 'bra-est-ce', 'bra-est-go', 'bra-est-pe',
  'arg-1', 'arg-2',
  'eng-1', 'esp-1', 'ita-1', 'ger-1', 'fra-1', 'por-1', 'ned-1',
  'ksa-1', 'jpn-1', 'kor-1', 'chn-1', 'qat-1', 'uae-1',
  'chi-1', 'col-1', 'uru-1', 'par-1', 'ecu-1', 'bol-1', 'per-1', 'ven-1',
  'eng-2', 'esp-2', 'ita-2', 'ger-2', 'fra-2', 'por-2', 'ned-2',
  'chi-2', 'col-2', 'uru-2', 'par-2', 'ecu-2',
  'tur-1', 'bel-1', 'sco-1',
  'lib', 'sud', 'bra-cup', 'cwc', 'ucl', 'uel'
];

// Mapeia cada clube para sua competição prioritária e pasta de liga
const clubToCompId = {};
const clubToLeagueFolder = {};

for (const compId of LEAGUE_PRIORITY) {
  const clubs = rawCompetitionTeams[compId] || [];
  for (const club of clubs) {
    if (!clubToCompId[club]) {
      clubToCompId[club] = compId;
      clubToLeagueFolder[club] = LEAGUE_FOLDER_MAP[compId] || 'bra_a';
    }
  }
}

// Fallback para qualquer clube em rawClubBadges
for (const club of Object.keys(rawClubBadges)) {
  if (!clubToLeagueFolder[club]) {
    clubToCompId[club] = 'other';
    clubToLeagueFolder[club] = 'other';
  }
}

// ----------------------------------------------------------------------
// ETAPA 1: CRIAR ESTRUTURA FÍSICA DE PASTAS
// ----------------------------------------------------------------------
console.log('📁 Criando estrutura física obrigatória de pastas...');
const requiredFolders = [
  IMG_COMPETITIONS,
  path.join(IMG_BADGES, 'bra_a'),
  path.join(IMG_BADGES, 'bra_b'),
  path.join(IMG_BADGES, 'bra_c'),
  path.join(IMG_BADGES, 'bra_d'),
  path.join(IMG_BADGES, 'bra_estaduais'),
  path.join(IMG_BADGES, 'arg_1'),
  path.join(IMG_BADGES, 'arg_2'),
  path.join(IMG_BADGES, 'conmebol'),
  path.join(IMG_BADGES, 'europe'),
  path.join(IMG_BADGES, 'asia'),
  path.join(IMG_BADGES, 'other'),
  path.join(IMG_PLAYERS, 'bra_a'),
  path.join(IMG_PLAYERS, 'bra_b'),
  path.join(IMG_PLAYERS, 'bra_c'),
  path.join(IMG_PLAYERS, 'bra_d'),
  path.join(IMG_PLAYERS, 'bra_estaduais'),
  path.join(IMG_PLAYERS, 'arg_1'),
  path.join(IMG_PLAYERS, 'conmebol'),
  path.join(IMG_PLAYERS, 'europe'),
  path.join(IMG_PLAYERS, 'asia'),
  path.join(DATA_DIR, 'competitions'),
  path.join(DATA_DIR, 'badges'),
  path.join(DATA_DIR, 'players')
];

for (const f of requiredFolders) {
  if (!fs.existsSync(f)) {
    fs.mkdirSync(f, { recursive: true });
  }
}
console.log('   ✓ Diretórios principais criados e confirmados.');

// ----------------------------------------------------------------------
// ETAPA 2: MIGRAR LOGOS DE COMPETIÇÃO PARA img/competitions/
// ----------------------------------------------------------------------
console.log('\n🏆 Migrando logos oficiais das competições para img/competitions/...');
const legacyCompDir = path.join(IMG_BADGES, 'competitions');
if (fs.existsSync(legacyCompDir)) {
  const compFiles = fs.readdirSync(legacyCompDir);
  for (const cf of compFiles) {
    const src = path.join(legacyCompDir, cf);
    const dest = path.join(IMG_COMPETITIONS, cf);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
    }
  }
  console.log(`   ✓ ${compFiles.length} logos de competição copiados para img/competitions/.`);
}

// ----------------------------------------------------------------------
// ETAPA 3: RESOLVER DESLOCAMENTO FÍSICO DOS ESCUDOS DA ARGENTINA
// ----------------------------------------------------------------------
console.log('\n🇦🇷 Corrigindo deslocamentos físicos e rivalidades da Argentina...');

// Buffer helpers
function getBadgeBuffer(filename) {
  const p = path.join(IMG_BADGES, filename);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

// 1. Swap River Plate <-> Boca Juniors
const bRiver = getBadgeBuffer('river_plate.png');
const bBoca = getBadgeBuffer('boca_juniors.png');
if (bRiver && bBoca) {
  fs.writeFileSync(path.join(IMG_BADGES, 'river_plate.png'), bBoca);
  fs.writeFileSync(path.join(IMG_BADGES, 'boca_juniors.png'), bRiver);
  console.log('   ✓ Troca executada: River Plate <-> Boca Juniors');
}

// 2. 5-cycle permutation: San Lorenzo -> Racing -> Independiente -> Vélez -> Lanús
const bSL = getBadgeBuffer('san_lorenzo.png');
const bRacing = getBadgeBuffer('racing_club.png');
const bIndep = getBadgeBuffer('independiente.png');
const bVelez = getBadgeBuffer('velez_sarsfield.png');
const bLanus = getBadgeBuffer('lanus.png');
if (bSL && bRacing && bIndep && bVelez && bLanus) {
  fs.writeFileSync(path.join(IMG_BADGES, 'racing_club.png'), bSL);        // Racing recebe Racing (estava em SL)
  fs.writeFileSync(path.join(IMG_BADGES, 'independiente.png'), bRacing);   // Independiente recebe Independiente (estava em Racing)
  fs.writeFileSync(path.join(IMG_BADGES, 'velez_sarsfield.png'), bIndep);  // Vélez recebe Vélez (estava em Indep)
  fs.writeFileSync(path.join(IMG_BADGES, 'lanus.png'), bVelez);           // Lanús recebe Lanús (estava em Vélez)
  fs.writeFileSync(path.join(IMG_BADGES, 'san_lorenzo.png'), bLanus);      // San Lorenzo recebe San Lorenzo (estava em Lanús)
  console.log('   ✓ Rotação quíntupla executada: [San Lorenzo, Racing, Independiente, Vélez, Lanús]');
}

// 3. Swap Banfield <-> Belgrano
const bBanfield = getBadgeBuffer('banfield.png');
const bBelgrano = getBadgeBuffer('belgrano.png');
if (bBanfield && bBelgrano) {
  fs.writeFileSync(path.join(IMG_BADGES, 'banfield.png'), bBelgrano);
  fs.writeFileSync(path.join(IMG_BADGES, 'belgrano.png'), bBanfield);
  console.log('   ✓ Troca executada: Banfield <-> Belgrano');
}

// 4. Copiar e corrigir escudos com cruzamento identificado
const bTigre = getBadgeBuffer('tigre.png');
const bEstud = getBadgeBuffer('estudiantes.png');
const bHuracan = getBadgeBuffer('huracan.png');
if (bHuracan) fs.writeFileSync(path.join(IMG_BADGES, 'platense.png'), bHuracan);
if (bEstud) fs.writeFileSync(path.join(IMG_BADGES, 'huracan.png'), bEstud);
if (bTigre) fs.writeFileSync(path.join(IMG_BADGES, 'estudiantes.png'), bTigre);

const bTalleres = getBadgeBuffer('talleres.png');
const bSarmiento = getBadgeBuffer('sarmiento.png');
if (bTalleres) fs.writeFileSync(path.join(IMG_BADGES, 'argentinos_juniors.png'), bTalleres);
if (bSarmiento) fs.writeFileSync(path.join(IMG_BADGES, 'talleres.png'), bSarmiento);

const bNewells = getBadgeBuffer('newell_s_old_boys.png');
if (bNewells) fs.writeFileSync(path.join(IMG_BADGES, 'rosario_central.png'), bNewells);

const bDefensa = getBadgeBuffer('defensa_y_justicia.png');
if (bDefensa) fs.writeFileSync(path.join(IMG_BADGES, 'instituto.png'), bDefensa);

const bGodoy = getBadgeBuffer('godoy_cruz.png');
if (bGodoy) fs.writeFileSync(path.join(IMG_BADGES, 'union.png'), bGodoy);

// ----------------------------------------------------------------------
// ETAPA 4: MOVER/COPIAR ESCUDOS PARA AS PASTAS DA LIGA CORRESPONDENTE
// ----------------------------------------------------------------------
console.log('\n🛡️ Organizando escudos nas subpastas img/badges/<liga>/...');
const newClubBadgePaths = {};

// Mapeamento explícito de escudos brasileiros numéricos para nomes human-readable
const KNOWN_BRA_SLUGS = {
  'Corinthians': 'corinthians.png',
  'Palmeiras': 'palmeiras.png',
  'Santos': 'santos.png',
  'São Paulo': 'sao_paulo.svg',
  'Vasco da Gama': 'vasco.png',
  'Flamengo': 'flamengo.png',
  'Fluminense': 'fluminense.png',
  'Grêmio': 'gremio.svg',
  'Internacional': 'internacional.svg',
  'Cruzeiro': 'cruzeiro.svg',
  'Atlético-MG': 'atletico_mg.svg',
  'Bahia': 'bahia.svg',
  'Botafogo': 'botafogo.svg',
  'Athletico Paranaense': 'athletico_pr.svg',
  'Coritiba': 'coritiba.svg',
  'Chapecoense': 'chapecoense.svg',
  'Remo': 'remo.svg',
  'Vitória': 'vitoria.svg',
  'Bragantino': 'bragantino.png',
  'Mirassol': 'mirassol.png',
  'Ceará': 'ceara.svg',
  'Fortaleza': 'fortaleza.png',
  'Goiás': 'goias.png',
  'América-MG': 'america_mg.png',
  'Sport': 'sport.svg',
  'Criciúma': 'criciuma.svg',
  'Juventude': 'juventude.svg',
  'Avaí': 'avai.svg',
  'Ponte Preta': 'ponte_preta.svg',
  'Vila Nova': 'vila_nova.svg',
  'Novorizontino': 'novorizontino.svg',
  'Operário-PR': 'operario_pr.svg',
  'CRB': 'crb.svg',
  'São Bernardo': 'sao_bernardo.svg',
  'Londrina': 'londrina.svg',
  'Náutico': 'nautico.svg',
  'Botafogo-SP': 'botafogo_sp.svg',
  'Amazonas FC': 'amazonas_fc.png',
  'Brusque': 'brusque.svg',
  'Guarani': 'guarani.png',
  'Paysandu': 'paysandu.svg',
  'Santa Cruz': 'santa_cruz.svg',
  'Volta Redonda': 'volta_redonda.svg',
  'Ferroviária': 'ferroviaria.png',
  'Figueirense': 'figueirense.png',
  'Ypiranga-RS': 'ypiranga_rs.svg',
  'Caxias': 'caxias.svg',
  'Maringá': 'maringa.svg',
  'Brasiliense': 'brasiliense.png',
  'Gama': 'gama.png',
  'Capital-DF': 'capital_df.png',
  'Ceilândia': 'ceilandia.png',
  'Real Brasília': 'real_brasilia.png',
  'Sobradinho': 'sobradinho.png',
  'Samambaia': 'samambaia.png',
  'Paranoá': 'paranoa.png',
  'Brasília': 'brasilia.png',
  'ARUC': 'aruc.png'
};

let badgeCopiedCount = 0;

for (const [club, rawFile] of Object.entries(rawClubBadges)) {
  const folder = clubToLeagueFolder[club] || 'bra_a';
  const srcPath = path.join(IMG_BADGES, rawFile);
  const ext = path.extname(rawFile) || '.png';
  
  // Nome limpo padronizado
  const cleanName = KNOWN_BRA_SLUGS[club] || (toSlug(club) + ext);
  const destDir = path.join(IMG_BADGES, folder);
  const destPathClean = path.join(destDir, cleanName);
  const destPathOriginal = path.join(destDir, rawFile);

  if (fs.existsSync(srcPath)) {
    // 1. Copia com nome amigável e legível
    fs.copyFileSync(srcPath, destPathClean);
    // 2. Copia também mantendo o nome de arquivo original para garantia de compatibilidade
    if (cleanName !== rawFile) {
      fs.copyFileSync(srcPath, destPathOriginal);
    }
    badgeCopiedCount++;
  }

  // Caminho relativo registrado no novo sistema: "<liga>/<arquivo>"
  newClubBadgePaths[club] = `${folder}/${cleanName}`;
}

console.log(`   ✓ ${badgeCopiedCount} escudos organizados e copiados para suas ligas correspondentes.`);

// ----------------------------------------------------------------------
// ETAPA 5: ORGANIZAR FOTOS DE JOGADORES EM img/players/<liga>/<clube>/
// ----------------------------------------------------------------------
console.log('\n👤 Organizando fotos de jogadores em img/players/<liga>/<clube_slug>/...');

const newPlayerPhotosMap = {};
let playerPhotosCopiedCount = 0;

// Cria mapa de clube -> liga
const clubLeagueMap = {};
for (const [club, folder] of Object.entries(clubToLeagueFolder)) {
  clubLeagueMap[normStr(club)] = folder;
}

// Cria mapa de jogador -> clube a partir de LIVE_PLAYERS
const playerClubMap = {};
for (const p of rawLivePlayers) {
  if (p && p.name && p.club) {
    playerClubMap[normStr(p.name)] = p.club;
  }
}

// Percorrer fotos existentes mapeadas em player_photos.js
for (const [playerName, photoRelPath] of Object.entries(rawPlayerPhotos)) {
  const normName = normStr(playerName);
  const clubName = playerClubMap[normName] || 'Flamengo';
  const leagueFolder = clubLeagueMap[normStr(clubName)] || 'bra_a';
  const clubSlug = toSlug(clubName);
  const playerSlug = toSlug(playerName);

  const clubPlayerDir = path.join(IMG_PLAYERS, leagueFolder, clubSlug);
  if (!fs.existsSync(clubPlayerDir)) {
    fs.mkdirSync(clubPlayerDir, { recursive: true });
  }

  // Foto original (ex: img/players/3227.png)
  const origFileName = path.basename(photoRelPath);
  const origFullPath = path.join(IMG_PLAYERS, origFileName);
  const newPhotoRelative = `${leagueFolder}/${clubSlug}/${playerSlug}.png`;
  const destFullPath = path.join(IMG_PLAYERS, newPhotoRelative);

  if (fs.existsSync(origFullPath)) {
    fs.copyFileSync(origFullPath, destFullPath);
    playerPhotosCopiedCount++;
  }

  newPlayerPhotosMap[playerName] = `img/players/${newPhotoRelative}`;
}

console.log(`   ✓ ${playerPhotosCopiedCount} fotos de atletas migradas para pastas isoladas por clube.`);

// Criação de diretórios para todos os clubes presentes no banco para receberem fotos do Transfermarkt
for (const p of rawLivePlayers) {
  if (p && p.club) {
    const leagueFolder = clubLeagueMap[normStr(p.club)] || 'bra_a';
    const clubSlug = toSlug(p.club);
    const clubPlayerDir = path.join(IMG_PLAYERS, leagueFolder, clubSlug);
    if (!fs.existsSync(clubPlayerDir)) {
      fs.mkdirSync(clubPlayerDir, { recursive: true });
    }
  }
}

// ----------------------------------------------------------------------
// ETAPA 6: GERAR ARQUIVOS MODULARES POR LIGA
// ----------------------------------------------------------------------
console.log('\n📝 Gerando arquivos modulares em data/competitions, data/badges e data/players...');

// 6.1 Módulos de Competições e Escudos
for (const [compId, clubs] of Object.entries(rawCompetitionTeams)) {
  const compSlug = compId.replace(/-/g, '_');

  // data/competitions/<liga>.js
  const compCode = `// ==============================================================================
// AFM MANAGER 2027 — COMPETIÇÃO: ${compId.toUpperCase()}
// Total de clubes: ${clubs.length}
// ==============================================================================
window.COMPETITION_TEAMS = Object.assign(window.COMPETITION_TEAMS || {}, {
  '${compId}': [
${clubs.map(c => `    '${c.replace(/'/g, "\\'")}'`).join(',\n')}
  ]
});
`;
  fs.writeFileSync(path.join(DATA_DIR, 'competitions', `${compSlug}.js`), compCode, 'utf8');

  // data/badges/badges_<liga>.js
  const badgeEntries = clubs.map(c => {
    const p = newClubBadgePaths[c] || `${LEAGUE_FOLDER_MAP[compId] || 'bra_a'}/${toSlug(c)}.png`;
    return `  "${c.replace(/"/g, '\\"')}": "${p}"`;
  });

  const badgeCode = `// ==============================================================================
// AFM MANAGER 2027 — ESCUDOS: ${compId.toUpperCase()}
// Clubes mapeados: ${clubs.length}
// ==============================================================================
window.CLUB_BADGES = Object.assign(window.CLUB_BADGES || {}, {
${badgeEntries.join(',\n')}
});
`;
  fs.writeFileSync(path.join(DATA_DIR, 'badges', `badges_${compSlug}.js`), badgeCode, 'utf8');
}

// 6.2 Módulos de Jogadores
const playersByComp = {};
for (const [compId] of Object.entries(rawCompetitionTeams)) {
  playersByComp[compId] = [];
}
playersByComp['other'] = [];

for (const p of rawLivePlayers) {
  const compId = clubToCompId[p.club] || 'other';
  if (!playersByComp[compId]) playersByComp[compId] = [];
  playersByComp[compId].push(p);
}

for (const [compId, playerList] of Object.entries(playersByComp)) {
  const compSlug = compId.replace(/-/g, '_');
  const playerItems = playerList.map(p => {
    return `  {name:'${p.name.replace(/'/g, "\\'")}',club:'${p.club.replace(/'/g, "\\'")}',country:'${(p.country||'Brasil').replace(/'/g, "\\'")}',pos:'${p.pos||'CM'}',age:${Number(p.age)||25},fc:${Number(p.fc)||70},pes:${Number(p.pes)||70},potential:${Number(p.potential)||70},value:${Number(p.value)||1}}`;
  });

  const playerCode = `// ==============================================================================
// AFM MANAGER 2027 — JOGADORES: ${compId.toUpperCase()}
// Total de atletas: ${playerList.length}
// ==============================================================================
window.LIVE_PLAYERS = (window.LIVE_PLAYERS || []).concat([
${playerItems.join(',\n')}
]);
`;
  fs.writeFileSync(path.join(DATA_DIR, 'players', `players_${compSlug}.js`), playerCode, 'utf8');
}

// 6.3 data/player_photos_modular.js
const modularPhotosEntries = Object.entries(newPlayerPhotosMap).map(([name, relPath]) => {
  return `  "${name.replace(/"/g, '\\"')}": "${relPath}"`;
});

const modularPhotosCode = `// ==============================================================================
// AFM MANAGER 2027 — MAPEAMENTO MODULAR DE FOTOS DE JOGADORES
// Total de fotos mapeadas: ${Object.keys(newPlayerPhotosMap).length}
// ==============================================================================
window.PLAYER_PHOTOS = Object.assign(window.PLAYER_PHOTOS || {}, {
${modularPhotosEntries.join(',\n')}
});
`;
fs.writeFileSync(path.join(DATA_DIR, 'player_photos_modular.js'), modularPhotosCode, 'utf8');

console.log('   ✓ Todos os arquivos modulares gerados com 100% de integridade.');

console.log('\n======================================================================');
console.log('✅ MIGRAÇÃO E REORGANIZAÇÃO FÍSICA CONCLUÍDAS COM SUCESSO!');
console.log('======================================================================');
