const CACHE_NAME = 'bishvilach-v3';
const STATIC_ASSETS = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Handle reminder messages from the app
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SCHEDULE_REMINDER') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: './icon-192.svg',
        badge: './icon-192.svg',
        dir: 'rtl',
        lang: 'he',
        vibrate: [200, 100, 200],
        actions: [
          { action: 'open', title: 'פתח את המערכת' }
        ]
      });
    }, delay);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      if (list.length > 0) {
        list[0].focus();
      } else {
        clients.openWindow('./');
      }
    })
  );
});
