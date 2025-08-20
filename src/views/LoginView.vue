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
          <form @keydown.enter="entrarConEmail()">
            <div class="form-floating mb-3">
              <input v-model="email" type="email" class="form-control" placeholder="" />
              <label>Correo</label>
            </div>
            <div class="form-floating mb-3">
              <input
                v-model="password"
                type="password"
                class="form-control"
                placeholder="Password"
              />
              <label>Contraseña</label>
            </div>
          </form>

          <div class="form-check mb-3 text-center text-muted">
            <router-link to="/restablecer" class="text-dark text-decoration-none">
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>

          <div class="d-grid">
            <button class="btn btn-login text-uppercase fw-bold" @click="entrarConEmail()">
              Entrar
            </button>
          </div>

          <!-- Nuevo botón de Microsoft -->
          <div class="d-grid mt-2">
            <button
              class="btn btn-microsoft text-uppercase fw-bold d-flex align-items-center justify-content-center"
              @click="accederConMicrosoft()"
            >
              <img
                src="@/assets/img/Microsoft_logo.svg"
                alt="Microsoft logo"
                class="microsoft-logo me-2"
              />
              <span>Acceder con Microsoft</span>
            </button>
          </div>

          <div class="d-grid mt-2">
            <p @click="goTo('/abrirIncidenciaInvitado')" class="fw-bold text-muted text-center">
              Necesito ayuda
            </p>
          </div>
          <p class="text-center mt-2 text-muted">
            Al hacer uso de esta app aceptas nuestras
            <router-link to="/privacidad">
              <span class="fw-bold" style="color: #03a55a">políticas de privacidad</span>
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { accederConEmail, accederConMicrosoft } from "@/components/firebase/authentication";

const router = useRouter();
const email = ref("");
const password = ref("");

function goTo(url: string) {
  router.push(url);
}

function entrarConEmail() {
  accederConEmail(email.value, password.value);
}
</script>

<style lang="scss" scoped>
.btn-login {
  font-size: 0.9rem;
  letter-spacing: 0.05rem;
  padding: 0.75rem 1rem;
  color: white;
  background: #e66c5a;
}

.btn-microsoft {
  font-size: 0.9rem;
  letter-spacing: 0.05rem;
  padding: 0.75rem 1rem;
  color: #000;
  background-color: #fff;
  border: 1px solid #dcdcdc;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f3f3f3;
  }

  .microsoft-logo {
    width: 20px;
    height: 20px;
  }
}
</style>
npm run
