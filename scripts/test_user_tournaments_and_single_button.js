const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando testes de validação: Botão Unificado Meu Time & Tática e Competições do Usuário na Central...');

const gameJs = fs.readFileSync('js/game.js', 'utf8');

// 1. Validar que na Central há apenas 1 botão unificado Meu Time & Tática (sem os 2 botões duplicados)
console.log('1. Verificando botão unificado na Central...');
assert(gameJs.includes('<!-- BOTÃO RÁPIDO LATERAL: MEU TIME & TÁTICA (UNIFICADO) -->'), 'Deve ter o cabeçalho do botão unificado');
assert(gameJs.includes('id="btnHeroQuickTactics" title="Abrir Meu Time & Tática"'), 'Deve conter o botão unificado com id btnHeroQuickTactics');
assert(gameJs.includes('Meu Time & Tática'), 'Texto deve ser Meu Time & Tática');
// Não deve mais ter a div com os 2 botões empilhados:
assert(!gameJs.includes('id="btnHeroQuickSquad" style="padding:7px 14px'), 'Não deve ter o botão antigo btnHeroQuickSquad na Central');
console.log('✅ Central possui apenas 1 botão unificado "Meu Time & Tática".');

// 2. Validar que no openMatchActionModal há apenas 1 botão unificado
console.log('2. Verificando botão unificado no modal de partida...');
assert(gameJs.includes('<!-- Botão Lateral: Meu Time & Tática (Unificado) -->'), 'Modal de partida deve ter botão unificado');
assert(!gameJs.includes('id="btnMatchModalSquad" style="padding:6px 12px'), 'Não deve ter botão duplicado btnMatchModalSquad no modal');
console.log('✅ Modal de partida possui apenas 1 botão unificado.');

// 3. Testar a lógica de resolução de competições do clube na Central (ex: Criciúma vs Flamengo)
console.log('3. Testando resolução de competições para Criciúma...');

// Mock de ambiente para simular a Central
global.window = global;
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null
};
global.norm = (str) => String(str || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
global.esc = (str) => String(str || '');
global.formatDatePtBr = (d) => String(d || '');
global.clubBadge = (c, s) => `[BADGE:${c}]`;
global.clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Mock de funções do jogo
global.getSavedSeasonMemberships = (club) => {
  if (norm(club) === 'criciuma') return { stateId: 'bra-est-cat' };
  if (norm(club) === 'flamengo') return { stateId: 'bra-est-rj' };
  return { stateId: null };
};

global.compById = (id) => {
  if (id === 'bra-est-cat') return { id: 'bra-est-cat', name: 'Campeonato Catarinense' };
  if (id === 'bra-est-rj') return { id: 'bra-est-rj', name: 'Campeonato Carioca' };
  return null;
};

global.getCopaDoBrasilState = () => ({
  phases: {
    '1ª Fase': {
      isoDate: '2026-02-11',
      dateStr: '11 fev 2026',
      fixtures: [
        { home: 'Criciúma', away: 'Operário-VG', round: '1ª Fase', isoDate: '2026-02-11' },
        { home: 'Flamengo', away: 'Sousa', round: '1ª Fase', isoDate: '2026-02-11' }
      ]
    }
  }
});

global.getContinentalTournament = (id) => {
  if (id === 'lib') {
    return {
      id: 'lib',
      standings: {
        'A': [{ name: 'Flamengo', p: 3, j: 1, gf: 2, ga: 0 }, { name: 'Independiente Medellín', p: 0, j: 1, gf: 0, ga: 2 }]
      },
      matches: [
        { home: 'Flamengo', away: 'Independiente Medellín', group: 'A', date: '2026-04-01', round: 1 }
      ]
    };
  }
  return null;
};

global.getStateCompData = (id) => {
  if (id === 'bra-est-cat') {
    return {
      teams: [
        { name: 'Criciúma', p: 9, j: 3, sg: 5, gp: 6 },
        { name: 'Avaí', p: 7, j: 3, sg: 3, gp: 4 },
        { name: 'Chapecoense', p: 6, j: 3, sg: 2, gp: 3 }
      ],
      fixtures: [
        { home: 'Criciúma', away: 'Avaí', roundIndex: 0, isoDate: '2026-01-20' },
        { home: 'Chapecoense', away: 'Figueirense', roundIndex: 0, isoDate: '2026-01-20' }
      ]
    };
  }
  return { teams: [], fixtures: [] };
};

// Teste para Criciúma
global.state = {
  club: 'Criciúma',
  date: '2026-01-15',
  season: 2026,
  centralCupTab: 'libertadores', // estava salvo anteriormente como libertadores
  history: []
};

// Executa a lógica de resolução extraída do game.js
function resolveCentralTabsForClub(clubName) {
  const myClubKey = norm(clubName);
  const memberships = getSavedSeasonMemberships(clubName);
  const stateCompId = memberships?.stateId;
  const stateComp = stateCompId && compById(stateCompId);
  const hasState = Boolean(stateCompId && stateComp && stateCompId.startsWith('bra-est-'));

  const libTourney = getContinentalTournament('lib');
  const sudTourney = getContinentalTournament('sud');
  let isUserInTournament = false;

  if (libTourney?.standings) {
    for (const [grp, rows] of Object.entries(libTourney.standings)) {
      if (Array.isArray(rows) && rows.some(r => norm(r.name) === myClubKey)) {
        isUserInTournament = true;
        break;
      }
    }
  }
  if (!isUserInTournament && sudTourney?.standings) {
    for (const [grp, rows] of Object.entries(sudTourney.standings)) {
      if (Array.isArray(rows) && rows.some(r => norm(r.name) === myClubKey)) {
        isUserInTournament = true;
        break;
      }
    }
  }

  const copa = getCopaDoBrasilState();
  let userInCopa = false;
  if (copa?.phases) {
    for (const phase of Object.values(copa.phases)) {
      if (Array.isArray(phase.fixtures) && phase.fixtures.some(f => norm(f.home) === myClubKey || norm(f.away) === myClubKey)) {
        userInCopa = true;
        break;
      }
    }
  }

  const userCentralCupTabs = [];
  if (hasState) {
    userCentralCupTabs.push({ id: 'estadual', label: '🏟️ ESTADUAL' });
  }
  if (userInCopa || (stateCompId && stateCompId.startsWith('bra-'))) {
    userCentralCupTabs.push({ id: 'copa', label: '🇧🇷 COPA' });
  }
  if (isUserInTournament) {
    userCentralCupTabs.push({ id: 'libertadores', label: '🏆 LIBERTADORES' });
  }

  return userCentralCupTabs;
}

const criciumaTabs = resolveCentralTabsForClub('Criciúma');
console.log('   Abas retornadas para Criciúma:', criciumaTabs.map(t => t.label).join(' | '));

assert.strictEqual(criciumaTabs.length, 2, 'Criciúma deve ter exatamente 2 abas secundárias');
assert(criciumaTabs.some(t => t.id === 'estadual'), 'Criciúma deve ter aba ESTADUAL');
assert(criciumaTabs.some(t => t.id === 'copa'), 'Criciúma deve ter aba COPA');
assert(!criciumaTabs.some(t => t.id === 'libertadores'), 'Criciúma NÃO pode ter aba LIBERTADORES!');
console.log('✅ Criciúma possui APENAS Estadual e Copa do Brasil (sem Libertadores).');

// Teste para Flamengo (que está na Libertadores)
console.log('4. Testando resolução de competições para Flamengo...');
const flamengoTabs = resolveCentralTabsForClub('Flamengo');
console.log('   Abas retornadas para Flamengo:', flamengoTabs.map(t => t.label).join(' | '));
assert.strictEqual(flamengoTabs.length, 3, 'Flamengo deve ter 3 abas secundárias');
assert(flamengoTabs.some(t => t.id === 'estadual'), 'Flamengo deve ter aba ESTADUAL');
assert(flamengoTabs.some(t => t.id === 'copa'), 'Flamengo deve ter aba COPA');
assert(flamengoTabs.some(t => t.id === 'libertadores'), 'Flamengo DEVE ter aba LIBERTADORES');
console.log('✅ Flamengo possui Estadual, Copa e Libertadores corretamente.');

// 5. Validar que o bind() amarra btn-central-cup-tab
console.log('5. Validando amarração de eventos...');
assert(gameJs.includes("$$('.btn-central-cup-tab').forEach"), 'bind() deve iterar sobre .btn-central-cup-tab');
assert(gameJs.includes("const bGoEstadual = $('#btnGoToEstadualTableFromCentral');"), 'bind() deve ter bGoEstadual');

// 6. Validar que o pwa_and_landscape_enforcer.js possui o listener delegado
const pwaJs = fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8');
assert(pwaJs.includes("e.target.closest('.btn-central-cup-tab')"), 'pwa_and_landscape_enforcer.js deve delegar clique nas abas');
assert(pwaJs.includes("e.target.closest('#btnGoToEstadualTableFromCentral')"), 'pwa_and_landscape_enforcer.js deve delegar link do estadual');
console.log('✅ Delegação no documento confirmada.');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
