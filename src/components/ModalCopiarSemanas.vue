<template>
  <BsModal id="modalCopiarSemana" tabindex="-1" labelledby="modalLabel" v-model="modalCopiarSemana">
    <BsModalBody>
      <div class="row">
        <div class="col">
          <BsSelect
            :filter="true"
            :select-all="false"
            :search-placeholder="'Buscar'"
            v-model:options="opcionesSemanas"
            v-model:selected="semanaElegida"
            label="Selecciona una semana"
          />
        </div>
      </div>
    </BsModalBody>
    <BsModalFooter>
      <BsButton color="warning" size="lg" @click="modalCopiarSemana = false"> Salir </BsButton>
      <BsButton color="dark" size="lg" @click="copiarSemana(semanaElegida)">
        Copiar semana
      </BsButton>
    </BsModalFooter>
  </BsModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DateTime } from "luxon";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
// Importar los nuevos componentes
import BsModal from "@/components/365/BsModal.vue";
import BsButton from "@/components/365/BsButton.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsSelect from "@/components/365/BsSelect.vue";

// Declaración de variables reactivas con anotaciones de tipo
const modalCopiarSemana = ref<boolean>(false);
const opcionesSemanas = ref<Array<{ text: string; value: number }>>([]);
const semanaElegida = ref<any>(null);
const idTienda = ref<number>(-1);
const nSemanaOrigen = ref<number>(-1);

// Función para crear el array de semanas
function crearArraySemanas(): void {
  opcionesSemanas.value = [];
  let semanaInicial = DateTime.local().set({ weekNumber: 1 }); // Empieza en la primera semana del año
  let i = 1;
  while (semanaInicial.weekNumber === i) {
    const firstDayOfWeek = semanaInicial.startOf("week").toISODate();
    const lastDayOfWeek = semanaInicial.endOf("week").toISODate();
    opcionesSemanas.value.push({
      text: `[Semana ${i}] Del ${DateTime.fromISO(firstDayOfWeek).toFormat("dd MMMM")} al ${DateTime.fromISO(lastDayOfWeek).toFormat("dd MMMM")}`,
      value: i,
    });
    i++;
    semanaInicial = DateTime.local().set({ weekNumber: i });
  }
}

// Función para abrir el modal y asignar valores
function abrirModal(valorIdTienda: number, valorNSemanaOrigen: number): void {
  idTienda.value = valorIdTienda;
  nSemanaOrigen.value = valorNSemanaOrigen;
  modalCopiarSemana.value = true;
}

// Función para cerrar el modal
function cerrarModal(): void {
  modalCopiarSemana.value = false;
}

// Función asíncrona para copiar la semana
async function copiarSemana(nSemanaDestino: number): Promise<void> {
  try {
    const lunesOrigen = DateTime.local().set({
      weekNumber: nSemanaOrigen.value,
      weekday: 1,
    }); // Lunes de la semana origen

    const lunesDestino = DateTime.local().set({
      weekNumber: nSemanaDestino,
      weekday: 1,
    }); // Lunes de la semana destino

    await axiosInstance.post("cuadrantes/copiarSemanaCuadrante", {
      fechaSemanaOrigen: lunesOrigen.toISO(),
      fechaSemanaDestino: lunesDestino.toISO(),
      idTienda: idTienda.value,
    });

    Swal.fire({
      icon: "success",
      title: "Semana copiada correctamente",
      showConfirmButton: false,
      timer: 1500,
    });

    cerrarModal();
  } catch (err) {
    console.log(err);
    Swal.fire({
      icon: "error",
      title: "Error al copiar la semana",
      text: "Por favor, inténtelo de nuevo",
    });
  }
}

// Inicialización al montar el componente
onMounted(() => {
  crearArraySemanas();
});

// Exponer funciones para que el componente padre pueda acceder a ellas
defineExpose({
  abrirModal,
  cerrarModal,
});
</script>

<style lang="scss" scoped>
/* Tus estilos aquí */
</style>
