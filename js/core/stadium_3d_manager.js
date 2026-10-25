/**
 * ==============================================================================
 * AFM MANAGER 2027 — GERENCIADOR OFICIAL DE ESTÁDIOS 3D
 * Arquivo: js/core/stadium_3d_manager.js
 * 
 * Gerencia a catalogação, seleção por nível de infraestrutura/capacidade,
 * visualizador 3D interativo (WebGL / model-viewer) e acompanhamento de evolução
 * das arquibancadas de 5.000 até 100.000 lugares:
 * 1. Estádio Aberto Tradicional / Raiz (Até 14k)
 * 2. Estádio Regional com Módulos (Até 24k)
 * 3. Estádio Clássico Brasileiro / Ferradura (Até 40k)
 * 4. Estádio Monumental Fechado (Até 60k)
 * 5. Arena Multiuso Padrão FIFA (Até 80k)
 * 6. Mega Coliseu Esportivo 100k (Até 100k)
 * 7. Arquibancadas Modulares de Expansão (Módulos de Obra)
 * ==============================================================================
 */

(function (window) {
  'use strict';

  const STADIUM_3D_CATALOG = {
    'arena_aberta': {
      id: 'arena_aberta',
      name: 'Estádio Aberto Tradicional',
      badge: '🏟️ Nível 1 • Aberto / Raiz (Até 14k)',
      file: 'assets/stadiums/arena_aberta.glb',
      fallbackFile: 'assets/stadios/arena_aberta.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Estádio de raiz com arquibancadas baixas de concreto a céu aberto e torres de refletores nos cantos. Ideal para divisões de acesso e clubes de bairro.',
      capacityRange: '3.000 a 14.999 lugares',
      stLevel: 1,
      minCapacity: 0,
      maxCapacity: 14999,
      meshes: 16,
      triangles: 9504,
      standEvolution: 'Degraus térreos abertos de concreto sem marquise',
      coverType: 'Sem cobertura (Setores 100% abertos ao céu)',
      lighting: '4 Torres de Refletores Halógenos nos Cantos',
      soundAcoustic: 'Dispersão sonora natural de estádio raiz',
      themeColor: '#38bdf8',
      defaultOrbit: '40deg 58deg 95%'
    },
    'arena_regional': {
      id: 'arena_regional',
      name: 'Estádio Regional com Módulos',
      badge: '🏗️ Nível 2 • Regional com Módulos (Até 24k)',
      file: 'assets/stadiums/arena_aberta.glb',
      fallbackFile: 'assets/stadios/arena_aberta.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Primeira fase de ampliação de arquibancadas: degraus modulares nos setores Norte e Sul, cabines suspensas de rádio e novos acessos de torcida.',
      capacityRange: '15.000 a 24.999 lugares',
      stLevel: 2,
      minCapacity: 15000,
      maxCapacity: 24999,
      meshes: 16,
      triangles: 10240,
      standEvolution: 'Módulos pré-moldados e expansão dos setores Norte e Sul',
      coverType: 'Cobertura parcial metálica sobre as cabines de imprensa',
      lighting: '6 Torres de Refletores Reforçados',
      soundAcoustic: 'Eco regional com pressão nas arquibancadas de fundo',
      themeColor: '#0ea5e9',
      defaultOrbit: '45deg 60deg 105%'
    },
    'arena_classica': {
      id: 'arena_classica',
      name: 'Estádio Clássico Brasileiro',
      badge: '🏛️ Nível 3 • Ferradura Clássica (Até 40k)',
      file: 'assets/stadiums/arena_classica.glb',
      fallbackFile: 'assets/stadios/arena_classica.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Arquitetura clássica brasileira em ferradura contínua, conectando as curvas Norte, Sul e Leste, com setor nobre coberto no setor Oeste.',
      capacityRange: '25.000 a 39.999 lugares',
      stLevel: 3,
      minCapacity: 25000,
      maxCapacity: 39999,
      meshes: 17,
      triangles: 12912,
      standEvolution: 'Anel em ferradura conectando curvas e arquibancadas sociais',
      coverType: 'Cobertura Metálica Tradicional sobre o Setor Oeste (Social)',
      lighting: 'Refletores em Marquises e Estrutura Tubular',
      soundAcoustic: 'Pressão sonora média com caldeirão lateral',
      themeColor: '#f59e0b',
      defaultOrbit: '45deg 55deg 105%'
    },
    'arena_monumental': {
      id: 'arena_monumental',
      name: 'Estádio Monumental Fechado',
      badge: '🏟️ Nível 4 • Monumental Fechado (Até 60k)',
      file: 'assets/stadiums/arena_classica.glb',
      fallbackFile: 'assets/stadios/arena_classica.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Fechamento integral do quarto lado com anel monumental 360°, fosso de segurança rebaixado e ampliação estrutural para receber clássicos de massa.',
      capacityRange: '40.000 a 59.999 lugares',
      stLevel: 4,
      minCapacity: 40000,
      maxCapacity: 59999,
      meshes: 17,
      triangles: 13500,
      standEvolution: 'Anel 360° completo fechando os 4 quadrantes com fosso rebaixado',
      coverType: 'Marquise circular contínua cobrindo o anel superior',
      lighting: 'Anel de Holofotes Perimetrais 2000 Lux',
      soundAcoustic: 'Caldeirão fechado com ressonância acústica circular',
      themeColor: '#f97316',
      defaultOrbit: '45deg 65deg 115%'
    },
    'arena_moderna': {
      id: 'arena_moderna',
      name: 'Arena Multiuso Padrão FIFA',
      badge: '⭐ Nível 5 • Arena Padrão FIFA (Até 80k)',
      file: 'assets/stadiums/arena_moderna.glb',
      fallbackFile: 'assets/stadios/arena_moderna.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Arena moderna fechada em 4 lados com cobertura cantilever integral em balanço, anel de camarotes VIP climatizados, painéis de LED contínuos e telão central 360°.',
      capacityRange: '60.000 a 79.999 lugares',
      stLevel: 5,
      minCapacity: 60000,
      maxCapacity: 79999,
      meshes: 17,
      triangles: 14136,
      standEvolution: 'Dois anéis cobertos, camarotes VIP entre anéis e assentos retráteis',
      coverType: 'Cobertura Cantilever 100% dos 4 Setores em Balanço',
      lighting: 'Holofotes LED Volumétricos de Transmissão 4K Ultra HD',
      soundAcoustic: 'Caldeirão acústico total com reverberação amplificada',
      themeColor: '#22c55e',
      defaultOrbit: '45deg 55deg 105%'
    },
    'arena_coliseu': {
      id: 'arena_coliseu',
      name: 'Mega Coliseu Esportivo 100k',
      badge: '👑 Nível 6 • Mega Coliseu 100k (Até 100k)',
      file: 'assets/stadiums/arena_moderna.glb',
      fallbackFile: 'assets/stadios/arena_moderna.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'O topo da engenharia esportiva mundial com 100.000 lugares. Três anéis monumentais de arquibancadas, cúpula translúcida de policarbonato e acústica ensurdecedora.',
      capacityRange: '80.000 a 100.000+ lugares',
      stLevel: 6,
      minCapacity: 80000,
      maxCapacity: 120000,
      meshes: 17,
      triangles: 15800,
      standEvolution: 'Triplo anel monumental (Inferior, Camarote VIP e Anel Panorâmico 100k)',
      coverType: 'Domo Arquitetônico com Cobertura Translúcida Total',
      lighting: 'Show de Luzes Dinâmicas LED RGB + 3000 Lux FIFA Pro',
      soundAcoustic: 'Caldeirão ensurdecedor de 100.000 vozes (Vantagem máxima em casa)',
      themeColor: '#a855f7',
      defaultOrbit: '45deg 68deg 125%'
    },
    'gradas_modulares': {
      id: 'gradas_modulares',
      name: 'Arquibancadas Modulares de Expansão',
      badge: '🔨 Módulos de Obra de Arquibancada',
      file: 'assets/stadiums/gradas_modulares_sem_campo.glb',
      fallbackFile: 'assets/stadios/gradas_modulares_sem_campo.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Estruturas modulares pré-fabricadas de arquibancada para acoplamento e expansão progressiva dos setores Norte, Sul, Leste ou Oeste.',
      capacityRange: 'Módulos customizáveis para expansões',
      stLevel: 0,
      minCapacity: 0,
      maxCapacity: 0,
      meshes: 11,
      triangles: 13092,
      standEvolution: 'Estruturas independentes de expansão e reforço estrutural',
      coverType: 'Módulos acopláveis com ou sem cobertura',
      lighting: 'Focos direcionais modulares',
      soundAcoustic: 'Acústica ajustável por setor em obra',
      themeColor: '#eab308',
      defaultOrbit: '35deg 65deg 100%'
    }
  };

  // Aliases para retrocompatibilidade total
  STADIUM_3D_CATALOG['arena_raiz'] = STADIUM_3D_CATALOG['arena_aberta'];

  // Ordem cronológica da evolução de arquibancadas
  const EVOLUTION_STYLES = [
    'arena_aberta',
    'arena_regional',
    'arena_classica',
    'arena_monumental',
    'arena_moderna',
    'arena_coliseu',
    'gradas_modulares'
  ];

  // Clubes com praças esportivas históricas consagradas
  const KNOWN_ARENAS = {
    // 80k - 100k
    'flamengo': 'arena_coliseu',
    'fluminense': 'arena_coliseu',
    'sao_paulo': 'arena_coliseu',
    'river_plate': 'arena_coliseu',
    'boca_juniors': 'arena_coliseu',

    // 40k - 80k
    'palmeiras': 'arena_moderna',
    'corinthians': 'arena_moderna',
    'atletico_mg': 'arena_moderna',
    'cruzeiro': 'arena_moderna',
    'gremio': 'arena_moderna',
    'internacional': 'arena_moderna',
    'bahia': 'arena_moderna',
    'fortaleza': 'arena_moderna',
    'ceara': 'arena_moderna',
    'athletico_pr': 'arena_moderna',
    'athletico_paranaense': 'arena_moderna',
    'botafogo': 'arena_moderna',
    'cuiaba': 'arena_moderna',
    'racing_club': 'arena_moderna',

    // 15k - 40k
    'santos': 'arena_classica',
    'vasco': 'arena_classica',
    'vasco_da_gama': 'arena_classica',
    'coritiba': 'arena_classica',
    'criciuma': 'arena_classica',
    'avai': 'arena_classica',
    'chapecoense': 'arena_classica',
    'juventude': 'arena_classica',
    'ponte_preta': 'arena_classica',
    'guarani': 'arena_classica',
    'sport': 'arena_classica',
    'sport_recife': 'arena_classica',
    'nautico': 'arena_classica',
    'santa_cruz': 'arena_classica',
    'figueirense': 'arena_classica',
    'vila_nova': 'arena_classica',
    'goias': 'arena_classica',
    'america_mg': 'arena_classica',
    'botafogo_sp': 'arena_classica',
    'londrina': 'arena_classica',
    'operario_pr': 'arena_classica',
    'crb': 'arena_classica',
    'csa': 'arena_classica',
    'paysandu': 'arena_classica',
    'remo': 'arena_classica',
    'joinville': 'arena_classica',
    'parana': 'arena_classica',
    'portuguesa': 'arena_classica'
  };

  function normalizeSlug(str) {
    if (typeof window.normSlug === 'function') return window.normSlug(str);
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  const AFMStadium3D = {
    catalog: STADIUM_3D_CATALOG,
    evolutionStyles: EVOLUTION_STYLES,

    /**
     * REGRA CRÍTICA INVIOLÁVEL: Converte volume de capacidade real em nível arquitetônico (1 a 6)
     * - Nível 1: 0 a 14.999 (ex: 5k, 7.8k, 8.5k, 12k, 14k) -> Raiz
     * - Nível 2: 15.000 a 24.999 -> Regional
     * - Nível 3: 25.000 a 39.999 -> Ferradura Clássica
     * - Nível 4: 40.000 a 59.999 -> Monumental Fechado
     * - Nível 5: 60.000 a 79.999 -> Arena Padrão FIFA
     * - Nível 6: 80.000 a 100.000+ -> Mega Coliseu 100k
     */
    getStadiumLevelByCapacity(cap) {
      const c = Math.max(0, Number(cap) || 0);
      if (c >= 80000) return 6;
      if (c >= 60000) return 5;
      if (c >= 40000) return 4;
      if (c >= 25000) return 3;
      if (c >= 15000) return 2;
      return 1;
    },

    /**
     * REGRA CRÍTICA INVIOLÁVEL: Retorna o modelo 3D correspondente estritamente à capacidade
     */
    getStadiumModelByCapacity(cap, slug = '') {
      const lvl = this.getStadiumLevelByCapacity(cap);
      if (lvl === 6) return STADIUM_3D_CATALOG['arena_coliseu'];
      if (lvl === 5) return STADIUM_3D_CATALOG['arena_moderna'];
      if (lvl === 4) return STADIUM_3D_CATALOG['arena_monumental'];
      if (lvl === 3) return STADIUM_3D_CATALOG['arena_classica'];
      if (lvl === 2) {
        if (slug && KNOWN_ARENAS[slug] === 'arena_classica') {
          return STADIUM_3D_CATALOG['arena_classica'];
        }
        return STADIUM_3D_CATALOG['arena_regional'];
      }
      // Nível 1: ESTRITAMENTE RAIZ (3.000 a 14.999 lugares, ex: 12.000 pessoas)
      return STADIUM_3D_CATALOG['arena_aberta'];
    },

    /**
     * Resolve o modelo 3D ideal para um clube com base na REGRA CRÍTICA INVIOLÁVEL:
     * O volume da capacidade real do estádio SEMPRE define estritamente o nível arquitetônico e o modelo 3D.
     * Capacidades < 15.000 (ex: 5k, 7.8k, 8.5k, 12k, 14k) são ESTRITAMENTE Nível 1 • Raiz (arena_aberta).
     */
    resolveStadiumModel(clubName, contextState = null) {
      const slug = normalizeSlug(clubName);
      const st = contextState || (typeof window !== 'undefined' ? window.state : null);
      
      let cap = 0;

      // 1. Prioridade absoluta: capacidade persistida no estado do clube/save
      if (st) {
        cap = Number(st.infrastructure?.stadium?.capacity || st.stadiumCapacity || st.stadium?.capacity || 0);

        // Se a capacidade ainda não foi explicitada, busca no catálogo de estádios
        if (cap <= 0 && st.club) {
          const info = (typeof window !== 'undefined' && typeof window.getClubStadiumInfo === 'function')
            ? window.getClubStadiumInfo(st.club)
            : null;
          if (info && Number(info.capacity) > 0) {
            cap = Number(info.capacity);
          }
        }

        // Se ainda for 0 mas houver setores comprados, calcula com base no starter (5.000 + 3.500 * setores)
        if (cap <= 0 && st.stadiumRingData) {
          const ringData = st.stadiumRingData;
          const purchasedCount = Array.isArray(ringData.purchasedSectors)
            ? ringData.purchasedSectors.length
            : (ringData.rings
                ? Object.values(ringData.rings).reduce((acc, r) => acc + Object.values(r).filter(Boolean).length, 0)
                : 0);
          if (purchasedCount > 0) {
            cap = 5000 + (purchasedCount * 3500);
          }
        }
      }

      // 2. Se for clube externo consultado por nome
      if (cap <= 0 && clubName) {
        const info = (typeof window !== 'undefined' && typeof window.getClubStadiumInfo === 'function')
          ? window.getClubStadiumInfo(clubName)
          : null;
        if (info && Number(info.capacity) > 0) {
          cap = Number(info.capacity);
        }
      }

      // 3. REGRA CRÍTICA INVIOLÁVEL: Capacidade positiva determina estritamente o modelo e nível
      if (cap > 0) {
        return this.getStadiumModelByCapacity(cap, slug);
      }

      // 4. Heurística por clube histórico cadastrado caso não haja capacidade detectada
      if (KNOWN_ARENAS[slug]) {
        const k = KNOWN_ARENAS[slug];
        return STADIUM_3D_CATALOG[k] || STADIUM_3D_CATALOG['arena_aberta'];
      }

      return STADIUM_3D_CATALOG['arena_aberta'];
    },

    /**
     * Retorna o preset de câmera ideal para focar no setor sendo ampliado
     */
    getSectorCameraOrbit(side) {
      switch (String(side || '').toLowerCase()) {
        case 'leste': return '90deg 68deg 82%';
        case 'oeste': return '-90deg 68deg 82%';
        case 'norte': return '0deg 68deg 88%';
        case 'sul': return '180deg 68deg 88%';
        default: return '45deg 55deg 105%';
      }
    },

    /**
     * Retorna o preset de câmera ideal para destacar a melhoria em tempo real
     */
    getUpgradeCameraOrbit(upgradeKey) {
      switch (String(upgradeKey || '')) {
        case 'screen': return '0deg 75deg 90%';
        case 'vipBoxes': return '-75deg 65deg 80%';
        case 'mosaic': return '180deg 70deg 85%';
        case 'chairs': return '90deg 65deg 78%';
        case 'flares': return '160deg 68deg 90%';
        case 'ledLights': return '45deg 55deg 105%';
        case 'solarPitch': return '35deg 45deg 110%';
        case 'ledRing': return '-45deg 82deg 50%';
        case 'surroundSound': return '0deg 60deg 95%';
        case 'museumTour': return '-90deg 80deg 85%';
        default: return '45deg 55deg 105%';
      }
    },


    /**
     * Renderiza o Card Informativo do Estádio 3D para a aba Estrutura & Estádio e Modais
     */
    renderStadium3DCardHTML(clubName, stateRef) {
      const model = this.resolveStadiumModel(clubName, stateRef);
      const cap = Number(stateRef?.infrastructure?.stadium?.capacity || stateRef?.stadiumCapacity || 25000);
      const cName = clubName || stateRef?.club || (typeof window !== 'undefined' && window.state ? window.state.club : '');
      const stadiumName = (typeof window.clubStadiumName === 'function') 
        ? window.clubStadiumName(cName) 
        : (stateRef?.stadiumName || (cName ? `Estádio do ${cName}` : 'Estádio Oficial'));
      const pct100k = Math.min(100, Math.round((cap / 100000) * 100));

      const tiers = [
        { label: 'Raiz (14k)', key: 'arena_aberta', max: 14999 },
        { label: 'Regional (24k)', key: 'arena_regional', max: 24999 },
        { label: 'Ferradura (40k)', key: 'arena_classica', max: 39999 },
        { label: 'Monumental (60k)', key: 'arena_monumental', max: 59999 },
        { label: 'Arena FIFA (80k)', key: 'arena_moderna', max: 79999 },
        { label: 'Mega Coliseu (100k)', key: 'arena_coliseu', max: 100000 }
      ];

      return `
        <div class="card afm-stadium-3d-card" style="margin-top:16px;background:linear-gradient(180deg,rgba(15,23,42,0.96) 0%,rgba(24,36,54,0.92) 100%);border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:20px;box-shadow:0 10px 28px rgba(0,0,0,0.45)">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:14px;flex-wrap:wrap;gap:8px">
            <div>
              <h3 style="margin:0;font-size:16px;font-weight:900;color:#38bdf8;display:flex;align-items:center;gap:8px">
                🏟️ Modelo 3D Oficial & Arquitetura da Praça Esportiva
              </h3>
              <div class="muted small" style="margin-top:2px">
                Renderização volumétrica oficial e acompanhamento de evolução até 100.000 torcedores.
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge ${model.id === 'arena_coliseu' ? 'purple' : (model.id === 'arena_moderna' ? 'success' : (model.id === 'arena_monumental' || model.id === 'arena_classica' ? 'warning' : 'info'))}" style="font-size:11px;padding:4px 10px;font-weight:800">
                ${model.badge}
              </span>
              <button class="btn btn-sm btn-outline-info" onclick="window.AFMStadium3D.openStadium3DViewerModal('${model.id}', '${clubName}')" style="font-size:11px;padding:4px 10px;font-weight:900;border-radius:6px;cursor:pointer">
                🎮 VER EM 3D (360°)
              </button>
            </div>
          </div>

          <!-- Linha Visual de Evolução das Arquibancadas -->
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px 14px;margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:6px">
              <span style="color:#94a3b8;font-weight:800">📈 JORNADA RUMO A 100.000 LUGARES:</span>
              <b style="color:#38bdf8">${cap.toLocaleString('pt-BR')} / 100.000 lugares (${pct100k}%)</b>
            </div>
            <div style="width:100%;height:8px;background:rgba(255,255,255,0.08);border-radius:999px;overflow:hidden;margin-bottom:10px">
              <div style="width:${pct100k}%;height:100%;background:linear-gradient(90deg,#0284c7,#22c55e,#a855f7);border-radius:999px;transition:width 0.4s ease"></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px">
              ${tiers.map(t => {
                const isCurrent = (model.id === t.key || (t.key === 'arena_aberta' && model.id === 'arena_raiz'));
                const isReached = (cap > t.max);
                return `
                  <div style="font-size:10px;text-align:center;padding:5px 4px;border-radius:6px;font-weight:800;background:${isCurrent ? 'rgba(56,189,248,0.2)' : (isReached ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)')};border:1px solid ${isCurrent ? '#38bdf8' : (isReached ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)')};color:${isCurrent ? '#38bdf8' : (isReached ? '#4ade80' : '#64748b')}">
                    ${t.label} ${isCurrent ? '●' : (isReached ? '✓' : '')}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;align-items:center">
            <div>
              <div style="font-size:18px;font-weight:900;color:#38bdf8;margin-bottom:3px;display:flex;align-items:center;gap:6px">
                <span>🏟️</span> <span>${stadiumName}</span>
              </div>
              <div style="font-size:11px;color:#c084fc;font-weight:800;margin-bottom:10px">
                ${model.name} (${model.capacityRange})
              </div>
              <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;line-height:1.5">
                ${model.description}
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;font-size:11px;background:rgba(0,0,0,0.25);padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.05)">
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Capacidade Arquitetônica:</span>
                  <b style="color:#f8fafc">${cap.toLocaleString('pt-BR')} pessoas (${model.capacityRange})</b>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Upgrade de Arquibancadas:</span>
                  <b style="color:#a855f7">${model.standEvolution}</b>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Estrutura de Cobertura:</span>
                  <b style="color:#38bdf8">${model.coverType}</b>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Sistema de Iluminação:</span>
                  <b style="color:#facc15">${model.lighting}</b>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Acústica da Torcida:</span>
                  <b style="color:#22c55e">${model.soundAcoustic}</b>
                </div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;align-items:center;background:rgba(0,0,0,0.3);padding:16px;border-radius:12px;border:1px dashed rgba(56,189,248,0.25);position:relative">
              <div style="text-align:center">
                <span style="font-size:36px;display:block;margin-bottom:6px">
                  ${model.id === 'arena_coliseu' ? '👑' : (model.id === 'arena_moderna' ? '🏟️' : (model.id === 'arena_monumental' || model.id === 'arena_classica' ? '🏛️' : '⚽'))}
                </span>
                <b style="color:#f8fafc;font-size:15px;display:block;font-weight:900;letter-spacing:0.3px">${stadiumName}</b>
                <div class="muted small" style="margin-top:4px;color:#38bdf8;font-weight:700">${cap.toLocaleString('pt-BR')} torcedores • ${model.name}</div>
              </div>

              <div style="display:flex;gap:8px;width:100%;justify-content:center;margin-top:6px;flex-wrap:wrap">
                <button class="btn btn-sm btn-primary" onclick="window.AFMStadium3D.openStadium3DViewerModal('${model.id}', '${clubName}')" style="font-size:11px;padding:6px 14px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-weight:900;border:none;border-radius:6px;cursor:pointer">
                  🎮 Inspecionar 3D Interativo
                </button>
                <button class="btn btn-sm btn-open-stadium-expansion" data-stadium-action="expansion" onclick="if(typeof window.openStadiumModal==='function'){ window.openStadiumModal('expansion'); } else if(typeof openStadiumModal==='function'){ openStadiumModal('expansion'); }" style="font-size:11px;padding:6px 14px;background:rgba(255,255,255,0.08);color:#fff;border-radius:6px;cursor:pointer">
                  🔍 Setores & Obras
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Abre a Modal Interativa 3D para inspecionar os modelos GLB em tempo real
     * com rotação orbital 360°, zoom e alternância entre todos os estilos de evolução
     */
    openStadium3DViewerModal(initialModelId = null, clubName = '') {
      let modalEl = document.getElementById('afmStadium3DModal');
      if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'afmStadium3DModal';
        document.body.appendChild(modalEl);
      }

      const currentClub = clubName || (typeof window !== 'undefined' && window.state ? window.state.club : 'Clube');
      const userStadiumModel = this.resolveStadiumModel(currentClub, typeof window !== 'undefined' ? window.state : null);
      
      const activeId = initialModelId || userStadiumModel.id || 'arena_classica';
      const model = STADIUM_3D_CATALOG[activeId] || STADIUM_3D_CATALOG['arena_classica'];

      const st = typeof window !== 'undefined' ? window.state : null;
      const stadiumName = (typeof window !== 'undefined' && typeof window.clubStadiumName === 'function')
        ? window.clubStadiumName(currentClub)
        : (st?.stadiumName || (currentClub ? `Estádio do ${currentClub}` : 'Estádio Oficial'));
      const currentCap = Number(st?.infrastructure?.stadium?.capacity || st?.stadiumCapacity || 25000);
      const pctProgress = Math.min(100, Math.round((currentCap / 100000) * 100));

      modalEl.innerHTML = `
        <div class="afm-modal-backdrop" style="position:fixed;inset:0;background:rgba(2,6,23,0.88);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px">
          <div class="afm-modal-card" style="background:#0f172a;border:1px solid rgba(56,189,248,0.4);border-radius:18px;width:min(95vw, 1140px);max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.7)">
            
            <!-- Modal Header (Título limpo com o nome oficial de verdade do estádio) -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(15,23,42,0.9)">
              <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:26px">🏟️</span>
                <div>
                  <h2 style="margin:0;font-size:17px;font-weight:900;color:#f8fafc;display:flex;align-items:center;gap:8px">
                    Visualizador 3D — ${stadiumName} (${currentClub})
                  </h2>
                  <div style="font-size:12px;color:#38bdf8;font-weight:700">
                    Acompanhamento e Evolução Arquitetônica de Arquibancadas • 5.000 a 100.000 lugares
                  </div>
                </div>
              </div>
              <button id="btnCloseStadium3DModal" style="background:rgba(255,255,255,0.08);border:none;color:#f8fafc;width:34px;height:34px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:900;display:flex;align-items:center;justify-content:center">
                ✕
              </button>
            </div>

            <!-- Model Switcher Tabs (Estilos e Progressão de Arquibancadas até 100k) -->
            <div style="display:flex;gap:8px;padding:12px 22px;background:rgba(0,0,0,0.3);border-bottom:1px solid rgba(255,255,255,0.06);overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch">
              ${EVOLUTION_STYLES.map(sid => {
                const m = STADIUM_3D_CATALOG[sid];
                if (!m) return '';
                const isSelected = (m.id === activeId);
                const isUserClubLevel = (userStadiumModel.id === m.id);
                return `
                  <button class="btn btn-sm btn-select-3d-model" data-model-id="${m.id}" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:800;display:flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;${isSelected ? 'background:#0284c7;color:#fff;border:1px solid #38bdf8;box-shadow:0 0 10px rgba(56,189,248,0.4)' : 'background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.1)'}">
                    <span>${m.badge.split(' ')[0]}</span>
                    <span>${m.name}</span>
                    ${isUserClubLevel ? '<span style="background:#22c55e;color:#000;font-size:9px;padding:1px 5px;border-radius:4px;font-weight:900">SEU ESTÁDIO</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Viewport & Info Container -->
            <div style="display:grid;grid-template-columns:1fr minmax(280px, 350px);gap:18px;padding:18px 22px;overflow-y:auto;flex:1">
              
              <!-- Left: 3D Viewport -->
              <div style="display:flex;flex-direction:column;gap:12px">
                <div style="position:relative;width:100%;height:440px;background:#060b13;border-radius:14px;border:1px solid rgba(56,189,248,0.25);overflow:hidden;box-shadow:inset 0 0 40px rgba(0,0,0,0.6)">
                  
                  <!-- Tag de Visualização -->
                  <div style="position:absolute;top:12px;left:12px;z-index:2;background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);font-size:11px;font-weight:800;color:#38bdf8">
                    Orbitar 360° • Clique e arraste para girar
                  </div>

                  <!-- 3D Component (Three.js Low-Poly procedural com fallback model-viewer) -->
                  <div id="stadium3DCanvasArea" style="width:100%;height:100%;position:relative">
                    <canvas id="afmViewerModalLowPolyCanvas" style="width:100%;height:100%;display:block;outline:none"></canvas>
                    
                    <div id="afmViewerFallbackArea" style="display:none;position:absolute;inset:0">
                      <model-viewer 
                        id="afmActiveModelViewer"
                        src="${model.file}" 
                        alt="${model.name}" 
                        auto-rotate 
                        camera-controls 
                        shadow-intensity="1.5" 
                        shadow-softness="0.8"
                        exposure="1.0"
                        rotation-per-second="16deg"
                        camera-orbit="${model.defaultOrbit || '45deg 55deg 105%'}"
                        style="width:100%;height:100%;background:#090d16">
                        
                        <!-- Fallback caso model-viewer esteja carregando ou offline -->
                        <div slot="poster" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#090d16;gap:12px">
                          <img src="${model.preview}" alt="Prévia Estádios" style="max-width:70%;max-height:220px;border-radius:8px;border:1px solid rgba(255,255,255,0.1)">
                          <div style="color:#94a3b8;font-size:12px;text-align:center">
                            🏟️ Carregando malha 3D low-poly (${model.triangles.toLocaleString('pt-BR')} triângulos)...
                          </div>
                        </div>
                      </model-viewer>
                    </div>
                  </div>

                  <!-- Floating Camera Presets -->
                  <div style="position:absolute;bottom:12px;left:12px;right:12px;z-index:2;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
                    <button class="btn btn-sm btn-cam-angle" data-cam="panoramic" data-orbit="45deg 55deg 105%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      🛰️ Panorâmica Geral
                    </button>
                    <button class="btn btn-sm btn-cam-angle" data-cam="tv" data-orbit="0deg 75deg 90%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      📺 Câmera de TV
                    </button>
                    <button class="btn btn-sm btn-cam-angle" data-cam="leste" data-orbit="90deg 82deg 70%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      🥁 Arquibancada
                    </button>
                    <button class="btn btn-sm btn-cam-angle" data-cam="campo" data-orbit="-45deg 85deg 45%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      💺 Beira do Campo
                    </button>
                  </div>
                </div>

                <div style="font-size:11px;color:#64748b;display:flex;align-items:center;justify-content:space-between">
                  <span>💡 Use o botão esquerdo para girar, botão direito para arrastar e a roda do mouse para zoom.</span>
                  <span>Cores e geometria otimizadas para WebGL.</span>
                </div>
              </div>

              <!-- Right: Technical Details & Stand Evolution -->
              <div style="display:flex;flex-direction:column;gap:12px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:16px">
                <div>
                  <span class="badge ${model.id === 'arena_coliseu' ? 'purple' : (model.id === 'arena_moderna' ? 'success' : (model.id === 'arena_monumental' || model.id === 'arena_classica' ? 'warning' : 'info'))}" style="font-size:10px;padding:3px 8px;font-weight:800">
                    ${model.badge}
                  </span>
                  <h3 style="margin:6px 0 0 0;font-size:16px;color:#f8fafc;font-weight:900">
                    ${model.id === userStadiumModel.id ? stadiumName : model.name}
                  </h3>
                  <div style="font-size:12px;color:#38bdf8;font-weight:700;margin-top:2px">
                    ${model.name} (${model.capacityRange})
                  </div>
                  <div style="font-size:12px;color:#94a3b8;margin-top:6px;line-height:1.4">
                    ${model.description}
                  </div>
                </div>

                <!-- Box da Jornada rumo aos 100k -->
                <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);padding:10px 12px;border-radius:10px">
                  <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:4px">
                    <span style="color:#94a3b8;font-weight:800">🏟️ ${stadiumName}:</span>
                    <b style="color:#38bdf8">${currentCap.toLocaleString('pt-BR')} lugares</b>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#cbd5e1;margin-bottom:6px">
                    <span>Meta: 100.000 lugares</span>
                    <b style="color:#22c55e">${pctProgress}% concluído</b>
                  </div>
                  <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:999px;overflow:hidden">
                    <div style="width:${pctProgress}%;height:100%;background:linear-gradient(90deg,#0284c7,#22c55e,#a855f7);border-radius:999px"></div>
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:7px;font-size:11px">
                  <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">
                    <span class="muted" style="display:block;font-size:10px">CAPACIDADE DO ESTILO</span>
                    <b style="color:#f8fafc;font-size:12px">${model.capacityRange}</b>
                  </div>
                  <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">
                    <span class="muted" style="display:block;font-size:10px">ARQUITETURA DE ARQUIBANCADA</span>
                    <b style="color:#c084fc;font-size:12px">${model.standEvolution}</b>
                  </div>
                  <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">
                    <span class="muted" style="display:block;font-size:10px">COBERTURA & MARQUISE</span>
                    <b style="color:#38bdf8;font-size:12px">${model.coverType}</b>
                  </div>
                  <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">
                    <span class="muted" style="display:block;font-size:10px">ILUMINAÇÃO DE JOGO</span>
                    <b style="color:#facc15;font-size:12px">${model.lighting}</b>
                  </div>
                  <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">
                    <span class="muted" style="display:block;font-size:10px">ACÚSTICA DA TORCIDA</span>
                    <b style="color:#22c55e;font-size:12px">${model.soundAcoustic}</b>
                  </div>
                </div>

                <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px">
                  <button class="btn btn-primary btn-open-stadium-expansion" data-stadium-action="expansion" onclick="if(typeof window.openStadiumModal==='function'){ const m=document.getElementById('afmStadium3DModal'); if(m) m.style.display='none'; window.openStadiumModal('expansion'); } else if(typeof openStadiumModal==='function'){ openStadiumModal('expansion'); }" style="width:100%;padding:10px;font-weight:900;font-size:12px;border-radius:8px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;cursor:pointer">
                    🏗️ Obras de Arquibancada (Ampliar)
                  </button>
                  <button class="btn btn-open-stadium-summary" data-stadium-action="summary" onclick="if(typeof window.openStadiumModal==='function'){ const m=document.getElementById('afmStadium3DModal'); if(m) m.style.display='none'; window.openStadiumModal('summary'); } else if(typeof openStadiumModal==='function'){ openStadiumModal('summary'); }" style="width:100%;padding:8px;font-weight:800;font-size:11px;border-radius:8px;background:rgba(255,255,255,0.08);color:#f8fafc;border:none;cursor:pointer">
                    🏟️ Gerenciar Obras & Naming Rights
                  </button>
                  <button class="btn btn-secondary" onclick="document.getElementById('afmStadium3DModal').style.display='none';" style="width:100%;padding:8px;font-weight:800;font-size:11px;border-radius:8px;background:rgba(255,255,255,0.05);color:#94a3b8;border:none;cursor:pointer">
                    Fechar Visualizador
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;

      modalEl.style.display = 'block';

      // Inicialização da Maquete Low-Poly 3D no visualizador (Three.js WebGL)
      const vCanvas = modalEl.querySelector('#afmViewerModalLowPolyCanvas');
      if (vCanvas && window.THREE && window.AFMStadiumLowPoly) {
        try {
          window.AFMStadiumLowPoly.init(vCanvas);
          const capMap = {
            'arena_aberta': 7800,
            'arena_regional': 18800,
            'arena_classica': 30640,
            'arena_monumental': 49000,
            'arena_moderna': 72160,
            'arena_coliseu': 100000,
            'gradas_modulares': 18800
          };
          const isUserStadium = (activeId === userStadiumModel.id);
          const previewCap = isUserStadium ? currentCap : (capMap[activeId] || currentCap);
          window.AFMStadiumLowPoly.update(st, {
            isArena: !isUserStadium,
            selectedArenaCapacity: previewCap
          });
        } catch (err) {
          console.warn('[AFMStadium3D] Fallback model-viewer:', err);
          const fb = modalEl.querySelector('#afmViewerFallbackArea');
          if (fb) fb.style.display = 'block';
        }
      } else {
        const fb = modalEl.querySelector('#afmViewerFallbackArea');
        if (fb) fb.style.display = 'block';
      }

      // Event Listeners
      const btnClose = modalEl.querySelector('#btnCloseStadium3DModal');
      if (btnClose) {
        btnClose.onclick = () => { 
          if (window.AFMStadiumLowPoly) window.AFMStadiumLowPoly.dispose();
          modalEl.style.display = 'none'; 
        };
      }

      modalEl.querySelectorAll('.btn-open-stadium-expansion').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          if (window.AFMStadiumLowPoly) window.AFMStadiumLowPoly.dispose();
          modalEl.style.display = 'none';
          if (typeof window.openStadiumModal === 'function') {
            window.openStadiumModal('expansion');
          }
        };
      });

      modalEl.querySelectorAll('.btn-open-stadium-summary').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          if (window.AFMStadiumLowPoly) window.AFMStadiumLowPoly.dispose();
          modalEl.style.display = 'none';
          if (typeof window.openStadiumModal === 'function') {
            window.openStadiumModal('summary');
          }
        };
      });

      modalEl.querySelectorAll('.btn-select-3d-model').forEach(btn => {
        btn.onclick = () => {
          const nextModelId = btn.getAttribute('data-model-id');
          this.openStadium3DViewerModal(nextModelId, currentClub);
        };
      });

      modalEl.querySelectorAll('.btn-cam-angle').forEach(btn => {
        btn.onclick = () => {
          modalEl.querySelectorAll('.btn-cam-angle').forEach(b => {
            b.style.background = 'rgba(15,23,42,0.85)';
            b.style.borderColor = 'rgba(255,255,255,0.15)';
            b.style.color = '#fff';
            b.style.boxShadow = 'none';
          });
          btn.style.background = '#0284c7';
          btn.style.borderColor = '#38bdf8';
          btn.style.color = '#fff';
          btn.style.boxShadow = '0 0 10px rgba(56,189,248,0.5)';

          const cam = btn.getAttribute('data-cam');
          if (cam && window.AFMStadiumLowPoly) {
            window.AFMStadiumLowPoly.setCameraPreset(cam);
          }
          const orbit = btn.getAttribute('data-orbit');
          const mv = modalEl.querySelector('#afmActiveModelViewer');
          if (mv && orbit) {
            mv.cameraOrbit = orbit;
          }
        };
      });
    }
  };

  // Fallback global delegado para garantir disparo infalível dos botões de obra do estádio
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function' && !window.__afmStadiumTabDelegated) {
    window.__afmStadiumTabDelegated = true;
    document.addEventListener('click', function(e) {
      const btn = e.target && e.target.closest ? e.target.closest('[data-stadium-action]') : null;
      if (btn) {
        e.preventDefault();
        const action = btn.getAttribute('data-stadium-action') || 'expansion';
        const m = document.getElementById('afmStadium3DModal');
        if (m) m.style.display = 'none';
        if (typeof window.openStadiumModal === 'function') {
          window.openStadiumModal(action);
        }
      }
    });
  }

  window.AFMStadium3D = AFMStadium3D;
  if (typeof window !== 'undefined') {
    window.getStadiumLevelByCapacity = AFMStadium3D.getStadiumLevelByCapacity.bind(AFMStadium3D);
    window.getStadiumModelByCapacity = AFMStadium3D.getStadiumModelByCapacity.bind(AFMStadium3D);
  }
})(typeof window !== 'undefined' ? window : globalThis);
