<template>
  <router-link
    to="/crearFormacion"
    class="text-decoration-none"
    v-if="hasPermission('NuevaFormacion')"
  >
    <button class="btn colorIconGreen rounded-8 mt-3"><i class="fas fa-plus" /> Nuevo</button>
  </router-link>
  <router-link
    to="/datosFormacion"
    class="text-decoration-none"
    v-if="hasPermission('VerDatosFormacion')"
  >
    <button class="btn colorIconGreen rounded-8 ms-3 mt-3">
      <i class="fas fa-file" /> Datos Formación
    </button>
  </router-link>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row">
        <div class="row mb-3">
          <div class="col-auto mb-2">
            <div class="d-flex flex-wrap">
              <div
                v-if="
                  hasPermission(
                    'FiltroProductoFormacion',
                    'TodosFiltrosFormacion',
                    'FiltrosMKPDFormacion',
                  )
                "
                class="col-auto mb-2"
              >
                <button
                  :class="[
                    'btn rounded-8 w-auto',
                    { 'active-category': categoria === 'Elaboración' },
                  ]"
                  color="primary"
                  @click="
                    categoria = 'Elaboración';
                    mostrarVideoByCategoria();
                  "
                >
                  <i class="fas fa-filter" /> Elaboración
                </button>
              </div>

              <div
                v-if="
                  (antiguedadDias !== null && antiguedadDias >= 1 && antiguedadDias <= 15) ||
                  hasPermission('TodosFiltrosFormacion')
                "
                class="col-auto mb-2"
              >
                <button
                  :class="['btn rounded-8 w-auto', { 'active-category': categoria === 'Starters' }]"
                  color="primary"
                  @click="
                    categoria = 'Starters';
                    mostrarVideoByCategoria();
                  "
                >
                  <i class="fas fa-filter" /> Starters
                </button>
              </div>

              <div
                v-if="hasPermission('FiltroMantenimientoFormacion', 'TodosFiltrosFormacion')"
                class="col-auto mb-2"
              >
                <button
                  :class="['btn rounded-8 w-auto', { 'active-category': categoria === 'Limpieza' }]"
                  color="primary"
                  @click="
                    categoria = 'Limpieza';
                    mostrarVideoByCategoria();
                  "
                >
                  <i class="fas fa-filter" /> Limpieza
                </button>
              </div>

              <div
                v-if="hasPermission('TodosFiltrosFormacion', 'FiltrosMKPDFormacion')"
                class="col-auto mb-2"
              >
                <button
                  :class="[
                    'btn rounded-8 w-auto',
                    { 'active-category': categoria === 'Gestión Tienda' },
                  ]"
                  color="primary"
                  @click="
                    categoria = 'Gestión Tienda';
                    mostrarVideoByCategoria();
                  "
                >
                  <i class="fas fa-filter" /> Gestión Tienda
                </button>
              </div>

              <div
                v-if="hasPermission('TodosFiltrosFormacion', 'FiltrosMKPDFormacion')"
                class="col-auto mb-2"
              >
                <button
                  :class="[
                    'btn rounded-8 w-auto',
                    { 'active-category': categoria === 'Sanidad e Higiene' },
                  ]"
                  color="primary"
                  @click="
                    categoria = 'Sanidad e Higiene';
                    mostrarVideoByCategoria();
                  "
                >
                  <i class="fas fa-filter" /> Sanidad e Higiene
                </button>
              </div>
              <div
                v-if="hasPermission('TodosFiltrosFormacion', 'FiltrosMKPDFormacion')"
                class="col-auto mb-2"
              >
                <button
                  :class="['btn rounded-8 w-auto', { 'active-category': categoria === 'PRL' }]"
                  color="primary"
                  @click="
                    categoria = 'PRL';
                    mostrarVideoByCategoria();
                  "
                >
                  <i class="fas fa-filter" /> PRL
                </button>
              </div>

              <div
                v-if="hasPermission('TodosFiltrosFormacion', 'FiltrosMKPDFormacion')"
                class="col-auto mb-2"
              >
                <button
                  :class="[
                    'btn rounded-8 w-auto',
                    { 'active-category': categoria === 'Accidentes' },
                  ]"
                  color="primary"
                  @click="
                    categoria = 'Accidentes';
                    mostrarVideoByCategoria();
                  "
                >
                  <i class="fas fa-filter" /> Accidentes
                </button>
              </div>
            </div>
          </div>
        </div>
        <template v-if="!hayVideo && !loading">
          <div class="col-xl-12 col-xs-12 col-12 col-lg-6 text-center">
            <figure class="figure">
              <img
                src="@/assets/img/nodata.png"
                class="rounded mx-auto d-block mt-3 img-fluid"
                alt="..."
                style="width: 70%"
              />
              <figcaption class="figure-caption text-center">No hay videos de formación</figcaption>
            </figure>
          </div>
        </template>
        <div v-else-if="loading" class="col-12 text-center">
          <MDBSpinner style="width: 5rem; height: 5rem" />
        </div>
        <!-- <template v-else>
          <hr />
          <div class="row">
            <template v-for="(video, index) in videos" :key="index">
              <div class="col-6 col-md-4 mb-3">
                <div class="card" style="width: 18rem" @click="abrirModal(video)">
                  <div class="card-body d-flex flex-column">
                    <div>
                      <h5 class="card-title">{{ video.titulo }}</h5>
                      <p class="card-text">
                        {{ video.descripcion }}
                        <i class="fas fa-video"></i>
                      </p>
                    </div>
                    <div
                      class="modal-footer modal-Footer2 mt-auto p-1"
                      v-if="getRole('Producto', 'Super_Admin')"
                    >
                      <button
                        @click.stop="abrirModalEdita(video)"
                        color="info"
                        class="btn-sm custom-btn"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click.stop="eliminarVideo(video)"
                        color="danger"
                        class="btn-sm custom-btn"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="modal" tabindex="-1" v-if="esModalAbierto" style="display: block">
                  <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">{{ videoSeleccionado?.titulo }}</h5>
                        <button type="button" class="btn-close" @click="cerrarModal"></button>
                      </div>
                      <div class="modal-body text-center">
                        <div v-if="!videoReproducido">
                          <button class="btn btn-reproducir" @click="reproducirVideo()">
                            Reproducir Video
                          </button>
                        </div>
                        <iframe
                          v-show="videoReproducido"
                          width="100%"
                          height="400"
                          :src="videoSeleccionado?.urlVideo"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                        ></iframe>
                      </div>
                      <div class="modal-footer">
                        <span><i class="fas fa-eye"></i> : {{ videoSeleccionado?.views }}</span>
                        <button class="btn btn-secondary" @click="cerrarModal">Cerrar</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="modal"
                  tabindex="-1"
                  v-if="modalEditar"
                  aria-modal="true"
                  role="dialog"
                  style="display: block"
                  :class="{ show: modalEditar }"
                >
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="modalEditarEventoTitle">Editar Video</h5>
                        <button
                          type="button"
                          class="btn-close"
                          @click="modalEditar = false"
                        ></button>
                      </div>

                      <div
                        class="modal"
                        :class="{ show: modalEditar }"
                        tabindex="-1"
                        style="display: block"
                        v-if="modalEditar"
                        aria-labelledby="modalEditarVideoTitle"
                        aria-modal="true"
                        role="dialog"
                      >
                        <div class="modal-dialog">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="modalEditarVideoTitle">Editar Video</h5>
                              <button
                                type="button"
                                class="btn-close"
                                @click="modalEditar = false"
                              ></button>
                            </div>
                            <div class="modal-body">
                              <form @submit.prevent="editarVideo(videoEditar)">
                                <div class="mb-3">
                                  <label class="form-label fw-bold">Título</label>
                                  <input
                                    type="text"
                                    class="form-control"
                                    v-model="videoEditar.titulo"
                                    placeholder="Título"
                                    required
                                  />
                                </div>

                                <div class="mb-3">
                                  <label class="form-label fw-bold">Descripción</label>
                                  <input
                                    type="text"
                                    class="form-control"
                                    v-model="videoEditar.descripcion"
                                    placeholder="Descripción"
                                    required
                                  />
                                </div>

                                <div class="mb-3">
                                  <label class="form-label fw-bold">URL IFRAME Youtube</label>
                                  <input
                                    type="text"
                                    class="form-control"
                                    v-model="videoEditar.urlVideo"
                                    placeholder="Copia el IFRAME del video desde Youtube"
                                    required
                                  />
                                </div>
                              </form>
                            </div>
                            <div class="modal-footer">
                              <div class="d-flex justify-content-end gap-2 w-100">
                                <button
                                  type="button"
                                  class="btn btn-secondary"
                                  @click="modalEditar = false"
                                >
                                  Descartar
                                </button>
                                <button
                                  type="submit"
                                  class="btn btn-corporativo"
                                  @click="editarVideo(videoEditar)"
                                >
                                  Modificar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, type Ref } from "vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { hasPermission } from "@/components/rolesPermisos";
import { DateTime } from "luxon";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const hayVideo = ref(false);
const videos: Ref<any[]> = ref([]);
const loading = ref(false);
const videoSeleccionado: Ref<any> = ref(null);
const esModalAbierto = ref(false);
const modalEditar = ref(false);
const videoEditar: Ref<any> = ref(null);
const contadorVisitas = ref(0);
const videoReproducido = ref(false);
const currentUser = computed(() => userStore.user);
const categoria: Ref<any> = ref(null);
const arraySubordinados: Ref<any[]> = ref([]);
const antiguedadDias: Ref<any> = ref(null);

function abrirModal(video: any) {
  videoSeleccionado.value = video;
  esModalAbierto.value = true;
}

function abrirModalEdita(video: any) {
  console.log(video);
  videoEditar.value = video;
  console.log(modalEditar.value);
  modalEditar.value = true;
}

function editarVideo(video: any) {
  axiosInstance
    .post("videos-formacion/updateVideoFormacion", video)
    .then((response) => {
      const data = response.data;
      if (data.ok) {
        modalEditar.value = false;
        mostrarVideoByCategoria();
        Swal.fire({
          icon: "success",
          title: "Perfecto",
          text: `Video modificado`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        throw new Error("No se ha podido editar el video de formacion ");
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
        .post("videos-formacion/deleteVideoFormacion", video)
        .then((response) => {
          if (response.data.ok) {
            mostrarVideoByCategoria();
            Swal.fire({
              icon: "success",
              title: "Perfecto",
              text: `Video borrado`,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          } else {
            throw new Error("No se ha podido eliminar el video de formacion ");
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

  // Datos del video visto
  const videoVisto = {
    idVideo: videoSeleccionado.value._id,
    titulo: videoSeleccionado.value.titulo,
    categoria: videoSeleccionado.value.categoria,
    urlVideo: videoSeleccionado.value.urlVideo,
    visto: new Date(),
    tienda: currentUser.value.nombreTienda,
    nombre: currentUser.value.nombre,
  };

  try {
    // Verificar si el video ya ha sido registrado
    const existenteResponse = await axiosInstance.get(`videos-formacion/verificarVideoVisto`, {
      params: {
        nombre: currentUser.value.nombre,
        idVideo: videoSeleccionado.value._id,
      },
    });
    if (existenteResponse.data.existe) {
      console.log("El video ya ha sido registrado anteriormente.");
    }

    // Incrementar el contador de vistas
    const contadorResponse = await axiosInstance.post(
      `videos-formacion/contadorViews?videoId=${videoSeleccionado.value._id}`,
    );

    if (contadorResponse.data.mensaje === "Contador incrementado con éxito") {
      contadorVisitas.value = contadorResponse.data.respvideo;
    }

    // Registrar el video como visto y quien lo ha visto nombreTienda y nombrePersona
    await axiosInstance.post(`videos-formacion/nuevoVistoVideoFormacion`, videoVisto);
  } catch (error) {
    console.error("Hubo un error:", error);
  }
}

function cerrarModal() {
  esModalAbierto.value = false;
  videoReproducido.value = false;
}

// Función para cargar el contador de visitas desde el servidor al montar el componente
async function cargarContadorVisitas() {
  try {
    const response = await axiosInstance.get("videos-formacion/views");
    contadorVisitas.value = response.data.respvideo;
  } catch (error) {
    console.error("Hubo un error al cargar el contador de visitas:", error);
  }
}

function getRole(...validRoles: any) {
  if (!currentUser.value || !currentUser.value || !currentUser.value.roles) {
    console.error("Error: No se ha definido correctamente el usuario o sus roles.");
    return false;
  }
  const userRoles = currentUser.value.roles.map((role) => role.name);
  return validRoles.some((role: any) => userRoles.includes(role));
}

async function mostrarVideoByCategoria() {
  try {
    hayVideo.value = true;
    loading.value = true;
    videos.value = [];
    const resVideo = await axiosInstance.get("videos-formacion/videosPorCategoria", {
      params: {
        categoria: categoria.value,
        idTienda: currentUser.value.idTienda,
      },
    });
    if (resVideo.data.ok) {
      videos.value = resVideo.data.data;
      hayVideo.value = videos.value?.length > 0;
    } else throw Error("No se han podido cargar los videos de la categoría");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un problema", "error");
    hayVideo.value = false;
  } finally {
    loading.value = false;
  }
}

//Devuelve la primera categoría válida según el permiso del usuario logeado
const getPrimeraCategoriaValida = () => {
  if (hasPermission("TodosFiltrosFormacion", "FiltroProductoFormacion", "FiltrosMKPDFormacion")) {
    return "Elaboración";
  }
  if (hasPermission("TodosFiltrosFormacion", "FiltroStartersFormacion")) {
    return "Starters";
  }
  if (hasPermission("FiltrosMKPDFormacion", "TodosFiltrosFormacion")) {
    return "Limpieza";
  }
  if (hasPermission("TodosFiltrosFormacion", "FiltrosMKPDFormacion")) {
    return "Gestón Tienda";
  }
  if (hasPermission("TodosFiltrosFormacion", "FiltrosMKPDFormacion")) {
    return "Sanidad e Higiene";
  }
  if (hasPermission("TodosFiltrosFormacion", "FiltrosMKPDFormacion")) {
    return "PRL";
  }
  if (hasPermission("TodosFiltrosFormacion", "FiltrosMKPDFormacion")) {
    return "Accidentes";
  }
  return "Elaboración";
};

function calcularAntiguedad(fechaInicio: string) {
  const inicio = DateTime.fromISO(fechaInicio);
  const hoy = DateTime.now();
  return Math.floor(hoy.diff(inicio, "days").days);
}

async function getTrabajador() {
  arraySubordinados.value = [];
  try {
    const trabajador = await axiosInstance.get("trabajadores/getTrabajadorByAppId", {
      params: { uid: currentUser.value.uid },
    });

    if (trabajador.data.ok) {
      const trabajadorData = trabajador.data.data;
      if (Array.isArray(trabajadorData.contratos) && trabajadorData.contratos.length > 0) {
        trabajadorData.antiguedadDias = calcularAntiguedad(
          trabajadorData.contratos[0].fechaAntiguedad,
        );

        antiguedadDias.value = trabajadorData.antiguedadDias;
        arraySubordinados.value.push(trabajadorData);
      } else {
        console.error("El trabajador no tiene contratos.");
      }
    } else {
      throw new Error("No hay datos del trabajador");
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un problema", "error");
  }
}

onMounted(() => {
  getTrabajador();
  const primeraCategoria = getPrimeraCategoriaValida();
  if (primeraCategoria) {
    categoria.value = primeraCategoria;
    mostrarVideoByCategoria();
  }
  cargarContadorVisitas();
});
</script>

<style scoped>
.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-corporativo {
  background-color: #e66c5a !important;
  border: none;
  color: white !important;
}

.btn-corporativo:hover {
  background-color: #cf584a !important;
}

.active-category {
  background-color: #e66c5a !important;
  color: white !important;
  border: none !important;
}

.custom-btn {
  background-color: #e66c5a;
  border: none;
  color: white;
  margin: 0 5px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.custom-btn:hover {
  background-color: #cf584a;
}

.btn-reproducir {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.btn-reproducir:hover {
  background-color: #0056b3;
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

.modal-title {
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff !important;
  opacity: 1;
  margin-left: 1rem;
  position: relative;
  transition:
    background 0.2s,
    color 0.2s;
}

.btn-close::before {
  content: "✕";
  font-size: 1.5rem;
  color: #fff;
  line-height: 1;
  font-weight: bold;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.btn-close:hover,
.btn-close:focus {
  background: rgba(230, 108, 90, 0.15);
  color: #fff;
  outline: none;
}

.modal-body {
  padding: 1.5rem;
  background: #fafbfc;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  overflow-y: auto;
  flex: 1 1 auto;
}

.modal-footer2 {
  border-top: 1px solid #e0e0e0;
  background: #f7f7f7;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .modal-dialog {
    max-width: 98vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.8rem !important;
    padding: 0 !important;
  }
  .modal-header {
    border-top-left-radius: 0.8rem !important;
    border-top-right-radius: 0.8rem !important;
    padding: 1.1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.15rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2.1rem;
    height: 2.1rem;
    font-size: 1.2rem;
    margin-left: 0.7rem;
  }
  .modal-body,
  .modal-footer2 {
    border-radius: 0 0 0.8rem 0.8rem !important;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 600px) {
  .modal-dialog {
    max-width: 99vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.7rem !important;
    padding: 0 !important;
  }
  .modal-header {
    border-top-left-radius: 0.7rem !important;
    border-top-right-radius: 0.7rem !important;
    padding: 1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.1rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
    margin-left: 0.5rem;
  }
  .modal-body,
  .modal-footer2 {
    border-radius: 0 0 0.7rem 0.7rem !important;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
}

@media (max-width: 400px) {
  .modal-title {
    font-size: 1rem;
  }
  .modal-header {
    padding: 0.7rem !important;
  }
  .modal-body,
  .modal-footer {
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}
</style>
