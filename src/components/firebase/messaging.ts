// src/firebase/messaging.ts
import Swal from "sweetalert2";
import { getAuth } from "firebase/auth";
import { axiosInstance } from "../axios/axios";
import { isSupported, getToken, onMessage } from "firebase/messaging";
import { app, messaging } from ".";
import { checkLogin } from "./authentication";

let __FCM_INITIALIZED__ = false;
let __LAST_SAVED_TOKEN__: string | null = null;

// --- Guarda el token en tu backend ------------------------------------------------
async function saveFCMToken(deviceToken: string, uid: string) {
  try {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No hay un usuario autenticado.");
      return;
    }
    const accessToken = await currentUser.getIdToken();

    await axiosInstance.post(
      "register-notification-device",
      { uid, token: deviceToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch (error) {
    console.error("Error guardando token FCM:", error);
  }
}

// --- Obtiene el token y lo sincroniza si cambió -----------------------------------
async function ensureToken(
  userUid: string,
  registration: ServiceWorkerRegistration,
  vapidKey: string,
) {
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    console.warn("getToken devolvió null (permiso no concedido o bloqueado).");
    return;
  }

  // Log SIEMPRE que lo obtenemos (arranque o refresco)
  console.log("Token FCM:", token);

  // Evita golpear tu backend si no cambió
  if (token !== __LAST_SAVED_TOKEN__) {
    await saveFCMToken(token, userUid);
    __LAST_SAVED_TOKEN__ = token;
    // guarda también localmente por si recargas
    localStorage.setItem("fcm_token", token);
  }
}

// --- Inicializa FCM: pide permiso, obtiene token, configura listeners -------------
export async function initializeFCM() {
  try {
    if (__FCM_INITIALIZED__) return;
    __FCM_INITIALIZED__ = true;

    if (!(await isSupported())) {
      console.warn("FCM no soportado en este navegador.");
      return;
    }

    // Carga último token guardado (para comparar)
    __LAST_SAVED_TOKEN__ = localStorage.getItem("fcm_token");

    const user = await checkLogin();
    if (!user) return;

    const registration = await navigator.serviceWorker.ready;

    const VAPID = import.meta.env.VITE_VAPID_KEY as string | undefined;
    if (!VAPID) {
      console.error("Falta VITE_VAPID_KEY en el .env");
      return;
    }

    // Flujo de permisos
    if (Notification.permission === "granted") {
      await ensureToken(user.uid, registration, VAPID);
    } else if (Notification.permission === "denied") {
      await Swal.fire({
        title: "Notificaciones bloqueadas",
        text: "Has bloqueado el permiso de notificaciones. Ponte en contacto con informática.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
      return;
    } else {
      const result = await Swal.fire({
        title: "Activar notificaciones",
        text: "¿Quieres activar las notificaciones para estar al tanto de las novedades?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#28A745",
        confirmButtonText: "Sí, activar",
        cancelButtonText: "No, gracias",
      });
      if (result.isConfirmed) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          await ensureToken(user.uid, registration, VAPID);
        } else {
          console.log("Permiso de notificación no concedido.");
          return;
        }
      } else {
        return;
      }
    }

    // Auto-refresh: cuando la pestaña vuelva a ser visible y cada 12h
    const refresh = () => ensureToken(user.uid, registration, VAPID);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void refresh();
    });
    // cada 12 horas (ajusta si quieres)
    setInterval(refresh, 12 * 60 * 60 * 1000);

    // Mensajes en primer plano
    onMessage(messaging, (payload) => {
      console.log("Mensaje recibido en primer plano:", payload);
      const title = payload.notification?.title ?? "Nueva notificación";
      const body = payload.notification?.body ?? "";
      Swal.fire({ title, text: body, icon: "info" });
    });
  } catch (error) {
    console.error("Error en initializeFCM:", error);
  }
}
