# AFM Manager

Jogo de gerenciamento de futebol feito em HTML, CSS e JavaScript, executado no navegador. A carreira é salva localmente; a sincronização Supabase é opcional e depende da configuração e da disponibilidade do serviço.

## Executar

Abra `index.html` ou rode um servidor estático na raiz do projeto:

```sh
npx serve .
```

## Estrutura

- `js/game.js`: fluxo da carreira e interface principal.
- `js/core/`: motores de partida, tática, áudio e sistemas reutilizáveis.
- `js/competitions.js` e `data/`: catálogos, clubes e dados das competições.
- `scripts/`: testes e ferramentas de manutenção.
- `supabase/schema.sql`: schema de referência da integração opcional.

## Saves, login e segurança

O jogo mantém três slots locais por conta, permitindo uso offline. O código usa autenticação própria baseada em `afm_users`, não Supabase Auth. O schema versionado contém políticas amplamente públicas para `afm_users` e `afm_saves`; por isso, não habilite o banco para usuários reais antes de corrigir e verificar autenticação, propriedade dos dados e políticas RLS. A configuração remota não foi verificada por este documento.

## Verificações

Alguns testes úteis:

```sh
npm run test:finance
npm run test:season-transitions
npm run test:calendar-recovery
npm run test:username-login
```

`npm run build` apenas imprime `Static build ready`; não compila nem testa o jogo.
