<template>
  <!-- Modal -->
  <div
    class="modal fade"
    ref="modalRef"
    tabindex="-1"
    aria-labelledby="linkModalLabel"
    aria-hidden="true"
  >
    <!-- fullscreen en sm y down, contenido centrado en md+ -->
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="d-flex align-items-center">
            <!-- Logo MS -->
            <span class="ms-logo me-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="22" height="22" fill="#F25022" />
                <rect x="26" y="0" width="22" height="22" fill="#7FBA00" />
                <rect x="0" y="26" width="22" height="22" fill="#00A4EF" />
                <rect x="26" y="26" width="22" height="22" fill="#FFB900" />
              </svg>
            </span>
            <h5 class="modal-title" id="linkModalLabel">
              ¿Quieres vincular tu cuenta con Microsoft?
            </h5>
          </div>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <p class="mb-0">
            Inicia sesión más rápido la próxima vez sin tener que introducir tu contraseña.
          </p>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-link text-secondary" @click="cancel">
            No vincular
          </button>
          <button
            type="button"
            class="btn btn-microsoft d-flex align-items-center"
            @click="confirmLink"
          >
            <span class="btn-ms-logo me-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="22" height="22" fill="#F25022" />
                <rect x="26" y="0" width="22" height="22" fill="#7FBA00" />
                <rect x="0" y="26" width="22" height="22" fill="#00A4EF" />
                <rect x="26" y="26" width="22" height="22" fill="#FFB900" />
              </svg>
            </span>
            Vincular con Microsoft
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const modalRef = ref<HTMLElement | null>(null);
let bsModal: Modal;

onMounted(() => {
  if (modalRef.value) {
    bsModal = new Modal(modalRef.value, {
      backdrop: "static",
      keyboard: false,
    });
    // Emitimos cancel si se cierra con la X o clic fuera
    modalRef.value.addEventListener("hidden.bs.modal", () => {
      emit("cancel");
    });
  }
});


function confirmLink() {
  emit("confirm");
  bsModal.hide();
}

function cancel() {
  emit("cancel");
  bsModal.hide();
}

function open() {
  bsModal.show();
}

defineExpose({ open });
</script>

<style scoped>
/* Bordecito superior en el color oficial de Microsoft */
.modal-content {
  border-top: 4px solid #0078d4;
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Logo header */
.ms-logo svg {
  display: block;
}

/* Footer: botón principal con el azul MS */
.btn-microsoft {
  background-color: #0078d4;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}
.btn-microsoft:hover {
  background-color: #106ebe;
}

/* Icono más pequeño dentro del botón */
.btn-ms-logo svg {
  display: block;
}

/* En móviles el modal ocupa toda la pantalla (dejado al modal-fullscreen-sm-down) */
@media (max-width: 576px) {
  .modal-content {
    border-radius: 0; /* sin bordes redondeados en full */
  }
}
</style>