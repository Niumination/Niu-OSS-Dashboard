/*
 * Service worker PWA — Niumination.
 *
 * Strategi:
 *  - Precache shell inti (/, /offline, manifest, ikon).
 *  - Navigasi  : network-first -> cache -> fallback /offline.
 *  - Aset lain : stale-while-revalidate (cache-first + pembaruan diam-diam).
 *
 * Catatan deploy:
 *  - GitHub Pages melayani situs dari root -> scope '/' valid.
 *  - Versi cache di-bump (NIU_SW_VERSION) saat strategi/aset berubah.
 */

const VERSION = 'niu-sw-v1';
const CORE = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // hanya same-origin

  // Navigasi halaman: network-first.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((hit) => hit || caches.match('/offline'))
            .then((hit) => hit || caches.match('/offline.html'))
            .then(
              (hit) =>
                hit ||
                new Response('Offline', {
                  status: 503,
                  headers: { 'content-type': 'text/plain; charset=utf-8' },
                }),
            ),
        ),
    );
    return;
  }

  // Aset: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((hit) => {
      const fetching = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || fetching;
    }),
  );
});
