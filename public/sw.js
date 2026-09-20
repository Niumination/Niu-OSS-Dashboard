/*
 * Service worker PWA — Niumination.
 *
 * Strategi:
 *  - Precache shell inti (/, /offline, manifest, ikon) — tahan gagal: aset
 *    di-precached satu per satu; satu gagal tidak membatalkan instalasi.
 *  - Navigasi  : network-first -> cache navigasi (RUNTIME, dibatasi N entri
 *    LRU-ish) -> fallback /offline.
 *  - Aset lain : stale-while-revalidate (cache-first + pembaruan diam-diam),
 *    masuk cache RUNTIME yang sama (dibatasi).
 *
 * Catatan deploy:
 *  - GitHub Pages melayani situs dari root -> scope '/' valid.
 *  - Bump VERSION saat strategi/aset inti berubah.
 */

const VERSION = 'niu-sw-v2';
const RUNTIME_MAX = 60;
const CORE = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/** Simpan satu permintaan; gagal direkam tapi tidak melempar. */
async function putQuiet(cacheName, req, res) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(req, res);
  } catch {
    // Kuota penuh / disk gagal — abaikan; entri berikutnya tetap dicoba.
  }
}

/** Pangkas cache ke N entri terbaru (approx-LRU: Cache API urutkan insert). */
async function trim(cacheName, max) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= max) return;
    for (const key of keys.slice(0, keys.length - max)) {
      await cache.delete(key);
    }
  } catch {
    // abaikan
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      // addAll bersifat all-or-nothing; jaringan goyang saat instalasi tidak
      // boleh membatalkan service worker selamanya -> precache per item.
      await Promise.all(
        CORE.map((url) =>
          fetch(new Request(url, { cache: 'reload' }))
            .then((res) => (res.ok ? putQuiet(VERSION, url, res) : null))
            .catch(() => null),
        ),
      );
      await self.skipWaiting();
    })(),
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

  // Navigasi halaman: network-first, salin ke cache runtime (dibatasi).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            putQuiet(VERSION, req, copy).then(() => trim(VERSION, RUNTIME_MAX));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((hit) => hit || caches.match('/offline'))
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

  // Aset: stale-while-revalidate (dibatasi jumlah entri).
  event.respondWith(
    caches.match(req).then((hit) => {
      const fetching = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            putQuiet(VERSION, req, copy).then(() => trim(VERSION, RUNTIME_MAX));
          }
          return res;
        })
        .catch(() => hit);
      return hit || fetching;
    }),
  );
});
