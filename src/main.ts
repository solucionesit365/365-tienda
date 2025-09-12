import "@/assets/css/main.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { registerSW } from "virtual:pwa-register";
import packageInfo from "../package.json";
import Swal from "sweetalert2";

// Limpiar flags de actualización al cargar la página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Reset flags antes de recargar
    sessionStorage.removeItem('sw_updating');
  });
  
  // Verificar si venimos de una actualización
  if (sessionStorage.getItem('sw_updating') === 'true') {
    sessionStorage.removeItem('sw_updating');
    console.log('Página recargada después de actualización del SW');
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
  // Evitar mostrar múltiples diálogos
  if (updateDialogShown || isUpdating || refreshing) {
    console.log("Diálogo de actualización ya mostrado o en proceso");
    return;
  }
  
  updateDialogShown = true;
  
  const updateText = reason === "sw" 
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
  
  // Marcar que estamos actualizando
  sessionStorage.setItem('sw_updating', 'true');
  
  if (newWorkerWaiting) {
    // Caso: nuevo SW esperando activación
    console.log("Enviando SKIP_WAITING a nuevo worker");
    newWorkerWaiting.postMessage({ type: 'SKIP_WAITING' });
  } else if (navigator.serviceWorker.controller) {
    // Caso: SW actual necesita ser actualizado
    console.log("Enviando SKIP_WAITING a controller actual");
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  
  // Recargar después de un pequeño delay para que el SW procese
  setTimeout(() => {
    if (!refreshing) {
      refreshing = true;
      console.log("Recargando página...");
      window.location.reload();
    }
  }, 500);
}

// Detectar cuando el SW se actualiza
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!refreshing) {
    refreshing = true;
    window.location.reload();
  }
});

// Escuchar mensajes del service worker
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'SW_UPDATED') {
    console.log('SW actualizado, la página se recargará automáticamente');
    // Pequeño delay para que el usuario vea el mensaje
    setTimeout(() => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    }, 500);
  }
});

// Registra el Service Worker con gestión de actualizaciones
const updateSW = registerSW({
  onNeedRefresh() {
    // Se detectó una nueva versión de la aplicación (contenido)
    console.log("onNeedRefresh disparado");
    if (!updateDialogShown && !isUpdating && !refreshing) {
      showUpdateDialog("contenido");
    }
  },
  onOfflineReady() {
    // La aplicación está lista para funcionar offline
    console.log("Aplicación lista para funcionar offline");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    console.log("SW registrado correctamente:", swScriptUrl);
    
    // Detectar cuando hay un nuevo SW instalado pero no activado
    registration?.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorkerWaiting = newWorker;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nuevo SW instalado, mostrar diálogo
            showUpdateDialog("sw");
          }
        });
      }
    });
  },
  onRegisterError(error) {
    console.error("Error registrando SW:", error);
  },
});
