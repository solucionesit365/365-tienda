<template>
  <!-- <div class="d-inline-flex mt-2 mb-4">
      <span class="fs-6 ms-1 me-1">Semana </span>
      <span class="me-1" style="font-weight: bold"
        >{{ punteroFecha.weekNumber }}
      </span>
      de
      {{ punteroFecha.year }}
      <MDBBtn
        class="btn-responsive"
        size="lg"
        color="secondary"
        @click="restarSemana()"
        >-</MDBBtn
      >
      <MDBBtn
        class="btn-responsive"
        size="lg"
        color="secondary"
        @click="sumarSemana()"
        >+</MDBBtn
      >
      <MDBBtn
        class="btn-responsive"
        size="lg"
        color="primary"
        @click="buscarKPI()"
        >Buscar</MDBBtn
      >
    </div> -->
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row mb-3">
        <div class="col">
          <button
            type="button"
            class="btn w-100"
            :class="datosView ? 'colorActive' : 'colorInactive'"
            @click="moverMenu('PDF')"
          >
            PDF
          </button>
        </div>
        <div class="col">
          <button
            type="button"
            class="btn w-100"
            :class="videosView ? 'colorActive' : 'colorInactive'"
            @click="moverMenu('Video')"
          >
            Video
          </button>
        </div>
      </div>
      <div v-if="datosView == true">
        <template v-if="datosPDF && datosPDF.length > 0">
          <div v-for="pdf in datosPDF" :key="pdf._id" class="card mt-3">
            <div class="card-header">
              <h5>Nota informativa :</h5>
              <span>{{ pdf.titulo }}</span>
            </div>
            <div class="card-body">
              <div v-if="pdf.url && pdf.url.length > 0">
                <iframe
                  v-for="url in pdf.url"
                  :key="url"
                  :src="url"
                  width="100%"
                  height="500px"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
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
                        No hay ninguna nota informativa para la semana
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
                    No hay ninguna nota informativa para la semana
                    {{ punteroFecha.weekNumber }}
                  </h4>
                </figcaption>
              </figure>
            </div>
          </div>
        </template>
      </div>
      <!-- Parte para mostrar los videos en nota informativa como video precargado .mp4  -->
      <div v-else>
        <template v-if="datosVideo && datosVideo.length > 0">
          <div v-for="video in datosVideo" :key="video._id" class="card mt-3">
            <div class="card-header">
              <h5>Nota informativa :</h5>
              <span>{{ video.titulo }}</span>
            </div>
            <div class="card-body">
              <iframe
                v-if="video.url"
                :src="video.url"
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
                        No hay ninguna nota informativa para la semana
                        {{ punteroFecha.weekNumber }}
                      </h4>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { ref, onMounted, computed, type Ref } from "vue";
import { obtenerUrlImagen } from "@/components/firebase/storage";
// import { MDBBtn } from "mdb-vue-ui-kit";
import { axiosInstance } from "@/components/axios/axios";
import { useUserStore } from "@/stores/user";

const punteroFecha = ref(DateTime.now().startOf("week").setLocale("es"));
const datosView = ref(true);
const videosView = ref(false);
const datosPDF: Ref<any[]> = ref([]);
const datosVideo: Ref<any[]> = ref([]);
const userStore = useUserStore();
const currentUser = computed(() => userStore.user);

// function restarSemana() {
//   punteroFecha.value = punteroFecha.value.minus({ days: 7 });
// }

// function sumarSemana() {
//   punteroFecha.value = punteroFecha.value.plus({ days: 7 });
// }

function moverMenu(menu: string) {
  switch (menu) {
    case "PDF":
      datosView.value = true;
      videosView.value = false;
      break;
    case "Video":
      datosView.value = false;
      videosView.value = true;
      break;
    default:
      break;
  }
}

async function getPDF() {
  try {
    await axiosInstance
      .get("notas-informativas/getNotasInformativas", {
        params: {
          idTienda: currentUser.value.idTienda,
        },
      })
      .then((response) => {
        if (response.data.ok) {
          datosPDF.value = response.data.data.filter((item: any) => item.categoria === "pdf");
          datosVideo.value = response.data.data.filter((item: any) => item.categoria === "video");
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
  if (!datosPDF.value) {
    return;
  }
  if (!datosVideo.value) {
    return;
  }

  for (let i = 0; i < datosPDF.value.length; i++) {
    const item = datosPDF.value[i];
    if (item.pdfNotainformativa) {
      if (typeof item.pdfNotainformativa === "string") {
        // Si es una cadena, procesar como cadena
        const url = await obtenerUrlImagen(item.pdfNotainformativa);
        item.url = [url];
      } else if (Array.isArray(item.pdfNotainformativa)) {
        // Si es un array, procesar cada elemento
        const urls = await Promise.all(
          item.pdfNotainformativa.map((ruta: any) => obtenerUrlImagen(ruta)),
        );
        item.url = urls;
      } else {
        console.error("pdfNotainformativa no es ni un string ni un array.");
      }
    }
  }

  for (let i = 0; i < datosVideo.value.length; i++) {
    const item2 = datosVideo.value[i];
    if (typeof item2.pdfNotainformativa === "string") {
      const url = await obtenerUrlImagen(item2.pdfNotainformativa);
      item2.url = [url];
    } else if (Array.isArray(item2.pdfNotainformativa)) {
      const urls = await Promise.all(
        item2.pdfNotainformativa.map((ruta: any) => obtenerUrlImagen(ruta)),
      );
      item2.url = urls;
    } else {
      console.error("pdfNotainformativa en video no es ni un string ni un array.");
    }
  }
}

onMounted(() => {
  getPDF().then(() => {
    mostrarPDF();
  });
});
</script>

<style scoped>
.colorIconGreen {
  background-color: #63ceb0;
  color: white;
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
