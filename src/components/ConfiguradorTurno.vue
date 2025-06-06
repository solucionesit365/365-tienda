<template>
  <MDBModal
    id="modalConfiguradorTurno"
    tabindex="-1"
    labelledby="modalLabel"
    v-model="modalConfiguradorTurno"
    static-backdrop
  >
    <MDBModalBody>
      <div class="row" v-if="mostrarselectTienda">
        <label for="tiendaSelect">Tienda destino:</label>
        <select v-model="idTiendaSelected" id="tiendaSelect" class="form-select">
          <option v-for="(tienda, index) in arrayTiendas" v-bind:key="index" :value="tienda.value">
            {{ tienda.text }}
          </option>
        </select>
      </div>
    </MDBModalBody>

    <MDBModalFooter class="d-flex justify-content-center">
      <div class="text-end">
        <MDBBtn color="primary" size="sm" @click="addCuadrante"
          ><i class="fas fa-plus me-1"></i> doble turno
        </MDBBtn>
      </div>

      <div class="text-end">
        <MDBBtn color="success" size="sm" @click="mostrarSelectTienda"
          ><i class="fas fa-plus me-1"></i>Destino Tienda</MDBBtn
        >
      </div>

      <div>
        <MDBBtn color="danger" size="sm" @click="borrar()">Borrar turno</MDBBtn>
      </div>
      <div>
        <MDBBtn color="warning" size="sm" @click="salir()">Salir</MDBBtn>
      </div>
    </MDBModalFooter>
  </MDBModal>
</template>

<script setup lang="ts">
import type { DateTime } from "luxon";
import { MDBModal, MDBBtn, MDBModalBody, MDBModalFooter } from "mdb-vue-ui-kit";
import Swal from "sweetalert2";
import { ref, watch, type Ref } from "vue";

interface TTiendaEspecial {
  text: string;
  value: number;
  idTienda: number;
}

const emit = defineEmits<{
  (e: "update:tienda", payload: { idTurno: string; idTienda: number | null }): void;
  (e: "borrar:turno", payload: { idTurno: string }): void;
  (e: "add-cuadrante", payload: { dia: DateTime; idTienda: number | null; ausencia: any }): void;
}>();
const modalConfiguradorTurno = ref(false);
const idTiendaSelected: Ref<number | null> = ref(null);
const arrayTiendas: Ref<TTiendaEspecial[]> = ref([]);
let savedTurno: any = null;
let unwatch: any;
const mostrarselectTienda = ref(false);

function abrirModal(turno: any, tiendas: TTiendaEspecial[]) {
  arrayTiendas.value = tiendas;
  idTiendaSelected.value = turno.idTienda;
  savedTurno = turno;

  modalConfiguradorTurno.value = true;

  // Configura el watcher solo después de ejecutar abrirModal
  unwatch = watch(idTiendaSelected, (newValue) => {
    emit("update:tienda", {
      idTurno: savedTurno._id,
      idTienda: newValue,
    });
  });
}

function mostrarSelectTienda() {
  mostrarselectTienda.value = true;
}

function salir() {
  savedTurno = null;
  idTiendaSelected.value = null;
  mostrarselectTienda.value = false;

  modalConfiguradorTurno.value = false;
  if (unwatch) {
    unwatch();
  }
}

function borrar() {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Quieres restablecer o borrar este turno?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
  })
    .then((result) => {
      if (result.isConfirmed) {
        emit("borrar:turno", { idTurno: savedTurno._id });
      }
    })
    .finally(() => {
      salir();
    });
}

function addCuadrante() {
  console.log("el cuadrante que se inserta:", savedTurno.final.toFormat("dd-MM-yyyy HH:mm"));
  emit("add-cuadrante", {
    dia: savedTurno.final,
    idTienda: idTiendaSelected.value,
    ausencia: savedTurno.ausencia,
  });
  salir();
}

defineExpose({
  abrirModal,
});
</script>

<style scoped></style>
