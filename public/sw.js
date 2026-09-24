const CACHE_NAME = 'horizoneinvest-v4'
const APP_SHELL = ['/', '/index.html', '/icon.png', '/logo.png', '/manifest.webmanifest']

function spaShellResponse() {
  return caches.match('/index.html').then((cached) => {
    if (cached) return cached
    return fetch('/index.html')
  })
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Admin panel has its own SPA under /admin — do not intercept with main app shell.
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return

  // Bypass Vite dev server requests, HMR, hot updates, and source files in dev mode
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@fs') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.search.includes('t=')
  ) {
    return
  }

  // SPA: HTML navigations must never leave the handler rejected
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) return networkResponse
          return spaShellResponse().then(
            (shell) => shell || networkResponse || new Response('Offline', { status: 503 }),
          )
        })
        .catch(() =>
          spaShellResponse().then((shell) => shell || new Response('Offline', { status: 503 })),
        ),
    )
    return
  }

  // Static assets: try cache, then network; fallback gracefully without 504 errors
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => new Response('', { status: 200 }))
    }),
  )
})
