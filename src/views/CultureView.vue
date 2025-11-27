<template>
  <router-link to="/crear-video" class="text-decoration-none" v-if="hasPermission('CrearCultura')">
    <button class="btn colorIconGreen rounded-8 mt-4 mb-2">
      <i class="fas fa-plus"></i> Nuevo
    </button>
  </router-link>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row">
        <template v-if="!videoExists && !loading">
          <div class="col-xl-12 col-xs-12 col-12 col-lg-6 text-center">
            <figure class="figure">
              <img
                src="@/assets/img/nodata.png"
                class="rounded mx-auto d-block mt-3 img-fluid"
                alt="..."
                style="width: 70%"
              />
              <figcaption class="figure-caption text-center">No hay videos que mostrar</figcaption>
            </figure>
          </div>
        </template>
        <div v-else-if="loading" class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <template v-else>
          <h5>En este apartado conocerás como es el grupo 365 Obrador</h5>
          <hr />
          <div class="row">
            <template v-for="(video, index) in videos" :key="index">
              <div class="col-12 col-md-6 col-lg-4">
                <div class="mb-4 card video-card shadow-sm" @click="openModal(video)">
                  <div class="card-body d-flex flex-column align-items-center">
                    <div class="video-icon mb-3">
                      <i class="fas fa-play-circle"></i>
                    </div>
                    <h5 class="card-title text-center mb-2">{{ video.title }}</h5>
                    <p class="card-text text-center text-muted mb-3" style="min-height: 48px">
                      {{ video.description }}
                    </p>
                    <div class="d-flex justify-content-center gap-2 w-100">
                      <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        v-if="hasPermission('EditarCultura')"
                        @click.stop="openModalEdita(video)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        v-if="hasPermission('BorrarCultura')"
                        @click.stop="eliminarVideo(video)"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Modal para editar el video -->
                <div
                  v-if="modalEdit"
                  class="modal d-block"
                  tabindex="-1"
                  style="background: rgba(0, 0, 0, 0.5)"
                >
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Editar video</h5>
                        <button type="button" class="btn-close" @click="modalEdit = false"></button>
                      </div>
                      <div class="modal-body">
                        <div class="input-group mb-3">
                          <span class="input-group-text">Titulo</span>
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Título"
                            v-model="videoEdit.title"
                          />
                        </div>
                        <div class="input-group mb-3">
                          <span class="input-group-text">Descripción</span>
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Descripción"
                            v-model="videoEdit.description"
                          />
                        </div>
                        <div class="input-group mb-3">
                          <span class="input-group-text">Url del video</span>
                          <input
                            type="text"
                            class="form-control"
                            placeholder="URL del Video"
                            v-model="videoEdit.urlVideo"
                          />
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button class="btn btn-secondary" @click="modalEdit = false">
                          Descartar
                        </button>
                        <button class="btn btn-primary" @click="editarVideo(videoEdit)">
                          Modificar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>

  <!-- Modal para mostrar el video (mejorado) -->
  <div
    v-if="isModalOpen"
    class="modal d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-fullscreen modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ videoSelected?.title }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body text-center">
          <div v-if="!videoReproduced">
            <button type="button" class="btn btn-primary" @click="reproducirVideo">
              Reproducir Video
            </button>
          </div>
          <div v-else>
            <iframe
              width="100%"
              height="400"
              :src="videoSelected?.urlVideo"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
        <div class="modal-footer">
          <span> <i class="fas fa-eye"></i> : {{ videoSelected?.views }}</span>
          <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { hasPermission } from "@/components/rolesPermisos";
// import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// import { faPlus, faPlayCircle, faEdit, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";

const videoExists = ref(false);
const videos: any = ref([]);
const loading = ref(false);
const videoSelected: any = ref(null);
const isModalOpen = ref(false);
const countVisits = ref(0);
const videoReproduced = ref(false);
const modalEdit = ref(false);
const videoEdit: any = ref(null);

function openModal(video: any) {
  videoSelected.value = video;
  isModalOpen.value = true;
}

function openModalEdita(video: any) {
  videoEdit.value = video;
  modalEdit.value = true;
}

function editarVideo(video: any) {
  axiosInstance
    .post("culture365/updateVideo", video)
    .then((response) => {
      const data = response.data;
      if (data.ok) {
        modalEdit.value = false;
        showVideo();
        Swal.fire({
          icon: "success",
          title: "Perfecto",
          text: `Video modificado`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        throw new Error("No se ha podido editar el video");
      }
    })

    .catch((error) => {
      console.log(error);
    });
}

function eliminarVideo(video: any) {
  Swal.fire({
    title: "Estas segur@?",
    text: "No podrás recuperarlo!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, borrar!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      axiosInstance
        .post("culture365/deleteVideo", video)
        .then((response) => {
          if (response.data.ok) {
            showVideo();
            Swal.fire({
              icon: "success",
              title: "Perfecto",
              text: `Video borrado`,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          } else {
            throw new Error("No se ha podido eliminar el video");
          }
        })
        .catch((error) => {
          console.log(error);
          Swal.fire("Oops...", error.message, "error");
        });
    }
  });
}

async function reproducirVideo() {
  videoReproduced.value = true;
  // Incrementar el contador en el servidor
  try {
    const response = await axiosInstance.post(
      `culture365/countViews?videoId=${videoSelected.value._id}`,
    );

    if (response.data.mensaje === "Contador incrementado con éxito") {
      countVisits.value = response.data.respvideo;
    }
  } catch (error) {
    console.error("Hubo un error al incrementar el contador de visitas:", error);
  }
}

// Función para cargar el contador de visitas desde el servidor al montar el componente
async function loadCountViews() {
  try {
    const response = await axiosInstance.get("culture365/views");
    countVisits.value = response.data.respvideo;
  } catch (error) {
    console.error("Hubo un error al cargar el contador de visitas:", error);
  }
}

async function showVideo() {
  try {
    videoExists.value = true;
    loading.value = true;
    videos.value = [];
    const resVideo = await axiosInstance.get("culture365/getVideos");
    if (resVideo.data.ok) {
      videos.value = resVideo.data.data;
      videoExists.value = videos.value?.length > 0;
    } else throw Error("No se han podido cargar los videos");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error al mostrar el vídeo", "error");
    videoExists.value = false;
  } finally {
    loading.value = false;
  }
}
function closeModal() {
  isModalOpen.value = false;
  videoReproduced.value = false;
  videoSelected.value = null;
}

onMounted(() => {
  showVideo();
  loadCountViews();
});
</script>

<style scoped>
.spinner-border[role="status"] {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem auto;
  width: 3rem;
  height: 3rem;
}

.modal.d-block {
  display: block;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 1050;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.video-card {
  border: none;
  border-radius: 1rem;
  background: #fff;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  cursor: pointer;
  min-height: 200px;
  position: relative;
}
.video-card:hover {
  box-shadow:
    0 8px 32px rgba(94, 190, 163, 0.15),
    0 1.5px 8px rgba(0, 0, 0, 0.07);
  transform: translateY(-4px) scale(1.02);
}
.video-icon {
  font-size: 2.5rem;
  color: #e66c5a;
  background: #fbeee7;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(230, 108, 90, 0.08);
}
.card-title {
  font-weight: bold;
  color: #333;
  font-size: 1.15rem;
}
.card-text {
  font-size: 0.98rem;
}
.btn-outline-primary.btn-sm {
  border-radius: 0.5rem;
}
.btn-outline-danger.btn-sm {
  border-radius: 0.5rem;
}
@media (max-width: 768px) {
  .video-card {
    min-height: 220px;
    padding: 0.5rem;
  }
  .video-icon {
    font-size: 2rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}

.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.colorIconGreen {
  background-color: #63ceb0;
  color: white;
}
</style>
