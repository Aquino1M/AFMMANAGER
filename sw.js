// Service Worker do AFM Manager 2027
const CACHE_NAME = 'afm-2027-cache-v54';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/app.css',
  './js/game.js',
  './js/lib/three.min.js',
  './js/lib/OrbitControls.js',
  './js/core/stadium_lowpoly_engine.js',
  './js/core/stadium_3d_manager.js',
  './js/ui/create_club_ui.js',
  './js/ui/squad_reports_modal.js',
  './js/ui/training_center_modal.js',
  './js/features30.js',
  './js/competitions.js',
  './js/database.js',
  './manifest.json',
  './js/core/afm_turbo_gpu_optimizer.js',
  './js/core/error_log.js',
  './js/core/audio_engine.js',
  './js/core/match_engine.js',
  './js/core/tactics_pitch.js',
  './js/ui/settings_modal.js',
  './data/club_badges_competitions.js',
  './data/club_badges_verified_overrides.js'
];

function getLocalAppAssets(html){
  const urls = new Set();
  for(const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)){
    const raw = match[1];
    if(!raw || raw.startsWith('data:') || raw.startsWith('#')) continue;
    try {
      const url = new URL(raw, self.location.href);
      if(url.origin !== self.location.origin) continue;
      url.hash = '';
      urls.add(url.href);
    } catch {}
  }
  return [...urls];
}

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(ASSETS_TO_CACHE.map(asset => cache.add(asset)));
      const response = await fetch('./index.html');
      if(response.ok){
        const assets = getLocalAppAssets(await response.text());
        await Promise.allSettled(assets.map(asset => cache.add(asset)));
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if(cached) return cached;
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for(const client of clients) client.postMessage({ type: 'AFM_OFFLINE_CACHE_MISS', url: event.request.url });
      return new Response('Este arquivo não está disponível no cache offline. Reconecte-se e recarregue o jogo.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    })
  );
});
