<template>
  <nav class="navbar fixed-bottom app-navbar">
    <div class="container-fluid d-flex justify-content-around align-items-center">
      <!-- Inicio -->
      <router-link
        to="/"
        class="nav-btn"
        :class="{ active: $router.currentRoute.value.path == '/' }"
      >
        <div class="icon-wrapper">
          <i class="fas fa-home"></i>
        </div>
        <span class="nav-label">Inicio</span>
      </router-link>

      <!-- Actualizar -->
      <a class="nav-btn" href="#" @click.prevent="actualizarApp">
        <div class="icon-wrapper">
          <i class="fas fa-sync-alt"></i>
        </div>
        <span class="nav-label">Actualizar</span>
      </a>

      <!-- Salir -->
      <a class="nav-btn" href="#" @click.prevent="signOut">
        <div class="icon-wrapper">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <span class="nav-label">Salir</span>
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import "@fortawesome/fontawesome-free/css/all.min.css";
import { logout } from "./firebase/authentication";

function actualizarApp() {
  location.reload();
}

function signOut() {
  logout();
}
</script>

<style lang="sass" scoped>
$corporate: #e57373;

.app-navbar
  height: 3.8rem
  background: rgba(31, 41, 55, 0.9)
  backdrop-filter: blur(12px)
  border-top: 1px solid rgba(255, 255, 255, 0.1)
  z-index: 1030

.nav-btn
  background: transparent
  border: none
  color: #cbd5e0
  text-decoration: none
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: 0rem !important
  transition: color 0.2s ease-in-out
  position: relative
  font-size: 0.8rem !important


  &:hover,
  &.active
    color: $corporate

  .icon-wrapper
    font-size: 1.3rem
    transition: transform 0.2s ease-in-out

  &:hover .icon-wrapper,
  &.active .icon-wrapper
    transform: scale(1.2)

.nav-label
  font-weight: 500
  margin-top:-0.3rem

@media (max-width: 480px)
  .app-navbar
    height: 3.8rem

  .nav-btn
    font-size: 0.70rem !important

    .icon-wrapper
      font-size: 1.3rem
  .nav-label
    font-weight: 500
    margin-top: 0rem
</style>
