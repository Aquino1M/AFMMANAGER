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
    badgeImage: null,
    badge: {
      shape: 'classic',
      primaryColor: '#1e3a8a',
      secondaryColor: '#facc15',
      pattern: 'star',
      patternColor: '#ffffff',
      motto: 'VFC',
      mottoColor: '#ffffff',
      starsCount: 0,
      year: '2026',
      borderStyle: 'classic',
      shine: true
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
    },
    squad: null,
    squadCustomized: false
  };

  const PALETTE = ['#0f172a', '#ffffff', '#1e3a8a', '#dc2626', '#16a34a', '#facc15', '#7c3aed', '#831843', '#ea580c', '#0284c7', '#78350f', '#d97706'];

  const SHAPES = [
    { id: 'classic', label: 'Clássico 🛡️' },
    { id: 'round', label: 'Redondo ⚪' },
    { id: 'diamond', label: 'Losango 🔷' },
    { id: 'french', label: 'Francês ⚜️' },
    { id: 'modern', label: 'Moderno 📐' },
    { id: 'crown_shield', label: 'Coroa 👑' },
    { id: 'hexagonal', label: 'Hexagonal ⬡' },
    { id: 'oval', label: 'Oval 🥚' },
    { id: 'triangle', label: 'Triângulo 🔻' },
    { id: 'banner', label: 'Estandarte 🚩' },
    { id: 'gothic', label: 'Gótico ⚔️' },
    { id: 'vintage', label: 'Vintage 📜' }
  ];

  const PATTERNS = [
    { id: 'none', label: 'Nenhuma' },
    { id: 'stripes_v', label: 'Listras V.' },
    { id: 'stripes_h', label: 'Listras H.' },
    { id: 'diagonal_sash', label: 'Faixa Diag.' },
    { id: 'half', label: 'Meio a Meio' },
    { id: 'checkers', label: 'Xadrez 🏁' },
    { id: 'chevron', label: 'Chevron ∧' },
    { id: 'star', label: 'Estrela ⭐' },
    { id: 'ball', label: 'Bola ⚽' },
    { id: 'crown', label: 'Coroa 👑' },
    { id: 'lightning', label: 'Raio ⚡' },
    { id: 'cross', label: 'Cruz ✝️' },
    { id: 'eagle', label: 'Águia 🦅' },
    { id: 'lion', label: 'Leão 🦁' },
    { id: 'fire', label: 'Fogo 🔥' },
    { id: 'anchor', label: 'Âncora ⚓' },
    { id: 'swords', label: 'Espadas ⚔️' },
    { id: 'sun', label: 'Sol ☀️' },
    { id: 'wings', label: 'Asas 🪽' },
    { id: 'shield_inner', label: 'Brasão 🛡️' }
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

  function processUploadedImageFile(file, callback) {
    if (!file) return;
    if (!file.type || !file.type.match(/^image\//)) {
      if (typeof window.toast === 'function') window.toast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP ou SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target.result;
      if (file.type === 'image/svg+xml') {
        callback(rawData);
        return;
      }
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 256;
            let w = img.width || 256;
            let h = img.height || 256;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/png');
            callback(dataUrl);
          } catch(err) {
            callback(rawData);
          }
        };
        img.onerror = () => callback(rawData);
        img.src = rawData;
      } catch(err) {
        callback(rawData);
      }
    };
    reader.readAsDataURL(file);
  }

  function renderBadgePreviewHtml(badgeImage, badgeConfig, size = 120) {
    if (badgeImage) {
      return `<img src="${badgeImage}" class="crest crest-img custom-badge-preview-img" style="width:${size}px;height:${size}px;object-fit:contain;filter:drop-shadow(0 4px 14px rgba(0,0,0,0.6));border-radius:6px;" alt="Logo do Clube" />`;
    }
    return generateBadgeSvg(badgeConfig || customClubDraft.badge, size);
  }

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
    const borderStyle = b.borderStyle || 'classic';
    const starsCount = Number(b.starsCount) || 0;
    const year = (b.year || '').trim();

    let pathD = 'M 12 14 L 88 14 L 88 56 C 88 80 50 97 50 97 C 50 97 12 80 12 56 Z';
    if (shape === 'round') pathD = 'M 50 12 A 42 42 0 1 0 50 96 A 42 42 0 1 0 50 12 Z';
    else if (shape === 'diamond') pathD = 'M 50 10 L 92 52 L 50 96 L 8 52 Z';
    else if (shape === 'french') pathD = 'M 14 14 L 86 14 L 86 60 Q 86 86 50 97 Q 14 86 14 60 Z';
    else if (shape === 'modern') pathD = 'M 15 18 Q 50 10 85 18 L 85 58 Q 85 86 50 97 Q 15 86 15 58 Z';
    else if (shape === 'crown_shield') pathD = 'M 14 26 L 26 14 L 38 25 L 50 14 L 62 25 L 74 14 L 86 26 L 86 60 C 86 84 50 97 50 97 C 50 97 14 84 14 60 Z';
    else if (shape === 'hexagonal') pathD = 'M 50 12 L 88 28 L 88 72 L 50 97 L 12 72 L 12 28 Z';
    else if (shape === 'oval') pathD = 'M 50 12 C 78 12 88 34 88 55 C 88 78 76 97 50 97 C 24 97 12 78 12 55 C 12 34 22 12 50 12 Z';
    else if (shape === 'triangle') pathD = 'M 12 14 L 88 14 L 50 97 Z';
    else if (shape === 'banner') pathD = 'M 12 14 L 88 14 L 88 76 L 50 97 L 12 76 Z';
    else if (shape === 'gothic') pathD = 'M 14 14 Q 50 20 86 14 Q 82 42 90 62 C 90 82 50 97 50 97 C 50 97 10 82 10 62 Q 18 42 14 14 Z';
    else if (shape === 'vintage') pathD = 'M 12 16 Q 50 24 88 16 L 88 56 Q 88 80 50 97 Q 12 80 12 56 Z';

    let patSvg = '';
    if (pat === 'half') patSvg = `<rect x="50" y="0" width="50" height="100" fill="${sc}" />`;
    else if (pat === 'stripes_v') patSvg = `<rect x="22" y="0" width="11" height="100" fill="${sc}" /><rect x="44" y="0" width="12" height="100" fill="${sc}" /><rect x="67" y="0" width="11" height="100" fill="${sc}" />`;
    else if (pat === 'stripes_h') patSvg = `<rect x="0" y="20" width="100" height="12" fill="${sc}" /><rect x="0" y="44" width="100" height="12" fill="${sc}" /><rect x="0" y="68" width="100" height="12" fill="${sc}" />`;
    else if (pat === 'diagonal_sash') patSvg = `<polygon points="0,0 26,0 100,74 100,100 74,100 0,26" fill="${sc}" />`;
    else if (pat === 'checkers') patSvg = `<rect x="0" y="0" width="50" height="50" fill="${pc}" opacity="0.3"/><rect x="50" y="50" width="50" height="50" fill="${pc}" opacity="0.3"/>`;
    else if (pat === 'chevron') patSvg = `<polygon points="50,28 80,48 74,54 50,38 26,54 20,48" fill="${pc}"/><polygon points="50,44 80,64 74,70 50,54 26,70 20,64" fill="${pc}"/>`;
    else if (pat === 'star') patSvg = `<polygon points="50,20 55,36 72,36 58,47 63,64 50,53 37,64 42,47 28,36 45,36" fill="${pc}" />`;
    else if (pat === 'cross') patSvg = `<rect x="43" y="0" width="14" height="100" fill="${pc}" /><rect x="0" y="40" width="100" height="14" fill="${pc}" />`;
    else if (pat === 'crown') patSvg = `<polygon points="30,56 70,56 68,40 59,48 50,34 41,48 32,40" fill="${pc}" /><circle cx="50" cy="32" r="2.5" fill="${sc}" /><circle cx="32" cy="38" r="2" fill="${sc}" /><circle cx="68" cy="38" r="2" fill="${sc}" />`;
    else if (pat === 'lightning') patSvg = `<polygon points="54,18 36,46 48,46 44,74 64,42 52,42" fill="${pc}" />`;
    else if (pat === 'ball') patSvg = `<circle cx="50" cy="44" r="17" fill="#ffffff" stroke="${sc}" stroke-width="2"/><polygon points="50,37 57,42 54,49 46,49 43,42" fill="${pc}"/><line x1="50" y1="37" x2="50" y2="27" stroke="${sc}" stroke-width="1.5"/><line x1="57" y1="42" x2="66" y2="39" stroke="${sc}" stroke-width="1.5"/><line x1="54" y1="49" x2="60" y2="58" stroke="${sc}" stroke-width="1.5"/><line x1="46" y1="49" x2="40" y2="58" stroke="${sc}" stroke-width="1.5"/><line x1="43" y1="42" x2="34" y2="39" stroke="${sc}" stroke-width="1.5"/>`;
    else if (pat === 'eagle') patSvg = `<path d="M 50 26 L 56 36 L 76 32 L 84 46 L 68 52 L 74 62 L 58 58 L 50 72 L 42 58 L 26 62 L 32 52 L 16 46 L 24 32 L 44 36 Z" fill="${pc}" />`;
    else if (pat === 'lion') patSvg = `<path d="M 44 28 C 47 24 55 24 58 28 C 61 32 58 36 62 38 C 66 40 68 36 71 39 C 68 44 63 44 61 48 C 63 52 69 54 67 59 C 63 58 59 55 57 58 C 55 64 61 68 64 73 L 56 73 C 53 69 51 63 47 65 C 44 67 45 73 40 73 L 38 68 C 42 66 43 58 40 55 C 37 52 35 55 33 52 C 34 46 39 46 41 42 C 39 39 37 40 37 36 C 41 35 42 32 44 28 Z" fill="${pc}" />`;
    else if (pat === 'fire') patSvg = `<path d="M 50 24 C 54 34 66 38 66 52 C 66 64 58 72 50 72 C 42 72 34 64 34 52 C 34 42 42 34 44 32 C 44 38 48 42 50 42 C 52 42 52 36 50 24 Z" fill="${pc}" />`;
    else if (pat === 'anchor') patSvg = `<circle cx="50" cy="30" r="5" fill="none" stroke="${pc}" stroke-width="2.5"/><line x1="50" y1="35" x2="50" y2="70" stroke="${pc}" stroke-width="3"/><line x1="38" y1="42" x2="62" y2="42" stroke="${pc}" stroke-width="2.5"/><path d="M 32 56 C 32 72 68 72 68 56" fill="none" stroke="${pc}" stroke-width="3" stroke-linecap="round"/><polygon points="30,56 34,56 32,50" fill="${pc}"/><polygon points="66,56 70,56 68,50" fill="${pc}"/>`;
    else if (pat === 'swords') patSvg = `<line x1="32" y1="32" x2="68" y2="68" stroke="${pc}" stroke-width="3" stroke-linecap="round"/><line x1="68" y1="32" x2="32" y2="68" stroke="${pc}" stroke-width="3" stroke-linecap="round"/><line x1="28" y1="38" x2="38" y2="28" stroke="${pc}" stroke-width="3"/><line x1="72" y1="38" x2="62" y2="28" stroke="${pc}" stroke-width="3"/><circle cx="28" cy="28" r="2.5" fill="${pc}"/><circle cx="72" cy="28" r="2.5" fill="${pc}"/>`;
    else if (pat === 'sun') patSvg = `<circle cx="50" cy="50" r="11" fill="${pc}"/><g stroke="${pc}" stroke-width="2.2" stroke-linecap="round"><line x1="50" y1="32" x2="50" y2="25"/><line x1="50" y1="68" x2="50" y2="75"/><line x1="32" y1="50" x2="25" y2="50"/><line x1="68" y1="50" x2="75" y2="50"/><line x1="37" y1="37" x2="32" y2="32"/><line x1="63" y1="63" x2="68" y2="68"/><line x1="63" y1="37" x2="68" y2="32"/><line x1="37" y1="63" x2="32" y2="68"/></g>`;
    else if (pat === 'wings') patSvg = `<path d="M 50 56 Q 64 36 82 32 Q 74 46 72 58 Q 62 48 50 62 Q 38 48 28 58 Q 26 46 18 32 Q 36 36 50 56 Z" fill="${pc}"/>`;
    else if (pat === 'shield_inner') patSvg = `<path d="M 32 32 L 68 32 L 68 56 C 68 70 50 78 50 78 C 50 78 32 70 32 56 Z" fill="none" stroke="${pc}" stroke-width="3"/><path d="M 38 38 L 62 38 L 62 55 C 62 65 50 71 50 71 C 50 71 38 65 38 55 Z" fill="${pc}" opacity="0.3"/>`;

    let starsSvg = '';
    if (starsCount > 0) {
      const renderStar = (cx, cy, r = 4, col = '#facc15') => {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const a = (i * 36 - 90) * Math.PI / 180;
          const rad = i % 2 === 0 ? r : r * 0.44;
          pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(' ')}" fill="${col}" stroke="rgba(0,0,0,0.6)" stroke-width="0.6"/>`;
      };

      if (starsCount === 1) starsSvg = renderStar(50, 7, 5);
      else if (starsCount === 2) starsSvg = renderStar(43, 7, 4.5) + renderStar(57, 7, 4.5);
      else if (starsCount === 3) starsSvg = renderStar(36, 8, 4) + renderStar(50, 6, 5) + renderStar(64, 8, 4);
      else if (starsCount === 4) starsSvg = renderStar(30, 8, 3.8) + renderStar(43, 6.5, 4.2) + renderStar(57, 6.5, 4.2) + renderStar(70, 8, 3.8);
      else if (starsCount === 5) starsSvg = renderStar(25, 9, 3.5) + renderStar(37, 7.5, 4) + renderStar(50, 6, 4.8) + renderStar(63, 7.5, 4) + renderStar(75, 9, 3.5);
    }

    const clipId = 'crest_clip_' + Math.random().toString(36).slice(2, 8);
    const hasSymbol = pat !== 'none' && !['half','stripes_v','stripes_h','diagonal_sash','checkers','chevron'].includes(pat);
    const textY = hasSymbol ? (year ? 72 : 76) : (year ? 54 : 58);

    let borderSvg = '';
    if (borderStyle === 'double') {
      borderSvg = `<path d="${pathD}" fill="none" stroke="${sc}" stroke-width="4.5" stroke-linejoin="round" /><path d="${pathD}" fill="none" stroke="${pc}" stroke-width="1.5" stroke-linejoin="round" opacity="0.85" /><path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="0.8" stroke-linejoin="round" />`;
    } else if (borderStyle === 'thick_gold') {
      borderSvg = `<path d="${pathD}" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linejoin="round" /><path d="${pathD}" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linejoin="round" /><path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1" stroke-linejoin="round" />`;
    } else {
      borderSvg = `<path d="${pathD}" fill="none" stroke="${sc}" stroke-width="4" stroke-linejoin="round" /><path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1.5" stroke-linejoin="round" />`;
    }

    const shineSvg = (b.shine !== false) ? `<path d="M 10 10 L 90 10 L 90 48 Q 50 38 10 52 Z" fill="url(#crestShineGrad_${clipId})" opacity="0.22" />` : '';

    return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        `<clipPath id="${clipId}"><path d="${pathD}" /></clipPath>` +
        `<linearGradient id="crestShineGrad_${clipId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" /><stop offset="100%" stop-color="#ffffff" stop-opacity="0" /></linearGradient>` +
      `</defs>` +
      `<path d="${pathD}" fill="${p}" />` +
      `<g clip-path="url(#${clipId})">${patSvg}${shineSvg}</g>` +
      (motto ? `<text x="50" y="${textY}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${motto.length > 4 ? 12 : motto.length > 3 ? 14 : 17}" fill="${mc}" stroke="rgba(0,0,0,0.6)" stroke-width="0.8" letter-spacing="1">${escText(motto)}</text>` : '') +
      (year ? `<text x="50" y="89" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="7.5" fill="${mc}" stroke="rgba(0,0,0,0.6)" stroke-width="0.5" letter-spacing="1">${escText(year.startsWith('EST') ? year : `EST. ${year}`)}</text>` : '') +
      borderSvg +
      starsSvg +
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

        (badgeSvg && (badgeSvg.startsWith('data:') || badgeSvg.startsWith('http') || badgeSvg.endsWith('.png') || badgeSvg.endsWith('.jpg') || badgeSvg.endsWith('.webp')) ?
          `<image href="${badgeSvg}" x="44" y="24" width="9" height="9" preserveAspectRatio="xMidYMid meet" />` :
          `<circle cx="48" cy="28" r="4.5" fill="${cSec}" /><circle cx="48" cy="28" r="3" fill="${cShirt}" />`
        ) +

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

  const DEFAULT_SQUAD_NUMBERS = [1, 12, 2, 13, 3, 4, 14, 15, 6, 16, 5, 17, 8, 18, 10, 20, 7, 11, 9, 19];

  function getRandomPlayerName(usedNames = new Set()) {
    const NAMES = window.NAMES || ['Gabriel','Lucas','Matheus','Rafael','Bruno','Gustavo','Caio','João','Pedro','André','Felipe','Diego','Thiago','Henrique','Victor','Murilo','Samuel','Daniel','Arthur','Vinícius','Nicolas','Eduardo','Leonardo','Igor','Renan','Rodrigo','Cristian','Marcos','Alexandre','Miguel','Davi','Wesley','Ruan','Kauã','Yuri','Danilo','Luan','Vitor'];
    const LAST = window.LAST || ['Silva','Santos','Oliveira','Costa','Pereira','Souza','Rodrigues','Almeida','Lima','Gomes','Martins','Rocha','Ribeiro','Carvalho','Mendes','Barbosa','Freitas','Nunes','Moreira','Cardoso','Teixeira','Moura','Araújo','Monteiro','Ferreira'];
    const rnd = window.rnd || ((min, max) => Math.floor(Math.random() * (max - min + 1)) + min);
    let name;
    let attempts = 0;
    do {
      name = `${NAMES[rnd(0, NAMES.length - 1)]} ${LAST[rnd(0, LAST.length - 1)]}`;
      attempts++;
    } while (usedNames.has(name) && attempts < 60);
    usedNames.add(name);
    return name;
  }

  function generateCustomClubSquad(clubName) {
    const rnd = window.rnd || ((min, max) => Math.floor(Math.random() * (max - min + 1)) + min);
    const clamp = window.clamp || ((v, min, max) => Math.max(min, Math.min(max, v)));
    const norm = window.norm || (s => String(s||'').toLowerCase());

    const positionsNeeded = ['GK','GK','RB','RB','CB','CB','CB','CB','LB','LB','DM','DM','CM','CM','AM','AM','RW','LW','ST','ST'];
    const usedNames = new Set();
    return positionsNeeded.map((pos, idx) => {
      const name = getRandomPlayerName(usedNames);
      const age = rnd(19, 31);
      const ovr = rnd(54, 64);
      const wage = Math.round(clamp(1500 + (ovr - 54) * 230 + rnd(-100, 150), 1200, 4200));
      const value = Math.round(clamp(0.04 + (ovr - 54) * 0.02 + (30 - age) * 0.01, 0.03, 0.35) * 100) / 100;
      const num = DEFAULT_SQUAD_NUMBERS[idx] || (idx + 1);
      return {
        id: `custom_${norm(clubName)}_${idx}_${Date.now()}`,
        name,
        pos,
        number: num,
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

    let estData = (window.AFM_ESTADUAIS_DATA && window.AFM_ESTADUAIS_DATA.length) ? [...window.AFM_ESTADUAIS_DATA] : [...DEFAULT_ESTADUAIS];
    if (customClubDraft.stateCompId && !estData.some(e => e.id === customClubDraft.stateCompId)) {
      const compObj = (typeof window.compById === 'function') ? window.compById(customClubDraft.stateCompId) : null;
      if (compObj) {
        estData.unshift({
          id: compObj.id,
          name: compObj.name,
          state: compObj.country || 'Brasil',
          clubsCount: compObj.teamsCount || (compObj.teams ? compObj.teams.length : (window.COMPETITION_TEAMS && window.COMPETITION_TEAMS[compObj.id] ? window.COMPETITION_TEAMS[compObj.id].length : 20)),
          trophy: compObj.id.startsWith('bra-') ? '🇧🇷' : '🏆',
          color: '#38bdf8'
        });
      }
    }
    const curEst = estData.find(e => e.id === customClubDraft.stateCompId) || estData[0] || { id: 'bra-est-sp', name: 'Paulistão SP', clubsCount: 16 };
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
              <div style="display:flex;align-items:center;gap:6px">
                <span>🛡️</span> EMBLEMA DO CLUBE
              </div>
              ${customClubDraft.badgeImage ? '<span class="pill good" style="font-size:9px;padding:2px 6px;font-weight:900">PNG ATIVO</span>' : ''}
            </div>
            <div class="create-club-preview-box" id="customBadgePreviewBox">
              ${renderBadgePreviewHtml(customClubDraft.badgeImage, customClubDraft.badge, 120)}
            </div>
            
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;width:100%">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%">
                <button type="button" class="btn primary" id="btnOpenBadgeModal" style="font-weight:900;padding:10px 6px;font-size:11px;border-radius:10px;background:linear-gradient(135deg,#a855f7,#6366f1);cursor:pointer;white-space:nowrap" title="Editar formato, cores e sigla do brasão">
                  🎨 EDITAR VETORIAL
                </button>
                <label class="btn" style="font-weight:900;padding:10px 6px;font-size:11px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;text-align:center;margin:0;white-space:nowrap" title="Importar logo em PNG, JPG ou WebP">
                  📁 IMPORTAR PNG
                  <input type="file" id="inputImportLogoDirect" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none">
                </label>
              </div>
              ${customClubDraft.badgeImage ? `
                <button type="button" class="btn" id="btnRemoveCustomLogoDirect" style="width:100%;font-size:11px;font-weight:800;padding:6px 10px;border-radius:8px;background:rgba(239,68,68,0.18);color:#fca5a5;border:1px solid rgba(239,68,68,0.35);cursor:pointer">
                  🗑️ Remover Imagem (Usar Brasão Vetorial)
                </button>
              ` : ''}
            </div>
          </div>

          <!-- CARD 2: KIT CASA -->
          <div class="create-club-preview-card">
            <div class="create-club-preview-header">
              <span>👕</span> EQUIPAMENTO DA CASA
            </div>
            <div class="create-club-preview-box" id="customHomeKitPreviewBox">
              ${generateKitSvg(customClubDraft.homeKit, customClubDraft.badgeImage || '', 110)}
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
              ${generateKitSvg(customClubDraft.awayKit, customClubDraft.badgeImage || '', 110)}
            </div>
            <button type="button" class="btn primary" id="btnOpenAwayKitModal" style="width:100%;font-weight:900;padding:10px 14px;border-radius:10px;margin-top:14px;background:linear-gradient(135deg,#f43f5e,#be123c);cursor:pointer">
              🎽 DEFINIR O EQUIPAMENTO
            </button>
          </div>
        </div>

        <!-- SEÇÃO 3: ESCOLHA DO CAMPEONATO DE INÍCIO -->
        <div class="create-club-estadual-section">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <div style="font-size:14px;font-weight:900;color:#fff;letter-spacing:0.5px;text-transform:uppercase">
                🏆 ESCOLHA O CAMPEONATO DE INÍCIO
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                Seu clube ocupará 1 vaga oficial na competição escolhida, disputará a tabela oficial de 2026 e buscará a glória!
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

          <div class="create-club-challenge-item create-club-squad-challenge-item" style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
            <div style="display:flex;align-items:flex-start;gap:10px;flex:1;min-width:0">
              <div class="icon">👥</div>
              <div style="flex:1;min-width:0">
                <div class="title">Elenco Inicial</div>
                <div class="val" style="color:#facc15" id="customSquadSummaryText">
                  ${customClubDraft.squadCustomized ? '20 Atletas (Personalizado ✓)' : '20 Atletas (OVR 54-64)'}
                </div>
                <div class="small muted" style="font-size:10px" id="customSquadDetailsText">
                  ${customClubDraft.squad && customClubDraft.squad.length ? `Média: ${Math.round(customClubDraft.squad.reduce((a,b)=>a+(Number(b.age)||23),0)/customClubDraft.squad.length)} anos · Folha: R$ ${customClubDraft.squad.reduce((a,b)=>a+(Number(b.wage)||0),0).toLocaleString('pt-BR')}/mês` : 'Folha salarial equilibrada e competitiva'}
                </div>
              </div>
            </div>
            <button type="button" class="btn primary" id="btnOpenSquadModal" style="align-self:center;font-size:11px;font-weight:900;padding:7px 12px;border-radius:9px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;box-shadow:0 3px 12px rgba(245,158,11,0.35);border:none" title="Editar nome, número da camisa e idade dos jogadores">
              ✏️ EDITAR ELENCO
            </button>
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
    const syncBadgePreview = () => {
      const bBox = $('#customBadgePreviewBox');
      if (bBox) bBox.innerHTML = renderBadgePreviewHtml(customClubDraft.badgeImage, customClubDraft.badge, 120);
    };

    const nameInp = $('#customClubNameInput');
    if (nameInp) nameInp.oninput = () => {
      customClubDraft.name = nameInp.value;
      syncBadgePreview();
    };

    const shortInp = $('#customClubShortNameInput');
    if (shortInp) shortInp.oninput = () => {
      customClubDraft.shortName = shortInp.value.toUpperCase();
      if (customClubDraft.badge.motto.length <= 4) {
        customClubDraft.badge.motto = customClubDraft.shortName;
      }
      syncBadgePreview();
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

    const fileInpDirect = $('#inputImportLogoDirect');
    if (fileInpDirect) {
      fileInpDirect.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          processUploadedImageFile(file, (dataUrl) => {
            customClubDraft.badgeImage = dataUrl;
            if (typeof window.toast === 'function') window.toast('📁 Logo em PNG importada com sucesso!');
            renderCreateClubScreen(app, activeUser);
          });
        }
      };
    }

    const btnRemoveDirect = $('#btnRemoveCustomLogoDirect');
    if (btnRemoveDirect) {
      btnRemoveDirect.onclick = () => {
        customClubDraft.badgeImage = null;
        if (typeof window.toast === 'function') window.toast('Brasão vetorial restaurado.');
        renderCreateClubScreen(app, activeUser);
      };
    }

    const btnHomeKit = $('#btnOpenHomeKitModal');
    if (btnHomeKit) btnHomeKit.onclick = () => openCustomKitModal('home', app, activeUser);

    const btnAwayKit = $('#btnOpenAwayKitModal');
    if (btnAwayKit) btnAwayKit.onclick = () => openCustomKitModal('away', app, activeUser);

    const btnSquad = $('#btnOpenSquadModal');
    if (btnSquad) btnSquad.onclick = () => openCustomSquadModal(app, activeUser);

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

      if (!customClubDraft.squad || !customClubDraft.squad.length) {
        customClubDraft.squad = generateCustomClubSquad(finalName);
      }
      const finalSquad = customClubDraft.squad.map(p => ({
        ...p,
        club: finalName
      }));

      if (typeof window.newCareer === 'function') {
        window.newCareer({
          isCustomClub: true,
          clubName: finalName,
          shortName: finalShort,
          stadiumName: finalStadium,
          stateCompId: customClubDraft.stateCompId || 'bra-est-sp',
          badgeConfig: { ...customClubDraft.badge },
          badgeSvg: finalBadgeSvg,
          badgeImage: customClubDraft.badgeImage || null,
          homeKit: { ...customClubDraft.homeKit },
          awayKit: { ...customClubDraft.awayKit },
          customSquad: finalSquad,
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
    let tempBadgeImage = customClubDraft.badgeImage || null;
    let badgeTab = tempBadgeImage ? 'import' : 'vector';

    function renderModalHtml() {
      container.innerHTML = `
        <div class="create-club-modal-overlay">
          <div class="create-club-modal-card">
            <div class="create-club-modal-header">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:22px">🛡️</span>
                <div>
                  <div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:0.5px">EMBLEMA DO CLUBE</div>
                  <div style="font-size:11px;color:#c084fc;font-weight:700">Importe sua logo PNG externa ou crie um brasão vetorial</div>
                </div>
              </div>
              <button type="button" class="btn" id="btnCloseBadgeModal" style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer">
                ✕ Fechar
              </button>
            </div>

            <div class="create-club-modal-body">
              <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                <div id="modalBadgePreview" style="width:100%;min-height:220px;background:radial-gradient(circle,rgba(255,255,255,0.06) 0%,rgba(0,0,0,0.5) 100%);border:1px solid rgba(255,255,255,0.1);border-radius:16px;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box">
                  ${renderBadgePreviewHtml(tempBadgeImage, tempBadge, 180)}
                </div>
                <div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">
                  ${tempBadgeImage ? '✨ LOGO PNG IMPORTADO' : 'PRÉ-VISUALIZAÇÃO AO VIVO'}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:14px">
                <!-- SELETOR DE ABAS: IMPORTAR OU VETORIAL -->
                <div class="create-club-badge-tabs">
                  <button type="button" class="create-club-badge-tab-btn ${badgeTab === 'import' ? 'active' : ''}" id="tabBtnBadgeImport">
                    📁 Importar Logo (PNG/JPG)
                  </button>
                  <button type="button" class="create-club-badge-tab-btn ${badgeTab === 'vector' ? 'active' : ''}" id="tabBtnBadgeVector">
                    🎨 Criador Vetorial
                  </button>
                </div>

                ${badgeTab === 'import' ? `
                  <div style="display:flex;flex-direction:column;gap:14px">
                    <label class="create-club-upload-dropzone" id="badgeModalDropzone">
                      <div style="font-size:38px">📁</div>
                      <div style="font-size:13px;font-weight:900;color:#fff">
                        Clique aqui para escolher um arquivo PNG
                      </div>
                      <div style="font-size:11px;color:#94a3b8">
                        Suporta PNG (fundo transparente), JPG, WebP e SVG (redimensionamento otimizado)
                      </div>
                      <input type="file" id="badgeModalFileInput" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none">
                    </label>

                    <div style="display:flex;align-items:center;gap:8px">
                      <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
                      <span style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase">Ou por Link Direto (URL)</span>
                      <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
                    </div>

                    <div style="display:flex;gap:8px">
                      <input type="url" id="badgeModalUrlInput" class="saas-input" placeholder="https://exemplo.com/logo.png" style="flex:1;font-size:11px;padding:8px 12px">
                      <button type="button" class="btn primary" id="btnLoadBadgeUrl" style="padding:8px 14px;font-size:11px;font-weight:900;white-space:nowrap;cursor:pointer">
                        Carregar URL
                      </button>
                    </div>

                    ${tempBadgeImage ? `
                      <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(34,197,94,0.1);padding:10px 14px;border-radius:10px;border:1px solid rgba(34,197,94,0.3)">
                        <div style="display:flex;align-items:center;gap:8px">
                          <span style="font-size:16px">✅</span>
                          <span style="font-size:11px;font-weight:800;color:#4ade80">Logo carregada e pronta para o jogo!</span>
                        </div>
                        <button type="button" class="btn" id="btnRemoveTempBadgeImage" style="background:rgba(239,68,68,0.25);color:#fca5a5;font-size:11px;font-weight:800;padding:5px 10px;border-radius:6px;border:none;cursor:pointer">
                          Remover
                        </button>
                      </div>
                    ` : ''}
                  </div>
                ` : `
                  <!-- FORMA DO EMBLEMA -->
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

                  <!-- COR PRIMÁRIA -->
                  <div>
                    <label class="create-club-field-label">Cor Primária (Fundo do Escudo)</label>
                    <div class="color-swatches-grid">
                      ${PALETTE.map(c => `
                        <button type="button" class="color-swatch-circle color-primary-btn ${tempBadge.primaryColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                      `).join('')}
                      <input type="color" id="badgeNativePrimary" class="color-picker-native" value="${tempBadge.primaryColor}" title="Cor personalizada">
                    </div>
                  </div>

                  <!-- COR SECUNDÁRIA -->
                  <div>
                    <label class="create-club-field-label">Cor Secundária (Bordas & Detalhes)</label>
                    <div class="color-swatches-grid">
                      ${PALETTE.map(c => `
                        <button type="button" class="color-swatch-circle color-secondary-btn ${tempBadge.secondaryColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                      `).join('')}
                      <input type="color" id="badgeNativeSecondary" class="color-picker-native" value="${tempBadge.secondaryColor}" title="Cor personalizada">
                    </div>
                  </div>

                  <!-- ESTAMPAGEM / SÍMBOLO -->
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

                  <!-- COR DA ESTAMPAGEM -->
                  <div>
                    <label class="create-club-field-label">Cor da Estampagem / Símbolo</label>
                    <div class="color-swatches-grid">
                      ${PALETTE.map(c => `
                        <button type="button" class="color-swatch-circle color-pattern-btn ${tempBadge.patternColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>
                      `).join('')}
                      <input type="color" id="badgeNativePattern" class="color-picker-native" value="${tempBadge.patternColor}" title="Cor personalizada">
                    </div>
                  </div>

                  <!-- ESTRELAS DOURADAS NO TOPO -->
                  <div>
                    <label class="create-club-field-label">⭐ Estrelas Douradas no Topo (Títulos / Tradição)</label>
                    <div class="option-picker-grid">
                      ${[0, 1, 2, 3, 4, 5].map(st => `
                        <button type="button" class="option-pill-btn stars-btn ${Number(tempBadge.starsCount || 0) === st ? 'active' : ''}" data-stars="${st}">
                          ${st === 0 ? 'Sem Estrelas' : '⭐'.repeat(st) + ` (${st})`}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- ESTILO DA BORDA -->
                  <div>
                    <label class="create-club-field-label">🛡️ Estilo da Borda do Escudo</label>
                    <div class="option-picker-grid">
                      <button type="button" class="option-pill-btn border-style-btn ${(tempBadge.borderStyle || 'classic') === 'classic' ? 'active' : ''}" data-border="classic">
                        Simples Clássica
                      </button>
                      <button type="button" class="option-pill-btn border-style-btn ${tempBadge.borderStyle === 'double' ? 'active' : ''}" data-border="double">
                        Dupla com Friso
                      </button>
                      <button type="button" class="option-pill-btn border-style-btn ${tempBadge.borderStyle === 'thick_gold' ? 'active' : ''}" data-border="thick_gold">
                        Grossa Dourada
                      </button>
                    </div>
                  </div>

                  <!-- ANO DE FUNDAÇÃO & EFEITO BRILHO 3D -->
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:flex-end">
                    <label class="field" style="margin:0">
                      <span class="create-club-field-label">📅 Ano de Fundação (Ex: 2026)</span>
                      <input id="badgeYearInput" class="saas-input" value="${escText(tempBadge.year || '')}" maxlength="9" placeholder="Ex: 2026">
                    </label>

                    <div style="display:flex;align-items:center;gap:8px">
                      <button type="button" class="btn" id="btnToggleYearEst" style="padding:8px 10px;font-size:11px;font-weight:800;border-radius:8px;background:rgba(255,255,255,0.08);color:#cbd5e1;cursor:pointer;white-space:nowrap">
                        ${tempBadge.year ? '🗑️ Limpar Ano' : '✨ Inserir 2026'}
                      </button>
                      <button type="button" class="btn" id="btnToggleBadgeShine" style="padding:8px 10px;font-size:11px;font-weight:800;border-radius:8px;background:${tempBadge.shine !== false ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.08)'};color:${tempBadge.shine !== false ? '#38bdf8' : '#94a3b8'};cursor:pointer;white-space:nowrap">
                        ${tempBadge.shine !== false ? '✨ Brilho 3D Ativo' : '⚪ Brilho Off'}
                      </button>
                    </div>
                  </div>

                  <!-- LEMA / SIGLA -->
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
                `}

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
      if (prev) prev.innerHTML = renderBadgePreviewHtml(tempBadgeImage, tempBadge, 180);
    }

    function bindBadgeModalEvents() {
      const $ = sel => document.querySelector(sel);
      const $$ = sel => document.querySelectorAll(sel);

      const close = () => { container.innerHTML = ''; };
      const btnClose = $('#btnCloseBadgeModal');
      if (btnClose) btnClose.onclick = close;
      const btnCancel = $('#btnCancelBadgeModal');
      if (btnCancel) btnCancel.onclick = close;

      const tabImport = $('#tabBtnBadgeImport');
      if (tabImport) tabImport.onclick = () => { badgeTab = 'import'; renderModalHtml(); };

      const tabVector = $('#tabBtnBadgeVector');
      if (tabVector) tabVector.onclick = () => { badgeTab = 'vector'; renderModalHtml(); };

      const fileInpModal = $('#badgeModalFileInput');
      if (fileInpModal) {
        fileInpModal.onchange = (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            processUploadedImageFile(file, (dataUrl) => {
              tempBadgeImage = dataUrl;
              renderModalHtml();
            });
          }
        };
      }

      const dropzone = $('#badgeModalDropzone');
      if (dropzone) {
        dropzone.ondragover = (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        };
        dropzone.ondragleave = () => {
          dropzone.classList.remove('dragover');
        };
        dropzone.ondrop = (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
          if (file) {
            processUploadedImageFile(file, (dataUrl) => {
              tempBadgeImage = dataUrl;
              renderModalHtml();
            });
          }
        };
      }

      const btnLoadUrl = $('#btnLoadBadgeUrl');
      const urlInput = $('#badgeModalUrlInput');
      if (btnLoadUrl && urlInput) {
        btnLoadUrl.onclick = () => {
          const u = urlInput.value.trim();
          if (!u) return;
          tempBadgeImage = u;
          renderModalHtml();
        };
      }

      const btnRemoveTemp = $('#btnRemoveTempBadgeImage');
      if (btnRemoveTemp) {
        btnRemoveTemp.onclick = () => {
          tempBadgeImage = null;
          renderModalHtml();
        };
      }

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

      $$('.stars-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.starsCount = Number(b.dataset.stars);
          renderModalHtml();
        };
      });

      $$('.border-style-btn').forEach(b => {
        b.onclick = () => {
          tempBadge.borderStyle = b.dataset.border;
          renderModalHtml();
        };
      });

      const yearInp = $('#badgeYearInput');
      if (yearInp) yearInp.oninput = () => {
        tempBadge.year = yearInp.value;
        updateLivePreview();
      };

      const btnToggleYear = $('#btnToggleYearEst');
      if (btnToggleYear) {
        btnToggleYear.onclick = () => {
          tempBadge.year = tempBadge.year ? '' : '2026';
          renderModalHtml();
        };
      }

      const btnToggleShine = $('#btnToggleBadgeShine');
      if (btnToggleShine) {
        btnToggleShine.onclick = () => {
          tempBadge.shine = (tempBadge.shine === false);
          renderModalHtml();
        };
      }

      const btnConfirm = $('#btnConfirmBadgeModal');
      if (btnConfirm) btnConfirm.onclick = () => {
        customClubDraft.badgeImage = tempBadgeImage;
        customClubDraft.badge = { ...tempBadge };
        close();
        renderCreateClubScreen(app, activeUser);
        if (typeof window.toast === 'function') window.toast('✓ Emblema atualizado com sucesso!');
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
                  ${generateKitSvg(tempKit, customClubDraft.badgeImage || '', 140)}
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
      if (prev) prev.innerHTML = generateKitSvg(tempKit, customClubDraft.badgeImage || '', 140);
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
          if (prevBox) prevBox.innerHTML = generateKitSvg(customClubDraft.homeKit, customClubDraft.badgeImage || '', 110);
        } else {
          customClubDraft.awayKit = { ...tempKit };
          const prevBox = document.querySelector('#customAwayKitPreviewBox');
          if (prevBox) prevBox.innerHTML = generateKitSvg(customClubDraft.awayKit, customClubDraft.badgeImage || '', 110);
        }
        close();
      };
    }

    renderModalHtml();
  }

  function openCustomSquadModal(app, activeUser) {
    let container = document.querySelector('#customClubModalContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'customClubModalContainer';
      document.body.appendChild(container);
    }

    if (!customClubDraft.squad || !customClubDraft.squad.length) {
      customClubDraft.squad = generateCustomClubSquad(customClubDraft.name);
    }

    let tempSquad = customClubDraft.squad.map(p => ({ ...p }));

    function getPosPillStyle(pos) {
      if (pos === 'GK') return 'background:rgba(245,158,11,0.22);color:#fbbf24;border:1px solid rgba(245,158,11,0.45);font-weight:900';
      if (['CB','RB','LB'].includes(pos)) return 'background:rgba(59,130,246,0.22);color:#60a5fa;border:1px solid rgba(59,130,246,0.45);font-weight:900';
      if (['DM','CM','AM'].includes(pos)) return 'background:rgba(16,185,129,0.22);color:#34d399;border:1px solid rgba(16,185,129,0.45);font-weight:900';
      return 'background:rgba(239,68,68,0.22);color:#f87171;border:1px solid rgba(239,68,68,0.45);font-weight:900';
    }

    function renderModalHtml() {
      const avgAge = Math.round(tempSquad.reduce((sum, p) => sum + (Number(p.age) || 23), 0) / tempSquad.length);
      const totalWage = tempSquad.reduce((sum, p) => sum + (Number(p.wage) || 0), 0);

      container.innerHTML = `
        <div class="create-club-modal-overlay">
          <div class="create-club-modal-card custom-squad-modal-card" style="max-width:920px">
            <div class="create-club-modal-header">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:24px">👥</span>
                <div>
                  <div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:0.5px">
                    EDITAR ELENCO INICIAL (20 ATLETAS)
                  </div>
                  <div style="font-size:11px;color:#facc15;font-weight:700">
                    Personalize o nome, número da camisa e idade dos jogadores do seu clube
                  </div>
                </div>
              </div>
              <button type="button" class="btn" id="btnCloseSquadModal" style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer">
                ✕ Fechar
              </button>
            </div>

            <!-- TOOLBAR DE AÇÕES RÁPIDAS -->
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:12px 22px;background:#0d1527;border-bottom:1px solid rgba(255,255,255,0.08)">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <button type="button" class="btn" id="btnRandomizeSquadNames" style="font-size:11px;font-weight:800;padding:6px 12px;border-radius:8px;background:rgba(168,85,247,0.2);color:#c084fc;border:1px solid rgba(168,85,247,0.4);cursor:pointer;display:inline-flex;align-items:center;gap:5px" title="Gera novos nomes brasileiros autênticos para todo o elenco">
                  🎲 Gerar Novos Nomes
                </button>
                <button type="button" class="btn" id="btnResetSquadNumbers" style="font-size:11px;font-weight:800;padding:6px 12px;border-radius:8px;background:rgba(56,189,248,0.2);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);cursor:pointer;display:inline-flex;align-items:center;gap:5px" title="Aplica numeração clássica padrão para as posições">
                  🔢 Numeração Padrão (1 a 20)
                </button>
              </div>

              <div style="font-size:11px;color:#94a3b8;font-weight:700">
                <span>⚡ Titulares: #1 ao #11</span> · <span>Reservas: #12 ao #20</span>
              </div>
            </div>

            <!-- CORPO DA TABELA DE ATLETAS -->
            <div class="custom-squad-table-container" style="padding:14px 22px;overflow-y:auto;max-height:56vh">
              <table class="custom-squad-table" style="width:100%;border-collapse:collapse;font-size:12px">
                <thead>
                  <tr style="border-bottom:1.5px solid rgba(255,255,255,0.12);text-align:left;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.5px">
                    <th style="padding:8px 6px;width:34px;text-align:center">#</th>
                    <th style="padding:8px 6px;width:55px;text-align:center">Pos</th>
                    <th style="padding:8px 10px">Nome do Atleta</th>
                    <th style="padding:8px 8px;width:75px;text-align:center">Camisa</th>
                    <th style="padding:8px 8px;width:75px;text-align:center">Idade</th>
                    <th style="padding:8px 8px;width:65px;text-align:center">OVR</th>
                    <th style="padding:8px 10px;width:95px;text-align:right">Salário</th>
                  </tr>
                </thead>
                <tbody>
                  ${tempSquad.map((p, idx) => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s ease" class="squad-edit-row">
                      <td style="padding:7px 6px;text-align:center;color:#64748b;font-weight:900;font-size:11px">
                        ${idx + 1}
                      </td>
                      <td style="padding:7px 6px;text-align:center">
                        <span class="pill" style="${getPosPillStyle(p.pos)};font-size:10px;padding:3px 7px;border-radius:6px">
                          ${p.pos}
                        </span>
                      </td>
                      <td style="padding:7px 10px">
                        <input type="text" class="saas-input squad-input-name" data-idx="${idx}" value="${escText(p.name)}" maxlength="26" style="padding:6px 10px;font-size:12px;font-weight:800;width:100%;box-sizing:border-box" placeholder="Nome do jogador">
                      </td>
                      <td style="padding:7px 8px;text-align:center">
                        <input type="number" min="1" max="99" class="saas-input squad-input-number" data-idx="${idx}" value="${p.number || (idx + 1)}" style="padding:6px 4px;font-size:12px;font-weight:900;width:58px;text-align:center;box-sizing:border-box">
                      </td>
                      <td style="padding:7px 8px;text-align:center">
                        <input type="number" min="16" max="40" class="saas-input squad-input-age" data-idx="${idx}" value="${p.age || 23}" style="padding:6px 4px;font-size:12px;font-weight:700;width:58px;text-align:center;box-sizing:border-box">
                      </td>
                      <td style="padding:7px 8px;text-align:center">
                        <span class="pill good" style="font-size:10px;font-weight:900;padding:3px 7px">
                          ${p.ovr} OVR
                        </span>
                      </td>
                      <td style="padding:7px 10px;text-align:right;color:#cbd5e1;font-weight:700;font-size:11px;white-space:nowrap">
                        R$ ${(Number(p.wage) || 2200).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- RODAPÉ COM RESUMO E BOTÕES -->
            <div class="create-club-modal-footer" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:11px;font-weight:800;color:#94a3b8">
                <span>Plantel: <b style="color:#fff">20 Atletas</b></span>
                <span>•</span>
                <span>Idade Média: <b style="color:#facc15" id="squadModalAvgAge">${avgAge} anos</b></span>
                <span>•</span>
                <span>Folha: <b style="color:#4ade80" id="squadModalTotalWage">R$ ${totalWage.toLocaleString('pt-BR')}/mês</b></span>
              </div>

              <div style="display:flex;align-items:center;gap:10px">
                <button type="button" class="btn" id="btnCancelSquadModal" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:800;padding:8px 18px;border-radius:10px;cursor:pointer">
                  Cancelar
                </button>
                <button type="button" class="btn primary" id="btnConfirmSquadModal" style="font-weight:900;padding:8px 24px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;box-shadow:0 4px 14px rgba(245,158,11,0.4);cursor:pointer">
                  ✓ Salvar Elenco
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      bindSquadModalEvents();
    }

    function updateFooterStats() {
      const avgSpan = container.querySelector('#squadModalAvgAge');
      if (avgSpan) {
        const avg = Math.round(tempSquad.reduce((sum, p) => sum + (Number(p.age) || 23), 0) / tempSquad.length);
        avgSpan.textContent = `${avg} anos`;
      }
    }

    function bindSquadModalEvents() {
      const $ = sel => container.querySelector(sel);
      const $$ = sel => container.querySelectorAll(sel);

      const close = () => { container.innerHTML = ''; };
      const btnClose = $('#btnCloseSquadModal');
      if (btnClose) btnClose.onclick = close;
      const btnCancel = $('#btnCancelSquadModal');
      if (btnCancel) btnCancel.onclick = close;

      $$('.squad-input-name').forEach(inp => {
        inp.oninput = () => {
          const idx = Number(inp.dataset.idx);
          if (tempSquad[idx]) {
            tempSquad[idx].name = inp.value;
          }
        };
      });

      $$('.squad-input-number').forEach(inp => {
        inp.oninput = () => {
          const idx = Number(inp.dataset.idx);
          if (tempSquad[idx]) {
            let n = parseInt(inp.value, 10);
            if (isNaN(n) || n < 1) n = 1;
            if (n > 99) n = 99;
            tempSquad[idx].number = n;
          }
        };
      });

      $$('.squad-input-age').forEach(inp => {
        inp.oninput = () => {
          const idx = Number(inp.dataset.idx);
          if (tempSquad[idx]) {
            let a = parseInt(inp.value, 10);
            if (isNaN(a) || a < 16) a = 16;
            if (a > 40) a = 40;
            tempSquad[idx].age = a;
            updateFooterStats();
          }
        };
      });

      const btnRand = $('#btnRandomizeSquadNames');
      if (btnRand) {
        btnRand.onclick = () => {
          const used = new Set();
          tempSquad.forEach((p, idx) => {
            p.name = getRandomPlayerName(used);
            const inp = $(`input.squad-input-name[data-idx="${idx}"]`);
            if (inp) inp.value = p.name;
          });
          if (typeof window.toast === 'function') window.toast('🎲 Novos nomes autênticos gerados para o elenco!');
        };
      }

      const btnResetNum = $('#btnResetSquadNumbers');
      if (btnResetNum) {
        btnResetNum.onclick = () => {
          tempSquad.forEach((p, idx) => {
            p.number = DEFAULT_SQUAD_NUMBERS[idx] || (idx + 1);
            const inp = $(`input.squad-input-number[data-idx="${idx}"]`);
            if (inp) inp.value = p.number;
          });
          if (typeof window.toast === 'function') window.toast('🔢 Numeração oficial (1 a 20) restaurada!');
        };
      }

      const btnConfirm = $('#btnConfirmSquadModal');
      if (btnConfirm) {
        btnConfirm.onclick = () => {
          $$('.squad-input-name').forEach(inp => {
            const idx = Number(inp.dataset.idx);
            if (tempSquad[idx]) {
              const val = inp.value.trim();
              tempSquad[idx].name = val || tempSquad[idx].name || `Jogador ${idx + 1}`;
            }
          });
          $$('.squad-input-number').forEach(inp => {
            const idx = Number(inp.dataset.idx);
            if (tempSquad[idx]) {
              let n = parseInt(inp.value, 10);
              if (isNaN(n) || n < 1) n = 1;
              if (n > 99) n = 99;
              tempSquad[idx].number = n;
            }
          });
          $$('.squad-input-age').forEach(inp => {
            const idx = Number(inp.dataset.idx);
            if (tempSquad[idx]) {
              let a = parseInt(inp.value, 10);
              if (isNaN(a) || a < 16) a = 16;
              if (a > 40) a = 40;
              tempSquad[idx].age = a;
            }
          });

          customClubDraft.squad = tempSquad;
          customClubDraft.squadCustomized = true;
          close();
          renderCreateClubScreen(app, activeUser);
          if (typeof window.toast === 'function') window.toast('✓ Elenco de 20 atletas personalizado com sucesso!');
        };
      }
    }

    renderModalHtml();
  }

  // Exportar para o escopo global
  function openCreateClubModal(targetCompId) {
    if (targetCompId) customClubDraft.stateCompId = targetCompId;
    window.setupViewMode = 'create_club';
    const app = document.querySelector('#app');
    if (app) renderCreateClubScreen(app, typeof window.getActiveAccount === 'function' ? window.getActiveAccount() : null);
  }

  window.AFM_ESTADUAIS_DATA = (window.AFM_ESTADUAIS_DATA && window.AFM_ESTADUAIS_DATA.length) ? window.AFM_ESTADUAIS_DATA : DEFAULT_ESTADUAIS;
  window.customClubDraft = customClubDraft;
  window.generateBadgeSvg = generateBadgeSvg;
  window.generateKitSvg = generateKitSvg;
  window.generateCustomClubSquad = generateCustomClubSquad;
  window.AFM_generateCustomClubSquad = generateCustomClubSquad;
  window.renderCreateClubScreen = renderCreateClubScreen;
  window.openCustomBadgeModal = openCustomBadgeModal;
  window.openCustomKitModal = openCustomKitModal;
  window.openCustomSquadModal = openCustomSquadModal;
  window.openCreateClubModal = openCreateClubModal;
  window.AFM_CreateClubUI = {
    open: openCreateClubModal,
    render: renderCreateClubScreen
  };

})(typeof window !== 'undefined' ? window : globalThis);
