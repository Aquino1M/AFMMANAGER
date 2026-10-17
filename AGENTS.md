# AFM Manager — instruções do projeto

## Stack e produto

- Aplicação local-first em HTML, CSS e JavaScript ES2022 sem framework ou bundler. Preserve os padrões de `css/app.css` e a interface em português do Brasil.
- `js/game.js` coordena carreira e interface; reutilize os módulos de `js/core/` e os catálogos em `js/` e `data/` antes de criar lógica paralela.
- Saves existentes devem continuar carregáveis. Faça migrações de estado aditivas, idempotentes e compatíveis com saves antigos. O save completo fica em JSON local e em `afm_saves.save_data`.
- Não reverta mudanças já aceitas. Não execute reset, clean, checkout forçado, rebase ou sincronização que descarte trabalho local.

## Integridade do jogo

- Resultados da competição ativa atualizam sua classificação uma única vez. Copas e torneios adicionais precisam manter resultados e classificações próprios; não altere `state.teams` nem avance a rodada da liga ao finalizar uma partida extra.
- REGRA CRÍTICA PERMANENTE DOS BOTÕES DE AVANÇO E CALENDÁRIO: Todos os botões de avanço de tempo e calendário (`btnAdvanceTransferWindowDay`, `btnAdvanceTransferWindowDayCard`, `btnAdvanceTransferWindowHours`, `btnAdvanceTransferWindowHoursCard`, `btnAdvancePreSeasonDay`, `btnAdvancePreSeasonDayCard`, `btnSkipPreSeason`, `btnSkipPreSeasonCard`, `btnAdvanceToMatchCentral`, `btnAdvanceOneDayCentral`) devem ter amarração direta em `bind()`, fallback delegado global capturado no documento e execução infalível em `try/catch`. NUNCA referenciar funções inexistentes (`advanceTransferWindow`) ou deixar botões sem evento. O avanço de dia/horas/partida deve sempre atualizar o estado (`state.date`, `state.transferWindow*`), persistir (`save()`), atualizar elementos visuais de data no topo e re-renderizar a tela (`render()`) com zero possibilidade de travamento silencioso.
- REGRA CRÍTICA INVIOLÁVEL: JOGAR PARTIDA POR PARTIDA E ATUALIZAÇÃO 100% CONCLUÍDO NO CALENDÁRIO:
  1. Fluxo Partida por Partida Cronológico: Toda a progressão de partidas do jogo (`getActualCurrentMatch`, `canStartMatch`, `advanceToNextMatchGuaranteed` e `advanceCalendarDays`) DEVE seguir rigorosamente a ordem cronológica data por data de TODAS as competições ativas do clube (Estadual, Copa nacional, Torneio Continental, Divisão Nacional). NUNCA avançar ou pular datas intermediárias que possuam partidas pendentes do clube (ex: jogos de quarta-feira não podem ser pulados para o sábado seguinte). Se houver duas partidas no mesmo dia (ex: estadual e continental), a data NÃO pode avançar para o dia seguinte até que ambos os confrontos do dia estejam finalizados (`advanceDateAfterMatch`).
  2. Sincronização e Validação Inviolável no Calendário: Qualquer partida disputada (seja pelo botão da Central `▶ JOGAR AO VIVO` / `⚡ SIMULAR`, seja pelos botões de linha do Calendário `btnCalPlayNow`, `btnCalSimNow`, `btnCalStatePlay`, `btnCalStateSim`, `btnCalTournamentPlay`, `btnCalTournamentSim`, `btnCalCopaPlay`, `btnCalCopaSim`) DEVE ser instantaneamente validada e marcada na tela do Calendário como `<span class="pill good">X x Y · Concluído</span>`. É TERMINANTEMENTE PROIBIDO que uma partida já jogada ou simulada continue exibindo botões de "▶ Jogar" ou "⚡ Simular". Cada partida na `calendarPage()` (`leagueTab`, `stateMatches`, `copa`, torneios) DEVE carregar o campo `result` se já disputada, e a checagem deve usar o resolvedor universal `resolveCalendarMatchResult(match, state)` que inspeciona `result`, `score`, `historyMatch`, fixtures estaduais, motores de copas/continentais e o histórico (`state.history`) com paridade total entre `'COMP'` e `state.compId`.
- REGRA CRÍTICA INVIOLÁVEL DE ZERO DUPLICAÇÕES E SINCRONIZAÇÃO TOTAL ENTRE ABAS:
  1. Zero Duplicações em Todo o Jogo: O estado do jogo deve manter zero duplicações em todas as coleções: `squad` (atletas únicos por `playerKey`), `lineup` (11 titulares únicos e pertencentes ao elenco), `history` (partidas únicas por temporada, campeonato, par de clubes e rodada/data), `news` (sem mensagens repetidas, máximo 50 registros), `teams` (sem clubes repetidos na classificação), `titles` e `transfers`.
  2. Sincronização Transversal de Dados: Todas as 12 abas (Central, Notícias & Mídia, Calendário, Meu Time & Tática, Elenco, Mercado, Estrutura & Estádio, Escritório, Carreira, Temporada, Novidades & Correções, Configurações) devem sincronizar os mesmos dados em tempo real. A matemática da classificação deve ser 100% exata (`J = V + E + D`, `SG = GP - GC`, `P = V*3 + E`). As finanças (`balance`, `income`, `expense`) e confiança (`trust.board = confidence.board`, etc.) devem ser preservadas integralmente entre partidas estaduais, copas e liga nacional, sendo estritamente proibido sobrescrever o saldo ou elenco com snapshots estáticos pré-jogo.
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
