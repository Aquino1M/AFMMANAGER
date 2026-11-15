# Aquino Futebol Manager 2026 / 2027 (AFM 2026)

Simulador de futebol local-first completo executado diretamente no navegador. Construído em HTML5, CSS3 e JavaScript ES2022 nativo (sem dependências pesadas ou bundlers).

---

## 🎮 Modos de Jogo
- **Modo Treinador:** Gerencie finanças, táticas, mercado de transferências, comissão técnica, categorias de base e ampliação dos anéis do estádio 3D.
- **Modo Carreira Jogador (Modo Craque):** Crie seu próprio atleta do zero, participe de peneiras, evolua atributos em treinos semanais, dispute a Bola de Ouro, seja convocado para a Seleção Nacional na Data FIFA e domine a rede social oficial *FootGram*.
- **Ciclo de Vida, Aposentadoria e Transição para Treinador:** Sistema de envelhecimento anual com declínio gradual a partir dos 30 anos (30-33: -1 a -2 pts; 34+: -2 a -4 pts, suavizado por treinos físicos e staff). Aos 35 anos, oferta formal de transição na mesa do empresário ou opção de pendurar as chuteiras a qualquer momento; ao aceitar, o save migra diretamente para o Modo Treinador preservando o universo do jogo, idade, legado de atleta e bônus vitalícios de ex-jogador (+10% salário e +5% de aceitação em negociações).
- **Modais de Negociação Reativos:** Sistemas interativos de negociação salarial, solicitação de empréstimo e transferência com cálculo dinâmico em tempo real de aprovação da diretoria e resistência de mercado, considerando idade, OVR, tempo de vínculo, divisões de folha e motivos de saída.
- **Treinamento Prático em Campo & Anti-Glitch (3x/dia):** Minigames interativos de cobrança de pênaltis e faltas conectados ao ganho real de XP e evolução do atleta, com interface Dark-Neon, consumo imediato no disparo da cobrança e trava diária rígida sincronizada ao calendário do jogo.
- **Vida & Patrocínios (Economia Completa do Atleta):** Loja de chuteiras com durabilidade e bônus aplicados nas partidas; 8 profissionais de staff pessoal com honorários e bônus reais; bens de luxo à vista ou financiados em 12x (com 30% de entrada); negócios passivos (aluguéis de kitnets, escolinha de futebol, marca própria), aplicação em CDB com rendimentos compostos, campanhas de mídia e livro-razão de transações financeiras. Botões inteligentes adaptativos com feedback visual de saldo insuficiente (`🔒 Faltam R$ X`).
- **Estatísticas, Recordes & Carreira Total:** Aba oficial de estatísticas com 4 sub-abas: Dados da Temporada (sem nota média falsa quando 0 jogos e sincronia salarial), Sala de Troféus (bônus ativos do arquétipo dominante Maverick/Heartbeat/Virtuoso e barras de recordes da competição com recompensas), Histórico de Jogos (filtros rápidos por gol, assistência e MVP) e Sub-aba Carreira Total All-Time com linha do tempo de clubes e legado para aposentadoria.
- **Clube, Elenco & Vestiário Interativo:** Hierarquia por posição e elenco completo com referências reais (`getSquadReferences`), valor de mercado dinâmico e proporcional ao OVR/idade, status de Titular, Reserva ou Plantel, Capitão oficial, filtros rápidos por setor, modal de Raio-X comparativo com veteranos e mentoria semanal (+20 XP, +5% afinidade). Sub-aba de Finanças do Clube com alerta de Caixa Crítico, tabela de Bicho por vitória/título e ações anti-calote de salários atrasados com Rescisão por Justa Causa.
- **Criação de Clube Próprio:** Crie um time com cores, escudo, estádio e uniforme personalizados e suba desde os estaduais até as glórias continentais.

---

## 🚀 Como Executar

Abra `index.html` diretamente em seu navegador ou inicie um servidor local:

```sh
# Usando npx serve
npx serve .

# Ou via Python
python -m http.server 8080
```

---

## 📂 Arquitetura do Projeto
- `index.html`: Casca principal da aplicação e estrutura de visualização.
- `js/game.js`: Orquestrador central de estado, calendário, partidas e interface.
- `js/core/`: Motores de simulação tática, áudio da torcida e renderização 3D dos estádios (Three.js).
- `js/player/`: Motores exclusivos do Modo Carreira Jogador (Evolução, Rede Social FootGram e Seleções Nacionais).
- `js/competitions.js` e `data/`: Catálogo oficial de competições, clubes e ligas nacionais/estaduais.
- `supabase/`: Schema e scripts de sincronização remota multiplataforma (PC ⇄ Mobile).
- `tests/`: Bateria de testes automatizados de regressão e estresse.

---

## 🧪 Testes Automatizados

Execute um teste de regressão versionado via Node.js:

```sh
# Fluxo integrado da carreira de jogador
node tests/test_full_player_mode_reliability.js

# Segurança: renderização da foto não interpreta HTML
node tests/test_player_photo_xss.js

# Outros testes disponíveis
node tests/test_player_club_and_squad_systems.js
node tests/test_player_stats_and_career_history.js
node tests/test_player_lifestyle_system.js
node tests/test_player_financial_system.js
node tests/stress_test_player_career_5years.js
```

Os testes são scripts independentes; consulte `package.json` para comandos adicionais do modo treinador. Não há um comando único de suíte.
