# 📜 CHANGELOG — AFM MANAGER 2027

Todas as principais atualizações e novidades do **Aquino Futebol Manager 2027** são documentadas neste arquivo seguindo o padrão [Keep a Changelog](https://keepachangelog.com/).

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
