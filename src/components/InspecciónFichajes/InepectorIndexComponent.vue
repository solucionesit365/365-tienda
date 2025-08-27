<template>
  <div v-if="!accesoPermitido" id="main-container" class="container-center p-4">
    <!-- Tarjeta de entrada del PIN -->
    <div
      id="pin-card"
      class="card card-custom shadow-lg p-4 w-100 transition-transform-opacity"
      style="max-width: 500px"
    >
      <div class="card-body text-center">
        <h2 class="card-title fw-semibold mb-2 text-dark">Inspección Fichajes</h2>
        <p class="card-text text-muted">Por favor, introduce el PIN de 4 dígitos para continuar.</p>
        <!-- <p class="card-text text-muted mb-4">Indica a recursos humanos que te proporcione el PIN</p> -->

        <div class="d-flex justify-content-center gap-2 mb-3">
          <input
            id="pin-input-1"
            maxlength="1"
            class="form-control form-control-pin"
            pattern="[0-9]"
            inputmode="numeric"
            v-model="dig1"
          />
          <input
            id="pin-input-2"
            maxlength="1"
            class="form-control form-control-pin"
            pattern="[0-9]"
            inputmode="numeric"
            v-model="dig2"
          />
          <input
            id="pin-input-3"
            maxlength="1"
            class="form-control form-control-pin"
            pattern="[0-9]"
            inputmode="numeric"
            v-model="dig3"
          />
          <input
            id="pin-input-4"
            maxlength="1"
            class="form-control form-control-pin"
            pattern="[0-9]"
            inputmode="numeric"
            v-model="dig4"
          />
        </div>

        <!-- Botón de Validar añadido -->
        <div class="d-flex justify-content-center mt-5">
          <button
            class="btn btn-primary fw-bold py-2 px-5 rounded-pill shadow-lg"
            style="background-color: #14b8a6; border-color: #14b8a6"
            @click="validarPin"
          >
            Validar
          </button>
        </div>
      </div>
      <div class="text-muted">
        <p>
          <i class="fas fa-question-circle text-info"></i> El PIN de acceso debe de ser
          proporcionado por RRHH de 365Obrador.
        </p>
        <p>
          <i class="fas fa-question-circle text-info"></i> El PIN es de un solo uso, una vez
          validado este no se podrá usar nuevamente.
        </p>
      </div>
    </div>
  </div>
  <template v-if="accesoPermitido">
    <InspectorConsulta
      ref="inspectorConsultaComponent"
      :pin-tienda="idTiendaPIN ? idTiendaPIN.toString() : ''"
    />
  </template>
</template>

<script setup lang="ts">
// IMPORTS
import { ref } from "vue";
import Swal from "sweetalert2";
import InspectorConsulta from "./InspectorConsulta.vue";
// import { axiosInstance } from "../axios/axios";
import { axiosInstanceAnonymous } from "../axios/axiosAnonymous";
import { DateTime } from "luxon";

// SCRIPTS PETES
const dig1 = ref("");
const dig2 = ref("");
const dig3 = ref("");
const dig4 = ref("");
const pinAcceso = ref("");
const accesoPermitido = ref(false);
const inspectorConsultaComponent = ref(false);
const idTiendaPIN = ref<number>(); // ID de tienda asociado al PIN

async function validarPin() {
  pinAcceso.value = dig1.value + dig2.value + dig3.value + dig4.value;

  if (pinAcceso.value.length === 4) {
    try {
      const response = await axiosInstanceAnonymous.get("inspeccionFichajes/validarPin", {
        params: { pin: Number(pinAcceso.value) },
      });

      if (response.data.ok) {
        idTiendaPIN.value = response.data.data.idTienda;

        // Reiniciar los campos después de la validación
        Swal.fire(
          "PIN DE UN SOLO USO VALIDADO",
          `Valido para la tienda: ${response.data.data.nombreTienda}. Este PIN ya no funcionará más`,
          "success",
        );
        dig1.value = "";
        dig2.value = "";
        dig3.value = "";
        dig4.value = "";
        accesoPermitido.value = true;
        await axiosInstanceAnonymous
          .post("inspeccionFichajes/updateInspeccionFichajes", {
            id: response.data.data._id,
            data: {
              usedTime: DateTime.now().toISO(),
              activado: false,
            },
          })
          .then(() => {
            console.log("PIN marcado como usado");
          })
          .catch((error) => {
            console.error("Error al marcar el PIN como usado:", error);
          });
      } else {
        Swal.fire("PIN INCORRECTO", response.data.message, "error");
      }
    } catch {
      Swal.fire("Error", "No se pudo validar el PIN.", "error");
    }
  } else {
    Swal.fire("PIN INCORRECTO", "Por favor, ingresa un PIN de 4 dígitos.", "error");
  }
}
</script>

<style scoped>
.card-custom {
  border-radius: 1.5rem;
  max-width: 100% !important;
}

.form-control-pin {
  width: 5.5rem;
  height: 6rem;
  text-align: center;
  font-weight: 700;
  font-size: 3.25rem;
  background-color: #e2e8f0;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
}
.form-control-pin:focus {
  box-shadow: 0 0 0 0.2rem #e66c5a;
}
.transition-transform-opacity {
  transition:
    transform 0.5s ease-in-out,
    opacity 0.5s ease-in-out;
}
</style>
