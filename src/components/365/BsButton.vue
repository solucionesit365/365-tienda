<!-- BsButton.vue -->
<template>
  <button
    v-bind="attrs"
    :class="mergedClasses"
    :disabled="props.disabled"
    @click="$emit('click', $event)"
  >
    <!-- Icono a la izquierda -->
    <i
      v-if="props.icon && props.iconPosition === 'left'"
      :class="iconClasses"
      aria-hidden="true"
    ></i>

    <slot />

    <!-- Icono a la derecha -->
    <i
      v-if="props.icon && props.iconPosition === 'right'"
      :class="iconClasses"
      aria-hidden="true"
    ></i>
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

interface Props {
  /** Color de botón (clases tipo btn-primary, btn-danger, etc.) */
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
  /** Tamaño: sm o lg */
  size?: "sm" | "lg";
  /** Deshabilitado */
  disabled?: boolean;
  /** Nombre del icono (p.ej. "check", "times", "user") */
  icon?: string;
  /** Posición del icono respecto al texto */
  iconPosition?: "left" | "right";
  /** Usar variante outline en lugar de relleno */
  outline?: boolean;
}

/** Valores por defecto de props */
const props = withDefaults(defineProps<Props>(), {
  color: "primary",
  disabled: false,
  iconPosition: "left",
  outline: false,
});

/** Evento click que reemitimos */
defineEmits<{
  (e: "click", ev: MouseEvent): void;
}>();

/** Todos los attrs no gestionados como props (incluye class, style, etc.) */
const attrs = useAttrs();

/** Clases base del botón (Bootstrap) */
const baseClasses = computed(() => {
  const variant = props.outline ? `btn-outline-${props.color}` : `btn-${props.color}`;

  const classes: Array<string | undefined> = [
    "btn",
    variant,
    props.size ? `btn-${props.size}` : undefined,
  ];
  return classes.filter(Boolean) as string[];
});

/** Mezcla clases de base con las que venga por attrs.class */
const mergedClasses = computed(() => [...baseClasses.value, attrs.class]);

/** Clases para el icono (Font-Awesome + espaciado) */
const iconClasses = computed(() => {
  if (!props.icon) return [];
  const faClass = `fa fa-${props.icon}`;
  const spaceClass = props.iconPosition === "left" ? "me-2" : "ms-2";
  return [faClass, spaceClass];
});
</script>

<style scoped>
/* Aquí puedes añadir estilos específicos si los necesitas */
</style>
