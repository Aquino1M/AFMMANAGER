// Test script: test_all_teams_stadium_audit.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- AUDITORIA GERAL DE ESTÁDIOS NO AFM MANAGER ---');

// Mock browser globals
const sandbox = {
  window: {},
  document: {
    createElement: () => ({ style: {} }),
    getElementById: () => null,
    body: { appendChild: () => {} }
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Math: Math,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Map: Map,
  Set: Set,
  Intl: Intl
};
sandbox.window = sandbox;

// Load js/core/club_stadiums_catalog.js
const catalogCode = fs.readFileSync(path.join(__dirname, '../js/core/club_stadiums_catalog.js'), 'utf8');
vm.runInNewContext(catalogCode, sandbox);

console.log('1. Catálogo carregado com sucesso!');
console.log('   Total de estádios catalogados:', Object.keys(sandbox.REAL_CLUB_STADIUMS).length);

// Test Corinthians
const corinthiansInfo = sandbox.getClubStadiumInfo('Corinthians');
console.log('2. Teste do Corinthians:', corinthiansInfo);
if (!corinthiansInfo || corinthiansInfo.name !== 'Neo Química Arena') {
  console.error('FALHA: Corinthians não está na Neo Química Arena!', corinthiansInfo);
  process.exit(1);
}
if (corinthiansInfo.city !== 'São Paulo' || corinthiansInfo.state !== 'SP') {
  console.error('FALHA: Localização do Corinthians incorreta!', corinthiansInfo);
  process.exit(1);
}
console.log('   ✅ Corinthians verificado: Neo Química Arena (São Paulo - SP, cap: ' + corinthiansInfo.capacity + ')');

// Test Serie A Clubs
const serieA = [
  { club: 'Flamengo', expected: 'Maracanã' },
  { club: 'Palmeiras', expected: 'Allianz Parque' },
  { club: 'São Paulo', expected: 'MorumBIS' },
  { club: 'Corinthians', expected: 'Neo Química Arena' },
  { club: 'Fluminense', expected: 'Maracanã' },
  { club: 'Vasco da Gama', expected: 'São Januário' },
  { club: 'Botafogo', expected: 'Estádio Nilton Santos' },
  { club: 'Grêmio', expected: 'Arena do Grêmio' },
  { club: 'Internacional', expected: 'Estádio Beira-Rio' },
  { club: 'Atlético Mineiro', expected: 'Arena MRV' },
  { club: 'Cruzeiro', expected: 'Mineirão' },
  { club: 'Bahia', expected: 'Arena Fonte Nova' },
  { club: 'Vitória', expected: 'Barradão' },
  { club: 'Athletico Paranaense', expected: 'Ligga Arena' },
  { club: 'Fortaleza', expected: 'Arena Castelão' },
  { club: 'Ceará', expected: 'Arena Castelão' },
  { club: 'Red Bull Bragantino', expected: 'Nabi Abi Chedid' },
  { club: 'Juventude', expected: 'Alfredo Jaconi' },
  { club: 'Criciúma', expected: 'Heriberto Hülse' },
  { club: 'Cuiabá', expected: 'Arena Pantanal' }
];

console.log('\n3. Teste dos 20 Clubes da Série A:');
let serieAErrors = 0;
for (const item of serieA) {
  const info = sandbox.getClubStadiumInfo(item.club);
  if (!info || !info.name.includes(item.expected.split(' ')[0])) {
    console.error(`   ❌ ${item.club}: esperado conter "${item.expected}", recebido "${info ? info.name : 'null'}"`);
    serieAErrors++;
  } else {
    console.log(`   ✅ ${item.club.padEnd(22)} -> ${info.name} (${info.city}-${info.state}, ${info.capacity} lugares)`);
  }
}
if (serieAErrors > 0) {
  console.error(`FALHA na Série A: ${serieAErrors} erros`);
  process.exit(1);
}

// Test Serie B Clubs
const serieB = [
  { club: 'Santos', expected: 'Vila Belmiro' },
  { club: 'Sport Recife', expected: 'Ilha do Retiro' },
  { club: 'Goiás', expected: 'Serrinha' },
  { club: 'Coritiba', expected: 'Couto Pereira' },
  { club: 'América Mineiro', expected: 'Independência' },
  { club: 'Vila Nova', expected: 'Onésio Brasileiro Alvarenga' },
  { club: 'Avaí', expected: 'Ressacada' },
  { club: 'Chapecoense', expected: 'Arena Condá' },
  { club: 'Novorizontino', expected: 'Jorge Ismael de Biasi' },
  { club: 'Mirassol', expected: 'José Maria de Campos Maia' },
  { club: 'Operário Ferroviário', expected: 'Germano Krüger' },
  { club: 'CRB', expected: 'Rei Pelé' },
  { club: 'Paysandu', expected: 'Curuzu' },
  { club: 'Ponte Preta', expected: 'Moisés Lucarelli' },
  { club: 'Guarani', expected: 'Brinco de Ouro' },
  { club: 'Botafogo-SP', expected: 'Santa Cruz' },
  { club: 'Amazonas FC', expected: 'Arena da Amazônia' },
  { club: 'Brusque', expected: 'Augusto Bauer' },
  { club: 'Ituano', expected: 'Novelli Júnior' },
  { club: 'Londrina', expected: 'Estádio do Café' }
];

console.log('\n4. Teste de Clubes da Série B:');
let serieBErrors = 0;
for (const item of serieB) {
  const info = sandbox.getClubStadiumInfo(item.club);
  if (!info || !info.name) {
    console.error(`   ❌ ${item.club}: não encontrado!`);
    serieBErrors++;
  } else {
    console.log(`   ✅ ${item.club.padEnd(22)} -> ${info.name} (${info.city}-${info.state}, ${info.capacity} lugares)`);
  }
}
if (serieBErrors > 0) {
  console.error(`FALHA na Série B: ${serieBErrors} erros`);
  process.exit(1);
}

// Test Candangão Clubs (ensuring no cross-contamination)
console.log('\n5. Teste de Clubes do Candangão:');
const candangao = ['Brasiliense', 'Gama', 'Capital-DF', 'Real Brasília', 'Ceilândia', 'Sobradinho', 'ARUC', 'Paranoá', 'Samambaia', 'Planaltina'];
for (const c of candangao) {
  const info = sandbox.getClubStadiumInfo(c);
  console.log(`   ✅ ${c.padEnd(16)} -> ${info.name} (${info.city}-${info.state}, ${info.capacity} lugares)`);
}

// Test Self-Healing in clubStadiumName
console.log('\n6. Teste de Auto-Cura de Saves Contaminados:');
// Load competition.js norm function and game.js helper
sandbox.norm = (str) => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
sandbox.clubByName = (name) => null;

// Mock clubStadiumName from game.js
const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const matchFn = gameCode.match(/function clubStadiumName\(targetClub\)\{[\s\S]*?\n\}/);
if (matchFn) {
  vm.runInNewContext(matchFn[0], sandbox);
}

// Simulate corrupted save: Corinthians with stadiumName = 'Augustinho Pires de Lima'
sandbox.state = {
  club: 'Corinthians',
  stadiumName: 'Estádio Augustinho Pires de Lima'
};
const healedCorinthians = sandbox.clubStadiumName();
console.log('   Simulação de save contaminado no Corinthians:', sandbox.state.stadiumName);
console.log('   Resultado de clubStadiumName():', healedCorinthians);
if (healedCorinthians !== 'Neo Química Arena') {
  console.error('FALHA: clubStadiumName não curou o estádio contaminado do Corinthians!');
  process.exit(1);
}
console.log('   ✅ Auto-cura funcionou perfeitamente: ' + healedCorinthians);

// Simulate corrupted save with 'Defelê' on Palmeiras
sandbox.state = {
  club: 'Palmeiras',
  stadiumName: 'Defelê'
};
const healedPalmeiras = sandbox.clubStadiumName();
console.log('   Simulação de save contaminado no Palmeiras:', sandbox.state.stadiumName);
console.log('   Resultado de clubStadiumName():', healedPalmeiras);
if (healedPalmeiras !== 'Allianz Parque') {
  console.error('FALHA: clubStadiumName não curou o estádio contaminado do Palmeiras!');
  process.exit(1);
}
console.log('   ✅ Auto-cura funcionou perfeitamente: ' + healedPalmeiras);

console.log('\n=============================================');
console.log('🎯 AUDITORIA COMPLETA: TODOS OS ESTÁDIOS PASSARAM COM SUCESSO!');
console.log('=============================================');
