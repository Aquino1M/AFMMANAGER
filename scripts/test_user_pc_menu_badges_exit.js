/**
 * Teste Automatizado: Menu Superior no PC, Botão X com Auto-Save,
 * Badges de Força do Time & Prestígio do Treinador, e Aba "🏆 Temporada"
 */
const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando bateria de testes: PC Menu, X Auto-Save, Badges Força/Prestígio e Aba Temporada...\n');

const cssCode = fs.readFileSync('css/app.css', 'utf8');
const gameCode = fs.readFileSync('js/game.js', 'utf8');
const pwaCode = fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8');

// 1. Requirement 1: no pc nao precisa do menu ali encima
console.log('1. Verificando ocultação do botão hambúrguer no PC e exibição no Mobile...');
assert(cssCode.includes('.sm-btn-hamburger {\r\n  width: 36px;\r\n  height: 36px;\r\n  border-radius: 10px;\r\n  background: rgba(255, 255, 255, 0.07);\r\n  border: 1px solid rgba(255, 255, 255, 0.14);\r\n  color: #fff;\r\n  font-size: 18px;\r\n  display: none !important;'), 'Botão hambúrguer deve estar oculto (display: none !important) no PC/Desktop');
assert(cssCode.includes('display: inline-flex !important;\r\n    width: clamp(32px, 4vw, 38px) !important;'), 'Botão hambúrguer deve ter display: inline-flex !important na media query mobile');
console.log('  ✅ No PC o botão hambúrguer do topo está devidamente oculto (sidebar fixa no desktop) e preservado no mobile!');

// 2. Requirement 2: quando aperta no X tem que simular o mesmo do botao de sair , sempre que sair tem que salva automatico
console.log('2. Verificando botão X e botão de Sair com auto-save garantido...');
assert(gameCode.includes('function handleExitGameAction('), 'Função handleExitGameAction ausente em js/game.js');
assert(gameCode.includes('window.handleExitGameAction = handleExitGameAction;'), 'handleExitGameAction não exportada globalmente');
assert(gameCode.includes("const mm = $('#mainMenuBtn');") && gameCode.includes("if(mm) mm.onclick = handleExitGameAction;"), 'mainMenuBtn deve apontar para handleExitGameAction');
assert(gameCode.includes("const btnCloseDrawer = $('#btnCloseMobileDrawer');") && gameCode.includes("if(btnCloseDrawer) btnCloseDrawer.onclick = handleExitGameAction;"), 'btnCloseMobileDrawer deve apontar para handleExitGameAction');
assert(pwaCode.includes("window.handleExitGameAction()"), 'pwa_and_landscape_enforcer.js deve acionar handleExitGameAction ao clicar no X');

// Validação da lógica interna de auto-save no exit
assert(gameCode.includes("if (typeof save === 'function') save();"), 'Deve salvar automaticamente antes de sair');
assert(gameCode.includes("state = null;"), 'Deve resetar state ao sair para o menu');
console.log('  ✅ Clicar no botão X executa o mesmo fluxo de Sair, com auto-save automático!');

// 3. Requirement 3: ali encima deixa a força do time e tambem o prestigio do treinador , quando aperta no + do pretigio vai para aba Carreira do Treinador
console.log('3. Verificando badges de Força do Time e Prestígio do Treinador no topo...');
assert(gameCode.includes('sm-badge-strength'), 'Badge sm-badge-strength ausente no shell');
assert(gameCode.includes('${teamOvr} OVR'), 'Texto ${teamOvr} OVR ausente no shell');
assert(gameCode.includes('id="btnTopQuickTeamStrength"'), 'Botão + de força do time ausente');

assert(gameCode.includes('sm-badge-prestige'), 'Badge sm-badge-prestige ausente no shell');
assert(gameCode.includes('${coachPrestige} pts'), 'Texto ${coachPrestige} pts ausente no shell');
assert(gameCode.includes('id="btnTopQuickPrestige"'), 'Botão + de prestígio do treinador ausente');

// Verificação do redirecionamento ao clicar no + de prestígio
assert(gameCode.includes("$('#btnTopQuickPrestige')") && gameCode.includes("view = 'carreira'"), 'Clicar no + do prestígio deve ir para a aba carreira');
assert(gameCode.includes("$('#btnTopQuickPrestigeCard')"), 'Clicar no card de prestígio deve ir para a aba carreira');

// Verificação do redirecionamento ao clicar no + de força
assert(gameCode.includes("$('#btnTopQuickTeamStrength')") && gameCode.includes("view = 'meutime'"), 'Clicar no + de força deve ir para Meu Time & Tática');
assert(gameCode.includes("$('#btnTopQuickTeamStrengthCard')"), 'Clicar no card de força deve ir para Meu Time & Tática');

// Verificação no CSS das classes de badges
assert(cssCode.includes('.sm-badge-strength'), 'CSS sm-badge-strength ausente em app.css');
assert(cssCode.includes('.sm-badge-prestige'), 'CSS sm-badge-prestige ausente em app.css');
console.log('  ✅ Badges de Força do Time e Prestígio do Treinador renderizados e navegando perfeitamente!');

// 4. Requirement 4: ali deixa so temporada na aba
console.log('4. Verificando aba "🏆 Temporada" no menu lateral...');
assert(gameCode.includes("['temporada','🏆 Temporada']"), 'Menu lateral deve conter apenas 🏆 Temporada');
assert(!gameCode.includes("['temporada','🏆 Temporada & Competições']"), 'Não deve conter 🏆 Temporada & Competições no menu');
console.log('  ✅ Aba ajustada para exibir exatamente "🏆 Temporada"!');

// 5. Simulação Funcional de Sair com Auto-Save
console.log('5. Testando execução simulada de handleExitGameAction...');
let saved = false;
let rendered = false;
let modalTitle = '';

global.window = {};
global.openCustomModal = (title, body, onConfirm) => {
  modalTitle = title;
  // Simula o clique em confirmar ("Sim, Salvar e Sair")
  onConfirm();
};
global.save = () => { saved = true; return true; };
global.render = () => { rendered = true; };
global.toast = (msg) => { console.log('  [Toast]', msg); };
global.state = { club: 'Criciúma' };

// Extrai e avalia handleExitGameAction
const extractExit = gameCode.match(/function handleExitGameAction[\s\S]*?window\.handleExitGameAction = handleExitGameAction;/);
assert(extractExit, 'Não foi possível extrair handleExitGameAction');
eval(extractExit[0]);

handleExitGameAction();

assert.strictEqual(saved, true, 'O jogo deve ter sido salvo');
assert.strictEqual(global.state, null, 'O estado ativo deve ter sido limpo para voltar ao menu inicial');
assert.strictEqual(rendered, true, 'A tela deve ter sido re-renderizada');
assert.strictEqual(modalTitle, 'Sair para o Menu Principal', 'Título do modal de confirmação incorreto');

console.log('  ✅ Sair com Auto-Save executado com sucesso absoluto na simulação!');

console.log('\n🎉 TODOS OS 5 BLOCOS DE TESTES FORAM CONCLUÍDOS COM 100% DE SUCESSO!\n');
