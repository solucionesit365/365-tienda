<template>
<div class="color-container">
    <div v-if="colorIn" class="color-display">
      <p class="color-label">Color que ENTRA:</p>
      <div class="color-box" :style="{ backgroundColor: getColorHex(colorIn) }"></div>
      <p class="color-name">{{ translateColor(colorIn) }}</p>
    </div>
    <div v-if="colorOut" class="color-display">
      <p class="color-label">Color a ELIMINAR:</p>
      <div class="color-box" :style="{ backgroundColor: getColorHex(colorOut) }"></div>
      <p class="color-name">{{ translateColor(colorOut) }}</p>
    </div>

    <p>
      Última actualización:
      <span class="fw-bold">semana {{ updatedAt }}</span> <br />
    </p>

    <!-- Sección de selección de color para el responsable -->
    <div v-if="isResponsible" class="color-selection">
      <p class="color-label text-center">Selecciona el nuevo color que entrará esta semana</p>
      <div class="color-options">
        <div v-for="(color, index) in availableColors" :key="color" class="color-option-wrapper">
          <div
            class="color-option"
            :style="{ backgroundColor: getColorHex(color) }"
            @click="confirmColorChange(color)"
          ></div>
          <div v-if="index < availableColors.length - 1" class="color-connector"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>
