# Aquino Futebol Manager 2026 / 2027 (AFM 2026)

Simulador de futebol local-first completo executado diretamente no navegador. Construído em HTML5, CSS3 e JavaScript ES2022 nativo (sem dependências pesadas ou bundlers).

---

## 🎮 Modos de Jogo
- **Modo Treinador:** Gerencie finanças, táticas, mercado de transferências, comissão técnica, categorias de base e ampliação dos anéis do estádio 3D.
- **Modo Carreira Jogador (Modo Craque):** Crie seu próprio atleta do zero, participe de peneiras, evolua atributos em treinos semanais, dispute a Bola de Ouro, seja convocado para a Seleção Nacional na Data FIFA e domine a rede social oficial *FootGram*.
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

Execute os testes diretamente via Node.js:

```sh
# Teste de Estresse do Modo Jogador (5 Anos e 3 Saves)
node tests/stress_test_player_career_5years.js

# Teste de Integridade Financeira e Orçamentos Iniciais
node tests/check_brasilia_budget.js

# Teste de Criação de Jogador e Slots
node tests/test_create_player_button.js
```
