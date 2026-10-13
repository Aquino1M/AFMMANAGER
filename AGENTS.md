# AFM Manager — instruções do projeto

## Stack e produto

- Aplicação local-first em HTML, CSS e JavaScript ES2022 sem framework ou bundler. Preserve os padrões de `css/app.css` e a interface em português do Brasil.
- `js/game.js` coordena carreira e interface; reutilize os módulos de `js/core/` e os catálogos em `js/` e `data/` antes de criar lógica paralela.
- Saves existentes devem continuar carregáveis. Faça migrações de estado aditivas, idempotentes e compatíveis com saves antigos. O save completo fica em JSON local e em `afm_saves.save_data`.
- Não reverta mudanças já aceitas. Não execute reset, clean, checkout forçado, rebase ou sincronização que descarte trabalho local.

## Integridade do jogo

- Resultados da competição ativa atualizam sua classificação uma única vez. Copas e torneios adicionais precisam manter resultados e classificações próprios; não altere `state.teams` nem avance a rodada da liga ao finalizar uma partida extra.
- REGRA PERMANENTE DO CALENDÁRIO: a tela “Calendário Oficial de Jogos & Janelas de Transferência” deve exibir uma aba para cada competição em que o clube controlado participa na temporada, incluindo estaduais, liga nacional e copas aplicáveis. Resolva as competições pela associação completa do clube, sem escolher apenas a competição primária.
- REGRA PERMANENTE DOS ESTADUAIS: clubes das Séries A, B, C e D continuam inscritos em seus campeonatos estaduais. Mudanças de divisão nacional, classificação, promoção/rebaixamento e transição de temporada não podem remover nem sobrescrever inscrições estaduais.
- REGRA PERMANENTE DE ISOLAMENTO DA CARREIRA: promoção, rebaixamento, vagas conquistadas, participantes gerados e reparos de ligas só podem alterar `state.competitionTeams` (e os dados derivados dentro do save ativo). Nunca gravar mudanças de temporada em `window.COMPETITION_TEAMS`, `teamMap`, `BASE_COMPETITION_TEAMS`, `clubs` nem nos metadados dos clubes compartilhados. Cada nova carreira deve iniciar com uma cópia do catálogo-base original; resultados de um save não podem alterar partidas, divisões ou dados exibidos em outro save/usuário.
- REGRA PERMANENTE DE ISOLAMENTO: finalizar ou avançar um jogo estadual atualiza somente os resultados, estatísticas, classificação e rodada daquele estadual; não altera `state.teams`, a rodada nacional, resultados nacionais ou transição de temporada. Cada partida concluída deve ficar identificada e não pode ser iniciada nem contabilizada outra vez.
- REGRA PERMANENTE DAS DATAS ESTADUAIS: persistir todos os confrontos de todas as rodadas com as respectivas datas; distribuir rodadas em intervalos de 2–3 dias, reconciliando outros compromissos do clube sem apagar resultados históricos. Contagens de “Todos os Confrontos” devem usar a lista integral antes de filtros da interface.
- Não inicie partidas sem 11 atletas de cada lado. Complete escalações insuficientes com atletas válidos.
- Partidas ao vivo devem manter placar, eventos e animação do campo sincronizados. Ao tocar no motor visual, valide 22 atletas em movimento no navegador.
- Depois de mudanças de estado críticas, salve a carreira. Limites de persistência: `news` 50, `marketWorldFeed` 30 e `seasonHistory` 20 registros.
- Trate datas, resultados, entradas importadas e dados de saves como dados não confiáveis; valide antes de usar.

## Segurança e compatibilidade

- Escape dados dinâmicos de HTML com `esc()`. Não adicione segredos ou chaves de serviço ao cliente.
- A chave Supabase no cliente é pública e só é segura com RLS que valide a identidade e a propriedade do save. O login próprio atual não equivale a Supabase Auth; não relaxe políticas nem altere o esquema remoto sem uma migração compatível e verificada.
- Arredonde valores financeiros com `Math.round()` e preserve os limites de conta/slot existentes.
- Evite dependências e abstrações desnecessárias. Antes de remover código, confirme seus chamadores e referências.

## Verificação e entrega

- Investigue a causa raiz e todos os chamadores antes de corrigir funções compartilhadas.
- Rode verificações existentes e acrescente testes pequenos para lógica não trivial. Relate o que foi medido e o que não foi possível verificar; não declare sucesso sem evidência.
- Antes de sincronizar arquivos, preserve o estado local. Não publique como concluído um fluxo que esteja apenas representado por dados ou interface.
- Mantenha o `CHANGELOG.md` como histórico; não reescreva versões antigas para esconder limitações.
