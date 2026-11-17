(function() {
  if (window.__AFM_RANKING_LICENSES_V3) return;
  window.__AFM_RANKING_LICENSES_V3 = true;

  const LICENSES = [
    { id: 'cbf_d', name: 'Licença CBF D (Iniciante)', cost: 0, minPrestige: 0, bonus: '+2% Evolução da Base', salaryBonusPct: 5, salaryBonusLabel: '+5% no Salário' },
    { id: 'cbf_c', name: 'Licença CBF C (Estadual)', cost: 15000, minPrestige: 5, bonus: '+4% Treino Tático', salaryBonusPct: 10, salaryBonusLabel: '+10% no Salário' },
    { id: 'cbf_b', name: 'Licença CBF B (Nacional Série B/C)', cost: 45000, minPrestige: 12, bonus: '+7% Moral & Tática', salaryBonusPct: 15, salaryBonusLabel: '+15% no Salário' },
    { id: 'cbf_a', name: 'Licença CBF A (Elite Série A)', cost: 120000, minPrestige: 25, bonus: '+10% Atração no Mercado', salaryBonusPct: 20, salaryBonusLabel: '+20% no Salário' },
    { id: 'cbf_pro', name: 'Licença CONMEBOL / CBF PRO', cost: 280000, minPrestige: 45, bonus: '+15% Prestígio Continental', salaryBonusPct: 25, salaryBonusLabel: '+25% no Salário' },
    { id: 'uefa_pro', name: 'Licença UEFA PRO (Mundial)', cost: 650000, minPrestige: 70, bonus: 'Acesso Irrestrito a Gigantes Europeus', salaryBonusPct: 35, salaryBonusLabel: '+35% no Salário' }
  ];
  window.AFM_COACH_LICENSES = LICENSES;

  function escapeHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCoachLicensesData(state) {
    const st = state || (typeof window !== 'undefined' ? (window.state || window.gameState) : null) || {};
    const currentLicId = (st.manager && st.manager.license) || (st.managerPersonal && st.managerPersonal.licenseId) || (typeof localStorage !== 'undefined' && localStorage.getItem('afm_user_license_id')) || 'cbf_d';

    const currIdx = LICENSES.findIndex(function(l) { return l.id === currentLicId; });
    const targetIdx = currIdx >= 0 ? currIdx : 0;

    const completedSet = new Set();
    for (let i = 0; i <= targetIdx; i++) {
      if (LICENSES[i]) completedSet.add(LICENSES[i].id);
    }
    if (Array.isArray(st.completedLicenses)) {
      st.completedLicenses.forEach(function(id) { completedSet.add(id); });
    }

    const completedList = LICENSES.filter(function(l) { return completedSet.has(l.id); });
    let totalBonusPct = completedList.reduce(function(acc, l) { return acc + (l.salaryBonusPct || 0); }, 0);
    const exPlayerBonus = Number(st.managerCareerBonuses?.salaryPct || st.bonusSalarioTreinador || 0);
    if (exPlayerBonus > 0) {
      totalBonusPct += exPlayerBonus;
    }

    const baseSalary = Number(st.managerBaseSalary || st.managerSalary || 9500);
    const bonusValue = Math.round(baseSalary * (totalBonusPct / 100));
    const totalSalary = baseSalary + bonusValue;

    const currentLic = LICENSES[targetIdx] || LICENSES[0];

    return {
      currentLicId: currentLicId,
      currentLic: currentLic,
      completedSet: completedSet,
      completedList: completedList,
      totalBonusPct: totalBonusPct,
      baseSalary: baseSalary,
      bonusValue: bonusValue,
      totalSalary: totalSalary
    };
  }
  window.getCoachLicensesData = getCoachLicensesData;

  function syncCoachSalaryWithLicenses(state) {
    const st = state || (typeof window !== 'undefined' ? (window.state || window.gameState) : null);
    if (!st) return 9500;
    const data = getCoachLicensesData(st);
    if (!st.managerBaseSalary) {
      st.managerBaseSalary = data.baseSalary;
    }
    st.managerSalary = data.totalSalary;
    if (st.managerPersonal) {
      st.managerPersonal.salary = data.totalSalary;
    }
    return data.totalSalary;
  }
  window.syncCoachSalaryWithLicenses = syncCoachSalaryWithLicenses;

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

  function resolveUserDivision(st) {
    st = st || {};
    var compId = st.compId || st.customClubStateCompId || st.stateCompId || '';
    var competitions = Array.isArray(window.COMPETITIONS) ? window.COMPETITIONS : [];
    var comp = competitions.find(function(item) { return item && item.id === compId; });
    return (comp && comp.name) || st.competition || st.currentLeague || 'Liga Nacional BR';
  }

  function getUserData() {
    var st = window.state || window.gameState || {};
    var managerName = (st.manager && st.manager.name) || st.managerName || st.coachName || 'Aquino';
    var clubName = (st.club && st.club.name) || (typeof st.club === 'string' ? st.club : '') || (st.userTeam && st.userTeam.name) || 'Corinthians';
    var matches = Array.isArray(st.history) ? st.history.filter(function(match) {
      return norm(match.h) === norm(clubName) || norm(match.a) === norm(clubName);
    }) : [];
    var wins = matches.filter(function(match) {
      var isHome = norm(match.h) === norm(clubName);
      var goalsFor = Number(isHome ? match.hg : match.ag) || 0;
      var goalsAgainst = Number(isHome ? match.ag : match.hg) || 0;
      return goalsFor > goalsAgainst;
    }).length;
    var draws = matches.filter(function(match) { return Number(match.hg) === Number(match.ag); }).length;
    var losses = matches.length - wins - draws;
    var career = st.managerCareer || st.career || {};
    wins = Math.max(wins, Number(career.wins) || 0, Number(st.wins) || 0);
    draws = Math.max(draws, Number(career.draws) || 0, Number(st.draws) || 0);
    losses = Math.max(losses, Number(career.losses) || 0, Number(st.losses) || 0);
    var titleNames = [];
    function addTitle(value) {
      var name = typeof value === 'string' ? value : (value && (value.name || value.title || value.competitionName));
      if (!name) return;
      var key = norm(name);
      if (key && titleNames.indexOf(key) < 0) titleNames.push(key);
    }
    (Array.isArray(st.titles) ? st.titles : []).forEach(addTitle);
    (Array.isArray(st.trophies) ? st.trophies : []).forEach(addTitle);
    (Array.isArray(st.worldChampionHistory) ? st.worldChampionHistory : []).forEach(function(record) {
      (Array.isArray(record.titlesWon) ? record.titlesWon : []).forEach(addTitle);
      (Array.isArray(record.competitions) ? record.competitions : []).forEach(function(comp) {
        if (norm(comp && (comp.champion || comp.winner)) === norm(clubName)) addTitle(comp.name || comp.competitionName);
      });
    });
    (Array.isArray(st.seasonHistory) ? st.seasonHistory : []).forEach(function(record) {
      if (norm(record.userClub || record.club) === norm(clubName)) {
        (Array.isArray(record.titlesWon) ? record.titlesWon : []).forEach(addTitle);
        (Array.isArray(record.titulos) ? record.titulos : []).forEach(addTitle);
        if (Number(record.userPosition) === 1 || Number(record.position) === 1) addTitle(record.compName || record.competitionName || record.competition);
      }
      (Array.isArray(record.competitions) ? record.competitions : []).forEach(function(comp) {
        if (norm(comp && (comp.champion || comp.winner)) === norm(clubName)) addTitle(comp.name || comp.competitionName);
      });
    });
    var titles = titleNames.length;
    var personal = st.managerPersonal || {};
    var prestigeScore = Math.max(5, Number(personal.prestigeScore) || 0, Number(st.coachPrestige) || 0);
    var careerPoints = Math.max(0, Number(personal.careerPoints) || 0);
    var matchPoints = wins * 14 + draws * 4 - losses * 6;
    var pts = Math.max(50 + (titles * 160) + matchPoints, careerPoints, Math.round(prestigeScore * 35));
    var level = Math.min(99, Math.max(5, Number(personal.prestigeScore) || Number(st.coachPrestige) || Math.floor(pts / 35)));
    if (personal.prestigeScore !== level || Number(personal.careerPoints) < pts) {
      st.managerPersonal = personal;
      personal.prestigeScore = Math.max(Number(personal.prestigeScore) || 0, level);
      personal.careerPoints = Math.max(careerPoints, pts);
      st.coachPrestige = Math.max(Number(st.coachPrestige) || 0, personal.prestigeScore);
    }
    var licId = localStorage.getItem('afm_user_license_id') || 'cbf_d';
    var licObj = LICENSES.find(function(x) { return x.id === licId; }) || LICENSES[0];
    return { managerName: managerName, clubName: clubName, w: wins, d: draws, l: losses, titles: titles, pts: pts, level: level, license: licObj, division: resolveUserDivision(st) };
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

    // O save é a fonte de verdade para a liga e os dados do clube do usuário.
    // Isso também corrige entradas antigas do ranking com liga estática incorreta.
    byClubKey.set(userClubKey, {
      ...(byClubKey.get(userClubKey) || {}),
      coach: 'Téc. ' + user.managerName + ' (VOCÊ)',
      club: user.clubName,
      country: 'Brasil',
      division: user.division,
      prestige: user.level,
      titles: user.titles,
      w: user.w,
      d: user.d,
      l: user.l,
      pts: user.pts,
      scope: 'BR',
      isUser: true
    });

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

    var pInfo = (typeof window.getUnifiedManagerPrestige === 'function')
      ? window.getUnifiedManagerPrestige(st)
      : { pts: user.pts, level: user.level, titlesCount: user.titles, license: user.license.name };

    existingTopSlot.innerHTML =
      '<div style="background:rgba(15,23,42,0.75);border:1px solid rgba(168,85,247,0.55);border-radius:12px;padding:8px 14px;text-align:left;">' +
        '<div style="font-size:9px;font-weight:800;color:#cbd5e1;letter-spacing:0.6px;text-transform:uppercase;">NÍVEL DE PRESTÍGIO NO SAVE · ' + pInfo.license.toUpperCase() + '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#facc15;margin-top:2px;">⭐ Nível ' + pInfo.level + '/99 (' + pInfo.pts + ' pts · ' + pInfo.titlesCount + (pInfo.titlesCount === 1 ? ' Título' : ' Títulos') + ')</div>' +
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

    var st = (typeof state !== 'undefined' ? state : (typeof window !== 'undefined' ? window.state : {}));
    var allCoaches = buildCompleteCoachesAndTeamsList();
    if (typeof window !== 'undefined' && window.AFMCareerFix && typeof window.AFMCareerFix.normalizeAndSortRanking === 'function') {
      var rkObj = window.AFMCareerFix.normalizeAndSortRanking(allCoaches, st);
      allCoaches = rkObj.all;
    }

    var currentMode = initialTab || 'WORLD';
    if (currentMode !== 'BR' && currentMode !== 'WORLD' && currentMode !== 'ALL_TEAMS') currentMode = 'WORLD';

    // Identificação do treinador do usuário e posições exatas no ranking
    var userCoach = allCoaches.find(function(x) { return x.isUser; }) || {
      coach: (typeof st !== 'undefined' ? (st.managerName || st.manager || 'Aquino') : 'Aquino'),
      displayCoachName: 'Aquino',
      club: (typeof st !== 'undefined' ? (st.club || 'Ceilândia') : 'Ceilândia'),
      prestige: (typeof st !== 'undefined' && st.managerPersonal?.prestigeScore) ? st.managerPersonal.prestigeScore : 6,
      pts: 210
    };
    var cleanCoach = (typeof window !== 'undefined' && window.AFMCareerFix && typeof window.AFMCareerFix.sanitizeCoachName === 'function')
      ? window.AFMCareerFix.sanitizeCoachName(userCoach.displayCoachName || userCoach.coach)
      : String(userCoach.displayCoachName || userCoach.coach || 'Treinador').replace(/^(Téc\.\s*)+/gi, '').replace(/\(VOCÊ\)/gi, '').trim();

    var brCoaches = allCoaches.filter(function(x) { return x.scope === 'BR' || x.country === 'Brasil'; });
    var userPosBr = brCoaches.findIndex(function(x) { return x.isUser; }) + 1;
    var userPosWorld = allCoaches.findIndex(function(x) { return x.isUser; }) + 1;

    var pageSize = 10;
    var currentPage = 1;

    var modal = document.createElement('div');
    modal.id = 'afm-rk-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,5,15,0.85);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;';

    modal.innerHTML =
      '<div style="width:100%;max-width:980px;max-height:90vh;background:#0f172a;border:1px solid rgba(168,85,247,0.5);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.8);">' +
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
                '<span>Téc. ' + cleanCoach + ' (VOCÊ)</span> · <span style="color:#a78bfa;">' + (userCoach.club || userCoach.clubName) + '</span> · ' +
                '<span style="color:#fde047;">★ Prestígio ' + userCoach.prestige + '</span> · <span style="color:#34d399;">' + (userCoach.points ?? userCoach.pts) + ' pts</span>' +
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
        if (currentMode === 'BR' && item.scope !== 'BR' && item.country !== 'Brasil') return false;
        if (q) {
          var hay = norm((item.coach || '') + ' ' + (item.displayCoachName || '') + ' ' + (item.club || '') + ' ' + (item.division || '') + ' ' + (item.country || ''));
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      // Mantém ordenação numérica por pontos decrescente
      return filtered.slice().sort(function(a, b) {
        var ptA = (typeof a.points === 'number') ? a.points : (a.pts || 0);
        var ptB = (typeof b.points === 'number') ? b.points : (b.pts || 0);
        if (ptB !== ptA) return ptB - ptA;
        return (b.titles || 0) - (a.titles || 0);
      });
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
        var posNum = (currentMode === 'BR' && c.nationalPos) ? c.nationalPos : (c.worldPos || (idx + 1));
        var rowBg = c.isUser ? 'background:rgba(124,58,237,0.22);border-left:4px solid #a855f7;' : 'border-bottom:1px solid rgba(255,255,255,0.05);';
        var posColor = posNum <= 3 ? '#facc15' : (c.isUser ? '#c084fc' : '#94a3b8');
        var coachNameDisp = c.displayCoachName ? `Téc. ${c.displayCoachName}${c.isUser ? ' (VOCÊ)' : ''}` : c.coach;
        var rowClass = c.isUser ? 'afm-rk-user-row' : '';
        return '<tr class="' + rowClass + '" style="' + rowBg + '">' +
          '<td style="padding:10px 6px;font-weight:900;color:' + posColor + ';">#' + posNum + '</td>' +
          '<td style="padding:10px 6px;font-weight:800;color:' + (c.isUser ? '#c084fc' : '#ffffff') + ';">' + (c.isUser ? '⭐ ' : '') + escapeHtml(coachNameDisp) + '</td>' +
          '<td style="padding:10px 6px;font-weight:700;color:#38bdf8;">🛡️ ' + escapeHtml(c.club || c.clubName) + '</td>' +
          '<td style="padding:10px 6px;font-size:11px;color:#cbd5e1;">' + escapeHtml(c.division || c.league) + ' · ' + escapeHtml(c.country) + '</td>' +
          '<td style="padding:10px 6px;"><span style="background:rgba(124,58,237,0.28);border:1px solid rgba(168,85,247,0.45);color:#e9d5ff;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:800;">⭐ Prestígio ' + Number(c.prestige || 0) + '</span></td>' +
          '<td style="padding:10px 6px;font-weight:800;color:#facc15;">🏆 ' + Number(c.titles || 0) + '</td>' +
          '<td style="padding:10px 6px;font-size:12px;color:#cbd5e1;">' + (c.wins ?? c.w) + 'V · ' + (c.draws ?? c.d) + 'E · ' + (c.losses ?? c.l) + 'D</td>' +
          '<td style="padding:10px 6px;text-align:right;font-weight:900;color:#34d399;">' + (c.points ?? c.pts) + ' pts</td>' +
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

    function closeRkModal() {
      document.removeEventListener('keydown', onRkEsc);
      modal.remove();
    }
    function onRkEsc(e) {
      if (e.key === 'Escape') closeRkModal();
    }
    document.addEventListener('keydown', onRkEsc);

    document.getElementById('close-rk').onclick = closeRkModal;
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
          else if (typeof window.showCustomAlert === 'function') window.showCustomAlert({ title: 'Ranking', message: 'Seu treinador não aparece no filtro selecionado.', type: 'warning' });
        }
      };
    }

    modal.onclick = function(e) { if (e.target === modal) closeRkModal(); };

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
    var licData = getCoachLicensesData(st);
    var currentLicId = licData.currentLicId;
    var userPrestige = (st.managerPersonal && st.managerPersonal.prestigeScore) || st.coachPrestige || (user && user.prestige) || (user && user.level) || 6;
    var careerEco = (typeof window !== 'undefined' && window.AFMCareerFix && typeof window.AFMCareerFix.calculateCareerEconomy === 'function')
      ? window.AFMCareerFix.calculateCareerEconomy(st)
      : null;
    var userMoney = careerEco ? careerEco.cash : ((typeof st.managerMoney === 'number') ? st.managerMoney : ((st.managerPersonal && typeof st.managerPersonal.personalBalance === 'number') ? st.managerPersonal.personalBalance : 104250));
    var baseSal = careerEco ? (st.career?.baseSalary || 45000) : licData.baseSalary;

    var modal = document.createElement('div');
    modal.id = 'afm-lic-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,5,15,0.85);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;';

    var cardsHtml = LICENSES.map(function(lic) {
      var isCompleted = licData.completedSet.has(lic.id);
      var isCurrent = lic.id === currentLicId;
      var canAfford = userMoney >= lic.cost;
      var hasPrestige = userPrestige >= lic.minPrestige;
      var canBuy = !isCompleted && canAfford && hasPrestige;
      var licBonusVal = Math.round(baseSal * (lic.salaryBonusPct / 100));

      var btnLabel = isCurrent ? '✔ Habilitado (Atual)' : (isCompleted ? '✔ Habilitado' : (lic.cost === 0 ? 'Habilitar Grátis' : ('Comprar (R$ ' + lic.cost.toLocaleString('pt-BR') + ')')));

      return '<div style="background:#1e293b;border:1px solid ' + (isCompleted ? '#22c55e' : (hasPrestige ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.3)')) + ';border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:280px;">' +
          '<div style="font-size:14px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span>🎓 ' + escapeHtml(lic.name) + '</span>' +
            (isCurrent ? '<span style="color:#22c55e;font-size:11px;font-weight:900;background:rgba(34,197,94,0.15);padding:2px 7px;border-radius:4px;border:1px solid rgba(34,197,94,0.4);">(ATUAL)</span>' : (isCompleted ? '<span style="color:#38bdf8;font-size:11px;font-weight:800;background:rgba(56,189,248,0.15);padding:2px 7px;border-radius:4px;">(CONCLUÍDA)</span>' : '')) +
          '</div>' +
          '<div style="font-size:12px;color:#38bdf8;margin-top:5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span>Bônus Especial: <b>' + escapeHtml(lic.bonus) + '</b></span>' +
            '<span style="color:' + (isCompleted ? '#4ade80' : '#86efac') + ';font-weight:800;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);padding:2px 7px;border-radius:5px;">' +
              '💵 ' + lic.salaryBonusLabel + ' (+R$ ' + licBonusVal.toLocaleString('pt-BR') + '/mês)' + (isCompleted ? ' ✓ Ativo' : '') +
            '</span>' +
            '<span style="color:#94a3b8;">| Requisito: Prestígio ' + lic.minPrestige + '+ ' + (hasPrestige ? '<span style="color:#22c55e">✓</span>' : '<span style="color:#ef4444">(Seu Prestígio: ' + userPrestige + ')</span>') + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="btn-buy-lic" data-id="' + lic.id + '" data-cost="' + lic.cost + '" style="background:' + (isCompleted ? '#16a34a' : (canBuy ? '#7c3aed' : '#334155')) + ';color:#fff;border:none;padding:9px 16px;border-radius:10px;font-weight:800;font-size:12px;cursor:' + (isCompleted ? 'default' : (canBuy ? 'pointer' : 'not-allowed')) + ';" ' + (isCompleted || !canBuy ? 'disabled' : '') + '>' +
          btnLabel +
        '</button>' +
      '</div>';
    }).join('');

    modal.innerHTML =
      '<div style="width:100%;max-width:760px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;background:#0f172a;border:1px solid rgba(56,189,248,0.45);border-radius:18px;padding:20px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,0.85);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">' +
          '<div>' +
            '<h2 style="margin:0;font-size:18px;font-weight:900;">🎓 Academia de Licenças de Treinador (CBF & UEFA)</h2>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<span>Seu Prestígio: <b style="color:#facc15;">' + userPrestige + '/99</b></span>' +
              '<span>·</span>' +
              '<span>Patrimônio: <b style="color:#4ade80;">R$ ' + userMoney.toLocaleString('pt-BR') + '</b></span>' +
              '<span>·</span>' +
              '<span>Salário Base: <b>R$ ' + baseSal.toLocaleString('pt-BR') + '/mês</b></span>' +
              '<span style="background:rgba(34,197,94,0.15);border:1px solid #22c55e;color:#4ade80;padding:2px 8px;border-radius:6px;font-weight:900;">' +
                '💰 Bônus Salarial Total: +' + licData.totalBonusPct + '% (+R$ ' + licData.bonusValue.toLocaleString('pt-BR') + '/mês) ➔ R$ ' + licData.totalSalary.toLocaleString('pt-BR') + '/mês' +
              '</span>' +
            '</div>' +
          '</div>' +
          '<button id="close-lic" type="button" style="background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.2);padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:800;">✕ Fechar</button>' +
        '</div>' +
        '<div style="flex:1 1 auto;overflow-y:auto;padding-right:6px;">' + cardsHtml + '</div>' +
      '</div>';

    document.body.appendChild(modal);
    function closeLicModal() {
      document.removeEventListener('keydown', onLicEsc);
      modal.remove();
    }
    function onLicEsc(e) {
      if (e.key === 'Escape') closeLicModal();
    }
    document.addEventListener('keydown', onLicEsc);
    document.getElementById('close-lic').onclick = closeLicModal;
    modal.onclick = function(e) { if (e.target === modal) closeLicModal(); };

    modal.querySelectorAll('.btn-buy-lic').forEach(function(btn) {
      btn.onclick = function(ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        var id = btn.getAttribute('data-id');
        var cost = Number(btn.getAttribute('data-cost')) || 0;
        var targetLic = LICENSES.find(function(l) { return l.id === id; });
        if (!targetLic) return;

        if (id === currentLicId) return;

        if (userPrestige < targetLic.minPrestige) {
          var msg = 'Requisito não atingido: Prestígio mínimo ' + targetLic.minPrestige + '+ necessário (Seu prestígio atual é ' + userPrestige + ').';
          if (typeof window.toast === 'function') window.toast(msg);
          else if (typeof window.showCustomAlert === 'function') window.showCustomAlert({ title: 'Prestígio Insuficiente', message: msg, type: 'warning' });
          return;
        }

        if (cost > 0 && userMoney < cost) {
          var msgMoney = 'Patrimônio pessoal insuficiente para adquirir a ' + targetLic.name + '!';
          if (typeof window.toast === 'function') window.toast(msgMoney);
          else if (typeof window.showCustomAlert === 'function') window.showCustomAlert({ title: 'Saldo Insuficiente', message: msgMoney, type: 'warning' });
          return;
        }

        btn.disabled = true;

        // Dedução financeira isolada em state.career.cash / personalBalance
        if (cost > 0) {
          if (st.career) {
            st.career.cash = (typeof st.career.cash === 'number' ? st.career.cash : userMoney) - cost;
            st.career.personalCash = st.career.cash;
          }
          if (typeof st.managerMoney === 'number') st.managerMoney -= cost;
          if (st.managerPersonal && typeof st.managerPersonal.personalBalance === 'number') st.managerPersonal.personalBalance -= cost;
        }

        localStorage.setItem('afm_user_license_id', id);
        if (!st.manager) st.manager = {};
        st.manager.license = id;
        if (st.managerPersonal) st.managerPersonal.licenseId = id;
        if (st.career) {
          st.career.licenseId = id;
          if (!st.career.unlockedLicenses) st.career.unlockedLicenses = [];
          if (!st.career.unlockedLicenses.includes(id)) st.career.unlockedLicenses.push(id);
        }

        // Registra na lista de licenças concluídas
        st.completedLicenses = Array.isArray(st.completedLicenses) ? st.completedLicenses : [];
        var licIdx = LICENSES.findIndex(function(l) { return l.id === id; });
        for (var i = 0; i <= licIdx; i++) {
          if (LICENSES[i] && !st.completedLicenses.includes(LICENSES[i].id)) {
            st.completedLicenses.push(LICENSES[i].id);
          }
        }

        // Sincroniza salário do treinador com o novo bônus acumulado
        var newTotalSalary = syncCoachSalaryWithLicenses(st);
        if (typeof window.AFMCareerFix !== 'undefined' && typeof window.AFMCareerFix.calculateCareerEconomy === 'function') {
          window.AFMCareerFix.calculateCareerEconomy(st);
        }

        if (typeof window.save === 'function') window.save();
        if (typeof window.toast === 'function') {
          window.toast('🎓 Parabéns! Você obteve ' + targetLic.name + '! Salário atualizado: R$ ' + newTotalSalary.toLocaleString('pt-BR') + '/mês (+' + targetLic.salaryBonusPct + '% de bônus salarial)!');
        }

        closeLicModal();
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
    injectPrestigeAndRankingButtonInCareerCard: injectTopPrestigeAndButtons,
    resolveUserDivision: resolveUserDivision,
    getCoachRankingEntries: buildCompleteCoachesAndTeamsList
  });
  window.openCoachesRankingModal = openCoachesRankingModal;
  window.openLicensesModal = openLicensesModal;
})();

