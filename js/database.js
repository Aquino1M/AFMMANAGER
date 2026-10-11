// Supabase Auth e sincronização local-first dos saves do AFM.
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
      if(!window.supabase?.createClient) throw new Error('Supabase Auth indisponível. Verifique sua conexão e tente novamente.');
      client = window.supabase.createClient(AFM_SUPABASE_CONFIG.url, AFM_SUPABASE_CONFIG.key);
      const { data, error } = await client.auth.getSession();
      if(error) throw error;
      currentUser = data.session?.user || null;
      client.auth.onAuthStateChange((_event, session) => { currentUser = session?.user || null; });
      return currentUser;
    })().catch(error => { initPromise = null; throw error; });
    return initPromise;
  }

  async function authCall(method, credentials){
    try {
      await init();
      const { data, error } = await client.auth[method](credentials);
      if(error){
        recordHandledError(`auth-${method}`, error);
        return { ok: false, error: error.message };
      }
      currentUser = data.session?.user || null;
      return { ok: true, user: data.session?.user || data.user || null, needsConfirmation: method === 'signUp' && !data.session };
    } catch(error){
      recordHandledError('auth-service', error);
      return { ok: false, error: error.message || 'Não foi possível conectar ao serviço de autenticação.' };
    }
  }

  function signIn(email, password){
    return authCall('signInWithPassword', { email: email.trim().toLowerCase(), password });
  }

  function signUp(email, password, name){
    return authCall('signUp', {
      email: email.trim().toLowerCase(),
      password,
      options: { data: { display_name: name.trim() || email.split('@')[0] } }
    });
  }

  async function resetPassword(email){
    try {
      await init();
      const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: location.href.split('#')[0] });
      if(error) recordHandledError('auth-password-reset', error);
      return error ? { ok: false, error: error.message } : { ok: true };
    } catch(error){ recordHandledError('auth-password-reset', error); return { ok: false, error: error.message }; }
  }

  async function signOut(){
    try {
      await init();
      const { error } = await client.auth.signOut();
      if(error){ recordHandledError('auth-signout', error); return { ok: false, error: error.message }; }
      currentUser = null;
      return { ok: true };
    } catch(error){ recordHandledError('auth-signout', error); return { ok: false, error: error.message }; }
  }

  async function getSaves(){
    if(!currentUser) return { ok: false, error: 'Entre na sua conta para sincronizar os saves.' };
    const { data, error } = await client.from('afm_saves').select('*').eq('user_id', currentUser.id).order('slot', { ascending: true });
    if(error) recordHandledError('save-sync-read', error);
    return error ? { ok: false, error: error.message } : { ok: true, data: data || [] };
  }

  async function saveSlot(_owner, slotNum, saveEntry){
    if(!currentUser || !saveEntry) return { ok: false, error: 'Entre na sua conta para sincronizar os saves.' };
    const state = saveEntry.data || saveEntry;
    const slot = Number(slotNum);
    if(!Number.isInteger(slot) || slot < 1 || slot > 3 || !state.club) return { ok: false, error: 'Save inválido.' };
    const payload = {
      user_id: currentUser.id,
      username: currentUser.id,
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
    const { data, error } = await client.from('afm_saves').upsert(payload, { onConflict: 'user_id,slot' }).select().single();
    if(error) recordHandledError('save-sync-write', error);
    return error ? { ok: false, error: error.message } : { ok: true, data };
  }

  async function deleteSlot(_owner, slotNum){
    if(!currentUser) return { ok: false, error: 'Entre na sua conta para sincronizar os saves.' };
    const { error } = await client.from('afm_saves').delete().eq('user_id', currentUser.id).eq('slot', Number(slotNum));
    if(error) recordHandledError('save-sync-delete', error);
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async function syncUser(){
    if(syncInProgress || !currentUser) return;
    syncInProgress = true;
    try {
      const result = await getSaves();
      if(!result.ok) return result;
      const storageKey = 'afm_accounts_v1';
      const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const account = accounts.find(item => item.username === currentUser.id);
      if(!account) return { ok: false, error: 'Conta local não inicializada.' };
      account.saves = account.saves || [];
      for(const row of result.data){
        const slot = Number(row.slot);
        const idx = account.saves.findIndex(item => Number(item.slot) === slot);
        const local = JSON.parse(localStorage.getItem(`afm_save_slot_${slot}`) || 'null');
        const localTime = Date.parse(local?.updatedAt || '');
        const cloudTime = Date.parse(row.updated_at || '');
        if(local?.data && (!Number.isFinite(cloudTime) || (Number.isFinite(localTime) && localTime >= cloudTime))) continue;
        const entry = { slot, id: `save_${currentUser.id}_slot${slot}_${row.club}`, owner: currentUser.id, club: row.club, manager: row.manager, season: row.season, round: row.round, balance: row.balance, updatedAt: row.updated_at, data: row.save_data };
        localStorage.setItem(`afm_save_slot_${slot}`, JSON.stringify(entry));
        if(slot === 1) localStorage.setItem('aquino_futebol_manager_2026_v1', JSON.stringify(row.save_data));
        if(idx < 0) account.saves.push({ ...entry, data: undefined });
        else account.saves[idx] = { ...entry, data: undefined };
      }
      localStorage.setItem(storageKey, JSON.stringify(accounts));
      return { ok: true };
    } catch(error){ recordHandledError('save-sync', error); return { ok: false, error: error.message }; }
    finally { syncInProgress = false; }
  }

  return {
    init, signIn, signUp, resetPassword, signOut,
    getUser: () => currentUser,
    isAdmin: () => currentUser?.app_metadata?.role === 'admin',
    getSaves, saveSlot, deleteSlot, syncUser
  };
})();

window.AFM_DB = AFM_DB;
