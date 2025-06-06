<template>
  <button :class="buttonClasses" :disabled="disabled" @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
  size?: "sm" | "lg";
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
  disabled: false,
});

defineEmits(["click"]);

const buttonClasses = computed(() => {
  const classes = ["btn"];

  // Color
  classes.push(`btn-${props.color}`);

  // Size
  if (props.size) {
    classes.push(`btn-${props.size}`);
  }

  // Custom classes
  if (props.class) {
    classes.push(props.class);
  }

  return classes.join(" ");
});
</script>
