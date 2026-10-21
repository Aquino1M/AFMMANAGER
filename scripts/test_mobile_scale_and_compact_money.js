// scripts/test_mobile_scale_and_compact_money.js
// Valida o dinheiro compacto (ex: R$ 2,8M) e a escala otimizada para mobile landscape

const fs = require('fs');
const path = require('path');
global.window = global;

console.log('========================================================================');
console.log('📱 TESTE DE ESCALA MOBILE & FORMATAÇÃO COMPACTA DE DINHEIRO NO PAINEL');
console.log('========================================================================\n');

const gameJsPath = path.join(__dirname, '../js/game.js');
const coachRankingPath = path.join(__dirname, '../js/systems/coach_ranking_pix.js');
const appCssPath = path.join(__dirname, '../css/app.css');

const gameJs = fs.readFileSync(gameJsPath, 'utf8');
const coachRankingJs = fs.readFileSync(coachRankingPath, 'utf8');
const appCss = fs.readFileSync(appCssPath, 'utf8');

// [TESTE 1] Função fmtCompactMoney
console.log('[TESTE 1] Testando a função fmtCompactMoney com diferentes valores...');
eval(gameJs.slice(gameJs.indexOf('const fmtMoney='), gameJs.indexOf('window.fmtCompactMoney = fmtCompactMoney;') + 42));

if (typeof fmtCompactMoney !== 'function') {
  throw new Error('fmtCompactMoney não foi definida como função');
}

const t1 = fmtCompactMoney(2800000);
console.log(`  2.800.000 -> "${t1}"`);
if (t1 !== 'R$ 2,8M') throw new Error(`Esperado 'R$ 2,8M', obtido '${t1}'`);

const t2 = fmtCompactMoney(15000000);
console.log(`  15.000.000 -> "${t2}"`);
if (t2 !== 'R$ 15M') throw new Error(`Esperado 'R$ 15M', obtido '${t2}'`);

const t3 = fmtCompactMoney(450000);
console.log(`  450.000 -> "${t3}"`);
if (t3 !== 'R$ 450K') throw new Error(`Esperado 'R$ 450K', obtido '${t3}'`);

const t4 = fmtCompactMoney(850);
console.log(`  850 -> "${t4}"`);
if (t4 !== 'R$ 850') throw new Error(`Esperado 'R$ 850', obtido '${t4}'`);

const t5 = fmtCompactMoney(1200000000);
console.log(`  1.200.000.000 -> "${t5}"`);
if (t5 !== 'R$ 1,2B') throw new Error(`Esperado 'R$ 1,2B', obtido '${t5}'`);

const t6 = fmtCompactMoney(-2800000);
console.log(`  -2.800.000 -> "${t6}"`);
if (t6 !== '-R$ 2,8M') throw new Error(`Esperado '-R$ 2,8M', obtido '${t6}'`);

console.log('✓ fmtCompactMoney validada com 100% de precisão nos formatos exatos solicitados pelo usuário!\n');

// [TESTE 2] Barra superior usando fmtCompactMoney
console.log('[TESTE 2] Verificando uso de fmtCompactMoney na barra superior...');
if (!gameJs.includes('cashValEl.textContent = fmtCompactMoney(state.balance);')) {
  throw new Error('Atualização em tempo real de saldo no topo não está usando fmtCompactMoney');
}
if (!gameJs.includes('${fmtCompactMoney(state.balance)}')) {
  throw new Error('Renderização inicial do shell no topo não está usando fmtCompactMoney');
}
console.log('✓ Painel do topo (sm-topbar) configurado para exibir o saldo compacto sem cortar!\n');

// [TESTE 3] Regras CSS de escala mobile landscape (Topbar e Fita)
console.log('[TESTE 3] Verificando regras CSS para mobile landscape no topo...');
if (!appCss.includes('.sm-topbar') || !appCss.includes('min-height: 40px !important;')) {
  throw new Error('Regra min-height: 40px para sm-topbar no mobile landscape não encontrada');
}
if (!appCss.includes('.sm-task-ribbon') || !appCss.includes('height: 28px !important;')) {
  throw new Error('Regra height: 28px para sm-task-ribbon no mobile landscape não encontrada');
}
console.log('✓ Topbar e Fita de Tarefas calibradas com altura enxuta para telas mobile landscape!\n');

// [TESTE 4] Regras CSS de escala da Página de Ranking In-Game
console.log('[TESTE 4] Verificando otimização do card de Ranking no mobile landscape...');
if (!coachRankingJs.includes('afm-ranking-user-title') || !coachRankingJs.includes('afm-ranking-stat-val')) {
  throw new Error('Classes semânticas de ranking não encontradas em coach_ranking_pix.js');
}
if (!appCss.includes('.afm-ingame-ranking-hero') || !appCss.includes('.afm-ranking-stat-val')) {
  throw new Error('Estilização de .afm-ingame-ranking-hero e .afm-ranking-stat-val não encontrada no CSS mobile');
}
console.log('✓ Card do Ranking redimensionado e calibrado para visualização harmônica no mobile!\n');

// [TESTE 5] Regras CSS da Tela de Calendário
console.log('[TESTE 5] Verificando otimização do Calendário no mobile landscape...');
if (!gameJs.includes('afm-calendar-windows') || !gameJs.includes('afm-window-desc')) {
  throw new Error('Classes afm-calendar-windows e afm-window-desc não encontradas em game.js');
}
if (!appCss.includes('.afm-window-desc') || !appCss.includes('display: none !important;')) {
  throw new Error('Ocultamento de descrições volumosas das janelas no mobile não configurado no CSS');
}
console.log('✓ Janelas de transferência do Calendário configuradas em modo fino/compacto no mobile!\n');

console.log('🎉 TODOS OS TESTES DE ESCALA MOBILE E FORMATAÇÃO DE DINHEIRO PASSARAM COM SUCESSO! 🎉\n');
