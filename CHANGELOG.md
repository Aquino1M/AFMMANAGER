# 📜 CHANGELOG — AFM MANAGER 2027

Todas as principais atualizações e novidades do **Aquino Futebol Manager 2027** são documentadas neste arquivo seguindo o padrão [Keep a Changelog](https://keepachangelog.com/).

## [3.9.19] - 2026-10-20 (Feed de Notícias "Passando os Dias - X de Y" & Hub Pós-Jogo com Escolha de Entrevista)

### 📰 1. Feed Oficial de Notícias & Passagem dos Dias (`AFM_DayAdvanceNews`)
- **Modal "PASSANDO OS DIAS - X DE Y" Fiel ao Layout de Referência**:
  - Modal estilizada em tema roxo escuro com cabeçalho `PASSANDO OS DIAS · X DE Y` e feed cronológico dos dias simulados.
  - Agrupamento diário com formato de data brasileiro (`QUI, 29 JAN 2026`, `SEX, 30 JAN 2026`, `SÁB, 31 JAN 2026`), indicando `Dia sem jogos` ou `${N} partidas marcadas · hoje`.
  - Cards de notícias categorizados com bordas de destaque:
    - **Borda Roxa (Negócios Fechados)**: Transferências e reforços entre clubes brasileiros com valores em R$ (`Negócio fechado: Léo Aragão troca o Avaí pelo Águia Negra por R$ 510.000`, `Rafael Mariano deixa o ASA e assina com o Vilavelhense`).
    - **Borda Laranja (Mercado & Propostas)**: Investidas e rumores de mercado (`Maguary quer Kauã Oliveira e põe R$ 160.000 na mesa`).
    - **Borda Vermelha (Disciplina & DM)**: Cartões, suspensões e lesões (`Geovani Silva é expulso e desfalca o Galvez`).
    - **Card Dourado (Alerta de Jogo)**: Destaque de partida no dia do confronto (`HOJE TEM JOGO · SAMAMBAIA X REAL BRASÍLIA`).
  - Botão de rodapé `CONTINUAR >` com gradiente roxo, efeito neon e fechamento suave.

### 🎙️ 2. Hub Pós-Jogo com Escolha de Entrevista Coletiva (`triggerPostMatchFlow`)
- **Fim da Obrigatoriedade de Coletiva Forçada**:
  - Ao terminar a partida, é aberto o Hub Pós-Jogo exibindo o placar final, badge de resultado e 3 opções de escolha para o usuário:
    1. **🎙️ Dar Entrevista Coletiva**: Entra na sala de imprensa oficial, responde às perguntas dos repórteres (influenciando moral e confiança) e em seguida abre o feed de notícias.
    2. **📰 Ver Últimas Notícias do Dia**: Abre imediatamente o feed "Passando os Dias" com os bastidores e transferências sem precisar responder a entrevistas.
    3. **🏠 Ir Direto para a Central**: Retorna direto para a tela central da carreira.
- **Integração Integral em Todas as Competições**:
  - Unificado e ativo na Copa do Brasil, Campeonatos Estaduais, Partida ao Vivo 3D, Simulação Rápida e Torneios Continentais.

### 📅 3. Integração com o Avanço de Calendário
- Ao clicar em "ATÉ O JOGO" ou avançar datas, o feed "Passando os Dias" é exibido mostrando os acontecimentos diários até a data da partida.

## [3.9.18] - 2026-10-20 (Integração Oficial do Pack de Estádios 3D Low-Poly BRFC27 & Visualizador Orbital 360°)

### 🏟️ 1. Pack Oficial de Estádios 3D Low-Poly (`BRFC27_Pack_Estadios_Leves`)
- **4 Modelos 3D Volumétricos em formato GLB Otimizado**:
  - `arena_aberta.glb` (225 KB / 9.504 triângulos): Estádio tradicional raiz com arquibancadas abertas e torres de iluminação nos 4 cantos para clubes de divisões de acesso e centros regionais (capacidade até 15.000 lugares).
  - `arena_classica.glb` (270 KB / 12.912 triângulos): Arquitetura clássica brasileira em ferradura, marquise de cobertura lateral metálica e cabeceiras populares (capacidade de 15.000 a 39.999 lugares, ex: Heriberto Hülse, Vila Belmiro, São Januário, Moisés Lucarelli).
  - `arena_moderna.glb` (328 KB / 14.136 triângulos): Arena multiuso monumental padrão FIFA, cobertura em balanço (cantilever) 100% dos setores, anel perimetral de LED, camarotes executivos e telão central (capacidade 40.000+ lugares, ex: Maracanã, Neo Química Arena, Allianz Parque, Mineirão, Beira-Rio).
  - `gradas_modulares_sem_campo.glb` (262 KB / 13.092 triângulos): Módulos pré-fabricados de arquibancada para acoplamento dinâmico em ampliações e obras dos setores Norte, Sul, Leste ou Oeste.
- **Distribuição de Arquivos e Compatibilidade**:
  - Modelos distribuídos em `assets/stadiums/`, `assets/stadios/` e `public/assets/stadios/` com manifestos técnicos e esquemático de prévia.

### 🎮 2. Visualizador Interativo Orbital 3D 360° (`AFMStadium3D`)
- **Novo Gerenciador de Estádios 3D (`js/core/stadium_3d_manager.js`)**:
  - Resolução inteligente do modelo (`resolveStadiumModel`) por capacidade do clube, nível de infraestrutura de estádio e histórico do futebol brasileiro.
  - Modal interativa em tempo real com controle de órbita 360°, zoom, rotação automática cinematográfica e botões de troca de câmeras:
    - 🛰️ Panorâmica Geral (Top-Down 360°)
    - 📺 Câmera de TV (Transmissão Lateral)
    - 🥁 Visão da Torcida (Cabeceira Popular)
    - 💺 Visão do Banco de Reservas (Beira do Gramado)
  - Gaveta técnica com métricas de engenharia (triângulos, malhas, tipo de cobertura, refletores e reverberação acústica).

### 📺 3. Integração na Transmissão de Partidas & Telas do Clube
- **Motor de Jogo 3D (`js/core/real_football_engine.js`)**:
  - `draw4SectorsStadium` agora consulta dinamicamente `AFMStadium3D.resolveStadiumModel`, adaptando a cobertura, anel de LED publicitário, torres de refletores e o placar em arco ao modelo real do estádio.
- **Tela de Estrutura do Clube & Estádio (`structurePage`)**:
  - Card 3D do Estádio inserido nas abas de Instalações, Expansão Anel por Anel e Construir Nova Arena com atalhos diretos para inspeção.
- **Modal de Gerenciamento do Estádio (`openStadiumModal`)**:
  - Card integrado na aba Resumo e aba Nova Arena.

## [3.9.17] - 2026-10-20 (Super Pack de Sons de Torcida dos Times Brasileiros & Motor de Áudio SFX de Partidas)

### 🏟️ 1. Cobertura Massiva de Cantos Reais das Torcidas Brasileiras (Séries A, B, C, D e Estaduais)
- **100% dos Clubes das Séries A, B e C com Cantos Autênticos**:
  - **Série A (20/20)**: Athletico Paranaense, Atlético-MG, Bahia, Botafogo, Chapecoense, Corinthians, Coritiba, Cruzeiro, Flamengo, Fluminense, Grêmio, Internacional, Mirassol, Palmeiras, Red Bull Bragantino, Remo, Santos, São Paulo, Vasco da Gama, Vitória.
  - **Série B (20/20)**: América-MG, Athletic Club, Atlético-GO, Avaí, Botafogo-SP, Ceará, CRB, Criciúma, Cuiabá, Fortaleza, Goiás, Juventude, Londrina, Náutico, Novorizontino, Operário-PR, Ponte Preta, São Bernardo, Sport, Vila Nova.
  - **Série C (20/20)**: Amazonas FC, Anápolis, Barra-SC, Botafogo-PB, Brusque, Caxias, Confiança, Ferroviária, Figueirense, Floresta, Guarani, Inter de Limeira, Itabaiana, Ituano, Maranhão, Maringá, Paysandu, Santa Cruz, Volta Redonda, Ypiranga-RS.
  - **Paulistão (16/16) & Destaques de Série D e Regionais**: Portuguesa, Bangu, Paraná Clube, Joinville, Treze, Campinense, ABC, América-RN, CSA, Sampaio Corrêa, Brasiliense, Gama, Ferroviário-CE, Tombense, Moto Club, Água Santa, Velo Clube, Brasil de Pelotas, Pelotas, Marcílio Dias, Retrô, entre outros.
- **Normalização e Qualidade Sonora Broadcast**:
  - Todos os cantos foram processados e masterizados com filtro EBU R128 (`loudnorm=I=-16:TP=-1.5:LRA=11`), taxa de 128 kbps e transições suaves de fade-in (0.5s) e fade-out (1.5s), garantindo áudio encorpado sem estalos ou distorções.
  - Mais de 295 arquivos MP3 organizados nas pastas `sounds/crowd/bra_a/`, `sounds/crowd/bra_b/`, `sounds/crowd/bra_c/`, `sounds/crowd/bra_d/` e replicados para `sounds/crowd/bra_estaduais/`.

### 📢 2. Novo Banco de Efeitos Sonoros Oficiais de Partida (SFX)
- **8 Efeitos Sonoros de Estádio e Arbitragem Profissional**:
  - `whistle_start.mp3`: Apito inicial e reinício de etapas pelo árbitro (silvo curto e incisivo seguido de longo).
  - `whistle_foul.mp3`: Apito curto de falta assinalada interrompendo a jogada.
  - `whistle_card.mp3`: Apito enfático e agudo para cartões amarelos e expulsões.
  - `whistle_halftime.mp3`: Dois silvos longos marcando o encerramento do primeiro tempo regulamentar.
  - `whistle_end.mp3`: Três silvos característicos encerrando a partida.
  - `goal_celebration.mp3`: Explosão ensurdecedora da torcida comemorando o gol.
  - `goal_post.mp3`: Impacto metálico característico da bola explodindo no travessão ou na trave.
  - `crowd_gasp.mp3`: Suspiro e espanto coletivo da arquibancada em chutes que raspam a trave e lances de quase gol.
  - `ambient_default.mp3`: Caldeirão ambiente neutro contínuo para qualquer clube sem canto individual cadastrado.

### ⚙️ 3. Aprimoramento do Motor Central de Áudio (`js/core/audio_engine.js`)
- **Fila Progressiva de Reprodução & Tolerância a Falhas**:
  - `startCrowdAmbient()` reestruturada com fila sequencial inteligente: tenta primeiro a pasta da competição ativa, faz varredura transversal em todas as séries brasileiras, testa todos os apelidos/aliases conhecidos do clube, recai sobre o caldeirão neutro e, caso o dispositivo esteja 100% offline sem arquivos locais, aciona o drone procedural Web Audio sem silêncio indesejado.
- **Integração Plena no `js/game.js`**:
  - `playWhistleSound()` e `playCheerSound()` agora priorizam o canal de áudio master `window.afmAudio`, sincronizando perfeitamente gols, acréscimos, intervalo, faltas e fim de jogo.
  - Atualização completa do catálogo `sounds/sounds_manifest.json` com versão 1.1.0 e mapeamento de todos os clubes.

---

## [3.9.16] - 2026-10-20 (Correção do Retorno ao Menu Principal ao Sair & Blindagem da Tela de Escolha de Times e Saves)

### 🚪 1. Resolução Definitiva da Ação de Sair do Jogo
- **Causa Raiz Identificada e Eliminada**:
  - Na função `bindSetup()`, a chamada `$('.afm-sys-cat-btn').forEach` utilizava ` (seletor de elemento único) em vez de `$` (seletor de lista). Quando o usuário saía do jogo para a tela de saves e seleção de times, esses elementos não estavam no DOM, resultando em `TypeError: Cannot read properties of null (reading 'forEach')`. Isso abortava `renderSetup()`, fazendo o jogo cair na tela de fallback *"Recuperando inicialização do simulador... / Recarregar Página"*.
- **Correção e Blindagem de `bindSetup()`**:
  - Corrigidas as chamadas de `.afm-sys-cat-btn` e `.btnPlayWithSystem` para `$` e encapsulada a rotina inteira em bloco de proteção `try / catch`.
- **Preservação de Sessão e Carregamento dos 3 Saves**:
  - `getActiveAccount()` aprimorada para detectar a sessão ativa via banco, localStorage (`AFM_SESSION_KEY`, `afm_active_user_v1`) ou `state.userOwner`. Ao clicar em *Sair*, o treinador conectado é preservado e a tela exibe imediatamente os 3 slots de saves com seus dados (clube, temporada, rodada, saldo e data) e a vitrine completa de seleção de times e ligas.
- **Unificação de Ações e Fallbacks Delegados**:
  - O botão de saída do drawer lateral (`#btnCloseMobileDrawer`), o botão `🚪 Sair` (`#mainMenuBtn`) e o botão de configurações (`#btnExitToMainMenu`) agora compartilham o fluxo unificado `handleExitGameAction()`, com fechamento de gaveta, auto-save e delegação global em `pwa_and_landscape_enforcer.js`.

---

## [3.9.15] - 2026-10-20 (Retorno Automático da Prévia ao Popup da Partida & Entrevista Pós-Jogo com Direcionamento ao Menu Central)

### 🔙 1. Retorno Fluido da Prévia Oficial para o Popup da Partida
- **Preservação do Contexto da Decisão de Jogo**:
  - Ao clicar no botão **`📋 PRÉVIA`** dentro do modal da partida (`openMatchActionModal` - tela com *Jogar ao Vivo*, *Simular*, escalação, força e clima), o jogo agora memoriza o estado anterior através de `window.__afmOpenedFromMatchActionModal = true` e repassa o callback `onClose` para o modal da Prévia Oficial.
- **Retorno Infalível ao Fechar**:
  - Ao fechar a Prévia Oficial (seja clicando no botão **`[✕]`** vermelho no canto superior direito, no botão **`Fechar`** na base, no clique fora do modal ou pela tecla `Esc`), o jogo fecha a prévia e **reabre instantaneamente a tela de decisão da partida** com os botões *▶ JOGAR AO VIVO*, *⚡ SIMULAR* e *📋 PRÉVIA*.
- **Transição Direta ao Escolher Jogar pela Prévia**:
  - Caso o treinador decida clicar diretamente em *▶ JOGAR AO VIVO AGORA* ou *⚡ SIMULAR PARTIDA* dentro da própria tela de prévia, a flag de retorno é liberada e a partida inicia sem reabrir a janela anterior.

### 🎙️ 2. Entrevista Pós-Jogo (Coletiva de Imprensa) & Redirecionamento Automático para a Central
- **Exibição Universal da Coletiva de Imprensa Pós-Jogo**:
  - Ao término de qualquer partida do clube do usuário (ao vivo ou simulada, válida pela Série A/B, Campeonato Estadual, Copa do Brasil ou torneios Continentais), a **Sala de Imprensa Oficial** é acionada imediatamente com o treinador no púlpito, microfones com canoplas e perguntas dinâmicas da mídia esportiva sobre o placar do jogo.
- **Diferenciação Estrita de Chaves de Coletiva**:
  - A chave de validação de resposta da imprensa agora diferencia partidas e tipos (`season_round_type_home_away`), impedindo que uma coletiva pré-jogo bloqueie indevidamente a entrevista pós-jogo.
- **Navegação Garantida para o Menu Central (`view = 'central'`)**:
  - Assim que o treinador seleciona sua resposta na coletiva (com publicação da manchete e impacto na moral do grupo e confiança da diretoria/torcida) OU clica no botão **`✕ Encerrar`** da sala de imprensa, o jogo atualiza automaticamente o estado e redireciona o treinador diretamente para a aba **Central**.

---

## [3.9.14] - 2026-10-20 (Correção Definitiva do Relógio Anti-Travamento 901:57, Novo Estádio 3D Aberto & Bateria de 30 Testes de Realismo)

### ⏱️ 1. Correção Definitiva do Relógio e Prevenção de Travamento Infinito (Bug 901:57)
- **Causa Raiz Identificada e Erradicada**:
  - No loop de simulação `setupLiveCanvasLoop`, a condição `if(s.minute < 90) simulateMinute(s, s.minute + 1)` impedia a chamada dos minutos de acréscimo (91', 92', 93'...). Como o apito final dependia de `min >= 90 + stop2H`, o jogo nunca encerrava e o contador de segundos continuava indefinidamente até passar de 54.000s (901:57).
- **Trava de Segurança Estrita com Encerramento Garantido**:
  - Implementado cálculo dinâmico de `maxAllowedMin = (s.phase === 'FIRST_HALF') ? (45 + stop1H) : (s.phase === 'EXTRA_TIME_1' ? 105 : (s.phase === 'EXTRA_TIME_2' ? 120 : (90 + stop2H)))`.
  - Se `s.timeSec >= maxAllowedTimeSec`, o relógio trava imediatamente no tempo limite, define `s.minute = maxAllowedMin`, `s.playing = false` e aciona o apito final (`finishLiveMatch` ou intervalo `openHalftimeModal`).
  - O acumulador de minutos agora itera estritamente até `maxAllowedMin`, garantindo que os minutos dos acréscimos sejam jogados e o apito final soe com 100% de precisão.
  - O mostrador `#liveClockDisplay` agora possui teto rígido em `maxAllowedMin`, impedindo qualquer exibição anômala.

### 🏟️ 2. Novo Estádio 3D Imersivo Sem Oclusão & Uniformes Autênticos
- **Remoção da Caixa Escura Inferior**:
  - Removido o antigo bloco sólido azul escuro que cobria o terço inferior do gramado (`fillRect(0, 535, 1280, 185)`). O gramado agora é 100% visível de ponta a ponta.
- **Estrutura 3D Estilo Tigela Monumental (Stadium Bowl)**:
  - Arquibancadas em perspectiva com degraus de concreto, cadeiras nas cores do clube mandante e torcedores animados com bandeirões ondulantes.
  - Cobertura arquitetônica em balanço com treliças de aço iluminadas e 4 torres de refletores volumétricos com feixes de luz realistas.
  - Mureta perimetral com fita de LED exibindo patrocinadores oficiais e placar central em arco.
  - Novos bancos de reservas de vidro curvo posicionados na lateral do gramado, com assentos tipo concha esportiva e treinadores gesticulando na área técnica.
- **Uniformes Oficiais Expandidos (Série A e B)**:
  - Adicionados kits detalhados para Criciúma (faixas horizontais tricolores: amarelo, preto e friso branco), Cuiabá (verde e ouro), Juventude, Vitória, Sport, Ceará, Coritiba, Goiás, Avaí, Chapecoense, Ponte Preta, Guarani, etc.
  - Correção na resolução de kits dos atletas no canvas (`p.clubName` e `p.kit`), evitando uniformes genéricos preto e branco.
- **Eliminação de Balões Sobrepostos**:
  - Sistema anti-duplicação em `showLiveBalloon`, impedindo badges repetidos de finalização na mesma coordenada.

### 📊 3. Bateria de 30 Testes de Partida e Refinamento de Realismo (`test_30_real_football_matches.js`)
- **Simulação de 30 Confrontos Diversificados Minuto a Minuto**:
  - Testados clássicos da Série A, duelos com Criciúma e Cuiabá, confrontos da Série B, mata-matas da Copa do Brasil, semifinais de Libertadores e decisões com prorrogação e pênaltis.
- **Estatísticas Calibradas com o Futebol Real**:
  - **Média de Gols**: 2.23 por jogo (padrão real: 2.20 a 2.80).
  - **Média de Finalizações**: 19.1 chutes (9.9 no alvo / ~40% de precisão).
  - **Média de Passes**: 719 passes por jogo (~82% de acerto).
  - **Média de Faltas**: 24.8 por jogo (calibrado com o futebol brasileiro).
  - **Média de Cartões**: 🟨 3.3 amarelos e 🟥 0.23 vermelhos por partida.
  - **Média de Escanteios**: 10.6 escanteios por jogo.
  - **Média de Defesas de Goleiro**: 7.7 defesas por jogo.
  - **Probabilidade de Bola na Trave**: Calibrada de 10% para 3% realista (evitando bolas na trave excessivas).
  - **Acréscimos Reais**: Média de +2.1' no 1º tempo e +3.8' no 2º tempo, calculados dinamicamente com base em gols, cartões, substituições e intervenções de arbitragem.
- **Sincronização com o Sistema de XP**:
  - Atletas atuando em campo recebem pontos de XP proporcionais à nota de desempenho, gols, assistências e saldo de gols, acumulando para elevação de Overall.

---

## [3.9.13] - 2026-10-20 (Estádio 3D Imersivo Escalável por Estrutura, Copinha Sub-20 Automatizada em Janeiro, Favoritos no Mercado & Calibração de Reservas)

### 🏟️ 1. Estádio 3D Imersivo & Geometria Escalável pelo Nível de Estrutura do Clube
- **Escalabilidade Dinâmica por Estrutura (`state.infrastructure.stadium.level` / Capacidade)**:
  - **Nível 1 (Pequeno / CT - até 15.000)**: Arquibancada modesta de 3 degraus, alambrado rústico na beira do gramado, torcida esparsa (~28% de lotação visual) e bancos de reservas simples.
  - **Nível 2 (Médio / Padrão - 15.000 a 40.000)**: Arquibancada de 6 degraus com cadeiras nas cores do clube, torres metálicas de iluminação, painel de LED perimetral superior com anúncios oficiais (*BETANO, IFOOD, SAMSUNG, NUBANK*) e abrigos cobertos de acrílico na área técnica.
  - **Nível 3+ (Elite / Super Arena - acima de 40.000)**: Monumental tigela de 10 degraus contínuos, cobertura moderna em balanço com vigas de aço, duplo anel de LED dinâmico com patrocinadores (*CENTRAL DAS PROMOS, VIA LUZ TURISMO, REAL OFICIAL, CONTA.VC, BETANO, NUBANK, SAMSUNG, AFM 2027*), camarotes de vidro VIP com luzes douradas, bandeirões tridimensionais, mosaico com o nome do clube e bancos de reservas ergonômicos de alta tecnologia.
- **Alternador Rápido 2D / 3D (`btnToggle2D3D`)**:
  - Botão no cabeçalho da transmissão permitindo alternar instantaneamente entre o **Estádio 3D** e a **Visão Tática 2D**.
  - No modo 2D, renderiza a prancheta de radar tático com gramado listrado, 22 discos numerados com as cores dos uniformes titulares, halo dinâmico no portador da bola e movimentação fluida.
- **Seletor de Câmeras 3D Dinâmicas**:
  - **`[Lateral]`**: Câmera de transmissão de televisão com *panning* inteligente e zoom suave (1.05x).
  - **`[Bola]`**: Câmera focada diretamente na bola e no condutor da jogada com aproximação tática (1.25x).
  - **`[Gol]`**: Foco automático na grande área e trave do ataque adversário (1.20x).
- **Controles de Velocidade Calibrados**:
  - Botões dedicados para **1x**, **2x**, **4x**, **10x**, **20x** e **40x** atendendo exatamente ao ritmo preferido do treinador.

### 🏆 2. Copinha Sub-20 — Simulação Automatizada em Janeiro (`AFM_CopinhaEngine`)
- **Simulação 100% Automática em Segundo Plano**:
  - Ocorre durante o mês de Janeiro (02 a 25 de Janeiro) conforme os dias do calendário avançam.
  - O treinador principal não precisa disputar os jogos manualmente: ele apenas acompanha os resultados, classificação e desempenho da base Sub-20.
- **Formato Realista com Chaves e Fases**:
  - **Fase de Grupos**: Grupo de 4 clubes (Sub-20 do clube do usuário + 3 adversários regionais) disputados nos dias 03, 06 e 09 de Janeiro.
  - **Mata-Mata**: Oitavas de final (13/01), Quartas de final (17/01), Semifinais (21/01) e Grande Final (25/01) contra juniores de equipes tradicionais.
- **Joias da Base & Alta Chance de Breakout de Overall (+3 a +7 OVR)**:
  - Jovens com atuações de destaque (nota >= 7.8 ou gols/assistências) têm alta probabilidade de evolução explosiva.
  - Salto imediato de **+3 a +7 de Overall**, com potencial elevado para **85 a 95 POT**, além do selo visual de *"🔥 Joia da Copinha"*.
  - Botão **`📝 Subir ao Profissional`** permitindo promover a joia revelada instantaneamente para o elenco principal.
- **Premiações Financeiras Acumuladas & Taça da Copinha**:
  - Classificação na fase de grupos: +R$ 50.000
  - Vitória nas oitavas: +R$ 75.000 | Quartas: +R$ 100.000 | Semis: +R$ 150.000 | Campeão: +R$ 350.000.
  - Taça da Copinha adicionada à galeria oficial de títulos do clube (`state.titles`).
- **Painel Interativo da Copinha**:
  - Acessível a qualquer momento pelo botão *"🏆 Copinha Sub-20"* no Centro de Treinamento da Base (`openYouthAcademyModal`).

### ⭐ 3. Favoritos no Mercado (Wishlist / Shortlist de Contratações — `AFM_MarketFavorites`)
- **Estrela ⭐ em Todos os Cards e Linhas de Jogadores**:
  - Botão de estrela interativo em cada linha da aba Comprar e no cabeçalho do Modal da Lupa do atleta.
  - Clique único adiciona ou remove o jogador da lista prioritária.
- **Aba Dedicada `⭐ FAVORITOS` no Mercado**:
  - Painel exclusivo exibindo todos os atletas monitorados com clube atual, posição, Overall, idade, valor de mercado, teto estipulado e notas do técnico.
  - Permite definir **Teto Máximo de Preço** (R$ mi) e registrar **Parecer e Anotações Táticas do Treinador** (*"Excelente meia para criação de jogadas", etc.*).
  - Alertas visuais e atalhos rápidos para *"Comprar"*, *"Lupa 🔍"*, *"Editar Nota"* e *"Remover ⭐"*.

### ⚡ 4. Calibração de Nota e XP para Substitutos & Transição Fluida no Intervalo
- **Notas Justas para Entradas no Fim de Jogo**:
  - Atletas que entram nos minutos finais (70' a 85') agora recebem base justa (mínimo 6.0) e bônus expressivos ao marcarem gols ou distribuírem assistências, alcançando notas entre **8.0 e 9.5**, recebendo pontuação proporcional de XP sem prejuízo na evolução.
- **Intervalo Descongelado e Fluido**:
  - Transições no modal de intervalo (`openHalftimeModal`) sem risco de travamento ou bloqueio do loop de renderização da partida ao vivo.

---

## [3.9.12] - 2026-10-19 (Unificação dos Botões Laterais em "Meu Time & Tática" e Filtragem Estrita das Competições na Central [Estadual, Copa e Continental])

### 📋 1. Unificação dos Botões Laterais no Card de Partida
- **Remoção de Duplicação**: Os dois botões empilhados (`Equipa`/`Elenco` e `Táticas`) foram unificados em apenas um botão proeminente e direto: **`📋 Meu Time & Tática`**.
- **Aplicações**:
  - No card de próximo jogo da **Central** (`#btnHeroQuickTactics`).
  - No **Modal de Ação da Partida** (`#btnMatchModalTactics`).
- Ao clicar, o técnico é direcionado para a prancheta de `meutime`, onde gerencia tanto os titulares e reservas quanto a formação e instruções táticas.

### 🏆 2. Widget de Competições na Central Restrito Exclusivamente ao que o Clube Disputa
- **Filtro Rigoroso por Participação Real**: O widget secundário da Central deixou de exibir abas hardcoded de competições nas quais o clube não está inscrito (como a exibição indevida da Libertadores para clubes que não a disputam, como o Criciúma).
- **Aba Estadual Dinâmica (`🏟️ ESTADUAL`)**:
  - Clubes com campeonato estadual cadastrado (como o Criciúma no Campeonato Catarinense) passam a ter a aba **`🏟️ ESTADUAL`**.
  - Apresenta: próximo confronto estadual com contagem regressiva, tabela de classificação do estadual com destaque para o clube do usuário e outros jogos da rodada.
  - Link direto para a tabela completa do estadual.
- **Aba Copa do Brasil (`🇧🇷 COPA`)**:
  - Exibida para todos os participantes da Copa do Brasil, com dados de mata-mata da fase ativa.
- **Aba Continental (`🏆 LIBERTADORES` / `🥈 SUL-AMERICANA`)**:
  - Exibida **apenas e tão somente se** o clube do jogador for participante real da fase de grupos ou mata-mata do torneio continental.
- **Exemplo de Aplicação Prática**:
  - **Criciúma**: Exibe unicamente `🏟️ ESTADUAL` (Catarinense) e `🇧🇷 COPA` (Copa do Brasil).
  - **Flamengo / Palmeiras**: Exibe `🏟️ ESTADUAL` (Carioca/Paulista), `🇧🇷 COPA` e `🏆 LIBERTADORES`.

## [3.9.11] - 2026-10-19 (Modal "Em Breve" da Loja Oficial & Central Completa de Ajuda com Dicas do Jogo e Tutorial das 12 Abas)

### 👑 1. Modal da Loja Oficial — "Em Breve" (`openStoreComingSoonModal`)
- **Abertura pelo Botão `👑 LOJA`**: Ao clicar no botão `#btnTopStore` no cabeçalho superior do jogo, é exibido o pop-up com design refinado anunciando os recursos futuros da Loja Oficial AFM.
- **Vitrine de Novidades em Desenvolvimento**:
  - **Moedas de Treinador (AFM Coins)**: Desbloqueio de temas estéticos e consultorias táticas de elite obtidas através de conquistas esportivas.
  - **Kits Retrô & Clássicos**: Uniformes icônicos dos grandes clubes brasileiros e mundiais.
  - **Customização de Arenas**: Personalização visual de assentos, iluminação temática e novos setores VIP no estádio.
  - **Rede VIP de Olheiros**: Acesso antecipado a relatórios completos com potencial de mercado de jovens promessas do futebol.
  - **Compromisso 100% Fair Play**: Garantia absoluta de ausência de vantagens Pay-to-Win, preservando a simulação tática e realista.
- **Fechamento Ágil**: Botão `✕`, botão de confirmação "Entendido, Voltar ao Jogo" ou clique na máscara de fundo.

### 💡 2. Central de Ajuda & Tutorial Completo das 12 Abas (`openGameHelpTutorialModal`)
- **Abertura pelo Botão `?`**: Ao clicar no botão `#btnTopHelp` no cabeçalho superior, abre-se a Central de Ajuda do simulador.
- **Aba "⚡ Dicas Rápidas de Mestre"**:
  - Dicas essenciais sobre vigor físico e rotação de elenco para prevenção de lesões.
  - Estratégia tática, controle de posse e escolha de mentalidade (Ofensiva/Defensiva).
  - Como funciona o sistema de XP e evolução contínua dos atletas após as partidas.
  - Regras de controle da folha salarial e saúde financeira perante a diretoria.
  - Dicas de negociação no mercado da bola e no *Deadline Day*.
  - Funcionamento do botão CONTINUAR e avanço de calendário cronológico.
- **Aba "📖 Tutorial das 12 Abas"**:
  - Apresentação completa e detalhada das 12 abas do simulador com ícone, categoria e descrição de funcionalidades:
    1. ⭐ `central`: Perspectiva Geral
    2. 📋 `meutime`: Meu time & Tática
    3. 👥 `elenco`: Elenco Oficial
    4. 🗓️ `calendario`: Calendário de Jogos
    5. 🔄 `mercado`: Mercado & Transferências
    6. 💼 `carreira`: Carreira do Treinador
    7. 🏆 `temporada`: Temporada & Tabelas
    8. 🏟️ `estrutura`: Instalações & Estádio
    9. 🏢 `escritorio`: Escritório & Finanças
    10. 📰 `noticias`: Notícias & Mídia
    11. 📢 `novidades`: Novidades & Correções
    12. ⚙️ `config`: Configurações
  - **Atalho Interativo "Ir para esta Aba ➔"**: Cada card possui um botão interativo que direciona o jogador instantaneamente para a aba correspondente e fecha o modal.

### 🛡️ 3. Resiliência e Cobertura Multiplataforma
- **Amarração Direta & Fallback**: Eventos amarrados diretamente em `bind()` em `js/game.js` e capturados com fallback delegado no documento em `js/ui/pwa_and_landscape_enforcer.js`.
- **Estilos Dedicados**: Novas regras em `css/app.css` com backdrop blur, gradientes personalizados e suporte responsivo a mobile e desktop.

## [3.9.10] - 2026-10-19 (Ocultação de Menu no PC, Botão X com Auto-Save, Força do Time & Prestígio do Treinador no Topo e Aba "Temporada")

### 💻 1. Ocultação do Botão de Menu no Topo para PC / Desktop
- **Sidebar Fixa no PC**: Como a barra lateral de navegação já permanece sempre visível e fixada no layout desktop (`width > 1024px`), o botão de hambúrguer `☰` no topo foi desativado no PC (`display: none !important;`).
- **Preservado no Mobile**: Em telas móveis e tablets (`max-width: 1024px` ou `max-height: 600px`), o botão hambúrguer continua visível e responsivo (`display: inline-flex !important;`) para alternar a gaveta lateral.

### 💾 2. Botão "✕" com Salvamento Automático Garantido
- **Ação Unificada de Sair**: Ao clicar no botão `✕` no cabeçalho do menu lateral (`#btnCloseMobileDrawer`), o jogo abre a confirmação de saída para o menu inicial com aviso de auto-save.
- **Auto-Save Imediato**: Ao confirmar a saída, o jogo salva automaticamente o progresso local (`save()`), zera a sessão ativa com segurança (`state = null`) e exibe notificação de confirmação (`toast`).

### ⭐ 3. Recursos Superiores: Força do Time & Prestígio do Treinador
- **Força do Time (`⭐ OVR`)**: Substituiu o antigo badge de energia pelo Overall real do elenco (`overallSquad()`). Clicar no botão `+` abre a tela **Meu Time & Tática**.
- **Prestígio do Treinador (`🎖️ pts`)**: Exibe a pontuação de prestígio social e esportivo do técnico (`state.managerPersonal?.prestigeScore || 5`).
- **Atalho no `+` do Prestígio**: Clicar no botão `+` leva o usuário diretamente para a aba **Carreira do Treinador** (`view = 'carreira'`).

### 🏆 4. Aba "Temporada" no Menu Lateral
- **Rótulo Simplificado**: O botão da aba foi renomeado de `🏆 Temporada & Competições` para exatamente **`🏆 Temporada`**, mantendo o design limpo e conciso solicitado.

## [3.9.9] - 2026-10-19 (Modal Interativo de Ação ao Clicar em CONTINUAR, Três Botões de Partida [Jogar Agora, Simular, Prévia] e Correção dos Nomes dos Atalhos da Fita de Tarefas)

### 🎮 1. Modal Interativo de Partida ao Clicar em "CONTINUAR" (`openMatchActionModal`)
- **Fluxo Interativo de Decisão**: Ao clicar no botão verde neon `CONTINUAR` no cabeçalho superior:
  - Se a partida estiver pronta ou no dia do jogo: abre instantaneamente o **Modal Oficial de Ação da Partida**.
  - Se a data do jogo estiver no futuro: o calendário avança de forma garantida até o dia do confronto e imediatamente abre o modal da partida, oferecendo ao técnico o controle absoluto do que fazer.
- **Três Botões de Ação Principais**:
  - `▶ JOGAR AO VIVO` (ou "Jogar Agora"): inicia a experiência de campo em tempo real (`startLiveMatch()`).
  - `⚡ SIMULAR`: simula a rodada de forma instantânea com motor calibrado (`simulateQuickRound()`).
  - `📋 PRÉVIA`: abre a análise completa de raio-x do adversário, histórico e probabilidades (`openMatchPreviewModal()`).
- **Raio-X Completo do Confronto no Modal**:
  - Escudos em alta resolução, nomes dos clubes e círculos de força/Overall de cada equipe.
  - Botões rápidos `👥 Elenco` (navega para Elenco) e `📋 Táticas` (navega para Meu Time & Tática).
  - Informações de clima, estado do gramado, horário (15:00), data, competição e estádio.
  - Histórico direto H2H (Vitórias, Empates, Derrotas).
  - Bônus do Caldeirão e posição de tabela.
  - Seletor rápido de Mentalidade (Retranca, Defensiva, Equilibrada, Ofensiva, Pressão total) que salva na hora.
  - Botão de fechar `✕` e clique no fundo para voltar à tela anterior sem jogar, caso o técnico queira fazer ajustes pré-jogo.

### 🏷️ 2. Correção dos Botões de Atalhos da Fita (`sm-task-ribbon`)
- **Alinhamento com a Gaveta de Navegação**:
  - `📰 Relatórios` ➔ **`📰 Notícias & Mídia`** (conecta à aba de Notícias).
  - `🎯 Objetivos` ➔ **`🎯 Carreira`** (conecta à aba de Carreira do Treinador).
  - `🏋️ Treino & Tática` ➔ **`📋 Meu Time & Tática`** (conecta à aba de Tática).
  - `🔍 Olheiro & Mercado` ➔ **`🔄 Mercado & Transferências`** (conecta à aba de Mercado).
  - `🤝 Patrocinador` ➔ **`🏢 Escritório & Finanças`** (conecta à aba de Escritório).
  - Preservado o botão lateral `🗓️ Calendário`.
- **Localização PT-BR no Card Central**:
  - Alterado o rótulo de `Equipa` para `Elenco` (`<span>👥</span> Elenco`) e conectado para abrir a tela de Elenco.

## [3.9.8] - 2026-10-19 (Sistema Oficial de XP e Evolução em Campo, Resumo Mensal "Partidas vs Treino", Mecânica "Ir Além" / Breakthrough e Ajuste de Escala Tática)

### ⚡ 1. Sistema Oficial de XP e Evolução dos Jogadores em Campo
- **Progressão Baseada em Atuação Real**: Os jogadores agora evoluem com pontos de XP ganhos partida a partida, de forma rigorosamente balanceada com base no desempenho:
  - **Minutos em Campo**: Pontuação proporcional de minutos jogados (até 25 XP base).
  - **Escala de Notas (5.0 a 10.0)**: Quem joga bem cresce muito mais rápido. Notas < 6.0 rendem apenas 5 XP; notas 7.0–7.4 rendem 45 XP; notas 8.0–8.4 rendem 90 XP; notas de gala 9.0+ rendem 150 XP de atuação de craque.
  - **Lances Decisivos (Bônus Explícitos)**:
    - Cada gol marcado: **+40 XP**
    - Cada assistência: **+25 XP**
    - Clean sheet (Goleiro e zagueiros/laterais com 60+ min sem sofrer gols): **+35 XP**
    - Bônus por vitória coletiva: **+15 XP** (empate: +5 XP)
  - **Multiplicadores por Idade e Estágio de Carreira**: Jovens prodígios (≤ 20 anos) possuem multiplicador de 1.40x; jovens (21–23) 1.25x; ápice (24–27) 1.00x; experientes (28–30) 0.70x; veteranos (31+) 0.40x.
- **Titulares vs Reservas**: Atletas titulares que jogam e produzem evoluem com ritmo acelerado; jogadores reservas mantêm evolução estável e contínua através das sessões de treino no Centro de Treinamento (CT).

### 🏋️ 2. Evolução no Fim do Mês pelo CT e Resumo Transparente de Pontos
- **Treino Contínuo no CT**: A comissão técnica concede pontos de treino mensais a todo o elenco (titulares e reservas) calibrados de acordo com as instalações do clube (CT Nível 1 a 5: 35 a 130 XP).
- **Resumo do Mês no Modal da Lupa (Screenshot Real)**:
  - Nova aba interativa de **Progresso de Evolução & XP** com barra de nível neon e porcentagem exata (`p.xp / p.xpNext`).
  - Painel de transparência: mostra com clareza **o que veio do jogo** (partidas, notas e lances decisivos) e **o que veio do treino** (Centro de Treinamento), além da média de notas e total de jogos no mês.

### 🚀 3. Mecânica "Ir Além" (Breakthrough de Potencial)
- **Superação de Expectativas**: Jovens atletas (≤ 24 anos) que atingem cedo o limite de seu potencial inicial e mantêm notas médias altas (≥ 7.3) podem superar o esperado.
- **Rompimento de Teto**: A comissão técnica identifica o prodígio e expande o teto de potencial (+1 ou +2 POT), permitindo que o atleta continue subindo de Overall além do teto inicial previamente projetado, com notícias e celebração em tempo real.

### ⚽ 4. Ajuste de Escala Tática e Posição do Goleiro no Gramado
- **Correção da Linha de Fundo**: Ajustada a coordenada vertical do slot do Goleiro (`y: 83.5%` em todas as 18 formações verticais), eliminando qualquer transbordo ou corte do pedestal sobre a linha inferior do gramado.
- **Formatação de Função Elegante**: As funções táticas de goleiros no pedestal agora são formatadas como `GL · Tradicional` ou `GL · Líbero`, garantindo acomodação perfeita sem reticências desnecessárias.
- **Barra Compacta de XP no Elenco**: Adicionado indicador visual de progresso de XP logo abaixo da nota geral (OVR) de cada atleta na tabela de elenco.

## [3.9.7] - 2026-10-17 (Premiações Reais de Campeonatos, Inclusão Oficial da MLS, Patrocinadores Locais por País & Sistema Oficial de Número da Camisa)

### 💰 1. Premiações Reais e Autênticas de Todos os Campeonatos e Copas
- **Pesquisa Real de Valores Oficiais**: Valores de premiação calibrados estritamente com base nos dados reais do futebol (CBF, CONMEBOL, UEFA, FIFA, MLS e ligas europeias):
  - **Brasileirão Série A**: Campeão R$ 48,1M, 2º R$ 45,7M, 3º R$ 43,3M, descendo progressivamente até o 16º com R$ 16,3M. Z4 (17º a 20º) com R$ 0 de premiação esportiva conforme regra oficial CBF/Globo.
  - **Brasileirão Série B**: Campeão R$ 3,5M, 2º ao 4º (G4) R$ 1,35M, permanência até 16º R$ 600K e Z4 R$ 300K.
  - **Séries C e D**: Campeão Série C R$ 2,0M / Vice R$ 1,0M / G4 R$ 600K; Série D Campeão R$ 1,2M / Vice R$ 700K / Semis R$ 500K.
  - **Copa do Brasil**: Pagamentos progressivos por fase com valores oficiais até R$ 73,5M para o Campeão e R$ 31,5M para o Vice-Campeão (Semis R$ 9,45M, Quartas R$ 4,515M, Oitavas R$ 3,465M, etc.).
  - **Copa Libertadores & Sul-Americana**: Libertadores US$ 23M (~R$ 126,5M) para o campeão e US$ 7M (~R$ 38,5M) para o vice; Sul-Americana US$ 6M (~R$ 33M) para o campeão e US$ 2M (~R$ 11M) para o vice.
  - **Estaduais de Elite**: Paulistão SP Campeão R$ 5M / Vice R$ 1,65M; Carioca RJ Campeão R$ 3M; Mineiro MG e Gaúcho RS Campeão R$ 2,5M.
  - **Grandes Ligas Mundiais**: Premier League Campeão R$ 380M (£ 62M de mérito); LaLiga Campeão R$ 330M; Serie A, Bundesliga e Ligue 1 Campeão R$ 250M; Saudi Pro League Campeão R$ 60M; Major League Soccer Campeão R$ 55M; Copa do Mundo de Clubes FIFA Campeão R$ 275M (US$ 50M).
- **Funções Criadas e Integradas**: `calculateSeasonPrizeMoney(position, comp)` e `calculateCupPhasePrize(compOrId, phaseName, isWinner, isChampion)`, integradas com crédito em saldo bancário e notícias em `playCopaDoBrasilFixture`, `simulateQuickRound` e premiação de fim de temporada em `centralPage`.

### 🇺🇸 2. Inclusão Oficial da Major League Soccer (MLS - Estados Unidos)
- **Liga e Franquias**: Registrada a competição oficial `usa-1` ("Major League Soccer") com 20 franquias de ponta: *Inter Miami, Los Angeles FC, LA Galaxy, Columbus Crew, New York City FC, New York Red Bulls, Seattle Sounders, Atlanta United, FC Cincinnati, Orlando City, Philadelphia Union, Houston Dynamo, Portland Timbers, Austin FC, Sporting Kansas City, Nashville SC, Real Salt Lake, Minnesota United, St. Louis City SC, Chicago Fire*.
- **Super Craques Mundiais Cadastrados**: 89 jogadores reais adicionados com estatísticas, idades, posições e números de camisa autênticos:
  - **Lionel Messi** (#10, Inter Miami - OVR 88, RW)
  - **Luis Suárez** (#9, Inter Miami - OVR 82, ST)
  - **Sergio Busquets** (#5, Inter Miami - OVR 81, DM)
  - **Jordi Alba** (#18, Inter Miami - OVR 80, LB)
  - **Federico Redondo** (#55, Inter Miami - OVR 75, DM)
  - **Olivier Giroud** (#9, Los Angeles FC - OVR 81, ST)
  - **Hugo Lloris** (#1, Los Angeles FC - OVR 80, GK)
  - **Denis Bouanga** (#99, Los Angeles FC - OVR 82, LW)
  - **Marco Reus** (#18, LA Galaxy - OVR 82, AM)
  - **Riqui Puig** (#10, LA Galaxy - OVR 79, CM)
  - **Gabriel Pec** (#11, LA Galaxy - OVR 77, RW)
  - **Cucho Hernández** (#9, Columbus Crew - OVR 80, ST)
  - **Luciano Acosta** (#10, FC Cincinnati - OVR 81, AM)
  - **Emil Forsberg** (#10, New York Red Bulls - OVR 80, AM)
  - **Aleksei Miranchuk** (#59, Atlanta United - OVR 79, AM)
- **Filtros e Roteamento Global**: Adicionada a região `América do Norte` nos filtros de Mercado (`marketRegion`) e Empréstimos (`loanRegion`), com suporte completo a `intlLigas` e `inferClubMeta`.

### 🌎 3. Patrocinadores Locais Autênticos por País
- **Catálogo Regional (`SPONSOR_POOLS_BY_COUNTRY`)**: Substituído o conjunto genérico por patrocinadores hiper-realistas de cada país:
  - **Brasil**: *Betano, Nubank, Petrobras, Caixa, Superbet, iFood, Crefisa, Banco do Brasil, Fatal Model, GOL Linhas Aéreas, Cimed, EstrelaBet, Havan, BYD, Itaú, Brahma, Zé Delivery, Pixbet*.
  - **Argentina**: *YPF, Cerveza Quilmes, Codere, Betsson Argentina, Banco Galicia, Banco Macro, Flecha Bus, Assist Card, DirecTV Argentina, Aerolíneas Argentinas, Mercado Libre, Tarjeta Naranja, PedidosYa Argentina*.
  - **Estados Unidos**: *Apple TV, Audi, Target, BMO, Herbalife, American Family Insurance, Ford, DoorDash, AT&T, Heineken USA, Delta Air Lines, Bank of America, BodyArmor, GEICO*.
  - **Inglaterra**: *Fly Emirates, Standard Chartered, Etihad Airways, TeamViewer, Stake.com, Visit Rwanda, JD Sports, Expedia, Barclays, Cadbury*.
  - **Espanha**: *Spotify, Emirates Fly Better, Riyadh Air, DIGI, Finetwork, Ambilight TV, Nexen Tire, OK Mobility, CaixaBank, Mahou San Miguel*.
  - **Arábia Saudita**: *Roshn, Aramco, STC, Saudia Airlines, Red Sea Global, Alinma Bank, Jahez, NEOM, SABIC*.
  - **Itália, Alemanha, França, Portugal e Global**: Pools dedicados com *Jeep, MSC Crociere, Deutsche Telekom, Evonik, Red Bull, Qatar Airways, Orange, Betclic, MEO, Sony, Mastercard*, etc.
- **Detecção Inteligente do País (`getClubCountry`)**: Resolve dinamicamente o país de qualquer clube por ID de liga, competição ou heurística do clube, garantindo que clubes argentinos recebam patrocinadores argentinos, clubes da MLS recebam patrocinadores norte-americanos e clubes brasileiros recebam patrocinadores nacionais.

### 👕 4. Sistema Oficial de Escolha do Número da Camisa dos Jogadores
- **Numeração de 1 a 99 sem Duplicações**: Atributo `p.number` nos atletas, gerido de forma estrita pela rotina `ensureSquadShirtNumbers`.
- **Troca Inteligente de Camisa (Swap)**: A função `setPlayerShirtNumber(playerOrKey, newNumber)` permite definir qualquer camisa de 1 a 99; se outro atleta do clube já utilizar o número, o sistema realiza um swap limpo e seguro, sem colisão e com zero duplicações.
- **Botão "⚡ Numeração Tradicional (1 a 11)"**: A função `assignTraditionalShirtNumbers(state)` atribui de forma clássica camisas 1 a 11 para os titulares conforme a prancheta tática (GK=1, laterais=2/6, zagueiros=3/4, volantes=5/8, meias=10/8, atacantes=9/7/11) e camisas 12 em diante para os reservas.
- **Interface e Telas**:
  - Botão `👕 Numeração` e coluna `Nº` na tabela de elenco em `squadPage()`.
  - Modal interativo em dark mode `openSquadShirtNumbersModal()` com grid visual de 1 a 99 indicando camisas ocupadas/vagas e troca imediata.
  - Exibição do número `#` nas pílulas táticas no gramado (`renderPitchPlayerPill`) e nos mini-cards oficiais estilo EA FC (`renderFifaMiniCard`).

---

## [3.9.6] - 2026-10-17 (Blindagem Total de Sincronização entre Abas & Garantia Inviolável de Zero Duplicações)

### 🛡️ 1. Desduplicação Universal de Dados em Todo o Jogo
- **Elenco (`squad`)**: Desduplicação automática e permanente no `normalizeSquadState` e `repairSaveIfCorrupted` por chave canônica de atleta (`playerKey`). Nenhum jogador pode existir duas vezes no clube.
- **Escalação (`lineup`)**: O mapeamento dos 11 titulares agora impede que o mesmo atleta seja escalado em mais de uma posição. Se houver duplicação, o slot repetido é limpo (`null`).
- **Histórico (`history`)**: Algoritmo de desduplicação por chave composta (`temporada + competição + par de clubes ordenado + rodada/data`), eliminando 100% de registros duplicados de confrontos.
- **Notícias (`news`)**: Feed higienizado sem mensagens duplicadas consecutivas e limitado aos 50 registros mais recentes.
- **Classificação (`teams`)**: Garantida ausência de clubes duplicados e consistência matemática estrita (`J = V + E + D`, `SG = GP - GC`, `P = V*3 + E`, `PCT = P/(J*3)`).

### 🔄 2. Preservação das Finanças, Elenco e Confiança entre Competições
- **Fim do Sobrescrita por Snapshots**: As funções `restorePrimaryLeagueAfterStateMatch`, `restorePrimaryLeagueAfterContinentalMatch` e `restorePrimaryLeagueAfterCopaMatch` agora restauram **apenas a estrutura da liga** (`compId`, `competition`, `teams`, `schedule`, `round`), preservando integralmente o saldo financeiro (`balance`), receitas (`income`), despesas (`expense`), preparo físico do elenco (`squad`), escalação (`lineup`) e confiança da diretoria/torcida (`trust`).
- **Sincronização em `render()`**: Cada troca de aba ou atualização de tela aciona a verificação defensiva de integridade, mantendo os dados 100% complementares e alinhados.

### 🧪 3. Bateria de Auditoria com 100% de Sucesso
- Executado o teste profundo [`scripts/test_complete_tabs_sync_and_zero_duplication.js`](file:///E:/PROJETOS%20SAAS/VSCODE%20PROJETOS/Aquino_Futebol_Manager_2026/scripts/test_complete_tabs_sync_and_zero_duplication.js) em 4 clubes (Palmeiras, Grêmio, FC Barcelona e Al-Nassr), cobrindo compras, vendas, upgrades de estádio, simulações partida por partida e renderização com **zero falhas e zero duplicações**.
- Executada auditoria profunda transversal [`scripts/deep_audit_all_tabs_and_subtabs.js`](file:///E:/PROJETOS%20SAAS/VSCODE%20PROJETOS/Aquino_Futebol_Manager_2026/scripts/deep_audit_all_tabs_and_subtabs.js) em 7 clubes de ligas e continentes variados (Flamengo, Corinthians, Palmeiras, Santos, Brasília, Real Madrid, Al-Hilal), testando todas as 12 abas e suas sub-abas (canais de notícias, abas de mercado, abas de temporada, filtros de elenco).
- Executado teste de ações interativas [`scripts/test_interactive_actions_sync.js`](file:///E:/PROJETOS%20SAAS/VSCODE%20PROJETOS/Aquino_Futebol_Manager_2026/scripts/test_interactive_actions_sync.js) validando substituições táticas de titulares/reservas, troca de formações (4-3-3, 4-4-2, 3-5-2, etc.), contratos de empréstimo no mercado, patrocínios e projeções do escritório, geração de tokens X1 e prévia de partidas. Todos com **código de saída 0**.

## [3.9.5] - 2026-10-17 (Correção Definitiva do Calendário: Sincronização Concluído, Fluxo Partida por Partida & Teste em 4 Contas)

### 📅 1. Correção Definitiva da Validação de Partidas no Calendário
- **Causa Raiz Identificada e Extirpada**: Na tela do Calendário (`calendarPage`), as partidas da Liga (`leagueTab`) e dos Estaduais (`stateMatches`) não estavam anexando diretamente o array `result` no objeto da partida. Além disso, `resolveCalendarMatchResult` não lia `m.historyMatch` e sua checagem de competição exigia igualdade estrita sem mapear o identificador genérico `'COMP'` para `state.compId` (`bra-a`, `esp-1`, etc.), fazendo com que jogos disputados continuassem com os botões "▶ Jogar" e "⚡ Simular" visíveis.
- **Solução Implementada**:
  - `leagueTab` e `stateMatches` em `js/game.js` agora calculam e anexam `result: [hg, ag]` diretamente a cada confronto concluído no histórico ou no fixture.
  - `resolveCalendarMatchResult` aprimorado para checar prioritariamente `m.historyMatch`, `m.stateFixture`, fixtures de copas/torneios e histórico do save com paridade total entre `'COMP'` e `state.compId`.
  - Quando a partida já foi jogada, renderiza exclusivamente `<span class="pill good">X x Y · Concluído</span>` e suprime 100% dos botões de ação de jogo.

### ⏱️ 2. Garantia Inviolável de Progressão Partida por Partida
- **Cronologia Estrita**: A progressão (`getActualCurrentMatch`, `canStartMatch`, `advanceToNextMatchGuaranteed`) avança estritamente data a data entre todas as competições ativas (Estaduais no meio de semana, Copas e Liga Nacional nos finais de semana).
- **Proteção contra Saltos de Data**: `advanceDateAfterMatch` não salta datas com múltiplos confrontos agendados no mesmo dia (ex: estadual e continental) e `advanceToNextMatchGuaranteed` nunca pula jogos pendentes.

### 🧪 3. Validação Real em 4 Contas / Clubes Distintos
- Executado teste automatizado completo (`scripts/test_four_careers_partida_por_partida.js`) com 4 contas e saves isolados:
  - **Conta 1 (Corinthians)**: Série A + Paulistão (6 partidas alternadas jogadas e validadas `Concluído`, 11 abas 100% OK).
  - **Conta 2 (Flamengo)**: Série A + Carioca (6 partidas alternadas jogadas e validadas `Concluído`, 11 abas 100% OK).
  - **Conta 3 (Real Madrid)**: La Liga + Champions League (6 partidas jogadas e validadas `Concluído`, 11 abas 100% OK).
  - **Conta 4 (Al-Hilal)**: Saudi Pro League + AFC Champions Elite (6 partidas jogadas e validadas `Concluído`, 11 abas 100% OK).
- **11 Abas Validadas**: Central, Calendário, Meu Time/Tática, Elenco, Mercado, Estrutura, Escritório, Carreira/X1, Temporada/Tabela, Novidades e Configurações renderizando sem qualquer falha.

## [3.9.0] - 2026-10-17 (Super Atualização: Motor de Jogo Realista 3D, VAR na TV, Alternador Copa/Libertadores, Blindagem Inviolável de Avanço & Tela de Novidades)

### 🛡️ 1. Blindagem Crítica Inviolável dos Botões de Avanço e Calendário
- **Causa Raiz Corrigida**: Os botões da janela de transferências (`btnAdvanceTransferWindowDay`, `btnAdvanceTransferWindowHours`) na Central não possuíam listeners e seus cards disparavam `advanceTransferWindow()`, que não estava declarada.
- **Implementação Robusta**:
  - Implementada `advanceTransferWindow(step = 24)` no `js/game.js` com suporte completo a dias (1 a 4) e avanço de 6 em 6 horas no Deadline Day até as 24:00.
  - Exportação global no `window`: `advanceTransferWindow`, `advanceTransferWindowDay`, `advanceTransferWindowHours`, `advancePreSeasonDay`, `skipPreSeason`, `advanceCalendarDays`.
  - Amarração de todos os botões na `bind()` com flag anti-duplicação (`dataset.handlingClick`).
  - Fallback global capturado no `document` via `calendar_and_day_advance_fix.js`, interceptando cliques por ID ou texto mesmo se o DOM for re-renderizado.
  - Regra crítica permanente adicionada ao `AGENTS.md`.

### ⚽ 2. Motor de Jogo Realista 3D & Efeitos de Transmissão de TV
- **Carrinhos & Desarmes**: Desarmes no chão com rastro físico na grama (`skid marks`) e animação de queda realista.
- **Fintas 1v1**: Dribles dinâmicos com quebra de marcação, aura visual de aceleração e efeito de stun no defensor.
- **Passes em Cadeia**: Sequência fluida de passes conectando meio-campo e ataque até a finalização ao gol.
- **Linhas 3D de Impedimento & Bandeirinhas**: Assistentes laterais nas duas extremidades correndo e erguendo bandeiras quadriculadas em lances de impedimento, com linha 3D projetada sobre o gramado.
- **Cabine do VAR & TV Replay**: Cabine física com monitor na beira do campo e overlay de televisão exibindo replay oficial com ângulo dramático.
- **Arquitetura de Estádio com 4 Setores**: Renderização dos 4 setores (Norte, Sul, Leste e Oeste) dimensionados pelo nível real de infraestrutura.
- **Câmera de TV Dinâmica**: Câmera inteligente de transmissão com rastreamento contínuo da bola, zoom suave e ângulos abertos.

### 🔄 3. Alternador Rápido Copa do Brasil & Libertadores
- **Widget 2 na Central**: Botões `[🇧🇷 COPA]` e `[🏆 LIBERTADORES]` permitindo alternar instantaneamente entre a Copa do Brasil e a Libertadores sem sair da Central.
- **Atalhos na Temporada**: Navegação bidirecional rápida entre as tabelas de ambas as copas.

### 📢 4. Atualização Oficial da Tela de Novidades & Correções
- **Tela Interna do Jogo**: Atualizado `js/ui/changelog_14outubro.js` com a data atual **17 de Outubro de 2026** (`HOJE · 17 DE OUTUBRO`), destacando todas as novidades e correções para visualização direta do usuário na aba *Novidades & Correções*.

## [3.8.8] - 2026-10-17 (Correção do Botão 📋 PRÉVIA, Exportações Globais de Modais & Auditoria Integral 100% Limpa)

### 📋 1. Correção Imediata do Botão de Prévia (`📋 PRÉVIA`)
- **Causa Raiz Identificada**: No `js/game.js`, as funções `openCustomModal` e `closeCustomModal` estavam encapsuladas no escopo interno da IIFE `(function(){ ... })()` sem exportação para o objeto global `window`. Como consequência, o módulo `match_preview_pro.js` não encontrava a função no escopo global e, ao interceptar o clique com `e.stopPropagation()`, a prévia não abria silenciosamente.
- **Exportação Global no `game.js`**: Exportadas para `window`: `openCustomModal`, `closeCustomModal`, `userFixture`, `clubByName`, `overallSquad`, `curComp`, `clubStadiumName`, `getMatchWeather`, `compById`, `playersForClub`, `formatDatePtBr`, `playerPhoto`, `ratingClass`, `playerSalary`, `playerOverall`, `calcValueMi`, `fmtMi`, `buyPlayer` e `findGlobalPlayerByKey`.
- **Camada Autônoma de Fallback no `match_preview_pro.js`**: Adicionada injeção de DOM independente caso o modal global não esteja disponível, garantindo que o overlay `#appCustomModal` sempre seja renderizado no `document.body`.
- **Parâmetros de Partida em Atributos Data**: Adicionados `data-home`, `data-away`, `data-comp`, `data-date` aos botões `#btnMatchPreviewCentral` (tanto do card de hoje quanto do card de próxima partida futura) para resolução instantânea e sem atraso.
- **Cache-Busting no `index.html`**: Scripts atualizados com a tag de versão `?v=20261017_preview_fix4` para garantir que o navegador não utilize versões em cache do script.

### 🛡️ 2. Fortalecimento de Listeners & Auditoria Preventiva
- **Proteção Contra Erros em Listeners de Modais**:
  - `openCustomModal`: Validação defensiva com `overlay.querySelector('#modalCloseXBtn')` e verificação de nulidade antes de associar `.onclick`.
  - `openPressConferenceModal`: Adicionada verificação segura e escopo local no botão `#btnClosePressRoom`.
- **Validação de Testes Unitários e E2E**:
  - `scripts/test_preview_button_click.js`: 100% APROVADO.
  - `scripts/full_system_audit.js`: 100% LIMPO (zero erros de sintaxe, zero erros de runtime em todas as 9 telas e sistemas).
  - `scripts/test_all_continents.js`: 100% APROVADO (12 de 12 clubes na América do Sul, Europa e Ásia com prévia, simulação, copas e ligas locais perfeitas).

## [3.8.7] - 2026-10-17 (Auditoria Geral do Jogo 100% Limpa e Validação Completa das Ligas da América do Sul, Europa e Ásia)

### 🌍 1. Validação Completa Multi-Continental (12 Ligas & Clubes)
- **América do Sul**:
  - **Boca Juniors (arg-1)**: 41 jogos disputados (Liga Profesional, CONMEBOL Libertadores, Mundial de Clubes FIFA) — 100% OK.
  - **Colo-Colo (chi-1)**: 30 jogos disputados (Primera División de Chile) — 100% OK.
  - **Peñarol (uru-1)**: 36 jogos disputados (Primera División Uruguaya, CONMEBOL Libertadores) — 100% OK.
  - **Atlético Nacional (col-1)**: 38 jogos disputados (Categoría Primera A) — 100% OK.
- **Europa**:
  - **Real Madrid (esp-1)**: 52 jogos disputados (LaLiga, UEFA Champions League, Mundial de Clubes FIFA) — 100% OK.
  - **Arsenal (eng-1)**: 46 jogos disputados (Premier League, UEFA Champions League) — 100% OK.
  - **Inter (ita-1)**: 52 jogos disputados (Serie A, UEFA Champions League, Mundial de Clubes FIFA) — 100% OK.
  - **Bayern München (ger-1)**: 48 jogos disputados (Bundesliga, UEFA Champions League, Mundial de Clubes FIFA) — 100% OK.
- **Ásia**:
  - **Al-Hilal (ksa-1)**: 48 jogos disputados (Saudi Pro League, AFC Champions League Elite, Mundial de Clubes FIFA) — 100% OK.
  - **Al-Nassr (ksa-1)**: 42 jogos disputados (Saudi Pro League, AFC Champions League Elite) — 100% OK.
  - **Vissel Kobe (jpn-1)**: 46 jogos disputados (J1 League, AFC Champions League Elite) — 100% OK.
  - **Ulsan HD (kor-1)**: 30 jogos disputados (K League 1, AFC Champions League Elite) — 100% OK.
- **Folgas (BYEs)**: ZERO rodadas de folga ou discrepâncias de tabela em todas as 12 ligas internacionais testadas.
- **Contaminação de Estaduais**: ZERO vazamentos de estaduais brasileiros para clubes estrangeiros.

### 🛡️ 2. Proteção de Roster Mestre & Sincronização Canônica
- **Preservação de `data/competition_teams.js`**: `data/international_teams_2026_27.js` agora preserva as listas mestres já configuradas, evitando que nomes anglicizados sobrescrevam as equipes canônicas (`Colo-Colo`, `Inter`, `Bayern München`, `FC Barcelona`, `Roma`).
- **Sincronia Total de Torneios Continentais & Mundiais**: Clubes da liga nacional agora compartilham a mesma chave canônica com a Libertadores, Champions League, AFC Elite e Mundial de Clubes FIFA.

### 🔍 3. Auditoria Geral de Sistemas, Telas & Persistência (100% Aprovada)
- **Renderização Limpa de Todas as Views**: Testadas e validadas sem nenhum erro: Central, Elenco, Táticas, Calendário, Classificação, Mercado, Estrutura, Finanças e Sala de Troféus.
- **Proteção no Módulo de Ações SAF**: Protegido o acesso a `.options` em `updateSellCalc` e botões de preset em `manager_life_and_shares_pro.js`.
- **Exportações Globais de Táticas e Transferências**: `ensureTacticsState`, `optimizeLineup`, `isTransferWindowOpen` e `newCareer` exportados e disponíveis globalmente.
- **Persistência de Save/Load**: Auditoria de integridade do `localStorage` com 100% de sucesso na gravação e recuperação de dados.

## [3.8.6] - 2026-10-17 (Suporte e Simulação 100% Internacional: América do Sul, Europa & Ásia)

### 🌎 1. Ligas e Campeonatos Próprios da América do Sul, Europa e Ásia
- **Eliminação de Estaduais em Clubes Internacionais**: Corrigido `clubStateCompId` para retornar `null` em clubes de ligas internacionais (Argentina, Espanha, Inglaterra, Arábia Saudita, Japão, etc.). Clubes internacionais nunca mais são inseridos indevidamente no Campeonato Paulista.
- **Ativação Completa dos Torneios Continentais & Mundiais (2026)**:
  - **UEFA Champions League (`ucl`)**: Real Madrid, Arsenal, Manchester City, Bayern München, Barcelona e os 36 clubes europeus com 8 rodadas da fase de liga geradas automaticamente.
  - **UEFA Europa League (`uel`)**: 36 clubes participantes com confrontos e tabela completa da temporada 2026.
  - **AFC Champions League Elite (`afc-el`)**: Adicionada a lista com os 24 clubes de elite da Ásia (Al-Hilal, Al-Nassr, Al-Ittihad, Vissel Kobe, Ulsan HD, etc.) com 8 rodadas completas.
  - **Mundial de Clubes FIFA (`cwc`)**: Confrontos e grupos ativos com participação dos campeões e gigantes mundiais.
  - **CONMEBOL Libertadores (`lib`)**: Boca Juniors, River Plate e clubes sul-americanos com 100% dos confrontos e classificação de grupos ativos.

### 📋 2. Prévia Oficial e Cards no Calendário Internacional
- **Prévia Dinâmica (`📋 Prévia`)**: Integrada com histórico e aproveitamento recente em todas as competições continentais europeias, asiáticas e sul-americanas.
- **3 Botões em Cada Card do Calendário**: Todos os confrontos de ligas locais (LaLiga, Premier League, Liga Profesional Argentina, Saudi Pro League, J1 League) e copas continentais contam com botões dedicados de `▶ Jogar`, `⚡ Simular` e `📋 Prévia`.
- **Cards 100% Concluídos**: Cada jogo disputado atualiza em tempo real o placar `${hg} x ${ag} · Concluído` no calendário do usuário.

### 🔄 3. Validação de Simulação Completa do Ano e Transição para 2027
- **Boca Juniors (arg-1 / América do Sul)**: 41 jogos disputados, 41 cards concluídos (100%), classificado e campeão, virada de ano para 2027 com sucesso.
- **Real Madrid (esp-1 / Europa)**: 52 jogos disputados (LaLiga + UCL + Mundial), 52 cards concluídos (100%), virada de ano para 2027 com sucesso.
- **Al-Hilal (ksa-1 / Ásia)**: 48 jogos disputados (Saudi Pro League + AFC Elite + Mundial), 48 cards concluídos (100%), virada de ano para 2027 com sucesso.

## [3.8.5] - 2026-10-17 (Prévia com Histórico & Forma Recente, Libertadores 100% Jogável, Ações nos Cards do Calendário e Transição de Temporada)

### 🏆 1. Correção Definitiva da Libertadores & Torneios Continentais
- **Bloqueio de Auto-Simulação Indevida**: Eliminada a auto-simulação de partidas continentais do clube do usuário em segundo plano (`processContinentalFixturesBefore`). O técnico agora tem controle total para jogar ou simular quando desejar.
- **Auto-Reparo de Saves Corrompidos**: Criada rotina automática em `repairSaveIfCorrupted` que detecta confrontos continentais do usuário marcados como 0x0 sem histórico e restaura seu status para `scheduled`, permitindo que o usuário dispute partidas como Peñarol e Platense normalmente.
- **Suporte Completo ao Motor 2D Ao Vivo e Simulação**: Partidas continentais suportam tanto o jogo interativo no campo 2D com 22 atletas (`beginContinentalLiveMatch`) quanto simulação instantânea (`playContinentalFixture`) com atualização em tempo real da tabela de grupos.

### 🎮 2. Sistema Universal de 3 Botões em TODAS as Partidas (Central e Calendário)
- **Toda Partida de Qualquer Campeonato com 3 Botões**:
  - `▶ Jogar` (`#playMatchLive` / `.btnCalPlayNow`, `.btnCalStatePlay`, `.btnCalCopaPlay`, `.btnCalTournamentPlay`): inicia a partida ao vivo no simulador visual 2D.
  - `⚡ Simular` (`#playMatchQuick` / `.btnCalSimNow`, `.btnCalStateSim`, `.btnCalCopaSim`, `.btnCalTournamentSim`): simula o resultado de forma imediata.
  - `📋 Prévia` (`#btnMatchPreviewCentral` / `.btnCalPreviewNow`): abre o Raio-X oficial do confronto, comparação setor a setor, provável 11 titular e probabilidades estatísticas.
- **Execução Direta em Datas Futuras**: Clicar em Jogar ou Simular em qualquer data do calendário sincroniza automaticamente a data do save e executa a partida sem travas.

### 📋 3. Prévia Oficial da Partida (Match Preview Pro) Turbinada

### 🏆 2. Libertadores & Torneios Continentais 100% Jogáveis
- **Parada Obrigatória no Dia do Jogo**: O avanço de calendário (`advanceCalendarDays`) agora valida a cada dia avançado se há partida do clube do usuário agendada para aquela data exata, interrompendo o avanço para que o técnico possa disputar ou simular a partida através dos botões.
- **Sincronização de Datas de Quarta-Feira**: Ajustada a data inicial dos torneios de grupos para quartas-feiras (`2026-03-04`), garantindo que o calendário e o motor de torneios operem com as mesmas datas exatas (`ensureMidweekDate`).
- **Suporte a Jogo Ao Vivo e Simulação Rápida**: Jogos continentais podem ser disputados tanto no simulador 2D ao vivo (`beginContinentalLiveMatch`) quanto simulados rapidamente com um clique (`playContinentalFixture`), registrando os resultados no save e na classificação do grupo.

### 📅 3. Botões de Ação em Todos os Cards do Calendário
- **Ações Completas em Cada Card**: Todo confronto no calendário agora conta com botões interativos dedicados:
  - `▶ Jogar`: inicia a partida ao vivo para aquela competição específica (Estadual, Copa, Continental ou Liga).
  - `⚡ Simular`: simula rapidamente o confronto e avança o calendário em +1 dia.
  - `📋 Prévia`: abre imediatamente o raio-x e análise pré-jogo contra o adversário daquele card.
- **Placares Concluídos em 100% dos Jogos Realizados**: Após o apito final, os cards passam a exibir `${hg} x ${ag} · Concluído` e mantêm o botão de prévia para consulta histórica.

### 🚀 4. Simulação Completa do Ano & Transição para a Próxima Temporada (2027)
- **Verificação Total em Todas as Divisões**: Testado com sucesso do início ao fim em clubes da Série A (Flamengo, Santos com Libertadores, Sul-Americana, Estaduais e Copa) e Série D (Brasília com Candangão e Copa).
- **Virada de Temporada Limpa para 2027**: `advanceSeasonYear()` processa premiações, prêmios individuais, evolução do elenco, rebaixamentos e acessos, avançando o ano para 2027 e gerando um calendário novinho para a continuidade da carreira.

## [3.8.4] - 2026-10-17 (Simulação Completa do Ano, Calendário 100% Jogável e Correção de Confrontos Estaduais/Copas)

### ⚡ 1. Simulação do Ano Inteiro Sem Travamentos
- **Suporte Total a Todas as Competições**: `simulateQuickRound` e `startLiveMatch` agora identificam e delegam com precisão para Campeonatos Estaduais (`simulateQuickStateLeagueRound`), Copa do Brasil (`playCopaDoBrasilFixture`), Torneios Continentais (`playContinentalFixture`) e Liga Nacional.
- **Avanço Automático de Data (+1 Dia)**: Copa do Brasil e torneios continentais avançam o calendário em +1 dia após a realização da partida, garantindo que o fluxo do jogo nunca fique estagnado na data do confronto.
- **Fim dos Jogos Pulados ou Travados**: Corrigido o algoritmo de ordenação de partidas pendentes (`getActualCurrentMatch`), priorizando confrontos do dia ou pendentes anteriores antes de pular para datas futuras.

### 🔄 2. Correção de Conflitos em Jogos de Retorno (Turno e Returno / Mata-Mata)
- **Eliminação do Falso "Partida Já Disputada"**: A verificação de partidas disputadas (`alreadyPlayed`) nos Estaduais agora valida estritamente a rodada (`h.round === roundIndex + 1`), permitindo que confrontos de returno (ex: Flamengo x Maricá no turno e Maricá x Flamengo no returno) e fases eliminatórias de ida e volta sejam jogados normalmente.
- **Transição de Fim de Campeonato Principal**: Quando a divisão nacional termina, partidas pendentes de Estaduais ou Copas são desbloqueadas imediatamente como jogáveis na Central sem gerar travamento por `season_finished` prematuro.

### 📅 3. Renderização Perfeita do Calendário
- **Status "Concluído" em Todos os Confrontos Realizados**: As partidas de Estaduais, Copa do Brasil e Continentais agora recuperam tanto o histórico quanto os resultados dos fixtures e exibem os placares corretos (`X x Y · Concluído`) em todos os cards do calendário.
- **Botões Dinâmicos e Sem Partidas Fantasma**: Qualquer partida com data atingida ou pendente pode ser disputada diretamente pelo calendário sem inconsistências.
- **Sistemas de Jogo Ativos ao Longo do Ano**: Renda de bilheteria nos estaduais em casa, consumo de fadiga/estamina, evolução/desenvolvimento de atletas e finanças processados em todos os jogos do ano.

## [3.8.3] - 2026-10-17 (Sincronização da Central com Competição Ativa, Botão Ir Para a Próxima Partida & Janela de Transferências)

### 🏟️ 1. Central de Jogos — Sincronização Dinâmica com a Competição Ativa
- **Identificação Precisa do Campeonato**: O banner e o cabeçalho da Central agora identificam exatamente a competição da partida atual (Campeonato Estadual, Copa do Brasil, Divisão Nacional ou Torneio Continental) em vez de fixar indevidamente a Série A/B.
- **Rodada e Data Reais**: Exibição da rodada correspondente do confronto ativo e da data real da partida, sem exibir "Hoje" para partidas que ocorrem em datas futuras.
- **Identificação Mandante / Visitante**: Tag "SEU CLUBE" enriquecida com a indicação precisa do mando de campo ("SEU CLUBE · MANDANTE" ou "SEU CLUBE · VISITANTE").

### ⏩ 2. Fluxo de Avanço Simplificado ("Ir Para a Próxima Partida")
- **Remoção de Contadores Confusos**: Eliminados os textos que mostravam quantidade de dias a pular ("Até o jogo (4d)"); substituído pelo botão direto e limpo **"IR PARA A PRÓXIMA PARTIDA"**.
- **Avanço Preciso**: Garantia de avanço direto no calendário até a data exata do próximo confronto agendado, sincronizado com o motor de calendário e todas as competições ativas.

### ⏳ 3. Janela de Transferências & Deadline Day na Central
- **Suporte a Horas no Deadline Day**: O topo e os cards da Central exibem o avanço gradual de 6 horas durante o último dia da janela de transferências com horários oficiais (06:00, 12:00, 18:00, 23:59).
- **Opção de Avanço e Pular Janela**: Botões integrados na Central permitem tanto curtir as últimas horas da janela quanto pular diretamente para a estreia oficial.

## [3.8.2] - 2026-10-17 (Fluxo Realista de Propostas de Venda/Empréstimo, Pré-Fases Continentais e Copa do Brasil no Calendário)

### 🏷️ 1. Mercado & Propostas Orgânicas ao Listar Atletas
- **Fim das Propostas Instantâneas**: Ao colocar um jogador à venda ou para empréstimo, ele passa a figurar na lista oficial e aguarda o interesse de outros clubes, sem que 3 propostas fictícias surjam no mesmo segundo.
- **Chegada Gradual no Avançar das Rodadas**: Durante as rodadas (especialmente com janela de transferências aberta e conforme o nível do atleta), propostas oficiais de compra e empréstimo chegam organicamente via feed de notícias e ficam disponíveis na central de negociação do jogador.
- **Feedback Visual Claro**: Interface exibe estado de espera bem ilustrado ("Atleta listado • Aguardando propostas dos clubes interessados").

### 🏆 2. Correção das Pré-Fases Continentais (Libertadores e Sul-Americana)
- **Central Completa de Confrontos**: Corrigida a tela de "Pré Fase 1", "Pré Fase 2", "Pré Fase 3", "Fase Preliminar" e "Playoffs de Oitavas" (16-avos).
- **Dados Oficiais e Detalhamento**: Exibição dos confrontos reais, escudos dos clubes, placares de ida e volta, placar agregado, penalidades e identificação clara do clube classificado e seu destino na fase de grupos.

### 📅 3. Copa do Brasil e Calendário Oficial
- **Integração no Calendário do Clube**: Clubes participantes (incluindo Corinthians na 5ª fase contra o Barra-SC) passam a ter seus jogos de ida e volta e fases subsequentes devidamente visíveis e filtráveis na aba "🏅 Copa do Brasil".
- **Identificação de Rodadas Continentais**: Confrontos da Fase de Grupos exibem o indicativo formal da rodada ("Fase de Grupos • Rodada X").
- **Compatibilidade Retroativa de Saves (v3)**: Saves existentes preservam as fases já concluídas e atualizam a 5ª fase com os 16 confrontos oficiais da competição.

## [3.8.1] - 2026-10-17 (Harmonização de Overalls & Calibragem de Atletas Gerados)

### ⚙️ 1. Unificação de Overalls em Todas as Telas
- **playerOverall(p)**: Unificação total dos cálculos de overall (`pes * 0.7 + fc * 0.3`). As propriedades `p.ovr` e `p.overall` agora são sincronizadas atomicamente de forma bidirecional em qualquer leitura ou renderização.
- **Exportação Global**: `window.playerOverall` e `window.calcValueMi` disponíveis no escopo global para todos os módulos auxiliares (Mercado, Lupa, Olheiros e Assistente de Elenco).
- **stablePlayer(p)**: Garante que objetos estáveis de atletas contenham tanto `ovr` quanto `overall` rigorosamente calculados e idênticos.

### 🛡️ 2. Calibragem e Sanitização de Atletas Genéricos/Gerados (`worldGenerated`)
- **Teto Realista por Faixa Etária**: Eliminados casos de atletas genéricos de preenchimento (`gen-...`) criados com 90+ overall sem histórico.
  - Jovens (≤ 21 anos): OVR máximo 72, Potencial até 84.
  - Auge (22–28 anos): OVR máximo 78, Potencial até 80.
  - Experientes (> 28 anos): OVR máximo 75, Potencial até 80.
- **Sanitização de Saves Existentes (`sanitizeWorldGeneratedPlayers`)**: Varredura automática e retrocompatível no carregamento do universo de mercado que ajusta imediatamente atletas gerados antigos que estivessem inflacionados, preservando craques reais do banco de dados oficial (`livePlayers`).

## [3.8.0] - 2026-10-16 (Atualização Geral do Banco de Dados: Overalls Reais, Mercado e Clubes 2025/2026)

### ⚽ 1. Atualização Completa de Overalls e Atletas (Brasil & Mundo)
- **Série A & Futebol Brasileiro**:
  - **Flamengo**: Gabigol transferido para o Cruzeiro; contratação oficial de Alex Sandro (LE, 80 OVR, 4 Mi €); Pedro (83 OVR), Gerson (83 OVR), Arrascaeta (83 OVR), Léo Ortiz (81 OVR), Agustín Rossi (81 OVR), Carlos Alcaraz (79 OVR / 86 POT), Gonzalo Plata (79 OVR).
  - **Palmeiras**: Estêvão promovido a 83 OVR (93 POT, 50 Mi €) com transferência futura programada para o Chelsea; Vitor Reis (78 OVR / 89 POT), Aníbal Moreno (81 OVR), Flaco López (81 OVR), Maurício (80 OVR), Murilo (81 OVR), Piquerez (81 OVR).
  - **Cruzeiro**: Gabriel Barbosa "Gabigol" adicionado como reforço oficial (81 OVR, 10 Mi €); Matheus Pereira (83 OVR), Kaio Jorge (80 OVR / 86 POT), Matheus Henrique (80 OVR), William (80 OVR), Walace (79 OVR), Álvaro Barreal (79 OVR).
  - **Botafogo**: Campeão e finalista atualizado com Luiz Henrique (84 OVR, 35 Mi €), Thiago Almada (84 OVR, 32 Mi €), Igor Jesus (82 OVR, 22 Mi €), Savarino (81 OVR), John (80 OVR), Bastos (80 OVR), Alexander Barboza (80 OVR), Alex Telles (80 OVR), Gregore (80 OVR), Marlon Freitas (80 OVR).
  - **Corinthians**: Rodrigo Garro (82 OVR / 85 POT), Yuri Alberto (82 OVR / 86 POT), Memphis Depay (83 OVR), Hugo Souza (80 OVR / 84 POT), Breno Bidon (76 OVR / 86 POT), André Carrillo (78 OVR), José Martínez (78 OVR).
  - **São Paulo**: Jamal Lewis adicionado (LE, 75 OVR); Rafael (80 OVR), Arboleda (80 OVR), Pablo Maia (80 OVR), Alan Franco (79 OVR), Bobadilla (78 OVR).
  - **Atlético-MG**: Hulk (83 OVR), Paulinho (82 OVR), Gustavo Scarpa (81 OVR), Guilherme Arana (81 OVR), Battaglia (80 OVR), Junior Alonso (80 OVR), Deyverson (79 OVR).
  - **Internacional**: Alan Patrick (82 OVR), Rochet (81 OVR), Vitão (80 OVR), Wesley (80 OVR), Bernabei (79 OVR), Fernando (79 OVR), Gabriel Carvalho (76 OVR / 88 POT).
  - **Fluminense**: Thiago Silva (83 OVR), Jhon Arias (83 OVR), Fábio (80 OVR), Ganso (80 OVR), Kauã Elias (77 OVR / 87 POT), Kevin Serna (78 OVR).
  - **Vasco**: Vegetti (81 OVR), Philippe Coutinho (81 OVR), Léo Jardim (81 OVR), Dimitri Payet (80 OVR), Lucas Piton (79 OVR), Rayan (76 OVR / 87 POT).
  - **Bahia**: Everton Ribeiro (81 OVR), Jean Lucas (81 OVR), Cauly (80 OVR), Caio Alexandre (80 OVR), Luciano Rodríguez (80 OVR / 87 POT), Gabriel Xavier (80 OVR).
  - **Fortaleza**: João Ricardo (80 OVR), Juan Martín Lucero (80 OVR), Tomás Pochettino (79 OVR), Hércules (78 OVR / 84 POT), Yago Pikachu (78 OVR), Moisés (78 OVR).
  - **Grêmio**: Braithwaite (81 OVR), Villasanti (81 OVR), Cristaldo (80 OVR), Soteldo (80 OVR), Miguel Monsalve (78 OVR / 85 POT).
  - **Santos**: Gabriel Brazão (76 OVR / 81 POT), JP Chermont (75 OVR / 85 POT), Jair Cunha (76 OVR / 86 POT), Guilherme (78 OVR), Wendel Silva (76 OVR), João Schmidt (77 OVR).

- **Gigantes Europeus & Resto do Mundo**:
  - **Real Madrid**: Vinicius Jr (91 OVR, 94 POT, 200 Mi €), Kylian Mbappé (91 OVR, 94 POT, 180 Mi €), Jude Bellingham (90 OVR, 94 POT, 180 Mi €), Federico Valverde (89 OVR), Rodrygo (87 OVR), Endrick (80 OVR / 92 POT), Arda Güler (81 OVR / 90 POT), Camavinga (85 OVR), Tchouaméni (86 OVR).
  - **FC Barcelona**: Wojciech Szczęsny adicionado (85 OVR); Lamine Yamal (87 OVR, 96 POT, 160 Mi €), Raphinha (88 OVR, 90 Mi €), Pedri (88 OVR), Dani Olmo (86 OVR), Gavi (86 OVR), Jules Koundé (86 OVR), Pau Cubarsí (83 OVR / 93 POT), Marc Casadó (81 OVR / 88 POT), Alejandro Balde (82 OVR).
  - **Manchester City**: Erling Haaland (91 OVR), Rodri (91 OVR), Phil Foden (89 OVR), Savinho (83 OVR / 90 POT), Josko Gvardiol (86 OVR).
  - **Liverpool**: Mohamed Salah (89 OVR), Virgil van Dijk (89 OVR), Alisson Becker (89 OVR), Trent Alexander-Arnold (86 OVR), Alexis Mac Allister (86 OVR), Ryan Gravenberch (84 OVR / 89 POT), Luis Díaz (85 OVR).
  - **Arsenal**: Bukayo Saka (87 OVR / 90 POT), William Saliba (87 OVR / 91 POT), Martin Ødegaard (89 OVR), Declan Rice (87 OVR), Gabriel Magalhães (86 OVR), David Raya (85 OVR), Kai Havertz (84 OVR).
  - **Chelsea**: Cole Palmer (86 OVR / 91 POT), Moisés Caicedo (83 OVR / 88 POT), Enzo Fernández (83 OVR / 88 POT), Nicolas Jackson (81 OVR / 86 POT), Marc Cucurella (82 OVR), Pedro Neto (80 OVR / 85 POT).
  - **Bayern München**: Michael Olise (85 OVR / 90 POT), Jamal Musiala (88 OVR / 93 POT), Harry Kane (90 OVR), Joshua Kimmich (88 OVR), João Palhinha (84 OVR), Aleksandar Pavlović (80 OVR / 88 POT).
  - **Sporting CP**: Viktor Gyökeres (86 OVR, 75 Mi €), Morten Hjulmand (82 OVR), Gonçalo Inácio (81 OVR / 88 POT), Pedro Gonçalves (83 OVR), Geovany Quenda (76 OVR / 88 POT).
  - **Atlético de Madrid**: Antoine Griezmann (88 OVR), Julián Álvarez (85 OVR / 90 POT), Jan Oblak (88 OVR), Rodrigo De Paul (84 OVR), Robin Le Normand (83 OVR).
  - **Juventus**: Bremer (86 OVR), Teun Koopmeiners (84 OVR), Dušan Vlahović (84 OVR), Douglas Luiz (83 OVR), Kenan Yildiz (80 OVR / 90 POT).
  - **PSG**: João Neves (83 OVR / 91 POT), Willian Pacho (83 OVR / 87 POT), Bradley Barcola (84 OVR / 90 POT), Vitinha (86 OVR), Gianluigi Donnarumma (88 OVR), Achraf Hakimi (85 OVR), Lucas Beraldo (79 OVR / 86 POT).
  - **Arábia Saudita & MLS**: Neymar Jr (88 OVR), Cristiano Ronaldo (86 OVR), Lionel Messi (88 OVR), Luis Suárez (82 OVR), Bono (87 OVR), João Cancelo (85 OVR), Bento (81 OVR), Simakan (81 OVR).

### 🏢 2. Calibragem dos Atributos Globais dos Clubes (`BASE_CLUBS`)
- Rebalanceamento das forças de ataque, meio-campo, defesa e orçamentos para refletir a temporada 2025/2026:
  - Botafogo: atk 83, mid 80, def 80, budget 85
  - Flamengo: atk 83, mid 81, def 81, budget 95
  - Palmeiras: atk 82, mid 81, def 81, budget 100
  - Cruzeiro: atk 81, mid 80, def 79, budget 70
  - Corinthians: atk 81, mid 79, def 78, budget 55
  - Fortaleza: atk 80, mid 78, def 78, budget 45
  - Real Madrid: atk 91, mid 88, def 86, budget 250
  - FC Barcelona: atk 89, mid 87, def 84, budget 180
  - Manchester City: atk 90, mid 88, def 86, budget 260
  - Liverpool: atk 88, mid 86, def 87, budget 210

### 🔄 3. Migração Segura e Sincronização Retroativa de Saves
- Atualização em `migrate(s)` em `js/game.js`:
  - Saves ativos recebem automaticamente as melhorias de overall (`fc`/`pes`), potencial (`potential`) e valor de mercado (`calcValueMi`) dos atletas atualizados.
  - Suporte ao ciclo de transferência pendente de jovens promissores (ex: Estêvão) com notificação e saída automática após cumprimento de data efetiva sem quebrar contratos.
### 📊 4. Prévia Oficial da Partida (Match Preview Pro)
- Integração do botão **"📊 Ver Prévia"** no Match Card central (`#btnMatchPreviewCentral`) e na lista de rodadas.
- Modal completo com:
  - Comparativo setorizado (Ataque, Meio-Campo e Defesa).
  - Probabilidades em tempo real (Vitória Mandante, Empate e Vitória Visitante).
  - Dados do estádio, clima e gramado.
  - Histórico de confrontos diretos (H2H) e últimos 5 jogos.
  - Prováveis escalações com overall médio de cada equipe.

### 🤝 5. Mercado Privado P2P & Hub de Negociações SAF
- **Sub-abas Especializadas**:
  - **🤝 Propostas dos Investidores**: Separação estruturada entre lotes que investidores da IA querem vender (com descontos atrativos de 8% a 15%) e propostas de compra para ações na carteira do treinador (com ágio de 15% a 30%).
  - **📢 Colocar Nossas Ações à Venda**: Formulário dinâmico que permite ao treinador ofertar ações da sua carteira para os magnatas da IA, escolhendo clube, quantidade (com presets de 50, 100, 250 ou Tudo) e margem de ágio (+5% a +25%), exibindo cálculo financeiro instantâneo e opções de execução imediata ou cancelamento.
  - **📊 Livro de Negociações em Tempo Real**: Feed cronológico auditável de todas as compras e vendas de ações SAF realizadas no mercado pelo usuário e pelos grandes fundos.
- **Validação Completa**:
  - Compra e venda de ações com cálculo de taxas de corretagem da Bolsa, débito/crédito direto no saldo pessoal e sincronização do patrimônio auditados via navegador.

### 🏛️ 6. Pregão da Bolsa SAF: Botões Explícitos "Confirmar Compra" e "Confirmar Venda"
- Coluna da tabela atualizada para **`CONFIRMAR COMPRA / CONFIRMAR VENDA`**.
- Cada linha exibe botões com texto e estilo destacados:
  - **`🛒 Confirmar Compra`**: Abre modal de ordem com cálculo dinâmico do custo e botão verde **`✅ Confirmar Compra (X ações por R$ Y)`**.
  - **`💰 Confirmar Venda`**: Abre modal de ordem com cálculo dinâmico do lucro líquido e botão vermelho **`🔴 Confirmar Venda (X ações por +R$ Y)`**. Para clubes em que o treinador ainda não tem ações, o botão fica identificado como `💰 Confirmar Venda (0)` e permite alternar para compra com um clique.
- Atualização em `manager_economy.js`: Botão de cotas do clube atualizado para **`✅ CONFIRMAR COMPRA DE 1 COTA`**.
  - Tabela/situação oficial da competição.
  - Escalação provável dos 11 titulares do adversário com fotos e notas de overall.

## [3.7.0] - 2026-10-14 (Pacote 100% Completo 16 Itens AFM 2027: Calendário Intercalado 3 Dias, Sala de Troféus Real, Direitos de TV 1 Ano, Marketing Live, Copa do Brasil Neon, Licenças CBF/UEFA, Lupa Global, Regens & Fotos Reais)

### ⏩ 1. Correção Crítica do Calendário e Avanço de Dias (BLOCO 01)
- **Eliminação do Travamento em 18 de Janeiro**: `js/core/calendar_and_day_advance_fix.js` garante avanço fluido para 19 de janeiro e além, sem travar nas datas.
- **Portão de Jogo ao Vivo**: Liberação imediata e desbloqueio do botão `▶ JOGAR AO VIVO` no dia exato de qualquer partida oficial.
- **Navegação Central Direta**: O botão `Tabela completa e rodadas >` na tela Central abre instantaneamente a tabela e as rodadas na visualização de temporada.

### 📅 2. Calendário Oficial 2026 Intercalado a Cada 3 Dias (BLOCO 01)
- **Distribuição Multi-Competição**:
  - **Campeonatos Estaduais**: 11 de janeiro a 08 de março (11 datas oficiais em intervalos de 3 dias).
  - **Brasileirão Série A**: 28 de janeiro a 02 de dezembro (38 rodadas), com pausa compulsória para o Super Mundial de Clubes nos EUA (14/06 a 13/07).
  - **Copa do Brasil**: 18 de fevereiro a 06 de dezembro (Final Única no domingo 06/12).
  - **CONMEBOL Libertadores**: Fase preliminar (18/02), Fase de Grupos (abril e maio) e Grande Final única (28/11).
  - **Super Mundial de Clubes nos EUA**: 14 de junho a 13 de julho com clubes brasileiros classificados direto para as fases finais.

### 🏆 3. Sala de Troféus Real do Corinthians & Conquistas do Treinador (BLOCO 02)
- **Substituição dos Títulos Impróprios**: Removida a exibição incorreta de títulos do Candangão.
- **Histórico Oficial do Clube**: Inseridos os 2 Mundiais de Clubes da FIFA (2000, 2012), 1 Libertadores Invicto (2012), 7 Brasileirões Série A, 3 Copas do Brasil, 1 Recopa Sul-Americana, 1 Supercopa e 31 Campeonatos Paulistas.
- **Gabinete de Conquistas do Treinador**: Seção dedicada exibindo taças ganhas pelo técnico no save ativo isolado.

### 📺 4. Direitos de Transmissão em Ciclo de 1 Ano (BLOCO 02)
- **Painel em Escritório & Patrocinadores**: Exibição das emissoras e plataformas oficiais:
  - **Grupo Globo (Libra)**: TV Globo, SporTV, Premiere e Globoplay (exclusividade total de TV aberta, fechada, streaming e PPV).
  - **Amazon Prime Video (LFU)**: Streaming exclusivo de 1 jogo por rodada como mandante dos clubes da Liga Forte União.
  - **TV Record & Google/YouTube (LFU)**: Transmissão em TV aberta e canal CazéTV no YouTube.
  - **1190 Sports & Fanatiz**: Direitos internacionais para o exterior (com exclusão dos jogos do Flamengo como mandante).

### 📈 5. Slider de Marketing em Tempo Real & Folha com Salário do Treinador (BLOCO 02)
- **Cálculo em Tempo Real**: O slider de investimento semanal em marketing recalcula instantaneamente na tela:
  - **Retenção de Sócios-Torcedores (+%)**
  - **Boost em Propostas de Patrocínio (+% bônus)**
  - **Receita Estimada de Patrocínio (R$/mês)**
- **Folha Salarial Completa**: O salário do treinador é somado na folha mensal do elenco em Escritório.
- **Vagas do Elenco Sincronizadas**: Vagas (ex: 28/35 atletas) espelham com precisão o elenco em `Meu Time`.

### 🛡️ 6. Copa do Brasil com Destaque Neon & Simulação de Mundo (BLOCO 03)
- **Destaque Visual do Time do Usuário**: Card exclusivo em gradiente neon destacando os confrontos do clube do jogador no mata-mata da Copa do Brasil.
- **Mundo Vivo da Carreira**: A cada avanço de dia, treinadores rivais pontuam em suas competições e transferências geram notícias globais.
- **Ranking Oficial de Treinadores (Nacional & Mundial)**: Comparativo de prestígio por pontos baseado em vitórias, jogos e títulos.
- **Licenças Técnicas Obrigatórias**: Sistema escalonado com 5 licenças (CBF D, CBF C, CBF B, CBF A e UEFA PRO), exigindo certificação para assumir clubes de maior força.

### 🔍 7. Lupa no Mercado, Envelhecimento 31+ e Regens Genéticos (BLOCO 04)
- **Botão Lupa `🔍`**: Cada linha do mercado agora conta com botão de inspeção que abre modal com gols, jogos, assistências, atributos físicos/técnicos e histórico.
- **Rótulo "🌐 Mercado Global"**: Substituição de "MERCADO SIMULADO ATIVO" por interface limpa e profissional.
- **Curva Realista de Envelhecimento**: Atletas a partir de 31 anos perdem aceleração e overall gradualmente a cada ano.
- **Aposentadoria & Regens Genéticos**: Jogadores com 36+ anos anunciam aposentadoria e geram Regens Genéticos na base Sub-20, herdando nacionalidade, posição e potencial estelar.

### 👕 8. Fotos Reais nos Mini-Cards do Campo Tático e Banco (BLOCO 05)
- **Hydration Visual Imediata**: Injeção de fotos recortadas dos jogadores do Corinthians e estrelas mundiais nos 11 mini-cards do gramado e na lista do banco de reservas.
- **Cache Local & Sincronização**: Resolução síncrona com fallback dinâmico preservando fluidez tática.

---

## [3.6.0] - 2026-10-14 (Super Pacote: Correção Definitiva de Tags Img, Hotfix Escritório/Estrutura, Simulador de Vida do Treinador, Cotas Realistas & Fotos Reais)

### 🖼️ 1. Correção Definitiva das Tags `<img>` e Escudos de Clubes (BLOCO 01)
- **Eliminação do Vazamento Visual**: Corrigido o fechamento prematuro do atributo `onerror="..."` provocado por aspas duplas no `<svg xmlns="...">`.
- **window.AFM_SafeImg**: Implementado fallback seguro via função dedicada e varredura preventiva de nós corrompidos.
- **Zero Poluição Visual**: Removidos vazamentos de `WES';}" />`, `BRA';}" />`, `SAM';}" />`, `COR';}" />` e `/>` no cabeçalho, barra lateral, cards de jogo, tabela da Central, confrontos do Calendário, Mercado e mini-cards táticos.

### 🏢 2. Correção Crítica nas Abas Escritório e Estrutura & Estádio (BLOCO 01)
- **Proteção Completa de Array em `state.bankLoans`**: Eliminados os erros `(state.bankLoans || []).reduce is not a function` e `(state.bankLoans || []).some is not a function`.
- **Normalização e Polyfill no `Object.prototype`**: Conversão automática de estruturas legadas `{ activeLoans: [...] }` para Arrays puros, garantindo abertura imediata e sem falhas.

### 💼 3. Cotas Realistas, Despesa de Dividendos e Simulador de Vida do Treinador (BLOCO 02)
- **Cotas Balizadas pelo Valuation do Clube**: Preço de 1% calibrado conforme divisão e força (R$ 220 mil em divisões inferiores até R$ 16,5M–R$ 32M na Série A), com compra fracionada de 0,25% e 1,0%.
- **Despesa Mensal de Dividendos pelo Clube**: Lançamento obrigatório da despesa `Despesa com Dividendos aos Acionistas` nas saídas do clube, com depósito automático da parcela societária na conta pessoal do treinador no dia 1º de cada mês.
- **Simulador de Vida Pessoal do Treinador**:
  - **Imóveis**: Apartamento Studio Executivo, Casa em Condomínio, Cobertura Duplex, Mansão com Heliponto e Ilha Particular (valorização mensal e receita de aluguel).
  - **Negócios**: Barbearia VIP, Escolinha de Futebol Oficial, Academia Fitness, Loja Esportiva, Clínica de Fisioterapia, Restaurante de Luxo e Rede de Hotéis.
  - **Garagem de Luxo**: SUV Blindado Executivo, Superesportivo Italiano e Jato Executivo Particular.

### 📸 4. Fotos Reais dos Jogadores em Todos os Clubes (BLOCO 03)
- **Elenco Completo do Corinthians Integrado**: Fotos recortadas oficiais para Garro, Yuri Alberto, Hugo Souza, Coronado, Raniele, André Ramalho, Félix Torres, Fagner, Bidu, Romero, Talles Magno, Carrillo, Bidon, Martínez, Cacá, Gustavo Henrique, Charles, Pedro Raul, Hugo e Memphis Depay.
- **Auto-Fetcher de Elencos e Caching**: Busca dinâmica de atletas via API TheSportsDB com persistência em cache local.

### 📢 5. Aba Novidades & Correções com Separação Cronológica por Dias (BLOCO 05)
- **Histórico Completo por Dias**: Organização cronológica detalhada em 7 dias (`02/10`, `05/10`, `08/10`, `10/10`, `12/10`, `13/10` e `14 de Outubro de 2026`).

---

## [3.5.0] - 2026-10-14 (Pacote Supremo 2027: 220 Melhorias, Modo X1, 4 Fases Táticas, Coletivas de Imprensa, Paginação 50 Atletas & O(1) Index)

### 🛡️ 1. Proteções Críticas, Mutex e Indexador O(1) (`js/core/bugfixes_and_guards.js`)
- **Trava Mutex no Avanço de Rodada**: Prevenção total contra duplo clique acidental (`AFM_Guards.runWithTurnLock`) com bloqueio de 400ms.
- **Indexador O(1) Ultra-Rápido**: Mapeamento instantâneo em `Map()` de atletas e clubes para busca sem gargalo de busca.
- **Fallback de Escudos em 3 Camadas**: Hierarquia automática `.svg` -> `.png` -> Brasão SVG Dinâmico estilizado com iniciais.
- **Cooldown de Áudio de 180ms**: Proteção do motor de áudio (`AFMAudioManager.playSFX`) contra repetição ou encavalamento sonoro em 20x e 40x.

### 💼 2. Economia Pessoal, Cotas e Liquidação de Saída (`js/core/manager_economy.js`)
- **Mercado de Cotas do Clube**: Aquisição de até 49% das cotas societárias do clube com reinvestimento e dividendos anuais de até 25% do lucro.
- **Valorização Dinâmica**: +35% de valorização da cota em caso de acesso de divisão e -25% em caso de rebaixamento.
- **Liquidação Automática na Mudança de Clube**: Venda compulsória e automática das cotas ao preço vigente ao assinar com um novo clube (`liquidateSharesOnClubExit`), com crédito imediato ao saldo pessoal.

### 🛒 3. Paginação Virtual de 50 Atletas no Mercado (`js/game.js`)
- **Interface Ágil e Fluida**: Divisão da lista do mercado em páginas de 50 atletas com barra de navegação "◀ Anterior" e "Próxima ▶".
- **Zero Travamento**: Redução drástica de nós no DOM mantendo a ordenação e os filtros instantâneos.

### ⚔️ 4. Modo Jogar X1 — Duelo Tático por Código (`js/core/x1_online_system.js`)
- **Desafio Tático Amigável e Competitivo**: Geração de código criptografado do time titular e tática (`btnExportMyX1Token`).
- **Simulador Desacoplado**: Importação de código rival e disputa em 90 minutos com placar e eventos detalhados, sem mutar o save da carreira.

### 🧠 5. 4 Fases Táticas & IA Adaptativa da CPU (`js/core/tactical_4phases.js`)
- **Ciclo Tático Completo**: Transições entre Construção (Build-Up), Progressão, Criação e Finalização.
- **Adaptação da CPU**: Ajuste automático da postura rival aos 75'+ caso o time adversário esteja perdendo, subindo a marcação e acionando pressão alta.

### 🤝 6. Assistente Técnico e Mentoria de Veteranos (`js/core/squad_assistant.js`)
- **Trocas Sugeridas**: Substituição automática inteligente de titulares com estafa (<72%), suspensão ou lesão.
- **Mentoria Geracional**: Veteranos (32+ anos) transmitem XP e sabedoria aos jovens talentos (sub-21) do mesmo setor a cada rodada.

### 📻 7. Placar Paralelo da Rodada em Tempo Real (`js/core/competitions_pack.js`)
- **Giro da Rodada ao Vivo**: Simulação em tempo real e avisos sonoros/textuais de gols ocorrendo nos demais confrontos da rodada durante a partida do usuário.

### 🎤 8. Coletivas de Imprensa & Diretoria (`js/core/press_and_board.js`)
- **Entrevistas Pós-Jogo**: Diálogos jornalísticos interativos pós-jogo com impacto imediato na moral do elenco, torcida e diretoria.

---

## [3.4.0] - 2026-10-14 (Economia do Treinador, Cotas do Clube, Negócios, Auxiliar Técnico, Estrelas 3 Camadas & Ranking Global)

### 💼 1. Economia Pessoal, Cotas do Clube e Negócios do Treinador (`js/systems/manager_economy.js`)
- **Aba Exclusiva de Carreira**: Adicionada a aba `💼 Carreira` no menu principal com painel completo do treinador (`#afm-career-economy-container`).
- **Cotas Societárias do Clube**: Treinador pode adquirir de 1 a 10 cotas (1% da receita anual do clube cada), injetando capital diretamente no caixa do clube, ganhando bônus de confiança da diretoria e reduzindo em até 30% a perda de confiança em tropeços.
- **Dividendos Anuais**: No encerramento da temporada, clubes com superávit pagam dividendos aos cotistas proporcionais às cotas possuídas (até 25% do valor das cotas).
- **Negócios Próprios**: Treinador pode abrir e gerenciar empreendimentos: Escolinha de Futebol (R$ 300k + revelação de jovens para a base), Loja de Artigos Esportivos (R$ 600k) e Restaurante (R$ 1,2M). Fechamento mensal de lucros com indicador de gestão e manutenção.

### 🛡️ 2. Blindagens, Cláusula de Revenda e Proteções de Save (`js/core/bugfixes_and_guards.js`)
- **Roteamento Vercel Limpo**: `vercel.json` ajustado para raiz direta (`outputDirectory: "."`) com cache imutável de imagens e revalidação de dados.
- **Cláusulas de Revenda (Solidariedade)**: Registro de percentual de mais-valia em transferências com crédito automático ao clube formador.
- **Trava de Parcelas Bancárias**: Bloqueio de cobranças múltiplas no mesmo mês via chave de período (`lastProcessedPeriod`).
- **Limpeza de Propostas**: Expiração automática de propostas de transferência pendentes ao avançar de rodada.

### 🏟️ 3. Motor ao Vivo: Áreas Técnicas e Pênaltis Interativos (`js/match/live_match_hud.js`)
- **Áreas Técnicas no Campo 2.5D**: Renderização dinâmica dos bancos de reservas com técnicos e suplentes animados em tempo real.
- **Controle de Velocidades**: Aceleração ultra-rápida (1x, 20x, 40x) com recalibração de intervalos.
- **Disputa de Pênaltis Interativa**: Modal imersivo acionado automaticamente em empates de mata-mata com escolha de canto pelo jogador e inteligência do goleiro.

### ⭐ 4. Auxiliar Técnico e Estrelas de 3 Camadas (`js/systems/squad_assistant_and_stars.js`)
- **Trocas Sugeridas do Auxiliar**: Botão inteligente na tela de Tática e Elenco que detecta atletas desgastados (<72%), lesionados ou suspensos e promove substituições automáticas preservando a qualidade posicional.
- **Estrelas em 3 Camadas**: Visualização gráfica refinada combinando Nível Atual (Dourado), Potencial Garantido (Violeta) e Teto Máximo com Bônus Jovem (Lilás).

### 🌐 5. Confiança Tripla e Ranking Global Supabase (`js/systems/global_ranking_and_confidence.js`)
- **Confiança Tripla Reativa**: Cálculo balanceado para Diretoria, Torcida e Elenco com bônus de clássicos e escudo protetor societário.
- **Sincronização com Ranking na Nuvem**: Gravação assíncrona dos pontos de carreira, patrimônio líquido e títulos no Supabase (`afm_global_ranking`) com fallback offline em `localStorage`.

---

## [3.3.8] - 2026-10-14 (Virada de Temporada 100% Precisa, Painel de Conquistas & Campeões do Mundo do Save)

### 🚀 1. Virada de Temporada Sem Falhas (`advanceSeasonYear`)
- **Execução Blindada**: Toda a rotina de avanço de temporada e transição de divisões agora opera protegida por blocos `try/catch` com fallback automático de recuperação, garantindo que o ano nunca fique travado ou em estado inconsistente.
- **Fechamento e Limpeza Automática**: Encerramento garantido do modal de encerramento (`closeCustomModal()`), reset dos marcadores de premiação (`state.seasonPrizeClaimed = null`, `state.seasonConcluded = false`) e inicialização imediata da pré-temporada do novo ano.
- **Simulação Complementar do Universo**: Inclusão de `simulateRemainingWorldTournaments(finishedYear)` para apurar e registrar os campeões de copas e torneios internacionais ainda pendentes no encerramento da temporada ativa.

### 🏆 2. Painel de Conquistas & Campanhas no Modal de Fim de Temporada
- **Resumo Detalhado da Campanha**: Exibição em tempo real de títulos conquistados pelo clube, posição e divisão alcançada, premiações monetárias adicionadas ao caixa e histórico de eliminações em mata-matas.
- **Acesso Imediato ao Histórico Global**: Inclusão do botão `🌍 Ver Campeões do Mundo do Save` diretamente no painel de conquistas do modal de virada.

### 🏛️ 3. Acesso Onipresente aos Campeões do Mundo do Save
- **Botão na Central do Treinador**: Adicionado botão de acesso direto `🌍 Campeões do Mundo do Save` no painel principal da Central, logo abaixo do Hall da Fama.
- **Navegação Cruzada**: Integração bidirecional com o Hall da Fama oficial (`openSeasonHistoryModal()`) e tela de Temporada (`seasonPage()`), permitindo ao usuário consultar a qualquer momento todos os campeões de todas as competições do seu save.

---

## [3.3.7] - 2026-10-14 (Auditoria do Workspace, Service Worker v8, Proteção Todo-Tree & Sincronização Canônica)

### 🛠️ 1. Configuração Otimizada do Workspace (`.vscode/settings.json` & `.prettierignore`)
- **Todo-Tree sem Falsos-Positivos**: Expressão regular refinada para capturar estritamente tags de desenvolvedor em maiúsculas (`TODO`, `FIXME`, `BUG`, `REVISAR`, `HACK`), ignorando menções naturais em português como *"todo dia 1º"* ou *"a todo vapor"*.
- **Prettier & Alta Performance do Editor**: Ativação do Prettier para módulos JS, CSS e HTML, com `.prettierignore` protegendo o arquivo monolítico `js/game.js` e bases de dados para evitar atrasos no salvamento automático.
- **ErrorLens & Live Server**: Diagnósticos visuais em tempo real e porta 5500 pré-calibrada com latência reduzida.

### ⚡ 2. Service Worker v8 & Cache Offline Aprimorado (`sw.js`)
- **Cache v8 Ativo**: Chave elevada para `afm-2027-cache-v8`, garantindo descarte imediato de arquivos obsoletos nos navegadores dos jogadores.
- **Inclusão Explícita de Módulos Core**: Módulos `audio_engine.js`, `match_engine.js`, `tactics_pitch.js` e `settings_modal.js` adicionados à lista de pré-cache prioritário.

### 🛡️ 3. Sincronização Canônica de Escudos & Fotos (`js/club_badges_core.js`)
- **Alinhamento Completo**: O arquivo de raiz `js/club_badges_core.js` agora espelha 100% da implementação moderna de `js/core/club_badges_core.js`, suportando slugs padronizados, avatares posicionais e fallbacks duplos de escudos e logos de competições.

### 🧪 4. Baterias de Testes no Navegador Atualizadas
- **Sanitização Global & Dependências**: `tests_engine.html` e `tests_saves_stadium.html` agora incluem a função nativa `window.esc` e a cadeia completa de scripts e regras de integridade do jogo.

---

## [3.3.6] - 2026-10-14 (Consolidação de Regras Permanentes de Economia, Bônus de Força da Torcida, Campeões do Save & Gestão do Estádio)

### 🏟️ 1. Melhorias do Estádio (+40% Base, Progressão Contínua & Visual Limpo)
- **Valores Base Atualizados (+40%)**: Cadeiras novas (R$ 28.350), Mosaico com o escudo (R$ 49.000), Anel de LED (R$ 67.200), Fogos e sinalizadores (R$ 21.000), Telão do clube (R$ 91.000) e Refletores de LED (R$ 77.000).
- **Progressão Contínua Sem Reset**: Custos de evolução estrutural progridem a +15% por nível acumulado e nunca são reiniciados na virada de temporada.
- **Ajuste de Visualização & Zoom**: CSS atualizado com `zoom: 1.05`, dimensionamento responsivo (`max-width: 96vw`) e grids flexíveis para evitar cortes em menus e botões da aba de estádio.

### 🏗️ 2. Terreno, Alvará e Construção Dinâmicos por Capacidade
- **Orçamento Reativo em Tempo Real**: Custos de Lote Urbano, Alvará da Prefeitura e Obra Civil recalculados imediatamente ao alternar a capacidade projetada da nova arena (15k, 30k, 50k, 80k e 100k lugares).
- **Toasts Informativos Corrigidos**: Mensagens de saldo insuficiente exibem o valor exato da capacidade selecionada em vez de valores estáticos legados.

### 🎪 3. Controle Rigoroso de Aluguel & Shows Culturais
- **Intervalo Estrito de 4 Rodadas**: Implementada trava de cooldown de 4 rodadas completas (~1 mês de calendário) entre propostas de aluguel para outros clubes e megaeventos de shows musicais.

### 📢 4. Aporte Semanal de Marketing
- **Base Triplicada (3x) + 20% Cumulativo por Nível**: Aporte inicial de marketing triplicado (mínimo de R$ 36.000/semana) com acréscimo de 20% a cada upgrade de instalação no departamento de marketing.

### ⚡ 5. Bônus de Força por Público Conectado ao Motor da Partida
- **Impacto Real em Campo**: O bônus de público (+1 a +5 conforme taxa de ocupação e volume de torcedores) agora está diretamente acoplado ao motor de simulação ao vivo minuto a minuto (`simulateMinute`), incrementando a força efetiva mandante, divididas, posse de bola e chances de gol.

### 🏆 6. Captura de Campeões do Mundo do Save & Histórico Completo
- **Arquivo Integral de Campeões**: A virada de ano captura vencedores de todas as divisões nacionais (Séries A, B, C e D), copas nacionais, torneios internacionais e estaduais com resultados concluídos.
- **Sincronização de Chaves**: Dados sincronizados entre `worldChampionHistory` e `campeoesDoMundoSave`, acessíveis pelo modal "🏆 Campeões do Mundo do Save".

### 🥊 7. Eliminações no Mata-Mata & Painel de Saldo Projetado
- **Aviso Imediato de Desclassificação**: Notificação imediata ("Infelizmente, você não passou do mata-mata") tanto na Copa do Brasil quanto em torneios eliminatórios, com registro no histórico da temporada.
- **Saldo Previsto no Fim do Mês**: Funções auxiliares `calcularProjecaoFimDoMes()` e `renderizarPainelSaldoPrevistoEscritorio()` com alerta visual de previsão no azul ou vermelho.

---

## [3.3.5] - 2026-10-11 (Isolamento Robusto Multi-Usuário Local & Cloud, Painel Admin de Usuários & Login Flexível)

### 👥 1. Gestão Completa de Usuários & Contas no Painel do Administrador
- **Nova Aba Exclusiva "👥 Gestão de Contas"**: Administrador conta com visão unificada de todas as contas cadastradas (locais e remotas).
- **Criação Rápida de Usuários**: Possibilidade de cadastrar novos treinadores ou administradores diretamente pelo painel administrativo, definindo nome completo, nome de usuário, senha e nível de acesso.
- **Redefinição de Senhas & Alternância de Cargos**: O administrador pode redefinir senhas e promover/rebaixar usuários com um único clique.
- **Proteção da Conta Mestre**: A conta principal `@aquino` possui proteção contra exclusão ou perda de privilégios.

### 💾 2. Isolamento Estrito de Saves por Usuário (Multi-Tenant Local & Cloud)
- **Chaves de Armazenamento Segregadas por Usuário**: Saves agora utilizam `afm_save_${username}_slot_${slotNum}`, impedindo que um novo jogador sobrescreva ou visualize campanhas de outro usuário na mesma máquina.
- **Persistência Completa de Dados nos Slots**: Os 3 slots preservam a estrutura integral do clube, elenco, táticas e finanças, enquanto o catálogo da conta mantém cabeçalhos leves e ágeis.
- **Carregamento Direto de Saves pelo Painel Admin**: Administrador pode inspecionar, carregar diretamente para jogar ou exportar em JSON os saves de qualquer usuário cadastrado.

### 🔑 3. Login Flexível & Resiliente
- **Suporte Duplo a E-mail e Nome de Usuário**: A tela inicial aceita login tanto por endereço de e-mail tradicional quanto por nome de usuário direto (`aquino`), eliminando bloqueios de validação HTML5.
- **Autenticação Local-First com Fallback Automático**: Se o Supabase estiver indisponível ou em modo offline, o sistema autentica localmente com segurança total, migrando e sincronizando dados assim que a nuvem estiver acessível.

---

## [3.3.4] - 2026-10-11 (Destravamento de Simulação Contínua, Autocura de 20 Clubes & Upgrade Realista de Anéis do Estádio)

### 🏟️ 1. Upgrade de Anéis do Estádio (+30% Custos, Prazos Escalonados & Regra Estrita 4/4)
- **Inicialização Consistente por Estrutura Inicial (Regra Estrita)**: Para que um anel $N$ esteja construído, todos os anéis anteriores ($1$ até $N-1$) obrigatoriamente estão marcados como concluídos (4/4 lados: norte, sul, leste e oeste). Em estádios de grande porte (ex: 100.000 lugares como a Mercado Livre Arena), todos os 6 anéis são garantidos como concluídos (4/4), eliminando o bug em que o 1º anel aparecia zerado (0/4).
- **Aumento Geral de Custos (+30%)**: Aplicado multiplicador de `1.30` sobre o custo base de construção de todos os setores e anéis (`getStadiumSectorCost()`), refletido de imediato nos botões e no painel financeiro.
- **Escalonamento Realista do Prazo de Construção**:
  - *Anéis 1 e 2*: 15 a 25 dias de obra.
  - *Anéis 3 e 4*: 30 a 45 dias de obra.
  - *Anéis 5 e 6*: 50 a 90 dias de megaobras estruturais.
- **Barra de Progresso Realista & Bloqueio de Expansão**: Quando há obra ativa, a aba de Ampliação exibe barra de progresso gradiente com percentual concluído e dias restantes, bloqueando expansões concorrentes enquanto os operários estiverem trabalhando.

### ⚡ 2. Destravamento Total da Simulação Contínua de Temporadas
- **Fim do Bloqueio "Nenhuma partida agendada para o seu clube"**: Ao simular rodadas continuamente, o jogo não trava mais caso o clube esteja em rodada de descanso ou caso a data esteja adiantada.
- **Simulação Automática de Folgas e Adversários**: Em `simulateQuickRound()` e `startLiveMatch()`, partidas de rodadas de folga simulam os jogos dos adversários, atualizam a tabela de pontos corridos e avançam a rodada com `finalizeRound()` sem travar a carreira.
- **Autocura de Saves com 21 Clubes**: `repairSaveIfCorrupted()` detecta saves antigos corrompidos com 21 clubes nas Séries A, B, C ou D (onde o usuário ficava preso no 21º clube sem jogo) e repara a divisão estritamente para 20 clubes com tabela de 38 rodadas perfeitas.

### 💰 3. Cláusula de Venda Futura (Sell-On Clause)
- **Percentual nas Negociações**: Introduzida a opção de adicionar cláusula de revenda futura (0%, 10%, 15%, 20%, 25% ou 30%) em transferências definitivas.
- **Cobrança e Repasse Automático**: Ao comprar um atleta com cláusula de venda futura, o clube de origem é registrado. Quando o atleta é posteriormente vendido a terceiros, o percentual estipulado é descontado do valor bruto e creditado ao clube formador/vendedor anterior, com extrato detalhado em Finanças e no feed de notícias do mundo.

### 🇸🇦 4. Assédio do Mercado Árabe/Saudita & Insatisfação por Transferência
- **Propostas Milionárias Reais**: Clubes de grande poder financeiro (Al-Hilal, Al-Nassr, Al-Ittihad, Al-Ahli, entre outros) realizam investidas agressivas por destaques do elenco durante a janela de transferências, cobrindo o valor de mercado ou exercendo a multa rescisória contratual.
- **Dinâmica de Descontentamento**: Se o treinador recusar uma proposta vantajosa de um gigante financeiro internacional, o atleta pode manifestar insatisfação temporária (`transferDiscontentDays`), afetando seu moral até que o foco volte aos gramados.

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
