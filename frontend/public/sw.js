// قناوي — minimal service worker (v3)
// Purpose: PWA install + APK/TWA + tiny offline fallback.
// Strict rules:
//   - NEVER intercept POST/PUT/DELETE (they must reach the API raw)
//   - NEVER intercept /api/*
//   - Navigations: network-first, fall back to cached '/'
//   - Static same-origin: stale-while-revalidate
//   - respondWith() ALWAYS resolves to a real Response (or the browser default
//     if we decide not to handle the request) — fixes
//     "Failed to convert value to 'Response'" errors.

const CACHE = 'qinawy-v3';
const APP_SHELL = ['/', '/favicon.svg', '/logo.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(APP_SHELL.map((u) => cache.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only touch GET; leave everything else (POST/PUT/PATCH/DELETE) to the browser.
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;     // cross-origin: don't touch
  if (url.pathname.startsWith('/api/')) return;         // API: always fresh

  // SPA navigation: network-first, fallback to cached '/'
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cached = await caches.match('/');
        return cached || new Response(
          '<!doctype html><meta charset="utf-8"><title>قناوي</title><body style="font-family:Cairo,system-ui;padding:24px;text-align:center"><h2>أنت غير متصل بالإنترنت</h2><p>يرجى إعادة المحاولة لاحقاً.</p></body>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
        );
      })
    );
    return;
  }

  // Same-origin static: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        // Cache only successful, basic/opaque responses
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached || Response.error());
      return cached || net;
    }).catch(() => fetch(req).catch(() => Response.error()))
  );
});
