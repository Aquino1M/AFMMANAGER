# AFM Manager — regras de engenharia

## Arquitetura e mudanças

- Aplicação local-first em HTML, CSS e JavaScript ES2022, sem build obrigatório. `js/game.js` coordena UI/estado; reutilize serviços em `js/core/`, `js/player/` e catálogos existentes.
- `gameMode` persistido é a autoridade; use `isPlayerMode`/campos legados só quando ele faltar. Carregamento, autosave e sincronização nunca substituem um slot de outro modo, mesmo por timestamp; só uma nova carreira escolhida pelo usuário autoriza a troca. Migrações devem ser aditivas, idempotentes e compatíveis com saves antigos.
- Preserve mudanças locais. Nunca use `git reset --hard`, `git clean` ou reversão destrutiva.

## Jogo e estado consistente

- Processe partidas pendentes em ordem cronológica usando `resolveCalendarMatchResult(match, state)` e elencos válidos de 11 atletas. Promoção/rebaixamento altera somente `state.competitionTeams` da carreira ativa.
- Títulos oficiais atualizam `state.titles`, o Museu e `AFM_TitlesAndHistoryService`; preserve `seasonHistory`/`worldChampionHistory` e classifique acessos como “Acesso”. Prêmios exibem vencedor e métrica reais ou “A definir”; processe-os em `processEndOfSeasonAwards()`.
- Ao cruzar cada mês, processe uma vez as finanças do modo ativo na ordem das datas. No treinador, credite TV/patrocínios e quite folha, instalações, olheiros, marketing e dívidas; no jogador, processe salário/despesas/dívidas pessoais. Não dependa apenas do dia 1; mantenha idempotência em avanços longos, jogos e recargas.
- Limite coleções persistidas: `news` 50, `marketWorldFeed` 30, `seasonHistory` 20 e `socialMedia.feedPosts` 25.
- Catálogos e telas de elenco não podem repetir a mesma pessoa no mesmo clube por variações de nome (ex.: sufixo “Jr.”); deduplique por clube, identidade validada e nome normalizado sem fundir atletas distintos.
- Limites de caixa por divisão aplicam-se somente à criação do Modo Jogador, em todas as ligas; treinador mantém os orçamentos existentes. Repare save de jogador apenas na abertura comprovada, sem partidas ou progresso financeiro.

## Carreira do jogador

- REGRA IRRESTRITA DO CRIADOR DE ATLETA 3D (MODO CARREIRA JOGADOR):
  - Todos os catálogos do criador (Estados/Cidades, Aparência 3D, Biotipos, Chuteiras, Arquétipos e Peneiras) devem existir em `window.AFM_CREATOR_CATALOG` sem dependências externas. Toda edição de pele, cabelo, cor de cabelo, olhos, face, porte ou chuteira deve atualizar o boneco 3D e o retrato jovem em tempo real, com navegação funcional tanto pelo stepper superior quanto pelos botões Voltar/Avançar.
  - A visualização 3D do criador suporta estritamente os ângulos Frente e Costas (`#btnCamFront` e `#btnCamBack`), com rotação 360° livre desativada para evitar distorções de perspectiva.
  - O retrato jovem do atleta (`#cardFooterPhoto`, presets e `window.generateYoungAthletePortraitUri`) deve ser a reprodução vetorial direta (SVG 1:1) do modelo 3D (pele, olhos, sobrancelha, boca, corte/cor de cabelo e uniforme), atualizando simultaneamente em tempo real.
  - O slider de altura (`#wizHeightSlider`) altera dinamicamente em tempo real o box de 'Vantagens e Desvantagens deste Biotipo' (`#biotypeProsConsBox`), aplicando os prós e contras de estatura (alta, baixa ou equilibrada) imediatamente na interface e nos atributos.
  - As propostas de peneira (Etapa 6) devem obrigatoriamente ofertar clubes reais do catálogo oficial do jogo (`AFM_ESTADUAIS_DATA`, `BASE_CLUBS` e catálogo estadual por UF), proibindo nomes inventados ou genéricos.
  - A assinatura de contrato e início de carreira (`#btnStep6SignContract` / `finalizePlayerCareerStart`) deve obrigatoriamente desativar o setup (`setupViewMode = null`), remover o container do criador (`.afm-player-creator-wrapper`), inicializar o save do Modo Jogador com slot alvo e invocar `render()` com transição garantida para a Central do Atleta (`player_hub`).
- Preserve sempre a criação do atleta (`#btnGoCreatePlayer`, `#btnNavGoPlayerMode`, `setupViewMode === 'create_player'` e `renderCreatePlayerScreen`). Elenco legado incompleto deve ser completado sem duplicar atletas nem remover o controlado; mudanças exigem teste de migração idempotente.
- Limite atributos a 99. Toda rota de partida registra uma só atuação com minutos via `AFM_PlayerEngine.processMatchPerformance`; normalize minutos na fronteira. Súmula, eventos, intervalo, nota final, gols, assistências, histórico, XP, patrocínio e prêmios devem compartilhar os mesmos dados, sem inferir gol pelo placar.
- Nunca coloque o atleta de linha no slot GK. Garanta goleiro válido, preserve posição natural e reposicione coordenadas após substituições/intervalo. Teste titular, reserva, troca, goleiro ausente e estatísticas duplicadas.
- Recupere energia em cada nova data mesmo sem jogar, sincronize `energy`/`fitness` e limite a 100. Salário, despesas e dívidas trabalhistas processam cada mês cruzado uma vez; atraso pode ser cobrado por ação jurídica.
- No modo jogador, condição abaixo de 50% impede escalação e entrada ao vivo; simulação rápida ainda resolve a partida do clube, mas não registra minutos, gols, assistências, nota ou XP individual. Em 50% exatos o atleta é elegível. A recuperação diária sem jogar continua válida e idempotente.
- Patrocínio de chuteiras aplica bônus efetivo sem alterar atributo base e respeita 99. Assinatura/troca/rescisão usa o serviço central; troca antecipada cobra multa de 50% das mensalidades garantidas restantes, uma vez, e só altera saldo/contrato quando válida. A oferta regional inicial é dimensionada pelo OVR e aparece tanto na mesa do empresário quanto nas propostas de patrocínio; aceitar ou recusar em uma tela remove o mesmo ID das duas.
- REGRA IRRESTRITA DO FOOTGRAM (REDE SOCIAL - ABA 📱 FOOTGRAM):
  - O limite diário de publicação (`1 POST/DIA`) é rigidamente atrelado à data do calendário do jogo (`state.currentDate` / `state.date`), resetando automaticamente a cada avanço no calendário (`CONTINUAR`) e impedindo publicações duplicadas na mesma data simulada.
  - A verificação oficial (`verified = true`) é ativada de forma automática e imediata ao atingir ou ultrapassar 50.000 seguidores, acendendo o selo azul (`✓`) e recalculando o valor estimado por post (`VALOR ESTIMADO / POST`).
  - Catálogo de 6 Tiers de Celebridade (`Promessa da Base`, `Destaque Regional`, `Queridinho da Torcida`, `Craque Verificado`, `Estrela Nacional`, `Ícone Mundial`) calibrados por número de seguidores, conferindo multiplicadores de engajamento e valor publicitário.
  - Publiposts e campanhas patrocinadas creditam o valor integral diretamente na conta bancária pessoal do atleta (`personalBank` e `lifestyle.cash`), sincronizando com o HUD financeiro.
  - Transmissão ao vivo (`🔴 Live com a Torcida`) é restrita a 1x por mês do calendário (`lastLiveMonth !== curMonth`), com opções interativas que impactam seguidores e fama.
  - Modais de edição de perfil (`#afmEditHandleModal`, `#afmEditBioModal`, `#afmChangeAvatarModal`) operam com validação segura: galeria de 12 retratos jovens SVG, reprodução vetorial do modelo 3D e tratamento de URL externa com fallback contra quebras de imagem.
  - Interatividade completa de engajamento: curtidas (`♥`), respostas a comentários com bonificação de seguidores, Trending Topics/Hashtags com bônus de alcance (+35% a +60%) e barra de Stories 24h com reações de química e vestiário.
  - Clamp rígido em todas as fronteiras de dados para `coachTrust` (0 a 100) e `fame` (1 a 100), garantindo ausência total de valores `NaN` ou quedas arbitrárias em postagens da categoria Mercado & Futuro.
- FootGram registra `createdDate`, calcula idade pela data simulada e gera autores do clube/elenco/imprensa uma vez por dia; reage ao desempenho, marca posts legados sem data e respeita o limite/idempotência. Ações do empresário abrem modal ou feedback; busca respeita janela, uma proposta manual por dia e até três ofertas, com termos iguais aos da assinatura.
- Valor de mercado tem uma fonte: `marketValueMi`/`value` (milhões) e `marketValue` (reais); converta uma vez e use fallback por OVR. Seleção Nacional processa cada jogo uma vez; não convocados não recebem caps nem estatísticas individuais.
- REGRA IRRESTRITA DA ABA SELEÇÃO NACIONAL (MODO CARREIRA JOGADOR):
  - Todo carregamento ou renderização de `player_national` deve executar `AFM_NATIONAL_TEAM.ensureNationalData(state)`, ajustando nome oficial (`SELEÇÃO BRASILEIRA`, `SELEÇÃO ARGENTINA`, etc.), preposição (`no Brasil`, `na Argentina`, `em Portugal`), confederação, treinador, estádio e rivais conforme `state.player.nationality`.
  - Todas as imagens dos 23 convocados e concorrentes devem conter fallback `onerror` apontando para o gerador SVG em Data URI (`AFM_NATIONAL_TEAM.buildAvatarFallbackUri`), evitando ícones quebrados ou 404.
  - O ranking de concorrentes e o Termômetro de Convocação devem calcular a pontuação usando `AFM_NATIONAL_TEAM.computeCallUpScore`, com simulação dinâmica de partidas/gols na temporada (para `round > 1`) e destaque em dourado com badge `VOCÊ` para o atleta do usuário quando convocado.
- Ciclo de vida do atleta, declínio e aposentadoria:
  - A idade avança anualmente com o calendário; a partir dos 30 anos inicia o declínio natural (-1 a -2 pontos/temporada entre 30 e 33 anos; -2 a -4 pontos/temporada a partir dos 34). Foco em treino físico, moral alta ou staff de fisioterapia suavizam o declínio em 1 ponto, mas após os 32 anos o declínio anual nunca zera (mínimo de 1 ponto de queda).
  - Aos 35 anos, dispara automaticamente na caixa '📬 PROPOSTAS NA MESA DO EMPRESÁRIO' a carta formal de transição de carreira ("O Ciclo se Encerra? Proposta de Transição de Carreira") com flag de idempotência (`hasReceived35RetirementLetter = true`). O atleta pode aceitar e aposentar imediatamente ou recusar para continuar jogando; se recusar, o botão 'Pendurar as Chuteiras (Aposentar)' na aba Empresário & Mercado fica permanentemente desbloqueado para aposentadoria voluntária com nova proposta gerada sob demanda.
  - Transição Jogador ➔ Treinador migra o save in-place sem resetar o universo do jogo (preserva ano, data, tabelas de ligas, clubes e competições). Transfere nome completo, nacionalidade, idade exata de aposentadoria, histórico/bio esportiva (`managerLegacy`, `exPlayerBio`), reputação de 'Nome Conhecido / Ex-Jogador' e bônus permanentes de ex-atleta: +10% em propostas e renovações salariais de técnico (`bonusSalarioTreinador` / `managerCareerBonuses.salaryPct`) e +5% de chance de sucesso em contratações/renovações de jogadores (`bonusNegociacaoJogadores` / `managerCareerBonuses.playerSigningChancePct`). Limpa variáveis residuais de atleta do estado ativo arquivando o histórico em `retiredPlayerCareer`.
- Modais de negociação da aba `💼 Empresário & Mercado` (Pedir Aumento & Renovação, Solicitar Empréstimo e Solicitar Transferência):
  - Todo componente de negociação contratual, empréstimo ou transferência deve ter 100% dos seus inputs (sliders, botões de duração, divisão salarial e motivos) reativos e vinculados ao cálculo central da barra de aprovação/resistência em tempo real (nunca valores mockados ou estáticos).
  - Qualquer alteração futura nos modais da aba `💼 Empresário & Mercado` deve preservar a sincronia matemática entre estado da UI, cálculo de probabilidade e persistência no save, aplicando clamp estrito de `Math.min(100, Math.max(5, chance))` em todas as barras.
- REGRA IRRESTRITA DE EVOLUÇÃO, TREINOS E ATRIBUTOS (Aba ⚡ Meu Atleta & Treino):
  - Sincronização estrita e bidirecional de chaves entre português e inglês (`vel`/`pace`, `chu`/`shooting`, `pas`/`passing`, `dri`/`dribbling`, `def`/`defending`, `fis`/`physical`) limitadas rigidamente a 99 em todas as fronteiras de dados.
  - Recálculo dinâmico de OVR ponderado por posição (`AFM_PLAYER_EVOLUTION.recalculateOvr`), refletindo instantaneamente no HUD superior (`.sm-badge-strength .sm-res-val` e `.sm-badge-prestige .sm-res-val`) e persistido no save ao confirmar os pontos de atributo.
  - Alocação protegida e estagiada de pontos (`pendingAttributePoints`): botões `+` e `−` operam em rascunho seguro, com travas de limite `<= skillPoints` e `<= 99`; confirmação explícita via `.btn-confirm-skill-points` debita o saldo, aplica os atributos, atualiza o HUD e grava no log de evolução (`evolutionLog`).
  - Goleiros (`GOL`) possuem foco semanal específico adaptado (`🧤 Reflexos & Defesas Difíceis` / `gk_reflexes`), preservando coerência posicional sem foco padrão genérico de atacante.
  - Minigames de Treinamento Prático em Campo (Pênalti +20/+3 XP, Falta +35/+5 XP e 3º minigame Drible/1x1 +25/+4 XP com bônus de combo streak): limite rígido de 3 cargas por dia do calendário do jogo (`syncDailyTrainingLimit`), reset idempotente ao avançar a data (`CONTINUAR`) e trava anti-glitch imediata (`save()` no disparo e `window.__minigameLaunchLock`).
  - Sistema de PlayStyles / Especialidades com catálogo oficial de 8 estilos, requisitos mínimos por atributo e trava rigorosa de até 3 equipados simultaneamente.
  - Sessões extras no CT & Academia (com consumo calibrado de estamina/caixa e chance de upgrade de perna ruim) e contratação de Staff Pessoal de Performance com multiplicador de XP.
  - Card evolutivo do atleta estilo FUT dinâmico (Bronze `< 65`, Prata `65–74`, Ouro `75–84`, Especial `85–89`, Lendário/Ídolo `90+`) e gráfico radar hexagonal interativo SVG em tempo real.
- Economia e Estilo de Vida do Atleta (Aba 💎 Vida & Patrocínios):
  - A conta bancária do atleta mantém 100% de paridade entre `player.cash`, `lifestyle.cash` e `player.personalBank` (e o badge do HUD), sincronizada em cada transação via `addPlayerTransaction`.
  - Chuteiras possuem durabilidade e perdem 1 ponto de integridade por partida disputada; durabilidade zerada suspende os bônus de atributos até reforma das travas (custo fixo de 35% do valor da nova).
  - Staff Pessoal conta com 8 profissionais exclusivos com honorários e bônus aplicados no motor (Analista de Vídeo +1 Passe/Visão, Personal Trainer +20% XP, Fisioterapeuta -35% fadiga, etc.). Saldo negativo na virada de mês suspende automaticamente 1 profissional por inadimplência.
  - Bens de luxo suportam compra à vista ou financiamento bancário em 12x (30% de entrada imediata e saldo com juros de 10% dividido em 12 meses, quitando automaticamente ao término). Contador Pessoal concede 15% de desconto na manutenção mensal de bens e eleva rendimento do CDB de 1.1% para 1.5%/mês.
  - Negócios e mídia: campanhas de publicidade/VIP consomem 15% de estamina com cooldown semanal; aluguéis de kitnets (R$ 650/mês), escolinha (R$ 2.100/mês) e marca própria (R$ 5.400/mês) creditam na virada mensal. O extrato financeiro preserva histórico das 20 transações mais recentes com valores e cores padronizados.
  - A interface deve exibir botões inteligentes desabilitados com o texto '🔒 Faltam R$ X' sempre que o saldo for inferior ao custo de compra, reforma, contratação, entrada ou investimento.
- Estatísticas, Recordes e Histórico de Carreira (Aba 🏆 Estatísticas & Troféus):
  - REGRA IRRESTRITA DE ESTATÍSTICAS E HISTÓRICO: Toda partida simulada ou jogada pelo atleta deve registrar simultaneamente os dados na temporada atual (`seasonStats`), no histórico acumulado da carreira (`careerHistory.totals`), na lista de partidas (`matchRatingHistory`) e verificar quebra de recordes históricos, impedindo exibição de nota média fictícia quando games === 0.
  - Com 0 partidas disputadas na temporada, a nota média exibe rigorosamente `—` com subtítulo 'Aguardando estreia' (nunca nota fictícia como 6.5) e o parecer do treinador reflete período de pré-temporada em andamento.
  - Sincronização salarial no card de status lê o salário oficial do atleta (`athlete.wage`), mantendo paridade com Vida & Patrocínios.
  - Quebra de recordes históricos em tempo real (+15 gols em um ano, +9 assistências, +12 jogos invicto) concede +500 XP, premiação financeira no banco e troféu individual na galeria.
  - Sub-aba 4 `📈 Carreira Total` cataloga a linha do tempo completa de clubes e temporadas e alimenta a biografia esportiva de legado para quando o atleta se aposentar e virar treinador.
- Gestão de Elenco, Finanças e Vestiário (Aba 👥 Clube & Elenco):
  - REGRA IRRESTRITA DE ELENCO E REFERÊNCIAS: Os indicadores de 'Referências do Elenco' (Maior Valor e Maior Salário) devem ser sempre calculados dinamicamente a partir do array real do elenco do clube (`getSquadReferences`), proibindo valores estáticos ou nomes nulos ('—'). O valor de mercado do atleta do usuário deve seguir a mesma curva proporcional de OVR e idade dos demais jogadores.
  - Hierarquia de status do elenco distingue 11 Titulares (🟢 Titular), 7 Reservas imediatos (🟡 Reserva) e Plantel restante (⚪ Plantel), com badge dourado de Capitão (© CAPITÃO) para a liderança do grupo.
  - Vestiário e Mentoria: Jogadores com 27+ anos e OVR superior podem conceder mentoria semanal (1x a cada 7 dias), consumindo 10% de energia e concedendo +20 XP e +5% de afinidade.
  - Finanças e Bicho: Caixa crítico alerta risco de atrasos salariais quando inferior à folha mensal total; atrasos de 2+ meses autorizam Rescisão por Justa Causa (Passe Livre) para transferência sem multa rescisória.
- Gestão de Carreira, Negociações e Mercado (Aba 💼 Empresário & Mercado):
  - REGRA IRRESTRITA DE EMPRESÁRIO, NEGOCIAÇÃO E MERCADO:
    - As datas de renovação contratual no modal 'Pedir Aumento & Renovação' devem sempre partir do fim do vínculo vigente do atleta (`baseContractYear = Math.max(curSeason, curContractUntil)`), oferecendo extensões reais futuras (+1 a +4 anos), proibindo anos já superados pelo contrato ativo.
    - O valor de mercado exibido e utilizado nas negociações deve ser sempre realista e proporcional ao OVR/idade (`formatPlayerMarketValueShort`), corrigindo saves legados inflados (ex.: OVR 34 a R$ 69 Mil).
    - As 4 ações com diretoria/comissão técnica (`wage_increase`, `demand_starter`, `request_loan`, `request_transfer`) são submetidas a um cooldown rígido de 15 dias de calendário via `pState.agentCooldowns`, desabilitando botões e impedindo repetições em loop ('⏳ Aguarde Xd').
    - A busca de propostas na janela possui cooldown de 10 dias de calendário e considera o alcance do empresário contratado.
    - O catálogo oficial de representação dispõe de 5 agências hierárquicas (`agent_family`, `agent_regional`, `agent_national`, `agent_euro`, `agent_global` com aliases suportados), aplicando bônus de barganha de 0% a 25% diretamente nas chances de aprovação dos modais.
    - O 'Radar de Interesse & Rumores' monitora sondagens de mercado em tempo real e permite solicitar proposta formal diretamente para a mesa de negociação.
    - O atleta pode submeter '🤝 Contraproposta (+15% Salário)' em propostas recebidas, limitando a uma renegociação por oferta.
    - No modo atleta (`gameMode === 'player'`), a barra superior (`sm-topbar`) reflete o atleta: OVR em força, pontos livres em prestígio e conta bancária pessoal no saldo financeiro.
  - REGRA IRRESTRITA DE UI FINANCEIRA: No Modo Atleta, o topo esquerdo deve refletir o Patrimônio Total do Atleta (líquido + investimentos), enquanto o card central da aba Vida & Patrocínios exibe o Saldo Líquido Disponível. Toda aplicação em CDB ou resgate deve disparar a atualização global da DOM financeira.
- REGRA IRRESTRITA DE ROTEAMENTO, SAVE E NAVEGAÇÃO (ANTI-TRAVAMENTO):
  1. Todo carregamento de save deve executar migrateAndSanitizeSaveState(state) antes do render() para inicializar objetos novos e impedir TypeError em saves antigos.
  2. window.isPlayerCareerActive(state) é a única fonte de verdade para diferenciar Modo Atleta e Modo Treinador. No Modo Atleta, renderCentral() e views exclusivas de treinador são estritamente proibidas.
  3. A navegação por [data-view] deve usar delegação global em document (fase de captura), e window.render() deve sempre usar try/catch/finally resetando travas de renderização para que as abas jamais fiquem inclicáveis.
- REGRA IRRESTRITA DA TELA INICIAL, MODOS E SLOTS DE SAVE (ANTI-CONFLITO):
  1. Ao entrar na tela inicial (`.setup-container`), o jogo deve pausar auto-saves (`window.__afmAutoSavePaused = true`), ativar `window.__afmSetupScreenActive = true` e marcar `#app` com `data-rendered-game-mode="setup"`, **sem jamais sobrescrever `state.gameMode` para `'setup'`** em uma carreira carregada.
  2. Toda nova carreira (Treinador, Carreira Jogador ou Criar Seu Time) deve selecionar automaticamente um slot vazio por padrão, pedir confirmação explícita caso o jogador escolha um slot ocupado, e inicializar um objeto `state` 100% limpo sem resíduos de campanhas anteriores.
  3. Todo carregamento de save (local, arquivo JSON ou nuvem Supabase) deve passar obrigatoriamente por `AFM_SETUP_GUARD.sanitizeLoadedSave()` com deep-clone antes do primeiro `render()`, garantindo que um save de Treinador jamais abra no Modo Jogador e vice-versa.
  4. **Blindagem Definitiva de Identificação do Modo Jogador vs Treinador:**
     - O cabeçalho da conta na tela inicial (`renderSetup`) NÃO deve exibir os rótulos `'Prof.'` nem `'⚽ Treinador'` (pois a plataforma possui ambos os modos: Jogador e Treinador).
     - `AFM_SETUP_GUARD.detectSaveMode()`, `getSaveGameMode()`, `isPlayerCareerActive()` e `AFM_DB.getSavedGameMode()` devem considerar `manager === 'Treinador da IA'`, `coachName === 'Treinador da IA'` e `aiCoachControlled === true` (quando não houver `retiredPlayerCareer`) como assinatura exclusiva do Modo Jogador, mesmo que um cabeçalho reduzido ou wrapper legado traga `gameMode: 'manager'` ou sem `playerCareerState`.
     - `save()`, `saveAndConfirmCloud()`, `database.js` (`syncUser`, `restoreSaves`) e `account.saves` DEVEM sempre gravar e preservar `gameMode`, `isPlayerMode`, `aiCoachControlled`, `controlledPlayerId` e `playerCareerState` no resumo do slot. Limpeza de cópias locais (`cleanupConfirmedLocalSaveCopies` e `syncUser`) só pode remover chaves redundantes após confirmar a gravação da cópia principal.
     - Cards de slot do Modo Jogador jamais exibem `👔 Prof. Treinador da IA` ou `Orçamento`.
- REGRA IRRESTRITA ESPECIAL — LAYOUT DE CLÁSSICOS, DATAS ÚNICAS E FILTROS NO CALENDÁRIO:
  1. POSICIONAMENTO E BLINDAGEM DA TAG DE CLÁSSICO (`.calendar-derby-badge`):
     - É PROIBIDO renderizar a tag `🔥 CLÁSSICO (+50% XP)` dentro da coluna estreita de data (`120px`) de `.calendar-card`.
     - A tag de clássico DEVE ser exibida ao lado do nome do adversário (Coluna 3) com `display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex-shrink: 0; border-radius: 6px;`, garantindo zero quebra de texto e zero sobreposição com `🏠 EM CASA` / `✈️ FORA`.
  2. PROIBIÇÃO DE DOIS JOGOS DO CLUBE NO MESMO DIA:
     - Antes de renderizar `calendario` ou avançar dias, executar `window.resolveSameDayFixtureConflicts(fixtures, userClubName)` para garantir que o clube do jogador nunca tenha duas partidas oficiais na mesma data `YYYY-MM-DD` (deslocando o confronto conflitante para a próxima data livre e recalculando o dia da semana).
  3. FILTRAGEM COMBINADA E PRESERVAÇÃO DE FOCO NA BUSCA:
     - Os filtros `[data-cal-filter]` e o campo `#calSearchOpponentInput` DEVEM operar em conjunto via `applyCalendarFiltersAndSearch()` sem destruir o foco do campo de texto.
  4. BLOQUEIO CRONOLÓGICO E SEGURANÇA:
     - Somente a primeira partida pendente do calendário da temporada (`nextUnplayedMatch`) pode exibir os botões ativos `▶ Jogar` e `⚡ Simular`. Partidas futuras exibem estritamente o badge `🔒 Aguardando Rodada` com apenas `📋 Prévia` disponível, impedindo saltos arbitrários de rodadas ou dessincronização da tabela de classificação. Partidas já disputadas exibem o placar oficial, badge de resultado (`V` / `E` / `D`), botão `📊 Súmula` e `📋 Prévia`.
     - Trava anti-glitch e disparo duplo: Todas as ações de simulação ou jogo via calendário são submetidas à trava global `window.__afmCalActionLock = true` (com timeout seguro de 1.5s), prevenindo disparos múltiplos por cliques rápidos.
     - Cálculo oficial e preciso de janelas de transferência: `AFM_CALENDAR_HUB.getTransferWindowStatus` calcula as janelas oficiais da temporada: Janela de Verão (01/Jan a 31/Mar = 90 dias) e Janela de Inverno (10/Jul a 02/Set = 55 dias), corrigindo badges de contagem de eventos de pré-temporada e exibindo os dias corridos e restantes com precisão matemática.
     - Modais globais `openMatchPreviewModal` e `openMatchSummaryModal`: Disponíveis globalmente para raio-x do confronto e súmula detalhada.
- REGRA IRRESTRITA ESPECIAL — ISOLAMENTO DE MODOS & PROTEÇÃO DE ABAS COMPARTILHADAS:
  1. CLASSIFICAÇÃO OBRIGATÓRIA DAS ABAS DO MENU:
     - ABAS EXCLUSIVAS DO TREINADOR (proibidas no Modo Carreira): `Meu time & Tática`, `Mercado & Transferências`, `Carreira do Treinador`, `Instalações & Estádio`, `Escritório & Finanças`.
     - ABAS COMPARTILHADAS (mesmo motor visual/dados, permissões isoladas por modo): `Perspectiva Geral`, `Elenco Oficial`, `Calendário de Jogos`, `Notícias & Mídia`, `Temporada`, `Novidades & Correções`, `Configurações`.
  2. GUARDIÃO DE CONTEXTO (`resolveModeContext`):
     - Nenhuma aba compartilhada pode ler ou gravar diretamente em `state.club` ou `state.career` sem passar antes por `const ctx = resolveModeContext(state)`.
     - É terminantemente proibido vazar dados do Modo Carreira (`state.career.player`, `state.career.club`) para dentro de um save do Modo Treinador, e vice-versa.
  3. TRAVA DE SEGURANÇA NA SIMULAÇÃO & BOTÕES DE AÇÃO:
     - Todo botão de ação dentro de uma aba compartilhada (`Jogar Partida`, `Simular`, `Ver Elenco`, `Analisar Adversário`) DEVE validar `ctx.mode` no momento do clique:
       - Em `MODE_MANAGER`: libera ações de técnico (escalar, negociar, preparar tática, simular partida como treinador).
       - Em `MODE_PLAYER`: bloqueia ações de técnico (modo somente-leitura para elenco/finanças) e redireciona partidas exclusivamente para o motor do atleta (`startCareerMatch`).
  4. SINCRONIA DE DADOS & VISUAL DARK NEON:
     - Todas as abas compartilhadas devem usar `ensureCompetitionFixturesIntegrity` (zero times fantasmas fora de `comp.teams`, clube do usuário presente em todas as rodadas), datas sincronizadas entre cabeçalho e cards, botões sem dead-links (`data-*` delegation) e tema Dark Neon (`#100d1e` / `#161324`, nunca fundo branco `#ffffff`).
- REGRA IRRESTRITA DE INTEGRIDADE DA ABA TEMPORADA & CLASSIFICAÇÃO (DATA-VIEW="TEMPORADA"):
  - Integridade Absoluta de Clubes e Confrontos: Todos os confrontos de qualquer competição estadual ou nacional (`comp.fixtures`) devem conter estritamente os clubes oficiais cadastrados em `comp.teams`. Toda detecção de equipes fantasmas (ex.: Sobradinho em liga onde não está cadastrado) ou ausência do clube do usuário ativa a regeneração determinística do calendário Round-Robin via `ensureCompetitionFixturesIntegrity(comp, userClubName)`, garantindo a presença do clube do usuário em todas as rodadas e preservando placares já disputados.
  - Sincronização Precisa de Datas da Rodada: A data exibida no cabeçalho da rodada (`comp.roundDate`) deve corresponder rigorosamente à data real da primeira partida daquela rodada (`f.isoDate`), eliminando divergências de agendamento entre tabela e jogos.
  - Navegação Livre e Persistência de Copas: As abas de topo (`🏆 Estadual`, `🇧🇷 Brasileirão`, `🏅 Copa do Brasil`, `🌎 Continentais & Mundial`) e os atalhos de alternância rápida (`#btnSeasonSwitchToCopa` e `#btnSeasonSwitchToLib`) devem permanecer sempre acessíveis e funcionais, sem nunca resetar o estado ou travar em abas em branco independentemente da divisão do clube do usuário.
  - Pirâmide Nacional CBF Interativa: A aba do Brasileirão (`nacional`) deve disponibilizar sub-seletores ativos para todas as 4 divisões (`Série A`, `Série B`, `Série C` e `Série D` com seus 4 grupos), exibindo tabelas completas com zonas de Libertadores, Sul-Americana, Acesso e Rebaixamento e destaque para o clube do usuário com badge `VOCÊ`.
  - Filtros Dinâmicos de Tabela e Chaveamento: A tabela estadual suporta filtros dinâmicos (`[Geral]`, `[Mandante]`, `[Visitante]`, `[Últimos 5]`) calculados via `computeStandingsFromFixtures` com indicadores de tendência (`▲`, `▼`, `—`), e alternância de fases (`PRIMEIRA FASE` e `MATA-MATA`) com chaveamento visual de semifinais e final.
  - Estatísticas Dark Neon e Modal Top 30: O bloco de estatísticas adota estritamente o tema Dark Neon do jogo, com 4 abas ativas (`⚽ ARTILHARIA`, `🎯 ASSISTÊNCIAS`, `⭐ NOTA MÉDIA (MVP)`, `🟨 CARTÕES`), destaque para o atleta controlado pelo usuário (`VOCÊ`) e botão `VER RANKING COMPLETO (TOP 30)` abrindo o modal `#afmStatsModal` via `openFullStatsModal()`.
- REGRA IRRESTRITA ESPECIAL — INTEGRIDADE DO MODO JOGADOR & HUB CENTRAL (DATA-VIEW="PLAYER_HUB"):
  - Identidade do Atleta e Escudos Oficiais: O card principal do atleta exibe obrigatoriamente o escudo oficial do clube ativo (`clubBadge(club, 22)`), valor de mercado atualizado proporcional ao OVR (`formatPlayerMarketValueShort`) e status da seleção nacional (`Observado pela Seleção` ou `Convocado para a Seleção`). No card de próximo compromisso, os escudos do mandante e visitante devem ser renderizados visualmente em conjunto com o mando de campo e força estimada do oponente.
  - Delegação Segura e Botões Anti-Conflito: Todas as ações de avanço, partida, rotina diária e filtros utilizam atributos `data-hub-action="..."` (`advance_to_match`, `advance_1day`, `play_live`, `play_quick`, `goto_training`, `goto_social`, `goto_agent`, `quick_physio`) e `data-hub-news-filter="..."`, vinculados a um listener delegado único e imune a perdas após `window.render()`.
  - Barra de XP Dinâmica e Nível: Exibe visualmente o progresso exato de nível `${xp} / ${xpNext} XP (${xpPercent}%)` com barra preenchida em gradiente roxo/neon, mantendo fidelidade estrita com a aba `Meu Atleta & Treino`.
  - Faixa de Estatísticas da Temporada (4 Mini-Cards): `👕 Jogos`, `⚽ Gols`, `🎯 Assistências` e `⭐ Nota Média` espelham com precisão `seasonStats` e `matchRatingHistory`, exibindo `—` em nota média quando `games === 0` (aguardando estreia) e bolinhas de forma recente das últimas atuações.
  - Painel de Metas do Treinador (Match Objectives): Apresenta 3 objetivos dinâmicos contextuais à posição do atleta (Goleiro, Defensor, Meio-Campo ou Atacante), com recompensas explícitas de XP e Confiança do Treinador.
  - Central de Ações Rápidas Diárias (Rotina Pré-Jogo): Disponibiliza 4 atalhos diários (`[🏋️ Treinar]`, `[💆 Fisioterapia]`, `[📱 FootGram]`, `[💼 Empresário]`). A ação `quick_physio` recupera +10% de energia (limitada a 100%) ao custo de R$ 150 debitados da conta pessoal com trava diária de 1x por data do calendário.
  - Filtros Interativos de Notícias: O feed de notícias do atleta suporta filtragem instantânea por pílulas (`[Todas]`, `[CT & Treino]`, `[Comissão]`, `[Torcida & Mídia]`, `[Mercado]`) associando cada item à sua respectiva categoria.
  - Responsividade Paisagem: Utiliza a classe `.afm-player-hub-grid` com grid adaptativo, impedindo quebra ou corte de conteúdo em telas e resoluções menores.
- REGRA IRRESTRITA ESPECIAL — INTEGRIDADE FINANCEIRA DO ATLETA (CDB) & TOPBAR POR MODO:
  - Conservação Monetária Estrita no CDB: Toda aplicação no CDB Esportivo deduz atomicamente o valor (`amount`, padrão R$ 500) da Conta Pessoal (`personalCash`, `personalBank`, `cash`), sincronizando todas as propriedades e o livro-razão (`ledger`/`transactions`). Se o saldo da Conta Pessoal for inferior a R$ 500, a aplicação é estritamente bloqueada, exibindo botão desabilitado com o texto `🔒 Saldo Insuficiente` e cursor `not-allowed`. O Patrimônio Total do atleta (`Patrimônio`) é a soma exata e conservada: `Saldo Conta Pessoal + Saldo CDB + Valor de Bens/Imóveis`. Nenhuma operação de aplicação ou resgate pode alterar o Patrimônio Total no instante da transação (conservação estrita de carteira). O resgate do CDB credita integralmente o valor de volta na Conta Pessoal e zera o saldo do CDB no save, atualizando instantaneamente a DOM e disparando autosave idempotente com trava anti-reentrância.
  - Topbar Exclusiva por Modo (`resolveModeContext(state)`):
    - No Modo Carreira Jogador (`resolveModeContext(state).isPlayer === true`): A barra superior (`sm-topbar`) exibe 4 painéis dedicados do atleta: Força Geral (`⭐ ${athleteOvr} OVR`, atalho para `player_evolution`), Nível do Atleta (`🏅 Nv. ${pLevel}`, atalho para `player_evolution`), Saldo da Conta Pessoal (`💵 R$ ...`, atalho para `player_lifestyle`) e Saldo Investido no CDB (`🏦 CDB R$ ...`, atalho para `player_lifestyle`). O botão circular `#btnTopQuickCash` e demais botões circulares exibem estritamente apenas o símbolo `+`, eliminando sobreposições ou vazamentos de texto sobre os valores numéricos.
    - No Modo Treinador (`resolveModeContext(state).isManager === true`): Mantém rigorosamente os 3 painéis de gestão do clube: Força do Elenco (`⭐ ${teamOvr} OVR`), Prestígio do Treinador (`🎖️ ${coachPrestige} pts`) e Caixa do Clube (`💵 ${clubCash}`).
- REGRA IRRESTRITA ESPECIAL — ESCALAÇÃO POR POSIÇÃO & PROTAGONISMO NA PARTIDA (MODO JOGADOR):
  1. PROTEÇÃO ABSOLUTA DO ÍNDICE 0 (GOLEIRO):
     - Na escalação titular de 11 jogadores (`lineup[0..10]`), o índice `0` é EXCLUSIVO para Goleiro (`GK` / `GOL`).
     - É TERMINANTEMENTE PROIBIDO usar `lineup.unshift(userPlayer)` ou colocar o atleta do usuário no índice `0` se a posição escolhida na criação não for `GK` ou `GOL`.
     - Toda inserção do atleta do usuário na escalação titular ou substituição no 2º tempo DEVE passar por `placeUserPlayerInCorrectSlot(lineup, userPlayer)`, mapeando a posição criada (`ST/ATA/CA`, `PE/LW/PD/RW`, `MEI/CAM/MC/CM/VOL/CDM`, `ZAG/CB/LE/LB/LD/RB`, `GOL/GK`) para o slot tático correspondente no campo 2D/3D.
  2. PROTAGONISMO & PARTICIPAÇÃO NO MODO JOGADOR (`isPlayer === true`):
     - Em partidas ao vivo do Modo Jogador, o motor de posse de bola DEVE aplicar peso prioritário para acionar o atleta do usuário no terço ofensivo/setor correspondente, garantindo participação ativa e disparando o painel interativo 'Momento Decisivo do Craque' em lances-chave e nos botões 'Comandos do Craque'.
     - Nenhuma alteração desta regra deve afetar o motor tático do Modo Treinador (`isManager === true`).
- REGRA IRRESTRITA ESPECIAL — INTEGRIDADE DE ELENCO, TÁTICA E MERCADO (MODO TREINADOR):
  1. GARANTIA DE ELENCO NÃO-VAZIO (`ensureManagerSquadHydrated`):
     - Em qualquer tela do Modo Treinador (`meutime`, `elenco`, `mercado`, `central`, `calendario`), o elenco do clube controlado pelo usuário (`state.squad`) JAMAIS pode permanecer vazio (`length === 0`).
     - A resolução de jogadores do clube DEVE normalizar acentos, espaços e caixa (`normalizeClubLookupKey`) e, caso o clube não possua elenco suficiente na base de dados (ex: clubes da Série D, estaduais ou customizados), DEVE gerar automaticamente um plantel completo de 22 atletas calibrado pelo Overall do clube (`club.ovr || 55`) e persistir no `state` antes de renderizar.
  2. SINCRONIZAÇÃO ENTRE ELENCO, CAMPO TÁTICO E MERCADO:
     - Toda vez que `state.squad` for hidratado ou alterado (contratação, venda, empréstimo ou promoção da base), os 11 titulares (`lineup[0..10]`), o Banco de Reservas, os cobradores de bola parada e os contadores do Mercado (`ELENCO`, `FOLHA MENSAL`, `MÉDIA OVR`) DEVEM ser sincronizados automaticamente.
     - O slot `0` da tática (`pitchSlot_0`) é sempre reservado ao Goleiro (`GK`).
  3. ISOLAMENTO DE SESSÃO ENTRE MODOS:
     - Ao iniciar ou carregar um save de Treinador (`MODE_MANAGER`), limpar qualquer resíduo visual ou de dados do Modo Jogador (`playerCareer`, modais de notícias anteriores, eventos de atleta).
- REGRA IRRESTRITA ESPECIAL — BLINDAGEM DE HELPERS DOM, FILTROS DE TELA, CALENDÁRIO E NOTÍCIAS:
  1. SEGURANÇA DE SELETORES DOM (`$` vs `$$`):
     - `$` retorna apenas UM elemento (`querySelector`) e `$$` retorna um Array (`Array.from(querySelectorAll)`).
     - É PROIBIDO chamar `$(...).forEach(...)` ou `$(...).map(...)` em qualquer arquivo `.js`; sempre use `$$(...).forEach(...)`.
     - `Element.prototype.forEach` deve possuir fallback seguro não-enumerável para impedir crash fatal caso algum módulo legado chame `.forEach` em um nó único.
  2. ESTADO GLOBAL EXPLÍCITO PARA FILTROS DE VIEW:
     - Toda variável de filtro de UI (`window.newsCategoryFilter`, `window.newsSearchQuery`, `window.newsOnlyMyClub`, `window.calendarFilter`, `window.calendarCompFilter`, `window.marketFilterState`) DEVE ser inicializada no escopo global (`window.*`) antes de qualquer `render()`. Nunca referenciar filtros como variáveis implícitas não declaradas.
  3. HIDRATAÇÃO GARANTIDA DE CALENDÁRIO E NOTÍCIAS NO MODO TREINADOR:
     - Ao abrir `calendario` ou `noticias` (inclusive no Dia 1 `01/01/2026`), garantir que `state.schedule` / `state.fixtures` e `state.news` estejam populados com dados válidos do clube atual e livres de resíduos do `Modo Jogador`.
- REGRA IRRESTRITA ESPECIAL — BLINDAGEM DAS ABAS CARREIRA, TEMPORADA, NOVIDADES E ESTADO GLOBAL:
  1. UNIFICAÇÃO DE PRESTÍGIO E ECONOMIA DO TREINADOR:
     - O prestígio (`state.managerPrestige`), nível (`calcManagerLevel(prestige)`) e títulos (`state.managerTitles`) DEVEM usar uma única função `getUnifiedManagerPrestige(state)` em todas as áreas (topbar, banner central da Carreira, card de Prestígio Atual e modais). É proibido exibir valores divergentes entre o cabeçalho e o painel central.
     - Todo ano exibido na Carreira (`Salário recebido na temporada ${year}`) deve ser dinâmico (`state.year || state.season || 2026`), nunca hardcoded.
     - `ensureManagerEconomyHydrated(state)` deve ser executado antes de renderizar `carreira` ou processar compras de imóveis, empresas, veículos, ações SAF ou duelos X1.
     - **Container & Layout de Carreira (`#afm-career-economy-container` / `.life-shares-container`):** É estritamente PROIBIDO aplicar `display: grid` em `#afm-career-economy-container` (pois o wrapper único `.life-shares-container` seria espremido em 1 coluna estreita à esquerda). Use `display: block; width: 100%;` no wrapper principal, `.afm-career-kpi-grid` (`repeat(auto-fit, minmax(240px, 1fr))`) nos 3 KPIs do topo e `.afm-career-catalog-grid` nos catálogos (Imóveis, Negócios, Garagem).
     - **Autoridade Única de Cliques & Sincronia SAF/P2P:** Quando `AFMCareerFix` estiver ativo, `.btnBuyProp`, `.btnSellProp`, `.btnBuyBiz`, `.btnBuyVeh` e `.btnSellVeh` respondem exclusivamente à delegação global única no `document` com trava anti-duplo-clique (proibido duplicar `.onclick` em `renderLifeAndSharesUI` para não cobrar 2x), sincronizando `state.career.*` e `state.managerPersonal.*` nos ciclos mensais. Toda transação SAF, P2P, ordem de venda em escrow ou cotas do clube DEVE invocar `syncCareerWallet()` + `calculateCareerEconomy()` mantendo paridade 100% entre `state.career.cash`, `mp.personalBalance`, `state.managerMoney` e `state.career.safPortfolio`.
  2. SINCRONIZAÇÃO DE DATAS E ROTAS NA ABA TEMPORADA:
     - Toda string ISO `YYYY-MM-DD` deve ser parseada com `T12:00:00` (`parseSafeLocalDate`) para evitar recuo de 1 dia no fuso UTC-3.
     - Todos os botões de atalho entre abas (incluindo `Ir para Meu Time & Tática` na Temporada) DEVEM conter `data-view="meutime"` e responder à delegação global de cliques.
     - Todas as variáveis de filtro de view (`window.seasonTab`, `window.seasonTableFilter`, `window.estPhase`, `window.statsTab`, `window.statsOnlyMyClub`, `window.changelogFilter`, `window.changelogSearch`, `window.newsCategoryFilter`, `window.calendarFilter`) DEVEM ser inicializadas no escopo `window.*` antes de `render()`.
  3. SANITIZAÇÃO E DINAMISMO EM NOVIDADES & CORREÇÕES:
     - Nunca renderizar crases literais (`...`) como texto cru na aba `novidades`; converter automaticamente em `<code>...</code>` e substituir nomes hardcoded pelo nome do treinador ativo.
- REGRA IRRESTRITA ESPECIAL — INTEGRIDADE DA ABA INSTALAÇÕES & ESTÁDIO (AFM MANAGER):
  1. UNIFICAÇÃO DE SUB-ABAS (ESTÁDIO & NOVA ARENA):
     - Redução estrutural de 5 para 4 sub-abas oficiais: `[1]` `🏢 INSTALAÇÕES GERAIS` (`facilities`), `[2]` `🏟️ ESTÁDIO & NOVA ARENA` (`stadium`), `[3]` `🏆 MUSEU DO CLUBE` (`museum`), `[4]` `🏠 SUA CASA & BENS PESSOAIS` (`house`).
     - Retrocompatibilidade total: qualquer link ou evento para `data-struct-tab="arena"` redireciona automaticamente para `stadium` com o submodo `new-arena` ativo (`window.afmStructureUIState.stadiumSubMode = 'new-arena'`).
     - Renderizar UM ÚNICO card 3D no topo com os dados reais do estádio do clube (`state.stadium.name`, `state.stadium.capacity`, `state.stadium.ring`), proibindo "Bezerrão 15k" ou outro fallback estático no clube do usuário.
     - Seletor segmentado com dois modos claros: `🔨 Ampliar Estádio Atual (Anéis até 100k)` e `🏛️ Construir Nova Arena Monumental`.
  2. CALCULADORA DINÂMICA DA NOVA ARENA:
     - Recálculo reativo em tempo real via `updateNewArenaCalculatorUI(state)` ao alterar os seletores de capacidade (15k, 30k, 50k, 80k, 100k) e de financiamento (à vista, 4, 6 ou 8 anos), atualizando custo de obra, total do projeto, prazo em meses e valor da parcela.
  3. SINCRONIZAÇÃO DAS INSTALAÇÕES GERAIS E MUSEU (16 NÍVEIS):
     - Escala unificada de 16 níveis (`Nível 1/16` a `Nível 16/16`) com custo inicial R$ 50.000 e capacidade 2 a 32+ taças (`getMuseumConfig`).
     - O card do Museu em `Instalações Gerais` deve obrigatoriamente exibir as linhas `.facility-stat` de capacidade da vitrine e impacto na torcida (+3% por nível).
     - Alerta visual no card de Estacionamento quando o clube tiver 0 vagas (`0 vagas • Requer ampliação`).
  4. PRIORIDADE DE TAÇAS DO SAVE NO MUSEU DO CLUBE & ZERO TÍTULOS FANTASMA NO DIA 1:
     - Unificação do acervo (`totalCount = saveCount + historyCount`) via `getUnifiedMuseumData(state)`.
     - Taças conquistadas durante o save (`saveTrophies`) possuem prioridade estrita nos slots da vitrine oficial antes de títulos históricos; quando `saveCount === 0`, `hasOverflowPenalty` DEVE ser `false` (proibido penalizar a felicidade da torcida pela metade no início da carreira por relíquias históricas ou fallback).
     - É estritamente PROIBIDO fabricar títulos no save no Dia 1 ou em temporada em andamento sem conquista comprovada (`AFM_TitlesAndHistoryService.syncAndRepairAll` nunca pode conceder `Campeonato Candango 2026` apenas porque o clube é do DF e disputa Série A/B/C/D; saves de abertura em `2026` sem partidas/histórico/copas devem ter títulos fantasma purgados automaticamente).
     - Renderização única via `#afm-unified-museum-card` (`renderUnifiedMuseumTab`), proibindo injeção duplicada de `#afm-club-own-museum-box` dentro do flex header; `upgradeMuseum()` e `#btnSkipUpgradeMuseum` DEVEM atualizar juntos `infrastructure.museum.level`, `facilities.museum` e `museumData.level` usando `getMuseumConfig()` e trava temporal contra duplo clique.
     - Botão `#btnSkipUpgradeMuseum` exibe o custo e o nível necessário calculados dinamicamente para acomodar todo o acervo.
  5. TRAVAS DE CARREIRA E SALDO BANCÁRIO EM SUA CASA & BENS PESSOAIS:
     - Validação dupla (`evaluatePersonalAssetStatus`): exige requisitos de carreira (`seasonsCompleted` e `titlesCount`) E saldo bancário pessoal disponível.
     - Itens bloqueados por carreira exibem borda vermelha, badge `🔒 BLOQUEADO` e botão desabilitado mesmo que o usuário tenha saldo em conta.
     - Resumo superior exibindo Patrimônio Pessoal Total, Bens Adquiridos e Bônus de Prestígio Social.
     - Botão `#btnOpenCbfLicensesFromHouse` integrado diretamente com o modal de Licenças CBF/UEFA.
  6. HIDRATAÇÃO SEGURA DO ESTÁDIO E INFRAESTRUTURA:
     - Antes de renderizar `estrutura`, executar `window.ensureClubStructureHydrated(state)` garantindo `state.infrastructure` válido, `state.bankLoans` como array e `state.stadiumCapacity >= 5000`.
     - Toda evolução de instalação (`upgradeFacility`) DEVE usar trava temporal (`window.__afmFacilityLock`) para impedir desconto duplo do caixa. Modais visuais devem fechar com `Esc` ou backdrop.
- REGRA IRRESTRITA ESPECIAL — RECONCILIAÇÃO CONTÁBIL E CONTRASTE EM ESCRITÓRIO & FINANÇAS:
  1. RECONCILIAÇÃO OBRIGATÓRIA ENTRE KPIS E DETALHAMENTO MENSAL:
     - Na aba `escritorio`, `Entradas previstas por mês` DEVE ser exatamente a soma dos itens exibidos em `Previsão de Receitas Mensais`, usando os valores mensais reais dos contratos ativos (`activeSponsors.reduce((sum, s) => sum + s.monthly, 0)`), nunca pools anuais ou valores base da divisão.
     - `Salários do elenco` em `Despesas e Parcelas Mensais` DEVE ser calculado dinamicamente a partir dos jogadores do clube (`calcClubMonthlySquadWages(club)` / `state.squad`), nunca exibindo `R$ 0/mês` quando houver atletas contratados.
     - `Resultado mensal estimado` = `Entradas previstas - Saídas previstas`, e `Saldo previsto no fim do mês` = `Caixa atual + Resultado mensal estimado`.
  2. CONTRASTE GARANTIDO PARA MARCAS E PATROCINADORES:
     - Toda cor de texto de patrocinador (`sponsor.color`) renderizada sobre card escuro DEVE passar por `ensureReadableBrandColor(hex)` (luminância mínima >= 0.35/0.38), impedindo texto roxo/azul escuro ilegível como `Fatal Model` (#6b21a8) e `FedEx` (#4d148c).
  3. VALIDAÇÃO DE MULTAS, SLOTS E CLIQUE DUPLO:
     - Assinatura de patrocínio e rescisão de contrato de TV DEVEM validar caixa disponível para multa rescisória e usar trava anti-duplo clique (`window.__afmOfficeActionLock`).
     - Botão da Licença CBF em `SEU CONTRATO` deve conter `id="btnOpenCbfLicensesFromOffice"` e `data-office-action="cbf-licenses"`, e card de Sócio-Torcedor deve dar feedback informativo ao clicar no plano já ativo.
- REGRA IRRESTRITA ESPECIAL — INTEGRIDADE DA ABA CONTRATOS & SALÁRIOS:
  1. CONSISTÊNCIA ENTRE CONTADORES E LISTA DE ELENCO:
     - Na aba `Contratos & Salários`, a contagem total de atletas e a contagem de `caros para o nível` DEVEM ser calculadas exclusivamente sobre o mesmo array `squadPlayers` renderizado na tela, usando uma única função `isPlayerWageExpensive(player, divisionTier)`. Nunca exibir `expensiveCount > squadPlayers.length`.
  2. INTEGRIDADE ESTRUTURAL DO DOM NA LISTA SALARIAL:
     - Todo item `.salary-item-clickable` DEVE possuir tags `<div>` rigorosamente balanceadas, agrupando `[Posição + Nome/Badge + Subtítulo]` à esquerda e `[Valor Salarial + Clique p/ renovar]` à direita dentro de um container flex único.
  3. NORMALIZAÇÃO DE CONTRATOS E CHAVES DE JOGADOR:
     - A ordenação por `CONTRATO` deve usar `getPlayerContractYear(player, currentYear)` para evitar `NaN` entre números e strings ISO.
     - O clique para renovação deve resolver o atleta por `data-player-id` primeiro e normalizar acentos (`NFD`) no fallback por `data-player-key`, com trava anti-duplo clique (`window.__afmContractModalLock`).
- REGRA IRRESTRITA ESPECIAL — INTEGRIDADE DE COMPETIÇÕES E NAVEGAÇÃO (AFM MANAGER):
  1. NAVEGAÇÃO DE DIVISÕES DO BRASILEIRÃO (SÉRIE A/B/C/D):
     - Ao clicar nas divisões (Série A/B/C/D), a interface DEVE persistir a escolha em `window.afmSeasonUIState.selectedDivision`, impedindo que a divisão do clube ativo (ex.: Série D do Ceilândia) reverta a escolha do usuário no re-render.
     - O badge do Hero da Temporada e os títulos de exibição devem refletir dinamicamente a divisão/copa ativa e o ano dinâmico `state.seasonYear || state.season || 2026` (proibido "2026" hardcoded).
  2. COPA DO BRASIL COM 126 CLUBES:
     - Inicialização e chaveamento estruturados com 126 clubes e 5 fases preliminares (1ª: 56 clubes/28 confrontos; 2ª: 36 entrantes; 3ª: 16 entrantes; 4ª: 8 entrantes; 5ª: 16 entrantes da Série A).
     - A progressão deve alimentar as Oitavas de Final (8 confrontos), Quartas, Semifinal e Final, gravando o campeão oficial no save.
     - Containers de confrontos da Copa devem conter `min-width: 0` e `text-overflow: ellipsis` para eliminar truncamento indevido de nomes de clubes.
  3. PIRÂMIDE NACIONAL CBF (SÉRIE D COM 96 CLUBES E 6 ACESSOS):
     - A Série D possui oficialmente 96 clubes e 6 acessos para a Série C.
     - As classificações e cards de acessos devem ser ordenados por critérios esportivos oficiais (Pontos, Vitórias, Saldo de Gols, Gols Pró) via `getSortedDivisionStandings`, proibindo ordenação alfabética quando há partidas disputadas.
     - Exibir badges dinâmicos `PROJEÇÃO ATUAL` vs `CONFIRMADO` conforme a rodada da temporada e oferecer atalho rápido `🇧🇷 Pirâmide CBF` na barra de divisões.
  4. INTEGRIDADE DOS TORNEIOS CONTINENTAIS E MUNDIAL:
     - No início da temporada (`01/01/2026`), nenhum resultado ou clube fixo deve constar como simulado prematuramente nas fases preliminares ou no mata-mata (`sanitizeContinentalInitialState`).
     - Fases eliminatórias antes do término dos grupos devem exibir placeholders dinâmicos (`1º Grupo A`, etc.).
     - Handoff dos 3º colocados da Libertadores para os Playoffs da Sul-Americana, e avanço dos grupos do Mundial de Clubes FIFA para as Oitavas até a grande Final, registrando campeão mundial em `state.worldSaveChampions`.
- Mantenha abas acessíveis e com o design system. Mudanças em abas exigem teste de renderização e alternância.

## Renderização e dados confiáveis

- Preserve os canvases WebGL e trate falhas de renderização; dispose recursos ao fechar/trocar cena. Não use `forceContextLoss()`/`loseContext()` em navegação normal. Detalhes em `.agents/rules/3d_game_studio.md`.
- Saves em `afm_saves` usam upsert; resposta sem corpo e sem erro confirma sucesso. Em timeout, aborte quando possível e preserve o save local. Compare timestamp apenas entre saves do mesmo modo; conflito entre treinador/jogador preserva cada cópia e nunca hidrata a carreira ativa com o outro modo. Mudanças de autenticação/RLS devem ser revisadas junto com `js/database.js` e migrations; nunca publique senhas, credenciais reais ou acesso `anon` a dados privados.
- Trate save, importação, rede e nomes como entrada não confiável: valide trust boundaries e use `esc()` em HTML; prefira propriedades/DOM APIs a interpolar dados em `innerHTML`. Arredonde dinheiro com `Math.round()`.

## Verificação

- Antes de mudar código compartilhado, localize chamadores e testes. Execute testes reais pertinentes (Node/browser), confira erros introduzidos e descreva o que não foi verificado; não declare sucesso sem evidência.
