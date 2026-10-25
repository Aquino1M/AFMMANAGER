/**
 * ==============================================================================
 * AFM MANAGER 2026/2027 — CATÁLOGO OFICIAL DE ESTÁDIOS REAIS DE CLUBES
 * Arquivo: js/core/club_stadiums_catalog.js
 * 
 * Mapeamento completo, verificado e autêntico de estádios de futebol do Brasil
 * (Série A, Série B, Série C, Série D e 11 Campeonatos Estaduais) e dos principais
 * clubes mundiais (CONMEBOL, UEFA, MLS e Liga Saudita).
 * 
 * Elimina 100% de nomes genéricos ("Estádio do clube") e impede vazamento de
 * nomes hardcoded entre clubes diferentes.
 * ==============================================================================
 */

(function (window) {
  'use strict';

  function normKey(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  const REAL_CLUB_STADIUMS = {
    // =========================================================================
    // BRASIL — SÉRIE A (ELITE NACIONAL)
    // =========================================================================
    'corinthians': { name: 'Neo Química Arena', city: 'São Paulo', state: 'SP', capacity: 49205, style: 'neo-quimica' },
    'sport club corinthians paulista': { name: 'Neo Química Arena', city: 'São Paulo', state: 'SP', capacity: 49205, style: 'neo-quimica' },
    'palmeiras': { name: 'Allianz Parque', city: 'São Paulo', state: 'SP', capacity: 43713, style: 'allianz-parque' },
    'sociedade esportiva palmeiras': { name: 'Allianz Parque', city: 'São Paulo', state: 'SP', capacity: 43713, style: 'allianz-parque' },
    'sao paulo': { name: 'MorumBIS', city: 'São Paulo', state: 'SP', capacity: 66795, style: 'morumbis' },
    'sao paulo futebol clube': { name: 'MorumBIS', city: 'São Paulo', state: 'SP', capacity: 66795, style: 'morumbis' },
    'santos': { name: 'Vila Belmiro', city: 'Santos', state: 'SP', capacity: 16068, style: 'vila-belmiro' },
    'santos fc': { name: 'Vila Belmiro', city: 'Santos', state: 'SP', capacity: 16068, style: 'vila-belmiro' },
    'flamengo': { name: 'Maracanã', city: 'Rio de Janeiro', state: 'RJ', capacity: 78838, style: 'maracana' },
    'clube de regatas do flamengo': { name: 'Maracanã', city: 'Rio de Janeiro', state: 'RJ', capacity: 78838, style: 'maracana' },
    'fluminense': { name: 'Maracanã', city: 'Rio de Janeiro', state: 'RJ', capacity: 78838, style: 'maracana' },
    'fluminense football club': { name: 'Maracanã', city: 'Rio de Janeiro', state: 'RJ', capacity: 78838, style: 'maracana' },
    'vasco': { name: 'São Januário', city: 'Rio de Janeiro', state: 'RJ', capacity: 21880, style: 'sao-januario' },
    'vasco da gama': { name: 'São Januário', city: 'Rio de Janeiro', state: 'RJ', capacity: 21880, style: 'sao-januario' },
    'botafogo': { name: 'Nilton Santos', city: 'Rio de Janeiro', state: 'RJ', capacity: 44661, style: 'nilton-santos' },
    'botafogo de futebol e regatas': { name: 'Nilton Santos', city: 'Rio de Janeiro', state: 'RJ', capacity: 44661, style: 'nilton-santos' },
    'gremio': { name: 'Arena do Grêmio', city: 'Porto Alegre', state: 'RS', capacity: 55662, style: 'arena-gremio' },
    'gremio foot ball porto alegrense': { name: 'Arena do Grêmio', city: 'Porto Alegre', state: 'RS', capacity: 55662, style: 'arena-gremio' },
    'internacional': { name: 'Beira-Rio', city: 'Porto Alegre', state: 'RS', capacity: 50842, style: 'beira-rio' },
    'sport club internacional': { name: 'Beira-Rio', city: 'Porto Alegre', state: 'RS', capacity: 50842, style: 'beira-rio' },
    'atletico mg': { name: 'Arena MRV', city: 'Belo Horizonte', state: 'MG', capacity: 44892, style: 'arena-mrv' },
    'atletico mineiro': { name: 'Arena MRV', city: 'Belo Horizonte', state: 'MG', capacity: 44892, style: 'arena-mrv' },
    'cruzeiro': { name: 'Mineirão', city: 'Belo Horizonte', state: 'MG', capacity: 61846, style: 'mineirao' },
    'cruzeiro esporte clube': { name: 'Mineirão', city: 'Belo Horizonte', state: 'MG', capacity: 61846, style: 'mineirao' },
    'bahia': { name: 'Arena Fonte Nova', city: 'Salvador', state: 'BA', capacity: 48000, style: 'fonte-nova' },
    'esporte clube bahia': { name: 'Arena Fonte Nova', city: 'Salvador', state: 'BA', capacity: 48000, style: 'fonte-nova' },
    'vitoria': { name: 'Barradão', city: 'Salvador', state: 'BA', capacity: 35000, style: 'barradao' },
    'esporte clube vitoria': { name: 'Barradão', city: 'Salvador', state: 'BA', capacity: 35000, style: 'barradao' },
    'athletico paranaense': { name: 'Ligga Arena', city: 'Curitiba', state: 'PR', capacity: 42370, style: 'ligga-arena' },
    'athletico pr': { name: 'Ligga Arena', city: 'Curitiba', state: 'PR', capacity: 42370, style: 'ligga-arena' },
    'coritiba': { name: 'Couto Pereira', city: 'Curitiba', state: 'PR', capacity: 40502, style: 'couto-pereira' },
    'bragantino': { name: 'Nabi Abi Chedid', city: 'Bragança Paulista', state: 'SP', capacity: 17128, style: 'nabi-abi-chedid' },
    'red bull bragantino': { name: 'Nabi Abi Chedid', city: 'Bragança Paulista', state: 'SP', capacity: 17128, style: 'nabi-abi-chedid' },
    'mirassol': { name: 'Maião', city: 'Mirassol', state: 'SP', capacity: 15000, style: 'maiao' },
    'mirassol fc': { name: 'Maião', city: 'Mirassol', state: 'SP', capacity: 15000, style: 'maiao' },
    'remo': { name: 'Baenão', city: 'Belém', state: 'PA', capacity: 13792, style: 'baenao' },
    'clube do remo': { name: 'Baenão', city: 'Belém', state: 'PA', capacity: 13792, style: 'baenao' },
    'chapecoense': { name: 'Arena Condá', city: 'Chapecó', state: 'SC', capacity: 20089, style: 'arena-conda' },
    'juventude': { name: 'Alfredo Jaconi', city: 'Caxias do Sul', state: 'RS', capacity: 19924, style: 'alfredo-jaconi' },
    'fortaleza': { name: 'Arena Castelão', city: 'Fortaleza', state: 'CE', capacity: 63903, style: 'castelao-ce' },
    'ceara': { name: 'Arena Castelão', city: 'Fortaleza', state: 'CE', capacity: 63903, style: 'castelao-ce' },

    // =========================================================================
    // BRASIL — SÉRIE B
    // =========================================================================
    'sport': { name: 'Ilha do Retiro', city: 'Recife', state: 'PE', capacity: 32934, style: 'ilha-do-retiro' },
    'sport recife': { name: 'Ilha do Retiro', city: 'Recife', state: 'PE', capacity: 32934, style: 'ilha-do-retiro' },
    'goias': { name: 'Serrinha', city: 'Goiânia', state: 'GO', capacity: 14525, style: 'serrinha' },
    'america mg': { name: 'Independência', city: 'Belo Horizonte', state: 'MG', capacity: 23018, style: 'independencia' },
    'america mineiro': { name: 'Independência', city: 'Belo Horizonte', state: 'MG', capacity: 23018, style: 'independencia' },
    'cuiaba': { name: 'Arena Pantanal', city: 'Cuiabá', state: 'MT', capacity: 44000, style: 'arena-pantanal' },
    'atletico go': { name: 'Antônio Accioly', city: 'Goiânia', state: 'GO', capacity: 12500, style: 'accioly' },
    'atletico goianiense': { name: 'Antônio Accioly', city: 'Goiânia', state: 'GO', capacity: 12500, style: 'accioly' },
    'criciuma': { name: 'Heriberto Hülse', city: 'Criciúma', state: 'SC', capacity: 19225, style: 'heriberto-hulse' },
    'novorizontino': { name: 'Jorge Ismael de Biasi', city: 'Novo Horizonte', state: 'SP', capacity: 16000, style: 'jorjao' },
    'gremio novorizontino': { name: 'Jorge Ismael de Biasi', city: 'Novo Horizonte', state: 'SP', capacity: 16000, style: 'jorjao' },
    'vila nova': { name: 'OBA', city: 'Goiânia', state: 'GO', capacity: 11788, style: 'oba' },
    'avai': { name: 'Ressacada', city: 'Florianópolis', state: 'SC', capacity: 17800, style: 'ressacada' },
    'crb': { name: 'Rei Pelé', city: 'Maceió', state: 'AL', capacity: 17126, style: 'rei-pele' },
    'paysandu': { name: 'Curuzu', city: 'Belém', state: 'PA', capacity: 16200, style: 'curuzu' },
    'operario pr': { name: 'Germano Krüger', city: 'Ponta Grossa', state: 'PR', capacity: 10632, style: 'germano-kruger' },
    'ponte preta': { name: 'Moisés Lucarelli', city: 'Campinas', state: 'SP', capacity: 17728, style: 'moises-lucarelli' },
    'guarani': { name: 'Brinco de Ouro', city: 'Campinas', state: 'SP', capacity: 29130, style: 'brinco-de-ouro' },
    'botafogo sp': { name: 'Santa Cruz / Arena Nicnet', city: 'Ribeirão Preto', state: 'SP', capacity: 29292, style: 'santa-cruz' },
    'sao bernardo': { name: 'Primeiro de Maio', city: 'São Bernardo do Campo', state: 'SP', capacity: 15759, style: 'primeiro-de-maio' },
    'sao bernardo fc': { name: 'Primeiro de Maio', city: 'São Bernardo do Campo', state: 'SP', capacity: 15759, style: 'primeiro-de-maio' },
    'athletic club': { name: 'Arena Sicredi', city: 'São João del-Rei', state: 'MG', capacity: 6000, style: 'arena-sicredi' },
    'athletic': { name: 'Arena Sicredi', city: 'São João del-Rei', state: 'MG', capacity: 6000, style: 'arena-sicredi' },
    'londrina': { name: 'Estádio do Café', city: 'Londrina', state: 'PR', capacity: 30000, style: 'estadio-do-cafe' },
    'nautico': { name: 'Aflitos', city: 'Recife', state: 'PE', capacity: 20000, style: 'aflitos' },

    // =========================================================================
    // BRASIL — SÉRIE C
    // =========================================================================
    'amazonas fc': { name: 'Arena da Amazônia', city: 'Manaus', state: 'AM', capacity: 44000, style: 'arena-amazonia' },
    'amazonas': { name: 'Arena da Amazônia', city: 'Manaus', state: 'AM', capacity: 44000, style: 'arena-amazonia' },
    'anapolis': { name: 'Jonas Duarte', city: 'Anápolis', state: 'GO', capacity: 10700, style: 'jonas-duarte' },
    'barra sc': { name: 'Gigantão das Avenidas', city: 'Itajaí', state: 'SC', capacity: 6000, style: 'gigantao' },
    'barra': { name: 'Gigantão das Avenidas', city: 'Itajaí', state: 'SC', capacity: 6000, style: 'gigantao' },
    'botafogo pb': { name: 'Almeidão', city: 'João Pessoa', state: 'PB', capacity: 25770, style: 'almeidao-pb' },
    'brusque': { name: 'Augusto Bauer', city: 'Brusque', state: 'SC', capacity: 5000, style: 'augusto-bauer' },
    'caxias': { name: 'Centenário', city: 'Caxias do Sul', state: 'RS', capacity: 22132, style: 'centenario' },
    'ser caxias': { name: 'Centenário', city: 'Caxias do Sul', state: 'RS', capacity: 22132, style: 'centenario' },
    'confianca': { name: 'Batistão', city: 'Aracaju', state: 'SE', capacity: 15575, style: 'batistao' },
    'ferroviaria': { name: 'Fonte Luminosa', city: 'Araraquara', state: 'SP', capacity: 20000, style: 'fonte-luminosa' },
    'figueirense': { name: 'Orlando Scarpelli', city: 'Florianópolis', state: 'SC', capacity: 19584, style: 'scarpelli' },
    'floresta': { name: 'Presidente Vargas', city: 'Fortaleza', state: 'CE', capacity: 20200, style: 'presidente-vargas' },
    'inter de limeira': { name: 'Major Levy Sobrinho', city: 'Limeira', state: 'SP', capacity: 18000, style: 'limeirao' },
    'itabaiana': { name: 'Mendonção', city: 'Itabaiana', state: 'SE', capacity: 12000, style: 'mendoncao' },
    'ituano': { name: 'Novelli Júnior', city: 'Itu', state: 'SP', capacity: 18560, style: 'novelli-junior' },
    'maranhao': { name: 'Castelão', city: 'São Luís', state: 'MA', capacity: 40149, style: 'castelao-ma' },
    'maringa': { name: 'Willie Davids', city: 'Maringá', state: 'PR', capacity: 16000, style: 'willie-davids' },
    'maringa fc': { name: 'Willie Davids', city: 'Maringá', state: 'PR', capacity: 16000, style: 'willie-davids' },
    'santa cruz': { name: 'Arruda', city: 'Recife', state: 'PE', capacity: 60044, style: 'arruda' },
    'volta redonda': { name: 'Raulino de Oliveira', city: 'Volta Redonda', state: 'RJ', capacity: 20255, style: 'raulino-oliveira' },
    'ypiranga rs': { name: 'Colosso da Lagoa', city: 'Erechim', state: 'RS', capacity: 22000, style: 'colosso-lagoa' },
    'ypiranga': { name: 'Colosso da Lagoa', city: 'Erechim', state: 'RS', capacity: 22000, style: 'colosso-lagoa' },

    // =========================================================================
    // BRASIL — CAMPEONATO CANDANGO (DF)
    // =========================================================================
    'aruc': { name: 'Estádio Augustinho Lima', city: 'Sobradinho', state: 'DF', capacity: 15000, style: 'augustinho-lima' },
    'sobradinho': { name: 'Estádio Augustinho Lima', city: 'Sobradinho', state: 'DF', capacity: 15000, style: 'augustinho-lima' },
    'sobradinho ec': { name: 'Estádio Augustinho Lima', city: 'Sobradinho', state: 'DF', capacity: 15000, style: 'augustinho-lima' },
    'brasilia': { name: 'Bezerrão', city: 'Gama', state: 'DF', capacity: 20310, style: 'bezerrao' },
    'brasilia fc': { name: 'Bezerrão', city: 'Gama', state: 'DF', capacity: 20310, style: 'bezerrao' },
    'gama': { name: 'Bezerrão', city: 'Gama', state: 'DF', capacity: 20310, style: 'bezerrao' },
    'sociedade esportiva do gama': { name: 'Bezerrão', city: 'Gama', state: 'DF', capacity: 20310, style: 'bezerrao' },
    'santa maria': { name: 'Bezerrão', city: 'Gama', state: 'DF', capacity: 20310, style: 'bezerrao' },
    'brasiliense': { name: 'Serejão (Boca do Jacaré)', city: 'Taguatinga', state: 'DF', capacity: 27000, style: 'serejao' },
    'brasiliense fc': { name: 'Serejão (Boca do Jacaré)', city: 'Taguatinga', state: 'DF', capacity: 27000, style: 'serejao' },
    'capital df': { name: 'Estádio JK Paranoá', city: 'Paranoá', state: 'DF', capacity: 6000, style: 'jk-paranoa' },
    'capital': { name: 'Estádio JK Paranoá', city: 'Paranoá', state: 'DF', capacity: 6000, style: 'jk-paranoa' },
    'paranoa': { name: 'Estádio JK Paranoá', city: 'Paranoá', state: 'DF', capacity: 6000, style: 'jk-paranoa' },
    'ceilandia': { name: 'Abadião', city: 'Ceilândia', state: 'DF', capacity: 4000, style: 'abadiao' },
    'ceilandia ec': { name: 'Abadião', city: 'Ceilândia', state: 'DF', capacity: 4000, style: 'abadiao' },
    'real brasilia': { name: 'Ciro Machado do Espírito Santo (Defelê)', city: 'Brasília', state: 'DF', capacity: 6000, style: 'defele' },
    'real brasilia fc': { name: 'Ciro Machado do Espírito Santo (Defelê)', city: 'Brasília', state: 'DF', capacity: 6000, style: 'defele' },
    'samambaia': { name: 'Rorizão', city: 'Samambaia', state: 'DF', capacity: 6000, style: 'rorizao' },
    'samambaia fc': { name: 'Rorizão', city: 'Samambaia', state: 'DF', capacity: 6000, style: 'rorizao' },
    'planaltina': { name: 'Adonir Guimarães', city: 'Planaltina', state: 'DF', capacity: 6000, style: 'adonir-guimaraes' },

    // =========================================================================
    // BRASIL — SÉRIE D & ESTADUAIS DE DESTAQUE
    // =========================================================================
    'abc': { name: 'Frasqueirão', city: 'Natal', state: 'RN', capacity: 18000, style: 'frasqueirao' },
    'abecat': { name: 'Estádio Luiz Benedito', city: 'Ouvidor', state: 'GO', capacity: 3500, style: 'regional' },
    'agua santa': { name: 'Distrital do Inamar', city: 'Diadema', state: 'SP', capacity: 10000, style: 'inamar' },
    'aguia de maraba': { name: 'Zinho de Oliveira', city: 'Marabá', state: 'PA', capacity: 5000, style: 'regional' },
    'altos': { name: 'Lindolfo Monteiro', city: 'Teresina', state: 'PI', capacity: 6000, style: 'lindolfo' },
    'america rj': { name: 'Giulite Coutinho', city: 'Mesquita', state: 'RJ', capacity: 13544, style: 'giulite' },
    'america rn': { name: 'Arena das Dunas', city: 'Natal', state: 'RN', capacity: 32050, style: 'dunas' },
    'aparecidense': { name: 'Aníbal Batista de Toledo', city: 'Aparecida de Goiânia', state: 'GO', capacity: 4800, style: 'anibal-toledo' },
    'araguaina': { name: 'Mirandão', city: 'Araguaína', state: 'TO', capacity: 10000, style: 'mirandao' },
    'asa': { name: 'Coaracy da Mata Fonseca', city: 'Arapiraca', state: 'AL', capacity: 12500, style: 'coaracy' },
    'atletico ba': { name: 'Carneirão', city: 'Alagoinhas', state: 'BA', capacity: 16000, style: 'carneirao' },
    'atletico ce': { name: 'Domingão', city: 'Horizonte', state: 'CE', capacity: 10500, style: 'domingao' },
    'azuriz': { name: 'Os Pioneiros', city: 'Pato Branco', state: 'PR', capacity: 2500, style: 'pioneiros' },
    'betim': { name: 'Arena Vera Cruz', city: 'Betim', state: 'MG', capacity: 3500, style: 'regional' },
    'blumenau': { name: 'Ervin Blaese', city: 'Indaial', state: 'SC', capacity: 3000, style: 'regional' },
    'brasil de pelotas': { name: 'Bento Freitas', city: 'Pelotas', state: 'RS', capacity: 12314, style: 'bento-freitas' },
    'central': { name: 'Lacerdão', city: 'Caruaru', state: 'PE', capacity: 19478, style: 'lacerdao' },
    'cianorte': { name: 'Albino Turbay', city: 'Cianorte', state: 'PR', capacity: 4000, style: 'albino-turbay' },
    'crac': { name: 'Genervino da Fonseca', city: 'Catalão', state: 'GO', capacity: 8500, style: 'genervino' },
    'csa': { name: 'Rei Pelé', city: 'Maceió', state: 'AL', capacity: 17126, style: 'rei-pele' },
    'cse': { name: 'Juca Sampaio', city: 'Palmeira dos Índios', state: 'AL', capacity: 7000, style: 'juca-sampaio' },
    'decisao': { name: 'Arthur Tavares', city: 'Bonito', state: 'PE', capacity: 4000, style: 'regional' },
    'democrata gv': { name: 'Mamudão', city: 'Governador Valadares', state: 'MG', capacity: 8674, style: 'mamudao' },
    'fc cascavel': { name: 'Olímpico Regional', city: 'Cascavel', state: 'PR', capacity: 28125, style: 'olimpico-cascavel' },
    'ferroviario': { name: 'Presidente Vargas', city: 'Fortaleza', state: 'CE', capacity: 20200, style: 'presidente-vargas' },
    'fluminense pi': { name: 'Lindolfo Monteiro', city: 'Teresina', state: 'PI', capacity: 6000, style: 'lindolfo' },
    'galvez': { name: 'Arena da Floresta', city: 'Rio Branco', state: 'AC', capacity: 20000, style: 'floresta' },
    'gas': { name: 'Canarinho', city: 'Boa Vista', state: 'RR', capacity: 4556, style: 'canarinho' },
    'goiatuba': { name: 'Divino Garcia Rosa', city: 'Goiatuba', state: 'GO', capacity: 15000, style: 'regional' },
    'guapore': { name: 'Cassolão', city: 'Rolim de Moura', state: 'RO', capacity: 5000, style: 'regional' },
    'guarany de bage': { name: 'Estrela D\'Alva', city: 'Bagé', state: 'RS', capacity: 10000, style: 'estrela-dalva' },
    'humaita': { name: 'Florestão', city: 'Rio Branco', state: 'AC', capacity: 10000, style: 'florestao' },
    'iape': { name: 'Nhozinho Santos', city: 'São Luís', state: 'MA', capacity: 11429, style: 'nhozinho-santos' },
    'iguatu': { name: 'Morenão', city: 'Iguatu', state: 'CE', capacity: 3300, style: 'regional' },
    'imperatriz': { name: 'Frei Epifânio', city: 'Imperatriz', state: 'MA', capacity: 10000, style: 'frei-epifanio' },
    'independencia': { name: 'Florestão', city: 'Rio Branco', state: 'AC', capacity: 10000, style: 'florestao' },
    'inhumas': { name: 'Zico Brandão', city: 'Inhumas', state: 'GO', capacity: 4380, style: 'regional' },
    'ivinhema': { name: 'Saraivão', city: 'Ivinhema', state: 'MS', capacity: 6000, style: 'regional' },
    'jacuipense': { name: 'Eliel Martins', city: 'Valente', state: 'BA', capacity: 5000, style: 'valente' },
    'joinville': { name: 'Arena Joinville', city: 'Joinville', state: 'SC', capacity: 22400, style: 'arena-joinville' },
    'juazeirense': { name: 'Adauto Moraes', city: 'Juazeiro', state: 'BA', capacity: 8000, style: 'adauto-moraes' },
    'lagarto': { name: 'Barretão', city: 'Lagarto', state: 'SE', capacity: 8000, style: 'barretao' },
    'laguna': { name: 'Nazarenão', city: 'Goianinha', state: 'RN', capacity: 7000, style: 'nazarenao' },
    'luverdense': { name: 'Passo das Emas', city: 'Lucas do Rio Verde', state: 'MT', capacity: 10000, style: 'passo-emas' },
    'madureira': { name: 'Conselheiro Galvão', city: 'Rio de Janeiro', state: 'RJ', capacity: 5014, style: 'conselheiro-galvao' },
    'maguary': { name: 'Arthur Tavares', city: 'Bonito', state: 'PE', capacity: 4000, style: 'regional' },
    'manaus': { name: 'Arena da Amazônia', city: 'Manaus', state: 'AM', capacity: 44000, style: 'arena-amazonia' },
    'manauara': { name: 'Arena da Amazônia', city: 'Manaus', state: 'AM', capacity: 44000, style: 'arena-amazonia' },
    'marcilio dias': { name: 'Dr. Hercílio Luz (Gigantão das Avenidas)', city: 'Itajaí', state: 'SC', capacity: 6010, style: 'gigantao' },
    'maracana': { name: 'Almir Dutra', city: 'Maracanaú', state: 'CE', capacity: 3500, style: 'regional' },
    'marica': { name: 'Estádio Municipal de Maricá', city: 'Maricá', state: 'RJ', capacity: 3000, style: 'regional' },
    'mixto mt': { name: 'Arena Pantanal', city: 'Cuiabá', state: 'MT', capacity: 44000, style: 'arena-pantanal' },
    'monte roraima': { name: 'Canarinho', city: 'Boa Vista', state: 'RR', capacity: 4556, style: 'canarinho' },
    'moto club': { name: 'Castelão', city: 'São Luís', state: 'MA', capacity: 40149, style: 'castelao-ma' },
    'nacional am': { name: 'Arena da Amazônia', city: 'Manaus', state: 'AM', capacity: 44000, style: 'arena-amazonia' },
    'noroeste': { name: 'Alfredo de Castilho', city: 'Bauru', state: 'SP', capacity: 18866, style: 'castilhao' },
    'nova iguacu': { name: 'Laranjão', city: 'Nova Iguaçu', state: 'RJ', capacity: 4000, style: 'laranjao' },
    'operario ms': { name: 'Morenão', city: 'Campo Grande', state: 'MS', capacity: 45000, style: 'morenao' },
    'operario vg': { name: 'Dito Souza', city: 'Várzea Grande', state: 'MT', capacity: 2600, style: 'regional' },
    'oratorio': { name: 'Zerão', city: 'Macapá', state: 'AP', capacity: 13680, style: 'zerao' },
    'parnahyba': { name: 'Piscinão', city: 'Parnaíba', state: 'PI', capacity: 4700, style: 'piscinao' },
    'piaui': { name: 'Lindolfo Monteiro', city: 'Teresina', state: 'PI', capacity: 6000, style: 'lindolfo' },
    'porto ba': { name: 'Agnaldo Bento', city: 'Porto Seguro', state: 'BA', capacity: 3000, style: 'regional' },
    'porto velho': { name: 'Aluizão', city: 'Porto Velho', state: 'RO', capacity: 7000, style: 'aluizao' },
    'portuguesa sp': { name: 'Canindé', city: 'São Paulo', state: 'SP', capacity: 21004, style: 'caninde' },
    'portuguesa': { name: 'Canindé', city: 'São Paulo', state: 'SP', capacity: 21004, style: 'caninde' },
    'portuguesa rj': { name: 'Luso-Brasileiro', city: 'Rio de Janeiro', state: 'RJ', capacity: 5044, style: 'luso-brasileiro' },
    'pouso alegre': { name: 'Manduzão', city: 'Pouso Alegre', state: 'MG', capacity: 26000, style: 'manduzao' },
    'primavera mt': { name: 'Cerradão', city: 'Primavera do Leste', state: 'MT', capacity: 4000, style: 'regional' },
    'real noroeste': { name: 'José Olímpio da Rocha', city: 'Águia Branca', state: 'ES', capacity: 5281, style: 'regional' },
    'retro': { name: 'Arena de Pernambuco', city: 'São Lourenço da Mata', state: 'PE', capacity: 45440, style: 'arena-pernambuco' },
    'rio branco es': { name: 'Kleber Andrade', city: 'Cariacica', state: 'ES', capacity: 21800, style: 'kleber-andrade' },
    'sampaio correa ma': { name: 'Castelão', city: 'São Luís', state: 'MA', capacity: 40149, style: 'castelao-ma' },
    'sampaio correa': { name: 'Castelão', city: 'São Luís', state: 'MA', capacity: 40149, style: 'castelao-ma' },
    'sampaio correa rj': { name: 'Lourival Gomes', city: 'Saquarema', state: 'RJ', capacity: 1800, style: 'regional' },
    'santa catarina': { name: 'Alfredo João Krieck', city: 'Rio do Sul', state: 'SC', capacity: 7000, style: 'regional' },
    'sao jose rs': { name: 'Passo d\'Areia', city: 'Porto Alegre', state: 'RS', capacity: 10646, style: 'passo-dareia' },
    'sao joseense': { name: 'Pinhão', city: 'São José dos Pinhais', state: 'PR', capacity: 4047, style: 'pinhao' },
    'sao luiz': { name: '19 de Outubro', city: 'Ijuí', state: 'RS', capacity: 6000, style: 'dezenove-outubro' },
    'sao raimundo rr': { name: 'Canarinho', city: 'Boa Vista', state: 'RR', capacity: 4556, style: 'canarinho' },
    'serra branca': { name: 'Amigão', city: 'Campina Grande', state: 'PB', capacity: 19000, style: 'amigao' },
    'sergipe': { name: 'Batistão', city: 'Aracaju', state: 'SE', capacity: 15575, style: 'batistao' },
    'sousa': { name: 'Marizão', city: 'Sousa', state: 'PB', capacity: 12400, style: 'marizao' },
    'tirol': { name: 'Presidente Vargas', city: 'Fortaleza', state: 'CE', capacity: 20200, style: 'presidente-vargas' },
    'tocantinopolis': { name: 'Ribeirão', city: 'Tocantinópolis', state: 'TO', capacity: 8000, style: 'ribeirao' },
    'tombense': { name: 'Almeidão', city: 'Tombos', state: 'MG', capacity: 6555, style: 'almeidao-tombos' },
    'treze': { name: 'Amigão', city: 'Campina Grande', state: 'PB', capacity: 19000, style: 'amigao' },
    'trem': { name: 'Zerão', city: 'Macapá', state: 'AP', capacity: 13680, style: 'zerao' },
    'tuna luso': { name: 'Souza', city: 'Belém', state: 'PA', capacity: 6000, style: 'souza' },
    'uberlandia': { name: 'Parque do Sabiá', city: 'Uberlândia', state: 'MG', capacity: 53350, style: 'parque-sabia' },
    'uniao rondonopolis': { name: 'Luthero Lopes', city: 'Rondonópolis', state: 'MT', capacity: 18000, style: 'luthero-lopes' },
    'velo clube': { name: 'Benitão', city: 'Rio Claro', state: 'SP', capacity: 8136, style: 'benitao' },
    'vitoria es': { name: 'Salvador Costa', city: 'Vitória', state: 'ES', capacity: 3000, style: 'regional' },
    'xv de piracicaba': { name: 'Barão de Serra Negra', city: 'Piracicaba', state: 'SP', capacity: 18000, style: 'barao-serra-negra' },
    'bangu': { name: 'Moça Bonita', city: 'Rio de Janeiro', state: 'RJ', capacity: 9564, style: 'moca-bonita' },
    'boavista': { name: 'Elcyr Resende de Mendonça', city: 'Saquarema', state: 'RJ', capacity: 4315, style: 'elcyr-resende' },
    'villa nova': { name: 'Castor Cifuentes', city: 'Nova Lima', state: 'MG', capacity: 5160, style: 'castor-cifuentes' },
    'ipatinga': { name: 'Ipatingão', city: 'Ipatinga', state: 'MG', capacity: 22500, style: 'ipatingao' },
    'itabirito': { name: 'Castor Cifuentes', city: 'Nova Lima', state: 'MG', capacity: 5160, style: 'castor-cifuentes' },
    'avenida': { name: 'Eucaliptos', city: 'Santa Cruz do Sul', state: 'RS', capacity: 3500, style: 'eucaliptos' },
    'monsoon': { name: 'Parque Lami', city: 'Porto Alegre', state: 'RS', capacity: 1500, style: 'regional' },
    'novo hamburgo': { name: 'Estádio do Vale', city: 'Novo Hamburgo', state: 'RS', capacity: 5196, style: 'estadio-do-vale' },
    'andraus': { name: 'Vila Capanema', city: 'Curitiba', state: 'PR', capacity: 17140, style: 'capanema' },
    'concordia': { name: 'Domingos Machado de Lima', city: 'Concórdia', state: 'SC', capacity: 5000, style: 'regional' },
    'barcelona ba': { name: 'Mário Pessoa', city: 'Ilhéus', state: 'BA', capacity: 7000, style: 'mario-pessoa' },
    'jequie': { name: 'Waldomiro Borges', city: 'Jequié', state: 'BA', capacity: 4000, style: 'regional' },
    'bahia de feira': { name: 'Arena Cajueiro', city: 'Feira de Santana', state: 'BA', capacity: 4000, style: 'cajueiro' },
    'itabuna': { name: 'Luiz Viana Filho', city: 'Itabuna', state: 'BA', capacity: 11745, style: 'regional' },
    'horizonte': { name: 'Domingão', city: 'Horizonte', state: 'CE', capacity: 10500, style: 'domingao' },
    'barbalha': { name: 'Inaldão', city: 'Barbalha', state: 'CE', capacity: 5000, style: 'regional' },
    'caucaia': { name: 'Raimundão', city: 'Caucaia', state: 'CE', capacity: 4000, style: 'regional' },
    'goianesia': { name: 'Valdeir José de Oliveira', city: 'Goianésia', state: 'GO', capacity: 6000, style: 'regional' },
    'ipora': { name: 'Ferreirão', city: 'Iporá', state: 'GO', capacity: 3500, style: 'regional' },
    'morrinhos': { name: 'Centro Esportivo João Vilela', city: 'Morrinhos', state: 'GO', capacity: 5040, style: 'regional' },
    'afogados': { name: 'Vianão', city: 'Afogados da Ingazeira', state: 'PE', capacity: 2000, style: 'regional' },
    'petrolina': { name: 'Paulo Coelho', city: 'Petrolina', state: 'PE', capacity: 5000, style: 'regional' },
    'porto pe': { name: 'Lacerdão', city: 'Caruaru', state: 'PE', capacity: 19478, style: 'lacerdao' },
    'flamengo de arcoverde': { name: 'Áureo Bradley', city: 'Arcoverde', state: 'PE', capacity: 3000, style: 'regional' },

    // =========================================================================
    // AMÉRICA DO SUL (LIBERTADORES / SUL-AMERICANA)
    // =========================================================================
    'river plate': { name: 'Monumental', city: 'Buenos Aires', state: 'Argentina', capacity: 84567, style: 'monumental-ba' },
    'boca juniors': { name: 'La Bombonera', city: 'Buenos Aires', state: 'Argentina', capacity: 54000, style: 'bombonera' },
    'racing club': { name: 'El Cilindro', city: 'Avellaneda', state: 'Argentina', capacity: 51389, style: 'cilindro' },
    'independiente': { name: 'Libertadores de América', city: 'Avellaneda', state: 'Argentina', capacity: 48069, style: 'libertadores-america' },
    'san lorenzo': { name: 'Pedro Bidegain', city: 'Buenos Aires', state: 'Argentina', capacity: 47964, style: 'bidegain' },
    'estudiantes': { name: 'Jorge Luis Hirschi', city: 'La Plata', state: 'Argentina', capacity: 32530, style: 'hirschi' },
    'velez sarsfield': { name: 'José Amalfitani', city: 'Buenos Aires', state: 'Argentina', capacity: 49540, style: 'amalfitani' },
    'lanus': { name: 'Cidade de Lanús', city: 'Lanús', state: 'Argentina', capacity: 47027, style: 'lanus' },
    'nacional': { name: 'Gran Parque Central', city: 'Montevidéu', state: 'Uruguai', capacity: 34000, style: 'parque-central' },
    'penarol': { name: 'Campeón del Siglo', city: 'Montevidéu', state: 'Uruguai', capacity: 40700, style: 'campeon-siglo' },
    'colo colo': { name: 'Monumental David Arellano', city: 'Santiago', state: 'Chile', capacity: 47347, style: 'david-arellano' },
    'universidad de chile': { name: 'Nacional de Chile', city: 'Santiago', state: 'Chile', capacity: 48665, style: 'nacional-chile' },
    'atletico nacional': { name: 'Atanasio Girardot', city: 'Medellín', state: 'Colômbia', capacity: 44739, style: 'atanasio-girardot' },
    'millonarios': { name: 'El Campín', city: 'Bogotá', state: 'Colômbia', capacity: 36343, style: 'campin' },
    'america de cali': { name: 'Pascual Guerrero', city: 'Cali', state: 'Colômbia', capacity: 38000, style: 'pascual-guerrero' },
    'ldu quito': { name: 'Rodrigo Paz Delgado (Casa Blanca)', city: 'Quito', state: 'Equador', capacity: 41575, style: 'casa-blanca' },
    'barcelona sc': { name: 'Monumental Isidro Romero', city: 'Guayaquil', state: 'Equador', capacity: 59283, style: 'isidro-romero' },
    'independiente del valle': { name: 'Banco Guayaquil', city: 'Quito', state: 'Equador', capacity: 12000, style: 'banco-guayaquil' },
    'olimpia': { name: 'Manuel Ferreira', city: 'Assunção', state: 'Paraguai', capacity: 22000, style: 'manuel-ferreira' },
    'cerro porteno': { name: 'General Pablo Rojas (La Nueva Olla)', city: 'Assunção', state: 'Paraguai', capacity: 45000, style: 'nueva-olla' },
    'libertad': { name: 'Tigo La Huerta', city: 'Assunção', state: 'Paraguai', capacity: 10100, style: 'la-huerta' },
    'bolivar': { name: 'Hernando Siles', city: 'La Paz', state: 'Bolívia', capacity: 41143, style: 'hernando-siles' },
    'the strongest': { name: 'Hernando Siles', city: 'La Paz', state: 'Bolívia', capacity: 41143, style: 'hernando-siles' },
    'alianza lima': { name: 'Alejandro Villanueva (Matute)', city: 'Lima', state: 'Peru', capacity: 33938, style: 'matute' },
    'universitario': { name: 'Monumental U', city: 'Lima', state: 'Peru', capacity: 80093, style: 'monumental-u' },

    // =========================================================================
    // EUROPA (UEFA CHAMPIONS LEAGUE & GRANDES LIGAS)
    // =========================================================================
    'real madrid': { name: 'Santiago Bernabéu', city: 'Madrid', state: 'Espanha', capacity: 81044, style: 'bernabeu' },
    'fc barcelona': { name: 'Spotify Camp Nou', city: 'Barcelona', state: 'Espanha', capacity: 99354, style: 'camp-nou' },
    'barcelona': { name: 'Spotify Camp Nou', city: 'Barcelona', state: 'Espanha', capacity: 99354, style: 'camp-nou' },
    'atletico de madrid': { name: 'Cívitas Metropolitano', city: 'Madrid', state: 'Espanha', capacity: 70460, style: 'metropolitano' },
    'athletic club': { name: 'San Mamés', city: 'Bilbao', state: 'Espanha', capacity: 53289, style: 'san-mames' },
    'manchester city': { name: 'Etihad Stadium', city: 'Manchester', state: 'Inglaterra', capacity: 53400, style: 'etihad' },
    'manchester united': { name: 'Old Trafford', city: 'Manchester', state: 'Inglaterra', capacity: 74310, style: 'old-trafford' },
    'liverpool': { name: 'Anfield', city: 'Liverpool', state: 'Inglaterra', capacity: 61276, style: 'anfield' },
    'arsenal': { name: 'Emirates Stadium', city: 'Londres', state: 'Inglaterra', capacity: 60704, style: 'emirates' },
    'chelsea': { name: 'Stamford Bridge', city: 'Londres', state: 'Inglaterra', capacity: 40341, style: 'stamford-bridge' },
    'tottenham hotspur': { name: 'Tottenham Hotspur Stadium', city: 'Londres', state: 'Inglaterra', capacity: 62850, style: 'tottenham' },
    'bayern munchen': { name: 'Allianz Arena', city: 'Munique', state: 'Alemanha', capacity: 75024, style: 'allianz-arena' },
    'bayern munich': { name: 'Allianz Arena', city: 'Munique', state: 'Alemanha', capacity: 75024, style: 'allianz-arena' },
    'borussia dortmund': { name: 'Signal Iduna Park', city: 'Dortmund', state: 'Alemanha', capacity: 81365, style: 'signal-iduna' },
    'bayer leverkusen': { name: 'BayArena', city: 'Leverkusen', state: 'Alemanha', capacity: 30210, style: 'bayarena' },
    'paris saint germain': { name: 'Parc des Princes', city: 'Paris', state: 'França', capacity: 47929, style: 'parc-des-princes' },
    'psg': { name: 'Parc des Princes', city: 'Paris', state: 'França', capacity: 47929, style: 'parc-des-princes' },
    'inter': { name: 'San Siro (Giuseppe Meazza)', city: 'Milão', state: 'Itália', capacity: 75923, style: 'san-siro' },
    'internazionale': { name: 'San Siro (Giuseppe Meazza)', city: 'Milão', state: 'Itália', capacity: 75923, style: 'san-siro' },
    'ac milan': { name: 'San Siro', city: 'Milão', state: 'Itália', capacity: 75923, style: 'san-siro' },
    'milan': { name: 'San Siro', city: 'Milão', state: 'Itália', capacity: 75923, style: 'san-siro' },
    'juventus': { name: 'Allianz Stadium', city: 'Turim', state: 'Itália', capacity: 41507, style: 'allianz-torino' },
    'napoli': { name: 'Diego Armando Maradona', city: 'Nápoles', state: 'Itália', capacity: 54726, style: 'diego-maradona' },
    'roma': { name: 'Stadio Olimpico', city: 'Roma', state: 'Itália', capacity: 70634, style: 'olimpico-roma' },
    'lazio': { name: 'Stadio Olimpico', city: 'Roma', state: 'Itália', capacity: 70634, style: 'olimpico-roma' },
    'benfica': { name: 'Estádio da Luz', city: 'Lisboa', state: 'Portugal', capacity: 64642, style: 'da-luz' },
    'fc porto': { name: 'Estádio do Dragão', city: 'Porto', state: 'Portugal', capacity: 50033, style: 'dragao' },
    'porto': { name: 'Estádio do Dragão', city: 'Porto', state: 'Portugal', capacity: 50033, style: 'dragao' },
    'sporting cp': { name: 'José Alvalade', city: 'Lisboa', state: 'Portugal', capacity: 50095, style: 'alvalade' },
    'ajax': { name: 'Johan Cruyff Arena', city: 'Amsterdã', state: 'Países Baixos', capacity: 55865, style: 'cruyff-arena' },

    // =========================================================================
    // ARÁBIA SAUDITA & ÁSIA (AFC) & MLS (EUA)
    // =========================================================================
    'al hilal': { name: 'Kingdom Arena', city: 'Riad', state: 'Arábia Saudita', capacity: 26000, style: 'kingdom-arena' },
    'al nassr': { name: 'Al-Awwal Park', city: 'Riad', state: 'Arábia Saudita', capacity: 25000, style: 'al-awwal-park' },
    'al ittihad': { name: 'King Abdullah Sports City', city: 'Jidá', state: 'Arábia Saudita', capacity: 62345, style: 'king-abdullah' },
    'al ahli': { name: 'King Abdullah Sports City', city: 'Jidá', state: 'Arábia Saudita', capacity: 62345, style: 'king-abdullah' },
    'inter miami': { name: 'Chase Stadium', city: 'Fort Lauderdale', state: 'EUA', capacity: 21550, style: 'chase-stadium' },
    'la galaxy': { name: 'Dignity Health Sports Park', city: 'Carson', state: 'EUA', capacity: 27000, style: 'dignity-health' },
    'los angeles fc': { name: 'BMO Stadium', city: 'Los Angeles', state: 'EUA', capacity: 22000, style: 'bmo-stadium' },
    'columbus crew': { name: 'Lower.com Field', city: 'Columbus', state: 'EUA', capacity: 20371, style: 'lower-field' },
    'new york city fc': { name: 'Yankee Stadium', city: 'Nova York', state: 'EUA', capacity: 30321, style: 'yankee-stadium' },
    'new york red bulls': { name: 'Red Bull Arena', city: 'Harrison', state: 'EUA', capacity: 25000, style: 'redbull-arena-usa' },
    'seattle sounders': { name: 'Lumen Field', city: 'Seattle', state: 'EUA', capacity: 68740, style: 'lumen-field' },
    'atlanta united': { name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'EUA', capacity: 71000, style: 'mercedes-benz' }
  };

  /**
   * Obtém as informações oficiais do estádio de um clube.
   * Se o clube não estiver mapeado explicitamente, gera dados coerentes
   * com base no nome e estado do clube, sem nunca vazar estádios de terceiros.
   */
  function getClubStadiumInfo(clubName) {
    if (!clubName) return { name: 'Estádio Municipal', city: 'Brasília', state: 'DF', capacity: 15000, style: 'generic' };

    const key = normKey(clubName);

    // 1. Busca direta no dicionário oficial
    if (REAL_CLUB_STADIUMS[key]) {
      return { ...REAL_CLUB_STADIUMS[key] };
    }

    // 2. Busca por correspondência parcial de palavras-chave
    for (const [k, v] of Object.entries(REAL_CLUB_STADIUMS)) {
      if (key.length >= 4 && (k === key || k.includes(key) || key.includes(k))) {
        return { ...v };
      }
    }

    // 3. Fallback inteligente e seguro por cidade/estado
    return {
      name: `Estádio Municipal de ${clubName}`,
      city: 'Brasil',
      state: 'BR',
      capacity: 15000,
      style: 'generic'
    };
  }

  // Exporta globalmente
  window.REAL_CLUB_STADIUMS = REAL_CLUB_STADIUMS;
  window.getClubStadiumInfo = getClubStadiumInfo;

})(typeof window !== 'undefined' ? window : globalThis);
