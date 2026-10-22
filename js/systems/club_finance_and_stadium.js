(function (window) {
  'use strict';

  const ClubFinanceAndStadium = {
    // #041 a #044: Empréstimos com Score de Crédito e Antecipação com Desconto de Juros
    takeLoan(state, amount, installments = 12) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const loans = state.bankLoans;
      const interestMonthly = loans.creditScore === 'AAA' ? 0.009 : loans.creditScore === 'AA' ? 0.014 : 0.022;
      const totalWithInterest = Math.round(amount * (1 + interestMonthly * installments));
      const installmentValue = Math.round(totalWithInterest / installments);

      loans.activeLoans = Array.isArray(loans.activeLoans) ? loans.activeLoans : [];
      loans.activeLoans.push({
        id: `loan_${Date.now()}`,
        principal: amount,
        interestRate: interestMonthly,
        totalInstallments: installments,
        remainingInstallments: installments,
        installmentValue,
        remainingBalance: totalWithInterest
      });
      state.balance = (Number(state.balance) || 0) + amount;
      state.clubBalance = state.balance;
      return { ok: true, installmentValue, totalWithInterest };
    },

    anticipateLoanInstallments(state, loanId, countToPay = 1) {
      const loans = state.bankLoans;
      const loanList = Array.isArray(loans) ? loans : (loans?.activeLoans || []);
      const loan = loanList.find((l) => l.id === loanId);
      if (!loan || loan.remainingInstallments < countToPay) return { ok: false, message: 'Parcelas inválidas.' };

      // Desconto de 35% sobre os juros embutidos nas parcelas antecipadas
      const discountFactor = 1 - ((loan.interestRate || 0.014) * 0.35 * countToPay);
      const costToPay = Math.round(loan.installmentValue * countToPay * Math.max(0.75, discountFactor));

      const curBal = Number(state.balance) || 0;
      if (curBal < costToPay) return { ok: false, message: 'Saldo do clube insuficiente para antecipar.' };

      state.balance = curBal - costToPay;
      state.clubBalance = state.balance;
      loan.remainingInstallments -= countToPay;
      loan.remainingBalance = Math.max(0, loan.remainingInstallments * loan.installmentValue);
      if (loan.remainingInstallments <= 0) {
        if (Array.isArray(loans)) {
          state.bankLoans = loans.filter((l) => l.id !== loanId);
        } else if (loans?.activeLoans) {
          loans.activeLoans = loans.activeLoans.filter((l) => l.id !== loanId);
        }
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
