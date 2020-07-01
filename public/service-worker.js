const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

const cacheName = "static-cache-v1";
const dynamicCache = "dynamic-cache-v1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                console.log("Your static files were cached!")
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(err => console.log(err))
    );
    self.skipWaiting();
});