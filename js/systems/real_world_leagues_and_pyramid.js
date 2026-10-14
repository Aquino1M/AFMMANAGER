// ==============================================================================
// AFM MANAGER 2027 — ORGANIZACAO REAL DAS LIGAS & PROMOCAO E REBAIXAMENTO
// Arquivo: js/systems/real_world_leagues_and_pyramid.js
// BLOCO 04 E 05 — Pirâmides Reais, Divisões Fidedignas e Promoção/Rebaixamento
// ==============================================================================

(function (window) {
  'use strict';

  // Definicao 100% fiel a vida real das Piramides de Ligas e Regras de Acesso/Descida
  const REAL_LEAGUE_PYRAMIDS = {
    // ==================== AMERICA DO SUL ====================
    BRA: {
      countryName: 'Brasil',
      continent: 'SOUTH_AMERICA',
      nationalCup: 'BRA_COPA_DO_BRASIL',
      divisions: [
        {
          id: 'BRA_SERIE_A',
          aliasIds: ['bra-a', 'bra_a', 'BRA_A'],
          name: 'Brasileirão Série A',
          tier: 1,
          teamsCount: 20,
          rounds: 38,
          promotedCount: 0,
          relegatedCount: 4, // 17º ao 20º caem para a Série B
          relegatedTo: 'BRA_SERIE_B',
          continentalSpots: {
            LIBERTADORES_DIRECT: [1, 2, 3, 4],
            LIBERTADORES_PRE: [5, 6],
            SULAMERICANA: [7, 8, 9, 10, 11, 12]
          }
        },
        {
          id: 'BRA_SERIE_B',
          aliasIds: ['bra-b', 'bra_b', 'BRA_B'],
          name: 'Brasileirão Série B',
          tier: 2,
          teamsCount: 20,
          rounds: 38,
          promotedCount: 4, // 1º ao 4º sobem para a Série A
          promotedTo: 'BRA_SERIE_A',
          relegatedCount: 4, // 17º ao 20º caem para a Série C
          relegatedTo: 'BRA_SERIE_C'
        },
        {
          id: 'BRA_SERIE_C',
          aliasIds: ['bra-c', 'bra_c', 'BRA_C'],
          name: 'Brasileirão Série C',
          tier: 3,
          teamsCount: 20,
          rounds: 19,
          promotedCount: 4, // 4 sobem para a Série B
          promotedTo: 'BRA_SERIE_B',
          relegatedCount: 4, // 4 caem para a Série D
          relegatedTo: 'BRA_SERIE_D'
        },
        {
          id: 'BRA_SERIE_D',
          aliasIds: ['bra-d', 'bra_d', 'BRA_D'],
          name: 'Brasileirão Série D',
          tier: 4,
          teamsCount: 64,
          rounds: 14,
          promotedCount: 4, // Os 4 semifinalistas sobem para a Série C
          promotedTo: 'BRA_SERIE_C',
          relegatedCount: 0
        }
      ]
    },

    ARG: {
      countryName: 'Argentina',
      continent: 'SOUTH_AMERICA',
      nationalCup: 'ARG_COPA_ARGENTINA',
      divisions: [
        {
          id: 'ARG_PRIMERA',
          aliasIds: ['arg-1', 'arg_1', 'ARG_1'],
          name: 'Liga Profesional Argentina',
          tier: 1,
          teamsCount: 28,
          promotedCount: 0,
          relegatedCount: 2,
          relegatedTo: 'ARG_NACIONAL',
          continentalSpots: { LIBERTADORES_DIRECT: [1, 2, 3], SULAMERICANA: [4, 5, 6, 7, 8, 9] }
        },
        {
          id: 'ARG_NACIONAL',
          aliasIds: ['arg-2', 'arg_2', 'ARG_2'],
          name: 'Primera Nacional (B)',
          tier: 2,
          teamsCount: 36,
          promotedCount: 2,
          promotedTo: 'ARG_PRIMERA',
          relegatedCount: 2
        }
      ]
    },

    // ==================== EUROPA ====================
    ENG: {
      countryName: 'Inglaterra',
      continent: 'EUROPE',
      nationalCup: 'ENG_FA_CUP',
      divisions: [
        {
          id: 'ENG_PREMIER_LEAGUE',
          aliasIds: ['eng-1', 'eng_1', 'ENG_1'],
          name: 'Premier League',
          tier: 1,
          teamsCount: 20,
          rounds: 38,
          promotedCount: 0,
          relegatedCount: 3, // 18º, 19º e 20º caem para a Championship
          relegatedTo: 'ENG_CHAMPIONSHIP',
          continentalSpots: {
            UEFA_CHAMPIONS_LEAGUE: [1, 2, 3, 4],
            UEFA_EUROPA_LEAGUE: [5, 6],
            UEFA_CONFERENCE_LEAGUE: [7]
          }
        },
        {
          id: 'ENG_CHAMPIONSHIP',
          aliasIds: ['eng-2', 'eng_2', 'ENG_2'],
          name: 'EFL Championship',
          tier: 2,
          teamsCount: 24,
          rounds: 46,
          directPromotedCount: 2, // 1º e 2º sobem direto
          playoffPromotionPositions: [3, 4, 5, 6], // 3º ao 6º disputam 1 vaga no Playoff de Wembley!
          promotedCount: 3,
          promotedTo: 'ENG_PREMIER_LEAGUE',
          relegatedCount: 3
        }
      ]
    },

    ESP: {
      countryName: 'Espanha',
      continent: 'EUROPE',
      nationalCup: 'ESP_COPA_DEL_REY',
      divisions: [
        {
          id: 'ESP_LALIGA',
          aliasIds: ['esp-1', 'esp_1', 'ESP_1'],
          name: 'LaLiga EA Sports',
          tier: 1,
          teamsCount: 20,
          rounds: 38,
          relegatedCount: 3, // 18º, 19º e 20º caem
          relegatedTo: 'ESP_LALIGA_2',
          continentalSpots: { UEFA_CHAMPIONS_LEAGUE: [1, 2, 3, 4], UEFA_EUROPA_LEAGUE: [5, 6] }
        },
        {
          id: 'ESP_LALIGA_2',
          aliasIds: ['esp-2', 'esp_2', 'ESP_2'],
          name: 'LaLiga Hypermotion',
          tier: 2,
          teamsCount: 22,
          rounds: 42,
          directPromotedCount: 2,
          playoffPromotionPositions: [3, 4, 5, 6],
          promotedCount: 3,
          promotedTo: 'ESP_LALIGA',
          relegatedCount: 4
        }
      ]
    },

    ITA: {
      countryName: 'Itália',
      continent: 'EUROPE',
      nationalCup: 'ITA_COPPA_ITALIA',
      divisions: [
        {
          id: 'ITA_SERIE_A',
          aliasIds: ['ita-1', 'ita_1', 'ITA_1'],
          name: 'Serie A Enilive',
          tier: 1,
          teamsCount: 20,
          rounds: 38,
          relegatedCount: 3,
          relegatedTo: 'ITA_SERIE_B',
          continentalSpots: { UEFA_CHAMPIONS_LEAGUE: [1, 2, 3, 4], UEFA_EUROPA_LEAGUE: [5, 6] }
        },
        {
          id: 'ITA_SERIE_B',
          aliasIds: ['ita-2', 'ita_2', 'ITA_2'],
          name: 'Serie BKT',
          tier: 2,
          teamsCount: 20,
          rounds: 38,
          directPromotedCount: 2,
          playoffPromotionPositions: [3, 4, 5, 6, 7, 8],
          promotedCount: 3,
          promotedTo: 'ITA_SERIE_A',
          relegatedCount: 3
        }
      ]
    },

    GER: {
      countryName: 'Alemanha',
      continent: 'EUROPE',
      nationalCup: 'GER_DFB_POKAL',
      divisions: [
        {
          id: 'GER_BUNDESLIGA',
          aliasIds: ['ger-1', 'ger_1', 'GER_1'],
          name: 'Bundesliga',
          tier: 1,
          teamsCount: 18,
          rounds: 34,
          directRelegatedCount: 2, // 17º e 18º caem direto; 16º joga Playoff contra 3º da 2. Bundesliga
          relegationPlayoffPosition: 16,
          relegatedCount: 3,
          relegatedTo: 'GER_BUNDESLIGA_2',
          continentalSpots: { UEFA_CHAMPIONS_LEAGUE: [1, 2, 3, 4], UEFA_EUROPA_LEAGUE: [5, 6] }
        },
        {
          id: 'GER_BUNDESLIGA_2',
          aliasIds: ['ger-2', 'ger_2', 'GER_2'],
          name: '2. Bundesliga',
          tier: 2,
          teamsCount: 18,
          rounds: 34,
          directPromotedCount: 2,
          promotionPlayoffPosition: 3,
          promotedCount: 3,
          promotedTo: 'GER_BUNDESLIGA',
          relegatedCount: 2
        }
      ]
    },

    FRA: {
      countryName: 'França',
      continent: 'EUROPE',
      nationalCup: 'FRA_COUPE_DE_FRANCE',
      divisions: [
        {
          id: 'FRA_LIGUE_1',
          aliasIds: ['fra-1', 'fra_1', 'FRA_1'],
          name: 'Ligue 1 McDonald’s',
          tier: 1,
          teamsCount: 18,
          rounds: 34,
          directRelegatedCount: 2,
          relegationPlayoffPosition: 16,
          relegatedCount: 3,
          relegatedTo: 'FRA_LIGUE_2',
          continentalSpots: { UEFA_CHAMPIONS_LEAGUE: [1, 2, 3], UEFA_EUROPA_LEAGUE: [4, 5] }
        },
        {
          id: 'FRA_LIGUE_2',
          aliasIds: ['fra-2', 'fra_2', 'FRA_2'],
          name: 'Ligue 2 BKT',
          tier: 2,
          teamsCount: 18,
          rounds: 34,
          promotedCount: 3,
          promotedTo: 'FRA_LIGUE_1',
          relegatedCount: 2
        }
      ]
    },

    POR: {
      countryName: 'Portugal',
      continent: 'EUROPE',
      nationalCup: 'POR_TACA_DE_PORTUGAL',
      divisions: [
        {
          id: 'POR_PRIMEIRA_LIGA',
          aliasIds: ['por-1', 'por_1', 'POR_1'],
          name: 'Liga Portugal Betclic',
          tier: 1,
          teamsCount: 18,
          rounds: 34,
          directRelegatedCount: 2,
          relegationPlayoffPosition: 16,
          relegatedCount: 3,
          relegatedTo: 'POR_LIGA_2',
          continentalSpots: { UEFA_CHAMPIONS_LEAGUE: [1, 2], UEFA_EUROPA_LEAGUE: [3, 4] }
        },
        {
          id: 'POR_LIGA_2',
          aliasIds: ['por-2', 'por_2', 'POR_2'],
          name: 'Liga Portugal 2 Meu Super',
          tier: 2,
          teamsCount: 18,
          rounds: 34,
          promotedCount: 3,
          promotedTo: 'POR_PRIMEIRA_LIGA',
          relegatedCount: 2
        }
      ]
    },

    // ==================== ASIA ====================
    KSA: {
      countryName: 'Arábia Saudita',
      continent: 'ASIA',
      nationalCup: 'KSA_KINGS_CUP',
      divisions: [
        {
          id: 'KSA_PRO_LEAGUE',
          aliasIds: ['ksa-1', 'ksa_1', 'KSA_1'],
          name: 'Saudi Pro League (Roshn)',
          tier: 1,
          teamsCount: 18,
          rounds: 34,
          relegatedCount: 3, // 16º, 17º e 18º caem para a First Division
          relegatedTo: 'KSA_FIRST_DIVISION',
          continentalSpots: { AFC_CHAMPIONS_ELITE: [1, 2, 3] }
        },
        {
          id: 'KSA_FIRST_DIVISION',
          aliasIds: ['ksa-2', 'ksa_2', 'KSA_2'],
          name: 'Saudi First Division (Yelo League)',
          tier: 2,
          teamsCount: 18,
          rounds: 34,
          promotedCount: 3, // 1º, 2º e 3º sobem para a Saudi Pro League
          promotedTo: 'KSA_PRO_LEAGUE',
          relegatedCount: 3
        }
      ]
    },

    JPN: {
      countryName: 'Japão',
      continent: 'ASIA',
      nationalCup: 'JPN_EMPERORS_CUP',
      divisions: [
        {
          id: 'JPN_J1_LEAGUE',
          aliasIds: ['jpn-1', 'jpn_1', 'JPN_1'],
          name: 'Meiji Yasuda J1 League',
          tier: 1,
          teamsCount: 20,
          rounds: 38,
          relegatedCount: 3,
          relegatedTo: 'JPN_J2_LEAGUE',
          continentalSpots: { AFC_CHAMPIONS_ELITE: [1, 2, 3] }
        },
        {
          id: 'JPN_J2_LEAGUE',
          aliasIds: ['jpn-2', 'jpn_2', 'JPN_2'],
          name: 'J2 League',
          tier: 2,
          teamsCount: 20,
          rounds: 38,
          promotedCount: 3,
          promotedTo: 'JPN_J1_LEAGUE',
          relegatedCount: 3
        }
      ]
    }
  };

  // Classificacao exata dos clubes brasileiros por divisao real (impede misturar Barra-SC e Jacuipense na Serie A)
  const BRAZIL_REAL_DIVISION_ASSIGNMENT = {
    BRA_SERIE_A: [
      'Palmeiras', 'Flamengo', 'Botafogo', 'Corinthians', 'São Paulo', 'Internacional',
      'Fluminense', 'Bahia', 'Cruzeiro', 'Vasco da Gama', 'Atlético-MG', 'Grêmio',
      'Red Bull Bragantino', 'Santos', 'Athletico-PR', 'Vitória',
      'Juventude', 'Fortaleza', 'Mirassol', 'Ceará'
    ],
    BRA_SERIE_B: [
      'Coritiba', 'Goiás', 'Novorizontino', 'América-MG', 'Vila Nova', 'CRB',
      'Operário-PR', 'Athletic Club', 'Avaí', 'Chapecoense', 'Cuiabá', 'Atlético-GO',
      'Criciúma', 'Paysandu', 'Remo', 'Ferroviária', 'Amazonas FC', 'Volta Redonda',
      'Botafogo-SP', 'Sport'
    ],
    BRA_SERIE_C: [
      'Ponte Preta', 'Guarani', 'Figueirense', 'CSA', 'ABC', 'Ituano',
      'Brusque', 'Caxias', 'Ypiranga-RS', 'Londrina', 'São Bernardo', 'Confiança',
      'Botafogo-PB', 'Floresta', 'Anápolis', 'Retrô', 'Maringá', 'Itabaiana',
      'Tombense', 'Sampaio Corrêa'
    ],
    BRA_SERIE_D: [
      'Barra-SC', 'Jacuipense', 'Real Brasília', 'Sobradinho', 'Brasiliense', 'Gama',
      'Santa Cruz', 'América-RN', 'Treze', 'Sousa', 'Ferroviário', 'Altos',
      'Manaus', 'Tuna Luso', 'Águia de Marabá', 'Moto Club', 'Imperatriz', 'Tocantinópolis',
      'Aparecidense', 'Goiatuba', 'Crac', 'Ceilândia', 'Mixto', 'União Rondonópolis',
      'Portuguesa-RJ', 'Nova Iguaçu', 'Boavista', 'Água Santa', 'Inter de Limeira', 'Santo André',
      'Pouso Alegre', 'Villa Nova', 'Uberlândia', 'Rio Branco-ES', 'Cianorte', 'Cascavel',
      'Hercílio Luz', 'Joinville', 'Marcílio Dias', 'Brasil de Pelotas', 'Novo Hamburgo', 'Avenida'
    ]
  };

  function normalizeDivisionId(id = '') {
    const s = String(id).toUpperCase().replace(/-/g, '_');
    for (const country of Object.values(REAL_LEAGUE_PYRAMIDS)) {
      for (const div of country.divisions) {
        if (div.id === s || (div.aliasIds && div.aliasIds.map(a => a.toUpperCase().replace(/-/g, '_')).includes(s))) {
          return div.id;
        }
      }
    }
    return s;
  }

  const RealWorldLeaguesSystem = {
    pyramids: REAL_LEAGUE_PYRAMIDS,
    brazilDivisions: BRAZIL_REAL_DIVISION_ASSIGNMENT,

    normalizeDivisionId,

    // Corrige imediatamente a divisao de todos os clubes DENTRO do Save do usuario
    organizeClubsIntoRealDivisions(gameState) {
      const world = window.AFM_IsolatedSave
        ? window.AFM_IsolatedSave.ensureSaveIsolation(gameState)
        : gameState;
      if (!world || !Array.isArray(world.clubs)) return;

      const normalize = (s) => String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      world.clubs.forEach((club) => {
        const cName = normalize(club.name);
        for (const [divId, clubNames] of Object.entries(BRAZIL_REAL_DIVISION_ASSIGNMENT)) {
          if (clubNames.some((n) => normalize(n) === cName)) {
            club.leagueId = divId;
            club.divisionId = divId;
            club.tier = divId === 'BRA_SERIE_A' ? 1 : divId === 'BRA_SERIE_B' ? 2 : divId === 'BRA_SERIE_C' ? 3 : 4;
            break;
          }
        }
      });
    },

    // Retorna os clubes estritamente pertencentes a uma competicao/divisao (evita os 32 clubes misturados na tela)
    getClubsByCompetition(comp, gameState = null) {
      if (!comp) return [];
      const divId = normalizeDivisionId(comp.id || comp);
      
      // Se for uma das séries do Brasil definidas na vida real:
      if (BRAZIL_REAL_DIVISION_ASSIGNMENT[divId]) {
        const realNames = BRAZIL_REAL_DIVISION_ASSIGNMENT[divId];
        const allDivs = Object.values(REAL_LEAGUE_PYRAMIDS).flatMap((p) => p.divisions);
        const divConfig = allDivs.find((d) => d.id === divId);
        const limit = divConfig ? divConfig.teamsCount : realNames.length;
        return realNames.slice(0, limit);
      }

      // Se for outra liga das piramides internacionais:
      const allDivs = Object.values(REAL_LEAGUE_PYRAMIDS).flatMap((p) => p.divisions);
      const divConfig = allDivs.find((d) => d.id === divId);
      if (divConfig && window.COMPETITION_TEAMS && window.COMPETITION_TEAMS[comp.id]) {
        return window.COMPETITION_TEAMS[comp.id].slice(0, divConfig.teamsCount);
      }

      return null;
    },

    // Filtra apenas os clubes que pertencem de verdade aquela liga/divisao no save
    getClubsByLeagueInUserSave(gameState, leagueId = 'BRA_SERIE_A') {
      const canonicalId = normalizeDivisionId(leagueId);
      this.organizeClubsIntoRealDivisions(gameState);
      const world = window.AFM_IsolatedSave
        ? window.AFM_IsolatedSave.ensureSaveIsolation(gameState)
        : gameState;

      const allDivs = Object.values(REAL_LEAGUE_PYRAMIDS).flatMap((p) => p.divisions);
      const divConfig = allDivs.find((d) => d.id === canonicalId);
      const limit = divConfig ? divConfig.teamsCount : 20;

      const clubs = (world?.clubs || []).filter((c) => {
        const cDiv = normalizeDivisionId(c.leagueId || c.divisionId || '');
        return cDiv === canonicalId;
      });

      if (clubs.length > 0) {
        return clubs.slice(0, limit);
      }

      // Fallback usando a lista nominal da vida real
      const staticNames = BRAZIL_REAL_DIVISION_ASSIGNMENT[canonicalId] || [];
      return staticNames.slice(0, limit).map((name, idx) => ({
        id: `club_${canonicalId.toLowerCase()}_${idx + 1}`,
        name,
        leagueId: canonicalId,
        divisionId: canonicalId,
        tier: divConfig ? divConfig.tier : 1
      }));
    },

    // Executa Promocao, Rebaixamento, Playoffs e Vagas nas Copas 100% no Save Individual do Usuario
    processEndOfSeasonPromotionsAndRelegations(gameState) {
      if (!gameState) return [];
      const world = window.AFM_IsolatedSave
        ? window.AFM_IsolatedSave.ensureSaveIsolation(gameState)
        : gameState;
      if (!world) return [];

      const movementsReport = [];
      const movedClubsSet = new Set();

      Object.entries(REAL_LEAGUE_PYRAMIDS).forEach(([countryCode, countryData]) => {
        const divs = countryData.divisions;

        for (let i = 0; i < divs.length - 1; i++) {
          const upperDiv = divs[i];
          const lowerDiv = divs[i + 1];

          // Verifica se ambas as divisões existem no save ativo
          const hasUpper = (world.standingsByLeague && (world.standingsByLeague[upperDiv.id] || world.standingsByLeague[normalizeDivisionId(upperDiv.id)])) ||
                           (world.clubs && world.clubs.some((c) => normalizeDivisionId(c.leagueId || c.divisionId) === upperDiv.id));
          const hasLower = (world.standingsByLeague && (world.standingsByLeague[lowerDiv.id] || world.standingsByLeague[normalizeDivisionId(lowerDiv.id)])) ||
                           (world.clubs && world.clubs.some((c) => normalizeDivisionId(c.leagueId || c.divisionId) === lowerDiv.id));

          if (!hasUpper || !hasLower) continue;

          // Ordena classificação da divisão superior e inferior no save do usuário, excluindo clubes já movimentados
          const rawUpper = this.getSortedStandings(world, upperDiv.id);
          const rawLower = this.getSortedStandings(world, lowerDiv.id);

          const upperStandings = rawUpper.filter((t) => !movedClubsSet.has(String(t.clubId)) && !movedClubsSet.has(t.clubName));
          const lowerStandings = rawLower.filter((t) => !movedClubsSet.has(String(t.clubId)) && !movedClubsSet.has(t.clubName));

          const maxUpperRelegation = Math.min(upperDiv.relegatedCount || 0, Math.max(1, Math.floor(upperStandings.length / 2)));
          const maxLowerPromotion = Math.min(lowerDiv.promotedCount || 0, Math.max(1, Math.floor(lowerStandings.length / 2)));
          const count = Math.min(
            maxUpperRelegation,
            maxLowerPromotion,
            upperStandings.length,
            lowerStandings.length
          );
          if (count <= 0) continue;

          const relegatedTeams = upperStandings.slice(-count);
          let promotedTeams = [];

          // Se a divisão inferior tiver Playoff de Acesso (ex: Championship 3º ao 6º)
          if (lowerDiv.playoffPromotionPositions && lowerDiv.directPromotedCount) {
            const direct = lowerStandings.slice(0, lowerDiv.directPromotedCount);
            const candidates = lowerStandings.slice(
              lowerDiv.directPromotedCount,
              lowerDiv.directPromotedCount + lowerDiv.playoffPromotionPositions.length
            );
            // Vencedor do Playoff
            const playoffWinner = candidates[0] || lowerStandings[count - 1];
            promotedTeams = [...direct, playoffWinner].filter(Boolean);
          } else {
            promotedTeams = lowerStandings.slice(0, count);
          }

          // Aplica a troca de divisão APENAS dentro do Save do usuário
          relegatedTeams.forEach((team) => {
            movedClubsSet.add(String(team.clubId));
            if (team.clubName) movedClubsSet.add(team.clubName);
            const clubObj = (world.clubs || []).find((c) => String(c.id) === String(team.clubId) || c.name === team.clubName);
            if (clubObj) {
              movedClubsSet.add(String(clubObj.id));
              movedClubsSet.add(clubObj.name);
              clubObj.leagueId = lowerDiv.id;
              clubObj.divisionId = lowerDiv.id;
              clubObj.tier = lowerDiv.tier;
            }
          });

          promotedTeams.forEach((team) => {
            movedClubsSet.add(String(team.clubId));
            if (team.clubName) movedClubsSet.add(team.clubName);
            const clubObj = (world.clubs || []).find((c) => String(c.id) === String(team.clubId) || c.name === team.clubName);
            if (clubObj) {
              movedClubsSet.add(String(clubObj.id));
              movedClubsSet.add(clubObj.name);
              clubObj.leagueId = upperDiv.id;
              clubObj.divisionId = upperDiv.id;
              clubObj.tier = upperDiv.tier;
            }
          });

          // Atualiza também gameState.competitionTeams dentro do save ativo (sem tocar window.COMPETITION_TEAMS)
          if (gameState.competitionTeams) {
            const upperKey = upperDiv.aliasIds ? upperDiv.aliasIds[0] : upperDiv.id;
            const lowerKey = lowerDiv.aliasIds ? lowerDiv.aliasIds[0] : lowerDiv.id;
            const upperList = gameState.competitionTeams[upperKey] || gameState.competitionTeams[upperDiv.id] || [];
            const lowerList = gameState.competitionTeams[lowerKey] || gameState.competitionTeams[lowerDiv.id] || [];

            const relNames = relegatedTeams.map(t => t.clubName);
            const promNames = promotedTeams.map(t => t.clubName);

            if (upperList.length && lowerList.length) {
              const newUpper = upperList.filter(n => !relNames.includes(n)).concat(promNames);
              const newLower = lowerList.filter(n => !promNames.includes(n)).concat(relNames);
              gameState.competitionTeams[upperKey] = [...new Set(newUpper)];
              gameState.competitionTeams[lowerKey] = [...new Set(newLower)];
            }
          }

          movementsReport.push({
            country: countryData.countryName,
            upperDivision: upperDiv.name,
            lowerDivision: lowerDiv.name,
            relegated: relegatedTeams.map((t) => t.clubName),
            promoted: promotedTeams.map((t) => t.clubName)
          });
        }
      });

      world.seasonHistory = world.seasonHistory || [];
      world.seasonHistory.push({
        seasonYear: world.seasonYear || gameState.season || 2026,
        movements: movementsReport
      });
      world.seasonYear = (world.seasonYear || gameState.season || 2026) + 1;

      return movementsReport;
    },

    getSortedStandings(world, leagueId) {
      const canonicalId = normalizeDivisionId(leagueId);
      const table = world?.standingsByLeague?.[canonicalId] || world?.standingsByLeague?.[leagueId] || [];
      if (table.length > 0) {
        return [...table].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.wins !== a.wins) return b.wins - a.wins;
          const gdB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
          const gdA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
          if (gdB !== gdA) return gdB - gdA;
          return (b.goalsFor || 0) - (a.goalsFor || 0);
        });
      }

      // Se temos os clubes do save naquela divisão
      const divisionClubs = (world?.clubs || []).filter((c) => {
        const cDiv = normalizeDivisionId(c.leagueId || c.divisionId || '');
        return cDiv === canonicalId;
      });

      if (divisionClubs.length > 0) {
        return divisionClubs
          .map((c) => ({
            clubId: c.id,
            clubName: c.name,
            points: Math.round((c.overall || 70) * (0.85 + Math.random() * 0.3)),
            wins: Math.round(12 + Math.random() * 10),
            goalsFor: 45,
            goalsAgainst: 38
          }))
          .sort((a, b) => b.points - a.points);
      }

      // Fallback das pirâmides estáticas
      const fallbackNames = BRAZIL_REAL_DIVISION_ASSIGNMENT[canonicalId] || [];
      return fallbackNames.map((name, idx) => ({
        clubId: `fallback_${idx}`,
        clubName: name,
        points: Math.round(75 - idx * 2),
        wins: Math.round(20 - idx),
        goalsFor: 50 - idx,
        goalsAgainst: 30 + idx
      }));
    }
  };

  window.AFM_RealWorldLeagues = RealWorldLeaguesSystem;
})(typeof window !== 'undefined' ? window : global);
