(function() {
  if (window.__AFM_RANKING_LICENSES_V3) return;
  window.__AFM_RANKING_LICENSES_V3 = true;

  const LICENSES = [
    { id: 'cbf_d', name: 'Licença CBF D (Iniciante)', cost: 0, minPrestige: 0, bonus: '+2% Evolução da Base' },
    { id: 'cbf_c', name: 'Licença CBF C (Estadual)', cost: 15000, minPrestige: 5, bonus: '+4% Treino Tático' },
    { id: 'cbf_b', name: 'Licença CBF B (Nacional Série B/C)', cost: 45000, minPrestige: 12, bonus: '+7% Moral & Tática' },
    { id: 'cbf_a', name: 'Licença CBF A (Elite Série A)', cost: 120000, minPrestige: 25, bonus: '+10% Atração no Mercado' },
    { id: 'cbf_pro', name: 'Licença CONMEBOL / CBF PRO', cost: 280000, minPrestige: 45, bonus: '+15% Prestígio Continental' },
    { id: 'uefa_pro', name: 'Licença UEFA PRO (Mundial)', cost: 650000, minPrestige: 70, bonus: 'Acesso Irrestrito a Gigantes Europeus' }
  ];

  // Mapeamento amplo de Técnicos Reais (Brasil Séries A/B/C/D + Mundo)
  const REAL_COACHES_DB = [
    // Brasil - Série A & Elite Nacional
    { coach: 'Abel Ferreira', club: 'Palmeiras', country: 'Brasil', division: 'Brasileirão Série A', prestige: 68, titles: 3, w: 22, d: 5, l: 3, scope: 'BR' },
    { coach: 'Filipe Luís', club: 'Flamengo', country: 'Brasil', division: 'Brasileirão Série A', prestige: 58, titles: 2, w: 20, d: 6, l: 4, scope: 'BR' },
    { coach: 'Artur Jorge', club: 'Botafogo', country: 'Brasil', division: 'Brasileirão Série A', prestige: 60, titles: 2, w: 21, d: 5, l: 4, scope: 'BR' },
    { coach: 'Ramón Díaz', club: 'Corinthians', country: 'Brasil', division: 'Brasileirão Série A', prestige: 52, titles: 1, w: 17, d: 7, l: 6, scope: 'BR' },
    { coach: 'Juan Pablo Vojvoda', club: 'Fortaleza', country: 'Brasil', division: 'Brasileirão Série A', prestige: 50, titles: 1, w: 18, d: 7, l: 5, scope: 'BR' },
    { coach: 'Roger Machado', club: 'Internacional', country: 'Brasil', division: 'Brasileirão Série A', prestige: 49, titles: 1, w: 17, d: 8, l: 5, scope: 'BR' },
    { coach: 'Rogério Ceni', club: 'Bahia', country: 'Brasil', division: 'Brasileirão Série A', prestige: 47, titles: 1, w: 16, d: 7, l: 7, scope: 'BR' },
    { coach: 'Luis Zubeldía', club: 'São Paulo', country: 'Brasil', division: 'Brasileirão Série A', prestige: 46, titles: 1, w: 16, d: 8, l: 6, scope: 'BR' },
    { coach: 'Gabriel Milito', club: 'Atlético-MG', country: 'Brasil', division: 'Brasileirão Série A', prestige: 45, titles: 1, w: 15, d: 8, l: 7, scope: 'BR' },
    { coach: 'Fernando Diniz', club: 'Cruzeiro', country: 'Brasil', division: 'Brasileirão Série A', prestige: 44, titles: 1, w: 14, d: 8, l: 8, scope: 'BR' },
    { coach: 'Gustavo Quinteros', club: 'Grêmio', country: 'Brasil', division: 'Brasileirão Série A', prestige: 44, titles: 1, w: 15, d: 6, l: 9, scope: 'BR' },
    { coach: 'Mano Menezes', club: 'Fluminense', country: 'Brasil', division: 'Brasileirão Série A', prestige: 43, titles: 1, w: 14, d: 7, l: 9, scope: 'BR' },
    { coach: 'Fábio Carille', club: 'Vasco da Gama', country: 'Brasil', division: 'Brasileirão Série A', prestige: 42, titles: 1, w: 14, d: 8, l: 8, scope: 'BR' },
    { coach: 'Pedro Caixinha', club: 'Santos', country: 'Brasil', division: 'Brasileirão Série A', prestige: 43, titles: 1, w: 15, d: 7, l: 8, scope: 'BR' },
    { coach: 'Thiago Carpini', club: 'Vitória', country: 'Brasil', division: 'Brasileirão Série A', prestige: 39, titles: 0, w: 13, d: 7, l: 10, scope: 'BR' },
    { coach: 'Fernando Seabra', club: 'Red Bull Bragantino', country: 'Brasil', division: 'Brasileirão Série A', prestige: 38, titles: 0, w: 12, d: 9, l: 9, scope: 'BR' },
    { coach: 'Lucho González', club: 'Athletico Paranaense', country: 'Brasil', division: 'Brasileirão Série A', prestige: 37, titles: 0, w: 12, d: 8, l: 10, scope: 'BR' },
    { coach: 'Fábio Matias', club: 'Juventude', country: 'Brasil', division: 'Brasileirão Série A', prestige: 35, titles: 0, w: 11, d: 8, l: 11, scope: 'BR' },
    { coach: 'Pepa', club: 'Sport Recife', country: 'Brasil', division: 'Brasileirão Série A', prestige: 40, titles: 1, w: 15, d: 7, l: 8, scope: 'BR' },
    { coach: 'Léo Condé', club: 'Ceará', country: 'Brasil', division: 'Brasileirão Série A', prestige: 39, titles: 1, w: 14, d: 7, l: 9, scope: 'BR' },
    { coach: 'Mozart Santos', club: 'Mirassol', country: 'Brasil', division: 'Brasileirão Série A', prestige: 38, titles: 1, w: 14, d: 8, l: 8, scope: 'BR' },
    { coach: 'Eduardo Baptista', club: 'Novorizontino', country: 'Brasil', division: 'Brasileirão Série B', prestige: 36, titles: 0, w: 14, d: 7, l: 9, scope: 'BR' },
    { coach: 'Vagner Mancini', club: 'Goiás', country: 'Brasil', division: 'Brasileirão Série B', prestige: 36, titles: 0, w: 13, d: 8, l: 9, scope: 'BR' },
    { coach: 'Jair Ventura', club: 'Avaí', country: 'Brasil', division: 'Brasileirão Série B', prestige: 35, titles: 0, w: 12, d: 8, l: 10, scope: 'BR' },
    { coach: 'Jorginho', club: 'Coritiba', country: 'Brasil', division: 'Brasileirão Série B', prestige: 35, titles: 0, w: 12, d: 7, l: 11, scope: 'BR' },
    { coach: 'Lisca', club: 'América-MG', country: 'Brasil', division: 'Brasileirão Série B', prestige: 34, titles: 0, w: 12, d: 9, l: 9, scope: 'BR' },
    { coach: 'Gilmar Dal Pozzo', club: 'Chapecoense', country: 'Brasil', division: 'Brasileirão Série B', prestige: 33, titles: 0, w: 11, d: 8, l: 11, scope: 'BR' },
    { coach: 'Cláudio Tencati', club: 'Criciúma', country: 'Brasil', division: 'Brasileirão Série B', prestige: 35, titles: 1, w: 12, d: 8, l: 10, scope: 'BR' },
    { coach: 'Umberto Louzer', club: 'Atlético-GO', country: 'Brasil', division: 'Brasileirão Série B', prestige: 34, titles: 1, w: 11, d: 8, l: 11, scope: 'BR' },
    { coach: 'Hélio dos Anjos', club: 'Paysandu', country: 'Brasil', division: 'Brasileirão Série B', prestige: 33, titles: 1, w: 11, d: 9, l: 10, scope: 'BR' },
    { coach: 'Rodrigo Santana', club: 'Remo', country: 'Brasil', division: 'Brasileirão Série B', prestige: 32, titles: 0, w: 12, d: 7, l: 11, scope: 'BR' },
    { coach: 'Rafael Guanaes', club: 'Operário-PR', country: 'Brasil', division: 'Brasileirão Série B', prestige: 32, titles: 0, w: 11, d: 8, l: 11, scope: 'BR' },
    { coach: 'Márcio Fernandes', club: 'Vila Nova', country: 'Brasil', division: 'Brasileirão Série B', prestige: 32, titles: 0, w: 11, d: 7, l: 12, scope: 'BR' },
    { coach: 'Nelsinho Baptista', club: 'Ponte Preta', country: 'Brasil', division: 'Brasileirão Série C', prestige: 33, titles: 0, w: 10, d: 8, l: 12, scope: 'BR' },
    { coach: 'Allan Aal', club: 'Guarani', country: 'Brasil', division: 'Brasileirão Série C', prestige: 31, titles: 0, w: 10, d: 7, l: 13, scope: 'BR' },
    { coach: 'Bruno Pivetti', club: 'Náutico', country: 'Brasil', division: 'Brasileirão Série C', prestige: 31, titles: 0, w: 11, d: 8, l: 11, scope: 'BR' },
    { coach: 'Itamar Schülle', club: 'Santa Cruz', country: 'Brasil', division: 'Brasileirão Série D', prestige: 30, titles: 0, w: 12, d: 6, l: 8, scope: 'BR' },
    { coach: 'Marquinhos Santos', club: 'América-RN', country: 'Brasil', division: 'Brasileirão Série D', prestige: 30, titles: 0, w: 11, d: 7, l: 8, scope: 'BR' },
    { coach: 'Paulo Roberto Santos', club: 'Brasiliense', country: 'Brasil', division: 'Brasileirão Série D', prestige: 29, titles: 0, w: 12, d: 5, l: 7, scope: 'BR' },

    // Mundo - Europa, América do Sul, Arábia e MLS
    { coach: 'Pep Guardiola', club: 'Manchester City', country: 'Inglaterra', division: 'Premier League', prestige: 94, titles: 4, w: 26, d: 4, l: 2, scope: 'WORLD' },
    { coach: 'Carlo Ancelotti', club: 'Real Madrid', country: 'Espanha', division: 'LaLiga', prestige: 93, titles: 4, w: 25, d: 5, l: 2, scope: 'WORLD' },
    { coach: 'Hansi Flick', club: 'Barcelona', country: 'Espanha', division: 'LaLiga', prestige: 86, titles: 3, w: 25, d: 3, l: 4, scope: 'WORLD' },
    { coach: 'Arne Slot', club: 'Liverpool', country: 'Inglaterra', division: 'Premier League', prestige: 85, titles: 2, w: 24, d: 5, l: 3, scope: 'WORLD' },
    { coach: 'Xabi Alonso', club: 'Bayer Leverkusen', country: 'Alemanha', division: 'Bundesliga', prestige: 84, titles: 3, w: 24, d: 6, l: 2, scope: 'WORLD' },
    { coach: 'Simone Inzaghi', club: 'Inter de Milão', country: 'Itália', division: 'Serie A Tim', prestige: 83, titles: 3, w: 24, d: 5, l: 3, scope: 'WORLD' },
    { coach: 'Mikel Arteta', club: 'Arsenal', country: 'Inglaterra', division: 'Premier League', prestige: 81, titles: 2, w: 23, d: 5, l: 4, scope: 'WORLD' },
    { coach: 'Luis Enrique', club: 'PSG', country: 'França', division: 'Ligue 1', prestige: 80, titles: 3, w: 23, d: 6, l: 3, scope: 'WORLD' },
    { coach: 'Vincent Kompany', club: 'Bayern de Munique', country: 'Alemanha', division: 'Bundesliga', prestige: 78, titles: 2, w: 23, d: 4, l: 5, scope: 'WORLD' },
    { coach: 'Diego Simeone', club: 'Atlético de Madrid', country: 'Espanha', division: 'LaLiga', prestige: 77, titles: 2, w: 21, d: 6, l: 5, scope: 'WORLD' },
    { coach: 'Antonio Conte', club: 'Napoli', country: 'Itália', division: 'Serie A Tim', prestige: 76, titles: 2, w: 21, d: 5, l: 6, scope: 'WORLD' },
    { coach: 'Gian Piero Gasperini', club: 'Atalanta', country: 'Itália', division: 'Serie A Tim', prestige: 75, titles: 2, w: 20, d: 6, l: 6, scope: 'WORLD' },
    { coach: 'Jorge Jesus', club: 'Al-Hilal', country: 'Arábia Saudita', division: 'Saudi Pro League', prestige: 74, titles: 3, w: 26, d: 3, l: 1, scope: 'WORLD' },
    { coach: 'Enzo Maresca', club: 'Chelsea', country: 'Inglaterra', division: 'Premier League', prestige: 72, titles: 1, w: 20, d: 6, l: 6, scope: 'WORLD' },
    { coach: 'Ruben Amorim', club: 'Manchester United', country: 'Inglaterra', division: 'Premier League', prestige: 71, titles: 2, w: 19, d: 6, l: 7, scope: 'WORLD' },
    { coach: 'Unai Emery', club: 'Aston Villa', country: 'Inglaterra', division: 'Premier League', prestige: 70, titles: 1, w: 19, d: 5, l: 8, scope: 'WORLD' },
    { coach: 'Thiago Motta', club: 'Juventus', country: 'Itália', division: 'Serie A Tim', prestige: 69, titles: 1, w: 18, d: 9, l: 5, scope: 'WORLD' },
    { coach: 'Sérgio Conceição', club: 'Milan', country: 'Itália', division: 'Serie A Tim', prestige: 69, titles: 2, w: 18, d: 7, l: 7, scope: 'WORLD' },
    { coach: 'Niko Kovač', club: 'Borussia Dortmund', country: 'Alemanha', division: 'Bundesliga', prestige: 67, titles: 1, w: 18, d: 6, l: 8, scope: 'WORLD' },
    { coach: 'Marco Rose', club: 'RB Leipzig', country: 'Alemanha', division: 'Bundesliga', prestige: 66, titles: 1, w: 17, d: 7, l: 8, scope: 'WORLD' },
    { coach: 'Roberto De Zerbi', club: 'Olympique de Marseille', country: 'França', division: 'Ligue 1', prestige: 65, titles: 1, w: 18, d: 6, l: 8, scope: 'WORLD' },
    { coach: 'Bruno Lage', club: 'Benfica', country: 'Portugal', division: 'Liga Portugal', prestige: 64, titles: 2, w: 21, d: 4, l: 5, scope: 'WORLD' },
    { coach: 'Rui Borges', club: 'Sporting CP', country: 'Portugal', division: 'Liga Portugal', prestige: 64, titles: 2, w: 22, d: 4, l: 4, scope: 'WORLD' },
    { coach: 'Martín Anselmi', club: 'FC Porto', country: 'Portugal', division: 'Liga Portugal', prestige: 63, titles: 1, w: 20, d: 5, l: 5, scope: 'WORLD' },
    { coach: 'Marcelo Gallardo', club: 'River Plate', country: 'Argentina', division: 'Liga Profesional ARG', prestige: 67, titles: 2, w: 19, d: 7, l: 4, scope: 'WORLD' },
    { coach: 'Fernando Gago', club: 'Boca Juniors', country: 'Argentina', division: 'Liga Profesional ARG', prestige: 59, titles: 1, w: 17, d: 7, l: 6, scope: 'WORLD' },
    { coach: 'Gustavo Costas', club: 'Racing Club', country: 'Argentina', division: 'Liga Profesional ARG', prestige: 61, titles: 2, w: 18, d: 6, l: 6, scope: 'WORLD' },
    { coach: 'Diego Aguirre', club: 'Peñarol', country: 'Uruguai', division: 'Campeonato Uruguaio', prestige: 58, titles: 2, w: 20, d: 5, l: 5, scope: 'WORLD' },
    { coach: 'Stefano Pioli', club: 'Al-Nassr', country: 'Arábia Saudita', division: 'Saudi Pro League', prestige: 63, titles: 1, w: 20, d: 5, l: 5, scope: 'WORLD' },
    { coach: 'Laurent Blanc', club: 'Al-Ittihad', country: 'Arábia Saudita', division: 'Saudi Pro League', prestige: 62, titles: 1, w: 21, d: 4, l: 5, scope: 'WORLD' },
    { coach: 'Javier Mascherano', club: 'Inter Miami', country: 'EUA', division: 'MLS', prestige: 56, titles: 1, w: 19, d: 6, l: 5, scope: 'WORLD' }
  ];

  const EXTRA_BR_COACH_POOL = [
    'Guto Ferreira', 'Enderson Moreira', 'Claudinei Oliveira', 'Pintado', 'Mazola Júnior',
    'Dado Cavalcanti', 'Marcelo Cabo', 'Roberto Fonseca', 'Luizinho Lopes', 'Vinícius Eutrópio',
    'Geninho', 'Adilson Batista', 'Cuca', 'Dorival Júnior', 'Tite', 'Odair Hellmann',
    'António Oliveira', 'Zé Ricardo', 'Barroca', 'Chamusca', 'Maurício Barbieri', 'Paulo Turra'
  ];

  const EXTRA_WORLD_COACH_POOL = [
    'Ernesto Valverde', 'Ange Postecoglou', 'Eddie Howe', 'Marco Silva', 'Andoni Iraola',
    'Thomas Frank', 'Oliver Glasner', 'Fabian Hürzeler', 'Nuno Espírito Santo', 'Claudio Ranieri',
    'Vincenzo Italiano', 'Maurizio Sarri', 'Luciano Spalletti', 'Massimiliano Allegri', 'Adi Hütter',
    'Dino Toppmöller', 'Sebastian Hoeneß', 'Imanol Alguacil', 'Manuel Pellegrini', 'Michel Sánchez',
    'Francesco Farioli', 'Peter Bosz', 'Brendan Rodgers', 'Jorge Sampaoli', 'Eduardo Coudet'
  ];

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function hashStr(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
  }

  function getUserData() {
    var st = window.state || window.gameState || {};
    var managerName = (st.manager && st.manager.name) || st.managerName || st.coachName || 'Aquino';
    var clubName = (st.club && st.club.name) || (typeof st.club === 'string' ? st.club : '') || (st.userTeam && st.userTeam.name) || 'Corinthians';
    var w = Number(st.wins || (st.career && st.career.wins) || 0);
    var d = Number(st.draws || (st.career && st.career.draws) || 1);
    var l = Number(st.losses || (st.career && st.career.losses) || 0);
    var titles = Array.isArray(st.trophies) ? st.trophies.length : Number(st.titles || 0);
    var pts = 50 + (titles * 160) + (w * 14) + (d * 4) - (l * 6);
    if (pts < 10) pts = 70;
    var level = Math.min(99, Math.max(1, Math.floor(pts / 12)));
    var licId = localStorage.getItem('afm_user_license_id') || 'cbf_d';
    var licObj = LICENSES.find(function(x) { return x.id === licId; }) || LICENSES[0];
    return { managerName: managerName, clubName: clubName, w: w, d: d, l: l, titles: titles, pts: pts, level: level, license: licObj };
  }

  // Coleta TODOS os clubes do jogo + técnicos reais para não faltar nenhum time!
  function buildCompleteCoachesAndTeamsList() {
    var user = getUserData();
    var userClubKey = norm(user.clubName);
    var byClubKey = new Map();

    // 1. Carrega os técnicos reais mapeados
    REAL_COACHES_DB.forEach(function(item) {
      var cKey = norm(item.club);
      var score = (item.prestige * 6) + (item.titles * 160) + (item.w * 14) + (item.d * 4) - (item.l * 6);
      byClubKey.set(cKey, {
        coach: cKey === userClubKey ? ('Téc. ' + user.managerName + ' (VOCÊ)') : item.coach,
        club: item.club,
        country: item.country,
        division: item.division,
        prestige: cKey === userClubKey ? user.level : item.prestige,
        titles: cKey === userClubKey ? user.titles : item.titles,
        w: cKey === userClubKey ? user.w : item.w,
        d: cKey === userClubKey ? user.d : item.d,
        l: cKey === userClubKey ? user.l : item.l,
        pts: cKey === userClubKey ? user.pts : score,
        scope: item.scope,
        isUser: cKey === userClubKey
      });
    });

    // 2. Vasculha todas as fontes de times do jogo (COMPETITION_TEAMS, INTERNATIONAL_TEAMS_2026_27, CONTINENTAL_2026, state.teams)
    function addClubFromGameSource(teamObj, defaultDivision, defaultScope) {
      if (!teamObj) return;
      var clubName = typeof teamObj === 'string' ? teamObj : (teamObj.name || teamObj.club || teamObj.teamName || teamObj.shortName);
      if (!clubName || clubName.length < 2) return;
      var cKey = norm(clubName);
      if (byClubKey.has(cKey)) return;

      var h = hashStr(cKey);
      var isBr = defaultScope === 'BR' || (teamObj.country && norm(teamObj.country) === 'brasil') || /serie [abcd]|brasileir|copa do brasil|paulista|carioca/i.test(defaultDivision || '');
      var scope = isBr ? 'BR' : 'WORLD';
      var coachName = (typeof teamObj === 'object' && (teamObj.coach || teamObj.manager || teamObj.treinador)) || '';
      if (!coachName) {
        var pool = isBr ? EXTRA_BR_COACH_POOL : EXTRA_WORLD_COACH_POOL;
        coachName = pool[h % pool.length] + ' (' + clubName.slice(0, 3).toUpperCase() + ')';
      }

      var ovr = (typeof teamObj === 'object' && Number(teamObj.ovr || teamObj.overall || teamObj.rating)) || (isBr ? 72 : 76);
      var prestige = Math.min(88, Math.max(18, Math.round(ovr - 30 + (h % 12))));
      var titles = h % 5 === 0 ? 1 : 0;
      var w = 8 + (h % 14);
      var d = 4 + (h % 7);
      var l = Math.max(2, 26 - w - d);
      var pts = (prestige * 5) + (titles * 160) + (w * 14) + (d * 4) - (l * 6);

      byClubKey.set(cKey, {
        coach: cKey === userClubKey ? ('Téc. ' + user.managerName + ' (VOCÊ)') : coachName,
        club: clubName,
        country: (typeof teamObj === 'object' && teamObj.country) || (isBr ? 'Brasil' : 'Internacional'),
        division: (typeof teamObj === 'object' && (teamObj.league || teamObj.division)) || defaultDivision || (isBr ? 'Liga Nacional BR' : 'Liga Internacional'),
        prestige: cKey === userClubKey ? user.level : prestige,
        titles: cKey === userClubKey ? user.titles : titles,
        w: cKey === userClubKey ? user.w : w,
        d: cKey === userClubKey ? user.d : d,
        l: cKey === userClubKey ? user.l : l,
        pts: cKey === userClubKey ? user.pts : pts,
        scope: scope,
        isUser: cKey === userClubKey
      });
    }

    // Varre objetos globais de times do jogo
    var sources = [
      { data: window.COMPETITION_TEAMS, scope: 'BR' },
      { data: window.INTERNATIONAL_TEAMS_2026_27, scope: 'WORLD' },
      { data: window.CONTINENTAL_2026, scope: 'WORLD' },
      { data: window.CLUBS || window.TEAMS, scope: 'BR' }
    ];

    sources.forEach(function(src) {
      if (!src.data || typeof src.data !== 'object') return;
      if (Array.isArray(src.data)) {
        src.data.forEach(function(t) { addClubFromGameSource(t, 'Liga Oficial', src.scope); });
      } else {
        Object.keys(src.data).forEach(function(compKey) {
          var list = src.data[compKey];
          if (Array.isArray(list)) {
            list.forEach(function(t) { addClubFromGameSource(t, compKey.toUpperCase(), src.scope); });
          } else if (list && typeof list === 'object') {
            Object.values(list).forEach(function(sub) {
              if (Array.isArray(sub)) sub.forEach(function(t) { addClubFromGameSource(t, compKey.toUpperCase(), src.scope); });
            });
          }
        });
      }
    });

    // Garante que o usuário sempre esteja presente
    if (!Array.from(byClubKey.values()).some(function(x) { return x.isUser; })) {
      byClubKey.set(userClubKey, {
        coach: 'Téc. ' + user.managerName + ' (VOCÊ)',
        club: user.clubName,
        country: 'Brasil',
        division: 'Brasileirão Série A',
        prestige: user.level,
        titles: user.titles,
        w: user.w,
        d: user.d,
        l: user.l,
        pts: user.pts,
        scope: 'BR',
        isUser: true
      });
    }

    return Array.from(byClubKey.values()).sort(function(a, b) { return b.pts - a.pts; });
  }

  // =========================================================================
  // INJEÇÃO NO TOPO DO CARD "CONTA PESSOAL DO TÉCNICO" (Lado a lado com Patrimônio)
  // =========================================================================
  function injectTopPrestigeAndButtons() {
    var app = document.getElementById('app');
    if (!app) return;

    // Remove o painel antigo que ficava lá embaixo depois do Modo X1
    var oldBottom = document.getElementById('afm-career-ranking-injected');
    if (oldBottom) oldBottom.remove();

    // Procura o badge "CONTA PESSOAL DO TÉCNICO" ou "PATRIMÔNIO PESSOAL LÍQUIDO"
    var allEls = app.querySelectorAll('span, div, h3, h4, p');
    var accountBadge = null;
    for (var i = 0; i < allEls.length; i++) {
      var el = allEls[i];
      if (el.children.length === 0 && (el.textContent || '').trim().toUpperCase() === 'CONTA PESSOAL DO TÉCNICO') {
        accountBadge = el;
        break;
      }
    }

    if (!accountBadge) return;

    // Sempre mira com precisão no banner do perfil do treinador
    var banner = document.getElementById('afm-manager-profile-banner');
    if (!banner) {
      // Procura subindo a partir do badge, mas para estritamente no banner do treinador
      var cur = accountBadge.parentElement;
      while (cur && cur.id !== 'app') {
        if (cur.id === 'afm-manager-profile-banner' || cur.classList.contains('card')) {
          banner = cur;
          break;
        }
        if (cur.classList.contains('life-shares-container') || cur.id === 'afm-career-economy-container') {
          break; // NUNCA ultrapassa ou modifica o container pai geral
        }
        cur = cur.parentElement;
      }
    }

    if (!banner || banner.classList.contains('life-shares-container') || banner.id === 'afm-career-economy-container' || banner.id === 'app') {
      return;
    }

    var existingTopSlot = document.getElementById('afm-top-prestige-center-panel');
    if (existingTopSlot) {
      var bRk = document.getElementById('btn-open-save-coaches-rk');
      if (bRk) bRk.onclick = function(e) { e.stopPropagation(); openCoachesRankingModal('ALL_TEAMS'); };
      var bLic = document.getElementById('btn-open-cbf-licenses');
      if (bLic) bLic.onclick = function(e) { e.stopPropagation(); openLicensesModal(); };
      return;
    }

    if (!existingTopSlot) {
      existingTopSlot = document.createElement('div');
      existingTopSlot.id = 'afm-top-prestige-center-panel';
      existingTopSlot.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;';

      if (banner.children.length >= 2) {
        banner.insertBefore(existingTopSlot, banner.children[1]);
      } else {
        banner.appendChild(existingTopSlot);
      }
    }

    existingTopSlot.innerHTML =
      '<div style="background:rgba(15,23,42,0.75);border:1px solid rgba(168,85,247,0.55);border-radius:12px;padding:8px 14px;text-align:left;">' +
        '<div style="font-size:9px;font-weight:800;color:#cbd5e1;letter-spacing:0.6px;text-transform:uppercase;">NÍVEL DE PRESTÍGIO NO SAVE · ' + user.license.name.toUpperCase() + '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#facc15;margin-top:2px;">⭐ Nível ' + user.level + '/99 (' + user.pts + ' pts · ' + user.titles + ' Títulos)</div>' +
      '</div>' +
      '<button id="btn-open-save-coaches-rk" type="button" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:10px 14px;font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(124,58,237,0.45);white-space:nowrap;">' +
        '🏆 VER RANKING & TODOS OS TÉCNICOS' +
      '</button>' +
      '<button id="btn-open-cbf-licenses" type="button" style="background:rgba(15,23,42,0.85);color:#38bdf8;border:1px solid rgba(56,189,248,0.45);border-radius:10px;padding:10px 14px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;">' +
        '🎓 CURSOS & LICENÇAS (CBF & UEFA)' +
      '</button>';

    document.getElementById('btn-open-save-coaches-rk').onclick = function(e) {
      e.stopPropagation();
      openCoachesRankingModal('ALL_TEAMS');
    };
    document.getElementById('btn-open-cbf-licenses').onclick = function(e) {
      e.stopPropagation();
      openLicensesModal();
    };
  }

  // =========================================================================
  // MODAL DE RANKING NACIONAL, MUNDIAL E TODOS OS TIMES & SEUS TÉCNICOS
  // =========================================================================
  function openCoachesRankingModal(initialTab) {
    var old = document.getElementById('afm-rk-modal');
    if (old) old.remove();

    var allCoaches = buildCompleteCoachesAndTeamsList();
    var currentMode = initialTab || 'WORLD';
    if (currentMode !== 'BR' && currentMode !== 'WORLD' && currentMode !== 'ALL_TEAMS') currentMode = 'WORLD';

    // Identificação do treinador do usuário e posições exatas no ranking
    var userCoach = allCoaches.find(function(x) { return x.isUser; }) || {
      coach: (typeof state !== 'undefined' ? (state.managerName || state.manager || 'Aquino') : 'Aquino'),
      club: (typeof state !== 'undefined' ? (state.club || 'Corinthians') : 'Corinthians'),
      prestige: (typeof state !== 'undefined' && state.managerPersonal?.prestigeScore) ? state.managerPersonal.prestigeScore : 5,
      pts: 54
    };
    var brCoaches = allCoaches.filter(function(x) { return x.scope === 'BR'; });
    var userPosBr = brCoaches.findIndex(function(x) { return x.isUser; }) + 1;
    var userPosWorld = allCoaches.findIndex(function(x) { return x.isUser; }) + 1;

    var pageSize = 10;
    var currentPage = 1;

    var modal = document.createElement('div');
    modal.id = 'afm-rk-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,5,15,0.85);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;';

    modal.innerHTML =
      '<div style="width:100%;max-width:980px;max-height:88vh;background:#0f172a;border:1px solid rgba(168,85,247,0.5);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.8);">' +
        '<div style="padding:16px 22px;background:linear-gradient(90deg,#1e1b4b,#0f172a);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">' +
          '<div>' +
            '<div style="font-size:10px;font-weight:800;color:#cbd5e1;letter-spacing:0.8px;">PONTUAÇÃO POR TÍTULOS (+160), VITÓRIAS (+14), EMPATES (+4) E DERROTAS (-6) · TOTAL: ' + allCoaches.length + ' CLUBES & TÉCNICOS</div>' +
            '<h2 style="margin:4px 0 0 0;font-size:19px;font-weight:900;color:#fff;">🏆 Ranking Vivo de Treinadores & Todos os Times do Save</h2>' +
          '</div>' +
          '<button id="close-rk" type="button" style="background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.15);padding:8px 16px;border-radius:10px;font-weight:800;cursor:pointer;">✕ Fechar</button>' +
        '</div>' +

        '<!-- BANNER FIXO NO TOPO: SUA POSIÇÃO ATUAL NO SAVE -->' +
        '<div style="padding:12px 22px;background:linear-gradient(90deg,rgba(124,58,237,0.32),rgba(15,23,42,0.95));border-bottom:1px solid rgba(168,85,247,0.35);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:22px;">📌</span>' +
            '<div>' +
              '<div style="font-size:11px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:0.8px;">SUA POSIÇÃO ATUAL NO SAVE:</div>' +
              '<div style="font-size:14px;font-weight:900;color:#fff;margin-top:2px;">' +
                '<span style="color:#facc15;">#' + (userPosBr > 0 ? userPosBr : '1') + ' no Brasil</span> · ' +
                '<span style="color:#38bdf8;">#' + (userPosWorld > 0 ? userPosWorld : '1') + ' no Mundo</span> | ' +
                '<span>Téc. ' + userCoach.coach + '</span> · <span style="color:#a78bfa;">' + userCoach.club + '</span> · ' +
                '<span style="color:#fde047;">★ Prestígio ' + userCoach.prestige + '</span> · <span style="color:#34d399;">' + userCoach.pts + ' pts</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button id="btn-rk-goto-user" type="button" style="background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;border:none;padding:7px 16px;border-radius:10px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 3px 10px rgba(124,58,237,0.35);">' +
            '🎯 Ir p/ Minha Página' +
          '</button>' +
        '</div>' +

        '<div style="padding:12px 22px;background:#0b1120;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button id="btn-rk-nac" type="button" style="padding:8px 14px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;border:1px solid rgba(255,255,255,0.12);">🇧🇷 Ranking Nacional (' + brCoaches.length + ')</button>' +
            '<button id="btn-rk-mun" type="button" style="padding:8px 14px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;border:1px solid rgba(255,255,255,0.12);">🌍 Ranking Mundial (' + allCoaches.length + ')</button>' +
            '<button id="btn-rk-all" type="button" style="padding:8px 14px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;border:1px solid rgba(255,255,255,0.12);">🏟️ Ver Todos os Times & Técnicos (' + allCoaches.length + ')</button>' +
          '</div>' +
          '<input id="afm-rk-search" type="text" placeholder="🔍 Buscar time, técnico, liga ou país..." style="background:#1e293b;color:#fff;border:1px solid rgba(148,163,184,0.3);border-radius:10px;padding:8px 14px;font-size:12px;min-width:260px;outline:none;">' +
        '</div>' +

        '<div style="overflow-y:auto;padding:0 22px 10px 22px;flex:1;">' +
          '<table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;color:#e2e8f0;">' +
            '<thead>' +
              '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;font-size:11px;text-align:left;">' +
                '<th style="padding:10px 6px;">POS</th>' +
                '<th style="padding:10px 6px;">TÉCNICO</th>' +
                '<th style="padding:10px 6px;">TIME TREINADO ATUALMENTE</th>' +
                '<th style="padding:10px 6px;">LIGA / PAÍS</th>' +
                '<th style="padding:10px 6px;">NÍVEL DE PRESTÍGIO</th>' +
                '<th style="padding:10px 6px;">TÍTULOS</th>' +
                '<th style="padding:10px 6px;">V / E / D</th>' +
                '<th style="padding:10px 6px;text-align:right;">PONTOS</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="afm-rk-tbody"></tbody>' +
          '</table>' +
        '</div>' +

        '<!-- BARRA DE PAGINAÇÃO COM SETINHAS -->' +
        '<div style="padding:10px 22px;background:#0b1120;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
          '<div id="afm-rk-page-info" style="font-size:12px;font-weight:700;color:#94a3b8;">' +
            'Carregando...' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<button id="btn-rk-prev" type="button" style="background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.15);padding:6px 14px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;transition:background 0.2s;">' +
              '◀ Anterior' +
            '</button>' +
            '<span id="afm-rk-page-current" style="background:rgba(124,58,237,0.25);border:1px solid #7c3aed;color:#c084fc;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:900;min-width:65px;text-align:center;">' +
              '1 / 1' +
            '</span>' +
            '<button id="btn-rk-next" type="button" style="background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.15);padding:6px 14px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;transition:background 0.2s;">' +
              'Próxima ▶' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    function getFilteredList() {
      var q = norm(document.getElementById('afm-rk-search').value || '');
      var filtered = allCoaches.filter(function(item) {
        if (currentMode === 'BR' && item.scope !== 'BR') return false;
        if (q) {
          var hay = norm(item.coach + ' ' + item.club + ' ' + item.division + ' ' + item.country);
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      if (currentMode === 'ALL_TEAMS') {
        filtered = filtered.slice().sort(function(a, b) {
          return a.club.localeCompare(b.club, 'pt-BR');
        });
      }
      return filtered;
    }

    function renderRows() {
      var filtered = getFilteredList();
      var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      var startIndex = (currentPage - 1) * pageSize;
      var pageItems = filtered.slice(startIndex, startIndex + pageSize);

      var btnNac = document.getElementById('btn-rk-nac');
      var btnMun = document.getElementById('btn-rk-mun');
      var btnAll = document.getElementById('btn-rk-all');
      btnNac.style.background = currentMode === 'BR' ? '#7c3aed' : '#1e293b';
      btnNac.style.color = '#fff';
      btnMun.style.background = currentMode === 'WORLD' ? '#7c3aed' : '#1e293b';
      btnMun.style.color = '#fff';
      btnAll.style.background = currentMode === 'ALL_TEAMS' ? '#2563eb' : '#1e293b';
      btnAll.style.color = '#fff';

      var tbody = document.getElementById('afm-rk-tbody');
      tbody.innerHTML = pageItems.map(function(c, i) {
        var idx = startIndex + i;
        var rowBg = c.isUser ? 'background:rgba(124,58,237,0.22);border-left:4px solid #a855f7;' : 'border-bottom:1px solid rgba(255,255,255,0.05);';
        var posColor = idx < 3 ? '#facc15' : (c.isUser ? '#c084fc' : '#94a3b8');
        var coachColor = c.isUser ? '#c084fc' : '#ffffff';
        return '<tr style="' + rowBg + '">' +
          '<td style="padding:10px 6px;font-weight:900;color:' + posColor + ';">#' + (idx + 1) + '</td>' +
          '<td style="padding:10px 6px;font-weight:800;color:' + coachColor + ';">' + (c.isUser ? '⭐ ' : '') + c.coach + '</td>' +
          '<td style="padding:10px 6px;font-weight:700;color:#38bdf8;">🛡️ ' + c.club + '</td>' +
          '<td style="padding:10px 6px;font-size:11px;color:#cbd5e1;">' + c.division + ' · ' + c.country + '</td>' +
          '<td style="padding:10px 6px;"><span style="background:rgba(124,58,237,0.28);border:1px solid rgba(168,85,247,0.45);color:#e9d5ff;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:800;">⭐ Prestígio ' + c.prestige + '</span></td>' +
          '<td style="padding:10px 6px;font-weight:800;color:#facc15;">🏆 ' + c.titles + '</td>' +
          '<td style="padding:10px 6px;font-size:12px;color:#cbd5e1;">' + c.w + 'V · ' + c.d + 'E · ' + c.l + 'D</td>' +
          '<td style="padding:10px 6px;text-align:right;font-weight:900;color:#34d399;">' + c.pts + ' pts</td>' +
        '</tr>';
      }).join('');

      // Atualiza indicadores de página
      var pageInfo = document.getElementById('afm-rk-page-info');
      if (pageInfo) {
        var startNum = filtered.length ? (startIndex + 1) : 0;
        var endNum = Math.min(startIndex + pageSize, filtered.length);
        pageInfo.textContent = 'Exibindo ' + startNum + ' a ' + endNum + ' de ' + filtered.length + ' treinadores';
      }
      var pageCur = document.getElementById('afm-rk-page-current');
      if (pageCur) pageCur.textContent = currentPage + ' / ' + totalPages;

      var btnPrev = document.getElementById('btn-rk-prev');
      if (btnPrev) {
        btnPrev.disabled = (currentPage <= 1);
        btnPrev.style.opacity = (currentPage <= 1) ? '0.4' : '1';
        btnPrev.style.cursor = (currentPage <= 1) ? 'not-allowed' : 'pointer';
      }
      var btnNext = document.getElementById('btn-rk-next');
      if (btnNext) {
        btnNext.disabled = (currentPage >= totalPages);
        btnNext.style.opacity = (currentPage >= totalPages) ? '0.4' : '1';
        btnNext.style.cursor = (currentPage >= totalPages) ? 'not-allowed' : 'pointer';
      }
    }

    document.getElementById('close-rk').onclick = function() { modal.remove(); };
    document.getElementById('btn-rk-nac').onclick = function() { currentMode = 'BR'; currentPage = 1; renderRows(); };
    document.getElementById('btn-rk-mun').onclick = function() { currentMode = 'WORLD'; currentPage = 1; renderRows(); };
    document.getElementById('btn-rk-all').onclick = function() { currentMode = 'ALL_TEAMS'; currentPage = 1; renderRows(); };
    document.getElementById('afm-rk-search').oninput = function() { currentPage = 1; renderRows(); };

    document.getElementById('btn-rk-prev').onclick = function() {
      if (currentPage > 1) {
        currentPage--;
        renderRows();
      }
    };
    document.getElementById('btn-rk-next').onclick = function() {
      var filtered = getFilteredList();
      var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage < totalPages) {
        currentPage++;
        renderRows();
      }
    };

    var btnGoto = document.getElementById('btn-rk-goto-user');
    if (btnGoto) {
      btnGoto.onclick = function() {
        var filtered = getFilteredList();
        var userIdx = filtered.findIndex(function(x) { return x.isUser; });
        if (userIdx !== -1) {
          currentPage = Math.floor(userIdx / pageSize) + 1;
          renderRows();
        } else {
          if (typeof toast === 'function') toast('ℹ️ Seu treinador não aparece no filtro selecionado.');
          else alert('Seu treinador não aparece no filtro selecionado.');
        }
      };
    }

    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    renderRows();
  }

  // =========================================================================
  // MODAL DE CURSOS & LICENÇAS (CBF D/C/B/A/PRO & UEFA PRO)
  // =========================================================================
  function openLicensesModal() {
    var old = document.getElementById('afm-lic-modal');
    if (old) old.remove();

    var user = getUserData();
    var st = window.state || window.gameState || {};
    var currentLicId = (st.manager && st.manager.license) || (st.managerPersonal && st.managerPersonal.licenseId) || localStorage.getItem('afm_user_license_id') || 'cbf_d';
    var userPrestige = (st.managerPersonal && st.managerPersonal.prestigeScore) || st.coachPrestige || (user && user.prestige) || (user && user.level) || 5;
    var userMoney = (typeof st.managerMoney === 'number') ? st.managerMoney : ((st.managerPersonal && typeof st.managerPersonal.personalBalance === 'number') ? st.managerPersonal.personalBalance : 57000);

    var modal = document.createElement('div');
    modal.id = 'afm-lic-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,5,15,0.85);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;';

    var cardsHtml = LICENSES.map(function(lic) {
      var owned = lic.id === currentLicId;
      var canAfford = userMoney >= lic.cost;
      var hasPrestige = userPrestige >= lic.minPrestige;
      var canBuy = !owned && canAfford && hasPrestige;

      var btnLabel = owned ? '✔ Habilitado' : (lic.cost === 0 ? 'Habilitar Grátis' : ('Comprar (R$ ' + lic.cost.toLocaleString('pt-BR') + ')'));

      return '<div style="background:#1e293b;border:1px solid ' + (owned ? '#22c55e' : (hasPrestige ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.3)')) + ';border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap;">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:800;color:#fff;">🎓 ' + lic.name + (owned ? ' <span style="color:#22c55e;font-size:11px;">(ATUAL)</span>' : '') + '</div>' +
          '<div style="font-size:12px;color:#38bdf8;margin-top:4px;">Bônus: ' + lic.bonus + ' | Requisito: Prestígio ' + lic.minPrestige + '+ ' + (hasPrestige ? '<span style="color:#22c55e">✓</span>' : '<span style="color:#ef4444">(Seu Prestígio: ' + userPrestige + ')</span>') + '</div>' +
        '</div>' +
        '<button class="btn-buy-lic" data-id="' + lic.id + '" data-cost="' + lic.cost + '" style="background:' + (owned ? '#16a34a' : (canBuy ? '#7c3aed' : '#334155')) + ';color:#fff;border:none;padding:9px 16px;border-radius:10px;font-weight:800;font-size:12px;cursor:' + (owned ? 'default' : 'pointer') + ';" ' + (owned ? 'disabled' : '') + '>' +
          btnLabel +
        '</button>' +
      '</div>';
    }).join('');

    modal.innerHTML =
      '<div style="width:100%;max-width:680px;background:#0f172a;border:1px solid rgba(56,189,248,0.45);border-radius:18px;padding:20px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,0.85);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">' +
          '<div>' +
            '<h2 style="margin:0;font-size:18px;font-weight:900;">🎓 Academia de Licenças de Treinador (CBF & UEFA)</h2>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Seu Prestígio: <b style="color:#facc15;">' + userPrestige + '/99</b> · Patrimônio Pessoal: <b style="color:#4ade80;">R$ ' + userMoney.toLocaleString('pt-BR') + '</b></div>' +
          '</div>' +
          '<button id="close-lic" type="button" style="background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.2);padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:800;">✕ Fechar</button>' +
        '</div>' +
        '<div style="max-height:65vh;overflow-y:auto;padding-right:4px;">' + cardsHtml + '</div>' +
      '</div>';

    document.body.appendChild(modal);
    document.getElementById('close-lic').onclick = function() { modal.remove(); };
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    modal.querySelectorAll('.btn-buy-lic').forEach(function(btn) {
      btn.onclick = function() {
        var id = btn.getAttribute('data-id');
        var cost = Number(btn.getAttribute('data-cost')) || 0;
        var targetLic = LICENSES.find(function(l) { return l.id === id; });
        if (!targetLic) return;

        if (id === currentLicId) return;

        if (userPrestige < targetLic.minPrestige) {
          var msg = 'Requisito não atingido: Prestígio mínimo ' + targetLic.minPrestige + '+ necessário (Seu prestígio atual é ' + userPrestige + ').';
          if (typeof window.toast === 'function') window.toast(msg); else alert(msg);
          return;
        }

        if (cost > 0 && userMoney < cost) {
          var msgMoney = 'Patrimônio pessoal insuficiente para adquirir a ' + targetLic.name + '!';
          if (typeof window.toast === 'function') window.toast(msgMoney); else alert(msgMoney);
          return;
        }

        // Dedução financeira
        if (cost > 0) {
          if (typeof st.managerMoney === 'number') st.managerMoney -= cost;
          if (st.managerPersonal && typeof st.managerPersonal.personalBalance === 'number') st.managerPersonal.personalBalance -= cost;
        }

        localStorage.setItem('afm_user_license_id', id);
        if (!st.manager) st.manager = {};
        st.manager.license = id;
        if (st.managerPersonal) st.managerPersonal.licenseId = id;

        if (typeof window.save === 'function') window.save();
        if (typeof window.toast === 'function') window.toast('🎉 Parabéns! Você obteve ' + targetLic.name + ' com sucesso!');

        modal.remove();
        injectTopPrestigeAndButtons();
        openLicensesModal();
        if (typeof window.render === 'function') window.render();
      };
    });
  }

  document.addEventListener('click', function() {
    injectTopPrestigeAndButtons();
  });
  window.addEventListener('load', function() {
    injectTopPrestigeAndButtons();
  });

  window.AFM_InstantCareerHook = injectTopPrestigeAndButtons;
  window.AFM_WorldSimulation = Object.assign(window.AFM_WorldSimulation || {}, {
    injectPrestigeAndRankingButtonInCareerCard: injectTopPrestigeAndButtons
  });
  window.openCoachesRankingModal = openCoachesRankingModal;
  window.openLicensesModal = openLicensesModal;
})();

