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
        color="#3381bd"
        titulo="Cuadrantes"
        icono="fas fa-clock"
        link="/cuadrantes-tienda"
      />
      <ItemMenuDesktop
        v-if="hasPermission('ModoTienda')"
        color="rgb(253 102 102)"
        titulo="Validar horas"
        icono="fas fa-clipboard-list"
        @click="authCoordi('Validar horas')"
        link="#"
      />
      <ItemMenuDesktop
        v-if="hasPermission('VerKPI')"
        color="#14babd"
        titulo="KPI"
        icono="fas fa-chart-line"
        link="/kpiTiendaIndex"
      />

      <ItemMenuDesktop
        v-if="hasPermission('ModoTienda')"
        color="#14babd"
        titulo="Vacaciones"
        icono="fas fa-luggage-cart"
        @click="authCoordi('vacaciones')"
        link="#"
      />

      <ItemMenuDesktop
        color="#00BFA5"
        titulo="Auditorias"
        icono="fas fa-list-ol"
        link="/auditorias-tienda"
      />
      <ItemMenuDesktop
        color="#137cc8"
        titulo="Videos Formación"
        icono="fas fa-film"
        link="/videoFormacion"
      />
      <ItemMenuDesktop
        color="#05c2d5"
        titulo="Notas informativas"
        icono="fas fa-circle-info"
        link="/notasInformativas"
      />
      <ItemMenuDesktop
        color="#994ef4"
        titulo="Calendario de Pluses"
        icono="far fa-calendar-alt"
        link="/calendarioFestivos"
      />

      <ItemMenuDesktop
        color="#4425e3"
        titulo="Encargos"
        icono="fas fa-list-ol"
        link="/encargosview"
      />
      <ItemMenuDesktop
        v-if="hasPermission('ModoTienda')"
        color="#13e669"
        titulo="Reposición"
        icono="fas fa-truck-moving"
        link="#"
        @click="repocision()"
      />
      <ItemMenuDesktop
        color="#13e669"
        titulo="Color semanal"
        icono="fas fa-palette"
        link="/colorSemanal"
      />

      <ItemMenuDesktop
        color="#eb7fed"
        titulo="Tablón de anuncios"
        icono="far fa-flag"
        link="/anuncios"
      />

      <ItemMenuDesktop
        color="#648fe0"
        titulo="Necesito ayuda"
        icono="fas fa-question-circle"
        link="/abrir-incidencia"
      />
    </div>
  </div>

  <!-- Diseño Home para movil -->
  <div class="d-block d-sm-block d-md-none mb-8">
    <div class="row row-cols-3 justify-content-center mt-4">
      <ItemMenuMobile color="#EF5350" titulo="Cultura" icono="fas fa-atlas" link="/videoCultura" />
      <ItemMenuMobile
        color="#3381bd"
        titulo="Cuadrantes"
        icono="fas fa-clock"
        link="/cuadrantes-tienda"
      />

      <ItemMenuMobile
        v-if="hasPermission('ModoTienda')"
        color="rgb(253 102 102)"
        titulo="Validar horas"
        icono="fas fa-clipboard-list"
        @click="authCoordi('Validar horas')"
        link="#"
      />
      <ItemMenuMobile
        v-if="hasPermission('VerKPI')"
        color="#14babd"
        titulo="KPI"
        icono="fas fa-chart-line"
        link="/kpiTiendaIndex"
      />

      <ItemMenuMobile
        v-if="hasPermission('ModoTienda')"
        color="#14babd"
        titulo="Vacaciones"
        icono="fas fa-luggage-cart"
        @click="authCoordi('vacaciones')"
        link="#"
      />

      <ItemMenuMobile
        color="#00BFA5"
        titulo="Auditorias"
        icono="fas fa-list-ol"
        link="/auditorias-tienda"
      />
      <ItemMenuMobile
        color="#137cc8"
        titulo="Videos Formación"
        icono="fas fa-film"
        link="/videoFormacion"
      />
      <ItemMenuMobile
        color="#05c2d5"
        titulo="Notas informativas"
        icono="fas fa-circle-info"
        link="/notasInformativas"
      />
      <ItemMenuMobile
        color="#994ef4"
        titulo="Calendario de Pluses"
        icono="far fa-calendar-alt"
        link="/calendarioFestivos"
      />

      <ItemMenuMobile
        color="#4425e3"
        titulo="Encargos"
        icono="fas fa-list-ol"
        link="/encargosview"
      />
      <ItemMenuMobile
        v-if="hasPermission('ModoTienda')"
        color="#13e669"
        titulo="Reposición"
        icono="fas fa-truck-moving"
        link="#"
        @click="repocision()"
      />
      <ItemMenuMobile
        color="#13e669"
        titulo="Color semanal"
        icono="fas fa-palette"
        link="/colorSemanal"
      />

      <ItemMenuMobile
        color="#eb7fed"
        titulo="Tablón de anuncios"
        icono="far fa-flag"
        link="/anuncios"
      />

      <ItemMenuMobile
        color="#648fe0"
        titulo="Necesito ayuda"
        icono="fas fa-question-circle"
        link="/abrir-incidencia"
      />
    </div>
  </div>

  <!-- Modal con Bootstrap 5 -->
  <div
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
  </div>

  <!-- Modal para reposición -->
  <div
    class="modal fade"
    id="reposicionModal"
    tabindex="-1"
    aria-labelledby="reposicionModalLabel"
    aria-hidden="true"
    ref="reposicionModalRef"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Reposición</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <iframe
            :src="reposicionUrl"
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal para validar código de empleado -->
  <div
    class="modal fade"
    id="codigoEmpleadoModal"
    tabindex="-1"
    aria-labelledby="codigoEmpleadoModalLabel"
    aria-hidden="true"
    ref="codigoEmpleadoModalRef"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Introducir Código de Empleado</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row justify-content-center">
            <div class="col-12 col-xl-6 col-md-6">
              <h4 class="text-center mt-3">
                Ingresa tu código de empleado
                <span
                  class="tooltip-icon"
                  title="Puedes encontrar tu código de empleado en tu apartado principal."
                  style="color: #007bff; cursor: pointer; margin-left: 5px"
                >
                  <i class="fas fa-info-circle"></i>
                </span>
              </h4>
              <div class="input-group mt-4">
                <input id="inputCodigo" type="text" class="form-control" v-model="codigoEmpleado" />
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-center mb-3">
          <button
            type="button"
            class="btn btn-success custom-button"
            @click="validarCodigoEmpleado"
          >
            VALIDAR
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Fin del modal para validar código de empleado -->
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from "vue";
import Swal from "sweetalert2";
import ItemMenuDesktop from "@/components/ItemMenuDesktop.vue";
import ItemMenuMobile from "@/components/ItemMenuMobile.vue";
import { axiosInstance } from "@/components/axios/axios";
import { DateTime } from "luxon";
import { hasPermission } from "@/components/rolesPermisos";
import { useUserStore } from "@/stores/user";
import { Modal } from "bootstrap";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const modalInfo = ref(false);
const modalInfoRef = ref<HTMLElement | null>(null);
const modalInstance = ref<Modal | null>(null);
const mensaje = ref(null);
const currentUser = computed(() => userStore.user);
const reposicionModal = ref(false);
const reposicionModalRef = ref(null);
const reposicionUrl = ref("");
const tiendas = ref<{ value: number; text: string; idExterno: string } | null>(null);
const codigoEmpleado = ref("");
const accionPendiente = ref("");
const uidCoordinadora = ref(null);
const idsqlCoordinadora = ref(null);
const codigoEmpleadoModal = ref(false);
const codigoEmpleadoModalRef = ref(null);
const codigoEmpleadoModalInstance = ref<Modal | null>(null);
const reposicionModalInstance = ref<Modal | null>(null);
const router = useRouter();

defineEmits(["update:user", "toggleFooter"]);

// Función para abrir el modal
const openModal = async () => {
  await nextTick();
  if (modalInfoRef.value && !modalInstance.value) {
    modalInstance.value = new Modal(modalInfoRef.value);
  }
  modalInstance.value?.show();
};

// Función para cerrar el modal
const closeModal = () => {
  modalInstance.value?.hide();
  modalInfo.value = false;
};

async function getDistribucionMensajes() {
  try {
    const response = await axiosInstance.get("distribucion-mensajes/getOneMessage");

    if (response.data.data) {
      const hoy = DateTime.now().startOf("day");
      const fechaInicio = DateTime.fromISO(response.data.data.fechaInicio).startOf("day");
      const fechaFin = DateTime.fromISO(response.data.data.fechaFin).startOf("day");

      // Comparar solo las fechas (sin horas)
      if (hoy >= fechaInicio && hoy <= fechaFin) {
        mensaje.value = response.data.data.mensaje;
        modalInfo.value = true;
        await openModal();
      }
    }
  } catch (error) {
    console.log("Error al obtener el mensaje:", error);
  }
}

async function authCoordi(accion: any) {
  accionPendiente.value = accion;
  console.log(accionPendiente.value);

  codigoEmpleado.value = "";
  codigoEmpleadoModal.value = true;

  await nextTick();
  if (!codigoEmpleadoModalInstance.value && codigoEmpleadoModalRef.value) {
    codigoEmpleadoModalInstance.value = new Modal(codigoEmpleadoModalRef.value);
  }
  codigoEmpleadoModalInstance.value?.show();
}

// Validar código del empleado en el backend
async function validarCodigoEmpleado() {
  if (!codigoEmpleado.value) {
    Swal.fire("Error", "Debe ingresar un código de empleado", "error");
    return;
  }
  // Mostrar loading
  Swal.fire({
    title: "Validando...",
    text: "Por favor, espere",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await axiosInstance.post("trabajadores/validarCodigo", {
      codigoEmpleado: codigoEmpleado.value,
    });
    Swal.close();

    if (response.data.ok) {
      const usuario = response.data.usuario;

      if (usuario.rol === "Coordinadora_A") {
        uidCoordinadora.value = usuario.uid;
        idsqlCoordinadora.value = usuario.idsql;
        localStorage.setItem("uidCoordinadora", usuario.uid);
        localStorage.setItem("idSqlCoordinadora", usuario.idSql);

        Swal.fire("Acceso concedido", "Redirigiendo...", "success").then(() => {
          if (accionPendiente.value === "Validar horas") {
            router.push("/validar-horas");
          }
          if (accionPendiente.value === "vacaciones") {
            router.push("/vacaciones");
          }
        });
      } else {
        Swal.fire("Acceso denegado", "No tienes permisos", "error");
      }
    } else {
      Swal.fire("Código incorrecto", response.data.message, "error");
    }
  } catch (error) {
    Swal.fire("Error", "Hubo un problema en la validación", "error");
    console.log(error);
  }
}

async function repocision() {
  if (tiendas.value) {
    reposicionUrl.value = `https://hitsystems.cloud/TpvWebReposicion.asp?modo=MENU&codiBotiga=${tiendas.value.idExterno}`;
    reposicionModal.value = true;
    await nextTick();
    if (!reposicionModalInstance.value && reposicionModalRef.value) {
      reposicionModalInstance.value = new Modal(reposicionModalRef.value);
    }
    reposicionModalInstance.value?.show();

    console.log(tiendas.value.idExterno);
  }
}

//Obtener el idExterno de las tiendas
function getTiendas() {
  axiosInstance
    .get("tiendas")
    .then((resTiendas) => {
      resTiendas.data.map((tienda: any) => {
        if (currentUser.value.idTienda == tienda.id) {
          tiendas.value = {
            value: tienda.id,
            text: tienda.nombre,
            idExterno: tienda.idExterno,
          };
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

onMounted(() => {
  getDistribucionMensajes();
  getTiendas();
});
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

.custom-button {
  border-radius: 30px;
  padding: 0.5rem 2rem;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.custom-button:hover {
  filter: brightness(1.1);
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
