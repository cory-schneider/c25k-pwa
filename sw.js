const CACHE_NAME = "c25k-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/app.css",
  "/js/app.js",
  "/js/program.js",
  "/js/timer-worker.js",
  "/js/tts.js",
  "/js/storage.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Precache all assets on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Cache-first, network-fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
