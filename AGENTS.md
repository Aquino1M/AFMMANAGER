# AFM Manager — Diretrizes e Invariantes do Projeto

## 1. Arquitetura e Integridade do Código
- **Stack:** Local-first em HTML5, CSS3 e JavaScript ES2022 nativo (sem frameworks, bundlers ou build steps). Interface em PT-BR.
- **Coordenação Central:** `js/game.js` coordena estado e UI. Reutilize módulos em `js/core/`, `js/player/` e catálogos existentes. Proibido criar fontes paralelas de verdade.
- **Compatibilidade Aditiva:** Saves antigos devem carregar sem erros. Migrações em `migrate()` devem ser idempotentes e aditivas.
- **Isolamento de Modos:** `state.gameMode === 'player'` (Carreira Jogador) e `state.gameMode === 'manager'` (Modo Treinador) são estritamente isolados. Modificações em um modo não devem corromper o outro.
- **Segurança Operacional:** Nunca execute `git reset --hard`, `git clean` ou reversões destrutivas de código local.

## 2. Invariantes de Jogo e Competições
- **Calendário e Partidas:** Partidas pendentes do clube devem ser processadas em ordem cronológica (estaduais, copas, torneios continentais e ligas nacionais). Use `resolveCalendarMatchResult(match, state)` para evitar partidas duplicadas. Mínimo de 11 atletas válidos por lado.
- **Promoção e Rebaixamento Dinâmicos:** Acessos e descensos alteram exclusivamente a carreira ativa (`state.competitionTeams`), nunca catálogos estáticos globais. Times promovidos entram no grupo/tabela da nova divisão e saem da anterior; rebaixados descem para a divisão inferior.
- **Museu e Histórico Unificado:** Conquistas oficiais integram `state.titles` imediatamente e refletem no Museu do Clube. Hall da Fama (`state.seasonHistory`), Campeões do Mundo (`state.worldChampionHistory`) e Museu devem consultar o serviço centralizador `AFM_TitlesAndHistoryService`. Acessos são categorizados como 'Acesso' (nunca 'Rebaixamento').
- **Ciclo Financeiro Mensal:** A cada virada de mês (`nextDate.endsWith('-01')` ou transição `YYYY-MM`) ou em data avançada, execute `processClubMonthlyFinances(state)`. O ciclo credita cota de TV (`tvContract1Year.monthly`), reduz parcelas restantes, credita patrocínios (`sponsors`) e quita custos operacionais (folha `totalMonthlyPayroll`, infraestrutura `facilities`, olheiros `scouts`, marketing e dívidas).
- **Limites de Coleções (Prevenção de Estouro de Memória):** `state.news` (máx. 50), `state.marketWorldFeed` (máx. 30), `state.seasonHistory` (máx. 20), `socialMedia.feedPosts` (máx. 25).

## 3. Modo Carreira Jogador (Be a Pro / Craque)
- **REGRA INVIOLÁVEL — Acesso e Criação Permanentes:** O banner/botão de criação de atleta (`#btnGoCreatePlayer`) na tela de seleção de saves e o atalho na navegação principal (`#btnNavGoPlayerMode`) são **estritamente obrigatórios e permanentes**. É **PROIBIDO** remover, ocultar ou suprimir o botão e a rota de criação de jogador (`setupViewMode === 'create_player'` / `window.renderCreatePlayerScreen`) sob qualquer pretexto.
- **Evolução & Atributos:** Limite máximo estrito de 99 em qualquer atributo. XP e Skill Points acumulados via treinos e partidas.
- **REGRA INVIOLÁVEL — Elenco do Modo Jogador:** A carreira do atleta mantém o elenco completo do clube; o atleta controlado é um integrante, nunca substitui os demais. Após carregar/migrar um save, garanta pelo menos 11 jogadores válidos e complete elencos incompletos com atletas do clube sem duplicar nomes nem remover o atleta controlado. Mudanças exigem teste de save legado incompleto, preservação do jogador e idempotência da migração.
- **Abas do Modo Jogador:** Abas e subabas devem usar classes visuais do design system e estado acessível (`role`, `aria-selected`); nenhuma aba pode renderizar botões nativos sem estilo. Mudanças exigem teste de renderização e alternância de cada subaba.
- **Integridade de Estatísticas do Atleta:** Toda rota de partida (ao vivo, rápida ou calendário) registra uma única atuação por atleta somente quando houver minutos jogados, via `AFM_PlayerEngine.processMatchPerformance`; normalize `playedMinutes`/`minutesPlayed` na fronteira. Não deixe gols/assistências da súmula sem atualizar a carreira e o histórico individual. A interface e a Gala usam dados da temporada correspondente, nunca totais de outra temporada; prêmios devem mostrar nome, clube e métrica do vencedor real ou “A definir”, sem números/campeões fictícios. Mudanças nesse fluxo exigem teste de regressão para partida, histórico e prêmios.
- **REGRA INVIOLÁVEL — Valor do Elenco do Jogador:** `marketValueMi` e `value` (saída de `calcValueMi`) são milhões de reais; `marketValue` é valor em reais. Uma única função resolve o valor do atleta controlado e do elenco; contrato, perfil, propostas e elenco devem exibir essa mesma fonte, com conversão de unidade única. Valor ausente/inválido usa fallback por OVR. Mudanças exigem teste de paridade entre telas, formatos, fallback e valor alto em reais.
- **Data FIFA & Seleções:** O avanço diário do modo jogador deve processar janelas, convocação, resultado/histórico/notícia e retorno ao clube via `AFM_NationalTeams`, uma vez por partida; não convocados acompanham os resultados sem ganhar caps ou estatísticas individuais. A pontuação da convocação deve considerar os dados atuais da temporada. Mudanças exigem teste de regressão de janela, resultado, não convocado e duplicidade.
- **Patrocínio de Chuteiras:** Contrato ativo aplica seu bônus de atributo efetivo sem alterar o atributo base, acumula com item equipado quando aplicável e nunca ultrapassa 99; a interface deve informar o efeito vigente. Alterações exigem teste por categoria, combinação e limite.
- **REGRA INVIOLÁVEL — Contratos de Chuteiras:** Assinatura, troca e rescisão devem passar pelo serviço central do motor do modo jogador. Troca/rescisão antecipada cobra 50% proporcional das mensalidades garantidas restantes, bloqueia sem saldo e não pode alterar contrato ou saldo se falhar; prazos vêm da proposta e renovações respeitam o prazo anterior. Mudanças exigem testes de saldo insuficiente/suficiente, débito único, prazos diferentes e renovação.
- **Rede Social FootGram:** Posts diários com reset em `onDayAdvance`, comentários contextuais da IA (elogios em vitórias, cobranças em derrotas) e selo azul aos 50.000 seguidores.
- **Premiações e Gala:** Cerimônia anual em `processEndOfSeasonAwards()`. Preservar histórico consolidado em `careerStats.seasonHistory`.

## 4. Estádios 3D, Three.js & WebGL (Zero Tela Preta)
- **Renderização Contínua:** O canvas WebGL (`#afmStadiumLowPolyCanvas`, `#afmViewerModalLowPolyCanvas`) nunca pode ficar preto. Todas as variáveis de cena e prévia devem possuir declaração segura.
- **Descarte Seguro:** Ao alternar abas ou fechar modais, use `renderer.dispose()` e descarte geometrias/materiais. **PROIBIDO** chamar `forceContextLoss()` ou `loseContext()` em fluxos normais de alternância, preservando o contexto WebGL do navegador.
- **Assets e Performance:** Priorize modelos `.glb` compactos, estética Low-Poly estilizada e taxa de quadros estável (60+ FPS).

## 5. Persistência, Sincronização e Segurança
- **Paridade Multiplataforma (PC, Mobile & Supabase):** A resolução de conflitos de saves é governada pela regra do maior timestamp (`updated_at` / `timestamp`). O save mais recente sempre prevalece; nunca sobrescreva save mais novo por mais antigo.
- **REGRA INVIOLÁVEL — Save na Nuvem:** Gravação em `afm_saves` usa upsert sem buscar a representação completa do save depois de gravar; resposta sem corpo e sem erro confirma sucesso. Se expirar o timeout, abortar a requisição quando possível e preservar o save local. Testar confirmação sem corpo e erro de autorização.
- **Sanitização XSS:** Trate entradas do usuário, nomes importados e datas como não confiáveis. Sempre aplique `esc()` ao injetar variáveis dinâmicas no HTML.
- **Valores Monetários:** Arredonde valores financeiros com `Math.round()`.

## 6. Verificação e Qualidade (QA)
- Antes de alterar código compartilhado, confirme chamadores e referências.
- Validações devem ser executadas com comandos e scripts reais (Node.js / navegadores), reportando resultados autênticos sem simulação fictícia.
