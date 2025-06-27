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
  const base = props.vertical ? "btn-group-vertical" : "btn-group";
  const sizeClass = props.size ? `${base}-${props.size}` : "";
  // d-flex en xs, inline-flex en sm+; w-100 en xs
  const responsive = "d-flex d-sm-inline-flex w-100";
  return [base, sizeClass, responsive];
});
</script>

<style scoped>
/* Sólo hace falta forzar el flex-grow de los botones */
::v-deep(.btn-group > .btn) {
  /* Esto se aplicará en todos los breakpoints, pero
     como en sm+ el grupo es inline-flex y no ocupa 100%,
     no notarás la repartición en desktop */
  flex: 1 1 0;
}
</style>
