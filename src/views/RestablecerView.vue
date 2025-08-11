<template>
  <div class="row">
    <div class="col-sm-9 col-md-7 col-lg-5 mx-auto">
      <div class="card border-0 shadow-lg rounded-3 mt-2">
        <div class="card-body mt-0">
          <div class="card-title text-center mt-0 mb-2 fw-light">
            <img
              responsive
              src="@/assets/img/icono2.jpg"
              class="rounded mx-auto d-block"
              alt="365 Equip"
            />
          </div>
          <div class="form-floating mb-3">
            <input
              id="floatingInput"
              v-model="correo"
              required
              type="email"
              class="form-control"
              placeholder=""
            />
            <label for="floatingInput">Correo</label>
          </div>
          <div class="d-grid">
            <button class="btn btn-primary text-uppercase fw-bold" @click="restablecerPass()">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Swal from "sweetalert2";
import { restablecerContraseña } from "@/components/firebase/authentication";

const correo = ref();

async function restablecerPass() {
  if (correo.value) {
    restablecerContraseña(correo.value);
  } else {
    Swal.fire({
      icon: "error",
      title: "Ups...",
      text: `Debes de introducir tu correo`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
}
</script>

<style scoped></style>
