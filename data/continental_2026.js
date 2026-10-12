// Template de grupos CONMEBOL para a temporada-base 2026. Novas edições usam
// os classificados persistidos no save; estas listas não são vagas automáticas.
window.AFM_CONTINENTAL_2026 = {
  matchdays: ['2026-04-07', '2026-04-14', '2026-04-28', '2026-05-05', '2026-05-19', '2026-05-26'],
  groups: {
    lib: {
      A: ['Flamengo', 'Estudiantes', 'Cusco', 'Independiente Medellín'],
      B: ['Nacional', 'Universitario', 'Coquimbo Unido', 'Tolima'],
      C: ['Fluminense', 'Bolívar', 'Deportivo La Guaira', 'Independiente Rivadavia'],
      D: ['Boca Juniors', 'Cruzeiro', 'Universidad Católica', 'Barcelona SC'],
      E: ['Peñarol', 'Corinthians', 'Independiente Santa Fe', 'Platense'],
      F: ['Palmeiras', 'Cerro Porteño', 'Junior Barranquilla', 'Sporting Cristal'],
      G: ['LDU Quito', 'Lanús', 'Always Ready', 'Mirassol'],
      H: ['Independiente del Valle', 'Libertad', 'Rosario Central', 'Universidad Central']
    },
    sud: {
      A: ['América de Cali', 'Tigre', 'Macará', 'Alianza Atlético'],
      B: ['Atlético-MG', 'Cienciano', 'Academia Puerto Cabello', 'Juventud'],
      C: ['São Paulo', 'Millonarios', 'Boston River', 'O’Higgins'],
      D: ['Santos', 'San Lorenzo', 'Deportivo Cuenca', 'Recoleta'],
      E: ['Racing Club', 'Caracas', 'Independiente Petrolero', 'Botafogo'],
      F: ['Grêmio', 'Palestino', 'Montevideo City Torque', 'Deportivo Riestra'],
      G: ['Olimpia', 'Vasco da Gama', 'Audax Italiano', 'Barracas Central'],
      H: ['River Plate', 'Red Bull Bragantino', 'Blooming', 'Carabobo']
    }
  },
  // shortcut: Copa do Brasil cobre 5ª fase às quartas; ampliar ao integrar chave oficial completa e fases finais.
  copaDoBrasil: {
    dateWindows: [
      { round: '5ª fase • ida', date: '2026-04-21', endDate: '2026-04-23', label: '21–23 abr 2026' },
      { round: '5ª fase • volta', date: '2026-05-12', endDate: '2026-05-14', label: '12–14 mai 2026' }
    ],
    ties: [
      ['Atlético-MG', 'Ceará'], ['Goiás', 'Cruzeiro'], ['Athletico Paranaense', 'Atlético-GO'],
      ['Flamengo', 'Vitória'], ['Grêmio', 'Confiança'], ['Paysandu', 'Vasco da Gama'],
      ['Fortaleza', 'CRB'], ['Bahia', 'Remo'], ['Botafogo', 'Chapecoense'],
      ['Bragantino', 'Mirassol'], ['Barra-SC', 'Corinthians'], ['Operário-PR', 'Fluminense'],
      ['Palmeiras', 'Jacuipense'], ['Athletic Club', 'Internacional'], ['Santos', 'Coritiba'],
      ['São Paulo', 'Juventude']
    ],
    roundOf16: {
      dateWindows: [
        { round: 'Oitavas • ida', date: '2026-08-01', endDate: '2026-08-03', label: '01–03 ago 2026' },
        { round: 'Oitavas • volta', date: '2026-08-04', endDate: '2026-08-06', label: '04–06 ago 2026' }
      ],
      ties: [
        ['Vasco da Gama', 'Fluminense'], ['Internacional', 'Corinthians'], ['Mirassol', 'Grêmio'],
        ['Athletico Paranaense', 'Vitória'], ['Atlético-MG', 'Juventude'], ['Santos', 'Remo'],
        ['Chapecoense', 'Cruzeiro'], ['Palmeiras', 'Fortaleza']
      ]
    },
    quarterfinals: {
      dateWindows: [
        { round: 'Quartas • ida', date: '2026-08-25', endDate: '2026-08-27', label: '25–27 ago 2026' },
        { round: 'Quartas • volta', date: '2026-09-01', endDate: '2026-09-03', label: '01–03 set 2026' }
      ],
      ties: [
        ['Internacional', 'Grêmio'], ['Cruzeiro', 'Atlético-MG'],
        ['Vasco da Gama', 'Vitória'], ['Palmeiras', 'Santos']
      ]
    }
  },
  groupFixtures(competitionId, season = 2026, participantGroups = null) {
    const useGroups = participantGroups || this.groups[competitionId] || {};
    if (window.AFM_TOURNAMENT_ENGINE?.groupFixtures) {
      return window.AFM_TOURNAMENT_ENGINE.groupFixtures({ id: competitionId, season, groups: useGroups, startDate: `${season}-03-03` });
    }
    const groups = useGroups;
    const firstMatchDay = this.matchdays;
    const pattern = [
      [[3, 1], [2, 0]], [[1, 2], [0, 3]], [[1, 0], [3, 2]],
      [[2, 1], [3, 0]], [[0, 1], [2, 3]], [[0, 2], [1, 3]]
    ];
    return pattern.map((matches, index) => Object.entries(groups).flatMap(([group, teams], groupIndex) =>
      matches.map(([home, away]) => {
        const date = new Date(`${firstMatchDay[index]}T12:00:00`);
        date.setDate(date.getDate() + groupIndex % 3);
        const isoDate = date.toISOString().slice(0, 10);
        return {
          competitionId, group, round: index + 1, date: isoDate,
          home: teams[home], away: teams[away],
          dateLabel: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        };
      })
    ));
  }
};
window.COMPETITION_TEAMS = window.COMPETITION_TEAMS || {};
window.COMPETITION_TEAMS.lib = Object.values(window.AFM_CONTINENTAL_2026.groups.lib).flat();
window.COMPETITION_TEAMS.sud = Object.values(window.AFM_CONTINENTAL_2026.groups.sud).flat();
window.COMPETITION_TEAMS['bra-cup'] = [...new Set(window.AFM_CONTINENTAL_2026.copaDoBrasil.ties.flat())];
