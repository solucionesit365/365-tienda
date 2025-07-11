<template>
  <Teleport to="body">
    <!-- Backdrop oscuro -->
    <div v-if="modelValue" class="modal-backdrop fade show" @click="handleBackdropClick"></div>

    <!-- Modal -->
    <div
      v-if="modelValue"
      class="modal fade show"
      :style="{ display: 'block' }"
      :id="id"
      :tabindex="tabindex"
      :aria-labelledby="labelledby"
    >
      <div class="modal-dialog" :class="modalDialogClasses">
        <div class="modal-content">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!-- Versión del 11/07/2025 -->

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  id?: string;
  tabindex?: string | number;
  labelledby?: string;
  modelValue: boolean;
  centered?: boolean;
  fullscreen?: boolean;
  staticBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tabindex: "-1",
  centered: false,
  fullscreen: false,
  staticBackdrop: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

// Clases dinámicas para centrar o fullscreen
const modalDialogClasses = computed(() => {
  const classes: string[] = [];
  if (props.centered) classes.push("modal-dialog-centered");
  if (props.fullscreen) classes.push("modal-fullscreen");
  return classes.join(" ");
});

// Cerrar al clicar fuera (si no es staticBackdrop)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleBackdropClick(event: MouseEvent) {
  if (!props.staticBackdrop) {
    emit("update:modelValue", false);
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.modal.show {
  display: flex;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal-backdrop.show {
  opacity: 1;
}

.modal-backdrop.fade {
  opacity: 0;
  transition: opacity 0.15s linear;
}

.modal-backdrop.fade.show {
  opacity: 1;
}

/* Asegurar que el modal-dialog esté por encima */
.modal-dialog {
  position: relative;
  z-index: 1060;
  margin: 1.75rem auto;
  max-width: 500px;
  width: calc(100% - 2rem);
}

.modal-content {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.5);
}

/* Centrado */
.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - 1rem);
}

/* Fullscreen */
.modal-fullscreen {
  width: 100vw;
  max-width: none;
  height: 100vh;
  margin: 0;
}

.modal-fullscreen .modal-content {
  height: 100%;
  border: 0;
  border-radius: 0;
}
</style>
