<template>
  <div class="row">
    <div class="col-xl-12 col-sm-12 col-12">
      <div class="card border-top">
        <div class="card-content">
          <div class="card-body">
            <div class="card mt-2 border-top shadow-2">
              <div class="row mt-4 mb-3 px-3">
                <div class="col-md-4">
                  <button
                    type="button"
                    class="btn w-100"
                    :class="graficosView ? 'colorActive' : 'colorInactive'"
                    @click="moveMenu('graficos')"
                  >
                    Gráficos
                  </button>
                </div>
                <div class="col-md-4">
                  <button
                    type="button"
                    class="btn w-100"
                    :class="datosView ? 'colorActive' : 'colorInactive'"
                    @click="moveMenu('datos')"
                  >
                    Datos
                  </button>
                </div>
                <div class="col-md-4">
                  <button
                    type="button"
                    class="btn w-100"
                    :class="indicadoresView ? 'colorActive' : 'colorInactive'"
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
