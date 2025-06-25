<template>
  <div class="card">
    <div class="card-header">
      <h6 class="fs-5">
        <i @click="restarSemana()" class="fas fa-angles-left"></i>
        SEMANA
        {{ semanaActual.weekNumber }}
        <i @click="sumarSemana()" class="fas fa-angles-right"></i>
      </h6>
    </div>
    <div v-if="loading" class="row text-center mt-2">
      <div>
        <div class="spinner-border" role="status" style="width: 5rem; height: 5rem"></div>
        <h4>CARGANDO DATOS...</h4>
      </div>
    </div>
    <template v-else>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered table-hover table-striped align-middle resumen-table">
            <thead class="fw-bold">
              <tr>
                <th class="sticky-column nombre">
                  {{ nombreTiendaActual }}
                </th>
                <th scope="col" v-for="(_, index) in 7" v-bind:key="index" class="wider-col">
                  {{ semanaActual.plus({ days: index }).toFormat(" EEEE dd/MM/y") }}
                </th>
                <th>Total</th>
                <th>Contrato</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trabajador in datos" :key="trabajador.idTrabajador">
                <td class="sticky-column nombre">{{ trabajador.nombre }}</td>

                <td
                  v-for="(horas, index) in trabajador.horasDiarias"
                  :key="index"
                  :class="{ horasAprendiz: trabajador.esAprendizPorDia[index] }"
                >
                  <span
                    v-if="
                      trabajador.arrayValidados[index]?.[0] &&
                      trabajador.arrayValidados[index][0].cuadrante.idTienda !==
                        trabajador.arrayValidados[index][0].idTienda
                    "
                  >
                    ({{ nombreTienda(trabajador.arrayValidados[index][0].cuadrante.idTienda) }}
                    {{ horas || "-" }})
                  </span>
                  <span v-else-if="trabajador.esAprendizPorDia[index]"> ({{ horas }}) </span>
                  <span v-else>
                    {{ horas || "-" }}
                  </span>
                </td>

                <td>{{ calcularTotal(trabajador) }}</td>
                <td>
                  {{ trabajador.contrato }}
                </td>
              </tr>
            </tbody>

            <tfoot>
              <tr>
                <td>TOTAL</td>
                <td v-for="totalDia in totalesFormato" :key="totalDia.fecha">
                  {{ totalDia.total }}
                </td>
                <td>{{ totalSemana }}</td>
                <!-- <td>{{ contratoSemanal }}</td> -->
                <td></td>
              </tr>
              <tr>
                <td>PACTADO</td>

                <td v-for="totalDia in totalesFormato" :key="totalDia.fecha">
                  {{ totalDia.pactado }}
                </td>
                <td>{{ totalPactado }}</td>
                <td></td>
              </tr>
              <tr>
                <td>DIFERENCIA</td>

                <!-- Espacio para el total del contrato que no tiene diferencia -->
                <td
                  v-for="totalDia in totalesFormato"
                  :key="totalDia.fecha"
                  :class="{
                    'bg-red': totalDia.diferencia != 0,
                    'bg-green': totalDia.diferencia == 0,
                  }"
                >
                  {{ totalDia.diferencia }}
                </td>
                <!-- Calcula la suma de todas las diferencias para la semana -->
                <td
                  :class="{
                    'bg-red': diferenciaTotalSemana != 0,
                    'bg-green': diferenciaTotalSemana == 0,
                  }"
                >
                  {{ diferenciaTotalSemana }}
                </td>
                <td></td>
                <!-- <td>{{ contratoSemanal - totalPactado }}</td> -->
              </tr>
              <tr>
                <td>VALIDADO</td>
                <td v-for="(validada, index) in validado" v-bind:key="index">
                  <span v-if="validada"><i class="far fa-smile-wink text-success fs-3"></i></span>
                  <span @click="jesus()" v-else
                    ><i class="far fa-sad-tear text-danger fs-3"></i
                  ></span>
                </td>
                <th></th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref, defineEmits } from "vue";
import { DateTime } from "luxon";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const emit = defineEmits(["cambiarMenu"]);
const userStore = useUserStore();
const semanaActual = ref(DateTime.now().startOf("week").setLocale("es"));
// const fechaInicioUTC = semanaActual.value.toJSDate().toISOString();
const actualizarFechaInicio = () => {
  return semanaActual.value.startOf("week").toJSDate().toISOString();
};
const loading = ref(true);
const totalSemana: Ref<any> = ref();
const totalesFormato: Ref<any[]> = ref([]);
const contratoSemanal: Ref<any> = ref();
const datos: Ref<any[]> = ref([]);
const arrayIds: Ref<any[]> = ref([]);
const validado: Ref<any[]> = ref([]);
const currentUser = computed(() => userStore.user);
const totalPactado = ref(0);
const arrayTiendas: Ref<any[]> = ref([]);
const nombreTiendaActual = ref("");

function restarSemana() {
  semanaActual.value = semanaActual.value.minus({ weeks: 1 });
  getResumenSemanal();
}

function sumarSemana() {
  semanaActual.value = semanaActual.value.plus({ weeks: 1 });
  getResumenSemanal();
}

const diferenciaTotalSemana = computed(() => {
  return totalesFormato.value.reduce((sum, current) => sum + current.diferencia, 0);
});

function jesus() {
  Swal.fire({
    title: "Fichajes Pendientes de validar ",
    text: "Tienes fichajes pendientes de validar, quieres ir a validarlos?",
    icon: "warning",
    showCancelButton: false,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí",
    cancelButtonText: "No",
  }).then((result) => {
    if (result.isConfirmed) {
      emit("cambiarMenu", "validar");
    }
  });
}

// Calcula los totales por día y totales semanales
const calcularTotales = () => {
  const totalesDias = Array(7).fill(0);
  const diferencias = Array(7).fill(0);
  const pactado = Array(7).fill(0);

  datos.value.forEach((trabajador) => {
    trabajador.horasDiarias.forEach((horasFichaje: any, index: any) => {
      const esAprendiz = trabajador.esAprendizPorDia[index];
      const diaValidado = trabajador.arrayValidados[index]?.[0];
      const horasCuadrante = diaValidado ? diaValidado.cuadrante.totalHoras : 0;
      const idTiendaDiferente =
        diaValidado && diaValidado.cuadrante.idTienda !== diaValidado.idTienda;

      if (horasFichaje !== null && !esAprendiz && !idTiendaDiferente) {
        totalesDias[index] += horasFichaje;
        pactado[index] += horasCuadrante;
        diferencias[index] += horasFichaje - horasCuadrante;
      }
    });
  });

  totalSemana.value = totalesDias.reduce((acc, curr) => acc + curr, 0);
  contratoSemanal.value = datos.value.reduce((acc, curr) => acc + curr.horasContrato, 0);
  totalPactado.value = pactado.reduce((acc, curr) => acc + curr, 0);

  totalesFormato.value = totalesDias.map((total, index) => {
    return {
      fecha: semanaActual.value.plus({ days: index }).toFormat("dd/MM/y"),
      total,
      diferencia: diferencias[index],
      pactado: pactado[index],
    };
  });
};

function isSameDay(stringFecha1: any, stringFecha2: any) {
  const date1 = DateTime.fromISO(stringFecha1);
  const date2 = DateTime.fromISO(stringFecha2);

  return date1.year === date2.year && date1.month === date2.month && date1.day === date2.day;
}

function getDiaDeLaSemana(index: any) {
  return semanaActual.value.plus({ days: index });
}

function adjuntarHorasDiariasTrabajador(trabajador: any, indexDia: any) {
  if (trabajador.cuadrante.length === 0) return 0;

  const diaDeLaSemana = getDiaDeLaSemana(indexDia);

  for (let i = 0; i < trabajador.cuadrante.length; i += 1) {
    if (isSameDay(diaDeLaSemana, DateTime.fromISO(trabajador.cuadrante[i].inicio))) {
      return trabajador.cuadrante[i].totalHoras;
    }
  }
  return 0;
}

//Posible solucion correcta para printar las horas fichaje
async function getResumenSemanal() {
  try {
    loading.value = true;
    const fechaInicioUTC = actualizarFechaInicio();
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || currentUser.value.uid;

    const resResumen = await axiosInstance.get("pactado-vs-real", {
      params: {
        uid: uidParaConsultar,
        fechaInicio: fechaInicioUTC,
      },
    });

    if (resResumen.data.ok) {
      const idTienda = resResumen.data.idTienda;
      nombreTiendaActual.value = nombreTienda(idTienda);
      datos.value = resResumen.data.data.map((trabajador: any) => {
        trabajador.horasDiarias = trabajador.horasDiarias || [];

        // Agregar información sobre si es aprendiz en un día específico
        trabajador.esAprendizPorDia = trabajador.arrayValidados.map(
          (dia: any) => dia.length > 0 && dia[0].aprendiz,
        );

        // Calcular horas de fichaje para cada día
        const horasDiarias = [0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 7; i += 1) {
          if (trabajador.arrayValidados[i].length > 0) {
            horasDiarias[i] = trabajador.arrayValidados[i].reduce((total: any, entrada: any) => {
              const horasFichaje = Math.max(0, entrada.horasFichaje || 0);
              const horasExtra = Math.max(0, entrada.horasExtra || 0);
              return total + horasFichaje + horasExtra;
            }, 0);
          } else {
            horasDiarias[i] = adjuntarHorasDiariasTrabajador(trabajador, i);
          }
        }

        trabajador.horasDiarias = horasDiarias;

        return trabajador;
      });

      await fichajesPendientes();
      calcularTotales();
      loading.value = false;
    } else {
      throw new Error("No se ha podido cargar el resumen semanal");
    }
  } catch (error) {
    loading.value = false;
    console.error("Error en getResumenSemanal: ", error);
  }
}

async function fichajesPendientes() {
  arrayIds.value = datos.value.map((objeto) => objeto.idTrabajador);
  try {
    const fechaInicioUTC = actualizarFechaInicio();
    const resFichajes = await axiosInstance.post("fichajes/hayFichajesPendientes", {
      arrayIds: arrayIds.value,
      fecha: fechaInicioUTC,
    });
    validado.value = resFichajes.data;
  } catch (error) {
    console.log(error);
  }
}

async function getTiendas() {
  try {
    const resTiendas = await axiosInstance.get("tiendas");

    arrayTiendas.value = resTiendas.data;
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

function nombreTienda(idTienda: any) {
  for (let index = 0; index < arrayTiendas.value.length; index++) {
    if (arrayTiendas.value[index].id == idTienda) {
      return arrayTiendas.value[index].nombre;
    }
  }
}

function calcularTotal(trabajador: any) {
  if (!Array.isArray(trabajador.horasDiarias)) {
    // Si horasDiarias no es un array, devuelve 0
    return 0;
  }

  return trabajador.horasDiarias.reduce((total: any, horas: any, index: any) => {
    if (!trabajador.esAprendizPorDia[index]) {
      return total + (horas || 0);
    }
    return total;
  }, 0);
}

onMounted(async () => {
  await getTiendas().then(() => {
    getResumenSemanal();
  });
});
</script>
<style lang="scss" scoped>
.card-header {
  background-color: #ffffff;
  font-size: 1rem;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.horasAprendiz {
  color: purple;
}

.sticky-column {
  position: sticky;
  left: 0;
  background-color: #6c757d !important; // Bootstrap gray
  color: white;
  z-index: 10;
}

.sticky-column.nombre {
  font-weight: bold;
  max-width: 200px;
}

.sticky-column.horasContrato {
  left: 5.5rem; /* El valor de 'left' es igual al ancho de la primera columna fija */
}

//Responsive table
table tbody {
  font-size: 0.8rem !important;
}

table {
  width: 100%;
  font-size: 0.85rem;
}

tbody tr:hover {
  background-color: #f6f9fc;
}

thead th {
  background-color: #f8f9fa; // Bootstrap light
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
}

tfoot td {
  background-color: #f1f1f1;
  font-weight: 600;
}

th:first-child,
td:first-child {
  color: white;
  font-weight: bold;
  background: #747d7a;
}

td,
th {
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
  background-color: white;
}

.bg-red {
  background-color: #e06969; /* Rojo para valores negativos o no validados */
}

.bg-green {
  background-color: #80e480; /* Verde para valores positivos o validados */
}
</style>
