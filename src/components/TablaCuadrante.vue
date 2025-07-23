<template>
  <main class="flex-fill overflow-auto p-3">
    <!-- Buscador -->
    <div v-if="!loading" class="mb-3">
      <BsInput
        :input-group="true"
        :form-outline="false"
        placeholder="Buscar empleado por nombre..."
        @keyup="filtrarTablaPorNombre()"
        class="w-100"
      >
        <span class="input-group-text">
          <i class="fas fa-search"></i>
        </span>
      </BsInput>
    </div>

    <!-- Tabla -->
    <div v-if="!loading" class="table-responsive">
      <table class="table table-bordered table-hover mb-0">
        <thead class="table-dark position-sticky top-0">
          <tr>
            <th class="sticky-left bg-dark">Empleado</th>
            <th v-for="(_, index) in 7" :key="index" class="text-center">
              <div>
                {{ props.selectedDate.plus({ days: index }).toFormat("EEE", { locale: "es" }) }}
              </div>
              <div>{{ props.selectedDate.plus({ days: index }).toFormat("dd/MM") }}</div>
            </th>
            <th class="text-center">H. Cuadrante</th>
            <th class="text-center">H. Contrato</th>
            <th class="text-center">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(celda, index) in arrayTurnos"
            :key="index"
            :class="{ 'table-warning': userStore.user.idSql === celda.idTrabajador }"
          >
            <td class="sticky-left bg-white">{{ cleanName(celda.nombre) }}</td>
            <td v-for="(turnos2, i2) in celda.turnos" :key="i2">
              <div v-if="turnos2.length">
                <div v-for="(turnoDia, i3) in turnos2" :key="i3" class="mb-1">
                  <template v-if="turnoDia.ausencia">
                    <span class="badge bg-warning text-dark">
                      {{ turnoDia.ausencia.tipo }}
                      <span v-if="!turnoDia.ausencia.completa">
                        {{ turnoDia.ausencia.horas }}h
                      </span>
                    </span>
                  </template>
                  <template v-else-if="turnoDia.totalHoras > 0">
                    <div class="d-flex flex-column small">
                      <span>
                        {{ DateTime.fromISO(turnoDia.inicio).toFormat("HH:mm") }}
                        –
                        {{ DateTime.fromISO(turnoDia.final).toFormat("HH:mm") }}
                      </span>
                      <span
                        class="badge"
                        :class="
                          turnoDia.idTienda !== (selectedTienda || userStore.user.idTienda)
                            ? 'bg-danger'
                            : 'bg-success'
                        "
                      >
                        {{ getNombreTienda(turnoDia.idTienda) }}
                      </span>
                    </div>
                  </template>
                  <template v-else>
                    <span class="text-muted">-</span>
                  </template>
                </div>
              </div>
            </td>
            <td class="text-center">
              <strong>{{ getTotalHorasCuadranteLinea(celda).toFixed(2) }}h</strong>
            </td>
            <td class="text-center">
              <span v-if="celda.turnos[0][0].horasContrato">
                {{ celda.turnos[0][0].horasContrato.toFixed(2) }}h
              </span>
              <span v-else>-</span>
            </td>
            <td class="text-center">
              <span
                :class="
                  getTotalHorasCuadranteLinea(celda) - celda.turnos[0][0].horasContrato > 0
                    ? 'text-success'
                    : 'text-danger'
                "
              >
                {{
                  (getTotalHorasCuadranteLinea(celda) - celda.turnos[0][0].horasContrato).toFixed(
                    2,
                  )
                }}h
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center h-100">
      <BsSpinner style="width: 3rem; height: 3rem" />
      <p>Cargando cuadrantes...</p>
    </div>

    <!-- Empty -->
    <div
      v-if="!loading && !arrayTurnos.length"
      class="d-flex flex-column align-items-center justify-content-center h-100"
    >
      <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
      <h5>No hay datos disponibles</h5>
      <p>No se encontraron cuadrantes para los filtros seleccionados.</p>
      <BsButton color="primary" @click="reloadCuadrante()">Intentar de nuevo</BsButton>
    </div>
  </main>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from "vue";
import BsInput from "./365/BsInput.vue";
import BsButton from "./365/BsButton.vue";
import BsSpinner from "./365/BsSpinner.vue";
import { DateTime } from "luxon";
import { useUserStore } from "@/stores/user";
import type { TCuadranteBackend } from "@/interfaces/Cuadrante.interface";

interface Celda {
  idTrabajador: any;
  nombre: any;
  turnos: any[];
}

const userStore = useUserStore();
const loading = ref(false);
const arrayTurnos: Ref<
  {
    idTrabajador: number;
    nombre: string;
    turnos: TCuadranteBackend[][];
  }[]
> = ref([]);
const props = defineProps<{
  selectedDate: DateTime;
  selectedTienda: number | null;
}>();

const reloadCuadrante = inject<() => Promise<void>>("reloadCuadrante")!;

function getNombreTienda(idTienda: number) {
  // Esta función necesitaría acceso a las tiendas para funcionar correctamente
  // Por ahora devolvemos un valor placeholder
  return `Tienda ${idTienda}`;
}

function filtrarTablaPorNombre() {
  const input = document.getElementById("buscador") as HTMLInputElement;
  if (!input) return;

  const filter = input.value.toUpperCase().trim();
  const table = document.querySelector(".cuadrantes-table");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = tbody.getElementsByTagName("tr");

  // Si no hay filtro, mostrar todas las filas
  if (!filter) {
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display = "";
    }
    return;
  }

  for (let i = 0; i < rows.length; i++) {
    const nombreCell = rows[i].querySelector(".col-nombre .empleado-nombre") as HTMLElement;

    if (nombreCell && nombreCell.textContent) {
      const txtValue = nombreCell.textContent.toUpperCase();

      // Búsqueda más flexible: busca si el filtro está contenido en el nombre
      if (txtValue.includes(filter)) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  }
}

function getTotalHorasCuadranteLinea(data: Celda) {
  let todosTienenPermisoMaternidad = true;
  let horasContrato = 0;

  for (let i = 0; i < data.turnos.length; i++) {
    for (let j = 0; j < data.turnos[i].length; j++) {
      const turno = data.turnos[i][j];

      if (turno.ausencia && turno.ausencia.tipo === "PERMISO MATERNIDAD/PATERNIDAD") {
        horasContrato = turno.horasContrato;
      } else {
        todosTienenPermisoMaternidad = false;
        break;
      }
    }
    if (!todosTienenPermisoMaternidad) {
      break;
    }
  }

  if (todosTienenPermisoMaternidad && horasContrato != null) {
    return horasContrato;
  }

  let sum = 0;
  for (let i = 0; i < data.turnos.length; i++) {
    for (let j = 0; j < data.turnos[i].length; j++) {
      sum += data.turnos[i][j].totalHoras;
    }
  }
  return sum;
}

function cleanName(nombre: string) {
  const arrayNombres = nombre.split(" ");
  if (arrayNombres.length > 1)
    return arrayNombres[0].slice(0, 4) + " " + arrayNombres[1].slice(0, 1);
  else return nombre;
}
</script>

<style scoped></style>
