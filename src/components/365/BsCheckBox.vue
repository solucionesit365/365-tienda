<template>
  <div class="form-check" :style="styleObject">
    <input
      class="form-check-input"
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="onChange"
    />
    <label class="form-check-label" :for="id">
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  /** Bound value for v-model */
  modelValue: boolean;
  /** Optional inline styles */
  style?: Record<string, any>;
  /** Optional id for the input element */
  id?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

/**
 * Convert style prop to a reactive object
 */
const styleObject = computed(() => props.style || {});

/**
 * Handle change event and emit updated value
 */
function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  emit("update:modelValue", input.checked);
}
</script>
