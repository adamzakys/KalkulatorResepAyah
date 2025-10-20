const CACHE_NAME = "resep-calc-v1";
const urlsToCache = ["/", "index.html", "style.css", "app.js", "icon-192.png", "icon-512.png"];

// Event install: menyimpan file-file aplikasi ke cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Event fetch: menyajikan file dari cache jika tersedia (mode offline)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Ambil dari cache
      }
      return fetch(event.request); // Jika tidak ada di cache, ambil dari jaringan
    })
  );
});
