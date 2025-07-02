<template>
  <BsModal
    id="modalCopiarSemana"
    tabindex="-1"
    labelledby="modalLabel"
    v-model="modalCopiarSemana"
    :centered="true"
  >
    <BsModalHeader @close="modalCopiarSemana = false">
      <BsModalTitle id="modalLabel">
        <i class="fas fa-copy me-2 text-warning"></i>
        Copiar Semana de Cuadrantes
      </BsModalTitle>
    </BsModalHeader>

    <BsModalBody>
      <div class="copiar-semana-container">
        <div class="info-section">
          <div class="alert alert-info d-flex align-items-center" role="alert">
            <i class="fas fa-info-circle me-2"></i>
            <div>
              <strong>¿Qué hace esta acción?</strong><br />
              Copia todos los turnos de una semana seleccionada a la semana actual ({{
                semanaActual
              }}).
            </div>
          </div>
        </div>

        <div class="selector-section">
          <div class="form-group">
            <label class="form-label fw-bold mb-3">
              <i class="fas fa-calendar-week me-2"></i>
              Selecciona la semana origen para copiar:
            </label>
            <BsSelect
              :filter="true"
              :select-all="false"
              :search-placeholder="'Buscar semana'"
              v-model:options="opcionesSemanas"
              v-model:selected="semanaElegida"
              placeholder="Elige una semana..."
              class="semana-selector"
            />
          </div>

          <div v-if="semanaElegida" class="preview-section mt-4">
            <div class="card bg-light">
              <div class="card-body text-center">
                <h6 class="card-title">
                  <i class="fas fa-eye me-2"></i>
                  Vista previa de la copia
                </h6>
                <div class="copy-flow">
                  <div class="source-week">
                    <div class="week-badge source">
                      <i class="fas fa-calendar-check"></i>
                      <span>{{ getSemanaTexto(semanaElegida) }}</span>
                    </div>
                  </div>
                  <div class="arrow">
                    <i class="fas fa-arrow-right"></i>
                  </div>
                  <div class="target-week">
                    <div class="week-badge target">
                      <i class="fas fa-calendar-plus"></i>
                      <span>Semana {{ semanaActual }}</span>
                    </div>
                  </div>
                </div>
                <small class="text-muted mt-2 d-block">
                  Los turnos existentes en la semana {{ semanaActual }} serán reemplazados
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BsModalBody>

    <BsModalFooter>
      <BsButton color="secondary" @click="modalCopiarSemana = false">
        <i class="fas fa-times me-1"></i>
        Cancelar
      </BsButton>
      <BsButton
        color="warning"
        :disabled="!semanaElegida || copiando"
        @click="semanaElegida && copiarSemana(semanaElegida)"
      >
        <span v-if="copiando" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="fas fa-copy me-1"></i>
        {{ copiando ? "Copiando..." : "Copiar Semana" }}
      </BsButton>
    </BsModalFooter>
  </BsModal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { DateTime } from "luxon";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import BsModal from "@/components/365/BsModal.vue";
import BsButton from "@/components/365/BsButton.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsModalHeader from "@/components/365/BsModalHeader.vue";
import BsModalTitle from "@/components/365/BsModalTitle.vue";
import BsSelect from "@/components/365/BsSelect.vue";

// Estado reactivo
const modalCopiarSemana = ref<boolean>(false);
const opcionesSemanas = ref<Array<{ text: string; value: number }>>([]);
const semanaElegida = ref<number | null>(null);
const idTienda = ref<number>(-1);
const nSemanaOrigen = ref<number>(-1);
const copiando = ref<boolean>(false);

// Computed
const semanaActual = computed(() => DateTime.now().weekNumber);

// Funciones
function crearArraySemanas(): void {
  opcionesSemanas.value = [];
  const yearActual = DateTime.now().year;

  // Crear opciones para todas las semanas del año
  for (let i = 1; i <= 52; i++) {
    try {
      const semanaDateTime = DateTime.fromObject({ weekYear: yearActual, weekNumber: i });
      const firstDayOfWeek = semanaDateTime.startOf("week");
      const lastDayOfWeek = semanaDateTime.endOf("week");

      if (firstDayOfWeek.isValid && lastDayOfWeek.isValid) {
        opcionesSemanas.value.push({
          text: `Semana ${i} - Del ${firstDayOfWeek.toFormat("dd MMM")} al ${lastDayOfWeek.toFormat("dd MMM")}`,
          value: i,
        });
      }
    } catch (error) {
      console.warn(`Error creando semana ${i}:`, error);
    }
  }

  // Filtrar la semana actual para evitar auto-copia
  opcionesSemanas.value = opcionesSemanas.value.filter(
    (semana) => semana.value !== semanaActual.value,
  );
}

function getSemanaTexto(numeroSemana: number): string {
  const opcion = opcionesSemanas.value.find((s) => s.value === numeroSemana);
  return opcion ? opcion.text : `Semana ${numeroSemana}`;
}

function abrirModal(valorIdTienda: number, valorNSemanaOrigen: number): void {
  if (!valorIdTienda) {
    Swal.fire({
      icon: "error",
      title: "ID de tienda requerido",
      text: "Por favor, proporciona un ID de tienda válido.",
    });
    throw new Error("ID de tienda no puede ser nulo o indefinido");
  }
  idTienda.value = valorIdTienda;
  nSemanaOrigen.value = valorNSemanaOrigen;
  semanaElegida.value = null;
  modalCopiarSemana.value = true;
}

function cerrarModal(): void {
  modalCopiarSemana.value = false;
  semanaElegida.value = null;
  copiando.value = false;
}

async function copiarSemana(nSemanaDestino: number): Promise<void> {
  if (!nSemanaDestino) {
    Swal.fire({
      icon: "warning",
      title: "Selección requerida",
      text: "Por favor, selecciona una semana origen.",
    });
    return;
  }

  // Confirmación antes de copiar
  const confirmResult = await Swal.fire({
    title: "¿Confirmar copia?",
    html: `
      <div class="text-start">
        <p><strong>Origen:</strong> ${getSemanaTexto(nSemanaDestino)}</p>
        <p><strong>Destino:</strong> Semana ${semanaActual.value}</p>
        <hr>
        <p class="text-warning"><i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Atención:</strong> Esta acción reemplazará todos los turnos existentes en la semana ${semanaActual.value}.</p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#f39c12",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, copiar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmResult.isConfirmed) return;

  try {
    copiando.value = true;

    const yearActual = DateTime.now().year;
    const lunesOrigen = DateTime.fromObject({
      weekYear: yearActual,
      weekNumber: nSemanaDestino,
    }).startOf("week");

    const lunesDestino = DateTime.fromObject({
      weekYear: yearActual,
      weekNumber: semanaActual.value,
    }).startOf("week");

    const response = await axiosInstance.post("cuadrantes/copiarSemanaCuadrante", {
      fechaSemanaOrigen: lunesOrigen.toISO(),
      fechaSemanaDestino: lunesDestino.toISO(),
      idTienda: idTienda.value,
    });

    if (response.data.ok) {
      await Swal.fire({
        icon: "success",
        title: "¡Copia exitosa!",
        text: `La semana ${nSemanaDestino} se ha copiado correctamente a la semana ${semanaActual.value}.`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      cerrarModal();
    } else {
      throw new Error(response.data.message || "Error en la respuesta del servidor");
    }
  } catch (err: any) {
    console.error("Error al copiar semana:", err);

    Swal.fire({
      icon: "error",
      title: "Error al copiar",
      text:
        err.response?.data?.message ||
        "Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo.",
      confirmButtonText: "Entendido",
    });
  } finally {
    copiando.value = false;
  }
}

// Inicialización
onMounted(() => {
  crearArraySemanas();
});

// Exponer funciones
defineExpose({
  abrirModal,
  cerrarModal,
});
</script>

<style lang="scss" scoped>
.copiar-semana-container {
  min-height: 300px;
}

.info-section {
  margin-bottom: 1.5rem;

  .alert {
    border-radius: 8px;
    border-left: 4px solid #17a2b8;
  }
}

.selector-section {
  .form-label {
    color: #495057;
    font-size: 1rem;
    display: flex;
    align-items: center;
  }
}

.preview-section {
  .card {
    border-radius: 10px;
    border: 1px solid #e9ecef;
  }

  .card-title {
    color: #6c757d;
    margin-bottom: 1rem;
  }
}

.copy-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;

  .week-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 8px;
    min-width: 120px;

    &.source {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.target {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    i {
      font-size: 1.5rem;
    }

    span {
      font-size: 0.875rem;
      font-weight: 500;
      text-align: center;
    }
  }

  .arrow {
    color: #6c757d;
    font-size: 1.5rem;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// Responsive para tablets
@media (max-width: 768px) {
  .copy-flow {
    flex-direction: column;
    gap: 0.5rem;

    .arrow {
      transform: rotate(90deg);
    }

    .week-badge {
      min-width: 200px;
    }
  }
}

// Estilos para el selector
:deep(.semana-selector) {
  .form-control {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    padding: 0.75rem;

    &:focus {
      border-color: #f39c12;
      box-shadow: 0 0 0 0.2rem rgba(243, 156, 18, 0.25);
    }
  }
}

// Loading state
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
