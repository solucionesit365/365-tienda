<template>
  <div class="row">
    <div class="col-xl-12 col-sm-12 col-12">
      <div class="card border-top">
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
                    size="lg"
                    class="btn-responsive w-100"
                    color="secondary"
                    @click="moveMenu('graficos')"
                  >
                    Gráficos
                  </button>
                </div>
                <div class="col-md-4">
                  <button
                    :class="{
                      colorActive: datosView == true,
                      colorInactive: datosView == false,
                    }"
                    size="lg"
                    class="btn-responsive w-100"
                    color="secondary"
                    @click="moveMenu('datos')"
                  >
                    Datos
                  </button>
                </div>
                <div class="col-md-4">
                  <button
                    :class="{
                      colorActive: indicadoresView == true,
                      colorInactive: indicadoresView == false,
                    }"
                    size="lg"
                    class="btn-responsive w-100"
                    color="secondary"
                    @click="moveMenu('indicadores')"
                  >
                    Indicadores
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" v-if="graficosView">
          <div class="card-header"><h1>En proceso 👨‍💻</h1></div>
        </div>
        <div class="card" v-if="datosView">
          <div class="card-body border-top">
            <DatosPDFComponent ref="DatosPDFRef" />
          </div>
        </div>
        <div class="card" v-if="indicadoresView">
          <div class="card-header"><h1>En proceso 👨‍💻</h1></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { ref, provide, onMounted } from "vue";
import DatosPDFComponent from "@/components/DatosPDF.vue";
import { axiosInstance } from "@/components/axios/axios";

// Variables
const punteroFecha = ref(DateTime.now().startOf("week").setLocale("es"));
const graficosView = ref(false);
const datosView = ref(true);
const indicadoresView = ref(false);
const DatosPDFRef = ref(null);
const tiendas = ref([]);

//Funciones

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

async function getTiendas() {
  try {
    const res = await axiosInstance.get("tiendas");

    tiendas.value = res.data;
  } catch (error) {
    console.log(error);
  }
}

provide("punteroFecha", punteroFecha);
provide("tiendas", tiendas);

onMounted(async () => {
  await getTiendas();
});
</script>

<style scoped>
.colorActive {
  background-color: #ff9800;
  color: black;
  padding: 0.6rem;
}

.colorInactive {
  background-color: #d7d9e7;
  color: rgb(119, 119, 119);
}
</style>
