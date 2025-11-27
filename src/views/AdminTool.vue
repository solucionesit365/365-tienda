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

          <!-- Modo de autenticación normal para admins -->
          <div v-if="!isAuthenticated">
            <h5 class="text-center mb-3">Acceso de Administrador</h5>
            <div class="alert alert-info">
              <small
                >Inicia sesión con tu cuenta de administrador para acceder a las herramientas de
                soporte.</small
              >
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="loginWithGoogle()">
                <i class="bi bi-google"></i> Iniciar sesión con Google
              </button>
              <button class="btn btn-secondary" @click="loginWithMicrosoft()">
                <i class="bi bi-microsoft"></i> Iniciar sesión con Microsoft
              </button>
            </div>
          </div>

          <!-- Modo de impersonación -->
          <div v-else>
            <h5 class="text-center mb-3">Acceso de Administrador</h5>
            <div class="alert alert-info">
              <small>Introduce el correo del usuario para acceder a su cuenta.</small>
            </div>
            <form @submit.prevent="impersonateUser">
              <div class="form-floating mb-3">
                <input
                  id="targetEmail"
                  v-model="targetEmail"
                  type="email"
                  class="form-control"
                  placeholder=""
                  required
                />
                <label for="targetEmail">Correo del usuario</label>
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Acceder como usuario
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="logout()">
                  Cerrar sesión
                </button>
              </div>
            </form>
          </div>

          <!-- Sistema legacy con contraseña (oculto por defecto) -->
          <div v-if="showLegacyMode" class="mt-4">
            <hr />
            <small class="text-muted">Sistema legacy:</small>
            <form @submit.prevent="entrarConEmail">
              <div class="form-floating mb-2">
                <input
                  id="floatingInput"
                  v-model="email"
                  type="email"
                  class="form-control"
                  placeholder=""
                />
                <label for="floatingInput">Correo</label>
              </div>
              <div class="form-floating mb-2">
                <input
                  id="floatingPassword"
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Password"
                />
                <label for="floatingPassword">Contraseña</label>
              </div>
              <button type="submit" class="btn btn-sm btn-secondary w-100">Entrar (Legacy)</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import { ref, onMounted } from "vue";
import {
  signInWithCustomToken,
  checkLogin,
  loginGoogleWithRedirect,
  accederConMicrosoft,
  logout as firebaseLogout,
} from "../components/firebase/authentication";
import { axiosInstanceAnonymous } from "@/components/axios/axiosAnonymous";
import { axiosInstance } from "@/components/axios/axios";
import router from "@/router";

const email = ref("");
const password = ref("");
const targetEmail = ref("");
const loading = ref(false);
const isAuthenticated = ref(false);
const showLegacyMode = ref(false);

// Verificar si el usuario está autenticado al cargar
onMounted(async () => {
  try {
    const user = await checkLogin();
    isAuthenticated.value = !!user;

    // Mostrar modo legacy si hay parámetro en URL
    const urlParams = new URLSearchParams(window.location.search);
    showLegacyMode.value = urlParams.get("legacy") === "true";
  } catch (error) {
    console.error("Error verificando autenticación:", error);
  }
});

function loginWithGoogle() {
  loginGoogleWithRedirect();
}

function loginWithMicrosoft() {
  accederConMicrosoft();
}

function logout() {
  firebaseLogout();
}

async function impersonateUser() {
  if (!targetEmail.value) {
    Swal.fire("Error", "Por favor introduce el correo del usuario", "error");
    return;
  }

  loading.value = true;

  try {
    const response = await axiosInstance.post("admin/impersonate", {
      targetEmail: targetEmail.value,
    });

    if (response.data.ok) {
      // Usar el custom token para autenticarse como el usuario objetivo
      await signInWithCustomToken(response.data.data);

      // Mostrar notificación simple de acceso exitoso
      await Swal.fire({
        icon: "success",
        title: "Acceso exitoso",
        html: `Ahora estás viendo la cuenta de <strong>${response.data.targetEmail}</strong>.`,
        confirmButtonText: "Continuar",
        timer: 2000,
        timerProgressBar: true,
      });

      // Redirigir al dashboard
      router.push("/");
    } else {
      throw new Error(response.data.message || "Error al acceder como usuario");
    }
  } catch (error) {
    console.error("Error en impersonación:", error);
    Swal.fire("Error", "No se pudo acceder como el usuario", "error");
  } finally {
    loading.value = false;
  }
}

// Función legacy con contraseña
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
      Swal.fire("Oops...", "Ha habido un problema", "error");
    });
}
</script>

<style lang="scss" scoped>
.btn-login {
  font-size: 0.9rem;
  letter-spacing: 0.05rem;
  padding: 0.75rem 1rem;
  color: white;
  background: #03a55a;
}

.btn-google {
  color: white !important;
  background: linear-gradient(
    270deg,
    rgb(216, 42, 36) 0%,
    rgb(223, 67, 61) 0%,
    rgb(236, 98, 74) 34%
  );
}

.bi {
  margin-right: 0.5rem;
}
</style>
