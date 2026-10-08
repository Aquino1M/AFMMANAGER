# 📜 CHANGELOG — AFM MANAGER 2027

Todas as principais atualizações e novidades do **Aquino Futebol Manager 2027** são documentadas neste arquivo seguindo o padrão [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.0] - 2026-10-08 (Versão Atual)

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
