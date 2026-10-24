const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');
const marker = 'function getMuseumHistoricalTitles(';
const start = source.indexOf(marker);
if(start < 0) throw new Error('getMuseumHistoricalTitles not found');
const open = source.indexOf('{', start);
let depth = 0;
let end = -1;
for(let i = open; i < source.length; i++){
  if(source[i] === '{') depth++;
  else if(source[i] === '}' && --depth === 0){ end = i + 1; break; }
}
if(end < 0) throw new Error('getMuseumHistoricalTitles is incomplete');

const context = {
  state: null,
  window: { REAL_CLUB_TROPHIES_DB: { 'cachaceiros futebol clube': [{ name: 'Título histórico indevido', year: '2020' }], flamengo: [{ name: 'Copa oficial', year: '2022' }] } }
};
const getMuseumHistoricalTitles = vm.runInNewContext(`(${source.slice(start, end)})`, context);

if(getMuseumHistoricalTitles({ club: 'Cachaceiros Futebol Clube', customClub: { isCustom: true } }).length !== 0){
  throw new Error('Clube criado pelo usuário deve iniciar sem títulos históricos');
}
if(getMuseumHistoricalTitles({ club: 'Flamengo' })[0] !== 'Copa oficial (2022)'){
  throw new Error('Clube real deve manter seu acervo histórico oficial');
}

console.log('PASS: clubes criados do zero começam sem taças históricas e clubes reais preservam o acervo.');

{
  const trophiesSystemSource = fs.readFileSync(path.resolve(__dirname, '../js/systems/trophies_tv_1year_marketing_and_payroll.js'), 'utf8');
  
  // Extrai registerTrophyInMuseum, syncAllTrophiesToMuseum e getMuseumData
  const syncStart = source.indexOf('function registerTrophyInMuseum(');
  const syncEnd = source.indexOf('\n// -------------------------------------------------------------\n// ABA NOTÍCIAS & MÍDIA', syncStart);
  if(syncStart < 0 || syncEnd < 0) throw new Error('Funções de museu e troféus não encontradas');
  const museumFunctionsCode = source.slice(syncStart, syncEnd);

  const testState = {
    club: 'AQN FC',
    season: 2028,
    compId: 'bra-d',
    customClub: { isCustom: true, name: 'AQN FC', shortName: 'AQF' },
    customClubStateCompId: 'bra-est-df',
    titles: [],
    museumData: { level: 1, skipOfferUsed: false },
    competitionPromotionRecovery: { from: 'bra-est-df', to: 'bra-d', season: 2026, reason: 'earned-state-ranking' },
    seasonHistory: [{
      season: 2026,
      compName: 'Campeonato Candango',
      champion: 'AQN FC',
      userPosition: 1,
      userClub: 'AQN FC'
    }]
  };

  const testContext = {
    state: testState,
    window: {
      syncAllTrophiesToMuseum: null,
      registerTrophyInMuseum: null,
      REAL_CLUB_TROPHIES_DB: {},
      addEventListener: () => {}
    },
    MUSEUM_LEVELS: [
      { level: 1, name: 'Estante de Troféus', capacity: 2, cost: 50000 }
    ],
    getMuseumHistoricalTitles,
    compById: id => ({ id, name: id === 'bra-est-df' ? 'Campeonato Candango' : id }),
    norm: v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(),
    clubStateCompId: () => 'bra-est-df',
    document: { querySelector: () => null, addEventListener: () => {} }
  };

  vm.runInNewContext(museumFunctionsCode, testContext);

  // Executa getMuseumData que dispara syncAllTrophiesToMuseum
  const musData = testContext.getMuseumData();
  if(!musData.allTitles.some(t => t.includes('Campeonato Candango') && t.includes('2026'))){
    throw new Error('Campeonato Candango de 2026 deve constar no acervo do museu!');
  }
  if(musData.inVitrine.length !== 1 || !musData.inVitrine[0].includes('Campeonato Candango')){
    throw new Error('Campeonato Candango de 2026 deve estar em exibição na vitrine do museu!');
  }

  // Testa getClubTitlesWonInSave
  testContext.window.syncAllTrophiesToMuseum = testContext.syncAllTrophiesToMuseum;
  vm.runInNewContext(trophiesSystemSource, testContext);

  // Avalia getClubTitlesWonInSave através de window.AFM_TrophiesTvMarketingPayroll ou do código carregado
  const wonList = testState.titles;
  if(!wonList.some(t => (t.name === 'Campeonato Candango' || t.title === 'Campeonato Candango') && Number(t.year) === 2026)){
    throw new Error('Título conquistado no comando (Campeonato Candango 2026) deve estar salvo em state.titles');
  }

  console.log('PASS: título do Campeonato Candango 2026 restaurado e exibido no museu e estante de taças com sucesso.');
}
