# Diretrizes 3D (Three.js, WebGL & Shaders) — AFM Studio

Guia técnico para o desenvolvimento de maquetes 3D de estádios, campos e efeitos visuais no AFM 2026.

## 1. Gestão de Memória GPU & Ciclo de Vida
- **Reutilização:** Compartilhe instâncias de `BufferGeometry` e `Material` sempre que possível.
- **Descarte Obrigatório:** Ao fechar modais ou trocar de cena, invoque `.dispose()` em geometrias, materiais e texturas. Cancele animações ativas com `cancelAnimationFrame()`.
- **Integridade do Contexto:** Nunca invoque `forceContextLoss()` ou `loseContext()` em fluxos comuns de troca de abas, evitando corrupção do contexto WebGL do navegador.

## 2. Modelagem & Assets Gráficos
- **Formatos:** Priorize `.glb` binário com texturas otimizadas.
- **Estética Low-Poly:** Malhas estilizadas, limpas e leves, mantendo alta fidelidade visual com baixo custo computacional.
- **Vetor SVG:** Escudos, distintivos e ícones de interface devem ser codificados em SVG leve e escalável.

## 3. Câmeras & Controles
- Configure `OrbitControls` com amortecimento suave (`enableDamping: true`, `dampingFactor: 0.08`), limites de distância (`minDistance`, `maxDistance`) e clamp de ângulo polar para impedir que a câmera atravesse o solo.
