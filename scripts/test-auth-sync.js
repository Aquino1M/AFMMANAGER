const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const calls = [];
let listener;
let responseSession = null;
const user = { id: 'user-123', email: 'coach@example.com', user_metadata: { display_name: 'Coach' } };
const auth = {
  async getSession(){ return { data: { session: responseSession }, error: null }; },
  onAuthStateChange(fn){ listener = fn; },
  async signInWithPassword(credentials){
    calls.push(['signInWithPassword', credentials]);
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
          order(){ return Promise.resolve({ data: [], error: null }); },
          upsert(payload, options){
            queryCalls.push(['upsert', table, payload, options]);
            return { select(){ return { single: async () => ({ data: payload, error: null }) }; } };
          },
          delete(){
            return { eq(column, value){ queryCalls.push(['delete', table, column, value]); return { eq: async (nextColumn, nextValue) => { queryCalls.push(['delete', table, nextColumn, nextValue]); return { error: null }; } }; } };
          }
        };
      }
    };
  }
};
const localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
const context = { window: { supabase }, localStorage, location: { href: 'https://example.com/' }, console, Date, JSON, Number, Math, Promise };
vm.runInNewContext(fs.readFileSync('js/database.js', 'utf8'), context);

(async () => {
  const db = context.window.AFM_DB;
  assert.equal(await db.init(), null, 'fresh install has no session');
  const login = await db.signIn(' Coach@Example.com ', 'a long password');
  assert.equal(login.ok, true);
  assert.equal(calls[0][1].email, 'coach@example.com', 'email normalized before Auth');
  assert.equal(db.getUser().id, user.id);

  const saved = await db.saveSlot('forged-owner', 2, { club: 'Corinthians', data: { club: 'Corinthians', season: 2026 } });
  assert.equal(saved.ok, true);
  const upsert = queryCalls.find(call => call[0] === 'upsert');
  assert.equal(upsert[2].user_id, user.id, 'owner comes from Auth session, not caller input');
  assert.equal(upsert[3].onConflict, 'user_id,slot');
  await db.getSaves();
  assert(queryCalls.some(call => call[0] === 'eq' && call[2] === 'user_id' && call[3] === user.id));
  await db.deleteSlot('forged-owner', 2);
  assert(queryCalls.some(call => call[0] === 'delete' && call[2] === 'user_id' && call[3] === user.id));

  await db.signOut();
  assert.equal(db.getUser(), null);
  assert.equal((await db.saveSlot('', 1, { club: 'x', data: { club: 'x' } })).ok, false, 'anonymous writes rejected');
  const signup = await db.signUp('new@example.com', 'password-123', 'Novo treinador');
  assert.equal(signup.needsConfirmation, true, 'unconfirmed registration does not create a signed-in session');
  assert.equal(db.getUser(), null);
  console.log('Auth/sync checks passed: 13');
})().catch(error => { console.error(error); process.exitCode = 1; });
