<template>
  <BsModal
    id="modalEncargos"
    tabindex="-1"
    labelledby="modalLabel"
    :static-backdrop="true"
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
          class="d-flex justify-content-between align-items-center, list-group-item"
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
        <p>Marca la hora que se ha recogido el encargo:</p>
        <div class="mb-3">
          <label for="horaEntrega" class="form-label">Hora entrega</label>
          <input
            id="horaEntrega"
            v-model="updateHoraEntrega"
            type="time"
            class="form-control"
            :max="getMaxTime()"
            required
          />
        </div>
      </div>
    </BsModalBody>

    <BsModalFooter>
      <button type="button" class="btn" color="secondary" @click="mostrarEncargoModal()">
        Cerrar
      </button>
      <button
        type="button"
        class="btn"
        v-if="!encargoMostrar.recogido"
        @click="updateEncargo()"
        color="success"
      >
        marcar como recogido
      </button>
    </BsModalFooter>
  </BsModal>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import BsModal from "@/components/365/BsModal.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsModalHeader from "./365/BsModalHeader.vue";

const encargoMostrar = ref<any>({});
const getMaxTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
const updateEncargo: any = inject('updateEncargo');
const mostrarEncargoModal: any = inject('mostrarEncargoModal');

</script>

<style scoped></style>
