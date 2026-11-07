// Keep this version aligned with the asset URLs in both HTML pages and their module imports.
// A new URL lets an older cache-first worker fetch updated code before it is replaced.
const CACHE_NAME = "life-in-progress-static-v6";
const STATIC_PATHS = [
  "./index.html",
  "./widget.html",
  "./styles.css?v=6",
  "./widget.css?v=6",
  "./app.js?v=6",
  "./widget.js?v=6",
  "./time.js?v=6",
  "./meals.js?v=6",
  "./local-demo.js?v=6",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PATHS.map((path) => new URL(path, self.registration.scope))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name.startsWith("life-in-progress-") && name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request, { ignoreSearch: true });
          if (cached) return cached;
          const fallback = url.pathname.endsWith("/widget.html") ? "./widget.html" : "./index.html";
          return cache.match(new URL(fallback, self.registration.scope));
        }),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response.ok && !response.redirected) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(async () => (await caches.match(request)) || Response.error()),
  );
});
