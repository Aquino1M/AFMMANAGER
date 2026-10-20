# BRFC27 — Pack de Estádios Leves (v1)

Este pack traz quatro modelos GLB de baixo peso para prototipagem do BRFC27.

## Conteúdo

- `modelos/arena_moderna.glb` — estádio completo, arquibancadas em quatro lados e cobertura; cerca de 328 KB.
- `modelos/arena_classica.glb` — estádio completo, cobertura lateral e setores abertos nas cabeceiras; cerca de 270 KB.
- `modelos/arena_aberta.glb` — estádio aberto e mais leve; cerca de 225 KB.
- `modelos/gradas_modulares_sem_campo.glb` — somente arquibancadas, estrutura externa, cobertura e refletores. Não inclui gramado nem linhas do campo; feito para encaixar ao redor do campo que já existe no jogo; cerca de 263 KB.
- `PREVIA_ESTADIOS.png` — prévia esquemática em vista superior.
- `manifest.json` — informações técnicas dos arquivos.

## Compatibilidade

Os modelos são GLB (glTF binário), apropriados para jogos web com Three.js / React Three Fiber, e também podem ser importados no Blender, Unity, Godot ou Unreal.

- O centro do campo é aproximadamente a origem `(0, 0, 0)`.
- O campo dentro dos modelos completos tem medidas aproximadas de 105 × 68 metros.
- Eixo vertical: Y.
- Os modelos incluem cores embutidas e não precisam de arquivos de textura separados.
- São modelos low-poly genéricos, sem escudos, logos ou nomes de clubes reais.
- O pack é prototipal: não são réplicas arquitetônicas exatas de estádios reais nem uma reconstrução hiper-realista.

## Como usar no jogo

### Opção A — Substituir o estádio inteiro

Use um dos arquivos `arena_*.glb`. Ele inclui o campo completo, então remova/oculte o campo e as arquibancadas antigas para não deixar superfícies sobrepostas.

### Opção B — Manter o campo atual

Use `gradas_modulares_sem_campo.glb`. Ele não contém o gramado principal; alinhe o centro do campo atual com a origem do modelo. Se o campo do jogo não tiver uma escala aproximada de 105 × 68, ajuste `scale` no carregamento.

### Exemplo de carregamento para Three.js

Veja `EXEMPLO_THREEJS.js`. O caminho do exemplo presume que os arquivos estejam em `public/assets/stadios/`.

## Pack externo recomendado

Também há um conjunto modular gratuito (CC0) de 72 peças de campo, gols, arquibancadas, bancos e instalações:
- Página do pack: https://3dassets.dev/packs/football-soccer-club-grounds
- Cena pronta em um único GLB (~268 KB): https://cdn.3dassets.dev/assets/19143/v1/model.glb
- O conjunto completo é anunciado como 1,6 MB e sob CC0 1.0 Universal, com uso comercial permitido e sem exigência de atribuição, de acordo com a página do autor.

Outro modelo isolado de estádio está no Poly Pizza, sob Creative Commons Attribution. Confira as condições e inclua o crédito exigido antes de distribuir o jogo:
- https://poly.pizza/m/6TZCkGh76m5

## Licença deste pack

Os modelos deste pacote foram montados proceduralmente para esta solicitação e usam formas, cores e materiais genéricos. É permitido usá-los, modificá-los e incluí-los no BRFC27, inclusive em builds do jogo, sem obrigação de crédito. Não incluem logos de clubes nem reproduzem deliberadamente um estádio específico.
