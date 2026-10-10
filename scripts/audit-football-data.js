/**
 * AFM MANAGER 2027 — AUDITORIA COMPLETA DE DADOS REAIS DE FUTEBOL
 * Valida integridade de competições, clubes, escudos, logos e jogadores.
 */

const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const BADGES_DIR = path.join(ROOT_DIR, 'img', 'badges');

console.log('='.repeat(70));
console.log('🔍 INICIANDO AUDITORIA OFICIAL AFM MANAGER 2027');
console.log('='.repeat(70));

let errorsCount = 0;
let warningsCount = 0;

function loadBrowserData(relativePath) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT_DIR, relativePath), 'utf8'), sandbox);
  return sandbox.window;
}

// 1. Carregar Competitions & Teams
function loadCompetitionTeams() {
  return loadBrowserData(path.join('data', 'competition_teams.js')).COMPETITION_TEAMS || {};
}

// 2. Carregar Mapeamento de Escudos
function loadClubBadges() {
  const data = loadBrowserData(path.join('data', 'club_badges.js'));
  return {
    badges: data.CLUB_BADGES || {},
    logos: data.COMPETITION_LOGOS || {}
  };
}

// 3. Carregar Definição de Competições
function loadCompetitions() {
  const data = loadBrowserData(path.join('js', 'competitions.js'));
  return data.COMPETITIONS || [];
}

const compTeams = loadCompetitionTeams();
const { badges: clubBadges, logos: compLogos } = loadClubBadges();
const competitions = loadCompetitions();

console.log(`\n📋 [ETAPA 1] Validando Competições Principais:`);
const EXPECTED_TEAMS = {
  'bra-a': 20,
  'bra-b': 20,
  'bra-c': 20,
  'bra-d': 96,
  'lib': 16,
  'sud': 16,
  'cwc': 12
};

for (const [compId, expectedCount] of Object.entries(EXPECTED_TEAMS)) {
  const teams = compTeams[compId] || [];
  const compDef = competitions.find(c => c.id === compId);
  if (!teams || teams.length !== expectedCount) {
    console.error(`❌ [ERRO] ${compId}: Esperava ${expectedCount} clubes, mas tem ${teams ? teams.length : 0}`);
    errorsCount++;
  } else {
    console.log(`  ✅ ${compId} (${compDef ? compDef.name : compId}): ${teams.length} clubes validados com sucesso.`);
  }

  // Verifica duplicatas
  const duplicates = teams.filter((t, index) => teams.indexOf(t) !== index);
  if (duplicates.length > 0) {
    console.error(`❌ [ERRO] Clubes duplicados em ${compId}: ${duplicates.join(', ')}`);
    errorsCount++;
  }
}

console.log(`\n🛡️ [ETAPA 2] Validando Existência e Integridade dos Escudos dos Clubes:`);
const allCompClubNames = new Set();
['bra-a', 'bra-b', 'bra-c', 'bra-d', 'lib', 'sud', 'cwc'].forEach(c => {
  (compTeams[c] || []).forEach(t => allCompClubNames.add(t));
});

let missingBadgeMapping = 0;
let missingFileOnDisk = 0;
let emptyFiles = 0;

allCompClubNames.forEach(clubName => {
  const badgeFile = clubBadges[clubName];
  if (!badgeFile) {
    console.error(`❌ [MAPEAMENTO AUSENTE] Clube sem escudo em CLUB_BADGES: "${clubName}"`);
    missingBadgeMapping++;
    errorsCount++;
    return;
  }

  const badgePath = path.join(BADGES_DIR, badgeFile);
  if (!fs.existsSync(badgePath)) {
    console.error(`❌ [ARQUIVO INEXISTENTE] Escudo não encontrado em disco: "${badgeFile}" para o clube "${clubName}"`);
    missingFileOnDisk++;
    errorsCount++;
    return;
  }

  const stats = fs.statSync(badgePath);
  if (stats.size === 0) {
    console.error(`❌ [ARQUIVO VAZIO] Escudo zerado (0 bytes): "${badgeFile}" (${clubName})`);
    emptyFiles++;
    errorsCount++;
  }
});

console.log(`  Total de clubes auditados nas competições-chave: ${allCompClubNames.size}`);
console.log(`  Mapeamentos ausentes: ${missingBadgeMapping}`);
console.log(`  Arquivos inexistentes no disco: ${missingFileOnDisk}`);
console.log(`  Arquivos vazios: ${emptyFiles}`);

console.log(`\n🏆 [ETAPA 3] Validando Logos das Competições:`);
const requiredLogos = ['bra-a', 'bra-b', 'bra-c', 'bra-d', 'bra-cup', 'lib', 'sud', 'ucl', 'uel', 'cwc', 'eng-1', 'esp-1', 'ita-1', 'ger-1', 'fra-1', 'por-1', 'ksa-1'];

requiredLogos.forEach(cId => {
  const logoRel = compLogos[cId];
  if (!logoRel) {
    console.error(`❌ [LOGO AUSENTE] Competição ${cId} sem mapeamento em COMPETITION_LOGOS`);
    errorsCount++;
    return;
  }
  const logoPath = path.join(BADGES_DIR, logoRel);
  if (!fs.existsSync(logoPath)) {
    console.error(`❌ [LOGO INEXISTENTE] Arquivo de logo não existe: ${logoRel} (${cId})`);
    errorsCount++;
    return;
  }
  console.log(`  ✅ Logo ${cId}: ${logoRel} [OK]`);
});

console.log(`\n⚽ [ETAPA 4] Validando Banco de Dados de Jogadores Reais (LIVE_PLAYERS):`);
function loadLivePlayers() {
  return loadBrowserData(path.join('data', 'players_live.js')).LIVE_PLAYERS || [];
}

const livePlayers = loadLivePlayers();
console.log(`  Total de jogadores cadastrados: ${livePlayers.length}`);

const uniquePlayerClubs = new Set();
let invalidClubNames = 0;
let missingPlayerClubBadge = 0;

livePlayers.forEach(p => {
  if (!p.club) {
    console.error(`❌ [JOGADOR SEM CLUBE] Atleta ${p.name} não possui clube atribuído.`);
    errorsCount++;
    return;
  }
  uniquePlayerClubs.add(p.club);
  if (!clubBadges[p.club]) {
    console.error(`❌ [ESCUDO DE CLUBE AUSENTE] Clube "${p.club}" do jogador "${p.name}" sem mapeamento em CLUB_BADGES`);
    missingPlayerClubBadge++;
    errorsCount++;
  }
});

console.log(`  Clubes com elencos cadastrados: ${uniquePlayerClubs.size}`);
console.log(`  Clubes de atletas sem escudo: ${missingPlayerClubBadge}`);
if (missingPlayerClubBadge === 0 && livePlayers.length > 0) {
  console.log(`  ✅ Todos os ${livePlayers.length} atletas reais têm clube com escudo mapeado.`);
}

console.log('\n' + '='.repeat(70));
if (errorsCount === 0) {
  console.log(`🎉 AUDITORIA CONCLUÍDA COM SUCESSO! 0 ERROS ENCONTRADOS.`);
  console.log(`Todos os mapeamentos, arquivos locais e dados cobertos por esta auditoria passaram.`);
} else {
  console.error(`🚨 AUDITORIA ENCONTROU ${errorsCount} ERROS. CORREÇÕES NECESSÁRIAS.`);
  process.exitCode = 1;
}
console.log('='.repeat(70) + '\n');
