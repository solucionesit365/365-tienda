<template>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row">
        <div class="col">
          <button
            type="button"
            class="btn w-100"
            :class="{
              colorActive: preguntasSoporteView == false,
              colorInactive: preguntasSoporteView == true,
            }"
            @click="preguntasSoporteView = false"
          >
            PREGUNTAS
          </button>
        </div>
        <div class="col">
          <button
            type="button"
            class="btn w-100"
            :class="{
              colorActive: preguntasSoporteView == true,
              colorInactive: preguntasSoporteView == false,
            }"
            @click="preguntasSoporteView = true"
          >
            VIDEOS
          </button>
        </div>
      </div>
      <div v-if="preguntasSoporteView == false" class="row justify-content-center mt-4">
        <router-link to="/crearPreguntas" class="text-decoration-none">
          <BsButton color="success" class="ms-3 mb-3"><i class="fas fa-plus" /> Nueva </BsButton>
        </router-link>
        <div class="col-12 col-xl-7 col-sm-12">
          <div class="faq-item" v-for="(faq, index) in preguntasRespuestas" :key="index">
            <div class="faq-header" @click="desplegablePreguntas(index)">
              <span>{{ faq.pregunta }}</span>
              <i
                :class="faq.abierto ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
                class="ms-2"
              ></i>
            </div>
            <div class="faq-body" v-if="faq.abierto">
              {{ faq.respuesta }}
            </div>
          </div>
        </div>
      </div>

      <div class="di" v-if="preguntasSoporteView">
        <BsButton color="success" class="ms-3 mt-4" @click="openModal">
          <i class="fas fa-plus" /> Nuevo
        </BsButton>

        <div class="row align-items-center g-2">
          <div class="d-flex flex-column align-items-center justify-content-center my-4">
            <div class="col-12 col-xl-7 col-sm-12">
              <div class="faq-item" v-for="(video, index) in videos" :key="index">
                <div class="faq-header" @click="abrirModalVideo(video.url, video.title)">
                  {{ video.title }}
                </div>
              </div>
            </div>
          </div>

          <!-- Modal para mostrar el video -->
          <BsModal v-model="modalVideoVisible" size="lg" @close="cerrarModalVideo">
            <BsModalHeader>
              <BsModalTitle>{{ videoTitle }}</BsModalTitle>
            </BsModalHeader>
            <BsModalBody class="p-0">
              <div class="ratio ratio-16x9">
                <iframe
                  v-if="videoUrl"
                  :src="videoUrl"
                  width="560"
                  height="315"
                  title="YouTube video"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                ></iframe>
              </div>
            </BsModalBody>
            <BsModalFooter>
              <BsButton color="danger" @click="cerrarModalVideo">Cerrar</BsButton>
            </BsModalFooter>
          </BsModal>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear un nuevo video -->
  <div class="modal fade" tabindex="-1" aria-hidden="true" ref="createVideo">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="createVideoLabel">Añadir nuevo video:</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Titulo:</label>
            <input
              v-model="newVideo.title"
              type="text"
              class="form-control text-uppercase"
              placeholder="Ej: Video X: YYY"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">URL:</label>
            <input
              v-model="newVideo.url"
              type="text"
              class="form-control text-uppercase"
              placeholder="Ej: http://www.youtube.com/xxxx"
            />
          </div>
        </div>
        <div class="modal-footer">
          <BsButton color="success" @click="createNewVideo">Guardar</BsButton>
          <BsButton color="secondary" data-bs-dismiss="modal">Cancelar</BsButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import BsButton from "./365/BsButton.vue";
import BsModal from "./365/BsModal.vue";
import BsModalFooter from "./365/BsModalFooter.vue";
import BsModalHeader from "./365/BsModalHeader.vue";
import BsModalTitle from "./365/BsModalTitle.vue";
import BsModalBody from "./365/BsModalBody.vue";
import Swal from "sweetalert2";
import { axiosInstance } from "./axios/axios";
import { Modal } from "bootstrap";

const preguntasSoporteView = ref(false);

const preguntasRespuestas: Ref<{ pregunta: string; respuesta: string; abierto: boolean }[]> = ref(
  [],
);
const videos: Ref<{ title: string; url: string }[]> = ref([]);
const modalVideoVisible = ref(false);
const videoUrl = ref<string | null>(null);
const videoTitle = ref<string | null>(null);
const createVideo = ref<HTMLElement | null>(null);
const newVideo = ref({
  title: "",
  url: "",
});

async function getFaqs() {
  try {
    const resFaq = await axiosInstance.get("faq");
    preguntasRespuestas.value = resFaq.data.map((faq: any) => ({
      pregunta: faq.question,
      respuesta: faq.answer,
      abierto: false,
    }));
  } catch (error) {
    console.error("Error al obtener las preguntas frecuentes:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las preguntas frecuentes. Por favor, inténtelo de nuevo más tarde.",
    });
  }
}

async function getVideos() {
  try {
    const resVideos = await axiosInstance.get("videos-support/all-videos");
    videos.value = resVideos.data.map((video: any) => ({
      title: video.title,
      url: video.embededUrl,
    }));
  } catch (error) {
    console.error("Error al obtener los videos de soporte:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los videos de soporte. Por favor, inténtelo de nuevo más tarde.",
    });
  }
}

function desplegablePreguntas(index: number) {
  preguntasRespuestas.value[index].abierto = !preguntasRespuestas.value[index].abierto;
}

function abrirModalVideo(url: string, title: string) {
  console.log(url);
  videoUrl.value = url;
  videoTitle.value = title;
  modalVideoVisible.value = true;
}

function cerrarModalVideo() {
  videoUrl.value = null;
  videoTitle.value = null;
  modalVideoVisible.value = false;
}

async function createNewVideo() {
  if (newVideo.value.title.trim() === "" || newVideo.value.url.trim() === "") {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Todos los campos son obligatorios",
    });
    return;
  }
  try {
    await axiosInstance.post("videos-support/new-video", newVideo.value);
    Swal.fire({
      icon: "success",
      title: "Perfecto",
      text: "Video guardado correctamente",
      showConfirmButton: false,
      timer: 2000,
    });

    newVideo.value = {
      title: "",
      url: "",
    };
  } catch (error) {
    console.error("Error al guardar el video:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Ocurrió un problema al guardar el video",
      timer: 2000,
      showConfirmButton: false,
    });
  }
}

function openModal() {
  const modal = new Modal(createVideo.value!);
  modal.show();
}

onMounted(() => {
  getFaqs();
  getVideos();
});
</script>

<style scoped>
.colorActive {
  background: #e66c5a;
  color: white;
  padding: 0.6rem;
  font-weight: bold;
  border: none;
  border-radius: 0.3rem;
}

.colorInactive {
  background-color: #d7d9e7;
  color: rgb(119, 119, 119);
  padding: 0.6rem;
  font-weight: bold;
  border: none;
  border-radius: 0.3rem;
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.faq-item {
  border: 1px solid #ccc;
  margin-bottom: 0.5rem;
  border-radius: 5px;
  padding: 0.6rem;
  background: #f9f9f9;
  cursor: pointer;
}

.faq-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-body {
  margin-top: 0.5rem;
  color: #444;
}

.d-flex.flex-column.gap-2 > * {
  width: fit-content;
}
</style>
