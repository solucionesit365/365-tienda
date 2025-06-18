<template>
 <div v-if="mostrarAudis" class="row mt-3">
    <div class="col-12 col-sm-12 col-xl-12">
      <div class="card border-top border-5">
        <div class="card-header">
          <div class="row">
            <div class="col">
              <button
                class="w-100"
                :class="{
                  colorActive: verMisAuditorias == true,
                  colorInactive: verMisAuditorias == false,
                }"
                @click="
                  verMisAuditorias = true;
                  cargarAuditorias();
                "
              >
                Auditorias
              </button>
            </div>
            <div class="col" v-if="hasPermission('VerResumenAuditoria')">
              <button
                class="w-100"
                :class="{
                  colorActive: verMisAuditorias == false,
                  colorInactive: verMisAuditorias == true,
                }"
                @click="
                  verMisAuditorias = false;
                  respuestasAuditorias();
                "
              >
                Resumen
              </button>
            </div>
          </div>
        </div>
        <div class="card-body" v-if="verMisAuditorias">
          <div class="row justify-content-center mt-2">
            <div
              v-for="(audi, index) in auditorias"
              v-bind:key="index"
              class="col-xl-4 col-xs-12 col-12 col-lg-4"
            >
              <template v-if="audi.habilitado">
                <div class="card p-2 mb-2">
                  <div class="card-body">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex flex-row align-items-center">
                        <div class="icon">
                          <i class="fas fa-clipboard-list" />
                        </div>
                        <div class="ms-2 c-details">
                          <h6 class="mb-0">{{ audi.tituloAuditoria }}</h6>
                          <span class="text-muted"
                            >Caduca: {{ parseFecha2(audi.caducidad).toFormat("dd/LL/y") }}</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="row mt-4">
                      <div class="col-12">{{ audi.descripcion }}</div>
                    </div>
                  </div>
                  <div class="card-footer text-end">
                    <button @click="responderAuditoria(audi)" color="success"> Responder </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div v-if="!hayResultados" class="text-center">
            <figure class="figure">
              <img
                src="@/assets/img/nodata.png"
                class="rounded mx-auto d-block mt-3 img-fluid"
                alt="..."
                style="width: 80%"
              />
              <figcaption class="figure-caption text-center">
                No hay Auditorias disponibles
              </figcaption>
            </figure>
          </div>
        </div>
        <!-- Mostrar Resumen Auditorias -->
        <template v-else>
          <div v-if="hasPermission('VerResumenAuditoria')" class="mt-1 p-3">
            <div class="d-flex justify-content-end">
              <button
                class="btn-danger"
                @click="
                  respuestaSeleccionada = 'NO';
                  respuestasAuditorias();
                "
                ><i class="fas fa-times"></i
              ></button>
              <button
                class="btn-success"
                @click="
                  respuestaSeleccionada = 'SI';
                  respuestasAuditorias();
                "
                ><i class="far fa-circle"></i
              ></button>
            </div>
            <table id="tabla" class="table align-middle bg-white mt-2 p-2" responsive>
              <thead class="bg-light align-items-center">
                <tr>
                  <th>Tienda</th>
                  <th v-for="(item, index) in fechasUnicas" :key="index">
                    {{ item }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(item, index) in tiendaUnica" :key="index">
                  <tr>
                    <td data-th="Tienda">{{ item }}</td>
                    <td v-for="(fecha, index) in fechasUnicas" :key="index" :data-th="fecha">
                      <span
                        :class="{
                          'celda-gris': !getRespuesta(fecha, respuestaSeleccionada),
                        }"
                      >
                        {{ getRespuesta(fecha, respuestaSeleccionada) || "-" }}
                      </span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
  </div>

  <ResponderAuditoriaComponent
    v-if="auditoriaSeleccionada"
    v-show="mostrarResponderAuditoria"
    ref="modalResponderAuditoriaRef"
    :key="auditoriaSeleccionada._id"
    @cerrar-responder-auditoria="cerrarResponderAuditoria"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from "vue";
import ResponderAuditoriaComponent from "@/components/ResponderAuditoria.vue";
import { axiosInstance } from "@/components/axios/axios";
import { nextTick } from "vue";
import { DateTime } from "luxon";
import { hasPermission } from "@/components/rolesPermisos";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const auditorias: Ref<any[]> = ref([]);
const mostrarAudis = ref(true);
const mostrarResponderAuditoria = ref(false);
const hayResultados = ref(true);
const respuestaSeleccionada = ref("SI");
const modalResponderAuditoriaRef: Ref<any> = ref(null);
const auditoriaSeleccionada: Ref<any> = ref(null);
const verMisAuditorias = ref(true);
const respuestas: Ref<any> = ref();
const tiendas: Ref<any[]> = ref([]);
const respuestaEval: Ref<any> = ref();
const respuestaPers: Ref<any> = ref();
const currentUser = computed(() => userStore.user);
const fechasUnicas = computed(() => {
  //Usar un Set para almacenar fechas únicas y no se dupliquen
  const fechasSet = new Set();
  if (respuestas.value) {
    respuestas.value.forEach((item: any) => {
      const fecha = stringADate(item.ultimaRespuesta);
      if (esDelMesActual(fecha) || esDeLaSemanaActual(fecha || esDelYearActual(fecha))) {
        fechasSet.add(item.ultimaRespuesta);
      }
    });
  }
  return [...fechasSet];
});

const tiendaUnica = computed(() => {
  const tiendaSet = new Set();
  if (respuestas.value) {
    respuestas.value.forEach((item: any) => {
      tiendaSet.add(item.tienda);
    });
  }
  return [...tiendaSet];
});

//Convertir la fecha a un string
function stringADate(fechaString: any) {
  const [dia, mes, ano] = fechaString.split("/");
  return new Date(+ano, +mes - 1, dia);
}

//Comprobar que la fecha sea del mes actual
function esDelMesActual(date: any) {
  const ahora = new Date();
  return date.getMonth() === ahora.getMonth() && date.getFullYear() === ahora.getFullYear();
}

//Comprobar que la fecha sea de la semana actual
function esDeLaSemanaActual(date: any) {
  const ahora = new Date();
  const diaDeLaSemana = ahora.getDay();
  const inicioSemana = new Date(ahora.setDate(ahora.getDate() - diaDeLaSemana));
  const finSemana = new Date(ahora.setDate(ahora.getDate() - diaDeLaSemana + 6));
  return date >= inicioSemana && date <= finSemana;
}

//Comprobar que la fecha sea del año actual
function esDelYearActual(date: any) {
  const ahora = new Date();
  return date.getFullYear() === ahora.getFullYear();
}

function cargarAuditorias() {
  const idTienda = currentUser.value.idTienda;
  axiosInstance
    .get("auditorias/getAuditoriasTienda", {
      params: {
        tienda: idTienda,
        habilitado: true,
      },
    })
    .then((response) => {
      const data = response.data;
      if (data.ok && data.data.length > 0) {
        auditorias.value = data.data;
      } else {
        hayResultados.value = false;
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function responderAuditoria(auditoria: any) {
  auditoriaSeleccionada.value = auditoria;
  mostrarAudis.value = false;
  mostrarResponderAuditoria.value = true;
  //Espera que acabe de renderizar el dom del padre
  nextTick(() => {
    if (modalResponderAuditoriaRef.value)
      modalResponderAuditoriaRef.value.responderAuditoria(auditoria);
  });
}

function respuestasAuditorias() {
  axiosInstance
    .get("auditorias/getAuditoriasTiendas", {
      params: {
        tienda: currentUser.value.idTienda,
      },
    })
    .then((res) => {
      if (res.data.ok) {
        respuestas.value = res.data.data;
        respuestaEval.value = countAuditoriaRedondasFecha(respuestas.value);
        respuestaPers.value = countAuditoriaRedondasFecha2(respuestas.value);
        respuestas.value.forEach((element: any) => {
          tiendas.value.forEach((tienda) => {
            if (tienda.id == element.tienda) {
              element.tienda = tienda.nombre;
            }
          });
        });
      }
    })
    .catch((error) => {
      console.error("Hubo un error al obtener las auditorias:", error);
    });
}

function countAuditoriaRedondasFecha(data: any) {
  const conteoPorFecha: any = {};

  data.forEach((item: any) => {
    const fecha = item.ultimaRespuesta;
    const respuestasEvaluador = item.respuestasEvaluador;

    if (!conteoPorFecha[fecha]) {
      conteoPorFecha[fecha] = { SI: 0, NO: 0 };
    }

    // Recorrer las respuestas del evaluador
    for (const respuesta in respuestasEvaluador) {
      if (["SI", "NO"].includes(respuestasEvaluador[respuesta])) {
        conteoPorFecha[fecha][respuestasEvaluador[respuesta]]++;
      }
    }
  });
  // respuestasAuditorias();
  return conteoPorFecha;
}

function getRespuesta(fecha: any, seleccion: any) {
  if (seleccion === "SI") {
    return respuestaEval.value[fecha]["SI"];
  } else {
    return respuestaPers.value[fecha]["NO"];
  }
}

function countAuditoriaRedondasFecha2(data: any) {
  const conteoPorFecha: any = {};

  data.forEach((item: any) => {
    const fecha = item.ultimaRespuesta;
    const respuestasPersona = item.respuestas;

    if (!conteoPorFecha[fecha]) {
      conteoPorFecha[fecha] = { SI: 0, NO: 0 };
    }

    // Recorrer las respuestas del que responde

    for (const respuesta in respuestasPersona) {
      if (["SI", "NO"].includes(respuestasPersona[respuesta])) {
        conteoPorFecha[fecha][respuestasPersona[respuesta]]++;
      }
    }
  });
  return conteoPorFecha;
}

function cerrarResponderAuditoria() {
  mostrarAudis.value = true;
  mostrarResponderAuditoria.value = false;
}

async function getTiendas() {
  try {
    const res = await axiosInstance.get("tiendas");

    tiendas.value = res.data;
  } catch (error) {
    console.log(error);
  }
}

function parseFecha2(fecha: any) {
  if (!fecha) {
    return DateTime.now(); // O cualquier otro valor por defecto
  }

  if (typeof fecha === "string" && fecha.includes("/")) {
    // Formato DD/MM/YYYY
    const [day, month, year] = fecha.split("/");
    return DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else if (fecha instanceof Date) {
    // Si fecha es un objeto Date
    return DateTime.fromJSDate(fecha);
  } else {
    // Formato ISO
    return DateTime.fromISO(fecha);
  }
}

onMounted(async () => {
  cargarAuditorias();
  await getTiendas();
  respuestasAuditorias();
});
</script>

<style scoped>
.card {
  border-radius: 1em;
  border: 1em;
  border-top-color: #03a9f4 !important;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}
.card-detalles {
  border-radius: 1em;
  border: 1em;
  border-top-color: #57a791 !important;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.colorActive {
  background-color: #ff9800;
  color: black;
  padding: 0.6rem;
}

.colorInactive {
  background-color: #d7d9e7;
  color: rgb(119, 119, 119);
}

.colorIconGreen {
  background-color: #63ceb0;
  color: white;
}

.c-details span {
  font-weight: 300;
  font-size: 13px;
}

.icon {
  width: 45px;
  height: 45px;
  background-color: #eee;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #16d39a
}

.table tbody {
  font-size: 0.8rem !important;
}
table {
  width: 100%;
  border-spacing: 3px;
  border-collapse: separate;
}

th:first-child,
td:first-child {
  color: rgb(0, 0, 0);
  font-weight: bold;
  background: #f5b95e;
}

th,
td {
  padding: 0.3em;
  text-align: center;
  background: white;
}

.celda-gris {
  background-color: #616161 !important;
}

@media screen and (max-width: 640px) {
  thead {
    display: none;
  }

  td {
    display: block;
    position: relative;
    padding-left: 50%;
    margin-bottom: 3px;
    text-align: right;

    &:first-child {
      font-weight: bold;
    }

    &:before {
      content: attr(data-th);
      position: absolute;
      top: 0.75em;
      left: 0.75em;
      width: 50%;
      font-weight: inherit;
      text-align: left;
    }
  }
}
</style>
