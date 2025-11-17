<template>
  <div class="row mt-3">
    <div class="col-12">
      <div class="card border-top">
        <div class="card-content">
          <div class="card-body">
            <div v-if="cargandoNotas" class="row text-center mt-2">
              <div><BsSpinner style="width: 5rem; height: 5rem" /></div>
            </div>
            <div v-if="datosPDFRef.length !== 0">
              <div class="row g-3">
                <div
                  class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"
                  v-for="(notasInformativas, index) in datosPDFRef"
                  :key="index"
                >
                  <div class="card nota-card shadow-sm border-0 h-100">
                    <div class="card-body d-flex flex-column">
                      <div class="d-flex align-items-start mb-2">
                        <div
                          class="nota-icon rounded-circle d-flex align-items-center justify-content-center me-2"
                        >
                          <i class="fa-solid fa-file-pdf"></i>
                        </div>
                        <div class="flex-grow-1">
                          <span class="text-muted small d-block mb-1">
                            {{ getTypeFiles(notasInformativas) }}
                          </span>
                          <h6
                            class="mb-0 text-truncate nota-title"
                            :title="notasInformativas.titulo"
                          >
                            {{ notasInformativas.titulo }}
                          </h6>
                        </div>
                      </div>

                      <div class="align-items-right mt-auto d-flex justify-content-end">
                        <BsButton
                          @click="mostrarPDF(notasInformativas)"
                          color="primary"
                          size="sm"
                          floating
                          title="Ver PDF"
                        >
                          <i class="fa-solid fa-eye"></i>
                        </BsButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="row justify-content-center">
              <div class="col-12 col-sm-10 col-md-8 col-lg-6 text-center">
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
      </div>
    </div>
  </div>

  <BsModal
    id="modalDatos"
    tabindex="-1"
    labelledby="modalDatosTitle"
    v-model="modalDatos"
    staticBackdropS
    centered
    scrollable
    fullscreen
  >
    <BsModalHeader>
      <BsModalTitle id="modalDatosTitle">
        Nota informativa
        {{ notasInformativasMostrar?.titulo }}
      </BsModalTitle>
      <button
        type="button"
        class="btn-close"
        @click="modalDatos = false"
        aria-label="Close"
      ></button>
    </BsModalHeader>
    <BsModalBody>
      <div v-if="notasInformativasMostrar?.url">
        <div
          v-for="(url, index) in notasInformativasMostrar.url.split(',')"
          :key="index"
          class="mb-3"
        >
          <iframe
            v-if="url"
            :src="url"
            width="100%"
            height="600px"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <div v-else class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 text-center">
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
    </BsModalBody>
    <BsModalFooter>
      <BsButton color="secondary" @click="modalDatos = false"> Cancelar </BsButton>
    </BsModalFooter>
  </BsModal>
</template>

<script setup lang="ts">
import BsButton from "@/components/365/BsButton.vue";
import { DateTime } from "luxon";
import { ref, onMounted, computed } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import { obtenerUrlImagen } from "@/components/firebase/storage";
import BsModal from "@/components/365/BsModal.vue";
import BsModalHeader from "@/components/365/BsModalHeader.vue";
import BsModalTitle from "@/components/365/BsModalTitle.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsSpinner from "@/components/365/BsSpinner.vue";
import { useUserStore } from "@/stores/user";

// Variables
const punteroFecha = ref(DateTime.now().startOf("week").setLocale("es"));
interface NotaInformativa {
  titulo: string;
  pdfNotainformativa: string | string[];
  url?: string;
}

const cargandoNotas = ref(false);
const datosPDFRef = ref<NotaInformativa[]>([]);
const tiendas = ref([]);
const modalDatos = ref(false);
const notasInformativasMostrar = ref<{ titulo: string; url?: string } | null>(null);
const userStore = useUserStore();
const currentUser = computed(() => userStore.user);

//Funciones

async function getAllNotasInformativas() {
  try {
    cargandoNotas.value = true;
    const res = await axiosInstance.get("notas-informativas/getNotasInformativas", {
      params: {
        idTienda: currentUser.value.idTienda,
      },
    });
    if (res.data?.ok) {
      datosPDFRef.value = res.data.data;
    }
  } catch (error) {
    console.log(error);
  } finally {
    cargandoNotas.value = false;
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

async function mostrarPDF(notas: any) {
  const fileUrls = [];

  if (typeof notas.pdfNotainformativa === "string") {
    try {
      const url = await obtenerUrlImagen(notas.pdfNotainformativa);
      fileUrls.push(url);
    } catch (error) {
      console.log(error);
    }
  } else if (Array.isArray(notas.pdfNotainformativa)) {
    for (const file of notas.pdfNotainformativa) {
      try {
        const url = await obtenerUrlImagen(file);
        fileUrls.push(url);
      } catch (error) {
        console.log(error);
      }
    }
  } else {
    console.log(
      "pdfNotainformativa no es una cadena válida ni un array:",
      notas.pdfNotainformativa,
    );
  }
  if (fileUrls.length > 0) {
    notas.url = fileUrls.join(",");
    notasInformativasMostrar.value = notas;
    modalDatos.value = true;
  } else {
    console.log("No se encontraron archivos válidos.");
  }
}

const getTypeFiles = (note: NotaInformativa): string => {
  const files = Array.isArray(note.pdfNotainformativa)
    ? note.pdfNotainformativa
    : [note.pdfNotainformativa];

  const name = (files[0] || "").toLowerCase();

  if (name.endsWith(".pdf")) return "PDF";

  if (name.match(/\.(mp4|mov|avi|mkv|webm|wmv)$/)) return "Vídeo";

  return "Nota informativa";
};

onMounted(async () => {
  await getTiendas();
  getAllNotasInformativas();
});
</script>

<style lang="scss" scoped>
.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.nota-card {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  border-radius: 0.75rem;
}

.nota-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.75rem 1.5rem rgba(15, 23, 42, 0.12);
}

.nota-icon {
  width: 40px;
  height: 40px;
  background: rgba(220, 53, 69, 0.1); /* rojo suave tipo PDF */
  font-size: 1.1rem;
  color: #dc3545;
}

.nota-title {
  font-weight: 600;
  line-height: 1.3;
}

.bg-primary-subtle {
  background-color: rgba(13, 110, 253, 0.08);
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
</style>
