<template>
  <nav class="navbar fixed-bottom bg-white shadow-lg app-navbar">
    <div class="container-fluid d-flex justify-content-around align-items-center">
      <a
        class="nav-item nav-link d-flex flex-column align-items-center justify-content-center"
        href="#"
        @click.prevent="goHome()"
        :class="{ active: isHomeActive }"
      >
        <div class="icon-wrapper">
          <i class="fas fa-home"></i>
        </div>
        <span class="nav-label">Inicio</span>
      </a>
      <a
        class="nav-item nav-link d-flex flex-column align-items-center justify-content-center"
        href="#"
        @click.prevent="actualizarApp()"
      >
        <div class="icon-wrapper">
          <i class="fas fa-cloud-download-alt"></i>
        </div>
        <span class="nav-label">Actualizar</span>
      </a>
      <a
        class="nav-item nav-link d-flex flex-column align-items-center justify-content-center"
        href="#"
        @click.prevent="signOut()"
      >
        <div class="icon-wrapper">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <span class="nav-label">Salir</span>
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { logout } from "./firebase/authentication";
// import { hasPermission } from "./rolesPermisos";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

function goHome() {
  router.push("/");
}

const isHomeActive = computed(() => {
  return route.path === "/";
});

function signOut() {
  logout();
}

function actualizarApp() {
  location.reload();
}
</script>

<style scoped>
.app-navbar {
  height: 80px;
  border-top: 1px solid #e5e7eb;
  z-index: 1030;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.nav-link {
  padding: 8px 12px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  min-width: 70px;
  position: relative;
}

.nav-link:hover,
.nav-link:focus {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.nav-link:active {
  transform: translateY(0);
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover .icon-wrapper {
  background-color: rgba(59, 130, 246, 0.15);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.icon-wrapper i {
  font-size: 20px;
  transition: all 0.3s ease;
}

.nav-link:hover .icon-wrapper i {
  transform: scale(1.1);
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
}

.nav-link:hover .nav-label {
  font-weight: 600;
}

/* Efecto de ripple sutil */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.nav-link::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.nav-link:active::before {
  width: 300px;
  height: 300px;
  animation: ripple 0.6s ease-out;
}

/* Responsive design */
@media (max-width: 480px) {
  .app-navbar {
    height: 75px;
  }

  .nav-link {
    min-width: 60px;
    padding: 6px 8px;
  }

  .icon-wrapper {
    width: 28px;
    height: 28px;
  }

  .icon-wrapper i {
    font-size: 18px;
  }

  .nav-label {
    font-size: 11px;
  }
}
</style>
