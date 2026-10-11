const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const listeners = {};
const cached = new Set();
const clientMessages = [];
let networkFails = false;
const cache = { async add(asset){ cached.add(new URL(asset, 'https://game.test/').href); } };
const self = {
  location: { href: 'https://game.test/sw.js', origin: 'https://game.test' },
  addEventListener(type, callback){ listeners[type] = callback; },
  skipWaiting(){},
  clients: {
    async claim(){},
    async matchAll(){ return [{ postMessage(message){ clientMessages.push(message); } }]; }
  }
};
const caches = {
  async open(){ return cache; },
  async keys(){ return ['afm-2027-cache-v7']; },
  async delete(){ return true; },
  async match(request){ return cached.has(request.url) ? { status: 200 } : null; }
};
const fetch = async request => {
  if(String(request).endsWith('/index.html')) return { ok: true, async text(){ return html; } };
  if(networkFails) throw new Error('offline');
  return { ok: true };
};

vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), { self, caches, fetch, URL, Promise, Response });

(async () => {
  let installPromise;
  listeners.install({ waitUntil(promise){ installPromise = promise; } });
  await installPromise;
  for(const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)){
    if(/^https?:\/\//i.test(match[1])) continue;
    assert(cached.has(new URL(match[1], 'https://game.test/').href), `arquivo do shell deve entrar no cache: ${match[1]}`);
  }

  networkFails = true;
  let offlineResponse;
  const request = { method: 'GET', url: 'https://game.test/dynamic-missing.js' };
  listeners.fetch({ request, respondWith(promise){ offlineResponse = promise; } });
  const response = await offlineResponse;
  assert.equal(response.status, 503, 'cache miss offline retorna erro HTTP explícito');
  assert.equal(clientMessages[0].type, 'AFM_OFFLINE_CACHE_MISS', 'cache miss gera evento para o log local');
  console.log(`Service worker checks passed: ${cached.size} assets cached and offline miss handled.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
