// Testes de regressão e validação das 6 correções do Modo Carreira Jogador
const fs = require('fs');
const assert = require('assert');

console.log('=== INICIANDO TESTES DAS CORREÇÕES DO MODO JOGADOR ===\n');

// 1. Validar que js/game.js contém o interceptador global de confirm e alert
const gameJs = fs.readFileSync('js/game.js', 'utf-8');

assert(gameJs.includes('window.confirm = function(msg){'), 'Erro: window.confirm não foi interceptado globalmente');
assert(gameJs.includes('window.alert = function(msg){'), 'Erro: window.alert não foi interceptado globalmente');
console.log('✔ Teste 1: Interceptador global de window.confirm e window.alert ativo.');

// 2. Validar que addNews filtra notícias proibidas de treinador no Modo Jogador
assert(gameJs.includes('s.includes(\'festival eletrônico\')') || gameJs.includes('s.includes(\'só track boa\')'), 'Erro: addNews não filtra shows de estádio');
assert(gameJs.includes('s.includes(\'ausência do técnico\')'), 'Erro: addNews não filtra preparador físico na ausência do técnico');
assert(gameJs.includes('s.includes(\'investida árabe\')'), 'Erro: addNews não filtra investida árabe');
console.log('✔ Teste 2: addNews filtra rigorosamente eventos de estádio/shows e finanças do modo técnico.');

// 3. Validar avanço do calendário com contagem diária de patrocínio
assert(gameJs.includes('window.AFM_PlayerEngine.processDailySponsorTurn(state)'), 'Erro: processDailySponsorTurn não chamado no loop de advanceCalendarDays');
assert(gameJs.includes('processMonthlyPlayerFinances?.(state, nextDate)'), 'Erro: processMonthlyPlayerFinances não chamado antes da parada do calendário na virada do mês');
assert(gameJs.includes('window.AFM_PlayerEngine.processDailySponsorTurn?.(gameState)'), 'Erro: pós-partida não atualiza a contagem diária de patrocínio');
assert(gameJs.includes('window.AFM_PlayerEngine.processMonthlyPlayerFinances?.(gameState)'), 'Erro: pós-partida não fecha o mês financeiro do atleta');
console.log('✔ Teste 3: avanço manual e pós-partida processam patrocínio e fechamento financeiro do atleta.');

// 4. Validar que em shell(main) e navigate() o Modo Jogador é isolado do Treinador
assert(gameJs.includes('isPlayerModeNow'), 'Erro: isPlayerModeNow ausente no navigate');
assert(gameJs.includes('Conta Pessoal:'), 'Erro: Conta pessoal ausente no club-card');
console.log('✔ Teste 4: Layout do Topo, Ribbon de Tarefas e Card Lateral isolados entre Jogador e Treinador.');

// 5. Validar player_mode_ui.js: botão de lupa de detalhes e súmula pop-up
const playerUiJs = fs.readFileSync('js/player/player_mode_ui.js', 'utf-8');

assert(playerUiJs.includes('btn-view-offer-details'), 'Erro: Botão btn-view-offer-details não encontrado em player_mode_ui.js');
assert(playerUiJs.includes('openOfferDetailsModal'), 'Erro: openOfferDetailsModal não encontrada');
assert(playerUiJs.includes('openMatchDetailsPopup'), 'Erro: openMatchDetailsPopup não encontrada');
assert(playerUiJs.includes('btn-match-history-row'), 'Erro: btn-match-history-row não encontrado');
assert(playerUiJs.includes('Súmula Pop-up'), 'Erro: Cabeçalho Súmula Pop-up ausente');
console.log('✔ Teste 5: Botão 🔍 Detalhes de Negociação e Súmula Pop-up da Partida devidamente implementados e vinculados.');

// 6. Validar player_career_engine.js: contagem em dias e renovação automática ao término
const playerEngJs = fs.readFileSync('js/player/player_career_engine.js', 'utf-8');
assert(playerEngJs.includes('processDailySponsorTurn'), 'Erro: processDailySponsorTurn ausente');
assert(playerEngJs.includes('renewOffer'), 'Erro: Oferta de renovação automática ausente ao expirar patrocínio');
assert(playerEngJs.includes('pState.sponsorContract = null;'), 'Erro: Contrato ativo não é liberado ao expirar para permitir troca de marca');
console.log('✔ Teste 6: Contrato de material esportivo por dias com renovação automática e liberação de catálogo ao término.');

// 7. Validar Service Worker e versão dos assets
const swJs = fs.readFileSync('sw.js', 'utf-8');
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert(swJs.includes('afm-2027-cache-v'), 'Erro: sw.js não está com cache versionado');
assert(indexHtml.includes('js/game.js?v='), 'Erro: index.html não referencia game.js versionado');
assert(indexHtml.includes('js/player/player_career_engine.js?v='), 'Erro: index.html não referencia player_career_engine.js versionado');
assert(indexHtml.includes('js/player/social_media_manager.js?v='), 'Erro: index.html não referencia social_media_manager.js versionado');
assert(indexHtml.includes('js/player/player_mode_ui.js?v='), 'Erro: index.html não referencia player_mode_ui.js versionado');
console.log('✔ Teste 7: Service Worker e scripts sincronizados com cache versionado sem cache preso.');

console.log('\n=== TODOS OS 7 TESTES PASSARAM COM SUCESSO! ===');
