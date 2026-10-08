# 📜 CHANGELOG — AFM MANAGER 2027

Todas as principais atualizações e novidades do **Aquino Futebol Manager 2027** são documentadas neste arquivo seguindo o padrão [Keep a Changelog](https://keepachangelog.com/).

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
