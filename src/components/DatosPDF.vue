<template>
  <div class="row mt-1">
    <div class="d-flex align-items-center gap-2 mt-2 mb-4">
      <span class="fs-6 ms-1 me-1">Semana</span>
      <span class="me-1 fw-bold">{{ punteroFecha!.weekNumber }}</span>
      de {{ punteroFecha!.year }}
      <button
        type="button"
        class="btn btn-primary fw-bold px-3 py-1"
        @click="restarSemana"
        aria-label="Semana anterior"
      >
        -
      </button>
      <button
        type="button"
        class="btn btn-primary fw-bold px-3 py-1"
        @click="sumarSemana"
        aria-label="Semana siguiente"
      >
        +
      </button>
    </div>
    <div class="row mt-2 mb-4 px-3">
      <div class="col-12 col-sm-6 mb-2 mb-sm-0">
        <button
          type="button"
          class="btn btn-primary w-100"
          :class="{ active: cargarpdf }"
          @click="cargarpdf = true"
        >
          PDF <i class="fa-solid fa-file-pdf"></i> Cargados
        </button>
      </div>
      <div class="col-12 col-sm-6">
        <button
          type="button"
          class="btn btn-primary w-100"
          :class="{ active: !cargarpdf }"
          @click="cargarpdf = false"
        >
          CARGAR PDF <i class="fa-solid fa-file-pdf"></i>
        </button>
      </div>
    </div>
  </div>

  <template v-if="cargarpdf">
    <PDFCargados ref="pdfCargadosRef" />
  </template>

  <template v-else>
    <div class="mt-4">
      <div class="form-floating">
        <textarea class="form-control" rows="4" id="Comentario" v-model="comentario"></textarea>
        <label for="Comentario">Comentario</label>
      </div>
    </div>
    <div class="mt-4">
      <label for="pdfFiles" class="form-label">Carga uno o más ficheros PDF</label>
      <input
        id="pdfFiles"
        type="file"
        class="form-control border border-info"
        multiple
        accept=".pdf"
        @change="setFile(($event.target as HTMLInputElement).files)"
      />
      <div class="form-text">Puedes seleccionar varios archivos PDF.</div>
      <div class="d-grid mt-4 gap-2 col-6 mx-auto">
        <button class="btn btn-success" @click="modalDatos = true">Comprobar archivos</button>
      </div>
    </div>
  </template>

  <div
    class="modal"
    tabindex="-1"
    id="modalDatos"
    labelledby="modalDatosTitle"
    staticBackdropS
    centered
    scrollable
    size="lg"
  >
    <div class="modal-header">
      <h5 class="modal-title" id="modalDatosTitle">Ficheros cargados...</h5>
    </div>
    <div class="modal-body">
      <ul class="list-group">
        <li class="list-group-item" v-for="(file, index) in pdfRef[0]" :key="index">
          {{ file.name.toUpperCase() }}
          <button @click="eliminarFile(file.name)" color="danger" floating>
            <i class="fas fa-trash"></i>
          </button>
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <button color="secondary" @click="modalDatos = false">Descartar</button>
      <button color="success" :class="{ disabled: guardando }" @click="subirArchivos()">
        <span
          v-if="guardando"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        Enviar KPS's
      </button>
    </div>
  </div>

  <!-- Total archivos -->
  <div
    class="modal"
    tabindex="-1"
    id="totalArchivos"
    labelledby="totalArchivosTitle"
    staticBackdropS
    centered
    scrollable
  >
    <div class="modal-header">
      <h5 class="modal-title" id="totalArchivosTitle">Subiendo archivos...</h5>
    </div>
    <div class="modal-body">
      <div class="card" v-if="subidos < pdfRef[0]?.length">
        <div class="card-body justify-content-center text-center">
          <div class="spinner-border" role="status" grow color="primary">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="spinner-border" role="status" grow color="secondary">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="spinner-border" role="status" grow color="success">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="spinner-border" role="status" grow color="danger">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="spinner-border" role="status" grow color="warning">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="spinner-border" role="status" grow color="info">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="spinner-border" role="status" grow color="dark">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="text-center">
            <h3>Subiendo... {{ subidos }} de {{ pdfRef[0].length }}</h3>
          </div>
        </div>
      </div>
      <div class="card" v-else>
        <div class="card-body justify-content-center text-center">
          <i class="fas fa-thumbs-up fs-1 text-success"></i>
          <div class="text-center">
            <h3>Finalizado</h3>
          </div>
          <hr />
          <template v-if="tiendasMalas.length > 0">
            Estos archivos no se han enviado, revisa el nombre y vuelve a subirlos:
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-title="Tooltip on top"
            >
              <template>
                <i class="fas fa-info-circle text-info fs-3"></i>
              </template>
              <template>
                Recuerda que el nombre de la tienda debe ser: <b>T--000</b> o <b>M--000</b>.
              </template>
            </button>
            <ul class="list-group">
              <li class="list-group-item" v-for="(tienda, index) in tiendasMalas" :key="index">
                {{ tienda }}
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button color="success" @click="cargarpdf = true">Finalizar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, provide } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import { subirArchivoGeneral } from "@/components/firebase/storage";
import PDFCargados from "@/components/PDFCargados.vue";
import Swal from "sweetalert2";
import { DateTime } from "luxon";

type PunteroFecha = { weekNumber: number; year: number };
const punteroFecha = ref<PunteroFecha | undefined>(inject("punteroFecha"));
const cargarpdf = ref(true);
const pdfRef = ref<any[]>([]);
const modalDatos = ref(false);
const comentario = ref(`KPI semana ${punteroFecha.value!.weekNumber}`);
const guardando = ref(false);
const subidos = ref(0);
const totalArchivos = ref(false);
const tiendas = inject("tiendas") as { nombre: string; id: string }[];
const tiendasMalas = ref<string[]>([]);
// const tooltip2 = ref(false);
const pdfCargadosRef = ref(null);

function restarSemana() {
  const fecha = DateTime.fromObject({
    weekNumber: punteroFecha.value!.weekNumber,
    weekYear: punteroFecha.value!.year,
  }).minus({ weeks: 1 });

  punteroFecha.value = {
    weekNumber: fecha.weekNumber,
    year: fecha.weekYear,
  };

  comentario.value = `KPI semana ${punteroFecha.value!.weekNumber}`;
}

function sumarSemana() {
  const fecha = DateTime.fromObject({
    weekNumber: punteroFecha.value!.weekNumber,
    weekYear: punteroFecha.value!.year,
  }).plus({ weeks: 1 });

  punteroFecha.value = {
    weekNumber: fecha.weekNumber,
    year: fecha.weekYear,
  };

  comentario.value = `KPI semana ${punteroFecha.value!.weekNumber}`;
}

function setFile(files: any) {
  if (!files) return;
  pdfRef.value = [Array.from(files)];
}

function eliminarFile(nombre: any) {
  if (pdfRef.value.length > 0) {
    for (let index = 0; index < pdfRef.value[0].length; index++) {
      if (pdfRef.value[0][index].name == nombre) {
        pdfRef.value[0].splice(index, 1);
      }
    }
  } else console.log("No hay na");
}

async function subirArchivos() {
  totalArchivos.value = true; // Mostrar modal de progreso
  modalDatos.value = false;
  subidos.value = 0;
  tiendasMalas.value = [];
  guardando.value = true; // Bloqueamos el botón de enviar mientras se suben los archivos

  if (pdfRef.value.length > 0 && pdfRef.value[0].length > 0) {
    const totalArchivosSubir = pdfRef.value[0].length;

    // Crear promesas de subida en paralelo
    const uploadPromises = pdfRef.value[0].map(async (file: any) => {
      let data: {
        semana?: number;
        año?: number;
        tienda?: string;
        comentario?: string;
        ref?: string;
      } = {};
      let found = false;
      const nombreArchivo = file.name.toUpperCase().split(" ", 1)[0];

      // Buscar la tienda correspondiente al archivo
      for (const tienda of tiendas) {
        if (tienda.nombre.toUpperCase() === nombreArchivo) {
          data = {
            semana: punteroFecha.value!.weekNumber,
            año: punteroFecha.value!.year,
            tienda: tienda.id,
            comentario: comentario.value,
          };
          found = true;
          break;
        }
      }

      // Si la tienda no se encuentra, agregar a tiendasMalas y continuar
      if (!found) {
        subidos.value += 1; // Aumentamos el contador incluso si el archivo es inválido
        if (!tiendasMalas.value.includes(nombreArchivo)) {
          tiendasMalas.value.push(nombreArchivo);
        }
        return;
      }

      try {
        const base64PDF = await subirArchivoGeneral(file, `KPSs/${nombreArchivo}/`);
        if (base64PDF) {
          data.ref = base64PDF;
        }

        await axiosInstance.post("kpi-tiendas/nuevoKpiTienda", data);
        subidos.value += 1; // Aumentamos el contador de archivos subidos exitosamente
      } catch (error) {
        console.error(`Error al subir el archivo ${file.name}:`, error);
      }
    });

    // Esperar a que todas las promesas terminen
    await Promise.all(uploadPromises);

    pdfRef.value = []; // Limpiar los archivos subidos
    cargarpdf.value = true; // Cambiar a la vista de PDFs cargados

    // Una vez terminada la subida, ocultamos el loading
    guardando.value = false;
    totalArchivos.value = false;

    console.log(`Archivos subidos: ${subidos.value}/${totalArchivosSubir}`);

    tiendasMalas.value = [...tiendasMalas.value];

    if (tiendasMalas.value.length > 0) {
      console.warn("⚠️ Estas tiendas no fueron encontradas y sus archivos no se subieron:");
      console.table(tiendasMalas.value);
      // Mostrar alerta con SweetAlert
      Swal.fire({
        icon: "warning",
        title: "⚠️ Archivos con nombres incorrectos",
        html: `Los siguientes archivos no se subieron porque sus nombres son incorrectos:<br><br>
               <strong>${tiendasMalas.value.join("<br>")}</strong><br><br>
               Por favor, revisa que el nombre esté en formato <b>T--000</b> o <b>M--000</b>.`,
        confirmButtonText: "Entendido",
      });
    }
  } else {
    console.log("No hay archivos para procesar.");
    guardando.value = false;
    totalArchivos.value = false;
  }
}

provide("punteroFecha", punteroFecha);
provide("tiendas", tiendas);
</script>

<style scoped>
.colorActive {
  background-color: #2dd79f;
  color: black;
  padding: 0.6rem;
}

.colorInactive {
  background-color: #d7d9e7;
  color: rgb(119, 119, 119);
}
</style>
