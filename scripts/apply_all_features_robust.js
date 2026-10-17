const fs = require('fs');

let code = fs.readFileSync('js/game.js', 'utf8');

console.log('>>> Iniciando aplicação das 4 funcionalidades...');

// =========================================================================
// 1. ATUALIZAR calculateSeasonPrizeMoney E ADICIONAR calculateCupPhasePrize
// =========================================================================
const prizeStartStr = 'function calculateSeasonPrizeMoney(position, comp){';
const prizeEndStr = '  return 1500000;\r\n}';
const prizeEndStrLF = '  return 1500000;\n}';

const prizeStartIdx = code.indexOf(prizeStartStr);
if (prizeStartIdx !== -1) {
  let prizeEndIdx = code.indexOf(prizeEndStr, prizeStartIdx);
  let len = prizeEndStr.length;
  if (prizeEndIdx === -1) {
    prizeEndIdx = code.indexOf(prizeEndStrLF, prizeStartIdx);
    len = prizeEndStrLF.length;
  }

  if (prizeEndIdx !== -1) {
    const fullPrizeReplacement = `function calculateSeasonPrizeMoney(position, comp){
  const pos = Math.max(1, Number(position) || 1);
  const id = comp?.id || (typeof curComp === 'function' ? curComp()?.id : '');
  
  // 1. Campeonato Brasileiro Série A (Valores oficiais CBF/Globo)
  if(id === 'bra-a'){
    if(pos === 1) return 48100000;
    if(pos === 2) return 45700000;
    if(pos === 3) return 43300000;
    if(pos === 4) return 40800000;
    if(pos === 5) return 38500000;
    if(pos === 6) return 36100000;
    if(pos === 7) return 33700000;
    if(pos === 8) return 31300000;
    if(pos === 9) return 28800000;
    if(pos === 10) return 26400000;
    if(pos === 11) return 20700000;
    if(pos === 12) return 19200000;
    if(pos === 13) return 17800000;
    if(pos === 14) return 17300000;
    if(pos === 15) return 16800000;
    if(pos === 16) return 16300000;
    return 0; // Rebaixados Z4 não recebem premiação esportiva CBF/Globo
  }

  // 2. Campeonato Brasileiro Série B (Oficial CBF)
  if(id === 'bra-b'){
    if(pos === 1) return 3500000;
    if(pos <= 4) return 1350000;
    if(pos <= 16) return 600000;
    return 300000;
  }

  // 3. Série C
  if(id === 'bra-c'){
    if(pos === 1) return 2000000;
    if(pos === 2) return 1000000;
    if(pos <= 4) return 600000;
    return 250000;
  }

  // 4. Série D
  if(id === 'bra-d'){
    if(pos === 1) return 1200000;
    if(pos === 2) return 700000;
    if(pos <= 6) return 500000;
    return 200000;
  }

  // 5. Estaduais Brasileiros
  if(id === 'bra-est-sp'){
    if(pos === 1) return 5000000;
    if(pos === 2) return 1650000;
    if(pos === 3) return 1080000;
    if(pos === 4) return 850000;
    return 300000;
  }
  if(id === 'bra-est-rj'){
    if(pos === 1) return 3000000;
    if(pos === 2) return 1000000;
    if(pos <= 4) return 500000;
    return 200000;
  }
  if(id === 'bra-est-mg' || id === 'bra-est-rs'){
    if(pos === 1) return 2500000;
    if(pos === 2) return 900000;
    if(pos <= 4) return 450000;
    return 200000;
  }
  if(typeof id === 'string' && id.startsWith('bra-est-')){
    if(pos === 1) return 1200000;
    if(pos === 2) return 500000;
    if(pos <= 4) return 250000;
    return 100000;
  }

  // 6. Premier League (Inglaterra)
  if(id === 'eng-1'){
    if(pos === 1) return 380000000;
    if(pos === 2) return 350000000;
    if(pos === 3) return 320000000;
    if(pos === 4) return 290000000;
    if(pos <= 10) return 220000000;
    if(pos <= 17) return 160000000;
    return 100000000;
  }

  // 7. LaLiga (Espanha)
  if(id === 'esp-1'){
    if(pos === 1) return 330000000;
    if(pos === 2) return 280000000;
    if(pos === 3) return 240000000;
    if(pos === 4) return 210000000;
    if(pos <= 10) return 140000000;
    if(pos <= 17) return 80000000;
    return 40000000;
  }

  // 8. Serie A (Itália) / Bundesliga (Alemanha) / Ligue 1 (França)
  if(['ita-1', 'ger-1', 'fra-1'].includes(id)){
    if(pos === 1) return 250000000;
    if(pos === 2) return 200000000;
    if(pos === 3) return 160000000;
    if(pos === 4) return 130000000;
    if(pos <= 10) return 90000000;
    return 40000000;
  }

  // 9. Primeira Liga (Portugal) / Eredivisie (Países Baixos)
  if(['por-1', 'ned-1'].includes(id)){
    if(pos === 1) return 90000000;
    if(pos === 2) return 60000000;
    if(pos === 3) return 40000000;
    return 15000000;
  }

  // 10. Saudi Pro League (Arábia Saudita)
  if(id === 'ksa-1'){
    if(pos === 1) return 60000000;
    if(pos === 2) return 45000000;
    if(pos === 3) return 35000000;
    if(pos === 4) return 28000000;
    if(pos <= 10) return 18000000;
    return 10000000;
  }

  // 11. Major League Soccer (MLS - Estados Unidos)
  if(id === 'usa-1'){
    if(pos === 1) return 55000000;
    if(pos === 2) return 35000000;
    if(pos <= 4) return 25000000;
    if(pos <= 8) return 18000000;
    return 10000000;
  }

  // 12. América do Sul (Argentina, Colômbia, Uruguai, Chile, etc.)
  if(['arg-1', 'col-1', 'uru-1', 'chi-1', 'par-1', 'ecu-1', 'per-1', 'bol-1', 'ven-1'].includes(id)){
    if(pos === 1) return 15000000;
    if(pos === 2) return 10000000;
    if(pos === 3) return 7000000;
    if(pos === 4) return 5000000;
    return 2000000;
  }

  // Padrão geral de ligas
  if(pos === 1) return 12000000;
  if(pos === 2) return 8000000;
  if(pos === 3) return 5000000;
  return 1500000;
}
if(typeof window !== 'undefined') window.calculateSeasonPrizeMoney = calculateSeasonPrizeMoney;

function calculateCupPhasePrize(compOrId, phaseName = '', isWinner = false, isChampion = false){
  const id = typeof compOrId === 'string' ? compOrId : (compOrId?.id || '');
  const pName = String(phaseName || '').toLowerCase();

  // 1. Copa do Brasil (Valores oficiais CBF 2024 por fase)
  if(id === 'bra-cup'){
    if(isChampion) return 73500000;
    if(pName.includes('final') && !pName.includes('semi') && !pName.includes('quarta') && !pName.includes('oitava')){
      return isWinner ? 73500000 : 31500000;
    }
    if(pName.includes('semi')) return 9450000;
    if(pName.includes('quarta')) return 4515000;
    if(pName.includes('oitava')) return 3465000;
    if(pName.includes('5')) return 3000000;
    if(pName.includes('4')) return 2500000;
    if(pName.includes('3')) return 2205000;
    if(pName.includes('2')) return 1785000;
    return 1470000;
  }

  // 2. Copa Libertadores
  if(id === 'lib'){
    if(isChampion) return 126500000; // US$ 23M
    if(pName.includes('final') && !pName.includes('semi')){
      return isWinner ? 126500000 : 38500000;
    }
    if(pName.includes('semi')) return 12650000;
    if(pName.includes('quarta')) return 9350000;
    if(pName.includes('oitava')) return 6875000;
    return 3500000;
  }

  // 3. Copa Sul-Americana
  if(id === 'sud'){
    if(isChampion) return 33000000; // US$ 6M
    if(pName.includes('final') && !pName.includes('semi')){
      return isWinner ? 33000000 : 11000000;
    }
    if(pName.includes('semi')) return 4400000;
    if(pName.includes('quarta')) return 3850000;
    if(pName.includes('oitava')) return 3300000;
    return 1500000;
  }

  // 4. UEFA Champions League
  if(id === 'ucl'){
    if(isChampion) return 150000000;
    if(pName.includes('final') && !pName.includes('semi')){
      return isWinner ? 150000000 : 110000000;
    }
    if(pName.includes('semi')) return 90000000;
    if(pName.includes('quarta')) return 75000000;
    if(pName.includes('oitava')) return 66000000;
    return 20000000;
  }

  // 5. Copa do Mundo de Clubes FIFA (Mundial)
  if(id === 'cwc'){
    if(isChampion) return 275000000; // US$ 50M
    if(pName.includes('final') && !pName.includes('semi')){
      return isWinner ? 275000000 : 165000000;
    }
    if(pName.includes('semi')) return 110000000;
    if(pName.includes('quarta')) return 66000000;
    if(pName.includes('oitava')) return 38500000;
    return 22000000;
  }

  // Copas nacionais genéricas
  if(isChampion) return 30000000;
  if(pName.includes('final')) return isWinner ? 30000000 : 15000000;
  if(pName.includes('semi')) return 8000000;
  if(pName.includes('quarta')) return 4000000;
  return 2000000;
}
if(typeof window !== 'undefined') window.calculateCupPhasePrize = calculateCupPhasePrize;`;

    code = code.slice(0, prizeStartIdx) + fullPrizeReplacement + code.slice(prizeEndIdx + len);
    console.log('✓ Successfully injected full calculateSeasonPrizeMoney and calculateCupPhasePrize');
  }
}

// Premiação na Copa do Brasil (playCopaDoBrasilFixture)
const copaNewsSearch = 'state.news.unshift(`🏆 Copa do Brasil (${phase.name}): ${fixture.home} ${hg} x ${ag} ${fixture.away}.';
const copaNewsIdx = code.indexOf(copaNewsSearch);
if (copaNewsIdx !== -1) {
  const lineStart = code.lastIndexOf('\n', copaNewsIdx);
  const blockBefore = code.slice(lineStart + 1, copaNewsIdx);
  const blockAfterEnd = code.indexOf('advanceDateAfterMatch(state);', copaNewsIdx);
  if (blockAfterEnd !== -1) {
    const newCopaBlock = `  const userWon = norm(winner) === norm(state.club);
  const isFinalPhase = phase.name.includes('Final') && !phase.name.includes('Semi') && !phase.name.includes('Quartas') && !phase.name.includes('Oitavas');
  const copaPrize = calculateCupPhasePrize('bra-cup', phase.name, userWon, userWon && isFinalPhase);
  if(copaPrize > 0){
    state.balance += copaPrize;
    state.income = (state.income || 0) + copaPrize;
    state.news.unshift(\`💰 PREMIAÇÃO COPA DO BRASIL: +\${fmtMoney(copaPrize)} creditados (\${phase.name} · \${userWon ? (isFinalPhase ? '🏆 CAMPEÃO' : 'Classificado') : (isFinalPhase ? '🥈 VICE-CAMPEÃO' : '')})!\`);
  }
  state.news.unshift(\`🏆 Copa do Brasil (\${phase.name}): \${fixture.home} \${hg} x \${ag} \${fixture.away}. \${userWon ? 'Classificado.' : 'Eliminado.'}\`);
  if(!userWon){
    const opp = norm(fixture.home) === norm(state.club) ? fixture.away : fixture.home;
    const oppGoals = norm(fixture.home) === norm(state.club) ? ag : hg;
    registrarEliminacaoMataMata(state, 'Copa do Brasil', phase.name, opp, userGoals, oppGoals);
  }
  `;
    code = code.slice(0, lineStart + 1) + newCopaBlock + code.slice(blockAfterEnd);
    console.log('✓ Injected real prize money in playCopaDoBrasilFixture');
  }
}

// Premiação de Título em simulateQuickRound
const titlePushIdx = code.indexOf('state.titles.push(comp.name);');
if (titlePushIdx !== -1 && !code.includes('tourneyTitlePrize')) {
  const afterPush = titlePushIdx + 'state.titles.push(comp.name);'.length;
  const injectPrize = `
        const tourneyTitlePrize = calculateCupPhasePrize(comp?.id || 'cup', 'Final', true, true);
        if(tourneyTitlePrize > 0){
          state.balance += tourneyTitlePrize;
          state.income = (state.income || 0) + tourneyTitlePrize;
          state.news.unshift(\`💰 PREMIAÇÃO DO TÍTULO: +\${fmtMoney(tourneyTitlePrize)} creditados pela conquista da \${comp.name}!\`);
        }`;
  code = code.slice(0, afterPush) + injectPrize + code.slice(afterPush);
  console.log('✓ Injected title prize in simulateQuickRound');
}

// =========================================================================
// 2. PATROCINADORES LOCAIS POR PAÍS (SPONSOR_POOLS_BY_COUNTRY & getClubCountry)
// =========================================================================
const sponsorCatalogCode = `
// =========================================================================
// CATÁLOGO DE PATROCINADORES OFICIAIS E AUTÊNTICOS POR PAÍS
// =========================================================================
const SPONSOR_POOLS_BY_COUNTRY = {
  'Brasil': [
    { brand: 'Betano', category: 'Master', color: '#f35b04', mult: 1.50, winMult: 0.24, minFame: 40, years: 2, desc: 'Maior parceira do futebol brasileiro com alta rentabilidade' },
    { brand: 'Nubank', category: 'Master', color: '#820ad1', mult: 1.45, winMult: 0.20, minFame: 60, years: 2, desc: 'Fintech gigante com forte apelo entre a torcida jovem' },
    { brand: 'Petrobras', category: 'Master', color: '#008542', mult: 1.60, winMult: 0.26, minFame: 70, years: 3, desc: 'Gigante nacional de energia com contrato de longo prazo' },
    { brand: 'Caixa', category: 'Master', color: '#005ca9', mult: 1.35, winMult: 0.18, minFame: 45, years: 2, desc: 'Banco público tradicional com estabilidade financeira' },
    { brand: 'Superbet', category: 'Master', color: '#dc2626', mult: 1.55, winMult: 0.27, minFame: 50, years: 2, desc: 'Patrocínio agressivo com altos bônus por vitórias' },
    { brand: 'iFood', category: 'Master', color: '#ea1d2c', mult: 1.40, winMult: 0.20, minFame: 35, years: 2, desc: 'Líder de delivery com ações especiais em dias de jogos' },
    { brand: 'Crefisa', category: 'Master', color: '#004a2f', mult: 1.65, winMult: 0.25, minFame: 65, years: 3, desc: 'Investimento massivo no futebol nacional' },
    { brand: 'Banco do Brasil', category: 'Master', color: '#fcee21', mult: 1.40, winMult: 0.19, minFame: 50, years: 3, desc: 'Apoio tradicional ao esporte nacional' },
    
    { brand: 'Fatal Model', category: 'Mangas', color: '#6b21a8', mult: 0.65, winMult: 0.10, minFame: 20, years: 1, desc: 'Investimento fixo imediato nas mangas' },
    { brand: 'GOL Linhas Aéreas', category: 'Mangas', color: '#ff7020', mult: 0.70, winMult: 0.11, minFame: 45, years: 2, desc: 'Apoio logístico oficial e estabilidade' },
    { brand: 'Cimed', category: 'Mangas', color: '#facc15', mult: 0.75, winMult: 0.12, minFame: 55, years: 2, desc: 'Indústria farmacêutica nas mangas da camisa' },
    { brand: 'EstrelaBet', category: 'Mangas', color: '#0284c7', mult: 0.70, winMult: 0.11, minFame: 30, years: 1, desc: 'Operadora dinâmica com premiação por fase' },
    { brand: 'Havan', category: 'Mangas', color: '#2563eb', mult: 0.68, winMult: 0.10, minFame: 35, years: 2, desc: 'Rede varejista nacional nas mangas' },

    { brand: 'BYD', category: 'Costas', color: '#009e60', mult: 0.65, winMult: 0.10, minFame: 35, years: 2, desc: 'Líder em carros elétricos nas costas do uniforme' },
    { brand: 'Itaú', category: 'Costas', color: '#ea580c', mult: 0.72, winMult: 0.12, minFame: 60, years: 3, desc: 'Maior banco privado com solidez absoluta' },
    { brand: 'Brahma', category: 'Costas', color: '#b91c1c', mult: 0.68, winMult: 0.11, minFame: 50, years: 2, desc: 'Tradição centenária cervejeira no futebol' },
    { brand: 'Zé Delivery', category: 'Costas', color: '#eab308', mult: 0.60, winMult: 0.09, minFame: 30, years: 1, desc: 'Ativações de torcida no verso da camisa' },
    { brand: 'Pixbet', category: 'Costas', color: '#1d4ed8', mult: 0.66, winMult: 0.10, minFame: 40, years: 2, desc: 'Patrocínio rápido nas omoplatas' }
  ],

  'Argentina': [
    { brand: 'YPF', category: 'Master', color: '#00529b', mult: 1.55, winMult: 0.24, minFame: 50, years: 3, desc: 'Petrolera estatal y orgullo nacional argentino' },
    { brand: 'Cerveza Quilmes', category: 'Master', color: '#00387b', mult: 1.45, winMult: 0.22, minFame: 45, years: 2, desc: 'El sabor del fútbol argentino con décadas de historia' },
    { brand: 'Codere', category: 'Master', color: '#7cb342', mult: 1.50, winMult: 0.25, minFame: 55, years: 2, desc: 'Casa de apuestas internacional con fuerte presencia' },
    { brand: 'Betsson Argentina', category: 'Master', color: '#ff6600', mult: 1.48, winMult: 0.23, minFame: 50, years: 2, desc: 'Líder sueco de juego online en el fútbol local' },
    { brand: 'Banco Galicia', category: 'Master', color: '#e65100', mult: 1.40, winMult: 0.19, minFame: 40, years: 2, desc: 'Uno de los mayores bancos privados del país' },
    { brand: 'Banco Macro', category: 'Master', color: '#002f6c', mult: 1.38, winMult: 0.18, minFame: 35, years: 2, desc: 'Fuerte presencia federal y respaldo económico' },

    { brand: 'Flecha Bus', category: 'Mangas', color: '#d32f2f', mult: 0.65, winMult: 0.10, minFame: 25, years: 2, desc: 'Transporte oficial y presencia en las mangas' },
    { brand: 'Assist Card', category: 'Mangas', color: '#c2185b', mult: 0.70, winMult: 0.11, minFame: 40, years: 2, desc: 'Asistencia al viajero en competiciones internacionales' },
    { brand: 'DirecTV Argentina', category: 'Mangas', color: '#0288d1', mult: 0.72, winMult: 0.12, minFame: 50, years: 2, desc: 'Televisión satelital deportiva en la camiseta' },
    { brand: 'Aerolíneas Argentinas', category: 'Mangas', color: '#0099cc', mult: 0.68, winMult: 0.10, minFame: 35, years: 2, desc: 'Línea de bandera en los brazos del plantel' },

    { brand: 'Mercado Libre', category: 'Costas', color: '#ffe600', mult: 0.75, winMult: 0.13, minFame: 55, years: 3, desc: 'El gigante de e-commerce latinoamericano' },
    { brand: 'Tarjeta Naranja', category: 'Costas', color: '#ff5722', mult: 0.62, winMult: 0.09, minFame: 30, years: 2, desc: 'Financiamiento popular en la espalda' },
    { brand: 'PedidosYa Argentina', category: 'Costas', color: '#e91e63', mult: 0.60, winMult: 0.09, minFame: 25, years: 1, desc: 'Delivery líder en el dorsal de los futbolistas' }
  ],

  'Estados Unidos': [
    { brand: 'Apple TV', category: 'Master', color: '#000000', mult: 1.65, winMult: 0.28, minFame: 65, years: 4, desc: 'Transmissora global exclusiva da MLS e inovação tecnológica' },
    { brand: 'Audi', category: 'Master', color: '#bb0a30', mult: 1.55, winMult: 0.24, minFame: 55, years: 3, desc: 'Patrocinador oficial de alto padrão da MLS' },
    { brand: 'Target', category: 'Master', color: '#cc0000', mult: 1.50, winMult: 0.22, minFame: 45, years: 2, desc: 'Gigante do varejo americano no peito do manto' },
    { brand: 'BMO', category: 'Master', color: '#0079c1', mult: 1.48, winMult: 0.20, minFame: 50, years: 3, desc: 'Instituição bancária com fortes arenas na liga' },
    { brand: 'Herbalife', category: 'Master', color: '#74a82a', mult: 1.45, winMult: 0.20, minFame: 40, years: 2, desc: 'Nutrição esportiva e contrato lendário no futebol' },
    { brand: 'American Family Insurance', category: 'Master', color: '#003366', mult: 1.40, winMult: 0.18, minFame: 35, years: 2, desc: 'Seguradora oficial com investimento garantido' },

    { brand: 'Ford', category: 'Mangas', color: '#002c6c', mult: 0.72, winMult: 0.11, minFame: 45, years: 2, desc: 'Montadora ícone norte-americana nas mangas' },
    { brand: 'DoorDash', category: 'Mangas', color: '#ff3008', mult: 0.70, winMult: 0.11, minFame: 35, years: 2, desc: 'Líder em entregas com ativação para fãs' },
    { brand: 'AT&T', category: 'Mangas', color: '#00a8e0', mult: 0.75, winMult: 0.12, minFame: 55, years: 3, desc: 'Telecomunicações de ponta nos uniformes' },
    { brand: 'Heineken USA', category: 'Mangas', color: '#008200', mult: 0.68, winMult: 0.10, minFame: 40, years: 2, desc: 'Cerveja oficial das celebrações da MLS' },

    { brand: 'Delta Air Lines', category: 'Costas', color: '#ba0c2f', mult: 0.72, winMult: 0.11, minFame: 50, years: 3, desc: 'Linha aérea de prestígio nas costas do clube' },
    { brand: 'Bank of America', category: 'Costas', color: '#012169', mult: 0.74, winMult: 0.12, minFame: 60, years: 3, desc: 'Maior solidez financeira do mercado americano' },
    { brand: 'BodyArmor', category: 'Costas', color: '#ff4500', mult: 0.62, winMult: 0.09, minFame: 30, years: 1, desc: 'Bebida esportiva oficial dos atletas' },
    { brand: 'GEICO', category: 'Costas', color: '#005596', mult: 0.65, winMult: 0.10, minFame: 35, years: 2, desc: 'Seguros rápidos e visibilidade total' }
  ],

  'Inglaterra': [
    { brand: 'Fly Emirates', category: 'Master', color: '#d71921', mult: 1.80, winMult: 0.30, minFame: 75, years: 3, desc: 'Líder mundial de aviação em uniformes britânicos' },
    { brand: 'Standard Chartered', category: 'Master', color: '#00965e', mult: 1.70, winMult: 0.28, minFame: 70, years: 3, desc: 'Banco financeiro internacional' },
    { brand: 'Etihad Airways', category: 'Master', color: '#cca24b', mult: 1.75, winMult: 0.29, minFame: 75, years: 3, desc: 'Parceria milionária dos Emirados' },
    { brand: 'TeamViewer', category: 'Master', color: '#004c97', mult: 1.55, winMult: 0.22, minFame: 60, years: 2, desc: 'Software corporativo global' },
    { brand: 'Stake.com', category: 'Master', color: '#1475e1', mult: 1.50, winMult: 0.24, minFame: 45, years: 2, desc: 'Plataforma líder com altos bônus' },

    { brand: 'Visit Rwanda', category: 'Mangas', color: '#20603d', mult: 0.75, winMult: 0.12, minFame: 65, years: 3, desc: 'Turismo global nas mangas' },
    { brand: 'JD Sports', category: 'Mangas', color: '#111111', mult: 0.70, winMult: 0.11, minFame: 50, years: 2, desc: 'Gigante de moda esportiva britânica' },
    { brand: 'Expedia', category: 'Mangas', color: '#002554', mult: 0.72, winMult: 0.12, minFame: 60, years: 2, desc: 'Viagens internacionais nas mangas' },

    { brand: 'Barclays', category: 'Costas', color: '#00aeef', mult: 0.76, winMult: 0.13, minFame: 65, years: 3, desc: 'Tradição absoluta no futebol inglês' },
    { brand: 'Cadbury', category: 'Costas', color: '#4a154b', mult: 0.65, winMult: 0.10, minFame: 40, years: 2, desc: 'Doces tradicionais no verso do manto' }
  ],

  'Espanha': [
    { brand: 'Spotify', category: 'Master', color: '#1db954', mult: 1.80, winMult: 0.30, minFame: 80, years: 4, desc: 'Maior streaming musical do planeta' },
    { brand: 'Emirates Fly Better', category: 'Master', color: '#d71921', mult: 1.80, winMult: 0.30, minFame: 80, years: 3, desc: 'A maior marca da realeza do futebol europeu' },
    { brand: 'Riyadh Air', category: 'Master', color: '#582c83', mult: 1.65, winMult: 0.26, minFame: 70, years: 3, desc: 'Companhia aérea com investimento bilionário' },
    { brand: 'DIGI', category: 'Master', color: '#0055a5', mult: 1.45, winMult: 0.20, minFame: 45, years: 2, desc: 'Operadora de telecomunicações de rápida ascensão' },
    { brand: 'Finetwork', category: 'Master', color: '#6a0dad', mult: 1.40, winMult: 0.19, minFame: 40, years: 2, desc: 'Fibra e telefonia espanhola' },

    { brand: 'Ambilight TV', category: 'Mangas', color: '#00a3e0', mult: 0.75, winMult: 0.12, minFame: 70, years: 2, desc: 'Tecnologia visual nas mangas' },
    { brand: 'Nexen Tire', category: 'Mangas', color: '#7b1113', mult: 0.68, winMult: 0.10, minFame: 50, years: 2, desc: 'Pneus com presença em LaLiga' },
    { brand: 'OK Mobility', category: 'Mangas', color: '#e4002b', mult: 0.64, winMult: 0.09, minFame: 35, years: 1, desc: 'Aluguel de veículos nas mangas' },

    { brand: 'CaixaBank', category: 'Costas', color: '#007eae', mult: 0.74, winMult: 0.12, minFame: 60, years: 3, desc: 'Banca oficial do esporte espanhol' },
    { brand: 'Mahou San Miguel', category: 'Costas', color: '#c41230', mult: 0.68, winMult: 0.11, minFame: 50, years: 2, desc: 'Cervejeira histórica no verso da camisa' }
  ],

  'Arábia Saudita': [
    { brand: 'Roshn', category: 'Master', color: '#002b49', mult: 1.85, winMult: 0.32, minFame: 60, years: 3, desc: 'Patrocinador oficial imobiliário da Saudi Pro League' },
    { brand: 'Aramco', category: 'Master', color: '#00a3e0', mult: 1.90, winMult: 0.35, minFame: 70, years: 4, desc: 'A maior petrolífera mundial com investimento supremo' },
    { brand: 'STC', category: 'Master', color: '#4f008c', mult: 1.70, winMult: 0.28, minFame: 55, years: 3, desc: 'Líder em tecnologia e telecomunicações sauditas' },
    { brand: 'Saudia Airlines', category: 'Master', color: '#006633', mult: 1.65, winMult: 0.25, minFame: 50, years: 3, desc: 'Companhia aérea oficial do Reino' },
    { brand: 'Red Sea Global', category: 'Master', color: '#009999', mult: 1.60, winMult: 0.24, minFame: 45, years: 2, desc: 'Mega empreendimentos turísticos sustentáveis' },

    { brand: 'Alinma Bank', category: 'Mangas', color: '#b89d58', mult: 0.76, winMult: 0.13, minFame: 50, years: 2, desc: 'Banco financeiro nas mangas' },
    { brand: 'Jahez', category: 'Mangas', color: '#f37021', mult: 0.72, winMult: 0.12, minFame: 40, years: 2, desc: 'Maior app de entregas da Arábia' },

    { brand: 'NEOM', category: 'Costas', color: '#000000', mult: 0.85, winMult: 0.15, minFame: 65, years: 3, desc: 'A cidade do futuro mundial nas costas' },
    { brand: 'SABIC', category: 'Costas', color: '#0072ce', mult: 0.75, winMult: 0.12, minFame: 55, years: 3, desc: 'Líder química e industrial global' }
  ],

  'Itália': [
    { brand: 'Jeep', category: 'Master', color: '#222222', mult: 1.70, winMult: 0.28, minFame: 70, years: 3, desc: 'Marca automotiva icônica da Serie A' },
    { brand: 'MSC Crociere', category: 'Master', color: '#002f6c', mult: 1.65, winMult: 0.26, minFame: 65, years: 3, desc: 'Gigante marítimo de cruzeiros internacionais' },
    { brand: 'Paramount+ Italia', category: 'Master', color: '#0064ff', mult: 1.60, winMult: 0.25, minFame: 60, years: 2, desc: 'Entretenimento e cinema no peito' },
    { brand: 'Betsson.sport', category: 'Master', color: '#ff6600', mult: 1.55, winMult: 0.24, minFame: 50, years: 2, desc: 'Infotainment esportivo em ascensão' },

    { brand: 'eBay Italia', category: 'Mangas', color: '#e53238', mult: 0.74, winMult: 0.12, minFame: 55, years: 2, desc: 'Mercado global nas mangas' },
    { brand: 'Bitpanda', category: 'Mangas', color: '#138b69', mult: 0.70, winMult: 0.11, minFame: 45, years: 2, desc: 'Fintech e criptoativos' },

    { brand: 'U-Power', category: 'Costas', color: '#e30613', mult: 0.68, winMult: 0.11, minFame: 50, years: 2, desc: 'Segurança no trabalho no verso da camisa' },
    { brand: 'TIM', category: 'Costas', color: '#003399', mult: 0.72, winMult: 0.12, minFame: 60, years: 3, desc: 'Telecomunicações de toda a Itália' }
  ],

  'Alemanha': [
    { brand: 'Deutsche Telekom', category: 'Master', color: '#e20074', mult: 1.85, winMult: 0.30, minFame: 80, years: 4, desc: 'O clássico T magenta no coração da Bundesliga' },
    { brand: 'Evonik', category: 'Master', color: '#672179', mult: 1.65, winMult: 0.26, minFame: 70, years: 3, desc: 'Química industrial de prestígio internacional' },
    { brand: 'Red Bull', category: 'Master', color: '#cc0033', mult: 1.70, winMult: 0.28, minFame: 65, years: 4, desc: 'Energia pura e potência esportiva global' },
    { brand: 'Indeed', category: 'Master', color: '#2164f3', mult: 1.50, winMult: 0.22, minFame: 50, years: 2, desc: 'Líder em empregos nos uniformes alemães' },

    { brand: 'Allianz', category: 'Mangas', color: '#003780', mult: 0.78, winMult: 0.13, minFame: 65, years: 3, desc: 'Gigante seguradora nas mangas' },
    { brand: 'GLS', category: 'Mangas', color: '#002554', mult: 0.70, winMult: 0.11, minFame: 50, years: 2, desc: 'Logística de encomendas alemã' },

    { brand: 'SAP', category: 'Costas', color: '#008fd3', mult: 0.76, winMult: 0.13, minFame: 60, years: 3, desc: 'Sistemas corporativos líderes mundiais' },
    { brand: 'Bitburger', category: 'Costas', color: '#d4af37', mult: 0.65, winMult: 0.10, minFame: 45, years: 2, desc: 'Tradição cervejeira da Alemanha' }
  ],

  'França': [
    { brand: 'Qatar Airways', category: 'Master', color: '#5c0632', mult: 1.85, winMult: 0.32, minFame: 80, years: 3, desc: 'A maior rota aérea com contrato milionário' },
    { brand: 'CMA CGM', category: 'Master', color: '#002d62', mult: 1.65, winMult: 0.26, minFame: 65, years: 3, desc: 'Líder de navegação de Marselha para o mundo' },
    { brand: 'Orange', category: 'Master', color: '#ff7900', mult: 1.60, winMult: 0.24, minFame: 60, years: 2, desc: 'Telecomunicações e inovação francesa' },

    { brand: 'GOAT', category: 'Mangas', color: '#111111', mult: 0.75, winMult: 0.12, minFame: 70, years: 2, desc: 'Plataforma fashion e lifestyle global' },
    { brand: 'Deliveroo France', category: 'Mangas', color: '#00cdbc', mult: 0.68, winMult: 0.10, minFame: 45, years: 2, desc: 'Delivery oficial nas mangas' },

    { brand: 'ParionsSport', category: 'Costas', color: '#009ee0', mult: 0.70, winMult: 0.11, minFame: 50, years: 2, desc: 'Apostas oficiais francesas na camisa' }
  ],

  'Portugal': [
    { brand: 'Betclic Portugal', category: 'Master', color: '#e4002b', mult: 1.55, winMult: 0.24, minFame: 55, years: 2, desc: 'Patrocinador oficial e naming sponsor da Liga' },
    { brand: 'MEO', category: 'Master', color: '#0090d0', mult: 1.50, winMult: 0.22, minFame: 50, years: 3, desc: 'A maior telecomunicação de Portugal' },
    { brand: 'NOS', category: 'Master', color: '#222222', mult: 1.50, winMult: 0.22, minFame: 50, years: 3, desc: 'Cinema e comunicação portuguesa' },
    { brand: 'Sagres', category: 'Master', color: '#c41230', mult: 1.40, winMult: 0.19, minFame: 40, years: 2, desc: 'Cerveja oficial e paixão de Portugal' },

    { brand: 'Repsol Portugal', category: 'Mangas', color: '#ff3000', mult: 0.70, winMult: 0.11, minFame: 45, years: 2, desc: 'Energia nas mangas da camisa' },
    { brand: 'solverde.pt', category: 'Mangas', color: '#00a651', mult: 0.68, winMult: 0.10, minFame: 35, years: 2, desc: 'Casinos e apostas em Portugal' },

    { brand: 'Galp', category: 'Costas', color: '#f37021', mult: 0.72, winMult: 0.12, minFame: 50, years: 3, desc: 'Energia que move Portugal' }
  ],

  'Global': [
    { brand: 'Sony', category: 'Master', color: '#000000', mult: 1.65, winMult: 0.26, minFame: 65, years: 3, desc: 'Tecnologia audiovisual e PlayStation' },
    { brand: 'Coca-Cola', category: 'Master', color: '#f40009', mult: 1.70, winMult: 0.28, minFame: 70, years: 3, desc: 'A maior marca de refrigerantes do planeta' },
    { brand: 'Mastercard', category: 'Master', color: '#eb001b', mult: 1.68, winMult: 0.26, minFame: 65, years: 3, desc: 'Pagamentos globais e momentos que não têm preço' },
    { brand: 'Pepsi', category: 'Master', color: '#004b93', mult: 1.60, winMult: 0.24, minFame: 55, years: 2, desc: 'Tradição global na cultura do futebol' },

    { brand: 'DHL', category: 'Mangas', color: '#d40511', mult: 0.72, winMult: 0.11, minFame: 50, years: 2, desc: 'Logística internacional veloz nas mangas' },
    { brand: 'Puma', category: 'Mangas', color: '#000000', mult: 0.74, winMult: 0.12, minFame: 55, years: 2, desc: 'Performance esportiva de elite' },

    { brand: 'Canon', category: 'Costas', color: '#cc0000', mult: 0.68, winMult: 0.10, minFame: 45, years: 2, desc: 'Lentes e imagens oficiais do esporte' },
    { brand: 'FedEx', category: 'Costas', color: '#4d148c', mult: 0.70, winMult: 0.11, minFame: 50, years: 2, desc: 'Entregas mundiais no verso do manto' }
  ]
};

function getClubCountry(clubName, stateContext = (typeof state !== 'undefined' ? state : null)){
  const cName = String(clubName || stateContext?.club || '').trim();
  const nClub = typeof norm === 'function' ? norm(cName) : cName.toLowerCase();

  // 1. Se estivermos olhando o clube do state e tiver compId
  const cId = stateContext?.compId || '';
  if(cId.startsWith('bra-') || cId.startsWith('sp-') || cId.startsWith('rj-') || cId.startsWith('mg-') || cId.startsWith('rs-')) return 'Brasil';
  if(cId === 'usa-1') return 'Estados Unidos';
  if(cId === 'arg-1') return 'Argentina';
  if(cId === 'eng-1' || cId === 'eng-2') return 'Inglaterra';
  if(cId === 'esp-1' || cId === 'esp-2') return 'Espanha';
  if(cId === 'ita-1') return 'Itália';
  if(cId === 'ger-1') return 'Alemanha';
  if(cId === 'fra-1') return 'França';
  if(cId === 'por-1') return 'Portugal';
  if(cId === 'ksa-1') return 'Arábia Saudita';

  // 2. Busca nas competições cadastradas em COMPETITION_TEAMS
  if(typeof COMPETITION_TEAMS !== 'undefined' && COMPETITION_TEAMS){
    for(const [compKey, teamArr] of Object.entries(COMPETITION_TEAMS)){
      if(Array.isArray(teamArr) && teamArr.some(t => (typeof norm === 'function' ? norm(t) : String(t).toLowerCase()) === nClub)){
        if(compKey.startsWith('bra-')) return 'Brasil';
        if(compKey === 'usa-1') return 'Estados Unidos';
        if(compKey === 'arg-1') return 'Argentina';
        if(compKey === 'eng-1' || compKey === 'eng-2') return 'Inglaterra';
        if(compKey === 'esp-1' || compKey === 'esp-2') return 'Espanha';
        if(compKey === 'ita-1') return 'Itália';
        if(compKey === 'ger-1') return 'Alemanha';
        if(compKey === 'fra-1') return 'França';
        if(compKey === 'por-1') return 'Portugal';
        if(compKey === 'ksa-1') return 'Arábia Saudita';
      }
    }
  }

  // 3. Heurísticas diretas de nomes de clubes consagrados
  if(/inter miami|la galaxy|los angeles fc|lafc|columbus crew|seattle sounders|atlanta united|new york red bulls|nycfc|philadelphia union|orlando city|portland timbers|nashville/i.test(cName)) return 'Estados Unidos';
  if(/boca juniors|river plate|racing club|san lorenzo|independiente|velez|estudiantes|talleres|rosario central|newell/i.test(cName)) return 'Argentina';
  if(/al-hilal|al-nassr|al-ittihad|al-ahli|al-ettifaq|al-shabab/i.test(cName)) return 'Arábia Saudita';
  if(/real madrid|barcelona|atlético de madrid|sevilla|valencia|villarreal|athletic club|betis/i.test(cName)) return 'Espanha';
  if(/manchester city|liverpool|arsenal|manchester united|chelsea|tottenham|aston villa|newcastle/i.test(cName)) return 'Inglaterra';
  if(/inter de milão|juventus|milan|napoli|roma|lazio|atalanta|fiorentina/i.test(cName)) return 'Itália';
  if(/bayern|dortmund|leverkusen|leipzig|stuttgart|frankfurt/i.test(cName)) return 'Alemanha';
  if(/paris saint-germain|psg|marseille|monaco|lyon|lille/i.test(cName)) return 'França';
  if(/benfica|porto|sporting|braga/i.test(cName)) return 'Portugal';

  // 4. Se o usuário estiver numa liga nacional brasileira ou estadual
  if(typeof curComp === 'function'){
    const c = curComp();
    if(c?.country) return c.country;
  }

  return 'Brasil';
}
if(typeof window !== 'undefined') {
  window.SPONSOR_POOLS_BY_COUNTRY = SPONSOR_POOLS_BY_COUNTRY;
  window.getClubCountry = getClubCountry;
}
`;

// Substituir generateSponsorOffers e ensureClubSponsors
const oldGenSponsorIdx = code.indexOf('function generateSponsorOffers(clubBudget){');
const oldEnsureSponsorIdx = code.indexOf('function ensureClubSponsors(s){');
const endEnsureSponsorIdx = code.indexOf('if(!Array.isArray(s.sponsorOffers) || s.sponsorOffers.length === 0) s.sponsorOffers = gen', oldEnsureSponsorIdx);
const finalEnsureSponsorLineEnd = code.indexOf(';', endEnsureSponsorIdx + 80);

if (oldGenSponsorIdx !== -1 && oldEnsureSponsorIdx !== -1 && finalEnsureSponsorLineEnd !== -1) {
  const newSponsorBlock = sponsorCatalogCode + `
function generateSponsorOffers(clubBudget, clubName = (typeof state !== 'undefined' ? state?.club : '')){
  const fame = typeof teamFameScore === 'function' ? teamFameScore() : 50;
  const mktMult = typeof marketingBenefits === 'function' ? marketingBenefits().sponsorMultiplier : 1;
  const fameMult = 0.60 + (fame / 100) * 0.90;
  const seasonFactor = Math.max(0.1, Number(state?.sponsorSeasonFactor) || 1);
  const baseMonthly = Math.round(Math.max(40000, Math.round((clubBudget || 2000000) * 0.024)) * mktMult * fameMult * seasonFactor);

  const country = getClubCountry(clubName);
  const countryPool = SPONSOR_POOLS_BY_COUNTRY[country] || SPONSOR_POOLS_BY_COUNTRY['Brasil'];
  const globalPool = SPONSOR_POOLS_BY_COUNTRY['Global'] || [];
  
  // Mescla o pool do país local com os globais
  const sponsorPool = [...countryPool, ...globalPool];

  // Filtra marcas elegíveis para a fama atual do time
  const eligible = sponsorPool.filter(s => fame >= (s.minFame - 10));
  const activePool = eligible.length >= 4 ? eligible : sponsorPool;

  const mList = activePool.filter(s => s.category === 'Master').sort(() => Math.random() - 0.5);
  const sList = activePool.filter(s => s.category === 'Mangas').sort(() => Math.random() - 0.5);
  const bList = activePool.filter(s => s.category === 'Costas').sort(() => Math.random() - 0.5);

  const selected = [
    mList[0] || countryPool.find(s => s.category === 'Master'),
    sList[0] || countryPool.find(s => s.category === 'Mangas'),
    bList[0] || countryPool.find(s => s.category === 'Costas'),
    mList[1] || sList[1] || bList[1] || countryPool[1]
  ].filter(Boolean);

  return selected.map(s => ({
    brand: s.brand,
    category: s.category,
    color: s.color,
    monthly: Math.round(baseMonthly * s.mult),
    winBonus: Math.round(baseMonthly * s.winMult),
    years: s.years,
    desc: s.desc,
    country: country
  }));
}

function ensureClubSponsors(s){
  if(!s) return;
  s.sponsors = s.sponsors || {};
  const baseBudget = s.balance || 5000000;
  const clubCountry = getClubCountry(s.club, s);
  const offers = generateSponsorOffers(baseBudget, s.club);

  const mOff = offers.find(o => o.category === 'Master') || { brand: 'Patrocinador Master', category: 'Master', color: '#f35b04', monthly: 1850000, winBonus: 240000, years: 2, desc: 'Patrocinador Master Oficial' };
  const sOff = offers.find(o => o.category === 'Mangas') || { brand: 'Patrocínio Mangas', category: 'Mangas', color: '#10b981', monthly: 720000, winBonus: 95000, years: 2, desc: 'Mangas da Camisa' };
  const bOff = offers.find(o => o.category === 'Costas') || { brand: 'Patrocínio Costas', category: 'Costas', color: '#ea580c', monthly: 980000, winBonus: 130000, years: 3, desc: 'Costas / Omoplata' };

  if(!s.sponsors.master || !s.sponsors.master.brand || s.sponsors.master.brand === 'Sem Patrocínio') s.sponsors.master = mOff;
  if(!s.sponsors.sleeves || !s.sponsors.sleeves.brand || s.sponsors.sleeves.brand === 'Sem Patrocínio') s.sponsors.sleeves = sOff;
  if(!s.sponsors.back || !s.sponsors.back.brand || s.sponsors.back.brand === 'Sem Patrocínio') s.sponsors.back = bOff;
  if(!Array.isArray(s.sponsorOffers) || s.sponsorOffers.length === 0) s.sponsorOffers = offers;
}
if(typeof window !== 'undefined'){
  window.generateSponsorOffers = generateSponsorOffers;
  window.ensureClubSponsors = ensureClubSponsors;
}
`;

  code = code.slice(0, oldGenSponsorIdx) + newSponsorBlock + code.slice(finalEnsureSponsorLineEnd + 1);
  console.log('✓ Successfully replaced generateSponsorOffers and ensureClubSponsors with country-aware localized sponsors');
}

// =========================================================================
// 3. SISTEMA DE ESCOLHA DO NÚMERO DA CAMISA DOS JOGADORES
// =========================================================================
const shirtNumberSystemCode = `
// =========================================================================
// SISTEMA OFICIAL DE NÚMEROS DE CAMISA (DORSAL) DOS JOGADORES (1 a 99)
// =========================================================================
function ensureSquadShirtNumbers(targetState = (typeof state !== 'undefined' ? state : null)){
  if(!targetState || !Array.isArray(targetState.squad)) return;
  const squad = targetState.squad.filter(Boolean);
  if(squad.length === 0) return;

  const usedNumbers = new Set();

  // 1. Prioriza jogadores com número já definido válido (ex: Messi #10, CR7 #7, etc.)
  squad.forEach(p => {
    const num = parseInt(p.number, 10);
    if(!isNaN(num) && num >= 1 && num <= 99 && !usedNumbers.has(num)){
      p.number = num;
      usedNumbers.add(num);
    } else {
      p.number = null; // precisa receber número
    }
  });

  // 2. Números preferenciais tradicionais por posição
  const preferredPosNumbers = {
    'GK': [1, 12, 22, 23, 30, 31, 99],
    'RB': [2, 13, 16, 20, 22],
    'LB': [6, 16, 12, 14, 26, 33],
    'CB': [3, 4, 14, 15, 24, 25, 30, 44],
    'DM': [5, 8, 17, 18, 21, 28, 55],
    'CM': [8, 10, 15, 20, 26, 88],
    'AM': [10, 7, 20, 80, 99],
    'RW': [7, 11, 17, 19, 21, 77],
    'LW': [11, 7, 17, 19, 22, 99],
    'ST': [9, 19, 29, 99, 18, 23],
    'CF': [9, 10, 19, 99]
  };

  function findNextAvailableNumber(pos){
    const prefs = preferredPosNumbers[pos] || [];
    for(const n of prefs){
      if(!usedNumbers.has(n)) return n;
    }
    for(let n = 1; n <= 99; n++){
      if(!usedNumbers.has(n)) return n;
    }
    return Math.floor(Math.random() * 99) + 1;
  }

  // 3. Atribui números para os jogadores que ainda não têm
  squad.forEach(p => {
    if(!p.number){
      const assigned = findNextAvailableNumber(p.pos);
      p.number = assigned;
      usedNumbers.add(assigned);
    }
  });
}

function setPlayerShirtNumber(playerOrKey, newNumber, targetState = (typeof state !== 'undefined' ? state : null)){
  if(!targetState || !Array.isArray(targetState.squad)) return false;
  const num = parseInt(newNumber, 10);
  if(isNaN(num) || num < 1 || num > 99){
    if(typeof showNotification === 'function') showNotification('O número da camisa deve ser entre 1 e 99.', 'warn');
    return false;
  }

  const pKey = typeof playerOrKey === 'string' ? playerOrKey : (typeof playerKey === 'function' ? playerKey(playerOrKey) : (playerOrKey?.name || ''));
  const player = targetState.squad.find(p => p && ((typeof playerKey === 'function' ? playerKey(p) : p.name) === pKey || p.name === pKey));
  if(!player){
    if(typeof showNotification === 'function') showNotification('Jogador não encontrado no elenco.', 'error');
    return false;
  }

  const oldNum = player.number || null;
  if(oldNum === num) return true; // mesmo número

  // Verifica se outro jogador já usa esse número -> faz o swap inteligente!
  const occupyingPlayer = targetState.squad.find(p => p && p !== player && p.number === num);
  if(occupyingPlayer){
    occupyingPlayer.number = oldNum || 99;
    // Se o oldNum também colidir ou for nulo, busca o próximo vago para ele
    const occupiedSet = new Set(targetState.squad.filter(p => p && p !== occupyingPlayer).map(p => p.number));
    if(occupiedSet.has(occupyingPlayer.number)){
      for(let n = 1; n <= 99; n++){
        if(!occupiedSet.has(n)){
          occupyingPlayer.number = n;
          break;
        }
      }
    }
  }

  player.number = num;
  ensureSquadShirtNumbers(targetState);

  if(typeof showNotification === 'function'){
    if(occupyingPlayer){
      showNotification(\`👕 Camisa trocada: \${player.name} agora é o #\${player.number} (e \${occupyingPlayer.name} ficou com o #\${occupyingPlayer.number})!\`, 'success');
    } else {
      showNotification(\`👕 Camisa atualizada: \${player.name} é o novo camisa #\${player.number}!\`, 'success');
    }
  }

  if(typeof render === 'function') render();
  return true;
}

function assignTraditionalShirtNumbers(targetState = (typeof state !== 'undefined' ? state : null)){
  if(!targetState || !Array.isArray(targetState.squad)) return;
  const squad = targetState.squad.filter(Boolean);
  if(squad.length === 0) return;

  const used = new Set();
  const lineupKeys = Array.isArray(targetState.lineup) ? targetState.lineup.slice(0, 11) : [];

  // 11 titulares recebem 1 a 11 pela ordem posicional tradicional
  const starters = [];
  lineupKeys.forEach(k => {
    const p = squad.find(pl => (typeof playerKey === 'function' ? playerKey(pl) : pl.name) === k);
    if(p && !starters.includes(p)) starters.push(p);
  });
  squad.forEach(p => {
    if(starters.length < 11 && !starters.includes(p)) starters.push(p);
  });

  // Ordena os 11 titulares do gol ao ataque
  const posOrder = { 'GK': 1, 'RB': 2, 'CB': 3, 'LB': 4, 'DM': 5, 'CM': 6, 'AM': 7, 'RW': 8, 'LW': 9, 'ST': 10, 'CF': 11 };
  starters.sort((a,b) => (posOrder[a.pos] || 99) - (posOrder[b.pos] || 99));

  // Mapa de números ideais 1 a 11
  let nextStarterNum = 1;
  starters.forEach(p => {
    p.number = nextStarterNum++;
    used.add(p.number);
  });

  // Reservas recebem 12 em diante
  let benchNum = 12;
  squad.forEach(p => {
    if(!starters.includes(p)){
      while(used.has(benchNum) && benchNum < 99) benchNum++;
      p.number = benchNum++;
      used.add(p.number);
    }
  });

  if(typeof showNotification === 'function') showNotification('👕 Numeração tradicional (1 a 11 nos titulares) aplicada com sucesso!', 'success');
  if(typeof render === 'function') render();
}

function openSquadShirtNumbersModal(highlightPlayerKey = null){
  if(typeof state === 'undefined' || !Array.isArray(state.squad)) return;
  ensureSquadShirtNumbers(state);
  const squad = state.squad.filter(Boolean);

  let currentSelected = highlightPlayerKey 
    ? squad.find(p => (typeof playerKey === 'function' ? playerKey(p) : p.name) === highlightPlayerKey || p.name === highlightPlayerKey)
    : squad[0];

  const modalHtml = \`
    <div id="shirtNumbersModal" class="modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px)">
      <div class="modal-card" style="background:#0f172a;border:1px solid #334155;border-radius:16px;max-width:850px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);overflow:hidden">
        
        <!-- Header -->
        <div style="padding:18px 24px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;background:#1e293b">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:24px">👕</span>
            <div>
              <h2 style="margin:0;font-size:18px;font-weight:800;color:#f8fafc">Numeração Oficial do Elenco</h2>
              <div style="font-size:12px;color:#94a3b8">Escolha a camisa de cada jogador de 1 a 99 ou aplique a numeração tradicional clássica.</div>
            </div>
          </div>
          <button class="btn btn-subtle" onclick="document.getElementById('shirtNumbersModal').remove()" style="padding:6px 12px;font-size:16px;cursor:pointer">✕</button>
        </div>

        <!-- Body -->
        <div style="display:flex;flex:1;overflow:hidden;flex-wrap:wrap">
          
          <!-- Lista de Jogadores à Esquerda -->
          <div style="width:340px;border-right:1px solid #1e293b;overflow-y:auto;max-height:calc(90vh - 140px);background:#090d16;padding:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 4px">
              <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase">Jogadores (\${squad.length})</span>
              <button class="btn btn-sm btn-subtle" onclick="assignTraditionalShirtNumbers(state); document.getElementById('shirtNumbersModal').remove(); openSquadShirtNumbersModal();" style="font-size:10px;padding:3px 8px;font-weight:700" title="Atribui números 1 a 11 aos titulares automaticamente">
                ⚡ 1 a 11 Auto
              </button>
            </div>
            
            <div style="display:flex;flex-direction:column;gap:6px">
              \${squad.map(p => {
                const pk = typeof playerKey === 'function' ? playerKey(p) : p.name;
                const isCur = currentSelected && ((typeof playerKey === 'function' ? playerKey(currentSelected) : currentSelected.name) === pk);
                return \`
                  <div onclick="openSquadShirtNumbersModal('\${esc(pk)}')" 
                       style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:10px;cursor:pointer;background:\${isCur ? 'linear-gradient(90deg, #1e3a8a, #1e293b)' : '#1e293b'};border:1px solid \${isCur ? '#3b82f6' : 'transparent'};transition:all 0.15s ease">
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="width:34px;height:34px;border-radius:50%;background:#334155;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:14px;font-weight:800;color:#facc15">
                        \${p.photo ? \`<img src="\${p.photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='👕'">\` : '👕'}
                      </div>
                      <div>
                        <div style="font-size:13px;font-weight:700;color:#f8fafc">\${esc(p.name)}</div>
                        <div style="font-size:10px;color:#94a3b8;display:flex;gap:6px">
                          <span class="pill" style="padding:1px 5px;font-size:9px">\${p.pos}</span>
                          <span>OVR \${p.overall || p.ovr || 65}</span>
                        </div>
                      </div>
                    </div>
                    <div style="background:#0f172a;border:1px solid #3b82f6;color:#60a5fa;font-size:14px;font-weight:900;padding:4px 10px;border-radius:8px;min-width:36px;text-align:center">
                      #\${p.number || '-'}
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>

          <!-- Painel de Seleção de Camisa à Direita -->
          <div style="flex:1;min-width:320px;padding:24px;overflow-y:auto;max-height:calc(90vh - 140px);background:#0f172a">
            \${currentSelected ? \`
              <div style="display:flex;align-items:center;gap:16px;background:#1e293b;padding:16px;border-radius:12px;border:1px solid #334155;margin-bottom:20px">
                <div style="width:54px;height:54px;border-radius:50%;background:#334155;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:24px;border:2px solid #3b82f6">
                  \${currentSelected.photo ? \`<img src="\${currentSelected.photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='👕'">\` : '👕'}
                </div>
                <div>
                  <h3 style="margin:0;font-size:16px;font-weight:800;color:#f8fafc">\${esc(currentSelected.name)}</h3>
                  <div style="font-size:12px;color:#94a3b8;margin-top:2px">
                    Posição: <b style="color:#38bdf8">\${currentSelected.pos}</b> • Overall: <b>\${currentSelected.overall || 65}</b> • Camisa Atual: <b style="color:#facc15">#\${currentSelected.number || '-'}</b>
                  </div>
                </div>
              </div>

              <div style="margin-bottom:16px">
                <div style="font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:8px">Digitar Número Específico (1 a 99):</div>
                <div style="display:flex;gap:10px">
                  <input type="number" id="customShirtNumberInput" min="1" max="99" value="\${currentSelected.number || ''}" placeholder="1 a 99" style="width:110px;padding:8px 12px;background:#1e293b;border:1px solid #475569;border-radius:8px;color:#f8fafc;font-size:16px;font-weight:800;text-align:center">
                  <button class="btn btn-primary" onclick="
                    const val = document.getElementById('customShirtNumberInput').value;
                    const ok = setPlayerShirtNumber('\${esc(typeof playerKey === 'function' ? playerKey(currentSelected) : currentSelected.name)}', val, state);
                    if(ok){
                      document.getElementById('shirtNumbersModal').remove();
                      openSquadShirtNumbersModal('\${esc(typeof playerKey === 'function' ? playerKey(currentSelected) : currentSelected.name)}');
                    }
                  " style="font-weight:700">
                    Definir Camisa
                  </button>
                </div>
              </div>

              <div>
                <div style="font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:10px;display:flex;justify-content:space-between">
                  <span>Grade de Números Rápidos (1 a 99):</span>
                  <span style="font-size:11px;color:#94a3b8"><span style="color:#22c55e">●</span> Disponível • <span style="color:#f59e0b">●</span> Ocupado (Troca)</span>
                </div>
                
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(46px, 1fr));gap:6px">
                  \${Array.from({length: 99}, (_, idx) => idx + 1).map(num => {
                    const occupying = squad.find(p => p.number === num);
                    const isSelf = occupying && ((typeof playerKey === 'function' ? playerKey(occupying) : occupying.name) === (typeof playerKey === 'function' ? playerKey(currentSelected) : currentSelected.name));
                    
                    let bg = '#1e293b';
                    let border = '#334155';
                    let color = '#94a3b8';
                    let title = \`Número \${num} vago\`;

                    if(isSelf){
                      bg = '#1d4ed8';
                      border = '#60a5fa';
                      color = '#ffffff';
                      title = \`Camisa atual de \${currentSelected.name}\`;
                    } else if(occupying){
                      bg = '#2a1b1b';
                      border = '#7f1d1d';
                      color = '#fca5a5';
                      title = \`Número \${num} em uso por \${occupying.name} (clique para trocar)\`;
                    } else {
                      bg = '#0f291e';
                      border = '#14532d';
                      color = '#86efac';
                    }

                    return \`
                      <button onclick="
                        const ok = setPlayerShirtNumber('\${esc(typeof playerKey === 'function' ? playerKey(currentSelected) : currentSelected.name)}', \${num}, state);
                        if(ok){
                          document.getElementById('shirtNumbersModal').remove();
                          openSquadShirtNumbersModal('\${esc(typeof playerKey === 'function' ? playerKey(currentSelected) : currentSelected.name)}');
                        }
                      " title="\${esc(title)}" style="height:42px;background:\${bg};border:1px solid \${border};color:\${color};border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:transform 0.1s ease">
                        <span>\${num}</span>
                        \${occupying && !isSelf ? \`<span style="font-size:7px;color:#f87171;line-height:1;max-width:40px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${occupying.name.split(' ').pop()}</span>\` : ''}
                      </button>
                    \`;
                  }).join('')}
                </div>
              </div>
            \` : \`
              <div style="text-align:center;padding:40px;color:#94a3b8">Selecione um jogador na lista ao lado.</div>
            \`}
          </div>

        </div>

        <!-- Footer -->
        <div style="padding:14px 24px;border-top:1px solid #1e293b;background:#1e293b;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:12px;color:#94a3b8">
            💡 As trocas de camisa são instantâneas e nunca geram jogadores com camisas duplicadas.
          </div>
          <button class="btn btn-primary" onclick="document.getElementById('shirtNumbersModal').remove()" style="font-weight:700;padding:8px 20px">
            Concluído
          </button>
        </div>

      </div>
    </div>
  \`;

  const existing = document.getElementById('shirtNumbersModal');
  if(existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

if(typeof window !== 'undefined'){
  window.ensureSquadShirtNumbers = ensureSquadShirtNumbers;
  window.setPlayerShirtNumber = setPlayerShirtNumber;
  window.assignTraditionalShirtNumbers = assignTraditionalShirtNumbers;
  window.openSquadShirtNumbersModal = openSquadShirtNumbersModal;
}
`;

// Inserir o sistema de camisa antes de normalizeSquadState ou no início
const normSquadIdx = code.indexOf('function normalizeSquadState(targetState = state){');
if (normSquadIdx !== -1) {
  code = code.slice(0, normSquadIdx) + shirtNumberSystemCode + '\n\n' + code.slice(normSquadIdx);
  console.log('✓ Successfully injected shirt numbers system before normalizeSquadState');
}

// Injetar ensureSquadShirtNumbers dentro de normalizeSquadState
const normSquadFuncIdx = code.indexOf('function normalizeSquadState(targetState = state){');
if (normSquadFuncIdx !== -1) {
  const normSquadBodyIdx = code.indexOf('{', normSquadFuncIdx);
  const injection = `\n  if(targetState && Array.isArray(targetState.squad)){ ensureSquadShirtNumbers(targetState); }`;
  code = code.slice(0, normSquadBodyIdx + 1) + injection + code.slice(normSquadBodyIdx + 1);
  console.log('✓ Hooked ensureSquadShirtNumbers inside normalizeSquadState');
}

// =========================================================================
// 4. ATUALIZAR TABELA DE squadPage COM NÚMERO DA CAMISA
// =========================================================================
// Adicionar botão no cabeçalho de ações da squadPage
const squadViewModeSalariesIdx = code.indexOf("if(squadViewMode === 'salaries'){");
if (squadViewModeSalariesIdx !== -1) {
  const squadTableIdx = code.indexOf('<table>', squadViewModeSalariesIdx);
  if (squadTableIdx !== -1) {
    // 1. Atualizar Header da tabela: adicionar <th>Nº</th> logo após <th>Foto</th>
    code = code.replace(
      '<th>Foto</th>\r\n              <th>Jogador</th>',
      '<th>Foto</th>\r\n              <th style="width:42px;text-align:center" title="Número da Camisa">Nº</th>\r\n              <th>Jogador</th>'
    );
    code = code.replace(
      '<th>Foto</th>\n              <th>Jogador</th>',
      '<th>Foto</th>\n              <th style="width:42px;text-align:center" title="Número da Camisa">Nº</th>\n              <th>Jogador</th>'
    );

    // 2. Atualizar Linhas da tabela: adicionar <td> com botão da camisa
    code = code.replace(
      '<td style="width:46px;text-align:center">${playerPhoto(p, 36)}</td>\r\n                <td>\r\n                  <b>${esc(p.name)}</b>',
      `<td style="width:46px;text-align:center">\${playerPhoto(p, 36)}</td>\r\n                <td style="width:42px;text-align:center"><button class="btn btn-sm btn-subtle" onclick="openSquadShirtNumbersModal('\${esc(typeof playerKey === 'function' ? playerKey(p) : p.name)}')" title="Alterar camisa de \${esc(p.name)}" style="padding:2px 7px;font-size:12px;font-weight:900;border-radius:6px;min-width:32px;color:#38bdf8;border:1px solid rgba(56,189,248,0.3)">#\${p.number || '-'}</button></td>\r\n                <td>\r\n                  <b>\${esc(p.name)}</b>`
    );
    code = code.replace(
      '<td style="width:46px;text-align:center">${playerPhoto(p, 36)}</td>\n                <td>\n                  <b>${esc(p.name)}</b>',
      `<td style="width:46px;text-align:center">\${playerPhoto(p, 36)}</td>\n                <td style="width:42px;text-align:center"><button class="btn btn-sm btn-subtle" onclick="openSquadShirtNumbersModal('\${esc(typeof playerKey === 'function' ? playerKey(p) : p.name)}')" title="Alterar camisa de \${esc(p.name)}" style="padding:2px 7px;font-size:12px;font-weight:900;border-radius:6px;min-width:32px;color:#38bdf8;border:1px solid rgba(56,189,248,0.3)">#\${p.number || '-'}</button></td>\n                <td>\n                  <b>\${esc(p.name)}</b>`
    );

    // 3. Adicionar botão "👕 Numeração das Camisas" na barra superior do elenco
    code = code.replace(
      `<button class="btn \${squadViewMode === 'salaries' ? 'btn-primary' : 'btn-subtle'}" onclick="setSquadViewMode('salaries')">💰 Salários</button>`,
      `<button class="btn btn-subtle" onclick="openSquadShirtNumbersModal()" style="display:inline-flex;align-items:center;gap:6px">👕 Numeração</button>\r\n          <button class="btn \${squadViewMode === 'salaries' ? 'btn-primary' : 'btn-subtle'}" onclick="setSquadViewMode('salaries')">💰 Salários</button>`
    );
    console.log('✓ Successfully injected shirt numbers column and button into squadPage');
  }
}

// =========================================================================
// 5. ATUALIZAR renderPitchPlayerPill E renderFifaMiniCard COM NÚMERO
// =========================================================================
// No renderPitchPlayerPill:
code = code.replace(
  '<span class="pill-pos">${esc(pos)}</span>\r\n      <span class="pill-name">${esc(shortName)}</span>',
  '<span class="pill-pos">${esc(pos)}</span>\r\n      <span class="pill-num" style="display:inline-block;background:rgba(0,0,0,0.45);border-radius:3px;padding:0 3px;font-size:9px;font-weight:900;color:#facc15;margin:0 2px">#${p?.number || (i+1)}</span>\r\n      <span class="pill-name">${esc(shortName)}</span>'
);
code = code.replace(
  '<span class="pill-pos">${esc(pos)}</span>\n      <span class="pill-name">${esc(shortName)}</span>',
  '<span class="pill-pos">${esc(pos)}</span>\n      <span class="pill-num" style="display:inline-block;background:rgba(0,0,0,0.45);border-radius:3px;padding:0 3px;font-size:9px;font-weight:900;color:#facc15;margin:0 2px">#${p?.number || (i+1)}</span>\n      <span class="pill-name">${esc(shortName)}</span>'
);

// No renderFifaMiniCard:
code = code.replace(
  '<span class="fifa-mini-card-pos">${esc(pos)}</span>',
  '<span class="fifa-mini-card-pos">${esc(pos)}</span>\r\n          ${p?.number ? `<span class="fifa-mini-card-num" style="font-size:8px;font-weight:900;color:#38bdf8;background:rgba(15,23,42,0.85);padding:1px 3px;border-radius:3px;margin-top:1px;line-height:1" title="Camisa #${p.number}">#${p.number}</span>` : \'\'}'
);
console.log('✓ Added shirt number display to tactical pitch pill and FIFA mini card');

// Salvar arquivo atualizado
fs.writeFileSync('js/game.js', code, 'utf8');
console.log('>>> Aplicação concluída com sucesso no js/game.js!');
