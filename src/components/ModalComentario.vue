<template>
  <BsModal
    id="modalComentario"
    tabindex="-1"
    labelledby="exampleModalLabel"
    v-model="modalComentario"
  >
    <BsModalHeader>
      <BsModalTitle id="exampleModalLabel"> {{ tituloSetup }} </BsModalTitle>
    </BsModalHeader>
    <BsModalBody>
      <input v-model="comentario" wrapperClass="mb-4" />
    </BsModalBody>
    <BsModalFooter>
      <BsButton color="secondary" @click="modalComentario = false">Cerrar</BsButton>
      <BsButton @click="finalizar(idSoli)" color="primary">Confirmar</BsButton>
    </BsModalFooter>
  </BsModal>
</template>

<script setup lang="ts">
import BsButton from "@/components/365/BsButton.vue";
import { ref, inject } from "vue";
import BsModal from "./365/BsModal.vue";
import BsModalFooter from "./365/BsModalFooter.vue";
import BsModalHeader from "./365/BsModalHeader.vue";
import BsModalBody from "./365/BsModalBody.vue";
import BsModalTitle from "./365/BsModalTitle.vue";
const modalComentario = ref(false);
const tituloSetup = ref("");
const finalizar: any = inject("finalizar");
const comentario = ref("");
const idSoli = ref(null);

function abrirModal(titulo: string, idSolicitud: any) {
  comentario.value = "";
  idSoli.value = idSolicitud;
  tituloSetup.value = titulo;
  modalComentario.value = true;
}

function cerrarModal() {
  modalComentario.value = false;
}

defineExpose({
  abrirModal,
  comentario,
  cerrarModal,
});
</script>

<style scoped></style>
