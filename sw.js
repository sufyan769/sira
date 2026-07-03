const CACHE_NAME = 'sira-offline-cache-v1';
const urlsToCache = [
  '/sira/index13k.html',
  '/sira/index12k.html',
  '/sira/style.css',
  '/sira/script.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(function() {
            console.log('Fetch failed; returning offline page instead.', event.request.url);
        });
      })
  );
});
