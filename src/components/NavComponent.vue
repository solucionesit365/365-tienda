<template>
  <nav class="navbar navbar-transparent">
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasNavbar"
        aria-controls="offcanvasNavbar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div class="offcanvas-header">
          <img src="@/assets/img/logo.png" alt="Logo" height="60" />
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li class="nav-item">
              <a class="nav-link" href="#"> <i class="fas fa-home"></i> Inicio</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="actualizarApp()"
                ><i class="fas fa-cloud-download-alt"></i> Actualizar App
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="signOut()"
                ><i class="fas fa-sign-out-alt"></i> Cerrar sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { logout } from "./firebase/authentication";

function signOut() {
  logout();
}

function actualizarApp() {
  location.reload();
}
</script>

<style scoped>
.navbar-transparent {
  background-color: transparent !important;
  box-shadow: none;
}
.navbar {
  --bs-navbar-toggler-border-color: none;
}
</style>
