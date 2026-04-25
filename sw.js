/* NovaPulse Digital — Service Worker */
const CACHE_NAME = 'novapulse-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/store.html',
  '/blog.html',
  '/dashboard.html',
  '/business-card.html',
  '/css/style.css',
  '/css/animations.css',
  '/css/components.css',
  '/css/chatbot.css',
  '/js/main.js',
  '/js/store.js',
  '/js/chatbot.js',
  '/js/dashboard.js',
  '/js/search.js',
  '/js/audioplayer.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
