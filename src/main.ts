import "@/assets/css/main.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { registerSW } from "virtual:pwa-register";
import { Settings } from "luxon";
import packageInfo from "../package.json";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import Swal from "sweetalert2";

Settings.defaultZone = "Europe/Madrid";

// Log para verificar qué versión del código se está ejecutando
console.log("=== 365 Tienda v" + packageInfo.version + " ===");
console.log("Build timestamp:", __BUILD_TIME__); // Se reemplaza automáticamente en build
console.log("Timestamp de carga:", new Date().toISOString());

// Constantes para manejo de actualización
const LAST_UPDATE_KEY = "last_sw_update";
const UPDATE_COOLDOWN = 60000; // 60 segundos de cooldown después de actualizar
const RELOAD_TIMEOUT = 3000; // 3 segundos máximo para esperar controllerchange

// Verificar si acabamos de actualizar recientemente
function recentlyUpdated(): boolean {
  const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
  if (!lastUpdate) return false;

  const timeSinceUpdate = Date.now() - parseInt(lastUpdate, 10);
  return timeSinceUpdate < UPDATE_COOLDOWN;
}

// Marcar que se realizó una actualización
function markUpdateCompleted() {
  localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
}

// Limpiar flags de actualización al cargar la página
if (typeof window !== "undefined") {
  // Verificar si venimos de una actualización
  if (recentlyUpdated()) {
    console.log("Página recargada después de actualización del SW - cooldown activo");
  }
}

const app = createApp(App);
app.config.globalProperties.$appVersion = packageInfo.version;
app.use(createPinia());
app.use(router);
app.mount("#app");

// Variables globales para manejo de SW
let refreshing = false;
let newWorkerWaiting: ServiceWorker | null = null;
let updateDialogShown = false;
let isUpdating = false;

// Función para mostrar el diálogo de actualización
function showUpdateDialog(reason: string = "contenido") {
  // Verificar si acabamos de actualizar recientemente
  if (recentlyUpdated()) {
    console.log("Actualización reciente detectada - no mostrar diálogo");
    return;
  }

  // Evitar mostrar múltiples diálogos
  if (updateDialogShown || isUpdating || refreshing) {
    console.log("Diálogo de actualización ya mostrado o en proceso");
    return;
  }

  updateDialogShown = true;

  const updateText =
    reason === "sw"
      ? "Se ha actualizado el sistema de notificaciones y funcionalidades offline. ¿Quieres aplicar la actualización ahora?"
      : "Hay una nueva versión de la aplicación disponible. ¿Quieres actualizarla ahora?";

  Swal.fire({
    title: "¡Nueva actualización disponible!",
    text: updateText,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#28A745",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, actualizar",
    cancelButtonText: "Después",
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      applyUpdate();
    } else {
      // Si el usuario cancela, reset el estado pero no mostrar de nuevo por un tiempo
      setTimeout(() => {
        updateDialogShown = false;
      }, 30000); // 30 segundos antes de poder mostrar de nuevo
    }
  });
}

// Función para aplicar la actualización
function applyUpdate() {
  if (isUpdating) {
    console.log("Actualización ya en proceso");
    return;
  }

  isUpdating = true;
  console.log("Iniciando actualización...");

  // Marcar que se realizó una actualización
  markUpdateCompleted();

  if (newWorkerWaiting) {
    // Caso: nuevo SW esperando activación
    console.log("Enviando SKIP_WAITING a nuevo worker");
    newWorkerWaiting.postMessage({ type: "SKIP_WAITING" });
  } else if (navigator.serviceWorker.controller) {
    // Caso: SW actual necesita ser actualizado
    console.log("Enviando SKIP_WAITING a controller actual");
    navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
  }

  // Fallback: si controllerchange no se dispara en X segundos, forzar recarga
  setTimeout(() => {
    if (!refreshing) {
      console.log("Timeout alcanzado - forzando recarga...");
      refreshing = true;
      window.location.reload();
    }
  }, RELOAD_TIMEOUT);
}

// Escuchar mensajes del Service Worker
navigator.serviceWorker.addEventListener("message", (event) => {
  console.log("Mensaje del SW recibido:", event.data);

  if (event.data && event.data.type === "SW_ACTIVATED") {
    console.log("SW activado - esperando controllerchange o timeout para recargar");
  }
});

// Detectar cuando el SW se actualiza
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (!refreshing) {
    refreshing = true;
    console.log("Controller changed - recargando página...");
    // Asegurar que el flag está marcado antes de recargar
    markUpdateCompleted();
    window.location.reload();
  }
});

// Registra el Service Worker con gestión de actualizaciones
registerSW({
  onNeedRefresh() {
    // Se detectó una nueva versión de la aplicación (contenido)
    console.log("onNeedRefresh disparado");
    // Verificar cooldown antes de mostrar
    if (!recentlyUpdated() && !updateDialogShown && !isUpdating && !refreshing) {
      showUpdateDialog("contenido");
    } else {
      console.log("onNeedRefresh ignorado - cooldown activo o diálogo ya mostrado");
    }
  },
  onOfflineReady() {
    // La aplicación está lista para funcionar offline
    console.log("Aplicación lista para funcionar offline");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    console.log("SW registrado correctamente:", swScriptUrl);

    // Detectar cuando hay un nuevo SW instalado pero no activado
    registration?.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorkerWaiting = newWorker;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Nuevo SW instalado, verificar cooldown antes de mostrar diálogo
            if (!recentlyUpdated()) {
              showUpdateDialog("sw");
            } else {
              console.log("Nuevo SW detectado pero cooldown activo - ignorando");
            }
          }
        });
      }
    });
  },
  onRegisterError(error) {
    console.error("Error registrando SW:", error);
  },
});
