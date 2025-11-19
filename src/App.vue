<template>
  <template v-if="!loading">
    <NavComponent v-if="userStore.user.logeado" />
    <div class="container-fluid contenido-con-scroll">
      <BackButton v-if="userStore.user.logeado" />
      <RouterView />
      <FooterComponent :class="{ 'd-none': hideFooter }" />
    </div>
  </template>
  <template v-else>
    <LoaderComponent class="fondo" />
  </template>
  <LinkMicrosoftAccount
    @confirm="linkWithMicrosoft"
    @cancel="handleCancelLinkMicrosoft"
    ref="refLinkMicrosoftAccountModal"
  />
</template>

<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import BackButton from "./components/BackButton.vue";
import { onAuthStateChanged, getAuth, getIdTokenResult, type IdTokenResult } from "firebase/auth";
import { app } from "@/components/firebase/index.js";
import { handleRedirectResult, linkWithMicrosoft } from "@/components/firebase/authentication";
import { initializeFCM } from "@/components/firebase/messaging";
import { useUserStore } from "./stores/user";
import { useTiendaStore } from "./stores/tienda";
import Swal from "sweetalert2";
import { onMounted, ref, watch } from "vue";
import { axiosInstance } from "./components/axios/axios";
import LoaderComponent from "./components/LoaderComponent.vue";
import NavComponent from "./components/NavComponent.vue";
import FooterComponent from "./components/FooterComponent.vue";
import LinkMicrosoftAccount from "./components/LinkMicrosoftAccount.vue";

const auth = getAuth(app);
const userStore = useUserStore();
const router = useRouter();
const loading = ref(true);
const hideFooter = ref(false);
const refLinkMicrosoftAccountModal = ref<InstanceType<typeof LinkMicrosoftAccount> | null>(null);

function antiLag() {
  if (userStore.isLogeado && userStore.getUid) return false;
  else return true;
}

async function initializeAuthListener() {
  // Solo manejar redirect en producción (cuando NO usamos popup)
  if (import.meta.env.MODE !== "development") {
    await handleRedirectResult();
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        if (antiLag()) {
          const sqlUser = await axiosInstance.get("trabajadores/getTrabajadorByAppId", {
            params: { uid: user.uid },
          });

          if (!sqlUser.data.ok) throw Error(sqlUser.data?.message);
          if (!user.email) throw Error("El usuario no tiene un email asociado");

          await loadTiendas();

          userStore.setUser({
            uid: user.uid,
            displayName: sqlUser.data.data.displayName,
            email: user.email,
            logeado: true,
            idSql: sqlUser.data.data.id,
            idTienda: sqlUser.data.data.idTienda,
            coordinadoraDeLaTienda: sqlUser.data.data.coordinadoraDeLaTienda,
            tienda: sqlUser.data.data.tienda,
            llevaEquipo: sqlUser.data.data.llevaEquipo,
            nombreTienda: sqlUser.data.data.tienda?.nombre ?? null,
            displayFoto: sqlUser.data.data.displayFoto,
            dni: sqlUser.data.data.dni,
            roles: sqlUser.data.data.roles,
            permissions: sqlUser.data.data.permisos,
          });

          const tokenResult = await getIdTokenResult(user);
          handleLinkMicrosoftAccount(tokenResult);
        }
      } catch (err) {
        console.log(err);
        Swal.fire("Oops...", "Ha habido un error inicializando la app", "error");
      }
      if (router.currentRoute.value.path === "/login") router.push("/");
    } else {
      userStore.clearUser();
    }
    loading.value = false;
  });
}

// Función para limpiar el uid de la Coordinadora
function limpiarCoordinadora() {
  localStorage.removeItem("uidCoordinadora");
  localStorage.removeItem("idSqlCoordinadora");
  localStorage.removeItem("uidCoordinadora2");
  localStorage.removeItem("idSqlCoordinadora2");
}

async function loadTiendas() {
  try {
    const resTiendas = await axiosInstance.get("tiendas");
    const tiendaStore = useTiendaStore();

    tiendaStore.setTiendas(resTiendas.data);
  } catch (error) {
    console.error("Error al cargar las tiendas:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las tiendas. Por favor, inténtalo de nuevo más tarde.",
    });
  }
}

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    const rutasQueConservanStorage = [
      "/validar-horas",
      "/vacaciones",
      "/pedir-vacaciones",
      "/cuadrantes-tienda",
    ];

    if (!rutasQueConservanStorage.includes(newPath)) {
      limpiarCoordinadora();
    }
  },
);

// Función para verificar si el usuario ya ha declinado la vinculación
function hasDeclinedMicrosoftLinking(userId: string): boolean {
  try {
    const stored = localStorage.getItem("microsoftLinkDecision");
    if (!stored) return false;

    const decision = JSON.parse(stored);

    // Si hay un usuario específico asociado, verificar que coincida
    if (decision.userId && decision.userId !== userId) {
      return false;
    }

    // Verificar si la decisión es válida (no más antigua de 30 días)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - decision.timestamp > thirtyDaysInMs;

    if (isExpired) {
      // Limpiar decisión expirada
      localStorage.removeItem("microsoftLinkDecision");
      return false;
    }

    return decision.declined === true;
  } catch (error) {
    console.error("Error checking Microsoft link decision:", error);
    return false;
  }
}

// Función para guardar la decisión de no vincular
function saveMicrosoftLinkDecision(userId: string) {
  localStorage.setItem(
    "microsoftLinkDecision",
    JSON.stringify({
      declined: true,
      timestamp: Date.now(),
      userId: userId,
    }),
  );
}

function handleLinkMicrosoftAccount(idTokenResult: IdTokenResult) {
  if (idTokenResult.signInProvider != "password") return;

  // Verificar si el usuario ya ha declinado la vinculación
  const currentUserId = userStore.getUid;
  if (currentUserId && hasDeclinedMicrosoftLinking(currentUserId)) {
    console.log("Usuario ya declinó vincular con Microsoft, no se mostrará el modal");
    return;
  }

  refLinkMicrosoftAccountModal.value?.open();
}

// Función para manejar cuando el usuario cancela/declina la vinculación
function handleCancelLinkMicrosoft() {
  const currentUserId = userStore.getUid;
  if (currentUserId) {
    saveMicrosoftLinkDecision(currentUserId);
    console.log("Decisión de no vincular con Microsoft guardada");
  }
}

onMounted(() => {
  initializeAuthListener();
  initializeFCM();
});
</script>

<style scoped>
.contenido-con-scroll {
  padding-bottom: 100px;
}
</style>
