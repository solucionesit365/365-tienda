<template>
  <div class="card">
    <div class="card-body text-center">
      <!-- Paso actual -->
      <p class="mb-3">Paso {{ currentStep + 1 }} de {{ totalSteps }}</p>

      <!-- Contenido dinámico por slot -->
      <slot :step="currentStep" :item="currentItem"></slot>

      <!-- Barra de progreso -->
      <div class="d-flex justify-content-between align-items-center mt-4">
        <button class="btn btn-outline-primary" @click="prevStep" :disabled="currentStep === 0">
          ← Atrás
        </button>

        <div v-if="showProgress" class="flex-grow-1 mx-3">
          <div class="progress">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: progress + '%' }"
              :aria-valuenow="progress"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <button
          class="btn btn-outline-primary"
          @click="nextStep"
          :disabled="currentStep >= totalSteps - 1"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch } from "vue";

// Props
const props = defineProps<{
  items: any[];
  stepLimitForDots?: number;
  startStep?: number;
}>();

const emit = defineEmits<{
  (e: "step-change", currentStep: number, item: any): void;
}>();

// Data
const currentStep = ref(props.startStep ?? 0);

// Computed
const totalSteps = computed(() => props.items.length);
const currentItem = computed(() => props.items[currentStep.value]);
const showProgress = computed(() => totalSteps.value > (props.stepLimitForDots ?? 4));
const progress = computed(() => ((currentStep.value + 1) / totalSteps.value) * 100);

// Methods
function nextStep() {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++;
    emitStep();
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
    emitStep();
  }
}

function emitStep() {
  emit("step-change", currentStep.value, currentItem.value);
}

// Emit on init
watch(currentStep, emitStep, { immediate: true });
</script>

<style scoped>
.progress-bar {
  transition: width 0.3s ease;
}
</style>
