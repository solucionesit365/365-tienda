<template>
  <tr class="table-responsive">
    <th scope="row" :style="[color()]">
      {{
        props.turno.inicio.setLocale("es").toFormat("EEE dd").charAt(0).toUpperCase() +
        props.turno.inicio.setLocale("es").toFormat("EEE dd").slice(1)
      }}
    </th>
    <td>
      <input
        type="time"
        v-model="inicio"
        class="form-control custom-width-date"
        :disabled="bloqueado"
      />
    </td>
    <td>
      <input
        type="time"
        v-model="final"
        class="form-control custom-width-date"
        :disabled="bloqueado"
      />
    </td>
    <td>
      <i
        v-if="!bloqueado"
        class="fas fa-cog fa-2x padding-set-gear"
        @click="abrirConfigurador()"
      ></i>

      <i v-else class="fas fa-lock fa-2x padding-set-gear" @click="alertaBloqueado()"></i>
    </td>
  </tr>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import { ref, watch, computed } from "vue";

const props = defineProps<{ turno: any }>();
const emit = defineEmits<{
  (e: "configurador:abrir"): void;
  (e: "update:turno", turno: any): void;
}>();

/* Bloqueo según ausencia completa o no */
const bloqueado = computed(() => {
  if (props.turno?.ausencia?.completa) return true;
  else return false;
});

//Para que en vacaciones se vea en 00:00 sino pondria 02:00
const inicio = ref(bloqueado.value ? "00:00" : props.turno.inicio.toFormat("HH:mm"));
const final = ref(bloqueado.value ? "00:00" : props.turno.final.toFormat("HH:mm"));

function abrirConfigurador() {
  emit("configurador:abrir");
}

function alertaBloqueado() {
  Swal.fire("Oops...", "Esta persona estará ausente durante todo el día.", "warning");
}

function color() {
  switch (props.turno.inicio.weekday) {
    case 1:
      return "background-color: #f9fdad";
    case 2:
      return "background-color: #f5bebf";
    case 3:
      return "background-color: #e5e5e5";
    case 4:
      return "background-color: #b4ffaa";
    case 5:
      return "background-color: #ffd8aa";
    case 6:
      return "background-color: #dec1ff";
    case 7:
      return "background-color: #d5ddff";
  }
  return null;
}

watch(inicio, (newVal) => {
  const [hora, minuto] = newVal.split(":").map(Number);

  emit("update:turno", {
    ...props.turno,
    inicio: props.turno.inicio.set({ hour: hora, minute: minuto }),
  });
});

watch(final, (newVal) => {
  const [hora, minuto] = newVal.split(":").map(Number);
  emit("update:turno", {
    ...props.turno,
    final: props.turno.final.set({ hour: hora, minute: minuto }),
  });
});
</script>

<style lang="scss" scoped>
.custom-width-date {
  max-width: 100%; /* Asegura que no sea más ancho que su contenedor */
  width: auto; /* Permite que el elemento se ajuste automáticamente según el contenido */
  box-sizing: border-box; /* Asegura que el padding y bordes no aumenten el tamaño total del elemento */
}
.padding-set-gear {
  padding-top: 0.3rem;
}
</style>
