const CACHE_NAME = 'omnitune-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png'
    // Untuk PWA tingkat lanjut, kita bisa menyimpan CDN Tailwind dan SweetAlert di cache,
    // tapi untuk tahap awal ini, kita cache struktur dasarnya saja.
];

// Event Install: Menyimpan file inti ke dalam cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Cache terbuka');
            return cache.addAll(urlsToCache);
        })
    );
});

// Event Fetch: Mengambil data dari cache jika ada, jika tidak, ambil dari jaringan
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Kembalikan respons dari cache jika ditemukan
            if (response) {
                return response;
            }
            // Jika tidak, ambil dari jaringan
            return fetch(event.request);
        })
    );
});