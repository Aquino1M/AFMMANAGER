/* Clubes por competição. Listas brasileiras de 2026 e principais ligas internacionais.
   O mesmo clube pode aparecer em mais de uma competição sem mudar sua competição principal. */
window.COMPETITION_TEAMS = {
  'usa-1': [
  "Inter Miami",
  "Los Angeles FC",
  "LA Galaxy",
  "Columbus Crew",
  "New York City FC",
  "New York Red Bulls",
  "Seattle Sounders",
  "Atlanta United",
  "FC Cincinnati",
  "Orlando City",
  "Philadelphia Union",
  "Houston Dynamo",
  "Portland Timbers",
  "Austin FC",
  "Sporting Kansas City",
  "Nashville SC",
  "Real Salt Lake",
  "Minnesota United",
  "St. Louis City SC",
  "Chicago Fire"
],
  'bra-a': [
    'Athletico Paranaense','Atlético-MG','Bahia','Botafogo','Chapecoense','Corinthians','Coritiba','Cruzeiro','Flamengo','Fluminense','Grêmio','Internacional','Mirassol','Palmeiras','Bragantino','Remo','Santos','São Paulo','Vasco da Gama','Vitória'
  ],
  'bra-b': [
    'América-MG','Athletic Club','Atlético-GO','Avaí','Botafogo-SP','Ceará','CRB','Criciúma','Cuiabá','Fortaleza','Goiás','Juventude','Londrina','Náutico','Novorizontino','Operário-PR','Ponte Preta','São Bernardo','Sport','Vila Nova'
  ],
  'bra-c': [
    'Amazonas FC','Anápolis','Barra-SC','Botafogo-PB','Brusque','Caxias','Confiança','Ferroviária','Figueirense','Floresta','Guarani','Inter de Limeira','Itabaiana','Ituano','Maranhão','Maringá','Paysandu','Santa Cruz','Volta Redonda','Ypiranga-RS'
  ],
  'bra-d': [
    'ABC','ABECAT','Água Santa','Águia de Marabá','Altos','America-RJ','América-RN','Aparecidense','Araguaína','ASA','Atlético-BA','Atlético-CE','Azuriz','Betim','Blumenau','Brasil de Pelotas','Brasiliense','Capital-DF','Ceilândia','Central','Cianorte','CRAC','CSA','CSE','Decisão','Democrata GV','FC Cascavel','Ferroviário','Fluminense-PI','Galvez','Gama','GAS','Goiatuba','Guaporé','Guarany de Bagé','Humaitá','IAPE','Iguatu','Imperatriz','Independência','Inhumas','Ivinhema','Jacuipense','Joinville','Juazeirense','Lagarto','Laguna','Luverdense','Madureira','Maguary','Manaus','Manauara','Marcílio Dias','Maracanã','Maricá','Mixto-MT','Monte Roraima','Moto Club','Nacional-AM','Noroeste','Nova Iguaçu','Operário-MS','Operário VG','Oratório','Parnahyba','Piauí','Porto-BA','Porto Velho','Portuguesa-SP','Portuguesa-RJ','Pouso Alegre','Primavera-MT','Real Noroeste','Retrô','Rio Branco-ES','Sampaio Corrêa-MA','Sampaio Corrêa-RJ','Santa Catarina','São José-RS','São Joseense','São Luiz','São Raimundo-RR','Serra Branca','Sergipe','Sousa','Tirol','Tocantinópolis','Tombense','Treze','Trem','Tuna Luso','Uberlândia','União Rondonópolis','Velo Clube','Vitória-ES','XV de Piracicaba'
  ],
  'bra-est-df': ['ARUC','Brasília','Brasiliense','Capital-DF','Ceilândia','Gama','Paranoá','Real Brasília','Samambaia','Sobradinho'],
  'bra-est-sp': ['Corinthians','Palmeiras','São Paulo','Santos','Bragantino','Mirassol','Novorizontino','Ponte Preta','São Bernardo','Guarani','Inter de Limeira','Ituano','Água Santa','Portuguesa-SP','Botafogo-SP','Velo Clube'],
  'bra-est-rj': ['Flamengo','Fluminense','Botafogo','Vasco da Gama','Volta Redonda','Nova Iguaçu','Madureira','Portuguesa-RJ','Bangu','Boavista','Sampaio Corrêa-RJ','Maricá'],
  'bra-est-mg': ['Atlético-MG','Cruzeiro','América-MG','Athletic Club','Tombense','Pouso Alegre','Villa Nova','Democrata GV','Uberlândia','Betim','Ipatinga','Itabirito'],
  'bra-est-rs': ['Grêmio','Internacional','Juventude','Caxias','Ypiranga-RS','Brasil de Pelotas','São José-RS','São Luiz','Avenida','Monsoon','Guarany de Bagé','Novo Hamburgo'],
  'bra-est-pr': ['Athletico Paranaense','Coritiba','Operário-PR','Londrina','Maringá','FC Cascavel','Azuriz','Cianorte','São Joseense','Andraus'],
  'bra-est-sc': ['Criciúma','Chapecoense','Avaí','Figueirense','Brusque','Marcílio Dias','Joinville','Barra-SC','Santa Catarina','Concórdia'],
  'bra-est-ba': ['Bahia','Vitória','Jacuipense','Juazeirense','Atlético-BA','Barcelona-BA','Jequié','Bahia de Feira','Itabuna','Porto-BA'],
  'bra-est-ce': ['Fortaleza','Ceará','Ferroviário','Floresta','Iguatu','Atlético-CE','Maracanã','Horizonte','Barbalha','Caucaia'],
  'bra-est-go': ['Goiás','Atlético-GO','Vila Nova','Anápolis','Aparecidense','CRAC','Goianésia','Goiatuba','Iporá','Morrinhos'],
  'bra-est-pe': ['Sport','Náutico','Santa Cruz','Retrô','Central','Maguary','Afogados','Petrolina','Porto-PE','Flamengo de Arcoverde'],
  'lib': ['Palmeiras','Flamengo','Botafogo','Atlético-MG','São Paulo','Fluminense','River Plate','Boca Juniors','Racing Club','Peñarol','Nacional','LDU Quito','Colo-Colo','Olimpia','Bolívar','Independiente del Valle'],
  'sud': ['Corinthians','Cruzeiro','Athletico Paranaense','Fortaleza','Internacional','Bahia','Lanús','Independiente','San Lorenzo','Estudiantes','Universidad de Chile','América de Cali','Guaraní','Libertad','Danubio','Palestino'],
  'cwc': ['Real Madrid','Manchester City','Bayern München','Paris Saint-Germain','Chelsea','Inter','Flamengo','Palmeiras','Fluminense','River Plate','Boca Juniors','Al-Hilal'],
  'bra-cup': ['Flamengo','Palmeiras','São Paulo','Corinthians','Atlético-MG','Cruzeiro','Grêmio','Internacional','Fluminense','Botafogo','Vasco da Gama','Bahia','Athletico Paranaense','Fortaleza','Ceará','Sport'],
  'eng-1': ['Arsenal','Aston Villa','Bournemouth','Brentford','Brighton & Hove Albion','Burnley','Chelsea','Crystal Palace','Everton','Fulham','Leeds United','Liverpool','Manchester City','Manchester United','Newcastle United','Nottingham Forest','Sunderland','Tottenham Hotspur','West Ham United','Wolverhampton Wanderers'],
  'esp-1': ['Athletic Club','Atlético de Madrid','FC Barcelona','Celta de Vigo','Alavés','Elche','Espanyol','Getafe','Girona','Levante','Mallorca','Osasuna','Real Oviedo','Rayo Vallecano','Real Betis','Real Madrid','Real Sociedad','Sevilla','Valencia','Villarreal'],
  'ita-1': ['Atalanta','Bologna','Cagliari','Como','Cremonese','Fiorentina','Genoa','Inter','Juventus','Lazio','Lecce','AC Milan','Napoli','Parma','Pisa','Roma','Sassuolo','Torino','Udinese','Hellas Verona'],
  'ger-1': ['Bayern München','Bayer Leverkusen','Borussia Dortmund','Eintracht Frankfurt','SC Freiburg','Mainz 05','RB Leipzig','Werder Bremen','Hoffenheim','Borussia Mönchengladbach','VfB Stuttgart','Wolfsburg','Augsburg','Union Berlin','St. Pauli','Hamburger SV','Köln','Heidenheim'],
  'fra-1': ['Paris Saint-Germain','Marseille','Monaco','Nice','Lille','Lyon','Strasbourg','Lens','Brest','Toulouse','Auxerre','Rennes','Nantes','Angers','Le Havre','Lorient','Metz','Paris FC'],
  'por-1': ['Benfica','FC Porto','Sporting CP','Braga','Vitória de Guimarães','Famalicão','Estoril','Casa Pia','Moreirense','Rio Ave','Arouca','Gil Vicente','Santa Clara','Nacional','Estrela Amadora','Alverca','Tondela','AVS'],
  'ned-1': ['Ajax','PSV','Feyenoord','AZ Alkmaar','Twente','Utrecht','Go Ahead Eagles','NEC','Heerenveen','PEC Zwolle','Fortuna Sittard','Sparta Rotterdam','Groningen','Heracles','NAC Breda','Excelsior','Volendam','Telstar'],
  'ksa-1': ['Al-Hilal','Al-Nassr','Al-Ittihad','Al-Ahli','Al-Qadsiah','Al-Ettifaq','Al-Taawoun','Al-Shabab','Al-Fateh','Al-Fayha','Al-Khaleej','Al-Riyadh','Damac','Al-Kholood','Al-Hazem','Neom SC','Al-Najma','Al-Okhdood'],
  'jpn-1': ['Kashima Antlers','Urawa Red Diamonds','Yokohama F. Marinos','Vissel Kobe','Kawasaki Frontale','Sanfrecce Hiroshima','FC Tokyo','Gamba Osaka','Cerezo Osaka','Nagoya Grampus','Kashiwa Reysol','Tokyo Verdy','Machida Zelvia','Avispa Fukuoka','Albirex Niigata','Shonan Bellmare','Kyoto Sanga','Fagiano Okayama','Yokohama FC','Shimizu S-Pulse'],
  'kor-1': ['Ulsan HD','Jeonbuk Hyundai Motors','Pohang Steelers','FC Seoul','Gimcheon Sangmu','Daejeon Hana Citizen','Gangwon FC','Gwangju FC','Jeju SK','Suwon FC','Daegu FC','Anyang'],
  'chn-1': ['Shanghai Port','Shanghai Shenhua','Beijing Guoan','Shandong Taishan','Chengdu Rongcheng','Zhejiang','Tianjin Jinmen Tiger','Henan','Wuhan Three Towns','Qingdao Hainiu','Qingdao West Coast','Shenzhen Peng City','Yunnan Yukun','Dalian Yingbo','Changchun Yatai','Meizhou Hakka'],
  'qat-1': ['Al-Sadd','Al-Duhail','Al-Rayyan','Al-Gharafa','Al-Arabi','Al-Wakrah','Umm Salal','Qatar SC','Al-Shamal','Al-Ahli Doha','Al-Shahania','Al-Khor'],
  'uae-1': ['Al-Ain','Shabab Al-Ahli','Al-Wasl','Al-Jazira','Al-Wahda','Sharjah','Baniyas','Ajman','Al-Nasr Dubai','Khor Fakkan','Kalba','Al-Bataeh','Dibba Al-Hisn','Al-Orooba'],

  // ==========================================
  // AMÉRICA DO SUL (EXPANSÃO OFICIAL CONMEBOL)
  // ==========================================
  'arg-1': [
    'River Plate','Boca Juniors','Racing Club','Independiente','San Lorenzo','Estudiantes','Vélez Sarsfield','Lanús','Talleres','Rosario Central','Newell\'s Old Boys','Argentinos Juniors','Belgrano','Godoy Cruz','Huracán','Defensa y Justicia','Banfield','Gimnasia La Plata','Unión','Platense','Atlético Tucumán','Barracas Central','Tigre','Sarmiento','Instituto','Deportivo Riestra','Independiente Rivadavia','Central Córdoba','Aldosivi','San Martín de San Juan'
  ],
  'arg-2': [
    'Quilmes','Ferro Carril Oeste','Chacarita Juniors','All Boys','San Martín de Tucumán','Nueva Chicago','Colón','Arsenal de Sarandí','Almirante Brown','Atlanta','Deportivo Morón','Temperley','Defensores de Belgrano','Gimnasia y Esgrima de Mendoza','Estudiantes de Río Cuarto','Patronato','Agropecuario','Alvarado','Chaco For Ever','Mitre'
  ],
  'chi-1': [
    'Colo-Colo','Universidad de Chile','Universidad Católica','Palestino','Everton','Unión Española','Coquimbo Unido','Ñublense','Cobreloa','Cobresal','O\'Higgins','Audax Italiano','Huachipato','Deportes Iquique','Deportes Copiapó','Deportes La Serena'
  ],
  'chi-2': [
    'Santiago Wanderers','Rangers de Talca','Deportes Antofagasta','San Luis de Quillota','Magallanes','Deportes Temuco','Curicó Unido','Deportes Recoleta','Deportes Santa Cruz','San Marcos de Arica','Universidad de Concepción','Barnechea','Unión San Felipe','Deportes Limache'
  ],
  'uru-1': [
    'Peñarol','Nacional','Danubio','Defensor Sporting','Liverpool','Montevideo Wanderers','River Plate URU','Cerro Largo','Boston River','Racing Montevideo','Progreso','Fénix','Deportivo Maldonado','Rampla Juniors','Miramar Misiones','Cerro'
  ],
  'uru-2': [
    'Plaza Colonia','Rentistas','Uruguay Montevideo','Juventud de Las Piedras','Oriental','Albion','Sud América','Atenas','La Luz','Cerrito','Colón FC','Cooper'
  ],
  'col-1': [
    'Atlético Nacional','Millonarios','América de Cali','Santa Fe','Junior','Independiente Medellín','Deportes Tolima','Deportivo Cali','Once Caldas','Deportivo Pereira','La Equidad','Águilas Doradas','Atlético Bucaramanga','Fortaleza CEIF','Alianza FC','Deportivo Pasto','Envigado','Patriotas','Jaguares','Boyacá Chicó'
  ],
  'col-2': [
    'Cúcuta Deportivo','Real Cartagena','Unión Magdalena','Llaneros','Deportes Quindío','Atlético Huila','Leones','Real Soacha','Real Santander','Boca Juniors de Cali','Barranquilla FC','Orsomarso','Bogotá FC','Tigres FC','Atlético FC','Internacional de Palmira'
  ],
  'par-1': [
    'Olimpia','Cerro Porteño','Libertad','Guaraní','Nacional','Sportivo Luqueño','2 de Mayo','Tacuary','Sol de América','General Caballero','Trinidense','Sportivo Ameliano'
  ],
  'par-2': [
    'Resistencia','Guaireña','Rubio Ñu','San Lorenzo PAR','Fernando de la Mora','Deportivo Santaní','Deportivo Recoleta','Encarnación FC','Martín Ledesma','Pastoreo','3 de Febrero','Colegiales'
  ],
  'ecu-1': [
    'LDU Quito','Independiente del Valle','Barcelona SC','Emelec','Universidad Católica ECU','Aucas','El Nacional','Delfín','Macará','Deportivo Cuenca','Mushuc Runa','Orense','Técnico Universitario','Imbabura','Cumbayá','Libertad FC'
  ],
  'ecu-2': [
    'Guayaquil City','Manta FC','9 de Octubre','Cuniburo','Gualaceo','Chacaritas','Leones del Norte','San Antonio','Vargas Torres','Independiente Juniors'
  ],
  'per-1': [
    'Universitario','Alianza Lima','Sporting Cristal','Melgar','Cusco FC','Cienciano','ADT','Atlético Grau','Deportivo Garcilaso','Sport Huancayo','Los Chankas','César Vallejo','UTC','Sport Boys','Alianza Atlético','Carlos A. Mannucci','Comerciantes Unidos','Unión Comercio'
  ],
  'bol-1': [
    'Bolívar','The Strongest','Always Ready','Jorge Wilstermann','Oriente Petrolero','Blooming','Nacional Potosí','Aurora','Real Tomayapo','San Antonio Bulo Bulo','GV San José','Guabirá','Royal Pari','Independiente Petrolero','Real Santa Cruz','Universitario de Vinto'
  ],
  'ven-1': [
    'Deportivo Táchira','Caracas FC','Carabobo','Deportivo La Guaira','Monagas','Metropolitanos','Puerto Cabello','Portuguesa FC','Estudiantes de Mérida','Angostura','Rayo Zuliano','Zamora','UCV FC','Inter de Barinas'
  ],

  // ==========================================
  // EUROPA (EXPANSÃO DE 2ª/3ª DIVISÕES E LIGAS)
  // ==========================================
  'eng-2': [
    'Burnley','Sheffield United','Leeds United','Sunderland','Luton Town','Middlesbrough','Norwich City','Watford','West Bromwich Albion','Blackburn Rovers','Coventry City','Bristol City','Millwall','Swansea City','Stoke City','Queens Park Rangers','Preston North End','Plymouth Argyle','Hull City','Cardiff City','Sheffield Wednesday','Derby County','Oxford United','Portsmouth'
  ],
  'eng-3': [
    'Birmingham City','Wrexham','Huddersfield Town','Charlton Athletic','Barnsley','Bolton Wanderers','Stockport County','Lincoln City','Reading','Peterborough United','Blackpool','Rotherham United','Wycombe Wanderers','Wigan Athletic','Leyton Orient','Exeter City','Bristol Rovers','Mansfield Town','Stevenage','Northampton Town','Burton Albion','Cambridge United','Crawley Town','Shrewsbury Town'
  ],
  'esp-2': [
    'Cádiz','Almería','Granada','Levante','Real Oviedo','Sporting Gijón','Racing Santander','Elche','Eibar','Tenerife','Burgos','Racing Ferrol','Albacete','Cartagena','Zaragoza','Eldense','Huesca','Mirandés','Deportivo La Coruña','Castellón','Málaga','Córdoba'
  ],
  'ita-2': [
    'Sassuolo','Salernitana','Frosinone','Cremonese','Catanzaro','Palermo','Sampdoria','Brescia','Cosenza','Modena','Reggiana','Südtirol','Pisa','Bari','Spezia','Cittadella','Mantova','Cesena','Juve Stabia','Carrarese'
  ],
  'ger-2': [
    'Köln','Darmstadt','Fortuna Düsseldorf','Hamburger SV','Karlsruher SC','Hannover 96','Paderborn','Greuther Fürth','Hertha BSC','Schalke 04','Elversberg','Nürnberg','Kaiserslautern','Magdeburg','Eintracht Braunschweig','Ulm','Preußen Münster','Jahn Regensburg'
  ],
  'fra-2': [
    'Metz','Lorient','Clermont','Rodez','Paris FC','Caen','Guingamp','Laval','Pau','Amiens','Bastia','Annecy','Ajaccio','Dunkerque','Troyes','Red Star','Martigues','Grenoble'
  ],
  'por-2': [
    'Vizela','Chaves','Portimonense','Marítimo','Paços de Ferreira','Tondela','Torreense','Benfica B','Porto B','Leixões','Mafra','Académico de Viseu','Feirense','Oliveirense','Penafiel','União de Leiria','Alverca','Felgueiras'
  ],
  'ned-2': [
    'Vitesse','Excelsior','Volendam','Roda JC','Dordrecht','ADO Den Haag','De Graafschap','Emmen','MVV Maastricht','Cambuur','Jong AZ','Helmond Sport','VVV-Venlo','TOP Oss','FC Eindhoven','Den Bosch','Jong Ajax','Jong PSV','Jong FC Utrecht','Telstar'
  ],
  'bel-1': [
    'Club Brugge','Union Saint-Gilloise','Anderlecht','Genk','Antwerp','Gent','Cercle Brugge','Mechelen','Sint-Truiden','Standard Liège','Westerlo','Charleroi','OH Leuven','Kortrijk','Dender','Beerschot'
  ],
  'tur-1': [
    'Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Kasımpaşa','Alanyaspor','Rizespor','Antalyaspor','Gaziantep','Samsunspor','Kayserispor','Konyaspor','Eyüpspor','Göztepe','Kocaelispor','Gençlerbirliği','Fatih Karagümrük'
  ],
  'sco-1': [
    'Celtic','Rangers','Hearts','Kilmarnock','St. Mirren','Dundee','Aberdeen','Hibernian','Motherwell','St. Johnstone','Ross County','Dundee United'
  ],
  'ucl': [
    'Real Madrid','Manchester City','Bayern München','Paris Saint-Germain','Liverpool','Inter','Borussia Dortmund','RB Leipzig','Barcelona','Bayer Leverkusen','Atlético de Madrid','Atalanta','Juventus','Benfica','Arsenal','Club Brugge','Shakhtar Donetsk','AC Milan','Feyenoord','Sporting CP','PSV','Dinamo Zagreb','Salzburg','Lille','Crvena zvezda','Young Boys','Celtic','Slovan Bratislava','Monaco','Sparta Praha','Aston Villa','Bologna','Girona','VfB Stuttgart','Sturm Graz','Brest'
  ],
  'uel': [
    'Roma','Manchester United','FC Porto','Ajax','Rangers','Eintracht Frankfurt','Lazio','Tottenham Hotspur','Slavia Praha','Real Sociedad','AZ Alkmaar','Braga','Olympiacos','Lyon','PAOK','Fenerbahçe','Maccabi Tel Aviv','Ferencváros','Qarabağ','Galatasaray','Viktoria Plzeň','Bodø/Glimt','Union Saint-Gilloise','Dynamo Kyiv','Ludogorets','Midtjylland','Malmö FF','Athletic Club','Hoffenheim','Nice','Anderlecht','Twente','Beşiktaş','FCSB','RFS','Elfsborg'
  ],
  'afc-el': [
    'Al-Hilal','Al-Nassr','Al-Ittihad','Al-Ahli',
    'Vissel Kobe','Yokohama F. Marinos','Kawasaki Frontale','Sanfrecce Hiroshima',
    'Ulsan HD','Pohang Steelers','Gwangju FC','Jeonbuk Hyundai Motors',
    'Al-Ain','Al-Wasl','Shabab Al-Ahli','Sharjah',
    'Al-Sadd','Al-Duhail','Al-Rayyan','Al-Gharafa',
    'Shanghai Port','Shanghai Shenhua','Shandong Taishan','Central Coast Mariners'
  ]
};

