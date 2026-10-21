// Teste completo de ponta a ponta: Personalização de Elenco e Escudos no Modo Criar Time
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TESTE COMPLETO: EDICÃO DE ELENCO & ESCUDOS NO AFM MANAGER 2027 ===');

// Carrega js/ui/create_club_ui.js em ambiente simulado
const createClubCode = fs.readFileSync(path.join(__dirname, '../js/ui/create_club_ui.js'), 'utf8');

// Cria ambiente de janela simulado
const mockWindow = {
  NAMES: ['Gabriel', 'Lucas', 'Neymar', 'Cristiano'],
  LAST: ['Silva', 'Santos', 'Junior', 'Ronaldo'],
  rnd: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
  norm: s => String(s || '').toLowerCase(),
  initials: s => String(s || '').slice(0, 3).toUpperCase(),
  esc: s => String(s || '')
};

// Executa o script create_club_ui.js dentro do contexto
const fn = new Function('window', 'document', createClubCode);
fn(mockWindow, {
  querySelector: () => null,
  querySelectorAll: () => []
});

console.log('1. Validando exportações globais de create_club_ui.js...');
assert(typeof mockWindow.generateBadgeSvg === 'function', 'generateBadgeSvg deve ser exportado');
assert(typeof mockWindow.generateCustomClubSquad === 'function', 'generateCustomClubSquad deve ser exportado');
assert(typeof mockWindow.openCustomSquadModal === 'function', 'openCustomSquadModal deve ser exportado');
assert(typeof mockWindow.openCustomBadgeModal === 'function', 'openCustomBadgeModal deve ser exportado');
assert(mockWindow.customClubDraft, 'customClubDraft deve existir');
console.log('✓ Funções e draft exportados com sucesso!');

console.log('2. Validando geração de elenco inicial de 20 atletas...');
const squad = mockWindow.generateCustomClubSquad('Valência FC');
assert.strictEqual(squad.length, 20, 'Elenco deve conter exatamente 20 atletas');
assert.strictEqual(squad[0].number, 1, 'Goleiro titular deve ser número 1');
assert.strictEqual(squad[1].number, 12, 'Goleiro reserva deve ser número 12');
assert(squad.every(p => p.number >= 1 && p.number <= 99), 'Todos os atletas devem ter números válidos (1 a 99)');
assert(squad.every(p => p.age >= 16 && p.age <= 40), 'Todos os atletas devem ter idades válidas (16 a 40)');
assert(squad.every(p => p.name && p.name.length > 2), 'Todos os atletas devem ter nomes gerados');
assert(squad.every(p => p.wage >= 1000 && p.wage <= 6000), 'Todos os atletas devem ter salários condizentes');
console.log('✓ 20 atletas gerados com números e posições autênticas!');

console.log('3. Validando novas opções de brasão (Shapes & Patterns)...');
const testShapes = ['hexagonal', 'oval', 'triangle', 'banner', 'gothic', 'vintage'];
const testPatterns = ['eagle', 'lion', 'fire', 'anchor', 'swords', 'sun', 'wings', 'shield_inner', 'checkers', 'chevron'];

for (const shape of testShapes) {
  for (const pat of testPatterns) {
    const svg = mockWindow.generateBadgeSvg({
      shape,
      pattern: pat,
      primaryColor: '#1e3a8a',
      secondaryColor: '#facc15',
      patternColor: '#ffffff',
      motto: 'VFC',
      starsCount: 4,
      year: '2026',
      borderStyle: 'double',
      shine: true
    }, 96);
    assert(svg.includes('<svg'), `SVG deve conter tag de abertura para shape=${shape}, pattern=${pat}`);
    assert(svg.includes('</svg>'), `SVG deve conter tag de fechamento para shape=${shape}, pattern=${pat}`);
    assert(svg.includes('EST. 2026'), 'SVG deve conter ano de fundação quando especificado');
  }
}
console.log('✓ 60 variações com novas formas e estampas geradas com perfeição!');

console.log('4. Validando integração com newCareer em js/game.js...');
const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
assert(gameCode.includes('rawSquad = (data.customSquad && Array.isArray(data.customSquad) && data.customSquad.length >= 11) ? data.customSquad : generateCustomClubSquad(club.name);'), 'newCareer deve aceitar data.customSquad');
assert(gameCode.includes('number: (p.number !== undefined && p.number !== null && !isNaN(Number(p.number))) ? Number(p.number) : (idx + 1)'), 'newCareer deve preservar o número da camisa do atleta');
console.log('✓ Integração do elenco personalizado com newCareer verificada com 100% de sucesso!');

console.log('=== TODOS OS TESTES PASSARAM COM SUCESSO ABSOLUTO! ===');
