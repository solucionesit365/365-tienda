<template>
  <router-link to="/crearAuditoria" class="text-decoration-none">
    <button color="success" class="ms-4"><i class="fas fa-plus" /> Nueva</button>
  </router-link>

  <div class="row mt-3">
    <div class="col-12 col-sm-12 col-xl-12">
      <div class="card border-top border-5">
        <div class="card-header">
          <button
            :class="{
              colorActive: verAuditorias == true,
              colorInactive: verAuditorias == false,
            }"
            @click="
              verAuditorias = true;
              cargarAuditorias();
            "
          >
            Auditorias <i class="fa-solid fa-lock-open"></i>
          </button>
          <button
            :class="{
              colorActive: verAuditorias == false,
              colorInactive: verAuditorias == true,
            }"
            @click="
              verAuditorias = false;
              cargarAuditoriasDeshabilitadas();
            "
          >
            Deshabilitadas <i class="fa-solid fa-lock"></i>
          </button>
        </div>
        <div v-if="loading" class="row text-center mt-2">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <template v-else>
          <div v-if="verAuditorias == true" class="card-body">
            <div class="row justify-content-center mt-2">
              <div
                v-for="(audi, index) in auditorias"
                v-bind:key="index"
                class="col-xl-4 col-xs-12 col-12 col-lg-4"
              >
                <template v-if="audi && audi.habilitado">
                  <div class="card p-2 mb-2">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div class="d-flex flex-row align-items-center">
                          <div class="icon">
                            <i class="fas fa-clipboard-list" />
                          </div>
                          <div class="ms-2 c-details">
                            <h6 class="mb-0">{{ audi.tituloAuditoria }}</h6>
                            <span class="text-muted"
                              >Caduca: {{ parseFecha2(audi.caducidad).toFormat("dd/LL/y") }}</span
                            >
                          </div>
                        </div>
                      </div>
                      <div class="row mt-4">
                        <div class="col-12">{{ audi.descripcion }}</div>
                      </div>
                    </div>
                    <div class="card-footer text-end">
                      <button @click="respuestasAuditorias(audi._id)" color="success">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button @click="deshabilitarAudi(audi)" color="info">
                        <i class="fa-solid fa-lock"></i>
                      </button>
                      <button @click="abrirModalEdita(audi)" color="warning">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="eliminarAuditoria(audi)" color="danger">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="!hayResultadosHabilitadas" class="text-center">
              <figure class="figure">
                <img
                  src="@/assets/img/nodata.png"
                  class="rounded mx-auto d-block mt-3 img-fluid"
                  alt="..."
                  style="width: 80%"
                />
                <figcaption class="figure-caption text-center">
                  No hay Auditorias habilitadas
                </figcaption>
              </figure>
            </div>
          </div>
        </template>

        <!-- Auditorias deshabilitadas -->
        <div v-if="verAuditorias == false" class="card-body">
          <div class="row justify-content-center mt-2">
            <div
              v-for="(audi, index) in auditoriasDeshabilitadas"
              v-bind:key="index"
              class="col-xl-4 col-xs-12 col-12 col-lg-4"
            >
              <template v-if="!audi.habilitado">
                <div class="card p-2 mb-2">
                  <div class="card-body">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex flex-row align-items-center">
                        <div class="icon">
                          <i class="fas fa-clipboard-list" />
                        </div>
                        <div class="ms-2 c-details">
                          <h6 class="mb-0">{{ audi.tituloAuditoria }}</h6>
                          <span class="text-muted"
                            >Caduca: {{ parseFecha2(audi.caducidad).toFormat("dd/LL/y") }}</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="row mt-4">
                      <div class="col-12">{{ audi.descripcion }}</div>
                    </div>
                  </div>
                  <div class="card-footer text-end">
                    <button @click="respuestasAuditorias(audi._id)" color="success">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button @click="habilitarAudi(audi)" color="info">
                      <i class="fa-solid fa-lock-open"></i>
                    </button>
                    <button @click="abrirModalEdita(audi)" color="warning">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="eliminarAuditoria(audi)" color="danger">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div v-if="!hayResultadosDeshabilitadas" class="text-center">
            <figure class="figure">
              <img
                src="@/assets/img/nodata.png"
                class="rounded mx-auto d-block mt-3 img-fluid"
                alt="..."
                style="width: 80%"
              />
              <figcaption class="figure-caption text-center">
                No hay Auditorias deshabilitadas
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>
  <RespuestasAuditoriasComponent ref="respuestasAuditoriasRef" />
  <!-- Editar Auditoria -->
  <div
    class="input-group mb-3 modal"
    tabindex="-1"
    id="modalEditarAuditoria"
    labelledby="modalEditarAuditoriaTitle"
    centered
  >
    <span class="input-group-text" id="basic-addon1">@</span>
    <input
      type="text"
      class="form-control"
      placeholder="Username"
      aria-label="Username"
      aria-describedby="basic-addon1"
    />
  </div>
  >
  <div class="modal-body" v-if="auditoriaSeleccionada">
    <div class="row">
      <div class="card-title">
        <!-- modificar titulo -->
        <div class="input-group mb-3 col-auto" label="Titulo" style="outline: none">
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
        <div class="input-group mb-3 col-auto" label="Descripción">
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
      <!-- modificar caducidad -->
      <div class="col-auto">
        <div class="form-text">
          Caducidad
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-container="body"
            data-bs-toggle="popover"
            data-bs-placement="right"
            data-bs-content="Right popover"
          >
            Finalizada esta fecha la auditoría será deshabilitado.
          </button>
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label fw-bold" for="caducidadAuditoria">Caducidad</label>
          <div class="col-md-4 mb-3">
            <label class="form-label fw-bold" for="caducidadAuditoria">Caducidad</label>
            <input
              type="date"
              v-model="auditoriaSeleccionada.caducidad"
              id="caducidadAuditoria"
              class="form-control"
              required
              input-toggle
              format="DD/MM/YYYY"
            />
            <div class="form-text">Finalizada esta fecha la auditoría será deshabilitada.</div>
          </div>

          <div class="form-text">Finalizada esta fecha la auditoría será deshabilitada.</div>
        </div>
        v-model="auditoriaSeleccionada.caducidad" input-toggle format="DD/MM/YYYY" />
      </div>
      <!-- modificar Tiendas -->
      <div class="col-auto">
        <div class="form-text">Tienda</div>
        <select v-model="auditoriaSeleccionada.tienda" class="form-select">
          <option v-for="tienda in tiendas" :key="tienda.value" :value="tienda.value">
            {{ tienda.text }}
          </option>
        </select>
      </div>
      <!-- modificar categoria -->
      <div class="col-auto mb-3">
        <div class="form-text">Categoría</div>
        <select
          v-model="auditoriaSeleccionada.categoria"
          class="form-select"
          aria-label="Default select example"
        >
          <option value="Coordinadora A">Coordinadora A</option>
          <option value="Coordinadora B">Coordinadora B</option>
          <option value="Supervisora">Supervisora</option>
          <option value="Dependienta A">Dependienta A</option>
          <option value="Dependienta B">Dependienta B</option>
          <option value="Dependienta C">Dependienta C</option>
          <option value="Barista">Barista</option>
          <option value="Aprendiz">Aprendiz</option>
          <option value="Todas">Todas</option>
        </select>
      </div>
      <!-- modificar preguntas generales -->
      <div class="accordion mb-3" v-if="auditoriaSeleccionada.preguntas.length > 0" borderless>
        <div
          class="accordion-item, border border-success"
          headerTitle="PREGUNTAS"
          v-for="(item, index) in auditoriaSeleccionada.preguntas"
          :key="index"
          :collapseId="`collapse${index}`"
        >
          <ul class="list-group" light style="min-width: 10rem">
            <li class="list-group-item">
              <div class="d-flex align-items-center">
                <span>{{ index + 1 }}</span>
                <input type="text" class="form-control mx-2" v-model="item.pregunta" />
              </div>
              <div class="mb-3">
                <div class="form-text">Tipo pregunta</div>
                <select v-model="item.tipo" class="form-select" aria-label="Default select example">
                  <option value="SINO">SI / NO</option>
                  <option value="RespESCRITA">Respuesta escrita</option>
                  <option value="rango">Rango</option>
                  <option value="ROJOVERDE">ROJO / VERDE</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- modificar preguntas dependienta A -->
      <div
        class="accordion mb-3"
        v-if="auditoriaSeleccionada.preguntasDependientaA.length > 0"
        borderless
      >
        <div
          class="accordion-item border border-info"
          headerTitle="PREGUNTAS Dependienta A"
          :collapseId="`collapse${itemIndex}`"
          v-for="(item, itemIndex) in auditoriaSeleccionada.preguntasDependientaA"
          :key="itemIndex"
        >
          <ul
            class="list-group"
            v-for="(item, index) in auditoriaSeleccionada.preguntasDependientaA"
            v-bind:key="index"
            light
            style="min-width: 10rem"
          >
            <li class="list-group-item">
              <div class="d-flex align-items-center">
                <span>{{ index + 1 }}</span>
                <input type="text" class="form-control mx-2" v-model="item.pregunta" />
              </div>
              <div class="mb-3">
                <div class="form-text">Tipo pregunta</div>
                <select v-model="item.tipo" class="form-select" aria-label="Default select example">
                  <option value="SINO">SI / NO</option>
                  <option value="RespESCRITA">Respuesta escrita</option>
                  <option value="rango">Rango</option>
                  <option value="ROJOVERDE">ROJO / VERDE</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- modificar preguntas dependienta b/C -->
      <div
        class="accordion mb-3"
        v-if="auditoriaSeleccionada.preguntasDependientaB_C.length > 0"
        borderless
      >
        <div
          class="accordion-item border border-info"
          headerTitle="PREGUNTAS Dependienta B/C"
          v-for="(item, index) in auditoriaSeleccionada.preguntasDependientaB_C"
          :key="index"
          :collapseId="`collapse${index}`"
        >
          <ul
            class="list-group"
            v-for="(item, index) in auditoriaSeleccionada.preguntasDependientaB_C"
            v-bind:key="index"
            light
            style="min-width: 10rem"
          >
            <li class="list-group-item">
              <div class="d-flex align-items-center">
                <span>{{ index + 1 }}</span>
                <input type="text" class="form-control mx-2" v-model="item.pregunta" />
              </div>
              <div class="mb-3">
                <div class="form-text">Tipo pregunta</div>
                <select v-model="item.tipo" class="form-select" aria-label="Default select example">
                  <option value="SINO">SI / NO</option>
                  <option value="RespESCRITA">Respuesta escrita</option>
                  <option value="rango">Rango</option>
                  <option value="ROJOVERDE">ROJO / VERDE</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- modificar preguntas responsables -->
      <div
        class="accordion mb-3"
        v-if="auditoriaSeleccionada.preguntasResponsable.length > 0"
        borderless
      >
        <div
          class="accordion-item border border-info"
          headerTitle="PREGUNTAS Responsables"
          v-for="(item, index) in auditoriaSeleccionada.preguntasResponsable"
          :key="index"
          :collapseId="`collapse${index}`"
        >
          <ul
            class="list-group"
            v-for="(item, index) in auditoriaSeleccionada.preguntasResponsable"
            v-bind:key="index"
            light
            style="min-width: 10rem"
          >
            <li class="list-group-item">
              <div class="d-flex align-items-center">
                <span>{{ index + 1 }}</span>
                <input type="text" class="form-control mx-2" v-model="item.pregunta" />
              </div>
              <div class="mb-3">
                <div class="form-text">Tipo pregunta</div>
                <select v-model="item.tipo" class="form-select" aria-label="Default select example">
                  <option value="SINO">SI / NO</option>
                  <option value="RespESCRITA">Respuesta escrita</option>
                  <option value="rango">Rango</option>
                  <option value="ROJOVERDE">ROJO / VERDE</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button color="secondary" @click="modalEditarAuditoria = false">Cerrar</button>
    <button color="primary" @click="editarAuditoria(auditoriaSeleccionada)">Modificar</button>
  </div>
</template>

<script setup lang="ts">
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import RespuestasAuditoriasComponent from "@/components/RespuestasAuditorias.vue";
import { DateTime } from "luxon";
import { onMounted, ref, type Ref } from "vue";

const verAuditorias = ref(true);
const auditorias: Ref<any[]> = ref([]);
const auditoriaSeleccionada: Ref<any> = ref(null);
const auditoriasDeshabilitadas: Ref<any[]> = ref([]);
const respuestasAuditoriasRef: Ref<any> = ref(null);
const modalEditarAuditoria: Ref<any> = ref(null);
const hayResultadosHabilitadas = ref(true);
const hayResultadosDeshabilitadas = ref(true);
const tiendas: Ref<any[]> = ref([]);
const loading = ref(true);

async function mostrarTiendas() {
  axiosInstance
    .get("auditorias/tiendasAuditoria")
    .then((resTiendas) => {
      if (!resTiendas.data?.ok) throw Error(resTiendas.data?.message);

      tiendas.value = resTiendas.data.data.map((tienda: any) => {
        return { value: tienda.id, text: tienda.nombre };
      });
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Oops...", "Ha habido un problema", "error");
    });
}

function abrirModalEdita(auditoria: any) {
  modalEditarAuditoria.value = true;
  auditoriaSeleccionada.value = auditoria;
  auditoriaSeleccionada.value.caducidad = parseFecha2(auditoria.caducidad).toFormat("dd/LL/y");
}

function cargarAuditorias() {
  hayResultadosHabilitadas.value = true;
  auditorias.value = [];
  loading.value = true;
  axiosInstance
    .get("auditorias/getAuditoriasHabilitado", {
      params: {
        habilitado: true,
      },
    })
    .then((response) => {
      const data = response.data;
      if (data.ok && data.data.length > 0) {
        auditorias.value = data.data;
        hayResultadosHabilitadas.value = true;
        loading.value = false;
      } else {
        hayResultadosHabilitadas.value = false;
        loading.value = false;
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function cargarAuditoriasDeshabilitadas() {
  auditoriasDeshabilitadas.value = [];
  hayResultadosDeshabilitadas.value = true;
  loading.value = true;
  axiosInstance
    .get("auditorias/getAuditoriasHabilitado", {
      params: {
        habilitado: false,
      },
    })
    .then((response) => {
      const data = response.data;
      if (data.ok && data.data.length > 0) {
        auditoriasDeshabilitadas.value = data.data;
        hayResultadosDeshabilitadas.value = true;
        loading.value = false;
      } else {
        hayResultadosDeshabilitadas.value = false;
        loading.value = false;
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function deshabilitarAudi(auditoria: any) {
  auditorias.value = [];
  axiosInstance
    .post("auditorias/updateDeshabilitarAuditoria", auditoria)
    .then((response) => {
      const data = response.data;
      if (data.ok) {
        cargarAuditorias();
      } else {
        throw new Error("No se ha podido deshabilitar la auditoría");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function habilitarAudi(auditoria: any) {
  auditoriasDeshabilitadas.value = [];
  axiosInstance
    .post("auditorias/updateHabilitarAuditoria", auditoria)
    .then((response) => {
      const data = response.data;
      if (data.ok) {
        cargarAuditoriasDeshabilitadas();
      } else {
        throw new Error("No se ha podido habilitar la auditoría");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function eliminarAuditoria(auditoria: any) {
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
      axiosInstance
        .post("auditorias/deleteAuditoria", auditoria)
        .then((response) => {
          if (response.data.ok) {
            cargarAuditorias();
            cargarAuditoriasDeshabilitadas();
            Swal.fire({
              icon: "success",
              title: "Perfecto",
              text: `Auditoria borrada`,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          } else {
            throw new Error("No se ha podido eliminar la auditoría");
          }
        })
        .catch((error) => {
          console.log(error);
          Swal.fire("Oops...", error.message, "error");
        });
    }
  });
}

function editarAuditoria(auditoria: any) {
  const fechaJSDate = parseFecha2(auditoria.caducidad).toJSDate();
  const auditoriaModificada = {
    ...auditoria,
    caducidad: fechaJSDate,
  };
  axiosInstance
    .post("auditorias/updateAuditoria", auditoriaModificada)
    .then((response) => {
      const data = response.data;
      if (data.ok) {
        modalEditarAuditoria.value = false;
        cargarAuditorias();
        Swal.fire({
          icon: "success",
          title: "Perfecto",
          text: `Auditoria Modificada`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        throw new Error("No se ha podido editar la auditoría");
      }
    })

    .catch((error) => {
      console.log(error);
    });
}

function respuestasAuditorias(idAuditoria: any) {
  respuestasAuditoriasRef.value.respuestasAuditorias(idAuditoria);
}

function parseFecha2(fecha: any) {
  if (!fecha) {
    return DateTime.now(); // O cualquier otro valor por defecto
  }

  if (typeof fecha === "string" && fecha.includes("/")) {
    // Formato DD/MM/YYYY
    const [day, month, year] = fecha.split("/");
    return DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else if (fecha instanceof Date) {
    // Si fecha es un objeto Date
    return DateTime.fromJSDate(fecha);
  } else {
    // Formato ISO
    return DateTime.fromISO(fecha);
  }
}

onMounted(() => {
  cargarAuditorias();
  mostrarTiendas();
});
</script>

<style scoped>
.card {
  border-radius: 1em;
  border: 1em;
  border-top-color: #03a9f4 !important;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
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
.card-detalles {
  border-radius: 1em;
  border: 1em;
  border-top-color: #57a791 !important;
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
  color: #16d39a;
}
</style>
