<template>
  <div class="card mb-1 card-transparent">
    <div class="card-header">
      <h6 class="fs-5">
        <i @click="restarSemana()" class="fas fa-angles-left"></i>
        SEMANA
        {{ semanaActual.weekNumber }}
        <i @click="sumarSemana()" class="fas fa-angles-right"></i>
        <BsButton
          class="ms-4 buttonConsultar"
          outline
          id="button-addon1"
          :disabled="loading"
          :ripple="{ color: 'dark' }"
          @click="consultarHorasAPagar()"
        >
          CONSULTAR
        </BsButton>
      </h6>
    </div>
  </div>

  <!-- Select de tiendas -->
  <div class="row">
    <div class="col-12 mb-2">
      <label for="selectTienda">Seleccionar Tienda</label>
      <select id="selectTienda" v-model="tiendaSeleccionada" class="form-select">
        <option value="">Ver todo</option>
        <option v-for="tienda in tiendasDisponibles" :key="tienda" :value="tienda">
          {{ tienda }}
        </option>
      </select>
    </div>
  </div>

  <div class="row" v-if="!loading">
    <div
      v-for="(item, index) in datosFiltrados"
      v-bind:key="index"
      class="col-12 col-sm-12 col-xl-4 col-md-4 mb-2"
    >
      <div v-if="!item.validado" class="card border border-warning">
        <div class="card-header">
          <div class="row">
            <div class="col-6">
              {{ parseFecha2(item.fichajeEntrada).toFormat("dd-LL-y") }}
            </div>
            <div class="col-6 text-end">Semana {{ obtenerNumeroSemana(item.fichajeEntrada) }}</div>
          </div>
        </div>
        <div class="card-body">
          <div>{{ item.nombre }}</div>
          Cuadrante:
          <span
            v-if="
              item.cuadrante &&
              item.cuadrante.inicio &&
              item.cuadrante.final &&
              item.cuadrante.inicio !== item.cuadrante.final
            "
          >
            {{ parseFecha(item.cuadrante.inicio ? item.cuadrante.inicio : item.cuadrante.entrada) }}
            -
            {{ parseFecha(item.cuadrante.final ? item.cuadrante.final : item.cuadrante.salida) }}
            ({{ item.horasCuadrante }})
          </span>
          <span class="text-warning" v-else>SIN CUADRANTE DEFINIDO</span>
          <br />
          Fichaje:
          <span v-if="item.fichajeEntrada">{{ parseFecha(item.fichajeEntrada) }}</span>
          <span v-else class="text-danger">ENTRADA NO FICHADA</span> -
          <span v-if="item.fichajeSalida">{{ parseFecha(item.fichajeSalida) }}</span>
          <span v-else class="text-danger"><i class="fas fa-exclamation-circle"></i></span>
          <span v-if="item.fichajeEntrada && item.fichajeSalida">({{ item.horasFichaje }})</span>
        </div>
        <div class="card-footer">
          <div class="row">
            <div class="col-6">
              <BsButton outline id="button-addon1" :ripple="{ color: 'dark' }">
                {{ item.horasFichaje + item.horasExtra + item.horasCoordinacion }}
              </BsButton>
              <span v-if="item.comentario.entrada">{{ item.comentario.entrada }}</span>
              <span v-else>{{ item.comentario.salida }}</span>
              <span v-if="!item.comentario.entrada && !item.comentario.salida">App</span>
            </div>
            <div class="col-6">
              <div v-if="item.horasPagar.estadoValidado == 'PENDIENTE'" class="text-end">
                <BsButton @click="revisarSoli(item)" color="info">
                  A pagar: {{ item.horasPagar.total }}H
                </BsButton>
              </div>
              <div v-if="item.horasPagar.estadoValidado == 'RECHAZADAS'" class="text-end">
                <BsButton @click="revisarSoli(item)" color="danger">
                  no: {{ item.horasPagar.total }}H
                </BsButton>
              </div>
              <div v-if="item.horasPagar.estadoValidado == 'APROBADAS'" class="text-end">
                <BsButton @click="revisarSoli(item)" color="success">
                  pagado: {{ item.horasPagar.total }}H
                </BsButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="datos.length <= 0" class="row justify-content-center">
      <div class="col-xl-6 col-xs-12 col-12 col-lg-6 text-center">
        <figure class="figure">
          <img
            src="@/assets/img/nodata.png"
            class="rounded mx-auto d-block mt-3 img-fluid"
            alt="..."
            style="width: 70%"
          />
          <figcaption class="figure-caption text-center">
            <h4>
              No hay fichajes pendientes de pago de la semana
              {{ semanaActual.weekNumber }}
            </h4>
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
  <div v-else class="d-flex justify-content-center mt-3">
    <div class="spinner-border" role="status" style="width: 5rem; height: 5rem">
      <span class="visually-hidden">Cargando...</span>
    </div>
  </div>

  <!-- Modal editar horas -->
  <div
    v-if="tarjetaRevision"
    class="modal fade"
    id="modalRevisarSoli"
    tabindex="-1"
    aria-labelledby="modalRevisarSoliTitle"
    aria-hidden="true"
    :class="{ show: modalRevisarSoli }"
    :style="{ display: modalRevisarSoli ? 'block' : 'none' }"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalRevisarSoliTitle">Horas a pagar</h5>
          <button
            type="button"
            class="btn-close"
            @click="modalRevisarSoli = false"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="text-start">
            COORDINADOR/A: <br />
            <span class="text-muted">{{ tarjetaRevision.horasPagar.comentario }}</span>
          </div>
          <div class="text-end">
            SUPERVISOR/A: <br />
            <span class="text-muted">{{ tarjetaRevision.horasPagar.respSuper }}</span>
            <br />
            <span
              v-if="tarjetaRevision.horasPagar.estadoValidado == 'PENDIENTE'"
              class="badge bg-warning text-dark"
            >
              PENDIENTE
            </span>
            <span
              v-if="tarjetaRevision.horasPagar.estadoValidado == 'APROBADAS'"
              class="badge bg-success"
            >
              APROBADAS
            </span>
          </div>
        </div>
        <div class="modal-footer">
          <BsButton color="secondary" @click="modalRevisarSoli = false">Cancelar</BsButton>
          <BsButton
            v-if="tarjetaRevision.horasPagar.estadoValidado == 'PENDIENTE'"
            @click="enviarPropuesta('APROBADAS')"
            color="success"
          >
            aprobar
          </BsButton>
          <BsButton
            v-if="tarjetaRevision.horasPagar.estadoValidado == 'PENDIENTE'"
            @click="enviarPropuesta('RECHAZADAS')"
            color="danger"
          >
            rechazar
          </BsButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, type Ref } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { DateTime } from "luxon";
import BsButton from "@/components/365/BsButton.vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const currentUser = computed(() => userStore.user);
const arraySubordinados: Ref<any[]> = ref([]);
const datos: Ref<any[]> = ref([]);
const loading = ref(false);
const tarjetaRevision: Ref<any> = ref(null);
const modalRevisarSoli = ref(false);
const semanaActual: Ref<DateTime> = ref(DateTime.now().startOf("week").setLocale("es"));

// Variables para el filtrado de tiendas
const tiendaSeleccionada = ref(""); // Nueva variable para almacenar la tienda seleccionada
const tiendasDisponibles: Ref<any[]> = ref([]); // Nueva variable para almacenar las tiendas disponibles

// Computed para filtrar los datos según la tienda seleccionada
const datosFiltrados = computed(() => {
  if (!tiendaSeleccionada.value) {
    return datos.value; // Si no hay tienda seleccionada, mostrar todo
  }
  return datos.value.filter((item: any) => item.comentario.entrada === tiendaSeleccionada.value);
});

// Función para obtener las tiendas disponibles de los datos
function actualizarTiendasDisponibles() {
  const tiendas = new Set();
  datos.value.forEach((item: any) => {
    if (item.comentario.entrada) {
      tiendas.add(item.comentario.entrada);
    }
  });
  tiendasDisponibles.value = Array.from(tiendas);
}

function obtenerNumeroSemana(fechaISO: string) {
  const fecha = DateTime.fromISO(fechaISO);
  return fecha.weekNumber;
}

function parseFecha(fecha: any) {
  let dt;
  if (!fecha) {
    dt = DateTime.now();
  } else if (fecha.includes("/")) {
    const [day, month, year] = fecha.split("/");
    dt = DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else {
    dt = DateTime.fromISO(fecha);
  }
  return dt.toFormat("HH:mm");
}

function parseFecha2(fecha: any) {
  if (!fecha) {
    return DateTime.now();
  }
  if (fecha.includes("/")) {
    const [day, month, year] = fecha.split("/");
    return DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else {
    return DateTime.fromISO(fecha);
  }
}

async function getSubordinados() {
  arraySubordinados.value = [];
  try {
    const subordinados = await axiosInstance.get("trabajadores/getSubordinados", {
      params: {
        uid: currentUser.value.uid,
      },
    });
    if (subordinados.data.ok) {
      arraySubordinados.value = subordinados.data.data;
    } else throw Error("No tienes personas a tu cargo");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function getFichajesPagar() {
  datos.value = [];
  loading.value = true;
  const uniqueIds = new Set();
  uniqueIds.add(currentUser.value.idSql);
  arraySubordinados.value.forEach((subordinado) => {
    uniqueIds.add(subordinado.id);
  });
  const promises = Array.from(uniqueIds).map(async (idResponsable) => {
    try {
      const respConsulta = await axiosInstance.get("/fichajes-validados/getFichajesPagar", {
        params: {
          idResponsable: idResponsable,
          aPagar: true,
          fecha: semanaActual.value.toFormat("yyyy-MM-dd"),
        },
      });
      return respConsulta.data.ok ? respConsulta.data.data : [];
    } catch (error) {
      console.error("Error al obtener fichajes para pagar:", error);
      return [];
    }
  });
  const resultados = await Promise.all(promises);
  resultados.forEach((resultado) => {
    datos.value.push(...resultado);
  });
  actualizarTiendasDisponibles(); // Actualiza las tiendas disponibles
  loading.value = false;
}

function revisarSoli(item: any) {
  modalRevisarSoli.value = true;
  tarjetaRevision.value = item;
}

function restarSemana() {
  semanaActual.value = semanaActual.value.minus({ weeks: 1 });
}

function sumarSemana() {
  semanaActual.value = semanaActual.value.plus({ weeks: 1 });
}

async function consultarHorasAPagar() {
  try {
    loading.value = true;
    await getSubordinados();
    getFichajesPagar();
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  } finally {
    loading.value = false;
  }
}
async function guardarCambios() {
  try {
    const respEnvio = await axiosInstance.post(
      "/fichajes-validados/actualizarValidados",
      tarjetaRevision.value,
    );
    if (respEnvio) {
      Swal.fire(
        "Perfecto...",
        "Tu propuesta ha sido enviada. Tu supervisora la revisará para autorizar",
        "success",
      );
      Swal.fire("Perfecto!", "Solicitud actualizada", "success");
      modalRevisarSoli.value = false;
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function enviarPropuesta(estadoValidado: any) {
  if (estadoValidado == "APROBADAS") {
    Swal.fire({
      title: "Estás segura?",
      text: `Estas por aprobar el pago de ${tarjetaRevision.value.horasPagar.total}H de ${tarjetaRevision.value.nombre}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, aprobar!",
    }).then((result) => {
      if (result.isConfirmed) {
        modalRevisarSoli.value = false;
        tarjetaRevision.value.horasPagar.estadoValidado = "APROBADAS";
        guardarCambios().then(() => {
          getFichajesPagar();
        });
      }
    });
  } else {
    const { value: text } = await Swal.fire({
      input: "textarea",
      inputLabel: "Motivo",
      inputPlaceholder: "Escribe un motivo...",
      inputAttributes: {
        "aria-label": "Escribe un motivo",
      },
      showCancelButton: true,
    });

    if (text) {
      tarjetaRevision.value.horasPagar.estadoValidado = "RECHAZADAS";
      tarjetaRevision.value.horasPagar.respSuper = text;
      guardarCambios().then(() => {
        getFichajesPagar();
      });
    }
  }
}

onMounted(async () => {
  try {
    await getSubordinados();
    getFichajesPagar();
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
});
</script>

<style scoped>
.card-transparent {
  background-color: transparent !important;
  border: 1px solid #e0e0e0; /* Opcional, puedes quitarlo */
  border-radius: 0.5rem;
}
.card-header {
  background-color: #ffffff;
  font-size: 1rem;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.card-footer {
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

.btn-info {
  color: #ffffff;
  background: #54b4d3;
}

.buttonConsultar:hover {
  background-color: transparent;
}
.btn-warning {
  color: #ffffff;
  background: #e4a11b;
}
.btn-outline-primary {
  padding: 0.5rem 1.2rem;
  border: 2px solid;
}
.buttonConsultar {
  color: #14a44d;
  font-size: 0.8rem;
}
.buttonConsultar:hover {
  background-color: transparent;
  color: #14a44d;
}

.modal {
  background: rgba(0, 0, 0, 0.35);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  overflow-y: auto;
  padding: 1.5rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.modal-dialog {
  margin: 0 auto;
  max-width: 650px;
  width: 95vw;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  background: transparent;
  display: flex;
  flex-direction: column;
}

.modal-content {
  border-radius: 1rem;
  border: none;
  background: #fff;
  box-shadow: 0 4px 24px rgba(230, 108, 90, 0.1);
  animation: modalIn 0.25s;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

@keyframes modalIn {
  from {
    transform: translateY(40px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff !important;
  opacity: 1;
  margin-left: 1rem;
  position: relative;
  transition:
    background 0.2s,
    color 0.2s;
}

.btn-close::before {
  content: "✕";
  font-size: 1.5rem;
  color: #fff;
  line-height: 1;
  font-weight: bold;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.btn-close:hover,
.btn-close:focus {
  background: rgba(230, 108, 90, 0.15);
  color: #fff;
  outline: none;
}

.modal-body {
  padding: 1.5rem;
  background: #fafbfc;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  overflow-y: auto;
  flex: 1 1 auto;
}

.modal-footer {
  border-top: 1px solid #e0e0e0;
  background: #f7f7f7;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .modal-dialog {
    max-width: 98vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.8rem !important;
    padding: 0 !important;
  }
  .modal-header {
    border-top-left-radius: 0.8rem !important;
    border-top-right-radius: 0.8rem !important;
    padding: 1.1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.15rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2.1rem;
    height: 2.1rem;
    font-size: 1.2rem;
    margin-left: 0.7rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.8rem 0.8rem !important;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 600px) {
  .modal-dialog {
    max-width: 99vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.7rem !important;
    padding: 0 !important;
  }
  .modal-header {
    border-top-left-radius: 0.7rem !important;
    border-top-right-radius: 0.7rem !important;
    padding: 1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.1rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
    margin-left: 0.5rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.7rem 0.7rem !important;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
}

@media (max-width: 400px) {
  .modal-title {
    font-size: 1rem;
  }
  .modal-header {
    padding: 0.7rem !important;
  }
  .modal-body,
  .modal-footer {
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }
}
</style>
