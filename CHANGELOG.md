# 📜 CHANGELOG — AFM MANAGER 2027

Todas as principais atualizações e novidades do **Aquino Futebol Manager 2027** são documentadas neste arquivo seguindo o padrão [Keep a Changelog](https://keepachangelog.com/).

---

## [3.3.3] - 2026-10-11 (Mundo Vivo, Promoção à Série D via Estaduais, Negociação de Empréstimos, Táticas Estáveis & Calendário Realista)

### 🏆 1. Sistema de Promoção, Rebaixamento e Vagas Continentais/Nacionais
- **Acesso à Série D via Campeonatos Estaduais**: Clubes que terminam no G-2 do seu estadual (campeão ou vice-campeão, ex: Campeonato Candango) e que ainda não possuem divisão nacional superior garantida (Séries A, B ou C) são automaticamente qualificados para disputar o Campeonato Brasileiro Série D na temporada seguinte.
- **Mundo Vivo & Virada de Temporada Dinâmica**: Durante a transição de ano (`advanceSeasonYear`), rebaixamentos e acessos das Séries A, B, C, D e Estaduais são calculados e sincronizados no estado (`state.competitionTeams`) e em `window.COMPETITION_TEAMS`, eliminando divisões estáticas ou vazias.
- **Vagas Continentais por Região**: Qualificação e visualização oficial por continentes:
  - *América do Sul*: Copa Libertadores (Fase de Grupos G4 e Pré-Libertadores G6) e Copa Sul-Americana (G7 a G12).
  - *Europa*: Fase de Liga da UEFA Champions League (G4) e UEFA Europa League (G5/G6).
  - *Ásia*: AFC Champions League Elite (G3) e AFC Champions League Two.
  - *Mundial de Clubes FIFA*: Torneio oficial de 32 clubes.
- **Unificação da Tela de Temporada**: Removida a aba redundante "Divisões Nacionais". A visualização da divisão nacional do clube (`🇧🇷 Série A/B/C/D`) foi integrada diretamente ao lado do seu respectivo Estadual (`🏆 Campeonato Estadual`), Copa do Brasil e Continental, com alternância instantânea.

### 🤝 2. Gestão Completa de Empréstimos e Mercado
- **Bloqueio de Renovação Indevida**: Atletas com vínculo de empréstimo (tag `Emprestado`) não abrem mais o modal de renovação salarial direta com o jogador.
- **Modal de Negociação com Clube Detentor**: Ao clicar em "Propostas / Negociar", abre-se um modal dedicado com 3 opções claras de gestão:
  1. *Comprar em Definitivo*: Exercer opção de compra pelo valor de mercado fixado.
  2. *Solicitar Extensão de Empréstimo*: Prorrogar o empréstimo por 6 ou 12 meses mantendo o rateio salarial.
  3. *Devolver Atleta*: Encerrar o empréstimo antecipadamente e devolver o jogador ao clube de origem.
- **Tag Visual e Acesso Rápido**: Indicador visual nos detalhes do atleta e na tela de salários com atalho "Negociar c/ detentor ➔".

### 📋 3. Táticas: Persistência do Acordeão e Sliders Automatizados
- **Correção do Acordeão Tático**: O acordeão `<details>` não colapsa mais ao alternar entre os botões de tática (Tática A, B e C), mantendo seu estado aberto via `e.stopPropagation()` e flag de persistência `state.tacticsAccordionOpen`.
- **Automação de Sliders por Presets**: A seleção de estilos nos seletores de "Construção de Jogo" (*Posse Paciente*, *Transição Rápida*, *Equilibrado*, *Bola Longa*) e "Postura Defensiva" (*Pressão Alta*, *Bloco Médio*, *Linha Baixa / Retranca*, *Pressão Pós-Perda*) atualiza de imediato os sliders numéricos de Altura da Linha, Pressão, Largura e Ritmo.

### 📅 4. Calendário Realista Intercalado
- **Fins de Semana para Ligas e Meio de Semana para Copas**: Jogos de campeonatos nacionais e estaduais calibrados para sábados e domingos; partidas de Copa do Brasil e competições continentais intercaladas às quartas-feiras contínuas sem semanas vazias.
- **Badges de Dia da Semana**: Identificação visual no card de partidas com selos coloridos (`QUA` em azul, `SÁB` e `DOM` em verde).

### 📰 5. Atualização da Aba "Novidades & Correções"
- Registro oficial da Versão 62 / 3.3.3 no topo do changelog interno do jogo.

---

## [3.3.2] - 2026-10-10 (Correção das Velocidades 2x/5x/10x & Otimização do Cabeçalho Tático)

### ⏱️ Controles de Velocidade da Partida ao Vivo (1x, 2x, 5x, 10x, 20x, 40x)
- **Registro Completo de Eventos**: Correção dos botões de aceleração da partida (`2x`, `5x` e `10x`), que agora possuem ouvintes de clique e alternância visual de estado ativo funcionais.
- **Escala Proporcional Contínua**: O acumulador de tempo do laço do Canvas e simulação de minutos avança de forma rigorosamente proporcional à velocidade selecionada, com proteção contra travamento.

### 📋 Simplificação e Reorganização Tática (`Meu time & Tática`)
- **Remoção de Duplicidade**: Removido o botão redundante `⭐ Melhor XI` do cabeçalho, unificando a ação inteligente de escalação no botão oficial `⭐ DEIXAR A IA ESCALAR`.
- **Reposicionamento da Formação**: O seletor de formação tática (`4-3-3`, `4-4-2`, etc.) foi movido para o painel inferior, alinhado diretamente ao lado dos indicadores setoriais de ATA, MEI e DEF.

### 🚀 Otimização Crítica e Alívio da Aba Mercado (`MERCADO`)
- **Eliminação de Gargalo O(N×M)**: Implementado cache O(1) de clubes via `Map` em `clubByName()`, eliminando até 800.000 iterações lineares com expressões regulares e normalizações Unicode por filtragem.
- **Indexação Prévia do Universo (`marketUniverse`)**: Atributos de pesquisa (`searchStr`), overall (`ovr`), valor financeiro (`value`), clube normalizado (`clubNorm`) e país (`countryNorm`) agora são pré-computados uma única vez na geração do cache.
- **Navegação Fluida Entre Menus e Sub-Abas**: A troca entre *Comprar*, *Vender*, *Empréstimo* (*Pegar Emprestado*, *Ceder*, *Meus Empréstimos*), *Olheiros* e *Giro do Mercado* agora ocorre em menos de 1ms sem travamentos da interface.

---

## [3.3.1] - 2026-10-10 (Substituição 100% por Clique, Posicionamento Livre & Eliminação de Drag-and-Drop)

### 🔁 Sistema Unificado de Substituição por Clique (Click-to-Swap)
- **Substituição Bidirecional**: Troca automática ao clicar em Titular ➔ Reserva ou Reserva ➔ Titular em ambos os menus (menu tático pré-jogo/carreira e modal de substituição durante a partida).
- **Inversão de Titulares**: Ao clicar em dois titulares consecutivamente, suas posições táticas são invertidas de forma imediata e consistente.
- **Eliminação do Drag-and-Drop**: Remoção da dependência de eventos nativos de arrastar e soltar (`dragenter`, `dragover`, `drop`, `draggable="true"`), acabando com travamentos de rolagem e toques em telas menores e dispositivos móveis.
- **Interação sem Atraso**: Inclusão de `touch-action: manipulation` e estilos otimizados para seleção visual clara (`selected`, `pulse-selected-slot`).

### 🎯 Jogadores em Qualquer Função & Fit Tático Visual
- **Liberdade Tática Total**: Qualquer atleta pode ser escalado em qualquer posição tática.
- **Penalização Controlada de Overall Efetivo**:
  - Posição **★ IDEAL** (verde): sem penalidade (0).
  - Posição **ADAPTADA** (amarela): penalidade leve de -3 no overall efetivo.
  - Posição **INCOMPATÍVEL** (vermelha): penalidade de -6 no overall efetivo (-8 para goleiro na linha ou jogador de linha no gol).
- **Preservação de Dados**: O overall base original do atleta no elenco (`state.squad`) é estritamente preservado e nunca modificado permanentemente.
- **Feedback Visual Completo**: Mini cards exibem crachá `(POS)` com cor amarela ou vermelha e pontuação de overall compatível; slots no campo acendem em verde, amarelo e vermelho mantendo todos os 11 slots 100% clicáveis.

### 🏟️ Resolução Imediata de Propostas de Show e Aluguel de Estádio
- **Remoção Instantânea do Card na Central**: Ao autorizar ou recusar shows ou aluguéis no estádio, a mensagem desaparece imediatamente do painel central.
- **Implementação de `addNews`**: Correção de referência indefinida ao registrar notícias de megaeventos no feed do clube com limite de persistência de 50 registros.

---

## [3.3.0] - 2026-10-09 (Motor Dual de Áudio Imersivo, Sanitização Visual do Match Engine & Governança Modular)

### 🔊 Motor Dual de Áudio de Alta Fidelidade (`AFMAudioManager`)
- **Dois Canais Independentes**: Canal Ambiente (cantos reais de torcida em loop contínuo) e Canal SFX (efeitos sonoros de baixa latência para apito, faltas, cartões, gols e traves).
- **Detecção Inteligente de Torcida**: O motor detecta o clube mandante e a competição ativa, buscando arquivos de torcida específicos (`sounds/crowd/<liga>/<clube>.mp3`) com hierarquia de fallback até a síntese de drone procedural via Web Audio API.
- **Síntese Procedural Fallback**: Caso arquivos MP3 não estejam presentes localmente, a Web Audio API sintetiza apitos em frequência harmônica (2.8 kHz / 3.5 kHz), clamor de torcida, batidas na trave e reações de perigo, garantindo som imediato 100% offline.
- **Gatilhos Automáticos no Match Engine**:
  - Apito inicial aos 0' (`whistle_start`) e início da atmosfera de torcida.
  - Faltas marcadas (`whistle_foul`) e advertências com cartão (`whistle_card`).
  - Intervalo aos 45' (`whistle_halftime`) e reinício aos 46' (`whistle_start`).
  - Apito final aos 90' (`whistle_end`) com fade-out gradual da torcida.
  - Explosão sonora no gol (`goal_celebration`) com elevação dinâmica do clamor da torcida (+30dB temporário).
  - Bola na trave (`goal_post`) e suspiros da torcida em defesas e chutes perigosos (`crowd_gasp`).
- **Persistência de Preferências**: Controles salvos no `localStorage` (`afm_crowd_audio_enabled`, `afm_sfx_audio_enabled`, `afm_crowd_volume`, `afm_sfx_volume`).

### 🎛️ Nova Interface de Configurações de Áudio
- Painel modular (`AFMSettingsUI`) integrado à aba de Configurações / Opções do jogo.
- Toggles neon para ativação independente de Torcida e SFX, com sliders de volume de 0 a 100% e botões para teste imediato de áudio.

### 📺 Sanitização Visual da Transmissão do Match Engine
- **Experiência de Transmissão Autêntica**: Remoção definitiva do HUD técnico de telemetria crua (`#liveTelemetryHud`), botões de depuração (`🐞 HUD`) e logs de coordenadas na tela.
- **Foco no Espetáculo**: Transmissão cinematográfica focada exclusivamente no placar oficial, relógio dinâmico, narração futebolística envolvente e movimentação ativa dos 22 atletas no gramado 2.5D.

### 📁 Governança de Mídias e Automação de Estrutura Física
- Criação do script automatizador `create_audio_structure.js` e executável `create_audio_structure.bat`.
- Estruturação da taxonomia física oficial em `sounds/sfx/` e `sounds/crowd/<leagues>/`.
- Geração do manifesto de áudios `sounds/sounds_manifest.json` e documentação técnica em `sounds/README.md`.

---

## [3.2.0] - 2026-10-08 (Expansão Mundial Oficial & Overhaul do Match Engine 2.5D)

### 🌎 Expansão Internacional Oficial (América do Sul & Europa)
- **Regra de Preservação Absoluta (Regra Nº 1)**: Todos os 156 clubes brasileiros das Séries A, B, C, D, estaduais e torneios existentes foram 100% preservados, sem alteração de IDs ou remoções.
- **América do Sul Completa**:
  - **Argentina**: Liga Profesional (30 clubes reais) e Primera Nacional (20 clubes reais).
  - **Chile**: Primera División (16 clubes reais) e Primera B (14 clubes reais).
  - **Uruguai**: Primera División (16 clubes reais) e Segunda División (12 clubes reais).
  - **Colômbia**: Liga BetPlay (20 clubes reais) e Torneo BetPlay (16 clubes reais).
  - **Paraguai**: Primera División (12 clubes reais) e División Intermedia (12 clubes reais).
  - **Equador**: LigaPro Serie A (16 clubes reais) e LigaPro Serie B (10 clubes reais).
  - **Peru**: Liga 1 (18 clubes reais).
  - **Bolívia**: División Profesional (16 clubes reais).
  - **Venezuela**: Liga FUTVE (14 clubes reais).
- **Grandes Ligas Europeias & Divisões Reais**:
  - **Inglaterra**: Premier League (20 clubes), EFL Championship (24 clubes), EFL League One (24 clubes).
  - **Espanha**: LaLiga (20 clubes), LaLiga Hypermotion (22 clubes).
  - **Itália**: Serie A (20 clubes), Serie B (20 clubes).
  - **Alemanha**: Bundesliga (18 clubes), 2. Bundesliga (18 clubes).
  - **França**: Ligue 1 (18 clubes), Ligue 2 (18 clubes).
  - **Portugal**: Primeira Liga (18 clubes), Liga Portugal 2 (18 clubes).
  - **Países Baixos**: Eredivisie (18 clubes), Eerste Divisie (20 clubes).
  - **Outras Ligas**: Bélgica (Pro League), Turquia (Süper Lig), Escócia (Premiership).
  - **Torneios Continentais**: UEFA Champions League (36 clubes na fase de liga) e UEFA Europa League (36 clubes).
- **Mapeamento de Escudos Oficiais**: Vinculação em `CLUB_BADGES` dos escudos reais já contidos no diretório de assets para as novas equipes.

### 🎮 Overhaul do Match Engine 2.5D & Fim do "Jogo Parado 5x0"
- **Movimentação Dinâmica em Campo**: Os bonecos agora se deslocam ativamente no gramado 2.5D. O condutor da bola progride em direção ao gol adversário, o defensor mais próximo fecha o espaço pressionando a jogada e os companheiros se desmarcam em profundidade.
- **Transição de Bola & Passes Fluídos**: A posse agora é contínua e inteligente. Quando pressionado, o jogador efetua passe para companheiro livre com trajetória real e arco parabólico. Ao final de chutes ou defesas, o goleiro repõe a bola para os zagueiros.
- **17 Formações Táticas Oficiais**: Adição completa de 17 esquemas táticos (4-3-3, 4-3-3 Holding, 4-2-3-1, 4-4-2, 4-4-1-1, 4-2-1-3, 4-2-2-2, 4-3-2-1, 4-3-1-2, 4-1-2-1-2, 4-1-4-1, 4-5-1, 5-3-2, 5-2-1-2, 5-2-3, 3-5-2, 3-4-2-1, 3-4-3).
- **Funções Táticas e Foco Individual**: Goleiro Líbero, Zagueiro Construtor, Lateral Ofensivo, Volante Box-to-Box, Meia Armador, Camisa 10 Criador, Ponta Invertido e Centroavante Referência integrados aos cálculos de atributos e movimentação.
- **Diagnóstico Tático Pós-Jogo**: Painel exclusivo ao final da partida analisando o motivo da vitória, empate ou derrota com base em xG, postura tática e volume de chances.

---

## [3.1.4] - 2026-10-08 (Janelas Anuais, Match Engine Dinâmico, Correção de Entidades & Ordenação do Mercado)

### 📅 Janelas de Transferência Anuais Multitemporada
- **Duas Janelas por Temporada**: Configuração dinâmica `TRANSFER_WINDOWS` com Janela 1 (01/01 a 01/03) e Janela 2 (01/06 a 01/08), válida para qualquer ano de carreira.
- **Mercado Fechado Fora da Janela**: Bloqueio ativo de compras e empréstimos fora do período com banner explicativo e data da próxima janela na interface.
- **Abertura e Fechamento Automáticos**: Acompanhamento do avanço diário do calendário (31/12 ➔ 01/01 aberto, 01/03 ➔ 02/03 fechado, 31/05 ➔ 01/06 aberto, 01/08 ➔ 02/08 fechado).

### ⚽ Fim do "Cara Parado" & Entidades no Gramado
- **Isolamento Estrito do Goleiro**: Apenas o índice 0 de cada time recebe a condição `isGK = true`. Reservas ou atletas com posição GK escalados na linha recebem posição de linha, movimentam-se normalmente e vestem o uniforme correto.
- **Árbitro Oficial no Gramado**: Inclusão de entidade oficial `REFEREE` com uniforme amarelo neon fluorescente, posicionamento dinâmico acompanhando a bola e bloqueio absoluto de participação em chutes, assistências e gols.
- **Validação Rigorosa de Scorer e Eventos**: Funções `validateGoalScorer()`, `validateAssist()` e `validateMatchEvent()` impedem qualquer entidade inválida, fantasma ou do time adversário de marcar gols.

### 🎮 Match Engine Variado & Simulações Únicas
- **14 Padrões Táticos de Ataque**: Introdução de jogadas dinâmicas (construção curta, bola longa, contra-ataque rápido, infiltração, cruzamento, tabela rápida, drible desequilibrante, pressão alta e chutes de longe) ponderadas pela postura tática.
- **Histórico Anti-Repetição**: `recentPlayPatterns` penaliza sequências idênticas em 80%, gerando partidas imprevisíveis e com narrativa fluida.
- **Identidade Única por Partida**: Cada partida possui `matchId`, `seed` PRNG independente, timeline própria e eventos estruturados com causa, minuto, segundo, artilheiro e assistente.

### 🛒 Ordenação Estável e Imutável no Mercado
- **Seletor de Ordenação**: Novo controle no Mercado com opções: Recomendado, Nome (A-Z / Z-A), Idade (menor / maior), Preço (menor / maior) e Overall (maior / menor).
- **Pipeline Seguro**: Dados do atleta não são alterados; pipeline filtra, ordena estavelmente com critérios de desempate e renderiza com alta performance.

---

## [3.1.3] - 2026-10-08 (Sincronização Total da Tabela, Início Confiável de Partida & Calendário)

### 📊 Sincronização Absoluta da Tabela (Fim dos Jogos Desiguais)
- **Igualdade Rigorosa de Partidas**: Corrigido o bug que aplicava resultados das demais partidas antes do jogo do usuário ser concluído, fazendo adversários acumularem 4 jogos enquanto o clube do treinador tinha apenas 1.
- **Aplicação Sincronizada**: Todos os resultados da rodada agora são gravados simultaneamente no apito final. Todos os 20 clubes da divisão mantêm sempre a mesma quantidade exata de jogos disputados.
- **Auto-Reparo de Saves Ativos**: Adicionada auditoria automática (`auditAndSyncLeagueTable`) que repara instantaneamente tabelas dessincronizadas em carreiras já salvas.

### ⚽ Partida Ao Vivo & Botão "JOGAR" 100% Funcional
- **Entrada Imediata no Gramado**: Corrigida a montagem do elenco visitante em `buildMatchTeam` e a busca de confrontos normalizada em `userFixture`.
- **Fim da Intercepção Indesejada**: Clicar em "JOGAR" agora carrega confiavelmente a partida e transmissão ao vivo 2.5D sem redirecionar para a coletiva ou simulação.

### 📅 Sincronização Perfeita de Datas & Calendário
- **Datas Coerentes e Alinhadas**: Unificação das datas entre o cabeçalho superior, Central do Jogo e aba Calendário através de `getDateForRound()`.
- **Exibição Formatada em pt-BR**: O tempo e as datas agora avançam pontualmente semana a semana (10 de janeiro, 17 de janeiro, 24 de janeiro, etc.) batendo perfeitamente com os confrontos programados.

---

## [3.1.2] - 2026-10-08 (Escudos Oficiais, Elencos 100% Reais & Múltiplos Saves)

### 🛡️ Escudos Autênticos & Correção Geral
- **Todos os Escudos Corrigidos**: Correção e verificação de América-MG, Athletic Club, Atlético-GO, Botafogo-SP, Ceará, CRB, Criciúma, Juventude, Londrina, Náutico, Novorizontino, Operário-PR, Ponte Preta, São Bernardo, Sport, Vila Nova, Paysandu, Brusque, Volta Redonda, Ypiranga-RS, Ituano, Água Santa, Botafogo-PB, Inter de Limeira e Santa Cruz em SVGs vetoriais nítidos em alta definição.
- **Matching Rigoroso de Clubes**: O motor de renderização de escudos agora utiliza busca exata por limites de palavras, impedindo sobreposições visuais indesejadas entre clubes de nomes semelhantes.

### 👥 Elencos 100% Reais da Vida Real
- **Base Completa das Séries A e B**: Mais de 1.250 jogadores reais cadastrados com posições, idades e atributos fiéis à realidade para os 20 clubes do Brasileirão Série A, 20 clubes da Série B, equipes da Série C/D e clubes mundiais.
- **Fim dos Jogadores Genéricos em Clubes Oficiais**: O motor do jogo não gera mais atletas genéricos falsos para clubes que possuem elenco real cadastrado, mantendo o mercado e os confrontos 100% autênticos.

### ⏱️ Início Limpo na Pré-Temporada & Coletiva Pós-Jogo
- **Carreira Zerada**: Removida a derrota fantasma ao criar novo jogo; histórico inicial começa 100% zerado (0 jogos, 0 derrotas).
- **Janela de Pré-Temporada**: A carreira inicia na janela aberta com opção de avançar dia a dia ou avançar diretamente para a estreia oficial do campeonato.
- **Sala de Imprensa Exclusiva Pós-Jogo**: A coletiva agora surge exclusivamente após o apito final das partidas.
- **Notícias Limpas**: Removido o botão "Compartilhar ↗" do feed de notícias.

### 💼 Negociação Definitiva & Folha Salarial
- **Transparência Orçamentária**: Exibição da folha salarial atual do clube e projeção do novo impacto financeiro em tempo real no cabeçalho e na proposta salarial.
- **Slider Fluido a 60 FPS**: O controle de salário não trava mais ao deslizar; cálculo instantâneo sem recarregar o modal.

### 💾 Gerenciador Completo de 3 Slots de Gravação
- **Independência dos Saves**: Slots 1, 2 e 3 salvam trajetórias separadas sem sobrescrever o slot anterior.
- **Painel em Configurações**: Nova interface na aba *Save & Backup Local* permite visualizar suas 3 campanhas, salvar no slot em uso, carregar outra carreira ou retornar ao Menu Principal.

---

## [3.1.1] - 2026-10-08 (Correção Crítica: Entrada Direta na Partida & Coletivas)

### ⚽ Correção do Botão "JOGAR" & Sala de Imprensa
- **Início Imediato da Partida**: O botão "JOGAR" agora leva o treinador diretamente para o campo e transmissão ao vivo da partida, sem ser interceptado ou bloqueado pela coletiva de imprensa pré-jogo.
- **Resolução de Erro de Execução**: Corrigida a chamada de rivalidade interna (`isRivalryMatch`), prevenindo falha que impedia o carregamento do estádio 2.5D.
- **Coletiva Pré-Jogo Acessível**: O botão dedicado `🎙️ COLETIVA` na Central agora abre diretamente a coletiva pré-jogo contra o adversário da rodada, mantendo a coletiva pós-jogo dinâmica após o apito final.

---

## [3.1.0] - 2026-10-08 (Versão 61 - Revolução Tática & Auditoria Pro)

### 🛡️ Linhas de Pressão & Blocos Defensivos
- **Postura Tática Ativa**: Seleção de Bloco Baixo ("Ônibus" na Área), Bloco Médio (Equilibrado) e Bloco Alto (Pressão na Saída) com influência matemática na distribuição de gols Poisson.

### 🔥 Gritos do Treinador na Simulação Ao Vivo
- **Comandos à Beira do Gramado**: Comande o time em tempo real (Subir Linhas, Calma & Posse, Fechar Espaços) com apito de arbitragem e narração dinâmica.

### 🏆 Copinha Sub-20 (Copa São Paulo de Juniores)
- **Torneio de Base Oficial**: Disputa direta no modal de Categorias de Base com premiação de R$ 350.000 e geração de até 2 wonderkids (POT 84-94).

### 🤝 Mentoria de Veteranos & Comparador Head-to-Head
- **Tutela de Jovens**: Atletas 30+ orientam promessas Sub-21 acelerando o ganho de OVR.
- **Comparador Lado a Lado**: Análise direta de dois atletas na aba Elenco com gráficos comparativos de atributos e custos.

### 💰 Cláusula de Venda Futura (Sell-On Fee 20%)
- **Direitos Econômicos Retidos**: 20% retidos automaticamente ao vender atletas para outros clubes, faturando milhões quando são revendidos no exterior.

### ⚖️ Auditoria Contábil da Folha & Proteção de Código
- **Correção da Folha por Rodada**: Eliminação da duplicação de fórmulas e escalonamento de salários por divisão, estornando valores em saves afetados.
- **Atalhos Inteligentes & Proteção**: Atalho Ctrl+C desvinculado da Central (livre para copiar), e bloqueio de download de página via Ctrl+S.

---

## [3.0.0] - 2026-10-08 (AFM 3.0 Next-Gen)

### ⚽ Prancheta Tática 2.5D & Posicionamento Visual Dinâmico
- **Prancheta Estilo FM/FIFA Manager**: Posicionamento 2D/2.5D renderizado na tela de escalação com posições reais dos atletas no campo.
- **Instruções Individuais ao Jogador**: Definição de postura (Equilibrado, Ofensivo, Defensivo, Playmaker) com modal dedicado de instruções táticas.
- **Capitão & Bolas Paradas**: Seleção direta do Capitão da equipe e dos cobradores oficiais de faltas e pênaltis na escalação.

### 🌟 Academia de Categorias de Base Pro
- **Peneiras Anuais (Sub-17 & Sub-20)**: Geração de joias brasileiras e promessas com relatórios detalhados de potencial.
- **Promoção Imediata**: Botão de promoção de jovens promessas diretamente para o elenco profissional com apenas um clique.
- **Scouting de Potencial**: Análise de teto de desenvolvimento com estrelas e atributos-chave.

### 🏋️ Sistema de Treinamento Avançado com Foco Posicional
- **Regimes de Treinamento**: Focos em Finalização, Passe/Armação, Defesa/Marcação, Físico/Resistência e Equilibrado.
- **Intensidade Customizável**: Controle de carga (Leve, Moderada, Intensa) impactando a fadiga e velocidade de ganho de atributos.
- **Ganhos Semanais de XP**: Evolução semanal automática refletida nas rodadas da temporada.

### 🔊 Efeitos Sonoros Nativos (Web Audio API)
- **Áudio Sintetizado 100% Nativo**: Zero bibliotecas externas ou arquivos de áudio pesados.
- **Efeitos de Jogo**: Apito de árbitro em faltas e encerramento, explosão de comemoração de gol, vibração da trave e cantos da torcida.

### 🌐 Amistosos Multiplayer Assíncronos (Cloud)
- **Desafios Interestaduais**: Sistema para buscar o save de outros treinadores no Supabase pelo nome de usuário e simular amistosos contra seus elencos.
- **Histórico de Confrontos**: Registro de duelos e estatísticas contra outros jogadores.

### ⚖️ Auditoria Contábil & Fair Play Financeiro
- **Auditoria Periódica de Gastos**: Detecção automática de riscos fiscais com folha salarial e despesas.
- **Premiação de Boa Governança**: Bônus de caixa e confiança da diretoria quando as metas fiscais são cumpridas.

---

## [1.0.0] - 2026-10-08 (Versão Anterior)

### 🏦 Sistema Bancário, Financiamento & Crédito
- **8ª Instalação no Campus**: Adicionada a estrutura **Banco & Financiamento** no campus do clube e no Escritório.
- **Linhas de Crédito**: Linhas de R$ 500 mil até R$ 30 milhões baseadas na reputação e divisão do clube.
- **Taxas Dinâmicas (CET)**: Cálculo dinâmico de juros proporcionais ao montante e prazo de amortização.
- **Parcelamento Flexível**: Escolha de prazos em 6x, 12x, 24x ou 36x com débito automático por rodada.
- **Antecipação com Bônus**: Desconto de 12% nos juros não incorridos ao amortizar ou quitar parcelas antecipadamente.
- **Juros de Mora & Fair Play Financeiro**: Multa acumulativa de +2% por rodada em caso de atraso e aplicação automática de **Transfer Ban** após 2 parcelas vencidas.

### 🔍 Filtros & Otimização do Mercado
- **Botão `🔍 Pesquisar`**: Disparo instantâneo da filtragem de jogadores nas abas de Comprar e Empréstimos.
- **Suporte a Tecla Enter**: Busca instantânea por nome de jogador ou clube.
- **Botão `Limpar`**: Redefinição com um clique de todos os filtros em cascata (Continente, País, Competição, Clube, Posição e Saldo).
- **Giro do Mercado Mundial (IA)**: 5ª aba dedicada com feed em tempo real de transferências entre outros clubes do país e do mundo.
- **Propostas Milionárias Oficiais**: Propostas de clubes gigantes por jogadores titulares com documento timbrado, cláusula de 20% de venda futura e opção de contraproposta (+20%).

### ⚽ Motor de Jogo, Estaduais & Transmissão 2.5D
- **Sincronização Oficial dos 11 Estaduais**: Tabela dinâmica atualizada rodada a rodada espelhando resultados reais do usuário e da IA.
- **Inteligência Tática 2.5D**: Marcação em bloco coordenada pelo adversário e infiltrações táticas dos atacantes.
- **Voz da Torcida (#AFM2027)**: Feed social interativo pós-jogo com comentários dinâmicos da arquibancada.
- **Virada de Temporada**: Cerimônia oficial de encerramento, premiações milionárias, evolução anual e transição para o novo ano.
- **Hall da Fama**: Arquivo imortalizado com o histórico de temporadas, títulos e patrimônio da carreira.

---

## [Marcos Históricos Anteriores]

### [0.7.0] - Arenas, Central de Novidades & 11 Estaduais
- Vitrine das 12 Arenas históricas com capacidades, fotos e donos.
- Painéis de acesso rápido no topo da landing page e 75 novidades paginadas na Central.
- Vitrine completa dos 11 Campeonatos Estaduais oficiais do Brasil.
- Correção de inputs de login e alinhamento do checkbox de acesso.

### [0.6.0] - Nuvem Híbrida & Supabase Sync
- Integração da API Supabase com tabelas `afm_users` e `afm_saves`.
- Isolamento de 3 slots de saves por treinador com salvamento instantâneo no LocalStorage.
- Deploy contínuo na Vercel com cabeçalhos `Cache-Control: no-cache`.

### [0.5.0] - Motor Tático & Gestão de Estádio
- Expansão monumental de arenas (15.000 a 100.000 lugares).
- Gestão de bilheteria e estacionamento (500 a 14.000 vagas) com sliders dinâmicos.
- Categoria de Base de 15 a 18 anos integrada e Departamento de Marketing.
- Janela de transferências oficial com datas de Verão e Inverno.

### [0.1.0 - 0.4.0] - Fundação do Projeto
- Estruturação inicial das Séries A, B, C e D (96 clubes) e Copa do Brasil.
- Campo tático visual, catálogo de clubes e banco de dados de jogadores reais.
