/* ============================================
   OURHIDDENVERSE - SERVICE WORKER
   PWA için offline destek ve caching
   ============================================ */

const CACHE_NAME = 'ourhiddenverse-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './script.js',
  './images/favicon.png',
  './images/apple-touch-icon.png',
  './manifest.json'
];

// Install event - cache dosyaları
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache hatası:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Firebase ve diğer API isteklerini cache'leme
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı response'u cache'e kaydet
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Offline durumda cache'den dön
        return caches.match(event.request);
      })
  );
});
