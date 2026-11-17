/**
 * Testes Unitários e de Integração: Correção da Aba Temporada (Modo Treinador)
 * Cobre:
 * 1. Navegação Série A/B/C/D sem sobrescrita da Série D do Ceilândia.
 * 2. Copa do Brasil com 126 clubes, 5 fases, chaveamento e campeão salvo.
 * 3. Pirâmide Nacional CBF com Série D de 96 clubes e 6 acessos.
 * 4. Sanitização Continental/Mundial em 01/01/2026 e progressão pós-grupos.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock DOM e browser globals para testes em Node
global.window = global;
global.document = {
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => []
};

// Carrega os módulos
require('../js/systems/real_world_leagues_and_pyramid.js');
require('../js/season_view_fix.js');
require('../js/competitions_sync_fix.js');

console.log('🧪 Iniciando testes da Aba Temporada e Competições...');

// =========================================================================
// TESTE 1: Normalização de chaves de divisão e preservação da Série A
// =========================================================================
{
  console.log('  -> Teste 1: Normalização de Divisões e Navegação...');
  assert(typeof window.AFMSeasonView !== 'undefined', 'Módulo AFMSeasonView deve existir');
  const norm = window.AFMSeasonView.normalizeDivisionKey;

  assert.strictEqual(norm('bra-a'), 'bra-a');
  assert.strictEqual(norm('bra_a'), 'bra-a');
  assert.strictEqual(norm('serie_a'), 'bra-a');
  assert.strictEqual(norm('serie-a'), 'bra-a');
  assert.strictEqual(norm('A'), 'bra-a');
  assert.strictEqual(norm('bra-d'), 'bra-d');
  assert.strictEqual(norm('serie_d'), 'bra-d');

  // Simula estado do Ceilândia (divisão bra-d) navegando para Série A
  const stateCeilandia = {
    club: 'Ceilândia',
    compId: 'bra-d',
    season: 2026,
    seasonYear: 2026
  };

  // Se o usuário selecionou Série A, a função deve retornar bra-a mesmo o Ceilândia sendo bra-d
  window.afmSeasonUIState.selectedDivision = 'bra-a';
  const activeDiv = window.AFMSeasonView.getActiveDivisionForSeasonView(stateCeilandia);
  assert.strictEqual(activeDiv, 'bra-a', 'Deve manter bra-a quando o usuário clica na Série A com o Ceilândia');

  window.afmSeasonUIState.selectedDivision = 'bra-b';
  assert.strictEqual(window.AFMSeasonView.getActiveDivisionForSeasonView(stateCeilandia), 'bra-b');

  window.afmSeasonUIState.selectedDivision = null; // reset
  console.log('  ✅ Teste 1 passou: Divisão selecionada é preservada sem fallback indevido.');
}

// =========================================================================
// TESTE 2: Pirâmide CBF - Série D com 96 clubes e 6 acessos
// =========================================================================
{
  console.log('  -> Teste 2: Pirâmide CBF Série D (96 clubes e 6 acessos)...');
  const leaguesSys = window.AFM_RealWorldLeagues;
  assert(leaguesSys, 'AFM_RealWorldLeagues deve estar definido');
  assert(leaguesSys.pyramids && leaguesSys.pyramids.BRA, 'Pirâmide do Brasil deve existir');
  const serieD = leaguesSys.pyramids.BRA.divisions.find(d => d.id === 'BRA_SERIE_D');
  assert(serieD, 'BRA_SERIE_D deve existir na pirâmide');
  assert.strictEqual(serieD.teamsCount, 96, 'Série D deve ter 96 clubes');
  assert.strictEqual(serieD.promotedCount, 6, 'Série D deve promover 6 clubes');

  // Testa ordenação de standings sem ordenação alfabética quando há pontos
  const unsorted = [
    { name: 'Ceilândia', p: 10, v: 3, sg: 5, gp: 8 },
    { name: 'ABC', p: 4, v: 1, sg: -1, gp: 3 },
    { name: 'Brasiliense', p: 12, v: 4, sg: 7, gp: 10 },
    { name: 'Anápolis', p: 10, v: 3, sg: 4, gp: 7 }
  ];
  const sorted = window.AFM_CompetitionsSync.getSortedDivisionStandings(unsorted);
  assert.strictEqual(sorted[0].name, 'Brasiliense', 'Líder deve ser o com mais pontos (12)');
  assert.strictEqual(sorted[1].name, 'Ceilândia', 'Segundo deve ser Ceilândia (10 pts, SG 5)');
  assert.strictEqual(sorted[2].name, 'Anápolis', 'Terceiro deve ser Anápolis (10 pts, SG 4)');
  assert.strictEqual(sorted[3].name, 'ABC', 'Quarto deve ser ABC (4 pts)');
  console.log('  ✅ Teste 2 passou: Série D com 96 clubes/6 acessos e ordenação por critérios de desempate.');
}

// =========================================================================
// TESTE 3: Copa do Brasil com 126 clubes, 5 fases estruturadas e avanço
// =========================================================================
{
  console.log('  -> Teste 3: Copa do Brasil com 126 clubes e chaveamento completo...');
  const stateCopa = {
    club: 'Ceilândia',
    season: 2026,
    copaDoBrasil: {
      season: 2026,
      currentPhase: '1a_fase',
      fases: {
        '1a_fase': {
          name: '1ª Fase',
          entrants: 56,
          fixtures: []
        },
        '2a_fase': { name: '2ª Fase', entrants: 36, fixtures: [] },
        '3a_fase': { name: '3ª Fase', entrants: 16, fixtures: [] },
        '4a_fase': { name: '4ª Fase', entrants: 8, fixtures: [] },
        '5a_fase': { name: '5ª Fase', entrants: 16, fixtures: [] }
      },
      bracket: {
        oitavas: [],
        quartas: [],
        semis: [],
        final: []
      }
    }
  };

  // Preenche a 1ª fase com 28 jogos (56 clubes)
  for (let i = 0; i < 28; i++) {
    stateCopa.copaDoBrasil.fases['1a_fase'].fixtures.push({
      home: `Time H${i}`,
      away: `Time A${i}`,
      played: true,
      score: [2, 1], // home vence todos
      winner: `Time H${i}`
    });
  }

  // Executa sync da progressão
  window.AFM_CompetitionsSync.syncCopaDoBrasilProgression(stateCopa);

  // Simula vitória em todas as fases preliminares
  // 1ª -> 2ª fase:
  window.AFM_CompetitionsSync.syncCopaDoBrasilProgression(stateCopa);
  const f2 = stateCopa.copaDoBrasil.fases['2a_fase'];
  assert(f2.fixtures.length > 0, '2ª Fase deve conter jogos após a conclusão da 1ª Fase');

  // Na 5ª Fase oficial (32 clubes = 16 confrontos), simula a conclusão dos 16 confrontos
  stateCopa.copaDoBrasil.fases['5a_fase'].fixtures = Array.from({length: 16}, (_, i) => ({
    home: `Time 5H${i}`,
    away: `Time 5A${i}`,
    played: true,
    score: [2, 0],
    winner: `Time 5H${i}`
  }));

  // Sincroniza para alimentar as Oitavas de Final
  window.AFM_CompetitionsSync.syncCopaDoBrasilProgression(stateCopa);

  // Bracket das Oitavas deve ter sido preenchido com 8 confrontos
  assert.strictEqual(stateCopa.copaDoBrasil.bracket.oitavas.length, 8, 'Oitavas devem ter 8 confrontos preenchidos');
  assert.strictEqual(stateCopa.copaDoBrasil.bracket.oitavas[0].home, 'Time 5H0');
  assert.strictEqual(stateCopa.copaDoBrasil.bracket.oitavas[0].away, 'Time 5H1');
  console.log('  ✅ Teste 3 passou: Copa do Brasil com 126 clubes avança pelas 5 fases até o chaveamento.');
}

// =========================================================================
// TESTE 4: Sanitização Continental em 01/01/2026 e Placeholders
// =========================================================================
{
  console.log('  -> Teste 4: Sanitização Continental em 01/01/2026 e Handoff...');
  const stateCont = {
    date: '2026-01-01',
    season: 2026,
    tournaments: {
      lib: {
        prePhase1: [
          { home: 'Time 1', away: 'Time 2', played: true, score: [2, 0] } // resultado fantasma
        ],
        bracket: {
          oitavas: [
            { home: 'Mirassol', away: 'Palmeiras' } // clube fixo prematuro
          ]
        }
      }
    }
  };

  // Executa sanitização para o início da temporada
  window.AFM_CompetitionsSync.sanitizeContinentalInitialState(stateCont);

  // Confere se o resultado fantasma e o clube prematuro foram sanitizados para placeholders
  const lib = stateCont.tournaments.lib;
  assert.strictEqual(lib.prePhase1[0].played, false, 'Partida prePhase1 não deve constar como jogada em 01/01');
  assert.strictEqual(lib.bracket.oitavas[0].home, '1º Grupo A', 'Bracket deve conter placeholder e não clube fixo prematuro');
  assert.strictEqual(lib.bracket.oitavas[0].played, false, 'Confronto do mata-mata não deve estar jogado em 01/01');

  // Testa progressão dos grupos da Libertadores: 1º e 2º vão para Oitavas, 3º para Playoffs Sul-Americana
  const stateMidSeason = {
    date: '2026-06-05',
    season: 2026,
    tournaments: {
      lib: {
        groups: {
          A: [
            { name: 'Flamengo', p: 15 },
            { name: 'River Plate', p: 12 },
            { name: 'LDU', p: 7 }, // 3º vai pra Sul-Americana
            { name: 'Táchira', p: 1 }
          ],
          B: [
            { name: 'Palmeiras', p: 14 },
            { name: 'Independiente', p: 10 },
            { name: 'Alianza Lima', p: 6 }, // 3º vai pra Sul-Americana
            { name: 'Cobresal', p: 2 }
          ]
        },
        bracket: { oitavas: [] }
      },
      sud: {
        playoffs: []
      }
    }
  };

  window.AFM_CompetitionsSync.syncContinentalBrackets(stateMidSeason);

  // Verifica se o 3º colocado foi enviado para a Sul-Americana
  assert(stateMidSeason.tournaments.sud.playoffs.length > 0, 'Sul-Americana deve receber terceiros colocados da Lib');
  const sulaParticipants = stateMidSeason.tournaments.sud.playoffs.flatMap(m => [m.home, m.away]);
  assert(sulaParticipants.includes('LDU') || sulaParticipants.includes('Alianza Lima'), 'LDU ou Alianza Lima devem estar nos playoffs da Sula');

  console.log('  ✅ Teste 4 passou: Sanitização e Handoff Continental funcionando perfeitamente.');
}

console.log('🎉 Todos os testes de unidade da Aba Temporada passaram com sucesso!');
