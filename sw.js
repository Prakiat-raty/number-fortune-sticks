// sw.js - Cache-first PWA Service Worker (พื้นฐาน)
const CACHE_NAME = 'incense-3digits-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // เพิ่มไอคอนจริงของคุณ
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const res = await fetch(request);
      if (res && res.status === 200 && res.type === 'basic') {
        cache.put(request, res.clone());
      }
      return res;
    } catch (err) {
      // fallback แบบง่าย: ถ้าออฟไลน์แล้วหาไม่เจอ ก็คืนหน้าแรก
      const fallback = await cache.match('./');
      return fallback || Response.error();
    }
  })());
});
