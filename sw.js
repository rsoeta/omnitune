const CACHE_NAME = 'omnitune-cache-v2'; // Naik versi agar cache lama dihapus
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png'
];

// Event Install: Menyimpan file inti & memaksa SW baru langsung aktif
self.addEventListener('install', event => {
    self.skipWaiting(); // Sangat penting agar update tidak tertunda
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Cache v2 terbuka');
            return cache.addAll(urlsToCache);
        })
    );
});

// Event Activate: Membersihkan sampah cache versi lama (v1)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Menghapus cache usang:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Langsung mengambil alih PWA tanpa perlu ditutup dulu
});

// Event Fetch: Strategi Network-First (Jaringan Diutamakan)
self.addEventListener('fetch', event => {
    // Jangan pernah men-cache file musik dari Google Drive atau API eksternal!
    // Hanya tangani file yang berasal dari domain aplikasi kita sendiri.
    if (!event.request.url.startsWith(self.location.origin)) {
        return; 
    }

    event.respondWith(
        // 1. Coba ambil dari internet dulu agar kodenya selalu terbaru
        fetch(event.request)
        .then(response => {
            // Jika berhasil didapat dari internet, simpan salinannya ke cache diam-diam
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
            });
            return response;
        })
        .catch(() => {
            // 2. Jika offline / tidak ada sinyal, barulah pakai file dari Cache
            return caches.match(event.request);
        })
    );
});