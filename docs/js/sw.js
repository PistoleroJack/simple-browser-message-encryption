const cacheName = 'app-v1';

const appShellFiles = [
  '/',
  '/index.html',
  '/js/main.js',
  '/css/main.css',
  '/css/normalize.min.css',
  '/favicon.ico',
  '/favicon.png',
];

const contentToCache = [...appShellFiles];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all');
      await cache.addAll(contentToCache);
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const response = await caches.match(event.request);
      console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
      if (response) {
        return response;
      }
      const newResponse = await fetch(event.request);
      if (newResponse.status === 200) {
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
        await cache.put(event.request, newResponse.clone());
      }
      return newResponse;
    })(),
  );
});
