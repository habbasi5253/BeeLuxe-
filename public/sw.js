/**
 * BeeLuxe Service Worker — Web Push notifications
 *
 * Registered from the cleaner portal page. When a push notification arrives,
 * this service worker displays it even if the portal tab is closed.
 *
 * NOTE: VAPID keys must be generated once and stored as env vars.
 *   Run this locally to generate them:
 *     node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k,null,2))"
 *   Then set:
 *     NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>
 *     VAPID_PRIVATE_KEY=<privateKey>
 *     VAPID_SUBJECT=mailto:dispatch@beeluxecleaners.com
 */

const CACHE_NAME = 'beeluxe-sw-v1'

// ── Install ────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

// ── Activate ───────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Push received ──────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: '🐝 BeeLuxe Cleaners', body: 'You have a new notification.', url: '/' }

  if (event.data) {
    try { data = { ...data, ...event.data.json() } } catch { /* use defaults */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      data: { url: data.url },
      actions: [
        { action: 'open',    title: 'Open Portal' },
        { action: 'dismiss', title: 'Dismiss'     },
      ],
      requireInteraction: true,   // keeps the notification visible until user acts
    })
  )
})

// ── Notification click ─────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if already open
      for (const client of clients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
