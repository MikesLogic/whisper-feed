// Cache name
const CACHE_NAME = 'anomo-cache-v1';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/home',
  '/profile',
  '/hashtag'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // For navigation requests, try the network first, fall back to index.html
        if (event.request.mode === 'navigate') {
          return fetch(event.request)
            .catch(() => caches.match('/index.html'));
        }

        // Try to fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Push notification handling
self.addEventListener('push', event => {
  const data = event.data.json();
  const tag = data.type || 'default';
  
  self.registration.getNotifications({ tag }).then(existingNotifications => {
    let title = data.title;
    let body = data.body;
    
    if (existingNotifications.length > 0) {
      existingNotifications.forEach(notification => notification.close());
      
      const count = existingNotifications.length + 1;
      if (tag === 'chat') {
        title = `New messages (${count})`;
        body = `You have ${count} unread messages`;
      } else {
        title = `${title} (${count})`;
        body = `You have ${count} new notifications`;
      }
    }
    
    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag,
      renotify: true,
      data: {
        url: data.url || '/',
        type: tag
      }
    };

    self.registration.showNotification(title, options);
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const url = event.notification.data.type === 'chat' 
    ? '/?chat=open' 
    : (event.notification.data.url || '/');
    
  event.waitUntil(
    clients.openWindow(url)
  );
});