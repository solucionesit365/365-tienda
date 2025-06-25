<!-- BsButtonGroup.vue -->
<template>
  <div v-bind="attrs" :class="groupClasses" role="group" :aria-label="props.ariaLabel">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

interface Props {
  /** Tamaño del grupo de botones: 'sm' | 'lg' */
  size?: "sm" | "lg";
  /** Vertical o horizontal (por defecto horizontal) */
  vertical?: boolean;
  /** Etiqueta accesible para el grupo */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  vertical: false,
});

const attrs = useAttrs();

const groupClasses = computed(() => {
  // clase base: btn-group o btn-group-vertical
  const base = props.vertical ? "btn-group-vertical" : "btn-group";
  // si hay tamaño, btn-group-sm o btn-group-lg
  const sizeClass = props.size ? `${base}-${props.size}` : "";
  // Vue fusionará attrs.class con este array
  return [base, sizeClass];
});
</script>

<style scoped></style>
