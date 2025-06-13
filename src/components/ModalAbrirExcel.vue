<template>
  <BsModal
    id="modalAbrirExcel"
    tabindex="-1"
    labelledby="modalLabel"
    :static-backdrop="true"
    v-model="modalAbrirExcel"
  >
    <BsModalHeader @close="modalAbrirExcel = false"
      ><h5>¿Como quieres llamar al archivo?</h5></BsModalHeader
    >
    <BsModalBody>
      <input
        type="text"
        class="form-control"
        placeholder="Nombre del archivo"
        v-model="nombreArchivo"
      />
    </BsModalBody>

    <BsModalFooter>
      <button
        @click="descargarExcel()"
        type="button"
        class="btn btn-success fw-bold d-flex align-items-center gap-2"
        style="min-width: 100px"
      >
        Descargar
      </button>
    </BsModalFooter>
  </BsModal>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import BsModal from "@/components/365/BsModal.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsModalHeader from "./365/BsModalHeader.vue";

const descargarExcel: any = inject("descargarExcel");
const modalAbrirExcel = ref(false);
const nombreArchivo = ref("");

function abrirModal() {
  modalAbrirExcel.value = true;
}
// function cerrarModal() {
//   modalAbrirExcel.value = false;
// }
defineExpose({
  abrirModal,
  nombreArchivo,
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
