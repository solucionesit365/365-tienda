import Swal from "sweetalert2";
import { getAuth } from "firebase/auth";
import { axiosInstance } from "../axios/axios";
import { getToken, onMessage } from "firebase/messaging";
import { app, messaging } from ".";
import { checkLogin } from "./authentication";

// Función para guardar el token FCM en el backend
async function saveFCMToken(token: string, uid: string) {
  try {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (currentUser) {
      const accessToken = await currentUser.getIdToken(); // Obtener el token de acceso

      await axiosInstance.post(
        `/notificaciones/saveTokenFCM?token=${token}&uid=${uid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } else {
      console.error("No hay un usuario autenticado.");
    }
  } catch (error) {
    console.log(error);
  }
}

// Iniciar el proceso cuando la app esté completamente lista

export async function initializeFCM() {
  try {
    // Esperamos a que el usuario esté autenticado completamente
    const user = await checkLogin();

    if (!user) return;

    // Registramos el Service Worker
    const registration = await navigator.serviceWorker.register("/custom-service-worker.js");

    // Verificamos si el permiso de notificación ya fue otorgado
    if (Notification.permission === "granted") {
      // Si las notificaciones están permitidas, obtenemos el token FCM
      const fcmToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      // Guardamos el token junto con el UID del usuario autenticado
      await saveFCMToken(fcmToken, user.uid);

      // Manejar los mensajes recibidos en primer plano
      onMessage(messaging, (payload) => {
        console.log("Mensaje recibido en primer plano:", payload);
        if (payload && payload.notification) {
          Swal.fire({
            title: payload.notification.title,
            text: payload.notification.body,
            icon: "info",
          });
        } else {
          console.log("No se recibió la notificación correctamente.");
        }
      });
    } else if (Notification.permission === "denied") {
      Swal.fire({
        title: "Notificaciones bloqueadas",
        text: "Has bloqueado el permiso de notificaciones, ponte en contacto con informática.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } else {
      // Si el permiso no ha sido solicitado, lo pedimos al usuario
      Swal.fire({
        title: "Activar Notificaciones",
        text: "¿Quieres activar las notificaciones para estar al tanto de las novedades?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#28A745",
        confirmButtonText: "Sí, activar",
        cancelButtonText: "No, gracias",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            // Obtenemos el token FCM una vez que se concede el permiso
            const fcmToken = await getToken(messaging, {
              vapidKey:
                "BDPwfWwBsKnpUjWi5KJLwRVa4u25xS7glifynH4oWBpcAvx_4B0W5y6DaDlA707suKDbemWU_GPUy8hAm6ea6Xc",
              serviceWorkerRegistration: registration,
            });

            await saveFCMToken(fcmToken, user.uid);
          } else {
            console.log("Permiso de notificación no concedido.");
          }
        }
      });
    }
  } catch (error) {
    console.error("Error en el proceso de inicialización de FCM:", error);
  }
}
