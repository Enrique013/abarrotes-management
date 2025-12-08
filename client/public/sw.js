const CACHE_NAME = 'abarrotes-v1';
const RUNTIME_CACHE = 'abarrotes-runtime-v1';

// Archivos esenciales para cachear durante la instalación
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos esenciales');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            // Eliminar caches antiguos
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map(cacheName => {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no sean del mismo origen (excepto APIs)
  if (url.origin !== location.origin && !url.pathname.startsWith('/api')) {
    return;
  }

  // Estrategia Cache First para assets estáticos
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia Network First para documentos HTML y APIs
  if (request.destination === 'document' || url.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Para todo lo demás, intentar network first
  event.respondWith(networkFirst(request));
});

// Estrategia Cache First: buscar en cache primero, si no hay, ir a red
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Sirviendo desde cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log('[SW] Cacheando nuevo recurso:', request.url);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Error en fetch:', error);
    // Intentar devolver página offline si existe
    const offlinePage = await cache.match('/index.html');
    if (offlinePage) {
      return offlinePage;
    }
    throw error;
  }
}

// Estrategia Network First: intentar red primero, si falla usar cache
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log('[SW] Respuesta de red:', request.url);
      // Guardar en cache runtime solo si es exitoso
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Red no disponible, buscando en cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Si es una petición de documento HTML, devolver index.html
    if (request.destination === 'document') {
      const indexCache = await caches.open(CACHE_NAME);
      const indexPage = await indexCache.match('/index.html');
      if (indexPage) {
        return indexPage;
      }
    }

    throw error;
  }
}

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Manejar sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('[SW] Evento de sincronización:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí se puede implementar lógica de sincronización
      Promise.resolve()
    );
  }
});

console.log('[SW] Service worker cargado');
