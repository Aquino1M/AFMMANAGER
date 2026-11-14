/**
 * AFM MANAGER 2026 / 2027 — MODO CARREIRA JOGADOR (BE A PRO)
 * Interface do Fluxo de Criação do Atleta (Wizard Multietapas com Preview 3D / SVG Dinâmico em Tempo Real)
 */

(function(window){
  'use strict';

  function esc(str){
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Estado temporário da criação do jogador
  let wizardState = {
    step: 1, // 1: Quem é Você, 2: Aparência, 3: Corpo e Chuteira, 4: Posição, 5: Pontos, 6: Peneira
    name: 'Carlos Henrique',
    nickname: 'Juninho',
    nationality: 'Brasil',
    shirtNumber: 10,
    stateUf: 'DF',
    city: 'Brasília',
    clubName: 'Brasília',
    peneiraTier: 'basica', // 'basica' | 'media' | 'elite'
    tryoutResult: null, // Resultado do Jogo-Treino
    age: 15,
    cameraView: 'front', // 'front' | 'back'
    appearance: {
      faceId: 'young_01',
      skinTone: '#c68642',
      hairColor: '#111827',
      hairStyle: 'Curto',
      eyeColor: '#2c1810',
      mouthStyle: 'sorriso',
      facePhoto: 'img/player_avatars/young_01.webp',
      customFacePhoto: null,
      starterBoot: 'boot_black_classic',
      sockStyle: 'Meião alto'
    },
    height: 1.78,
    bodyBuild: 'Médio',
    preferredFoot: 'Direito',
    position: 'ATA',
    archetype: 'finalizador',
    pointsAvailable: 6,
    pointsDistributed: {
      vel: 1,
      chu: 2,
      pas: 1,
      dri: 1,
      def: 0,
      fis: 1
    }
  };

  // Galeria de Rostos Pré-configurados de Atletas Jovens (15-18 anos)
  const PRESET_FACES = [
    {
      id: 'young_01',
      name: 'Joia 1 (Equilibrado)',
      photo: 'img/player_avatars/young_01.webp',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Curto',
      skinTone: '#c68642',
      eyeColor: '#2c1810',
      mouthStyle: 'sorriso'
    },
    {
      id: 'young_02',
      name: 'Joia 2 (Velocista)',
      photo: 'img/player_avatars/young_02.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Raspado',
      skinTone: '#8d5524',
      eyeColor: '#111827',
      mouthStyle: 'focado'
    },
    {
      id: 'young_03',
      name: 'Joia 3 (Finalizador)',
      photo: 'img/player_avatars/young_03.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Black power',
      skinTone: '#593214',
      eyeColor: '#111827',
      mouthStyle: 'determinado'
    },
    {
      id: 'young_04',
      name: 'Joia 4 (Maestro)',
      photo: 'img/player_avatars/young_04.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#2e1c0c',
      hairStyle: 'Topete',
      skinTone: '#f8d9b6',
      eyeColor: '#6d4c41',
      mouthStyle: 'confiante'
    },
    {
      id: 'young_05',
      name: 'Joia 5 (Xerife)',
      photo: 'img/player_avatars/young_05.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Curto',
      skinTone: '#c68642',
      eyeColor: '#2c1810',
      mouthStyle: 'focado'
    },
    {
      id: 'young_06',
      name: 'Joia 6 (Raça)',
      photo: 'img/player_avatars/young_06.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Tranças',
      skinTone: '#8d5524',
      eyeColor: '#111827',
      mouthStyle: 'determinado'
    },
    {
      id: 'young_07',
      name: 'Joia 7 (Driblador)',
      photo: 'img/player_avatars/young_07.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Moicano',
      skinTone: '#c68642',
      eyeColor: '#2c1810',
      mouthStyle: 'confiante'
    },
    {
      id: 'young_08',
      name: 'Joia 8 (Artilheiro)',
      photo: 'img/player_avatars/young_08.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Fade',
      skinTone: '#e0ac69',
      eyeColor: '#2c1810',
      mouthStyle: 'sorriso'
    },
    {
      id: 'young_09',
      name: 'Joia 9 (Promessa)',
      photo: 'img/player_avatars/young_09.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Topete',
      skinTone: '#c68642',
      eyeColor: '#6d4c41',
      mouthStyle: 'sorriso'
    },
    {
      id: 'young_10',
      name: 'Joia 10 (Goleador)',
      photo: 'img/player_avatars/young_10.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Raspado',
      skinTone: '#593214',
      eyeColor: '#111827',
      mouthStyle: 'determinado'
    },
    {
      id: 'young_11',
      name: 'Joia 11 (Aspirante)',
      photo: 'img/player_avatars/young_11.webp',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Curto',
      skinTone: '#e0ac69',
      eyeColor: '#2c1810',
      mouthStyle: 'focado'
    },
    {
      id: 'young_12',
      name: 'Joia 12 (Camisa 10)',
      photo: 'img/player_avatars/young_12.jpg',
      fallback: 'img/player_avatars/young_01.webp',
      hairColor: '#111827',
      hairStyle: 'Franja',
      skinTone: '#8d5524',
      eyeColor: '#2c1810',
      mouthStyle: 'gol'
    }
  ];

  // Cores dos Olhos (Íris realista com reflexo)
  const EYE_COLORS = [
    { id: 'preto', name: 'Preto', color: '#111827' },
    { id: 'castanho_escuro', name: 'Castanho Escuro', color: '#2c1810' },
    { id: 'castanho_claro', name: 'Castanho Claro', color: '#6d4c41' },
    { id: 'ambar', name: 'Âmbar / Mel', color: '#b45309' },
    { id: 'verde', name: 'Verde', color: '#15803d' },
    { id: 'azul', name: 'Azul', color: '#1d4ed8' }
  ];

  // Expressões e Estilos da Boca
  const MOUTH_STYLES = [
    { id: 'sorriso', name: 'Sorridente', icon: '😊', desc: 'Confiante e carismático' },
    { id: 'focado', name: 'Focado / Sério', icon: '😐', desc: 'Concentração total' },
    { id: 'confiante', name: 'Malandro / Canto', icon: '😏', desc: 'Malandragem boleira' },
    { id: 'determinado', name: 'Determinado / Raça', icon: '😤', desc: 'Dentes cerrados' },
    { id: 'gol', name: 'Gritando Gol', icon: '😮', desc: 'Comemoração vibrante' }
  ];

  // Paletas de Cores
  const SKIN_TONES = ['#f8d9b6', '#e0ac69', '#c68642', '#8d5524', '#593214', '#38200f'];
  const HAIR_COLORS = ['#111827', '#2e1c0c', '#5a3825', '#854d0e', '#ca8a04', '#e2e8f0'];

  function getEngine(){
    return window.AFM_PlayerEngine || window.AFM_PlayerCareerEngine || {
      BRAZILIAN_REGIONS_DATA: {},
      ARCHETYPES: {},
      PENEIRA_TIERS: {},
      STARTER_BOOTS: [],
      calculatePlayerOverall: () => 35,
      calculateBodyModifiers: () => ({ vel:0, chu:0, pas:0, dri:0, def:0, fis:0, texts:[] }),
      simulateTryoutMatch: () => ({ approved: true, scoutRating: 7.5, approvalPercent: 90, events: [] })
    };
  }

  function getAvailableCities(uf){
    const eng = getEngine();
    const region = eng.BRAZILIAN_REGIONS_DATA[uf] || eng.BRAZILIAN_REGIONS_DATA['DF'] || eng.BRAZILIAN_REGIONS_DATA['GO'];
    return region?.cities || [];
  }

  function getCurrentOverall(){
    const eng = getEngine();
    const arch = eng.ARCHETYPES[wizardState.archetype] || eng.ARCHETYPES['finalizador'] || { attrs: { vel:35, chu:35, pas:35, dri:35, def:35, fis:35 } };
    const bodyMods = eng.calculateBodyModifiers(wizardState.height, wizardState.bodyBuild);
    const dist = wizardState.pointsDistributed;

    const attrs = {
      vel: (arch.attrs.vel || 35) + (bodyMods.vel || 0) + (dist.vel || 0),
      chu: (arch.attrs.chu || 35) + (bodyMods.chu || 0) + (dist.chu || 0),
      pas: (arch.attrs.pas || 35) + (bodyMods.pas || 0) + (dist.pas || 0),
      dri: (arch.attrs.dri || 35) + (bodyMods.dri || 0) + (dist.dri || 0),
      def: (arch.attrs.def || 35) + (bodyMods.def || 0) + (dist.def || 0),
      fis: (arch.attrs.fis || 35) + (bodyMods.fis || 0) + (dist.fis || 0)
    };

    return eng.calculatePlayerOverall(attrs, wizardState.position);
  }

  /**
   * Renderiza a Tela Principal de Criação de Jogador
   */
  function renderCreatePlayerScreen(container, activeUser){
    if(!container) container = document.querySelector('#app');
    if(!container) return;

    const currentOvr = getCurrentOverall();
    const nicknameOrName = wizardState.nickname || wizardState.name || 'Seu Jogador';

    container.innerHTML = `
      <div class="afm-player-creator-wrapper" style="min-height:100vh;background:#090d16;color:#fff;font-family:'Segoe UI',system-ui,sans-serif;padding:16px 24px;box-sizing:border-box">
        
        <!-- HEADER SUPERIOR -->
        <header style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px;margin-bottom:18px">
          <div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="pill" style="background:#7c3aed;color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:4px;letter-spacing:0.5px">MODO CARREIRA JOGADOR</span>
              <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase">CRIAR MEU ATLETA</h1>
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px">
              Aos 15 anos, sem clube e Overall 35. Daqui para a frente é treino diário, jogo-treino e peneira.
            </div>
          </div>
          <button type="button" id="btnCancelPlayerCreation" class="btn" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;cursor:pointer">
            ✕ Sair para o Menu
          </button>
        </header>

        <!-- STEPPER BAR (ETAPAS 1 A 6) -->
        <div class="afm-creator-stepper" style="display:flex;gap:12px;margin-bottom:24px;overflow-x:auto;padding-bottom:8px">
          ${renderStepperPills()}
        </div>

        <!-- GRID PRINCIPAL: COLUNA ESQUERDA (PREVIEW 3D / DINÂMICO) + COLUNA DIREITA (CONTEÚDO DO PASSO) -->
        <div style="display:grid;grid-template-columns:340px 1fr;gap:24px;align-items:start">
          
          <!-- COLUNA ESQUERDA: AVATAR DINÂMICO 3D / SVG EM TEMPO REAL -->
          <div class="afm-creator-preview-card" style="background:#0f172a;border:1px solid rgba(168,85,247,0.3);border-radius:18px;padding:18px;display:flex;flex-direction:column;align-items:center;position:relative;box-shadow:0 12px 36px rgba(0,0,0,0.6)">
            
            <!-- OVERALL BADGE & TOGGLE FRENTE/COSTAS -->
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:12px">
              <div style="background:rgba(0,0,0,0.6);border:1px solid #10b981;border-radius:10px;padding:6px 12px;display:flex;flex-direction:column">
                <span id="previewOvrNumber" style="font-size:22px;font-weight:900;color:#10b981;line-height:1">${currentOvr}</span>
                <span id="previewPosLabel" style="font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:0.5px">${wizardState.position} · OVERALL INICIAL</span>
              </div>
              <div style="display:flex;gap:4px;background:#1e293b;padding:3px;border-radius:8px">
                <button type="button" id="btnCamFront" class="btn-cam ${wizardState.cameraView==='front'?'active':''}" style="font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;border:none;cursor:pointer;background:${wizardState.cameraView==='front'?'#7c3aed':'transparent'};color:#fff">Frente</button>
                <button type="button" id="btnCamBack" class="btn-cam ${wizardState.cameraView==='back'?'active':''}" style="font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;border:none;cursor:pointer;background:${wizardState.cameraView==='back'?'#7c3aed':'transparent'};color:#fff">Costas</button>
              </div>
            </div>

            <!-- STAGE DO ATLETA 3D / SVG ESCALÁVEL EM TEMPO REAL -->
            <div id="afmDynamicAvatarContainer" class="afm-avatar-stage" style="width:260px;height:310px;position:relative;display:flex;align-items:center;justify-content:center;margin:10px 0;overflow:hidden;border-radius:16px;background:radial-gradient(ellipse at 50% 36%,rgba(34,197,94,.2),rgba(124,58,237,.12) 50%,transparent 76%);touch-action:none">
              ${renderDynamicAthleteSvg()}
            </div>

            <div style="font-size:10px;color:#94a3b8;margin-bottom:14px">Arraste para girar. Rosto, olhos, cabelo, porte e chuteiras atualizam em tempo real.</div>

            <!-- CARD COMPACTO DO JOGADOR NO RODAPÉ -->
            <div style="width:100%;background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:12px">
              <div style="width:48px;height:48px;border-radius:10px;overflow:hidden;background:#334155;border:2px solid #7c3aed;flex-shrink:0">
                <img id="cardFooterPhoto" src="${wizardState.appearance.customFacePhoto || wizardState.appearance.facePhoto || PRESET_FACES[0].photo}" alt="Foto" style="width:100%;height:100%;object-fit:cover" onerror="this.src='${PRESET_FACES[0].fallback}'">
              </div>
              <div style="flex:1;overflow:hidden">
                <div id="cardFooterName" style="font-size:14px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${esc(nicknameOrName.toUpperCase())} <span id="cardFooterNum" style="color:#a855f7">#${wizardState.shirtNumber}</span>
                </div>
                <div id="cardFooterInfo" style="font-size:11px;color:#94a3b8;margin-top:2px">
                  ${wizardState.position} · ${wizardState.height.toFixed(2)} m · ${esc(wizardState.city)}/${wizardState.stateUf}
                </div>
              </div>
            </div>
          </div>

          <!-- COLUNA DIREITA: CONTEÚDO DINÂMICO DO PASSO ATUAL -->
          <div class="afm-creator-step-content" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:26px;min-height:500px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 12px 36px rgba(0,0,0,0.5)">
            <div>
              ${renderCurrentStepContent()}
            </div>

            <!-- NAVEGAÇÃO DE PASSOS (VOLTAR / AVANÇAR) -->
            <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;margin-top:30px">
              ${wizardState.step > 1 ? `
                <button type="button" id="btnWizardPrev" class="btn" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:800;padding:10px 22px;border-radius:10px;cursor:pointer">
                  ← VOLTAR
                </button>
              ` : `<div></div>`}

              ${wizardState.step < 6 ? `
                <button type="button" id="btnWizardNext" class="btn primary" style="background:linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);color:#fff;font-weight:900;padding:12px 28px;border-radius:10px;cursor:pointer;box-shadow:0 4px 18px rgba(168,85,247,0.4)">
                  AVANÇAR ➔
                </button>
              ` : `
                <div style="display:flex;gap:12px;align-items:center">
                  <button type="button" id="btnPlayTryoutMatch" class="btn warning" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#000;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;cursor:pointer;box-shadow:0 4px 16px rgba(245,158,11,0.4)">
                    ${wizardState.tryoutResult ? '🔄 NOVO JOGO-TREINO' : '⚽ DISPUTAR JOGO-TREINO'}
                  </button>
                  ${wizardState.tryoutResult?.approved ? `
                    <button type="button" id="btnWizardFinish" class="btn success" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#000;font-size:14px;font-weight:900;padding:13px 28px;border-radius:12px;cursor:pointer;box-shadow:0 4px 20px rgba(16,185,129,0.5)">
                      ✍️ ASSINAR COM O ${esc((wizardState.clubName || wizardState.tryoutResult?.clubName || 'CLUBE').toUpperCase())} ➔
                    </button>
                  ` : ''}
                </div>
              `}
            </div>
          </div>
        </div>

      </div>
    `;

    bindWizardEvents(container, activeUser);
  }

  /**
   * Renderiza as Pílulas do Stepper Superior
   */
  function renderStepperPills(){
    const steps = [
      { id: 1, label: '1. QUEM É VOCÊ' },
      { id: 2, label: '2. APARÊNCIA' },
      { id: 3, label: '3. CORPO E CHUTEIRA' },
      { id: 4, label: '4. POSIÇÃO' },
      { id: 5, label: '5. PONTOS' },
      { id: 6, label: '6. PENEIRA' }
    ];

    return steps.map(s => {
      const isActive = wizardState.step === s.id;
      const isCompleted = wizardState.step > s.id;
      return `
        <div class="stepper-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-bottom:3px solid ${isActive ? '#a855f7' : isCompleted ? '#10b981' : 'transparent'};color:${isActive ? '#fff' : isCompleted ? '#10b981' : '#64748b'};font-size:12px;font-weight:800;white-space:nowrap">
          <span>${isCompleted ? '✓' : ''}</span>
          <span>${s.label}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Renderiza o Conteúdo do Passo Atual
   */
  function renderCurrentStepContent(){
    switch(wizardState.step){
      case 1: return renderStep1QuemEVoce();
      case 2: return renderStep2Aparencia();
      case 3: return renderStep3CorpoEChuteira();
      case 4: return renderStep4PosicaoEArquetipo();
      case 5: return renderStep5Pontos();
      case 6: return renderStep6Peneira();
      default: return renderStep1QuemEVoce();
    }
  }

  // --- PASSO 1: QUEM É VOCÊ ---
  function renderStep1QuemEVoce(){
    const eng = getEngine();
    const ufs = Object.keys(eng.BRAZILIAN_REGIONS_DATA);
    const cities = getAvailableCities(wizardState.stateUf);

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 16px 0">1. QUEM É VOCÊ</h2>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">NOME COMPLETO</label>
            <input type="text" id="wizInputName" value="${esc(wizardState.name)}" placeholder="Ex.: Carlos Henrique" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#fff;font-size:13px;box-sizing:border-box">
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">APELIDO DE BOLEIRO (opcional)</label>
            <input type="text" id="wizInputNickname" value="${esc(wizardState.nickname)}" placeholder="Ex.: Juninho" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#fff;font-size:13px;box-sizing:border-box">
          </div>
        </div>

        <div style="margin-bottom:18px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">NÚMERO DA CAMISA</label>
          <div style="display:inline-flex;align-items:center;gap:8px;background:#1e293b;padding:6px 12px;border-radius:10px;border:1px solid #334155">
            <button type="button" id="btnNumMinus" class="btn" style="background:#334155;color:#fff;width:32px;height:32px;border-radius:6px;font-weight:900;border:none;cursor:pointer">-</button>
            <span id="wizShirtNumVal" style="font-size:16px;font-weight:900;color:#fff;min-width:32px;text-align:center">${wizardState.shirtNumber}</span>
            <button type="button" id="btnNumPlus" class="btn" style="background:#334155;color:#fff;width:32px;height:32px;border-radius:6px;font-weight:900;border:none;cursor:pointer">+</button>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">NACIONALIDADE / SELEÇÃO QUE REPRESENTA</label>
          <select id="wizSelectNationality" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#fff;font-size:13px;box-sizing:border-box">
            ${(function(){
              const catalog = window.AFM_NationalTeams?.CATALOG || {
                'Brasil': { flag: '🇧🇷' }, 'Argentina': { flag: '🇦🇷' }, 'França': { flag: '🇫🇷' },
                'Portugal': { flag: '🇵🇹' }, 'Inglaterra': { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, 'Espanha': { flag: '🇪🇸' },
                'Uruguai': { flag: '🇺🇾' }, 'Alemanha': { flag: '🇩🇪' }, 'Itália': { flag: '🇮🇹' },
                'Holanda': { flag: '🇳🇱' }, 'Colômbia': { flag: '🇨🇴' }, 'Paraguai': { flag: '🇵🇾' },
                'Equador': { flag: '🇪🇨' }, 'Chile': { flag: '🇨🇱' }, 'Estados Unidos': { flag: '🇺🇸' },
                'Japão': { flag: '🇯🇵' }, 'Bélgica': { flag: '🇧🇪' }, 'Croácia': { flag: '🇭🇷' }
              };
              return Object.entries(catalog).map(([cName, cMeta]) => `
                <option value="${cName}" ${cName === (wizardState.nationality || 'Brasil') ? 'selected' : ''}>
                  ${cMeta.flag || '🌍'} ${cName}
                </option>
              `).join('');
            })()}
          </select>
        </div>

        <div>
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">CIDADE & ESTADO ONDE MORA (DECIDE AS PENEIRAS INICIAIS)</label>
          <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;margin-bottom:6px">
            <select id="wizSelectUf" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px;color:#fff;font-size:13px">
              ${ufs.map(uf => `<option value="${uf}" ${uf === wizardState.stateUf ? 'selected' : ''}>${uf} - ${eng.BRAZILIAN_REGIONS_DATA[uf]?.name}</option>`).join('')}
            </select>
            <select id="wizSelectCity" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px;color:#fff;font-size:13px">
              ${cities.map(c => `<option value="${c.name}" ${c.name === wizardState.city ? 'selected' : ''}>${c.name} (${c.clubs.length} clube${c.clubs.length > 1 ? 's' : ''})</option>`).join('')}
            </select>
          </div>
          <div style="font-size:11px;color:#64748b;line-height:1.4">
            A cidade natal determina a peneira regional inicial ao seu alcance. Clubes das divisões reais respeitam seus campeonatos estaduais e ligas nacionais.
          </div>
        </div>

      </div>
    `;
  }

  // --- PASSO 2: APARÊNCIA (ROSTOS DE JOVENS & CORTE DE CABELO) ---
  function renderStep2Aparencia(){
    const hairStyles = [
      'Raspado', 'Curto', 'Fade', 'Topete', 'Moicano', 'Black power', 'Tranças', 'Franja', 'Coque Samurai'
    ];

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 6px 0">2. APARÊNCIA</h2>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:18px">Pele, rosto, olhos, boca e corte de cabelo do atleta de 15 anos.</div>

        <!-- TOM DE PELE & COR DO CABELO -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">TOM DE PELE</label>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              ${SKIN_TONES.map(color => `
                <div class="swatch-circle ${wizardState.appearance.skinTone === color ? 'selected' : ''}" data-type="skin" data-color="${color}" style="width:34px;height:34px;border-radius:50%;background:${color};cursor:pointer;border:3px solid ${wizardState.appearance.skinTone === color ? '#a855f7' : 'transparent'};box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>
              `).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">COR DO CABELO</label>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              ${HAIR_COLORS.map(color => `
                <div class="swatch-circle ${wizardState.appearance.hairColor === color ? 'selected' : ''}" data-type="hairColor" data-color="${color}" style="width:34px;height:34px;border-radius:50%;background:${color};cursor:pointer;border:3px solid ${wizardState.appearance.hairColor === color ? '#a855f7' : 'transparent'};box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- COR DOS OLHOS & ESTILO DA BOCA -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">COR DOS OLHOS</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${EYE_COLORS.map(eye => {
                const isSel = (wizardState.appearance.eyeColor || '#2c1810') === eye.color;
                return `
                  <div class="swatch-eye ${isSel ? 'selected' : ''}" data-color="${eye.color}" title="${eye.name}" style="width:34px;height:34px;border-radius:50%;background:${eye.color};cursor:pointer;border:3px solid ${isSel ? '#a855f7' : 'transparent'};box-shadow:0 2px 6px rgba(0,0,0,0.4);position:relative;display:flex;align-items:center;justify-content:center">
                    <div style="width:12px;height:12px;border-radius:50%;background:#000;border:1.5px solid rgba(255,255,255,0.4)"></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">EXPRESSÃO / BOCA</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${MOUTH_STYLES.map(m => {
                const isSel = (wizardState.appearance.mouthStyle || 'sorriso') === m.id;
                return `
                  <button type="button" class="btn-mouth ${isSel ? 'active' : ''}" data-mouth="${m.id}" title="${m.desc}" style="background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:4px">
                    <span>${m.icon}</span>
                    <span>${m.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- ROSTO NAS TELAS DO JOGO (FOTOS DE ATLETAS JOVENS) -->
        <div style="margin-bottom:22px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <label style="font-size:11px;font-weight:800;color:#94a3b8">ROSTO NAS TELAS DO JOGO (12 PROMESSAS JOVENS BRASILEIRAS)</label>
            <label for="wizFaceUpload" style="font-size:11px;font-weight:800;color:#38bdf8;cursor:pointer;text-decoration:underline">
              📷 Enviar minha própria foto
            </label>
            <input type="file" id="wizFaceUpload" accept="image/*" style="display:none">
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:10px">Aparece no elenco, nas notícias da imprensa e no perfil de carreira.</div>
          
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(78px, 1fr));gap:10px">
            ${PRESET_FACES.map(face => {
              const isSel = (wizardState.appearance.faceId === face.id) && !wizardState.appearance.customFacePhoto;
              return `
                <div class="face-card ${isSel ? 'selected' : ''}" data-face-id="${face.id}" data-face-photo="${face.photo}" data-fallback="${face.fallback}" data-hair-color="${face.hairColor}" data-skin-tone="${face.skinTone}" data-hair-style="${face.hairStyle}" data-eye-color="${face.eyeColor}" data-mouth-style="${face.mouthStyle}" style="border-radius:10px;overflow:hidden;border:2.5px solid ${isSel ? '#a855f7' : 'rgba(255,255,255,0.1)'};cursor:pointer;background:#1e293b;aspect-ratio:1;position:relative;box-shadow:${isSel ? '0 0 14px rgba(168,85,247,0.5)' : 'none'}">
                  <img src="${face.photo}" alt="${face.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='${face.fallback}'">
                  ${isSel ? `<div style="position:absolute;bottom:3px;right:3px;background:#a855f7;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;box-shadow:0 1px 4px rgba(0,0,0,0.6)">✓</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ESTILO DO CABELO (ATUALIZA O MODELO EM TEMPO REAL) -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">ESTILO DO CABELO</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${hairStyles.map(style => {
              const isSel = wizardState.appearance.hairStyle === style;
              return `
                <button type="button" class="btn-style ${isSel ? 'active' : ''}" data-hair-style="${style}" style="background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer">
                  ${style}
                </button>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // --- PASSO 3: CORPO E CHUTEIRA BÁSICA (SEM PATROCÍNIO) ---
  function renderStep3CorpoEChuteira(){
    const eng = getEngine();
    const bodyMods = eng.calculateBodyModifiers(wizardState.height, wizardState.bodyBuild);
    const starterBoots = eng.STARTER_BOOTS || [];

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 16px 0">3. CORPO E CHUTEIRA</h2>

        <!-- SLIDER DE ALTURA (ESCALA REAL DO ATLETA) -->
        <div style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <label style="font-size:11px;font-weight:800;color:#94a3b8">ALTURA DO ATLETA (ATUALIZA O MODELO EM TEMPO REAL)</label>
            <span id="wizHeightVal" style="font-size:15px;font-weight:900;color:#a855f7">${wizardState.height.toFixed(2)} M</span>
          </div>
          <input type="range" id="wizHeightSlider" min="1.55" max="2.05" step="0.01" value="${wizardState.height}" style="width:100%;accent-color:#a855f7;cursor:pointer">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:2px">
            <span>1,55 m</span>
            <span>1,78 m (Padrão)</span>
            <span>2,05 m</span>
          </div>
        </div>

        <!-- PORTE FÍSICO & PÉ PREFERIDO -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">PORTE FÍSICO</label>
            <div style="display:flex;gap:8px">
              ${['Magro', 'Médio', 'Forte'].map(build => {
                const isSel = wizardState.bodyBuild === build;
                return `
                  <button type="button" class="btn-build ${isSel ? 'active' : ''}" data-build="${build}" style="flex:1;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px;font-size:12px;font-weight:800;cursor:pointer">
                    ${build}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">PÉ PREFERIDO</label>
            <div style="display:flex;gap:8px">
              ${['Direito', 'Canhoto', 'Ambidestro'].map(foot => {
                const isSel = wizardState.preferredFoot === foot;
                return `
                  <button type="button" class="btn-foot ${isSel ? 'active' : ''}" data-foot="${foot}" style="flex:1;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px;font-size:12px;font-weight:800;cursor:pointer">
                    ${foot}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- BOX DE VANTAGENS E DESVANTAGENS DINÂMICAS -->
        <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:20px">
          <div style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;margin-bottom:8px">
            VANTAGENS E DESVANTAGENS DESTE BIOTIPO:
          </div>
          <div id="wizBodyModsList" style="display:flex;flex-direction:column;gap:6px">
            ${bodyMods.texts.map(t => `
              <div style="font-size:12px;color:${t.type==='good'?'#4ade80':t.type==='bad'?'#f87171':'#e2e8f0'};font-weight:600">
                ${t.type==='good'?'+ ':t.type==='bad'?'- ':'• '} ${t.text}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- MEIÃO E ACESSÓRIOS -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">MEIÃO E ACESSÓRIOS</label>
          <div style="display:flex;gap:8px">
            ${['Meião alto', 'Meião baixo', 'Munhequeira'].map(acc => {
              const isSel = wizardState.appearance.sockStyle === acc;
              return `
                <button type="button" class="btn-sock ${isSel ? 'active' : ''}" data-sock="${acc}" style="flex:1;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px;font-size:12px;font-weight:800;cursor:pointer">
                  ${acc}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- CHUTEIRAS BÁSICAS DE ENTRADA (SEM PATROCÍNIO) -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">
            CHUTEIRAS BÁSICAS DE ENTRADA (SEM PATROCÍNIO INICIAL):
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            ${starterBoots.map(boot => {
              const isSel = wizardState.appearance.starterBoot === boot.id;
              return `
                <div class="boot-card ${isSel ? 'selected' : ''}" data-boot-id="${boot.id}" style="background:${isSel ? 'linear-gradient(135deg,#1e1b4b,#2e1065)' : '#1e293b'};border:2px solid ${isSel ? '#a855f7' : '#334155'};border-radius:12px;padding:12px;cursor:pointer">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:13px;font-weight:900;color:#fff">${boot.name}</span>
                    <span class="pill" style="background:#334155;color:#94a3b8;font-size:9px;font-weight:800">${boot.tag}</span>
                  </div>
                  <div style="font-size:11px;color:#94a3b8;line-height:1.3;margin-bottom:8px">${boot.desc}</div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:20px;height:20px;border-radius:4px;background:${boot.color};border:1px solid ${boot.accent}"></div>
                    <span style="font-size:10px;font-weight:700;color:#cbd5e1">Material Básico de Aspirante</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // --- PASSO 4: POSIÇÃO & ARQUÉTIPO (OVERALL BASE ~35) ---
  function renderStep4PosicaoEArquetipo(){
    const eng = getEngine();
    const archetypesList = Object.entries(eng.ARCHETYPES);

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 16px 0">4. POSIÇÃO & ARQUÉTIPO</h2>

        <!-- SELEÇÃO DE POSIÇÃO PRINCIPAL -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">POSIÇÃO PRINCIPAL EM CAMPO</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'PON', 'ATA'].map(pos => {
              const isSel = wizardState.position === pos;
              return `
                <button type="button" class="btn-pos ${isSel ? 'active' : ''}" data-pos="${pos}" style="flex:1;min-width:60px;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:10px;padding:10px;font-size:14px;font-weight:900;cursor:pointer">
                  ${pos}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- LISTA DE ARQUÉTIPOS (CALIBRADOS PARA OVERALL ~35) -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">
            ARQUÉTIPO INICIAL (DEFINE OS ATRIBUTOS BASE DE ASPIRANTE ~35 OVR):
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            ${archetypesList.map(([key, arch]) => {
              const isSel = wizardState.archetype === key;
              return `
                <div class="arch-card ${isSel ? 'selected' : ''}" data-archetype="${key}" data-pos="${arch.pos}" style="background:${isSel ? 'linear-gradient(135deg,#1e1b4b,#2e1065)' : '#1e293b'};border:2px solid ${isSel ? '#a855f7' : '#334155'};border-radius:12px;padding:12px;cursor:pointer">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span style="font-size:14px;font-weight:900;color:#fff">${arch.name}</span>
                    <span class="pill" style="background:#7c3aed;color:#fff;font-size:9px;font-weight:900">${arch.pos}</span>
                  </div>
                  <div style="font-size:11px;color:#94a3b8;line-height:1.3;margin-bottom:8px">${arch.description}</div>
                  <div style="display:flex;gap:6px;font-size:10px;color:#cbd5e1;font-weight:700">
                    <span>VEL ${arch.attrs.vel}</span> •
                    <span>CHU ${arch.attrs.chu}</span> •
                    <span>PAS ${arch.attrs.pas}</span> •
                    <span>DRI ${arch.attrs.dri}</span> •
                    <span>DEF ${arch.attrs.def}</span> •
                    <span>FÍS ${arch.attrs.fis}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // --- PASSO 5: PONTOS DE HABILIDADE ---
  function renderStep5Pontos(){
    const eng = getEngine();
    const arch = eng.ARCHETYPES[wizardState.archetype] || eng.ARCHETYPES['finalizador'];
    const bodyMods = eng.calculateBodyModifiers(wizardState.height, wizardState.bodyBuild);

    const attrDefs = [
      { key: 'vel', label: 'Velocidade', desc: 'Aceleração e pique em campo' },
      { key: 'chu', label: 'Finalização & Chute', desc: 'Pontaria e força do arremate' },
      { key: 'pas', label: 'Passe & Visão', desc: 'Precisão em passes curtos e longos' },
      { key: 'dri', label: 'Drible & Agilidade', desc: 'Controle de bola e finta' },
      { key: 'def', label: 'Defesa & Desarme', desc: 'Bote limpo e posicionamento' },
      { key: 'fis', label: 'Físico & Fôlego', desc: 'Resistência e imposição corporal' }
    ];

    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0">5. DISTRIBUIR PONTOS</h2>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px">Invista nos pontos fortes do seu estilo de jogo para a peneira.</div>
          </div>
          <div style="background:rgba(168,85,247,0.2);border:1px solid #a855f7;border-radius:10px;padding:6px 14px;text-align:right">
            <span style="font-size:11px;font-weight:800;color:#c084fc">PONTOS RESTANTES:</span>
            <div id="wizPointsLeft" style="font-size:20px;font-weight:900;color:#fff">${wizardState.pointsAvailable}</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px">
          ${attrDefs.map(attr => {
            const base = (arch.attrs[attr.key] || 35) + (bodyMods[attr.key] || 0);
            const dist = wizardState.pointsDistributed[attr.key] || 0;
            const total = base + dist;
            return `
              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between">
                <div>
                  <div style="font-size:13px;font-weight:900;color:#fff">${attr.label}</div>
                  <div style="font-size:11px;color:#64748b">${attr.desc}</div>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                  <span id="wizAttrVal_${attr.key}" style="font-size:16px;font-weight:900;color:#10b981;min-width:32px;text-align:center">${total}</span>
                  <div style="display:flex;gap:4px">
                    <button type="button" class="btn-attr-minus btn" data-attr="${attr.key}" style="background:#334155;color:#fff;width:30px;height:30px;border-radius:6px;font-weight:900;border:none;cursor:pointer">-</button>
                    <button type="button" class="btn-attr-plus btn" data-attr="${attr.key}" style="background:#7c3aed;color:#fff;width:30px;height:30px;border-radius:6px;font-weight:900;border:none;cursor:pointer">+</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  // --- PASSO 6: PENEIRA (3 NÍVEIS & JOGO-TREINO COM CLUBE NA SORTE E CONTRATO POR NOTA) ---
  function renderStep6Peneira(){
    const eng = getEngine();
    const currentOvr = getCurrentOverall();
    const tiers = Object.values(eng.PENEIRA_TIERS || {});
    const tryout = wizardState.tryoutResult;
    const currentTier = eng.PENEIRA_TIERS?.[wizardState.peneiraTier] || tiers[0] || {};
    const offersList = (tryout?.clubOffers && tryout.clubOffers.length > 0)
      ? tryout.clubOffers
      : (tryout ? [{ clubName: tryout.clubName, wageOffered: tryout.wageOffered, division: tryout.division, squadRole: tryout.squadRole, reputation: 'Proposta' }] : []);

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 8px 0">6. ESCOLHA DA PENEIRA & JOGO-TREINO</h2>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:16px">
          Selecione a peneira desejada. Ao disputar o jogo-treino, até 3 clubes da divisão farão propostas de contrato para você escolher onde quer iniciar sua carreira!
        </div>

        <!-- INDICADOR DESTACADO DA PENEIRA SELECIONADA -->
        <div style="background:rgba(124,58,237,0.15);border:1.5px solid #7c3aed;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">🎯</span>
            <div>
              <div style="font-size:11px;font-weight:800;color:#c084fc;text-transform:uppercase">PENEIRA ATUALMENTE MARCADA:</div>
              <div style="font-size:15px;font-weight:900;color:#fff">${esc(currentTier.name || 'Peneira Básica')} · <span style="color:#a855f7;font-size:12px">${esc(currentTier.subtitle || '')}</span></div>
            </div>
          </div>
          <span class="pill" style="background:${currentTier.difficultyColor || '#10b981'};color:#000;font-size:10px;font-weight:900;padding:4px 10px;border-radius:6px">
            APENAS ESTA PENEIRA SERÁ DISPUTADA
          </span>
        </div>

        <!-- SELEÇÃO DOS 3 NÍVEIS DE PENEIRA -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">
            ESCOLHA O NÍVEL DO DESAFIO (CLIQUE NO CARD PARA ALTERNAR):
          </label>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px">
            ${tiers.map(t => {
              const isSel = wizardState.peneiraTier === t.id;
              return `
                <div class="peneira-tier-card ${isSel ? 'selected' : ''}" data-tier="${t.id}" style="background:${isSel ? 'linear-gradient(135deg,#1e1b4b,#2e1065)' : '#1e293b'};border:2px solid ${isSel ? t.difficultyColor : '#334155'};border-radius:14px;padding:14px;cursor:pointer;position:relative;box-shadow:${isSel ? `0 0 16px ${t.difficultyColor}44` : 'none'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:22px">${t.icon}</span>
                    <span class="pill" style="background:${t.difficultyColor};color:#000;font-size:10px;font-weight:900;padding:2px 8px;border-radius:6px">${t.difficultyBadge}</span>
                  </div>
                  <div style="font-size:14px;font-weight:900;color:#fff;margin-bottom:2px">${t.name}</div>
                  <div style="font-size:11px;color:#cbd5e1;font-weight:700;margin-bottom:6px">${t.subtitle}</div>
                  <div style="font-size:11px;color:#94a3b8;line-height:1.3;margin-bottom:10px">${t.description}</div>
                  <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:8px;font-size:11px">
                    <div style="color:#94a3b8">Papel Estimado: <b style="color:#fff">${t.defaultRole}</b></div>
                    <div style="color:#94a3b8">Faixa Salarial: <b style="color:#10b981">R$ ${t.wageRange[0].toLocaleString('pt-BR')} - ${t.wageRange[1].toLocaleString('pt-BR')}/mês</b></div>
                  </div>
                  <div style="margin-top:10px;text-align:center">
                    <span class="pill" style="background:${isSel ? '#10b981' : 'rgba(255,255,255,0.06)'};color:${isSel ? '#000' : '#94a3b8'};font-size:10px;font-weight:900;padding:4px 10px;border-radius:6px;display:block">
                      ${isSel ? '✓ PENEIRA SELECIONADA' : 'CLIQUE P/ SELECIONAR'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ÁREA DINÂMICA: RELATÓRIO DO TESTE E PROPOSTA CONTRATUAL -->
        ${tryout ? (tryout.approved ? `
          <!-- APROVADO: CARDS DOS ATÉ 3 CLUBES OFERTANTES PARA ESCOLHA LIVRE -->
          <div style="background:linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.95));border:2px solid #10b981;border-radius:16px;padding:20px;box-shadow:0 10px 30px rgba(16,185,129,0.2)">
            
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:14px">
              <div style="display:flex;align-items:center;gap:14px">
                <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:26px;color:#000;font-weight:900;box-shadow:0 4px 15px rgba(16,185,129,0.4)">
                  ⚽
                </div>
                <div>
                  <div style="font-size:11px;font-weight:900;color:#34d399;text-transform:uppercase;letter-spacing:0.5px">🎉 PARABÉNS! VOCÊ FOI APROVADO!</div>
                  <div style="font-size:20px;font-weight:900;color:#fff">${offersList.length} Propostas de Clubes na Mesa</div>
                  <div style="font-size:12px;color:#cbd5e1">Avaliação técnica na ${esc(tryout.tierName)}</div>
                </div>
              </div>
              <div style="text-align:center;background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:8px 16px">
                <span style="font-size:24px;font-weight:900;color:#10b981">${tryout.scoutRating}</span>
                <div style="font-size:9px;color:#94a3b8;font-weight:800">NOTA DO OLHEIRO</div>
              </div>
            </div>

            <!-- Parecer da Comissão Técnica -->
            <div style="background:rgba(0,0,0,0.35);border-radius:10px;padding:12px 14px;margin-bottom:16px;border-left:3px solid #10b981">
              <div style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase">Parecer do Coordenador da Base:</div>
              <div style="font-size:12px;color:#e2e8f0;margin-top:3px;line-height:1.4">"${tryout.scoutComment}"</div>
            </div>

            <!-- SELEÇÃO DE ATÉ 3 CLUBES OFERTANTES -->
            <div style="margin-bottom:16px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <div style="font-size:12px;font-weight:900;color:#c084fc;text-transform:uppercase">
                  📋 SELECIONE O CLUBE EM QUE DESEJA JOGAR:
                </div>
                <span style="font-size:11px;color:#94a3b8">Clique no card para escolher seu destino</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:12px">
                ${offersList.map((off, idx) => {
                  const isChosen = (wizardState.clubName === off.clubName);
                  return `
                    <div class="tryout-club-option-card" data-club="${esc(off.clubName)}" data-wage="${off.wageOffered}" data-role="${esc(off.squadRole || 'Reserva')}" style="background:${isChosen ? 'linear-gradient(135deg, #064e3b, #022c22)' : '#0f172a'};border:2px solid ${isChosen ? '#10b981' : '#334155'};border-radius:14px;padding:14px;cursor:pointer;position:relative;transition:all 0.2s ease;box-shadow:${isChosen ? '0 0 20px rgba(16,185,129,0.35)' : 'none'}">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <span class="pill" style="background:${isChosen ? '#10b981' : 'rgba(255,255,255,0.08)'};color:${isChosen ? '#000' : '#94a3b8'};font-size:9px;font-weight:900;padding:2px 8px;border-radius:6px">
                          ${isChosen ? '✓ ESCOLHIDO' : 'CLIQUE P/ ESCOLHER'}
                        </span>
                        <span style="font-size:10px;color:#38bdf8;font-weight:800">${esc(off.reputation || 'Proposta')}</span>
                      </div>
                      <div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:2px">${esc(off.clubName)}</div>
                      <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${esc(off.division || 'Divisão Nacional')}</div>
                      <div style="background:rgba(0,0,0,0.35);border-radius:8px;padding:8px">
                        <div style="font-size:10px;color:#94a3b8">Salário Oferecido:</div>
                        <div style="font-size:16px;font-weight:900;color:#10b981">R$ ${(off.wageOffered || 1000).toLocaleString('pt-BR')}<span style="font-size:10px;color:#94a3b8">/mês</span></div>
                        <div style="font-size:10px;color:#cbd5e1;margin-top:4px">Papel: <b style="color:#38bdf8">${esc(off.squadRole || 'Reserva')}</b></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- BOTÕES DE AÇÃO IMEDIATA -->
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
              <button type="button" id="btnStep6RetryTryout" class="btn" style="background:#1e293b;color:#cbd5e1;font-size:12px;font-weight:800;padding:11px 20px;border-radius:10px;cursor:pointer;border:1px solid #334155">
                🔄 Tentar Novo Teste / Outra Peneira
              </button>
              <button type="button" id="btnStep6SignContract" class="btn success" style="background:linear-gradient(135deg,#10b981,#059669);color:#000;font-size:14px;font-weight:900;padding:12px 26px;border-radius:10px;cursor:pointer;border:none;box-shadow:0 4px 18px rgba(16,185,129,0.5)">
                ✍️ ASSINAR CONTRATO COM O ${esc((wizardState.clubName || tryout.clubName).toUpperCase())} ➔
              </button>
            </div>

          </div>
        ` : `
          <!-- NÃO APROVADO: FEEDBACK E OPÇÃO DE TENTAR NOVAMENTE -->
          <div style="background:linear-gradient(135deg, rgba(239,68,68,0.12), rgba(15,23,42,0.95));border:2px solid #ef4444;border-radius:16px;padding:20px;box-shadow:0 10px 30px rgba(239,68,68,0.2)">
            
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:14px">
              <div style="display:flex;align-items:center;gap:14px">
                <span style="font-size:32px">⚠️</span>
                <div>
                  <div style="font-size:11px;font-weight:900;color:#f87171;text-transform:uppercase">NÃO FOI DESTA VEZ</div>
                  <div style="font-size:20px;font-weight:900;color:#fff">${esc(tryout.clubName)}</div>
                  <div style="font-size:12px;color:#cbd5e1">${esc(tryout.division || 'Divisão Nacional')} · Avaliado na ${esc(tryout.tierName)}</div>
                </div>
              </div>
              <div style="text-align:center;background:#0f172a;border:1px solid #ef4444;border-radius:12px;padding:8px 16px">
                <span style="font-size:24px;font-weight:900;color:#ef4444">${tryout.scoutRating}</span>
                <div style="font-size:9px;color:#94a3b8;font-weight:800">NOTA DO OLHEIRO</div>
              </div>
            </div>

            <div style="background:rgba(0,0,0,0.35);border-radius:10px;padding:12px 14px;margin-bottom:16px;border-left:3px solid #ef4444">
              <div style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase">Parecer da Comissão:</div>
              <div style="font-size:12px;color:#cbd5e1;margin-top:3px;line-height:1.4">"${tryout.scoutComment}"</div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:11px;color:#94a3b8">
                Dica: Você pode tentar novo jogo-treino nesta mesma peneira ou mudar para um nível com maior aprovação.
              </div>
              <button type="button" id="btnStep6RetryTryout" class="btn warning" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:13px;font-weight:900;padding:11px 22px;border-radius:10px;cursor:pointer;border:none;box-shadow:0 4px 16px rgba(245,158,11,0.4)">
                🔄 Disputar Novo Jogo-Treino
              </button>
            </div>

          </div>
        `) : `
          <!-- CARD DE CHAMADA PARA O JOGO-TREINO -->
          <div style="background:#1e293b;border:2px dashed #7c3aed;border-radius:16px;padding:26px 20px;text-align:center">
            <div style="font-size:42px;margin-bottom:8px">⚽</div>
            <div style="font-size:17px;font-weight:900;color:#fff;margin-bottom:6px">PRONTO PARA O JOGO-TREINO DA ${esc(currentTier.name?.toUpperCase() || 'PENEIRA')}?</div>
            <div style="font-size:12px;color:#94a3b8;max-width:540px;margin:0 auto 18px auto;line-height:1.5">
              Ao disputar o teste, os olheiros avaliarão seu atleta em 30 minutos de coletivo. Até 3 clubes da divisão farão propostas contratuais para sua livre escolha!
            </div>
            <button type="button" id="btnPlayTryoutDirect" class="btn warning" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:15px;font-weight:900;padding:14px 32px;border-radius:12px;cursor:pointer;border:none;box-shadow:0 6px 20px rgba(245,158,11,0.4)">
              ⚽ DISPUTAR JOGO-TREINO NA ${esc(currentTier.name?.toUpperCase() || 'PENEIRA')} ➔
            </button>
          </div>
        `}

      </div>
    `;
  }

  /**
   * Renderiza o Atleta Dinâmico SVG com escala real de Altura, Porte Físico, Estilo de Cabelo e Acessórios
   */
  function renderDynamicAthleteSvg(){
    const isBack = wizardState.cameraView === 'back';
    const skin = wizardState.appearance.skinTone || '#c68642';
    const hair = wizardState.appearance.hairColor || '#111827';
    const hairStyle = wizardState.appearance.hairStyle || 'Curto';
    const eyeColor = wizardState.appearance.eyeColor || '#2c1810';
    const mouthStyle = wizardState.appearance.mouthStyle || 'sorriso';
    const sockStyle = wizardState.appearance.sockStyle || 'Meião alto';
    const bootId = wizardState.appearance.starterBoot || 'boot_black_classic';
    const num = wizardState.shirtNumber || 10;
    const nickname = (wizardState.nickname || wizardState.name || '').toUpperCase().slice(0, 14);
    const height = Number(wizardState.height) || 1.78;
    const bodyBuild = wizardState.bodyBuild || 'Médio';

    // Fatores de escala real:
    // Altura (1.55m a 2.05m): escala Y das pernas e do tronco
    const scaleY = Math.max(0.85, Math.min(1.15, height / 1.78));
    // Porte Físico: largura dos ombros, peito e braços
    const buildWidths = {
      'Magro': { torsoW: 46, armW: 14, legW: 18, shoulderX1: 94, shoulderX2: 146 },
      'Médio': { torsoW: 54, armW: 18, legW: 22, shoulderX1: 90, shoulderX2: 150 },
      'Forte': { torsoW: 64, armW: 22, legW: 26, shoulderX1: 85, shoulderX2: 155 }
    };
    const b = buildWidths[bodyBuild] || buildWidths['Médio'];

    // Cores das chuteiras básicas
    const bootColors = {
      'boot_black_classic': { base: '#111827', accent: '#374151' },
      'boot_varzea': { base: '#1e293b', accent: '#94a3b8' },
      'boot_synthetic': { base: '#f8fafc', accent: '#64748b' },
      'boot_cushion': { base: '#334155', accent: '#0284c7' }
    };
    const bootClr = bootColors[bootId] || bootColors['boot_black_classic'];

    return `
      <svg width="240" height="300" viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 10px 20px rgba(0,0,0,0.5))">
        <!-- PEDESTAL CIRCULAR ROXO NEON -->
        <ellipse cx="120" cy="272" rx="90" ry="22" fill="#13082b" stroke="#a855f7" stroke-width="4" />
        <ellipse cx="120" cy="272" rx="72" ry="16" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6,4" />

        <!-- BOLA DE FUTEBOL NO PÉ -->
        <circle cx="168" cy="262" r="14" fill="#ffffff" stroke="#111827" stroke-width="2" />
        <polygon points="168,254 174,259 172,266 164,266 162,259" fill="#111827" />

        <!-- GRUPO TRANSFORMADO DO ATLETA -->
        <g id="athleteModelGroup" transform="translate(120, 260) scale(1, ${scaleY}) translate(-120, -260)">
          
          <!-- PERNAS E PÉS -->
          <!-- Perna Esquerda -->
          <rect x="${120 - b.legW - 2}" y="180" width="${b.legW}" height="68" rx="4" fill="${sockStyle === 'Meião baixo' ? skin : '#ffffff'}" stroke="#cbd5e1" stroke-width="1.2" />
          ${sockStyle === 'Meião baixo' ? `
            <!-- Meião arrebitado no tornozelo -->
            <rect x="${120 - b.legW - 2}" y="234" width="${b.legW}" height="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          ` : ''}
          <rect x="${120 - b.legW - 2}" y="248" width="${b.legW}" height="14" rx="4" fill="${bootClr.base}" stroke="${bootClr.accent}" stroke-width="1.5" />

          <!-- Perna Direita -->
          <rect x="${120 + 2}" y="180" width="${b.legW}" height="68" rx="4" fill="${sockStyle === 'Meião baixo' ? skin : '#ffffff'}" stroke="#cbd5e1" stroke-width="1.2" />
          ${sockStyle === 'Meião baixo' ? `
            <!-- Meião arrebitado no tornozelo -->
            <rect x="${120 + 2}" y="234" width="${b.legW}" height="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          ` : ''}
          <rect x="${120 + 2}" y="248" width="${b.legW}" height="14" rx="4" fill="${bootClr.base}" stroke="${bootClr.accent}" stroke-width="1.5" />

          <!-- CALÇÃO -->
          <rect x="${120 - (b.torsoW / 2)}" y="142" width="${b.torsoW}" height="42" rx="4" fill="#7c3aed" stroke="#6d28d9" stroke-width="1.5" />

          <!-- TRONCO (CAMISA) -->
          <polygon points="${b.shoulderX1},85 ${b.shoulderX2},85 ${120 + (b.torsoW / 2)},145 ${120 - (b.torsoW / 2)},145" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />

          ${isBack ? `
            <!-- APELIDO E NÚMERO EM PRETO PARA CONTRASTE -->
            <text x="120" y="105" font-family="'Segoe UI',sans-serif" font-size="9" font-weight="900" fill="#111827" text-anchor="middle" letter-spacing=".5">${esc(nickname)}</text>
            <text x="120" y="132" font-family="'Segoe UI',sans-serif" font-size="28" font-weight="900" fill="#111827" text-anchor="middle">${num}</text>
          ` : `
            <!-- DETALHE NO PEITO -->
            <circle cx="106" cy="102" r="5" fill="#7c3aed" />
          `}

          <!-- BRAÇO ESQUERDO COM MÃO ACOPLADA -->
          <g transform="rotate(10 ${b.shoulderX1} 88)">
            <!-- Manga do uniforme -->
            <rect x="${b.shoulderX1 - b.armW + 2}" y="88" width="${b.armW}" height="52" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />
            <!-- Antebraço (pele) -->
            <rect x="${b.shoulderX1 - b.armW + 3}" y="128" width="${b.armW - 2}" height="14" rx="2" fill="${skin}" />
            ${sockStyle === 'Munhequeira' ? `
              <rect x="${b.shoulderX1 - b.armW + 1}" y="132" width="${b.armW + 2}" height="8" rx="2" fill="#7c3aed" />
            ` : ''}
            <!-- Mão esquerda posicionada na extremidade inferior do braço -->
            <circle cx="${b.shoulderX1 - (b.armW / 2) + 2}" cy="144" r="${Math.max(5, (b.armW / 2))}" fill="${skin}" stroke="#523015" stroke-width="0.8" />
          </g>

          <!-- BRAÇO DIREITO COM MÃO ACOPLADA -->
          <g transform="rotate(-10 ${b.shoulderX2} 88)">
            <!-- Manga do uniforme -->
            <rect x="${b.shoulderX2 - 2}" y="88" width="${b.armW}" height="52" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />
            <!-- Antebraço (pele) -->
            <rect x="${b.shoulderX2 - 1}" y="128" width="${b.armW - 2}" height="14" rx="2" fill="${skin}" />
            ${sockStyle === 'Munhequeira' ? `
              <rect x="${b.shoulderX2 - 3}" y="132" width="${b.armW + 2}" height="8" rx="2" fill="#7c3aed" />
            ` : ''}
            <!-- Mão direita posicionada na extremidade inferior do braço -->
            <circle cx="${b.shoulderX2 + (b.armW / 2) - 2}" cy="144" r="${Math.max(5, (b.armW / 2))}" fill="${skin}" stroke="#523015" stroke-width="0.8" />
          </g>

          <!-- CABEÇA -->
          <rect x="95" y="38" width="50" height="46" rx="6" fill="${skin}" stroke="#523015" stroke-width="1" />

          ${!isBack ? `
            <!-- OLHOS REALISTAS DO ATLETA (ESCLERA + ÍRIS COLORIDA + PUPILA + BRILHO) -->
            <ellipse cx="108" cy="54" rx="4.5" ry="4" fill="#ffffff" stroke="#334155" stroke-width="0.8" />
            <circle cx="108" cy="54" r="2.8" fill="${eyeColor}" />
            <circle cx="108" cy="54" r="1.5" fill="#000000" />
            <circle cx="109.2" cy="52.8" r="0.8" fill="#ffffff" />

            <ellipse cx="132" cy="54" rx="4.5" ry="4" fill="#ffffff" stroke="#334155" stroke-width="0.8" />
            <circle cx="132" cy="54" r="2.8" fill="${eyeColor}" />
            <circle cx="132" cy="54" r="1.5" fill="#000000" />
            <circle cx="133.2" cy="52.8" r="0.8" fill="#ffffff" />

            <!-- SOBRANCELHAS JOVENS -->
            <path d="M 103 48 Q 108 45 113 48" fill="none" stroke="${hair}" stroke-width="2.2" stroke-linecap="round" />
            <path d="M 127 48 Q 132 45 137 48" fill="none" stroke="${hair}" stroke-width="2.2" stroke-linecap="round" />

            <!-- NARIZ ATLETA DISCRETO -->
            <path d="M 120 54 L 118 60 L 122 60" fill="none" stroke="#523015" stroke-width="1.2" stroke-linecap="round" opacity="0.7" />

            <!-- BOCA / EXPRESSÃO DINÂMICA -->
            ${renderMouthSvg(mouthStyle, skin)}
          ` : ''}

          <!-- ESTILO DE CABELO DINÂMICO -->
          ${renderHairStyleSvg(hairStyle, hair, isBack)}

        </g>
      </svg>
    `;
  }

  /**
   * Expressão e Estilo da Boca em SVG
   */
  function renderMouthSvg(style, skin){
    switch(style){
      case 'focado':
        return `<line x1="113" y1="67" x2="127" y2="67" stroke="#3f2314" stroke-width="2.4" stroke-linecap="round" />`;
      case 'confiante':
        return `<path d="M 113 68 Q 120 70 128 64" fill="none" stroke="#3f2314" stroke-width="2.4" stroke-linecap="round" />`;
      case 'determinado':
        return `
          <rect x="113" y="65" width="14" height="4.5" rx="2" fill="#ffffff" stroke="#3f2314" stroke-width="1.2" />
          <line x1="113" y1="67.2" x2="127" y2="67.2" stroke="#3f2314" stroke-width="0.9" />
        `;
      case 'gol':
        return `
          <ellipse cx="120" cy="68" rx="6.5" ry="5.5" fill="#3f2314" />
          <ellipse cx="120" cy="65.5" rx="4.5" ry="2" fill="#ffffff" />
          <path d="M 116 71 Q 120 73.5 124 71" fill="#ef4444" />
        `;
      case 'sorriso':
      default:
        return `<path d="M 112 65 Q 120 73 128 65" fill="none" stroke="#3f2314" stroke-width="2.4" stroke-linecap="round" />`;
    }
  }

  /**
   * Geometria SVG para os diferentes cortes de cabelo
   */
  function renderHairStyleSvg(style, color, isBack){
    switch(style){
      case 'Raspado':
        return isBack ? `
          <rect x="94" y="36" width="52" height="12" rx="4" fill="${color}" stroke="#334155" stroke-width="1.2" />
          <path d="M 101 40h38 M 101 44h38" stroke="#334155" stroke-width=".8" opacity=".42" />
        ` : `
          <path d="M 94 44 Q 120 30 146 44 L 146 38 Q 120 26 94 38 Z" fill="${color}" stroke="#334155" stroke-width="1.2" />
          <path d="M 102 39q8-5 16-5 M 124 34q9 1 14 6" fill="none" stroke="#334155" stroke-width=".9" opacity=".45" />
        `;

      case 'Fade':
        return isBack ? `
          <rect x="95" y="34" width="50" height="18" rx="5" fill="${color}" />
          <rect x="94" y="44" width="52" height="8" rx="2" fill="${color}" opacity="0.45" />
        ` : `
          <rect x="95" y="34" width="50" height="12" rx="4" fill="${color}" stroke="#334155" stroke-width="1.2" />
          <path d="M 94 46 Q 120 38 146 46 L 146 34 L 94 34 Z" fill="${color}" stroke="#334155" stroke-width="1.2" />
          <rect x="94" y="42" width="6" height="8" rx="2" fill="${color}" opacity="0.45" />
          <rect x="140" y="42" width="6" height="8" rx="2" fill="${color}" opacity="0.45" />
          <path d="M 101 39h38 M 105 42h30" stroke="#334155" stroke-width=".8" opacity=".35" />
          <line x1="97" y1="45" x2="103" y2="44" stroke="#ffffff" stroke-width="1.2" opacity="0.9" />
        `;

      case 'Topete':
        return isBack ? `
          <rect x="94" y="34" width="52" height="20" rx="6" fill="${color}" />
          <path d="M 100 34 Q 120 20 140 34 Z" fill="${color}" />
        ` : `
          <rect x="94" y="36" width="52" height="10" rx="4" fill="${color}" />
          <path d="M 95 38 Q 112 18 135 24 Q 146 28 145 38 Z" fill="${color}" stroke="#1f2937" stroke-width="0.8" />
          <path d="M 102 38 Q 120 24 138 32" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
        `;

      case 'Black power':
        return `
          <path d="M 96 48 Q 91 41 96 35 Q 98 26 107 25 Q 112 17 121 21 Q 131 18 136 27 Q 146 29 145 39 Q 150 46 143 51 L 140 54 L 100 54 Z" fill="${color}" stroke="#334155" stroke-width="1.5" />
          <g fill="none" stroke="#334155" stroke-width="1.15" opacity=".56">
            <path d="M 99 37q4-7 8 0t8 0t8 0t8 0t8 0t7 0" />
            <path d="M 98 44q4-7 8 0t8 0t8 0t8 0t8 0t7 0" />
          </g>
          <g fill="${color}" stroke="#334155" stroke-width="1">
            <circle cx="101" cy="31" r="4"/><circle cx="112" cy="25" r="4"/><circle cx="124" cy="25" r="4"/><circle cx="136" cy="31" r="4"/>
            <circle cx="96" cy="40" r="4"/><circle cx="108" cy="36" r="4"/><circle cx="120" cy="36" r="4"/><circle cx="132" cy="36" r="4"/><circle cx="144" cy="40" r="4"/>
          </g>
        `;

      case 'Tranças':
        return isBack ? `
          <rect x="94" y="34" width="52" height="24" rx="4" fill="${color}" />
          <line x1="102" y1="34" x2="102" y2="58" stroke="#1f2937" stroke-width="3" />
          <line x1="111" y1="34" x2="111" y2="60" stroke="#1f2937" stroke-width="3" />
          <line x1="120" y1="34" x2="120" y2="62" stroke="#1f2937" stroke-width="3" />
          <line x1="129" y1="34" x2="129" y2="60" stroke="#1f2937" stroke-width="3" />
          <line x1="138" y1="34" x2="138" y2="58" stroke="#1f2937" stroke-width="3" />
        ` : `
          <rect x="95" y="34" width="50" height="10" rx="3" fill="${color}" />
          <line x1="104" y1="34" x2="104" y2="46" stroke="#1f2937" stroke-width="3" stroke-linecap="round" />
          <line x1="112" y1="34" x2="112" y2="48" stroke="#1f2937" stroke-width="3" stroke-linecap="round" />
          <line x1="120" y1="34" x2="120" y2="48" stroke="#1f2937" stroke-width="3" stroke-linecap="round" />
          <line x1="128" y1="34" x2="128" y2="48" stroke="#1f2937" stroke-width="3" stroke-linecap="round" />
          <line x1="136" y1="34" x2="136" y2="46" stroke="#1f2937" stroke-width="3" stroke-linecap="round" />
        `;

      case 'Moicano':
        return isBack ? `
          <rect x="111" y="24" width="18" height="34" rx="4" fill="${color}" />
        ` : `
          <rect x="111" y="22" width="18" height="24" rx="4" fill="${color}" />
          <polygon points="111,38 120,18 129,38" fill="${color}" />
          <polygon points="113,38 120,22 127,38" fill="${color}" />
        `;

      case 'Franja':
        return isBack ? `
          <rect x="94" y="34" width="52" height="20" rx="5" fill="${color}" stroke="#334155" stroke-width="1.2" />
        ` : `
          <rect x="94" y="34" width="52" height="10" rx="3" fill="${color}" />
          <path d="M 94 36 Q 110 34 130 42 L 126 50 Q 108 42 94 44 Z" fill="${color}" />
        `;

      case 'Coque Samurai':
        return isBack ? `
          <rect x="94" y="36" width="52" height="18" rx="5" fill="${color}" />
          <circle cx="120" cy="22" r="9" fill="${color}" />
          <rect x="116" y="27" width="8" height="4" rx="2" fill="#ef4444" />
        ` : `
          <path d="M 94 42 Q 120 32 146 42 L 146 36 Q 120 28 94 36 Z" fill="${color}" />
          <circle cx="120" cy="22" r="9" fill="${color}" />
          <rect x="116" y="27" width="8" height="4" rx="2" fill="#ef4444" />
        `;

      case 'Curto':
      default:
        return isBack ? `
          <rect x="94" y="34" width="52" height="20" rx="6" fill="${color}" />
        ` : `
          <rect x="94" y="34" width="52" height="12" rx="4" fill="${color}" stroke="#334155" stroke-width="1.2" />
          <path d="M 94 46 Q 120 38 146 46 L 146 34 L 94 34 Z" fill="${color}" stroke="#334155" stroke-width="1.2" />
          <path d="M 102 37q8-4 16-2 M 124 35q9 0 14 4" fill="none" stroke="#334155" stroke-width=".9" opacity=".42" />
        `;
    }
  }

  /**
   * Binds dos Eventos Interativos do Criador
   */
  function bindWizardEvents(container, activeUser){
    const initialStage = container.querySelector('#afmDynamicAvatarContainer');
    if(initialStage) initialStage.innerHTML = renderDynamicAthleteSvg();

    // Atualizar preview dinâmico instantaneamente
    function refreshAvatarPreview(){
      const stage = container.querySelector('#afmDynamicAvatarContainer');
      if(stage) stage.innerHTML = renderDynamicAthleteSvg();
      const ovrEl = container.querySelector('#previewOvrNumber');
      if(ovrEl) ovrEl.textContent = getCurrentOverall();

      const nickOrName = wizardState.nickname || wizardState.name || 'Seu Jogador';
      const fName = container.querySelector('#cardFooterName');
      if(fName) fName.innerHTML = `${esc(nickOrName.toUpperCase())} <span style="color:#a855f7">#${wizardState.shirtNumber}</span>`;
      const fInfo = container.querySelector('#cardFooterInfo');
      if(fInfo) fInfo.textContent = `${wizardState.position} · ${wizardState.height.toFixed(2)} m · ${wizardState.city}/${wizardState.stateUf}`;
    }

    // Toggle Câmera Frente / Costas
    container.querySelectorAll('.btn-cam').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.btn-cam').forEach(b => {
          b.style.background = 'transparent';
          b.classList.remove('active');
        });
        btn.style.background = '#7c3aed';
        btn.classList.add('active');
        wizardState.cameraView = btn.id === 'btnCamBack' ? 'back' : 'front';
        refreshAvatarPreview();
      };
    });

    // Passo 1: Nome, Apelido, Camisa, UF e Cidade
    const inputName = container.querySelector('#wizInputName');
    if(inputName){
      inputName.oninput = (e) => {
        wizardState.name = e.target.value;
        refreshAvatarPreview();
      };
    }
    const inputNick = container.querySelector('#wizInputNickname');
    if(inputNick){
      inputNick.oninput = (e) => {
        wizardState.nickname = e.target.value;
        refreshAvatarPreview();
      };
    }
    const btnNumMinus = container.querySelector('#btnNumMinus');
    const btnNumPlus = container.querySelector('#btnNumPlus');
    const shirtNumVal = container.querySelector('#wizShirtNumVal');
    if(btnNumMinus && btnNumPlus){
      btnNumMinus.onclick = () => {
        if(wizardState.shirtNumber > 1){
          wizardState.shirtNumber--;
          if(shirtNumVal) shirtNumVal.textContent = wizardState.shirtNumber;
          refreshAvatarPreview();
        }
      };
      btnNumPlus.onclick = () => {
        if(wizardState.shirtNumber < 99){
          wizardState.shirtNumber++;
          if(shirtNumVal) shirtNumVal.textContent = wizardState.shirtNumber;
          refreshAvatarPreview();
        }
      };
    }
    const selectUf = container.querySelector('#wizSelectUf');
    const selectCity = container.querySelector('#wizSelectCity');
    if(selectUf && selectCity){
      selectUf.onchange = (e) => {
        wizardState.stateUf = e.target.value;
        const cities = getAvailableCities(wizardState.stateUf);
        selectCity.innerHTML = cities.map(c => `<option value="${c.name}">${c.name} (${c.clubs.length} clube${c.clubs.length > 1 ? 's' : ''})</option>`).join('');
        wizardState.city = cities[0]?.name || 'Brasília';
        wizardState.clubName = cities[0]?.clubs[0] || 'Brasília';
        refreshAvatarPreview();
      };
      selectCity.onchange = (e) => {
        wizardState.city = e.target.value;
        const cities = getAvailableCities(wizardState.stateUf);
        const cityObj = cities.find(c => c.name === wizardState.city);
        if(cityObj && cityObj.clubs.length > 0){
          wizardState.clubName = cityObj.clubs[0];
        }
        refreshAvatarPreview();
      };
    }
    const selectNat = container.querySelector('#wizSelectNationality');
    if(selectNat){
      selectNat.onchange = (e) => {
        wizardState.nationality = e.target.value;
      };
    }

    // Passo 2: Swatches de Pele e Cabelo
    container.querySelectorAll('.swatch-circle').forEach(sw => {
      sw.onclick = () => {
        const type = sw.dataset.type;
        const color = sw.dataset.color;
        if(type === 'skin'){
          wizardState.appearance.skinTone = color;
        } else if(type === 'hairColor'){
          wizardState.appearance.hairColor = color;
        }
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Swatches de Cor dos Olhos
    container.querySelectorAll('.swatch-eye').forEach(sw => {
      sw.onclick = () => {
        wizardState.appearance.eyeColor = sw.dataset.color;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Expressões / Estilos da Boca
    container.querySelectorAll('.btn-mouth').forEach(btn => {
      btn.onclick = () => {
        wizardState.appearance.mouthStyle = btn.dataset.mouth;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Galeria de Rostos de Jovens (Seleção Única Estrita)
    container.querySelectorAll('.face-card').forEach(card => {
      card.onclick = () => {
        wizardState.appearance.faceId = card.dataset.faceId;
        wizardState.appearance.facePhoto = card.dataset.facePhoto;
        wizardState.appearance.customFacePhoto = null;
        if(card.dataset.hairColor) wizardState.appearance.hairColor = card.dataset.hairColor;
        if(card.dataset.skinTone) wizardState.appearance.skinTone = card.dataset.skinTone;
        if(card.dataset.hairStyle) wizardState.appearance.hairStyle = card.dataset.hairStyle;
        if(card.dataset.eyeColor) wizardState.appearance.eyeColor = card.dataset.eyeColor;
        if(card.dataset.mouthStyle) wizardState.appearance.mouthStyle = card.dataset.mouthStyle;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Upload de Foto Própria
    const faceUpload = container.querySelector('#wizFaceUpload');
    if(faceUpload){
      faceUpload.onchange = (e) => {
        const file = e.target.files?.[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          wizardState.appearance.faceId = null;
          wizardState.appearance.customFacePhoto = re.target.result;
          renderCreatePlayerScreen(container, activeUser);
        };
        reader.readAsDataURL(file);
      };
    }

    // Estilos de Cabelo
    container.querySelectorAll('.btn-style').forEach(btn => {
      btn.onclick = () => {
        wizardState.appearance.hairStyle = btn.dataset.hairStyle;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Passo 3: Slider de Altura com atualização em tempo real
    const heightSlider = container.querySelector('#wizHeightSlider');
    const heightVal = container.querySelector('#wizHeightVal');
    if(heightSlider && heightVal){
      heightSlider.oninput = (e) => {
        wizardState.height = Number(e.target.value);
        heightVal.textContent = `${wizardState.height.toFixed(2)} M`;
        refreshAvatarPreview();
        const eng = getEngine();
        const bodyMods = eng.calculateBodyModifiers(wizardState.height, wizardState.bodyBuild);
        const list = container.querySelector('#wizBodyModsList');
        if(list){
          list.innerHTML = bodyMods.texts.map(t => `
            <div style="font-size:12px;color:${t.type==='good'?'#4ade80':t.type==='bad'?'#f87171':'#e2e8f0'};font-weight:600">
              ${t.type==='good'?'+ ':t.type==='bad'?'- ':'• '} ${t.text}
            </div>
          `).join('');
        }
      };
    }

    // Porte Físico
    container.querySelectorAll('.btn-build').forEach(btn => {
      btn.onclick = () => {
        wizardState.bodyBuild = btn.dataset.build;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Pé Preferido
    container.querySelectorAll('.btn-foot').forEach(btn => {
      btn.onclick = () => {
        wizardState.preferredFoot = btn.dataset.foot;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Meião e Acessórios
    container.querySelectorAll('.btn-sock').forEach(btn => {
      btn.onclick = () => {
        wizardState.appearance.sockStyle = btn.dataset.sock;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Chuteiras Básicas
    container.querySelectorAll('.boot-card').forEach(card => {
      card.onclick = () => {
        wizardState.appearance.starterBoot = card.dataset.bootId;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Passo 4: Posição e Arquétipo
    container.querySelectorAll('.btn-pos').forEach(btn => {
      btn.onclick = () => {
        wizardState.position = btn.dataset.pos;
        renderCreatePlayerScreen(container, activeUser);
      };
    });
    container.querySelectorAll('.arch-card').forEach(card => {
      card.onclick = () => {
        wizardState.archetype = card.dataset.archetype;
        if(card.dataset.pos) wizardState.position = card.dataset.pos;
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Passo 5: Distribuição de Pontos
    container.querySelectorAll('.btn-attr-plus').forEach(btn => {
      btn.onclick = () => {
        const attr = btn.dataset.attr;
        if(wizardState.pointsAvailable > 0){
          wizardState.pointsAvailable--;
          wizardState.pointsDistributed[attr] = (wizardState.pointsDistributed[attr] || 0) + 1;
          renderCreatePlayerScreen(container, activeUser);
        }
      };
    });
    container.querySelectorAll('.btn-attr-minus').forEach(btn => {
      btn.onclick = () => {
        const attr = btn.dataset.attr;
        if((wizardState.pointsDistributed[attr] || 0) > 0){
          wizardState.pointsDistributed[attr]--;
          wizardState.pointsAvailable++;
          renderCreatePlayerScreen(container, activeUser);
        }
      };
    });

    // Passo 6: Seleção da Peneira & Disputa do Jogo-Treino
    container.querySelectorAll('.peneira-tier-card').forEach(card => {
      card.onclick = () => {
        wizardState.peneiraTier = card.dataset.tier;
        wizardState.tryoutResult = null; // Reseta teste anterior se trocar de categoria
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Seleção de Clube Ofertante entre os até 3 clubes
    container.querySelectorAll('.tryout-club-option-card').forEach(card => {
      card.onclick = () => {
        const club = card.dataset.club;
        const wage = Number(card.dataset.wage) || 1000;
        const role = card.dataset.role || 'Reserva';
        wizardState.clubName = club;
        if(wizardState.tryoutResult){
          wizardState.tryoutResult.clubName = club;
          wizardState.tryoutResult.wageOffered = wage;
          wizardState.tryoutResult.squadRole = role;
        }
        renderCreatePlayerScreen(container, activeUser);
      };
    });

    // Botão de Disputar Jogo-Treino Interativo (Rodapé ou Card Direto)
    const btnPlayTryout = container.querySelector('#btnPlayTryoutMatch');
    if(btnPlayTryout){
      btnPlayTryout.onclick = () => {
        openInteractiveTryoutModal(container, activeUser);
      };
    }
    const btnPlayDirect = container.querySelector('#btnPlayTryoutDirect');
    if(btnPlayDirect){
      btnPlayDirect.onclick = () => {
        openInteractiveTryoutModal(container, activeUser);
      };
    }
    const btnStep6Retry = container.querySelector('#btnStep6RetryTryout');
    if(btnStep6Retry){
      btnStep6Retry.onclick = () => {
        openInteractiveTryoutModal(container, activeUser);
      };
    }
    const btnStep6Sign = container.querySelector('#btnStep6SignContract');
    if(btnStep6Sign){
      btnStep6Sign.onclick = () => {
        finalizePlayerCareerStart(container);
      };
    }

    // Navegação Geral
    const btnNext = container.querySelector('#btnWizardNext');
    if(btnNext){
      btnNext.onclick = () => {
        if(wizardState.step === 1 && !wizardState.name.trim()){
          if(typeof window.showCustomAlert === 'function'){
            window.showCustomAlert({ title: 'Nome do Atleta', message: 'Por favor, digite o nome do seu atleta.', type: 'warning' });
          } else if(window.AFM_PlayerMode?.showCustomAlert){
            window.AFM_PlayerMode.showCustomAlert({ title: 'Atenção', message: 'Por favor, digite o nome do seu atleta.', type: 'warning' });
          } else if(typeof window.toast === 'function'){
            window.toast('⚠️ Por favor, digite o nome do seu atleta.');
          }
          return;
        }
        if(wizardState.step < 6){
          wizardState.step++;
          renderCreatePlayerScreen(container, activeUser);
        }
      };
    }
    const btnPrev = container.querySelector('#btnWizardPrev');
    if(btnPrev){
      btnPrev.onclick = () => {
        if(wizardState.step > 1){
          wizardState.step--;
          renderCreatePlayerScreen(container, activeUser);
        }
      };
    }
    const btnCancel = container.querySelector('#btnCancelPlayerCreation');
    if(btnCancel){
      btnCancel.onclick = () => {
        const rawUser = (typeof getActiveAccount === 'function' ? getActiveAccount() : null);
        if(typeof window.setupViewMode !== 'undefined') window.setupViewMode = rawUser ? 'select' : 'auth';
        if(typeof window.renderSetup === 'function'){
          window.renderSetup(container);
        }
      };
    }

    // Finalizar e Iniciar Carreira Jogador
    const btnFinish = container.querySelector('#btnWizardFinish');
    if(btnFinish){
      btnFinish.onclick = () => {
        if(!wizardState.tryoutResult?.approved){
          openInteractiveTryoutModal(container, activeUser);
          return;
        }
        finalizePlayerCareerStart(container);
      };
    }
  }

  /**
   * Modal Interativo do Jogo-Treino da Peneira
   */
  function openInteractiveTryoutModal(container, activeUser){
    const eng = getEngine();
    const tryout = eng.simulateTryoutMatch(wizardState.peneiraTier, {
      pos: wizardState.position,
      stateUf: wizardState.stateUf,
      city: wizardState.city,
      attributes: {
        vel: getCurrentOverall(),
        chu: getCurrentOverall(),
        pas: getCurrentOverall(),
        dri: getCurrentOverall(),
        def: getCurrentOverall(),
        fis: getCurrentOverall()
      }
    });

    wizardState.tryoutResult = tryout;
    wizardState.clubName = tryout.clubName;

    const modal = document.createElement('div');
    modal.className = 'afm-custom-modal-overlay';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px';

    const modalOffers = (tryout?.clubOffers && tryout.clubOffers.length > 0)
      ? tryout.clubOffers
      : [{ clubName: tryout.clubName, wageOffered: tryout.wageOffered, division: tryout.division, squadRole: tryout.squadRole }];

    modal.innerHTML = `
      <div style="background:#0f172a;border:2px solid ${tryout.approved ? '#10b981' : '#f59e0b'};border-radius:20px;padding:24px;max-width:540px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.8);color:#fff;animation:afmScaleUp 0.3s ease">
        
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">⚽</span>
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:900">RELATÓRIO DO JOGO-TREINO</h3>
              <div style="font-size:11px;color:#94a3b8">${esc(tryout.tierName)} · ${modalOffers.length} Proposta${modalOffers.length > 1 ? 's' : ''} Recebida${modalOffers.length > 1 ? 's' : ''}</div>
            </div>
          </div>
          <span class="pill" style="background:${tryout.approved ? '#10b981' : '#f59e0b'};color:#000;font-weight:900;font-size:11px">
            ${tryout.approved ? 'APROVADO!' : 'OBSERVAÇÃO'}
          </span>
        </div>

        <!-- LANCES DE DESTAQUE -->
        <div style="margin-bottom:14px">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:6px">LANCES DE DESTAQUE NOS 30 MINUTOS:</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${tryout.events.map(ev => `
              <div style="background:#1e293b;border-left:3px solid #7c3aed;padding:8px 12px;border-radius:6px;font-size:12px;color:#e2e8f0;line-height:1.4">
                ${ev}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- PARECER TÉCNICO & NOTA -->
        <div style="background:rgba(0,0,0,0.4);border-radius:12px;padding:12px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div style="font-size:10px;color:#94a3b8;font-weight:700">PARECER DO COORDENADOR:</div>
            <div style="font-size:12px;color:#fff;font-weight:600;margin-top:2px">${tryout.scoutComment}</div>
          </div>
          <div style="text-align:center;background:#1e293b;border:1px solid #334155;border-radius:10px;padding:6px 12px">
            <span style="font-size:20px;font-weight:900;color:${tryout.scoutRating >= 7.0 ? '#10b981' : '#f59e0b'}">${tryout.scoutRating}</span>
            <div style="font-size:8px;color:#94a3b8">NOTA TÉCNICA</div>
          </div>
        </div>

        ${tryout.approved ? `
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div style="font-size:11px;font-weight:900;color:#34d399;text-transform:uppercase">
                📋 ESCOLHA SEU CLUBE (${modalOffers.length} PROPOSTAS OFICIAIS):
              </div>
              <span style="font-size:10px;color:#94a3b8">Clique para selecionar</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(${Math.min(3, modalOffers.length)}, 1fr);gap:8px">
              ${modalOffers.map((off, idx) => {
                const isChosen = (wizardState.clubName === off.clubName);
                return `
                  <div class="modal-tryout-club-card" data-club="${esc(off.clubName)}" data-wage="${off.wageOffered}" data-role="${esc(off.squadRole || 'Reserva')}" style="background:${isChosen ? 'linear-gradient(135deg, #064e3b, #022c22)' : '#1e293b'};border:2px solid ${isChosen ? '#10b981' : '#334155'};border-radius:10px;padding:10px;cursor:pointer;transition:all 0.2s ease;text-align:center">
                    <span class="pill club-choice-pill" style="background:${isChosen ? '#10b981' : 'rgba(255,255,255,0.08)'};color:${isChosen ? '#000' : '#94a3b8'};font-size:8px;font-weight:900;padding:2px 6px;border-radius:4px;display:inline-block;margin-bottom:4px">
                      ${isChosen ? '✓ ESCOLHIDO' : 'CLIQUE P/ ESCOLHER'}
                    </span>
                    <div style="font-size:13px;font-weight:900;color:#fff">${esc(off.clubName)}</div>
                    <div style="font-size:10px;color:#94a3b8">${esc(off.division || 'Divisão')}</div>
                    <div style="font-size:14px;font-weight:900;color:#10b981;margin-top:4px">R$ ${(off.wageOffered || 1000).toLocaleString('pt-BR')}<span style="font-size:9px;color:#94a3b8">/mês</span></div>
                    <div style="font-size:9px;color:#cbd5e1;margin-top:2px">Papel: <b style="color:#38bdf8">${esc(off.squadRole || 'Reserva')}</b></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <div style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;border-radius:12px;padding:12px;margin-bottom:20px;font-size:12px;color:#fca5a5">
            Dica: Na peneira de elite a exigência física e técnica é altíssima. Você pode tentar novamente para buscar outra sorte ou disputar a Peneira Básica/Média!
          </div>
        `}

        <div style="display:flex;justify-content:flex-end;gap:12px">
          <button type="button" id="btnCloseTryoutModal" class="btn" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:800;padding:10px 18px;border-radius:8px;cursor:pointer">
            Fechar Resumo
          </button>
          ${tryout.approved ? `
            <button type="button" id="btnAcceptTryoutOffer" class="btn success" style="background:linear-gradient(135deg,#10b981,#059669);color:#000;font-weight:900;padding:11px 24px;border-radius:8px;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.4)">
              ✍️ Aceitar Contrato com o ${esc(wizardState.clubName || tryout.clubName)} ➔
            </button>
          ` : `
            <button type="button" id="btnRetryTryout" class="btn warning" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:900;padding:10px 20px;border-radius:8px;cursor:pointer">
              🔄 Tentar Novo Coletivo
            </button>
          `}
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Seleção de Clube no Modal Interativo
    modal.querySelectorAll('.modal-tryout-club-card').forEach(card => {
      card.onclick = () => {
        const club = card.dataset.club;
        const wage = Number(card.dataset.wage) || 1000;
        const role = card.dataset.role || 'Reserva';
        wizardState.clubName = club;
        if(tryout){
          tryout.clubName = club;
          tryout.wageOffered = wage;
          tryout.squadRole = role;
        }
        modal.querySelectorAll('.modal-tryout-club-card').forEach(c => {
          const isThis = (c.dataset.club === club);
          c.style.borderColor = isThis ? '#10b981' : '#334155';
          c.style.background = isThis ? 'linear-gradient(135deg, #064e3b, #022c22)' : '#1e293b';
          c.style.boxShadow = isThis ? '0 0 20px rgba(16,185,129,0.35)' : 'none';
          const pill = c.querySelector('.club-choice-pill');
          if(pill){
            pill.style.background = isThis ? '#10b981' : 'rgba(255,255,255,0.08)';
            pill.style.color = isThis ? '#000' : '#94a3b8';
            pill.textContent = isThis ? '✓ ESCOLHIDO' : 'CLIQUE P/ ESCOLHER';
          }
        });
        const btnAcc = modal.querySelector('#btnAcceptTryoutOffer');
        if(btnAcc){
          btnAcc.innerHTML = `✍️ Aceitar Contrato com o ${esc(club)} ➔`;
        }
      };
    });

    modal.querySelector('#btnCloseTryoutModal').onclick = () => {
      modal.remove();
      renderCreatePlayerScreen(container, activeUser);
    };

    const btnAccept = modal.querySelector('#btnAcceptTryoutOffer');
    if(btnAccept){
      btnAccept.onclick = () => {
        modal.remove();
        finalizePlayerCareerStart(container);
      };
    }

    const btnRetry = modal.querySelector('#btnRetryTryout');
    if(btnRetry){
      btnRetry.onclick = () => {
        modal.remove();
        openInteractiveTryoutModal(container, activeUser);
      };
    }
  }

  /**
   * Conclui a criação e inicia o save no Modo Jogador
   */
  function finalizePlayerCareerStart(container){
    const eng = getEngine();
    try {
      const playerData = {
        name: wizardState.name,
        nickname: wizardState.nickname,
        nationality: wizardState.nationality || 'Brasil',
        shirtNumber: wizardState.shirtNumber,
        stateUf: wizardState.stateUf,
        city: wizardState.city,
        clubName: wizardState.clubName,
        peneiraTier: wizardState.peneiraTier,
        tryoutWage: wizardState.tryoutResult?.wageOffered || null,
        position: wizardState.position,
        archetype: wizardState.archetype,
        height: wizardState.height,
        bodyBuild: wizardState.bodyBuild,
        preferredFoot: wizardState.preferredFoot,
        pointsDistributed: wizardState.pointsDistributed,
        remainingSkillPoints: Math.max(0, Number(wizardState.pointsAvailable) || 0),
        appearance: wizardState.appearance
      };

      const targetSlot = (typeof window.setupSelectedSlot === 'number') ? window.setupSelectedSlot : 2;
      eng.startPlayerCareer(playerData, targetSlot);
    } catch(err){
      console.error('Erro ao iniciar carreira jogador:', err);
      if(typeof window.showCustomAlert === 'function'){
        window.showCustomAlert({ title: 'Erro ao Iniciar Carreira', message: err.message || 'Falha ao iniciar carreira.', type: 'danger' });
      } else if(window.AFM_PlayerMode?.showCustomAlert){
        window.AFM_PlayerMode.showCustomAlert({ title: 'Erro', message: err.message || 'Falha ao iniciar carreira.', type: 'danger' });
      } else if(typeof window.toast === 'function'){
        window.toast(`❌ ${err.message || 'Falha ao iniciar carreira.'}`);
      }
    }
  }

  // Exporta a interface globalmente
  window.renderCreatePlayerScreen = renderCreatePlayerScreen;
  window.AFM_CreatePlayerUI = {
    renderCreatePlayerScreen,
    getWizardState: () => wizardState,
    setWizardState: (st) => { wizardState = Object.assign(wizardState, st); }
  };

})(window);
