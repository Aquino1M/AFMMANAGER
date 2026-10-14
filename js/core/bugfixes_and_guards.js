(function (window) {
  'use strict';

  const audioLastPlayed = new Map();
  let turnMutexLocked = false;

  const AFM_Guards = {
    playerIndexMap: new Map(),
    clubIndexMap: new Map(),

    safeNumber(val, fallback = 0) {
      const n = Number(val);
      return Number.isFinite(n) ? n : fallback;
    },

    migrateSaveState(state) {
      if (!state) return state;

      if (state.clubBalance === undefined && state.balance !== undefined) {
        state.clubBalance = state.balance;
      }
      if (state.balance === undefined && state.clubBalance !== undefined) {
        state.balance = state.clubBalance;
      }
      state.clubBalance = this.safeNumber(state.clubBalance, 2500000);
      state.balance = state.clubBalance;

      state.managerPersonal = state.managerPersonal || {
        name: state.managerName || state.manager || 'Aquino',
        personalBalance: this.safeNumber(state.managerBalance ?? state.managerMoney, 50000),
        salary: this.safeNumber(state.managerSalary, 15000),
        clubShares: this.safeNumber(state.clubShares, 0),
        shareBasePrice: 16000,
        businesses: [],
        coursesCompleted: [],
        careerPoints: 0,
        trophies: []
      };

      if (!state.managerPersonal.coursesCompleted) state.managerPersonal.coursesCompleted = [];
      if (!state.managerPersonal.businesses) state.managerPersonal.businesses = [];

      state.confidence = state.confidence || {
        board: state.boardConfidence ?? 75,
        fans: 75,
        squad: 75
      };

      state.resaleClauses = Array.isArray(state.resaleClauses)
        ? state.resaleClauses
        : (Array.isArray(state.futureSaleClauses) ? state.futureSaleClauses : []);
      state.proposals = Array.isArray(state.proposals) ? state.proposals : [];
      state.shortlist = Array.isArray(state.shortlist) ? state.shortlist : [];

      if (!Array.isArray(state.bankLoans)) {
        const recovered = Array.isArray(state.bankLoans?.activeLoans) ? state.bankLoans.activeLoans : [];
        state.bankLoansMeta = {
          lastProcessedPeriod: state.bankLoans?.lastProcessedPeriod || null,
          creditScore: state.bankLoans?.creditScore || 'AA',
          creditLimit: state.bankLoans?.creditLimit || 5000000
        };
        state.bankLoans = recovered;
      }

      state.stadium = state.stadium || {
        name: state.stadiumName || 'Augustinho Pires de Lima',
        capacity: state.stadiumCapacity || 3200,
        pitchQuality: 85,
        ticketPrice: state.ticketPrice || 30,
        vipLevel: 1,
        lightingLevel: 1,
        socioCount: 450
      };

      state.tacticalSetup = state.tacticalSetup || {
        mentality: 'EQUILIBRADA',
        buildUp: 'CURTA',
        progression: 'EQUILIBRADA',
        defenseLine: 'MEDIA',
        pressing: 'NORMAL',
        trainingFocus: 'TATICO'
      };

      if (!state.userClubId && state.club) {
        state.userClubId = state.club;
      }

      return state;
    },

    // #004: Indexador O(1) em Map() para busca instantânea de atletas e clubes
    rebuildFastIndexes(allPlayers, allClubs) {
      this.playerIndexMap.clear();
      this.clubIndexMap.clear();
      if (Array.isArray(allPlayers)) {
        allPlayers.forEach((p) => {
          if (p && (p.id != null || p.name)) {
            const key = String(p.id ?? p.name);
            this.playerIndexMap.set(key, p);
          }
        });
      }
      if (Array.isArray(allClubs)) {
        allClubs.forEach((c) => {
          if (c && (c.id != null || c.name)) {
            const key = String(c.id ?? c.name);
            this.clubIndexMap.set(key, c);
          }
        });
      }
    },

    // #011: Audio Pool com Cooldown (180ms) para evitar som encavalado em 20x e 40x
    playSoundSafe(audioSrc, category = 'sfx', volume = 0.7) {
      const now = performance.now();
      const last = audioLastPlayed.get(audioSrc) || 0;
      if (now - last < 180) return; // Cooldown de 180ms
      audioLastPlayed.set(audioSrc, now);
      try {
        if (window.afmAudio && typeof window.afmAudio.playSFX === 'function') {
          window.afmAudio.playSFX(audioSrc);
          return;
        }
        const audio = new Audio(audioSrc);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch(() => {});
      } catch (e) {}
    },

    // #013: Trava Mutex para avanço de dia/rodada contra clique duplo
    runWithTurnLock(fn) {
      if (turnMutexLocked) return false;
      turnMutexLocked = true;
      try {
        return fn();
      } finally {
        setTimeout(() => { turnMutexLocked = false; }, 220);
      }
    },

    // #007 & #008: Auto-Save em duplo slot e Exportação .afmsave
    saveWithDualSlot(state) {
      try {
        const prev = localStorage.getItem('afm_active_save');
        if (prev) localStorage.setItem('afm_backup_save', prev);
        localStorage.setItem('afm_active_save', JSON.stringify(state));
        return true;
      } catch (e) {
        console.error('Erro ao salvar dual slot:', e);
        return false;
      }
    },

    exportSaveFile(state) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `AFM2027_${state?.managerPersonal?.name || state?.manager || 'Aquino'}_${Date.now()}.afmsave`;
      a.click();
    },

    // #005: Fallback automático em 3 camadas (.svg -> .png -> Escudo SVG Dinâmico)
    attachSmartImageFallback(imgElement, type, id, fallbackLabel = 'AFM') {
      if (!imgElement) return;
      const baseFolder = type === 'player' ? 'img/players/' : 'img/badges/';
      imgElement.loading = 'lazy';
      imgElement.decoding = 'async';
      imgElement.dataset.fallbackStep = imgElement.dataset.fallbackStep || '0';

      imgElement.onerror = function () {
        const step = parseInt(this.dataset.fallbackStep, 10);
        if (step === 0) {
          this.dataset.fallbackStep = '1';
          this.src = `${baseFolder}${id}.png`;
        } else if (step === 1) {
          this.dataset.fallbackStep = '2';
          this.src = `${baseFolder}${id}.svg`;
        } else {
          this.onerror = null;
          const initials = (fallbackLabel || 'FC').substring(0, 3).toUpperCase();
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
            <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#1e1b4b"/>
            </linearGradient></defs>
            <path d="M32 4 L56 14 V32 C56 47 32 58 32 60 C32 58 8 47 8 32 V14 Z" fill="url(#g)" stroke="#a78bfa" stroke-width="2"/>
            <text x="32" y="37" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${initials}</text>
          </svg>`;
          this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
        }
      };
    },

    cleanExpiredProposals(state, currentRoundOrDay) {
      if (!state || !Array.isArray(state.proposals)) return [];
      const expired = [];
      state.proposals = state.proposals.filter((prop) => {
        if (prop.status === 'PENDING' && currentRoundOrDay >= prop.expiresAt) {
          prop.status = 'EXPIRED';
          expired.push(prop);
          return false;
        }
        return prop.status === 'PENDING';
      });
      return expired;
    },

    registerResaleClause(state, { playerId, playerName, beneficiaryClubId, sellerClubId, percentage }) {
      if (!percentage || percentage <= 0) return;
      state.resaleClauses = state.resaleClauses || [];
      state.resaleClauses = state.resaleClauses.filter(
        (c) => !(c.playerId === playerId && c.beneficiaryClubId === beneficiaryClubId)
      );
      state.resaleClauses.push({
        id: `clause_${Date.now()}_${playerId}`,
        playerId,
        playerName,
        beneficiaryClubId,
        sellerClubId,
        percentage: Math.min(50, Math.max(1, Number(percentage))),
        createdAt: state.currentDate || state.date || '2026'
      });
    },

    processResaleClauseOnTransfer(state, { playerId, transferFee }) {
      if (!state || !Array.isArray(state.resaleClauses) || transferFee <= 0) return 0;
      let totalSolidarityPaid = 0;
      state.resaleClauses = state.resaleClauses.filter((clause) => {
        if (String(clause.playerId) === String(playerId)) {
          const cut = Math.round(transferFee * (clause.percentage / 100));
          totalSolidarityPaid += cut;
          const userClub = state.userClubId || state.club;
          if (String(clause.beneficiaryClubId) === String(userClub)) {
            state.clubBalance = (state.clubBalance || state.balance || 0) + cut;
            state.balance = state.clubBalance;
            const msg = `Cláusula de Revenda ativada! Você recebeu R$ ${cut.toLocaleString('pt-BR')} (${clause.percentage}% de ${clause.playerName}).`;
            if (typeof window.showToast === 'function') {
              window.showToast(msg);
            } else if (typeof window.toast === 'function') {
              window.toast(msg);
            }
          }
          return false;
        }
        return true;
      });
      return totalSolidarityPaid;
    },

    processMonthlyBankInstallments(state, yearMonthKey) {
      if (!state || !state.bankLoans) return { totalPaid: 0, finishedLoans: [] };
      if (state.bankLoans.lastProcessedPeriod === yearMonthKey) {
        return { totalPaid: 0, finishedLoans: [], skipped: true };
      }
      state.bankLoans.lastProcessedPeriod = yearMonthKey;

      let totalPaid = 0;
      const finishedLoans = [];
      const loansList = Array.isArray(state.bankLoans) ? state.bankLoans : (state.bankLoans.activeLoans || []);

      const remaining = loansList.filter((loan) => {
        if (loan.remainingInstallments <= 0) return false;
        const instVal = loan.installmentValue || 0;
        state.clubBalance = (state.clubBalance || state.balance || 0) - instVal;
        state.balance = state.clubBalance;
        loan.remainingInstallments -= 1;
        loan.remainingBalance = Math.max(0, (loan.remainingBalance || loan.remainingDebt || 0) - instVal);
        if (loan.remainingDebt !== undefined) loan.remainingDebt = loan.remainingBalance;
        totalPaid += instVal;

        if (loan.remainingInstallments === 0) {
          finishedLoans.push(loan);
          return false;
        }
        return true;
      });

      if (Array.isArray(state.bankLoans)) {
        state.bankLoans = remaining;
      } else {
        state.bankLoans.activeLoans = remaining;
      }

      return { totalPaid, finishedLoans };
    }
  };

  window.AFM_Guards = AFM_Guards;
})(window);
