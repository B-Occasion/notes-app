const CACHE_NAME = "notes-app-v1";
const APP_SHELL_URL = new URL("./", self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const response = await fetch(APP_SHELL_URL);
    if (!response.ok) {
      throw new Error(`Failed to cache app shell: ${response.status}`);
    }

    const html = await response.clone().text();
    const shellUrls = new Set([
      APP_SHELL_URL,
      new URL("favicon.svg", APP_SHELL_URL).href,
      new URL("manifest.webmanifest", APP_SHELL_URL).href,
    ]);

    for (const [, path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = new URL(path, APP_SHELL_URL);
      if (url.origin === self.location.origin) {
        shellUrls.add(url.href);
      }
    }

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([...shellUrls]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith("notes-app-") && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (event.request.mode === "navigate") {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const shell = await cache.match(APP_SHELL_URL);
        if (shell) {
          return shell;
        }
        throw error;
      }
    }

    const cached = await cache.match(event.request.url, { ignoreVary: true });
    if (cached) {
      return cached;
    }

    const response = await fetch(event.request);
    if (response.ok) {
      await cache.put(event.request, response.clone());
    }
    return response;
  })());
});
