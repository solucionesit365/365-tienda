<template>
  <div
    class="modal fade"
    :class="{ show: modelValue }"
    :style="{ display: modelValue ? 'block' : 'none' }"
    :id="id"
    :tabindex="tabindex"
    :aria-labelledby="labelledby"
    @click="handleBackdropClick"
  >
    <div class="modal-dialog" :class="modalDialogClasses">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
  <div v-if="modelValue" class="modal-backdrop fade show"></div>
</template>

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

const emit = defineEmits(["update:modelValue"]);

const modalDialogClasses = computed(() => {
  const classes = [];

  if (props.centered) {
    classes.push("modal-dialog-centered");
  }

  if (props.fullscreen) {
    classes.push("modal-fullscreen");
  }

  return classes.join(" ");
});

const handleBackdropClick = (event: MouseEvent) => {
  // Si staticBackdrop está activado, no cerrar el modal al hacer clic fuera
  if (!props.staticBackdrop && (event.target as HTMLElement).classList.contains("modal")) {
    emit("update:modelValue", false);
  }
};
</script>

<style scoped>
.modal {
  overflow-y: auto;
}

.modal.show {
  display: block;
}
</style>
