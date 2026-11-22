const CACHE_NAME = "global-explorer-lite-v2-v1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./offline.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {

            const clone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));

            return response;
          })
          .catch(() => caches.match("./offline.html"));
      })
  );
});