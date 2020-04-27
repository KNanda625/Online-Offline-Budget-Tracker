const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/style.css"];

// Cache variable names
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// Install event listener
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // open the cache
            console.log("Files caches successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    // New version of service worker will activate immediately
    self.skipWaiting();
});

// Activate event listener
// Service worker is installed/activated
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    // claim() methos allows pages to be controlled immediately
    self.clients.claim();
});

// The fetch event fires every time a resource controlled by service worker is requested
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {

        // Responder
        evt.respondWith(
            // Add DATA_CACHE_NAME to caches
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        // If response was good, clone and store in cache
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get from cache
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }

    // if the request is not for the API, serve static assets using "offline-first" approach.
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request)
            });

        })
    );
});
