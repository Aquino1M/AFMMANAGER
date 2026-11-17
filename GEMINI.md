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

