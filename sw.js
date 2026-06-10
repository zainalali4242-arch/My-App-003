// sw.js — Service Worker Personal Tracker v1.0
const CACHE_NAME = 'personal-tracker-v1'

// Semua file yang di-cache saat install
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://unpkg.com/dexie/dist/dexie.min.js',
]

// Install: cache semua asset
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS)
    }).catch(function(err) {
      console.log('Cache install error:', err)
    })
  )
  self.skipWaiting()
})

// Activate: hapus cache lama
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE_NAME })
          .map(function(k) { return caches.delete(k) })
      )
    })
  )
  self.clients.claim()
})

// Fetch: cache-first, fallback ke network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        // Cache response baru untuk request yang berhasil
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone)
          })
        }
        return response
      })
    }).catch(function() {
      // Offline fallback
      return caches.match('./personal-tracker.html')
    })
  )
})
