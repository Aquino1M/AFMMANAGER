/**
 * AFM MANAGER 2026 / 2027 — SISTEMA OFICIAL DE DATA FIFA & SELEÇÕES NACIONAIS
 * Módulo exclusivo para o Modo Carreira Jogador (Be a Pro).
 * 
 * Regras Invioláveis:
 * 1. Não duplica jogadores (mantém referências reais ao pack window.livePlayers e state.squad).
 * 2. Empréstimo virtual temporário durante a Data FIFA (onInternationalDuty: true).
 * 3. Leitura dinâmica do pack completo agrupado por nacionalidade.
 * 4. Isolamento estrito: zero impacto no Modo Treinador.
 */

(function(window){
  'use strict';

  function esc(str){
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =========================================================================
  // 1. CATÁLOGO OFICIAL DE SELEÇÕES NACIONAIS (CONFEDERAÇÃO, BANDEIRA, CORES)
  // =========================================================================
  const NATIONAL_TEAMS_CATALOG = {
    'Brasil': {
      name: 'Brasil',
      code: 'BRA',
      flag: '🇧🇷',
      confederation: 'CONMEBOL',
      coach: 'Dorival Júnior',
      primaryColor: '#facc15',
      secondaryColor: '#1d4ed8',
      textBadge: 'CBF',
      stadium: 'Maracanã',
      rivals: ['Argentina', 'Uruguai', 'França', 'Alemanha']
    },
    'Argentina': {
      name: 'Argentina',
      code: 'ARG',
      flag: '🇦🇷',
      confederation: 'CONMEBOL',
      coach: 'Lionel Scaloni',
      primaryColor: '#7dd3fc',
      secondaryColor: '#ffffff',
      textBadge: 'AFA',
      stadium: 'Monumental de Núñez',
      rivals: ['Brasil', 'Uruguai', 'França', 'Inglaterra']
    },
    'França': {
      name: 'França',
      code: 'FRA',
      flag: '🇫🇷',
      confederation: 'UEFA',
      coach: 'Didier Deschamps',
      primaryColor: '#1e3a8a',
      secondaryColor: '#ffffff',
      textBadge: 'FFF',
      stadium: 'Stade de France',
      rivals: ['Alemanha', 'Espanha', 'Inglaterra', 'Argentina']
    },
    'Portugal': {
      name: 'Portugal',
      code: 'POR',
      flag: '🇵🇹',
      confederation: 'UEFA',
      coach: 'Roberto Martínez',
      primaryColor: '#dc2626',
      secondaryColor: '#15803d',
      textBadge: 'FPF',
      stadium: 'Estádio da Luz',
      rivals: ['Espanha', 'França', 'Alemanha']
    },
    'Inglaterra': {
      name: 'Inglaterra',
      code: 'ENG',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      confederation: 'UEFA',
      coach: 'Thomas Tuchel',
      primaryColor: '#ffffff',
      secondaryColor: '#dc2626',
      textBadge: 'FA',
      stadium: 'Wembley',
      rivals: ['Alemanha', 'França', 'Argentina', 'Escócia']
    },
    'Espanha': {
      name: 'Espanha',
      code: 'ESP',
      flag: '🇪🇸',
      confederation: 'UEFA',
      coach: 'Luis de la Fuente',
      primaryColor: '#dc2626',
      secondaryColor: '#facc15',
      textBadge: 'RFEF',
      stadium: 'Santiago Bernabéu',
      rivals: ['Portugal', 'França', 'Itália', 'Alemanha']
    },
    'Uruguai': {
      name: 'Uruguai',
      code: 'URU',
      flag: '🇺🇾',
      confederation: 'CONMEBOL',
      coach: 'Marcelo Bielsa',
      primaryColor: '#38bdf8',
      secondaryColor: '#000000',
      textBadge: 'AUF',
      stadium: 'Estádio Centenário',
      rivals: ['Brasil', 'Argentina', 'Colômbia']
    },
    'Alemanha': {
      name: 'Alemanha',
      code: 'GER',
      flag: '🇩🇪',
      confederation: 'UEFA',
      coach: 'Julian Nagelsmann',
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
      textBadge: 'DFB',
      stadium: 'Allianz Arena',
      rivals: ['Inglaterra', 'França', 'Itália', 'Holanda']
    },
    'Itália': {
      name: 'Itália',
      code: 'ITA',
      flag: '🇮🇹',
      confederation: 'UEFA',
      coach: 'Luciano Spalletti',
      primaryColor: '#1d4ed8',
      secondaryColor: '#ffffff',
      textBadge: 'FIGC',
      stadium: 'San Siro',
      rivals: ['Alemanha', 'França', 'Espanha', 'Brasil']
    },
    'Holanda': {
      name: 'Holanda',
      code: 'NED',
      flag: '🇳🇱',
      confederation: 'UEFA',
      coach: 'Ronald Koeman',
      primaryColor: '#ea580c',
      secondaryColor: '#ffffff',
      textBadge: 'KNVB',
      stadium: 'Johan Cruyff Arena',
      rivals: ['Alemanha', 'Bélgica', 'Argentina']
    },
    'Colômbia': {
      name: 'Colômbia',
      code: 'COL',
      flag: '🇨🇴',
      confederation: 'CONMEBOL',
      coach: 'Néstor Lorenzo',
      primaryColor: '#facc15',
      secondaryColor: '#1d4ed8',
      textBadge: 'FCF',
      stadium: 'Metropolitano de Barranquilla',
      rivals: ['Brasil', 'Argentina', 'Uruguai']
    },
    'Paraguai': {
      name: 'Paraguai',
      code: 'PAR',
      flag: '🇵🇾',
      confederation: 'CONMEBOL',
      coach: 'Gustavo Alfaro',
      primaryColor: '#dc2626',
      secondaryColor: '#1d4ed8',
      textBadge: 'APF',
      stadium: 'Defensores del Chaco',
      rivals: ['Brasil', 'Argentina', 'Uruguai']
    },
    'Equador': {
      name: 'Equador',
      code: 'ECU',
      flag: '🇪🇨',
      confederation: 'CONMEBOL',
      coach: 'Sebastián Beccacece',
      primaryColor: '#facc15',
      secondaryColor: '#1d4ed8',
      textBadge: 'FEF',
      stadium: 'Estadio Rodrigo Paz Delgado',
      rivals: ['Peru', 'Colômbia', 'Brasil']
    },
    'Chile': {
      name: 'Chile',
      code: 'CHI',
      flag: '🇨🇱',
      confederation: 'CONMEBOL',
      coach: 'Ricardo Gareca',
      primaryColor: '#dc2626',
      secondaryColor: '#1d4ed8',
      textBadge: 'FFCh',
      stadium: 'Estadio Nacional de Chile',
      rivals: ['Peru', 'Argentina', 'Bolívia']
    },
    'Estados Unidos': {
      name: 'Estados Unidos',
      code: 'USA',
      flag: '🇺🇸',
      confederation: 'CONCACAF',
      coach: 'Mauricio Pochettino',
      primaryColor: '#ffffff',
      secondaryColor: '#1e3a8a',
      textBadge: 'USSF',
      stadium: 'Mercedes-Benz Stadium',
      rivals: ['México', 'Canadá']
    },
    'Japão': {
      name: 'Japão',
      code: 'JPN',
      flag: '🇯🇵',
      confederation: 'AFC',
      coach: 'Hajime Moriyasu',
      primaryColor: '#1d4ed8',
      secondaryColor: '#ffffff',
      textBadge: 'JFA',
      stadium: 'Saitama Stadium',
      rivals: ['Coreia do Sul', 'Austrália']
    },
    'Bélgica': {
      name: 'Bélgica',
      code: 'BEL',
      flag: '🇧🇪',
      confederation: 'UEFA',
      coach: 'Domenico Tedesco',
      primaryColor: '#dc2626',
      secondaryColor: '#000000',
      textBadge: 'RBFA',
      stadium: 'King Baudouin Stadium',
      rivals: ['Holanda', 'França']
    },
    'Croácia': {
      name: 'Croácia',
      code: 'CRO',
      flag: '🇭🇷',
      confederation: 'UEFA',
      coach: 'Zlatko Dalić',
      primaryColor: '#dc2626',
      secondaryColor: '#ffffff',
      textBadge: 'HNS',
      stadium: 'Stadion Maksimir',
      rivals: ['Sérvia', 'França']
    }
  };

  // Mapeamento de sinônimos e nomes comuns para o catálogo padrão
  const NATIONALITY_SYNONYMS = {
    'brazil': 'Brasil',
    'brasil': 'Brasil',
    'brasileiro': 'Brasil',
    'brasileira': 'Brasil',
    'argentina': 'Argentina',
    'argentino': 'Argentina',
    'france': 'França',
    'frança': 'França',
    'frances': 'França',
    'francês': 'França',
    'portugal': 'Portugal',
    'portugues': 'Portugal',
    'português': 'Portugal',
    'england': 'Inglaterra',
    'inglaterra': 'Inglaterra',
    'ingles': 'Inglaterra',
    'inglês': 'Inglaterra',
    'spain': 'Espanha',
    'espanha': 'Espanha',
    'espanhol': 'Espanha',
    'uruguay': 'Uruguai',
    'uruguai': 'Uruguai',
    'germany': 'Alemanha',
    'alemanha': 'Alemanha',
    'alemao': 'Alemanha',
    'alemão': 'Alemanha',
    'italy': 'Itália',
    'italia': 'Itália',
    'italiano': 'Itália',
    'netherlands': 'Holanda',
    'holanda': 'Holanda',
    'holandes': 'Holanda',
    'holandês': 'Holanda',
    'colombia': 'Colômbia',
    'colômbia': 'Colômbia',
    'paraguay': 'Paraguai',
    'paraguai': 'Paraguai',
    'ecuador': 'Equador',
    'equador': 'Equador',
    'chile': 'Chile',
    'chileno': 'Chile',
    'united states': 'Estados Unidos',
    'estados unidos': 'Estados Unidos',
    'usa': 'Estados Unidos',
    'japan': 'Japão',
    'japao': 'Japão',
    'japão': 'Japão',
    'belgium': 'Bélgica',
    'belgica': 'Bélgica',
    'croatia': 'Croácia',
    'croacia': 'Croácia'
  };

  // =========================================================================
  // 2. DATAS FIFA OFICIAIS (CALENDÁRIO DA TEMPORADA)
  // =========================================================================
  const FIFA_WINDOWS_SCHEDULE = [
    {
      id: 'fifa_window_1',
      name: 'Data FIFA de Março',
      type: 'Eliminatórias / Amistosos',
      startMmDd: '03-24',
      matchMmDd: '03-27',
      endMmDd: '03-31',
      desc: 'Rodada Oficial de Eliminatórias e Amistosos Internacionais'
    },
    {
      id: 'fifa_window_2',
      name: 'Data FIFA de Junho',
      type: 'Preparação Internacional',
      startMmDd: '06-02',
      matchMmDd: '06-05',
      endMmDd: '06-09',
      desc: 'Testes de alto nível com confrontos entre seleções de diferentes continentes'
    },
    {
      id: 'fifa_window_3',
      name: 'Data FIFA de Setembro',
      type: 'Eliminatórias',
      startMmDd: '09-01',
      matchMmDd: '09-04',
      endMmDd: '09-08',
      desc: 'Disputa acirrada por vagas na Copa do Mundo'
    },
    {
      id: 'fifa_window_4',
      name: 'Data FIFA de Outubro',
      type: 'Eliminatórias',
      startMmDd: '10-06',
      matchMmDd: '10-09',
      endMmDd: '10-13',
      desc: 'Reta decisiva das Eliminatórias Continentais'
    },
    {
      id: 'fifa_window_5',
      name: 'Data FIFA de Novembro',
      type: 'Superclássico Internacional',
      startMmDd: '11-10',
      matchMmDd: '11-14',
      endMmDd: '11-18',
      desc: 'Encerramento do ano com confrontos históricos entre grandes seleções'
    }
  ];

  /**
   * Normaliza qualquer string de país para o catálogo oficial
   */
  function normalizeNationality(rawCountry, clubName = null){
    const clean = String(rawCountry || '').trim();
    const cleanLower = clean.toLowerCase();
    if(cleanLower && NATIONALITY_SYNONYMS[cleanLower]){
      return NATIONALITY_SYNONYMS[cleanLower];
    }
    for(const key of Object.keys(NATIONAL_TEAMS_CATALOG)){
      if(key.toLowerCase() === cleanLower){
        return key;
      }
    }
    // Se o país veio preenchido mas não está nas chaves diretas (ex: Marrocos, Senegal, Sérvia), mantém o país real
    if(clean && clean !== 'null' && clean !== 'undefined' && clean.length > 2){
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    // Dedução pelo clube APENAS caso o jogador não tenha país definido
    if(clubName){
      const cLower = String(clubName).toLowerCase();
      if(cLower.includes('boca') || cLower.includes('river') || cLower.includes('racing') || cLower.includes('independiente') || cLower.includes('san lorenzo')){
        return 'Argentina';
      }
      if(cLower.includes('inter miami') || cLower.includes('la galaxy') || cLower.includes('ny red bulls')){
        return 'Estados Unidos';
      }
      if(cLower.includes('benfica') || cLower.includes('porto') || cLower.includes('sporting')){
        return 'Portugal';
      }
      if(cLower.includes('real madrid') || cLower.includes('barcelona') || cLower.includes('atlético de madrid')){
        return 'Espanha';
      }
      if(cLower.includes('psg') || cLower.includes('paris') || cLower.includes('marseille') || cLower.includes('lyon')){
        return 'França';
      }
      if(cLower.includes('manchester') || cLower.includes('liverpool') || cLower.includes('arsenal') || cLower.includes('chelsea')){
        return 'Inglaterra';
      }
      if(cLower.includes('bayern') || cLower.includes('dortmund') || cLower.includes('leverkusen')){
        return 'Alemanha';
      }
    }
    return 'Brasil'; // Padrão base da liga se vazio
  }

  /**
   * Retorna os metadados da seleção nacional
   */
  function getNationalTeamMeta(countryName){
    const normName = normalizeNationality(countryName);
    return NATIONAL_TEAMS_CATALOG[normName] || NATIONAL_TEAMS_CATALOG['Brasil'];
  }

  /**
   * Converte a posição do atleta no setor macro de convocação:
   * 'GK' | 'DEF' | 'MID' | 'ATT'
   */
  function getPlayerSector(pos){
    const p = String(pos || '').trim().toUpperCase();
    if(p === 'GK' || p === 'GOL' || p === 'GL') return 'GK';
    if(['CB', 'LB', 'RB', 'LWB', 'RWB', 'ZAG', 'LE', 'LD', 'ZG', 'DF'].includes(p)) return 'DEF';
    if(['DM', 'CM', 'AM', 'LM', 'RM', 'VOL', 'MC', 'MEI', 'MD', 'ME'].includes(p)) return 'MID';
    return 'ATT'; // 'CF', 'ST', 'LW', 'RW', 'ATA', 'SA', 'PD', 'PE', etc.
  }

  /**
   * 2. ALGORITMO DE CONVOCAÇÃO POR DESEMPENHO (calculateCallUpScore)
   * Fórmula especificada pelo usuário:
   * score = (overall * 1.0) + (averageRating * 5.0) + (goals * 0.8 + assists * 0.6) + (matchesPlayed * 0.3)
   */
  function calculateCallUpScore(player, gameState = null){
    if(!player) return 0;
    const ovr = Number(player.overall || player.ovr || player.fc || player.pes) || 60;
    
    // Estatísticas da temporada
    const pCareer = gameState?.playerCareerState;
    const isCareerAthlete = Boolean(pCareer && ((gameState.controlledPlayerId != null && player.id === gameState.controlledPlayerId) || player.isControlled || player.name === pCareer.athleteName));
    const sStats = isCareerAthlete ? (pCareer.seasonStats || player.seasonStats || {}) : (player.seasonStats || {});
    const history = isCareerAthlete ? (pCareer.matchRatingHistory || []).filter(match => !match.date || String(match.date).startsWith(String(gameState.season || '').slice(0, 4))) : [];
    const avgRating = Number(sStats.averageRating || sStats.avgRating || (history.length ? history.reduce((sum, match) => sum + (Number(match.rating) || 0), 0) / history.length : 0) || player.averageRating || player.rating || 6.2);
    const goals = Math.max(Number(sStats.goals) || 0, history.reduce((sum, match) => sum + (Number(match.goals) || 0), 0), Number(player.goals) || 0);
    const assists = Math.max(Number(sStats.assists) || 0, history.reduce((sum, match) => sum + (Number(match.assists) || 0), 0), Number(player.assists) || 0);
    const matches = Math.max(Number(sStats.matches || sStats.matchesPlayed) || 0, history.length, Number(player.matches) || 0);
    const cleanSheets = Number(sStats.cleanSheets || player.cleanSheets || 0);
    const mvpCount = Number(sStats.mvpCount || player.mvpCount || 0);

    let score = (ovr * 1.0) +
                (avgRating * 5.0) +
                (goals * 0.8) +
                (assists * 0.6) +
                (matches * 0.3) +
                (cleanSheets * 0.4) +
                (mvpCount * 1.5);

    // Bônus para atletas em alta com reputação de seleção
    if(player.isControlled || (gameState?.controlledPlayerId != null && player.id === gameState.controlledPlayerId)){
      const pCareer = gameState?.playerCareerState || {};
      const trust = Number(pCareer.managerTrust) || 45;
      score += Math.max(0, (trust - 50) * 0.15);
      const caps = Number(pCareer.internationalStats?.caps) || 0;
      if(caps > 0) score += Math.min(10, caps * 1.2);
    }

    return Math.round(score * 10) / 10;
  }

  /**
   * Varredura do pack completo agrupando os jogadores de uma nacionalidade
   * Nunca duplica jogadores e inclui o jogador do usuário se for do mesmo país.
   */
  function getPlayerPoolByNationality(countryName, gameState = null){
    const targetCountry = normalizeNationality(countryName);
    const map = new Map();

    function addPlayer(p, sourceClub){
      if(!p || !p.name) return;
      const pCountry = normalizeNationality(p.country || p.nationality, p.club || sourceClub);
      if(pCountry !== targetCountry) return;

      const pKey = String(p.id || p.tmId || (p.name + '_' + (p.club || sourceClub))).toLowerCase();
      if(map.has(pKey)) return;

      const ovr = Number(p.overall || p.ovr || p.fc || p.pes) || 65;
      const sector = getPlayerSector(p.pos || p.position);

      map.set(pKey, {
        id: p.id || pKey,
        key: pKey,
        name: p.name,
        fullName: p.fullName || p.name,
        pos: p.pos || p.position || 'ATA',
        sector: sector,
        club: p.club || sourceClub || 'Clube',
        country: targetCountry,
        overall: ovr,
        ovr: ovr,
        age: Number(p.age) || 24,
        goals: Number(p.goals || p.seasonStats?.goals || 0),
        assists: Number(p.assists || p.seasonStats?.assists || 0),
        cleanSheets: Number(p.cleanSheets || p.seasonStats?.cleanSheets || 0),
        matches: Number(p.matches || p.seasonStats?.matches || 0),
        rating: Number(p.averageRating || p.rating || 6.5),
        photo: p.photo || null,
        isUser: Boolean(p.isControlled || (gameState?.controlledPlayerId != null && p.id === gameState.controlledPlayerId) || (gameState?.playerCareerState?.athleteName && p.name === gameState.playerCareerState.athleteName)),
        score: calculateCallUpScore(p, gameState),
        rawRef: p
      });
    }

    // 1. Jogadores do Elenco do Usuário (incluindo o próprio atleta controlado)
    if(gameState && Array.isArray(gameState.squad)){
      gameState.squad.forEach(p => addPlayer(p, gameState.club));
    }

    // 2. Pack Principal Mundial / Nacional (window.livePlayers)
    if(Array.isArray(window.livePlayers)){
      window.livePlayers.forEach(p => addPlayer(p, p.club));
    } else if(Array.isArray(window.LIVE_PLAYERS)){
      window.LIVE_PLAYERS.forEach(p => addPlayer(p, p.club));
    }

    // 3. Regens mundiais se houver no save
    if(gameState && Array.isArray(gameState.worldRegens)){
      gameState.worldRegens.forEach(p => addPlayer(p, p.club));
    }

    return Array.from(map.values());
  }

  /**
   * Gera a Convocação Oficial de 23 Jogadores para uma Seleção Nacional
   * - 3 Goleiros (GK)
   * - 8 Defensores (CB, LB, RB)
   * - 6 Meio-Campistas (DM, CM, AM)
   * - 6 Atacantes (LW, RW, CF, ST)
   */
  function generateNationalTeamCallUp(countryName, gameState = null){
    if(countryName && typeof countryName === 'object' && !gameState){
      gameState = countryName;
      countryName = gameState?.playerCareerState?.nationality || 'Brasil';
    } else if(countryName && typeof countryName === 'object' && typeof gameState === 'string'){
      const tmp = countryName;
      countryName = gameState;
      gameState = tmp;
    }
    const meta = getNationalTeamMeta(countryName);
    const pool = getPlayerPoolByNationality(meta.name, gameState);

    // Agrupa por setor e ordena por score decrescente
    const gks = pool.filter(p => p.sector === 'GK').sort((a,b) => b.score - a.score);
    const defs = pool.filter(p => p.sector === 'DEF').sort((a,b) => b.score - a.score);
    const mids = pool.filter(p => p.sector === 'MID').sort((a,b) => b.score - a.score);
    const atts = pool.filter(p => p.sector === 'ATT').sort((a,b) => b.score - a.score);

    // 23 convocados padrão
    const calledGKs = gks.slice(0, 3);
    const calledDefs = defs.slice(0, 8);
    const calledMids = mids.slice(0, 6);
    const calledAtts = atts.slice(0, 6);

    const fullSquad23 = [...calledGKs, ...calledDefs, ...calledMids, ...calledAtts];

    // Identifica se o usuário está entre os 23
    const userAthlete = fullSquad23.find(p => p.isUser);
    const isUserCalledUp = Boolean(userAthlete);

    // Status do usuário no país
    let userSectorRanking = 999;
    let userStatus = 'Distante da Convocação';
    let userStatusColor = '#ef4444';

    if(gameState && (gameState.gameMode === 'player' || gameState.playerCareerState)){
      const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId || p.isControlled);
      if(athlete){
        const userSector = getPlayerSector(athlete.pos);
        const sectorPool = userSector === 'GK' ? gks : (userSector === 'DEF' ? defs : (userSector === 'MID' ? mids : atts));
        const userIdx = sectorPool.findIndex(p => p.isUser || p.id === athlete.id || p.name === athlete.name);
        userSectorRanking = userIdx >= 0 ? (userIdx + 1) : (sectorPool.length + 1);

        const sectorLimit = userSector === 'GK' ? 3 : (userSector === 'DEF' ? 8 : (userSector === 'MID' ? 6 : 6));
        const starterLimit = userSector === 'GK' ? 1 : (userSector === 'DEF' ? 4 : (userSector === 'MID' ? 3 : 3));

        if(userSectorRanking <= starterLimit){
          userStatus = '⭐ Titular Absoluto da Seleção';
          userStatusColor = '#10b981';
        } else if(userSectorRanking <= sectorLimit){
          userStatus = '🟢 Convocado (Reserva Imediato)';
          userStatusColor = '#38bdf8';
        } else if(userSectorRanking <= sectorLimit + 8){
          userStatus = '🟡 No Radar (Pré-lista de Espera)';
          userStatusColor = '#facc15';
        } else {
          userStatus = '🔴 Fora da Convocação (Ganhe mais rodagem no clube)';
          userStatusColor = '#f87171';
        }
      }
    }

    return {
      country: meta.name,
      meta,
      fullSquad23,
      bySector: {
        GK: calledGKs,
        DEF: calledDefs,
        MID: calledMids,
        ATT: calledAtts
      },
      rankings: {
        GK: gks,
        DEF: defs,
        MID: mids,
        ATT: atts
      },
      isUserCalledUp,
      userAthlete,
      userSectorRanking,
      userStatus,
      userStatusColor,
      dateGenerated: gameState?.date || '2026-03-24'
    };
  }

  // =========================================================================
  // 3. GERENCIADOR DE DATA FIFA & EVENTO NO CALENDÁRIO
  // =========================================================================

  /**
   * Verifica se a data atual coincide com o início de uma Data FIFA
   */
  function checkFifaDateAdvance(gameState, currentDateIso, { announce = true } = {}){
    if(!gameState || (gameState.gameMode !== 'player' && !gameState.playerCareerState)) return null;
    const pCareer = gameState.playerCareerState || {};
    const userCountry = normalizeNationality(pCareer.nationality || 'Brasil');

    // Se já estiver na Data FIFA ativa, não redispara
    if(pCareer.isFifaWindowActive && pCareer.activeFifaWindowId){
      return null;
    }

    const dateStr = String(currentDateIso || gameState.date || gameState.currentDate || '2026-03-24');
    const mmDd = dateStr.length >= 10 ? dateStr.slice(5, 10) : '03-24';
    const windowDef = FIFA_WINDOWS_SCHEDULE.find(w => w.startMmDd === mmDd);
    if(!windowDef) return null;

    // Registra que a janela foi ativada
    pCareer.isFifaWindowActive = true;
    pCareer.activeFifaWindowId = windowDef.id;
    pCareer.activeFifaWindowDef = windowDef;

    // Gera convocação da seleção do usuário e do adversário histórico
    const userCallUp = generateNationalTeamCallUp(userCountry, gameState);
    pCareer.lastCallUpData = userCallUp;
    pCareer.nationalTeamHistory = Array.isArray(pCareer.nationalTeamHistory) ? pCareer.nationalTeamHistory : [];

    // Escolhe adversário do rival pool
    const rivals = userCallUp.meta.rivals || ['Argentina', 'Uruguai'];
    const oppCountry = rivals[Math.floor(Math.random() * rivals.length)];
    const oppCallUp = generateNationalTeamCallUp(oppCountry, gameState);

    const userSector = getPlayerSector(pCareer.position);
    const userStarterLimit = userSector === 'GK' ? 1 : userSector === 'DEF' ? 4 : 3;
    pCareer.fifaFixture = {
      windowId: windowDef.id,
      windowName: windowDef.name,
      date: `${gameState.season || 2026}-${windowDef.matchMmDd}`,
      homeCountry: userCountry,
      awayCountry: oppCountry,
      userIsCalledUp: userCallUp.isUserCalledUp,
      userIsStarter: userCallUp.userSectorRanking <= userStarterLimit,
      stadium: userCallUp.meta.stadium,
      userCallUp,
      oppCallUp,
      played: false
    };

    // Notícias oficiais da convocação
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    if(userCallUp.isUserCalledUp){
      pCareer.onInternationalDuty = true;
      pCareer.marketValue = Math.round((pCareer.marketValue || 1000000) * 1.25); // +25% valorização imediata
      gameState.news.unshift(`${userCallUp.meta.flag} CONVOCAÇÃO OFICIAL: O técnico ${userCallUp.meta.coach} divulgou a lista dos 23 da ${userCountry} e convocou o jovem craque ${pCareer.athleteName}! O atleta se apresenta na concentração.`);
    } else {
      pCareer.onInternationalDuty = false;
      gameState.news.unshift(`📋 CONVOCAÇÃO DA ${userCountry.toUpperCase()}: ${userCallUp.meta.coach} chamou os 23 atletas para a ${windowDef.name}. ${pCareer.athleteName} segue no radar para os próximos compromissos.`);
    }

    // Dispara o modal visual de convocação oficial
    if(announce && typeof window.AFM_PlayerMode?.openCallUpAnnouncementModal === 'function'){
      window.AFM_PlayerMode.openCallUpAnnouncementModal(pCareer.fifaFixture, gameState);
    }

    return {
      pauseAdvance: true,
      windowDef,
      fixture: pCareer.fifaFixture
    };
  }

  function processCalendarDay(gameState, date){
    if(!gameState || (gameState.gameMode !== 'player' && !gameState.playerCareerState)) return null;
    const pCareer = gameState.playerCareerState || {};
    checkFifaDateAdvance(gameState, date, { announce: false });
    const fix = pCareer.fifaFixture;
    if(!fix || fix.played || String(date) < String(fix.date) || (String(date) === String(fix.date) && fix.userIsCalledUp)) return null;

    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    fix.played = true;
    fix.result = [homeGoals, awayGoals];
    pCareer.nationalTeamHistory = Array.isArray(pCareer.nationalTeamHistory) ? pCareer.nationalTeamHistory : [];
    pCareer.nationalTeamHistory.unshift({
      date: fix.date,
      competition: fix.windowName,
      home: fix.homeCountry,
      away: fix.awayCountry,
      homeGoals,
      awayGoals,
      userCalledUp: Boolean(fix.userIsCalledUp),
      userPlayed: false
    });
    pCareer.nationalTeamHistory = pCareer.nationalTeamHistory.slice(0, 30);
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`🇺🇳 ${fix.windowName}: ${fix.homeCountry} ${homeGoals} x ${awayGoals} ${fix.awayCountry}. ${fix.userIsCalledUp ? `${pCareer.athleteName} não entrou em campo.` : `${pCareer.athleteName} acompanhou a partida, pois não foi convocado.`}`);
    gameState.news = gameState.news.slice(0, 50);
    pCareer.isFifaWindowActive = false;
    pCareer.onInternationalDuty = false;
    return fix;
  }

  /**
   * Inicia a Partida Internacional da Data FIFA
   */
  function startNationalTeamMatch(gameState){
    if(!gameState || !gameState.playerCareerState?.fifaFixture) return;
    const fix = gameState.playerCareerState.fifaFixture;
    if(fix.played) return;

    const userCountry = fix.homeCountry;
    const oppCountry = fix.awayCountry;

    // Configura sessão de partida internacional temporária
    window.internationalMatchSession = {
      isInternational: true,
      home: userCountry,
      away: oppCountry,
      homeBadge: fix.userCallUp.meta.flag,
      awayBadge: fix.oppCallUp.meta.flag,
      date: fix.date,
      competitionName: fix.windowName,
      status: 'pending',
      userIsCalledUp: fix.userIsCalledUp,
      userIsStarter: fix.userIsStarter,
      fixture: fix
    };

    // Dispara a partida no motor de jogo oficial
    if(typeof window.startMatch === 'function'){
      window.startMatch();
    }
  }

  function simulateNationalTeamMatch(gameState){
    const fix = gameState?.playerCareerState?.fifaFixture;
    if(!fix || fix.played || String(gameState.date || '') < String(fix.date || '')) return;
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    const userParticipated = Boolean(fix.userIsCalledUp && (fix.userIsStarter || Math.random() < 0.35));
    const goals = userParticipated && homeGoals > 0 && Math.random() < 0.22 ? 1 : 0;
    const assists = userParticipated && homeGoals > goals && Math.random() < 0.2 ? 1 : 0;
    finishNationalTeamMatch({
      hg: homeGoals, ag: awayGoals, userParticipated,
      controlledAthleteGoals: goals, controlledAthleteAssists: assists,
      controlledAthleteRating: userParticipated ? Number((6 + Math.random() * 4).toFixed(1)) : 0
    }, gameState);
  }

  /**
   * Finaliza a Partida da Data FIFA e aplica recompensas / estatísticas
   */
  function finishNationalTeamMatch(userRes, gameState){
    if(userRes && typeof userRes === 'object' && userRes.playerCareerState){
      const tmp = userRes;
      userRes = gameState;
      gameState = tmp;
    }
    if(!gameState || !gameState.playerCareerState) return;
    const pCareer = gameState.playerCareerState;
    const fix = pCareer.fifaFixture || { userIsCalledUp: true, homeCountry: pCareer.nationality || 'Brasil', awayCountry: 'Adversário', date: gameState.date };
    if(fix.played) return;
    fix.played = true;
    const homeGoals = Number(userRes?.hg) || 0;
    const awayGoals = Number(userRes?.ag) || 0;
    pCareer.nationalTeamHistory = Array.isArray(pCareer.nationalTeamHistory) ? pCareer.nationalTeamHistory : [];
    const userParticipated = Boolean(fix.userIsCalledUp && userRes?.userParticipated !== false);
    pCareer.nationalTeamHistory.unshift({ date: fix.date, competition: fix.windowName, home: fix.homeCountry, away: fix.awayCountry, homeGoals, awayGoals, userCalledUp: Boolean(fix.userIsCalledUp), userPlayed: userParticipated });
    pCareer.nationalTeamHistory = pCareer.nationalTeamHistory.slice(0, 30);
    pCareer.internationalStats = pCareer.internationalStats || { caps: 0, goals: 0, assists: 0, titles: [], history: [] };
    const intStats = pCareer.internationalStats;

    if(userParticipated){
      intStats.caps = (intStats.caps || 0) + 1;
      const goalsInMatch = Number(userRes?.controlledAthleteGoals ?? userRes?.userGoals ?? userRes?.athleteStats?.goals ?? 0);
      const assistsInMatch = Number(userRes?.controlledAthleteAssists ?? userRes?.userAssists ?? userRes?.athleteStats?.assists ?? 0);
      intStats.goals = (intStats.goals || 0) + goalsInMatch;
      intStats.assists = (intStats.assists || 0) + assistsInMatch;

      // Bônus dobrado de XP por atuação pela Seleção (+250 XP base)
      const xpGain = 250 + (goalsInMatch * 100) + (assistsInMatch * 50);
      pCareer.xp = (pCareer.xp || 0) + xpGain;
      pCareer.personality = pCareer.personality || { maverick: 40, heartbeat: 40, virtuoso: 40 };
      pCareer.personality.virtuoso = (pCareer.personality.virtuoso || 40) + 20;
      if(goalsInMatch > 0) pCareer.personality.maverick = (pCareer.personality.maverick || 40) + 25;

      // Valorização de mercado internacional (+25% de valorização)
      pCareer.marketValue = Math.round((pCareer.marketValue || 50000) * 1.25);

      intStats.history.unshift({
        date: fix.date,
        match: `${fix.homeCountry} vs ${fix.awayCountry}`,
        result: `${userRes.hg} - ${userRes.ag}`,
        goals: goalsInMatch,
        assists: assistsInMatch,
        rating: userRes.controlledAthleteRating || 7.5
      });

    }
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(userParticipated
      ? `🌟 DATA FIFA: ${pCareer.athleteName} atuou pela ${fix.homeCountry} contra ${fix.awayCountry} (${homeGoals} x ${awayGoals}).`
      : `🇺🇳 DATA FIFA: ${fix.homeCountry} ${homeGoals} x ${awayGoals} ${fix.awayCountry}. ${fix.userIsCalledUp ? `${pCareer.athleteName} não entrou em campo.` : `${pCareer.athleteName} acompanhou a partida, pois não foi convocado.`}`);
    gameState.news = gameState.news.slice(0, 50);

    // Limpa a flag de Data FIFA e retorna para o clube
    pCareer.onInternationalDuty = false;
    pCareer.isFifaWindowActive = false;
    window.internationalMatchSession = null;

    if(typeof window.save === 'function') window.save();
    if(typeof window.render === 'function') window.render();
  }

  /**
   * Verifica se o nome passado corresponde a uma Seleção Nacional
   */
  function isNationalTeam(name){
    if(!name) return false;
    const clean = normalizeNationality(name);
    return Boolean(NATIONAL_TEAMS_CATALOG[clean]);
  }

  /**
   * Constrói o time da Seleção Nacional para a simulação ao vivo (11 titulares em 4-3-3)
   */
  function buildInternationalMatchTeam(countryName, isHomeSide, gameState, projFn){
    const normCountry = normalizeNationality(countryName);
    const meta = getNationalTeamMeta(normCountry);
    const callUp = generateNationalTeamCallUp(normCountry, gameState);
    const isUserTeam = Boolean(gameState?.playerCareerState && normalizeNationality(gameState.playerCareerState.nationality || 'Brasil') === normCountry);
    
    // 11 titulares na formação clássica 4-3-3: 1 GOL, 4 DEF, 3 MEI, 3 ATA
    const starters = [
      callUp.bySector.GK[0] || { name: 'Goleiro', pos: 'GK', ovr: 78 },
      callUp.bySector.DEF[0] || { name: 'Lat. Direito', pos: 'RB', ovr: 77 },
      callUp.bySector.DEF[1] || { name: 'Zagueiro 1', pos: 'CB', ovr: 79 },
      callUp.bySector.DEF[2] || { name: 'Zagueiro 2', pos: 'CB', ovr: 79 },
      callUp.bySector.DEF[3] || { name: 'Lat. Esquerdo', pos: 'LB', ovr: 77 },
      callUp.bySector.MID[0] || { name: 'Volante', pos: 'DM', ovr: 80 },
      callUp.bySector.MID[1] || { name: 'Meia Central', pos: 'CM', ovr: 81 },
      callUp.bySector.MID[2] || { name: 'Armador', pos: 'AM', ovr: 82 },
      callUp.bySector.ATT[0] || { name: 'Ponta Direita', pos: 'RW', ovr: 83 },
      callUp.bySector.ATT[1] || { name: 'Centroavante', pos: 'ST', ovr: 84 },
      callUp.bySector.ATT[2] || { name: 'Ponta Esquerda', pos: 'LW', ovr: 83 }
    ];

    // Se o atleta do usuário foi convocado e é titular no setor, escala entre os 11
    if(isUserTeam && callUp.isUserCalledUp){
      const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId || p.isControlled);
      if(athlete){
        const userSec = getPlayerSector(athlete.pos);
        const isStarter = callUp.userSectorRanking <= (userSec === 'GK' ? 1 : (userSec === 'DEF' ? 4 : 3));
        if(isStarter){
          let replaceIdx = 10;
          if(userSec === 'GK') replaceIdx = 0;
          else if(userSec === 'DEF') replaceIdx = 2;
          else if(userSec === 'MID') replaceIdx = 7;
          starters[replaceIdx] = {
            ...athlete,
            isUser: true,
            isControlledAthlete: true,
            sector: userSec
          };
        }
      }
    }

    const formKey = '4-3-3';
    const formDef = (typeof window.FORMATIONS !== 'undefined' && window.FORMATIONS[formKey]) || [
      { r: 'GK', x: 50, y: 89 },
      { r: 'RB', x: 88, y: 72 },
      { r: 'CB', x: 62, y: 75 },
      { r: 'CB', x: 38, y: 75 },
      { r: 'LB', x: 12, y: 72 },
      { r: 'DM', x: 50, y: 55 },
      { r: 'CM', x: 72, y: 46 },
      { r: 'AM', x: 28, y: 46 },
      { r: 'RW', x: 85, y: 22 },
      { r: 'ST', x: 50, y: 16 },
      { r: 'LW', x: 15, y: 22 }
    ];

    const players = [];
    for(let i = 0; i < 11; i++){
      const isGoalkeeper = (i === 0);
      const p = starters[i] || { name: `Atleta ${i+1}`, pos: formDef[i]?.r || 'CM', ovr: 75 };
      const slot = formDef[i] || { r: isGoalkeeper ? 'GK' : (p.pos || 'CM'), x: 50, y: isGoalkeeper ? 89 : 50 };
      const ovr = Number(p.ovr || p.overall) || 75;

      let baseXPct, baseYPct;
      if(isGoalkeeper){
        baseXPct = isHomeSide ? 3.5 : 96.5;
        baseYPct = 50;
      } else {
        const depth = (100 - slot.y) * 0.44;
        baseXPct = isHomeSide ? Math.max(10, Math.min(52, 3.5 + depth)) : Math.max(48, Math.min(90, 100 - (3.5 + depth)));
        const centeredY = slot.x - 50;
        baseYPct = Math.max(8, Math.min(92, 50 + centeredY));
      }

      const isControlled = Boolean(isUserTeam && (p.isUser || p.isControlledAthlete || (gameState && p.id === gameState.controlledPlayerId)));

      let shirtNum = parseInt(p.shirtNumber || p.jerseyNumber || p.number, 10);
      if(isNaN(shirtNum) || shirtNum < 1 || shirtNum > 99){
        shirtNum = isGoalkeeper ? 1 : (i === 10 ? 11 : i + 1);
      }

      players.push({
        type: 'PLAYER',
        id: `nat-${isHomeSide ? 'h' : 'a'}-${i}`,
        key: `nat:${normCountry}:${i}:${p.name}`,
        name: p.name.split(' ').pop() || p.name,
        fullName: p.name,
        isControlledAthlete: isControlled,
        pos: isGoalkeeper ? 'GK' : (slot.r || p.pos || 'CM'),
        shirtNumber: shirtNum,
        jerseyNumber: shirtNum,
        roleId: isGoalkeeper ? 'gk_sweeper' : 'std',
        roleName: isGoalkeeper ? 'Goleiro Líbero' : 'Titular da Seleção',
        roleFocus: 'Balanced',
        overall: ovr,
        stamina: 100,
        isGK: isGoalkeeper,
        canScore: !isGoalkeeper,
        canShoot: !isGoalkeeper,
        canAssist: true,
        isCaptain: (i === 1 || i === 2),
        team: isHomeSide ? 'home' : 'away',
        clubId: normCountry,
        teamId: isHomeSide ? 'home' : 'away',
        isUser: isUserTeam,
        photo: p.photo || null,
        x: baseXPct,
        y: baseYPct,
        baseX: baseXPct,
        baseY: baseYPct,
        targetX: baseXPct,
        targetY: baseYPct,
        vx: 0, vy: 0,
        animFrame: 0,
        hasBall: false
      });
    }

    return players;
  }

  // =========================================================================
  // 4. EXPORTAÇÃO GLOBAL
  // =========================================================================
  window.AFM_NationalTeams = {
    CATALOG: NATIONAL_TEAMS_CATALOG,
    normalizeNationality,
    getNationalTeamMeta,
    getCountryFlag: (countryName) => (getNationalTeamMeta(countryName)?.flag || '🇧🇷'),
    getPlayerSector,
    calculateCallUpScore,
    getPlayerPoolByNationality,
    generateNationalTeamCallUp,
    checkFifaDateAdvance,
    processCalendarDay,
    startNationalTeamMatch,
    simulateNationalTeamMatch,
    finishNationalTeamMatch,
    isNationalTeam,
    buildInternationalMatchTeam,
    getCountryBadge: (countryName, size = 32) => {
      const meta = NATIONAL_TEAMS_CATALOG[normalizeNationality(countryName)];
      if(!meta) return null;
      return `<span class="crest nat-flag-crest" style="font-size:${Math.round(size * 0.85)}px;line-height:1;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle" title="${esc(meta.name)}">${meta.flag}</span>`;
    }
  };

})(window);
