// scripts/test_real_stadium_name_and_no_glb.js
const fs = require('fs');
const assert = require('assert');

console.log('🧪 Iniciando testes de validação de nome real do estádio e remoção de texto GLB...');

// 1. Validar conteúdo de js/core/stadium_3d_manager.js
const s3dCode = fs.readFileSync('js/core/stadium_3d_manager.js', 'utf8');
assert(!s3dCode.includes('Modelo GLB:'), 'ERRO: "Modelo GLB:" ainda existe no código de stadium_3d_manager.js!');
assert(!s3dCode.includes('Arquivo GLB:'), 'ERRO: "Arquivo GLB:" ainda existe no código de stadium_3d_manager.js!');
console.log('✓ 1. Textos técnicos "Modelo GLB:" e "Arquivo GLB:" removidos com sucesso de js/core/stadium_3d_manager.js');

// 2. Simular ambiente e carregar clubs
const competitionsCode = fs.readFileSync('js/competitions.js', 'utf8');
const vm = require('vm');
const context = {
  window: {},
  document: {
    createElement: () => ({ id: '', style: {}, innerHTML: '', appendChild: () => {}, querySelector: () => null }),
    body: { appendChild: () => {} },
    getElementById: () => null
  },
  console: console
};
vm.createContext(context);
vm.runInContext(competitionsCode, context);

// Simular clubByName
context.clubByName = function(name) {
  if (!name) return null;
  const list = context.window.BASE_CLUBS || context.BASE_CLUBS || [];
  return list.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
};
context.norm = (s) => String(s || '').toLowerCase().trim();

// Carregar stadium_3d_manager
vm.runInContext(s3dCode, context);

// Carregar clubStadiumName de js/game.js
const gameCode = fs.readFileSync('js/game.js', 'utf8');
const fnMatch = gameCode.match(/function clubStadiumName\(targetClub\)\{[\s\S]*?\n\}/);
assert(fnMatch, 'Função clubStadiumName não encontrada em js/game.js');
vm.runInContext(fnMatch[0], context);
context.window.clubStadiumName = context.clubStadiumName;

// Testar resolução de estádios reais
const testCases = [
  { club: 'Flamengo', expected: 'Maracanã' },
  { club: 'Corinthians', expected: 'Neo Química Arena' },
  { club: 'Palmeiras', expected: 'Allianz Parque' },
  { club: 'São Paulo', expected: 'MorumBIS' },
  { club: 'Santos', expected: 'Vila Belmiro' },
  { club: 'Grêmio', expected: 'Arena do Grêmio' },
  { club: 'Cruzeiro', expected: 'Mineirão' }
];

testCases.forEach(({ club, expected }) => {
  const resolved = context.clubStadiumName(club);
  assert.strictEqual(resolved, expected, `Falha ao resolver estádio real para ${club}: esperado "${expected}", obtido "${resolved}"`);
  console.log(`✓ Estádio de ${club}: ${resolved}`);
});

// Testar renderStadium3DCardHTML
testCases.forEach(({ club, expected }) => {
  const cardHtml = context.window.AFMStadium3D.renderStadium3DCardHTML(club, { club, infrastructure: { stadium: { capacity: 45000 } } });
  assert(cardHtml.includes(expected), `Card HTML não inclui o nome real do estádio "${expected}" para o clube ${club}`);
  assert(!cardHtml.includes('Modelo GLB:'), `Card HTML contém texto "Modelo GLB:"`);
  assert(!cardHtml.includes('Arquivo GLB:'), `Card HTML contém texto "Arquivo GLB:"`);
});
console.log('✓ 3. Card 3D renderiza com o nome oficial real de cada clube e sem strings técnicas');

// Testar Naming Rights
context.state = {
  club: 'Flamengo',
  namingRights: { stadiumName: 'Mercado Livre Maracanã' }
};
const nrStadium = context.clubStadiumName();
assert.strictEqual(nrStadium, 'Mercado Livre Maracanã', 'Falha com Naming Rights');
console.log(`✓ 4. Naming Rights prioritário respeitado: ${nrStadium}`);

// Testar Clube Customizado
context.state = {
  club: 'Real Pantanal FC',
  stadiumName: 'Arena Pantaneira Dourada'
};
const customStadium = context.clubStadiumName();
assert.strictEqual(customStadium, 'Arena Pantaneira Dourada', 'Falha com clube customizado');
console.log(`✓ 5. Clube customizado com estádio próprio respeitado: ${customStadium}`);

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
