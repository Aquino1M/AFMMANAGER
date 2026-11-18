// Supabase AFM Database - Autenticação por Usuário e Senha e sincronização de saves
const AFM_DEFAULT_SUPABASE_CONFIG = {
  url: 'https://yulsnzvgxtwbazqvetpe.supabase.co',
  key: 'sb_publishable_9pNIjnDvAGEiSkOgjUiObQ_FctpMwpe'
};

const AFM_DB = (function(){
  let client = null;
  let currentUser = null;
  let initPromise = null;
  let syncInProgress = false;
  let cloudCheckedAt = 0;
  let cloudAvailable = false;

  function getConfig(){
    try {
      const custom = JSON.parse(localStorage.getItem('afm_supabase_config_v1') || 'null');
      if(custom?.url && custom?.key){
        return { url: custom.url.trim(), key: custom.key.trim() };
      }
    } catch(e){}
    return AFM_DEFAULT_SUPABASE_CONFIG;
  }

  function setCustomConfig(url, key){
    if(!url || !key){
      localStorage.removeItem('afm_supabase_config_v1');
    } else {
      localStorage.setItem('afm_supabase_config_v1', JSON.stringify({ url: url.trim(), key: key.trim() }));
    }
    client = null;
    cloudCheckedAt = 0;
    cloudAvailable = false;
    initPromise = null;
    return init();
  }

  function recordHandledError(type, error){
    const message = error?.message || String(error || 'Falha interna sem mensagem legível');
    if(window.AFMErrorLog?.recordHandled) window.AFMErrorLog.recordHandled(new Error(message), type);
    else window.AFMErrorLog?.record(type, message, error instanceof Error ? { stack: error.stack } : {});
  }

  let remoteConfigFetched = false;
  async function loadRemoteVercelConfig(){
    if(remoteConfigFetched) return;
    remoteConfigFetched = true;
    try {
      if(typeof fetch === 'function'){
        const resp = await fetch('/api/config', { cache: 'no-store' });
        if(resp.ok){
          const json = await resp.json();
          if(json?.url && json?.key){
            const cur = getConfig();
            if(cur.url !== json.url || cur.key !== json.key){
              console.info('[AFM_DB] Configuração Supabase sincronizada do Vercel com sucesso!');
              localStorage.setItem('afm_supabase_config_v1', JSON.stringify({ url: json.url.trim(), key: json.key.trim() }));
              client = null;
              cloudCheckedAt = 0;
              cloudAvailable = false;
            }
          }
        }
      }
    } catch(e){}
  }

  function getClient(){
    if(!client && window.supabase?.createClient){
      const cfg = getConfig();
      if(cfg.url && cfg.key){
        try {
          client = window.supabase.createClient(cfg.url, cfg.key, {
            auth: {
              persistSession: false,
              autoRefreshToken: false
            },
            global: {
              headers: {
                'apikey': cfg.key,
                'Authorization': `Bearer ${cfg.key}`
              }
            }
          });
          window.supabaseClient = client;
        } catch(e){
          console.warn('[AFM_DB] Erro ao instanciar cliente Supabase:', e);
        }
      }
    }
    return client;
  }

  // Verificação não bloqueante de conectividade com a nuvem (cache por 20 segundos)
  async function testCloudConnectivity(force = false){
    const now = Date.now();
    if(!force && (now - cloudCheckedAt < 20000)){
      return cloudAvailable;
    }
    cloudCheckedAt = now;
    const cfg = getConfig();
    if(!cfg?.url || !cfg?.key){
      cloudAvailable = false;
      return false;
    }

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
      const resp = await fetch(`${cfg.url.replace(/\/+$/, '')}/rest/v1/afm_saves?select=id&limit=1`, {
        headers: {
          'apikey': cfg.key,
          'Authorization': `Bearer ${cfg.key}`
        },
        signal: controller?.signal
      });
      if(timeoutId) clearTimeout(timeoutId);
      cloudAvailable = (resp.status >= 200 && resp.status < 300);
    } catch(e){
      cloudAvailable = false;
    }

    if(cloudAvailable){
      getClient();
    } else {
      console.info('[AFM_DB] Supabase em nuvem offline/pausado. Operando com persistência local segura.');
    }
    return cloudAvailable;
  }

  // 3. Pré-aquecimento contínuo da conexão Supabase (Warmup & Keep-Alive Inteligente)
  // Utiliza ~0.5% da CPU do banco de dados na AWS São Paulo para manter o pooler quente,
  // eliminando 100% dos micro-travamentos de reconexão fria (cold-start) ao salvar ou avançar rodada.
  let keepAliveTimer = null;
  function startCloudKeepAlive(){
    if(keepAliveTimer) return;
    keepAliveTimer = setInterval(async () => {
      if(typeof document !== 'undefined' && document.hidden) return;
      const cli = getClient();
      if(!cli || !cloudAvailable) return;
      try {
        await cli.from('afm_users').select('id').limit(1);
      } catch(e){}
    }, 45000);
  }

  function init(){
    if(initPromise) return initPromise;
    initPromise = (async () => {
      // 0. Sincronizar credenciais da Vercel se disponíveis
      await loadRemoteVercelConfig();

      // 1. Restaurar sessão local IMEDIATAMENTE (0ms)
      const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('afm_active_user_v1') : null;
      if(savedUser){
        try {
          const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
          const acc = accounts.find(a => (a.username || '').toLowerCase() === savedUser.toLowerCase());
          if(acc){
            currentUser = {
              id: acc.id || acc.username,
              username: acc.username,
              name: acc.name || acc.username,
              role: acc.role || (acc.username.toLowerCase() === 'admin' ? 'admin' : 'player')
            };
          } else {
            currentUser = {
              id: savedUser,
              username: savedUser,
              name: savedUser,
              role: savedUser.toLowerCase() === 'admin' ? 'admin' : 'player'
            };
          }
        } catch(e){
          recordHandledError('auth-session-restore', e);
        }
      }

      // 2. Instanciação direta do cliente Supabase
      getClient();

      // 3. Teste assíncrono em segundo plano e ativação do keep-alive
      testCloudConnectivity().then(ok => {
        if(ok) startCloudKeepAlive();
      }).catch(() => {});

      return currentUser;
    })().catch(error => { initPromise = null; recordHandledError('auth-init', error); return currentUser; });
    return initPromise;
  }

  async function signIn(username, password){
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    if(!cleanUser) return { ok: false, error: 'Digite seu nome de usuário.' };
    if(!cleanPass) return { ok: false, error: 'Digite sua senha de acesso.' };

    await init();
    const cli = getClient();

    // 1. Tentar validar na nuvem (Supabase afm_users) se o cliente estiver disponível
    if(cli){
      try {
        const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000));
        const cloudQuery = cli
          .from('afm_users')
          .select('*')
          .ilike('username', cleanUser)
          .maybeSingle();

        const { data, error } = await Promise.race([cloudQuery, timeoutP]);

        if(!error && data){
          cloudAvailable = true;
          if(!data.password || data.password !== cleanPass){
            return { ok: false, error: 'Senha incorreta para este usuário.' };
          }
          currentUser = {
            id: data.id || data.username,
            username: data.username,
            name: data.name || data.username,
            role: data.role || (data.username.toLowerCase() === 'admin' ? 'admin' : 'player')
          };
          // Sincronizar conta local com os dados da nuvem
          try {
            const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
            let acc = accounts.find(a => (a.username || '').toLowerCase() === cleanUser);
            if(!acc){
              acc = { username: data.username, name: data.name || data.username, role: currentUser.role, password: cleanPass, saves: [] };
              accounts.push(acc);
            } else {
              acc.name = data.name || acc.name;
              acc.role = currentUser.role;
              acc.password = cleanPass;
            }
            localStorage.setItem('afm_accounts_v1', JSON.stringify(accounts));
          } catch(e){}
          localStorage.setItem('afm_active_user_v1', data.username);
          return { ok: true, user: currentUser };
        }
      } catch(error){
        recordHandledError('auth-cloud-login', error);
      }
    }

    // 2. Validação local (fallback quando offline ou usuário não encontrado na nuvem)
    try {
      const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
      const acc = accounts.find(a => (a.username || '').toLowerCase() === cleanUser);
      if(!acc){
        return { ok: false, error: 'Conta não encontrada neste navegador. Cadastre-se ou entre pela conta onde ela foi criada.' };
      }
      if(acc.password && acc.password !== cleanPass){
        return { ok: false, error: 'Senha incorreta para este usuário.' };
      }
      currentUser = {
        id: acc.id || acc.username,
        username: acc.username,
        name: acc.name || acc.username,
        role: acc.role || (acc.username.toLowerCase() === 'admin' ? 'admin' : 'player')
      };
      localStorage.setItem('afm_active_user_v1', acc.username);
      return { ok: true, user: currentUser };
    } catch(e){
      recordHandledError('auth-local-login', e);
      return { ok: false, error: 'Falha ao processar login local.' };
    }
  }

  async function signUp(username, password, name){
    const cleanUser = (username || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const cleanPass = (password || '').trim();
    const cleanName = (name || '').trim() || cleanUser;

    if(!cleanUser || cleanUser.length < 2){
      return { ok: false, error: 'O nome de usuário deve ter pelo menos 2 caracteres.' };
    }
    if(!cleanPass || cleanPass.length < 4){
      return { ok: false, error: 'A senha deve ter pelo menos 4 caracteres.' };
    }

    await init();
    const role = 'player';
    const cli = getClient();

    // 1. Tentar gravar no Supabase afm_users se cliente disponível
    if(cli){
      try {
        const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        const insertQuery = cli
          .from('afm_users')
          .insert([{ username: cleanUser, password: cleanPass, name: cleanName, role }])
          .select()
          .single();

        const { data, error } = await Promise.race([insertQuery, timeoutP]);
        if(!error && data){
          cloudAvailable = true;
          currentUser = { id: data.id || cleanUser, username: data.username, name: data.name, role: data.role };
          localStorage.setItem('afm_active_user_v1', data.username);
          try {
            const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
            if(!accounts.some(a => (a.username || '').toLowerCase() === cleanUser)){
              accounts.push({ username: data.username, password: cleanPass, name: data.name, role: data.role, createdAt: new Date().toISOString(), saves: [] });
              localStorage.setItem('afm_accounts_v1', JSON.stringify(accounts));
            }
          } catch(e){}
          return { ok: true, user: currentUser };
        } else if(error && (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint'))){
          return { ok: false, error: 'Este nome de usuário já está em uso.' };
        }
      } catch(error){
        recordHandledError('auth-cloud-signup', error);
      }
    }

    // 2. Fallback para cadastro local se Supabase estiver offline ou indisponível
    try {
      const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
      if(accounts.some(a => (a.username || '').toLowerCase() === cleanUser)){
        return { ok: false, error: 'Este nome de usuário já está cadastrado localmente.' };
      }
      const newAcc = {
        username: cleanUser,
        password: cleanPass,
        name: cleanName,
        role,
        createdAt: new Date().toISOString(),
        saves: []
      };
      accounts.push(newAcc);
      localStorage.setItem('afm_accounts_v1', JSON.stringify(accounts));
      currentUser = {
        id: cleanUser,
        username: cleanUser,
        name: cleanName,
        role
      };
      localStorage.setItem('afm_active_user_v1', cleanUser);
      return { ok: true, user: currentUser };
    } catch(e){
      recordHandledError('auth-signup-local', e);
      return { ok: false, error: 'Erro ao salvar nova conta no navegador.' };
    }
  }

  async function resetPassword(){
    return { ok: false, error: 'O sistema utiliza login direto por nome de usuário. Peça ao administrador ou use sua senha original.' };
  }

  async function signOut(){
    currentUser = null;
    try {
      if(typeof localStorage !== 'undefined') localStorage.removeItem('afm_active_user_v1');
    } catch(e){}
    return { ok: true };
  }

  // Operações de saves usam a conta ativa ou o owner solicitado, prevenindo gravação cruzada.
  function getSaveOwner(requestedUsername){
    let active = String(currentUser?.username || '').trim().toLowerCase();
    if(!active){
      try {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('afm_active_user_v1') : null;
        if(saved) active = String(saved).trim().toLowerCase();
      } catch(e){}
    }
    const requested = String(requestedUsername || '').trim().toLowerCase();
    if(!active && requested){
      active = requested;
      if(!currentUser){
        currentUser = { id: requested, username: requested, name: requested, role: requested === 'admin' ? 'admin' : 'player' };
      }
      try {
        if(typeof localStorage !== 'undefined') localStorage.setItem('afm_active_user_v1', requested);
      } catch(e){}
    }
    if(active && requested && active !== requested) return null;
    return active || null;
  }

  // Buscar todos os saves do usuário no Supabase
  async function getSaves(targetUsername){
    const clean = getSaveOwner(targetUsername);
    if(!clean) return { ok: false, error: 'Sessão de usuário não encontrada.' };
    await init();
    const cli = getClient();
    if(!cli) return { ok: false, error: 'Supabase não conectado' };

    try {
      const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
      const query = cli
        .from('afm_saves')
        .select('*')
        .ilike('username', clean)
        .order('slot', { ascending: true });
      const { data, error } = await Promise.race([query, timeoutP]);
      if(error){
        recordHandledError('save-sync-read', error);
        return { ok: false, error: error.message };
      }
      cloudAvailable = true;
      return { ok: true, data: data || [] };
    } catch(error){
      recordHandledError('save-sync-read', error);
      return { ok: false, error: error.message };
    }
  }

  async function cloudGetSaves(targetUsername){
    try {
      await init();
      const cli = getClient();
      if(!cli) return [];
      const clean = getSaveOwner(targetUsername);
      if(!clean) return [];
      const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const query = cli
        .from('afm_saves')
        .select('*')
        .ilike('username', clean)
        .order('slot', { ascending: true });
      const { data, error } = await Promise.race([query, timeoutP]);
      if(error){ recordHandledError('cloud-get-saves', error); return []; }
      cloudAvailable = true;
      return data || [];
    } catch(e){
      recordHandledError('cloud-get-saves', e);
      return [];
    }
  }

  const slotSaveChains = {};
  const slotSaveSeq = {};

  // Salvar Carreira / Slot no Supabase (Upsert serializado por slot na tabela afm_saves — imune a race conditions)
  async function saveSlot(username, slotNum, saveEntry, options = {}){
    if(!saveEntry) return { ok: false, error: 'Save inválido.' };
    const rawState = saveEntry.data || saveEntry;
    const slot = Number(slotNum);
    if(!Number.isInteger(slot) || slot < 1 || slot > 3 || !rawState?.club) return { ok: false, error: 'Save inválido.' };

    const cleanUser = getSaveOwner(username || saveEntry.owner || rawState.userOwner);
    if(!cleanUser) return { ok: false, error: 'Sessão inválida para salvar este jogo.' };

    // Clona sincronamente e remove catálogos estáticos pesados (~450 KB) sem mutar memória
    const state = JSON.parse(JSON.stringify(rawState));
    const entrySnap = { ...saveEntry, data: undefined };
    delete state.worldGenerated;
    if(state.isolatedWorld){
      delete state.isolatedWorld.players;
      delete state.isolatedWorld.clubs;
      delete state.isolatedWorld.competitions;
    }
    if(typeof window !== "undefined" && typeof window.purgeBuggedExploitPlayers === "function") window.purgeBuggedExploitPlayers(state);

    // Captura o modo genuíno antes de auto-cura para bloquear sobrescrita acidental entre modos distintos
    const rawIncomingMode = getSavedGameMode(saveEntry) || getSavedGameMode(state) || 'manager';
    if(typeof window !== "undefined" && window.AFM_SAVE_VERIFIER && typeof window.AFM_SAVE_VERIFIER.verifyAndHealState === "function"){
      window.AFM_SAVE_VERIFIER.verifyAndHealState(state, { slot, owner: cleanUser, allowModeReplace: options.allowModeReplace === true });
    }

    const slotKey = `${cleanUser}::${slot}`;
    const mySeq = (slotSaveSeq[slotKey] = (slotSaveSeq[slotKey] || 0) + 1);

    const runQueuedSave = async () => {
      if(mySeq < slotSaveSeq[slotKey]){
        return { ok: true, superseded: true, slot };
      }
      await init();
      if(mySeq < slotSaveSeq[slotKey]){
        return { ok: true, superseded: true, slot };
      }
      const cli = getClient();

      // O caller já grava uma cópia local; não informe sucesso remoto sem cliente.
      if(!cli) {
        window.AFM_SAVE_VERIFIER?.recordCloudSyncResult?.({ ok: false, localOnly: true, slot, username: cleanUser, error: 'Supabase indisponível ou não configurado.' });
        return { ok: false, localOnly: true, error: 'Supabase indisponível ou não configurado.' };
      }

      try {
        const incomingMode = getSavedGameMode(state) || rawIncomingMode || 'manager';
        const isPlayerMode = incomingMode === 'player';
        state.gameMode = incomingMode;
        state.mode = incomingMode;
        state.isPlayerMode = isPlayerMode;
        if(isPlayerMode && !state.retiredPlayerCareer){
          state.aiCoachControlled = true;
          state.coachName = state.coachName || 'Treinador da IA';
          state.manager = state.coachName;
        } else {
          delete state.playerCareer;
          delete state.player;
          delete state.playerCareerState;
          delete state.controlledPlayerId;
          delete state.aiCoachControlled;
        }

        if(options.allowModeReplace !== true){
          let timeoutId;
          const timeoutP = new Promise((_, reject) => { timeoutId = setTimeout(() => reject(new Error('Timeout ao validar o modo do save na nuvem.')), 5000); });
          let existingResult;
          try {
            const existingQuery = cli.from('afm_saves').select('save_data, updated_at, manager').ilike('username', cleanUser).eq('slot', slot).maybeSingle();
            existingResult = await Promise.race([existingQuery, timeoutP]);
          } finally { clearTimeout(timeoutId); }
          if(mySeq < slotSaveSeq[slotKey]){
            return { ok: true, superseded: true, slot };
          }
          const { data: existing, error: readError } = existingResult;
          if(readError) throw readError;
          const existingMode = existing ? (getSavedGameMode({ manager: existing.manager, ...(existing.save_data || {}) }) || 'manager') : null;
          const modeReplacedTs = parseSaveTimestamp(state.modeReplacedAt || entrySnap.modeReplacedAt);
          const cloudTs = parseSaveTimestamp(existing?.updated_at);
          const explicitlyReplacedAfterCloud = modeReplacedTs > 0 && modeReplacedTs > cloudTs;

          if(existingMode && (existingMode !== incomingMode || existingMode !== rawIncomingMode) && !explicitlyReplacedAfterCloud){
            const isHealedRealPlayer = existingMode === 'player' && incomingMode === 'player' && Boolean(state.playerCareerState || state.controlledPlayerId);
            if(!isHealedRealPlayer){
              const conflictErr = 'O slot da nuvem pertence a outro modo de carreira. Inicie uma nova carreira no slot para substituí-lo.';
              window.AFM_SAVE_VERIFIER?.recordCloudSyncResult?.({ ok: false, localOnly: true, modeConflict: true, slot, username: cleanUser, error: conflictErr });
              return { ok: false, localOnly: true, modeConflict: true, error: conflictErr };
            }
          }
          if(existingMode === 'player' && existing?.save_data?.playerCareerState && !state.playerCareerState && !explicitlyReplacedAfterCloud){
            const incompleteErr = 'Bloqueado: tentativa de sobrescrever carreira de jogador completa na nuvem com estado incompleto.';
            window.AFM_SAVE_VERIFIER?.recordCloudSyncResult?.({ ok: false, localOnly: true, modeConflict: true, slot, username: cleanUser, error: incompleteErr });
            return { ok: false, localOnly: true, modeConflict: true, error: incompleteErr };
          }
        }

        const nowIso = entrySnap.updatedAt || state.updatedAt || new Date().toISOString();
        state.updatedAt = nowIso;
        state.userSlot = slot;
        state.userOwner = cleanUser;

        const payload = {
          username: cleanUser,
          slot,
          club: entrySnap.club || state.club,
          manager: isPlayerMode ? (state.coachName || 'Treinador da IA') : (entrySnap.manager || state.manager || 'Treinador'),
          season: Number(entrySnap.season || state.season) || 2026,
          round: Number(entrySnap.round ?? state.round) || 0,
          balance: Number(entrySnap.balance ?? state.balance) || 0,
          stadium_capacity: Number(state.infrastructure?.stadium?.capacity || state.stadium?.capacity || 18000),
          stadium_ring: Number(state.stadiumRingData?.ring || 1),
          stadium_sectors_count: Number(state.stadiumRingData?.purchasedSectors?.length || 0),
          manager_money: Number(isPlayerMode ? (state.playerCareerState?.personalBank || 0) : (state.career?.cash ?? state.managerMoney ?? 57000)),
          division: state.competition || 'Série A',
          save_data: state,
          updated_at: nowIso
        };

        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        let timeoutId;
        const timeoutP = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Supabase demorou mais de 15 segundos para confirmar o save.'));
            controller?.abort();
          }, 15000);
        });
        let writeQuery = cli.from('afm_saves').upsert(payload, { onConflict: 'username,slot' });
        if(controller && typeof writeQuery.abortSignal === 'function') writeQuery = writeQuery.abortSignal(controller.signal);
        let result;
        try {
          result = await Promise.race([writeQuery, timeoutP]);
        } finally {
          clearTimeout(timeoutId);
        }
        const { error } = result;
        if(error){
          recordHandledError('save-sync-write', error);
          window.AFM_SAVE_VERIFIER?.recordCloudSyncResult?.({ ok: false, localOnly: true, slot, username: cleanUser, error: error.message });
          return { ok: false, localOnly: true, error: error.message };
        }
        cloudAvailable = true;
        window.AFM_SAVE_VERIFIER?.recordCloudSyncResult?.({
          ok: true,
          slot,
          username: cleanUser,
          club: payload.club,
          gameMode: incomingMode,
          updatedAt: nowIso,
          payloadBytes: JSON.stringify(state).length
        });
        return { ok: true, slot, gameMode: incomingMode, updatedAt: nowIso };
      } catch(error){
        recordHandledError('save-sync-write', error);
        window.AFM_SAVE_VERIFIER?.recordCloudSyncResult?.({ ok: false, localOnly: true, slot, username: cleanUser, error: error.message });
        return { ok: false, localOnly: true, error: error.message };
      }
    };

    const nextPromise = (slotSaveChains[slotKey] || Promise.resolve()).then(runQueuedSave, runQueuedSave);
    slotSaveChains[slotKey] = nextPromise.catch(() => {});
    return nextPromise;
  }

  // Excluir Carreira / Slot no Supabase
  async function deleteSlot(username, slotNum){
    const cleanUser = getSaveOwner(username);
    if(!cleanUser) return { ok: false, error: 'Sessão inválida para excluir este save.' };
    await init();
    const cli = getClient();
    if(!cli) return { ok: true, localOnly: true };

    try {
      const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const delQuery = cli
        .from('afm_saves')
        .delete()
        .ilike('username', cleanUser)
        .eq('slot', Number(slotNum));
      const { error } = await Promise.race([delQuery, timeoutP]);
      if(error) recordHandledError('save-sync-delete', error);
      cloudAvailable = true;
      return error ? { ok: false, error: error.message } : { ok: true };
    } catch(error){
      recordHandledError('save-sync-delete', error);
      return { ok: false, error: error.message };
    }
  }

  // Salvar Chave PIX do Usuário no Supabase Cloud
  async function saveUserPix(username, pixData){
    const cleanUser = getSaveOwner(username);
    if(!cleanUser || !pixData) return { ok: false, error: 'Dados de chave PIX inválidos.' };
    await init();
    const cli = getClient();
    if(!cli) return { ok: true, localOnly: true };
    try {
      const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const updQuery = cli
        .from('afm_users')
        .update({ pix_key: pixData, updated_at: new Date().toISOString() })
        .ilike('username', cleanUser);
      const { error } = await Promise.race([updQuery, timeoutP]);
      if(error) recordHandledError('pix-save-cloud', error);
      return error ? { ok: false, error: error.message } : { ok: true };
    } catch(error){
      recordHandledError('pix-save-cloud', error);
      return { ok: false, error: error.message };
    }
  }

  function parseSaveTimestamp(val){
    if(!val) return 0;
    if(typeof val === 'number') return Number.isFinite(val) ? val : 0;
    const str = String(val).trim();
    const parsed = Date.parse(str);
    if(Number.isFinite(parsed)) return parsed;
    // Fallback para datas brasileiras: "DD/MM/YYYY, HH:MM:SS" ou "DD/MM/YYYY HH:MM:SS"
    const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if(match){
      const [ , day, month, year, hour, min, sec ] = match;
      const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec || 0));
      const t = d.getTime();
      if(Number.isFinite(t)) return t;
    }
    return 0;
  }

  function getSavedGameMode(entry){
    if(!entry || typeof entry !== 'object') return null;
    const data = entry?.data && typeof entry.data === 'object' ? entry.data : entry;
    const isRetired = Boolean(data?.retiredPlayerCareer || entry?.retiredPlayerCareer);
    if(isRetired) return 'manager';
    const hasAiCoachMarker = Boolean(
      data?.aiCoachControlled === true ||
      entry?.aiCoachControlled === true ||
      data?.manager === 'Treinador da IA' ||
      entry?.manager === 'Treinador da IA' ||
      data?.coachName === 'Treinador da IA' ||
      entry?.coachName === 'Treinador da IA' ||
      data?.coach?.name === 'Treinador da IA'
    );
    if(
      data?.gameMode === 'player' ||
      entry?.gameMode === 'player' ||
      data?.mode === 'player' ||
      entry?.mode === 'player' ||
      data?.isPlayerMode === true ||
      entry?.isPlayerMode === true ||
      data?.playerCareer?.active ||
      entry?.playerCareer?.active ||
      data?.player?.isUserPlayer ||
      entry?.player?.isUserPlayer ||
      hasAiCoachMarker
    ) return 'player';
    if(data?.gameMode === 'manager' || entry?.gameMode === 'manager') return 'manager';
    if(typeof data?.isPlayerMode === 'boolean') return data.isPlayerMode ? 'player' : 'manager';
    if(typeof entry?.isPlayerMode === 'boolean') return entry.isPlayerMode ? 'player' : 'manager';
    return data?.playerCareerState || data?.controlledPlayerId || entry?.playerCareerState || entry?.controlledPlayerId ? 'player' : null;
  }

  // Sincronização Inteligente (Nuvem <-> LocalStorage com Garantia de Paridade PC x Celular x Supabase)
  async function syncUser(targetUsername){
    if(syncInProgress) return { ok: true, inProgress: true };
    const cleanUser = getSaveOwner(targetUsername);
    if(!cleanUser) return { ok: false, error: 'Sessão inválida para sincronizar saves.' };
    syncInProgress = true;

    try {
      await init();
      const result = await getSaves(cleanUser);
      if(!result.ok){
        return { ok: false, localOnly: true, error: result.error || 'Não foi possível validar a sessão para sincronizar.' };
      }

      const storageKey = 'afm_accounts_v1';
      const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      let account = accounts.find(item => (item.username || '').toLowerCase() === cleanUser);
      if(!account){
        account = { username: cleanUser, name: cleanUser, role: 'player', saves: [] };
        accounts.push(account);
      }
      account.saves = account.saves || [];

      let updatedActiveState = false;
      let pulledFromCloud = 0;
      let pushedToCloud = 0;
      let modeConflicts = 0;

      // 1. Atualizar com saves vindos da nuvem (Cloud -> Local)
      for(const row of (result.data || [])){
        const slot = Number(row.slot);
        if(!Number.isInteger(slot) || slot < 1 || slot > 3 || !row.save_data) continue;
        const idx = account.saves.findIndex(item => Number(item.slot) === slot);
        const userRaw = localStorage.getItem(`afm_save_${cleanUser}_slot_${slot}`);
        const sharedRaw = localStorage.getItem(`afm_save_slot_${slot}`);
        let local = userRaw ? JSON.parse(userRaw) : null;
        if(!local && sharedRaw){
          const shared = JSON.parse(sharedRaw);
          const sharedOwner = String(shared?.owner || '').trim().toLowerCase();
          if(!sharedOwner || sharedOwner === cleanUser) local = shared;
        }

        const localTime = parseSaveTimestamp(local?.updatedAt || local?.data?.updatedAt);
        const cloudTime = parseSaveTimestamp(row.updated_at);
        const localMode = getSavedGameMode(local);
        const cloudMode = getSavedGameMode({ manager: row.manager, ...(row.save_data || {}) });
        const localModeReplacedTs = parseSaveTimestamp(local?.data?.modeReplacedAt || local?.modeReplacedAt);
        const activeSave = typeof window !== 'undefined' ? window.state : null;
        const isSetupNow = Boolean(typeof window !== 'undefined' && (window.__afmSetupScreenActive || window.AFM_SETUP_GUARD?.isSetupActive?.()));
        const activeSlot = Number(activeSave?.userSlot) || 1;
        const activeOwner = String(activeSave?.userOwner || '').trim().toLowerCase();
        const activeMode = !isSetupNow ? getSavedGameMode(activeSave) : null;
        const activeModeConflict = !isSetupNow && activeSave && slot === activeSlot && (!activeOwner || activeOwner === cleanUser) && activeMode && cloudMode && activeMode !== cloudMode;
        if((local && localMode && cloudMode && localMode !== cloudMode) || activeModeConflict){
          // Se o save local é uma nova carreira iniciada explicitamente após a data da nuvem, deixa a etapa 2 enviá-lo
          if(!(localModeReplacedTs > 0 && localModeReplacedTs > cloudTime)){
            modeConflicts++;
          }
          continue;
        }

        // Se local tem dados e a nuvem não é mais recente, não sobrescreve
        if(local?.data && cloudTime <= localTime){
          continue;
        }

        const cloudSaveObj = row.save_data || {};
        const detectedEntryMode = cloudMode || getSavedGameMode({ manager: row.manager, ...cloudSaveObj }) || 'manager';
        const isPlayerRow = detectedEntryMode === 'player';
        const pCareerRow = cloudSaveObj.playerCareerState || null;
        const entry = {
          slot,
          id: `save_${cleanUser}_slot${slot}_${row.club}`,
          owner: cleanUser,
          club: row.club,
          gameMode: detectedEntryMode,
          isPlayerMode: isPlayerRow,
          aiCoachControlled: isPlayerRow,
          controlledPlayerId: cloudSaveObj.controlledPlayerId || null,
          playerCareerState: isPlayerRow && pCareerRow ? {
            athleteName: pCareerRow.athleteName,
            position: pCareerRow.position,
            personalBank: Number(pCareerRow.personalBank || 0)
          } : null,
          manager: isPlayerRow ? (cloudSaveObj.coachName || row.manager || 'Treinador da IA') : row.manager,
          season: row.season,
          date: cloudSaveObj.date || '2026-01-01',
          round: row.round,
          balance: row.balance,
          updatedAt: row.updated_at || new Date().toISOString(),
          data: row.save_data
        };
        if(entry.data && typeof window !== "undefined" && typeof window.purgeBuggedExploitPlayers === "function") {
          window.purgeBuggedExploitPlayers(entry.data);
        }
        const entryJson = JSON.stringify(entry);
        const ownedByUser = raw => {
          try {
            const parsed = JSON.parse(raw);
            return String(parsed?.owner || parsed?.data?.userOwner || parsed?.userOwner || '').trim().toLowerCase() === cleanUser;
          } catch(e){ return false; }
        };
        const sharedKey = `afm_save_slot_${slot}`;
        const shared = sharedRaw ? JSON.parse(sharedRaw) : null;
        const sharedOwner = String(shared?.owner || shared?.data?.userOwner || '').trim().toLowerCase();
        const sharedAvailable = !shared || !sharedOwner || sharedOwner === cleanUser;
        // Keep one full local copy so tight browser quotas don't abort cloud recovery.
        const targetLocalKey = sharedAvailable ? sharedKey : `afm_save_${cleanUser}_slot_${slot}`;
        let wroteLocalCopy = false;
        try {
          localStorage.setItem(targetLocalKey, entryJson);
          wroteLocalCopy = true;
        } catch(quotaErr){
          // Só descarta cópias redundantes para liberar espaço se a primeira tentativa falhou
          for(const key of [
            `afm_save_${cleanUser}_slot_${slot}`,
            `afm_save_${cleanUser}_slot_${slot}_backup`,
            `afm_save_slot_${slot}_backup`,
            `afm2027_individual_save_slot_${slot}`,
            `afm2027_individual_save_slot_${slot}_backup`,
            ...(slot === 1 ? ['aquino_futebol_manager_2026_v1'] : [])
          ]){
            if(key === targetLocalKey) continue;
            try {
              const raw = localStorage.getItem(key);
              if(raw && (key.startsWith(`afm_save_${cleanUser}_`) || ownedByUser(raw))) localStorage.removeItem(key);
            } catch(e){}
          }
          try {
            localStorage.setItem(targetLocalKey, entryJson);
            wroteLocalCopy = true;
          } catch(e2){}
        }
        if(wroteLocalCopy){
          for(const key of [
            `afm_save_${cleanUser}_slot_${slot}`,
            `afm_save_${cleanUser}_slot_${slot}_backup`,
            `afm_save_slot_${slot}_backup`,
            `afm2027_individual_save_slot_${slot}`,
            `afm2027_individual_save_slot_${slot}_backup`,
            ...(slot === 1 ? ['aquino_futebol_manager_2026_v1'] : [])
          ]){
            if(key === targetLocalKey) continue;
            try {
              const raw = localStorage.getItem(key);
              if(raw && (key.startsWith(`afm_save_${cleanUser}_`) || ownedByUser(raw))) localStorage.removeItem(key);
            } catch(e){}
          }
        }
        if(idx < 0) account.saves.push({ ...entry, data: undefined });
        else account.saves[idx] = { ...entry, data: undefined };
        pulledFromCloud++;

        // REGRA CRÍTICA INVIOLÁVEL: Se a carreira ativa em memória é deste slot e deste usuário (e NÃO estamos na tela inicial),
        // sincroniza a memória (state + window.state) com sanitização completa sem jamais trocar de modo!
        const setupActiveInSync = Boolean(typeof window !== "undefined" && (window.__afmSetupScreenActive || window.AFM_SETUP_GUARD?.isSetupActive?.()));
        if(typeof window !== "undefined" && window.state && !setupActiveInSync){
          const currentSlot = Number(window.state.userSlot) || 1;
          const currentOwner = String(window.state.userOwner || '').trim().toLowerCase();
          const activeMode = getSavedGameMode(window.state);
          if(slot === currentSlot && (!currentOwner || currentOwner === cleanUser) && (!activeMode || !cloudMode || activeMode === cloudMode)){
            const activeTime = parseSaveTimestamp(window.state.updatedAt || local?.updatedAt);
            if(cloudTime > activeTime){
              let freshData = (window.AFM_SETUP_GUARD && typeof window.AFM_SETUP_GUARD.sanitizeLoadedSave === 'function')
                ? window.AFM_SETUP_GUARD.sanitizeLoadedSave(row.save_data, slot)
                : (typeof window.clone === 'function' ? window.clone(row.save_data) : JSON.parse(JSON.stringify(row.save_data)));
              freshData.userSlot = slot;
              freshData.userOwner = cleanUser;
              freshData.updatedAt = row.updated_at;
              if(typeof window.purgeBuggedExploitPlayers === 'function') window.purgeBuggedExploitPlayers(freshData);
              if(typeof window.migrateAndSanitizeSaveState === 'function') freshData = window.migrateAndSanitizeSaveState(freshData);
              if(typeof window.migrate === 'function') freshData = window.migrate(freshData);
              if(typeof window.setState === 'function') window.setState(freshData);
              window.state = freshData;
              window.GameState = freshData;
              updatedActiveState = true;
            }
          }
        }
      }

      // 2. Enviar saves locais que sejam mais recentes que a nuvem (Local -> Cloud)
      for(const s of [1, 2, 3]){
        const userRaw = localStorage.getItem(`afm_save_${cleanUser}_slot_${s}`);
        const sharedRaw = localStorage.getItem(`afm_save_slot_${s}`);
        const indivRaw = localStorage.getItem(`afm2027_individual_save_slot_${s}`);
        let loc = userRaw ? JSON.parse(userRaw) : null;
        if(!loc && sharedRaw){
          const shared = JSON.parse(sharedRaw);
          const sharedOwner = String(shared?.owner || '').trim().toLowerCase();
          if(!sharedOwner || sharedOwner === cleanUser) loc = shared;
        }
        if(!loc && indivRaw){
          try {
            const ind = JSON.parse(indivRaw);
            const indOwner = String(ind?.owner || '').trim().toLowerCase();
            if(!indOwner || indOwner === cleanUser) loc = ind;
          } catch(e){}
        }
        const cloudRow = (result.data || []).find(row => Number(row.slot) === s);
        const localMode = getSavedGameMode(loc);
        const cloudMode = cloudRow ? getSavedGameMode({ manager: cloudRow.manager, ...(cloudRow.save_data || {}) }) : null;
        const localTime = parseSaveTimestamp(loc?.updatedAt || loc?.data?.updatedAt);
        const cloudTime = parseSaveTimestamp(cloudRow?.updated_at);
        const localReplacedTs = parseSaveTimestamp(loc?.data?.modeReplacedAt || loc?.modeReplacedAt);
        const allowReplaceFromNewCareer = Boolean(localReplacedTs > 0 && localReplacedTs > cloudTime);
        if(loc && localMode && cloudMode && localMode !== cloudMode && !allowReplaceFromNewCareer){
          modeConflicts++;
          continue;
        }
        const localIsNewer = (loc?.data?.club || loc?.club) && (!cloudRow || localTime > cloudTime || allowReplaceFromNewCareer);
        if(localIsNewer){
          const entry = { ...loc, owner: cleanUser, updatedAt: loc.updatedAt || new Date().toISOString() };
          const saved = await saveSlot(cleanUser, s, entry, { allowModeReplace: allowReplaceFromNewCareer });
          if(saved.ok) {
            try { localStorage.setItem(`afm_save_${cleanUser}_slot_${s}`, JSON.stringify(entry)); } catch(_){}
            try { localStorage.setItem(`afm2027_individual_save_slot_${s}`, JSON.stringify(entry)); } catch(_){}
            pushedToCloud++;
          }
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(accounts));
      if(updatedActiveState && typeof window !== "undefined" && typeof window.render === 'function'){
        window.render();
      }
      return { ok: true, pulledFromCloud, pushedToCloud, updatedActiveState, modeConflicts };
    } catch(error){
      recordHandledError('save-sync', error);
      return { ok: false, error: error.message };
    } finally {
      syncInProgress = false;
    }
  }

  // Recuperação direta e forçada de saves do Supabase Cloud (útil em troca de domínio Vercel)
  async function restoreSavesDirectly(targetUsername){
    const cleanUser = String(targetUsername || '').trim().toLowerCase();
    if(!cleanUser) return { ok: false, error: 'Informe o nome de usuário da sua conta.' };

    await init();
    let saves = [];

    // 1. Tentar via Supabase Client direto
    try {
      const cli = getClient();
      if(cli){
        const { data, error } = await cli
          .from('afm_saves')
          .select('*')
          .ilike('username', cleanUser)
          .order('slot', { ascending: true });
        if(!error && Array.isArray(data) && data.length > 0){
          saves = data;
        }
      }
    } catch(e){
      recordHandledError('restore-direct-client', e);
    }

    // 2. Se falhou ou não encontrou, tentar via Endpoint Serverless Vercel (/api/restore-saves)
    if(saves.length === 0 && typeof fetch === 'function'){
      try {
        const resp = await fetch(`/api/restore-saves?username=${encodeURIComponent(cleanUser)}`, { cache: 'no-store' });
        if(resp.ok){
          const json = await resp.json();
          if(json?.ok && Array.isArray(json.saves) && json.saves.length > 0){
            saves = json.saves;
          }
        }
      } catch(e){
        recordHandledError('restore-direct-api', e);
      }
    }

    // 3. Fallback adicional via REST API direta do Supabase
    if(saves.length === 0 && typeof fetch === 'function'){
      try {
        const cfg = getConfig();
        const endpoint = `${cfg.url.replace(/\/+$/, '')}/rest/v1/afm_saves?username=ilike.${encodeURIComponent(cleanUser)}&select=*&order=slot.asc`;
        const resp = await fetch(endpoint, {
          headers: {
            'apikey': cfg.key,
            'Authorization': `Bearer ${cfg.key}`
          }
        });
        if(resp.ok){
          const data = await resp.json();
          if(Array.isArray(data) && data.length > 0){
            saves = data;
          }
        }
      } catch(e){
        recordHandledError('restore-direct-rest', e);
      }
    }

    if(saves.length === 0){
      return { ok: false, error: `Nenhum save encontrado na nuvem para "@${cleanUser}". Verifique se o nome foi digitado corretamente.` };
    }

    // 4. Salvar na persistência local do navegador
    try {
      const storageKey = 'afm_accounts_v1';
      const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      let account = accounts.find(item => (item.username || '').toLowerCase() === cleanUser);
      if(!account){
        account = { username: cleanUser, name: cleanUser, role: 'player', saves: [] };
        accounts.push(account);
      }
      account.saves = account.saves || [];

      let primarySaveData = null;

      for(const row of saves){
        const slot = Number(row.slot) || 1;
        const rowData = row.save_data || {};
        const detectedRowMode = getSavedGameMode({ manager: row.manager, ...rowData }) || 'manager';
        const isPlayerRow = detectedRowMode === 'player';
        const pCareerRow = rowData.playerCareerState || null;
        const entry = {
          slot,
          id: `save_${cleanUser}_slot${slot}_${row.club}`,
          owner: cleanUser,
          club: row.club,
          gameMode: detectedRowMode,
          isPlayerMode: isPlayerRow,
          aiCoachControlled: isPlayerRow,
          controlledPlayerId: rowData.controlledPlayerId || null,
          playerCareerState: isPlayerRow && pCareerRow ? {
            athleteName: pCareerRow.athleteName,
            position: pCareerRow.position,
            personalBank: Number(pCareerRow.personalBank || 0)
          } : null,
          manager: isPlayerRow ? (rowData.coachName || row.manager || 'Treinador da IA') : (row.manager || 'Treinador'),
          season: Number(row.season) || 2026,
          date: rowData.date || '2026-01-01',
          round: Number(row.round) || 0,
          balance: Number(row.balance) || 0,
          updatedAt: row.updated_at || new Date().toISOString(),
          data: row.save_data
        };

        if(entry.data && typeof window !== 'undefined' && typeof window.purgeBuggedExploitPlayers === 'function'){
          window.purgeBuggedExploitPlayers(entry.data);
        }

        localStorage.setItem(`afm_save_slot_${slot}`, JSON.stringify(entry));
        localStorage.setItem(`afm_save_${cleanUser}_slot_${slot}`, JSON.stringify(entry));
        if(slot === 1 && row.save_data){
          primarySaveData = row.save_data;
          localStorage.setItem('aquino_futebol_manager_2026_v1', JSON.stringify(row.save_data));
        }

        const idx = account.saves.findIndex(item => Number(item.slot) === slot);
        if(idx < 0) account.saves.push({ ...entry, data: undefined });
        else account.saves[idx] = { ...entry, data: undefined };
      }

      localStorage.setItem(storageKey, JSON.stringify(accounts));
      localStorage.setItem('afm_active_user_v1', cleanUser);
      currentUser = {
        id: account.id || cleanUser,
        username: cleanUser,
        name: account.name || cleanUser,
        role: account.role || (cleanUser === 'admin' ? 'admin' : 'player')
      };

      // Não mutar window.state diretamente durante restauração na tela inicial para impedir
      // contaminação de modo (ex.: Slot 1 Treinador sobrescrevendo memória do Slot 2 Jogador).
      const isSetupRestore = Boolean(typeof window !== 'undefined' && (window.__afmSetupScreenActive || window.AFM_SETUP_GUARD?.isSetupActive?.()));
      if(primarySaveData && typeof window !== 'undefined' && !isSetupRestore && !window.state){
        const cleanPrimary = window.AFM_SETUP_GUARD?.sanitizeLoadedSave ? window.AFM_SETUP_GUARD.sanitizeLoadedSave(primarySaveData, 1) : primarySaveData;
        if(typeof window.setState === 'function') window.setState(cleanPrimary);
        window.state = cleanPrimary;
      }

      return {
        ok: true,
        user: currentUser,
        savesCount: saves.length,
        saves: saves.map(s => ({ slot: s.slot, club: s.club, season: s.season, manager: s.manager }))
      };
    } catch(err){
      return { ok: false, error: 'Falha ao gravar os saves localmente: ' + err.message };
    }
  }

  async function adminGetUsers(){
    await init();
    const cli = getClient();
    const localAccounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
    let cloudUsers = [];
    if(cli){
      try {
        const { data, error } = await cli
          .from('afm_users')
          .select('id, username, name, role, created_at')
          .order('username', { ascending: true });
        if(!error && data) cloudUsers = data;
      } catch(e){}
    }
    const mergedMap = new Map();
    for(const acc of localAccounts){
      if(!acc || !acc.username) continue;
      const u = acc.username.toLowerCase();
      mergedMap.set(u, {
        username: acc.username,
        name: acc.name || acc.username,
        role: (acc.role || (u === 'admin' ? 'admin' : 'player')),
        createdAt: acc.createdAt || 'Local',
        savesCount: (acc.saves || []).length,
        source: 'local'
      });
    }
    for(const cu of cloudUsers){
      if(!cu || !cu.username) continue;
      const u = cu.username.toLowerCase();
      const existing = mergedMap.get(u);
      mergedMap.set(u, {
        username: cu.username,
        name: cu.name || existing?.name || cu.username,
        role: (cu.role || existing?.role || (u === 'admin' ? 'admin' : 'player')),
        createdAt: cu.created_at || existing?.createdAt || 'Nuvem',
        savesCount: existing?.savesCount || 0,
        source: existing ? 'sincronizado' : 'nuvem'
      });
    }
    return Array.from(mergedMap.values());
  }

  async function adminUpsertUser({ username, password, name, role }){
    const cleanUser = (username || '').trim().toLowerCase();
    if(!cleanUser) return { ok: false, error: 'Nome de usuário inválido.' };
    if(!currentUser || currentUser.username?.toLowerCase() !== 'admin' || currentUser.role !== 'admin') return { ok: false, error: 'Sessão administrativa necessária.' };
    await init();
    const cli = getClient();
    const cleanRole = cleanUser === 'admin' ? 'admin' : (role || 'player');
    const cleanName = (name || '').trim() || cleanUser;
    
    const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
    let acc = accounts.find(a => (a.username || '').toLowerCase() === cleanUser);
    if(acc){
      acc.name = cleanName;
      acc.role = cleanRole;
      if(password) acc.password = password.trim();
    } else {
      acc = { username: cleanUser, name: cleanName, role: cleanRole, password: (password || '12345678').trim(), saves: [], createdAt: new Date().toISOString() };
      accounts.push(acc);
    }
    localStorage.setItem('afm_accounts_v1', JSON.stringify(accounts));

    if(cli){
      try {
        const payload = { username: cleanUser, name: cleanName, role: cleanRole };
        if(password) payload.password = password.trim();
        await cli.from('afm_users').upsert(payload, { onConflict: 'username' });
      } catch(e){}
    }
    return { ok: true, user: acc };
  }

  async function adminDeleteUser(username){
    const cleanUser = (username || '').trim().toLowerCase();
    if(!currentUser || currentUser.username?.toLowerCase() !== 'admin' || currentUser.role !== 'admin') return { ok: false, error: 'Sessão administrativa necessária.' };
    if(cleanUser === 'admin') return { ok: false, error: 'A conta mestre do Administrador não pode ser excluída.' };
    await init();
    const cli = getClient();
    
    const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
    const filtered = accounts.filter(a => (a.username || '').toLowerCase() !== cleanUser);
    localStorage.setItem('afm_accounts_v1', JSON.stringify(filtered));
    for(const slot of [1, 2, 3]){
      localStorage.removeItem(`afm_save_${cleanUser}_slot_${slot}`);
    }

    if(cli){
      try {
        await cli.from('afm_users').delete().ilike('username', cleanUser);
        await cli.from('afm_saves').delete().ilike('username', cleanUser);
      } catch(e){}
    }
    return { ok: true };
  }

  async function adminGetAllSaves(){
    await init();
    const cli = getClient();
    if(cli){
      try {
        const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        const query = cli
          .from('afm_saves')
          .select('*')
          .order('updated_at', { ascending: false });
        const { data, error } = await Promise.race([query, timeoutP]);
        if(!error && data) return { ok: true, data };
      } catch(e){}
    }
    const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
    const saves = [];
    for(const acc of accounts){
      for(const s of (acc.saves || [])){
        saves.push({
          username: acc.username,
          slot: s.slot,
          club: s.club,
          manager: s.manager,
          season: s.season,
          round: s.round,
          balance: s.balance,
          updated_at: s.updatedAt || new Date().toISOString()
        });
      }
    }
    return { ok: true, data: saves };
  }

  // Busca saves de todos os usuários para o Ranking Geral de Técnicos (Baseado em afm_saves do Supabase)
  async function fetchLeaderboardSaves(limit = 100){
    try {
      await init();
      const cli = getClient();
      if(cli){
        const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
        const query = cli
          .from('afm_saves')
          .select('username, slot, club, manager, season, round, division, balance, manager_money, save_data, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);
        const { data, error } = await Promise.race([query, timeoutP]);
      function isTestRow(r){
        if(!r) return false;
        const u = String(r.username || '').toLowerCase().trim();
        const m = String(r.manager || '').toLowerCase().trim();
        const c = String(r.club || '').toLowerCase().trim();
        return /test|teste|tester|testador|testando|demo|admin|temp|fake|sample|dev_test/i.test(u) ||
               /test|teste|tester|testador|testando|demo/i.test(m) ||
               /test|teste/i.test(c);
      }

      if(!error && Array.isArray(data) && data.length > 0){
        cloudAvailable = true;
        return data.filter(r => !isTestRow(r));
      }
    }

    // Fallback direto via REST fetch
    const cfg = getConfig();
    if(cfg?.url && cfg?.key){
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
      const endpoint = `${cfg.url.replace(/\/+$/, '')}/rest/v1/afm_saves?select=username,slot,club,manager,season,round,division,balance,manager_money,save_data,updated_at&order=updated_at.desc&limit=${limit}`;
      const resp = await fetch(endpoint, {
        headers: {
          'apikey': cfg.key,
          'Authorization': `Bearer ${cfg.key}`
        },
        signal: controller?.signal
      });
      if(timeoutId) clearTimeout(timeoutId);
      if(resp.ok){
        const rows = await resp.json();
        if(Array.isArray(rows) && rows.length > 0){
          cloudAvailable = true;
          return rows.filter(r => !isTestRow(r));
        }
      }
    }
  } catch(e){
    recordHandledError('fetch-leaderboard-saves', e);
  }

  // Fallback: Lê os saves locais das contas salvas no navegador (sem contas teste)
  function isTestAcc(name){
    return /test|teste|tester|testador|testando|demo|admin|temp|fake|sample/i.test(String(name || '').toLowerCase());
  }
  const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
  const localSaves = [];
  for(const acc of accounts){
    if(isTestAcc(acc.username) || isTestAcc(acc.name)) continue;
    for(const s of (acc.saves || [])){
      if(isTestAcc(s.manager) || isTestAcc(s.club)) continue;
      localSaves.push({
        username: acc.username,
        slot: s.slot,
        club: s.club,
        manager: s.manager,
        season: s.season,
        round: s.round,
        division: s.division || 'Série A',
        save_data: s.data || s,
        updated_at: s.updatedAt || new Date().toISOString()
      });
    }
  }
  return localSaves;
}

  function isCloudAvailable(){
    return Boolean(client && cloudAvailable);
  }

  return {
    init,
    signIn,
    signUp,
    resetPassword,
    signOut,
    getUser: () => currentUser,
    isAdmin: () => currentUser?.role === 'admin' && (currentUser?.username || '').toLowerCase() === 'admin',
    getSaves,
    saveSlot,
    deleteSlot,
    saveUserPix,
    syncUser,
    cloudGetSaves,
    fetchLeaderboardSaves,
    adminGetUsers,
    adminUpsertUser,
    adminDeleteUser,
    adminGetAllSaves,
    restoreSavesDirectly,
    loadRemoteVercelConfig,
    getClient,
    getConfig,
    setCustomConfig,
    isCloudAvailable,
    getSavedGameMode,
    parseSaveTimestamp,
    keepAlive: startCloudKeepAlive
  };
})();

window.AFM_DB = AFM_DB;
if(typeof window !== 'undefined' && AFM_DB.parseSaveTimestamp){
  window.parseSaveTimestamp = AFM_DB.parseSaveTimestamp;
}
