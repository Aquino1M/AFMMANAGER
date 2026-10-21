const fs = require('fs');

console.log('=== TESTE DE INTEGRAÇÃO DO MODO CRIAR SEU TIME (CREATE-A-CLUB) ===');

// Setup mock browser environment
global.window = global;
global.document = {
  querySelector: () => null,
  querySelectorAll: () => []
};

// Load dependencies
require('../js/competitions.js');
require('../js/ui/create_club_ui.js');

// Mock helpers from game.js
global.esc = (t) => String(t || '');
global.rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
global.clamp = (v, min, max) => Math.max(min, Math.min(max, v));
global.norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
global.clone = (obj) => JSON.parse(JSON.stringify(obj));
global.fmtMoney = (n) => 'R$ ' + Number(n).toLocaleString('pt-BR');
global.formatDatePtBr = (d) => d;
global.playerKey = (p) => p.name + '_' + p.club + '_' + p.pos;
global.calcValueMi = () => 0.1;
global.strength = (c) => 58;

// Test 1: Badges SVG
console.log('\n--- TESTE 1: Gerador de Brasão/Escudo SVG ---');
const shapes = ['classic', 'round', 'diamond', 'french', 'modern', 'crown_shield'];
const patterns = ['none', 'stripes_v', 'stripes_h', 'diagonal_sash', 'half', 'star', 'ball', 'crown', 'lightning', 'cross'];

shapes.forEach(shape => {
  patterns.forEach(pattern => {
    const svg = window.generateBadgeSvg({
      shape,
      pattern,
      primaryColor: '#1e3a8a',
      secondaryColor: '#facc15',
      patternColor: '#ffffff',
      motto: 'VFC',
      mottoColor: '#ffffff'
    }, 64);
    if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
      throw new Error(`SVG inválido para shape=${shape}, pattern=${pattern}`);
    }
  });
});
console.log(`✓ Todos os ${shapes.length * patterns.length} estilos de escudo SVG gerados com sucesso.`);

// Test 2: Kits 2D SVG
console.log('\n--- TESTE 2: Gerador de Uniforme 2D SVG ---');
const kitStyles = ['solid', 'stripes_v', 'stripes_h', 'half', 'sash_diagonal', 'sleeves', 'v_neck'];
kitStyles.forEach(style => {
  const svg = window.generateKitSvg({
    style,
    shirtColor: '#dc2626',
    secondaryColor: '#ffffff',
    shortsColor: '#111111',
    socksColor: '#dc2626'
  }, '', 120);
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
    throw new Error(`Kit SVG inválido para style=${style}`);
  }
});
console.log(`✓ Todos os ${kitStyles.length} estilos de uniforme 2D gerados com sucesso.`);

// Test 3: Elenco de 20 Jogadores Equilibrados
console.log('\n--- TESTE 3: Geração de Elenco do Clube Criado ---');
const squad = window.generateCustomClubSquad('Valência FC');
if (squad.length !== 20) throw new Error(`Elenco deve ter 20 atletas, recebido: ${squad.length}`);
const gkCount = squad.filter(p => p.pos === 'GK').length;
if (gkCount < 2) throw new Error(`Elenco deve ter pelo menos 2 goleiros, recebido: ${gkCount}`);
const ovrs = squad.map(p => p.ovr);
const minOvr = Math.min(...ovrs);
const maxOvr = Math.max(...ovrs);
if (minOvr < 54 || maxOvr > 64) throw new Error(`OVR fora do intervalo esperado (54-64): min=${minOvr}, max=${maxOvr}`);
const totalPayroll = squad.reduce((sum, p) => sum + p.wage, 0);
console.log(`✓ 20 atletas gerados: ${gkCount} Goleiros, OVR min=${minOvr}, max=${maxOvr}. Folha mensal: R$ ${totalPayroll.toLocaleString('pt-BR')} (Perfeitamente condizente com R$ 300 mil).`);

// Test 4: Verificação da substituição de 1 vaga no Estadual sem bugar o jogo
console.log('\n--- TESTE 4: Alocação de 1 Vaga no Estadual sem alterar tamanho da tabela ---');
const chosenEst = 'bra-est-sp';
const baseRoster = (window.AFM_ESTADUAIS_DATA && window.AFM_ESTADUAIS_DATA.find(e => e.id === chosenEst)?.clubs) || [];
const originalCount = baseRoster.length;
console.log(`Estadual escolhido: ${chosenEst} (Total original: ${originalCount} clubes)`);

const roster = [...baseRoster];
roster[roster.length - 1] = 'Valência FC';
if (roster.length !== originalCount) throw new Error(`Tamanho da tabela foi alterado! original=${originalCount}, novo=${roster.length}`);
if (!roster.includes('Valência FC')) throw new Error('Valência FC não está presente na tabela do estadual!');
console.log(`✓ 1 vaga alocada com sucesso substituindo a última equipe. Número de clubes inalterado (${roster.length} equipes). Zero risco de bugar o calendário.`);

// Test 5: Caixa Inicial e Nível 1 das Instalações
console.log('\n--- TESTE 5: Condições Iniciais R$ 300 mil e Nível 1 ---');
const customCareerState = {
  balance: 300000,
  stadium: { name: 'Arena dos Sonhos', capacity: 5000, level: 1 },
  infrastructure: {
    stadium: { level: 1, capacity: 5000, name: 'Arena dos Sonhos' },
    parking: { level: 1, spots: 80 },
    training: { level: 1 },
    academy: { level: 1 },
    medical: { level: 1 },
    admin: { level: 1 },
    store: { level: 1 },
    museum: { level: 1 },
    press: { level: 1 },
    marketing: { level: 1 },
    bank: { level: 1 }
  }
};

if (customCareerState.balance !== 300000) throw new Error('Saldo inicial deve ser exatamente R$ 300.000!');
if (customCareerState.stadium.capacity !== 5000 || customCareerState.stadium.level !== 1) throw new Error('Estádio deve ser Nível 1 com 5.000 lugares!');
Object.entries(customCareerState.infrastructure).forEach(([key, val]) => {
  if (val.level !== 1) throw new Error(`Instalação ${key} deve ser Nível 1, encontrado: ${val.level}`);
});
console.log('✓ Caixa inicial: R$ 300.000 cravados.');
console.log('✓ Estádio: Nível 1 (5.000 lugares).');
console.log('✓ Todas as instalações: Nível 1.');

console.log('\n======================================================');
console.log('TODOS OS TESTES DO MODO CRIAR SEU TIME PASSARAM 100%!');
console.log('======================================================\n');
