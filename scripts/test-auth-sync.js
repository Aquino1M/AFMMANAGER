const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const calls = [];
let listener;
let responseSession = null;
let saveRows = [];
let authFailure = null;
let queryFailure = null;
const handledErrors = [];
const user = { id: 'user-123', email: 'coach@example.com', user_metadata: { display_name: 'Coach' }, app_metadata: {} };
const auth = {
  async getSession(){ return { data: { session: responseSession }, error: null }; },
  onAuthStateChange(fn){ listener = fn; },
  async signInWithPassword(credentials){
    calls.push(['signInWithPassword', credentials]);
    if(authFailure) return { data: {}, error: authFailure };
    responseSession = { access_token: 'test-access-token', user };
    listener('SIGNED_IN', responseSession);
    return { data: { user, session: responseSession }, error: null };
  },
  async signUp(credentials){ calls.push(['signUp', credentials]); return { data: { user: { id: 'pending' }, session: null }, error: null }; },
  async resetPasswordForEmail(email, options){ calls.push(['resetPasswordForEmail', email, options]); return { error: null }; },
  async signOut(){ responseSession = null; listener('SIGNED_OUT', null); return { error: null }; }
};
const queryCalls = [];
const supabase = {
  createClient(){
    return {
      auth,
      from(table){
        let filteredUsername = null;
        let filteredSlot = null;
        return {
          select(columns){ queryCalls.push(['select', table, columns]); return this; },
          eq(column, value){ queryCalls.push(['eq', table, column, value]); if(column === 'slot') filteredSlot = Number(value); return this; },
          ilike(column, value){ queryCalls.push(['ilike', table, column, value]); if(column === 'username') filteredUsername = String(value).toLowerCase(); return this; },
          maybeSingle: async () => {
            let data = null;
            if(!queryFailure && table === 'afm_users' && filteredUsername === 'coach@example.com') data = { id: user.id, username: 'coach@example.com', name: 'Coach', role: 'player', password: 'a long password' };
            else if(!queryFailure && table === 'afm_users' && ['aquino','admin'].includes(filteredUsername)) data = { id: filteredUsername, username: filteredUsername, name: filteredUsername === 'admin' ? 'Administrador AFM' : 'Aquino', role: filteredUsername === 'admin' ? 'admin' : 'player', password: filteredUsername === 'admin' ? 'secure-admin-test' : 'secure-coach-test' };
            else if(!queryFailure && table === 'afm_saves') data = saveRows.find(row => Number(row.slot) === filteredSlot) || null;
            return { data, error: queryFailure };
          },
          order(){ return Promise.resolve({ data: saveRows, error: queryFailure }); },
          limit(){ return Promise.resolve({ data: [], error: queryFailure }); },
          insert(payload){ queryCalls.push(['insert', table, payload]); return { select(){ return { single: async () => ({ data: { ...payload[0], id: 'new-user' }, error: queryFailure }) }; } }; },
          update(payload){ queryCalls.push(['update', table, payload]); return { ilike(column, value){ queryCalls.push(['ilike', table, column, value]); return Promise.resolve({ error: queryFailure }); } }; },
          upsert(payload, options){
            queryCalls.push(['upsert', table, payload, options]);
            return Promise.resolve({ data: null, error: queryFailure });
          },
          delete(){
            return { eq(column, value){ queryCalls.push(['delete', table, column, value]); return { eq: async (nextColumn, nextValue) => { queryCalls.push(['delete', table, nextColumn, nextValue]); return { error: queryFailure }; } }; } };
          }
        };
      }
    };
  }
};
const storage = new Map();
const localStorage = {
  getItem(key){ return storage.get(key) ?? null; },
  setItem(key, value){ storage.set(key, String(value)); },
  removeItem(key){ storage.delete(key); }
};
const context = { window: { supabase, AFMErrorLog: { recordHandled(error, source){ handledErrors.push({ message: error.message, source }); } } }, localStorage, location: { href: 'https://example.com/' }, console, Date, JSON, Number, Math, Promise, setTimeout, clearTimeout };
vm.runInNewContext(fs.readFileSync('js/database.js', 'utf8'), context);

(async () => {
  const db = context.window.AFM_DB;
  assert.equal(await db.init(), null, 'fresh install has no session');
  authFailure = { message: 'Invalid login credentials', status: 400 };
  const rejectedLogin = await db.signIn('coach@example.com', 'wrong');
  assert.equal(rejectedLogin.ok, false, 'senha incorreta nÃ£o autentica');
  authFailure = null;
  const login = await db.signIn(' Coach@Example.com ', 'a long password');
  assert.equal(login.ok, true);
  assert(queryCalls.some(call => call[0] === 'ilike' && call[2] === 'username' && call[3] === 'coach@example.com'), 'username normalized before account lookup');
  assert.equal(db.getUser().id, user.id);
  assert.equal(db.isAdmin(), false, 'treinador nÃ£o recebe painel administrativo por padrÃ£o');
  user.user_metadata.role = 'admin';
  assert.equal(db.isAdmin(), false, 'user_metadata nÃ£o concede privilÃ©gios administrativos');
  user.app_metadata.role = 'admin';
  assert.equal(db.isAdmin(), false, 'a identidade do treinador nÃ£o concede privilÃ©gios administrativos');
  delete user.app_metadata.role;

  const localAccounts = [
    { username: 'admin', name: 'Administrador AFM', role: 'admin', password: 'secure-admin-test', saves: [] },
    { username: 'aquino', name: 'Aquino', role: 'player', password: 'secure-coach-test', saves: [] }
  ];
  storage.set('afm_accounts_v1', JSON.stringify(localAccounts));
  await db.signOut();
  const trainerLogin = await db.signIn('aquino', 'secure-coach-test');
  assert.equal(trainerLogin.ok, true, JSON.stringify(trainerLogin));
  assert.equal(trainerLogin.user.role, 'player', '@aquino deve continuar treinador.');
  assert.equal(db.isAdmin(), false, '@aquino nÃ£o deve receber o painel administrativo.');
  await db.signOut();
  const adminLogin = await db.signIn('admin', 'secure-admin-test');
  assert.equal(adminLogin.ok, true);
  assert.equal(adminLogin.user.role, 'admin', '@admin deve manter a role administrativa salva.');
  assert.equal(db.isAdmin(), true, 'somente a conta administrativa explÃ­cita pode usar o painel.');
  await db.signOut();

  const authLogin = await db.signIn('coach@example.com', 'a long password');
  assert.equal(authLogin.ok, true, 'coach cloud account signs in before save sync');
  storage.set('afm_save_slot_1', JSON.stringify({ slot: 1, owner: 'another-user', updatedAt: 'data invÃ¡lida', data: { club: 'Save local corrompido' } }));
  saveRows = [{ slot: 1, club: 'Corinthians', manager: 'Coach', season: 2026, round: 1, balance: 0, updated_at: '2026-01-02T00:00:00.000Z', save_data: { club: 'Corinthians', season: 2026 } }];
  const recovered = await db.syncUser('coach@example.com');
  assert.equal(recovered.ok, true, 'active cloud account reconciles saves');
  assert.equal(JSON.parse(storage.get('afm_save_coach@example.com_slot_1')).data.club, 'Corinthians', 'a nuvem deve hidratar o slot isolado deste usuário');

  storage.set('afm_save_slot_1', JSON.stringify({ slot: 1, updatedAt: '2026-01-03T00:00:00.000Z', data: { club: 'Save local mais novo' } }));
  saveRows = [{ ...saveRows[0], updated_at: '2026-01-02T00:00:00.000Z', save_data: { club: 'Save antigo na nuvem' } }];
  storage.set('afm_save_coach@example.com_slot_1', JSON.stringify({ slot: 1, updatedAt: '2026-01-03T00:00:00.000Z', owner: 'coach@example.com', data: { club: 'Save local mais novo' } }));
  saveRows = [{ ...saveRows[0], updated_at: '2026-01-02T00:00:00.000Z', save_data: { club: 'Save antigo na nuvem' } }];
  const staleSync = await db.syncUser('coach@example.com');
  assert.equal(staleSync.ok, true, 'active account may reconcile its saves');
  assert.equal(JSON.parse(storage.get('afm_save_coach@example.com_slot_1')).data.club, 'Save local mais novo', 'newer per-user local save is preserved');
  const saveCallStart = queryCalls.length;
  const saved = await db.saveSlot('coach@example.com', 2, { club: 'Corinthians', data: { club: 'Corinthians', season: 2026 } });
  assert.equal(saved.ok, true, 'a conta cloud ativa pode gravar no seu slot');
  const saveCalls = queryCalls.slice(saveCallStart);
  const upsert = saveCalls.find(call => call[0] === 'upsert' && call[1] === 'afm_saves');
  assert(upsert, 'save da conta ativa deve ser enviado à nuvem');
  assert(saveCalls.some(call => call[0] === 'select' && call[1] === 'afm_saves'), 'modo persistido do slot deve ser verificado antes de substituir a nuvem');
  assert.equal(upsert[2].username, 'coach@example.com', 'cloud save is bound to the account username');
  assert.equal(upsert[3]?.onConflict, 'username,slot', 'save upsert uses unique username and slot');
  saveRows.push({ slot: 2, save_data: { gameMode: 'manager', isPlayerMode: false, club: 'Manaus' } });
  const conflictStart = queryCalls.length;
  const modeConflict = await db.saveSlot('coach@example.com', 2, { club: 'Real Brasília', data: { gameMode: 'player', isPlayerMode: true, club: 'Real Brasília' } });
  assert.equal(modeConflict.modeConflict, true, 'save jogador não pode substituir slot de treinador na nuvem');
  assert(!queryCalls.slice(conflictStart).some(call => call[0] === 'upsert'), 'conflito de modo deve bloquear escrita remota');
  assert.equal((await db.saveSlot('coach@example.com', 2, { club: 'Real Brasília', data: { gameMode: 'player', isPlayerMode: true, club: 'Real Brasília' } }, { allowModeReplace: true })).ok, true, 'nova carreira escolhida explicitamente pode substituir o slot');
  queryFailure = { message: 'RLS denied save write', code: '42501' };
  assert.equal((await db.saveSlot('coach@example.com', 2, { club: 'Corinthians', data: { club: 'Corinthians' } })).ok, false, 'falhas do Supabase continuam sendo reportadas');
  queryFailure = null;
  const noAuthRead = await db.getSaves();
  assert.equal(noAuthRead.ok, true, 'save reads usam a conta ativa');
  queryFailure = { message: 'RLS denied save read', code: '42501' };
  assert.equal((await db.getSaves()).ok, false);
  queryFailure = null;
  await db.deleteSlot('forged-owner', 2);
  assert(!queryCalls.some(call => call[0] === 'delete' && call[1] === 'afm_saves'), 'forged owner cannot trigger a cloud delete');
  const unauthorizedSync = await db.syncUser('another-user');
  assert.equal(unauthorizedSync.ok, false, 'a caller cannot sync a different account');


  await db.signOut();
  assert.equal(db.getUser(), null);
  assert.equal((await db.saveSlot('', 1, { club: 'x', data: { club: 'x' } })).ok, false, 'anonymous writes rejected');
  const signup = await db.signUp('new@example.com', 'password-123', 'Novo treinador');
  assert.equal(signup.ok, true, 'local registration stays available when cloud client cannot insert');
  assert.equal(signup.user.role, 'player', 'signup never grants administrator role');
  assert.equal(db.getUser().username, 'newexample.com');
  assert.equal(db.isAdmin(), false);
  console.log('Auth/sync checks passed: 20');
})().catch(error => { console.error(error); process.exitCode = 1; });
