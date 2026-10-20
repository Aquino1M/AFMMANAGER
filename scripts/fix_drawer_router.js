const fs = require('fs');

let game = fs.readFileSync('js/game.js', 'utf8');

// 1. Drawer nav
if (!game.includes("['ranking',")) {
  const target = "['carreira','💼 Carreira do Treinador'],";
  const repl = "['carreira','💼 Carreira do Treinador'],\r\n              ['ranking','👑 Ranking & PIX R$ 1.000'],";
  game = game.replace(target, repl);
  console.log('✓ Drawer nav updated');
} else {
  console.log('Drawer nav already has ranking');
}

// 2. page() router
if (!game.includes('ranking:')) {
  const target = 'carreira:careerPage,';
  const repl = 'carreira:careerPage,\r\n    ranking:(typeof rankingPage === \'function\' ? rankingPage : (window.AFM_CoachRanking ? () => window.AFM_CoachRanking.renderPage() : centralPage)),';
  game = game.replace(target, repl);
  console.log('✓ page() router updated');
} else {
  console.log('page() router already has ranking');
}

fs.writeFileSync('js/game.js', game, 'utf8');
console.log('✓ js/game.js updated cleanly!');
