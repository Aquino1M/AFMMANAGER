# AFM Manager — regras de engenharia

## Arquitetura e mudanças
- Aplicação local-first em HTML, CSS e JavaScript ES2022, sem build obrigatório. `js/game.js` coordena UI/estado; reutilize serviços em `js/core/`, `js/player/` e catálogos existentes.
- `gameMode` isola carreira de treinador e jogador. Migrações devem ser aditivas, idempotentes e compatíveis com saves antigos; não crie fontes paralelas de verdade.
- Preserve mudanças locais. Nunca use `git reset --hard`, `git clean` ou reversão destrutiva.

## Jogo e estado consistente
- Processe partidas pendentes em ordem cronológica usando `resolveCalendarMatchResult(match, state)` e elencos válidos de 11 atletas. Promoção/rebaixamento altera somente `state.competitionTeams` da carreira ativa.
- Títulos oficiais atualizam `state.titles`, o Museu e `AFM_TitlesAndHistoryService`; preserve `seasonHistory`/`worldChampionHistory` e classifique acessos como “Acesso”. Prêmios exibem vencedor e métrica reais ou “A definir”; processe-os em `processEndOfSeasonAwards()`.
- Ao cruzar cada mês, processe uma vez as finanças do modo ativo na ordem das datas. No treinador, credite TV/patrocínios e quite folha, instalações, olheiros, marketing e dívidas; no jogador, processe salário/despesas/dívidas pessoais. Não dependa apenas do dia 1; mantenha idempotência em avanços longos, jogos e recargas.
- Limite coleções persistidas: `news` 50, `marketWorldFeed` 30, `seasonHistory` 20 e `socialMedia.feedPosts` 25.
- Catálogos e telas de elenco não podem repetir a mesma pessoa no mesmo clube por variações de nome (ex.: sufixo “Jr.”); deduplique por clube, identidade validada e nome normalizado sem fundir atletas distintos.

## Carreira do jogador
- Preserve sempre a criação do atleta (`#btnGoCreatePlayer`, `#btnNavGoPlayerMode`, `setupViewMode === 'create_player'` e `renderCreatePlayerScreen`). Elenco legado incompleto deve ser completado sem duplicar atletas nem remover o controlado; mudanças exigem teste de migração idempotente.
- Limite atributos a 99. Toda rota de partida registra uma só atuação com minutos via `AFM_PlayerEngine.processMatchPerformance`; normalize minutos na fronteira. Súmula, eventos, intervalo, nota final, gols, assistências, histórico, XP, patrocínio e prêmios devem compartilhar os mesmos dados, sem inferir gol pelo placar.
- Nunca coloque o atleta de linha no slot GK. Garanta goleiro válido, preserve posição natural e reposicione coordenadas após substituições/intervalo. Teste titular, reserva, troca, goleiro ausente e estatísticas duplicadas.
- Recupere energia em cada nova data mesmo sem jogar, sincronize `energy`/`fitness` e limite a 100. Salário, despesas e dívidas trabalhistas processam cada mês cruzado uma vez; atraso pode ser cobrado por ação jurídica.
- No modo jogador, condição abaixo de 50% impede escalação e entrada ao vivo; simulação rápida ainda resolve a partida do clube, mas não registra minutos, gols, assistências, nota ou XP individual. Em 50% exatos o atleta é elegível. A recuperação diária sem jogar continua válida e idempotente.
- Patrocínio de chuteiras aplica bônus efetivo sem alterar atributo base e respeita 99. Assinatura/troca/rescisão usa o serviço central; troca antecipada cobra multa de 50% das mensalidades garantidas restantes, uma vez, e só altera saldo/contrato quando válida.
- FootGram registra `createdDate`, calcula idade pela data simulada e gera autores do clube/elenco/imprensa uma vez por dia; reage ao desempenho, marca posts legados sem data e respeita o limite/idempotência. Ações do empresário abrem modal ou feedback; busca respeita janela, uma proposta manual por dia e até três ofertas, com termos iguais aos da assinatura.
- Valor de mercado tem uma fonte: `marketValueMi`/`value` (milhões) e `marketValue` (reais); converta uma vez e use fallback por OVR. Seleção Nacional processa cada jogo uma vez; não convocados não recebem caps nem estatísticas individuais.
- Mantenha abas acessíveis e com o design system. Mudanças em abas exigem teste de renderização e alternância.

## Renderização e dados confiáveis
- Preserve os canvases WebGL e trate falhas de renderização; dispose recursos ao fechar/trocar cena. Não use `forceContextLoss()`/`loseContext()` em navegação normal. Detalhes em `.agents/rules/3d_game_studio.md`.
- Saves em `afm_saves` usam upsert; resposta sem corpo e sem erro confirma sucesso. Em timeout, aborte quando possível e preserve o save local. Conflitos favorecem o maior `updated_at`/timestamp. Mudanças de autenticação/RLS devem ser revisadas junto com `js/database.js` e migrations; nunca publique senhas, credenciais reais ou acesso `anon` a dados privados.
- Trate save, importação, rede e nomes como entrada não confiável: valide trust boundaries e use `esc()` em HTML; prefira propriedades/DOM APIs a interpolar dados em `innerHTML`. Arredonde dinheiro com `Math.round()`.

## Verificação
- Antes de mudar código compartilhado, localize chamadores e testes. Execute testes reais pertinentes (Node/browser), confira erros introduzidos e descreva o que não foi verificado; não declare sucesso sem evidência.
