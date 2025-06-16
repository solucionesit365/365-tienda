<template>
  <BsModal
    id="modalEncargos"
    tabindex="-1"
    labelledby="modalLabel"
    :static-backdrop="false"
    v-model="modalEncargos"
  >
    <BsModalHeader @close="modalEncargos = false"
      ><h5 class="modal-title" id="mostrarEncargoTitle">
        {{ encargoMostrar.nombre }}
      </h5></BsModalHeader
    >
    <BsModalBody>
      <ul class="list-group" light v-for="(item, index) in encargoMostrar.productos" :key="index">
        <li
          class="d-flex justify-content-between align-items-center list-group-item text-center"
          color="secondary"
          noBorder
          spacing
        >
          <h1>
            <span class="badge text-bg-secondary">{{ item.cantidad }}</span>
          </h1>
          {{ item.nombreProducto }}
        </li>
      </ul>
      <div v-if="!encargoMostrar.recogido">
        <hr />
        <p>Marca la hora a la que se ha recogido el encargo:</p>
        <div class="mb-3">
          <input
            id="horaEntrega"
            v-model="updateHoraEntrega"
            type="time"
            class="form-control"
            :max="getMaxTime()"
            placeholder="Hora de entrega"
            required
          />
        </div>
      </div>
    </BsModalBody>

    <BsModalFooter>
      <button
        type="button"
        class="btn"
        id="botonRecogido"
        v-if="!encargoMostrar.recogido"
        @click="updateEncargo()"
        color="success"
      >
        Marcar como recogido
      </button>
    </BsModalFooter>
  </BsModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BsModal from "@/components/365/BsModal.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsModalHeader from "./365/BsModalHeader.vue";
import { axiosInstance } from "./axios/axios";
import Swal from "sweetalert2";

const encargoMostrar = ref<any>({});
const modalEncargos = ref(false);
const updateHoraEntrega = ref("");

async function updateEncargo() {
  try {
    encargoMostrar.value.recogido = true;
    encargoMostrar.value.horaEntrega = updateHoraEntrega.value;

    await axiosInstance
      .post("encargos/updateEncargo", encargoMostrar.value)
      .then((response: any) => {
        if (response) {
          Swal.fire("Perfecto", "Encargo entregado", "success");
          console.log(response);
          modalEncargos.value = false;
        } else {
          Swal.fire("Error", "No se ha podido entregar el encargo", "error");
        }
      });
  } catch (error) {
    console.log(error);
  }
}

function abrirModal() {
  modalEncargos.value = true;
}

function getMaxTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

defineExpose({
  abrirModal,
  updateEncargo,
  getMaxTime,
  encargoMostrar,
  updateHoraEntrega,
});
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.35);
  display: flex !important;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  overflow-y: auto;
  padding: 1.5rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.modal-dialog {
  margin: 0 auto;
  max-width: 650px;
  width: 95vw;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  background: transparent;
  display: flex;
  flex-direction: column;
}

.modal-content {
  border-radius: 1rem;
  border: none;
  background: #fff;
  box-shadow: 0 4px 24px rgba(230, 108, 90, 0.1);
  animation: modalIn 0.25s;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

@keyframes modalIn {
  from {
    transform: translateY(40px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  background: #fafbfc;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  overflow-y: auto;
  flex: 1 1 auto;
}

.modal-footer {
  border-top: 1px solid #e0e0e0;
  background: #f7f7f7;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-success {
  background-color: #43a047 !important;
  border: none;
}
.btn-success:hover,
.btn-success:focus {
  background-color: #388e3c !important;
}
#botonRecogido {
  background-color: #43a047;
  color: #fff;
}
@media (max-width: 900px) {
  .modal-dialog {
    max-width: 98vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.8rem !important;
    padding: 0 !important;
  }
  .modal-header {
    padding: 1.1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.15rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2.1rem;
    height: 2.1rem;
    font-size: 1.2rem;
    margin-left: 0.7rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.8rem 0.8rem !important;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 600px) {
  .modal-dialog {
    max-width: 99vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.7rem !important;
    padding: 0 !important;
  }
  .modal-header {
    padding: 1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.1rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
    margin-left: 0.5rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.7rem 0.7rem !important;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
}

@media (max-width: 400px) {
  .modal-title {
    font-size: 1rem;
  }
  .modal-header {
    padding: 0.7rem !important;
  }
  .modal-body,
  .modal-footer {
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }
}
</style>
