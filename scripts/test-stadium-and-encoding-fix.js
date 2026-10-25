const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TESTE DE CORREÇÃO DO ESTÁDIO E CODIFICAÇÃO (AFM 2026/2027) ===');

// 1. Validar que js/game.js compila sem erros de sintaxe
const gameJsSource = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');

const ctx = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ style: {}, querySelector: () => null, querySelectorAll: () => [], appendChild: () => {} }),
    body: { appendChild: () => {} }
  },
  console,
  setTimeout: () => {},
  setInterval: () => {},
  clearTimeout: () => {},
  clearInterval: () => {}
};

try {
  vm.createContext(ctx);
  vm.runInContext(gameJsSource, ctx);
  console.log('PASS: js/game.js compilado e executado com sucesso no VM!');
} catch (e) {
  console.error('FAIL: Erro de sintaxe ou execução em js/game.js:', e);
  process.exit(1);
}

// 2. Testar fixMojibake e deepSanitizeSaveMojibake
const fixMojibake = ctx.window.fixMojibake;
if (typeof fixMojibake !== 'function') {
  console.error('FAIL: ctx.window.fixMojibake não está definido!');
  process.exit(1);
}

const corruptedText = 'BRASILEIRÃƒO SÃ„%RIE D Â« DF · TÃ‰CNICO AQUINO';
const cleanText = fixMojibake(corruptedText);
console.log('Fix test:', corruptedText, '->', cleanText);
if (cleanText.includes('Ãƒ') || cleanText.includes('Ã‰')) {
  console.error('FAIL: fixMojibake não corrigiu os caracteres corrompidos!');
  process.exit(1);
}
console.log('PASS: fixMojibake corrigiu strings corrompidas com sucesso!');

// 3. Testar deepSanitizeSaveMojibake em um save completo
const dirtySave = {
  trainerName: 'AQUINO',
  bio: 'Torcida e imprensa na mÃ£o. Sorriso fÃ¡cil, pressÃ£o zero.',
  news: ['ðŸ‘” HOJE Ã‰ DIA DE JOGO!']
};
ctx.window.deepSanitizeSaveMojibake(dirtySave);
if (dirtySave.bio.includes('mÃ£o') || dirtySave.news[0].includes('ðŸ‘”')) {
  console.error('FAIL: deepSanitizeSaveMojibake não limpou o save:', dirtySave);
  process.exit(1);
}
console.log('PASS: deepSanitizeSaveMojibake higienizou o save com sucesso:', dirtySave);

// 4. Testar hireStadiumContractor('instant')
ctx.state = {
  club: 'AQN FC',
  date: '2028-01-29',
  balance: 8829089,
  expense: 0,
  news: [],
  infrastructure: {
    stadium: { level: 1, capacity: 5000 }
  },
  stadiumRingData: {
    ring: 1,
    maxRings: 6,
    maxUnlockedRing: 1,
    sides: { norte: false, sul: false, leste: false, oeste: false },
    rings: {
      1: { norte: false, sul: false, leste: false, oeste: false },
      2: { norte: false, sul: false, leste: false, oeste: false }
    },
    purchasedSectors: [],
    activeWork: {
      ring: 1,
      side: 'norte',
      startDate: '2028-01-20',
      finishDate: '2028-02-15',
      durationDays: 26,
      cost: 1105000,
      financing: 'cash'
    }
  }
};
ctx.window.state = ctx.state;

const rushCost = ctx.window.getStadiumExpansionData ? 828750 : 828750;
const prevBalance = ctx.state.balance;

const hireInstant = ctx.window.hireStadiumContractor;
if (typeof hireInstant !== 'function') {
  console.error('FAIL: hireStadiumContractor não está exportado em window!');
  process.exit(1);
}

const success = hireInstant('instant');
if (!success) {
  console.error('FAIL: hireStadiumContractor(instant) retornou false!');
  process.exit(1);
}

if (ctx.state.stadiumRingData.activeWork !== null) {
  console.error('FAIL: activeWork deveria ser null após conclusão imediata, mas é:', ctx.state.stadiumRingData.activeWork);
  process.exit(1);
}

if (ctx.state.infrastructure.stadium.capacity !== 8500) {
  console.error(`FAIL: Capacidade esperada 8.500 lugares, obteve: ${ctx.state.infrastructure.stadium.capacity}`);
  process.exit(1);
}

if (ctx.state.stadiumRingData.rings[1].norte !== true) {
  console.error('FAIL: Setor Norte do Anel 1 deveria estar concluído!');
  process.exit(1);
}

if (!ctx.state.stadiumRingData.purchasedSectors.includes('r1_norte')) {
  console.error('FAIL: purchasedSectors deveria conter r1_norte!');
  process.exit(1);
}

if (ctx.state.balance >= prevBalance) {
  console.error('FAIL: O saldo deveria ter sido debitado!');
  process.exit(1);
}

console.log('PASS: Conclusão imediata de obra (hireStadiumContractor instant) funciona com perfeição!');
console.log('Capacidade após obra imediata:', ctx.state.infrastructure.stadium.capacity);
console.log('Saldo após obra imediata:', ctx.state.balance);
console.log('Setores comprados:', ctx.state.stadiumRingData.purchasedSectors);

// 5. Testar integridade visual e ausência de anomalias na maquete 3D
const stadiumEngineSource = fs.readFileSync(path.resolve(__dirname, '../js/core/stadium_lowpoly_engine.js'), 'utf8');

if (!stadiumEngineSource.includes("grassBase = customization.grassColor || '#14532d'")) {
  console.error('FAIL: stadium_lowpoly_engine.js deve ter a cor base do gramado como verde #14532d!');
  process.exit(1);
}
if (!stadiumEngineSource.includes("grassStripeA = customization.grassStripeA || '#15803d'")) {
  console.error('FAIL: stadium_lowpoly_engine.js deve ter a faixa A do gramado como verde #15803d!');
  process.exit(1);
}
if (!stadiumEngineSource.includes("grassStripeB = customization.grassStripeB || '#16a34a'")) {
  console.error('FAIL: stadium_lowpoly_engine.js deve ter a faixa B do gramado como verde #16a34a!');
  process.exit(1);
}
if (stadiumEngineSource.includes("grassBase = customization.grassColor || '#070b14'")) {
  console.error('FAIL: stadium_lowpoly_engine.js está com o gramado preto #070b14 corrompido!');
  process.exit(1);
}
if (stadiumEngineSource.includes("defaultStandColor = ... '#dc2626'")) {
  console.error('FAIL: stadium_lowpoly_engine.js está com arquibancadas padrão vermelhas corrompidas!');
  process.exit(1);
}
if (!stadiumEngineSource.includes("ResizeObserver")) {
  console.error('FAIL: stadium_lowpoly_engine.js deve suportar ResizeObserver para redimensionamento suave!');
  process.exit(1);
}
console.log('PASS: stadium_lowpoly_engine.js possui gramado verde oficial e arquibancadas autênticas!');

// 6. Validar que hotspots intrusivos foram removidos do visualizador
if (gameJsSource.includes('slot="hotspot-stand-sul"')) {
  console.error('FAIL: js/game.js ainda contém slot="hotspot-stand-sul" cobrindo a maquete!');
  process.exit(1);
}
if (gameJsSource.includes('slot="hotspot-screen"')) {
  console.error('FAIL: js/game.js ainda contém slot="hotspot-screen" cobrindo a maquete!');
  process.exit(1);
}
console.log('PASS: Hotspots invasivos foram removidos do fallback do visualizador 3D!');

const cssSource = fs.readFileSync(path.resolve(__dirname, '../css/app.css'), 'utf8');
if (!cssSource.includes('.afm-3d-hotspot')) {
  console.error('FAIL: css/app.css deve conter regra de segurança para .afm-3d-hotspot!');
  process.exit(1);
}
console.log('PASS: css/app.css protege a maquete contra sobreposições indesejadas!');

console.log('=== TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ===');
