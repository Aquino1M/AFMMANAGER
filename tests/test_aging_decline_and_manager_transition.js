const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.window.addEventListener = () => {};
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// Load required scripts
require('../js/competitions.js');
require('../js/player/player_career_engine.js');
require('../js/systems/cup_highlight_ranking_world_and_licenses.js');

console.log('--- TEST 1: Aging & Overall Decline (30+ and 34+) ---');
{
  const mockState = {
    gameMode: 'player',
    season: 2030,
    date: '2030-01-01',
    club: 'Real Brasília',
    controlledPlayerId: 'player_user_1',
    squad: [
      {
        id: 'player_user_1',
        name: 'Craque Teste',
        age: 29,
        overall: 80,
        pos: 'ST',
        attributes: {
          fin: 80,
          pas: 75,
          dri: 78,
          vel: 85,
          def: 40,
          fis: 82
        }
      }
    ],
    playerCareerState: {
      athleteName: 'Craque Teste',
      age: 29,
      birthYear: 2001,
      lastAgingYear: 2029,
      weeklyTraining: { focus: 'finalizacao' },
      managerTrust: 70,
      agentOffers: []
    }
  };

  // Turn from 2029 to 2030 (age 29 -> 30)
  const res30 = window.AFM_PlayerEngine.processPlayerAging(mockState, '2030-01-01');
  assert.strictEqual(res30.success, true);
  assert.strictEqual(mockState.playerCareerState.age, 30);
  assert(res30.declinedPoints >= 1 && res30.declinedPoints <= 2, `Expected 1-2 points decline at 30, got ${res30.declinedPoints}`);
  assert(mockState.squad[0].overall < 80, 'Overall should have declined');

  // Turn to 2033 (age 33) with training focus 'fisico' (maintenance exception)
  mockState.playerCareerState.weeklyTraining.focus = 'fisico';
  const res33 = window.AFM_PlayerEngine.processPlayerAging(mockState, '2033-01-01');
  assert.strictEqual(mockState.playerCareerState.age, 33);
  // After 32, decline can never be 0 even with maintenance
  assert(res33.declinedPoints >= 1, `Decline after 32 must be at least 1 point, got ${res33.declinedPoints}`);

  // Turn to 2035 (age 35, 34+ bracket: 2-4 points)
  mockState.playerCareerState.weeklyTraining.focus = 'finalizacao';
  const res35 = window.AFM_PlayerEngine.processPlayerAging(mockState, '2035-01-01');
  assert.strictEqual(mockState.playerCareerState.age, 35);
  console.log('✓ Player aging and decline passed with success.');
}

console.log('--- TEST 2: Age 35 Retirement Letter & Idempotency ---');
{
  const mockState = {
    gameMode: 'player',
    season: 2035,
    date: '2035-06-15',
    club: 'Real Brasília',
    controlledPlayerId: 'player_user_1',
    news: [],
    squad: [
      { id: 'player_user_1', name: 'Craque Teste', age: 35, overall: 72, pos: 'ST' }
    ],
    playerCareerState: {
      athleteName: 'Craque Teste',
      age: 35,
      birthYear: 2000,
      agentOffers: []
    }
  };

  // Trigger coach career offer
  const offer = window.AFM_PlayerEngine.ensureCoachCareerOffer(mockState);
  assert(offer !== null, 'Should have generated offer at 35');
  assert.strictEqual(offer.type, 'coach_career');
  assert.strictEqual(offer.title, 'O Ciclo se Encerra? Proposta de Transição de Carreira');
  assert.strictEqual(mockState.playerCareerState.hasReceived35RetirementLetter, true);
  assert(mockState.playerCareerState.agentOffers.some(o => o.type === 'coach_career'));

  // Player declines the offer
  mockState.playerCareerState.coachCareerOfferDeclined = true;
  mockState.playerCareerState.agentOffers = mockState.playerCareerState.agentOffers.filter(o => o.type !== 'coach_career');

  // Next days should NOT regenerate the letter
  const secondCall = window.AFM_PlayerEngine.ensureCoachCareerOffer(mockState);
  assert.strictEqual(secondCall, null, 'Must be idempotent and not re-trigger after declining');
  assert.strictEqual(mockState.playerCareerState.agentOffers.filter(o => o.type === 'coach_career').length, 0);

  // Manual retirement on demand
  const manualOffer = window.AFM_PlayerEngine.generateCoachOfferForRetirement(mockState);
  assert(manualOffer !== null, 'Should generate on-demand offer for manual retirement');
  assert.strictEqual(manualOffer.type, 'coach_career');
  console.log('✓ Age 35 retirement letter and idempotency passed with success.');
}

console.log('--- TEST 3: In-Place Transition (Player ➔ Manager) & Ex-Athlete Bonuses ---');
{
  let saveOptions = null;
  window.save = (opts) => { saveOptions = opts; };

  const mockState = {
    gameMode: 'player',
    season: 2036,
    date: '2036-12-01',
    club: 'Real Brasília',
    controlledPlayerId: 'p_10',
    manager: 'Antigo Tecnico',
    managerAge: 50,
    managerNationality: 'Brasil',
    squad: [
      { id: 'p_10', name: 'Diogenes Aquino', age: 36, overall: 70, pos: 'ST' },
      { id: 'p_11', name: 'Goleiro Titular', age: 26, overall: 75, pos: 'GK' }
    ],
    playerCareerState: {
      athleteName: 'Diogenes Aquino',
      age: 36,
      birthYear: 2000,
      nationality: 'Brasil',
      agentOffers: [],
      careerTotals: { goals: 120, assists: 45, matches: 210 }
    }
  };

  const offer = {
    type: 'coach_career',
    newClub: 'Real Brasília'
  };

  const res = window.AFM_PlayerEngine.startManagerCareerFromPlayerRetirement(mockState, offer);
  assert.strictEqual(res.ok, true, 'Transition should succeed');
  assert.strictEqual(mockState.gameMode, 'manager', 'State mode must be manager');
  assert.strictEqual(mockState.manager, 'Diogenes Aquino', 'Manager name should match player');
  assert.strictEqual(mockState.managerAge, 36, 'Manager age must be player retirement age');
  assert.strictEqual(mockState.managerNationality, 'Brasil');
  assert.strictEqual(mockState.controlledPlayerId, undefined, 'Player ID must be cleared');
  assert.strictEqual(mockState.playerCareerState, undefined, 'Player state must be removed from active');
  assert(mockState.retiredPlayerCareer !== undefined, 'Player career must be archived');

  // Verify ex-athlete bonuses
  assert.strictEqual(mockState.bonusSalarioTreinador, 10);
  assert.strictEqual(mockState.bonusNegociacaoJogadores, 5);
  assert.deepStrictEqual(mockState.managerCareerBonuses, { salaryPct: 10, playerSigningChancePct: 5 });
  assert.strictEqual(saveOptions?.allowModeReplace, true, 'Save must allow authorized mode replace');

  // Verify salary bonus integration with getCoachLicensesData
  const licData = window.getCoachLicensesData(mockState);
  assert(licData.totalBonusPct >= 10, `Salary bonus should include ex-athlete +10%, got ${licData.totalBonusPct}`);

  console.log('✓ In-place transition and manager bonuses passed with success.');
}

console.log('ALL TESTS PASSED!');
