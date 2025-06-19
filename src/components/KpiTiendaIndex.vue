<template>
  <div class="row mt-1">
    <div class="d-inline-flex mt-2 mb-4">
      <span class="fs-6 ms-1 me-1">Semana </span>
      <span class="me-1" style="font-weight: bold">{{ punteroFecha.weekNumber - 1 }} </span>
      de
      {{ punteroFecha.year }}
      <button class="btn" color="secondary" @click="restarSemana()">-</button>
      <button class="btn" color="secondary" @click="sumarSemana()">+</button>
      <button class="btn" color="primary" @click="buscarKPI()">Buscar</button>
    </div>

    <div class="card-content">
      <div class="card-body">
        <div class="card mt-2 border-top shadow-2">
          <div class="row mt-1 mb-1">
            <div class="col-md-4">
              <button
              :class="{
                colorActive: graficosView == true,
                colorInactive: graficosView == false,
              }"
              type="button"
              class="btn w-100"
              @click="moveMenu('graficos')"
              >Gráficos</button
            >
            </div>
            <div class="col-md-4">
              <button
                :class="{
                  colorActive: datosView == true,
                  colorInactive: datosView == false,
                }"
                class="btn w-100"
                color="secondary"
                @click="moveMenu('datos')"
                >PDF</button
              >
            </div>
            <div class="col-md-4">
              <button
                :class="{
                  colorActive: indicadoresView == true,
                  colorInactive: indicadoresView == false,
                }"
                class="btn w-100"
                color="secondary"
                @click="moveMenu('indicadores')"
                >Indicadores</button
              >
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
                  <div v-else class="row justify-content-center">
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
                  </div>
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
          semana: punteroFecha.value.weekNumber - 1,
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
.colorActive {
  background-color: #e66c5a;
  color: black;
  padding: 0.6rem;
}

.colorInactive {
  background-color: #d7d9e7;
  color: rgb(119, 119, 119);
}
</style>
