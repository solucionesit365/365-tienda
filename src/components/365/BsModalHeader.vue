<template>
  <div class="modal-header">
    <slot></slot>
    <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
  </div>
</template>

<script setup lang="ts">
defineEmits(["close"]);
</script>
