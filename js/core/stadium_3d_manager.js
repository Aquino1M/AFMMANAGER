/**
 * ==============================================================================
 * AFM MANAGER 2027 — GERENCIADOR OFICIAL DE ESTÁDIOS 3D
 * Arquivo: js/core/stadium_3d_manager.js
 * 
 * Gerencia a catalogação, seleção por nível de infraestrutura/capacidade,
 * visualizador 3D interativo (WebGL / model-viewer) e parametrização visual
 * dos modelos 3D do pack oficial BRFC27:
 * - arena_aberta.glb
 * - arena_classica.glb
 * - arena_moderna.glb
 * - gradas_modulares_sem_campo.glb
 * ==============================================================================
 */

(function (window) {
  'use strict';

  const STADIUM_3D_CATALOG = {
    'arena_aberta': {
      id: 'arena_aberta',
      name: 'Estádio Aberto Tradicional',
      badge: '🏟️ Aberto / Raiz',
      file: 'assets/stadiums/arena_aberta.glb',
      fallbackFile: 'assets/stadios/arena_aberta.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Estádio de raiz com arquibancadas abertas e torres de iluminação nos quatro cantos, ideal para clubes de divisões de acesso e centros regionais.',
      capacityRange: '3.000 a 14.999 lugares',
      stLevel: 1,
      minCapacity: 0,
      maxCapacity: 14999,
      meshes: 16,
      triangles: 9504,
      coverType: 'Sem cobertura (Setores abertos ao céu)',
      lighting: '4 Torres de Refletores Halógenos nos Cantos',
      soundAcoustic: 'Som aberto com dispersão natural',
      themeColor: '#38bdf8'
    },
    'arena_classica': {
      id: 'arena_classica',
      name: 'Estádio Clássico Brasileiro',
      badge: '🏛️ Ferradura Clássica',
      file: 'assets/stadiums/arena_classica.glb',
      fallbackFile: 'assets/stadios/arena_classica.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Arquitetura clássica brasileira em ferradura, com cobertura lateral metálica, cabines de imprensa suspensas e cabeceiras populares.',
      capacityRange: '15.000 a 39.999 lugares',
      stLevel: 2,
      minCapacity: 15000,
      maxCapacity: 39999,
      meshes: 17,
      triangles: 12912,
      coverType: 'Cobertura Lateral Metálica sobre o setor social',
      lighting: 'Refletores em Marquises e Estrutura Tubular',
      soundAcoustic: 'Pressão sonora média com caldeirão lateral',
      themeColor: '#f59e0b'
    },
    'arena_moderna': {
      id: 'arena_moderna',
      name: 'Arena Multiuso Padrão FIFA',
      badge: '⭐ Arena Padrão FIFA',
      file: 'assets/stadiums/arena_moderna.glb',
      fallbackFile: 'assets/stadios/arena_moderna.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Arena monumental fechada em quatro lados, cobertura em balanço (cantilever), anel perimetral de LED, camarotes executivos e telão central.',
      capacityRange: '40.000 a 85.000+ lugares',
      stLevel: 3,
      minCapacity: 40000,
      maxCapacity: 120000,
      meshes: 17,
      triangles: 14136,
      coverType: 'Cobertura Cantilever 100% dos 4 Setores',
      lighting: 'Holofotes LED Volumétricos de Transmissão 4K',
      soundAcoustic: 'Caldeirão acústico total com reverberação amplificada',
      themeColor: '#22c55e'
    },
    'gradas_modulares': {
      id: 'gradas_modulares',
      name: 'Arquibancadas Modulares de Expansão',
      badge: '🏗️ Módulos de Obra',
      file: 'assets/stadiums/gradas_modulares_sem_campo.glb',
      fallbackFile: 'assets/stadios/gradas_modulares_sem_campo.glb',
      preview: 'assets/stadiums/PREVIA_ESTADIOS.png',
      description: 'Estruturas modulares pré-fabricadas de arquibancada para acoplamento direto nas ampliações de setores Norte, Sul, Leste ou Oeste.',
      capacityRange: 'Módulos customizáveis para obras',
      stLevel: 0,
      minCapacity: 0,
      maxCapacity: 0,
      meshes: 11,
      triangles: 13092,
      coverType: 'Módulos com ou sem cobertura',
      lighting: 'Focos direcionais modulares',
      soundAcoustic: 'Ajustável por setor',
      themeColor: '#a855f7'
    }
  };

  // Clubes com arenas modernas nativas conhecidas
  const KNOWN_ARENAS = {
    'flamengo': 'arena_moderna',
    'fluminense': 'arena_moderna',
    'palmeiras': 'arena_moderna',
    'corinthians': 'arena_moderna',
    'sao_paulo': 'arena_moderna',
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
    'river_plate': 'arena_moderna',
    'boca_juniors': 'arena_moderna',
    'racing_club': 'arena_moderna',

    // Clubes com estádios clássicos consagrados
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

    /**
     * Resolve o modelo 3D ideal para um clube com base em:
     * 1. Capacidade real do estádio
     * 2. Nível de infraestrutura de estádio no save
     * 3. Tradição histórica conhecida do clube
     */
    resolveStadiumModel(clubName, contextState = null) {
      const slug = normalizeSlug(clubName);
      const st = contextState || (typeof window !== 'undefined' ? window.state : null);
      
      let cap = 0;
      let infraLevel = 1;

      if (st) {
        cap = Number(st.infrastructure?.stadium?.capacity || st.stadiumCapacity || 0);
        infraLevel = Number(st.infrastructure?.stadium?.level || 1);
      }

      // Se for o clube do usuário ou tiver capacidade explicitada
      if (cap > 0) {
        if (cap >= 40000 || infraLevel >= 4) {
          return STADIUM_3D_CATALOG['arena_moderna'];
        }
        if (cap >= 15000 || infraLevel >= 2) {
          return STADIUM_3D_CATALOG['arena_classica'];
        }
        return STADIUM_3D_CATALOG['arena_aberta'];
      }

      // Heurística por clube histórico
      if (KNOWN_ARENAS[slug]) {
        return STADIUM_3D_CATALOG[KNOWN_ARENAS[slug]];
      }

      return STADIUM_3D_CATALOG['arena_aberta'];
    },

    /**
     * Renderiza o Card Informativo do Estádio 3D para a aba Estrutura & Estádio e Modais
     */
    renderStadium3DCardHTML(clubName, stateRef) {
      const model = this.resolveStadiumModel(clubName, stateRef);
      const cap = stateRef?.infrastructure?.stadium?.capacity || stateRef?.stadiumCapacity || 25000;
      const stadiumName = (typeof window.clubStadiumName === 'function') 
        ? window.clubStadiumName() 
        : (stateRef?.stadiumName || 'Estádio Oficial');

      return `
        <div class="card afm-stadium-3d-card" style="margin-top:16px;background:linear-gradient(180deg,rgba(15,23,42,0.96) 0%,rgba(24,36,54,0.92) 100%);border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:20px;box-shadow:0 10px 28px rgba(0,0,0,0.45)">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:16px;flex-wrap:wrap;gap:8px">
            <div>
              <h3 style="margin:0;font-size:16px;font-weight:900;color:#38bdf8;display:flex;align-items:center;gap:8px">
                🏟️ Modelo 3D Oficial da Praça Esportiva
              </h3>
              <div class="muted small" style="margin-top:2px">
                Renderização volumétrica oficial para transmissões ao vivo de partidas (Pack BRFC27).
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge ${model.id === 'arena_moderna' ? 'success' : (model.id === 'arena_classica' ? 'warning' : 'info')}" style="font-size:11px;padding:4px 10px;font-weight:800">
                ${model.badge}
              </span>
              <button class="btn btn-sm btn-outline-info" onclick="window.AFMStadium3D.openStadium3DViewerModal('${model.id}', '${clubName}')" style="font-size:11px;padding:4px 10px;font-weight:900;border-radius:6px;cursor:pointer">
                🎮 VER EM 3D (360°)
              </button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;align-items:center">
            <div>
              <div style="font-size:15px;font-weight:800;color:#f8fafc;margin-bottom:6px">
                ${stadiumName}
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
                  <span class="muted">Estrutura de Cobertura:</span>
                  <b style="color:#38bdf8">${model.coverType}</b>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Sistema de Iluminação:</span>
                  <b style="color:#facc15">${model.lighting}</b>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Geometria 3D Low-Poly:</span>
                  <b style="color:#a855f7">${model.triangles.toLocaleString('pt-BR')} triângulos • GLB Leve</b>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span class="muted">Acústica da Torcida:</span>
                  <b style="color:#22c55e">${model.soundAcoustic}</b>
                </div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;align-items:center;background:rgba(0,0,0,0.3);padding:16px;border-radius:12px;border:1px dashed rgba(56,189,248,0.25);position:relative">
              <div style="text-align:center">
                <span style="font-size:36px;display:block;margin-bottom:4px">
                  ${model.id === 'arena_moderna' ? '🏟️' : (model.id === 'arena_classica' ? '🏛️' : '⚽')}
                </span>
                <b style="color:#f8fafc;font-size:13px">${model.name}</b>
                <div class="muted small" style="margin-top:4px">Arquivo GLB: <code>${model.file}</code></div>
              </div>

              <div style="display:flex;gap:8px;width:100%;justify-content:center;margin-top:6px;flex-wrap:wrap">
                <button class="btn btn-sm btn-primary" onclick="window.AFMStadium3D.openStadium3DViewerModal('${model.id}', '${clubName}')" style="font-size:11px;padding:6px 14px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-weight:900;border:none;border-radius:6px;cursor:pointer">
                  🎮 Inspecionar 3D Interativo
                </button>
                <button class="btn btn-sm" onclick="if(typeof window.openStadiumModal==='function') window.openStadiumModal('arena');" style="font-size:11px;padding:6px 14px;background:rgba(255,255,255,0.08);color:#fff;border-radius:6px;cursor:pointer">
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
     * com rotação orbital 360°, zoom e alternância entre modelos
     */
    openStadium3DViewerModal(initialModelId = 'arena_classica', clubName = '') {
      let modalEl = document.getElementById('afmStadium3DModal');
      if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'afmStadium3DModal';
        document.body.appendChild(modalEl);
      }

      const activeId = initialModelId || 'arena_classica';
      const model = STADIUM_3D_CATALOG[activeId] || STADIUM_3D_CATALOG['arena_classica'];
      const currentClub = clubName || (typeof window !== 'undefined' && window.state ? window.state.club : 'Clube');

      modalEl.innerHTML = `
        <div class="afm-modal-backdrop" style="position:fixed;inset:0;background:rgba(2,6,23,0.88);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px">
          <div class="afm-modal-card" style="background:#0f172a;border:1px solid rgba(56,189,248,0.4);border-radius:18px;width:min(95vw, 1100px);max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.7)">
            
            <!-- Modal Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(15,23,42,0.9)">
              <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:26px">🏟️</span>
                <div>
                  <h2 style="margin:0;font-size:17px;font-weight:900;color:#f8fafc;display:flex;align-items:center;gap:8px">
                    Visualizador Oficial de Estádios 3D — ${currentClub}
                  </h2>
                  <div style="font-size:12px;color:#94a3b8">
                    Pack Oficial BRFC27 • Modelos Low-Poly Otimizados para WebGL / Transmissão de Partidas
                  </div>
                </div>
              </div>
              <button id="btnCloseStadium3DModal" style="background:rgba(255,255,255,0.08);border:none;color:#f8fafc;width:34px;height:34px;border-radius:8px;cursor:pointer;font-size:16px;font-weight:900;display:flex;align-items:center;justify-content:center">
                ✕
              </button>
            </div>

            <!-- Model Switcher Tabs -->
            <div style="display:flex;gap:8px;padding:12px 22px;background:rgba(0,0,0,0.3);border-bottom:1px solid rgba(255,255,255,0.06);overflow-x:auto">
              ${Object.values(STADIUM_3D_CATALOG).map(m => `
                <button class="btn btn-sm btn-select-3d-model ${m.id === activeId ? 'btn-primary' : 'btn-secondary'}" data-model-id="${m.id}" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:800;display:flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;${m.id === activeId ? 'background:#0284c7;color:#fff;border:1px solid #38bdf8' : 'background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.1)'}">
                  <span>${m.badge}</span>
                  <span>${m.name}</span>
                </button>
              `).join('')}
            </div>

            <!-- Viewport & Info Container -->
            <div style="display:grid;grid-template-columns:1fr minmax(280px, 340px);gap:18px;padding:18px 22px;overflow-y:auto;flex:1">
              
              <!-- Left: 3D Viewport -->
              <div style="display:flex;flex-direction:column;gap:12px">
                <div style="position:relative;width:100%;height:440px;background:#060b13;border-radius:14px;border:1px solid rgba(56,189,248,0.25);overflow:hidden;box-shadow:inset 0 0 40px rgba(0,0,0,0.6)">
                  
                  <!-- Tag de Visualização -->
                  <div style="position:absolute;top:12px;left:12px;z-index:2;background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);font-size:11px;font-weight:800;color:#38bdf8">
                    Orbitar 360° • Clique e arraste para girar
                  </div>

                  <!-- 3D Component (model-viewer with fallback) -->
                  <div id="stadium3DCanvasArea" style="width:100%;height:100%">
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
                      camera-orbit="45deg 55deg 105%"
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

                  <!-- Floating Camera Presets -->
                  <div style="position:absolute;bottom:12px;left:12px;right:12px;z-index:2;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
                    <button class="btn btn-sm btn-cam-angle" data-orbit="45deg 55deg 105%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      🛰️ Panorâmica Geral
                    </button>
                    <button class="btn btn-sm btn-cam-angle" data-orbit="0deg 75deg 90%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      📺 Câmera de TV
                    </button>
                    <button class="btn btn-sm btn-cam-angle" data-orbit="90deg 82deg 70%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      🥁 Arquibancada
                    </button>
                    <button class="btn btn-sm btn-cam-angle" data-orbit="-45deg 85deg 45%" style="background:rgba(15,23,42,0.85);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer">
                      💺 Beira do Campo
                    </button>
                  </div>
                </div>

                <div style="font-size:11px;color:#64748b;display:flex;align-items:center;justify-content:space-between">
                  <span>💡 Use o botão esquerdo para girar, botão direito para arrastar e a roda do mouse para zoom.</span>
                  <span>Cores nativas incorporadas no GLB (sem texturas pesadas).</span>
                </div>
              </div>

              <!-- Right: Technical Details & Stats -->
              <div style="display:flex;flex-direction:column;gap:14px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:16px">
                <div>
                  <span class="badge ${model.id === 'arena_moderna' ? 'success' : (model.id === 'arena_classica' ? 'warning' : 'info')}" style="font-size:10px;padding:3px 8px;font-weight:800">
                    ${model.badge}
                  </span>
                  <h3 style="margin:6px 0 0 0;font-size:16px;color:#f8fafc;font-weight:900">
                    ${model.name}
                  </h3>
                  <div style="font-size:12px;color:#94a3b8;margin-top:4px;line-height:1.4">
                    ${model.description}
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:8px;font-size:11px">
                  <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">
                    <span class="muted" style="display:block;font-size:10px">CAPACIDADE ARQUITETÔNICA</span>
                    <b style="color:#f8fafc;font-size:12px">${model.capacityRange}</b>
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
                  <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">
                    <span class="muted" style="display:block;font-size:10px">ESTRUTURA POLIGONAL</span>
                    <b style="color:#c084fc;font-size:12px">${model.triangles.toLocaleString('pt-BR')} triângulos • ${model.meshes} malhas</b>
                  </div>
                </div>

                <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px">
                  <button class="btn btn-primary" onclick="if(typeof window.openStadiumModal==='function'){ document.getElementById('afmStadium3DModal').style.display='none'; window.openStadiumModal('summary'); }" style="width:100%;padding:10px;font-weight:900;font-size:12px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#0284c7);color:#fff;border:none;cursor:pointer">
                    🏟️ Gerenciar Obras & Naming Rights
                  </button>
                  <button class="btn btn-secondary" onclick="document.getElementById('afmStadium3DModal').style.display='none';" style="width:100%;padding:8px;font-weight:800;font-size:11px;border-radius:8px;background:rgba(255,255,255,0.08);color:#94a3b8;border:none;cursor:pointer">
                    Fechar Visualizador
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;

      modalEl.style.display = 'block';

      // Event Listeners
      const btnClose = modalEl.querySelector('#btnCloseStadium3DModal');
      if (btnClose) {
        btnClose.onclick = () => { modalEl.style.display = 'none'; };
      }

      modalEl.querySelectorAll('.btn-select-3d-model').forEach(btn => {
        btn.onclick = () => {
          const nextModelId = btn.getAttribute('data-model-id');
          this.openStadium3DViewerModal(nextModelId, currentClub);
        };
      });

      modalEl.querySelectorAll('.btn-cam-angle').forEach(btn => {
        btn.onclick = () => {
          const orbit = btn.getAttribute('data-orbit');
          const mv = modalEl.querySelector('#afmActiveModelViewer');
          if (mv && orbit) {
            mv.cameraOrbit = orbit;
          }
        };
      });
    }
  };

  window.AFMStadium3D = AFMStadium3D;
})(typeof window !== 'undefined' ? window : globalThis);
