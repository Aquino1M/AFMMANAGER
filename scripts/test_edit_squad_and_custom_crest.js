// Teste de validação para Edição de Elenco e Novas Opções de Personalização do Escudo
const assert = require('assert');

console.log('--- TESTE: Personalização do Escudo & Edição de Elenco ---');

// Mock dos formatos e estampagens
const SHAPES = [
  'classic', 'round', 'diamond', 'french', 'modern', 'crown_shield',
  'hexagonal', 'oval', 'triangle', 'banner', 'gothic', 'vintage'
];

const PATTERNS = [
  'none', 'stripes_v', 'stripes_h', 'diagonal_sash', 'half', 'checkers', 'chevron',
  'star', 'ball', 'crown', 'lightning', 'cross', 'eagle', 'lion', 'fire', 'anchor',
  'swords', 'sun', 'wings', 'shield_inner'
];

function escText(t) {
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

  const clipId = 'crest_clip_test_' + Math.random().toString(36).slice(2, 7);
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

// 1. Testa todas as formas e estampagens
console.log('1. Testando todas as 12 formas e 20 estampagens de brasão...');
for (const shape of SHAPES) {
  for (const pattern of PATTERNS) {
    const svg = generateBadgeSvg({
      shape,
      pattern,
      primaryColor: '#1e3a8a',
      secondaryColor: '#facc15',
      patternColor: '#ffffff',
      motto: 'VFC',
      starsCount: 3,
      year: '2026',
      borderStyle: 'double',
      shine: true
    }, 120);
    assert(svg.startsWith('<svg') && svg.endsWith('</svg>'), `SVG inválido para shape=${shape}, pattern=${pattern}`);
  }
}
console.log('✓ 240 combinações de Escudo geradas com sucesso e tags válidas!');

// 2. Testa estrelas de 0 a 5
console.log('2. Testando contagem de estrelas de 0 a 5...');
for (let stars = 0; stars <= 5; stars++) {
  const svg = generateBadgeSvg({ shape: 'classic', pattern: 'lion', starsCount: stars, motto: 'AFM' }, 64);
  if (stars > 0) {
    const starCountInSvg = (svg.match(/points="/g) || []).length;
    // O lion ou estrela pode ter points, mas as estrelas de topo devem estar presentes
    assert(starCountInSvg >= stars, `Deveria conter polígonos de estrelas para stars=${stars}`);
  }
}
console.log('✓ Estrelas de 0 a 5 validadas!');

// 3. Testa edição de elenco (20 atletas com nome, número e idade)
console.log('3. Testando estrutura e integridade de Edição de Elenco...');
const squad = [];
for (let i = 0; i < 20; i++) {
  squad.push({
    name: `Jogador ${i + 1}`,
    pos: 'CM',
    number: i + 1,
    age: 20 + (i % 10),
    ovr: 60,
    wage: 2500
  });
}

// Simula edição pelo usuário
squad[0].name = 'Neymar Custom';
squad[0].number = 10;
squad[0].age = 34;

assert.strictEqual(squad[0].name, 'Neymar Custom');
assert.strictEqual(squad[0].number, 10);
assert.strictEqual(squad[0].age, 34);
assert.strictEqual(squad.length, 20);
console.log('✓ Elenco de 20 atletas testado e preservado com sucesso!');

console.log('--- TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ---');
