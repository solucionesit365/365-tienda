<template>
  <div class="row mt-1">
    <div class="d-flex align-items-center gap-2 mt-2 mb-4">
      <span class="fs-6 ms-1 me-1">Semana</span>
      <span class="me-1 fw-bold">{{ punteroFecha!.weekNumber }}</span>
      de {{ punteroFecha!.year }}
      <button
        type="button"
        class="btn btn-primary fw-bold px-3 py-1"
        @click="restarSemana"
        aria-label="Semana anterior"
      >
        -
      </button>
      <button
        type="button"
        class="btn btn-primary fw-bold px-3 py-1"
        @click="sumarSemana"
        aria-label="Semana siguiente"
      >
        +
      </button>
      <button
        type="button"
        class="btn btn-primary fw-bold px-3 py-1"
        @click="buscarKPI"
        aria-label="Buscar"
      >
        Buscar
      </button>
    </div>

    <div class="card-content">
      <div class="card-body">
        <div class="card mt-2 border-top shadow-2">
          <div class="row mt-4 mb-3 px-3">
            <div class="col">
              <button
                type="button"
                class="btn w-100"
                :class="graficosView ? 'colorActive' : 'colorInactive'"
                @click="moveMenu('graficos')"
              >
                GRÁFICOS
              </button>
            </div>
            <div class="col">
              <button
                type="button"
                class="btn w-100"
                :class="datosView ? 'colorActive' : 'colorInactive'"
                @click="moveMenu('datos')"
              >
                PDF
              </button>
            </div>
          </div>
          <div v-if="datosView == true">
            <template v-if="datosPDF.length > 0">
              <div v-for="pdf in datosPDF" :key="pdf._id" class="card mt-3">
                <div class="card-header">
                  <h5>Reporte KPI:</h5>
                  <span>{{ pdf.comentario }}</span>
                </div>
                <div class="card-body">
                  <iframe
                    v-if="pdf.url"
                    :src="pdf.url"
                    width="100%"
                    height="500px"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                  <!-- <div v-else class="row justify-content-center">
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
                            No hay ningún KPI de la semana
                            {{ punteroFecha.weekNumber }}
                          </h4>
                        </figcaption>
                      </figure>
                    </div>
                  </div> -->
                </div>
              </div>
            </template>
            <template v-else>
              <div class="row justify-content-center">
                <div class="col-xl-6 col-xs-12 col-12 col-lg-6 text-center">
                  <figure class="figure">
                    <img
                      src="@/assets/img/nodata.png"
                      class="rounded mx-auto d-block mt-3 img-fluid"
                      alt="..."
                      style="width: 80%"
                    />
                    <figcaption class="figure-caption text-center">
                      <h4>
                        No hay ningún KPI de la semana
                        {{ punteroFecha.weekNumber - 1 }}
                      </h4>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { ref, onMounted, computed } from "vue";
import { obtenerUrlImagen } from "@/components/firebase/storage";
import { axiosInstance } from "@/components/axios/axios";
import { useUserStore } from "@/stores/user";

const useStore = useUserStore();
const punteroFecha = ref(DateTime.now().startOf("week").setLocale("es"));
const graficosView = ref(false);
const datosView = ref(true);
const indicadoresView = ref(false);
interface PdfData {
  _id: string;
  comentario: string;
  ref?: string;
  url?: string;
}

const datosPDF = ref<PdfData[]>([]);
const currentUser = computed(() => useStore.user);
console.log(currentUser.value);
function restarSemana() {
  punteroFecha.value = punteroFecha.value.minus({ days: 7 });
}

function sumarSemana() {
  punteroFecha.value = punteroFecha.value.plus({ days: 7 });
}

function moveMenu(menu: any) {
  switch (menu) {
    case "graficos":
      graficosView.value = true;
      datosView.value = false;
      indicadoresView.value = false;
      break;
    case "datos":
      graficosView.value = false;
      datosView.value = true;
      indicadoresView.value = false;
      break;
    case "indicadores":
      graficosView.value = false;
      datosView.value = false;
      indicadoresView.value = true;
      break;
    default:
      break;
  }
}

async function getPDF() {
  try {
    await axiosInstance
      .get("kpi-tiendas/getKPIS", {
        params: {
          semana: punteroFecha.value.weekNumber,
          año: punteroFecha.value.year,
          tienda: currentUser.value.idTienda,
        },
      })
      .then((response) => {
        if (response.data.ok) {
          datosPDF.value = response.data.data;
          console.log("mostrar archivos");
        } else {
          console.log("error");
        }
      });
  } catch (error) {
    console.log(error);
  }
}

async function mostrarPDF() {
  for (let i = 0; i < datosPDF.value.length; i++) {
    const item = datosPDF.value[i];
    if (item.ref) {
      const url = await obtenerUrlImagen(item.ref);
      item.url = url;
    }
  }
}

async function buscarKPI() {
  await getPDF().then(() => {
    mostrarPDF();
  });
}

onMounted(() => {
  getPDF().then(() => {
    mostrarPDF();
  });
});
</script>

<style>
.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.cardDocs {
  background-color: #ffffff;
}

.colorActive {
  background-color: #e66c5a !important;
  color: #fff !important;
  font-weight: bold;
  border: none;
  box-shadow: 0 2px 8px rgba(230, 108, 90, 0.08);
  transition:
    background 0.2s,
    color 0.2s;
}

.colorInactive {
  background-color: #d7d9e7 !important;
  color: #777 !important;
}

.accordion-button {
  font-weight: bold;
}

.accordion-button:not(.collapsed) {
  background-color: #fff !important;
  color: #212529;
  box-shadow: none;
}

.list-group-item {
  font-size: 1rem;
}
.btn-encargo {
  background-color: #e66c5a !important;
  color: #fff !important;
}

.form-control:focus,
.form-select:focus,
.btn:focus,
.accordion-button:focus {
  box-shadow: 0 0 0 0.2rem #d7d9e7 !important;
  border-color: #d7d9e7 !important;
  outline: none !important;
}
</style>
