const CACHE = 'goodfood-v1.5.1-welcome-fix';
const APP_SHELL = [
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  'https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/es/pure.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of APP_SHELL) {
      try {
        const request = url === './index.html'
          ? new Request(url, { cache: 'reload' })
          : url;
        await cache.add(request);
      } catch (error) {
        console.warn('GoodFood cache skipped:', url, error);
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.hostname.includes('openfoodfacts.org')) return;

  // Always request navigations from GitHub Pages first. This prevents an old
  // cached index.html from controlling the launch screen after a deployment.
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request, { cache: 'no-store' });
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE);
          await cache.put('./index.html', fresh.clone());
        }
        return fresh;
      } catch (error) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Cache-first for static scanner assets, with automatic runtime caching.
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      return Response.error();
    }
  })());
});
