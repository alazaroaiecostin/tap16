const CACHE_NAME = "tap16-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/src/main.js",
  "/public/styles.css"
];

// Install: cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch: cache-first for app shell, network-first for everything else
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // App shell: cache first
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(res => res || fetch(event.request))
    );
    return;
  }

  // Samples + libs: cache as you go
  if (url.pathname.endsWith(".wav") || url.pathname.endsWith(".mp3") || url.pathname.endsWith(".ogg")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const res = await fetch(event.request);
        cache.put(event.request, res.clone());
        return res;
      })
    );
  }
});
