/**
 * ==============================================================================
 * AFM MANAGER 2027 — MOTOR OFICIAL DE MAQUETE 3D LOW-POLY DE ESTÁDIO
 * Arquivo: js/core/stadium_lowpoly_engine.js
 * 
 * Renderiza em tempo real a maquete 3D Low-Poly do estádio do clube,
 * evoluindo setor por setor e anel por anel (Norte, Sul, Leste, Oeste do 1º ao 6º anel)
 * de 5.000 até 100.000 lugares, com guindaste de obra ativa, melhorias acopladas
 * (telão, iluminação LED, camarotes, mosaico, fogos) e suporte a rotação 360°
 * e zoom orbital via Three.js.
 * ==============================================================================
 */

(function (window) {
  'use strict';

  // Cores clássicas dos principais clubes
  const CLUB_PALETTES = {
    'corinthians': { primary: '#18181b', secondary: '#ffffff', accent: '#dc2626' },
    'palmeiras': { primary: '#15803d', secondary: '#ffffff', accent: '#ca8a04' },
    'flamengo': { primary: '#dc2626', secondary: '#18181b', accent: '#ffffff' },
    'sao_paulo': { primary: '#dc2626', secondary: '#ffffff', accent: '#18181b' },
    'santos': { primary: '#ffffff', secondary: '#18181b', accent: '#ca8a04' },
    'gremio': { primary: '#0284c7', secondary: '#18181b', accent: '#ffffff' },
    'internacional': { primary: '#dc2626', secondary: '#ffffff', accent: '#b91c1c' },
    'atletico_mg': { primary: '#18181b', secondary: '#ffffff', accent: '#ca8a04' },
    'cruzeiro': { primary: '#2563eb', secondary: '#ffffff', accent: '#ca8a04' },
    'vasco': { primary: '#18181b', secondary: '#ffffff', accent: '#dc2626' },
    'botafogo': { primary: '#18181b', secondary: '#ffffff', accent: '#71717a' },
    'fluminense': { primary: '#047857', secondary: '#991b1b', accent: '#ffffff' },
    'bahia': { primary: '#2563eb', secondary: '#dc2626', accent: '#ffffff' },
    'fortaleza': { primary: '#2563eb', secondary: '#dc2626', accent: '#ffffff' },
    'athletico_pr': { primary: '#dc2626', secondary: '#18181b', accent: '#ffffff' },
    'coritiba': { primary: '#15803d', secondary: '#ffffff', accent: '#18181b' },
    'sport': { primary: '#dc2626', secondary: '#18181b', accent: '#ca8a04' },
    'ceara': { primary: '#18181b', secondary: '#ffffff', accent: '#71717a' },
    'goias': { primary: '#15803d', secondary: '#ffffff', accent: '#ca8a04' },
    'cuiaba': { primary: '#15803d', secondary: '#facc15', accent: '#ffffff' },
    'vitoria': { primary: '#dc2626', secondary: '#18181b', accent: '#ffffff' },
    'criciuma': { primary: '#facc15', secondary: '#18181b', accent: '#ffffff' },
    'avai': { primary: '#0284c7', secondary: '#ffffff', accent: '#0369a1' },
    'juventude': { primary: '#15803d', secondary: '#ffffff', accent: '#16a34a' }
  };

  function norm(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  function getClubPalette(clubName, state) {
    const slug = norm(clubName);
    if (CLUB_PALETTES[slug]) return CLUB_PALETTES[slug];

    // Se for clube customizado ou editado
    if (state?.homeKit?.shirtColor) {
      return {
        primary: state.homeKit.shirtColor || '#0284c7',
        secondary: state.homeKit.secondaryColor || '#ffffff',
        accent: state.badgeConfig?.secondaryColor || '#facc15'
      };
    }
    return { primary: '#0284c7', secondary: '#ffffff', accent: '#facc15' };
  }

  class StadiumLowPolyScene {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.options = options;
      this.animId = null;
      this.isDisposed = false;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;
      this.stadiumGroup = null;
      this.animatedElements = [];

      this.init();
    }

    init() {
      if (!window.THREE) {
        console.warn('Three.js não carregado. Fallback ativado.');
        return;
      }

      const THREE = window.THREE;
      const width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 540;
      const height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 450;

      // 1. Cena
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color('#070b14');
      this.scene.fog = new THREE.FogExp2('#070b14', 0.007);

      // 2. Câmera
      this.camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 450);
      this.camera.position.set(44, 32, 50);

      // 3. Renderizador
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // 4. Controles Orbitais
      if (window.THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.minDistance = 18;
        this.controls.maxDistance = 110;
        this.controls.target.set(0, 2, 0);
      }

      // 5. Iluminação
      this.setupLighting();

      // 6. Grupo Principal do Estádio
      this.stadiumGroup = new THREE.Group();
      this.scene.add(this.stadiumGroup);

      // 7. Redimensionamento
      this.handleResize = () => {
        if (!this.canvas || !this.canvas.parentElement || this.isDisposed) return;
        const w = this.canvas.parentElement.clientWidth;
        const h = this.canvas.parentElement.clientHeight;
        if (w > 0 && h > 0) {
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        }
      };
      window.addEventListener('resize', this.handleResize);

      // 8. Loop de Animação
      this.clock = new THREE.Clock();
      this.animate();
    }

    setupLighting() {
      const THREE = window.THREE;
      
      // Luz ambiente suave
      const hemiLight = new THREE.HemisphereLight('#cbd5e1', '#0f172a', 0.65);
      this.scene.add(hemiLight);

      // Sol principal direcional com sombra
      const dirLight = new THREE.DirectionalLight('#ffffff', 0.85);
      dirLight.position.set(32, 45, 28);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 120;
      dirLight.shadow.camera.left = -40;
      dirLight.shadow.camera.right = 40;
      dirLight.shadow.camera.top = 40;
      dirLight.shadow.camera.bottom = -40;
      dirLight.shadow.bias = -0.001;
      this.scene.add(dirLight);

      // Luz de preenchimento azulada oposta
      const fillLight = new THREE.DirectionalLight('#38bdf8', 0.25);
      fillLight.position.set(-25, 20, -30);
      this.scene.add(fillLight);
    }

    /**
     * Constrói e atualiza toda a geometria da maquete low-poly
     */
    buildStadium(state, params = {}) {
      if (!this.stadiumGroup || !window.THREE) return;
      const THREE = window.THREE;

      // Limpa meshes anteriores
      while (this.stadiumGroup.children.length > 0) {
        const obj = this.stadiumGroup.children[0];
        this.stadiumGroup.remove(obj);
        if (obj.geometry && typeof obj.geometry.dispose === 'function') obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => { if (m && typeof m.dispose === 'function') m.dispose(); });
          } else if (typeof obj.material.dispose === 'function') {
            obj.material.dispose();
          }
        }
      }
      this.animatedElements = [];

      const clubName = state?.club || 'Clube';
      const palette = getClubPalette(clubName, state);
      let cap = Number(state?.infrastructure?.stadium?.capacity || state?.stadiumCapacity || 7800);
      
      // Obtém dados dos anéis de ampliação
      const stData = (typeof window.getStadiumExpansionData === 'function')
        ? window.getStadiumExpansionData()
        : (state?.stadiumRingData || { ring: 1, rings: { 1: { norte: true, sul: true, leste: true, oeste: true } } });

      const ring = Number(stData?.ring || 1);
      let rings = stData?.rings || { 1: { norte: true, sul: true, leste: true, oeste: true } };
      const activeWork = stData?.activeWork || null;

      // Se estiver na aba Arena, gera a maquete simulada da capacidade selecionada
      if (params.isArena && params.selectedArenaCapacity) {
        cap = Number(params.selectedArenaCapacity);
        const maxR = cap >= 100000 ? 6 : cap >= 72160 ? 5 : cap >= 49000 ? 4 : cap >= 30640 ? 3 : cap >= 18000 ? 2 : 1;
        rings = {};
        for (let r = 1; r <= 6; r++) {
          rings[r] = { norte: r <= maxR, sul: r <= maxR, leste: r <= maxR, oeste: r <= maxR };
        }
      }

      const upgrades = {
        ...(state?.stadiumUpgrades || {}),
        ...(params.previewUpgrade ? { [params.previewUpgrade]: true } : {})
      };

      // 1. Base / Praça Esportiva Externa (Podium de Asfalto e Calçadas)
      this.buildPlaza();

      // 2. Gramado Oficial Cortado em Faixas + Linhas e Traves
      this.buildPitch();

      // 3. Os 6 Anéis de Arquibancadas Progressivas
      this.buildStands(rings, palette, cap, params, ring);

      // 4. Obras Ativas com Guindaste e Andaimes no Setor Sendo Construído
      if (activeWork && activeWork.side) {
        this.buildConstructionCrane(activeWork.side, Number(activeWork.ring) || 1);
      }

      // 5. Melhorias em Tempo Real (Telão, Refletores LED, Fogos, Mosaico, Camarotes VIP, etc.)
      this.buildUpgrades(upgrades, palette, rings, clubName);
    }

    /**
     * 1. Praça Esportiva Externa
     */
    buildPlaza() {
      const THREE = window.THREE;
      const plazaGeo = new THREE.BoxGeometry(58, 1.2, 74);
      const plazaMat = new THREE.MeshStandardMaterial({
        color: '#111827',
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
      });
      const plaza = new THREE.Mesh(plazaGeo, plazaMat);
      plaza.position.y = -0.6;
      plaza.receiveShadow = true;
      this.stadiumGroup.add(plaza);

      // Detalhe de calçada externa
      const sidewalkGeo = new THREE.BoxGeometry(64, 0.4, 80);
      const sidewalkMat = new THREE.MeshStandardMaterial({ color: '#0b0f19', roughness: 0.95, flatShading: true });
      const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      sidewalk.position.y = -1.0;
      this.stadiumGroup.add(sidewalk);

      // Árvores Low-Poly na Esplanada Externa
      const treeCoords = [
        [-28, 0, -34], [28, 0, -34], [-28, 0, 34], [28, 0, 34],
        [-28, 0, 0], [28, 0, 0], [-28, 0, -18], [28, 0, 18]
      ];
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9, flatShading: true });
      const foliageMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8, flatShading: true });
      treeCoords.forEach(([x, y, z]) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 5), trunkMat);
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        this.stadiumGroup.add(trunk);

        const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 0), foliageMat);
        foliage.position.set(x, 2.5, z);
        foliage.castShadow = true;
        this.stadiumGroup.add(foliage);
      });
    }

    /**
     * 2. Gramado Oficial com Faixas e Marcações de Jogo
     */
    buildPitch() {
      const THREE = window.THREE;
      const fieldW = 24;
      const fieldL = 36;

      // Base do Campo Verde
      const pitchBaseGeo = new THREE.BoxGeometry(fieldW + 2, 0.3, fieldL + 2);
      const pitchBaseMat = new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.9, flatShading: true });
      const pitchBase = new THREE.Mesh(pitchBaseGeo, pitchBaseMat);
      pitchBase.position.y = 0.15;
      pitchBase.receiveShadow = true;
      this.stadiumGroup.add(pitchBase);

      // Faixas de Corte do Gramado (10 listras alternadas)
      const numStripes = 10;
      const stripeL = fieldL / numStripes;
      for (let i = 0; i < numStripes; i++) {
        const isDark = (i % 2 === 0);
        const stripeGeo = new THREE.PlaneGeometry(fieldW, stripeL);
        const stripeMat = new THREE.MeshStandardMaterial({
          color: isDark ? '#15803d' : '#16a34a',
          roughness: 0.85,
          side: THREE.DoubleSide
        });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(0, 0.32, -fieldL / 2 + stripeL * (i + 0.5));
        stripe.receiveShadow = true;
        this.stadiumGroup.add(stripe);
      }

      // Linhas Brancas do Gramado
      const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      
      // Borda Externa
      const borderLines = [
        [fieldW, 0.15, 0, 0.33, -fieldL / 2], // Norte
        [fieldW, 0.15, 0, 0.33, fieldL / 2],  // Sul
        [0.15, fieldL, -fieldW / 2, 0.33, 0], // Oeste
        [0.15, fieldL, fieldW / 2, 0.33, 0],  // Leste
        [fieldW, 0.15, 0, 0.33, 0]            // Linha Central
      ];
      borderLines.forEach(([w, h, x, y, z]) => {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, y, z);
        this.stadiumGroup.add(line);
      });

      // Círculo Central
      const circleGeo = new THREE.RingGeometry(3.2, 3.35, 24);
      const circle = new THREE.Mesh(circleGeo, lineMat);
      circle.rotation.x = -Math.PI / 2;
      circle.position.set(0, 0.335, 0);
      this.stadiumGroup.add(circle);

      // Grandes Áreas Norte e Sul
      [-1, 1].forEach(dir => {
        const boxW = 12;
        const boxL = 5.5;
        const pz = dir * (fieldL / 2 - boxL / 2);
        const boxLine = new THREE.Mesh(new THREE.PlaneGeometry(boxW, 0.15), lineMat);
        boxLine.rotation.x = -Math.PI / 2;
        boxLine.position.set(0, 0.335, dir * (fieldL / 2 - boxL));
        this.stadiumGroup.add(boxLine);

        // Linhas laterais da grande área
        [-boxW/2, boxW/2].forEach(px => {
          const sLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, boxL), lineMat);
          sLine.rotation.x = -Math.PI / 2;
          sLine.position.set(px, 0.335, pz);
          this.stadiumGroup.add(sLine);
        });

        // Trave de Gol Low-Poly Branca
        const goalMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
        const postH = 2.2;
        const postW = 4.2;
        const goalZ = dir * (fieldL / 2);

        const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, postH, 6), goalMat);
        leftPost.position.set(-postW / 2, postH / 2 + 0.3, goalZ);
        this.stadiumGroup.add(leftPost);

        const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, postH, 6), goalMat);
        rightPost.position.set(postW / 2, postH / 2 + 0.3, goalZ);
        this.stadiumGroup.add(rightPost);

        const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, postW, 6), goalMat);
        crossbar.rotation.z = Math.PI / 2;
        crossbar.position.set(0, postH + 0.3, goalZ);
        this.stadiumGroup.add(crossbar);

        // Rede do Gol
        const netGeo = new THREE.BoxGeometry(postW, postH, 1.4);
        const netMat = new THREE.MeshStandardMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.6 });
        const net = new THREE.Mesh(netGeo, netMat);
        net.position.set(0, postH / 2 + 0.3, goalZ + dir * 0.7);
        this.stadiumGroup.add(net);
      });

      // Bancos de Reservas Técnicos Low-Poly (Setor Oeste)
      [-4, 4].forEach(offsetZ => {
        const benchCanopy = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 1.4, 4.5),
          new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5, metalness: 0.5 })
        );
        benchCanopy.position.set(-fieldW / 2 - 1.2, 1.0, offsetZ);
        this.stadiumGroup.add(benchCanopy);
      });
    }

    /**
     * 3. Constrói os Anéis de Arquibancadas Progressivos (Rumo aos 100k)
     */
    buildStands(rings, palette, cap, params = {}, currentRing = 1) {
      const THREE = window.THREE;
      const concreteColor = '#475569';
      const concreteDark = '#334155';
      const seatPrimary = palette.primary || '#0284c7';
      const seatSecondary = palette.secondary || '#ffffff';

      const standSides = ['norte', 'sul', 'leste', 'oeste'];

      // Nível máximo de anel construído
      let maxBuiltRing = 1;
      for (let r = 1; r <= 6; r++) {
        if (rings[r] && standSides.some(s => rings[r][s])) maxBuiltRing = r;
      }
      this.maxBuiltRing = maxBuiltRing;

      // Configuração geométrica dos 6 anéis:
      // Cada anel adiciona elevação, profundidade e raio externo
      const ringConfigs = {
        1: { yBase: 0.3, steps: 4, stepH: 0.45, stepD: 1.1, offsetDist: 0, seatColor: seatPrimary },
        2: { yBase: 2.2, steps: 4, stepH: 0.55, stepD: 1.2, offsetDist: 4.4, seatColor: seatSecondary },
        3: { yBase: 4.6, steps: 5, stepH: 0.60, stepD: 1.3, offsetDist: 9.2, seatColor: seatPrimary },
        4: { yBase: 7.8, steps: 5, stepH: 0.65, stepD: 1.4, offsetDist: 15.7, seatColor: seatSecondary },
        5: { yBase: 11.2, steps: 6, stepH: 0.70, stepD: 1.5, offsetDist: 22.7, seatColor: seatPrimary },
        6: { yBase: 15.6, steps: 7, stepH: 0.75, stepD: 1.6, offsetDist: 31.7, seatColor: seatSecondary }
      };

      for (let r = 1; r <= Math.min(6, maxBuiltRing); r++) {
        const rData = rings[r] || {};
        const cfg = ringConfigs[r];

        standSides.forEach(side => {
          const isBuilt = !!rData[side];
          if (!isBuilt) return;

          this.buildStandSector(side, r, cfg, concreteColor, concreteDark, palette, false);
        });

        // Curvas da Ferradura (Anel 3 em diante): Conecta os cantos
        if (r >= 3 && rData['leste'] && rData['norte']) {
          this.buildCornerCurve('ne', r, cfg, concreteColor, palette);
        }
        if (r >= 3 && rData['oeste'] && rData['norte']) {
          this.buildCornerCurve('nw', r, cfg, concreteColor, palette);
        }
        if (r >= 3 && rData['leste'] && rData['sul']) {
          this.buildCornerCurve('se', r, cfg, concreteColor, palette);
        }
        if (r >= 3 && rData['oeste'] && rData['sul']) {
          this.buildCornerCurve('sw', r, cfg, concreteColor, palette);
        }
      }

      // Prévia Holográfica do Setor em foco selecionado pelo usuário na aba Ampliação
      if (params.selectedSide && params.isExp && (!rings[currentRing] || !rings[currentRing][params.selectedSide])) {
        const cfg = ringConfigs[currentRing] || ringConfigs[1];
        this.buildStandSector(params.selectedSide, currentRing, cfg, concreteColor, concreteDark, palette, true);
      }

      // 4. Cobertura Cantilever (Anel 5 e 6 - Arena FIFA e Mega Coliseu)
      if (maxBuiltRing >= 5) {
        this.buildCanopyRoof(maxBuiltRing, palette);
      }

      // 5. Fachada Externa Monumental (Anel 4 em diante)
      if (maxBuiltRing >= 4) {
        this.buildOuterFacade(maxBuiltRing, palette);
      }
    }

    /**
     * Constrói um setor de arquibancada (Norte, Sul, Leste ou Oeste) em determinado anel
     */
    buildStandSector(side, ringNum, cfg, concreteColor, concreteDark, palette, isProjectPreview = false) {
      const THREE = window.THREE;
      const isNorthSouth = (side === 'norte' || side === 'sul');
      const sideDir = (side === 'sul' || side === 'leste') ? 1 : -1;

      // Dimensões da arquibancada
      const standLength = isNorthSouth ? (24 + (ringNum - 1) * 6) : (36 + (ringNum - 1) * 7);
      const totalDepth = cfg.steps * cfg.stepD;
      const totalHeight = cfg.steps * cfg.stepH;

      const sectorGroup = new THREE.Group();

      // Materiais (Holograma dourado se for prévia de projeto antes da compra)
      const concMat = new THREE.MeshStandardMaterial({
        color: isProjectPreview ? '#f59e0b' : (ringNum % 2 === 0 ? concreteDark : concreteColor),
        roughness: isProjectPreview ? 0.3 : 0.85,
        transparent: isProjectPreview,
        opacity: isProjectPreview ? 0.6 : 1.0,
        flatShading: true
      });
      const seatColor = (ringNum % 2 === 1) ? palette.primary : palette.secondary;
      const seatMat = new THREE.MeshStandardMaterial({
        color: isProjectPreview ? '#fbbf24' : seatColor,
        roughness: isProjectPreview ? 0.2 : 0.6,
        metalness: isProjectPreview ? 0.8 : 0.2,
        transparent: isProjectPreview,
        opacity: isProjectPreview ? 0.75 : 1.0,
        flatShading: true
      });

      // Degraus individuais de concreto + Assentos
      for (let s = 0; s < cfg.steps; s++) {
        const stepY = cfg.yBase + s * cfg.stepH;
        const stepDist = (isNorthSouth ? 18 : 12) + cfg.offsetDist + s * cfg.stepD;

        // Bloco do Degrau de Concreto
        const stepGeo = new THREE.BoxGeometry(
          isNorthSouth ? standLength : cfg.stepD,
          cfg.stepH,
          isNorthSouth ? cfg.stepD : standLength
        );
        const stepMesh = new THREE.Mesh(stepGeo, concMat);
        const posX = isNorthSouth ? 0 : sideDir * stepDist;
        const posZ = isNorthSouth ? sideDir * stepDist : 0;
        stepMesh.position.set(posX, stepY + cfg.stepH / 2, posZ);
        stepMesh.castShadow = !isProjectPreview;
        stepMesh.receiveShadow = !isProjectPreview;
        sectorGroup.add(stepMesh);

        // Fileira de Assentos Coloridos sobre o degrau
        const seatGeo = new THREE.BoxGeometry(
          isNorthSouth ? standLength * 0.95 : cfg.stepD * 0.6,
          cfg.stepH * 0.35,
          isNorthSouth ? cfg.stepD * 0.6 : standLength * 0.95
        );
        const seatMesh = new THREE.Mesh(seatGeo, seatMat);
        seatMesh.position.set(posX, stepY + cfg.stepH + cfg.stepH * 0.18, posZ);
        seatMesh.castShadow = !isProjectPreview;
        sectorGroup.add(seatMesh);
      }

      // Pilares de Sustentação Inferiores para anéis elevados (Anel 2 em diante)
      if (ringNum >= 2 && !isProjectPreview) {
        const pillarDist = (isNorthSouth ? 18 : 12) + cfg.offsetDist + totalDepth / 2;
        const numPillars = 4;
        const pSpacing = standLength / (numPillars + 1);

        for (let p = 1; p <= numPillars; p++) {
          const pillarGeo = new THREE.BoxGeometry(1.2, cfg.yBase, 1.2);
          const pillarMesh = new THREE.Mesh(pillarGeo, concMat);
          const px = isNorthSouth ? (-standLength / 2 + p * pSpacing) : sideDir * pillarDist;
          const pz = isNorthSouth ? sideDir * pillarDist : (-standLength / 2 + p * pSpacing);
          pillarMesh.position.set(px, cfg.yBase / 2, pz);
          pillarMesh.castShadow = true;
          sectorGroup.add(pillarMesh);
        }
      }

      this.stadiumGroup.add(sectorGroup);
    }

    /**
     * Constrói curvas que unem os lados (Ferradura clássica / Curvas dos cantos)
     */
    buildCornerCurve(corner, ringNum, cfg, concreteColor, palette) {
      const THREE = window.THREE;
      const cornerGroup = new THREE.Group();

      const dirX = (corner === 'ne' || corner === 'se') ? 1 : -1;
      const dirZ = (corner === 'se' || corner === 'sw') ? 1 : -1;
      const rotAngle = (corner === 'ne') ? -Math.PI / 4 
                     : (corner === 'nw') ? Math.PI / 4 
                     : (corner === 'se') ? -3 * Math.PI / 4 
                     : 3 * Math.PI / 4;

      const cornerLength = 10 + (ringNum - 1) * 3;
      const concMat = new THREE.MeshStandardMaterial({ color: concreteColor, roughness: 0.85, flatShading: true });
      const seatColor = (ringNum % 2 === 1) ? palette.primary : palette.secondary;
      const seatMat = new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.6, flatShading: true });

      // Degraus dos cantos chanfrados em 45° conectando as arquibancadas
      for (let s = 0; s < cfg.steps; s++) {
        const stepY = cfg.yBase + s * cfg.stepH;
        const cornerDist = 20 + cfg.offsetDist + s * cfg.stepD;
        const posX = dirX * cornerDist * 0.707;
        const posZ = dirZ * cornerDist * 0.707;

        const stepGeo = new THREE.BoxGeometry(cornerLength, cfg.stepH, cfg.stepD);
        const stepMesh = new THREE.Mesh(stepGeo, concMat);
        stepMesh.rotation.y = rotAngle;
        stepMesh.position.set(posX, stepY + cfg.stepH / 2, posZ);
        stepMesh.castShadow = true;
        cornerGroup.add(stepMesh);

        const seatGeo = new THREE.BoxGeometry(cornerLength * 0.9, cfg.stepH * 0.35, cfg.stepD * 0.6);
        const seatMesh = new THREE.Mesh(seatGeo, seatMat);
        seatMesh.rotation.y = rotAngle;
        seatMesh.position.set(posX, stepY + cfg.stepH + cfg.stepH * 0.18, posZ);
        seatMesh.castShadow = true;
        cornerGroup.add(seatMesh);
      }

      this.stadiumGroup.add(cornerGroup);
    }

    /**
     * 4. Cobertura Cantilever Moderna em Balanço (Anéis 5 e 6)
     */
    buildCanopyRoof(ringNum, palette) {
      const THREE = window.THREE;
      const roofGroup = new THREE.Group();
      const roofMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.4,
        metalness: 0.6,
        flatShading: true
      });
      const trussMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5, metalness: 0.8 });

      const roofHeight = ringNum >= 6 ? 26 : 20;
      const roofW = ringNum >= 6 ? 66 : 56;
      const roofL = ringNum >= 6 ? 82 : 70;
      const overhang = 10;

      // 4 Painéis de Marquise Cantilever cobrindo os 4 lados com vão central aberto para o sol
      const canopies = [
        [roofW, overhang, 0, roofHeight, -roofL / 2 + overhang / 2], // Norte
        [roofW, overhang, 0, roofHeight, roofL / 2 - overhang / 2],  // Sul
        [overhang, roofL, -roofW / 2 + overhang / 2, roofHeight, 0], // Oeste
        [overhang, roofL, roofW / 2 - overhang / 2, roofHeight, 0]   // Leste
      ];

      canopies.forEach(([w, l, x, y, z]) => {
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, l), roofMat);
        canopy.position.set(x, y, z);
        canopy.castShadow = true;
        roofGroup.add(canopy);
      });

      // Se for Mega Coliseu 100k: Grande Arco de Treliça Metálica Cruzando o Céu do Estádio
      if (ringNum >= 6) {
        const archGeo = new THREE.TorusGeometry(36, 0.8, 6, 18, Math.PI);
        const arch = new THREE.Mesh(archGeo, trussMat);
        arch.rotation.y = Math.PI / 2;
        arch.position.set(0, 18, 0);
        arch.castShadow = true;
        roofGroup.add(arch);

        // Telão Central Cubo 360° Suspenso
        const cubeScoreboard = new THREE.Mesh(
          new THREE.BoxGeometry(6, 4, 6),
          new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, metalness: 0.9 })
        );
        cubeScoreboard.position.set(0, 16, 0);
        roofGroup.add(cubeScoreboard);

        // Telas de LED do cubo
        const screenMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
        const screenFront = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.2), screenMat);
        screenFront.position.set(0, 16, 3.05);
        roofGroup.add(screenFront);
        const screenBack = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.2), screenMat);
        screenBack.rotation.y = Math.PI;
        screenBack.position.set(0, 16, -3.05);
        roofGroup.add(screenBack);
      }

      this.stadiumGroup.add(roofGroup);
    }

    /**
     * 5. Fachada Externa Monumental
     */
    buildOuterFacade(ringNum, palette) {
      const THREE = window.THREE;
      const facadeGroup = new THREE.Group();
      const facadeMat = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.8,
        flatShading: true
      });

      const facadeH = ringNum >= 6 ? 22 : (ringNum >= 5 ? 16 : 12);
      const facadeW = ringNum >= 6 ? 64 : (ringNum >= 5 ? 54 : 44);
      const facadeL = ringNum >= 6 ? 80 : (ringNum >= 5 ? 68 : 58);

      // Pilastras Arquitetônicas Verticais Externas nos 4 lados
      const pillars = 12;
      for (let i = 0; i < pillars; i++) {
        // Pilares Leste/Oeste
        const z = -facadeL / 2 + (facadeL / (pillars - 1)) * i;
        [-facadeW / 2, facadeW / 2].forEach(x => {
          const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, facadeH, 1.2), facadeMat);
          col.position.set(x, facadeH / 2, z);
          col.castShadow = true;
          facadeGroup.add(col);
        });
      }

      this.stadiumGroup.add(facadeGroup);
    }

    /**
     * Constrói Guindaste de Obra Amarelo no setor sendo ampliado em tempo real
     */
    buildConstructionCrane(side, ringNum) {
      const THREE = window.THREE;
      const craneGroup = new THREE.Group();
      const isNorthSouth = (side === 'norte' || side === 'sul');
      const sideDir = (side === 'sul' || side === 'leste') ? 1 : -1;

      const craneDist = (isNorthSouth ? 26 : 20) + (ringNum - 1) * 4;
      const craneX = isNorthSouth ? (side === 'norte' ? -10 : 10) : sideDir * craneDist;
      const craneZ = isNorthSouth ? sideDir * craneDist : (side === 'leste' ? 10 : -10);
      const craneH = 18 + ringNum * 2;

      const craneMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.4, metalness: 0.6, flatShading: true });
      const darkMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.7 });

      // Torre Vertical em Treliça
      const mast = new THREE.Mesh(new THREE.BoxGeometry(1.4, craneH, 1.4), craneMat);
      mast.position.set(craneX, craneH / 2, craneZ);
      mast.castShadow = true;
      craneGroup.add(mast);

      // Braço Horizontal da Lança (Jib)
      const jibL = 16;
      const jib = new THREE.Mesh(new THREE.BoxGeometry(jibL, 0.8, 0.8), craneMat);
      const jibDir = isNorthSouth ? (side === 'norte' ? 1 : -1) : -sideDir;
      jib.position.set(craneX + (isNorthSouth ? 0 : jibDir * (jibL / 2 - 2)), craneH + 0.6, craneZ + (isNorthSouth ? jibDir * (jibL / 2 - 2) : 0));
      jib.castShadow = true;
      craneGroup.add(jib);

      // Contrapeso Traseiro
      const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.6, 2.0), darkMat);
      counterWeight.position.set(craneX - (isNorthSouth ? 0 : jibDir * 4), craneH + 0.8, craneZ - (isNorthSouth ? jibDir * 4 : 0));
      craneGroup.add(counterWeight);

      // Cabo de Içamento e Bloco de Concreto Pendurado
      const cableMat = new THREE.MeshBasicMaterial({ color: '#cbd5e1' });
      const cableH = 6;
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, cableH, 4), cableMat);
      const cableX = craneX + (isNorthSouth ? 0 : jibDir * 6);
      const cableZ = craneZ + (isNorthSouth ? jibDir * 6 : 0);
      cable.position.set(cableX, craneH - cableH / 2, cableZ);
      craneGroup.add(cable);

      const blockMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.9, flatShading: true });
      const block = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 1.8), blockMat);
      block.position.set(cableX, craneH - cableH, cableZ);
      block.castShadow = true;
      craneGroup.add(block);

      // Luz de Alerta / Beacon Vermelho Pulsante no Topo do Guindaste
      const beaconMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), beaconMat);
      beacon.position.set(craneX, craneH + 1.6, craneZ);
      craneGroup.add(beacon);
      this.animatedElements.push({ mesh: beacon, type: 'beacon' });

      this.stadiumGroup.add(craneGroup);
    }

    /**
     * Constrói Melhorias Visuais Acopladas (Telão, Iluminação, etc.)
     */
    buildUpgrades(upgrades, palette, rings, clubName) {
      const THREE = window.THREE;
      const upgradeGroup = new THREE.Group();

      // 1. Refletores de LED nos 4 Cantos
      const lightPositions = [
        [-19, 0, -28], [19, 0, -28],
        [-19, 0, 28], [19, 0, 28]
      ];
      const towerMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5, metalness: 0.6 });
      const lightGlowMat = new THREE.MeshBasicMaterial({ color: upgrades.ledLights ? '#fef08a' : '#cbd5e1' });

      lightPositions.forEach(([x, y, z]) => {
        const towerH = upgrades.ledLights ? 18 : 12;
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, towerH, 0.8), towerMat);
        tower.position.set(x, towerH / 2, z);
        tower.castShadow = true;
        upgradeGroup.add(tower);

        // Painel de Holofotes
        const panel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.5), lightGlowMat);
        panel.position.set(x, towerH + 0.9, z);
        panel.lookAt(0, 0, 0);
        upgradeGroup.add(panel);

        if (upgrades.ledLights) {
          const spot = new THREE.SpotLight('#fef08a', 0.6, 60, Math.PI / 4, 0.4);
          spot.position.set(x, towerH + 0.9, z);
          spot.target.position.set(0, 0, 0);
          this.scene.add(spot.target);
          this.scene.add(spot);
        }
      });

      // 2. Telão Digital do Clube (Setor Norte)
      if (upgrades.screen) {
        const screenFrame = new THREE.Mesh(
          new THREE.BoxGeometry(10, 5, 0.8),
          new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3, metalness: 0.8 })
        );
        screenFrame.position.set(0, 14, -22);
        upgradeGroup.add(screenFrame);

        const screenFace = new THREE.Mesh(
          new THREE.PlaneGeometry(9.2, 4.2),
          new THREE.MeshBasicMaterial({ color: '#22c55e' })
        );
        screenFace.position.set(0, 14, -21.55);
        upgradeGroup.add(screenFace);
      }

      // 3. Fogos e Sinalizadores da Torcida (Festa Pirotécnica)
      if (upgrades.flares) {
        [-8, 0, 8].forEach((fx, idx) => {
          const flareMat = new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? '#ef4444' : '#f97316' });
          const flareMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), flareMat);
          flareMesh.position.set(fx, 4.5, 20);
          upgradeGroup.add(flareMesh);
          this.animatedElements.push({ mesh: flareMesh, type: 'flare', baseScale: 0.7, offset: idx });
        });
      }

      // 4. Anel de LED 360° em Volta do Gramado
      if (upgrades.ledRing) {
        const ledMat = new THREE.MeshBasicMaterial({ color: palette.accent || '#38bdf8' });
        const ledRibbonNorth = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 0.2), ledMat);
        ledRibbonNorth.position.set(0, 0.6, -18.2);
        upgradeGroup.add(ledRibbonNorth);

        const ledRibbonSouth = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 0.2), ledMat);
        ledRibbonSouth.position.set(0, 0.6, 18.2);
        upgradeGroup.add(ledRibbonSouth);
      }

      // 5. Camarotes VIP Corporativos em Vidro com Luz Interior
      if (upgrades.vipBoxes) {
        const vipMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.9, flatShading: true });
        const glassMat = new THREE.MeshBasicMaterial({ color: '#fef08a', transparent: true, opacity: 0.8 });
        [-1, 1].forEach(sideDir => {
          const vipBoxL = 28;
          const vipY = 5.2;
          const vipDist = 17;
          const vipGroup = new THREE.Group();
          const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, vipBoxL), vipMat);
          frame.position.set(sideDir * vipDist, vipY, 0);
          frame.castShadow = true;
          vipGroup.add(frame);

          const windowPane = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, vipBoxL * 0.9), glassMat);
          windowPane.position.set(sideDir * (vipDist - 1.2), vipY, 0);
          vipGroup.add(windowPane);
          upgradeGroup.add(vipGroup);
        });
      }

      // 6. Usina Solar e Climatização Eco
      if (upgrades.solarPitch) {
        const solarMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.2, metalness: 0.8, flatShading: true });
        [-1, 1].forEach(sideDir => {
          const solar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 28), solarMat);
          solar.position.set(sideDir * 22, 18.5, 0);
          upgradeGroup.add(solar);
        });
      }

      // 7. Tour da Arena & Museu Imersivo
      if (upgrades.museumTour) {
        const museumMat = new THREE.MeshStandardMaterial({ color: '#0891b2', roughness: 0.3, metalness: 0.7, flatShading: true });
        const museumAtrium = new THREE.Mesh(new THREE.BoxGeometry(3.5, 4.5, 10), museumMat);
        museumAtrium.position.set(-22, 2.25, 0);
        museumAtrium.castShadow = true;
        upgradeGroup.add(museumAtrium);
      }

      this.stadiumGroup.add(upgradeGroup);
    }

    /**
     * Aplica uma visão de câmera orbital pré-configurada
     */
    setCameraPreset(preset) {
      if (!this.controls || !this.camera) return;
      const aliasMap = {
        'screen': 'tv',
        'vipBoxes': 'oeste',
        'flares': 'sul',
        'mosaic': 'sul',
        'chairs': 'leste',
        'ledLights': 'panoramic',
        'solarPitch': 'panoramic',
        'ledRing': 'campo',
        'surroundSound': 'tv',
        'museumTour': 'oeste'
      };
      const p = aliasMap[preset] || preset;
      const ringScale = 1 + (Math.max(1, this.maxBuiltRing || 1) - 1) * 0.12;

      const targetPos = {
        panoramic: { x: 44 * ringScale, y: 32 * ringScale, z: 50 * ringScale, tx: 0, ty: 2, tz: 0 },
        tv: { x: -38 * ringScale, y: 24 * ringScale, z: 0, tx: 8, ty: 4, tz: 0 },
        leste: { x: -34 * ringScale, y: 20 * ringScale, z: 0, tx: 16, ty: 4, tz: 0 },
        oeste: { x: 34 * ringScale, y: 20 * ringScale, z: 0, tx: -16, ty: 4, tz: 0 },
        norte: { x: 0, y: 22 * ringScale, z: 38 * ringScale, tx: 0, ty: 4, tz: -16 },
        sul: { x: 0, y: 22 * ringScale, z: -38 * ringScale, tx: 0, ty: 4, tz: 16 },
        campo: { x: 0, y: 2.2, z: 2, tx: 0, ty: 10 * ringScale, tz: -20 * ringScale }
      }[p] || { x: 44 * ringScale, y: 32 * ringScale, z: 50 * ringScale, tx: 0, ty: 2, tz: 0 };

      this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
      this.controls.target.set(targetPos.tx, targetPos.ty, targetPos.tz);
      this.controls.update();
    }

    /**
     * Loop de animação contínuo
     */
    animate() {
      if (this.isDisposed) return;
      this.animId = requestAnimationFrame(() => this.animate());

      const elapsed = this.clock ? this.clock.getElapsedTime() : 0;

      // Anima sinalizadores e beacons
      if (this.animatedElements.length > 0) {
        this.animatedElements.forEach(item => {
          if (item.type === 'flare') {
            const scale = item.baseScale * (1 + 0.3 * Math.sin(elapsed * 6 + item.offset));
            item.mesh.scale.set(scale, scale * 1.5, scale);
            item.mesh.rotation.y += 0.05;
          } else if (item.type === 'beacon') {
            const blink = (Math.sin(elapsed * 8) > 0) ? 1 : 0.2;
            item.mesh.scale.set(blink, blink, blink);
          }
        });
      }

      if (this.controls) this.controls.update();
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    dispose() {
      this.isDisposed = true;
      if (this.animId) cancelAnimationFrame(this.animId);
      window.removeEventListener('resize', this.handleResize);
      if (this.controls) this.controls.dispose();
      if (this.renderer) this.renderer.dispose();
    }
  }

  // Controlador Global Singleton para a Interface do Jogo
  let activeLowPolyInstance = null;

  const AFMStadiumLowPoly = {
    init(canvas, options) {
      if (activeLowPolyInstance) {
        activeLowPolyInstance.dispose();
        activeLowPolyInstance = null;
      }
      activeLowPolyInstance = new StadiumLowPolyScene(canvas, options);
      return activeLowPolyInstance;
    },

    update(state, params) {
      if (activeLowPolyInstance) {
        activeLowPolyInstance.buildStadium(state, params);
      }
    },

    setCameraPreset(preset) {
      if (activeLowPolyInstance) {
        activeLowPolyInstance.setCameraPreset(preset);
      }
    },

    getInstance() {
      return activeLowPolyInstance;
    },

    dispose() {
      if (activeLowPolyInstance) {
        activeLowPolyInstance.dispose();
        activeLowPolyInstance = null;
      }
    }
  };

  window.AFMStadiumLowPoly = AFMStadiumLowPoly;

})(typeof window !== 'undefined' ? window : this);
