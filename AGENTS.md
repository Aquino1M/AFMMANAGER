# AFM Manager — instruções do projeto

## Arquitetura e compatibilidade

- Aplicação local-first em HTML, CSS e JavaScript ES2022, sem framework ou bundler. Preserve a interface em português do Brasil e reutilize `js/core/`, os módulos e catálogos existentes.
- `js/game.js` coordena carreira e interface. Não crie uma segunda fonte de verdade para estado, elenco ou competições.
- Saves antigos devem continuar carregáveis. Migrações devem ser aditivas, idempotentes e compatíveis; preservar salários/contratos de carreiras existentes e aplicar novos modelos somente a carreiras elegíveis.
- Não reverta alterações locais nem execute `reset`, `clean`, checkout forçado, rebase ou sincronização destrutiva.

## Invariantes de jogo

- Processe partidas pendentes do clube em ordem cronológica, incluindo estaduais, copas, torneios continentais e liga nacional. Não pule compromisso pendente; partidas no mesmo dia precisam ser resolvidas antes de avançar a data.
- Use `resolveCalendarMatchResult(match, state)` para identificar resultados já registrados e impedir que uma partida concluída seja iniciada ou contabilizada novamente. A UI do calendário deve refletir o resultado persistido.
- Resultados de competições adicionais alteram apenas seu próprio estado, classificação e rodada; não devem avançar nem sobrescrever a liga principal (`state.teams`). Mantenha a inscrição estadual de clubes de todas as divisões nacionais.
- Promoção, rebaixamento, vagas, participantes e reparos de ligas devem alterar os dados da carreira (`state.competitionTeams`), nunca catálogos globais compartilhados. Carreiras e usuários diferentes devem permanecer isolados.
- Preserve os invariantes das coleções: elenco/escalação válidos e sem duplicatas; histórico sem partidas duplicadas; classificação consistente (`J = V + E + D`, `SG = GP - GC`, `P = 3V + E`); finanças e confiança consistentes entre competições. Limite de persistência: `news` 50, `marketWorldFeed` 30 e `seasonHistory` 20 registros.
- Não inicie partidas com menos de 11 atletas válidos por lado. Partidas ao vivo devem manter placar, eventos e animação coerentes; valide comportamento visual no navegador ao alterar o motor de partida.
- Depois de mudanças críticas de estado, persista a carreira e re-renderize a interface sem engolir falhas silenciosamente. Botões de calendário, pré-temporada e janela de transferências precisam manter seus binds funcionais após renderização.

## Saves, login e segurança

- A persistência local é essencial para uso offline; a sincronização Supabase é condicional à configuração/disponibilidade. Não prometa sincronização remota quando ela não foi confirmada.
- O login próprio baseado em `afm_users` não é Supabase Auth. Não trate um nome de usuário salvo no navegador como identidade remota confiável.
- `supabase/schema.sql` atualmente define políticas amplamente públicas para `afm_users` e `afm_saves`; não considere os dados de conta/saves protegidos por proprietário enquanto isso não for corrigido e verificado. Nunca exponha credenciais de serviço. Alterações de schema/RLS exigem migração compatível e validação separada.
- Trate saves, datas, resultados e entradas importadas como não confiáveis. Valide os dados e escape conteúdo dinâmico inserido em HTML com `esc()` ou mecanismo equivalente.
- Arredonde valores financeiros com `Math.round()` e preserve os limites de conta e slots de save existentes.

## Desenvolvimento e verificação

- Antes de alterar/remover código compartilhado, confirme referências e chamadores, investigue a causa raiz e adicione testes para a regressão quando apropriado.
- Rode testes e verificações relevantes, relatando comandos e resultados reais. `npm run build` apenas imprime `Static build ready`; não é compilação nem teste.
- Não declare funcionalidade concluída com base apenas em UI/dados representados. Informe o que foi e o que não foi verificado.
- Mantenha `CHANGELOG.md` como histórico; não reescreva releases anteriores para ocultar limitações.
