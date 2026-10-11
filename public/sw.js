/*
 * AHS Jewellers service worker.
 *
 * - Build assets (/_next/static): cache first. They are content-hashed, so they never go stale.
 * - Pages: network first, falling back to the last copy seen, then to /offline.
 * - Stock photographs: left to the browser cache. Intercepting them breaks next/image preloads.
 * - Video and anything cross-origin besides photographs: never cached (range requests, size).
 *
 * Bump VERSION to retire every cache on the next visit.
 */
const VERSION = "ahs-v3";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = "/offline";
const PRECACHE = [OFFLINE, "/manifest.webmanifest", "/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];
const LIMITS = { [PAGES]: 40 };

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC);
      await cache.addAll(PRECACHE);
      // Also keep the offline page's own CSS and scripts, so it is styled without a network.
      try {
        const html = await (await fetch(OFFLINE, { cache: "no-store" })).text();
        const assets = [...html.matchAll(/(\/_next\/static\/[^"'\s)]+\.(?:css|js|woff2))/g)].map((m) => m[1]);
        await cache.addAll([...new Set(assets)]);
      } catch {
        /* The page still works unstyled. */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function trim(name) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  const max = LIMITS[name];
  if (max && keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Build assets: cache first.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) caches.open(STATIC).then((c) => c.put(request, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  // Page navigations: network first, then last copy, then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok && url.origin === self.location.origin) {
            const cache = await caches.open(PAGES);
            await cache.put(request, res.clone());
            trim(PAGES);
          }
          return res;
        } catch {
          return (await caches.match(request)) || (await caches.match(OFFLINE)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Icons and other same-origin public files: cache first.
  if (url.origin === self.location.origin && /^\/(icons\/|icon\.svg|manifest\.webmanifest)/.test(url.pathname)) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
  }
});
