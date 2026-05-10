const CACHE_NAME = "vault-cache-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL
self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {

  event.waitUntil(
    Promise.all([
      self.clients.claim(),

      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
    ])
  );
});

// FETCH
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    caches.match(event.request).then((cachedResponse) => {

      // RETURN CACHE INSTANTLY
      if (cachedResponse) {

        // UPDATE SILENTLY IN BACKGROUND
        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {

              if (!networkResponse || networkResponse.status !== 200) {
                return;
              }

              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });

            })
            .catch(() => {})
        );

        return cachedResponse;
      }

      // FIRST TIME FETCH
      return fetch(event.request).then((networkResponse) => {

        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const clone = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });

        return networkResponse;
      });

    })
  );
});
