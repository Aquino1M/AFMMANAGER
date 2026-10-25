# Regras de Criação de Jogos, 3D (Three.js/glTF), Shaders e UI/UX Studio

Estas diretrizes orientam o assistente de IA no desenvolvimento de jogos, gráficos 3D procedurais e interfaces de usuário de alto nível no projeto.

## 1. Gráficos 3D & Engenharia de Jogos (Three.js, WebGL & Shaders)
- **Three.js & WebGL Local-First**: Sempre utilize Three.js e WebGL de forma eficiente e local (sem CDNs externas instáveis). Reutilize geometrias (`BoxGeometry`, `PlaneGeometry`, etc.) e materiais (`MeshStandardMaterial`, `MeshBasicMaterial`) sempre que possível para evitar vazamento de memória GPU.
- **Ciclo de Vida & Dispose**: Ao desmontar ou re-renderizar cenas/modais 3D, descarte obrigatoriamente geometrias, materiais, texturas e controle orbital (`dispose()`), além de cancelar animações ativas com `cancelAnimationFrame`.
- **Shaders & Efeitos Visuais**: Priorize shaders GLSL leves para efeitos de iluminação, gramado, iluminação de refletores, faixas de LED neon e distorções atmosféricas, garantindo compatibilidade total com dispositivos móveis e desktops (60+ FPS).
- **Câmeras & OrbitControls**: Configure presets de câmera inteligentes com transições amortecidas (`enableDamping: true`, `dampingFactor: 0.08`), limites de distância orbital (`minDistance`, `maxDistance`) e clamp de ângulo polar para evitar que a câmera atravesse o chão do estádio/cenário.

## 2. Modelagem 3D, Formatos & Assets Gráficos
- **Padrão glTF / GLB**: Modelos 3D importados devem priorizar `.glb` binário com compressão draco ou texturas WebP/PNG otimizadas.
- **Estética Low-Poly & Fidelidade**: Mantenha estilo Low-Poly consistente, geométrico e vibrante, evitando malhas densas demais onde primitivas poligonais estilizadas oferecem melhor leitura visual e fluidez.
- **Assets Vetoriais (SVG)**: Ícones, escudos, distintivos, mini-mapas e marcadores de HUD tático devem ser codificados em SVG limpo, sem metadados inúteis, escaláveis e estilizados via classes CSS ou atributos de preenchimento dinâmico.
- **Pixel Art & Sprites**: Sprites 2D de atletas, bancadas e dugout acrílico devem manter proporções estritas, sombras consistentes e paletas coordenadas com os clubes.

## 3. UI/UX, Design de Interfaces & Performance
- **Design Premium & Imersivo**: UIs devem parecer de jogos AAA (EA FC / FM), com bordas neon, gradientes sutis, glassmorphism (`backdrop-filter: blur(...)`), contrastes escuros elegantes e tipografia moderna.
- **Consistência Cromática**: Cores hexadecimais devem ser centralizadas e alinhadas às paletas oficiais e tokens do projeto.
- **Budget de Performance & 60 FPS**: Nenhuma dependência pesada deve ser adicionada sem estrita necessidade. Todo código clientside deve rodar leve sem gargalos de CPU/GPU em telas móveis e notebooks modestos.
- **Responsividade Híbrida**: Toda tela, modal ou hud deve funcionar perfeitamente em telas compactas (mobile portrait/landscape) e telas widescreen (1080p, 1440p).
