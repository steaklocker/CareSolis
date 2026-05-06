/**
 * CARESOLIS SERVICE WORKER
 * Progressive Web App - Offline Support & Push Notifications
 * FDA-Compliant: Maintains data integrity in offline mode
 */

const CACHE_NAME = 'caresolis-v1.0.1';
const DATA_CACHE_NAME = 'caresolis-data-v1.0.1';

// Essential resources to cache immediately
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// API endpoints to cache (for offline access)
const API_CACHE_URLS = [
  '/functions/v1/make-server-9aeac050/status',
  '/functions/v1/make-server-9aeac050/logs',
];

// ==================== INSTALL EVENT ====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching essential resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting to activate immediately');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// ==================== ACTIVATE EVENT ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Delete old caches
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// ==================== FETCH EVENT ====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except our API)
  if (url.origin !== location.origin && !url.href.includes('supabase.co')) {
    return;
  }

  // STRATEGY 1: API calls - Network first, fall back to cache
  if (url.pathname.includes('/functions/v1/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed - try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving API response from cache (offline)');
              return cachedResponse;
            }
            // Return offline error
            return new Response(
              JSON.stringify({
                error: 'Offline - data not available',
                offline: true,
                timestamp: new Date().toISOString(),
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // STRATEGY 2: App shell - Cache first, fall back to network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/');
            }
            
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});

// ==================== PUSH NOTIFICATION EVENT ====================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'Caresolis Alert',
    body: 'New notification',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/badge-72x72.svg',
  };

  // Parse push payload
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || 'caresolis-notification',
        requireInteraction: data.urgent || false,
        data: {
          url: data.url || '/',
          timestamp: data.timestamp || new Date().toISOString(),
          type: data.type || 'general',
          patientId: data.patientId,
        },
        vibrate: data.urgent ? [200, 100, 200, 100, 200] : [200, 100, 200],
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/action-view.png',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/action-dismiss.png',
          },
        ],
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// ==================== NOTIFICATION CLICK EVENT ====================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  // Dismiss action - do nothing
  if (event.action === 'dismiss') {
    return;
  }

  // Get the URL from notification data
  const urlToOpen = event.notification.data?.url || '/';

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // No window open - open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ==================== BACKGROUND SYNC EVENT ====================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-dose-events') {
    event.waitUntil(syncDoseEvents());
  } else if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  } else if (event.tag === 'sync-logs') {
    event.waitUntil(syncEventLogs());
  }
});

// ==================== SYNC FUNCTIONS ====================

async function syncDoseEvents() {
  console.log('[SW] Syncing offline dose events...');
  
  try {
    // Get queued dose events from IndexedDB
    const db = await openDB();
    const tx = db.transaction('doseEvents', 'readonly');
    const store = tx.objectStore('doseEvents');
    const queuedEvents = await store.getAll();
    
    // Send to server
    for (const event of queuedEvents) {
      try {
        const response = await fetch('/functions/v1/make-server-9aeac050/dose-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
        
        if (response.ok) {
          // Remove from queue
          const deleteTx = db.transaction('doseEvents', 'readwrite');
          await deleteTx.objectStore('doseEvents').delete(event.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync dose event:', error);
      }
    }
    
    console.log('[SW] Dose events sync complete');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

async function syncNotifications() {
  console.log('[SW] Syncing notifications...');
  // Implementation for notification sync
}

async function syncEventLogs() {
  console.log('[SW] Syncing event logs...');
  // Implementation for log sync
}

// ==================== INDEXEDDB HELPERS ====================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CaresolisOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores for offline data
      if (!db.objectStoreNames.contains('doseEvents')) {
        db.createObjectStore('doseEvents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('logs')) {
        db.createObjectStore('logs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
      }
    };
  });
}

// ==================== MESSAGE EVENT ====================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  } else if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');