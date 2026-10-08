# 🧭 AGENTS.md — Regras de Arquitetura & Diretrizes AFM 2027

Este documento define as regras ativas, restrições arquiteturais e padrões de código para o **AFM Manager 2027 (Aquino Futebol Manager)**. Todas as IAs e desenvolvedores devem seguir estas diretrizes para manter o código leve, performático e consistente.

---

## 1. Stack Tecnológico & Princípios Centrais

1. **Vanilla Puro**: HTML5 Semântico, CSS3 Moderno e JavaScript ES2022 nativo.
   - **Sem Frameworks**: Não utilizar React, Vue, Angular ou Next.js a menos que solicitado expressamente.
   - **Sem Tailwind / Bundlers**: Utilizar Vanilla CSS (`css/app.css`) com classes e variáveis CSS já estabelecidas (`--neon`, `--cyan`, etc.).
2. **Idioma da Interface**: 100% Português do Brasil (pt-BR).
   - Termos futebolísticos brasileiros autênticos: *Zagueiro (CB)*, *Volante (DM)*, *Meia-Atacante (AM)*, *Artilharia*, *Mata-mata*, *Caldeirão*.
3. **Padrão Local-First**: O jogo deve funcionar perfeitamente 100% offline via `LocalStorage` e arquivos estáticos locais, utilizando a nuvem (Supabase) como camada de sincronização assíncrona.

---

## 2. Arquitetura de Estado & Persistência

1. **Objeto Global `state`**:
   - Contém todos os dados da carreira ativa: `club`, `manager`, `season`, `round`, `date`, `balance`, `squad`, `lineup`, `stadium`, `facilities`, `bankLoans`, `marketWorldFeed`, `seasonHistory`.
2. **Salvamento (`save()`)**:
   - Sempre executado após mudanças de estado críticas (rodadas, transferências, reformas, contratação de empréstimos).
   - **Prevenção de Estouro de Cota**:
     - `state.news`: máximo de 50 itens (`slice(0, 50)`).
     - `state.marketWorldFeed`: máximo de 30 itens.
     - `state.seasonHistory`: máximo de 20 temporadas.
3. **Isolamento de Contas**:
   - Cada usuário possui seus próprios 3 slots de saves independentes em `AFM_AUTH_KEY` e sincronizados na tabela `afm_saves` do Supabase.

---

## 3. Segurança & Sanitização de Dados

1. **Prevenção de XSS**:
   - Todas as variáveis inseridas em templates HTML devem passar pela função `esc()`:
     ```javascript
     // Correto
     `<div>${esc(player.name)} - ${esc(state.club)}</div>`
     ```
2. **Valores Monetários & Arredondamentos**:
   - Nunca gerar valores monetários com casas decimais infinitas.
   - Sempre utilizar `Math.round()` ao calcular parcelas de empréstimos e salários:
     ```javascript
     const parcela = Math.round(valorTotal / numParcelas);
     ```
3. **Autenticação**:
   - A chave pública Supabase no client é permitida apenas com RLS ativo.
   - Nunca expor credenciais de serviço ou chaves secretas no código frontend.

---

## 4. Regras do Motor de Jogo & Simulação

1. **Tabela do Campeonato (Estadual & Nacional)**:
   - Os resultados devem sempre refletir em tempo real a tabela ativa (`state.teams`), atualizando vitórias, empates, derrotas, gols pró, saldo e pontos.
2. **Sistema Bancário & Financiamento**:
   - Empréstimos têm juros dinâmicos (CET) baseados no valor e prazo (6x a 36x).
   - Antecipação de parcelas concede bônus de desconto de 12% nos juros não incorridos.
   - Parcela vencida sem saldo em caixa gera inadimplência e juros de mora acumulativos (+2% por rodada).
   - Inadimplência de 2+ parcelas ativa Transfer Ban automático da diretoria.
3. **Virada de Temporada**:
   - Conclusão da última rodada desbloqueia a premiação e transição para a temporada seguinte (`showEndOfSeasonModal`), gerando novo calendário, envelhecendo atletas e arquivando o histórico no Hall da Fama.

---

## 5. 🚫 Regras Mortas & Práticas Descontinuadas (NÃO UTILIZAR)

- ❌ **Colunas Duplas de PES e EA FC**: Descontinuadas. O jogo utiliza apenas um Overall unificado (OVR).
- ❌ **Abas Separadas de "Save/Backup" e "Banco de Dados"**: Descontinuadas da barra principal. Foram unificadas na aba Configurações (⚙️).
- ❌ **Tabelas Estáticas Rígidas**: Nunca injetar dados de classificação estáticos; usar sempre o motor dinâmico `curComp()` e `ranking()`.
- ❌ **Changelogs Técnicos na UI**: Nunca exibir termos como "deploy git", "merge PR", "docker" ou "commit hash" para o usuário. A Central de Novidades deve conter apenas recursos imersivos de futebol.
