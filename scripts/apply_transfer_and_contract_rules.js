const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(gameJsPath, 'utf8');

// Normaliza line endings para LF durante operações se necessário, ou trabalha diretamente
console.log('Original length:', content.length);

// 1. Atualizar finalizeRound
const oldFinalizeOffers = `  // Atualiza propostas de mercado para jogadores colocados à venda ou para empréstimo
  let newOffersCount = 0;
  state.transferOffers = state.transferOffers || {};
  state.loanOffers = state.loanOffers || {};
  const listedKeys = new Set([...(state.transferListed||[]), ...(state.loanListed||[])]);
  for(const k of listedKeys){
    const p = state.squad.find(q => playerKey(q) === k);
    if(p){
      state.transferOffers[k] = generateBuyerOffers(p);
      state.loanOffers[k] = generateLoanOffers(p);
      newOffersCount++;
    }
  }
  if(newOffersCount > 0){
    state.news.unshift(\`📬 Chegaram novas propostas de compra e empréstimo para seus jogadores na lista de transferências!\`);
  }`;

const newFinalizeOffers = `  // Atualiza propostas de mercado: Compra apenas se listado à venda (ou contrato <= 6m); Empréstimo apenas se listado p/ empréstimo
  let newOffersCount = 0;
  state.transferOffers = state.transferOffers || {};
  state.loanOffers = state.loanOffers || {};

  // 1. Atletas com 6 meses ou menos de contrato entram automaticamente na lista de venda
  syncExpiringContractsToTransferList(state);

  // 2. Propostas de Compra Definitiva: apenas para atletas na lista de venda
  (state.transferListed || []).forEach(k => {
    const p = state.squad.find(q => playerKey(q) === k);
    if(p && !p.isLoan){
      state.transferOffers[k] = generateBuyerOffers(p);
      newOffersCount++;
    }
  });

  // 3. Propostas de Empréstimo: apenas para atletas na lista de empréstimo
  (state.loanListed || []).forEach(k => {
    const p = state.squad.find(q => playerKey(q) === k);
    if(p && !p.isLoan){
      state.loanOffers[k] = generateLoanOffers(p);
      newOffersCount++;
    }
  });

  // 4. Limpa ofertas residuais de quem não está mais listado
  Object.keys(state.transferOffers).forEach(k => {
    if(!(state.transferListed || []).includes(k)) delete state.transferOffers[k];
  });
  Object.keys(state.loanOffers).forEach(k => {
    if(!(state.loanListed || []).includes(k)) delete state.loanOffers[k];
  });

  if(newOffersCount > 0){
    state.news.unshift(\`📬 Chegaram novas propostas oficiais para seus jogadores na lista de transferências/empréstimos!\`);
  }`;

if (content.includes(oldFinalizeOffers)) {
  content = content.replace(oldFinalizeOffers, newFinalizeOffers);
  console.log('✓ finalizeRound offers updated');
} else {
  // Tenta com CRLF
  const oldFinalizeOffersCRLF = oldFinalizeOffers.replace(/\n/g, '\r\n');
  const newFinalizeOffersCRLF = newFinalizeOffers.replace(/\n/g, '\r\n');
  if (content.includes(oldFinalizeOffersCRLF)) {
    content = content.replace(oldFinalizeOffersCRLF, newFinalizeOffersCRLF);
    console.log('✓ finalizeRound offers updated (CRLF)');
  } else {
    console.error('❌ Could not find oldFinalizeOffers block');
  }
}

// 2. Atualizar checkIncomingPlayerBids (propostas comuns espontâneas)
const oldIncomingRegular = `  const lineupKeys = state.lineup || [];
  const starters = state.squad.filter(p => lineupKeys.includes(playerKey(p)));
  if(!starters.length) return;
  
  // Escolhe o titular mais valorizado
  const target = starters.sort((a,b) => calcValueMi(b) - calcValueMi(a))[0];
  if(!target) return;`;

const newIncomingRegular = `  // Propostas espontâneas comuns da IA: apenas para atletas colocados à venda ou com <= 6 meses de contrato
  const eligibleCandidates = (state.squad || []).filter(p => {
    const k = playerKey(p);
    return ((state.transferListed || []).includes(k) || isPlayerContractExpiringSoon(p, state)) && !p.isLoan && !p.injuryDays && !p.injuredRounds;
  });
  if(!eligibleCandidates.length) return;
  
  // Escolhe o atleta colocado à venda mais valorizado
  const target = eligibleCandidates.sort((a,b) => calcValueMi(b) - calcValueMi(a))[0];
  if(!target) return;`;

if (content.includes(oldIncomingRegular)) {
  content = content.replace(oldIncomingRegular, newIncomingRegular);
  console.log('✓ checkIncomingPlayerBids regular updated');
} else {
  const oldIncomingRegularCRLF = oldIncomingRegular.replace(/\n/g, '\r\n');
  const newIncomingRegularCRLF = newIncomingRegular.replace(/\n/g, '\r\n');
  if (content.includes(oldIncomingRegularCRLF)) {
    content = content.replace(oldIncomingRegularCRLF, newIncomingRegularCRLF);
    console.log('✓ checkIncomingPlayerBids regular updated (CRLF)');
  } else {
    console.error('❌ Could not find oldIncomingRegular block');
  }
}

// 3. Trava de janela de transferências em btnAcceptSingleBid
const oldAcceptBidCheck = `      const playerToSell = (state.squad || []).find(x => playerKey(x) === b.playerKey);
      if(!playerToSell){
        toast('Jogador não encontrado no elenco.');
        closeCustomModal();
        render();
        return;
      }`;

const newAcceptBidCheck = `      if(!isTransferWindowOpen(state.date)){
        toast('🔒 A janela de transferências está fechada! Mudanças de clube e transferências só podem ser concretizadas com a Janela Aberta.');
        return;
      }
      const playerToSell = (state.squad || []).find(x => playerKey(x) === b.playerKey);
      if(!playerToSell){
        toast('Jogador não encontrado no elenco.');
        closeCustomModal();
        render();
        return;
      }`;

if (content.includes(oldAcceptBidCheck)) {
  content = content.replace(oldAcceptBidCheck, newAcceptBidCheck);
  console.log('✓ btnAcceptSingleBid window check added');
} else {
  const oldAcceptBidCheckCRLF = oldAcceptBidCheck.replace(/\n/g, '\r\n');
  const newAcceptBidCheckCRLF = newAcceptBidCheck.replace(/\n/g, '\r\n');
  if (content.includes(oldAcceptBidCheckCRLF)) {
    content = content.replace(oldAcceptBidCheckCRLF, newAcceptBidCheckCRLF);
    console.log('✓ btnAcceptSingleBid window check added (CRLF)');
  } else {
    console.error('❌ Could not find oldAcceptBidCheck block');
  }
}

fs.writeFileSync(gameJsPath, content, 'utf8');
console.log('File successfully written!');
