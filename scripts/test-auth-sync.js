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
    responseSession = { user };
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
        return {
          select(){ queryCalls.push(['select', table]); return this; },
          eq(column, value){ queryCalls.push(['eq', table, column, value]); return this; },
          ilike(column, value){ queryCalls.push(['ilike', table, column, value]); return this; },
          maybeSingle: async () => ({ data: null, error: queryFailure }),
          order(){ return Promise.resolve({ data: saveRows, error: queryFailure }); },
          upsert(payload, options){
            queryCalls.push(['upsert', table, payload, options]);
            return { select(){ return { single: async () => ({ data: payload, error: queryFailure }) }; } };
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
const context = { window: { supabase, AFMErrorLog: { recordHandled(error, source){ handledErrors.push({ message: error.message, source }); } } }, localStorage, location: { href: 'https://example.com/' }, console, Date, JSON, Number, Math, Promise };
vm.runInNewContext(fs.readFileSync('js/database.js', 'utf8'), context);

(async () => {
  const db = context.window.AFM_DB;
  assert.equal(await db.init(), null, 'fresh install has no session');
  authFailure = { message: 'Invalid login credentials', status: 400 };
  assert.equal((await db.signIn('coach@example.com', 'wrong')).ok, false);
  assert.equal(handledErrors[0].source, 'auth-signInWithPassword', 'falha de autenticação tratada entra no log');
  authFailure = null;
  const login = await db.signIn(' Coach@Example.com ', 'a long password');
  assert.equal(login.ok, true);
  assert.equal(calls[0][1].email, 'coach@example.com', 'email normalized before Auth');
  assert.equal(db.getUser().id, user.id);
  assert.equal(db.isAdmin(), false, 'papel de administrador não é derivado de metadados editáveis pelo usuário');
  user.user_metadata.role = 'admin';
  assert.equal(db.isAdmin(), false, 'user_metadata não concede privilégios administrativos');
  user.app_metadata.role = 'admin';
  assert.equal(db.isAdmin(), true, 'papel administrativo exige app_metadata confiável do Auth');
  delete user.app_metadata.role;

  storage.set('afm_accounts_v1', JSON.stringify([{ username: user.id, saves: [] }]));
  storage.set('afm_save_slot_1', JSON.stringify({ slot: 1, updatedAt: 'data inválida', data: { club: 'Save local corrompido' } }));
  saveRows = [{ slot: 1, club: 'Corinthians', manager: 'Coach', season: 2026, round: 1, balance: 0, updated_at: '2026-01-02T00:00:00.000Z', save_data: { club: 'Corinthians', season: 2026 } }];
  const recovered = await db.syncUser();
  assert.equal(recovered.ok, true);
  assert.equal(JSON.parse(storage.get('afm_save_slot_1')).data.club, 'Corinthians', 'timestamp local inválido é recuperado de uma cópia válida da nuvem');

  storage.set('afm_save_slot_1', JSON.stringify({ slot: 1, updatedAt: '2026-01-03T00:00:00.000Z', data: { club: 'Save local mais novo' } }));
  saveRows = [{ ...saveRows[0], updated_at: '2026-01-02T00:00:00.000Z', save_data: { club: 'Save antigo na nuvem' } }];
  await db.syncUser();
  assert.equal(JSON.parse(storage.get('afm_save_slot_1')).data.club, 'Save local mais novo', 'cópia local válida e mais recente é preservada');

  const saved = await db.saveSlot('forged-owner', 2, { club: 'Corinthians', data: { club: 'Corinthians', season: 2026 } });
  assert.equal(saved.ok, true);
  const upsert = queryCalls.find(call => call[0] === 'upsert');
  assert.equal(upsert[2].user_id, user.id, 'owner comes from Auth session, not caller input');
  assert.equal(upsert[3].onConflict, 'user_id,slot');
  await db.getSaves();
  assert(queryCalls.some(call => call[0] === 'eq' && call[2] === 'user_id' && call[3] === user.id));
  queryFailure = { message: 'RLS denied save read', code: '42501' };
  assert.equal((await db.getSaves()).ok, false);
  assert(handledErrors.some(item => item.source === 'save-sync-read'), 'falha de leitura/sincronização tratada entra no log');
  queryFailure = null;
  await db.deleteSlot('forged-owner', 2);
  assert(queryCalls.some(call => call[0] === 'delete' && call[2] === 'user_id' && call[3] === user.id));

  await db.signOut();
  assert.equal(db.getUser(), null);
  assert.equal((await db.saveSlot('', 1, { club: 'x', data: { club: 'x' } })).ok, false, 'anonymous writes rejected');
  const signup = await db.signUp('new@example.com', 'password-123', 'Novo treinador');
  assert.equal(signup.needsConfirmation, true, 'unconfirmed registration does not create a signed-in session');
  assert.equal(db.getUser(), null);
  console.log('Auth/sync checks passed: 20');
})().catch(error => { console.error(error); process.exitCode = 1; });
