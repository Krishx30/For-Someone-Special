// Basic Service Worker to satisfy PWA installation requirements
const CACHE_NAME = 'love-app-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); // Become available to all pages
});

self.addEventListener('fetch', (event) => {
    // We are simply passing requests through linearly without offline caching 
    // to ensure you don't get stuck with stale cached files while updating the site.
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response("You are offline.");
        })
    );
});
