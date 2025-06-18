<template>
 <template v-if="auditoria">
    <div class="card card border-top border-5">
      <div class="card-header text-end">
        <span @click="$emit('cerrar-responder-auditoria')"
          ><MDBBadge color="light" class="ms-2"
            ><span style="color: #ab47bc">AUDITORIAS</span></MDBBadge
          ></span
        >
      </div>
      <div v-if="auditoria.preguntas != 0" class="card-body">
        <MDBStepper
          mobile
          mobileProgress
          nextBtn="Siguiente"
          backBtn="Anterior"
          stepTxt="Pregunta"
          stepOfTxt="de"
        >
          <MDBStepperStep
            active
            v-for="(pregunta, index) in auditoria.preguntas"
            v-bind:key="index"
          >
            <MDBStepperHead :icon="(index + 1).toString()">
              Pregunta {{ index + 1 }}
            </MDBStepperHead>
            <MDBStepperContent>
              {{ pregunta.pregunta }}
              <!-- si es SINO -->
              <div v-if="pregunta.tipo == 'SINO'">
                <MDBBtnGroup>
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="SI"
                    :name="pregunta.pregunta"
                    value="SI"
                    v-model="respuestas[pregunta.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="NO"
                    :name="pregunta.pregunta"
                    value="NO"
                    v-model="respuestas[pregunta.pregunta]"
                  />
                </MDBBtnGroup>
                <br />
              </div>
              <!-- Si es ROJO/VERDE -->
              <div v-if="pregunta.tipo == 'ROJOVERDE'">
                <MDBBtnGroup required v-if="pregunta.tipo == 'ROJOVERDE'">
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-success"
                    label="VERDE"
                    value="VERDE"
                    :name="pregunta.pregunta"
                    v-model="respuestas[pregunta.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-danger"
                    label="ROJO"
                    value="ROJO"
                    :name="pregunta.pregunta"
                    v-model="respuestas[pregunta.pregunta]"
                  />
                </MDBBtnGroup>
              </div>
              <div v-if="pregunta.tipo == 'RespESCRITA'">
                <MDBTextarea
                  label="Escribe tu respuesta"
                  rows="2"
                  v-model="respuestas[pregunta.pregunta]"
                />
              </div>
              <div v-if="pregunta.tipo == 'rango'">
                <select class="form-select" v-model="respuestas[pregunta.pregunta]">
                  <option v-for="num in numerikos" :key="num">
                    {{ num }}
                  </option>
                </select>
              </div>
              <div class="form-group" v-if="pregunta.archivo">
                <MDBFileUpload
                  class="border border-info"
                  default-msg="Haz click para agregar una foto"
                  preview-msg="Haz click para agregar una foto"
                  remove-btn="Eliminar"
                  @change="setFile"
                />
              </div>
            </MDBStepperContent>
          </MDBStepperStep>
        </MDBStepper>
      </div>

      <div class="card-body" v-if="auditoria.preguntasDependientaA != 0">
        <h6 class="fw-bold">Preguntas Dependienta A</h6>
        <MDBStepper
          mobile
          mobileProgress
          nextBtn="Siguiente"
          backBtn="Anterior"
          stepTxt="Pregunta"
          stepOfTxt="de"
        >
          <MDBStepperStep
            active
            v-for="(preguntaDA, index) in auditoria.preguntasDependientaA"
            v-bind:key="index"
          >
            <MDBStepperHead :icon="(index + 1).toString()">
              Pregunta {{ index + 1 }}
            </MDBStepperHead>
            <MDBStepperContent>
              {{ preguntaDA.pregunta }}
              <!-- si es SINO -->
              <div v-if="preguntaDA.tipo == 'SINO'">
                <MDBBtnGroup>
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="SI"
                    :name="preguntaDA.pregunta"
                    value="SI"
                    v-model="respuestas[preguntaDA.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="NO"
                    :name="preguntaDA.pregunta"
                    value="NO"
                    v-model="respuestas[preguntaDA.pregunta]"
                  />
                </MDBBtnGroup>
                <br />
              </div>
              <!-- Si es ROJO/VERDE -->
              <div v-if="preguntaDA.tipo == 'ROJOVERDE'">
                <MDBBtnGroup required v-if="preguntaDA.tipo == 'ROJOVERDE'">
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-success"
                    label="VERDE"
                    value="VERDE"
                    :name="preguntaDA.pregunta"
                    v-model="respuestas[preguntaDA.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-danger"
                    label="ROJO"
                    value="ROJO"
                    :name="preguntaDA.pregunta"
                    v-model="respuestas[preguntaDA.pregunta]"
                  />
                </MDBBtnGroup>
              </div>
              <div class="mb-2" v-if="preguntaDA.tipo == 'RespESCRITA'">
                <MDBTextarea
                  label="Escribe tu respuesta"
                  rows="2"
                  v-model="respuestas[preguntaDA.pregunta]"
                />
              </div>
              <div v-if="preguntaDA.tipo == 'rango'">
                <select class="form-select" v-model="respuestas[preguntaDA.pregunta]">
                  <option v-for="num in numerikos" :key="num">
                    {{ num }}
                  </option>
                </select>
              </div>
              <div class="form-group" v-if="preguntaDA.archivo">
                <MDBFileUpload
                  class="border border-info"
                  default-msg="Haz click para agregar una foto"
                  preview-msg="Haz click para agregar una foto"
                  remove-btn="Eliminar"
                  @change="setFile"
                />
              </div>
            </MDBStepperContent>
          </MDBStepperStep>
        </MDBStepper>
      </div>

      <div class="card-body" v-if="auditoria.preguntasDependientaB_C.length != 0">
        <h6 class="fw-bold">Preguntas Dependienta B/C</h6>
        <MDBStepper
          mobile
          mobileProgress
          nextBtn="Siguiente"
          backBtn="Anterior"
          stepTxt="Pregunta"
          stepOfTxt="de"
        >
          <MDBStepperStep
            active
            v-for="(preguntaDBC, index) in auditoria.preguntasDependientaB_C"
            v-bind:key="index"
          >
            <MDBStepperHead :icon="(index + 1).toString()">
              Pregunta {{ index + 1 }}
            </MDBStepperHead>
            <MDBStepperContent>
              {{ preguntaDBC.pregunta }}
              <!-- si es SINO -->
              <div v-if="preguntaDBC.tipo == 'SINO'">
                <MDBBtnGroup>
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="SI"
                    :name="preguntaDBC.pregunta"
                    value="SI"
                    v-model="respuestas[preguntaDBC.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="NO"
                    :name="preguntaDBC.pregunta"
                    value="NO"
                    v-model="respuestas[preguntaDBC.pregunta]"
                  />
                </MDBBtnGroup>
                <br />
              </div>
              <!-- Si es ROJO/VERDE -->
              <div v-if="preguntaDBC.tipo == 'ROJOVERDE'">
                <MDBBtnGroup required v-if="preguntaDBC.tipo == 'ROJOVERDE'">
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-success"
                    label="VERDE"
                    value="VERDE"
                    :name="preguntaDBC.pregunta"
                    v-model="respuestas[preguntaDBC.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-danger"
                    label="ROJO"
                    value="ROJO"
                    :name="preguntaDBC.pregunta"
                    v-model="respuestas[preguntaDBC.pregunta]"
                  />
                </MDBBtnGroup>
              </div>
              <div class="mb-2" v-if="preguntaDBC.tipo == 'RespESCRITA'">
                <MDBTextarea
                  label="Escribe tu respuesta"
                  rows="2"
                  v-model="respuestas[preguntaDBC.pregunta]"
                />
              </div>
              <div v-if="preguntaDBC.tipo == 'rango'">
                <select class="form-select" v-model="respuestas[preguntaDBC.pregunta]">
                  <option v-for="num in numerikos" :key="num">
                    {{ num }}
                  </option>
                </select>
              </div>
              <div class="form-group" v-if="preguntaDBC.archivo">
                <MDBFileUpload
                  class="border border-info"
                  default-msg="Haz click para agregar una foto"
                  preview-msg="Haz click para agregar una foto"
                  remove-btn="Eliminar"
                  @change="setFile"
                />
              </div>
            </MDBStepperContent>
          </MDBStepperStep>
        </MDBStepper>
      </div>

      <div class="card-body" v-if="auditoria.preguntasResponsable != 0">
        <h6 class="fw-bold">Preguntas Responsable</h6>
        <MDBStepper
          mobile
          mobileProgress
          nextBtn="Siguiente"
          backBtn="Anterior"
          stepTxt="Pregunta"
          stepOfTxt="de"
        >
          <MDBStepperStep
            active
            v-for="(preguntaRes, index) in auditoria.preguntasResponsable"
            v-bind:key="index"
          >
            <MDBStepperHead :icon="(index + 1).toString()">
              Pregunta {{ index + 1 }}
            </MDBStepperHead>
            <MDBStepperContent>
              {{ preguntaRes.pregunta }}
              <!-- si es SINO -->
              <div v-if="preguntaRes.tipo == 'SINO'">
                <MDBBtnGroup>
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="SI"
                    :name="preguntaRes.pregunta"
                    value="SI"
                    v-model="respuestas[preguntaRes.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-secondary"
                    label="NO"
                    :name="preguntaRes.pregunta"
                    value="NO"
                    v-model="respuestas[preguntaRes.pregunta]"
                  />
                </MDBBtnGroup>
                <br />
              </div>
              <!-- Si es ROJO/VERDE -->
              <div v-if="preguntaRes.tipo == 'ROJOVERDE'">
                <MDBBtnGroup required v-if="preguntaRes.tipo == 'ROJOVERDE'">
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-success"
                    label="VERDE"
                    value="VERDE"
                    :name="preguntaRes.pregunta"
                    v-model="respuestas[preguntaRes.pregunta]"
                  />
                  <MDBRadio
                    :btnCheck="true"
                    :wrap="false"
                    labelClass="btn btn-danger"
                    label="ROJO"
                    value="ROJO"
                    :name="preguntaRes.pregunta"
                    v-model="respuestas[preguntaRes.pregunta]"
                  />
                </MDBBtnGroup>
              </div>
              <div class="mb-2" v-if="preguntaRes.tipo == 'RespESCRITA'">
                <MDBTextarea
                  label="Escribe tu respuesta"
                  rows="2"
                  v-model="respuestas[preguntaRes.pregunta]"
                />
              </div>
              <div v-if="preguntaRes.tipo == 'rango'">
                <select class="form-select" v-model="respuestas[preguntaRes.pregunta]">
                  <option v-for="num in numerikos" :key="num">
                    {{ num }}
                  </option>
                </select>
              </div>
              <div class="form-group" v-if="preguntaRes.archivo">
                <MDBFileUpload
                  class="border border-info"
                  default-msg="Haz click para agregar una foto"
                  preview-msg="Haz click para agregar una foto"
                  remove-btn="Eliminar"
                  @change="setFile"
                />
              </div>
            </MDBStepperContent>
          </MDBStepperStep>
        </MDBStepper>
      </div>

      <div class="card-footer">
        <MDBBtn @click="guardarBorrador(auditoria._id)" color="warning">Guardar borrador</MDBBtn>
        <MDBBtn @click="enviarRespuestas()" color="primary">Enviar respuestas</MDBBtn>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, type Ref } from "vue";
import moment from "moment";
import { subirArchivoGeneral } from "@/components/firebase/storage";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";

import { useUserStore } from "@/stores/user";

const emit = defineEmits(["cerrar-responder-auditoria"]);
const userStore = useUserStore();
const responderAudiModal = ref(false);
const auditoria: Ref<any> = ref();
const respuestas: Ref<any> = ref({});
const fotoRespuestas: Ref<any[]> = ref([]);
const fotosRef: Ref<any[]> = ref([]);
const currentUser = computed(() => userStore.user);
const archivoSubido = ref(false);
const numerikos = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

function guardarBorrador(auditoriaId: string) {
  // Guardar respuestas en el almacenamiento local
  localStorage.setItem(`respuestasBorrador_${auditoriaId}`, JSON.stringify(respuestas.value));
  Swal.fire({
    icon: "success",
    title: "Borrador guardado",
    text: "Puedes cargar tus respuestas más tarde",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  }).then(function () {
    respuestas.value = {}; // Reiniciar respuestas
    fotosRef.value = []; // Reiniciar fotos
  });
  emit("cerrar-responder-auditoria");
}

function cargarBorrador(auditoriaId: string) {
  const respuestasBorrador = localStorage.getItem(`respuestasBorrador_${auditoriaId}`);
  if (respuestasBorrador) {
    respuestas.value = JSON.parse(respuestasBorrador);
  }
}

function responderAuditoria(auditoriaP: any) {
  auditoria.value = [];
  respuestas.value = {};
  fotoRespuestas.value = [];
  auditoria.value = auditoriaP;
  cargarBorrador(auditoriaP._id); // Cargar respuestas desde el almacenamiento local
}
function setFile(x: any) {
  fotoRespuestas.value.push(x[0]);
}

function preguntasRespondidas() {
  const preguntasListas = [
    auditoria.value.preguntas,
    auditoria.value.preguntasDependientaA,
    auditoria.value.preguntasDependientaB_C,
    auditoria.value.preguntasResponsable,
  ];

  return preguntasListas.every((preguntas) =>
    preguntas.every((pregunta: any) => respuestas.value[pregunta.pregunta] !== undefined),
  );
}

async function enviarRespuestas() {
  if (!preguntasRespondidas()) {
    Swal.fire({
      icon: "warning",
      title: "Atención...",
      text: "Por favor, responde a todas las preguntas antes de enviar.",
    });
    return; // Detener la ejecución de la función aquí si no todas las preguntas han sido respondidas
  }
  if (fotoRespuestas.value.length > 0) {
    for (let index = 0; index < fotoRespuestas.value.length; index++) {
      const res = await subirArchivoGeneral(fotoRespuestas.value[index], "respuestasAuditorias");
      if (res) {
        fotosRef.value.push(res);
        archivoSubido.value = true;
      } else {
        archivoSubido.value = false;
      }
    }
  } else {
    archivoSubido.value = true;
  }

  if (archivoSubido.value) {
    const data = {
      auditoria: auditoria.value.tituloAuditoria,
      idAuditoria: auditoria.value._id,
      descripcion: auditoria.value.descripcion,
      respuestas: respuestas.value,
      fotoRespuestas: fotosRef.value,
      respuestasEvaluador: [],
      ultimaRespuesta: moment().format("DD/MM/YYYY"),
      persona: currentUser.value.nombre,
      tienda: currentUser.value.idTienda,
      evaluada: false,
    };
    axiosInstance.post("auditorias/respuestasAuditorias", data).then((res) => {
      if (res) {
        Swal.fire({
          icon: "success",
          title: "Perfecto...",
          text: "Respuestas enviadas",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        }).then(function () {
          respuestas.value = {};
          fotosRef.value = [];
          responderAudiModal.value = false;
          // Eliminar respuestas guardadas del almacenamiento local
          localStorage.removeItem(`respuestasBorrador_${auditoria.value._id}`);
          emit("cerrar-responder-auditoria");
        });
      }
    });
  }
}

defineExpose({
  responderAuditoria,
});

</script>

<style scoped>

</style>
