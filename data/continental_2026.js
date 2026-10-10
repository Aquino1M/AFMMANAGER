// Fase de grupos e janelas oficiais das competições CONMEBOL de 2026.
window.AFM_CONTINENTAL_2026 = {
  matchdays: ['07–09 abr', '14–16 abr', '28–30 abr', '05–07 mai', '19–21 mai', '26–28 mai'],
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
      { round: '5ª fase • ida', date: '2026-04-22', label: '22 abr 2026' },
      { round: '5ª fase • volta', date: '2026-05-13', label: '13 mai 2026' }
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
        { round: 'Oitavas • ida', date: '2026-08-01', label: '01–03 ago 2026' },
        { round: 'Oitavas • volta', date: '2026-08-04', label: '04–06 ago 2026' }
      ],
      ties: [
        ['Vasco da Gama', 'Fluminense'], ['Internacional', 'Corinthians'], ['Mirassol', 'Grêmio'],
        ['Athletico Paranaense', 'Vitória'], ['Atlético-MG', 'Juventude'], ['Santos', 'Remo'],
        ['Chapecoense', 'Cruzeiro'], ['Palmeiras', 'Fortaleza']
      ]
    },
    quarterfinals: {
      dateWindows: [
        { round: 'Quartas • ida', date: '2026-08-25', label: '25–27 ago 2026' },
        { round: 'Quartas • volta', date: '2026-09-01', label: '01–03 set 2026' }
      ],
      ties: [
        ['Internacional', 'Grêmio'], ['Cruzeiro', 'Atlético-MG'],
        ['Vasco da Gama', 'Vitória'], ['Palmeiras', 'Santos']
      ]
    }
  },
  groupFixtures(competitionId) {
    const groups = this.groups[competitionId] || {};
    const pattern = [
      [[3, 1], [2, 0]], [[1, 2], [0, 3]], [[1, 0], [3, 2]],
      [[2, 1], [3, 0]], [[0, 1], [2, 3]], [[0, 2], [1, 3]]
    ];
    return pattern.map((matches, index) => Object.entries(groups).flatMap(([group, teams]) =>
      matches.map(([home, away]) => ({
        competitionId, group, round: index + 1,
        home: teams[home], away: teams[away], dateLabel: this.matchdays[index]
      }))
    ));
  }
};
window.COMPETITION_TEAMS = window.COMPETITION_TEAMS || {};
window.COMPETITION_TEAMS.lib = Object.values(window.AFM_CONTINENTAL_2026.groups.lib).flat();
window.COMPETITION_TEAMS.sud = Object.values(window.AFM_CONTINENTAL_2026.groups.sud).flat();
window.COMPETITION_TEAMS['bra-cup'] = [...new Set(window.AFM_CONTINENTAL_2026.copaDoBrasil.ties.flat())];
