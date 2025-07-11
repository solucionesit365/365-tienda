<template>
  <div class="stepper-container">
    <!-- Título del paso -->
    <div class="step-header">
      <p>
        <strong>Pregunta {{ currentStep + 1 }} de {{ totalSteps }}</strong>
      </p>
    </div>

    <!-- Contenido (solo la pregunta/respuesta, sin "Pregunta X" aquí dentro) -->
    <div class="step-content">
      <slot :step="currentStep" :item="currentItem" />
    </div>

    <!-- Navegación y progreso -->
    <div class="step-footer">
      <div class="step-controls">
        <button class="btn-nav" @click="prevStep" :disabled="currentStep === 0">◀ ANTERIOR</button>
        <button class="btn-nav" @click="nextStep" :disabled="currentStep >= totalSteps - 1">
          SIGUIENTE ▶
        </button>
      </div>

      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, watch } from "vue";

const props = defineProps<{
  items: any[];
  stepLimitForDots?: number;
  startStep?: number;
}>();

const emit = defineEmits<{
  (e: "step-change", currentStep: number, item: any): void;
}>();

const currentStep = ref(props.startStep ?? 0);
const totalSteps = computed(() => props.items.length);
const currentItem = computed(() => props.items[currentStep.value]);
const showProgress = computed(() => totalSteps.value > (props.stepLimitForDots ?? 3));
const progress = computed(() => ((currentStep.value + 1) / totalSteps.value) * 100);

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

watch(currentStep, emitStep, { immediate: true });
</script>

<style scoped>
.stepper-container {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e0e0e0;
}

.step-header {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #333;
}

.step-content {
  padding: 0.5rem 0 1rem 0;
}

.step-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-nav {
  background-color: transparent;
  color: #1976d2;
  font-weight: 600;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.btn-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.progress-container {
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #1976d2;
  transition: width 0.3s ease;
}
</style>
