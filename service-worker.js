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

var DATA_CACHE_NAME = 'tagit-data-cache-v1';
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

self.addEventListener('activate', function(e) {
  console.log('ServiceWorker Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  console.log('Service Worker Fetch', e.request.url);
  if (event.method=="GET")
  if (event.request.url.indexOf(dataUrl) > -1) {
    /*
    "Cache then network" strategy used for Data
    */
    event.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * "Cache, falling back to the network" offline strategy used for App Shell
     */
    e.respondWith(
      caches.match(e.request).then(function (response) {
        return response || fetch(e.request);
      })
    );
  }
});
