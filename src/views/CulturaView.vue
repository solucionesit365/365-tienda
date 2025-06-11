<template>
  <router-link to="/crear-video" class="text-decoration-none" v-if="hasPermission('CrearCultura')">
    <button class="btn colorIconGreen rounded-8 ms-4"><i class="fas fa-plus" /> Nuevo</button>
  </router-link>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row">
        <template v-if="!hayVideo && !loading">
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
        <div v-else-if="loading" class="spinner-bordercol-12 text-center mt-2">
          <span class="visually-hidden">Loading...</span>
        </div>
        <template v-else>
          <h5>En este apartado conocerás como es el grupo 365 Obrador</h5>
          <hr />
          <div class="row">
            <template v-for="(video, index) in videos" :key="index">
              <div class="col-12 col-md-6 col-lg-4">
                <div class="mb-3 card" style="width: 18rem" @click="abrirModal(video)">
                  <div class="card-body">
                    <h5 class="card-title">>{{ video.titulo }}</h5>
                    <p class="card-text">
                      >{{ video.descripcion }}
                      <i class="fas fa-video"></i>
                    </p>
                    <div class="modal-footer">
                      <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                        v-if="hasPermission('EditarCultura')"
                        @click.stop="abrirModalEdita(video)"
                        color="info"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                        v-if="hasPermission('BorrarCultura')"
                        @click.stop="eliminarVideo(video)"
                        color="danger"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Modal para mostrar el video -->
                <div class="modal" tabindex="-1" fullscreen>
                  <div v-if="!videoReproducido" @click="reproducirVideo()">
                    <button type="button" class="mt-1 btn-close" aria-label="Close" color="primary">
                      Reproducir Video
                    </button>
                  </div>
                  <iframe
                    v-show="videoReproducido"
                    height="1200"
                    :src="videoSeleccionado.urlVideo"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  >
                  </iframe>
                  <div class="modal-footer">
                    <span><i class="fas fa-eye"></i> : {{ videoSeleccionado.views }}</span>
                    <button type="button" class="btn">
                      Base class color="secondary" @click="cerrarModal">Cerrar
                    </button>
                  </div>
                </div>

                <!-- Modal para editar el video -->
                <div class="modal" tabindex="-1" id="modalEditar" labelledby="modalEditar" centered>
                  <div class="modal-header">
                    <h5 class="modal-title">Editar video</h5>
                  </div>
                  <div class="modal-body">
                    <div class="card-title">
                      <!-- modificar titulo -->
                      <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">@</span>
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Username"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                        />
                      </div>
                      <!-- modificar descripcion -->
                      <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">@</span>
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Username"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                        />
                      </div>
                    </div>
                    <div class="col-auto">
                      <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">@</span>
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Username"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn">
                      Base class color="secondary" @click="modalEditar = false">Descartar
                    </button>
                    <button type="button" class="btn">
                      Base class color="primary" @click="editarVideo(videoEditar)">Modificar
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { hasPermission } from "@/components/rolesPermisos";

const hayVideo = ref(false);
const videos: any = ref([]);
const loading = ref(false);
const videoSeleccionado: any = ref(null);
const esModalAbierto = ref(false);
const contadorVisitas = ref(0);
const videoReproducido = ref(false);
const modalEditar = ref(false);
const videoEditar: any = ref(null);

function abrirModal(video: any) {
  videoSeleccionado.value = video;
  esModalAbierto.value = true;
}

function abrirModalEdita(video: any) {
  videoEditar.value = video;
  modalEditar.value = true;
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
        .post("cultura365/deleteVideo", video)
        .then((response) => {
          if (response.data.ok) {
            mostrarVideo();
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
  videoReproducido.value = true;
  // Incrementar el contador en el servidor
  try {
    const response = await axiosInstance.post(
      `cultura365/contadorViews?videoId=${videoSeleccionado.value._id}`,
    );

    if (response.data.mensaje === "Contador incrementado con éxito") {
      contadorVisitas.value = response.data.respvideo;
    }
  } catch (error) {
    console.error("Hubo un error al incrementar el contador de visitas:", error);
  }
}

// Función para cargar el contador de visitas desde el servidor al montar el componente
async function cargarContadorVisitas() {
  try {
    const response = await axiosInstance.get("cultura365/views");
    contadorVisitas.value = response.data.respvideo;
  } catch (error) {
    console.error("Hubo un error al cargar el contador de visitas:", error);
  }
}

async function mostrarVideo() {
  try {
    hayVideo.value = true;
    loading.value = true;
    videos.value = [];
    const resVideo = await axiosInstance.get("cultura365/getVideos");
    if (resVideo.data.ok) {
      videos.value = resVideo.data.data;
      hayVideo.value = videos.value?.length > 0;
      console.log("Videos.value=", videos.value);
      console.log("Videos.value=", hayVideo.value);
    } else throw Error("No se han podido cargar los videos");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error al mostrar el vídeo", "error");
    hayVideo.value = false;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  mostrarVideo();
  cargarContadorVisitas();
});
</script>

<style scoped></style>
