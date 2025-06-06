<template>
  <div class="spinner-border" :style="spinnerStyle" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  style?: any;
}

const props = defineProps<Props>();

const spinnerStyle = computed(() => {
  return props.style || {};
});
</script>
