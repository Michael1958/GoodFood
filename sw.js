const CACHE = 'goodfood-v1.5.3';
const CORE = ['./index.html', './manifest.webmanifest', './icon.svg',
  'https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/es/pure.min.js'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of CORE) {
      try { await c.add(u === './index.html' ? new Request(u, { cache: 'reload' }) : u); }
      catch (err) { console.warn('Cache skipped', u); }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.includes('openfoodfacts.org')) return;

  // Pages: always network first, cached copy only when offline.
  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(e.request, { cache: 'no-store' });
        if (r && r.ok) (await caches.open(CACHE)).put('./index.html', r.clone());
        return r;
      } catch (err) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Other files: cache first.
  e.respondWith((async () => {
    const hit = await caches.match(e.request);
    if (hit) return hit;
    try {
      const r = await fetch(e.request);
      if (r && r.ok) (await caches.open(CACHE)).put(e.request, r.clone());
      return r;
    } catch (err) { return Response.error(); }
  })());
});
