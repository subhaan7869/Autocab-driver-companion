const CACHE_NAME = 'autocab-driver-companion-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap',
  'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-first falling back to Cache)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and exclude external WebSockets or non-http protocols
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Bypass tile map requests or cache them differently if desired, let's do network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful HTTP responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is for page navigation, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Handle Notification Clicks to Focus or Open App Window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus on existing window if open
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Or open a new window if none are open
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Background Push Notification handling
self.addEventListener('push', (event) => {
  let data = { title: 'Autocab Companion', body: 'New alert received.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Autocab Companion', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png',
    badge: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'autocab-alert',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
