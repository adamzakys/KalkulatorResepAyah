const CACHE_NAME = 'resep-calc-v3'; // Versi cache (ubah jika ada update besar)
// Daftar file inti yang perlu disimpan agar bisa offline
const urlsToCache = [
  '/', // Root
  'index.html',
  'style.css',
  'app.js',
  'icon-192.png',
  'icon-512.png'
  // Tambahkan file lain jika ada (misal gambar lain, font)
];

// Event install: Menyimpan file ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka, menambahkan file inti');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
          console.error('Gagal menambahkan file ke cache:', err);
      })
  );
  self.skipWaiting(); // Aktifkan service worker baru segera
});

// Event activate: Membersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Hapus cache yang tidak sama dengan versi saat ini
          return cacheName.startsWith('resep-calc-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Menghapus cache lama:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim(); // Ambil alih kontrol halaman segera
});

// Event fetch: Menyajikan file dari cache (jika ada) atau jaringan
self.addEventListener('fetch', event => {
  // Hanya tangani request GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, langsung kembalikan dari cache
        if (response) {
          // console.log('Menyajikan dari cache:', event.request.url);
          return response;
        }

        // Jika tidak ada di cache, coba ambil dari jaringan
        // console.log('Mengambil dari jaringan:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Jika berhasil diambil dari jaringan, simpan salinannya ke cache
            // Periksa apakah response valid sebelum caching
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone response karena response hanya bisa dibaca sekali
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // console.log('Menyimpan ke cache:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetch gagal; mencoba menyajikan offline page jika ada:', error);
            // Opsional: tampilkan halaman offline kustom jika fetch gagal total
            // return caches.match('offline.html');
        });
      })
  );
});
