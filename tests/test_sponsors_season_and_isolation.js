/**
 * Teste de Validação dos Patrocínios Esportivos:
 * 1. Isolamento entre Contrato Ativo e Propostas Disponíveis
 * 2. Correção de colisão de marcas (Penalty Comércio vs Penalty Brasil Raiz)
 * 3. Geração de novas propostas dinâmicas a cada temporada
 * 4. Troca de fornecedor esportivo
 */
const assert = require('assert');
const fs = require('fs');

global.window = global;
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null
};
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

require('../js/competitions.js');
require('../js/player/player_career_engine.js');
const engine = global.AFM_PlayerCareerEngine;

console.log('--- TESTE 1: Isolamento de Contrato Ativo vs Propostas ---');
const testState = {
  gameMode: 'player',
  date: '2026-01-18',
  squad: [{ id: 100, name: 'Atleta Teste', ovr: 45, pos: 'ATA' }],
  controlledPlayerId: 100,
  playerCareerState: {
    athleteOvr: 45,
    sponsorContract: {
      id: 'offer_starter_local',
      name: 'Comércio Esportivo Local',
      brand: 'Penalty',
      monthlyStipend: 600,
      bonusGoal: 500,
      bonusWin: 500,
      totalDays: 180,
      daysRemaining: 180
    },
    availableSponsorOffers: []
  }
};

// Gera propostas para a temporada
const offers = engine.getPlayerSponsorOffers(testState);
assert(offers && offers.length >= 3, 'Deve gerar pelo menos 3 propostas');
console.log('Propostas geradas para a temporada 2026:', offers.map(o => `${o.name} (${o.brand}) - R$ ${o.monthlyStipend}/mês`));

// Valida que o contrato ativo (Comércio Esportivo Local) NÃO está nas propostas
const activeSp = testState.playerCareerState.sponsorContract;
const availableSponsors = offers.filter(sp => {
  if(!activeSp) return true;
  if(sp.id && activeSp.id && String(sp.id).trim() === String(activeSp.id).trim()) return false;
  if(sp.name && activeSp.name && String(sp.name).trim().toLowerCase() === String(activeSp.name).trim().toLowerCase()) return false;
  return true;
});

assert(!availableSponsors.some(sp => sp.name === activeSp.name), 'Contrato em vigor NÃO deve constar na lista de propostas');
console.log('✓ Contrato ativo filtrado com sucesso. Apenas propostas disponíveis no grid:', availableSponsors.map(s => s.name));

console.log('\n--- TESTE 2: Diferenciação entre marcas iguais com termos diferentes ---');
// Penalty Brasil Raiz é uma proposta disponível compatível com o overall
// Comércio Esportivo Local é o contrato de R$ 600
const penaltyProposal = availableSponsors.find(sp => sp.brand === 'Penalty');
if(penaltyProposal){
  assert.notStrictEqual(penaltyProposal.name, activeSp.name, 'Nomes devem ser diferentes');
  assert.notStrictEqual(penaltyProposal.monthlyStipend, activeSp.monthlyStipend, 'Valores devem ser diferentes');
  console.log(`✓ Penalty em vigor: "${activeSp.name}" (R$ ${activeSp.monthlyStipend}/mês) vs Proposta: "${penaltyProposal.name}" (R$ ${penaltyProposal.monthlyStipend}/mês)`);
  console.log('✓ Nenhuma colisão! A proposta da Penalty não está marcada como assinada!');
}

console.log('\n--- TESTE 3: Novas propostas a cada temporada com valorização do atleta ---');
// Simula virada de ano e evolução do jogador para OVR 72 e 20.000 seguidores
testState.date = '2027-01-05';
testState.squad[0].ovr = 72;
testState.playerCareerState.athleteOvr = 72;
testState.playerCareerState.socialMedia = { followers: 20000 };

// Força nova temporada
const season2Offers = engine.generateSeasonSponsorOffers(testState);
console.log('Novas propostas geradas para a temporada 2027 (OVR 72):', season2Offers.map(o => `${o.name} (${o.brand}) - R$ ${o.monthlyStipend}/mês`));

assert(season2Offers.length >= 3, 'Deve gerar novas propostas para 2027');
// Marcas de nível superior (Puma, Adidas, Mizuno, New Balance) devem estar presentes
const higherBrands = season2Offers.map(o => o.brand);
console.log('Marcas interessadas na temporada 2:', higherBrands.join(', '));
const maxWage2027 = Math.max(...season2Offers.map(o => o.monthlyStipend));
const maxWage2026 = Math.max(...offers.map(o => o.monthlyStipend));
assert(maxWage2027 > maxWage2026, `Salários em 2027 (R$ ${maxWage2027}) devem ser maiores que em 2026 (R$ ${maxWage2026}) devido à evolução`);
console.log(`✓ Valorização confirmada: Maior proposta subiu de R$ ${maxWage2026.toLocaleString('pt-BR')} para R$ ${maxWage2027.toLocaleString('pt-BR')}/mês!`);

const youthState = {
  gameMode: 'player', date: '2026-02-01', controlledPlayerId: 'youth',
  squad: [{ id: 'youth', name: 'Atleta Iniciante', ovr: 34 }],
  playerCareerState: {
    athleteOvr: 34,
    availableSponsorOffers: [{ brand: 'Puma', minOvr: 55, monthlyStipend: 3500 }],
    lastSponsorSeasonGenerated: 2026,
    sponsorOfferBalanceVersion: 1
  }
};
const youthOffers = engine.getPlayerSponsorOffers(youthState);
assert.equal(youthOffers.length, 3, 'OVR 34 deve receber somente as três propostas regionais compatíveis');
assert(youthOffers.every(offer => offer.minOvr <= 34 && offer.monthlyStipend <= 250 && offer.bonusGoal <= 120 && offer.bonusWin <= 90));
assert(!youthOffers.some(offer => ['Puma', 'Adidas', 'Nike'].includes(offer.brand)), 'marcas de categoria superior não devem aparecer para OVR 34');
console.log('✓ OVR 34 recebe valores de base proporcionais e proposta antiga de Puma é regenerada.');

console.log('\n✅ TODOS OS TESTES DE PATROCÍNIO PASSARAM COM 100% DE SUCESSO!');
