// Höj versionen varje gång en fil i appen ändras, annars visar telefonen den gamla cachade versionen.
const CACHE = 'tagglogg-v5';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Namnlistan är valfri: saknas filen på servern ska appen ändå kunna installeras och uppdateras.
const OPTIONAL = ['./vagnnamn.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache =>
    cache.addAll(ASSETS).then(() => Promise.all(OPTIONAL.map(u => cache.add(u).catch(() => {}))))
  ));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;   // t.ex. api.github.com går rakt ut
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
