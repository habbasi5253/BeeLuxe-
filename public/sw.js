/**
 * BeeLuxe Cleaners — Service Worker
 *
 * Handles two distinct jobs:
 *   1. OFFLINE CACHING — so cleaners can load the portal at a job site even with
 *      spotty connectivity. Uses a "network-first, cache-fallback" strategy.
 *
 *   2. WEB PUSH — displays job notifications even when the portal tab is closed.
 *      (See the push + notificationclick handlers at the bottom.)
 *
 * Cache strategy matrix:
 *   Static assets (JS/CSS/fonts/icons) → Cache-first (fast, rarely change)
 *   HTML pages                          → Network-first, cache fallback
 *   /api/* calls                        → Network-only (never cache live data)
 *   Nominatim/OSM tiles                 → Cache-first, 7-day TTL (map tiles)
 *
 * VAPID note: VAPID keys must be generated once and stored as env vars.
 *   Run: node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k,null,2))"
 *   Set: NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY + VAPID_SUBJECT
 */

const CACHE_VERSION   = 'beeluxe-v2'
const STATIC_CACHE    = `${CACHE_VERSION}-static`
const PAGES_CACHE     = `${CACHE_VERSION}-pages`
const TILES_CACHE     = `${CACHE_VERSION}-tiles`

// Shell pages that get pre-cached on install so the app loads offline
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/portal',
  '/offline',                       // custom offline fallback page
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// ── Install — pre-cache shell ────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      // Use individual adds so a single 404 doesn't abort everything
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  )
})

// ── Activate — purge old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('beeluxe-') && !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch — routing strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept non-GET requests or API calls — always go to the network
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  // OSM map tiles → cache-first with 7-day TTL
  if (
    url.hostname.endsWith('tile.openstreetmap.org') ||
    url.hostname === 'nominatim.openstreetmap.org'
  ) {
    event.respondWith(tileStrategy(request))
    return
  }

  // Next.js static assets (_next/static/) → cache-first (immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Static public files (icons, manifest) → cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/sw.js'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // HTML pages → network-first, fallback to cache, then /offline
  event.respondWith(networkFirst(request))
})

// ── Strategy: cache-first ─────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone())
  }
  return response
}

// ── Strategy: network-first with cache fallback ───────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    // Last resort: return the offline fallback page
    return caches.match('/offline') ?? new Response('Offline', { status: 503 })
  }
}

// ── Strategy: tile cache with TTL ────────────────────────────────────────────
const TILE_TTL_MS = 7 * 24 * 60 * 60 * 1000   // 7 days

async function tileStrategy(request) {
  const cache  = await caches.open(TILES_CACHE)
  const cached = await cache.match(request)

  if (cached) {
    const age = Date.now() - new Date(cached.headers.get('sw-cached-at') ?? 0).getTime()
    if (age < TILE_TTL_MS) return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      // Clone and add a timestamp header so we can enforce TTL
      const headers = new Headers(response.headers)
      headers.set('sw-cached-at', new Date().toISOString())
      const stamped = new Response(await response.blob(), { status: response.status, headers })
      cache.put(request, stamped)
      return stamped
    }
    return response
  } catch {
    return cached ?? new Response('Map tile unavailable', { status: 503 })
  }
}

// ── Push received ─────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: '🐝 BeeLuxe Cleaners',
    body:  'You have a new notification.',
    url:   '/portal',
  }

  if (event.data) {
    try { data = { ...data, ...event.data.json() } } catch { /* use defaults */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:               data.body,
      icon:               '/icons/icon-192.svg',
      badge:              '/icons/icon-72.svg',
      data:               { url: data.url },
      requireInteraction: true,
      actions: [
        { action: 'open',    title: 'Open Portal' },
        { action: 'dismiss', title: 'Dismiss'     },
      ],
    })
  )
})

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url ?? '/portal'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    })
  )
})
