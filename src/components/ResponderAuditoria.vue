<template>
  <template v-if="mostrarFormulario && auditoria">
    <div class="card border-top border-5">
      <div class="card-header text-right">
        <span @click="$emit('cerrar-responder-auditoria')">
          <span class="badge badge-light ml-2" style="color: black">AUDITORIAS</span>
        </span>
      </div>

      <div v-if="auditoria.preguntas.length" class="card-body">
        <h6 class="font-weight-bold">Preguntas Generales</h6>
        <BsStepper :items="auditoria.preguntas">
          <template #default="{ item, step }">
            <PreguntaContent
              :pregunta="item"
              :index="step"
              v-model="respuestas[item.pregunta]"
              @set-file="setFile"
            />
          </template>
        </BsStepper>
      </div>

      <template v-for="(grupo, nombreGrupo) in gruposDePreguntas" :key="nombreGrupo">
        <div class="card-body" v-if="grupo.length">
          <h6 class="fw-bold">{{ nombreGrupo }}</h6>
          <BsStepper :items="grupo">
            <template #default="{ item, step }">
              <PreguntaContent
                :pregunta="item"
                :index="step"
                v-model="respuestas[item.pregunta]"
                @set-file="setFile"
              />
            </template>
          </BsStepper>
        </div>
      </template>
    </div>

    <div class="card-footer text-right d-flex gap-2">
      <button @click="guardarBorrador(auditoria._id)" class="btn btn-primary mr-2">
        Guardar borrador
      </button>
      <button @click="enviarRespuestas" class="btn btn-success">Enviar respuestas</button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, type Ref } from "vue";
import moment from "moment";
import { subirArchivoGeneral } from "@/components/firebase/storage";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import BsStepper from "@/components/365/BsStepper.vue";
import PreguntaContent from "@/components/365/BsPreguntaContent.vue";

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
const mostrarFormulario = ref(false);
// const numerikos = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Agrupa las preguntas por grupo
const gruposDePreguntas = computed(() => {
  if (!auditoria.value) return {};
  return {
    "Preguntas Dependienta A": auditoria.value.preguntasDependientaA || [],
    "Preguntas Dependienta B/C": auditoria.value.preguntasDependientaB_C || [],
    "Preguntas Responsable": auditoria.value.preguntasResponsable || [],
  };
});

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
    mostrarFormulario.value = false;
    // auditoria.value = null;
    emit("cerrar-responder-auditoria");
  });
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
  mostrarFormulario.value = true;
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
function resetFormulario() {
  respuestas.value = {};
  fotosRef.value = [];
  fotoRespuestas.value = [];
  mostrarFormulario.value = false;
  auditoria.value = null;
}

defineExpose({
  responderAuditoria,
  resetFormulario,
});
</script>

<style scoped>
h6 {
  color: #e66c5a;
}
</style>
