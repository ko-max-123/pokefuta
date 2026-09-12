const CACHE_NAME = "tabi-no-mokuji-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./pokefuta.html",
  "./map.html",
  "./list.html",
  "./region.html",
  "./prefecture.html",
  "./spot.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./assets/css/contents.css",
  "./assets/css/style.css",
  "./assets/js/pwa.js",
  "./assets/js/app.js",
  "./assets/js/data.js",
  "./assets/js/official-spots.js",
  "./assets/js/my-collection.js",
  "./assets/images/japan-regions-blank.svg",
  "./assets/icons/app-icon-192.png",
  "./assets/icons/app-icon-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./ichinomiya/index.html",
  "./ichinomiya/map.html",
  "./ichinomiya/list.html",
  "./ichinomiya/region.html",
  "./ichinomiya/province.html",
  "./ichinomiya/assets/css/style.css",
  "./ichinomiya/assets/js/app.js",
  "./ichinomiya/assets/js/data.js",
  "./ichinomiya/assets/js/my-collection.js",
  "./ichinomiya/assets/images/japan-regions-blank.svg",
  "./todofuken/index.html",
  "./todofuken/map.html",
  "./todofuken/region.html",
  "./todofuken/prefecture.html",
  "./todofuken/place.html",
  "./todofuken/assets/css/style.css",
  "./todofuken/assets/js/app.js",
  "./todofuken/assets/js/data.js",
  "./todofuken/assets/js/my-places.js"
].map((path) => new URL(path, self.registration.scope).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("tabi-no-mokuji-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return cache.match(request, { ignoreSearch: request.mode === "navigate" })
      || cache.match(new URL("./offline.html", self.registration.scope).toString());
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  if (request.mode === "navigate" || ["document", "script", "style", "manifest"].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
