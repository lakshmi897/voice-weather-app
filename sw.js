const CACHE_NAME = 'weather-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/sw.js'  // Ensure your service worker itself is cached
];

// Installing Service Worker and caching essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetching assets and using cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // Try to match request in cache
      .then((cachedResponse) => {
        // If found in cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network
        return fetch(event.request).catch((err) => {
          console.error("Network request failed and no cache available", err);
        });
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
