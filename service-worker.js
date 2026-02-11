const CACHE_NAME = "vault-cache-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

// install & cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// activate
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// fetch: cache-first strategy (images + app)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(networkResponse => {
        // cache images dynamically
        if (event.request.url.includes(".png") ||
            event.request.url.includes(".jpg") ||
            event.request.url.includes(".jpeg") ||
            event.request.url.includes(".webp")) {

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }

        return networkResponse;
      });
    })
  );
});
