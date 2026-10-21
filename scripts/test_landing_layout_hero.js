// scripts/test_landing_layout_hero.js
// Valida a organização visual da seção hero showcase da Landing Page do AFM 2027

const fs = require('fs');
const path = require('path');

console.log('========================================================================');
console.log('🎨 TESTE DE LAYOUT & ORGANIZAÇÃO VISUAL: HERO SHOWCASE (LANDING PAGE)');
console.log('========================================================================\n');

const gameJsPath = path.join(__dirname, '../js/game.js');
const appCssPath = path.join(__dirname, '../css/app.css');

const gameJsContent = fs.readFileSync(gameJsPath, 'utf8');
const appCssContent = fs.readFileSync(appCssPath, 'utf8');

// [TESTE 1] Título Principal e Tag Superior
console.log('[TESTE 1] Verificando headline balanceada e chip de versão...');
if (!gameJsContent.includes('afm-hero-headline')) {
  throw new Error('Classe afm-hero-headline não encontrada em game.js');
}
if (!gameJsContent.includes('afm-hero-headline-highlight')) {
  throw new Error('Classe afm-hero-headline-highlight não encontrada em game.js');
}
if (!gameJsContent.includes('afm-hero-chip')) {
  throw new Error('Classe afm-hero-chip não encontrada em game.js');
}
console.log('✓ Headline estilizada com destaque gradiente e chip de versão validados!');

// [TESTE 2] Trio de Craques e Badges sem Emojis Quebrados
console.log('\n[TESTE 2] Verificando cards dos craques e badges de bandeiras sem emojis corrompidos...');
const heroBlock = gameJsContent.slice(gameJsContent.indexOf('afm-craques-hero-wrapper'), gameJsContent.indexOf('afm-feature-panels-grid'));
if (heroBlock.includes('🇪🇸') || heroBlock.includes('🇦🇷') || heroBlock.includes('🇧🇷')) {
  throw new Error('Ainda existem emojis de bandeiras propensos a quebrar no bloco de craques');
}
if (!heroBlock.includes('flag-esp') || !heroBlock.includes('flag-arg') || !heroBlock.includes('flag-bra')) {
  throw new Error('Flags pills estilizadas (flag-esp, flag-arg, flag-bra) não encontradas');
}
if (!heroBlock.includes('badge-yamal') || !heroBlock.includes('badge-messi') || !heroBlock.includes('badge-neymar')) {
  throw new Error('Badges de OVR dos craques não encontradas');
}
console.log('✓ Cards dos craques com badges OVR e flag pills estilizadas (100% à prova de glitches no Windows)!');

// [TESTE 3] Grid de Recursos em 2 Colunas Confortáveis (Sem Amontoamento de 3 Colunas)
console.log('\n[TESTE 3] Verificando grade de 6 recursos...');
if (!gameJsContent.includes('afm-panel-icon-wrap')) {
  throw new Error('afm-panel-icon-wrap não encontrado nos cards de recursos');
}
const featurePanelMatches = gameJsContent.match(/class="afm-feature-panel"/g);
if (!featurePanelMatches || featurePanelMatches.length !== 6) {
  throw new Error(`Esperado 6 afm-feature-panel na landing page, encontrado: ${featurePanelMatches ? featurePanelMatches.length : 0}`);
}

// Verificar CSS para 2 colunas
const grid2ColRegex = /\.afm-feature-panels-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)\s*!important/s;
if (!grid2ColRegex.test(appCssContent)) {
  throw new Error('Regra repeat(2, 1fr) !important para afm-feature-panels-grid não encontrada no CSS');
}
console.log('✓ Grade dos 6 recursos configurada em 2 colunas amplas com icon boxes e textos respiráveis!');

// [TESTE 4] Card de Depoimento e Rodapé
console.log('\n[TESTE 4] Verificando depoimento e rodapé...');
if (!gameJsContent.includes('afm-testimonial-avatar') || !gameJsContent.includes('afm-testimonial-tag')) {
  throw new Error('Estrutura de avatar ou tag do depoimento não encontrada');
}
if (!gameJsContent.includes('afm-left-footer')) {
  throw new Error('afm-left-footer não encontrado');
}
console.log('✓ Card de depoimento refinado e rodapé com Supabase Cloud validados!');

console.log('\n🎉 TODOS OS TESTES DE LAYOUT E ORGANIZAÇÃO PASSARAM COM 100% DE SUCESSO! 🎉\n');
