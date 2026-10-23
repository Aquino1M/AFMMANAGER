# BRFC27 — Pack de estádios leves

Modelos GLB low-poly genéricos para prototipagem. Este README acompanha os arquivos deste diretório; a cópia em `assets/stadiums/` documenta o mesmo pack para o projeto.

## Arquivos

- `modelos/arena_moderna.glb`: estádio completo, cobertura e arquibancadas nos quatro lados (aprox. 328 KB).
- `modelos/arena_classica.glb`: estádio com cobertura lateral e cabeceiras abertas (aprox. 270 KB).
- `modelos/arena_aberta.glb`: estádio aberto e leve (aprox. 225 KB).
- `modelos/gradas_modulares_sem_campo.glb`: arquibancadas, estrutura e refletores sem gramado/linhas (aprox. 263 KB).
- `PREVIA_ESTADIOS.png`: prévia esquemática; `manifest.json`: metadados técnicos.

## Compatibilidade e escala

- GLB/glTF binário compatível com pipelines web, Three.js, Blender, Unity, Godot e Unreal.
- Eixo vertical Y; origem próxima ao centro do campo.
- Nos modelos completos, o campo mede aproximadamente 105 × 68 m. Ajuste a escala ao sistema de coordenadas do jogo.
- Cores e materiais estão embutidos; não são necessárias texturas separadas.
- Os modelos são genéricos, não representam réplicas exatas e não incluem marcas/logos de clubes.

## Uso com Three.js

Para substituir o estádio inteiro, carregue um arquivo `arena_*.glb` e oculte/remova o campo e as arquibancadas existentes para evitar superfícies sobrepostas. Para manter o campo do jogo, use `gradas_modulares_sem_campo.glb` e alinhe-o à escala e origem do campo atual. Veja `EXEMPLO_THREEJS.js` neste diretório.

## Recursos externos e licenças

- [Football/Soccer Club Grounds (3DAssets)](https://3dassets.dev/packs/football-soccer-club-grounds): a página anuncia um pack CC0 1.0; confirme os termos e o conteúdo no site do autor antes de redistribuir.
- [Modelo GLB hospedado por 3DAssets](https://cdn.3dassets.dev/assets/19143/v1/model.glb): confirme licença e procedência do arquivo efetivamente baixado.
- [Poly Pizza — modelo de estádio](https://poly.pizza/m/6TZCkGh76m5): a página informa Creative Commons Attribution; verifique e inclua o crédito exigido antes de distribuir.

## Licença deste pack

Os modelos incluídos neste pack foram gerados proceduralmente com formas, cores e materiais genéricos. Podem ser usados e modificados no BRFC27, inclusive em builds comerciais, sem obrigação de crédito. Isso não concede direitos sobre modelos externos referenciados acima.
