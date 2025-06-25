<template>
  <template v-if="auditoria">
    <div class="card border-top border-5">
      <div class="card-header text-right">
        <span @click="$emit('cerrar-responder-auditoria')">
          <span class="badge badge-light ml-2" style="color: #ab47bc">AUDITORIAS</span>
        </span>
      </div>

      <div v-if="auditoria.preguntas.length" class="card-body">
        <h6 class="font-weight-bold">Preguntas Generales</h6>
        <div v-for="(pregunta, index) in auditoria.preguntas" :key="index" class="mb-4">
          <p><strong>Pregunta {{ index + 1 }}:</strong> {{ pregunta.pregunta }}</p>

          <div v-if="pregunta.tipo === 'SINO'" class="btn-group btn-group-toggle" data-toggle="buttons">
            <label class="btn btn-secondary" :class="{ active: respuestas[pregunta.pregunta] === 'SI' }">
              <input type="radio" :name="pregunta.pregunta" value="SI" v-model="respuestas[pregunta.pregunta]" /> SI
            </label>
            <label class="btn btn-secondary" :class="{ active: respuestas[pregunta.pregunta] === 'NO' }">
              <input type="radio" :name="pregunta.pregunta" value="NO" v-model="respuestas[pregunta.pregunta]" /> NO
            </label>
          </div>

          <div v-else-if="pregunta.tipo === 'ROJOVERDE'" class="btn-group btn-group-toggle" data-toggle="buttons">
            <label class="btn btn-success" :class="{ active: respuestas[pregunta.pregunta] === 'VERDE' }">
              <input type="radio" :name="pregunta.pregunta" value="VERDE" v-model="respuestas[pregunta.pregunta]" /> VERDE
            </label>
            <label class="btn btn-danger" :class="{ active: respuestas[pregunta.pregunta] === 'ROJO' }">
              <input type="radio" :name="pregunta.pregunta" value="ROJO" v-model="respuestas[pregunta.pregunta]" /> ROJO
            </label>
          </div>

          <div v-else-if="pregunta.tipo === 'RespESCRITA'">
            <textarea class="form-control" rows="2" v-model="respuestas[pregunta.pregunta]" placeholder="Escribe tu respuesta"></textarea>
          </div>

          <div v-else-if="pregunta.tipo === 'rango'">
            <select class="form-control" v-model="respuestas[pregunta.pregunta]">
              <option v-for="num in numerikos" :key="num">{{ num }}</option>
            </select>
          </div>

          <div v-if="pregunta.archivo" class="form-group mt-2">
            <div class="custom-file">
              <input type="file" class="custom-file-input" @change="setFile" />
              <label class="custom-file-label">Haz click para agregar una foto</label>
            </div>
          </div>
        </div>
      </div>

      <template v-for="(grupo, nombreGrupo) in gruposDePreguntas">
        <div class="card-body" v-if="grupo.length" :key="nombreGrupo">
          <h6 class="fw-bold">{{ nombreGrupo }}</h6>
          <div v-for="(preg, index) in grupo" :key="index" class="mb-4">
            <p><strong>Pregunta {{ index + 1 }}:</strong> {{ preg.pregunta }}</p>

            <div v-if="preg.tipo === 'SINO'" class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-secondary" :class="{ active: respuestas[preg.pregunta] === 'SI' }">
                <input type="radio" :name="preg.pregunta" value="SI" v-model="respuestas[preg.pregunta]" /> SI
              </label>
              <label class="btn btn-secondary" :class="{ active: respuestas[preg.pregunta] === 'NO' }">
                <input type="radio" :name="preg.pregunta" value="NO" v-model="respuestas[preg.pregunta]" /> NO
              </label>
            </div>

            <div v-else-if="preg.tipo === 'ROJOVERDE'" class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-success" :class="{ active: respuestas[preg.pregunta] === 'VERDE' }">
                <input type="radio" :name="preg.pregunta" value="VERDE" v-model="respuestas[preg.pregunta]" /> VERDE
              </label>
              <label class="btn btn-danger" :class="{ active: respuestas[preg.pregunta] === 'ROJO' }">
                <input type="radio" :name="preg.pregunta" value="ROJO" v-model="respuestas[preg.pregunta]" /> ROJO
              </label>
            </div>

            <div v-else-if="preg.tipo === 'RespESCRITA'">
              <textarea class="form-control" rows="2" v-model="respuestas[preg.pregunta]" placeholder="Escribe tu respuesta"></textarea>
            </div>

            <div v-else-if="preg.tipo === 'rango'">
              <select class="form-control" v-model="respuestas[preg.pregunta]">
                <option v-for="num in numerikos" :key="num">{{ num }}</option>
              </select>
            </div>

            <div v-if="preg.archivo" class="form-group mt-2">
              <div class="custom-file">
                <input type="file" class="custom-file-input" @change="setFile" />
                <label class="custom-file-label">Haz click para agregar una foto</label>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div class="card-footer text-right">
        <button @click="guardarBorrador(auditoria._id)" class="btn btn-warning mr-2">Guardar borrador</button>
        <button @click="enviarRespuestas" class="btn btn-primary">Enviar respuestas</button>
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
