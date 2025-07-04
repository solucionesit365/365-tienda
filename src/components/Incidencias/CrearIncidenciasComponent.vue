<template>
  <div class="col-xl-12 col-md-8 card-body">
    <div class="mb-3 row">
      <div class="">
        <div class="format-text">Destinatario</div>
        <select v-model="destinatario" class="form-select" aria-label="Default select exameple">
          <option value="tecnicos">Servicio Técnico</option>
          <option value="rrhh">Recursos Humanos</option>
        </select>
      </div>
      <div class="mt-1">
        <div class="form-text">Categoría</div>
        <select
          v-if="destinatario == null"
          v-model="categoria"
          class="form-select"
          aria-label="Default select example"
        />
        <select
          v-if="destinatario == 'tecnicos'"
          v-model="categoria"
          class="form-select"
          aria-label="Default select example"
        >
          <option value="Problemas con la cuenta">Problemas con la cuenta</option>
          <option value="Problemas con alguna funcionalidad">
            Problemas con alguna funcionalidad
          </option>
          <option value="General">General</option>
          <option value="Pregunta sobre privacidad">Pregunta sobre privacidad</option>
          <option value="Eliminar cuenta">Eliminar cuenta</option>
        </select>
        <select
          v-if="destinatario == 'rrhh'"
          v-model="categoria"
          class="form-select"
          aria-label="Default select example"
        >
          <option value="Problemas con la cuenta">Problemas con la cuenta</option>
          <option value="Problemas con mi bolsa de horas">Problemas con mi bolsa de horas</option>
          <option value="General">General</option>
        </select>
      </div>
      <div class="col-12 col-sm-12 col-xl-12 mt-2">
        <div class="format-text">Prioridad</div>
        <select v-model="prioridad" class="form-select" aria-label="Default select example">
          <option value="Urgente">Urgente</option>
          <option value="Muy urgente">Muy urgente</option>
          <option value="Puede esperar">Puede esperar</option>
        </select>
      </div>
      <div class="mt-1">
        <div class="form-text">Describe brevemente el problema</div>
        <textarea
          id="exampleFormControlTextarea1"
          v-model="descripcion"
          class="form-control"
          rows="3"
        />
      </div>
      <div class="">
        <div class="form-text">Foto/Video</div>
        <input
          class="border border-2"
          @change="setFile($event)"
          type="file"
          accept="image/*"
          defaultMsg="Adjunta una captura de pantalla"
          previewMsg="Arrstra y suelta o click aquí para reemplazar"
          removeBtn="Eliminar"
        />
      </div>
      <div class="col-xl-12 col-sm-12 col-12 text-center mt-4 mb-4">
        <button
          class="btn btn-lg text-light mb-8 rounded-8 w-30"
          style="background: #5ebea3"
          @click="enviar()"
          :class="{ disable: guardando }"
        >
          <span
            v-if="guardando"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <i class="fas fa-paper-plane" />ENVIAR
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { subirArchivoGeneral } from "@/components/firebase/storage";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { useUserStore } from "@/stores/user";
import { DateTime } from "luxon";

const userStore = useUserStore();
const destinatario = ref(null);
const categoria = ref(null);
const descripcion = ref();
const prioridad = ref(null);
let file: File | null = null;
const fallo = ref(false);
const autorizoLlamada = ref(false);
const verMisIncidencias = ref(true);
const guardando = ref(false);

const user = computed(() => userStore.user);

//Subir archivo
function setFile(event: any) {
  file = event.target.files[0];
  console.log(file);
}

//Enviar incidencia
async function enviar() {
  if (destinatario.value === null) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Selecciona un destinatario",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
  if (descripcion.value == null) {
    fallo.value = true;
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Describe el problema",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
  if (categoria.value == null) {
    fallo.value = true;
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Selecciona una prioridad",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
  if (!fallo.value) {
    const hoy = DateTime.now().toFormat("dd/MM/yyyy HH:mm");
    const usuario = user.value;
    const objEnviar: {
      destinatario: string | null;
      categoria: string | null;
      descripcion: string | undefined;
      prioridad: string | null;
      file: File | string | null;
      autorizoLlamada: boolean;
      nombre: string;
      uid: string;
      mensaje: any[];
      estado: string;
      fechaCreacion: string;
      tienda: string;
    } = {
      destinatario: destinatario.value,
      categoria: categoria.value,
      descripcion: descripcion.value,
      prioridad: prioridad.value,
      file: file,
      autorizoLlamada: autorizoLlamada.value,
      nombre: usuario.displayName ?? "",
      uid: usuario.uid ?? "",
      mensaje: [],
      estado: "PENDIENTE",
      fechaCreacion: hoy,
      tienda: usuario.nombreTienda ?? "",
    };
    if (file) {
      objEnviar.file = await subirArchivoGeneral(file, `incidencias/${destinatario.value}`);
    }
    axiosInstance.post("incidencias/nuevaIncidencia", objEnviar).then((response) => {
      if (response.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Perfecto...",
          text: "Tu incidencia ha sido enviada, pronto recibirás respuesta",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        }).then(function () {
          guardando.value = false;
          destinatario.value = null;
          categoria.value = null;
          descripcion.value = null;
          prioridad.value = null;
          file = null;
          autorizoLlamada.value = false;
          verMisIncidencias.value = true;
        });
      } else {
        Swal.fire("Oops...", "Error al enviar tu incidencia", "error");
      }
    });
  }
}
</script>

<style scoped>
.format-text,
.form-text {
  font-weight: 600;
  color: #e66c5a;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.format-select,
.form-control {
  border-radius: 0.5rem;
  border: 1.5px solid #e0e0e0;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  margin-bottom: 1rem;
}

.format-select:focus,
.form-control:focus {
  border-color: #e66c5a;
  box-shadow: 0 0 0 0.2rem rgba(94, 190, 163, 0.15);
}

input[type="file"] {
  border-radius: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  width: 100%;
  margin-bottom: 1rem;
}

input[type="checkbox"].form-check-input {
  accent-color: #e66c5a;
  margin-right: 0.5rem;
}

.btn {
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(94, 190, 163, 0.08);
  transition:
    background 0.2s,
    color 0.2s;
}

.btn[style*="background: #e66c5a"] {
  background: linear-gradient(90deg, #e66c5a 60%, #e66c5a 100%);
  border: none;
}

.btn[style*="background: #e66c5a"]:hover,
.btn[style*="background: #e66c5a"]:focus {
  background: linear-gradient(90deg, #e66c5a 60%, #e66c5a 100%);
  color: #fff;
}

.disable,
.btn:disabled {
  opacity: 0.7;
  pointer-events: none;
}

.col-xl-8.card-body {
  max-width: 600px;
  margin: 2rem auto;
}

::-webkit-input-placeholder {
  color: #b0b0b0;
}
::-moz-placeholder {
  color: #b0b0b0;
}
:-ms-input-placeholder {
  color: #b0b0b0;
}
::placeholder {
  color: #b0b0b0;
}

.border {
  background: none !important;
}

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
  .col-xl-8.card-body {
    max-width: 100%;
    margin: 1rem 0;
  }
}
</style>
