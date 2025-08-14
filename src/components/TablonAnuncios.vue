<template>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row mt-4 mb-8">
        <template v-if="!hayAnuncios">
          <div class="col-xl-12 col-xs-12 col-12 col-lg-6 text-center">
            <figure class="figure">
              <img
                src="@/assets/img/nodata.png"
                class="rounded mx-auto d-block mt-3 img-fluid"
                alt="..."
                style="width: 70%"
              />
              <figcaption class="figure-caption text-center">
                No hay anuncios que mostrar
              </figcaption>
            </figure>
          </div>
        </template>
        <template v-else>
          <template v-for="(anuncio, index) in anuncios" :key="index">
            <div class="col-xl-4 col-xs-12 col-12 col-lg-4">
              <div class="card p-2 mb-2">
                <div class="d-flex justify-content-between">
                  <div class="d-flex flex-row align-items-center">
                    <div v-if="anuncio.categoria === 'Newsletter'" class="icon">
                      <i class="fas fa-headset text-primary" />
                    </div>
                    <div v-if="anuncio.categoria === 'Oferta trabajo'" class="icon">
                      <i class="fas fa-star text-success" />
                    </div>
                    <div v-if="anuncio.categoria === 'Nota informativa'" class="icon">
                      <i class="fas fa-exclamation-triangle text-warning" />
                    </div>
                    <div v-if="anuncio.categoria === 'Encuesta'" class="icon">
                      <i class="fas fa-question-circle text-info" />
                    </div>
                    <div class="ms-2 c-details">
                      <h6 class="mb-0">
                        {{ anuncio.categoria }}
                      </h6>
                      <span class="text-muted">
                        Hace
                        {{
                          (() => {
                            const fechaCreacion = DateTime.fromISO(anuncio.fechaCreacion);
                            const diferenciaDias = DateTime.now().diff(fechaCreacion, "days").days;
                            return Math.abs(Math.floor(diferenciaDias));
                          })()
                        }}
                        días
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-3">
                  <h6 class="heading text-center">
                    {{ anuncio.titulo }}
                  </h6>
                  <hr />
                  <div class="d-inline-flex gap-1" id="collapsibleContent1">
                    <div class="text-start">{{ anuncio.descripcion }} <br /></div>
                  </div>
                  <div class="mt-3 c-details">
                    <div class="">
                      <span class="text-muted"
                        >Caduca el
                        {{ DateTime.fromISO(anuncio.caducidad).toFormat("dd/MM/yyyy") }}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="card-footer quitarFondo">
                  <div class="row quitarFondo">
                    <div class="text-start col-6 col-sm-6 col-xl-4">
                      <BsButton
                        v-if="anuncio.categoria === 'Oferta trabajo'"
                        @click="abrirModalCandidato(anuncio)"
                        color="primary"
                        size="sm"
                        >INSCRIBIRME</BsButton
                      >
                      <button
                        type="button"
                        class="btn"
                        v-if="anuncio.categoria === 'Nota informativa' && anuncio.urlVideo"
                        @click="abrirFormularioVideo(anuncio.urlVideo)"
                        color="info"
                        size="sm"
                      >
                        Ver Video
                      </button>
                    </div>
                    <div class="text-end col-6 col-sm-6 col-xl-8">
                      <div class="d-flex justify-content-end align-items-center gap-2">
                        <button
                          v-if="hasPermission('EditarAnuncios')"
                          aria-controls="modalEditarAnuncio"
                          title="Editar Anuncio"
                          class="call-btn btn btn-outline-warning btn-floating btn-sm"
                          @click="selectEditarAnuncio(anuncio)"
                        >
                          <i class="fas fa-edit" />
                        </button>
                        <button
                          v-if="hasPermission('BorrarAnuncios')"
                          title="Borrar Anuncio"
                          class="call-btn btn btn-outline-danger btn-floating btn-sm"
                          @click="borrarAnuncio(anuncio._id)"
                        >
                          <i class="fas fa-trash" />
                        </button>
                        <button
                          v-if="anuncio.tipoArchivo == 'pdf' && anuncio.fotoPath"
                          aria-controls="modalEditarAnuncio"
                          title="Descargar Anuncio"
                          id="btnDescargarAnuncio"
                          class="call-btn btn btn-outline-primary btn-floating btn-sm"
                          @click="descargarAnuncio(anuncio.fotoPath)"
                        >
                          <i class="far fa-file-pdf" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
        <div v-if="error" class="row">
          <div class="col-xl-6 col-xs-12 col-12 col-lg-6 text-center">
            <figure class="figure">
              <img
                src="@/assets/img/nodata.png"
                class="rounded mx-auto d-block mt-3 img-fluid"
                alt="..."
                style="width: 70%"
              />
              <figcaption class="figure-caption text-center text-danger">
                NO SE CONECTA AL SERVIDOR contacta con informática
                <a href="tel:603 44 88 08">603 44 88 08</a>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
      <div class="row justify-content-center">
        <div v-if="loading" class="col-xl-8 col-sm-12 col-12 mb-2 d-block d-sm-block d-md-none">
          <div class="h-75">
            <div id="test2" class="card">
              <div class="card-body">
                <div class="loader2">
                  <h1>Obteniendo datos</h1>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="loading" class="col-xl-8 col-sm-12 col-12 d-none d-sm-none d-md-block">
          <div class="h-75">
            <div id="bodycard" class="card border-5">
              <div class="card-body">
                <div class="loading">
                  <div class="cloud" />
                  <div class="data">
                    <span>0</span>
                    <span>1</span>
                    <span>0</span>
                    <span>1</span>
                    <span>0</span>
                    <span>1</span>
                    <span>0</span>
                    <span>1</span>
                    <span>0</span>
                  </div>
                  <div class="browser">
                    <div class="buttons" />
                  </div>
                </div>
                <p class="text-center mt-3">Obteniendo datos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal ver Video -->
      <div class="modal" tabindex="-1" id=" modalVerVideo" centered>
        <div class="modal-body">
          <iframe
            v-if="anuncioEditar"
            :src="anuncioEditar"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
        <div class="modal" tabindex="-1">
          <button type="button" class="btn" color="secondary" @click="modalVerVideo = false">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal Editar Anuncio -->
  <div
    v-if="modalFormulario"
    class="modal fade"
    :class="{ show: modalFormulario }"
    :style="{ display: modalFormulario ? 'block' : 'none' }"
    id="modalPagarHoras"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modalPagarHorasTitle"
    aria-modal="true"
  >
    >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Anuncio</h5>
          <button type="button" class="btn-close" @click="cancelarEdicion"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarCambiosAnuncio">
            <div class="mb-3">
              <label class="form-label">Título</label>
              <input type="text" class="form-control" v-model="anuncioEditar.titulo" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Categoría</label>
              <select class="form-select" v-model="anuncioEditar.categoria" required>
                <option disabled value="">Selecciona una categoría</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Oferta trabajo">Oferta de trabajo</option>
                <option value="Nota informativa">Nota informativa</option>
                <option value="Encuesta">Encuesta</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Fecha de caducidad</label>
              <input type="date" class="form-control" v-model="anuncioEditar.caducidad" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea
                class="form-control"
                rows="3"
                v-model="anuncioEditar.descripcion"
                required
              ></textarea>
            </div>

            <div class="mb-3" v-if="anuncioEditar.tipoArchivo === 'video'">
              <label class="form-label">URL del video (iframe)</label>
              <input type="text" class="form-control" v-model="anuncioEditar.urlVideo" />
            </div>

            <div class="mb-3" v-if="anuncioEditar.tipoArchivo === 'pdf'">
              <label class="form-label">Subir archivo PDF</label>
              <input
                class="form-control"
                type="file"
                accept="application/pdf"
                @change="onFileChange"
              />
            </div>

            <div class="text-end col-6 col-sm-6 col-xl-8">
              <button type="button" class="btn btn-secondary me-2" @click="cancelarEdicion">
                Cancelar
              </button>
              <button type="submit" class="btn btn-success">Guardar cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-if="modalFormulario" class="modal-backdrop fade show" style="z-index: 1040"></div>

  <!-- Modal de Enviar Candidatura -->
  <div
    class="modal fade"
    tabindex="-1"
    :class="{ show: modalCandidato }"
    :style="modalCandidato ? 'display: block; background: rgba(0,0,0,0.5);' : 'display: none;'"
    role="dialog"
    aria-modal="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Enviar candidatura</h5>
          <button type="button" class="btn-close" @click="modalCandidato = false"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="enviarCandidato">
            <div class="mb-2">
              <label class="form-label">Nombre</label>
              <input v-model="formCandidato.nombre" type="text" class="form-control" required />
            </div>
            <div class="mb-2">
              <label class="form-label">Apellidos</label>
              <input v-model="formCandidato.apellidos" type="text" class="form-control" required />
            </div>
            <div class="mb-2">
              <label class="form-label">Tienda</label>
              <input v-model="formCandidato.tienda" type="text" class="form-control" required />
            </div>
            <div class="mb-2">
              <label class="form-label">Teléfono</label>
              <input v-model="formCandidato.telefono" type="tel" class="form-control" required />
            </div>
            <div class="mb-2">
              <label class="form-label">Email</label>
              <input v-model="formCandidato.email" type="email" class="form-control" required />
            </div>
            <div class="mb-2">
              <label class="form-label">Adjuntar archivo (CV, PDF, etc.)</label>
              <input
                type="file"
                class="form-control"
                @change="onFileChange"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <div class="text-end">
              <button type="button" class="btn btn-danger me-2" @click="modalCandidato = false">
                Descartar
              </button>
              <button type="submit" class="btn btn-success">Enviar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import Swal from "sweetalert2";
import {
  subirArchivoGeneral,
  subirArchivoConNombre,
  descargarArchivo,
  obtenerUrlImagen,
} from "@/components/firebase/storage";
import { axiosInstance } from "@/components/axios/axios";
import { hasPermission } from "@/components/rolesPermisos";
import { DateTime } from "luxon";
import BsButton from "@/components/365/BsButton.vue";

const anuncios: Ref<any[]> = ref([]);
//const collapse1 = ref(true);
const modalFormulario = ref(false);
const hayAnuncios = ref(false);
const loading = ref(true);
const anuncioEditar: Ref<any> = ref();
const file: Ref<any[]> = ref([]);
const tiendas: Ref<any[]> = ref([]);
const modalCandidato = ref(false);
const formCandidato = ref({
  nombre: "",
  apellidos: "",
  tienda: "",
  telefono: "",
  email: "",
});
const anuncioOferta: Ref<any> = ref(null);
const archivoCandidato: Ref<any> = ref(null);
// const urlExterna = ref("");
const error = ref(false);
const modalVerVideo = ref(false);

async function descargarAnuncio(fotoPath: string) {
  try {
    const url = await obtenerUrlImagen(fotoPath);

    if (esIOS()) {
      // Para iOS, usamos fetch para obtener el Blob y luego simular la descarga
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link: any = document.createElement("a");
      link.href = objectUrl;
      link.download = obtenerNombreArchivo(fotoPath);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar la URL del objeto
      window.URL.revokeObjectURL(objectUrl);
    } else {
      descargarArchivo(fotoPath);
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

// Función para detectar si el usuario está en un dispositivo iOS
function esIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Método para obtener el nombre del archivo desde la ruta
function obtenerNombreArchivo(filePath: string) {
  return filePath.split("/").pop();
}

function selectEditarAnuncio(anuncio: any) {
  modalFormulario.value = true;
  anuncioEditar.value = anuncio;
}

function borrarAnuncio(idAnuncio: string) {
  Swal.fire({
    title: `¿Seguro que quieres eliminar este anuncio?`,
    text: "¡Ya no podrás recuperarlo!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
  }).then((result) => {
    if (result.isConfirmed) {
      axiosInstance
        .post("anuncios/deleteAnuncio", { _id: idAnuncio })
        .then((resDelete) => {
          if (!resDelete.data.ok) throw Error("No se ha podido borrar el anuncio");
          Swal.fire({
            icon: "success",
            title: "Perfecto",
            text: "Anuncio borrado correctamente",
            timer: 2000,
            showCancelButton: false,
          });
          cargarAnuncios();
        })
        .catch((err) => {
          console.log(err);
          Swal.fire("Oops...", "Ha habido un problema", "error");
        });
    }
  });
}

// function abrirFormulario(urlForms, urlVideo) {
//   modalFormulario.value = true;
//   if (urlForms) {
//     urlExterna.value = urlForms;
//   } else if (urlVideo) {
//     urlExterna.value = urlVideo;
//   } else {
//     urlExterna.value = "";
//   }
// }

function abrirFormularioVideo(urlVideo: string) {
  modalVerVideo.value = true;
  anuncioEditar.value.urlVideo = urlVideo;
}

async function cargarAnuncios() {
  try {
    hayAnuncios.value = true;
    loading.value = true;
    anuncios.value = [];
    const resAnuncios = await axiosInstance.get("anuncios");
    if (resAnuncios.data.ok) {
      anuncios.value = resAnuncios.data.data;
      hayAnuncios.value = anuncios.value?.length > 0;
    } else throw Error("No se han podido cargar los anuncios");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
    hayAnuncios.value = false;
  } finally {
    loading.value = false;
  }
}

async function getTiendas() {
  try {
    const {
      data,
    }: {
      data: {
        id: number;
        nombre: string;
        direccion: string | null;
        idExterno: number | null;
        coordinatorId: number | null;
        supervisorId: number | null;
        existsBC: boolean;
      }[];
    } = await axiosInstance.get("tiendas");

    data.forEach((tienda) => {
      tiendas.value.push({ text: tienda.nombre, value: tienda.id });
    });
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

onMounted(() => {
  cargarAnuncios();
  getTiendas();
});

// Método para cancelar la edición y cerrar el modal
function cancelarEdicion() {
  modalFormulario.value = false;
  anuncioEditar.value = null;
}

// Método para guardar los cambios del anuncio editado
async function guardarCambiosAnuncio() {
  try {
    if (file.value[0]) {
      if (file.value[0].type !== "application/pdf")
        throw Error("Solamente se admiten archivos tipo PDF");

      const nuevoArchivo = await subirArchivoGeneral(file.value[0], "anuncios");

      if (nuevoArchivo) {
        //borrarArchivo(anuncioEditar.value.fotoPath);
        anuncioEditar.value.fotoPath = nuevoArchivo;
      } else throw Error("Error al guardar el nuevo archivo, contacta con informatica");
    }

    if (anuncioEditar.value.titulo == "") throw Error("Introduce el titulo del anuncio");

    if (anuncioEditar.value.descripcion == "") throw Error("Introduce la descripción del anuncio");

    if (anuncioEditar.value.caducidad == "")
      throw Error("Introduce la fecha de caducidad del anuncio");

    if (anuncioEditar.value.urlExterna == "") throw Error("Introduce una url");

    if (anuncioEditar.value.categoria == "") throw Error("Introduce la categoria del anuncio");

    const doc = {
      _id: anuncioEditar.value._id,
      titulo: anuncioEditar.value.titulo,
      descripcion: anuncioEditar.value.descripcion,
      caducidad: anuncioEditar.value.caducidad,
      categoria: anuncioEditar.value.categoria,
      fotoPath: anuncioEditar.value.fotoPath,
    };

    const resUpdate = await axiosInstance.post("anuncios/updateAnuncio", doc);

    if (resUpdate.data.ok) {
      Swal.fire({
        icon: "success",
        title: "Perfecto",
        text: "El anuncio ha sido editado",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      modalFormulario.value = false;
      cargarAnuncios();
    } else throw Error("No se ha podido actualizar el anuncio");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

function abrirModalCandidato(anuncio: any) {
  anuncioOferta.value = anuncio;
  formCandidato.value = {
    nombre: "",
    apellidos: "",
    tienda: "",
    telefono: "",
    email: "",
  };
  modalCandidato.value = true;
}
function onFileChange(event: any) {
  const fileObj = event.target.files[0] || null;
  archivoCandidato.value = fileObj;
  // Guarda el nombre original del archivo para usarlo en el storage
  if (fileObj) {
    archivoCandidato.value._nombreOriginal = fileObj.name;
  }
}
async function enviarCandidato() {
  try {
    Swal.fire({
      title: "Enviando...",
      text: "Por favor espera mientras se envía tu candidatura.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    let archivoUrl = null;
    if (archivoCandidato.value) {
      const nombreArchivo = archivoCandidato.value._nombreOriginal || archivoCandidato.value.name;
      // Usa la nueva función para subir el archivo con el nombre exacto
      archivoUrl = await subirArchivoConNombre(
        archivoCandidato.value,
        `candidatos/${nombreArchivo}`,
      );
    }
    const payload = {
      nombre: formCandidato.value.nombre,
      apellidos: formCandidato.value.apellidos,
      tienda: formCandidato.value.tienda,
      telefono: formCandidato.value.telefono,
      email: formCandidato.value.email,
      oferta: anuncioOferta.value?.titulo || "",
      archivo: archivoUrl,
    };
    await axiosInstance.post("anuncios/enviar-candidato", payload);
    Swal.close();
    modalCandidato.value = false;
    Swal.fire("Enviado", "Tu candidatura ha sido enviada correctamente.", "success");
  } catch (error) {
    Swal.close();
    Swal.fire("Error", "No se pudo enviar la candidatura.", "error");
    console.error(error);
  }
}
</script>

<style scoped>
.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.colorIconGreen {
  background-color: #63ceb0;
  color: white;
}

.c-details span {
  font-weight: 300;
  font-size: 13px;
}

.icon {
  width: 45px;
  height: 45px;
  background-color: #eee;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  /*color: #16d39a*/
}

.formulario::v-deep(iframe) {
  width: 100% !important;
  height: 100% !important;
}

.formulario::v-deep(iframe) {
  width: 100% !important;
}

.modal.fade .modal-dialog {
  -webkit-transition: -webkit-transform 0.3s ease-out;
  -moz-transition: -moz-transform 0.3s ease-out;
  -o-transition: -o-transform 0.3s ease-out;
  transition: transform 0.3s ease-out;
}

/* @media only screen and (max-device-width: 801px) and (min-device-width: 320px) and (-webkit-min-device-pixel-ratio: 3) {
      //     #formulario {
      //         width: 23rem;
      //     }
      }*/

/*test2*/
#test2 {
  background: #333;
  background: -webkit-gradient(
    radial,
    center center,
    120,
    center center,
    900,
    from(#33495e),
    to(#2e2329)
  );
  background: -moz-radial-gradient(circle, #33495e, #2e2329);
}

.loader2 {
  margin: 80px auto;
}

h1 {
  font-family: "Actor", sans-serif;
  color: #fff;
  font-size: 16px;
  letter-spacing: 1px;
  font-weight: 200;
  text-align: center;
}

.loader2 span {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  position: absolute;
  left: 50%;
  margin-left: -10px;
  -webkit-animation: 3s infinite linear;
  -moz-animation: 3s infinite linear;
  -o-animation: 3s infinite linear;
}

.loader2 span:nth-child(2) {
  background: #e84c3d;
  -webkit-animation: kiri 1.2s infinite linear;
  -moz-animation: kiri 1.2s infinite linear;
  -o-animation: kiri 1.2s infinite linear;
}

.loader2 span:nth-child(3) {
  background: #f1c40f;
  z-index: 100;
}

.loader2 span:nth-child(4) {
  background: #2fcc71;
  -webkit-animation: kanan 1.2s infinite linear;
  -moz-animation: kanan 1.2s infinite linear;
  -o-animation: kanan 1.2s infinite linear;
}

#btnCV {
  background: #e66c5a !important;
  color: #fff !important;
  font-weight: bold;
  border: none;
  border-radius: 0.3rem;
  padding: 0.6rem 1.2rem;
  transition:
    background 0.2s,
    color 0.2s;
}

.quitarFondo {
  background-color: white !important;
}

@-webkit-keyframes kanan {
  0% {
    -webkit-transform: translateX(20px);
  }

  50% {
    -webkit-transform: translateX(-20px);
  }

  100% {
    -webkit-transform: translateX(20px);
    z-index: 200;
  }
}

@-moz-keyframes kanan {
  0% {
    -moz-transform: translateX(20px);
  }

  50% {
    -moz-transform: translateX(-20px);
  }

  100% {
    -moz-transform: translateX(20px);
    z-index: 200;
  }
}

@-o-keyframes kanan {
  0% {
    -o-transform: translateX(20px);
  }

  50% {
    -o-transform: translateX(-20px);
  }

  100% {
    -o-transform: translateX(20px);
    z-index: 200;
  }
}

@-webkit-keyframes kiri {
  0% {
    -webkit-transform: translateX(-20px);
    z-index: 200;
  }

  50% {
    -webkit-transform: translateX(20px);
  }

  100% {
    -webkit-transform: translateX(-20px);
  }
}

@-moz-keyframes kiri {
  0% {
    -moz-transform: translateX(-20px);
    z-index: 200;
  }

  50% {
    -moz-transform: translateX(20px);
  }

  100% {
    -moz-transform: translateX(-20px);
  }
}

@-o-keyframes kiri {
  0% {
    -o-transform: translateX(-20px);
    z-index: 200;
  }

  50% {
    -o-transform: translateX(20px);
  }

  100% {
    -o-transform: translateX(-20px);
  }
}

#bodycard {
  background-color: #ddd;
}

.loading {
  position: relative;
  width: 500px;
  height: 120px;
  margin: 0 auto;
}

.loading .cloud {
  position: absolute;
  top: 50px;
  left: 10px;
  width: 170px;
  height: 60px;
  border-radius: 25%/75%;
  background-color: #fdfdfd;
  animation: pulse 2500ms;
  animation-iteration-count: infinite;
  z-index: 1;
}

.loading .cloud:before {
  content: " ";
  position: absolute;
  top: -23px;
  left: 25px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #fdfdfd;
}

.loading .cloud:after {
  content: " ";
  position: absolute;
  top: -40px;
  left: 60px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: #fdfdfd;
}

.loading .data {
  font-family: monospace;
  position: absolute;
  top: 60px;
  left: 120px;
  z-index: 0;
}

.loading .data > span {
  display: inline-block;
  animation: flyby 2.5s;
  animation-iteration-count: infinite;
  transform: translate(0, 0);
  padding: 3px;
}

.loading .data > span:nth-child(7) {
  animation-delay: 140ms;
}

.loading .data > span:nth-child(6) {
  animation-delay: 280ms;
}

.loading .data > span:nth-child(5) {
  animation-delay: 420ms;
}

.loading .data > span:nth-child(4) {
  animation-delay: 560ms;
}

.loading .data > span:nth-child(3) {
  animation-delay: 700ms;
}

.loading .data > span:nth-child(2) {
  animation-delay: 840ms;
}

.loading .data > span:nth-child(1) {
  animation-delay: 980ms;
}

.loading .browser {
  position: absolute;
  right: 0px;
  top: 10px;
  width: 140px;
  height: 100px;
  border-radius: 4px;
  background-color: #aaa;
  z-index: 1;
}

.loading .browser:before {
  content: " ";
  position: absolute;
  height: 78px;
  bottom: 2px;
  left: 2px;
  right: 2px;
  border-radius: 0 0 2px 2px;
  opacity: 0.9;
  background-color: white;
  z-index: 2;
}

.loading .browser:after {
  content: " ";
  position: absolute;
  height: 78px;
  bottom: 2px;
  left: 2px;
  right: 2px;
  border-radius: 0 0 2px 2px;
  opacity: 0.9;
  background-color: #8cb6d8;
  z-index: 2;
  animation: fill 2.5s;
  animation-iteration-count: infinite;
}

.loading .browser .buttons {
  display: inline-block;
  position: absolute;
  left: 20px;
  top: 5px;
  float: left;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ffc107;
  opacity: 0.8;
}

.loading .browser .buttons:before {
  content: " ";
  display: inline-block;
  position: absolute;
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #f44336;
}

.loading .browser .buttons:after {
  content: " ";
  display: inline-block;
  position: absolute;
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4caf50;
}

@keyframes pulse {
  7% {
    transform: scale(1, 1);
  }

  14% {
    transform: scale(1.1, 1.1);
  }

  30% {
    transform: scale(1, 1);
  }
}

@keyframes fill {
  0% {
    height: 0px;
    opacity: 1;
  }

  35% {
    height: 0px;
  }

  89% {
    height: 78px;
  }

  89% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes flyby {
  0% {
    transform: translate(0px, 0);
    opacity: 1;
    animation-timing-function: ease-out;
  }

  7% {
    transform: translate(60px, 0);
    animation-timing-function: linear;
  }

  30% {
    transform: translate(80px, 0);
    animation-timing-function: linear;
  }

  40% {
    transform: translate(230px, 0);
    animation-timing-function: ease-out;
  }

  60% {
    transform: translate(240px, 0);
    animation-timing-function: ease-out;
  }

  100% {
    transform: translate(240px, 0);
    opacity: 0;
  }
}
</style>
