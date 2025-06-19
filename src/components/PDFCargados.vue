<template>
  <div class="row mt-3">
    <div class="col-xl-12 col-sm-6 col-12">
      <div class="card border border-top">
        <div class="card-content">
          <div class="card-body">
            <div v-if="kpisTiendas.length != 0">
              <div class="row">
                <div
                  class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                  v-for="(kpi, index) in kpisTiendas"
                  :key="index"
                >
                  <div class="card shadow-sm rounded-4 h-100 border-0">
                    <div class="card-body pb-2">
                      <h5 class="card-title fw-bold text-center py-2 mb-3">
                        {{ kpi.nombreTienda.toUpperCase() }}
                      </h5>
                    </div>
                    <div class="card-footer bg-white border-0 d-flex justify-content-end gap-2">
                      <button
                        @click="mostrarPDF(kpi)"
                        class="btn btn-primary btn-sm"
                        title="Ver PDF"
                      >
                        <i class="fa-solid fa-file-pdf"></i>
                      </button>
                      <button
                        @click="eliminarFile(kpi)"
                        class="btn btn-danger btn-sm"
                        title="Eliminar"
                      >
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

  <!-- ✅ MODIFICADO: Modal visible con v-if y clases forzadas -->
  <div
    v-if="modalDatos"
    class="modal fade show d-block"
    tabindex="-1"
    id="modalDatos"
    style="background-color: rgba(0, 0, 0, 0.5);"
    labelledby="modalDatosTitle"
    centered
    scrollable
    fullscreen
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalDatosTitle">
            KPI Tienda
            {{ kpiTiendaMostrar.nombreTienda.toUpperCase() }}
          </h5>
          <button class="btn-close" @click="modalDatos = false"></button>
        </div>
        <div class="modal-body">
          <iframe
            v-if="kpiTiendaMostrar.url"
            :src="kpiTiendaMostrar.url"
            width="100%"
            height="600px"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <div v-else class="text-center">
            <img
              src="@/assets/img/nodata.png"
              class="rounded mx-auto d-block mt-3 img-fluid"
              alt="..."
              style="width: 70%"
            />
            <h4>No hay ningún KPI de la semana {{ punteroFecha!.weekNumber }}</h4>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="modalDatos = false">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import { watchEffect } from "vue";
import { borrarArchivo, obtenerUrlImagen } from "@/components/firebase/storage";
import Swal from "sweetalert2";

interface PunteroFecha {
  weekNumber: number;
  year: number;
}
const punteroFecha = inject<Ref<PunteroFecha>>("punteroFecha");
const tiendas = inject<Ref<{ id: number; nombre: string }[]>>("tiendas");

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
  if (tiendas && tiendas.value.length > 0) {
    getAllKPIs();
  }
});

function getAllKPIs() {
  try {
    kpisTiendas.value = [];
    axiosInstance
      .get("kpi-tiendas/getAllKPIs", {
        params: {
          semana: punteroFecha?.value.weekNumber,
          año: punteroFecha?.value.year,
        },
      })
      .then((resp) => {
        if (resp.data.ok) {
          resp.data.data.map((kpi: any) => {
            for (let index = 0; index < tiendas!.value.length; index++) {
              const element = tiendas!.value[index];
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
  }
}

// Eliminar KPI
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

// Mostrar PDF en modal
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
.card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px rgba(230, 108, 90, 0.07);
  border: none;
}
.card-footer {
  background: #fff !important;
  border-top: none !important;
}
.card-title {
  font-size: 1.15rem;
  color: black;
  border-bottom: 3px solid #e66c5a;
  letter-spacing: 1px;
}
</style>
