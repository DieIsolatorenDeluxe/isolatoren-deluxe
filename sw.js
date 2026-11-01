const CACHE_NAME = 'gemischrechner-v7';
const APP_SCOPE = self.registration.scope;
const CORE_FILES = [
  './', './index.html', './calculator.js', './app.js', './manifest.json',
  './logo.webp', './trabant.webp', './simson.webp', './mz.webp', './sonstige_zweitakter.webp',
  './icon_instagram.webp', './icon_facebook.webp', './icon_tiktok.webp',
  './desktop-verknuepfungen.zip', './gemischrechner.url', './gemischrechner.webloc',
  './app-icon-180.png', './app-icon-192.png', './app-icon-512.png',
  './app-icon-maskable-512.png', './app-icon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Bypass stale HTTP cache; large optional images must not block a bug fix.
    await cache.addAll(CORE_FILES.map(file =>
      new Request(new URL(file, APP_SCOPE), {cache: 'reload'})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const previousVersions = keys.filter(key =>
      key.startsWith('gemischrechner-') && key !== CACHE_NAME
    );
    await Promise.all(previousVersions.map(key => caches.delete(key)));
    await self.clients.claim();
    // Claim alone leaves the old inline calculator running in existing tabs.
    if (previousVersions.length) {
      const windows = await self.clients.matchAll({type: 'window'});
      for (const client of windows.filter(client => client.url.startsWith(APP_SCOPE))) {
        // Do not await navigation: its fetch must be allowed to run after activation.
        client.navigate(client.url).catch(() => {});
      }
    }
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, {cache: 'no-store'});
    if (!response.ok) throw new Error('App update unavailable');
    try { await cache.put(request, response.clone()); } catch {}
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const shell = await cache.match(new URL('./index.html', APP_SCOPE).href);
      if (shell) return shell;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    try { await cache.put(request, response.clone()); } catch {}
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(APP_SCOPE)) return;
  const path = new URL(request.url).pathname;
  const isAppCode = request.mode === 'navigate' || /\.(html|js|json)$/.test(path);
  event.respondWith(isAppCode ? networkFirst(request) : cacheFirst(request));
});
