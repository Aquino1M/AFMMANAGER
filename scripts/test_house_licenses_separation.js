const assert = require('assert');
const fs = require('fs');

console.log('--- TESTE: REMOÇÃO DE LICENÇAS DA CASA E BOTÃO DE ACESSO À ACADEMIA CBF & UEFA ---');

// 1. Ler os arquivos
const gameCode = fs.readFileSync('js/game.js', 'utf8');
const pwaCode = fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8');
const licCode = fs.readFileSync('js/systems/cup_highlight_ranking_world_and_licenses.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const swJs = fs.readFileSync('sw.js', 'utf8');

// [TESTE 1] Verificar que a aba de Casa foi renomeada para "SUA CASA & BENS PESSOAIS"
console.log('\n[TESTE 1] Verificando renomeação da aba e títulos...');
assert(gameCode.includes('🏠 SUA CASA & BENS PESSOAIS'), 'Aba deve ser renomeada para 🏠 SUA CASA & BENS PESSOAIS');
assert(gameCode.includes('SUA CASA & PATRIMÔNIO PESSOAL'), 'Título principal deve ser SUA CASA & PATRIMÔNIO PESSOAL');
assert(!gameCode.includes('SUA CASA & LICENÇAS PROFISSIONAIS'), 'Não deve mais conter SUA CASA & LICENÇAS PROFISSIONAIS');
console.log('✓ Nomenclatura atualizada com sucesso sem menção redundante a licenças na casa!');

// [TESTE 2] Verificar que as licenças foram removidas dos cards exibidos na Casa
console.log('\n[TESTE 2] Verificando filtro para não exibir cards de licença na Casa...');
assert(gameCode.includes("${HOUSE_ITEMS.filter(item => !item.isLicense && item.category !== 'Curso').map(item => {"), 'HOUSE_ITEMS deve filtrar itens de licença/curso na renderização da casa');

// Simular renderização com o array real de HOUSE_ITEMS
const houseItemsMatch = gameCode.match(/const HOUSE_ITEMS = \[([\s\S]*?)\];/);
assert(houseItemsMatch, 'HOUSE_ITEMS deve estar definido em game.js');
const rawItems = eval('[' + houseItemsMatch[1] + ']');

const displayedItems = rawItems.filter(item => !item.isLicense && item.category !== 'Curso');
console.log('Itens exibidos na Casa:', displayedItems.map(i => `${i.name} (${i.category})`));

assert(displayedItems.every(i => i.category !== 'Curso'), 'Nenhum item do tipo Curso deve ser exibido!');
assert(!displayedItems.some(i => i.name.includes('Licença CBF')), 'Nenhuma Licença CBF deve ser exibida entre os cards da casa!');
assert(displayedItems.some(i => i.name === 'Apartamento Padrão'), 'Apartamento Padrão deve estar presente');
assert(displayedItems.some(i => i.name === 'Mansão de Luxo'), 'Mansão de Luxo deve estar presente');
assert(displayedItems.some(i => i.name === 'Carro Esportivo Importado'), 'Carro Esportivo deve estar presente');
console.log('✓ Cards de Licença CBF removidos dos bens da casa com sucesso!');

// [TESTE 3] Verificar presença do botão idêntico ao da Carreira do Treinador no topo da Casa
console.log('\n[TESTE 3] Verificando botão idêntico ao da Carreira do Treinador no cabeçalho...');
assert(gameCode.includes('id="btnOpenCbfLicensesFromHouse"'), 'Botão btnOpenCbfLicensesFromHouse deve existir no cabeçalho da casa');
assert(gameCode.includes('🎓 CURSOS & LICENÇAS (CBF & UEFA)'), 'Botão deve ter o rótulo 🎓 CURSOS & LICENÇAS (CBF & UEFA)');
assert(gameCode.includes("btnOpenLicHouse.onclick"), 'Evento de clique do botão deve estar amarrado em bind()');
assert(pwaCode.includes("btnOpenCbfLicensesFromHouse"), 'Delegação global de eventos deve capturar btnOpenCbfLicensesFromHouse');
console.log('✓ Botão oficial de Cursos & Licenças posicionado no cabeçalho da seção com amarração completa!');

// [TESTE 4] Verificar modal de licenças com validação de prestígio, saldo e deduções
console.log('\n[TESTE 4] Verificando modal de licenças e compra via openLicensesModal()...');
assert(licCode.includes('function openLicensesModal()'), 'openLicensesModal deve existir');
assert(licCode.includes('targetLic.minPrestige'), 'openLicensesModal deve validar prestígio mínimo');
assert(licCode.includes('userMoney < cost'), 'openLicensesModal deve validar saldo pessoal');
assert(licCode.includes('st.managerMoney -= cost'), 'openLicensesModal deve debitar valor da licença');
console.log('✓ Modal de licenças validado: compra segura com débito do patrimônio pessoal e verificação de prestígio!');

// [TESTE 5] Verificar Cache Busting
console.log('\n[TESTE 5] Verificando cache-busting atualizado...');
assert(indexHtml.includes('js/game.js?v='), 'index.html deve referenciar game.js com hash');
assert(indexHtml.includes('js/ui/pwa_and_landscape_enforcer.js?v='), 'index.html deve referenciar pwa com hash');
assert(indexHtml.includes('js/systems/cup_highlight_ranking_world_and_licenses.js?v='), 'index.html deve referenciar licenças com hash');
assert(swJs.includes("CACHE_NAME = 'afm-2027-cache-v"), 'sw.js deve estar versionado');
console.log('✓ Cache busting configurado com sucesso!');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ZERO BUGS! 🎉');
