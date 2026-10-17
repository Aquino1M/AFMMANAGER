const fs = require('fs');

const mlsAdditionalPlayers = [
  // Inter Miami complementos
  {name:'Leonardo Campana',club:'Inter Miami',country:'Equador',pos:'ST',age:24,fc:75,pes:75,potential:79,value:3.5,number:8},
  {name:'Matías Rojas',club:'Inter Miami',country:'Paraguai',pos:'AM',age:28,fc:76,pes:76,potential:76,value:4.0,number:7},
  {name:'Robert Taylor',club:'Inter Miami',country:'Finlândia',pos:'LW',age:29,fc:73,pes:73,potential:73,value:2.0,number:16},
  {name:'Benjamin Cremaschi',club:'Inter Miami',country:'Estados Unidos',pos:'CM',age:19,fc:73,pes:73,potential:83,value:3.2,number:30},
  {name:'Nicolás Freire',club:'Inter Miami',country:'Argentina',pos:'CB',age:30,fc:74,pes:74,potential:74,value:2.2,number:21},
  {name:'CJ dos Santos',club:'Inter Miami',country:'Estados Unidos',pos:'GK',age:23,fc:68,pes:68,potential:74,value:0.8,number:99},
  {name:'Sergiy Kryvtsov',club:'Inter Miami',country:'Ucrânia',pos:'CB',age:33,fc:72,pes:72,potential:72,value:1.2,number:27},
  {name:'Noah Allen',club:'Inter Miami',country:'Estados Unidos',pos:'LB',age:20,fc:70,pes:70,potential:79,value:1.5,number:32},
  {name:'Ian Fray',club:'Inter Miami',country:'Estados Unidos',pos:'RB',age:22,fc:70,pes:70,potential:78,value:1.4,number:17},
  {name:'Yannick Bright',club:'Inter Miami',country:'Itália',pos:'DM',age:23,fc:71,pes:71,potential:77,value:1.6,number:42},

  // Los Angeles FC (LAFC)
  {name:'Hugo Lloris',club:'Los Angeles FC',country:'França',pos:'GK',age:37,fc:81,pes:81,potential:81,value:2.8,number:1},
  {name:'Sergi Palencia',club:'Los Angeles FC',country:'Espanha',pos:'RB',age:28,fc:74,pes:74,potential:74,value:2.5,number:14},
  {name:'Jesús Murillo',club:'Los Angeles FC',country:'Colômbia',pos:'CB',age:30,fc:75,pes:75,potential:75,value:2.8,number:3},
  {name:'Aaron Long',club:'Los Angeles FC',country:'Estados Unidos',pos:'CB',age:31,fc:74,pes:74,potential:74,value:2.2,number:33},
  {name:'Ryan Hollingshead',club:'Los Angeles FC',country:'Estados Unidos',pos:'LB',age:33,fc:74,pes:74,potential:74,value:1.8,number:24},
  {name:'Eduard Atuesta',club:'Los Angeles FC',country:'Colômbia',pos:'DM',age:27,fc:76,pes:76,potential:77,value:4.5,number:20},
  {name:'Timothy Tillman',club:'Los Angeles FC',country:'Estados Unidos',pos:'CM',age:25,fc:75,pes:75,potential:78,value:3.8,number:11},
  {name:'Mateusz Bogusz',club:'Los Angeles FC',country:'Polônia',pos:'AM',age:23,fc:77,pes:77,potential:82,value:6.5,number:19},
  {name:'Cristian Olivera',club:'Los Angeles FC',country:'Uruguai',pos:'RW',age:22,fc:75,pes:75,potential:81,value:4.5,number:27},
  {name:'Denis Bouanga',club:'Los Angeles FC',country:'Gabão',pos:'LW',age:29,fc:81,pes:81,potential:81,value:10.0,number:99},
  {name:'Olivier Giroud',club:'Los Angeles FC',country:'França',pos:'ST',age:38,fc:82,pes:82,potential:82,value:4.0,number:9},
  {name:'Thomas Hasal',club:'Los Angeles FC',country:'Canadá',pos:'GK',age:25,fc:68,pes:68,potential:73,value:0.8,number:12},
  {name:'Eddie Segura',club:'Los Angeles FC',country:'Colômbia',pos:'CB',age:27,fc:72,pes:72,potential:73,value:1.8,number:4},
  {name:'Omar Campos',club:'Los Angeles FC',country:'México',pos:'LB',age:22,fc:73,pes:73,potential:80,value:3.0,number:2},
  {name:'Ilie Sánchez',club:'Los Angeles FC',country:'Espanha',pos:'DM',age:33,fc:73,pes:73,potential:73,value:1.5,number:6},
  {name:'Kei Kamara',club:'Los Angeles FC',country:'Serra Leoa',pos:'ST',age:40,fc:71,pes:71,potential:71,value:0.5,number:23},

  // LA Galaxy
  {name:'John McCarthy',club:'LA Galaxy',country:'Estados Unidos',pos:'GK',age:32,fc:73,pes:73,potential:73,value:1.5,number:77},
  {name:'Miki Yamane',club:'LA Galaxy',country:'Japão',pos:'RB',age:30,fc:74,pes:74,potential:74,value:2.2,number:2},
  {name:'Maya Yoshida',club:'LA Galaxy',country:'Japão',pos:'CB',age:36,fc:74,pes:74,potential:74,value:1.2,number:4},
  {name:'Jalen Neal',club:'LA Galaxy',country:'Estados Unidos',pos:'CB',age:21,fc:73,pes:73,potential:81,value:3.0,number:24},
  {name:'Julián Aude',club:'LA Galaxy',country:'Argentina',pos:'LB',age:21,fc:73,pes:73,potential:80,value:2.8,number:3},
  {name:'Gastón Brugman',club:'LA Galaxy',country:'Uruguai',pos:'DM',age:31,fc:75,pes:75,potential:75,value:3.0,number:5},
  {name:'Mark Delgado',club:'LA Galaxy',country:'Estados Unidos',pos:'CM',age:29,fc:74,pes:74,potential:74,value:2.5,number:8},
  {name:'Riqui Puig',club:'LA Galaxy',country:'Espanha',pos:'CM',age:25,fc:81,pes:81,potential:83,value:15.0,number:10},
  {name:'Marco Reus',club:'LA Galaxy',country:'Alemanha',pos:'AM',age:35,fc:82,pes:82,potential:82,value:5.0,number:18},
  {name:'Gabriel Pec',club:'LA Galaxy',country:'Brasil',pos:'RW',age:23,fc:78,pes:78,potential:83,value:8.5,number:11},
  {name:'Joseph Paintsil',club:'LA Galaxy',country:'Gana',pos:'LW',age:26,fc:79,pes:79,potential:80,value:9.5,number:28},
  {name:'Dejan Joveljic',club:'LA Galaxy',country:'Sérvia',pos:'ST',age:25,fc:77,pes:77,potential:80,value:6.0,number:9},
  {name:'Novak Micovic',club:'LA Galaxy',country:'Sérvia',pos:'GK',age:23,fc:70,pes:70,potential:76,value:1.2,number:35},
  {name:'Emiro Garcés',club:'LA Galaxy',country:'Colômbia',pos:'CB',age:22,fc:71,pes:71,potential:78,value:1.8,number:14},
  {name:'Edwin Cerrillo',club:'LA Galaxy',country:'Estados Unidos',pos:'DM',age:23,fc:72,pes:72,potential:77,value:1.8,number:20},
  {name:'Diego Fagúndez',club:'LA Galaxy',country:'Uruguai',pos:'LW',age:29,fc:73,pes:73,potential:73,value:2.0,number:7},

  // Columbus Crew
  {name:'Patrick Schulte',club:'Columbus Crew',country:'Estados Unidos',pos:'GK',age:23,fc:75,pes:75,potential:81,value:3.5,number:28},
  {name:'Steven Moreira',club:'Columbus Crew',country:'Cabo Verde',pos:'RB',age:30,fc:76,pes:76,potential:76,value:3.0,number:31},
  {name:'Rudy Camacho',club:'Columbus Crew',country:'França',pos:'CB',age:33,fc:74,pes:74,potential:74,value:1.5,number:4},
  {name:'Malte Amundsen',club:'Columbus Crew',country:'Dinamarca',pos:'LB',age:26,fc:74,pes:74,potential:76,value:2.8,number:18},
  {name:'Darlington Nagbe',club:'Columbus Crew',country:'Estados Unidos',pos:'CM',age:34,fc:76,pes:76,potential:76,value:2.5,number:6},
  {name:'Sean Zawadzki',club:'Columbus Crew',country:'Estados Unidos',pos:'DM',age:24,fc:73,pes:73,potential:77,value:2.0,number:25},
  {name:'Max Arfsten',club:'Columbus Crew',country:'Estados Unidos',pos:'LM',age:23,fc:73,pes:73,potential:78,value:2.2,number:27},
  {name:'Mohamed Farsi',club:'Columbus Crew',country:'Argélia',pos:'RM',age:24,fc:74,pes:74,potential:78,value:2.8,number:23},
  {name:'Diego Rossi',club:'Columbus Crew',country:'Uruguai',pos:'LW',age:26,fc:79,pes:79,potential:80,value:9.0,number:10},
  {name:'Cucho Hernández',club:'Columbus Crew',country:'Colômbia',pos:'ST',age:25,fc:81,pes:81,potential:83,value:14.0,number:9},
  {name:'Christian Ramírez',club:'Columbus Crew',country:'Estados Unidos',pos:'ST',age:33,fc:74,pes:74,potential:74,value:1.8,number:17},
  {name:'Nicholas Hagen',club:'Columbus Crew',country:'Guatemala',pos:'GK',age:28,fc:69,pes:69,potential:70,value:0.8,number:1},
  {name:'Yevhen Cheberko',club:'Columbus Crew',country:'Ucrânia',pos:'CB',age:26,fc:72,pes:72,potential:74,value:1.8,number:21},
  {name:'Alexandru Matan',club:'Columbus Crew',country:'Romênia',pos:'AM',age:25,fc:74,pes:74,potential:77,value:3.0,number:20},

  // FC Cincinnati
  {name:'Roman Celentano',club:'FC Cincinnati',country:'Estados Unidos',pos:'GK',age:24,fc:75,pes:75,potential:80,value:3.2,number:18},
  {name:'Miles Robinson',club:'FC Cincinnati',country:'Estados Unidos',pos:'CB',age:27,fc:77,pes:77,potential:78,value:5.5,number:33},
  {name:'Matt Miazga',club:'FC Cincinnati',country:'Estados Unidos',pos:'CB',age:29,fc:75,pes:75,potential:75,value:3.0,number:21},
  {name:'Ian Murphy',club:'FC Cincinnati',country:'Estados Unidos',pos:'CB',age:24,fc:73,pes:73,potential:77,value:2.0,number:32},
  {name:'DeAndre Yedlin',club:'FC Cincinnati',country:'Estados Unidos',pos:'RB',age:31,fc:74,pes:74,potential:74,value:2.2,number:91},
  {name:'Luca Orellano',club:'FC Cincinnati',country:'Argentina',pos:'LB',age:24,fc:77,pes:77,potential:81,value:6.0,number:23},
  {name:'Obinna Nwobodo',club:'FC Cincinnati',country:'Nigéria',pos:'DM',age:27,fc:76,pes:76,potential:77,value:4.0,number:5},
  {name:'Pavel Bucha',club:'FC Cincinnati',country:'Tchéquia',pos:'CM',age:26,fc:75,pes:75,potential:77,value:3.5,number:20},
  {name:'Luciano Acosta',club:'FC Cincinnati',country:'Argentina',pos:'AM',age:30,fc:81,pes:81,potential:81,value:9.0,number:10},
  {name:'Yuya Kubo',club:'FC Cincinnati',country:'Japão',pos:'ST',age:30,fc:75,pes:75,potential:75,value:3.0,number:7},
  {name:'Kevin Kelsy',club:'FC Cincinnati',country:'Venezuela',pos:'ST',age:20,fc:74,pes:74,potential:82,value:3.5,number:19},

  // New York Red Bulls
  {name:'Carlos Coronel',club:'New York Red Bulls',country:'Paraguai',pos:'GK',age:27,fc:75,pes:75,potential:76,value:3.0,number:1},
  {name:'Dylan Nealis',club:'New York Red Bulls',country:'Estados Unidos',pos:'RB',age:26,fc:72,pes:72,potential:74,value:1.8,number:12},
  {name:'Andrés Reyes',club:'New York Red Bulls',country:'Colômbia',pos:'CB',age:25,fc:74,pes:74,potential:77,value:2.8,number:4},
  {name:'Sean Nealis',club:'New York Red Bulls',country:'Estados Unidos',pos:'CB',age:27,fc:73,pes:73,potential:74,value:2.0,number:15},
  {name:'John Tolkin',club:'New York Red Bulls',country:'Estados Unidos',pos:'LB',age:22,fc:75,pes:75,potential:81,value:4.5,number:47},
  {name:'Daniel Edelman',club:'New York Red Bulls',country:'Estados Unidos',pos:'DM',age:21,fc:74,pes:74,potential:80,value:3.5,number:75},
  {name:'Frankie Amaya',club:'New York Red Bulls',country:'Estados Unidos',pos:'CM',age:23,fc:74,pes:74,potential:79,value:3.2,number:8},
  {name:'Emil Forsberg',club:'New York Red Bulls',country:'Suécia',pos:'AM',age:33,fc:80,pes:80,potential:80,value:6.0,number:10},
  {name:'Lewis Morgan',club:'New York Red Bulls',country:'Escócia',pos:'RW',age:28,fc:77,pes:77,potential:77,value:5.0,number:82},
  {name:'Cameron Harper',club:'New York Red Bulls',country:'Estados Unidos',pos:'LW',age:22,fc:73,pes:73,potential:79,value:2.5,number:17},
  {name:'Elias Manoel',club:'New York Red Bulls',country:'Brasil',pos:'ST',age:22,fc:74,pes:74,potential:80,value:3.2,number:11},

  // Atlanta United
  {name:'Brad Guzan',club:'Atlanta United',country:'Estados Unidos',pos:'GK',age:40,fc:72,pes:72,potential:72,value:0.5,number:1},
  {name:'Brooks Lennon',club:'Atlanta United',country:'Estados Unidos',pos:'RB',age:27,fc:74,pes:74,potential:75,value:2.5,number:11},
  {name:'Stian Gregersen',club:'Atlanta United',country:'Noruega',pos:'CB',age:29,fc:75,pes:75,potential:75,value:2.8,number:4},
  {name:'Derrick Williams',club:'Atlanta United',country:'Irlanda',pos:'CB',age:31,fc:73,pes:73,potential:73,value:1.8,number:3},
  {name:'Pedro Amador',club:'Atlanta United',country:'Portugal',pos:'LB',age:25,fc:73,pes:73,potential:76,value:2.2,number:18},
  {name:'Tristan Muyumba',club:'Atlanta United',country:'França',pos:'CM',age:27,fc:75,pes:75,potential:76,value:3.2,number:8},
  {name:'Bartosz Slisz',club:'Atlanta United',country:'Polônia',pos:'DM',age:25,fc:75,pes:75,potential:78,value:4.0,number:6},
  {name:'Aleksei Miranchuk',club:'Atlanta United',country:'Rússia',pos:'AM',age:29,fc:80,pes:80,potential:80,value:10.0,number:59},
  {name:'Saba Lobjanidze',club:'Atlanta United',country:'Geórgia',pos:'RW',age:29,fc:77,pes:77,potential:77,value:5.0,number:9},
  {name:'Xande Silva',club:'Atlanta United',country:'Portugal',pos:'LW',age:27,fc:74,pes:74,potential:74,value:2.8,number:16},
  {name:'Daniel Ríos',club:'Atlanta United',country:'México',pos:'ST',age:29,fc:74,pes:74,potential:74,value:2.5,number:19}
];

let playersFile = fs.readFileSync('data/players_live.js', 'utf8');

// Find insertion point before window.PLAYER_DB_META
const marker = 'window.PLAYER_DB_META =';
const markerIdx = playersFile.indexOf(marker);
if (markerIdx !== -1) {
  // Find the closing bracket before the marker
  const lastBracketIdx = playersFile.lastIndexOf('];', markerIdx);
  if (lastBracketIdx !== -1) {
    const formatted = mlsAdditionalPlayers.map(p => `  {name:'${p.name}',club:'${p.club}',country:'${p.country}',pos:'${p.pos}',age:${p.age},fc:${p.fc},pes:${p.pes},potential:${p.potential},value:${p.value.toFixed(1)},number:${p.number}}`).join(',\n');
    const updated = playersFile.slice(0, lastBracketIdx) + ',\n\n  // ==========================================\n  // MAJOR LEAGUE SOCCER (MLS - ESTADOS UNIDOS)\n  // ==========================================\n' + formatted + '\n' + playersFile.slice(lastBracketIdx);
    fs.writeFileSync('data/players_live.js', updated, 'utf8');
    console.log(`✓ Added ${mlsAdditionalPlayers.length} MLS players to data/players_live.js!`);
  }
} else {
  console.log('Marker not found in data/players_live.js');
}
