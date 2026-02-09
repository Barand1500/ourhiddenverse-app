/* ============================================
   OURHIDDENVERSE - SERVICE WORKER
   PWA için offline destek ve caching
   ============================================ */

const CACHE_NAME = 'ourhiddenverse-v11';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/utils.js',
  './js/foto-upload.js',
  './js/main.js',
  './js/films.js',
  './js/film-oneri.js',
  './js/diziler.js',
  './js/dizi-oneri.js',
  './js/dateler.js',
  './js/oyunlar.js',
  './js/kitaplar.js',
  './js/harita.js',
  './js/takvim.js',
  './js/ozelgunler.js',
  './js/bucketlist.js',
  './js/sarkilar.js',
  './js/hikayemiz.js',
  './js/gunluk-soru.js',
  './js/backup.js',
  './images/favicon.png',
  './images/apple-touch-icon.png',
  './manifest.json'
];

// Install event - cache dosyaları
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - cache'den veya network'ten getir
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache'de varsa onu döndür
        if (response) {
          return response;
        }
        // Yoksa network'ten getir
        return fetch(event.request);
      })
  );
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eski cache silindi:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
