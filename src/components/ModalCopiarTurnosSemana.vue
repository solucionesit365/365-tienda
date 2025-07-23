<template>
  <div>
    <BsModal
      id="modalCopiarTurnosSemana"
      tabindex="-1"
      labelledby="modalLabel"
      v-model="modalVisible"
      :centered="true"
    >
      <BsModalHeader @close="modalVisible = false">
        <BsModalTitle id="modalLabel">
          <i class="fas fa-copy me-2 text-warning"></i>
          Copiar turnos entre semanas
        </BsModalTitle>
      </BsModalHeader>

      <BsModalBody>
        <div class="copiar-turnos-container">
          <div class="info-section">
            <div class="alert alert-info d-flex align-items-start" role="alert">
              <i class="fas fa-info-circle me-2 mt-1"></i>
              <div>
                <strong>¿Qué hace esta función?</strong><br />
                Copia todos los turnos de una semana a otra semana diferente. Útil para replicar
                horarios cuando el patrón se repite.
              </div>
            </div>
          </div>

          <div class="selector-section">
            <div class="row g-4">
              <!-- Semana Origen -->
              <div class="col-md-6">
                <div class="card border-primary">
                  <div class="card-header bg-primary bg-opacity-10">
                    <h6 class="mb-0">
                      <i class="fas fa-calendar-week me-2"></i>
                      Semana Origen
                    </h6>
                  </div>
                  <div class="card-body">
                    <label class="form-label fw-bold mb-3">Selecciona la semana a copiar:</label>
                    <select
                      v-model="semanaOrigenSeleccionada"
                      class="form-select form-select-lg week-selector"
                    >
                      <option value="" disabled>Elige una semana...</option>
                      <option
                        v-for="semana in opcionesSemanasOrigen"
                        :key="semana.value"
                        :value="semana.value"
                      >
                        {{ semana.text }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Semana destino -->
              <div class="col-md-6">
                <div class="card border-success">
                  <div class="card-header bg-success bg-opacity-10">
                    <h6 class="mb-0">
                      <i class="fas fa-calendar-plus me-2"></i>
                      Semana destino
                    </h6>
                  </div>
                  <div class="card-body">
                    <label class="form-label fw-bold mb-3">Selecciona la semana destino:</label>
                    <select
                      v-model="semanaDestinoSeleccionada"
                      class="form-select form-select-lg week-selector"
                    >
                      <option value="" disabled>Elige una semana...</option>
                      <option
                        v-for="semana in opcionesSemanasDestino"
                        :key="semana.value"
                        :value="semana.value"
                      >
                        {{ semana.text }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vista previa -->
            <div
              v-if="semanaOrigenSeleccionada && semanaDestinoSeleccionada"
              class="preview-section mt-4"
            >
              <div class="card bg-light">
                <div class="card-body">
                  <h6 class="card-title text-center">
                    <i class="fas fa-eye me-2"></i>
                    Vista previa de la operación
                  </h6>

                  <div class="copy-flow">
                    <div class="week-item source">
                      <div class="week-icon">
                        <i class="fas fa-calendar-check"></i>
                      </div>
                      <div class="week-info">
                        <div class="week-number">{{ semanaOrigenNumero }}</div>
                        <div class="week-dates">{{ rangoSemanaOrigen }}</div>
                      </div>
                    </div>

                    <div class="arrow-container">
                      <i class="fas fa-arrow-right"></i>
                    </div>

                    <div class="week-item destination">
                      <div class="week-icon">
                        <i class="fas fa-calendar-plus"></i>
                      </div>
                      <div class="week-info">
                        <div class="week-number">{{ semanaDestinoNumero }}</div>
                        <div class="week-dates">{{ rangoSemanaDestino }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="alert alert-warning mt-3 mb-0" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Importante:</strong> Los turnos existentes en la semana destino serán
                    reemplazados.
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensajes de error -->
            <div v-if="mensajeError" class="alert alert-danger mt-3" role="alert">
              <i class="fas fa-times-circle me-2"></i>
              {{ mensajeError }}
            </div>
          </div>
        </div>
      </BsModalBody>

      <BsModalFooter>
        <BsButton color="secondary" @click="cerrarModal">
          <i class="fas fa-times me-1"></i>
          Cancelar
        </BsButton>
        <BsButton color="warning" :disabled="!puedeCopiarse || copiando" @click="copiarTurnos">
          <span v-if="copiando" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fas fa-copy me-1"></i>
          {{ copiando ? "Copiando..." : "Copiar Turnos" }}
        </BsButton>
      </BsModalFooter>
    </BsModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { DateTime } from "luxon";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import BsModal from "@/components/365/BsModal.vue";
import BsButton from "@/components/365/BsButton.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsModalHeader from "@/components/365/BsModalHeader.vue";
import BsModalTitle from "@/components/365/BsModalTitle.vue";

// Props
interface Props {
  idTienda: number;
}

const props = defineProps<Props>();

// Types
interface WeekOption {
  text: string;
  value: string; // ISO date string del lunes de la semana
  weekNumber: number;
  year: number;
  startDate: DateTime;
  endDate: DateTime;
}

// Estado
const modalVisible = ref(false);
const semanaOrigenSeleccionada = ref<string | null>(null);
const semanaDestinoSeleccionada = ref<string | null>(null);
const opcionesSemanasOrigen = ref<WeekOption[]>([]);
const opcionesSemanasDestino = ref<WeekOption[]>([]);
const copiando = ref(false);
const mensajeError = ref("");

// Funciones para generar opciones de semanas
function generarOpcionesSemanas(): void {
  const ahora = DateTime.now();
  const añoActual = ahora.year;
  const semanaActual = ahora.weekNumber;

  // Generar opciones para semanas origen (últimas 12 semanas + próximas 4 semanas)
  const semanasOrigen: WeekOption[] = [];

  // Semanas pasadas (últimas 12 semanas)
  for (let i = 12; i >= 1; i--) {
    const fecha = ahora.minus({ weeks: i });
    const inicioSemana = fecha.startOf("week");
    const finSemana = fecha.endOf("week");

    semanasOrigen.push({
      text: `Semana ${fecha.weekNumber} - Del ${inicioSemana.toFormat("dd MMM", { locale: "es" })} al ${finSemana.toFormat("dd MMM yyyy", { locale: "es" })}`,
      value: inicioSemana.toISODate()!,
      weekNumber: fecha.weekNumber,
      year: fecha.weekYear,
      startDate: inicioSemana,
      endDate: finSemana,
    });
  }

  // Semana actual y futuras (hasta 4 semanas)
  for (let i = 0; i <= 4; i++) {
    const fecha = ahora.plus({ weeks: i });
    const inicioSemana = fecha.startOf("week");
    const finSemana = fecha.endOf("week");

    semanasOrigen.push({
      text: `Semana ${fecha.weekNumber} - Del ${inicioSemana.toFormat("dd MMM", { locale: "es" })} al ${finSemana.toFormat("dd MMM yyyy", { locale: "es" })}${i === 0 ? " (Actual)" : ""}`,
      value: inicioSemana.toISODate()!,
      weekNumber: fecha.weekNumber,
      year: fecha.weekYear,
      startDate: inicioSemana,
      endDate: finSemana,
    });
  }

  opcionesSemanasOrigen.value = semanasOrigen;

  // Generar opciones para semanas destino (solo semanas futuras, hasta 12 semanas)
  const semanasDestino: WeekOption[] = [];

  for (let i = 0; i <= 12; i++) {
    const fecha = ahora.plus({ weeks: i });
    const inicioSemana = fecha.startOf("week");
    const finSemana = fecha.endOf("week");

    // Solo incluir si es semana actual o futura
    if (fecha.weekNumber >= semanaActual || fecha.year > añoActual) {
      semanasDestino.push({
        text: `Semana ${fecha.weekNumber} - Del ${inicioSemana.toFormat("dd MMM", { locale: "es" })} al ${finSemana.toFormat("dd MMM yyyy", { locale: "es" })}${i === 0 ? " (Actual)" : ""}`,
        value: inicioSemana.toISODate()!,
        weekNumber: fecha.weekNumber,
        year: fecha.weekYear,
        startDate: inicioSemana,
        endDate: finSemana,
      });
    }
  }

  opcionesSemanasDestino.value = semanasDestino;
}

// Computed properties para obtener la información de las semanas seleccionadas
const semanaOrigenData = computed(() => {
  if (!semanaOrigenSeleccionada.value) return null;
  return (
    opcionesSemanasOrigen.value.find((s) => s.value === semanaOrigenSeleccionada.value) || null
  );
});

const semanaDestinoData = computed(() => {
  if (!semanaDestinoSeleccionada.value) return null;
  return (
    opcionesSemanasDestino.value.find((s) => s.value === semanaDestinoSeleccionada.value) || null
  );
});

const semanaOrigenNumero = computed(() => {
  if (!semanaOrigenData.value) return "";
  return `Semana ${semanaOrigenData.value.weekNumber}`;
});

const semanaDestinoNumero = computed(() => {
  if (!semanaDestinoData.value) return "";
  return `Semana ${semanaDestinoData.value.weekNumber}`;
});

const rangoSemanaOrigen = computed(() => {
  if (!semanaOrigenData.value) return "";
  const inicio = semanaOrigenData.value.startDate.toFormat("dd MMM", { locale: "es" });
  const fin = semanaOrigenData.value.endDate.toFormat("dd MMM yyyy", { locale: "es" });
  return `${inicio} - ${fin}`;
});

const rangoSemanaDestino = computed(() => {
  if (!semanaDestinoData.value) return "";
  const inicio = semanaDestinoData.value.startDate.toFormat("dd MMM", { locale: "es" });
  const fin = semanaDestinoData.value.endDate.toFormat("dd MMM yyyy", { locale: "es" });
  return `${inicio} - ${fin}`;
});

const puedeCopiarse = computed(() => {
  if (!semanaOrigenSeleccionada.value || !semanaDestinoSeleccionada.value) return false;

  // Comparar directamente los valores seleccionados (fechas ISO)
  return semanaOrigenSeleccionada.value !== semanaDestinoSeleccionada.value;
});

// Watchers
watch([semanaOrigenSeleccionada, semanaDestinoSeleccionada], () => {
  mensajeError.value = "";

  if (semanaOrigenSeleccionada.value && semanaDestinoSeleccionada.value) {
    // Verificar directamente las fechas ISO sin usar computed
    if (semanaOrigenSeleccionada.value === semanaDestinoSeleccionada.value) {
      mensajeError.value = "No se puede copiar una semana sobre sí misma";
    }
  }
});

// Métodos
function abrirModal() {
  semanaOrigenSeleccionada.value = null;
  semanaDestinoSeleccionada.value = null;
  mensajeError.value = "";
  generarOpcionesSemanas();
  modalVisible.value = true;
}

function cerrarModal() {
  modalVisible.value = false;
  semanaOrigenSeleccionada.value = null;
  semanaDestinoSeleccionada.value = null;
  mensajeError.value = "";
  copiando.value = false;
}

async function copiarTurnos() {
  if (!puedeCopiarse.value || !semanaOrigenSeleccionada.value || !semanaDestinoSeleccionada.value) {
    return;
  }

  // Obtener los datos de las semanas para mostrar en la confirmación
  const origenData = opcionesSemanasOrigen.value.find(
    (s) => s.value === semanaOrigenSeleccionada.value,
  );
  const destinoData = opcionesSemanasDestino.value.find(
    (s) => s.value === semanaDestinoSeleccionada.value,
  );

  // Confirmación
  const confirmResult = await Swal.fire({
    title: "¿Confirmar copia de turnos?",
    html: `
      <div class="text-start">
        <p><strong>Desde:</strong> ${origenData ? `Semana ${origenData.weekNumber} (${origenData.startDate.toFormat("dd MMM", { locale: "es" })} - ${origenData.endDate.toFormat("dd MMM yyyy", { locale: "es" })})` : "Semana origen"}</p>
        <p><strong>Hacia:</strong> ${destinoData ? `Semana ${destinoData.weekNumber} (${destinoData.startDate.toFormat("dd MMM", { locale: "es" })} - ${destinoData.endDate.toFormat("dd MMM yyyy", { locale: "es" })})` : "Semana destino"}</p>
        <hr>
        <p class="text-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Esta acción reemplazará todos los turnos existentes en la semana destino.
        </p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#f39c12",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, copiar turnos",
    cancelButtonText: "Cancelar",
  });

  if (!confirmResult.isConfirmed) {
    return;
  }

  try {
    copiando.value = true;

    // Usar directamente los valores seleccionados y asegurar que sean strings
    const diaSemanaOrigen = String(semanaOrigenSeleccionada.value);
    const diaSemanaDestino = String(semanaDestinoSeleccionada.value);

    const response = await axiosInstance.post("copiar-turnos-por-semana", {
      idTienda: props.idTienda,
      diaSemanaOrigen,
      diaSemanaDestino,
    });

    if (response.data === true || response.data.ok) {
      await Swal.fire({
        icon: "success",
        title: "¡Turnos copiados!",
        text: `Los turnos se han copiado correctamente de la ${origenData ? `Semana ${origenData.weekNumber}` : "semana origen"} a la ${destinoData ? `Semana ${destinoData.weekNumber}` : "semana destino"}.`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      cerrarModal();

      // Emitir evento para recargar el cuadrante
      window.dispatchEvent(new CustomEvent("recargar-cuadrante"));
    } else {
      throw new Error("Error en la respuesta del servidor");
    }
  } catch (err: any) {
    console.error("Error al copiar turnos:", err);

    Swal.fire({
      icon: "error",
      title: "Error al copiar turnos",
      text:
        err.response?.data?.message ||
        "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
      confirmButtonText: "Entendido",
    });
  } finally {
    copiando.value = false;
  }
}

// Lifecycle
onMounted(() => {
  generarOpcionesSemanas();
});

// Exponer métodos
defineExpose({
  abrirModal,
  cerrarModal,
});
</script>

<style lang="scss" scoped>
.copiar-turnos-container {
  min-height: 400px;
}

.info-section {
  margin-bottom: 1.5rem;

  .alert {
    border-radius: 10px;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.selector-section {
  .card {
    border-radius: 12px;
    border-width: 2px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      border-radius: 10px 10px 0 0;
      border-bottom: none;
      padding: 1rem;

      h6 {
        color: #495057;
        font-weight: 600;
      }
    }

    .card-body {
      padding: 1.25rem;
    }
  }
}

.week-selector {
  border-radius: 10px !important;
  border: 2px solid #e9ecef !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
  background-color: #fff !important;
  color: #495057 !important;

  &:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25) !important;
    outline: none !important;
  }

  &:hover {
    border-color: #6366f1 !important;
  }

  option {
    padding: 0.5rem;
    font-size: 0.9rem;

    &:hover {
      background-color: rgba(99, 102, 241, 0.1);
    }
  }
}

.preview-section {
  .card {
    border-radius: 12px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .card-title {
    color: #6c757d;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }
}

.copy-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0;

  .week-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.75rem;
    border-radius: 12px;
    min-width: 200px;
    transition: all 0.3s ease;

    &.source {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.destination {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .week-icon {
      font-size: 2rem;
      opacity: 0.9;
    }

    .week-info {
      .week-number {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .week-dates {
        font-size: 0.85rem;
        opacity: 0.9;
      }
    }
  }

  .arrow-container {
    color: #6c757d;
    font-size: 2rem;
    animation: slide 2s ease-in-out infinite;
  }
}

@keyframes slide {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

.alert-warning {
  border-radius: 8px;
  border: none;
  background-color: rgba(251, 191, 36, 0.1);
  color: #92400e;

  i {
    color: #f59e0b;
  }
}

.alert-danger {
  border-radius: 8px;
  border: none;
}

// Responsive
@media (max-width: 768px) {
  .copy-flow {
    flex-direction: column;
    gap: 1rem;

    .arrow-container {
      transform: rotate(90deg);
      animation: slide-vertical 2s ease-in-out infinite;
    }

    .week-item {
      width: 100%;
      max-width: 300px;
    }
  }
}

@keyframes slide-vertical {
  0%,
  100% {
    transform: rotate(90deg) translateX(0);
  }
  50% {
    transform: rotate(90deg) translateX(10px);
  }
}

// Loading state
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

// Asegurar que los selectores ocupen todo el ancho
.week-selector {
  width: 100% !important;
}
</style>

<style>
/* Estilos globales específicos para este modal */
#modalCopiarTurnosSemana .modal-dialog {
  max-width: 1200px !important;
  width: 95% !important;
}

@media (max-width: 1400px) {
  #modalCopiarTurnosSemana .modal-dialog {
    max-width: 95% !important;
  }
}

@media (max-width: 768px) {
  #modalCopiarTurnosSemana .modal-dialog {
    max-width: 95% !important;
    margin: 0.5rem !important;
  }
}

#modalCopiarTurnosSemana .modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  min-height: 500px;
}
</style>
