const fs = require('fs');

console.log('--- Integrating Coach Ranking & PIX Prize System ---');

// 1. UPDATE index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
if (!indexHtml.includes('js/systems/coach_ranking_pix.js')) {
  const target = '<script src="js/systems/global_ranking_and_confidence.js"></script>';
  if (!indexHtml.includes(target)) {
    console.error('Target not found in index.html:', target);
    process.exit(1);
  }
  const replacement = target + '\n<script src="js/systems/coach_ranking_pix.js"></script>';
  indexHtml = indexHtml.replace(target, replacement);
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('✓ index.html updated with coach_ranking_pix.js');
} else {
  console.log('index.html already includes coach_ranking_pix.js');
}

// 2. UPDATE js/game.js
let gameCode = fs.readFileSync('js/game.js', 'utf8');

// A. In shell(): Add ranking to drawer nav
const oldDrawerNav = `              ['carreira','💼 Carreira do Treinador'],
              ['temporada','🏆 Temporada'],`;

const newDrawerNav = `              ['carreira','💼 Carreira do Treinador'],
              ['ranking','👑 Ranking & PIX R$ 1.000'],
              ['temporada','🏆 Temporada'],`;

if (gameCode.includes(oldDrawerNav)) {
  gameCode = gameCode.replace(oldDrawerNav, newDrawerNav);
  console.log('✓ Drawer nav updated with Ranking item');
} else if (!gameCode.includes("['ranking',")) {
  console.warn('Could not find exact drawer nav target');
}

// B. In shell(): Add ranking pill to sm-task-ribbon
const oldRibbon = `<button type="button" class="sm-ribbon-pill \${view==='carreira'?'active':''}" data-view="carreira">🎯 Carreira</button>`;
const newRibbon = `<button type="button" class="sm-ribbon-pill \${view==='carreira'?'active':''}" data-view="carreira">🎯 Carreira</button>
        <button type="button" class="sm-ribbon-pill sm-ribbon-pix \${view==='ranking'?'active':''}" data-view="ranking" title="Ranking Oficial de Técnicos & Premiação PIX R$ 1.000" style="background:\${view==='ranking'?'#059669':'rgba(16,185,129,0.18)'};border:1px solid #10b981;color:#a7f3d0;font-weight:900">💠 Ranking PIX R$ 1.000</button>`;

if (gameCode.includes(oldRibbon) && !gameCode.includes('sm-ribbon-pix')) {
  gameCode = gameCode.replace(oldRibbon, newRibbon);
  console.log('✓ Task ribbon updated with Ranking PIX pill');
}

// C. In page(): Add ranking view
const oldPageRoutes = `    escritorio:officePage,
    carreira:careerPage,
    temporada:seasonPage,`;

const newPageRoutes = `    escritorio:officePage,
    carreira:careerPage,
    ranking:(typeof rankingPage === 'function' ? rankingPage : (window.AFM_CoachRanking ? () => window.AFM_CoachRanking.renderPage() : centralPage)),
    temporada:seasonPage,`;

if (gameCode.includes(oldPageRoutes)) {
  gameCode = gameCode.replace(oldPageRoutes, newPageRoutes);
  console.log('✓ page() router updated with rankingPage');
} else if (!gameCode.includes('ranking:')) {
  console.warn('Could not find page() router target');
}

// D. In bind(): Add ranking event binding and prestige badge click
const oldOfficeCareer = `  const btnOfficeCareer = $('#btnOpenCareerEconomyFromOffice');`;
const newOfficeCareer = `  // Navegação rápida para o Ranking de Técnicos pelo badge de prestígio no topo
  const btnTopPrestige = $('#btnTopQuickPrestigeCard');
  if(btnTopPrestige){
    btnTopPrestige.onclick = () => {
      view = 'ranking';
      render();
    };
  }
  const btnTopPrestigeAdd = $('#btnTopQuickPrestige');
  if(btnTopPrestigeAdd){
    btnTopPrestigeAdd.onclick = (e) => {
      e.stopPropagation();
      view = 'ranking';
      render();
    };
  }

  // Eventos da tela de Ranking
  if(view === 'ranking' && window.AFM_CoachRanking && typeof window.AFM_CoachRanking.bindRankingEvents === 'function'){
    window.AFM_CoachRanking.bindRankingEvents();
  }

  const btnOfficeCareer = $('#btnOpenCareerEconomyFromOffice');`;

if (gameCode.includes(oldOfficeCareer) && !gameCode.includes('btnTopPrestige')) {
  gameCode = gameCode.replace(oldOfficeCareer, newOfficeCareer);
  console.log('✓ bind() updated with ranking event handlers');
}

// E. In finalizeRound(): Update coach ranking points
const oldFinalizeRanking = `    if(window.AFM_GlobalRanking && typeof window.AFM_GlobalRanking.updateConfidenceAfterMatch === 'function'){`;
const newFinalizeRanking = `    if(window.AFM_CoachRanking && typeof window.AFM_CoachRanking.onMatchFinished === 'function'){
      window.AFM_CoachRanking.onMatchFinished(state, userRes);
    }
    if(window.AFM_GlobalRanking && typeof window.AFM_GlobalRanking.updateConfidenceAfterMatch === 'function'){`;

if (gameCode.includes(oldFinalizeRanking) && !gameCode.includes('AFM_CoachRanking.onMatchFinished')) {
  gameCode = gameCode.replace(oldFinalizeRanking, newFinalizeRanking);
  console.log('✓ finalizeRound() updated with AFM_CoachRanking.onMatchFinished');
}

fs.writeFileSync('js/game.js', gameCode, 'utf8');
console.log('✓ js/game.js saved successfully');

// 3. UPDATE css/app.css
let cssCode = fs.readFileSync('css/app.css', 'utf8');

const rankingStyles = `
/* =============================================================
   ESTILOS OFICIAIS RANKING DE TÉCNICOS & PREMIAÇÃO PIX R$ 1.000
   ============================================================= */
.afm-ranking-page {
  animation: fadeIn 0.2s ease-in-out;
}

@media (min-width: 1024px) {
  .afm-ranking-layout {
    grid-template-columns: minmax(0, 1fr) 340px !important;
  }
  .desktop-only {
    display: inline !important;
  }
}

@media (min-width: 1280px) {
  .afm-ranking-layout {
    grid-template-columns: minmax(0, 1fr) 380px !important;
  }
}

.afm-podium-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.afm-podium-card:hover {
  transform: translateY(-4px);
}

.afm-podium-card.center-champion {
  background: linear-gradient(180deg, #1e1338 0%, #111827 100%) !important;
  border: 2px solid #facc15 !important;
}

.afm-tab-btn {
  transition: all 0.15s ease;
}

.afm-tab-btn:hover {
  background: #1e293b !important;
}

.afm-tab-btn.active:hover {
  background: #7c3aed !important;
}

.afm-ranking-row:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.afm-ranking-row.user-highlight {
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
}

.sm-ribbon-pix {
  animation: pulseNeonGlow 3s infinite alternate;
}

@keyframes pulseNeonGlow {
  0% { box-shadow: 0 0 4px rgba(16, 185, 129, 0.3); }
  100% { box-shadow: 0 0 12px rgba(16, 185, 129, 0.7); }
}
`;

if (!cssCode.includes('afm-ranking-page')) {
  cssCode += '\n' + rankingStyles;
  fs.writeFileSync('css/app.css', cssCode, 'utf8');
  console.log('✓ css/app.css updated with ranking styles');
} else {
  console.log('css/app.css already has ranking styles');
}

console.log('--- All ranking integrations completed successfully! ---');
