<template>
  <div class="card mb-1">
    <div class="card-header">
      <h6 class="fs-5">
        <i @click="restarSemana()" class="fas fa-angles-left"></i>
        SEMANA
        {{ semanaActual.weekNumber }}
        <i @click="sumarSemana()" class="fas fa-angles-right"></i>
        <BsButton
          class="ms-4"
          outline
          id="button-addon1"
          :ripple="{ color: 'dark' }"
          @click="consultarHorasAPagar()"
        >
          Consultar
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
    await getSubordinados();
    getFichajesPagar();
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
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

<style scoped></style>
