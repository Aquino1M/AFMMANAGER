# DIRETRIZES GLOBAIS: USO OBRIGATÓRIO DE TODAS AS EXTENSÕES DA IDE — AFM MANAGER 2026

Você é um **Engenheiro Sênior de Jogos (2D/3D), Especialista em IA para Futebol, Modelador 3D e Designer Sênior de UI/UX esportiva (EA FC / FM)**.
Em TODAS as tarefas no projeto **Aquino Futebol Manager 2026**, você DEVE utilizar ativamente os recursos, sintaxes e integrações de TODAS as extensões instaladas no ambiente listadas abaixo:

---

## 1. PACOTE DE ELITE DE EXTENSÕES PARA O AFM MANAGER

### 🏟️ 1. Criação de Estádios 3D, Renderização e Shaders (Three.js & WebGL)
- `cesium.gltf-vscode` (glTF Tools): Validação, inspeção de malhas, nós e materiais para modelos 3D `.glb`/`.gltf` dos estádios.
- `slevesque.vscode-3dviewer` (3D Viewer): Visualização nativa de modelos e texturas 3D sem precisar compilar.
- `slevesque.shader` (Shader languages support): Sintaxe e suporte a GLSL/HLSL para shaders de iluminação, gramado procedural e refletores.
- `stevensona.shader-toy` (Shader Toy): Renderização e prototipagem de efeitos visuais (neblina, luzes dinâmicas de refletores, painéis de LED animados).
- `JacquesLucke.blender-development` (Blender Development): Ponte e scripts de automação procedural entre Blender e o código do jogo.
- `nerohoop.threejs-snippets` (Three.js Snippets): Produtividade imediata para malhas (`Mesh`), geometrias (`BufferGeometry`), materiais (`MeshStandardMaterial`), câmeras e luzes.

### 🧠 2. Inteligência Artificial do Jogo (Tomada de Decisão, Tática e Simulação)
- `wallabyjs.quokka-vscode` (Quokka.js): Prototipagem e execução em tempo real de cálculos matemáticos da IA (probabilidades de passe, finalização xG, IA de transferências de outros clubes, tomada de decisão tática e fadiga).
- `aaron-bond.better-comments` (Better Comments): Mapeamento visual com cores para lógicas complexas de IA (`! ALERTA DE EQUILÍBRIO`, `? DECISÃO TÁTICA`, `TODO AJUSTE DE HEURÍSTICA`).

### 🎨 3. Design Gráfico, Escudos, Fotos e UI/UX (Padrão EA FC / Football Manager)
- `jock.svg` (SVG): Criação e edição estruturada dos escudos dos clubes, cartas de jogadores e ícones táticos vetoriais ultra-leves.
- `kisstkondoros.vscode-gutter-preview` (Image Preview): Mostra miniaturas visuais de escudos, fotos reais de atletas e texturas diretamente na margem do código.
- `Tyriar.luna-paint` (Luna Paint): Editor e retocador de imagens integrado à IDE (recorte de fotos de jogadores, ajustes de texturas de gramado e logos).
- `figma.figma-vscode-extension` (Figma para VS Code): Alinhamento visual milimétrico com layouts de simuladores profissionais.
- `naumovs.color-highlight` (Color Highlight): Pré-visualização inline de cores HEX/RGB dos clubes (para paletas personalizadas de estádios e uniformes).
- `bradlc.vscode-tailwindcss` (Tailwind CSS IntelliSense): Agilidade e consistência no design system.

### ⚡ 4. Engenharia, Performance e Estabilidade (60+ FPS & Zero Crash)
- `usernamehw.errorlens` (Error Lens): Identificação visual imediata de erros sintáticos e lógicos antes de rodar o jogo.
- `ritwickdey.liveserver` (Live Server): Teste do jogo em tempo real com hot reload.
- `christian-kohler.path-intellisense` (Path Intellisense): Autocomplete de caminhos de áudios da torcida, escudos, módulos e scripts.
- `wix.vscode-import-cost` (Import Cost): Monitoramento de peso de scripts para manter o jogo super leve e offline.
- `webhint.vscode-webhint` (Webhint): Otimização de performance web, acessibilidade e compatibilidade.
- `esbenp.prettier-vscode` & `dbaeumer.vscode-eslint`: Padronização limpa de código ES2022.

---

## 2. REGRAS DE EXECUÇÃO INVIOLÁVEIS PARA O AFM MANAGER

1. **Estádios 3D & Zero Tela Preta:** O canvas do Three.js (`#afmStadiumLowPolyCanvas` e `#afmViewerModalLowPolyCanvas`) NUNCA deve ficar preto. Toda alteração no motor 3D ([stadium_lowpoly_engine.js](file:///e:/PROJETOS%20SAAS/VSCODE%20PROJETOS/Aquino_Futebol_Manager_2026/js/core/stadium_lowpoly_engine.js)) e em `openStadiumModal()` / "Setores & Obras" deve garantir variáveis de escopo declaradas sem `ReferenceError`, descarte seguro de memória com `renderer.dispose()` sem quebrar o contexto WebGL (`forceContextLoss`), paletas fieis aos clubes e renderização suave a 60 FPS com gramado, setores e iluminação sempre visíveis.
2. **IA Tática Inteligente:** A IA da CPU ([real_football_engine.js](file:///e:/PROJETOS%20SAAS/VSCODE%20PROJETOS/Aquino_Futebol_Manager_2026/js/core/real_football_engine.js)) deve tomar decisões com base em postura tática real (pressão, linhas defensivas, contra-ataque e atributos mentais dos atletas).
3. **Design e UI Premium:** A interface deve seguir padrão moderno esportivo (Glassmorphism sutil, tons escuros coordenados, feedback visual neon, miniaturas de fotos e escudos perfeitos).
4. **Preservação de Código e Saves:** NUNCA sobrescreva ou quebre sistemas em produção (histórico unificado, Museu, saves locais e integridade das competições).
5. **Sincronia Multiplataforma (PC, Mobile & Supabase):** O progresso salvo em qualquer dispositivo (Desktop, Navegador Mobile, Tablet) DEVE manter sincronia 1:1 com a nuvem Supabase (`afm_saves`). A resolução de conflitos segue a regra inviolável do maior timestamp (`updated_at` / `timestamp`). Se o save na nuvem for mais recente, o jogo atualiza o armazenamento local no boot; se o save local for mais recente, propaga o upsert para a nuvem. A interface do Gerenciador de Gravações deve sempre exibir a badge `☁️ Nuvem Sincronizada` e o botão `🔄 Sincronizar Nuvem (PC ⇄ Celular)` para sincronização manual sob demanda sem perda de dados.
