<template>
  <div :class="wrapperClasses">
    <div v-if="inputGroup" class="input-group">
      <input
        :id="id"
        :type="type"
        class="form-control"
        :placeholder="placeholder"
        :value="modelValue"
        :aria-label="ariaLabel"
        @input="handleInput"
        @keyup="handleKeyup"
      />
      <slot></slot>
    </div>
    <template v-else>
      <label v-if="label" :for="id" class="form-label">{{ label }}</label>
      <input
        :id="id"
        :type="type"
        class="form-control"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        @keyup="handleKeyup"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  id?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  modelValue?: string;
  inputGroup?: boolean;
  formOutline?: boolean;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  inputGroup: false,
  formOutline: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  keyup: [event: KeyboardEvent];
}>();

const wrapperClasses = computed(() => {
  return props.inputGroup ? "" : "mb-3";
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleKeyup = (event: KeyboardEvent) => {
  emit("keyup", event);
};
</script>
