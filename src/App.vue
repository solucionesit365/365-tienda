<template>
  <template v-if="!loading">
    <NavComponent v-if="userStore.user.logeado" />
    <div class="container-fluid contenido-con-scroll">
      <BackButton />
      <RouterView />
      <FooterComponent :class="{ 'd-none': hideFooter }" />
    </div>
  </template>
  <template v-else>
    <LoaderComponent class="fondo" />
  </template>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import BackButton from "./components/BackButton.vue";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "@/components/firebase/index.js";
import { useUserStore } from "./stores/user";
import Swal from "sweetalert2";
import { onMounted, ref, watch } from "vue";
import { axiosInstance } from "./components/axios/axios";
import LoaderComponent from "./components/LoaderComponent.vue";
import NavComponent from "./components/NavComponent.vue";
import FooterComponent from "./components/FooterComponent.vue";

const auth = getAuth(app);
const userStore = useUserStore();
const router = useRouter();
const loading = ref(true);
const hideFooter = ref(false);

function antiLag() {
  if (userStore.isLogeado && userStore.getUid) return false;
  else return true;
}

async function initializeAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        if (antiLag()) {
          const sqlUser = await axiosInstance.get("trabajadores/getTrabajadorByAppId", {
            params: { uid: user.uid },
          });

          if (!sqlUser.data.ok) throw Error(sqlUser.data?.message);
          if (!user.email) throw Error("El usuario no tiene un email asociado");

          userStore.setUser({
            uid: user.uid,
            displayName: sqlUser.data.data.displayName,
            email: user.email,
            logeado: true,
            idSql: sqlUser.data.data.id,
            idTienda: sqlUser.data.data.idTienda,
            llevaEquipo: sqlUser.data.data.llevaEquipo,
            nombreTienda: sqlUser.data.data.tienda?.nombre ?? null,
            displayFoto: sqlUser.data.data.displayFoto,
            dni: sqlUser.data.data.dni,
            roles: sqlUser.data.data.roles,
            permissions: sqlUser.data.data.permisos,
          });
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

onMounted(() => {
  initializeAuthListener();
});
</script>

<style scoped>
.contenido-con-scroll {
  padding-bottom: 100px;
}
</style>
