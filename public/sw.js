// Service Worker для 4Game PWA — версия с принудительной очисткой кэша.

const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `4game-${CACHE_VERSION}`;
const IMAGE_CACHE = `4game-images-${CACHE_VERSION}`;

// Install: пропускаем precache, сразу активируемся
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate: УДАЛЯЕМ ВСЕ КЭШИ независимо от версии, потом перезагружаем все клиенты
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});

// Fetch: всегда сеть, без кэша
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('onrender.com')) return;

  // Изображения — stale-while-revalidate
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // HTML/JS/CSS — всегда из сети
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
