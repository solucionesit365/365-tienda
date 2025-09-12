/// <reference lib="webworker" />

// --- Workbox
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { clientsClaim, skipWaiting } from "workbox-core";
import { registerRoute, NavigationRoute } from "workbox-routing";

// --- Firebase Messaging (SW build)
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Para TypeScript
declare const self: ServiceWorkerGlobalScope;

// =====================
//  Firebase (FCM) init
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyCME2CYaIso7PngM2wihV4LZGB_JzZoKjc",
  authDomain: "silema-dev.firebaseapp.com",
  projectId: "silema",
  storageBucket: "silema.appspot.com",
  messagingSenderId: "565898129046",
  appId: "1:565898129046:web:7245c59623deb1f72c1cb7",
  measurementId: "G-1J6JS28GMD",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// =====================
//  Control del SW
// =====================
skipWaiting();
clientsClaim();

// Limpia cachés antiguos y precachea lo inyectado por VitePWA
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// =====================
//  SPA Navigation Fallback
//  ⚠️ EXCLUYE rutas internas de Firebase
// =====================
const handler = createHandlerBoundToURL("/index.html");
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    /^\/__\//, // /__/*
    /\/auth\/iframe/, // Firebase Auth iframe
    /\/auth\/handler/, // Firebase Auth handler
  ],
});
registerRoute(navigationRoute);

// =====================
//  FCM: mensajes en 2º plano
// =====================
onBackgroundMessage(messaging, (payload) => {
  // (opcional) console.log en dev
  console.log("Mensaje recibido en segundo plano:", payload);

  const notificationTitle = payload.notification?.title || "Nueva notificación";
  const notificationOptions: NotificationOptions = {
    body: payload.notification?.body || "",
    icon: "/192x192.png",
    badge: "/192x192.png",
    data: payload.data,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// =====================
//  Clicks en notificaciones
// =====================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.link || "/"; // fallback a "/" si no viene nada

  event.waitUntil(
    (async () => {
      const clientList = (await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })) as readonly WindowClient[];

      // Si ya hay una pestaña que coincide con la URL, enfócala
      for (const client of clientList) {
        if (
          client.url.includes(new URL(targetUrl, self.location.origin).hostname) &&
          "focus" in client
        ) {
          return client.focus();
        }
      }

      // Si no existe, abre una nueva ventana con el link
      return self.clients.openWindow(targetUrl);
    })(),
  );
});
