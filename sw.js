const CACHE = "gym-tracker-v1";
const ASSETS = [
  "/gym-tracker/",
  "/gym-tracker/index.html",
  "/gym-tracker/style.css",
  "/gym-tracker/data.js",
  "/gym-tracker/timer.js",
  "/gym-tracker/render.js",
  "/gym-tracker/app.js",
  "/gym-tracker/manifest.json",
  "/gym-tracker/icon-192.png",
  "/gym-tracker/icon-512.png"
];
 
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
 
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
 
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
