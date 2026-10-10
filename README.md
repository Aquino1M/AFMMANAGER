# AFM Manager

Jogo de gerenciamento de futebol em HTML, CSS e JavaScript, executado no navegador e com saves locais. A integração Supabase é opcional e sincroniza saves quando configurada.

## Executar

Abra `index.html` ou inicie um servidor estático na pasta do projeto:

```sh
npx serve .
```

## Estrutura

- `index.html`: carrega dados, módulos e interface.
- `js/game.js`: fluxo da carreira e interface principal.
- `js/core/`: motor de partidas, tática e áudio.
- `js/competitions.js`, `data/competition_teams.js`: catálogo e clubes das competições.
- `data/`: dados locais de clubes, jogadores, escudos e torneios.
- `scripts/`: verificações e manutenção de dados.
- `supabase/schema.sql`: esquema usado pela sincronização opcional.

## Saves e sincronização

O jogo mantém três slots locais por conta. A cópia local é a fonte de recuperação offline. A sincronização na nuvem depende do projeto Supabase e de políticas RLS compatíveis com a autenticação usada pelo jogo.

**Atenção:** o login e o esquema SQL atuais ainda usam autenticação própria com senhas em texto puro e políticas de acesso anônimo amplas. Não use a sincronização com dados sensíveis nem exponha o projeto a outros usuários antes de migrar para Supabase Auth e políticas de propriedade por usuário. Não aplique políticas mais restritivas isoladamente: o login atual não fornece `auth.uid()`.

## Verificações

```sh
node scripts/test-gameplay-systems.js
node scripts/audit-football-data.js
```

O comando `npm run build` é apenas uma mensagem de confirmação; não compila nem testa o jogo.
