/**
 * Teste Automatizado do Sistema de Concessão de Estacionamento & Parcerias Empresariais
 * AFM Manager 2027
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function runTest() {
  console.log('--- TESTE: SISTEMA DE CONCESSÃO DE ESTACIONAMENTO & MULTA CONTRATUAL ---');

  const gameJsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'game.js'), 'utf-8');

  // Cria contexto com DOM simulado
  const domElements = {};
  const mockDoc = {
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        dataset: {},
        innerHTML: '',
        appendChild: (child) => {},
        remove: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
      };
      return el;
    },
    body: {
      appendChild: (el) => {}
    },
    getElementById: (id) => domElements[id] || null,
    querySelector: (sel) => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };

  const sandbox = {
    window: {},
    document: mockDoc,
    console,
    setTimeout: (fn) => fn(),
    setInterval: () => {},
    clearTimeout: () => {},
    clearInterval: () => {},
    Math,
    Number,
    String,
    Array,
    Object,
    Date
  };
  sandbox.window = sandbox;

  const script = new vm.Script(gameJsCode);
  script.runInNewContext(sandbox);

  console.log('✓ Script game.js carregado com sucesso no sandbox');

  const w = sandbox.window;
  const fmtMoney = w.fmtMoney || ((n) => 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR'));

  // 1. Testa Propostas de Concessão
  console.log('\n1. Testando catálogo de propostas de empresas operadoras...');
  const proposals = w.getParkingConcessionProposals('Flamengo', { club: 'Flamengo', infrastructure: { stadium: { capacity: 55000 } } });
  if (!Array.isArray(proposals) || proposals.length !== 4) {
    throw new Error(`Esperado 4 propostas de concessionárias, recebido: ${proposals?.length}`);
  }

  const ids = proposals.map(p => p.id);
  if (!ids.includes('estapar') || !ids.includes('indigo') || !ids.includes('parebem') || !ids.includes('multipark')) {
    throw new Error(`Empresas operadoras ausentes: ${ids.join(', ')}`);
  }

  proposals.forEach(p => {
    if (!p.name || p.upfrontBonus <= 0 || p.monthlyFee <= 0 || p.revenueSharePct <= 0 || p.bonusInvestedSpaces <= 0 || p.durationMonths <= 0 || p.basePenalty <= 0) {
      throw new Error(`Proposta inválida para ${p.id}: ${JSON.stringify(p)}`);
    }
    console.log(`  ✓ ${p.name}: Luvas ${fmtMoney(p.upfrontBonus)} • Mensal ${fmtMoney(p.monthlyFee)} • Repasse ${p.revenueSharePct}% • Vagas +${p.bonusInvestedSpaces} • Multa ${fmtMoney(p.basePenalty)}`);
  });

  // 2. Testa Assinatura da Concessão e Crédito de Luvas
  console.log('\n2. Testando assinatura da concessão e crédito de luvas...');
  w.state = {
    club: 'Santos FC',
    date: '2026-03-01',
    season: 2026,
    balance: 500000,
    income: 0,
    expense: 0,
    ticketPrice: 40,
    parkingPrice: 25,
    infrastructure: {
      stadium: { capacity: 20000 },
      parking: { level: 0, spots: 0 }
    },
    squad: [],
    news: [],
    history: []
  };

  const clubProposals = w.getParkingConcessionProposals(w.state.club, w.state);
  const parebemProposal = clubProposals.find(p => p.id === 'parebem');
  const initialBalance = w.state.balance;
  w.signParkingConcession('parebem');

  if (!w.state.parkingConcession || w.state.parkingConcession.companyId !== 'parebem') {
    throw new Error('Falha ao registrar concessão no state.parkingConcession');
  }

  if (w.state.balance !== initialBalance + parebemProposal.upfrontBonus) {
    throw new Error(`Saldo incorreto após luvas. Esperado ${initialBalance + parebemProposal.upfrontBonus}, obtido ${w.state.balance}`);
  }

  console.log(`  ✓ Concessão assinada com sucesso! Luvas de ${fmtMoney(parebemProposal.upfrontBonus)} creditadas.`);

  // 3. Testa Projeção com Concessão Ativa (Vagas da Concessionária + Repasse %)
  console.log('\n3. Testando projeção de dia de jogo com vagas da concessionária e repasse %...');
  const proj = w.attendanceProjection('Palmeiras');
  if (proj.parkSpots !== parebemProposal.bonusInvestedSpaces) {
    throw new Error(`Esperado ${parebemProposal.bonusInvestedSpaces} vagas totais da concessionária (já que nível base é 0), obtido: ${proj.parkSpots}`);
  }

  if (!proj.isConcession || proj.concessionSharePct !== parebemProposal.revenueSharePct) {
    throw new Error(`Flag de concessão ou percentual incorretos na projeção: ${proj.concessionSharePct}%`);
  }

  const expectedParkRev = Math.round(proj.grossParkRevenue * (parebemProposal.revenueSharePct / 100));
  if (proj.parkRevenue !== expectedParkRev) {
    throw new Error(`Cálculo de repasse de estacionamento incorreto. Esperado ${expectedParkRev}, obtido ${proj.parkRevenue}`);
  }

  console.log(`  ✓ Vagas da Concessão ativas (+${proj.concessionSpots} vagas). Arrecadação bruta: ${fmtMoney(proj.grossParkRevenue)} -> Repasse do clube (${proj.concessionSharePct}%): ${fmtMoney(proj.parkRevenue)}`);

  // 4. Testa Repasse Mensal em applyMonthlyTrainingAndCommercial
  console.log('\n4. Testando repasse mensal fixo e decremento do contrato...');
  const preMonthBalance = w.state.balance;
  const initialMonths = w.state.parkingConcession.monthsRemaining;
  const initialEarned = w.state.parkingConcession.totalEarned;
  w.applyMonthlyTrainingAndCommercial();

  if (w.state.balance < preMonthBalance + parebemProposal.monthlyFee) {
    throw new Error(`Repasse mensal não creditado no saldo. Saldo anterior: ${preMonthBalance}, obtido ${w.state.balance}`);
  }

  if (w.state.parkingConcession.totalEarned !== initialEarned + parebemProposal.monthlyFee) {
    throw new Error(`Total arrecadado no contrato não atualizado. Esperado ${initialEarned + parebemProposal.monthlyFee}, obtido ${w.state.parkingConcession.totalEarned}`);
  }

  if (w.state.parkingConcession.monthsRemaining !== initialMonths - 1) {
    throw new Error(`Meses restantes não decrementados. Esperado ${initialMonths - 1}, obtido ${w.state.parkingConcession.monthsRemaining}`);
  }

  console.log(`  ✓ Repasse mensal de ${fmtMoney(parebemProposal.monthlyFee)} creditado! Meses restantes: ${w.state.parkingConcession.monthsRemaining}`);

  // 5. Testa Cláusula de Multa Contratual e Rescisão Antecipada
  console.log('\n5. Testando multa contratual e rescisão antecipada...');
  const remMonths = w.state.parkingConcession.monthsRemaining;
  const durMonths = w.state.parkingConcession.durationMonths;
  const expectedPenalty = Math.round(parebemProposal.basePenalty * (remMonths / durMonths));

  // Bloqueio se saldo insuficiente
  w.state.balance = 1000;
  w.cancelParkingConcession();
  if (w.state.parkingConcession === null) {
    throw new Error('Rescisão não deveria ter sido permitida com saldo insuficiente para pagar a multa!');
  }
  console.log('  ✓ Bloqueio de rescisão com saldo insuficiente validado.');

  // Rescisão com saldo suficiente
  w.state.balance = 2000000;
  const balBeforeCancel = w.state.balance;
  w.cancelParkingConcession();

  if (w.state.parkingConcession !== null) {
    throw new Error('Concessão não foi encerrada após pagamento da multa.');
  }

  if (w.state.balance !== balBeforeCancel - expectedPenalty) {
    throw new Error(`Multa debitada incorretamente. Esperado saldo ${balBeforeCancel - expectedPenalty}, obtido ${w.state.balance}`);
  }

  console.log(`  ✓ Concessão rescindida com sucesso! Multa contratual de ${fmtMoney(expectedPenalty)} paga pelo clube.`);

  // 6. Teste de Expiração Natural do Contrato
  console.log('\n6. Testando expiração natural do contrato após término do prazo...');
  w.signParkingConcession('multipark');
  w.state.parkingConcession.monthsRemaining = 1;
  w.applyMonthlyTrainingAndCommercial();

  if (w.state.parkingConcession !== null) {
    throw new Error('Contrato de concessão deveria ter expirado automaticamente ao atingir 0 meses!');
  }

  console.log('  ✓ Contrato expirou naturalmente após 0 meses restantes e a gestão voltou 100% ao clube.');

  // 7. Teste de Renderização dos Botões no Card de Instalação (Exatamente como na foto enviada pelo usuário)
  console.log('\n7. Testando renderização do botão no card da instalação (posição circulada na foto)...');
  w.state.parkingConcession = null;
  const structHtmlSemConcessao = w.structurePage();
  if (!structHtmlSemConcessao.includes('btnOpenParkingConcession')) {
    throw new Error('Botão btnOpenParkingConcession não encontrado no HTML da aba Estrutura!');
  }
  if (!structHtmlSemConcessao.includes('Concessão &amp; Parcerias') && !structHtmlSemConcessao.includes('Concessão & Parcerias')) {
    throw new Error('Texto do botão de concessão sem parceria ativa incorreto!');
  }
  if (!structHtmlSemConcessao.includes('btnOpenParkingInteractive')) {
    throw new Error('Botão btnOpenParkingInteractive não encontrado no card do estacionamento!');
  }
  console.log('  ✓ Botão de Concessão & Parcerias renderizado no card de instalação ao lado de Evoluir.');

  w.signParkingConcession('estapar');
  const structHtmlComConcessao = w.structurePage();
  if (!structHtmlComConcessao.includes('Concessão: Estapar Operadora de Estacionamentos')) {
    throw new Error('Texto do botão de concessão com parceria ativa não exibiu o nome da empresa!');
  }
  if (!structHtmlComConcessao.includes('Repasse: <b>30% por jogo</b>')) {
    throw new Error('Badge de repasse por jogo não encontrado no card da instalação!');
  }
  console.log('  ✓ Card atualizado em tempo real com nome da concessionária, vagas e repasse %.');

  console.log('\n======================================================');
  console.log('✅ TODOS OS TESTES DE CONCESSÃO DE ESTACIONAMENTO PASSARAM!');
  console.log('======================================================');
}

runTest();
