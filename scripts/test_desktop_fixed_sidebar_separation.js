// Teste de Verificação: Separação do Menu Fixo no PC vs Gaveta Deslizante no Mobile
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TESTE: MENU FIXO LATERAL NO PC vs GAVETA DESLIZANTE NO MOBILE ===');

const cssContent = fs.readFileSync(path.join(__dirname, '../css/app.css'), 'utf8');
const pwaCode = fs.readFileSync(path.join(__dirname, '../js/ui/pwa_and_landscape_enforcer.js'), 'utf8');

console.log('1. Verificando lógica de detecção de viewport em pwa_and_landscape_enforcer.js...');
// Avalia a função isAFMMobileViewport em ambiente simulado
const mockWindowPC = { innerWidth: 1920, innerHeight: 700 };
const mockWindowLaptop = { innerWidth: 1366, innerHeight: 650 };
const mockWindowMobileLandscape = { innerWidth: 844, innerHeight: 390 };
const mockWindowMobilePortrait = { innerWidth: 390, innerHeight: 844 };

const pwaFn = new Function('window', 'document', pwaCode);
const mockEnv = { innerWidth: 1920, addEventListener: () => {} };
pwaFn(mockEnv, { readyState: 'complete', addEventListener: () => {}, getElementById: () => null });

assert(typeof mockEnv.isAFMMobileViewport === 'function', 'isAFMMobileViewport deve estar disponível');

// Testa PC Full HD
mockEnv.innerWidth = 1920;
assert.strictEqual(mockEnv.isAFMMobileViewport(), false, '1920px deve ser PC (false)');

// Testa Laptop 1366px
mockEnv.innerWidth = 1366;
assert.strictEqual(mockEnv.isAFMMobileViewport(), false, '1366px deve ser PC (false)');

// Testa Desktop 1080px
mockEnv.innerWidth = 1080;
assert.strictEqual(mockEnv.isAFMMobileViewport(), false, '1080px deve ser PC (false)');

// Testa Mobile Landscape (ex: iPhone 14 Pro Max 932px)
mockEnv.innerWidth = 932;
assert.strictEqual(mockEnv.isAFMMobileViewport(), true, '932px deve ser Mobile (true)');

// Testa Mobile Portrait (ex: 390px)
mockEnv.innerWidth = 390;
assert.strictEqual(mockEnv.isAFMMobileViewport(), true, '390px deve ser Mobile (true)');

console.log('✓ Detecção de viewport validada com 100% de precisão (PC >= 1025px / Mobile <= 1024px)!');

console.log('2. Verificando regras de CSS para Desktop (min-width: 1025px)...');
assert(cssContent.includes('@media screen and (min-width: 1025px)'), 'Deve conter bloco exclusivo para desktop >= 1025px');
assert(cssContent.includes('grid-template-columns: 240px minmax(0, 1fr) !important'), 'Layout deve ter coluna de 240px para o menu e 1fr para o conteúdo no PC');
assert(cssContent.includes('position: static !important'), 'Menu lateral no PC deve ser estático (nunca fixed)');
assert(cssContent.includes('.sm-drawer-header,'), 'Cabeçalho do drawer mobile deve estar oculto no PC');
assert(cssContent.includes('.sm-btn-hamburger,'), 'Botão hambúrguer deve estar oculto no PC');
assert(cssContent.includes('flex-direction: column !important'), 'Navegação lateral no PC deve ser coluna vertical única');

console.log('3. Verificando que media queries mobile não afetam telas de PC...');
// Garante que o bloco de compactação mobile não ative em PC com altura <= 750px
assert(!cssContent.includes('@media screen and (max-height: 650px), screen and (max-width: 1080px), screen and (orientation: landscape) and (max-height: 750px)'), 'Media query ambígua que quebrava PC em landscape não deve existir');
assert(cssContent.includes('@media screen and (max-width: 1024px) {'), 'Compactação mobile deve ser estritamente limitada a max-width: 1024px');

console.log('=== TODOS OS TESTES PASSARAM COM SUCESSO! ===');
