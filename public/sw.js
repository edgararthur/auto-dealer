// Service Worker for Autora - Auto Parts Marketplace
// Version 1.0.0

const CACHE_NAME = 'autora-v1.0.0';
const STATIC_CACHE_NAME = 'autora-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'autora-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'autora-images-v1.0.0';
const API_CACHE_NAME = 'autora-api-v1.0.0';

// Cache duration constants
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000, // 1 day
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000, // 5 minutes
};

// Static resources to cache on install
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  // Add critical CSS and JS files here
];

// API endpoints to cache with strategies
const API_CACHE_PATTERNS = [
  /\/api\/products\/categories/,
  /\/api\/products\/brands/,
  /\/api\/products\/featured/,
  /\/api\/products\/bestsellers/,
];

// Image URL patterns to cache
const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /images\.unsplash\.com/,
  /cdn\./,
];

// Network-first patterns (for real-time data)
const NETWORK_FIRST_PATTERNS = [
  /\/api\/auth/,
  /\/api\/cart/,
  /\/api\/orders/,
  /\/api\/user/,
  /\/api\/search/,
];

// Cache-first patterns (for static content)
const CACHE_FIRST_PATTERNS = [
  /\.(?:css|js|woff|woff2|ttf|eot)$/,
  /\/static\//,
  /\/assets\//,
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler with caching strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Static resources - Cache First
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // Images - Cache First with long expiration
    if (IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.hostname))) {
      return await cacheFirst(request, IMAGE_CACHE_NAME);
    }
    
    // API requests requiring real-time data - Network First
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirst(request, API_CACHE_NAME);
    }
    
    // Cacheable API requests - Stale While Revalidate
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await staleWhileRevalidate(request, API_CACHE_NAME);
    }
    
    // HTML pages - Network First with offline fallback
    if (request.headers.get('accept')?.includes('text/html')) {
      return await networkFirstWithOfflineFallback(request);
    }
    
    // Default strategy - Network First
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    return await getOfflineFallback(request);
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATIONS.STATIC)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || createErrorResponse('Offline and no cached version available');
  }
}

// Network First strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    return cachedResponse || createErrorResponse('Network unavailable and no cached version');
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh data in background
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATIONS.API)) {
    fetchPromise; // Continue background update
    return cachedResponse;
  }
  
  // Wait for network if no cache or expired
  return await fetchPromise || cachedResponse || createErrorResponse('No data available');
}

// Network First with offline fallback for HTML pages
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage();
    }
    
    return createErrorResponse('Page not available offline');
  }
}

// Get offline fallback based on request type
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    return await getOfflinePage();
  }
  
  // For images, return placeholder
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return await getOfflineImage();
  }
  
  // For API requests, return offline JSON
  if (url.pathname.startsWith('/api/')) {
    return createOfflineAPIResponse();
  }
  
  return createErrorResponse('Resource not available offline');
}

// Get offline page
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  return await cache.match('/') || createOfflineHTML();
}

// Get offline image placeholder
async function getOfflineImage() {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  // Return a cached placeholder image or create one
  return createOfflineImageResponse();
}

// Create offline HTML response
function createOfflineHTML() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Autora</title>
      <style>
        body { font-family: system-ui; text-align: center; padding: 2rem; background: #f9fafb; }
        .offline-container { max-width: 400px; margin: 0 auto; }
        .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
        .offline-title { color: #1f2937; margin-bottom: 0.5rem; }
        .offline-message { color: #6b7280; margin-bottom: 2rem; }
        .retry-button { background: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; }
        .retry-button:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
          It looks like you've lost your internet connection. 
          Check your connection and try again.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Create offline API response
function createOfflineAPIResponse() {
  return new Response(JSON.stringify({
    success: false,
    error: 'You are currently offline. Please check your internet connection.',
    offline: true,
    data: null
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 503
  });
}

// Create offline image response (simple SVG placeholder)
function createOfflineImageResponse() {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="system-ui">
        Image unavailable offline
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// Create error response
function createErrorResponse(message) {
  return new Response(message, {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  const cacheDate = response.headers.get('sw-cache-date');
  if (!cacheDate) return false;
  
  const age = Date.now() - new Date(cacheDate).getTime();
  return age > maxAge;
}

// Add cache date to response
function addCacheDate(response) {
  const newResponse = response.clone();
  newResponse.headers.set('sw-cache-date', new Date().toISOString());
  return newResponse;
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  console.log('[SW] Performing background sync...');
  // Implement background sync logic here
  // For example, retry failed API requests
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/badge-icon.png',
        tag: data.tag || 'autora-notification',
        data: data.data || {}
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
});

// Get cache statistics
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}

console.log('[SW] Service worker loaded successfully');
