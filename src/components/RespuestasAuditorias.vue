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
            <button @click="mostrarRespuesta(item._id)" style="background-color: rgb(155, 221, 69)">
              {{ item.tienda }} - {{ item.ultimaRespuesta }}
            </button>
          </div>
        </template>
        <div
          class="col-12 col-sm-12 col-xl-7 border border-top-0 border-bottom-0 border-end-0"
          v-if="respuestaMostrar?.length != 0"
        >
          <h6 class="text-center">RESPUESTAS:</h6>
          <div v-if="respuestaMostrar?.length != 0">
            Respondido por: {{ respuestaMostrar?.persona }}
            <template v-for="(pregunta, index) in respuestaMostrar?.respuestas" v-bind:key="index">
              <ul>
                <li class="fw-bold">
                  {{ pregunta[0] }}
                </li>
                <div class="btn-group" role="group" required>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`radio-${pregunta[0]}-${index}`"
                      :id="`radio-verde-${pregunta[0]}-${index}`"
                      value="VERDE"
                      :checked="pregunta[1] === 'VERDE'"
                      disabled
                    />
                    <label
                      class="form-check-label text-success fw-bold"
                      :for="`radio-verde-${pregunta[0]}-${index}`"
                    >
                      VERDE
                    </label>
                  </div>

                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`radio-${pregunta[0]}-${index}`"
                      :id="`radio-rojo-${pregunta[0]}-${index}`"
                      value="ROJO"
                      :checked="pregunta[1] === 'ROJO'"
                      disabled
                    />
                    <label
                      class="form-check-label text-danger fw-bold"
                      :for="`radio-rojo-${pregunta[0]}-${index}`"
                    >
                      ROJO
                    </label>
                  </div>
                </div>
                <div class="btn-group" role="group">
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`radio-${pregunta[0]}-${index}`"
                      :id="`radio-si-${pregunta[0]}-${index}`"
                      value="SI"
                      :checked="pregunta[1] === 'SI'"
                      disabled
                    />
                    <label
                      class="form-check-label text-success fw-bold"
                      :for="`radio-si-${pregunta[0]}-${index}`"
                    >
                      SI
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`radio-${pregunta[0]}-${index}`"
                      :id="`radio-no-${pregunta[0]}-${index}`"
                      value="NO"
                      :checked="pregunta[1] === 'NO'"
                      disabled
                    />
                    <label
                      class="form-check-label text-danger fw-bold"
                      :for="`radio-no-${pregunta[0]}-${index}`"
                    >
                      NO
                    </label>
                  </div>
                </div>
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
                <!-- <div class="btn-group" role="group"
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
                </div class="btn-group" role="group"> -->

                <div
                  class="btn-group ps-2"
                  role="group"
                  v-if="
                    !respuestaMostrar.respuestasEvaluador ||
                    typeof respuestaMostrar.respuestasEvaluador[pregunta[0]] === 'undefined'
                  "
                >
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`eval-radio-si-no-${pregunta[0]}-${index}`"
                      :id="`eval-radio-si-${pregunta[0]}-${index}`"
                      value="SI"
                      :disabled="
                        respuestaMostrar.respuestasEvaluador &&
                        respuestaMostrar.respuestasEvaluador.length != 0
                      "
                      v-model="respuestasEvaluador[pregunta[0]]"
                    />
                    <label
                      class="form-check-label text-success fw-bold"
                      :for="`eval-radio-si-${pregunta[0]}-${index}`"
                    >
                      SI
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`eval-radio-si-no-${pregunta[0]}-${index}`"
                      :id="`eval-radio-no-${pregunta[0]}-${index}`"
                      value="NO"
                      :disabled="
                        respuestaMostrar.respuestasEvaluador &&
                        respuestaMostrar.respuestasEvaluador.length != 0
                      "
                      v-model="respuestasEvaluador[pregunta[0]]"
                    />
                    <label
                      class="form-check-label text-danger fw-bold"
                      :for="`eval-radio-no-${pregunta[0]}-${index}`"
                    >
                      NO
                    </label>
                  </div>
                </div>

                <!-- Mostrar Respuestas evaluador -->
                <div
                  class="btn-group"
                  role="group"
                  required
                  v-if="
                    respuestaMostrar.respuestasEvaluador &&
                    respuestaMostrar.respuestasEvaluador[pregunta[0]]
                  "
                >
                  <div
                    class="form-check form-check-inline"
                    v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'VERDE'"
                  >
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`show-eval-radio2-${pregunta[0]}-${index}`"
                      :id="`show-eval-radio-verde-${pregunta[0]}-${index}`"
                      value="VERDE"
                      checked
                      disabled
                    />
                    <label
                      class="form-check-label text-success fw-bold"
                      :for="`show-eval-radio-verde-${pregunta[0]}-${index}`"
                    >
                      VERDE
                    </label>
                  </div>
                  <div
                    class="form-check form-check-inline"
                    v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'ROJO'"
                  >
                    <input
                      class="form-check-input"
                      type="radio"
                      :name="`show-eval-radio2-${pregunta[0]}-${index}`"
                      :id="`show-eval-radio-rojo-${pregunta[0]}-${index}`"
                      value="ROJO"
                      checked
                      disabled
                    />
                    <label
                      class="form-check-label text-danger fw-bold"
                      :for="`show-eval-radio-rojo-${pregunta[0]}-${index}`"
                    >
                      ROJO
                    </label>
                  </div>

                  <div
                    class="btn-group ps-2"
                    role="group"
                    v-if="
                      respuestaMostrar.respuestasEvaluador &&
                      respuestaMostrar.respuestasEvaluador[pregunta[0]]
                    "
                  >
                    <div
                      class="form-check form-check-inline"
                      v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'SI'"
                    >
                      <input
                        class="form-check-input"
                        type="radio"
                        :name="`show-eval-radio-${pregunta[0]}-${index}`"
                        :id="`show-eval-radio-si-${pregunta[0]}-${index}`"
                        value="SI"
                        checked
                        disabled
                      />
                      <label
                        class="form-check-label text-success fw-bold"
                        :for="`show-eval-radio-si-${pregunta[0]}-${index}`"
                      >
                        SI
                      </label>
                    </div>
                    <div
                      class="form-check form-check-inline"
                      v-if="respuestaMostrar.respuestasEvaluador[pregunta[0]] == 'NO'"
                    >
                      <input
                        class="form-check-input"
                        type="radio"
                        :name="`show-eval-radio-${pregunta[0]}-${index}`"
                        :id="`show-eval-radio-no-${pregunta[0]}-${index}`"
                        value="NO"
                        checked
                        disabled
                      />
                      <label
                        class="form-check-label text-danger fw-bold"
                        :for="`show-eval-radio-no-${pregunta[0]}-${index}`"
                      >
                        NO
                      </label>
                    </div>
                  </div>
                </div>
              </ul>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <template v-if="respuestaMostrar?.length != 0">
        <button
          v-if="respuestaMostrar?.fotoRespuestas.length > 0"
          class="btn btn-success text-center"
          @click="verFotos()"
        >
          ver fotos
        </button>
      </template>
      <template v-if="respuestaMostrar?.length != 0">
        <button
          color="primary"
          :disabled="
            respuestaMostrar?.respuestasEvaluador && respuestaMostrar?.respuestasEvaluador.length != 0
          "
          @click="evaluarRespuesta()"
        >
          Evaluar
        </button></template
      >

      <button color="warning" @click="respuestasAudiModal = false">Cerrar</button>
    </div>
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
    <div class="modal-header">
      <h5 class="modal-title">Fotos enviadas</h5>
    </div>
    <div class="modal-body">
      <div class="row">
        <template v-for="(foto, index) in fotos" v-bind:key="index">
          <div class="col-4">
            <img :href="foto" :src="foto" c lass="img-thumbnail" alt="..." />
          </div>
        </template>
      </div>
    </div>
    <div class="modal-footer">
      <button color="warning" @click="fotoRespuestaModal = false">Cerrar</button>
    </div>
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
