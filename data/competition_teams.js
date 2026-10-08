/* Clubes por competição. Listas brasileiras de 2026 e principais ligas internacionais.
   O mesmo clube pode aparecer em mais de uma competição sem mudar sua competição principal. */
window.COMPETITION_TEAMS = {
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
    'ABC','ABECAT','Água Santa','Águia de Marabá','Altos','America-RJ','América-RN','Aparecidense','Araguaína','ASA','Atlético-BA','Atlético-CE','Azuriz','Betim','Blumenau','Brasil de Pelotas','Brasiliense','Capital-DF','Ceilândia','Central','Cianorte','CRAC','CSA','CSE','Decisão','Democrata GV','FC Cascavel','Ferroviário','Fluminense-PI','Galvez','Gama','GAS','Goiatuba','Guaporé','Guarany de Bagé','Humaitá','IAPE','Iguatu','Imperatriz','Independência','Inhumas','Jacuipense','Joinville','Juazeirense','Lagarto','Laguna','Luverdense','Madureira','Maguary','Manaus','Manauara','Marcílio Dias','Maracanã','Maricá','Mixto-MT','Monte Roraima','Moto Club','Nacional-AM','Noroeste','Nova Iguaçu','Operário-MS','Operário VG','Oratório','Pantanal','Parnahyba','Piauí','Porto-BA','Porto Velho','Portuguesa-SP','Portuguesa-RJ','Pouso Alegre','Primavera-MT','Real Noroeste','Retrô','Rio Branco-ES','Sampaio Corrêa-MA','Sampaio Corrêa-RJ','Santa Catarina','São José-RS','São Joseense','São Luiz','São Raimundo-RR','Serra Branca','Sergipe','Sousa','Tirol','Tocantinópolis','Tombense','Treze','Trem','Tuna Luso','Uberlândia','União Rondonópolis','Velo Clube','Vitória-ES','XV de Piracicaba'
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
  'uae-1': ['Al-Ain','Shabab Al-Ahli','Al-Wasl','Al-Jazira','Al-Wahda','Sharjah','Baniyas','Ajman','Al-Nasr Dubai','Khor Fakkan','Kalba','Al-Bataeh','Dibba Al-Hisn','Al-Orooba']
};
