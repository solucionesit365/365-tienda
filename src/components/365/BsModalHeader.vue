<template>
  <div class="modal-header">
    <slot></slot>
    <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
  </div>
</template>

<script setup lang="ts">
defineEmits(["close"]);
</script>
<style>

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff !important;
  opacity: 1;
  margin-left: 1rem;
  position: relative;
  transition:
    background 0.2s,
    color 0.2s;
}

.btn-close::before {
  content: "✕";
  font-size: 1.5rem;
  color: #fff;
  line-height: 1;
  font-weight: bold;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.btn-close:hover,
.btn-close:focus {
  background: rgba(230, 108, 90, 0.15);
  color: #fff;
  outline: none;
}
</style>
