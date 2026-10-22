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

  function getClient(){
    if(!client && window.supabase?.createClient){
      const cfg = getConfig();
      if(cfg.url && cfg.key){
        try {
          client = window.supabase.createClient(cfg.url, cfg.key, {
            auth: {
              persistSession: false,
              autoRefreshToken: false
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
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2500) : null;
      const resp = await fetch(`${cfg.url}/rest/v1/`, {
        headers: { 'apikey': cfg.key },
        signal: controller?.signal
      });
      if(timeoutId) clearTimeout(timeoutId);
      cloudAvailable = (resp.status >= 200 && resp.status < 500);
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
      // 1. Restaurar sessão local IMEDIATAMENTE (0ms)
      const savedUser = localStorage.getItem('afm_active_user_v1');
      if(savedUser){
        try {
          const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
          const acc = accounts.find(a => (a.username || '').toLowerCase() === savedUser.toLowerCase());
          if(acc){
            currentUser = {
              id: acc.id || acc.username,
              username: acc.username,
              name: acc.name || acc.username,
              role: acc.role || 'player'
            };
          } else {
            currentUser = {
              id: savedUser,
              username: savedUser,
              name: savedUser,
              role: 'player'
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
        const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
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
            role: data.role || 'player'
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
          return { ok: true, user: currentUser };
        }
      } catch(err){
        console.warn('[AFM_DB] Consulta em nuvem indisponível, usando fallback local imediato.');
      }
    }

    // 2. Fallback local: verificar contas no localStorage
    try {
      const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
      const local = accounts.find(a => (a.username || '').toLowerCase() === cleanUser);
      if(local){
        if(local.password && local.password !== cleanPass){
          return { ok: false, error: 'Senha incorreta para este usuário.' };
        }
        currentUser = {
          id: local.id || local.username,
          username: local.username,
          name: local.name || local.username,
          role: local.role || 'player'
        };
        // Tentar enviar conta ao Supabase em background se o cliente estiver ativo
        if(cli){
          cli.from('afm_users').upsert({
            username: local.username,
            password: cleanPass,
            name: local.name || local.username,
            role: currentUser.role
          }, { onConflict: 'username' }).then(() => { cloudAvailable = true; }).catch(() => {});
        }
        return { ok: true, user: currentUser };
      }
    } catch(e){
      recordHandledError('auth-local-fallback', e);
    }

    return { ok: false, error: 'Usuário não encontrado. Se ainda não possui conta, cadastre-se grátis.' };
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

    // 1. Tentar cadastrar no Supabase se o cliente estiver ativo
    if(cli){
      try {
        const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
        const checkQuery = cli
          .from('afm_users')
          .select('id, username')
          .ilike('username', cleanUser)
          .maybeSingle();

        const { data: existing } = await Promise.race([checkQuery, timeoutP]);

        if(existing){
          return { ok: false, error: 'Este nome de usuário já está em uso. Escolha outro ou entre com sua senha.' };
        }

        const insertQuery = cli
          .from('afm_users')
          .insert([{
            username: cleanUser,
            password: cleanPass,
            name: cleanName,
            role
          }])
          .select()
          .single();

        const { data, error } = await Promise.race([insertQuery, timeoutP]);

        if(!error && data){
          cloudAvailable = true;
          currentUser = {
            id: data.id || data.username,
            username: data.username,
            name: data.name || cleanName,
            role: data.role || role
          };
        }
      } catch(err){
        console.warn('[AFM_DB] Cadastro em nuvem offline, persistindo localmente.');
      }
    }

    // 2. Garantir persistência no LocalStorage
    try {
      const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
      let acc = accounts.find(a => (a.username || '').toLowerCase() === cleanUser);
      if(!acc){
        acc = {
          username: cleanUser,
          password: cleanPass,
          name: cleanName,
          role,
          createdAt: new Date().toISOString(),
          saves: []
        };
        accounts.push(acc);
        localStorage.setItem('afm_accounts_v1', JSON.stringify(accounts));
      }
      if(!currentUser){
        currentUser = {
          id: cleanUser,
          username: cleanUser,
          name: cleanName,
          role
        };
      }
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
    localStorage.removeItem('afm_active_user_v1');
    return { ok: true };
  }

  // Operações de saves usam apenas a conta ativa, nunca um username arbitrário.
  // A autenticação legada por afm_users não equivale a uma sessão Supabase Auth;
  // a propriedade remota ainda precisa ser garantida pelas políticas RLS existentes.
  function getSaveOwner(requestedUsername){
    const active = String(currentUser?.username || '').trim().toLowerCase();
    const requested = String(requestedUsername || '').trim().toLowerCase();
    if(!active || (requested && requested !== active)) return null;
    return active;
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

  // Salvar Carreira / Slot no Supabase (Upsert direto na tabela afm_saves)
  async function saveSlot(username, slotNum, saveEntry){
    if(!saveEntry) return { ok: false, error: 'Save inválido.' };
    const state = saveEntry.data || saveEntry;
    const slot = Number(slotNum);
    if(!Number.isInteger(slot) || slot < 1 || slot > 3 || !state.club) return { ok: false, error: 'Save inválido.' };

    if(typeof window !== "undefined" && typeof window.purgeBuggedExploitPlayers === "function") window.purgeBuggedExploitPlayers(state);
    const cleanUser = getSaveOwner(username || state.userOwner);
    if(!cleanUser) return { ok: false, error: 'Sessão inválida para salvar este jogo.' };

    await init();
    const cli = getClient();

    // O caller já grava uma cópia local; não informe sucesso remoto sem cliente.
    if(!cli) return { ok: false, localOnly: true, error: 'Supabase indisponível ou não configurado.' };

    try {
      const payload = {
        username: cleanUser,
        slot,
        club: saveEntry.club || state.club,
        manager: saveEntry.manager || state.manager || 'Treinador',
        season: Number(saveEntry.season || state.season) || 2026,
        round: Number(saveEntry.round || state.round) || 0,
        balance: Number(saveEntry.balance ?? state.balance) || 0,
        stadium_capacity: Number(state.infrastructure?.stadium?.capacity || state.stadium?.capacity || 18000),
        stadium_ring: Number(state.stadiumRingData?.ring || 1),
        stadium_sectors_count: Number(state.stadiumRingData?.purchasedSectors?.length || 0),
        manager_money: Number(state.managerMoney || 57000),
        division: state.competition || 'Série A',
        save_data: state,
        updated_at: new Date().toISOString()
      };

      const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
      const writeQuery = cli
        .from('afm_saves')
        .upsert(payload, { onConflict: 'username,slot' })
        .select()
        .single();
      const { data, error } = await Promise.race([writeQuery, timeoutP]);
      if(error){
        recordHandledError('save-sync-write', error);
        return { ok: false, localOnly: true, error: error.message };
      }
      if(!data) {
        const message = 'Supabase não confirmou a gravação do save.';
        recordHandledError('save-sync-write', message);
        return { ok: false, localOnly: true, error: message };
      }
      cloudAvailable = true;
      return { ok: true, data };
    } catch(error){
      recordHandledError('save-sync-write', error);
      return { ok: false, localOnly: true, error: error.message };
    }
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

  // Sincronização Inteligente (Nuvem <-> LocalStorage)
  async function syncUser(targetUsername){
    if(syncInProgress) return { ok: true };
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

      // 1. Atualizar com saves vindos da nuvem
      for(const row of (result.data || [])){
        const slot = Number(row.slot);
        const idx = account.saves.findIndex(item => Number(item.slot) === slot);
        const userRaw = localStorage.getItem(`afm_save_${cleanUser}_slot_${slot}`);
        const sharedRaw = localStorage.getItem(`afm_save_slot_${slot}`);
        let local = userRaw ? JSON.parse(userRaw) : null;
        if(!local && sharedRaw){
          const shared = JSON.parse(sharedRaw);
          const sharedOwner = String(shared?.owner || '').trim().toLowerCase();
          if(!sharedOwner || sharedOwner === cleanUser) local = shared;
        }
        const localTime = Date.parse(local?.updatedAt || '');
        const cloudTime = Date.parse(row.updated_at || '');

        if(local?.data && (!Number.isFinite(cloudTime) || (Number.isFinite(localTime) && localTime >= cloudTime))){
          continue;
        }

        const entry = {
          slot,
          id: `save_${cleanUser}_slot${slot}_${row.club}`,
          owner: cleanUser,
          club: row.club,
          manager: row.manager,
          season: row.season,
          round: row.round,
          balance: row.balance,
          updatedAt: row.updated_at,
          data: row.save_data
        };
        if(entry.data && typeof window !== "undefined" && typeof window.purgeBuggedExploitPlayers === "function") window.purgeBuggedExploitPlayers(entry.data);
        const existingSharedRaw = localStorage.getItem(`afm_save_slot_${slot}`);
        const existingShared = existingSharedRaw ? JSON.parse(existingSharedRaw) : null;
        const existingOwner = String(existingShared?.owner || '').trim().toLowerCase();
        if(!existingShared || !existingOwner || existingOwner === cleanUser){
          localStorage.setItem(`afm_save_slot_${slot}`, JSON.stringify(entry));
        }
        localStorage.setItem(`afm_save_${cleanUser}_slot_${slot}`, JSON.stringify(entry));
        if(slot === 1) localStorage.setItem('aquino_futebol_manager_2026_v1', JSON.stringify(row.save_data));
        if(idx < 0) account.saves.push({ ...entry, data: undefined });
        else account.saves[idx] = { ...entry, data: undefined };
      }

      // 2. Enviar somente saves individuais ausentes ou comprovadamente mais novos.
      // Slots compartilhados sem owner são ambíguos e não são enviados automaticamente.
      for(const s of [1, 2, 3]){
        const userRaw = localStorage.getItem(`afm_save_${cleanUser}_slot_${s}`);
        const sharedRaw = localStorage.getItem(`afm_save_slot_${s}`);
        let loc = userRaw ? JSON.parse(userRaw) : null;
        if(!loc && sharedRaw){
          const shared = JSON.parse(sharedRaw);
          const sharedOwner = String(shared?.owner || '').trim().toLowerCase();
          if(sharedOwner === cleanUser) loc = shared;
        }
        const cloudRow = (result.data || []).find(row => Number(row.slot) === s);
        const localTime = Date.parse(loc?.updatedAt || '');
        const cloudTime = Date.parse(cloudRow?.updated_at || '');
        const localIsNewer = !cloudRow || (Number.isFinite(localTime) && (!Number.isFinite(cloudTime) || localTime > cloudTime));
        if(loc?.data?.club && localIsNewer){
          const entry = { ...loc, owner: cleanUser };
          const saved = await saveSlot(cleanUser, s, entry);
          if(saved.ok) localStorage.setItem(`afm_save_${cleanUser}_slot_${s}`, JSON.stringify(entry));
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(accounts));
      return { ok: true };
    } catch(error){
      recordHandledError('save-sync', error);
      return { ok: false, error: error.message };
    } finally {
      syncInProgress = false;
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
    adminGetUsers,
    adminUpsertUser,
    adminDeleteUser,
    adminGetAllSaves,
    getClient,
    getConfig,
    setCustomConfig,
    isCloudAvailable,
    keepAlive: startCloudKeepAlive
  };
})();

window.AFM_DB = AFM_DB;
