<template>
  <div class="splash-screen">
    <div class="logo-container">
      <img src="@/assets/img/logo.png" alt="Cafetería & Panadería Logo" class="logo" />
    </div>
    <div class="loader">Cargando deliciosos sabores...</div>
  </div>
</template>

<script setup lang="ts">
// Opcional: lógica adicional si necesitas algo después del splash
</script>

<style scoped>
.splash-screen {
  height: 100vh;
  width: 100vw;
  background-color: #fff8f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Poppins", sans-serif;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 150px;
  height: auto;
  animation: bounce 2s infinite ease-in-out;
}

.loader {
  color: #8b4513;
  font-size: 1.2rem;
  animation: fadeIn 3s ease-in-out infinite alternate;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}
</style>
