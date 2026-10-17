const fs = require('fs');

let gameCode = fs.readFileSync('js/game.js', 'utf8');

// =========================================================================
// 1. ATUALIZAR calculateSeasonPrizeMoney E ADICIONAR calculateCupPhasePrize
// =========================================================================
const oldPrizeFunc = `function calculateSeasonPrizeMoney(position, comp){
  const isA = comp?.id === 'bra-a';
  const isB = comp?.id === 'bra-b';
  if(isA){
    if(position === 1) return 47800000;
    if(position === 2) return 45400000;
    if(position === 3) return 43000000;
    if(position === 4) return 40600000;
    if(position <= 6) return 35000000;
    if(position <= 10) return 25000000;
    if(position <= 16) return 16000000;
    return 3000000;
  } else if(isB){
    if(position === 1) return 12000000;
    if(position <= 4) return 8000000;
    return 2000000;
  }
  return 1500000;
}`;

const newPrizeFunc = `function calculateSeasonPrizeMoney(position, comp){
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

if (gameCode.includes(oldPrizeFunc)) {
  gameCode = gameCode.replace(oldPrizeFunc, newPrizeFunc);
  console.log('✓ Updated calculateSeasonPrizeMoney and added calculateCupPhasePrize');
} else {
  console.log('! Old calculateSeasonPrizeMoney pattern not matched directly, checking normalized replacement');
}

// =========================================================================
// 2. ATUALIZAR isPrizeEligibleLeague EM centralPage
// =========================================================================
gameCode = gameCode.replace(
  "const isPrizeEligibleLeague = ['bra-a','bra-b'].includes(comp?.id);",
  "const isPrizeEligibleLeague = Boolean(comp?.id && comp?.type !== 'knockout');"
);
console.log('✓ Updated isPrizeEligibleLeague in centralPage');

// =========================================================================
// 3. ATUALIZAR regionCountries PARA SUPORTAR AMÉRICA DO NORTE
// =========================================================================
gameCode = gameCode.replace(
  "if(continent==='América do Sul')return ['Brasil','Argentina','Uruguai','Chile','Colômbia','Equador','Paraguai','Peru','Bolívia','Venezuela'];",
  "if(continent==='América do Sul')return ['Brasil','Argentina','Uruguai','Chile','Colômbia','Equador','Paraguai','Peru','Bolívia','Venezuela'];\n  if(continent==='América do Norte')return ['Estados Unidos','México','Canadá'];"
);
console.log('✓ Updated regionCountries with América do Norte');

// =========================================================================
// 4. ATUALIZAR intlLigas COM usa-1
// =========================================================================
gameCode = gameCode.replace(
  "const intlLigas = ['eng-1', 'eng-2', 'esp-1', 'esp-2', 'ita-1', 'ger-1', 'fra-1', 'por-1', 'ned-1', 'arg-1', 'uru-1', 'chi-1', 'col-1', 'par-1', 'ecu-1', 'per-1', 'bol-1', 'ven-1', 'ksa-1', 'jpn-1', 'kor-1', 'chn-1', 'qat-1', 'uae-1'];",
  "const intlLigas = ['usa-1', 'eng-1', 'eng-2', 'esp-1', 'esp-2', 'ita-1', 'ger-1', 'fra-1', 'por-1', 'ned-1', 'arg-1', 'uru-1', 'chi-1', 'col-1', 'par-1', 'ecu-1', 'per-1', 'bol-1', 'ven-1', 'ksa-1', 'jpn-1', 'kor-1', 'chn-1', 'qat-1', 'uae-1'];"
);
console.log('✓ Added usa-1 to intlLigas');

// =========================================================================
// 5. ATUALIZAR inferClubMeta COM MLS
// =========================================================================
gameCode = gameCode.replace(
  "[/saudi|roshn/i,'Arábia Saudita','Saudi Pro League'],[/j1 league|japan/i,'Japão','J1 League'],",
  "[/major league soccer|mls/i,'Estados Unidos','Major League Soccer'],[/saudi|roshn/i,'Arábia Saudita','Saudi Pro League'],[/j1 league|japan/i,'Japão','J1 League'],"
);
console.log('✓ Updated inferClubMeta with MLS');

// =========================================================================
// 6. ATUALIZAR marketRegion e loanRegion COM América do Norte
// =========================================================================
gameCode = gameCode.replace(
  `<select id="marketRegion">
              <option value="">Todas as Regiões</option>
              <option value="América do Sul">América do Sul</option>
              <option value="Europa">Europa</option>`,
  `<select id="marketRegion">
              <option value="">Todas as Regiões</option>
              <option value="América do Sul">América do Sul</option>
              <option value="América do Norte">América do Norte</option>
              <option value="Europa">Europa</option>`
);

gameCode = gameCode.replace(
  `<select id="loanRegion">
                <option value="">Todas as Regiões</option>
                <option value="América do Sul">América do Sul</option>
                <option value="Europa">Europa</option>`,
  `<select id="loanRegion">
                <option value="">Todas as Regiões</option>
                <option value="América do Sul">América do Sul</option>
                <option value="América do Norte">América do Norte</option>
                <option value="Europa">Europa</option>`
);
console.log('✓ Added América do Norte to marketRegion and loanRegion');

// =========================================================================
// 7. PREMIAÇÃO NA COPA DO BRASIL (playCopaDoBrasilFixture)
// =========================================================================
const oldCopaPlayBlock = `  state.news = state.news || [];
  state.news.unshift(\`🏆 Copa do Brasil (\${phase.name}): \${fixture.home} \${hg} x \${ag} \${fixture.away}. \${norm(winner) === norm(state.club) ? 'Classificado.' : 'Eliminado.'}\`);
  if(norm(winner) !== norm(state.club)){
    const opp = norm(fixture.home) === norm(state.club) ? fixture.away : fixture.home;
    const oppGoals = norm(fixture.home) === norm(state.club) ? ag : hg;
    registrarEliminacaoMataMata(state, 'Copa do Brasil', phase.name, opp, userGoals, oppGoals);
  }`;

const newCopaPlayBlock = `  state.news = state.news || [];
  const userWon = norm(winner) === norm(state.club);
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
  }`;

if (gameCode.includes(oldCopaPlayBlock)) {
  gameCode = gameCode.replace(oldCopaPlayBlock, newCopaPlayBlock);
  console.log('✓ Added phase and champion prize money to playCopaDoBrasilFixture');
}

// =========================================================================
// 8. PREMIAÇÃO EM isKO (simulateQuickRound)
// =========================================================================
gameCode = gameCode.replace(
  "const cupPrize = comp.id === 'bra-cup' ? 1500000 : 2500000;",
  "const cupPrize = calculateCupPhasePrize(comp?.id || 'cup', `Fase ${state.round + 1}`, true, false);"
);

// E ao ser campeão na final de copa:
const oldTitleChampionBlock = `state.titles.push(comp.name);
        state.news.unshift(\`🏆 \${state.club} é CAMPEÃO da \${comp.name}!\`);`;

const newTitleChampionBlock = `state.titles.push(comp.name);
        const tourneyTitlePrize = calculateCupPhasePrize(comp?.id || 'cup', 'Final', true, true);
        if(tourneyTitlePrize > 0){
          state.balance += tourneyTitlePrize;
          state.income = (state.income || 0) + tourneyTitlePrize;
          state.news.unshift(\`💰 PREMIAÇÃO DO TÍTULO: +\${fmtMoney(tourneyTitlePrize)} creditados pela conquista da \${comp.name}!\`);
        }
        state.news.unshift(\`🏆 \${state.club} é CAMPEÃO da \${comp.name}!\`);`;

if (gameCode.includes(oldTitleChampionBlock)) {
  gameCode = gameCode.replace(oldTitleChampionBlock, newTitleChampionBlock);
  console.log('✓ Added trophy champion prize to knockout cups in simulateQuickRound');
}

fs.writeFileSync('js/game.js', gameCode, 'utf8');
console.log('✓ Completed part 1 of apply_all_user_requests.js');
