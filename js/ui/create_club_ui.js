/**
 * =========================================================================
 * AFM MANAGER 2027 - MODO CRIAR SEU TIME (CREATE-A-CLUB)
 * =========================================================================
 * Sistema oficial para criação e personalização de clube do zero:
 * - Nome do clube, Sigla (até 4 letras) e Nome do Estádio
 * - Emblema (Escudo): 6 Formatos de Brasão, Paleta de Cores, 10 Estampagens e Sigla
 * - Uniformes (Kit Casa e Fora): Estilos (Liso, Listras, Faixa, Meio a Meio), Cores 2D
 * - Começa em 1 dos 11 Campeonatos Estaduais com 1 vaga oficial
 * - Orçamento inicial: R$ 300.000 (R$ 300 mil em caixa)
 * - Estádio (5.000 lugares) e Instalações todas no Nível 1
 * - Elenco inicial de 20 atletas formados da região (OVR 54-64)
 */

(function(window){
  'use strict';

  const customClubDraft = {
    name: 'Valência Futebol Clube',
    shortName: 'VFC',
    stadiumName: 'Arena dos Sonhos',
    stateCompId: 'bra-est-sp',
    badge: {
      shape: 'classic',
      primaryColor: '#1e3a8a',
      secondaryColor: '#facc15',
      pattern: 'star',
      patternColor: '#ffffff',
      motto: 'VFC',
      mottoColor: '#ffffff'
    },
    homeKit: {
      style: 'stripes_v',
      shirtColor: '#1e3a8a',
      secondaryColor: '#ffffff',
      shortsColor: '#1e3a8a',
      socksColor: '#ffffff'
    },
    awayKit: {
      style: 'solid',
      shirtColor: '#ffffff',
      secondaryColor: '#1e3a8a',
      shortsColor: '#ffffff',
      socksColor: '#1e3a8a'
    }
  };

  const PALETTE = ['#0f172a', '#ffffff', '#1e3a8a', '#dc2626', '#16a34a', '#facc15', '#7c3aed', '#831843', '#ea580c', '#0284c7', '#78350f', '#d97706'];

  const SHAPES = [
    { id: 'classic', label: 'Clássico' },
    { id: 'round', label: 'Redondo' },
    { id: 'diamond', label: 'Losango' },
    { id: 'french', label: 'Francês' },
    { id: 'modern', label: 'Moderno' },
    { id: 'crown_shield', label: 'Coroa' }
  ];

  const PATTERNS = [
    { id: 'none', label: 'Nenhuma' },
    { id: 'stripes_v', label: 'Listras V.' },
    { id: 'stripes_h', label: 'Listras H.' },
    { id: 'diagonal_sash', label: 'Faixa Diag.' },
    { id: 'half', label: 'Meio a Meio' },
    { id: 'star', label: 'Estrela ⭐' },
    { id: 'ball', label: 'Bola ⚽' },
    { id: 'crown', label: 'Coroa 👑' },
    { id: 'lightning', label: 'Raio ⚡' },
    { id: 'cross', label: 'Cruz ✝️' }
  ];

  const KIT_STYLES = [
    { id: 'solid', label: 'Liso' },
    { id: 'stripes_v', label: 'Listras Verticais' },
    { id: 'stripes_h', label: 'Listras Horizontais' },
    { id: 'half', label: 'Meio a Meio' },
    { id: 'sash_diagonal', label: 'Faixa Diagonal' },
    { id: 'sleeves', label: 'Mangas Contrastantes' },
    { id: 'v_neck', label: 'Chevron / V' }
  ];

  const DEFAULT_ESTADUAIS = [
    { id: "bra-est-df", name: "Candangão DF", state: "Distrito Federal", clubsCount: 10, trophy: "🏛️", color: "#a7ff3f", clubs: ["Brasília", "Gama", "Brasiliense", "Capital-DF", "Ceilândia", "Real Brasília", "Samambaia", "Paranoá", "Planaltina", "Santa Maria"] },
    { id: "bra-est-sp", name: "Paulistão SP", state: "São Paulo", clubsCount: 16, trophy: "⚽", color: "#38bdf8", clubs: ["Corinthians", "Palmeiras", "São Paulo", "Santos", "Red Bull Bragantino", "Ponte Preta", "Guarani", "Novorizontino", "Mirassol", "Botafogo-SP", "São Bernardo", "Ituano", "Inter de Limeira", "Água Santa", "Noroeste", "Velo Clube"] },
    { id: "bra-est-rj", name: "Carioca RJ", state: "Rio de Janeiro", clubsCount: 12, trophy: "🌴", color: "#f43f5e", clubs: ["Flamengo", "Fluminense", "Vasco da Gama", "Botafogo", "Volta Redonda", "Nova Iguaçu", "Boavista", "Bangu", "Madureira", "Portuguesa-RJ", "Sampaio Corrêa-RJ", "Maricá"] },
    { id: "bra-est-mg", name: "Mineiro MG", state: "Minas Gerais", clubsCount: 12, trophy: "⛰️", color: "#facc15", clubs: ["Atlético-MG", "Cruzeiro", "América-MG", "Athletic Club", "Tombense", "Pouso Alegre", "Villa Nova", "Democrata-GV", "Ipatinga", "Uberlândia", "Itabirito", "Betim"] },
    { id: "bra-est-rs", name: "Gaúcho RS", state: "Rio Grande do Sul", clubsCount: 12, trophy: "🧉", color: "#06b6d4", clubs: ["Grêmio", "Internacional", "Juventude", "Caxias", "Brasil de Pelotas", "Ypiranga", "São José-RS", "Novo Hamburgo", "Avenida", "São Luiz", "Monsoon", "Guarany de Bagé"] },
    { id: "bra-est-pr", name: "Paranaense PR", state: "Paraná", clubsCount: 10, trophy: "🌲", color: "#10b981", clubs: ["Athletico-PR", "Coritiba", "Operário-PR", "Maringá", "Londrina", "FC Cascavel", "Cianorte", "Azuriz", "São-Joseense", "Andraus"] },
    { id: "bra-est-sc", name: "Catarinense SC", state: "Santa Catarina", clubsCount: 10, trophy: "🏖️", color: "#a855f7", clubs: ["Criciúma", "Chapecoense", "Avaí", "Figueirense", "Brusque", "Marcílio Dias", "Joinville", "Concórdia", "Barra-SC", "Hercílio Luz"] },
    { id: "bra-est-ba", name: "Baiano BA", state: "Bahia", clubsCount: 10, trophy: "☀️", color: "#f97316", clubs: ["Bahia", "Vitória", "Jacuipense", "Juazeirense", "Barcelona de Ilhéus", "Jequié", "Atlético de Alagoinhas", "Bahia de Feira", "Porto-BA", "Jacobina"] },
    { id: "bra-est-ce", name: "Cearense CE", state: "Ceará", clubsCount: 10, trophy: "🌊", color: "#ec4899", clubs: ["Fortaleza", "Ceará", "Ferroviário", "Iguatu", "Floresta", "Maracanã-CE", "Atlético-CE", "Caucaia", "Horizonte", "Barbalha"] },
    { id: "bra-est-go", name: "Goiano GO", state: "Goiás", clubsCount: 10, trophy: "🌾", color: "#84cc16", clubs: ["Goiás", "Atlético-GO", "Vila Nova", "Aparecidense", "Anápolis", "CRAC", "Goianésia", "Goiatuba", "Iporá", "Morrinhos"] },
    { id: "bra-est-pe", name: "Pernambucano PE", state: "Pernambuco", clubsCount: 10, trophy: "🦁", color: "#e11d48", clubs: ["Sport Recife", "Náutico", "Santa Cruz", "Retrô", "Central de Caruaru", "Maguary", "Petrolina", "Afogados", "Porto-PE", "Flamengo de Arcoverde"] }
  ];

  function escText(t) {
    if (typeof window.esc === 'function') return window.esc(t);
    return String(t || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  function generateBadgeSvg(b, size = 120) {
    const s = size;
    const p = b.primaryColor || '#1e3a8a';
    const sc = b.secondaryColor || '#facc15';
    const pc = b.patternColor || '#ffffff';
    const mc = b.mottoColor || '#ffffff';
    const motto = (b.motto || '').trim();
    const pat = b.pattern || 'none';
    const shape = b.shape || 'classic';

    let pathD = 'M 12 10 L 88 10 L 88 55 C 88 78 50 95 50 95 C 50 95 12 78 12 55 Z';
    if (shape === 'round') pathD = 'M 50 8 A 42 42 0 1 0 50 92 A 42 42 0 1 0 50 8 Z';
    else if (shape === 'diamond') pathD = 'M 50 8 L 92 50 L 50 92 L 8 50 Z';
    else if (shape === 'french') pathD = 'M 14 12 L 86 12 L 86 60 Q 86 85 50 96 Q 14 85 14 60 Z';
    else if (shape === 'modern') pathD = 'M 15 18 Q 50 8 85 18 L 85 56 Q 85 84 50 96 Q 15 84 15 56 Z';
    else if (shape === 'crown_shield') pathD = 'M 14 26 L 26 12 L 38 24 L 50 12 L 62 24 L 74 12 L 86 26 L 86 58 C 86 82 50 96 50 96 C 50 96 14 82 14 58 Z';

    let patSvg = '';
    if (pat === 'half') patSvg = `<rect x="50" y="0" width="50" height="100" fill="${sc}" />`;
    else if (pat === 'stripes_v') patSvg = `<rect x="22" y="0" width="11" height="100" fill="${sc}" /><rect x="44" y="0" width="12" height="100" fill="${sc}" /><rect x="67" y="0" width="11" height="100" fill="${sc}" />`;
    else if (pat === 'stripes_h') patSvg = `<rect x="0" y="20" width="100" height="12" fill="${sc}" /><rect x="0" y="44" width="100" height="12" fill="${sc}" /><rect x="0" y="68" width="100" height="12" fill="${sc}" />`;
    else if (pat === 'diagonal_sash') patSvg = `<polygon points="0,0 26,0 100,74 100,100 74,100 0,26" fill="${sc}" />`;
    else if (pat === 'star') patSvg = `<polygon points="50,20 55,36 72,36 58,47 63,64 50,53 37,64 42,47 28,36 45,36" fill="${pc}" />`;
    else if (pat === 'cross') patSvg = `<rect x="43" y="0" width="14" height="100" fill="${pc}" /><rect x="0" y="40" width="100" height="14" fill="${pc}" />`;
    else if (pat === 'crown') patSvg = `<polygon points="30,56 70,56 68,40 59,48 50,34 41,48 32,40" fill="${pc}" /><circle cx="50" cy="32" r="2.5" fill="${sc}" /><circle cx="32" cy="38" r="2" fill="${sc}" /><circle cx="68" cy="38" r="2" fill="${sc}" />`;
    else if (pat === 'lightning') patSvg = `<polygon points="54,18 36,46 48,46 44,74 64,42 52,42" fill="${pc}" />`;
    else if (pat === 'ball') patSvg = `<circle cx="50" cy="44" r="17" fill="#ffffff" stroke="${sc}" stroke-width="2"/><polygon points="50,37 57,42 54,49 46,49 43,42" fill="${pc}"/><line x1="50" y1="37" x2="50" y2="27" stroke="${sc}" stroke-width="1.5"/><line x1="57" y1="42" x2="66" y2="39" stroke="${sc}" stroke-width="1.5"/><line x1="54" y1="49" x2="60" y2="58" stroke="${sc}" stroke-width="1.5"/><line x1="46" y1="49" x2="40" y2="58" stroke="${sc}" stroke-width="1.5"/><line x1="43" y1="42" x2="34" y2="39" stroke="${sc}" stroke-width="1.5"/>`;

    const clipId = 'crest_clip_' + Math.random().toString(36).slice(2, 8);
    const textY = pat === 'none' ? 57 : (pat === 'star' || pat === 'crown' || pat === 'ball' ? 76 : 56);

    return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs><clipPath id="${clipId}"><path d="${pathD}" /></clipPath></defs>` +
      `<path d="${pathD}" fill="${p}" />` +
      `<g clip-path="url(#${clipId})">${patSvg}</g>` +
      (motto ? `<text x="50" y="${textY}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${motto.length > 4 ? 12 : motto.length > 3 ? 14 : 17}" fill="${mc}" stroke="rgba(0,0,0,0.5)" stroke-width="0.8" letter-spacing="1">${escText(motto)}</text>` : '') +
      `<path d="${pathD}" fill="none" stroke="${sc}" stroke-width="4" stroke-linejoin="round" />` +
      `<path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1.5" stroke-linejoin="round" />` +
    `</svg>`;
  }

  function generateKitSvg(kit, badgeSvg = '', size = 150) {
    const s = size;
    const style = kit.style || 'solid';
    const cShirt = kit.shirtColor || '#1e3a8a';
    const cSec = kit.secondaryColor || '#ffffff';
    const cShorts = kit.shortsColor || '#1e3a8a';
    const cSocks = kit.socksColor || '#ffffff';

    let torsoPattern = '';
    if (style === 'stripes_v') {
      torsoPattern = `<rect x="42" y="16" width="7" height="48" fill="${cSec}" /><rect x="56" y="16" width="8" height="48" fill="${cSec}" /><rect x="71" y="16" width="7" height="48" fill="${cSec}" />`;
    } else if (style === 'stripes_h') {
      torsoPattern = `<rect x="36" y="26" width="48" height="6" fill="${cSec}" /><rect x="36" y="38" width="48" height="6" fill="${cSec}" /><rect x="36" y="50" width="48" height="6" fill="${cSec}" />`;
    } else if (style === 'half') {
      torsoPattern = `<rect x="60" y="16" width="24" height="48" fill="${cSec}" />`;
    } else if (style === 'sash_diagonal') {
      torsoPattern = `<polygon points="36,16 48,16 84,52 84,64 72,64 36,28" fill="${cSec}" />`;
    } else if (style === 'v_neck') {
      torsoPattern = `<polygon points="36,16 60,38 84,16 76,16 60,30 44,16" fill="${cSec}" />`;
    }

    const sleeveColor = style === 'sleeves' ? cSec : cShirt;
    const clipId = 'shirt_clip_' + Math.random().toString(36).slice(2, 8);

    return `<svg viewBox="0 0 120 140" width="${s}" height="${Math.round(s * 1.16)}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        `<clipPath id="${clipId}"><path d="M 36 16 L 84 16 L 84 64 L 36 64 Z" /></clipPath>` +
        `<filter id="kitShadow" x="-10%" y="-10%" width="120%" height="120%">` +
          `<feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.35"/>` +
        `</filter>` +
      `</defs>` +

      `<g filter="url(#kitShadow)">` +
        `<polygon points="36,16 12,34 22,46 36,34" fill="${sleeveColor}" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>` +
        `<polygon points="84,16 108,34 98,46 84,34" fill="${sleeveColor}" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>` +
        `<polygon points="12,34 16,37 26,49 22,46" fill="${cSec}" />` +
        `<polygon points="108,34 104,37 94,49 98,46" fill="${cSec}" />` +

        `<rect x="36" y="16" width="48" height="48" rx="2" fill="${cShirt}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />` +
        `<g clip-path="url(#${clipId})">${torsoPattern}</g>` +

        `<path d="M 48 16 Q 60 25 72 16 Z" fill="#0f172a" />` +
        `<path d="M 48 16 Q 60 25 72 16" fill="none" stroke="${cSec}" stroke-width="2" />` +

        `<circle cx="48" cy="28" r="4.5" fill="${cSec}" />` +
        `<circle cx="48" cy="28" r="3" fill="${cShirt}" />` +

        `<polygon points="38,68 58,68 56,95 36,95" fill="${cShorts}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />` +
        `<polygon points="62,68 82,68 84,95 64,95" fill="${cShorts}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />` +
        `<rect x="38" y="67" width="44" height="2" fill="${cSec}" />` +
        `<line x1="36" y1="94" x2="56" y2="94" stroke="${cSec}" stroke-width="2" />` +
        `<line x1="64" y1="94" x2="84" y2="94" stroke="${cSec}" stroke-width="2" />` +

        `<rect x="42" y="99" width="12" height="28" rx="1" fill="${cSocks}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />` +
        `<rect x="66" y="99" width="12" height="28" rx="1" fill="${cSocks}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />` +
        `<rect x="42" y="99" width="12" height="5" fill="${cSec}" />` +
        `<rect x="66" y="99" width="12" height="5" fill="${cSec}" />` +

        `<path d="M 40 127 L 54 127 L 54 133 L 37 133 Z" fill="#0f172a" />` +
        `<path d="M 66 127 L 80 127 L 83 133 L 66 133 Z" fill="#0f172a" />` +
      `</g>` +
    `</svg>`;
  }

  function generateCustomClubSquad(clubName) {
    const NAMES = window.NAMES || ['Gabriel','Lucas','Matheus','Rafael','Bruno','Gustavo','Caio','João','Pedro','André','Felipe','Diego','Thiago','Henrique','Victor','Murilo','Samuel','Daniel','Arthur','Vinícius','Nicolas','Eduardo','Leonardo','Igor','Renan','Rodrigo','Cristian','Marcos','Alexandre','Miguel','Davi','Wesley','Ruan','Kauã','Yuri','Danilo','Luan','Vitor'];
    const LAST = window.LAST || ['Silva','Santos','Oliveira','Costa','Pereira','Souza','Rodrigues','Almeida','Lima','Gomes','Martins','Rocha','Ribeiro','Carvalho','Mendes','Barbosa','Freitas','Nunes','Moreira','Cardoso','Teixeira','Moura','Araújo','Monteiro','Ferreira'];
    const rnd = window.rnd || ((min, max) => Math.floor(Math.random() * (max - min + 1)) + min);
    const clamp = window.clamp || ((v, min, max) => Math.max(min, Math.min(max, v)));
    const norm = window.norm || (s => String(s||'').toLowerCase());

    const positionsNeeded = ['GK','GK','RB','RB','CB','CB','CB','CB','LB','LB','DM','DM','CM','CM','AM','AM','RW','LW','ST','ST'];
    const usedNames = new Set();
    return positionsNeeded.map((pos, idx) => {
      let name;
      do {
        name = `${NAMES[rnd(0, NAMES.length - 1)]} ${LAST[rnd(0, LAST.length - 1)]}`;
      } while (usedNames.has(name));
      usedNames.add(name);

      const age = rnd(19, 31);
      const ovr = rnd(54, 64);
      const wage = Math.round(clamp(1500 + (ovr - 54) * 230 + rnd(-100, 150), 1200, 4200));
      const value = Math.round(clamp(0.04 + (ovr - 54) * 0.02 + (30 - age) * 0.01, 0.03, 0.35) * 100) / 100;
      return {
        id: `custom_${norm(clubName)}_${idx}_${Date.now()}`,
        name,
        pos,
        age,
        ovr,
        overall: ovr,
        pot: clamp(ovr + rnd(3, 14), ovr, 82),
        wage,
        value,
        contractUntil: 2028,
        morale: 75,
        fitness: 100,
        club: clubName,
        owned: true,
        marketKey: `${name}_${clubName}_${pos}`
      };
    });
  }

  function renderCreateClubScreen(app, activeUser) {
    if (!app) app = document.querySelector('#app');
    if (!app) return;

    const estData = (window.AFM_ESTADUAIS_DATA && window.AFM_ESTADUAIS_DATA.length) ? window.AFM_ESTADUAIS_DATA : DEFAULT_ESTADUAIS;
    const curEst = estData.find(e => e.id === customClubDraft.stateCompId) || estData[1] || { id: 'bra-est-sp', name: 'Paulistão SP', clubsCount: 16 };
    const userSlots = typeof window.getUserSaveSlots === 'function' ? window.getUserSaveSlots(activeUser?.username) : [null, null, null];
    const selSlot = window.setupSelectedSlot || 1;

    app.innerHTML = `
      <div class="create-club-wrapper">
        
        <!-- TOPBAR SUPERIOR -->
        <div class="create-club-topbar">
          <div class="create-club-title-group">
            <button type="button" class="btn" id="btnBackFromCreateClub" style="font-size:12px;font-weight:800;padding:8px 16px;border-radius:10px;background:rgba(255,255,255,0.08);color:#fff;cursor:pointer">
              ◀ Voltar
            </button>
            <div>
              <h1>🎨 CRIAR SEU PRÓPRIO CLUBE</h1>
              <div style="font-size:12px;color:#94a3b8;margin-top:2px">
                Monte seu clube do zero, personalize o visual e comece sua jornada no futebol estadual
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <!-- SELETOR DE SLOT -->
            <div style="display:flex;align-items:center;gap:6px;background:#0d1527;padding:5px 10px;border-radius:10px;border:1px solid rgba(255,255,255,0.1)">
              <span style="font-size:11px;font-weight:800;color:#94a3b8">SLOT:</span>
              ${[1, 2, 3].map(slotNum => {
                const hasSave = !!userSlots[slotNum - 1];
                const isSel = (selSlot === slotNum);
                return `
                  <button type="button" class="pill ${isSel ? 'good' : 'muted'} btnPickSlotCreateClub" data-slot="${slotNum}" style="cursor:pointer;font-weight:900;font-size:11px;padding:3px 8px">
                    Slot ${slotNum} ${hasSave ? '⚠️' : '✨'}
                  </button>
                `;
              }).join('')}
            </div>

            <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#94a3b8">
              Treinador:
              <input id="customManagerNameInput" class="saas-input" value="${escText(activeUser?.name || 'Prof. Aquino')}" style="padding:4px 10px;font-size:12px;width:130px">
            </label>

            <button type="button" class="btn primary" id="btnTopLaunchCreateClub" style="padding:9px 18px;font-size:12px;font-weight:900;border-radius:10px;background:linear-gradient(135deg,#a855f7,#38bdf8);box-shadow:0 4px 14px rgba(168,85,247,0.4);cursor:pointer">
              🚀 Iniciar Carreira ➔
            </button>
          </div>
        </div>

        <!-- SEÇÃO 1: INPUTS SUPERIORES (NOME, SIGLA, ESTÁDIO) -->
        <div class="create-club-top-inputs">
          <label class="field" style="margin:0">
            <span class="create-club-field-label">⚽ Nome do Clube</span>
            <input id="customClubNameInput" class="saas-input" value="${escText(customClubDraft.name)}" placeholder="Ex: Valência Futebol Clube" maxlength="32">
          </label>

          <label class="field" style="margin:0">
            <span class="create-club-field-label">🏷️ Sigla Abreviada</span>
            <input id="customClubShortNameInput" class="saas-input" value="${escText(customClubDraft.shortName)}" placeholder="Ex: VFC" maxlength="4" style="text-transform:uppercase">
          </label>

          <label class="field" style="margin:0">
            <span class="create-club-field-label">🏟️ Nome do Estádio</span>
            <input id="customClubStadiumInput" class="saas-input" value="${escText(customClubDraft.stadiumName)}" placeholder="Ex: Arena dos Sonhos" maxlength="36">
          </label>
        </div>

        <!-- SEÇÃO 2: PREVIEWS LADO A LADO (EMBLEMA, KIT CASA, KIT FORA) -->
        <div class="create-club-previews-grid">
          <!-- CARD 1: EMBLEMA -->
          <div class="create-club-preview-card">
            <div class="create-club-preview-header">
              <span>🛡️</span> EMBLEMA DO CLUBE
            </div>
            <div class="create-club-preview-box" id="customBadgePreviewBox">
              ${generateBadgeSvg(customClubDraft.badge, 120)}
            </div>
            <button type="button" class="btn primary" id="btnOpenBadgeModal" style="width:100%;font-weight:900;padding:10px 14px;border-radius:10px;margin-top:14px;background:linear-gradient(135deg,#a855f7,#6366f1);cursor:pointer">
              🎨 DEFINIR EMBLEMA
            </button>
          </div>

          <!-- CARD 2: KIT CASA -->
          <div class="create-club-preview-card">
            <div class="create-club-preview-header">
              <span>👕</span> EQUIPAMENTO DA CASA
            </div>
            <div class="create-club-preview-box" id="customHomeKitPreviewBox">
              ${generateKitSvg(customClubDraft.homeKit, '', 110)}
            </div>
            <button type="button" class="btn primary" id="btnOpenHomeKitModal" style="width:100%;font-weight:900;padding:10px 14px;border-radius:10px;margin-top:14px;background:linear-gradient(135deg,#38bdf8,#2563eb);cursor:pointer">
              👕 DEFINIR O EQUIPAMENTO
            </button>
          </div>

          <!-- CARD 3: KIT FORA -->
          <div class="create-club-preview-card">
            <div class="create-club-preview-header">
              <span>🎽</span> EQUIPAMENTO DE FORA
            </div>
            <div class="create-club-preview-box" id="customAwayKitPreviewBox">
              ${generateKitSvg(customClubDraft.awayKit, '', 110)}
            </div>
            <button type="button" class="btn primary" id="btnOpenAwayKitModal" style="width:100%;font-weight:900;padding:10px 14px;border-radius:10px;margin-top:14px;background:linear-gradient(135deg,#f43f5e,#be123c);cursor:pointer">
              🎽 DEFINIR O EQUIPAMENTO
            </button>
          </div>
        </div>

        <!-- SEÇÃO 3: ESCOLHA DO CAMPEONATO ESTADUAL DE INÍCIO -->
        <div class="create-club-estadual-section">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <div style="font-size:14px;font-weight:900;color:#fff;letter-spacing:0.5px;text-transform:uppercase">
                🏆 ESCOLHA O CAMPEONATO ESTADUAL DE INÍCIO
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                Seu clube ocupará 1 vaga oficial no estadual escolhido, disputará a tabela oficial de 2026 e buscará vaga na Série D e Copa do Brasil!
              </div>
            </div>
            <span class="pill good" style="font-size:10px;padding:4px 10px;font-weight:900">
              SELECIONADO: ${escText(curEst.name)} (${curEst.clubsCount} CLUBES)
            </span>
          </div>

          <div class="create-club-estadual-grid">
            ${estData.map(est => {
              const isSel = (est.id === customClubDraft.stateCompId);
              return `
                <div class="create-club-estadual-card ${isSel ? 'active' : ''}" data-state-id="${est.id}">
                  <span style="font-size:24px">${est.trophy || '⚽'}</span>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                      ${est.name}
                    </div>
                    <div style="font-size:10px;color:${est.color || '#a7ff3f'};font-weight:700">
                      ${est.state} · ${est.clubsCount} times
                    </div>
                  </div>
                  ${isSel ? '<span style="color:#facc15;font-weight:900">✓</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- SEÇÃO 4: RESUMO DAS CONDIÇÕES INICIAIS (DESAFIO REALISTA) -->
        <div class="create-club-challenge-box">
          <div class="create-club-challenge-item">
            <div class="icon">💰</div>
            <div>
              <div class="title">Caixa Inicial</div>
              <div class="val" style="color:#22c55e">R$ 300.000</div>
              <div class="small muted" style="font-size:10px">Saldo reservado para o início da temporada</div>
            </div>
          </div>

          <div class="create-club-challenge-item">
            <div class="icon">🏟️</div>
            <div>
              <div class="title">Estádio Inicial</div>
              <div class="val" style="color:#38bdf8">Nível 1 (5.000 lugares)</div>
              <div class="small muted" style="font-size:10px">Expansível até 100.000 conforme seu sucesso</div>
            </div>
          </div>

          <div class="create-club-challenge-item">
            <div class="icon">🏗️</div>
            <div>
              <div class="title">Instalações</div>
              <div class="val" style="color:#c084fc">Todas no Nível 1</div>
              <div class="small muted" style="font-size:10px">CT, Base, DM, Loja, Finanças e Marketing</div>
            </div>
          </div>

          <div class="create-club-challenge-item">
            <div class="icon">👥</div>
            <div>
              <div class="title">Elenco Inicial</div>
              <div class="val" style="color:#facc15">20 Atletas (OVR 54-64)</div>
              <div class="small muted" style="font-size:10px">Folha salarial equilibrada e competitiva</div>
            </div>
          </div>
        </div>

        <!-- BOTÃO DE INICIAR CARREIRA -->
        <button type="button" class="btn primary saas-launch-btn" id="btnBottomLaunchCreateClub" style="padding:16px 28px;font-size:15px;font-weight:900;border-radius:14px;background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 6px 25px rgba(34,197,94,0.4);cursor:pointer;width:100%">
          🚀 INICIAR CARREIRA COM O ${escText(customClubDraft.name.toUpperCase())} NO ${escText(curEst.name.toUpperCase())} (SALVAR NO SLOT ${selSlot}) ➔
        </button>

      </div>
    `;

    bindCreateClubEvents(app, activeUser);
  }

  function bindCreateClubEvents(app, activeUser) {
    const $ = sel => document.querySelector(sel);
    const $$ = sel => document.querySelectorAll(sel);

    const nameInp = $('#customClubNameInput');
    if (nameInp) nameInp.oninput = () => { customClubDraft.name = nameInp.value; };

    const shortInp = $('#customClubShortNameInput');
    if (shortInp) shortInp.oninput = () => {
      customClubDraft.shortName = shortInp.value.toUpperCase();
      if (customClubDraft.badge.motto.length <= 4) {
        customClubDraft.badge.motto = customClubDraft.shortName;
        const bBox = $('#customBadgePreviewBox');
        if (bBox) bBox.innerHTML = generateBadgeSvg(customClubDraft.badge, 120);
      }
    };

    const stdInp = $('#customClubStadiumInput');
    if (stdInp) stdInp.oninput = () => { customClubDraft.stadiumName = stdInp.value; };

    const btnBack = $('#btnBackFromCreateClub');
    if (btnBack) btnBack.onclick = () => {
      window.setupViewMode = 'select';
      if (typeof window.renderSetup === 'function') window.renderSetup(app);
    };

    $$('.btnPickSlotCreateClub').forEach(btn => {
      btn.onclick = () => {
        window.setupSelectedSlot = Number(btn.dataset.slot);
        if (typeof window.toast === 'function') window.toast(`Slot ${window.setupSelectedSlot} selecionado para o novo clube!`);
        renderCreateClubScreen(app, activeUser);
      };
    });

    $$('.create-club-estadual-card').forEach(card => {
      card.onclick = () => {
        customClubDraft.stateCompId = card.dataset.stateId;
        renderCreateClubScreen(app, activeUser);
      };
    });

    const btnBadge = $('#btnOpenBadgeModal');
    if (btnBadge) btnBadge.onclick = () => openCustomBadgeModal(app, activeUser);

    const btnHomeKit = $('#btnOpenHomeKitModal');
    if (btnHomeKit) btnHomeKit.onclick = () => openCustomKitModal('home', app, activeUser);

    const btnAwayKit = $('#btnOpenAwayKitModal');
    if (btnAwayKit) btnAwayKit.onclick = () => openCustomKitModal('away', app, activeUser);

    function launchCreatedClubCareer() {
      const finalName = (customClubDraft.name || '').trim();
      if (!finalName) {
        if (typeof window.toast === 'function') window.toast('Digite o nome do seu clube antes de iniciar.');
        return;
      }
      const finalShort = (customClubDraft.shortName || '').trim().toUpperCase() || (typeof window.initials === 'function' ? window.initials(finalName) : finalName.slice(0, 3).toUpperCase());
      const finalStadium = (customClubDraft.stadiumName || '').trim() || `Arena ${finalName}`;
      const mgrInput = $('#customManagerNameInput');
      const curUser = typeof window.getActiveAccount === 'function' ? window.getActiveAccount() : activeUser;
      const finalMgr = (mgrInput ? mgrInput.value.trim() : (curUser?.name || 'Prof. Aquino')) || 'Prof. Aquino';
      const finalSlot = window.setupSelectedSlot || 1;
      const finalBadgeSvg = generateBadgeSvg(customClubDraft.badge, 64);

      if (typeof window.newCareer === 'function') {
        window.newCareer({
          isCustomClub: true,
          clubName: finalName,
          shortName: finalShort,
          stadiumName: finalStadium,
          stateCompId: customClubDraft.stateCompId || 'bra-est-sp',
          badgeConfig: { ...customClubDraft.badge },
          badgeSvg: finalBadgeSvg,
          homeKit: { ...customClubDraft.homeKit },
          awayKit: { ...customClubDraft.awayKit },
          manager: finalMgr,
          slot: finalSlot
        });
      }
    }

    const btnTopLaunch = $('#btnTopLaunchCreateClub');
    if (btnTopLaunch) btnTopLaunch.onclick = launchCreatedClubCareer;

    const btnBottomLaunch = $('#btnBottomLaunchCreateClub');
    if (btnBottomLaunch) btnBottomLaunch.onclick = launchCreatedClubCareer;
  }

  function openCustomBadgeModal(app, activeUser) {
    let container = document.querySelector('#customClubModalContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'customClubModalContainer';
      document.body.appendChild(container);
    }

    let tempBadge = { ...customClubDraft.badge };

    function renderModalHtml() {
      container.innerHTML = `
        <div class="create-club-modal-overlay">
          <div class="create-club-modal-card">
            <div class="create-club-modal-header">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:22px">🛡️</span>
                <div>
                  <div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:0.5px">CRIAR UM EMBLEMA</div>
                  <div style="font-size:11px;color:#c084fc;font-weight:700">Personalize a forma, cores, símbolos e sigla do brasão</div>
                </div>
              </div>
              <button type="button" class="btn" id="btnCloseBadgeModal" style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer">
                ✕ Fechar
              </button>
            </div>

            <div class="create-club-modal-body">
              <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                <div id="modalBadgePreview" style="width:100%;min-height:220px;background:radial-gradient(circle,rgba(255,255,255,0.06) 0%,rgba(0,0,0,0.5) 100%);border:1px solid rgba(255,255,255,0.1);border-radius:16px;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box">
                  ${generateBadgeSvg(tempBadge, 180)}
                </div>
                <div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">
                  PRÉ-VISUALIZAÇÃO AO VIVO
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:14px">
                
                <div>
                  <label class="create-club-field-label">Forma do Emblema</label>
                  <div class="option-picker-grid">
                    ${SHAPES.map(s => `
                      <button type="button" class="option-pill-btn shape-btn ${tempBadge.shape === s.id ? 'active' : ''}" data-shape="${s.id}">
                        ${s.label}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Cor Primária (Fundo do Escudo)</label>
                  <div class="color-swatches-grid">
                    ${PALETTE.map(c => `
                      <button type="button" class="color-swatch-circle color-primary-btn ${tempBadge.primaryColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                    `).join('')}
                    <input type="color" id="badgeNativePrimary" class="color-picker-native" value="${tempBadge.primaryColor}" title="Cor personalizada">
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Cor Secundária (Bordas & Detalhes)</label>
                  <div class="color-swatches-grid">
                    ${PALETTE.map(c => `
                      <button type="button" class="color-swatch-circle color-secondary-btn ${tempBadge.secondaryColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                    `).join('')}
                    <input type="color" id="badgeNativeSecondary" class="color-picker-native" value="${tempBadge.secondaryColor}" title="Cor personalizada">
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Estampagem / Símbolo Central</label>
                  <div class="option-picker-grid">
                    ${PATTERNS.map(p => `
                      <button type="button" class="option-pill-btn pattern-btn ${tempBadge.pattern === p.id ? 'active' : ''}" data-pattern="${p.id}">
                        ${p.label}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Cor da Estampagem / Símbolo</label>
                  <div class="color-swatches-grid">
                    ${PALETTE.map(c => `
                      <button type="button" class="color-swatch-circle color-pattern-btn ${tempBadge.patternColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                    `).join('')}
                    <input type="color" id="badgeNativePattern" class="color-picker-native" value="${tempBadge.patternColor}" title="Cor personalizada">
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:flex-end">
                  <label class="field" style="margin:0">
                    <span class="create-club-field-label">Lema / Sigla no Escudo</span>
                    <input id="badgeMottoInput" class="saas-input" value="${escText(tempBadge.motto)}" maxlength="5" placeholder="Ex: VFC" style="text-transform:uppercase">
                  </label>

                  <div>
                    <span class="create-club-field-label">Cor do Texto</span>
                    <div class="color-swatches-grid">
                      ${PALETTE.slice(0, 6).map(c => `
                        <button type="button" class="color-swatch-circle color-motto-btn ${tempBadge.mottoColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                      `).join('')}
                      <input type="color" id="badgeNativeMotto" class="color-picker-native" value="${tempBadge.mottoColor}">
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="create-club-modal-footer">
              <button type="button" class="btn" id="btnCancelBadgeModal" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:800;padding:8px 18px;border-radius:10px;cursor:pointer">
                Cancelar
              </button>
              <button type="button" class="btn primary" id="btnConfirmBadgeModal" style="font-weight:900;padding:8px 22px;border-radius:10px;background:linear-gradient(135deg,#a855f7,#6366f1);cursor:pointer">
                ✓ Confirmar Emblema
              </button>
            </div>
          </div>
        </div>
      `;

      bindBadgeModalEvents();
    }

    function updateLivePreview() {
      const prev = document.querySelector('#modalBadgePreview');
      if (prev) prev.innerHTML = generateBadgeSvg(tempBadge, 180);
    }

    function bindBadgeModalEvents() {
      const $ = sel => document.querySelector(sel);
      const $$ = sel => document.querySelectorAll(sel);

      const close = () => { container.innerHTML = ''; };
      const btnClose = $('#btnCloseBadgeModal');
      if (btnClose) btnClose.onclick = close;
      const btnCancel = $('#btnCancelBadgeModal');
      if (btnCancel) btnCancel.onclick = close;

      $$('.shape-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.shape = b.dataset.shape;
          renderModalHtml();
        };
      });

      $$('.color-primary-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.primaryColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natPrim = $('#badgeNativePrimary');
      if (natPrim) natPrim.oninput = () => {
        tempBadge.primaryColor = natPrim.value;
        updateLivePreview();
      };

      $$('.color-secondary-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.secondaryColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natSec = $('#badgeNativeSecondary');
      if (natSec) natSec.oninput = () => {
        tempBadge.secondaryColor = natSec.value;
        updateLivePreview();
      };

      $$('.pattern-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.pattern = b.dataset.pattern;
          renderModalHtml();
        };
      });

      $$('.color-pattern-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.patternColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natPat = $('#badgeNativePattern');
      if (natPat) natPat.oninput = () => {
        tempBadge.patternColor = natPat.value;
        updateLivePreview();
      };

      const mottoInp = $('#badgeMottoInput');
      if (mottoInp) mottoInp.oninput = () => {
        tempBadge.motto = mottoInp.value.toUpperCase();
        updateLivePreview();
      };

      $$('.color-motto-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.mottoColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natMotto = $('#badgeNativeMotto');
      if (natMotto) natMotto.oninput = () => {
        tempBadge.mottoColor = natMotto.value;
        updateLivePreview();
      };

      const btnConfirm = $('#btnConfirmBadgeModal');
      if (btnConfirm) btnConfirm.onclick = () => {
        customClubDraft.badge = { ...tempBadge };
        close();
        const previewBox = document.querySelector('#customBadgePreviewBox');
        if (previewBox) previewBox.innerHTML = generateBadgeSvg(customClubDraft.badge, 120);
      };
    }

    renderModalHtml();
  }

  function openCustomKitModal(kitType = 'home', app, activeUser) {
    let container = document.querySelector('#customClubModalContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'customClubModalContainer';
      document.body.appendChild(container);
    }

    let tempKit = { ...(kitType === 'home' ? customClubDraft.homeKit : customClubDraft.awayKit) };

    function renderModalHtml() {
      container.innerHTML = `
        <div class="create-club-modal-overlay">
          <div class="create-club-modal-card">
            <div class="create-club-modal-header">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:22px">${kitType === 'home' ? '👕' : '🎽'}</span>
                <div>
                  <div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:0.5px">
                    CRIAR O EQUIPAMENTO (${kitType === 'home' ? 'EQUIPA DA CASA' : 'EQUIPA DE FORA'})
                  </div>
                  <div style="font-size:11px;color:#38bdf8;font-weight:700">Configure camisola, estampagem, calções e meias oficiais</div>
                </div>
              </div>
              <button type="button" class="btn" id="btnCloseKitModal" style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer">
                ✕ Fechar
              </button>
            </div>

            <div class="create-club-modal-body">
              <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                <div id="modalKitPreview" style="width:100%;min-height:220px;background:radial-gradient(circle,rgba(255,255,255,0.06) 0%,rgba(0,0,0,0.5) 100%);border:1px solid rgba(255,255,255,0.1);border-radius:16px;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box">
                  ${generateKitSvg(tempKit, '', 140)}
                </div>
                <div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">
                  VISUALIZAÇÃO COMPLETA (2D)
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:14px">
                
                <div>
                  <label class="create-club-field-label">Estilo de Camisola</label>
                  <div class="option-picker-grid">
                    ${KIT_STYLES.map(s => `
                      <button type="button" class="option-pill-btn kit-style-btn ${tempKit.style === s.id ? 'active' : ''}" data-style="${s.id}">
                        ${s.label}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Cor da Camisola (Principal)</label>
                  <div class="color-swatches-grid">
                    ${PALETTE.map(c => `
                      <button type="button" class="color-swatch-circle color-shirt-btn ${tempKit.shirtColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                    `).join('')}
                    <input type="color" id="kitNativeShirt" class="color-picker-native" value="${tempKit.shirtColor}" title="Cor personalizada">
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Cor Secundária (Listras / Mangas / Gola)</label>
                  <div class="color-swatches-grid">
                    ${PALETTE.map(c => `
                      <button type="button" class="color-swatch-circle color-sec-btn ${tempKit.secondaryColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                    `).join('')}
                    <input type="color" id="kitNativeSec" class="color-picker-native" value="${tempKit.secondaryColor}" title="Cor personalizada">
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Cor dos Calções</label>
                  <div class="color-swatches-grid">
                    ${PALETTE.map(c => `
                      <button type="button" class="color-swatch-circle color-shorts-btn ${tempKit.shortsColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                    `).join('')}
                    <input type="color" id="kitNativeShorts" class="color-picker-native" value="${tempKit.shortsColor}" title="Cor personalizada">
                  </div>
                </div>

                <div>
                  <label class="create-club-field-label">Cor das Meias</label>
                  <div class="color-swatches-grid">
                    ${PALETTE.map(c => `
                      <button type="button" class="color-swatch-circle color-socks-btn ${tempKit.socksColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                    `).join('')}
                    <input type="color" id="kitNativeSocks" class="color-picker-native" value="${tempKit.socksColor}" title="Cor personalizada">
                  </div>
                </div>

              </div>
            </div>

            <div class="create-club-modal-footer">
              <button type="button" class="btn" id="btnCancelKitModal" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:800;padding:8px 18px;border-radius:10px;cursor:pointer">
                Cancelar
              </button>
              <button type="button" class="btn primary" id="btnConfirmKitModal" style="font-weight:900;padding:8px 22px;border-radius:10px;background:linear-gradient(135deg,#38bdf8,#2563eb);cursor:pointer">
                ✓ Confirmar Equipamento
              </button>
            </div>
          </div>
        </div>
      `;

      bindKitModalEvents();
    }

    function updateLivePreview() {
      const prev = document.querySelector('#modalKitPreview');
      if (prev) prev.innerHTML = generateKitSvg(tempKit, '', 140);
    }

    function bindKitModalEvents() {
      const $ = sel => document.querySelector(sel);
      const $$ = sel => document.querySelectorAll(sel);

      const close = () => { container.innerHTML = ''; };
      const btnClose = $('#btnCloseKitModal');
      if (btnClose) btnClose.onclick = close;
      const btnCancel = $('#btnCancelKitModal');
      if (btnCancel) btnCancel.onclick = close;

      $$('.kit-style-btn').forEach(b => {
        b.onclick = () => {
          tempKit.style = b.dataset.style;
          renderModalHtml();
        };
      });

      $$('.color-shirt-btn').forEach(b => {
        b.onclick = () => {
          tempKit.shirtColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natShirt = $('#kitNativeShirt');
      if (natShirt) natShirt.oninput = () => {
        tempKit.shirtColor = natShirt.value;
        updateLivePreview();
      };

      $$('.color-sec-btn').forEach(b => {
        b.onclick = () => {
          tempKit.secondaryColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natSec = $('#kitNativeSec');
      if (natSec) natSec.oninput = () => {
        tempKit.secondaryColor = natSec.value;
        updateLivePreview();
      };

      $$('.color-shorts-btn').forEach(b => {
        b.onclick = () => {
          tempKit.shortsColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natShorts = $('#kitNativeShorts');
      if (natShorts) natShorts.oninput = () => {
        tempKit.shortsColor = natShorts.value;
        updateLivePreview();
      };

      $$('.color-socks-btn').forEach(b => {
        b.onclick = () => {
          tempKit.socksColor = b.dataset.color;
          renderModalHtml();
        };
      });
      const natSocks = $('#kitNativeSocks');
      if (natSocks) natSocks.oninput = () => {
        tempKit.socksColor = natSocks.value;
        updateLivePreview();
      };

      const btnConfirm = $('#btnConfirmKitModal');
      if (btnConfirm) btnConfirm.onclick = () => {
        if (kitType === 'home') {
          customClubDraft.homeKit = { ...tempKit };
          const prevBox = document.querySelector('#customHomeKitPreviewBox');
          if (prevBox) prevBox.innerHTML = generateKitSvg(customClubDraft.homeKit, '', 110);
        } else {
          customClubDraft.awayKit = { ...tempKit };
          const prevBox = document.querySelector('#customAwayKitPreviewBox');
          if (prevBox) prevBox.innerHTML = generateKitSvg(customClubDraft.awayKit, '', 110);
        }
        close();
      };
    }

    renderModalHtml();
  }

  // Exportar para o escopo global
  window.AFM_ESTADUAIS_DATA = (window.AFM_ESTADUAIS_DATA && window.AFM_ESTADUAIS_DATA.length) ? window.AFM_ESTADUAIS_DATA : DEFAULT_ESTADUAIS;
  window.customClubDraft = customClubDraft;
  window.generateBadgeSvg = generateBadgeSvg;
  window.generateKitSvg = generateKitSvg;
  window.generateCustomClubSquad = generateCustomClubSquad;
  window.renderCreateClubScreen = renderCreateClubScreen;
  window.openCustomBadgeModal = openCustomBadgeModal;
  window.openCustomKitModal = openCustomKitModal;

})(typeof window !== 'undefined' ? window : globalThis);
