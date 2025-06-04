<template>
  <h3 class="mt-4">
    Hola, {{ currentUser.displayName }}
    <span v-if="currentUser.roles.some((role) => role.name === 'Coordinadora_A')">
      , {{ currentUser.idSql }}
    </span>
  </h3>

  <span style="color: #243746">Bienvenido al portal 365</span>

  <!-- Diseño Home para escritorio y tabletas -->
  <div class="d-none d-sm-none d-md-block mb-8">
    <div class="row row-cols-2 justify-content-center mt-4">
      <ItemMenuDesktop color="#EF5350" titulo="Cultura" icono="fas fa-atlas" link="/videoCultura" />
      <ItemMenuDesktop
        v-if="!hasPermission('ModoTienda')"
        color="#3381bd"
        titulo="Cuadrantes"
        icono="fas fa-clock"
        link="/cuadrantes-tienda"
      />

      <ItemMenuDesktop
        color="#eb7fed"
        titulo="Tablón de anuncios"
        icono="far fa-flag"
        link="/anuncios"
      />

      <ItemMenuDesktop
        v-if="hasPermission('verMiTienda') || llevoEquipo"
        color="#ab6634"
        titulo="Mi tienda"
        icono="fas fa-store"
        link="/menuMiTienda"
      />

      <ItemMenuDesktop
        color="#648fe0"
        titulo="Necesito ayuda"
        icono="fas fa-question-circle"
        link="/chat"
      />
    </div>
  </div>

  <!-- Diseño Home para movil -->
  <div class="d-block d-sm-block d-md-none mb-8">
    <div class="row row-cols-3 justify-content-center mt-4">
      <ItemMenuMobile color="#EF5350" titulo="Cultura" icono="fas fa-atlas" link="/videoCultura" />
      <ItemMenuMobile
        v-if="!hasPermission('ModoTienda')"
        color="#3381bd"
        titulo="Cuadrante"
        icono="fas fa-clock"
        link="/cuadrantes-tienda"
      />

      <ItemMenuMobile
        color="#eb7fed"
        titulo="Tablón de anuncios"
        icono="far fa-flag"
        link="/anuncios"
      />

      <ItemMenuMobile
        v-if="hasPermission('verMiTienda') || llevoEquipo"
        color="#ab6634"
        titulo="Mi tienda"
        icono="fas fa-store"
        link="/menuMiTienda"
      />

      <ItemMenuMobile
        color="#648fe0"
        titulo="Necesito ayuda"
        icono="fas fa-question-circle"
        link="/chat"
      />
    </div>
  </div>

  <!-- Modal con Bootstrap 5 -->
  <!-- <div
    class="modal fade"
    id="modalInfo"
    tabindex="-1"
    aria-labelledby="modalInfoLabel"
    aria-hidden="true"
    ref="modalInfoRef"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-body" style="font-size: 1rem">
          <div v-html="mensaje"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Entendido</button>
        </div>
      </div>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { computed } from "vue";
// import Swal from "sweetalert2";
import ItemMenuDesktop from "@/components/ItemMenuDesktop.vue";
import ItemMenuMobile from "@/components/ItemMenuMobile.vue";
// import { axiosInstance } from "@/components/axios/axios";
// import { DateTime } from "luxon";
import { hasPermission } from "@/components/rolesPermisos";
import { useUserStore } from "@/stores/user";
// import { Modal } from "bootstrap";

const userStore = useUserStore();
// const modalInfo = ref(false);
// const modalInfoRef = ref<HTMLElement | null>(null);
// const modalInstance = ref<Modal | null>(null);
// const datos = ref([]);
// const datos2 = ref([]);
// const mensaje = ref(null);
const llevoEquipo = userStore.$state.user.llevaEquipo;
const currentUser = computed(() => userStore.user);

defineEmits(["update:user", "toggleFooter"]);

// // Función para abrir el modal
// const openModal = async () => {
//   await nextTick();
//   if (modalInfoRef.value && !modalInstance.value) {
//     modalInstance.value = new Modal(modalInfoRef.value);
//   }
//   modalInstance.value?.show();
// };

// // Función para cerrar el modal
// const closeModal = () => {
//   modalInstance.value?.hide();
//   modalInfo.value = false;
// };

// async function getDistribucionMensajes() {
//   try {
//     const response = await axiosInstance.get("distribucion-mensajes/getOneMessage");

//     if (response.data.data) {
//       const hoy = DateTime.now().startOf("day");
//       const fechaInicio = DateTime.fromISO(response.data.data.fechaInicio).startOf("day");
//       const fechaFin = DateTime.fromISO(response.data.data.fechaFin).startOf("day");

//       // Comparar solo las fechas (sin horas)
//       if (hoy >= fechaInicio && hoy <= fechaFin) {
//         mensaje.value = response.data.data.mensaje;
//         modalInfo.value = true;
//         await openModal();
//       }
//     }
//   } catch (error) {
//     console.log("Error al obtener el mensaje:", error);
//   }
// }

// async function getUserNewsletter() {
//   try {
//     const idsql = currentUser.value.idSql;

//     // Obtener la fecha actual
//     const hoy = new Date();
//     const añoActual = hoy.getFullYear();

//     // Revisar si ya se confirmó el Swal este año
//     const swalConfirmedKey = `swalConfirmed_${añoActual}`;
//     const isSwalConfirmed = localStorage.getItem(swalConfirmedKey);

//     const respGetIdPerfil = await axiosInstance.get("trabajadores/getTrabajadorBySqlId", {
//       params: {
//         id: idsql,
//       },
//     });
//     const respgetAnuncios = await axiosInstance.get("anuncios");

//     if (respGetIdPerfil.data.ok || respgetAnuncios.data.ok) {
//       datos.value = respGetIdPerfil.data.data;
//       datos2.value = respgetAnuncios.data.data;

//       // Revisar si hay algún anuncio con categoría 'Newsletter' y manejar la caducidad
//       const tieneNewsletter: any = datos2.value
//         ? datos2.value.filter((anuncio: any) => anuncio.categoria === "Newsletter")
//         : false;

//       // Borrar localStorage si el anuncio ha caducado
//       if (tieneNewsletter && tieneNewsletter.length > 0) {
//         tieneNewsletter.forEach((anuncio: any) => {
//           const fechaCaducidad = new Date(anuncio.caducidad);
//           if (hoy >= fechaCaducidad) {
//             localStorage.removeItem(swalConfirmedKey);
//           }
//         });
//       }

//       if (!isSwalConfirmed && tieneNewsletter.length > 0) {
//         // Mostrar Swal si hay anuncios con la categoría de Newsletter
//         Swal.fire({
//           icon: "info",
//           text: "¡Hola equipo! Ya está disponible la newsletter del mes",
//           confirmButtonText: "OK",
//         }).then((result) => {
//           if (result.isConfirmed) {
//             // Marcar el Swal como confirmado en el localStorage
//             localStorage.setItem(swalConfirmedKey, "true");
//           }
//         });
//       }
//     } else {
//       datos.value = [];
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// onMounted(() => {
//   getDistribucionMensajes();
//   getUserNewsletter();
// });
</script>

<style lang="scss" scoped>
/* CSS para aplicar en tu archivo de estilos */
.background-element {
  /* Estilos base para el elemento con fondo */
  background-image: url("https://pixabay.com/es/images/download/christmas-tree-1867135_640.jpg");
  background-size: cover !important; /* Cubre el área disponible sin perder las proporciones */
  background-position: center !important; /* Centra la imagen en el elemento */
  background-repeat: no-repeat !important; /* No repetir la imagen */
  width: 100% !important; /* Ocupa el 100% del ancho del contenedor */
  height: 100% !important; /* Ocupa el 100% del alto del contenedor */
}

/* Media queries para tamaños de pantalla específicos */
@media (max-width: 767px) {
  /* Para dispositivos móviles */
  .background-element {
    background-size: contain !important; /* La imagen se ajustará dentro del contenedor */
    background-repeat: no-repeat !important; /* No repetir la imagen */
    background-position: center center !important; /* Centrar la imagen en el contenedor */
    height: auto !important; /* Altura automática para asegurar que la imagen se muestre entera */
    min-height: 300px !important; /* Establece una altura mínima para el contenedor */
  }
}

@media (min-width: 768px) {
  /* Para dispositivos de escritorio */
  .background-element {
    height: 500px !important; /* Altura fija para escritorio, ajusta según tus necesidades */
  }
}
</style>
