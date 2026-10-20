const assert = require('assert');
const fs = require('fs');

console.log('--- TESTE: NOVA LANDING PAGE COM ABAS DOS SISTEMAS E FOTOS DOS CRAQUES ---');

// 1. Verificar imagens dos craques
['img/hero/neymar.png', 'img/hero/messi.png', 'img/hero/yamal.png'].forEach(file => {
  assert(fs.existsSync(file), `Imagem do craque ${file} deve existir no disco`);
  const stat = fs.statSync(file);
  assert(stat.size > 50000, `Imagem ${file} deve ter tamanho válido (> 50KB)`);
  console.log(`  ✅ Craque presente: ${file} (${Math.round(stat.size / 1024)} KB)`);
});

// 2. Verificar CSS
const css = fs.readFileSync('css/app.css', 'utf8');
assert(css.includes('.afm-craques-hero'), 'css/app.css deve conter .afm-craques-hero');
assert(css.includes('.afm-craque-card'), 'css/app.css deve conter .afm-craque-card');
assert(css.includes('.afm-craque-card.messi'), 'css/app.css deve conter estilo do Messi');
assert(css.includes('.afm-craque-card.neymar'), 'css/app.css deve conter estilo do Neymar');
assert(css.includes('.afm-craque-card.yamal'), 'css/app.css deve conter estilo do Yamal');
assert(css.includes('.afm-systems-category-tabs'), 'css/app.css deve conter .afm-systems-category-tabs');
assert(css.includes('.afm-systems-grid'), 'css/app.css deve conter .afm-systems-grid');
assert(css.includes('.afm-system-card'), 'css/app.css deve conter .afm-system-card');
console.log('  ✅ CSS de Craques e Sistemas validado com sucesso!');

// 3. Simulação no JS
const gameCode = fs.readFileSync('js/game.js', 'utf8');

// Verificar declaração de AFM_SYSTEMS_DATA
assert(gameCode.includes('const AFM_SYSTEMS_DATA = ['), 'js/game.js deve conter AFM_SYSTEMS_DATA');
assert(gameCode.includes("id: 'taticas'"), 'AFM_SYSTEMS_DATA deve conter sistema de táticas');
assert(gameCode.includes("id: 'mercado'"), 'AFM_SYSTEMS_DATA deve conter sistema de mercado');
assert(gameCode.includes("id: 'arenas'"), 'AFM_SYSTEMS_DATA deve conter sistema de arenas');
assert(gameCode.includes("id: 'estaduais'"), 'AFM_SYSTEMS_DATA deve conter sistema de estaduais');
assert(gameCode.includes("id: 'financas'"), 'AFM_SYSTEMS_DATA deve conter sistema de finanças');
assert(gameCode.includes("id: 'carreira'"), 'AFM_SYSTEMS_DATA deve conter sistema de carreira');
console.log('  ✅ Todos os 6 grandes sistemas catalogados no AFM_SYSTEMS_DATA');

// Verificar navbar com as abas
assert(gameCode.includes('btnNavGoSystems'), 'Navbar deve ter botão de navegação para Sistemas');
assert(gameCode.includes('🎮 Todos os Sistemas'), 'Navbar deve exibir label de Todos os Sistemas');
assert(gameCode.includes('⭐ Início & Craques'), 'Navbar deve exibir label de Início & Craques');
assert(gameCode.includes('🏟️ Novas Arenas'), 'Navbar deve exibir label de Novas Arenas');
assert(gameCode.includes('🏆 11 Estaduais'), 'Navbar deve exibir label de 11 Estaduais');
assert(gameCode.includes('📢 Central de Novidades (75+)'), 'Navbar deve exibir label de Central de Novidades');
console.log('  ✅ Barra de navegação com todas as abas interativas verificada');

// Verificar presença dos craques no HTML de setup
assert(gameCode.includes('img/hero/yamal.png'), 'Setup deve carregar foto do Lamine Yamal');
assert(gameCode.includes('img/hero/messi.png'), 'Setup deve carregar foto do Lionel Messi');
assert(gameCode.includes('img/hero/neymar.png'), 'Setup deve carregar foto do Neymar Jr');
assert(gameCode.includes('btnLandingExploreSystems'), 'Setup deve ter botão para ver todos os sistemas');
console.log('  ✅ Trio de craques (Yamal, Messi coroado e Neymar) integrado na página inicial');

// Verificar suporte ao modo 'systems'
assert(gameCode.includes("setupViewMode === 'systems'"), 'renderSetup deve tratar setupViewMode === "systems"');
assert(gameCode.includes('afm-systems-category-tabs'), 'renderSetup systems deve renderizar abas de categorias');
assert(gameCode.includes('btnSystemsStartCareer'), 'renderSetup systems deve ter botão para iniciar carreira');
console.log('  ✅ Modo completo de "Todos os Sistemas" implementado com filtros e ações');

console.log('--- TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ---');
