<template>
  <div class="row mt-3">
    <div class="col-xl-12 col-sm-6 col-12">
      <div class="card border border-top">
        <div class="card-content">
          <div class="card-body">
            <div v-if="kpisTiendas.length != 0">
              <div class="row">
                <div class="col-2" v-for="(kpi, index) in kpisTiendas" v-bind:key="index">
                  <div class="card mb-3" style="width: 18rem" shadow="0" bg="white">
                    <div class="card-body" text="success">
                      <h5 class="card-title">{{ kpi.nombreTienda.toUpperCase() }}</h5>
                    </div>
                    <div class="card-footer" bg="transparent">
                      <button @click="mostrarPDF(kpi)" color="primary" floating class="float-end">
                        <i class="fa-solid fa-file-pdf"></i>
                      </button>
                      <button @click="eliminarFile(kpi)" color="danger" floating class="float-end">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                      No hay ningún KPI cargado de la semana
                      {{ punteroFecha!.weekNumber }}
                    </h4>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal"
    tabindex="-1"
    id="modalDatos"
    labelledby="modalDatosTitle"
    staticBackdropS
    centered
    scrollable
    fullscreen
  >
    <div class="modal-header">
      <h5 class="modal-title" id="modalDatosTitle">
        KPI Tienda
        {{ kpiTiendaMostrar.nombreTienda.toUpperCase() }}
      </h5>
    </div>
    <div class="modal-body">
      <iframe
        v-if="kpiTiendaMostrar.url"
        :src="kpiTiendaMostrar.url"
        width="100%"
        height="100%"
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
                {{ punteroFecha!.weekNumber }}
              </h4>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button color="secondary" @click="modalDatos = false">Cancelar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import { watchEffect } from "vue";
import { borrarArchivo, obtenerUrlImagen } from "@/components/firebase/storage";
import Swal from "sweetalert2";

interface PunteroFecha {
  weekNumber: number;
  year: number;
}

const punteroFecha = inject<PunteroFecha>("punteroFecha");
const tiendas = inject("tiendas") as { id: number; nombre: string }[] | undefined;
interface KpiTienda {
  tienda: number;
  nombreTienda: string;
  ref?: string;
  url?: string;
}

const kpisTiendas = ref<KpiTienda[]>([]);
const modalDatos = ref(false);
const kpiTiendaMostrar = ref<KpiTienda>({ tienda: 0, nombreTienda: "", ref: "", url: "" });

watchEffect(() => {
  if (tiendas && tiendas.length > 0) {
    kpisTiendas.value = [];
    getAllKPIs();
  }
});

function getAllKPIs() {
  try {
    kpisTiendas.value = [];
    axiosInstance
      .get("kpi-tiendas/getAllKPIs", {
        params: {
          semana: punteroFecha?.weekNumber,
          año: punteroFecha?.year,
        },
      })

      .then((resp) => {
        if (resp.data.ok) {
          resp.data.data.map((kpi: any) => {
            for (let index = 0; index < tiendas!.length; index++) {
              const element = tiendas![index];
              if (element.id == kpi.tienda) {
                kpi.nombreTienda = element.nombre;
                kpisTiendas.value.push(kpi);
              }
            }
          });
        }
      });
  } catch (error) {
    console.log(error);
  } finally {
    kpisTiendas.value = [];
  }
}

//eliminar KPI en mongo y Storage
function eliminarFile(kpiTienda: any) {
  Swal.fire({
    title: "Estas segur@?",
    text: "No podrás recuperarla!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, borrar!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      axiosInstance.post("kpi-tiendas/borrarKpiTienda", kpiTienda).then(async (response) => {
        if (response.data.ok) {
          kpisTiendas.value = [];
          borrarArchivo(kpiTienda.ref);

          Swal.fire({
            icon: "success",
            title: "Perfecto",
            text: `KPI borrado`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          await getAllKPIs();
        }
      });
    }
  });
}

async function mostrarPDF(kpi: any) {
  if (kpi.ref) {
    const url = await obtenerUrlImagen(kpi.ref);
    kpi.url = url;
    kpiTiendaMostrar.value = kpi;
    modalDatos.value = true;
  }
}
</script>

<style scoped>
.cardDocs {
  background-color: #fafafa;
}

.roundIcon {
  background-color: #c6f5d5;
}
</style>
