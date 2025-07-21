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
  </div>

  <ConfiguradorTurno
    ref="modalConfiguradorTurno"
    :selected-date="selectedDate"
    :selected-tienda="selectedTienda"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, type Ref } from "vue";
import { DateTime } from "luxon";
import { hasPermission, hasRole } from "@/components/rolesPermisos";
import BsButton from "@/components/365/BsButton.vue";
import type { TTienda } from "@/interfaces/Tienda.interface";
import { useRouter } from "vue-router";
import BsButtonGroup from "@/components/365/BsButtonGroup.vue";
import BsSelect from "@/components/365/BsSelect.vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { useUserStore } from "@/stores/user";
import { useTiendaStore } from "@/stores/tienda";
import ConfiguradorTurno from "@/components/ModalCrearCuadranteNew.vue";

const userStore = useUserStore();
const tiendaStore = useTiendaStore();
const modalConfiguradorTurno = ref<InstanceType<typeof ConfiguradorTurno> | null>(null);
const tiendas: Ref<TTienda[]> = computed(() => tiendaStore.tiendas);
const selectedDate = ref(DateTime.now().startOf("week"));
const selectedTienda: Ref<TTienda | null> = ref(
  userStore.user.coordinadoraDeLaTienda ? userStore.user.coordinadoraDeLaTienda : null,
);
const router = useRouter();

const restarSemana = () => (selectedDate.value = selectedDate.value.minus({ weeks: 1 }));
const sumarSemana = () => (selectedDate.value = selectedDate.value.plus({ weeks: 1 }));

async function reloadCuadrante() {
  try {
    if (!selectedTienda.value?.id) throw new Error("No se ha seleccionado una tienda");

    const turnosEquipoCompleto = await axiosInstance.get("GetTurnosEquipoCoordinadora", {
      params: {
        fecha: selectedDate.value.toISODate(),
        idTienda: selectedTienda.value.id,
      },
    });

    return turnosEquipoCompleto.data;
  } catch (error) {
    console.error("Error al recargar el cuadrante:", error);
    Swal.fire({
      icon: "error",
      title: "Error al recargar el cuadrante",
      text: "Por favor, inténtalo de nuevo más tarde.",
    });
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

provide("reloadCuadrante", reloadCuadrante);

onMounted(() => {
  handleVista();
});
</script>

<style lang="scss" scoped>
.cuadrantes-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

// Header optimizado
.cuadrantes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 2px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-back {
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #495057;
      transform: scale(1.05);
    }
  }

  .semana-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .semana-titulo {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .week-navigation {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .nav-btn {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
}

// Sección de filtros
.filtros-section {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.filtros-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
}

.filtros-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.filtro-item {
  flex: 1;
  min-width: 200px;
}

.filtro-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.filtros-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

// Contenido principal
.cuadrantes-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tabla-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  max-width: 400px;
}

// Tabla optimizada para tablet landscape
.cuadrantes-table-wrapper {
  flex: 1;
  overflow: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cuadrantes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #e9ecef;
    text-align: center;
    vertical-align: middle;
  }

  thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    position: sticky;
    top: 0;
    z-index: 10;

    th {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }
  }

  // Columnas responsive
  .col-nombre {
    min-width: 120px;
    text-align: left;

    &.sticky-col {
      position: sticky;
      left: 0;
      background: white;
      z-index: 5;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }
  }

  .col-dia {
    min-width: 100px;
    width: 100px;
  }

  .col-horas {
    min-width: 80px;
    width: 80px;

    &.diferencia {
      min-width: 90px;
    }
  }
}

// Elementos de la tabla
.dia-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.dia-nombre {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.dia-fecha {
  font-size: 0.7rem;
  opacity: 0.9;
}

.empleado-info {
  display: flex;
  align-items: center;
}

.empleado-nombre {
  font-weight: 500;
  color: #2c3e50;
}

.turno-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 50px;
  justify-content: center;
}

.turno-item {
  border-radius: 4px;
  padding: 0.25rem;
}

.turno-horario {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  padding: 0.25rem;
}

.horario {
  font-weight: 600;
  color: #1976d2;
  font-size: 0.75rem;
}

.tienda-badge {
  background: #4caf50;
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  margin-top: 0.125rem;
  transition: all 0.3s ease;

  // Cuando es una tienda diferente
  &.tienda-diferente {
    background: #dc3545; // Rojo
    animation: pulse 2s infinite;
  }
}

// Animación opcional para llamar la atención
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.ausencia-badge {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.25rem;
}

.ausencia-tipo,
.ausencia-horas {
  display: block;
  font-size: 0.7rem;
  color: #856404;
  font-weight: 500;
}

.sin-turno {
  color: #6c757d;
  font-style: italic;
}

// Fila del usuario actual
.fila-usuario {
  background: linear-gradient(90deg, #fff3e0 0%, #ffffff 100%);

  .col-nombre.sticky-col {
    background: linear-gradient(90deg, #fff3e0 0%, #ffffff 100%);
  }

  .empleado-nombre {
    color: #f57c00;
    font-weight: 600;
  }
}

// Diferencias de horas
.diferencia-positiva {
  color: #28a745;
  font-weight: 600;
}

.diferencia-negativa {
  color: #dc3545;
  font-weight: 600;
}

// Estados de carga y vacío
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-text {
  color: #6c757d;
  font-size: 1.1rem;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
}

.empty-state h3 {
  color: #495057;
  margin: 0;
}

.empty-state p {
  color: #6c757d;
  text-align: center;
  margin: 0;
}

// Responsive para tablets más pequeñas
@media (max-width: 1024px) {
  .cuadrantes-header {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .semana-titulo {
    font-size: 1.25rem;
  }

  .filtros-section {
    padding: 0.75rem 1rem;
  }

  .tabla-container {
    padding: 0.75rem 1rem;
  }

  .cuadrantes-table {
    font-size: 0.8rem;

    th,
    td {
      padding: 0.5rem 0.25rem;
    }

    .col-nombre {
      min-width: 100px;
    }

    .col-dia {
      min-width: 80px;
      width: 80px;
    }
  }
}

// Responsive para móviles
@media (max-width: 768px) {
  .cuadrantes-table-wrapper {
    overflow-x: auto;
  }

  .cuadrantes-table {
    min-width: 800px;
  }

  .filtros-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filtros-actions {
    justify-content: center;
  }
}

// Scrollbar personalizado
.cuadrantes-table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.cuadrantes-table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.cuadrantes-table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.cuadrantes-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
