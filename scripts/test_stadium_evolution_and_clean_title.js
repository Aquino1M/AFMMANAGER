/**
 * Teste Oficial de Validação:
 * 1. Remoção do subtítulo/nome "Pack Oficial BRFC27" do cabeçalho do Visualizador 3D e dos cards.
 * 2. Catálogo de múltiplos estilos de estádio cobrindo a evolução das arquibancadas até 100.000 pessoas.
 * 3. Resolução dinâmica de estádio conforme capacidade (5k, 18k, 35k, 50k, 75k, 100k).
 * 4. Suporte a 100.000 lugares no projeto de Nova Arena e cálculos de custos/tempo.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Iniciando testes de evolução dos estádios e limpeza de título...');

// Carrega stadium_3d_manager.js no escopo global simulado
const stadiumManagerPath = path.join(__dirname, '..', 'js', 'core', 'stadium_3d_manager.js');
const stadiumManagerContent = fs.readFileSync(stadiumManagerPath, 'utf8');

// Mock simples do ambiente DOM
global.window = global;
global.document = {
  body: {
    appendChild: () => {}
  },
  getElementById: (id) => {
    return null;
  },
  createElement: (tag) => {
    return {
      id: '',
      style: {},
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }
};
global.state = {
  club: 'Corinthians',
  stadiumCapacity: 48000,
  infrastructure: {
    stadium: {
      capacity: 48000,
      level: 4
    }
  }
};

// Executa o script do stadium_3d_manager
eval(stadiumManagerContent);

const AFMStadium3D = global.window.AFMStadium3D;
assert(AFMStadium3D, 'AFMStadium3D deve estar definido em window');

console.log('✓ AFMStadium3D carregado com sucesso');

// 1. Verificação de remoção de texto "Pack Oficial BRFC27"
const catalog = AFMStadium3D.catalog;
assert(!stadiumManagerContent.includes('Pack Oficial BRFC27 • Modelos Low-Poly Otimizados'), 'O texto "Pack Oficial BRFC27 • Modelos Low-Poly Otimizados..." deve ser completamente removido');
assert(!stadiumManagerContent.includes('(Pack BRFC27)'), 'Menções a (Pack BRFC27) devem ser removidas da interface');
console.log('✓ 1. Subtítulo e texto "Pack BRFC27" removidos com sucesso da interface');

// 2. Verificação de estilos de estádio até 100.000 pessoas
assert(catalog['arena_raiz'], 'Deve conter o estilo arena_raiz (Nível 1, até 12k)');
assert(catalog['arena_regional'], 'Deve conter o estilo arena_regional (Nível 2, até 24k)');
assert(catalog['arena_classica'], 'Deve conter o estilo arena_classica (Nível 3, até 40k)');
assert(catalog['arena_monumental'], 'Deve conter o estilo arena_monumental (Nível 4, até 60k)');
assert(catalog['arena_moderna'], 'Deve conter o estilo arena_moderna (Nível 5, até 80k)');
assert(catalog['arena_coliseu'], 'Deve conter o estilo arena_coliseu (Nível 6, até 100k+)');
assert(catalog['gradas_modulares'], 'Deve conter o estilo gradas_modulares (Módulos de Obra)');
assert(catalog['arena_aberta'], 'Deve manter alias arena_aberta para compatibilidade retroativa');

assert.strictEqual(catalog['arena_coliseu'].maxCapacity, 120000, 'Mega Coliseu deve cobrir até 100.000+ pessoas');
assert.strictEqual(catalog['arena_coliseu'].stLevel, 6, 'Mega Coliseu deve ter stLevel = 6');
console.log('✓ 2. Todos os 6 estilos de evolução de arquibancada até 100k + módulos catalogados com sucesso');

// 3. Verificação da resolução dinâmica por capacidade de clube
const testCapacities = [
  { cap: 5000, expected: 'arena_aberta' },
  { cap: 12000, expected: 'arena_aberta' },
  { cap: 18000, expected: 'arena_classica' },
  { cap: 24000, expected: 'arena_classica' },
  { cap: 35000, expected: 'arena_classica' },
  { cap: 40000, expected: 'arena_classica' },
  { cap: 50000, expected: 'arena_monumental' },
  { cap: 60000, expected: 'arena_moderna' },
  { cap: 75000, expected: 'arena_moderna' },
  { cap: 80000, expected: 'arena_coliseu' },
  { cap: 85000, expected: 'arena_coliseu' },
  { cap: 100000, expected: 'arena_coliseu' }
];

testCapacities.forEach(({ cap, expected }) => {
  const model = AFMStadium3D.resolveStadiumModel('Clube Teste', {
    infrastructure: { stadium: { capacity: cap } }
  });
  assert.strictEqual(model.id, expected, `Para capacidade ${cap}, modelo esperado é ${expected}, mas obteve ${model.id}`);
});
console.log('✓ 3. Resolução dinâmica de estádio conforme capacidade testada e validada para 5k, 18k, 35k, 50k, 75k e 100k');

// 4. Teste de renderização do Card Informativo
const cardHTML = AFMStadium3D.renderStadium3DCardHTML('Real Brasília', {
  infrastructure: { stadium: { capacity: 100000 } }
});
assert(cardHTML.includes('Mega Coliseu'), 'O card para 100k deve exibir Mega Coliseu');
assert(cardHTML.includes('100.000 / 100.000 lugares (100%)'), 'O card deve exibir o progresso de 100% rumo aos 100.000 lugares');
assert(!cardHTML.includes('Pack BRFC27'), 'O card não deve conter referências ao Pack BRFC27');
console.log('✓ 4. Card do Estádio 3D renderizado e validado sem textos obsoletos e com jornada 100k');

// 5. Teste de opções no arquivo js/game.js
const gamePath = path.join(__dirname, '..', 'js', 'game.js');
const gameContent = fs.readFileSync(gamePath, 'utf8');

assert(gameContent.includes('100.000 lugares · R$ 850.000.000 (Mega Coliseu 100k)'), 'js/game.js deve incluir a opção de 100.000 lugares para Nova Arena');
assert(!gameContent.includes('Integração Oficial do Estádio 3D (Pack BRFC27)'), 'js/game.js não deve ter menção a Pack BRFC27');
console.log('✓ 5. Opção de 100.000 lugares e limpeza validadas em js/game.js');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
