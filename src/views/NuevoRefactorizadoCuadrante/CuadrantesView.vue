<template>
  <div class="container-fluid d-flex flex-column vh-100 p-0">
    <!-- HEADER -->
    <header
      class="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm flex-wrap"
    >
      <div class="d-flex align-items-center mb-2 mb-md-0">
        <h2 class="h4 mb-0 me-3">Semana {{ selectedDate.weekNumber }} – {{ selectedDate.year }}</h2>
        <div class="btn-group" role="group" aria-label="Navegación semana">
          <BsButton variant="outline-secondary" size="lg" @click="restarSemana()">
            <i class="fas fa-chevron-left"></i>
          </BsButton>
          <BsButton variant="outline-secondary" size="lg" @click="sumarSemana()">
            <i class="fas fa-chevron-right"></i>
          </BsButton>
          <BsButton color="success" size="lg" @click="reloadCuadrante()">
            <i class="fas fa-redo-alt"></i>
          </BsButton>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <template v-if="!hasPermission('ModoTienda')">
          <BsButton
            v-if="hasPermission('CrearCuadrante')"
            color="success"
            size="lg"
            @click="abrirConfiguradorCuadranteSemanal()"
          >
            <i class="fas fa-pencil me-1"></i> Gestión cuadrante
          </BsButton>
          <BsButton v-if="hasPermission('CrearCuadrante')" color="warning" size="lg">
            <i class="fas fa-copy me-1"></i> Copiar
          </BsButton>
        </template>
        <template v-else>
          <BsButton color="success" size="sm" @click="checkPinCoordinadora()">
            <i class="fas fa-lock me-1"></i> Crear cuadrante
          </BsButton>
        </template>
      </div>
    </header>

    <section v-if="hasPermission('ConsultarCuadrante')" class="p-3">
      <BsButtonGroup class="gap-3 flex-wrap">
        <div class="flex-grow-1">
          <BsSelect
            v-model:options="tiendas"
            v-model:selected="selectedTienda"
            text-key="nombre"
            value-key="id"
            :filter="true"
            :select-all="true"
            size="lg"
            label="Tienda"
            label-position="left"
            :search-placeholder="'Buscar tienda'"
            :options-selected-label="'tienda/s seleccionada/s'"
            :preselect="false"
            class="w-100"
          />
        </div>

        <BsButton outline icon="search" color="success" @click="reloadCuadrante()">
          Buscar
        </BsButton>

        <BsButton
          outline
          v-if="hasRole('Super_Admin', 'RRHH_ADMIN', 'Analisis_Datos', 'Procesos')"
          icon="file-excel"
          color="success"
          @click="downloadExcelAllCuadrantesTiendas()"
        >
          Descargar excel
        </BsButton>

        <BsButton
          outline
          v-if="hasPermission('VerResumCuadrantes')"
          icon="chart-bar"
          color="info"
          @click="router.push('/resumenCuadrantes')"
        >
          Resumen
        </BsButton>
      </BsButtonGroup>
    </section>

    <!-- MAIN CONTENT - Table Area -->
    <main class="flex-grow-1 overflow-hidden p-3">
      <div class="modern-table-container">
        <!-- Search Bar -->
        <div class="search-section mb-4">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchText"
              @input="searchByName"
              type="text"
              class="modern-search"
              placeholder="Buscar empleado..."
            />
          </div>
        </div>

        <div v-if="!loadingCuadrantes" class="table-card">
          <div class="table-responsive">
            <table id="tabla" class="modern-table">
              <thead>
                <tr>
                  <th class="th-empleado">
                    <div class="th-content">
                      <i class="fas fa-users me-2"></i>
                      <span>Empleado</span>
                    </div>
                  </th>
                  <th v-for="(_, index) in 7" v-bind:key="index" class="th-dia">
                    <div class="th-dia-content">
                      <div class="dia-semana">
                        {{ selectedDate.plus({ days: index }).toFormat("EEEE", { locale: "es" }) }}
                      </div>
                      <div class="dia-fecha">
                        {{ selectedDate.plus({ days: index }).toFormat("dd/MM") }}
                      </div>
                    </div>
                  </th>
                  <th class="th-horas">
                    <div class="th-content">
                      <i class="fas fa-clock me-2"></i>
                      <span>Horas</span>
                    </div>
                  </th>
                  <th class="th-contrato">
                    <div class="th-content">
                      <i class="fas fa-file-contract me-2"></i>
                      <span>Contrato</span>
                    </div>
                  </th>
                  <th class="th-diferencia">
                    <div class="th-content">
                      <i class="fas fa-chart-line me-2"></i>
                      <span>+/-</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(turno, index) in arrayTurnos"
                  v-bind:key="index"
                  class="tabla-row"
                  :class="{ 'row-actual': userStore.user.idSql === turno.idTrabajador }"
                >
                  <td class="td-empleado" data-th="Empleado">
                    <div class="empleado-info">
                      <div class="empleado-avatar">
                        {{ getInitials(turno.nombre) }}
                      </div>
                      <div class="empleado-datos">
                        <div class="empleado-nombre">{{ turno.nombre }}</div>
                        <div class="empleado-id">ID: {{ turno.idTrabajador }}</div>
                      </div>
                    </div>
                  </td>

                  <td
                    v-for="(turnos2, index2) in turno.turnos"
                    v-bind:key="index2"
                    class="td-turno"
                    :data-th="
                      selectedDate.plus({ days: index2 }).toFormat('EEEE dd', { locale: 'es' })
                    "
                  >
                    <div class="turno-container">
                      <template v-if="turnos2.length === 0">
                        <div class="sin-turno">
                          <i class="fas fa-minus"></i>
                        </div>
                      </template>
                      <template v-else>
                        <div v-for="(turnoDia, index3) in turnos2" :key="index3" class="turno-item">
                          <!-- Ausencia -->
                          <template v-if="turnoDia.ausencia">
                            <div class="ausencia-badge">
                              <i class="fas fa-calendar-times me-1"></i>
                              <span class="ausencia-tipo">{{ turnoDia.ausencia.tipo }}</span>
                              <span v-if="!turnoDia.ausencia.completa" class="ausencia-horas">
                                ({{ turnoDia.ausencia.horas }}h)
                              </span>
                            </div>
                          </template>

                          <!-- Turno normal -->
                          <template v-else-if="turnoDia.totalHoras > 0">
                            <div class="turno-horario">
                              <i class="fas fa-clock me-1"></i>
                              <span class="horario-texto">
                                {{ formatTurnoHora(turnoDia.inicio) }} -
                                {{ formatTurnoHora(turnoDia.final) }}
                              </span>
                            </div>
                            <div class="turno-tienda">
                              <i class="fas fa-store me-1"></i>
                              {{ getNombreTienda(turnoDia.idTienda) }}
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </td>

                  <td class="td-horas" data-th="Horas cuadrante">
                    <div class="horas-badge">
                      {{ getTotalHorasCuadranteLinea(turno).toFixed(2) }}h
                    </div>
                  </td>

                  <td class="td-contrato" data-th="Horas contrato">
                    <div class="contrato-badge">
                      {{
                        turno.turnos[0] && turno.turnos[0][0] && turno.turnos[0][0].horasContrato
                          ? turno.turnos[0][0].horasContrato.toFixed(2) + "h"
                          : "-"
                      }}
                    </div>
                  </td>

                  <td class="td-diferencia" data-th="Diferencia">
                    <div
                      class="diferencia-badge"
                      :class="{
                        'diferencia-positiva': getDiferenciaHoras(turno) > 0,
                        'diferencia-negativa': getDiferenciaHoras(turno) < 0,
                        'diferencia-neutra': getDiferenciaHoras(turno) === 0,
                      }"
                    >
                      <i v-if="getDiferenciaHoras(turno) > 0" class="fas fa-arrow-up me-1"></i>
                      <i
                        v-else-if="getDiferenciaHoras(turno) < 0"
                        class="fas fa-arrow-down me-1"
                      ></i>
                      <i v-else class="fas fa-equals me-1"></i>
                      {{ getDiferenciaHoras(turno).toFixed(2) }}h
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="loading-container">
          <div class="loading-spinner">
            <BsSpinner style="width: 5rem; height: 5rem" />
          </div>
          <p class="loading-text">Cargando cuadrantes...</p>
        </div>

        <div v-if="!loadingCuadrantes && arrayTurnos?.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <h3>No hay empleados en esta tienda</h3>
          <p>Selecciona otra tienda o verifica los permisos del equipo.</p>
        </div>
      </div>
    </main>
  </div>

  <ConfiguradorTurno
    ref="modalConfiguradorTurno"
    :selected-date="selectedDate"
    :selected-tienda="selectedTienda"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, type Ref, watch } from "vue";
import { DateTime } from "luxon";
import { hasPermission, hasRole } from "@/components/rolesPermisos";
import BsButton from "@/components/365/BsButton.vue";
import type { TTienda } from "@/interfaces/Tienda.interface";
import { useRouter } from "vue-router";
import BsButtonGroup from "@/components/365/BsButtonGroup.vue";
import BsSelect from "@/components/365/BsSelect.vue";
// import BsInput from "@/components/365/BsInput.vue";
import BsSpinner from "@/components/365/BsSpinner.vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { useUserStore } from "@/stores/user";
import { useTiendaStore } from "@/stores/tienda";
import ConfiguradorTurno from "@/components/ModalCrearCuadranteNew.vue";
import { estructurarTurnos } from "@/components/auxCuadrantes";

const userStore = useUserStore();
const tiendaStore = useTiendaStore();
const modalConfiguradorTurno = ref<InstanceType<typeof ConfiguradorTurno> | null>(null);
const tiendas: Ref<TTienda[]> = computed(() => tiendaStore.tiendas);
const selectedDate = ref(DateTime.now().startOf("week"));
const selectedTienda: Ref<TTienda | null> = ref(
  userStore.user.coordinadoraDeLaTienda ? userStore.user.coordinadoraDeLaTienda : null,
);
const router = useRouter();
const loadingCuadrantes = ref(false);
const arrayTurnos: Ref<any[]> = ref([]);
const searchText = ref("");

const restarSemana = () => (selectedDate.value = selectedDate.value.minus({ weeks: 1 }));
const sumarSemana = () => (selectedDate.value = selectedDate.value.plus({ weeks: 1 }));

async function reloadCuadrante() {
  try {
    if (!selectedTienda.value?.id) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una tienda",
        text: "Debes seleccionar una tienda para ver los cuadrantes.",
      });
      return;
    }

    loadingCuadrantes.value = true;

    // Primero obtener el equipo de la tienda
    const resEquipo = await axiosInstance.get("get-equipo-coordinadora-por-tienda", {
      params: { idTienda: selectedTienda.value.id },
    });

    // Luego obtener los turnos
    const resTurnos = await axiosInstance.get("cuadrantes", {
      params: {
        fecha: selectedDate.value.toISO(),
        idTienda: selectedTienda.value.id,
      },
    });

    if (!resTurnos.data.ok) throw Error("No se ha podido cargar el cuadrante");

    // Estructurar los turnos
    const turnosEstructurados = estructurarTurnos(resTurnos.data.data);

    // Crear un mapa de turnos por trabajador ID
    const turnosPorTrabajador = new Map();
    turnosEstructurados.forEach((turno) => {
      turnosPorTrabajador.set(turno.idTrabajador, turno);
    });

    // Crear array con todos los empleados, incluyendo los que no tienen turnos
    arrayTurnos.value = resEquipo.data.map((empleado: any) => {
      const turnosEmpleado = turnosPorTrabajador.get(empleado.id);

      if (turnosEmpleado) {
        return turnosEmpleado;
      } else {
        // Si no tiene turnos, crear estructura vacía
        return {
          idTrabajador: empleado.id,
          nombre: empleado.nombreApellidos,
          turnos: Array(7)
            .fill(null)
            .map(() => []),
        };
      }
    });

    // Ordenar para que el usuario actual aparezca primero
    ordenarCuadrante(arrayTurnos.value);

    return resTurnos.data.data;
  } catch (error) {
    console.error("Error al recargar el cuadrante:", error);
    Swal.fire({
      icon: "error",
      title: "Error al recargar el cuadrante",
      text: "Por favor, inténtalo de nuevo más tarde.",
    });
  } finally {
    loadingCuadrantes.value = false;
  }
}

function abrirConfiguradorCuadranteSemanal() {
  const now = DateTime.now();
  const select = selectedDate.value;

  const nowIsoYear = now.weekYear;
  const selIsoYear = select.weekYear;
  const nowWeek = now.weekNumber;
  const selWeek = select.weekNumber;

  // Si el año ISO seleccionado es anterior,
  // o si es el mismo año ISO pero la semana es menor…
  if (selIsoYear < nowIsoYear || (selIsoYear === nowIsoYear && selWeek < nowWeek)) {
    Swal.fire({
      icon: "warning",
      text: "No se pueden crear turnos para semanas pasadas.",
    });
    return;
  }

  if (!selectedTienda.value) {
    Swal.fire({
      icon: "warning",
      text: "No tienes una tienda asignada.",
    });
    return;
  }

  modalConfiguradorTurno.value?.abrirModal(select);
}

function checkPinCoordinadora() {
  console.log(`Verificar PIN para acción`);
}

function downloadExcelAllCuadrantesTiendas() {
  console.log("Descargar Excel de todos los cuadrantes de tiendas");
}

function handleVista() {
  if (hasRole("Tienda") || userStore.user.idSql == 3608) {
    const tienda = tiendas.value.find((t) => t.id === userStore.user.idTienda);

    if (!tienda) {
      Swal.fire({
        icon: "error",
        text: "No hay tienda asignada a tu usuario.",
      });
      return;
    }

    selectedTienda.value = tienda;
  }
}

// Funciones para la tabla
// function cleanName(nombre: string) {
//   const arrayNombres = nombre.split(" ");
//   if (arrayNombres.length > 1) {
//     return arrayNombres[0].substr(0, 4) + " " + arrayNombres[1].substr(0, 1);
//   } else {
//     return nombre;
//   }
// }

function getInitials(nombre: string) {
  const parts = nombre.split(" ");
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
}

function getDiferenciaHoras(turno: any) {
  const totalHoras = getTotalHorasCuadranteLinea(turno);
  const horasContrato =
    (turno.turnos[0] && turno.turnos[0][0] && turno.turnos[0][0].horasContrato) || 0;
  return totalHoras - horasContrato;
}

function getNombreTienda(idTienda: number) {
  for (let i = 0; i < tiendas.value.length; i += 1) {
    if (tiendas.value[i].id === idTienda) return tiendas.value[i].nombre;
  }
  return "¿?";
}

function formatTurnoHora(fecha: string | Date) {
  if (typeof fecha === "string") {
    return DateTime.fromISO(fecha).toFormat("HH:mm");
  } else {
    return DateTime.fromJSDate(fecha).toFormat("HH:mm");
  }
}

function getTotalHorasCuadranteLinea(data: any) {
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

  // Si no todos los turnos tienen la ausencia, sumar las horas normalmente
  let sum = 0;
  for (let i = 0; i < data.turnos.length; i++) {
    for (let j = 0; j < data.turnos[i].length; j++) {
      sum += data.turnos[i][j].totalHoras;
    }
  }
  return sum;
}

function ordenarCuadrante(resTurnos: any) {
  for (let i = 0; i < resTurnos.length; i++) {
    if (resTurnos[i].idTrabajador === userStore.user.idSql) {
      const first = userStore.user.idSql;
      resTurnos.sort(function (x: any, y: any) {
        return x.idTrabajador == first ? -1 : y.idTrabajador == first ? 1 : 0;
      });
      break;
    }
  }
}

function searchByName() {
  const tabla = document.getElementById("tabla") as HTMLTableElement;
  if (!tabla) return;

  const tr = tabla.getElementsByTagName("tr");
  const filter = searchText.value.toUpperCase();

  for (let i = 1; i < tr.length; i++) {
    const td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      const txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Watchers
watch(selectedDate, () => {
  if (selectedTienda.value) {
    reloadCuadrante();
  }
});

watch(selectedTienda, () => {
  if (selectedTienda.value) {
    reloadCuadrante();
  }
});

provide("reloadCuadrante", reloadCuadrante);

onMounted(() => {
  handleVista();
  if (selectedTienda.value) {
    reloadCuadrante();
  }
});
</script>

<style lang="scss" scoped>
// Variables de diseño moderno
$primary-color: #6366f1;
$secondary-color: #8b5cf6;
$success-color: #10b981;
$danger-color: #ef4444;
$warning-color: #f59e0b;
$neutral-50: #f9fafb;
$neutral-100: #f3f4f6;
$neutral-200: #e5e7eb;
$neutral-300: #d1d5db;
$neutral-400: #9ca3af;
$neutral-500: #6b7280;
$neutral-600: #4b5563;
$neutral-700: #374151;
$neutral-800: #1f2937;
$neutral-900: #111827;

// Container principal
.container-fluid {
  background: #f8fafc;
  min-height: 100vh;
}

// Contenedor de tabla moderno
.modern-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// Sección de búsqueda
.search-section {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: $neutral-400;
  z-index: 1;
}

.modern-search {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid $neutral-200;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }

  &::placeholder {
    color: $neutral-400;
  }
}

// Card de tabla
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

// Tabla moderna
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  thead {
    background: linear-gradient(to right, $primary-color, $secondary-color);
    color: white;
    position: sticky;
    top: 0;
    z-index: 10;

    th {
      padding: 1.25rem 1rem;
      font-weight: 600;
      text-align: left;
      font-size: 0.875rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border: none;
      white-space: nowrap;

      &:first-child {
        border-top-left-radius: 16px;
      }

      &:last-child {
        border-top-right-radius: 16px;
      }
    }
  }

  tbody {
    tr {
      transition: all 0.3s ease;
      border-bottom: 1px solid $neutral-100;

      &:hover {
        background-color: $neutral-50;
        transform: scale(1.002);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      &.row-actual {
        background: linear-gradient(
          to right,
          rgba($primary-color, 0.05),
          rgba($secondary-color, 0.05)
        );

        .empleado-nombre {
          color: $primary-color;
          font-weight: 600;
        }
      }
    }

    td {
      padding: 1rem;
      vertical-align: middle;
      background: transparent;
      border: none;
    }
  }
}

// Estilos de encabezados
.th-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.th-dia-content {
  text-align: center;

  .dia-semana {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .dia-fecha {
    font-size: 0.75rem;
    opacity: 0.9;
    margin-top: 0.25rem;
  }
}

// Columnas específicas
.th-empleado {
  width: 280px;
  text-align: left !important;
}

.th-dia {
  width: 140px;
}

.th-horas,
.th-contrato,
.th-diferencia {
  width: 120px;
}

// Información del empleado
.empleado-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.empleado-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.empleado-datos {
  .empleado-nombre {
    font-weight: 500;
    color: $neutral-800;
    font-size: 0.95rem;
  }

  .empleado-id {
    font-size: 0.75rem;
    color: $neutral-500;
    margin-top: 0.125rem;
  }
}

// Contenedor de turnos
.turno-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 60px;
  justify-content: center;
}

.sin-turno {
  color: $neutral-300;
  font-size: 1.25rem;
}

.turno-item {
  width: 100%;
  text-align: center;
}

.turno-horario {
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.25rem;

  i {
    font-size: 0.75rem;
  }
}

.turno-tienda {
  font-size: 0.75rem;
  color: $neutral-600;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  i {
    color: $neutral-400;
  }
}

// Ausencias
.ausencia-badge {
  background: rgba($warning-color, 0.1);
  color: $warning-color;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  .ausencia-tipo {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .ausencia-horas {
    font-size: 0.7rem;
    opacity: 0.8;
  }
}

// Badges de horas
.horas-badge,
.contrato-badge {
  background: $neutral-100;
  color: $neutral-700;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-block;
}

// Badges de diferencia
.diferencia-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  &.diferencia-positiva {
    background: rgba($success-color, 0.1);
    color: $success-color;
  }

  &.diferencia-negativa {
    background: rgba($danger-color, 0.1);
    color: $danger-color;
  }

  &.diferencia-neutra {
    background: $neutral-100;
    color: $neutral-600;
  }
}

// Estados de carga y vacío
.loading-container,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  color: $primary-color;
}

.loading-text {
  margin-top: 1rem;
  color: $neutral-600;
  font-size: 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: $neutral-300;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: $neutral-700;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: $neutral-500;
  font-size: 0.95rem;
  margin: 0;
}

// Responsive
@media (max-width: 1024px) {
  .modern-table {
    font-size: 0.875rem;

    thead th {
      padding: 1rem 0.75rem;
    }

    tbody td {
      padding: 0.75rem;
    }
  }

  .th-empleado {
    width: 240px;
  }

  .th-dia {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modern-table {
    min-width: 1000px;
  }

  thead {
    display: none;
  }

  tbody {
    tr {
      display: block;
      margin-bottom: 1rem;
      border: 1px solid $neutral-200;
      border-radius: 12px;
      padding: 1rem;
      background: white;
    }

    td {
      display: block;
      text-align: left;
      padding: 0.5rem 0;

      &:before {
        content: attr(data-th);
        font-weight: 600;
        color: $neutral-600;
        display: block;
        margin-bottom: 0.25rem;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  }

  .empleado-info {
    justify-content: flex-start;
    margin-bottom: 0.5rem;
  }

  .turno-container {
    align-items: flex-start;
  }
}

// Scrollbar personalizado
.table-responsive {
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: $neutral-100;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: $neutral-300;
    border-radius: 4px;

    &:hover {
      background: $neutral-400;
    }
  }
}
</style>
