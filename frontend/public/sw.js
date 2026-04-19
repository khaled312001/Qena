// قناوي — minimal service worker
// Purpose: satisfy Android PWA install / Trusted Web Activity (TWA) requirements
// and provide a tiny offline fallback for the app shell.
//
// Network-first for navigations, cache-first for static assets. No aggressive
// pre-caching so the site can still update cleanly.

const CACHE = 'qinawy-v1';
const APP_SHELL = [
  '/',
  '/favicon.svg',
  '/logo.svg',
  '/apple-touch-icon.svg',
  '/icon-maskable.svg',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept API calls — we want them fresh.
  if (url.pathname.startsWith('/api/')) return;

  // Navigation requests: network-first, fall back to cached index.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/'))
    );
    return;
  }

  // Same-origin static: cache-first, update in background.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached);
        return cached || net;
      })
    );
  }
});
