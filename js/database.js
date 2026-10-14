// Supabase AFM Database - Autenticação por Usuário e Senha e sincronização de saves
const AFM_SUPABASE_CONFIG = {
  url: 'https://yulsnzvgxtwbazqvetpe.supabase.co',
  key: 'sb_publishable_9pNIjnDvAGEiSkOgjUiObQ_FctpMwpe'
};

const AFM_DB = (function(){
  let client = null;
  let currentUser = null;
  let initPromise = null;
  let syncInProgress = false;

  function recordHandledError(type, error){
    const message = error?.message || String(error || 'Falha interna sem mensagem legível');
    if(window.AFMErrorLog?.recordHandled) window.AFMErrorLog.recordHandled(new Error(message), type);
    else window.AFMErrorLog?.record(type, message, error instanceof Error ? { stack: error.stack } : {});
  }

  function init(){
    if(initPromise) return initPromise;
    initPromise = (async () => {
      if(window.supabase?.createClient){
        try {
          client = window.supabase.createClient(AFM_SUPABASE_CONFIG.url, AFM_SUPABASE_CONFIG.key);
          window.supabaseClient = client;
        } catch(err){
          console.warn('[AFM_DB] Erro ao instanciar cliente Supabase:', err);
        }
      }
      // Restaurar sessão a partir do armazenamento local
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

    // 1. Tentar validar na nuvem (Supabase afm_users)
    if(client){
      try {
        const { data, error } = await client
          .from('afm_users')
          .select('*')
          .ilike('username', cleanUser)
          .maybeSingle();

        if(!error && data){
          if(data.password && data.password !== cleanPass){
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
        console.warn('[AFM_DB] Erro ao consultar afm_users na nuvem:', err);
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
        if(client){
          client.from('afm_users').upsert({
            username: local.username,
            password: cleanPass,
            name: local.name || local.username,
            role: currentUser.role
          }, { onConflict: 'username' }).then(() => {}).catch(() => {});
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

    // Signup never grants administrative privileges by username.
    const role = 'player';

    // 1. Tentar cadastrar no Supabase
    if(client){
      try {
        const { data: existing } = await client
          .from('afm_users')
          .select('id, username')
          .ilike('username', cleanUser)
          .maybeSingle();

        if(existing){
          return { ok: false, error: 'Este nome de usuário já está em uso. Escolha outro ou entre com sua senha.' };
        }

        const { data, error } = await client
          .from('afm_users')
          .insert([{
            username: cleanUser,
            password: cleanPass,
            name: cleanName,
            role
          }])
          .select()
          .single();

        if(!error && data){
          currentUser = {
            id: data.id || data.username,
            username: data.username,
            name: data.name || cleanName,
            role: data.role || role
          };
        }
      } catch(err){
        console.warn('[AFM_DB] Erro ao cadastrar no Supabase:', err);
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
          saves: [],
          createdAt: new Date().toISOString()
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

  async function getSaves(targetUsername){
    const clean = (currentUser?.username || '').trim().toLowerCase();
    if(!clean || (targetUsername && String(targetUsername).trim().toLowerCase() !== clean)) return { ok: false, error: 'Sessão de usuário não encontrada.' };
    if(!client) return { ok: false, error: 'Supabase não conectado' };
    try {
      await init();
      const authSession = await client.auth?.getSession?.();
      if(!authSession?.data?.session?.user?.id) return { ok: false, error: 'Autenticação do provedor não está ativa.' };
      const { data, error } = await client
        .from('afm_saves')
        .select('*')
        .ilike('username', clean)
        .order('slot', { ascending: true });
      if(error) recordHandledError('save-sync-read', error);
      return error ? { ok: false, error: error.message } : { ok: true, data: data || [] };
    } catch(error){
      recordHandledError('save-sync-read', error);
      return { ok: false, error: error.message };
    }
  }

  async function cloudGetSaves(targetUsername){
    try {
      await init();
      if(!client) return [];
      const clean = (targetUsername || '').trim().toLowerCase();
      const { data, error } = await client
        .from('afm_saves')
        .select('*')
        .ilike('username', clean)
        .order('slot', { ascending: true });
      if(error){ recordHandledError('cloud-get-saves', error); return []; }
      return data || [];
    } catch(e){
      recordHandledError('cloud-get-saves', e);
      return [];
    }
  }

  async function saveSlot(username, slotNum, saveEntry){
    if(!saveEntry) return { ok: false, error: 'Save inválido.' };
    const state = saveEntry.data || saveEntry;
    const slot = Number(slotNum);
    if(!Number.isInteger(slot) || slot < 1 || slot > 3 || !state.club) return { ok: false, error: 'Save inválido.' };

    const cleanUser = (currentUser?.username || '').trim().toLowerCase();
    if(!cleanUser || (username && String(username).trim().toLowerCase() !== cleanUser)) return { ok: false, error: 'Sessão inválida para salvar este jogo.' };

    if(!client) return { ok: true, localOnly: true };

    try {
      await init();
      const authSession = await client.auth?.getSession?.();
      if(!authSession?.data?.session?.user?.id) return { ok: false, error: 'Autenticação do provedor não está ativa.' };
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
      const { data, error } = await client
        .from('afm_saves')
        .upsert(payload, { onConflict: 'username,slot' })
        .select()
        .single();
      if(error) recordHandledError('save-sync-write', error);
      return error ? { ok: false, error: error.message } : { ok: true, data };
    } catch(error){
      recordHandledError('save-sync-write', error);
      return { ok: false, error: error.message };
    }
  }

  async function deleteSlot(username, slotNum){
    const cleanUser = (currentUser?.username || '').trim().toLowerCase();
    if(!cleanUser || (username && String(username).trim().toLowerCase() !== cleanUser)) return { ok: false, error: 'Sessão inválida para excluir este save.' };
    if(!client) return { ok: true, localOnly: true };
    try {
      await init();
      const authSession = await client.auth?.getSession?.();
      if(!authSession?.data?.session?.user?.id) return { ok: false, error: 'Autenticação do provedor não está ativa.' };
      const { error } = await client
        .from('afm_saves')
        .delete()
        .ilike('username', cleanUser)
        .eq('slot', Number(slotNum));
      if(error) recordHandledError('save-sync-delete', error);
      return error ? { ok: false, error: error.message } : { ok: true };
    } catch(error){
      recordHandledError('save-sync-delete', error);
      return { ok: false, error: error.message };
    }
  }

  async function syncUser(targetUsername){
    if(syncInProgress) return { ok: true };
    const cleanUser = (currentUser?.username || '').trim().toLowerCase();
    if(!cleanUser || (targetUsername && String(targetUsername).trim().toLowerCase() !== cleanUser)) return { ok: false, error: 'Sessão inválida para sincronizar saves.' };
    syncInProgress = true;
    try {
      const result = await getSaves(cleanUser);
      if(!result.ok) return result;
      const storageKey = 'afm_accounts_v1';
      const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      let account = accounts.find(item => (item.username || '').toLowerCase() === cleanUser);
      if(!account){
        account = { username: cleanUser, name: cleanUser, role: 'player', saves: [] };
        accounts.push(account);
      }
      account.saves = account.saves || [];
      for(const row of result.data){
        const slot = Number(row.slot);
        const idx = account.saves.findIndex(item => Number(item.slot) === slot);
        const local = JSON.parse(localStorage.getItem(`afm_save_slot_${slot}`) || 'null');
        const localTime = Date.parse(local?.updatedAt || '');
        const cloudTime = Date.parse(row.updated_at || '');
        if(local?.data && (!Number.isFinite(cloudTime) || (Number.isFinite(localTime) && localTime >= cloudTime))) continue;
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
        localStorage.setItem(`afm_save_slot_${slot}`, JSON.stringify(entry));
        localStorage.setItem(`afm_save_${cleanUser}_slot_${slot}`, JSON.stringify(entry));
        if(slot === 1) localStorage.setItem('aquino_futebol_manager_2026_v1', JSON.stringify(row.save_data));
        if(idx < 0) account.saves.push({ ...entry, data: undefined });
        else account.saves[idx] = { ...entry, data: undefined };
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
    const localAccounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
    let cloudUsers = [];
    if(client){
      try {
        const { data, error } = await client
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

    if(client){
      try {
        const payload = { username: cleanUser, name: cleanName, role: cleanRole };
        if(password) payload.password = password.trim();
        await client.from('afm_users').upsert(payload, { onConflict: 'username' });
      } catch(e){}
    }
    return { ok: true, user: acc };
  }

  async function adminDeleteUser(username){
    const cleanUser = (username || '').trim().toLowerCase();
    if(!currentUser || currentUser.username?.toLowerCase() !== 'admin' || currentUser.role !== 'admin') return { ok: false, error: 'Sessão administrativa necessária.' };
    if(cleanUser === 'admin') return { ok: false, error: 'A conta mestre do Administrador não pode ser excluída.' };
    await init();
    
    const accounts = JSON.parse(localStorage.getItem('afm_accounts_v1') || '[]');
    const filtered = accounts.filter(a => (a.username || '').toLowerCase() !== cleanUser);
    localStorage.setItem('afm_accounts_v1', JSON.stringify(filtered));
    for(const slot of [1, 2, 3]){
      localStorage.removeItem(`afm_save_${cleanUser}_slot_${slot}`);
    }

    if(client){
      try {
        await client.from('afm_users').delete().ilike('username', cleanUser);
        await client.from('afm_saves').delete().ilike('username', cleanUser);
      } catch(e){}
    }
    return { ok: true };
  }

  async function adminGetAllSaves(){
    await init();
    if(client){
      try {
        const { data, error } = await client
          .from('afm_saves')
          .select('*')
          .order('updated_at', { ascending: false });
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
    return !!client;
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
    syncUser,
    cloudGetSaves,
    adminGetUsers,
    adminUpsertUser,
    adminDeleteUser,
    adminGetAllSaves,
    getClient: () => client,
    isCloudAvailable
  };
})();

window.AFM_DB = AFM_DB;
