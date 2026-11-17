# Instruções para Gemini

Siga [AGENTS.md](AGENTS.md) como fonte das regras atuais de arquitetura, gameplay, segurança e verificação. Para renderização Three.js/WebGL, consulte também [`.agents/rules/3d_game_studio.md`](.agents/rules/3d_game_studio.md). Em caso de conflito, prevalece a solicitação atual do usuário.

# REGRA IRRESTRITA ESPECIAL — PROTOCOLO ZERO-BUG AFM MANAGER 2026/2027

Você é o engenheiro-chefe responsável pelo AFM Manager 2026/2027. Antes de alterar qualquer arquivo ou concluir uma tarefa, cumpra obrigatoriamente TODAS as diretrizes abaixo:

1. **ISOLAMENTO FINANCEIRO ABSOLUTO (CLUBE vs TREINADOR):**
   - Nunca misture `state.money` (caixa do clube) com `state.career.cash` (dinheiro pessoal do treinador).
   - Imóveis, Empreendimentos, Garagem VIP, Licenças CBF/UEFA, Ações SAF e Negociações P2P debitam e creditam **exclusivamente** em `state.career.cash`.
   - Sempre invoque `window.AFMCareerFix.calculateCareerEconomy(state)` após qualquer transação para sincronizar `Patrimônio Total Acumulado`, `Dinheiro em Caixa (Pessoal)` e `Ganhos Mensais de Tudo`.

2. **DELEGAÇÃO DE EVENTOS IDEMPOTENTE (PROIBIDO LISTENER DUPLICADO):**
   - Nunca anexe `.addEventListener('click', ...)` diretamente dentro de funções `render*()` que reescrevem `innerHTML`.
   - Utilize delegação única no `document` protegida por flag global (`window.__AFM_*_BOUND__`) e trave botões de compra/votação contra duplo clique (`btn.disabled = true` durante a ação).

3. **ORDENAÇÃO E DADOS REAIS NO RANKING DE TREINADORES:**
   - O Ranking Vivo de Treinadores DEVE ser ordenado numericamente por `points` decrescente (`b.points - a.points`), nunca por ordem alfabética de clube.
   - Sempre normalize o nome do técnico com `sanitizeCoachName()` para impedir duplicação de prefixo (`"Téc. Téc."`).
   - Sempre resolva o país do clube pelo prefixo da liga (`resolveCountryFromLeague`) para não rotular clubes estrangeiros como `"Brasil"`.

4. **MODAIS E CONTAINERS RESPONSIVOS (SEM CORTE DE CONTEÚDO):**
   - Todo modal (`#afm-lic-modal`, `#afm-rk-modal`, etc.) deve usar `max-height: 90vh; display: flex; flex-direction: column;` no card principal e `flex: 1 1 auto; overflow-y: auto;` no corpo rolável.
   - No desktop (`min-width: 1025px`), os catálogos da Carreira (Imóveis, Negócios, Garagem) devem exibir todos os cards em grid sem cortar o último item.

5. **DUELO X1 & BOLSA SAF À PROVA DE FALHAS:**
   - Tokens X1 devem usar codificação UTF-8 segura (`encodeUtf8Base64` / `decodeUtf8Base64`) para suportar nomes com acentos (`Ceilândia`, `João`, `Diógenes`) sem lançar `InvalidCharacterError`.
   - Cálculos financeiros de ações SAF devem usar `round2()` e bloquear ações colocadas à venda no P2P (escrow) contra venda dupla no Pregão.

6. **VALIDAÇÃO OBRIGATÓRIA ANTES DO GIT PUSH:**
   - Rode `node --check` em todos os arquivos `.js` modificados antes de commitar.
   - Nunca faça commit com erro de sintaxe ou console error.

7. **INTEGRIDADE DE COMPETIÇÕES & NAVEGAÇÃO NA TEMPORADA:**
   - A seleção de divisões no Brasileirão (Séries A/B/C/D) não pode ser sobrescrita pela divisão do clube do usuário.
   - A Copa do Brasil opera com 126 clubes, 5 fases preliminares e avanço estruturado até as Oitavas, Quartas, Semifinal e Final com campeão salvo.
   - A Série D possui 96 clubes e 6 acessos à Série C, com ordenação por critérios esportivos e indicação de PROJEÇÃO ATUAL vs CONFIRMADO.
   - Competições Continentais e Mundial não podem exibir confrontos simulados em 01/01 nem times fixos antes do término dos grupos; 3º colocado da Libertadores migra para os Playoffs da Sul-Americana e o campeão do Mundial de Clubes FIFA é persistido em `state.worldSaveChampions`.

8. **INTEGRIDADE DA ABA INSTALAÇÕES & ESTÁDIO (AFM MANAGER):**
   - Unificação estrutural das sub-abas Estádio e Nova Arena em 4 abas oficiais (`facilities`, `stadium`, `museum`, `house`), com mapeamento retrocompatível de `arena` para `stadium` (submodo `new-arena`).
   - Card 3D único exibindo dados reais do estádio do clube ativo (`state.stadium.name`, `state.stadium.capacity`, `state.stadium.ring`), proibido "Bezerrão 15k" ou outro fallback estático no clube do usuário.
   - Sincronização em 16 níveis para o Museu (custo inicial R$ 50.000, capacidade 2 a 32+ taças), prioridade estrita de taças conquistadas no save antes de títulos históricos, proibição absoluta de fabricar títulos fantasma no Dia 1 (`Candango 2026` ou similares sem conquista comprovada), proibição de penalidade `hasOverflowPenalty` com `saveCount === 0`, renderização única em `#afm-unified-museum-card` (sem injeção duplicada de `#afm-club-own-museum-box`) e evolução sincronizada (`infrastructure.museum.level` + `facilities.museum` + `museumData.level`).
   - Validação dupla em Bens Pessoais (`evaluatePersonalAssetStatus`) com bloqueio visual/funcional de carreira e saldo bancário pessoal.

9. **BLINDAGEM DA ABA CARREIRA DO TREINADOR & BOLSA SAF/P2P:**
   - `#afm-career-economy-container` e `.life-shares-container` DEVEM usar `display: block; width: 100%` (nunca `display: grid`, que espreme a tela inteira em uma faixa estreita à esquerda); utilize `.afm-career-kpi-grid` para os 3 KPIs do topo e `.afm-career-catalog-grid` para os catálogos.
   - Proibido anexar `.onclick` em `.btnBuyProp`, `.btnBuyBiz` ou `.btnBuyVeh` quando `window.AFMCareerFix` estiver ativo — apenas a delegação única no `document` executa compras/vendas e sincroniza arrays legados de `managerPersonal`.
   - Toda operação em `Pregão SAF`, `Mesa P2P`, `Ordens P2P em Escrow`, `Cotas do Clube` e virada mensal DEVE invocar `syncCareerWallet()` + `calculateCareerEconomy()` (com `state.safMarket` populado) para impedir reversão de saldo ou dinheiro infinito ao re-renderizar.

10. **BLINDAGEM DEFINITIVA DE ISOLAMENTO MODO JOGADOR vs MODO TREINADOR (TELA INICIAL, LOCALSTORAGE & NUVEM):**
    - `renderSetup()` não deve exibir `'Prof.'` nem a tag `'⚽ Treinador'` no badge do usuário logado na tela inicial; e `enterSetupCleanly()` nunca pode mutar `state.gameMode = 'setup'`.
    - `detectSaveMode`, `getSaveGameMode`, `isPlayerCareerActive` e `database.js` (`getSavedGameMode`) devem reconhecer `manager === 'Treinador da IA'`, `coachName === 'Treinador da IA'` e `aiCoachControlled === true` (sem `retiredPlayerCareer`) como Modo Jogador mesmo em cabeçalhos reduzidos ou wrappers dessincronizados.
    - `syncUser`, `restoreSaves` e `saveAndConfirmCloud` devem preservar `gameMode`, `isPlayerMode`, `playerCareerState` e `controlledPlayerId` no resumo de `account.saves`, gravando a cópia local principal antes de descartar backups.

11. **FONTE ÚNICA DE VERDADE DO ATLETA CRIADO (CRIADOR 3D ➔ MOTOR ➔ UI ➔ MIGRAÇÃO DE SAVE):**
    - O OVR exibido na Etapa 5 do Criador 3D DEVE permanecer 100% idêntico após assinar o contrato, na Topbar (`sm-topbar`), no Hub, no Mini-Card FUT, no Radar Hexagonal, no Elenco e após salvar/recarregar (`migrate()` / `normalizeSquadState()`).
    - `calculatePlayerOverall`, `AFM_PLAYER_EVOLUTION.recalculateOvr(athlete, state)` e `playerOverall` compartilham uma única tabela de pesos posicionais via `normalizePlayerPosGroup(pos)` compatível com códigos PT e EN (`GOL`/`GK`, `ZAG`/`CB`, `LAT`/`LB`/`RB`, `VOL`/`DM`/`CM`, `MEI`/`AM`, `PON`/`LW`/`RW`, `ATA`/`ST`/`CF`).
    - `startPlayerCareer` preserva os 21 arquétipos e 4 peneiras do `AFM_CREATOR_CATALOG`, aplica o bônus `+1` de `starterBoot` via `boots_basic` sem duplicidade, sincroniza `shirtNumber` no retrato SVG 1:1 (Criador, FUT Card, FootGram e Estatísticas), blinda `controlledPlayerId` contra colisão de nomes em `LIVE_PLAYERS` e mantém paridade total entre `athlete`, `state.playerCareerState` e `state.player`.



