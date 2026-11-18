(function (window) {
  'use strict';

  const ClubFinanceAndStadium = {
    // #041 a #044: Empréstimos com Score de Crédito e Antecipação com Desconto de Juros
    takeLoan(state, amount, installments = 12) {
      if (!state || amount <= 0 || installments <= 0) return { ok: false, message: 'Valores inválidos.' };
      if (!Array.isArray(state.bankLoans)) {
        state.bankLoans = Array.isArray(state.bankLoans?.activeLoans) ? state.bankLoans.activeLoans : [];
      }
      const score = state.bankCreditScore || 'AA';
      const interestMonthly = score === 'AAA' ? 0.009 : score === 'AA' ? 0.014 : 0.022;
      const totalWithInterest = Math.round(amount * (1 + interestMonthly * installments));
      const installmentValue = Math.round(totalWithInterest / installments);
      const loanObj = {
        id: `loan_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        principal: amount,
        remainingPrincipal: amount,
        interestRate: Number((interestMonthly * 100).toFixed(2)),
        totalDebt: totalWithInterest,
        remainingDebt: totalWithInterest,
        remainingBalance: totalWithInterest,
        totalInstallments: installments,
        paidInstallments: 0,
        remainingInstallments: installments,
        createdSeason: Number(state.season) || 2026,
        installmentValue,
        nextDueRound: (Number(state.round) || 0) + 2,
        overdue: false,
        penalty: 0
      };
      state.bankLoans.push(loanObj);
      state.balance = (Number(state.balance) || 0) + amount;
      state.clubBalance = state.balance;
      state.financingInflow = (Number(state.financingInflow) || 0) + amount;
      return { ok: true, loanId: loanObj.id, installmentValue, totalWithInterest };
    },

    anticipateLoanInstallments(state, loanId, countToPay = 1) {
      if (!Array.isArray(state?.bankLoans)) {
        state.bankLoans = Array.isArray(state?.bankLoans?.activeLoans) ? state.bankLoans.activeLoans : [];
      }
      const loan = state.bankLoans.find((l) => l.id === loanId);
      if (!loan || loan.remainingInstallments < countToPay || countToPay <= 0) return { ok: false, message: 'Parcelas inválidas.' };

      const monthlyRateFrac = (Number(loan.interestRate) > 0.2 ? Number(loan.interestRate) / 100 : (Number(loan.interestRate) || 0.014));
      const discountFactor = 1 - (monthlyRateFrac * 0.35 * countToPay);
      const costToPay = Math.round(loan.installmentValue * countToPay * Math.max(0.75, discountFactor));

      const curBal = Number(state.balance) || 0;
      if (curBal < costToPay) return { ok: false, message: 'Saldo do clube insuficiente para antecipar.' };

      state.balance = curBal - costToPay;
      state.clubBalance = state.balance;
      loan.paidInstallments = (Number(loan.paidInstallments) || 0) + countToPay;
      loan.remainingInstallments = Math.max(0, loan.remainingInstallments - countToPay);
      loan.remainingDebt = Math.max(0, loan.remainingInstallments * loan.installmentValue);
      loan.remainingBalance = loan.remainingDebt;
      loan.overdue = false;
      loan.penalty = 0;
      if (loan.remainingInstallments <= 0 || loan.remainingDebt <= 0) {
        state.bankLoans = state.bankLoans.filter((l) => l.id !== loanId);
      }
      if (!state.bankLoans.some(l => l.overdue)) {
        state.transferBan = false;
      }
      return { ok: true, savedMoney: (loan.installmentValue * countToPay) - costToPay };
    },

    // #047 a #051: Cálculo Realista de Público Presente e % de Ocupação do Estádio
    calculateMatchAttendance(state, { isDerby = false, rivalReputation = 65 } = {}) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const st = state.stadium || {};
      const cap = st.capacity || state.stadiumCapacity || 3200;
      const fanMood = ((state.confidence?.fans ?? state.trust?.fans) || 75) / 100;
      const price = st.ticketPrice || state.ticketPrice || 30;
      const priceFactor = Math.max(0.25, 1.35 - (price / 80));
      const derbyBoost = isDerby ? 1.45 : 1.0;

      const rawAttendance = Math.round(cap * 0.32 * fanMood * priceFactor * derbyBoost * (rivalReputation / 65));
      const attendance = Math.max(120, Math.min(cap, rawAttendance));
      const occupancyPct = Math.max(1, Math.round((attendance / cap) * 100));
      const grossTicketRevenue = (attendance * price) + ((st.vipLevel || 1) * 4500);

      return {
        stadiumName: st.name || state.stadiumName || 'Estádio Municipal',
        attendance,
        capacity: cap,
        occupancyPct,
        grossTicketRevenue,
        labelFooter: `Público presente: ${attendance.toLocaleString('pt-BR')} (${occupancyPct}% da capacidade)`
      };
    }
  };

  window.AFM_ClubFinance = ClubFinanceAndStadium;
})(window);
