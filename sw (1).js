/* Service worker CX Komplain. Hanya menyimpan file aplikasi (same-origin).
   Permintaan ke Apps Script/Google tidak disentuh, jadi data selalu segar. */
const C = 'cxk-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('index.html')))
  );
});
