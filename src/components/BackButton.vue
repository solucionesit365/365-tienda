<template>
  <div v-if="canGoBack" class="back-nav d-flex align-items-center">
    <i
      class="fas fa-arrow-circle-left fs-2 pe-auto back-icon"
      @click="goBack"
      role="button"
      aria-label="Volver atrás"
    />
    <span v-if="displayTitle" class="fs-4 ms-2 back-title" @click="goBack" role="button">
      {{ displayTitle }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  useRouteTitle: {
    type: Boolean,
    default: true,
  },
  forceShow: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const route = useRoute();
const canGoBack = ref(false);
const navigationHistory = ref<string[]>([]);

// Determinar el título a mostrar
const displayTitle = computed(() => {
  // Si se proporciona un título explícito, usarlo
  if (props.title) {
    return props.title;
  }

  // Si useRouteTitle es true, usar el nombre o meta.title de la ruta
  if (props.useRouteTitle) {
    // Intentar obtener el título desde meta.title
    if (route.meta && route.meta.title) {
      return route.meta.title;
    }

    // Intentar conseguir el nombre de la ruta actual sin la primera barra
    const routeName =
      route.name ||
      route.path
        .split("/")
        .filter((segment) => segment)
        .pop();

    // Convertir el nombre de la ruta a un formato más legible
    // Ejemplo: 'portal-empleado' -> 'Portal Empleado'
    if (typeof routeName === "string") {
      return routeName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  // Si no hay título para mostrar
  return "";
});

// Inicializar el historial con la página actual
onMounted(() => {
  // Obtener historial guardado o inicializar un nuevo array
  const savedHistory = sessionStorage.getItem("navigationHistory");
  navigationHistory.value = savedHistory ? JSON.parse(savedHistory) : [];

  // Añadir la ruta actual al historial si no está ya
  const currentPath = route.fullPath;
  if (!navigationHistory.value.includes(currentPath)) {
    navigationHistory.value.push(currentPath);
    // Guardar en sessionStorage
    sessionStorage.setItem("navigationHistory", JSON.stringify(navigationHistory.value));
  }

  // Actualizar canGoBack
  updateCanGoBack();
});

// Actualizar el historial cuando cambie la ruta
watch(
  () => route.fullPath,
  (newPath) => {
    // Si la ruta es nueva, añadirla al historial
    if (!navigationHistory.value.includes(newPath)) {
      navigationHistory.value.push(newPath);
      // Guardar en sessionStorage
      sessionStorage.setItem("navigationHistory", JSON.stringify(navigationHistory.value));
    }

    // Actualizar canGoBack
    updateCanGoBack();
  },
  { immediate: true },
);

// Función para actualizar el estado de canGoBack
function updateCanGoBack() {
  if (route.path === "/login") {
    canGoBack.value = false;
    return;
  }
  // Si forceShow es true, siempre mostrar
  if (props.forceShow) {
    canGoBack.value = true;
    return;
  }

  // Verificar si hay más de una página en el historial
  // y verificar que no estemos en la primera página que se visitó
  const isFirstVisitedPage =
    navigationHistory.value.length > 0 && route.fullPath === navigationHistory.value[0];

  canGoBack.value = navigationHistory.value.length > 1 && !isFirstVisitedPage;
}

function goBack() {
  router.go(-1);
}
</script>

<style scoped>
.back-nav {
  cursor: pointer;
  margin: 1rem 0;
}

.back-icon {
  transition: transform 0.2s ease;
}

.back-nav:hover .back-icon {
  transform: translateX(-3px);
}

.back-title {
  cursor: pointer;
  font-weight: 500;
}
</style>
