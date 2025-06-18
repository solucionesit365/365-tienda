<template>
  <div
    class="modal"
    tabindex="-1"
    id="respuestasAudiModal"
    labelledby="respuestasAudiModalLabel"
    fullscreen="sm-down"
    size="xl"
  >
    <div class="modal-body">
      <div class="row">
        <template v-for="(item, index) in respuestas" v-bind:key="index">
          <div class="col-12 col-sm-12 col-xl-2">
            <h6 class="text-center">¿QUIÉN HA RESPONDIDO?</h6>
            <button
              type="button"
              @click="mostrarRespuesta(item._id)"
              style="background-color: rgb(155, 221, 69)"
            >
              {{ item.tienda }} - {{ item.ultimaRespuesta }}
            </button>
            >
          </div>
        </template>
        <div
          class="col-12 col-sm-12 col-xl-7 border border-top-0 border-bottom-0 border-end-0"
          v-if="respuestaMostrar.length != 0"
        >
          <h6 class="text-center">RESPUESTAS:</h6>
          <div v-if="respuestaMostrar.length != 0">
            Respondido por: {{ respuestaMostrar.persona }}
            <template v-for="(pregunta, index) in respuestaMostrar.respuestas" v-bind:key="index">
              <ul>
                <li class="fw-bold">
                  {{ pregunta[0] }}
                </li>
                <div class="form-check required">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="radioDefault"
                    id="radioDefault1"
                    v-if="pregunta[1] == 'VERDE'"
                    :btnCheck="true"
                    :wrap="false"
                  />
                  <label class="form-check-label btn-success active" for="radioDefault1">
                    VERDE
                  </label>

                  />
                  <input
                    class="form-check-input"
                    type="radio"
                    name="radioDefault"
                    id="radioDefault1"
                    v-if="pregunta[1] == 'ROJO'"
                    :btnCheck="true"
                    :wrap="false"
                  />
                  <label
                    class="form-check-label btn-danger active"
                    for="radioDefault1"
                    disabled
                    active
                  >
                    ROJO
                  </label>
                </div>
                <MDBBtnGroup>
                  <MDBRadio
                    v-if="pregunta[1] == 'SI'"
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary active "
                    label="SI"
                  />
                  <MDBRadio
                    v-if="pregunta[1] == 'NO'"
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary active"
                    label="NO"
                  />
                </MDBBtnGroup>
                <template
                  v-if="
                    pregunta[1] != 'NO' &&
                    pregunta[1] != 'SI' &&
                    pregunta[1] != 'ROJO' &&
                    pregunta[1] != 'VERDE'
                  "
                >
                  {{ pregunta[1] }}
                </template>
                <!--Respuestas evaluador -->
                <!-- <MDBBtnGroup
                  class="ps-1"
                  required
                  v-if="
                    !respuestaMostrar.respuestasEvaluador ||
                    typeof respuestaMostrar.respuestasEvaluador[pregunta[0]] ===
                      'undefined'
                  "
                >
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-success active"
                    label="VERDE"
                    value="VERDE"
                    :name="pregunta[0]"
                    v-model="respuestasEvaluador[pregunta[0]]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-danger active"
                    label="ROJO"
                    value="ROJO"
                    :name="pregunta[0]"
                    v-model="respuestasEvaluador[pregunta[0]]"
                  />
                </MDBBtnGroup> -->

                <MDBBtnGroup
                  class="ps-2"
                  v-if="
                    !respuestaMostrar.respuestasEvaluador ||
                    typeof respuestaMostrar.respuestasEvaluador[pregunta[0]] === 'undefined'
                  "
                >
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="SI"
                    value="SI"
                    :disabled="
                      respuestaMostrar.respuestasEvaluador &&
                      respuestaMostrar.respuestasEvaluador.length != 0
                    "
                    :name="pregunta[0]"
                    v-model="respuestasEvaluador[pregunta[0]]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="NO"
                    value="NO"
                    :disabled="
                      respuestaMostrar.respuestasEvaluador &&
                      respuestaMostrar.respuestasEvaluador.length != 0
                    "
                    :name="pregunta[0]"
                    v-model="respuestasEvaluador[pregunta[0]]"
                  />
                </MDBBtnGroup>

                <!-- Mostrar Respuestas evaluador -->
                <MDBBtnGroup
                  required
                  v-if="
                    respuestaMostrar.respuestasEvaluador &&
                    respuestaMostrar.respuestasEvaluador[pregunta[0]]
                  "
                >
                  <MDBRadio
                    v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'VERDE'"
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-success active"
                    label="VERDE"
                    value="VERDE"
                  />
                  <MDBRadio
                    v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'ROJO'"
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-danger active"
                    label="ROJO"
                    value="ROJO"
                    disabled
                    active
                  />
                </MDBBtnGroup>
                <MDBBtnGroup
                  class="ps-2"
                  v-if="
                    respuestaMostrar.respuestasEvaluador &&
                    respuestaMostrar.respuestasEvaluador[pregunta[0]]
                  "
                >
                  <MDBRadio
                    v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'SI'"
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-success active"
                    label="SI"
                  />
                  <MDBRadio
                    v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'NO'"
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-danger active"
                    label="NO"
                  />
                </MDBBtnGroup>
              </ul>
            </template>
          </div>
        </div>
      </div>
    </div>
    <MDBModalFooter>
      <template v-if="respuestaMostrar.length != 0">
        <button
          type="button"
          v-if="respuestaMostrar.fotoRespuestas.length > 0"
          class="btn btn-success text-center"
          @click="verFotos()"
        >
          ver fotos
        </button>
        >
      </template>
      <template v-if="respuestaMostrar.length != 0">
        <button
          type="button"
          color="primary"
          :disabled="
            respuestaMostrar.respuestasEvaluador && respuestaMostrar.respuestasEvaluador.length != 0
          "
          @click="evaluarRespuesta()"
        >
          Evaluar
        </button>
        ></template
      >

      <button type="button" color="warning" @click="respuestasAudiModal = false">Cerrar</button>
    </MDBModalFooter>
  </div>

  <!-- Ver fotos -->
  <div
    class="modal"
    tabindex="-1"
    id="fotoRespuestaModal"
    labelledby="fotoRespuestaModalLabel"
    fullscreen="sm-down"
    size="lg"
  >
    <MDBModalHeader>
      <MDBModalTitle>Fotos enviadas</MDBModalTitle>
    </MDBModalHeader>
    <div class="modal-body">
      <div class="row">
        <template v-for="(foto, index) in fotos" v-bind:key="index">
          <div class="col-4">
            <img :href="foto" :src="foto" class="img-thumbnail" alt="..." />
          </div>
        </template>
      </div>
    </div>
    <MDBModalFooter>
      <button type="button" color="warning" @click="fotoRespuestaModal = false">Cerrar</button>
    </MDBModalFooter>
  </div>
</template>

<script setup lang="ts">
import { obtenerUrlImagen } from "@/components/firebase/storage";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { onMounted, ref, type Ref } from "vue";

const respuestasAudiModal = ref(false);
const fotoRespuestaModal = ref(false);
const respuestas: Ref<any> = ref();
const respuestasEvaluador: Ref<any> = ref({});
const respuestaMostrar = ref();
const fotos: Ref<any[]> = ref([]);
const tiendas: Ref<any[]> = ref([]);

function respuestasAuditorias(idAuditoria: string) {
  respuestas.value = [];
  respuestaMostrar.value = [];
  axiosInstance
    .get("auditorias/getRespuestaAuditorias", {
      params: {
        idAuditoria,
      },
    })
    .then((res) => {
      if (res.data.ok) {
        respuestasAudiModal.value = true;
        respuestas.value = res.data.data;
        respuestas.value.forEach((element: any) => {
          tiendas.value.forEach((tienda) => {
            if (tienda.id == element.tienda) {
              element.tienda = tienda.nombre;
            }
          });
        });
      } else {
        respuestasAudiModal.value = false;
        Swal.fire({
          icon: "info",
          title: "Vaya...",
          text: "Al parecer nadie ha respondido esta auditoria",
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
        });
        respuestas.value = [];
      }
    });
}

function mostrarRespuesta(id: string) {
  respuestasEvaluador.value = {};
  const resultado = respuestas.value.find((respuesta: any) => respuesta._id === id);

  if (resultado) {
    respuestaMostrar.value = { ...resultado };
    respuestaMostrar.value.respuestas = Object.entries(resultado.respuestas);
  } else {
    respuestaMostrar.value = null;
  }
}

function evaluarRespuesta() {
  axiosInstance
    .post("auditorias/updateAuditoriaRespuestas", {
      _id: respuestaMostrar.value._id,
      respuestasEvaluador: respuestasEvaluador.value,
      evaluada: true,
    })
    .then((res) => {
      console.log(res);
      respuestasAudiModal.value = false;
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Las respuestas fueron evaluadas correctamente",
      });
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal al evaluar las respuestas",
      });
    });
}

function verFotos() {
  fotoRespuestaModal.value = true;
  fotos.value = [];
  respuestaMostrar.value.fotoRespuestas.forEach((filePath: any) => {
    obtenerUrlImagen(filePath).then((url) => {
      fotos.value.push(url);
    });
  });
}

async function getTiendas() {
  axiosInstance
    .get("tiendas")
    .then((res) => {
      tiendas.value = res.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  getTiendas();
});

defineExpose({
  respuestasAuditorias,
});
</script>

<style scoped></style>
