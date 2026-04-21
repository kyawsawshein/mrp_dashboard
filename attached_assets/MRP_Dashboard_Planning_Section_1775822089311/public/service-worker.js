// Service Worker for Offline Functionality
const CACHE_NAME = 'mrp-cache-v1';
const API_CACHE_NAME = 'mrp-api-cache-v1';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/projects',
  '/settings',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/v1/projects')) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
  );
});

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try to fetch from network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the successful response
      await cache.put(request, networkResponse.clone());
      console.log('📡 API response cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('💾 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // No cache available, return error
    return new Response(
      JSON.stringify({ 
        error: 'Network error and no cached data available',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Syncing MRP data with Postgres...');
    event.waitUntil(syncPendingChanges());
  }
});

async function syncPendingChanges() {
  // In a real implementation, you would read 'pending_sync' from IndexedDB
  // and POST it to your PostgreSQL-backed API.
  console.log('🔄 Pushing local changes to PostgreSQL backend...');
  return Promise.resolve();
}