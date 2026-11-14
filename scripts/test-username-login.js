const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const storage = new Map();
const localStorage = {
  getItem(key){ return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value){ storage.set(key, String(value)); },
  removeItem(key){ storage.delete(key); }
};
const context = {
  window: { AFMErrorLog: { record(){}, recordHandled(){} } },
  localStorage,
  console,
  Date,
  JSON,
  Number,
  Math,
  Promise
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js/database.js'), 'utf8'), context, { filename: 'js/database.js' });

(async () => {
  storage.set('afm_accounts_v1', JSON.stringify([{ username: 'coach_user', name: 'Coach User', role: 'player', password: 'test-password', saves: [] }]));
  const db = context.window.AFM_DB;
  const login = await db.signIn('  COACH_USER  ', 'test-password');
  assert.equal(login.ok, true, 'O login deve aceitar nome de usuário sem exigir e-mail.');
  assert.equal(login.user.username, 'coach_user');

  const wrongPassword = await db.signIn('coach_user', 'wrong-password');
  assert.equal(wrongPassword.ok, false, 'Senha incorreta não pode autenticar.');
  assert.match(wrongPassword.error, /Senha incorreta/i);

  const unknownUser = await db.signIn('usuario_inexistente', 'test-password');
  assert.equal(unknownUser.ok, false, 'Usuário inexistente não pode autenticar.');
  assert.match(unknownUser.error, /conta não encontrada neste navegador/i);
  const registered = await db.signUp('novo_treinador', 'local-password', 'Novo Treinador');
  assert.equal(registered.ok, true, 'cadastro deve criar a conta para login local');
  const localLogin = await db.signIn('novo_treinador', 'local-password');
  assert.equal(localLogin.ok, true, 'conta recém-criada deve autenticar localmente');
  console.log('Username login checks passed: 5');
})().catch(error => { console.error(error); process.exitCode = 1; });
