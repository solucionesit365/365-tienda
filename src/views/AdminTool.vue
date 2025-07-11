<template>
  <div class="row">
    <div class="col-sm-9 col-md-7 col-lg-5 mx-auto">
      <div class="card mt-2">
        <div class="card-body mt-0">
          <div class="card-title text-center mt-0 mb-2 fw-light">
            <img responsive src="/icono2.jpg" class="rounded mx-auto d-block" alt="365 Equip" />
          </div>
          <form>
            <div class="form-floating mb-3">
              <input
                id="floatingInput"
                v-model="email"
                type="email"
                class="form-control"
                placeholder=""
              />
              <label for="floatingInput">Correo</label>
            </div>
            <div class="form-floating mb-3">
              <input
                id="floatingPassword"
                v-model="password"
                type="password"
                class="form-control"
                placeholder="Password"
              />
              <label for="floatingPassword">Contraseña</label>
            </div>
          </form>

          <div class="form-check mb-3 text-center text-muted">
            <router-link to="/restablecer" class="text-dark text-decoration-none">
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>
          <div class="d-grid">
            <BsButton class="btn btn-login text-uppercase fw-bold" @click="entrarConEmail()">
              Entrar
            </BsButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import { ref } from "vue";

import { signInWithCustomToken } from "../components/firebase/authentication";
import { axiosInstanceAnonymous } from "@/components/axios/axiosAnonymous";
import BsButton from "@/components/365/BsButton.vue";

const email = ref("");
const password = ref("");

function entrarConEmail() {
  axiosInstanceAnonymous
    .post("admin/signInWithCustomToken", {
      email: email.value,
      password: password.value,
    })
    .then((res) => {
      if (res.data.ok) signInWithCustomToken(res.data.data);
      else throw Error("No se ha podido obtener el token como administrador");
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Oops...", err.message, "error");
    });
}
</script>

<style scoped>
.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}
</style>
