(function (window) {
  'use strict';

  const REAL_CLUB_TROPHIES_DB = window.REAL_CLUB_TROPHIES_DB = {
    'ceara': [
      { name: 'Copa do Nordeste (3x · Campeão Invicto)', year: '2015, 2020 e 2023', badge: 'HISTÓRICO OFICIAL DO CEARÁ', icon: '🏆' },
      { name: 'Torneio Norte-Nordeste', year: '1969', badge: 'HISTÓRICO OFICIAL DO CEARÁ', icon: '🥇' },
      { name: 'Campeonato Cearense (46x)', year: '1915 a 2024 (Pentacampeão 1915-1919)', badge: 'HISTÓRICO OFICIAL DO CEARÁ', icon: '🎖️' },
      { name: 'Copa dos Campeões Cearenses', year: '2014', badge: 'HISTÓRICO OFICIAL DO CEARÁ', icon: '⚡' },
      { name: 'Campanhas Históricas Sul-Americana & Série A', year: 'Quartas Sul-Americana 2022', badge: 'TRADIÇÃO ALVINEGRA · VOZÃO', icon: '🌎' }
    ],
    'fortaleza': [
      { name: 'Copa do Nordeste (3x)', year: '2019, 2022 e 2024', badge: 'HISTÓRICO OFICIAL DO FORTALEZA', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série B', year: '2018 (Campeão Nacional)', badge: 'HISTÓRICO OFICIAL DO FORTALEZA', icon: '🇧🇷' },
      { name: 'Torneio Norte-Nordeste', year: '1970', badge: 'HISTÓRICO OFICIAL DO FORTALEZA', icon: '🥇' },
      { name: 'Campeonato Cearense (46x)', year: 'Pentacampeão 2019-2023', badge: 'HISTÓRICO OFICIAL DO FORTALEZA', icon: '🎖️' },
      { name: 'Finalista da CONMEBOL Sul-Americana', year: '2023 (Campanha Continental)', badge: 'TRADIÇÃO TRICOLOR · LEÃO DO PICI', icon: '🌎' }
    ],
    'bahia': [
      { name: 'Campeonato Brasileiro Série A (2x)', year: '1959 (1º Campeão Brasileiro) e 1988', badge: 'HISTÓRICO OFICIAL DO BAHIA', icon: '🇧🇷' },
      { name: 'Copa do Nordeste (4x)', year: '2001, 2002, 2017 e 2021', badge: 'HISTÓRICO OFICIAL DO BAHIA', icon: '🏆' },
      { name: 'Campeonato Baiano (50x)', year: 'Maior Campeão Estadual da Bahia', badge: 'HISTÓRICO OFICIAL DO BAHIA', icon: '🥇' },
      { name: 'Taça Estado da Bahia (3x)', year: '2000, 2002 e 2007', badge: 'HISTÓRICO OFICIAL DO BAHIA', icon: '⚡' }
    ],
    'vitoria': [
      { name: 'Campeonato Brasileiro Série B', year: '2023 (Campeão Nacional)', badge: 'HISTÓRICO OFICIAL DO VITÓRIA', icon: '🇧🇷' },
      { name: 'Copa do Nordeste (4x)', year: '1997, 1999, 2003 e 2010', badge: 'HISTÓRICO OFICIAL DO VITÓRIA', icon: '🏆' },
      { name: 'Campeonato Baiano (30x)', year: '1908 a 2024', badge: 'HISTÓRICO OFICIAL DO VITÓRIA', icon: '🥇' },
      { name: 'Torneio José Américo de Almeida Filho', year: '1976', badge: 'HISTÓRICO OFICIAL DO VITÓRIA', icon: '⚡' }
    ],
    'sport': [
      { name: 'Campeonato Brasileiro Série A', year: '1987', badge: 'HISTÓRICO OFICIAL DO SPORT', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '2008', badge: 'HISTÓRICO OFICIAL DO SPORT', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série B', year: '1990', badge: 'HISTÓRICO OFICIAL DO SPORT', icon: '🏅' },
      { name: 'Copa do Nordeste (3x)', year: '1994, 2000 e 2014', badge: 'HISTÓRICO OFICIAL DO SPORT', icon: '✨' },
      { name: 'Campeonato Pernambucano (44x)', year: 'Maior Campeão de Pernambuco', badge: 'HISTÓRICO OFICIAL DO SPORT', icon: '🥇' }
    ],
    'corinthians': [
      { name: 'Mundial de Clubes da FIFA (2x)', year: '2000 e 2012', badge: 'HISTÓRICO OFICIAL DO CORINTHIANS', icon: '🌎' },
      { name: 'CONMEBOL Libertadores', year: '2012 (Campeão Invicto)', badge: 'HISTÓRICO OFICIAL DO CORINTHIANS', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (7x)', year: '1990, 1998, 1999, 2005, 2011, 2015, 2017', badge: 'HISTÓRICO OFICIAL DO CORINTHIANS', icon: '🇧🇷' },
      { name: 'Copa do Brasil (3x)', year: '1995, 2002, 2009', badge: 'HISTÓRICO OFICIAL DO CORINTHIANS', icon: '🏅' },
      { name: 'Recopa Sul-Americana', year: '2013', badge: 'HISTÓRICO OFICIAL DO CORINTHIANS', icon: '✨' },
      { name: 'Supercopa do Brasil', year: '1991', badge: 'HISTÓRICO OFICIAL DO CORINTHIANS', icon: '⚡' },
      { name: 'Campeonato Paulista (31x)', year: 'Maior Campeão Estadual de SP', badge: 'HISTÓRICO OFICIAL DO CORINTHIANS', icon: '🥇' }
    ],
    'flamengo': [
      { name: 'Mundial Interclubes', year: '1981', badge: 'HISTÓRICO OFICIAL DO FLAMENGO', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1981, 2019 e 2022', badge: 'HISTÓRICO OFICIAL DO FLAMENGO', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (8x)', year: '1980, 1982, 1983, 1987, 1992, 2009, 2019, 2020', badge: 'HISTÓRICO OFICIAL DO FLAMENGO', icon: '🇧🇷' },
      { name: 'Copa do Brasil (5x)', year: '1990, 2006, 2013, 2022 e 2024', badge: 'HISTÓRICO OFICIAL DO FLAMENGO', icon: '🏅' },
      { name: 'Recopa Sul-Americana', year: '2020', badge: 'HISTÓRICO OFICIAL DO FLAMENGO', icon: '✨' },
      { name: 'Supercopa do Brasil (3x)', year: '2020, 2021 e 2025', badge: 'HISTÓRICO OFICIAL DO FLAMENGO', icon: '⚡' },
      { name: 'Campeonato Carioca (39x)', year: 'Maior Campeão do Rio de Janeiro', badge: 'HISTÓRICO OFICIAL DO FLAMENGO', icon: '🥇' }
    ],
    'palmeiras': [
      { name: 'Copa Rio Internacional', year: '1951', badge: 'HISTÓRICO OFICIAL DO PALMEIRAS', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1999, 2020 e 2021', badge: 'HISTÓRICO OFICIAL DO PALMEIRAS', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (12x)', year: 'Maior Campeão Brasileiro', badge: 'HISTÓRICO OFICIAL DO PALMEIRAS', icon: '🇧🇷' },
      { name: 'Copa do Brasil (4x)', year: '1998, 2012, 2015 e 2020', badge: 'HISTÓRICO OFICIAL DO PALMEIRAS', icon: '🏅' },
      { name: 'Recopa Sul-Americana', year: '2022', badge: 'HISTÓRICO OFICIAL DO PALMEIRAS', icon: '✨' },
      { name: 'Supercopa do Brasil', year: '2023', badge: 'HISTÓRICO OFICIAL DO PALMEIRAS', icon: '⚡' },
      { name: 'Campeonato Paulista (26x)', year: 'Tradição Alviverde', badge: 'HISTÓRICO OFICIAL DO PALMEIRAS', icon: '🥇' }
    ],
    'sao paulo': [
      { name: 'Mundial de Clubes / Intercontinental (3x)', year: '1992, 1993 e 2005', badge: 'HISTÓRICO OFICIAL DO SÃO PAULO', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1992, 1993 e 2005', badge: 'HISTÓRICO OFICIAL DO SÃO PAULO', icon: '🏆' },
      { name: 'Copa Sul-Americana', year: '2012', badge: 'HISTÓRICO OFICIAL DO SÃO PAULO', icon: '✨' },
      { name: 'Campeonato Brasileiro Série A (6x)', year: '1977, 1986, 1991, 2006, 2007 e 2008', badge: 'HISTÓRICO OFICIAL DO SÃO PAULO', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '2023', badge: 'HISTÓRICO OFICIAL DO SÃO PAULO', icon: '🏅' },
      { name: 'Supercopa Rei', year: '2024', badge: 'HISTÓRICO OFICIAL DO SÃO PAULO', icon: '⚡' },
      { name: 'Campeonato Paulista (22x)', year: ' Soberano Tricolor', badge: 'HISTÓRICO OFICIAL DO SÃO PAULO', icon: '🥇' }
    ],
    'santos': [
      { name: 'Mundial Interclubes (2x)', year: '1962 e 1963', badge: 'HISTÓRICO OFICIAL DO SANTOS', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1962, 1963 e 2011', badge: 'HISTÓRICO OFICIAL DO SANTOS', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (8x)', year: '1961 a 1965, 1968, 2002 e 2004', badge: 'HISTÓRICO OFICIAL DO SANTOS', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '2010', badge: 'HISTÓRICO OFICIAL DO SANTOS', icon: '🏅' },
      { name: 'Recopa Sul-Americana', year: '2012', badge: 'HISTÓRICO OFICIAL DO SANTOS', icon: '✨' },
      { name: 'Campeonato Brasileiro Série B', year: '2024', badge: 'HISTÓRICO OFICIAL DO SANTOS', icon: '⚡' },
      { name: 'Campeonato Paulista (22x)', year: 'Berço dos Meninos da Vila', badge: 'HISTÓRICO OFICIAL DO SANTOS', icon: '🥇' }
    ],
    'gremio': [
      { name: 'Mundial Interclubes', year: '1983', badge: 'HISTÓRICO OFICIAL DO GRÊMIO', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1983, 1995 e 2017', badge: 'HISTÓRICO OFICIAL DO GRÊMIO', icon: '🏆' },
      { name: 'Recopa Sul-Americana (2x)', year: '1996 e 2018', badge: 'HISTÓRICO OFICIAL DO GRÊMIO', icon: '✨' },
      { name: 'Campeonato Brasileiro Série A (2x)', year: '1981 e 1996', badge: 'HISTÓRICO OFICIAL DO GRÊMIO', icon: '🇧🇷' },
      { name: 'Copa do Brasil (5x)', year: '1989, 1994, 1997, 2001 e 2016', badge: 'HISTÓRICO OFICIAL DO GRÊMIO', icon: '🏅' },
      { name: 'Supercopa do Brasil', year: '1990', badge: 'HISTÓRICO OFICIAL DO GRÊMIO', icon: '⚡' },
      { name: 'Campeonato Gaúcho (43x)', year: 'Imortal Tricolor', badge: 'HISTÓRICO OFICIAL DO GRÊMIO', icon: '🥇' }
    ],
    'internacional': [
      { name: 'Mundial de Clubes da FIFA', year: '2006', badge: 'HISTÓRICO OFICIAL DO INTERNACIONAL', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (2x)', year: '2006 e 2010', badge: 'HISTÓRICO OFICIAL DO INTERNACIONAL', icon: '🏆' },
      { name: 'Copa Sul-Americana', year: '2008 (Campeão Invicto)', badge: 'HISTÓRICO OFICIAL DO INTERNACIONAL', icon: '✨' },
      { name: 'Recopa Sul-Americana (2x)', year: '2007 e 2011', badge: 'HISTÓRICO OFICIAL DO INTERNACIONAL', icon: '⚡' },
      { name: 'Campeonato Brasileiro Série A (3x)', year: '1975, 1976 e 1979 (Invicto)', badge: 'HISTÓRICO OFICIAL DO INTERNACIONAL', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '1992', badge: 'HISTÓRICO OFICIAL DO INTERNACIONAL', icon: '🏅' },
      { name: 'Campeonato Gaúcho (46x)', year: 'Maior Campeão do Rio Grande do Sul', badge: 'HISTÓRICO OFICIAL DO INTERNACIONAL', icon: '🥇' }
    ],
    'cruzeiro': [
      { name: 'CONMEBOL Libertadores (2x)', year: '1976 e 1997', badge: 'HISTÓRICO OFICIAL DO CRUZEIRO', icon: '🏆' },
      { name: 'Supercopa Libertadores (2x)', year: '1991 e 1992', badge: 'HISTÓRICO OFICIAL DO CRUZEIRO', icon: '🌎' },
      { name: 'Recopa Sul-Americana', year: '1998', badge: 'HISTÓRICO OFICIAL DO CRUZEIRO', icon: '✨' },
      { name: 'Campeonato Brasileiro Série A (4x)', year: '1966, 2003, 2013 e 2014', badge: 'HISTÓRICO OFICIAL DO CRUZEIRO', icon: '🇧🇷' },
      { name: 'Copa do Brasil (6x)', year: '1993, 1996, 2000, 2003, 2017 e 2018 (Maior Campeão)', badge: 'HISTÓRICO OFICIAL DO CRUZEIRO', icon: '🏅' },
      { name: 'Campeonato Mineiro (38x)', year: 'Tradição Celeste', badge: 'HISTÓRICO OFICIAL DO CRUZEIRO', icon: '🥇' }
    ],
    'atletico-mg': [
      { name: 'CONMEBOL Libertadores', year: '2013', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-MG', icon: '🏆' },
      { name: 'Recopa Sul-Americana', year: '2014', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-MG', icon: '✨' },
      { name: 'Copa CONMEBOL (2x)', year: '1992 e 1997', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-MG', icon: '🌎' },
      { name: 'Campeonato Brasileiro Série A (3x)', year: '1937, 1971 e 2021', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-MG', icon: '🇧🇷' },
      { name: 'Copa do Brasil (2x)', year: '2014 e 2021', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-MG', icon: '🏅' },
      { name: 'Supercopa do Brasil', year: '2022', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-MG', icon: '⚡' },
      { name: 'Campeonato Mineiro (50x)', year: 'Maior Campeão de Minas Gerais', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-MG', icon: '🥇' }
    ],
    'botafogo': [
      { name: 'CONMEBOL Libertadores', year: '2024', badge: 'HISTÓRICO OFICIAL DO BOTAFOGO', icon: '🏆' },
      { name: 'Copa CONMEBOL', year: '1993', badge: 'HISTÓRICO OFICIAL DO BOTAFOGO', icon: '🌎' },
      { name: 'Campeonato Brasileiro Série A (3x)', year: '1968, 1995 e 2024', badge: 'HISTÓRICO OFICIAL DO BOTAFOGO', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série B (2x)', year: '2015 e 2021', badge: 'HISTÓRICO OFICIAL DO BOTAFOGO', icon: '🏅' },
      { name: 'Torneio Rio-São Paulo (4x)', year: '1962, 1964, 1966 e 1998', badge: 'HISTÓRICO OFICIAL DO BOTAFOGO', icon: '✨' },
      { name: 'Campeonato Carioca (21x)', year: 'Glorioso Estrela Solitária', badge: 'HISTÓRICO OFICIAL DO BOTAFOGO', icon: '🥇' }
    ],
    'fluminense': [
      { name: 'Copa Rio Internacional', year: '1952', badge: 'HISTÓRICO OFICIAL DO FLUMINENSE', icon: '🌎' },
      { name: 'CONMEBOL Libertadores', year: '2023', badge: 'HISTÓRICO OFICIAL DO FLUMINENSE', icon: '🏆' },
      { name: 'Recopa Sul-Americana', year: '2024', badge: 'HISTÓRICO OFICIAL DO FLUMINENSE', icon: '✨' },
      { name: 'Campeonato Brasileiro Série A (4x)', year: '1970, 1984, 2010 e 2012', badge: 'HISTÓRICO OFICIAL DO FLUMINENSE', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '2007', badge: 'HISTÓRICO OFICIAL DO FLUMINENSE', icon: '🏅' },
      { name: 'Campeonato Carioca (33x)', year: 'Tricolor das Laranjeiras', badge: 'HISTÓRICO OFICIAL DO FLUMINENSE', icon: '🥇' }
    ],
    'vasco': [
      { name: 'Campeonato Sul-Americano de Campeões', year: '1948 (1º Campeão Continental)', badge: 'HISTÓRICO OFICIAL DO VASCO', icon: '🌎' },
      { name: 'CONMEBOL Libertadores', year: '1998', badge: 'HISTÓRICO OFICIAL DO VASCO', icon: '🏆' },
      { name: 'Copa Mercosul', year: '2000 (Virada Histórica)', badge: 'HISTÓRICO OFICIAL DO VASCO', icon: '✨' },
      { name: 'Campeonato Brasileiro Série A (4x)', year: '1974, 1989, 1997 e 2000', badge: 'HISTÓRICO OFICIAL DO VASCO', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '2011', badge: 'HISTÓRICO OFICIAL DO VASCO', icon: '🏅' },
      { name: 'Campeonato Carioca (24x)', year: 'Gigante da Colina', badge: 'HISTÓRICO OFICIAL DO VASCO', icon: '🥇' }
    ],
    'athletico': [
      { name: 'Copa Sul-Americana (2x)', year: '2018 e 2021', badge: 'HISTÓRICO OFICIAL DO ATHLETICO-PR', icon: '🌎' },
      { name: 'Campeonato Brasileiro Série A', year: '2001', badge: 'HISTÓRICO OFICIAL DO ATHLETICO-PR', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '2019', badge: 'HISTÓRICO OFICIAL DO ATHLETICO-PR', icon: '🏆' },
      { name: 'Copa Suruga Bank / Levain Cup', year: '2019', badge: 'HISTÓRICO OFICIAL DO ATHLETICO-PR', icon: '✨' },
      { name: 'Campeonato Brasileiro Série B', year: '1995', badge: 'HISTÓRICO OFICIAL DO ATHLETICO-PR', icon: '🏅' },
      { name: 'Campeonato Paranaense (28x)', year: 'Furacão da Baixada', badge: 'HISTÓRICO OFICIAL DO ATHLETICO-PR', icon: '🥇' }
    ],
    'coritiba': [
      { name: 'Campeonato Brasileiro Série A', year: '1985', badge: 'HISTÓRICO OFICIAL DO CORITIBA', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série B (2x)', year: '2007 e 2010', badge: 'HISTÓRICO OFICIAL DO CORITIBA', icon: '🏆' },
      { name: 'Torneio do Povo', year: '1973', badge: 'HISTÓRICO OFICIAL DO CORITIBA', icon: '✨' },
      { name: 'Campeonato Paranaense (39x)', year: 'Maior Campeão do Paraná', badge: 'HISTÓRICO OFICIAL DO CORITIBA', icon: '🥇' }
    ],
    'bragantino': [
      { name: 'Campeonato Brasileiro Série B (2x)', year: '1989 e 2019', badge: 'HISTÓRICO OFICIAL DO RB BRAGANTINO', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série C', year: '2007', badge: 'HISTÓRICO OFICIAL DO RB BRAGANTINO', icon: '🏅' },
      { name: 'Campeonato Paulista', year: '1990 (Final Caipira Histórica)', badge: 'HISTÓRICO OFICIAL DO RB BRAGANTINO', icon: '🥇' },
      { name: 'Vice-Campeão da Copa Sul-Americana', year: '2021', badge: 'CAMPANHA CONTINENTAL', icon: '🌎' }
    ],
    'mirassol': [
      { name: 'Campeonato Brasileiro Série C', year: '2022 (Campeão Nacional)', badge: 'HISTÓRICO OFICIAL DO MIRASSOL', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série D', year: '2020 (Campeão Nacional)', badge: 'HISTÓRICO OFICIAL DO MIRASSOL', icon: '🏆' },
      { name: 'Acesso Histórico à Série A do Brasileirão', year: '2024 (Vice-Campeão Série B)', badge: 'MARCO HISTÓRICO DO LEÃO', icon: '✨' }
    ],
    'novorizontino': [
      { name: 'Campeonato Brasileiro Série C', year: '1994', badge: 'HISTÓRICO DO TIGRE DO VALE', icon: '🇧🇷' },
      { name: 'Campeão Paulista do Interior', year: '2019', badge: 'HISTÓRICO OFICIAL DO NOVORIZONTINO', icon: '🥇' },
      { name: 'Campeonato Paulista Série A3', year: '2014', badge: 'HISTÓRICO OFICIAL DO NOVORIZONTINO', icon: '🏅' }
    ],
    'juventude': [
      { name: 'Copa do Brasil', year: '1999 (Campeão Nacional)', badge: 'HISTÓRICO OFICIAL DO JUVENTUDE', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série B', year: '1994', badge: 'HISTÓRICO OFICIAL DO JUVENTUDE', icon: '🇧🇷' },
      { name: 'Campeonato do Interior Gaúcho (16x)', year: 'Orgulho da Serra Gaúcha', badge: 'HISTÓRICO OFICIAL DO JUVENTUDE', icon: '🥇' }
    ],
    'chapecoense': [
      { name: 'CONMEBOL Copa Sul-Americana', year: '2016 (Eternos Campeões)', badge: 'HISTÓRICO OFICIAL DA CHAPECOENSE', icon: '🌎' },
      { name: 'Campeonato Brasileiro Série B', year: '2020 (Campeã Nacional)', badge: 'HISTÓRICO OFICIAL DA CHAPECOENSE', icon: '🇧🇷' },
      { name: 'Campeonato Catarinense (7x)', year: '1977, 1996, 2007, 2011, 2016, 2017, 2020', badge: 'HISTÓRICO OFICIAL DA CHAPECOENSE', icon: '🥇' }
    ],
    'criciuma': [
      { name: 'Copa do Brasil', year: '1991 (Campeão Invicto)', badge: 'HISTÓRICO OFICIAL DO CRICIÚMA', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série B', year: '2002', badge: 'HISTÓRICO OFICIAL DO CRICIÚMA', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série C', year: '2006', badge: 'HISTÓRICO OFICIAL DO CRICIÚMA', icon: '🏅' },
      { name: 'Campeonato Catarinense (12x)', year: 'Tigre Tricolor', badge: 'HISTÓRICO OFICIAL DO CRICIÚMA', icon: '🥇' }
    ],
    'goias': [
      { name: 'Copa Verde', year: '2023', badge: 'HISTÓRICO OFICIAL DO GOIÁS', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série B (2x)', year: '1999 e 2012', badge: 'HISTÓRICO OFICIAL DO GOIÁS', icon: '🇧🇷' },
      { name: 'Copa Centro-Oeste (3x)', year: '2000, 2001 e 2002', badge: 'HISTÓRICO OFICIAL DO GOIÁS', icon: '✨' },
      { name: 'Campeonato Goiano (28x)', year: 'Maior Campeão de Goiás', badge: 'HISTÓRICO OFICIAL DO GOIÁS', icon: '🥇' }
    ],
    'atletico-go': [
      { name: 'Campeonato Brasileiro Série B', year: '2016', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-GO', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série C (2x)', year: '1990 e 2008', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-GO', icon: '🏆' },
      { name: 'Torneio da Integração Nacional', year: '1971', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-GO', icon: '✨' },
      { name: 'Campeonato Goiano (18x)', year: 'Dragão Campineiro', badge: 'HISTÓRICO OFICIAL DO ATLÉTICO-GO', icon: '🥇' }
    ],
    'vila nova': [
      { name: 'Campeonato Brasileiro Série C (3x)', year: '1996, 2015 e 2020 (Maior Campeão)', badge: 'HISTÓRICO OFICIAL DO VILA NOVA', icon: '🇧🇷' },
      { name: 'Campeonato Goiano (15x)', year: 'Tigre Colorido', badge: 'HISTÓRICO OFICIAL DO VILA NOVA', icon: '🥇' }
    ],
    'america-mg': [
      { name: 'Campeonato Brasileiro Série B (2x)', year: '1997 e 2017', badge: 'HISTÓRICO OFICIAL DO AMÉRICA-MG', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série C', year: '2009', badge: 'HISTÓRICO OFICIAL DO AMÉRICA-MG', icon: '🏅' },
      { name: 'Copa Sul-Minas', year: '2000', badge: 'HISTÓRICO OFICIAL DO AMÉRICA-MG', icon: '🏆' },
      { name: 'Campeonato Mineiro (16x)', year: 'Decacampeão 1916-1925 · Coelho', badge: 'HISTÓRICO OFICIAL DO AMÉRICA-MG', icon: '🥇' }
    ],
    'avai': [
      { name: 'Campeonato Brasileiro Série C', year: '1998', badge: 'HISTÓRICO OFICIAL DO AVAÍ', icon: '🇧🇷' },
      { name: 'Campeonato Catarinense (18x)', year: 'Leão da Ilha', badge: 'HISTÓRICO OFICIAL DO AVAÍ', icon: '🥇' }
    ],
    'figueirense': [
      { name: 'Campeonato Catarinense (18x)', year: 'Furacão do Estreito', badge: 'HISTÓRICO OFICIAL DO FIGUEIRENSE', icon: '🥇' },
      { name: 'Torneio Mercosul', year: '1995', badge: 'HISTÓRICO OFICIAL DO FIGUEIRENSE', icon: '🌎' }
    ],
    'paysandu': [
      { name: 'Copa dos Campeões da CBF', year: '2002 (Vaga na Libertadores)', badge: 'HISTÓRICO OFICIAL DO PAYSANDU', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série B (2x)', year: '1991 e 2001', badge: 'HISTÓRICO OFICIAL DO PAYSANDU', icon: '🇧🇷' },
      { name: 'Copa Verde (4x)', year: '2016, 2018, 2022 e 2024 (Maior Campeão)', badge: 'HISTÓRICO OFICIAL DO PAYSANDU', icon: '✨' },
      { name: 'Copa Norte', year: '2002', badge: 'HISTÓRICO OFICIAL DO PAYSANDU', icon: '⚡' },
      { name: 'Campeonato Paraense (50x)', year: 'Maior Campeão da Amazônia · Papão', badge: 'HISTÓRICO OFICIAL DO PAYSANDU', icon: '🥇' }
    ],
    'remo': [
      { name: 'Copa Verde', year: '2021', badge: 'HISTÓRICO OFICIAL DO REMO', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série C', year: '2005', badge: 'HISTÓRICO OFICIAL DO REMO', icon: '🇧🇷' },
      { name: 'Torneio Norte-Nordeste (3x)', year: '1968, 1969 e 1971', badge: 'HISTÓRICO OFICIAL DO REMO', icon: '✨' },
      { name: 'Campeonato Paraense (47x)', year: 'Leão Azul Paraense', badge: 'HISTÓRICO OFICIAL DO REMO', icon: '🥇' }
    ],
    'santa cruz': [
      { name: 'Copa do Nordeste', year: '2016', badge: 'HISTÓRICO OFICIAL DO SANTA CRUZ', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série C', year: '2013', badge: 'HISTÓRICO OFICIAL DO SANTA CRUZ', icon: '🇧🇷' },
      { name: 'Campeonato Pernambucano (29x)', year: 'Cobra Coral do Arruda', badge: 'HISTÓRICO OFICIAL DO SANTA CRUZ', icon: '🥇' }
    ],
    'nautico': [
      { name: 'Campeonato Brasileiro Série C', year: '2019', badge: 'HISTÓRICO OFICIAL DO NÁUTICO', icon: '🇧🇷' },
      { name: 'Copa dos Campeões do Norte', year: '1966', badge: 'HISTÓRICO OFICIAL DO NÁUTICO', icon: '🏆' },
      { name: 'Campeonato Pernambucano (24x)', year: 'Hexacampeão 1963-1968 · Timbu', badge: 'HISTÓRICO OFICIAL DO NÁUTICO', icon: '🥇' }
    ],
    'guarani': [
      { name: 'Campeonato Brasileiro Série A', year: '1978 (Único Campeão Brasileiro do Interior)', badge: 'HISTÓRICO OFICIAL DO GUARANI', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série B', year: '1981 (Taça de Prata)', badge: 'HISTÓRICO OFICIAL DO GUARANI', icon: '🏆' },
      { name: 'Campeonato Paulista Série A2 (2x)', year: '1949 e 2018', badge: 'HISTÓRICO OFICIAL DO GUARANI', icon: '🥇' }
    ],
    'ponte preta': [
      { name: 'Campeonato Paulista do Interior (7x)', year: '1927, 1951, 2009, 2013, 2015, 2018, 2020', badge: 'HISTÓRICO OFICIAL DA PONTE PRETA', icon: '🥇' },
      { name: 'Campeonato Paulista Série A2 (4x)', year: '1969, 2023 · Macaca Centenária', badge: 'HISTÓRICO OFICIAL DA PONTE PRETA', icon: '🏆' },
      { name: 'Finalista da Copa Sul-Americana', year: '2013', badge: 'CAMPANHA INTERNACIONAL', icon: '🌎' }
    ],
    'cuiaba': [
      { name: 'Copa Verde (2x)', year: '2015 e 2019', badge: 'HISTÓRICO OFICIAL DO CUIABÁ', icon: '🏆' },
      { name: 'Campeonato Mato-Grossense (13x)', year: 'Dourado do Pantanal', badge: 'HISTÓRICO OFICIAL DO CUIABÁ', icon: '🥇' }
    ],
    'operario': [
      { name: 'Campeonato Brasileiro Série C', year: '2018', badge: 'HISTÓRICO OFICIAL DO OPERÁRIO-PR', icon: '🇧🇷' },
      { name: 'Campeonato Brasileiro Série D', year: '2017', badge: 'HISTÓRICO OFICIAL DO OPERÁRIO-PR', icon: '🏅' },
      { name: 'Campeonato Paranaense (2x)', year: '2015 e 2025 · Fantasma de Vila Oficinas', badge: 'HISTÓRICO OFICIAL DO OPERÁRIO-PR', icon: '🥇' }
    ],
    'real madrid': [
      { name: 'UEFA Champions League (15x)', year: 'Maior Campeão Europeu', badge: 'HISTÓRICO OFICIAL DO REAL MADRID', icon: '🏆' },
      { name: 'Mundial de Clubes / Intercontinental (9x)', year: 'Maior Campeão Mundial', badge: 'HISTÓRICO OFICIAL DO REAL MADRID', icon: '🌎' },
      { name: 'LaLiga Espanhola (36x)', year: 'Maior Campeão da Espanha', badge: 'HISTÓRICO OFICIAL DO REAL MADRID', icon: '🥇' }
    ],
    'barcelona': [
      { name: 'UEFA Champions League (5x)', year: '1992, 2006, 2009, 2011 e 2015', badge: 'HISTÓRICO OFICIAL DO BARCELONA', icon: '🏆' },
      { name: 'Mundial de Clubes da FIFA (3x)', year: '2009, 2011 e 2015', badge: 'HISTÓRICO OFICIAL DO BARCELONA', icon: '🌎' },
      { name: 'LaLiga Espanhola (27x)', year: 'Orgulho da Catalunha', badge: 'HISTÓRICO OFICIAL DO BARCELONA', icon: '🥇' }
    ],
    'manchester city': [
      { name: 'UEFA Champions League', year: '2023 (Tríplice Coroa)', badge: 'HISTÓRICO OFICIAL DO MAN CITY', icon: '🏆' },
      { name: 'Mundial de Clubes da FIFA', year: '2023', badge: 'HISTÓRICO OFICIAL DO MAN CITY', icon: '🌎' },
      { name: 'Premier League Inglesa (10x)', year: 'Tetracampeão Consecutivo 2021-2024', badge: 'HISTÓRICO OFICIAL DO MAN CITY', icon: '🥇' }
    ],
    'boca juniors': [
      { name: 'CONMEBOL Libertadores (6x)', year: '1977, 1978, 2000, 2001, 2003 e 2007', badge: 'HISTÓRICO OFICIAL DO BOCA JUNIORS', icon: '🏆' },
      { name: 'Mundial Interclubes (3x)', year: '1977, 2000 e 2003', badge: 'HISTÓRICO OFICIAL DO BOCA JUNIORS', icon: '🌎' },
      { name: 'Campeonato Argentino (35x)', year: 'Xeneize · La Bombonera', badge: 'HISTÓRICO OFICIAL DO BOCA JUNIORS', icon: '🥇' }
    ],
    'river plate': [
      { name: 'CONMEBOL Libertadores (4x)', year: '1986, 1996, 2015 e 2018', badge: 'HISTÓRICO OFICIAL DO RIVER PLATE', icon: '🏆' },
      { name: 'Mundial Interclubes', year: '1986', badge: 'HISTÓRICO OFICIAL DO RIVER PLATE', icon: '🌎' },
      { name: 'Campeonato Argentino (38x)', year: 'Maior Campeão Argentino · Millonarios', badge: 'HISTÓRICO OFICIAL DO RIVER PLATE', icon: '🥇' }
    ]
  };

  // ==========================================================================
  // DIREITOS DE TRANSMISSÃO: CONTRATO ANUAL DIVIDIDO POR MÊS + ADIANTAMENTO
  // ==========================================================================
  const TV_RIGHTS_ANNUAL_COMPANIES = [
    {
      id: 'grupo_globo_libra',
      name: 'Grupo Globo (Bloco LIBRA)',
      channels: 'TV Globo (Aberta) · SporTV · Premiere · Globoplay',
      desc: 'Exclusividade total do bloco Libra para TV aberta, fechada, streaming e PPV.',
      annualFactor: 1.35,
      advanceFeePct: 5,
      fanBoost: '+10% Alcance Nacional'
    },
    {
      id: 'amazon_prime_lfu',
      name: 'Amazon Prime Video (Bloco LFU)',
      channels: 'Amazon Prime Video (Streaming Exclusivo · 1 Jogo/Rodada)',
      desc: 'Direitos exclusivos de 1 grande jogo por rodada dos clubes da Liga Forte União.',
      annualFactor: 1.25,
      advanceFeePct: 4,
      fanBoost: '+12% Receita Digital'
    },
    {
      id: 'record_youtube_lfu',
      name: 'TV Record & Google (YouTube / LFU)',
      channels: 'TV Record (Aberta) · Portal R7 / PlayPlus · YouTube',
      desc: 'Exibição simultânea na TV aberta, R7/PlayPlus e YouTube (CazéTV) para clubes da LFU.',
      annualFactor: 1.22,
      advanceFeePct: 4,
      fanBoost: '+18% Engajamento & Patrocínios'
    },
    {
      id: '1190_sports_fanatiz',
      name: '1190 Sports & Fanatiz (Internacional)',
      channels: 'Fanatiz & Emissoras Globais (+130 Países)',
      desc: 'Gestora internacional (exceto jogos do Flamengo como mandante) em mais de 130 países.',
      annualFactor: 0.85,
      advanceFeePct: 3,
      fanBoost: '+15 Prestígio Internacional'
    }
  ];

  // ==========================================================================
  // PATROCINADORES INICIAIS DOS CLUBES (NENHUM TIME COMEÇA SEM PATROCÍNIO!)
  // ==========================================================================
  const DEFAULT_INITIAL_SPONSORS = [
    { slot: 'PATROCINADOR MASTER (PEITO)', name: 'Betano / Esportes da Sorte', baseMonthly: 1850000, winBonus: 240000, duration: 'Contrato 2 anos', color: '#f59e0b' },
    { slot: 'MANGAS DA CAMISA', name: 'BYD Auto Brasil', baseMonthly: 720000, winBonus: 95000, duration: 'Contrato 2 anos', color: '#10b981' },
    { slot: 'COSTAS / OMOPLATA', name: 'Banco Itaú / Brahma', baseMonthly: 980000, winBonus: 130000, duration: 'Contrato 3 anos', color: '#38bdf8' }
  ];

  // ==========================================================================
  // GRUPOS E CHAVEAMENTO OFICIAL DA CONMEBOL LIBERTADORES 2026
  // ==========================================================================
  const LIBERTADORES_GROUPS_2026 = [
    { group: 'GRUPO A', teams: [
      { name: 'Botafogo', country: 'BRA', pts: 13, j: 6, v: 4, e: 1, d: 1, sg: '+6' },
      { name: 'Estudiantes', country: 'ARG', pts: 11, j: 6, v: 3, e: 2, d: 1, sg: '+4' },
      { name: 'Universitario', country: 'PER', pts: 6, j: 6, v: 2, e: 0, d: 4, sg: '-3' },
      { name: 'Carabobo', country: 'VEN', pts: 3, j: 6, v: 1, e: 0, d: 5, sg: '-7' }
    ]},
    { group: 'GRUPO B', teams: [
      { name: 'River Plate', country: 'ARG', pts: 14, j: 6, v: 4, e: 2, d: 0, sg: '+8' },
      { name: 'Universidad Católica', country: 'CHI', pts: 10, j: 6, v: 3, e: 1, d: 2, sg: '+2' },
      { name: 'Independiente del Valle', country: 'ECU', pts: 7, j: 6, v: 2, e: 1, d: 3, sg: '-1' },
      { name: 'The Strongest', country: 'BOL', pts: 2, j: 6, v: 0, e: 2, d: 4, sg: '-9' }
    ]},
    { group: 'GRUPO C', teams: [
      { name: 'Corinthians', country: 'BRA', pts: 14, j: 6, v: 4, e: 2, d: 0, sg: '+7' },
      { name: 'Rosario Central', country: 'ARG', pts: 10, j: 6, v: 3, e: 1, d: 2, sg: '+3' },
      { name: 'Nacional', country: 'URU', pts: 7, j: 6, v: 2, e: 1, d: 3, sg: '-2' },
      { name: 'Libertad', country: 'PAR', pts: 2, j: 6, v: 0, e: 2, d: 4, sg: '-8' }
    ]},
    { group: 'GRUPO D', teams: [
      { name: 'Flamengo', country: 'BRA', pts: 15, j: 6, v: 5, e: 0, d: 1, sg: '+9' },
      { name: 'Cruzeiro', country: 'BRA', pts: 11, j: 6, v: 3, e: 2, d: 1, sg: '+4' },
      { name: 'Independiente Medellín', country: 'COL', pts: 6, j: 6, v: 2, e: 0, d: 4, sg: '-4' },
      { name: 'Deportivo Táchira', country: 'VEN', pts: 3, j: 6, v: 1, e: 0, d: 5, sg: '-9' }
    ]},
    { group: 'GRUPO E', teams: [
      { name: 'Racing Club', country: 'ARG', pts: 13, j: 6, v: 4, e: 1, d: 1, sg: '+6' },
      { name: 'Deportes Tolima', country: 'COL', pts: 10, j: 6, v: 3, e: 1, d: 2, sg: '+2' },
      { name: 'Sporting Cristal', country: 'PER', pts: 7, j: 6, v: 2, e: 1, d: 3, sg: '-3' },
      { name: 'Bolívar', country: 'BOL', pts: 4, j: 6, v: 1, e: 1, d: 4, sg: '-5' }
    ]},
    { group: 'GRUPO F', teams: [
      { name: 'LDU Quito', country: 'ECU', pts: 13, j: 6, v: 4, e: 1, d: 1, sg: '+5' },
      { name: 'Mirassol', country: 'BRA', pts: 10, j: 6, v: 3, e: 1, d: 2, sg: '+2' },
      { name: 'Peñarol', country: 'URU', pts: 8, j: 6, v: 2, e: 2, d: 2, sg: '0' },
      { name: 'Olimpia', country: 'PAR', pts: 2, j: 6, v: 0, e: 2, d: 4, sg: '-7' }
    ]},
    { group: 'GRUPO G', teams: [
      { name: 'Palmeiras', country: 'BRA', pts: 16, j: 6, v: 5, e: 1, d: 0, sg: '+11' },
      { name: 'Cerro Porteño', country: 'PAR', pts: 10, j: 6, v: 3, e: 1, d: 2, sg: '+2' },
      { name: 'Colo-Colo', country: 'CHI', pts: 6, j: 6, v: 2, e: 0, d: 4, sg: '-4' },
      { name: 'Alianza Lima', country: 'PER', pts: 2, j: 6, v: 0, e: 2, d: 4, sg: '-9' }
    ]},
    { group: 'GRUPO H', teams: [
      { name: 'Fluminense', country: 'BRA', pts: 14, j: 6, v: 4, e: 2, d: 0, sg: '+7' },
      { name: 'Platense', country: 'ARG', pts: 10, j: 6, v: 3, e: 1, d: 2, sg: '+2' },
      { name: 'Coquimbo Unido', country: 'CHI', pts: 6, j: 6, v: 2, e: 0, d: 4, sg: '-3' },
      { name: 'Independiente Rivadavia', country: 'ARG', pts: 3, j: 6, v: 1, e: 0, d: 5, sg: '-6' }
    ]}
  ];

  const LIBERTADORES_BRACKET_2026 = {
    left: {
      oitavas: [
        { home: 'Estudiantes', away: 'U. Católica', scoreH: 2, scoreA: 1, winner: 'Estudiantes' },
        { home: 'Rosario Central', away: 'Corinthians', scoreH: 1, scoreA: 3, winner: 'Corinthians' },
        { home: 'Cruzeiro', away: 'Flamengo', scoreH: 1, scoreA: 2, winner: 'Flamengo' },
        { home: 'Tolima', away: 'Racing Club', scoreH: 1, scoreA: 2, winner: 'Racing Club' }
      ],
      quartas: [
        { home: 'Estudiantes', away: 'Corinthians', scoreH: null, scoreA: null, winner: 'A Definir' },
        { home: 'Flamengo', away: 'Racing Club', scoreH: null, scoreA: null, winner: 'A Definir' }
      ],
      semi: { home: 'Vencedor Q1', away: 'Vencedor Q2', scoreH: null, scoreA: null }
    },
    right: {
      oitavas: [
        { home: 'Mirassol', away: 'LDU Quito', scoreH: 1, scoreA: 2, winner: 'LDU Quito' },
        { home: 'Palmeiras', away: 'Cerro Porteño', scoreH: 3, scoreA: 0, winner: 'Palmeiras' },
        { home: 'Platense', away: 'Coquimbo Unido', scoreH: 2, scoreA: 0, winner: 'Platense' },
        { home: 'Fluminense', away: 'Ind. Rivadavia', scoreH: 2, scoreA: 0, winner: 'Fluminense' }
      ],
      quartas: [
        { home: 'LDU Quito', away: 'Palmeiras', scoreH: null, scoreA: null, winner: 'A Definir' },
        { home: 'Platense', away: 'Fluminense', scoreH: null, scoreA: null, winner: 'A Definir' }
      ],
      semi: { home: 'Vencedor Q3', away: 'Vencedor Q4', scoreH: null, scoreA: null }
    },
    final: { home: 'Finalista Chave A', away: 'Finalista Chave B', date: '28/11/2026 · Jogo Único' }
  };

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function getActiveClubName(state) {
    const sideClubEl = document.querySelector('#app aside h2, #app aside h3, .sidebar-club-name');
    if (sideClubEl && sideClubEl.textContent && sideClubEl.textContent.trim().length > 1) {
      return sideClubEl.textContent.trim();
    }
    if (state?.clubName) return state.clubName;
    if (state?.club && typeof state.club === 'object' && state.club.name) return state.club.name;
    if (typeof state?.club === 'string' && state.club) return state.club;
    if (state?.userTeam?.name) return state.userTeam.name;
    return 'Corinthians';
  }

  function getClubOwnHistoricalTrophies(clubName, state) {
    if (state?.customClub?.isCustom || state?.customClubStateCompId) return [];
    const key = norm(clubName);
    if (REAL_CLUB_TROPHIES_DB[key]) return REAL_CLUB_TROPHIES_DB[key];
    const dbKeys = Object.keys(REAL_CLUB_TROPHIES_DB);
    for (let i = 0; i < dbKeys.length; i++) {
      const k = dbKeys[i];
      if (key.includes(k) || k.includes(key)) return REAL_CLUB_TROPHIES_DB[k];
    }
    const upperClub = clubName.toUpperCase();
    return [
      { name: 'Campeonato Estadual / Regional (' + clubName + ')', year: 'Conquistas Históricas Oficiais', badge: 'HISTÓRICO OFICIAL DO ' + upperClub, icon: '🥇' },
      { name: 'Taça de Tradição & Acesso Nacional (' + clubName + ')', year: 'Acervo Oficial Reconhecido', badge: 'HISTÓRICO OFICIAL DO ' + upperClub, icon: '🏆' },
      { name: 'Torneio Regional & Copa Estadual', year: 'Galeria Histórica de Troféus', badge: 'HISTÓRICO OFICIAL DO ' + upperClub, icon: '🎖️' }
    ];
  }

  function getClubTitlesWonInSave(clubName, state) {
    if (!state) return [];
    if (typeof window !== 'undefined' && typeof window.syncAllTrophiesToMuseum === 'function') {
      window.syncAllTrophiesToMuseum(state);
    } else if (typeof syncAllTrophiesToMuseum === 'function') {
      syncAllTrophiesToMuseum(state);
    }

    const clubKey = norm(clubName);
    const wonList = [];
    const seen = new Set();

    const isUserClub = targetName => {
      if (!targetName) return true;
      const tNorm = norm(targetName);
      if (tNorm === clubKey) return true;
      if (state.club && tNorm === norm(state.club)) return true;
      if (state.customClub?.name && tNorm === norm(state.customClub.name)) return true;
      if (state.customClub?.shortName && tNorm === norm(state.customClub.shortName)) return true;
      const strip = str => norm(str).replace(/\b(fc|f\.c\.|ec|e\.c\.|sc|s\.c\.|saf|ltda)\b/g, '').trim();
      if (strip(targetName) && (strip(targetName) === strip(clubName) || (state.club && strip(targetName) === strip(state.club)))) return true;
      return false;
    };

    function addTitle(name, year, badge, icon = '🏆') {
      if (!name) return;
      const cleanName = String(name).trim();
      const cleanYear = year ? String(year).trim() : (state.season ? `Temporada ${state.season}` : 'No Save');
      const uniqueKey = `${norm(cleanName)}_${norm(cleanYear)}`;
      if (seen.has(uniqueKey)) return;
      seen.add(uniqueKey);
      wonList.push({
        name: cleanName,
        year: cleanYear,
        badge: badge || 'CAMPEÃO NO SAVE',
        icon: icon || '🏆',
        club: clubName
      });
    }

    // 1. state.titles (Principal array de títulos conquistados pelo treinador no save)
    if (Array.isArray(state.titles)) {
      state.titles.forEach((t) => {
        if (!t) return;
        if (typeof t === 'string') {
          addTitle(t, state.season ? `Temporada ${state.season}` : 'No Save', 'CAMPEÃO NO SAVE', '🏆');
        } else if (typeof t === 'object') {
          if (!t.club || isUserClub(t.club)) {
            addTitle(t.name || t.title, t.year ? (String(t.year).includes('Temporada') ? t.year : `Temporada ${t.year}`) : (state.season ? `Temporada ${state.season}` : 'No Save'), t.badge || 'CAMPEÃO NO SAVE', t.icon || '🏆');
          }
        }
      });
    }

    // 2. state.seasonHistory (Temporadas concluídas pelo treinador no save)
    if (Array.isArray(state.seasonHistory)) {
      state.seasonHistory.forEach((sh) => {
        if (!sh) return;
        const isThisClub = isUserClub(sh.userClub || sh.club || state.club);
        if (isThisClub) {
          if (sh.champion && isUserClub(sh.champion)) {
            addTitle(sh.compName || 'Campeonato', `Temporada ${sh.season}`, 'CAMPEÃO DA TEMPORADA', '🥇');
          }
          if (Array.isArray(sh.titlesWon)) {
            sh.titlesWon.forEach((tw) => {
              addTitle(typeof tw === 'string' ? tw : (tw?.name || tw?.title), `Temporada ${sh.season}`, 'CONQUISTA NO SAVE', '🏆');
            });
          }
        }
      });
    }

    // 3. Campeões do mundo e histórico anual (state.worldChampionHistory / state.campeoesDoMundoSave / state.historicoCarreira)
    const worldHist = [...(state.worldChampionHistory || []), ...(state.campeoesDoMundoSave || []), ...(state.historicoCarreira || [])];
    worldHist.forEach(record => {
      if(!record) return;
      const year = record.season ? `Temporada ${record.season}` : (state.season ? `Temporada ${state.season}` : 'No Save');
      (Array.isArray(record.competitions) ? record.competitions : []).forEach(c => {
        if(isUserClub(c?.champion || c?.winner)){
          addTitle(c.name || c.id, year, 'CAMPEÃO DO TORNEIO', '🏆');
        }
      });
      (Array.isArray(record.titlesWon) ? record.titlesWon : []).forEach(tw => {
        const tName = typeof tw === 'string' ? tw : (tw?.name || tw?.title);
        addTitle(tName, year, 'CONQUISTA NO SAVE', '🏆');
      });
    });

    // 4. Histórico geral de competições (state.competitionHistory)
    (Array.isArray(state.competitionHistory) ? state.competitionHistory : []).forEach(ch => {
      if(!ch) return;
      const year = ch.season ? `Temporada ${ch.season}` : (state.season ? `Temporada ${state.season}` : 'No Save');
      if(isUserClub(ch.champion || ch.winner)){
        const compObj = typeof compById === 'function' ? compById(ch.competitionId) : null;
        addTitle(ch.name || compObj?.name || ch.competitionId, year, 'CAMPEÃO DO TORNEIO', '🏆');
      }
      const rank = Array.isArray(ch.ranking) ? ch.ranking : [];
      if(rank.length && isUserClub(typeof rank[0] === 'string' ? rank[0] : rank[0]?.name)){
        const compObj = typeof compById === 'function' ? compById(ch.competitionId) : null;
        addTitle(compObj?.name || ch.competitionName || ch.competitionId, year, 'CAMPEÃO DA EDIÇÃO', '🏆');
      }
    });

    // 5. Arquivo de Estaduais (state.estadualArchive)
    if(state.estadualArchive && typeof state.estadualArchive === 'object'){
      Object.entries(state.estadualArchive).forEach(([cId, archives]) => {
        (Array.isArray(archives) ? archives : [archives]).forEach(arch => {
          if(!arch || !Array.isArray(arch.teams)) return;
          const sorted = arch.teams.slice().sort((a,b) => (Number(b.p ?? b.points)||0)-(Number(a.p ?? a.points)||0) || ((Number(b.gp)||0)-(Number(b.gc)||0))-((Number(a.gp)||0)-(Number(a.gc)||0)));
          if(sorted.length && isUserClub(sorted[0]?.name) && Number(sorted[0]?.j || 0) > 0){
            const compName = arch.name || (typeof compById === 'function' ? compById(cId)?.name : null) || 'Campeonato Estadual';
            addTitle(compName, arch.season ? `Temporada ${arch.season}` : 'Temporada 2026', 'CAMPEÃO ESTADUAL', '🏆');
          }
        });
      });
    }

    // 6. Torneios continentais e copas no save (state.tournaments)
    if (state.tournaments && typeof state.tournaments === 'object') {
      Object.entries(state.tournaments).forEach(([tId, tourney]) => {
        if (!tourney) return;
        const champ = tourney.champion || tourney.winner;
        if (champ && isUserClub(champ)) {
          const tName = tourney.name || (typeof compById === 'function' && compById(tId)?.name) || tId;
          addTitle(tName, tourney.season ? `Temporada ${tourney.season}` : (state.season ? `Temporada ${state.season}` : 'No Save'), 'CAMPEÃO DO TORNEIO', '🏆');
        }
      });
    }

    // 7. Copa do Brasil no save
    const cdb = (typeof getCopaDoBrasilState === 'function') ? getCopaDoBrasilState() : state.copaDoBrasil;
    if (cdb && cdb.champion && isUserClub(cdb.champion)) {
      addTitle('Copa do Brasil', state.season ? `Temporada ${state.season}` : 'No Save', 'CAMPEÃO DA COPA', '🏆');
    }

    // 8. Copinha Sub-20 no save
    if (state.copinhaSub20 && state.copinhaSub20.champion && isUserClub(state.copinhaSub20.champion)) {
      addTitle('Copa São Paulo de Juniores (Sub-20)', state.season ? `Temporada ${state.season}` : 'No Save', 'CAMPEÃO DA BASE', '🌟');
    }

    // 9. managerPersonal.trophies ou state.trophies (filtrando rigorosamente apenas títulos no save)
    const personal = state.managerPersonal?.trophies || state.trophies;
    if (Array.isArray(personal)) {
      personal.forEach((pt) => {
        if (!pt) return;
        const isHistoricalYear = typeof pt.year === 'string' && /^(19\d\d|200\d|201\d|202[0-5])\b/.test(pt.year);
        if (isHistoricalYear) return;
        if (!pt.club || isUserClub(pt.club)) {
          addTitle(pt.name || pt.title, pt.year, pt.badge, pt.icon);
        }
      });
    }

    return wonList;
  }

  function getTrophiesHtmlBlock(state) {
    const clubName = getActiveClubName(state);
    const upperClub = clubName.toUpperCase();
    const clubHistorical = getClubOwnHistoricalTrophies(clubName, state);
    const coachWonHere = getClubTitlesWonInSave(clubName, state);

    const managerName = (state?.managerPersonal?.name || state?.manager?.name || state?.manager || 'Aquino').toUpperCase();
    const currentSeason = state?.season || 2026;
    const isNewCustomClub = Boolean(state?.customClub?.isCustom || state?.customClubStateCompId);

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <div style="font-size:12px;color:#94a3b8;">
          ${isNewCustomClub ? `Acervo do clube criado pelo usuário (${clubHistorical.length} títulos históricos)` : `Acervo Histórico Real do <strong>${clubName}</strong> (${clubHistorical.length} marcos históricos)`} + Conquistas no Comando (${coachWonHere.length} títulos no save)
        </div>
        <span style="background:#eab308;color:#090d16;font-weight:900;font-size:11px;padding:6px 12px;border-radius:8px;">
          🏆 ${isNewCustomClub ? 'Acervo do Clube' : 'Acervo Oficial Sincronizado'} (${clubHistorical.length + coachWonHere.length})
        </span>
      </div>
      <div style="font-size:11px;font-weight:800;color:#fbbf24;margin-bottom:10px;letter-spacing:0.5px;">🏛️ ${isNewCustomClub ? 'HISTÓRICO DO CLUBE' : `TÍTULOS HISTÓRICOS REAIS DO ${upperClub}`}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:10px;margin-bottom:18px;">
        ${clubHistorical.length ? clubHistorical.map((t) => `
          <div style="background:#16192b;border:1px solid #854d0e;border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:24px;margin-bottom:4px;">${t.icon}</div>
            <div style="font-size:12px;font-weight:800;color:#fff;">${t.name}</div>
            <div style="font-size:11px;color:#cbd5e1;margin-top:3px;">(${t.year})</div>
            <div style="font-size:9px;color:#f59e0b;font-weight:800;margin-top:6px;">${t.badge}</div>
          </div>
        `).join('') : `<div style="grid-column:1/-1;background:#16192b;border:1px dashed #475569;border-radius:10px;padding:14px;text-align:center;color:#94a3b8;font-size:12px;">${isNewCustomClub ? 'Clube recém-criado: ainda não possui títulos históricos. As taças serão conquistadas nesta carreira.' : 'Nenhum título histórico cadastrado para este clube.'}</div>`}
      </div>
      <div style="font-size:11px;font-weight:800;color:#a78bfa;margin-bottom:10px;letter-spacing:0.5px;">
        👑 TÍTULOS CONQUISTADOS NO COMANDO DO ${upperClub} (NO SAVE) ${coachWonHere.length > 0 ? `(${coachWonHere.length})` : ''}
      </div>
      <div class="coach-trophies-container" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:10px;">
        ${coachWonHere.length > 0 ? coachWonHere.map((t) => `
          <div style="background:#1e1b4b;border:1px solid #7c3aed;border-radius:10px;padding:12px;text-align:center;box-shadow:0 4px 14px rgba(124,58,237,0.25);">
            <div style="font-size:24px;margin-bottom:4px;">${t.icon || '🏆'}</div>
            <div style="font-size:12px;font-weight:800;color:#fff;">${t.name || t.title}</div>
            <div style="font-size:11px;color:#c4b5fd;margin-top:3px;">(${t.year || 'No Save'})</div>
            <div style="font-size:9px;color:#34d399;font-weight:800;margin-top:6px;">${t.badge || 'CONQUISTA NO SAVE'}</div>
          </div>
        `).join('') : `
          <div style="background:#1e1b4b;border:1px dashed #7c3aed;border-radius:12px;padding:18px;text-align:center;grid-column:1/-1;">
            <div style="font-size:28px;margin-bottom:6px;">🎯</div>
            <div style="font-size:13px;font-weight:900;color:#fff;">Em busca da 1ª Taça no Comando do ${clubName}</div>
            <div style="font-size:11px;color:#c4b5fd;margin-top:4px;">Temporada ${currentSeason} • Comando Téc. ${managerName}</div>
            <div style="font-size:10px;color:#a78bfa;font-weight:700;margin-top:6px;">Nenhum título conquistado ainda no save. Dispute campeonatos e copas para erguer troféus na sua carreira!</div>
          </div>
        `}
      </div>
    `;
  }

  function openMuseumModal(state) {
    const old = document.getElementById('afm-museum-modal');
    if (old) old.remove();
    const clubName = getActiveClubName(state);
    const modal = document.createElement('div');
    modal.id = 'afm-museum-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,17,0.88);backdrop-filter:blur(5px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif;color:#fff;';
    modal.innerHTML = `
      <div style="background:#0f172a;border:1px solid #eab308;border-radius:18px;max-width:920px;width:100%;max-height:88vh;overflow-y:auto;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,0.85);">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e293b;padding-bottom:14px;margin-bottom:16px;">
          <div>
            <div style="font-size:11px;font-weight:800;color:#fbbf24;">GALERIA HISTÓRICA & SALA DE TROFÉUS EXCLUSIVA</div>
            <h2 style="margin:4px 0 0;font-size:20px;font-weight:900;color:#fff;">🏛️ Museu Oficial do ${clubName}</h2>
          </div>
          <button id="close-museum-modal" type="button" style="background:#1e293b;color:#fff;border:1px solid #475569;padding:8px 16px;border-radius:10px;font-weight:800;cursor:pointer;">✕ Fechar</button>
        </div>
        ${getTrophiesHtmlBlock(state)}
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#close-museum-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  }

  const TrophiesTvMarketingPayroll = {
    // ------------------------------------------------------------------------
    // 1. BOTÃO DO MUSEU EM "Museu do clube" + ESTANTE PRÓPRIA
    // ------------------------------------------------------------------------
    setupMuseumButtonAndBottomCabinet(state) {
      const app = document.getElementById('app');
      if (!app) return;

      const clubName = getActiveClubName(state);
      const clubKey = norm(clubName);

      // A) Procura qualquer card de Estrutura que tenha o texto "Museu do clube" e um botão "Evoluir"
      const allButtons = app.querySelectorAll('button');
      for (let i = 0; i < allButtons.length; i++) {
        const b = allButtons[i];
        const bTxt = (b.textContent || '').trim();
        if (bTxt.startsWith('Evoluir')) {
          const card = b.closest('div[style*="border"], .card, section') || b.parentElement;
          if (card && card.id !== 'app' && (card.textContent || '').includes('Museu do clube')) {
            if (!card.querySelector('#btn-go-to-museum')) {
              const btn = document.createElement('button');
              btn.id = 'btn-go-to-museum';
              btn.type = 'button';
              btn.innerHTML = '🏛️ Abrir Museu do ' + clubName;
              btn.style.cssText = 'margin:10px 0 8px 0;width:100%;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:9px 14px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 12px rgba(16,185,129,0.35);';
              btn.onclick = (e) => {
                e.stopPropagation();
                const tabBtn = Array.from(app.querySelectorAll('button')).find((x) => (x.textContent || '').includes('MUSEU DO CLUBE'));
                if (tabBtn) {
                  tabBtn.click();
                  setTimeout(() => TrophiesTvMarketingPayroll.setupMuseumButtonAndBottomCabinet(state), 30);
                } else {
                  openMuseumModal(state);
                }
              };
              b.parentElement.insertBefore(btn, b);
            }
          }
        }
      }

      // B) Se estiver na sub-aba "🏆 MUSEU DO CLUBE", exibe a galeria histórica e títulos no comando
      const allEls = app.querySelectorAll('h2, h3, h4, div, span');
      for (let i = 0; i < allEls.length; i++) {
        const el = allEls[i];
        const txt = (el.textContent || '').trim();
        if (el.children.length <= 1 && txt.toUpperCase().includes('MUSEU DO CLUBE:')) {
          const parentCard = el.parentElement;
          if (parentCard && parentCard.id !== 'app') {
            let customBox = document.getElementById('afm-club-own-museum-box');
            if (!customBox) {
              customBox = document.createElement('div');
              customBox.id = 'afm-club-own-museum-box';
              customBox.style.cssText = 'margin:14px 0;padding:16px;background:rgba(15,23,42,0.9);border:1px solid rgba(234,179,8,0.35);border-radius:14px;';
              parentCard.appendChild(customBox);
            }
            const wonCount = getClubTitlesWonInSave(clubName, state).length;
            const renderKey = `${clubKey}_${wonCount}_${state?.season || 2026}`;
            if (customBox.dataset.renderKey !== renderKey) {
              customBox.dataset.renderKey = renderKey;
              customBox.innerHTML = getTrophiesHtmlBlock(state);
            }
          }
        }
      }
    },

    // ------------------------------------------------------------------------
    // 2. DIREITOS DE TRANSMISSÃO (ANUAL DIVIDIDO EM 12 MESES + ADIANTAMENTO)
    //    EXATAMENTE DEBAIXO DE "📉 DESPESAS E PARCELAS MENSAIS"
    // ------------------------------------------------------------------------
    injectTvBroadcastBelowExpenses(state) {
      const app = document.getElementById('app');
      if (!app) return;
      if (document.getElementById('cardOfficeTvRights')) {
        const oldBox = document.getElementById('afm-tv-rights-1year-box');
        if (oldBox) oldBox.remove();
        return;
      }

      // Localiza o card de "📉 DESPESAS E PARCELAS MENSAIS" ou o card seguinte "📒 Movimento financeiro da temporada"
      let targetAnchorCard = null;
      let insertMode = 'afterend';

      const allBlocks = app.querySelectorAll('section, div');
      for (let i = 0; i < allBlocks.length; i++) {
        const d = allBlocks[i];
        if (d.id === 'app' || d.id === 'afm-tv-rights-1year-box') continue;
        const txt = (d.textContent || '');
        // Verifica se é o container direto do card "DESPESAS E PARCELAS MENSAIS"
        if (txt.includes('DESPESAS E PARCELAS MENSAIS') && txt.includes('Salários do elenco') && !txt.includes('PREVISÃO DE RECEITAS MENSAIS')) {
          targetAnchorCard = d;
          insertMode = 'afterend';
          break;
        }
      }

      if (!targetAnchorCard) return;

      // Calcula cota anual realista do clube e divide por 12 meses
      const ovr = state?.teamOverall || state?.clubOverall || 78;
      const div = state?.clubDivision || 1;
      const relevanceMult = Math.pow(Math.max(58, ovr) / 70, 2.1) * (div === 1 ? 1.0 : div === 2 ? 0.38 : 0.15);
      const baseAnnual = Math.round(78000000 * relevanceMult); // Ex: ~R$ 105M/ano para Série A topo

      // Se o clube ainda não tem contrato anual salvo, define o padrão (Grupo Globo)
      if (state && !state.tvContract1Year) {
        const defaultCo = TV_RIGHTS_ANNUAL_COMPANIES[0];
        const annualTotal = Math.round(baseAnnual * defaultCo.annualFactor);
        const monthlyQuota = Math.round(annualTotal / 12);
        state.tvContract1Year = {
          id: defaultCo.id,
          name: defaultCo.name,
          annualTotal: annualTotal,
          monthly: monthlyQuota,
          advancedTaken: false
        };
      }

      const activeContract = state?.tvContract1Year || {};

      // Sincroniza o valor mensal de "Direitos de transmissão" em PREVISÃO DE RECEITAS MENSAIS
      if (activeContract.monthly) {
        app.querySelectorAll('div, span').forEach((el) => {
          if (el.children.length === 0 && (el.textContent || '').trim() === 'Direitos de transmissão') {
            const valNode = el.nextElementSibling;
            if (valNode) {
              valNode.textContent = 'R$ ' + activeContract.monthly.toLocaleString('pt-BR') + '/mês';
            }
          }
        });
      }

      const existingTv = document.getElementById('afm-tv-rights-1year-box');
      if (existingTv && existingTv.dataset.contractId === (activeContract.id + '_' + !!activeContract.advancedTaken)) {
        return;
      }
      if (existingTv) existingTv.remove();

      const panel = document.createElement('div');
      panel.id = 'afm-tv-rights-1year-box';
      panel.dataset.contractId = activeContract.id + '_' + !!activeContract.advancedTaken;
      panel.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid rgba(124,58,237,0.5);border-radius:16px;padding:18px 20px;margin:16px 0;color:#f8fafc;display:block;clear:both;box-shadow:0 10px 25px rgba(0,0,0,0.35);';

      const advanceAmount = Math.round((activeContract.annualTotal || 96000000) * 0.45); // Adiantamento de 45% da cota anual à vista

      panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size:11px;font-weight:800;color:#a78bfa;letter-spacing:0.06em;">DIREITOS DE TRANSMISSÃO DE TV & STREAMING · CONTRATO ANUAL DIVIDIDO EM 12 MESES</div>
            <h3 style="margin:4px 0 0;font-size:17px;font-weight:900;color:#fff;">📺 Propostas de Transmissão (Globo, Amazon, Record/YouTube e 1190 Sports)</h3>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="background:#1e1b4b;border:1px solid #6d28d9;color:#e9d5ff;font-size:11px;font-weight:800;padding:7px 13px;border-radius:99px;">
              ✅ Emissora Atual: ${activeContract.name} (R$ ${(activeContract.monthly || 0).toLocaleString('pt-BR')}/mês)
            </span>
            <button id="btn-tv-advance-cash" type="button" ${activeContract.advancedTaken ? 'disabled' : ''} style="background:${activeContract.advancedTaken ? '#334155' : 'linear-gradient(135deg,#f59e0b,#d97706)'};color:${activeContract.advancedTaken ? '#94a3b8' : '#090d16'};border:none;padding:8px 14px;border-radius:10px;font-weight:900;font-size:11px;cursor:${activeContract.advancedTaken ? 'default' : 'pointer'};box-shadow:0 4px 12px rgba(245,158,11,0.3);">
              ${activeContract.advancedTaken ? '✔ Adiantamento Anual Recebido' : ('⚡ Pedir Adiantamento Anual (+R$ ' + advanceAmount.toLocaleString('pt-BR') + ' no Caixa)')}
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:12px;width:100%;">
          ${TV_RIGHTS_ANNUAL_COMPANIES.map((co) => {
            const annualTotal = Math.round(baseAnnual * co.annualFactor);
            const monthlySlice = Math.round(annualTotal / 12);
            const isSigned = activeContract.id === co.id;
            return `
              <div style="background:#090d16;border:1px solid ${isSigned ? '#10b981' : '#1e293b'};border-radius:12px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="font-size:13px;font-weight:900;color:#fff;">${co.name}</div>
                  <div style="font-size:11px;color:#38bdf8;font-weight:700;margin-top:3px;">${co.channels}</div>
                  <p style="font-size:11px;color:#94a3b8;line-height:1.4;margin:8px 0;">${co.desc}</p>
                </div>
                <div style="border-top:1px solid #1e293b;padding-top:10px;margin-top:6px;">
                  <div style="font-size:11px;color:#fbbf24;font-weight:800;">💰 Valor Anual: R$ ${annualTotal.toLocaleString('pt-BR')}/ano</div>
                  <div style="font-size:14px;font-weight:900;color:#34d399;margin-top:3px;">📅 Parcela Mensal (1/12): +R$ ${monthlySlice.toLocaleString('pt-BR')}/mês</div>
                  <div style="font-size:10px;color:#c4b5fd;margin-top:3px;">${co.fanBoost} · Adiantamento disponível</div>
                  <button class="btn-sign-tv-annual" data-id="${co.id}" data-annual="${annualTotal}" data-monthly="${monthlySlice}" data-name="${co.name}" style="margin-top:10px;width:100%;background:${isSigned ? '#065f46' : '#6d28d9'};color:#fff;border:none;padding:9px;border-radius:8px;font-weight:800;font-size:11px;cursor:pointer;">
                    ${isSigned ? '✅ CONTRATO ANUAL ATIVO' : 'ASSINAR CONTRATO ANUAL'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      targetAnchorCard.insertAdjacentElement(insertMode, panel);

      // Botão de Assinar Emissora (Anual dividido em 12 meses)
      panel.querySelectorAll('.btn-sign-tv-annual').forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.id, name = btn.dataset.name;
          const annualTotal = Number(btn.dataset.annual), monthly = Number(btn.dataset.monthly);
          if (state) {
            state.tvContract1Year = {
              id, name, annualTotal, monthly,
              advancedTaken: state.tvContract1Year ? !!state.tvContract1Year.advancedTaken : false
            };
          }
          panel.remove();
          this.injectTvBroadcastBelowExpenses(state);
        };
      });

      // Botão de Pedir Adiantamento da Cota Anual
      const advBtn = panel.querySelector('#btn-tv-advance-cash');
      if (advBtn && !activeContract.advancedTaken) {
        advBtn.onclick = () => {
          if (!state) return;
          state.tvContract1Year.advancedTaken = true;
          // Desconta proporcionalmente das parcelas mensais restantes e credita à vista no Caixa!
          state.tvContract1Year.monthly = Math.round(state.tvContract1Year.monthly * 0.55);
          state.balance = (Number(state.balance) || 0) + advanceAmount;
          state.clubBalance = state.balance;
          if (typeof state.cash === 'number') state.cash += advanceAmount;
          if (state.finances && typeof state.finances.cash === 'number') state.finances.cash += advanceAmount;

          // Atualiza o texto de Saldo em Caixa na barra lateral imediatamente
          document.querySelectorAll('#app aside div, #app aside span, #app aside strong').forEach((el) => {
            if (el.children.length === 0 && (el.textContent || '').trim().startsWith('R$')) {
              const cur = Number((el.textContent || '').replace(/[^0-9]/g, ''));
              if (cur > 100000) {
                el.textContent = 'R$ ' + (cur + advanceAmount).toLocaleString('pt-BR');
              }
            }
          });

          panel.remove();
          this.injectTvBroadcastBelowExpenses(state);
        };
      }
    },

    // ------------------------------------------------------------------------
    // 3. GARANTE QUE NENHUM TIME COMECE "SEM PATROCÍNIO" NOS 3 ESPAÇOS DA CAMISA
    // ------------------------------------------------------------------------
    ensureInitialClubSponsors(state) {
      const app = document.getElementById('app');
      if (!app) return;

      if (state && !state.__initialSponsorsAssigned) {
        state.__initialSponsorsAssigned = true;
        state.activeCustomSponsors = state.activeCustomSponsors || {
          0: DEFAULT_INITIAL_SPONSORS[0],
          1: DEFAULT_INITIAL_SPONSORS[1],
          2: DEFAULT_INITIAL_SPONSORS[2]
        };
      }

      const activeSponsors = (state && state.activeCustomSponsors) || {
        0: DEFAULT_INITIAL_SPONSORS[0],
        1: DEFAULT_INITIAL_SPONSORS[1],
        2: DEFAULT_INITIAL_SPONSORS[2]
      };

      // Procura os 3 cards de "Patrocinadores Oficiais do Clube" que estejam com "Sem Patrocínio"
      const headings = app.querySelectorAll('h2, h3, h4, div, span');
      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        if (h.children.length === 0 && (h.textContent || '').trim() === 'Sem Patrocínio') {
          const card = h.parentElement;
          if (!card) continue;
          const cardTxt = (card.textContent || '').toUpperCase();
          let sp = activeSponsors[0];
          if (cardTxt.includes('MANGAS')) sp = activeSponsors[1];
          else if (cardTxt.includes('COSTAS') || cardTxt.includes('OMOPLATA')) sp = activeSponsors[2];

          h.textContent = sp.name;
          h.style.color = sp.color || '#fff';

          // Atualiza o texto de R$ 0/mês e + R$ 0 por vitória dentro do card
          card.querySelectorAll('div, span, p, strong').forEach((node) => {
            if (node === h) return;
            const nt = (node.textContent || '').trim();
            if (nt === 'R$ 0/mês' || nt.includes('Mensal: R$ 0/mês')) {
              if (node.children.length === 0) node.textContent = 'R$ ' + sp.baseMonthly.toLocaleString('pt-BR') + '/mês';
              else node.innerHTML = 'Mensal: <strong style="color:#4ade80;">R$ ' + sp.baseMonthly.toLocaleString('pt-BR') + '/mês</strong>';
            } else if (nt.includes('+ R$ 0 por vitória')) {
              node.textContent = '+ R$ ' + sp.winBonus.toLocaleString('pt-BR') + ' por vitória · ' + sp.duration;
            }
          });
        }
      }

      // Atualiza "Patrocínios fixos" em PREVISÃO DE RECEITAS MENSAIS com a soma dos 3 patrocinadores
      const totalSponsorMonthly = (activeSponsors[0]?.baseMonthly || 0) + (activeSponsors[1]?.baseMonthly || 0) + (activeSponsors[2]?.baseMonthly || 0);
      app.querySelectorAll('div, span').forEach((el) => {
        if (el.children.length === 0 && (el.textContent || '').trim() === 'Patrocínios fixos') {
          const next = el.nextElementSibling;
          if (next && (next.textContent || '').includes('R$')) {
            next.textContent = 'R$ ' + totalSponsorMonthly.toLocaleString('pt-BR') + '/mês';
          }
        }
      });
    },

    // ------------------------------------------------------------------------
    // 4. LIBERTADORES: REMOVE RODADAS 7 A 30 E INJETA GRUPOS (A-H) + CHAVEAMENTO
    //    (OITAVAS, QUARTAS, SEMIFINAIS E FINAL COM TAÇA NO CENTRO!)
    // ------------------------------------------------------------------------
    enhanceLibertadoresBracketAndGroups(state) {
      const oldLib = document.getElementById('afm-libertadores-pro-view');
      if (oldLib) oldLib.remove();
    },

    runSafeSync() {
      const st = window.GameState || window.state || {};
      this.setupMuseumButtonAndBottomCabinet(st);
      this.injectTvBroadcastBelowExpenses(st);
      this.ensureInitialClubSponsors(st);
      this.enhanceLibertadoresBracketAndGroups(st);
    },
    refreshMuseumTrophiesDOM(st) {
      this.setupMuseumButtonAndBottomCabinet(st || window.GameState || window.state || {});
    },
    injectTvBroadcastSectionInOffice(st) {
      this.injectTvBroadcastBelowExpenses(st || window.GameState || window.state || {});
    },
    getClubTitlesWonInSave,
    getTrophiesHtmlBlock
  };

  // Registra no Hook Instantâneo (0ms) para rodar junto com window.render()!
  window.__AFM_RUN_INSTANT_HOOKS = function() {
    try {
      TrophiesTvMarketingPayroll.runSafeSync();
      if (typeof window.AFM_InstantCareerHook === 'function') window.AFM_InstantCareerHook();
    } catch (e) {}
  };

  document.addEventListener('click', () => {
    requestAnimationFrame(() => window.__AFM_RUN_INSTANT_HOOKS());
    setTimeout(() => window.__AFM_RUN_INSTANT_HOOKS(), 40);
  });
  window.addEventListener('load', () => {
    window.__AFM_RUN_INSTANT_HOOKS();
  });

  window.AFM_TrophiesTvPayroll = TrophiesTvMarketingPayroll;
})(window);
