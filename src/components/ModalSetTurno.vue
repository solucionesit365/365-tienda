<template>
  <!--
    Wrapper invisible hasta que modelValue===true.
    Dentro va tu modal y su backdrop.
  -->
  <div>
    <!-- 1) El propio modal -->
    <div
      v-if="modelValue"
      id="modalSetTurno"
      class="modal fade show"
      style="display: block"
      tabindex="-1"
      role="dialog"
      aria-labelledby="modalSetTurnoLabel"
      aria-modal="true"
      @click.self="close"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <!-- header -->
          <div class="modal-header">
            <h5 id="modalSetTurnoLabel" class="modal-title">Configurar Turno</h5>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="close" />
          </div>

          <!-- body -->
          <div class="modal-body">
            <div class="row g-3">
              <div class="col">
                <label for="inputInicio" class="form-label">Hora Inicio</label>
                <input id="inputInicio" type="time" class="form-control" v-model="localInicio" />
              </div>
              <div class="col">
                <label for="inputFin" class="form-label">Hora Fin</label>
                <input id="inputFin" type="time" class="form-control" v-model="localFinal" />
              </div>
            </div>
          </div>

          <!-- footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="apply">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2) Y su backdrop oficial -->
    <div v-if="modelValue" id="modalSetTurnoBackdrop" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Plantilla {
  id: string;
  nombre: string;
  inicio: string;
  final: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    plantillasTurno: Plantilla[];
    initialInicio?: string;
    initialFin?: string;
  }>(),
  {
    initialInicio: "",
    initialFin: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "apply", payload: { inicio: string; final: string }): void;
}>();

const selectedPlantillaId = ref("");
const localInicio = ref(props.initialInicio);
const localFinal = ref(props.initialFin);

// al abrir, reseteamos
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selectedPlantillaId.value = "";
      localInicio.value = props.initialInicio;
      localFinal.value = props.initialFin;
    }
  },
);

function close() {
  emit("update:modelValue", false);
}

function apply() {
  emit("apply", { inicio: localInicio.value, final: localFinal.value });

  close();
}
</script>

<style scoped>
#modalSetTurno {
  z-index: 2000;
}

#modalSetTurnoBackdrop {
  z-index: 1999;
}

/* --- AUMENTAR TAMAÑO DEL SWITCH (Bootstrap 5) --- */
:deep(.form-switch .form-check-input) {
  width: 2.5rem; /* ancho del track */
  height: 1.5rem; /* alto del track */
}

:deep(.form-switch .form-check-input::before) {
  width: 1.2rem; /* diámetro del thumb */
  height: 1.2rem;
  top: 0.15rem; /* separación superior */
  left: 0.15rem; /* separación izquierda */
}

:deep(.form-switch .form-check-input:checked::before) {
  transform: translateX(1rem); /* ajuste al estar checked */
}

/* --- FORZAR CENTRADO VERTICAL DEL SWITCH Y SU LABEL --- */
:deep(.form-check.form-switch) {
  display: flex;
  align-items: center;
  /* quitamos el padding-left que Bootstrap usa para posicionar el switch */
  padding-left: 0;
}

:deep(.form-switch .form-check-input) {
  /* ya no queremos el margin-left negativo */
  margin-left: 0;
  /* espacio entre switch y label */
  margin-right: 0.75rem;
  /* reposicionamos el track/tag dentro del flex */
  position: relative;
  top: 0;
}

:deep(.form-switch .form-check-label) {
  /* aseguramos que no tenga margen inferior */
  margin-bottom: 0;
}
</style>
