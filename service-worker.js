/**
 * Created by teply on 08.01.2017.
 */

var CACHE_NAME = 'tagit-cache-v1';
var urlsToCache = [
  '/',
  '/css/main.css',
  '/js/app.js',
  '/js/shims.js',
  '/assets/img/login-logo.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

var DATA_CACHE_NAME = 'tagit-data-cache-v1;
var DATA_URL = 'https://192.168.0.102:8443/api/v1/'


self.addEventListener('install', function(event) {
  console.log('ServiceWorker Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('ServiceWorker Activate');
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  console.log('Service Worker Fetch', event.request.url);
  if (event.request.url.indexOf(DATA_URL) > -1) {
    /*
    "Cache then network" strategy used for Data
    */
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(function(cache) {
        return fetch(event.request).then(function(response){
          cache.put(event.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * "Cache, falling back to the network" offline strategy used for App Shell
     */
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      })
    );
  }
});
