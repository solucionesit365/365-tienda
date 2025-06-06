<template>
  <h5 class="modal-title" :id="id">
    <slot></slot>
  </h5>
</template>

<script setup lang="ts">
interface Props {
  id?: string;
}

defineProps<Props>();
</script>
