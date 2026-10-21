/**
 * Teste de Calibração: Separação de Experiência PC x Mobile em Todas as Abas
 */

const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando teste de calibração PC x Mobile em todas as abas...');

const css = fs.readFileSync('css/app.css', 'utf8');

// 1. Verifica se a regra de mobile landscape existe e contempla as abas principais
assert(css.includes('@media screen and (max-height: 600px), screen and (orientation: landscape) and (max-height: 650px)'), 'Media query de mobile landscape deve existir');
console.log('✓ Media query de mobile landscape identificada.');

// 2. Verifica se a Central possui regra de grid adaptativa no mobile
assert(css.includes('.central-dashboard-grid {') && css.includes('grid-template-columns: minmax(260px, 1fr) minmax(320px, 1.6fr) !important;'), 'Central deve ter grid de 2 colunas adaptativa no mobile landscape');
console.log('✓ Aba Central calibrada para mobile landscape (2 colunas adaptativas).');

// 3. Verifica se Meu Time & Tática possui altura e grid adaptativa no mobile
assert(css.includes('.tactics-modal-container {') && css.includes('min-height: 380px !important;'), 'Meu Time deve ter altura adaptativa no mobile landscape');
console.log('✓ Aba Meu Time & Tática calibrada para mobile landscape (altura e campo ajustados).');

// 4. Verifica se Tabelas e Elenco possuem rolagem horizontal touch
assert(css.includes('.tablewrap {') && css.includes('-webkit-overflow-scrolling: touch !important;'), 'Tabelas devem ter rolagem horizontal touch');
console.log('✓ Aba Elenco e tabelas calibradas com rolagem horizontal touch.');

// 5. Verifica a SEPARAÇÃO EXPLÍCITA NO PC (largura >= 1025px)
assert(css.includes('@media (min-width: 1025px)'), 'Media query de separação do PC deve existir');
assert(css.includes('.sm-drawer-close {\n    display: none !important;'), 'Botão X do menu lateral deve estar oculto no PC');
console.log('✓ Separação do PC: Botão X ocultado no Desktop.');

// 6. Verifica que a Central e Meu Time no PC preservam 3 colunas e altura completa
assert(css.includes('grid-template-columns: 280px minmax(0, 1.8fr) 300px !important;'), 'Central no PC preserva 3 colunas');
assert(css.includes('height: calc(100vh - 210px) !important;'), 'Meu Time no PC preserva altura ampla de widescreen');
console.log('✓ Separação do PC: Central e Meu Time preservam experiência widescreen de desktop.');

console.log('🎉 TODAS AS VERIFICAÇÕES DE SEPARAÇÃO E CALIBRAÇÃO PC x MOBILE PASSARAM!');
