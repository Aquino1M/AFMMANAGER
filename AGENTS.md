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
- FootGram registra `createdDate`, calcula idade pela data simulada e gera autores do clube/elenco/imprensa uma vez por dia; reage ao desempenho, marca posts legados sem data e respeita o limite/idempotência. Ações do empresário abrem modal ou feedback; busca respeita janela, uma proposta manual por dia e até três ofertas, com termos iguais aos da assinatura.
- Valor de mercado tem uma fonte: `marketValueMi`/`value` (milhões) e `marketValue` (reais); converta uma vez e use fallback por OVR. Seleção Nacional processa cada jogo uma vez; não convocados não recebem caps nem estatísticas individuais.
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
  1. Ao entrar na tela inicial (`.setup-container`), o jogo deve pausar auto-saves (`window.__afmAutoSavePaused = true`) e marcar `#app` com `data-rendered-game-mode="setup"`.
  2. Toda nova carreira (Treinador, Carreira Jogador ou Criar Seu Time) deve selecionar automaticamente um slot vazio por padrão, pedir confirmação explícita caso o jogador escolha um slot ocupado, e inicializar um objeto `state` 100% limpo sem resíduos de campanhas anteriores.
  3. Todo carregamento de save (local, arquivo JSON ou nuvem Supabase) deve passar obrigatoriamente por `AFM_SETUP_GUARD.sanitizeLoadedSave()` com deep-clone antes do primeiro `render()`, garantindo que um save de Treinador jamais abra no Modo Jogador e vice-versa.
- Mantenha abas acessíveis e com o design system. Mudanças em abas exigem teste de renderização e alternância.

## Renderização e dados confiáveis

- Preserve os canvases WebGL e trate falhas de renderização; dispose recursos ao fechar/trocar cena. Não use `forceContextLoss()`/`loseContext()` em navegação normal. Detalhes em `.agents/rules/3d_game_studio.md`.
- Saves em `afm_saves` usam upsert; resposta sem corpo e sem erro confirma sucesso. Em timeout, aborte quando possível e preserve o save local. Compare timestamp apenas entre saves do mesmo modo; conflito entre treinador/jogador preserva cada cópia e nunca hidrata a carreira ativa com o outro modo. Mudanças de autenticação/RLS devem ser revisadas junto com `js/database.js` e migrations; nunca publique senhas, credenciais reais ou acesso `anon` a dados privados.
- Trate save, importação, rede e nomes como entrada não confiável: valide trust boundaries e use `esc()` em HTML; prefira propriedades/DOM APIs a interpolar dados em `innerHTML`. Arredonde dinheiro com `Math.round()`.

## Verificação

- Antes de mudar código compartilhado, localize chamadores e testes. Execute testes reais pertinentes (Node/browser), confira erros introduzidos e descreva o que não foi verificado; não declare sucesso sem evidência.
