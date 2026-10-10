# ⚽ AFM MANAGER 2027 — Aquino Futebol Manager

> **Simulador Tático e de Gestão de Futebol Brasileiro & Internacional**  
> *Comande seu clube, defina táticas com movimentação 2.5D, gerencie finanças e empréstimos bancários, negocie no mercado vivo da IA e erga a sua nova arena!*

---

## 🌟 Principais Sistemas do Jogo

- 🇧🇷 **Pirâmide Completa do Futebol Brasileiro**:
  - Séries A, B, C e D (96 clubes) com regulamentos oficiais, acessos e rebaixamentos.
  - **11 Campeonatos Estaduais Oficiais** sincronizados em tempo real: Candangão DF, Paulistão, Carioca, Mineiro, Gaúcho, Paranaense, Catarinense, Baiano, Cearense, Goiano e Pernambucano.
  - Copa do Brasil em mata-mata de 92 clubes com sorteios e mandos dinâmicos.
- 🌍 **Ligas Continentais & Internacionais**:
  - Copa Libertadores, Copa Sul-Americana e Mundial de Clubes.
  - Ligas de elite da América do Sul, Europa e Ásia.
- 🏟️ **Campus do Clube & 8 Instalações**:
  - **Estádio & Ingressos**: Gestão de capacidade, anéis de arquibancada, ingressos e estacionamento com projeção de renda em tempo real.
  - **Vitrine de Arenas**: 12 arenas históricas mapeadas e sistema de construção de nova arena de até 100.000 lugares.
  - **🏦 Banco & Financiamento**: Linhas de crédito de R$ 500k a R$ 30M, taxas de juros dinâmicas, parcelamento em 6x/12x/24x/36x, antecipação com bônus de 12% e juros de mora acumulativos com Fair Play Financeiro (Transfer Ban).
  - **Instalações Estruturais**: Categorias de Base (15 a 18 anos), CT, Departamento Médico, Sede Administrativa, Loja Oficial, Museu de Troféus (16 níveis) e Sala de Imprensa.
- 💼 **Mercado de Transferências Vivo**:
  - Compra, venda, empréstimo e olheiros com filtros rápidos e botão dedicado `🔍 Pesquisar`.
  - **Giro do Mercado Mundial (IA)**: Feed em tempo real de transferências entre outros clubes do país e do exterior.
  - **Propostas Oficiais por Titulares**: Propostas com cláusula de venda futura de 20% e opção de contraproposta (+20%).
- 🎮 **Transmissão 2.5D & Match Engine**:
  - Simulação minuto a minuto com IA coletiva de marcação em bloco e infiltrações táticas.
  - Visualização 2.5D em tempo real com relógio, narração de lances, cartões, substituições e estatísticas completas.
- 🏆 **Virada de Temporada & Hall da Fama**:
  - Encerramento com premiações, troféus, reajuste salarial, transição para o novo ano e arquivo imortalizado no Hall da Fama.
- 💬 **Voz da Torcida (#AFM2027)**:
  - Feed social interativo reagindo aos resultados de cada partida.
- 💾 **Persistência Híbrida (Local-First + Supabase Cloud)**:
  - Isolamento de contas por treinador com 3 slots de saves por perfil.
  - Salvamento local imediato (sem lag) com sincronização assíncrona na nuvem via Supabase.

---

## 📁 Estrutura do Projeto

```text
Aquino_Futebol_Manager_2026/
├── index.html              # Ponto de entrada do jogo (SPA)
├── css/
│   └── app.css             # Design System completo (Vanilla CSS3)
├── js/
│   ├── game.js             # Motor de simulação, gestão de carreira, UI e áudio
│   ├── competitions.js     # Catálogo e regras de todas as ligas e copas
│   └── database.js         # Integração com Supabase Cloud (auth e saves)
├── data/
│   ├── club_badges.js      # Escudos oficiais em alta resolução
│   ├── competition_teams.js# Mapeamento de clubes por divisão e estadual
│   ├── player_photos.js    # Fotos otimizadas de atletas
│   └── players_live.js     # Base local offline de atletas
├── docs/                   # Documentação detalhada e esquemas SQL
│   └── SUPABASE_SETUP.sql  # Script DDL com RLS para o banco de dados
├── AGENTS.md               # Diretrizes arquiteturais e regras para IA
├── CHANGELOG.md            # Histórico limpo e estruturado de versões
├── package.json            # Metadados do projeto e scripts npm
├── vercel.json             # Configurações de deploy estático sem cache
├── JOGAR.bat               # Abre o jogo
├── ENVIAR_GITHUB.bat       # Envia commits já criados
└── atualizar_do_github.bat # Atualiza a cópia local por avanço seguro
```

---

## 🚀 Como Executar

### 1. Localmente (Windows / Linux / Mac)
Basta abrir o arquivo `index.html` em qualquer navegador web ou rodar um servidor HTTP local:

```bash
# Via npx serve (recomendado)
npx serve .

# Ou via Python
python -m http.server 8080
```

No Windows, você também pode dar duplo clique em `JOGAR.bat`.

### 2. Deploy no Vercel
O projeto possui deploy contínuo integrado:
- Repositório: [Aquino1M/AFMMANAGER](https://github.com/Aquino1M/AFMMANAGER)
- Cada commit enviado na branch `main` dispara a publicação automática instantânea na Vercel.

---

## ☁️ Banco de Dados (Supabase)

- **Instância**: `https://yulsnzvgxtwbazqvetpe.supabase.co`
- **Tabelas**:
  - `afm_users`: Contas de usuários e perfis.
  - `afm_saves`: Armazenamento de até 3 saves independentes por usuário.
- O script [`docs/SUPABASE_SETUP.sql`](docs/SUPABASE_SETUP.sql) contém o esquema completo, índices e políticas de Row Level Security (RLS).

---

## 📄 Licença
Distribuído sob licença MIT. Desenvolvido para amantes de futebol e gerenciamento tático.
