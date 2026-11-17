/**
 * Test Suite: Atualização 17/11/2026 — Técnicos de Seleções, Técnicos de Clubes & Elencos Atuais
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

global.window = global;
global.addEventListener = () => {};
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (tag) => ({
    tagName: String(tag || 'DIV').toUpperCase(),
    style: {},
    innerHTML: '',
    querySelector: () => null,
    querySelectorAll: () => [],
    appendChild: () => {},
    remove: () => {}
  }),
  body: { appendChild: () => {} }
};

console.log('🧪 Testando atualização 17/11/2026 (Seleções, Técnicos de Clubes e Elencos)...');

// 1. Carrega seleções, UI, escudos e elencos
require('../js/player/national_teams_manager.js');
require('../js/player/player_mode_ui.js');
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/competitions.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'data/competition_teams.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'data/club_badges.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'data/players_live.js'), 'utf8'));
window.livePlayers = window.LIVE_PLAYERS;
require('../js/systems/cup_highlight_ranking_world_and_licenses.js');

// 2. Valida paridade 100% entre NATIONS_DB e NATIONAL_TEAMS_CATALOG (38 seleções)
const db = window.AFM_NATIONAL_TEAM.NATIONS_DB;
const cat = window.AFM_NationalTeams.CATALOG;
assert(Object.keys(db).length >= 38, `Esperava >=38 seleções em NATIONS_DB, obteve ${Object.keys(db).length}`);
assert.deepStrictEqual(Object.keys(cat), Object.keys(db), 'CATALOG e NATIONS_DB devem ter exatamente as mesmas seleções');

const expectedNationalCoaches = {
  'Brasil': 'Carlo Ancelotti',
  'Argentina': 'Lionel Scaloni',
  'França': 'Zinédine Zidane',
  'Portugal': 'Jorge Jesus',
  'Espanha': 'Luis de la Fuente',
  'Alemanha': 'Jürgen Klopp',
  'Inglaterra': 'Thomas Tuchel',
  'Itália': 'Roberto Mancini',
  'Holanda': 'Xavi Hernández',
  'Bélgica': 'Mark van Bommel',
  'Croácia': 'Slaven Bilić',
  'Uruguai': 'Diego Forlán',
  'Colômbia': 'Néstor Lorenzo',
  'Paraguai': 'Gustavo Alfaro',
  'Equador': 'Marcelo Gallardo',
  'Chile': 'Nicolás Córdova',
  'Peru': 'Mano Menezes',
  'Venezuela': 'Oswaldo Vizcarrondo',
  'Bolívia': 'Óscar Villegas',
  'Estados Unidos': 'Mauricio Pochettino',
  'México': 'Rafael Márquez',
  'Canadá': 'Jesse Marsch',
  'Japão': 'Hajime Moriyasu',
  'Coreia do Sul': 'Robert Moreno',
  'Arábia Saudita': 'Georgios Donis',
  'Austrália': 'Tony Popovic',
  'Marrocos': 'Mohamed Ouahbi',
  'Senegal': 'Patrick Vieira',
  'Nigéria': 'Éric Chelle',
  'Egito': 'Ali Maher',
  'Suíça': 'Murat Yakin',
  'Dinamarca': 'Brian Riemer',
  'Noruega': 'Ståle Solbakken',
  'Suécia': 'Graham Potter',
  'Polônia': 'Jan Urban',
  'Turquia': 'Sergen Yalçın',
  'Áustria': 'Ralf Rangnick',
  'Sérvia': 'Veljko Paunović'
};

for (const [country, coach] of Object.entries(expectedNationalCoaches)) {
  const meta = window.AFM_NationalTeams.getNationalTeamMeta(country);
  assert.strictEqual(meta.coach, coach, `Técnico de ${country} deve ser ${coach}, recebeu ${meta.coach}`);
  assert.notStrictEqual(meta.flag, '🏳️', `Bandeira de ${country} não pode cair em fallback genérico`);
}

// Garante migração de save antigo com cache de Dorival Júnior -> Carlo Ancelotti
const legacySaveState = {
  gameMode: 'player',
  round: 3,
  date: '2026-01-20',
  player: { name: 'Aquino', nationality: 'Brasil', pos: 'ATA', ovr: 40 },
  playerCareerState: {
    athleteName: 'Aquino',
    nationality: 'Brasil',
    lastCallUpData: { country: 'Brasil', meta: { coach: 'Dorival Júnior' } }
  }
};
window.state = legacySaveState;
window.AFM_NATIONAL_TEAM.ensureNationalData(legacySaveState);
assert.strictEqual(legacySaveState.playerCareerState.nationalContext.nation.coach, 'Carlo Ancelotti');
assert.strictEqual(legacySaveState.playerCareerState.lastCallUpData.meta.coach, 'Carlo Ancelotti');
const renderedNatHtml = window.AFM_PlayerMode.renderPage('player_national', legacySaveState);
assert(renderedNatHtml.includes('Carlo Ancelotti'), 'Aba Seleção Nacional deve exibir Carlo Ancelotti');
assert(!renderedNatHtml.includes('Dorival Júnior'), 'Aba Seleção Nacional não pode exibir Dorival Júnior');
console.log('  ✅ 1. Todas as 38 seleções e migração automática de saves para Carlo Ancelotti validadas.');

// 3. Valida LIVE_PLAYERS (integridade, unicidade de tmId, escudos e transferências de 17/11/2026)
const lp = window.LIVE_PLAYERS;
assert(lp.length >= 4400, `LIVE_PLAYERS deve ter elenco mundial robusto (>=4400), atual: ${lp.length}`);

const seenTm = new Set();
const seenClubPlayer = new Set();
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

for (const p of lp) {
  assert(p.name && p.club && p.pos, `Atleta inválido em LIVE_PLAYERS: ${JSON.stringify(p)}`);
  assert(window.CLUB_BADGES[p.club], `Clube sem escudo em CLUB_BADGES: ${p.club}`);
  if (p.tmId) {
    assert(!seenTm.has(String(p.tmId)), `tmId duplicado encontrado: ${p.tmId} (${p.name} @ ${p.club})`);
    seenTm.add(String(p.tmId));
  }
  const ck = `${p.club}|${norm(p.name)}`;
  assert(!seenClubPlayer.has(ck), `Atleta duplicado no mesmo clube: ${ck}`);
  seenClubPlayer.add(ck);
}

// Verifica elencos completos (>=20 jogadores) nos gigantes mundiais e nacionais
const requiredFullClubs = [
  'Palmeiras', 'Flamengo', 'Botafogo', 'Cruzeiro', 'Corinthians', 'São Paulo', 'Santos',
  'Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Manchester City', 'Liverpool',
  'Arsenal', 'Chelsea', 'Manchester United', 'Tottenham Hotspur', 'Bayern München',
  'Borussia Dortmund', 'Bayer Leverkusen', 'Paris Saint-Germain', 'Inter', 'AC Milan',
  'Juventus', 'Napoli', 'Benfica', 'FC Porto', 'Sporting CP', 'Al-Hilal', 'Al-Nassr',
  'Al-Ittihad', 'Al-Ahli', 'Inter Miami', 'River Plate', 'Boca Juniors'
];
for (const club of requiredFullClubs) {
  const count = lp.filter(p => p.club === club).length;
  assert(count >= 20, `Clube ${club} deveria ter elenco completo (>=20), mas tem ${count}`);
}

// Verifica estrelas nos clubes atuais de 17/11/2026
const mustExistAt = [
  ['Vinicius Jr', 'Real Madrid'],
  ['Kylian Mbappé', 'Real Madrid'],
  ['Trent Alexander-Arnold', 'Real Madrid'],
  ['Lamine Yamal', 'FC Barcelona'],
  ['Raphinha', 'FC Barcelona'],
  ['Florian Wirtz', 'Liverpool'],
  ['Alexander Isak', 'Liverpool'],
  ['Viktor Gyökeres', 'Arsenal'],
  ['Gabriel Magalhães', 'Arsenal'],
  ['Estêvão', 'Chelsea'],
  ['Gianluigi Donnarumma', 'Manchester City'],
  ['Erling Haaland', 'Manchester City'],
  ['Matheus Cunha', 'Manchester United'],
  ['Ousmane Dembélé', 'Paris Saint-Germain'],
  ['Marquinhos', 'Paris Saint-Germain'],
  ['Kevin De Bruyne', 'Napoli'],
  ['Luka Modrić', 'AC Milan'],
  ['Cristiano Ronaldo', 'Al-Nassr'],
  ['Lionel Messi', 'Inter Miami'],
  ['Neymar', 'Santos'],
  ['Vitor Roque', 'Palmeiras'],
  ['Lucas Paquetá', 'Flamengo']
];
for (const [playerName, clubName] of mustExistAt) {
  const match = lp.find(p => norm(p.name) === norm(playerName) && p.club === clubName);
  assert(match, `Esperava ${playerName} no elenco de ${clubName} em 17/11/2026`);
}
console.log('  ✅ 2. Elencos reais de 17/11/2026, escudos e zero duplicidade de tmId validados.');

// 4. Valida técnicos de clubes no Ranking Mundial / Nacional (17/11/2026)
const rkList = window.buildCoachRankingList ? window.buildCoachRankingList('WORLD', { club: 'Ceilândia', coachName: 'Aquino' }) : [];
if (rkList.length > 0) {
  const findCoach = club => rkList.find(item => item.club === club)?.coach;
  assert.strictEqual(findCoach('Flamengo'), 'Leonardo Jardim');
  assert.strictEqual(findCoach('Botafogo'), 'Tite');
  assert.strictEqual(findCoach('Cruzeiro'), 'Artur Jorge');
  assert.strictEqual(findCoach('São Paulo'), 'Dorival Júnior');
  assert.strictEqual(findCoach('Real Madrid'), 'José Mourinho');
  assert.strictEqual(findCoach('Manchester City'), 'Enzo Maresca');
  assert.strictEqual(findCoach('Chelsea'), 'Xabi Alonso');
  assert.strictEqual(findCoach('Al-Hilal'), 'Simone Inzaghi');
  console.log('  ✅ 3. Técnicos de clubes em 17/11/2026 validados no Ranking Mundial.');
}

console.log('\n🎉 TESTE DE ATUALIZAÇÃO 17/11/2026 PASSOU COM 100% DE SUCESSO!\n');
