<template>
  <div class="row justify-content-center">
    <div class="card mt-4 col-12 col-sm-12 col-xl-12">
      <div class="card-header">
        <div class="row">
          <div class="col">
            <button
              class="w-100"
              :class="{
                colorActive: verMisIncidencias == true,
                colorInactive: verMisIncidencias == false,
              }"
              @click="verMisIncidencias = true"
            >
              Mis Incidencias
            </button>
          </div>
          <div class="col">
            <button
              class="w-100"
              :class="{
                colorActive: verMisIncidencias == false,
                colorInactive: verMisIncidencias == true,
              }"
              @click="verMisIncidencias = false"
            >
              Abrir Incidencia
            </button>
          </div>
        </div>
      </div>
      <div class="row justify-content-center">
        <template v-if="verMisIncidencias == true">
          <!-- filtros -->
          <div v-if="hasPermission('VerFiltrosIncidencias')" class="row">
            <div class="col-6 col-sm-6 col-xl-3">
              <button class="btn-primary w-100" @click="getAllIncidencias()">Todas</button>
            </div>
            <div class="col-6 col-sm-6 col-xl-3">
              <select
                v-model="estado"
                class="form-select"
                aria-label="Default select example"
                @change="getAllByEstado()"
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="EN CURSO">EN CURSO</option>
                <option value="RESUELTA">RESUELTA</option>
                <option value="CERRADA">CERRADA</option>
              </select>
            </div>
            <div class="col-6 col-sm-6 col-xl-3">
              <select
                v-model="categoria"
                class="form-select"
                aria-label="Default select example"
                @change="getAllByCategoria()"
              >
                <option value="Problemas con la cuenta">Problemas con la cuenta</option>
                <option
                  v-if="hasPermission('VerIncidenciasCategoriaAdmin')"
                  value="Problemas con alguna funcionalidad"
                >
                  Problemas con alguna funcionalidad
                </option>
                <option value="General">General</option>
                <option
                  v-if="hasPermission('VerIncidenciasCategoriaAdmin')"
                  value="Pregunta sobre privacidad"
                >
                  Pregunta sobre privacidad
                </option>
                <option
                  v-if="hasPermission('VerIncidenciasCategoriaAdmin')"
                  value="Eliminar cuenta"
                >
                  Eliminar cuenta
                </option>
                <option
                  v-if="hasPermission('VerIncidenciasCategoriasRRHH')"
                  value="Problemas con mi bolsa de horas"
                >
                  Problemas con mi bolsa de horas
                </option>
              </select>
            </div>
            <div class="col-6 col-sm-6 col-xl-3 mt-1">
              <select
                v-model="prioridad"
                class="form-select"
                aria-label="Default select example"
                @change="getAllByPrioridad()"
              >
                <option value="Urgente">Urgente</option>
                <option value="Muy urgente">Muy urgente</option>
                <option value="Puede esperar">Puede esperar</option>
              </select>
            </div>
          </div>

          <div v-if="incidencias" class="col-xl-8 col-md-8 card-body">
            <card>
              <list-group light>
                <template v-for="(incidencia, index) in datos" :key="index">
                  <div>
                    <list-group
                      :class="{
                        'lista d-flex justify-content-between align-items-center': true,
                        'rrhh-destinatario': incidencia.destinatario === 'rrhh',
                      }"
                      @click="verIncidencia(incidencia._id)"
                    >
                      <div class="me-2">
                        <div class="fw-bold p-1">
                          {{ incidencia.nombre }}
                        </div>
                        <div class="text-muted p-1">
                          {{ incidencia.categoria.substr(0, 20) }}...
                        </div>
                        <div
                          class="text-muted p-1"
                          v-if="incidencia.telefono && hasPermission('VerTodasIncidencias')"
                        >
                          {{ incidencia.telefono }}
                        </div>
                        <div class="text-muted p-1" v-else-if="incidencia.tienda">
                          {{ incidencia.tienda }}
                        </div>
                      </div>
                      <div>
                        <span
                          :class="{
                            'text-warning': incidencia.estado == 'EN CURSO',
                            'text-danger': incidencia.estado == 'PENDIENTE',
                            'text-success': incidencia.estado == 'RESUELTA',
                            'text-primary': incidencia.estado == 'CERRADA',
                          }"
                          class="d-inline fw-bold"
                        >
                          {{ incidencia.estado }}
                        </span>
                        <br />
                        <div class="d-flex">
                          <span class="text-muted me-2 text-button">
                            {{ incidencia.fechaCreacion }}
                          </span>
                          <span>
                            <button
                              class="btn btn-outline-danger btn-circle ms-2"
                              style="
                                width: 2.2rem;
                                height: 2.2rem;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: 50%;
                              "
                              @click.stop="borrarIncidencia(incidencia._id)"
                              title="Borrar incidencia"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                    </list-group>
                  </div>
                </template>
              </list-group>
            </card>
          </div>

          <div class="row justify-content-center">
            <div
              v-if="hayIncidencias && datos.length === 0"
              class="col-xl-6 col-xs-12 col-12 col-lg-6 text-center"
            >
              <figure class="figure">
                <img
                  src="@/assets/img/nodata.png"
                  class="rounded mx-auto d-block mt-3 img-fluid"
                  alt="..."
                  style="width: 70%"
                />
                <figcaption class="figure-caption text-center">
                  No hay incidencias que mostrar
                </figcaption>
              </figure>
            </div>
            <div v-if="loading" class="wrap mt-4 text-center">
              <div class="loading">
                <div class="bounceball" />
                <div class="text">Cargando Información</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <CrearIncidencias ref="crearIncidenciasRef" />
        </template>
      </div>
    </div>
  </div>

  <!-- Detalles incidencia -->
  <div
    class="modal"
    :class="{ show: detallesIncidenciaModal }"
    tabindex="-1"
    style="display: block"
    v-if="detallesIncidenciaModal"
    aria-labelledby="detallesIncidenciaModalTitle"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="detallesIncidenciaModalTitle">
            {{ inciMostrar.categoria }}
          </h5>
          <button type="button" class="btn-close" @click="detallesIncidenciaModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="c-details">
              <h6 class="mb-0">
                {{ inciMostrar.nombre }}
              </h6>
              <span class="text-muted">{{ inciMostrar.fechaCreacion }}</span>
              <div>
                <span class="text-muted">{{ inciMostrar.prioridad }}</span>
              </div>
              <div
                class="card mb-3"
                style="max-width: 15rem"
                v-if="inciMostrar.file !== null && inciMostrar.file2 !== null"
              >
                <img
                  :src="inciMostrar.file"
                  alt="imagen"
                  class="w-100"
                  style="cursor: pointer"
                  @click="abrirImagenEnNuevaVentana(inciMostrar.file2)"
                />
              </div>
            </div>
            <div class="col-12">
              {{ inciMostrar.descripcion }}
            </div>
            <hr />
            <h6 class="mb-0">Mensajes</h6>
            <template v-for="(mensaje, index) in inciMostrar.mensajes" :key="index">
              <div :class="{ 'text-end': usuario.displayName == mensaje.nombre }" class="c-details">
                <h6 class="mb-0">
                  {{ mensaje.nombre }}
                </h6>
              </div>
              <div :class="{ 'text-end': usuario.displayName == mensaje.nombre }" class="c-details">
                <span class="text-muted">{{ mensaje.fechaResp }}</span> <br />
                <span class="text-muted">{{ mensaje.mensaje }}</span>
              </div>
            </template>
          </div>
        </div>
        <div class="modal-footer">
          <div v-if="hasPermission('CambiarEstadoDestinatarioIncidencia')" class="row w-100">
            <div class="col-6">
              <select
                v-model="estadoSeleccionado"
                class="form-select"
                aria-label="Default select example"
                @change="cambiarEstado()"
              >
                <option selected>CAMBIAR ESTADO</option>
                <option class="text-warning" value="EN CURSO">EN CURSO</option>
                <option class="text-success" value="RESUELTA">RESUELTA</option>
                <option class="text-danger" value="PENDIENTE">PENDIENTE</option>
                <option class="text-primary" value="CERRADA">CERRADA</option>
              </select>
            </div>
            <div class="col-6">
              <select
                v-model="destinatarioSeleccionado"
                class="form-select"
                aria-label="Default select example"
                @change="cambiarDestinatario()"
              >
                <option selected>CAMBIAR DESTINATARIO</option>
                <option value="tecnicos">tecnicos</option>
                <option value="rrhh">rrhh</option>
              </select>
            </div>
          </div>
          <button
            v-if="inciMostrar.estado == 'PENDIENTE' || inciMostrar.estado == 'EN CURSO'"
            class="btn btn-success"
            @click="responder()"
          >
            Responder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CrearIncidencias from "@/components/Incidencias/CrearIncidenciasComponent.vue";
import { obtenerUrlImagen } from "@/components/firebase/storage";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "@/stores/user";
import { hasPermission } from "@/components/rolesPermisos";
import { DateTime } from "luxon";

const detallesIncidenciaModal = ref(false);
const store = useUserStore();
const loading = ref(false);
const hayIncidencias = ref(true);
const verMisIncidencias = ref(true);
const user = computed(() => store.user);

const incidencias = ref();
const inciMostrar = ref();
const usuario = ref();
const estadoSeleccionado = ref("CAMBIAR ESTADO");
const destinatarioSeleccionado = ref("CAMBIAR DESTINATARIO");
const crearIncidenciasRef = ref(null);
const estado = ref(null);
const categoria = ref(null);
const prioridad = ref(null);
interface Incidencia {
  _id: string;
  nombre: string;
  categoria: string;
  telefono?: string;
  tienda?: string;
  estado: string;
  fechaCreacion: string;
  file?: string;
  file2?: string;
  destinatario?: string;
  prioridad?: string;
  descripcion?: string;
  mensajes?: Array<any>;
}

const datos = ref<Incidencia[]>([]);
const imagenUrl = ref([]);

//ver Incidencias
async function verIncidencia(id: string) {
  datos.value.forEach((element) => {
    if (element._id == id) {
      inciMostrar.value = element;
    }
  });
  detallesIncidenciaModal.value = true;
  imagenUrl.value = [];

  if (inciMostrar.value.file && inciMostrar.value.file.length > 0) {
    const url = await obtenerUrlImagen(inciMostrar.value.file);
    inciMostrar.value.file = url;
    inciMostrar.value.file2 = url;
  }
}

//Responder incidencias
async function responder() {
  const hoy = DateTime.now().toFormat("dd/MM/yyyy HH:mm");
  const usuario = user.value;
  const { value: text } = await Swal.fire({
    input: "textarea",
    inputLabel: "Respuesta",
    inputPlaceholder: "Escribe tu mensaje...",
    inputAttributes: {
      "aria-label": "Respuesta",
    },
    showCancelButton: true,
  });
  if (text) {
    inciMostrar.value.mensajes.push({
      nombre: usuario.displayName,
      fechaResp: hoy,
      mensaje: text,
    });
    axiosInstance
      .post("/incidencias/updateIncidenciaMensajes", inciMostrar.value)
      .then((response) => {
        if (response.data.ok) {
          detallesIncidenciaModal.value = false;
          Swal.fire({
            icon: "success",
            title: "Perfecto",
            text: "Mensaje Enviado",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    Swal.fire({
      icon: "error",
      title: "Upss...",
      text: "Debes de escribir tu mensaje",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  }
}

// Cambiar estado incidencia

async function cambiarEstado() {
  if (estadoSeleccionado.value == "CAMBIAR ESTADO" || "") {
    Swal.fire({
      icon: "error",
      title: "Error...",
      text: "Selecciona el nuevo estado",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  } else {
    if (estadoSeleccionado.value == inciMostrar.value.estado) {
      detallesIncidenciaModal.value = false;
    } else {
      inciMostrar.value.estado = estadoSeleccionado.value;

      const respPostUpdate = await axiosInstance.post(
        "incidencias/updateIncidenciaEstado",
        inciMostrar.value,
      );
      if (respPostUpdate.data.ok) {
        detallesIncidenciaModal.value = false;
        estadoSeleccionado.value = "CAMBIAR ESTADO";
        Swal.fire({
          icon: "success",
          title: "Perfecto...",
          text: "Estado cambiado",
          showConfirmButton: false,
          timer: 500,
          timerProgressBar: true,
        });
      }
      getAllIncidencias();
    }
  }
}

//cambiar Destinatario
async function cambiarDestinatario() {
  if (destinatarioSeleccionado.value == "CAMBIAR DESTINATARIO" || "") {
    Swal.fire({
      icon: "error",
      title: "Error...",
      text: "Selecciona el nuevo Destinatario",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  } else {
    if (destinatarioSeleccionado.value == inciMostrar.value.destinatario) {
      detallesIncidenciaModal.value = false;
    } else {
      inciMostrar.value.destinatario = destinatarioSeleccionado.value;

      const respPostUpdate = await axiosInstance.post(
        "incidencias/updateIncidenciaDestinatario",
        inciMostrar.value,
      );
      if (respPostUpdate.data.ok) {
        detallesIncidenciaModal.value = false;
        destinatarioSeleccionado.value = "CAMBIAR DESTINATARIO";
        Swal.fire({
          icon: "success",
          title: "Perfecto...",
          text: "Destinatario cambiado",
          showConfirmButton: false,
          timer: 500,
          timerProgressBar: true,
        });
      }
      getAllIncidencias();
    }
  }
}

//mostrar todas las incidencias
async function getAllIncidencias() {
  loading.value = true;
  datos.value = [];
  estado.value = null;
  categoria.value = null;
  prioridad.value = null;
  hayIncidencias.value = false;

  if (hasPermission("VerTodasIncidencias")) {
    try {
      const respGetAllIncidencias = await axiosInstance.get("incidencias/getIncidencias");
      if (respGetAllIncidencias.data.ok) {
        incidencias.value = true;
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetAllIncidencias.data.data;
        datos.value = datos.value.filter(
          (incidencia) => incidencia.estado !== "CERRADA" && incidencia.estado !== "RESUELTA",
        ); // Filtrar incidencias con estado "CERRADA" y "RESUELTA"
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  } else if (hasPermission("VerTodasIncidenciasRRHH")) {
    try {
      const respGetAllIncidencias = await axiosInstance.get("incidencias/getIncidenciasRrhh");
      if (respGetAllIncidencias.data.ok) {
        incidencias.value = true;
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetAllIncidencias.data.data;
        datos.value = datos.value.filter(
          (incidencia) => incidencia.estado !== "CERRADA" && incidencia.estado !== "RESUELTA",
        ); // Filtrar incidencias con estado "CERRADA" y "RESUELTA"
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    const usuario = user.value;
    try {
      const respGetUidIncidencias = await axiosInstance.get("incidencias/getIncidenciasByUid", {
        params: {
          uid: usuario.uid,
        },
      });
      if (respGetUidIncidencias.data.ok) {
        incidencias.value = true;
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetUidIncidencias.data.data;
        datos.value = datos.value.filter((incidencia) => incidencia.estado !== "CERRADA"); // Filtrar incidencias con estado "CERRADA"
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  }
  usuario.value = user.value;
}

//mostrar por estado
async function getAllByEstado() {
  loading.value = true;
  datos.value = [];
  hayIncidencias.value = false;
  categoria.value = null;
  prioridad.value = null;
  if (hasPermission("VerEstadoIncidenciasAdmin")) {
    try {
      const respGetEstados = await axiosInstance.get("incidencias/getIncidenciasEstado", {
        params: {
          estado: estado.value,
        },
      });
      if (respGetEstados.data.ok) {
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetEstados.data.data;
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  } else if (hasPermission("VerEstadoIncidenciasRRHH")) {
    try {
      const respGetEstados = await axiosInstance.get("incidencias/getIncidenciasEstadoRrhh", {
        params: {
          estado: estado.value,
        },
      });
      if (respGetEstados.data.ok) {
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetEstados.data.data;
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

//mostrar por categoria
async function getAllByCategoria() {
  loading.value = true;
  datos.value = [];
  hayIncidencias.value = false;
  estado.value = null;
  prioridad.value = null;
  if (hasPermission("VerIncidenciasCategoriaAdmin")) {
    try {
      const respGetCategorias = await axiosInstance.get("incidencias/getIncidenciasByCategoria", {
        params: {
          categoria: categoria.value,
        },
      });
      if (respGetCategorias.data.ok) {
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetCategorias.data.data;
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  } else if (hasPermission("VerIncidenciasCategoriasRRHH")) {
    try {
      const respGetCategorias = await axiosInstance.get(
        "incidencias/getIncidenciasByCategoriaRrhh",
        {
          params: {
            categoria: categoria.value,
          },
        },
      );
      if (respGetCategorias.data.ok) {
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetCategorias.data.data;
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

//mostrar por prioridad
async function getAllByPrioridad() {
  loading.value = true;
  datos.value = [];
  hayIncidencias.value = false;
  estado.value = null;
  categoria.value = null;
  if (hasPermission("VerIncidenciasPrioridadAdmin")) {
    try {
      const respGetPrioridad = await axiosInstance.get("incidencias/getIncidenciasByPrioridad", {
        params: {
          prioridad: prioridad.value,
        },
      });
      if (respGetPrioridad.data.ok) {
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetPrioridad.data.data;
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  } else if (hasPermission("VerIncidenciasPrioridadRRHH")) {
    try {
      const respGetPrioridad = await axiosInstance.get(
        "incidencias/getIncidenciasByPrioridadRrhh",
        {
          params: {
            prioridad: prioridad.value,
          },
        },
      );
      if (respGetPrioridad.data.ok) {
        loading.value = false;
        hayIncidencias.value = true;
        datos.value = respGetPrioridad.data.data;
        datos.value.sort((a, b) => compareDates(b.fechaCreacion, a.fechaCreacion));
      } else {
        loading.value = false;
        hayIncidencias.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

//Borrar incidencia
function borrarIncidencia(id: any) {
  detallesIncidenciaModal.value = false;
  hayIncidencias.value = false;
  try {
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
        const res = await axiosInstance.post("incidencias/deleteIncidencia", {
          _id: id,
        });
        if (res.data.ok) {
          getAllIncidencias();
          Swal.fire({
            icon: "success",
            title: "Perfecto",
            text: `Incidencia borrada`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        } else throw Error("No se ha podido borrar esta incidencia");
        if (res.data.ok) {
          getAllIncidencias();
          Swal.fire({
            icon: "success",
            title: "Perfecto",
            text: `Incidencia borrada`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        } else throw Error("No se ha podido borrar esta incidencia");
      }
    });
  } catch (err) {
    console.log(err);
    let message = "Ha ocurrido un error";
    if (err instanceof Error) {
      message = err.message;
    }
    Swal.fire("Oops...", message, "error");
  }
}

function compareDates(dateStr1: any, dateStr2: any) {
  const date1 = convertToDate(dateStr1);
  const date2 = convertToDate(dateStr2);

  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

function convertToDate(dateStr: string) {
  const [day, month, year] = dateStr.split("/");
  const formattedDateStr = `${month}/${day}/${year}`;
  return new Date(formattedDateStr);
}

function abrirImagenEnNuevaVentana(url: string) {
  window.open(url, "_blank");
}

onMounted(() => {
  getAllIncidencias();
});
</script>

<style scoped>
.c-details span {
  font-weight: 300;
  font-size: 13px;
}

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

.lista {
  transition: transform 0.2s;
}

.lista:hover {
  transform: scale(1.01);
  background-color: rgb(107, 241, 168);
}

.rrhh-destinatario:hover {
  background-color: #85f3ee;
}

.text {
  color: #fbae17;
  display: inline-block;
  margin-left: 5px;
}

.bounceball {
  position: relative;
  display: inline-block;
  height: 37px;
  width: 15px;
}

.bounceball:before {
  position: absolute;
  content: "";
  display: block;
  top: 0;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #fbae17;
  transform-origin: 50%;
  -webkit-animation: bounce 500ms alternate infinite ease;
  animation: bounce 500ms alternate infinite ease;
}

.card-header {
  background: none !important;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

@-webkit-keyframes bounce {
  0% {
    top: 30px;
    height: 5px;
    border-radius: 60px 60px 20px 20px;
    transform: scaleX(2);
  }

  35% {
    height: 15px;
    border-radius: 50%;
    transform: scaleX(1);
  }

  100% {
    top: 0;
  }
}

@keyframes bounce {
  0% {
    top: 30px;
    height: 5px;
    border-radius: 60px 60px 20px 20px;
    transform: scaleX(2);
  }

  35% {
    height: 15px;
    border-radius: 50%;
    transform: scaleX(1);
  }

  100% {
    top: 0;
  }
}
.modal {
  background: rgba(0, 0, 0, 0.35);
  display: flex !important;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  overflow-y: auto;
  padding: 1.5rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.modal-dialog {
  margin: 0 auto;
  max-width: 650px;
  width: 95vw;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  background: transparent;
  display: flex;
  flex-direction: column;
}

.modal-content {
  border-radius: 1rem;
  border: none;
  background: #fff;
  box-shadow: 0 4px 24px rgba(230, 108, 90, 0.1);
  animation: modalIn 0.25s;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

@keyframes modalIn {
  from {
    transform: translateY(40px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
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

.modal-footer {
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
  .modal-footer {
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
  .modal-footer {
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
</style>
