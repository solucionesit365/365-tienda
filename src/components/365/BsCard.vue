<template>
  <div class="card" :class="cardClasses">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  text?: string;
  bg?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: "",
  bg: "",
  class: "",
});

const cardClasses = computed(() => {
  const classes = [];

  if (props.text) {
    classes.push(`text-${props.text}`);
  }

  if (props.bg) {
    classes.push(`bg-${props.bg}`);
  }

  if (props.class) {
    classes.push(props.class);
  }

  return classes.join(" ");
});
</script>
