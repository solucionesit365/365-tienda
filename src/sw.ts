import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim, skipWaiting } from "workbox-core";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { createHandlerBoundToURL } from "workbox-precaching";

// Firebase Messaging imports
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCME2CYaIso7PngM2wihV4LZGB_JzZoKjc",
  authDomain: "silema-dev.firebaseapp.com", // Valor por defecto, se puede configurar
  projectId: "silema",
  storageBucket: "silema.appspot.com",
  messagingSenderId: "565898129046",
  appId: "1:565898129046:web:7245c59623deb1f72c1cb7",
  measurementId: "G-1J6JS28GMD",
};

// Inicializar Firebase en el service worker
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// PWA Service Worker
declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// Activar inmediatamente el service worker
skipWaiting();
clientsClaim();

// Limpiar caches antiguos
cleanupOutdatedCaches();

// Workbox inyectará automáticamente la lista de archivos a precargar aquí
precacheAndRoute(self.__WB_MANIFEST);

// Manejar navegación para SPA
const handler = createHandlerBoundToURL("/index.html");
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

// Firebase Messaging - Manejar mensajes en segundo plano
onBackgroundMessage(messaging, (payload) => {
  console.log("Mensaje recibido en segundo plano:", payload);

  const notificationTitle = payload.notification?.title || "Nueva notificación";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/192x192.png",
    badge: "/192x192.png",
    data: payload.data,
  };

  return (self as any).registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en notificaciones
self.addEventListener("notificationclick", (event: any) => {
  console.log("Click en notificación:", event);
  event.notification.close();

  // Abrir o enfocar la aplicación
  event.waitUntil(
    (self as any).clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients: any[]) => {
        // Si hay una ventana abierta, enfocarla
        if (clients.length > 0) {
          return clients[0].focus();
        }
        // Si no, abrir una nueva
        return (self as any).clients.openWindow("/");
      }),
  );
});
