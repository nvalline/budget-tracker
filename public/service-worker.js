const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

const CACHE_NAME = "static-cache-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Your static files were cached!")
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(err => console.log(err))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                        console.log("Removing old cache data.", key)
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            return cache.match(event.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.match(event.request)
                    .then(response => {
                        return response || fetch(event.request);
                    });
            })
    );
});