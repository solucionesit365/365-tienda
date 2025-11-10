<template>
  <div class="container-fluid d-flex flex-column min-vh-100 p-0">
    <!-- HEADER -->
    <header
      class="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm flex-wrap"
    >
      <div class="d-flex align-items-center mb-2 mb-md-0 gap-2">
        <h2 class="h4 mb-0 me-3">
          Semana {{ selectedDate.weekNumber }} – {{ selectedDate.year }} [{{
            selectedTienda?.nombre
          }}]
        </h2>
        <div class="btn-group" role="group" aria-label="Navegación semana">
          <BsButton variant="outline-primary" size="lg" @click="restarSemana()" class="btn-nav-corporate">
            <i class="fas fa-chevron-left"></i>
          </BsButton>
          <BsButton variant="outline-primary" size="lg" @click="sumarSemana()" class="btn-nav-corporate">
            <i class="fas fa-chevron-right"></i>
          </BsButton>
        </div>
        <BsButton color="primary" size="lg" @click="reloadCuadrante()" class="btn-corporate">
          <i class="fas fa-redo-alt"></i>
        </BsButton>
        <BsButton color="primary" size="lg" @click="$router.push('/')" class="btn-corporate"> Volver </BsButton>
      </div>
      <div class="d-flex align-items-center gap-2">
        <!-- Switch de edición para modo tienda -->
        <div class="form-check form-switch d-flex align-items-center me-3">
          <input
            class="form-check-input me-2"
            type="checkbox"
            role="switch"
            id="switchEdicion"
            v-model="modoEdicionActivo"
            @change="toggleModoEdicion"
            style="cursor: pointer; width: 3rem; height: 1.5rem;"
          />
          <label class="form-check-label fw-semibold" for="switchEdicion" style="cursor: pointer;">
            {{ modoEdicionActivo ? 'Edición activa' : 'Solo visualización' }}
          </label>
        </div>

        <template v-if="hasPermission('ModoTienda') || hasRole('Coordinadora_A')">
          <BsButton
            v-if="hasPermission('CrearCuadrante')"
            variant="outline-primary"
            size="lg"
            @click="abrirModalPlantillas()"
            class="btn-nav-corporate"
          >
            <i class="fas fa-cog me-1"></i> Gestión plantillas
          </BsButton>
          <BsButton
            v-if="hasPermission('CrearCuadrante')"
            color="primary"
            size="lg"
            @click="abrirModalCopiarTurnos"
            class="btn-corporate"
          >
            <i class="fas fa-copy me-1"></i> Copiar
          </BsButton>
        </template>
      </div>
    </header>

    <section v-if="hasRole('Super_Admin')" class="p-3">
      <BsButtonGroup class="gap-3 flex-wrap">
        <div class="flex-grow-1">
          <div v-if="loadingTiendas" class="d-flex align-items-center justify-content-center py-3">
            <BsSpinner class="me-2" />
            <span class="text-muted">Cargando tiendas...</span>
          </div>
          <div v-else class="d-flex align-items-center gap-2">
            <label class="form-label mb-0 fw-semibold">Tienda:</label>
            <button
              type="button"
              class="btn btn-tienda-selector-main flex-grow-1 text-start d-flex align-items-center justify-content-between"
              @click="abrirModalSeleccionTienda"
              :disabled="loadingTiendas"
            >
              <span>
                <i class="fas fa-store me-2"></i>
                {{ selectedTienda?.nombre || 'Seleccionar tienda...' }}
              </span>
              <i class="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>
      </BsButtonGroup>
    </section>

    <!-- MAIN CONTENT - Table Area -->
    <main class="flex-grow-1 overflow-hidden p-3 main-content-cuadrantes">
      <!-- Búsqueda y Switch de Vista -->
      <div class="mb-3 d-flex justify-content-between align-items-center gap-3">
        <div :class="hasRole('Super_Admin') ? 'w-50' : 'flex-grow-1'">
          <input
            v-model="searchText"
            @input="searchByName"
            type="text"
            class="modern-search"
            placeholder="Buscar empleado..."
          />
        </div>

        <div class="view-switch">
          <div class="btn-group" role="group">
            <input
              type="radio"
              class="btn-check"
              name="viewMode"
              id="tableView"
              v-model="viewMode"
              value="table"
              autocomplete="off"
            />

            <label class="btn btn-outline-secondary btn-view-mode" for="tableView">
              <i class="fas fa-table me-1"></i>Tabla
            </label>
            <input
              type="radio"
              class="btn-check"
              name="viewMode"
              id="timelineView"
              v-model="viewMode"
              value="timeline"
              autocomplete="off"
            />
            <label class="btn btn-outline-secondary btn-view-mode" for="timelineView">
              <i class="fas fa-chart-gantt me-1"></i>Línea temporal
            </label>
          </div>
        </div>
      </div>

      <div class="modern-table-container" v-if="viewMode === 'table'">
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
                  :class="{
                    'row-actual': userStore.user.idSql === turno.idTrabajador,
                    'row-externo': !turno.esDelEquipo,
                  }"
                >
                  <td class="td-empleado" data-th="Empleado">
                    <div class="empleado-info">
                      <div class="empleado-datos">
                        <div class="empleado-nombre">{{ turno.nombre }}</div>
                        <div v-if="hasRole('Super_Admin')" class="empleado-id">
                          ID: {{ turno.idTrabajador }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    v-for="(turnos2, index2) in turno.turnos"
                    v-bind:key="index2"
                    class="td-turno"
                    :class="{ 'clickeable-celda': modoEdicionActivo }"
                    :data-th="
                      selectedDate.plus({ days: index2 }).toFormat('EEEE dd', { locale: 'es' })
                    "
                    @click="modoEdicionActivo ? abrirModalEditarTurno(turno, index2) : null"
                  >
                    <div class="turno-container">
                      <template v-if="turnos2.length > 0 && turnos2[0].fiesta">
                        <div class="ausencia-badge fiesta-badge-custom">
                          <i class="fas fa-glass-cheers me-1"></i>
                          <span class="ausencia-tipo">Fiesta</span>
                        </div>
                      </template>

                      <template v-else-if="turnos2.length > 0 && turnos2[0].ausencia">
                        <div class="ausencia-badge">
                          <i class="fas fa-user-slash"></i>
                          <span class="ausencia-tipo">
                            {{ turnos2[0].ausencia.tipo || turnos2[0].ausencia }}
                          </span>
                        </div>
                      </template>

                      <template v-else>
                        <div v-if="turnos2.length === 0" class="sin-turno">
                          <i :class="modoEdicionActivo ? 'fas fa-plus-circle' : 'fas fa-minus'"></i>
                        </div>
                        <div v-for="(turnoDia, index3) in turnos2" :key="index3" class="turno-item">
                          <!-- Solo mostrar turnos reales, no ausencias -->
                          <template v-if="turnoDia.totalHoras > 0">
                            <div class="turno-horario">
                              <i class="fas fa-clock me-1"></i>
                              <span class="horario-texto">
                                {{ formatTurnoHora(turnoDia.inicio) }} -
                                {{ formatTurnoHora(turnoDia.final) }}
                              </span>
                            </div>
                            <div class="turno-tienda">
                              <i class="fas fa-store me-1"></i>
                              {{ getNombreTienda(turnoDia.tiendaId || turnoDia.idTienda) }}
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
                        getHorasContrato(turno) > 0 ? getHorasContrato(turno).toFixed(2) + "h" : "-"
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

      <!-- Vista Timeline -->
      <div class="timeline-container" v-else-if="viewMode === 'timeline'">
        <div class="timeline-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6>Cobertura de personal por horas</h6>
              <p class="text-muted mb-0">
                Intensidad de color indica número de trabajadores presentes
              </p>
            </div>

            <!-- Controles de navegación del día -->
            <div class="day-navigation">
              <div class="btn-group" role="group">
                <button
                  class="btn btn-outline-secondary btn-sm btn-timeline-nav"
                  :disabled="selectedDayIndex === 0"
                  @click="selectedDayIndex--"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <div class="current-day-display">
                  <span class="day-name">
                    {{
                      selectedDate
                        .plus({ days: selectedDayIndex })
                        .toFormat("EEEE dd", { locale: "es" })
                    }}
                  </span>
                </div>
                <button
                  class="btn btn-outline-secondary btn-sm btn-timeline-nav"
                  :disabled="selectedDayIndex === 6"
                  @click="selectedDayIndex++"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline horizontal de 96 intervalos de 15 minutos -->
        <div class="horizontal-timeline">
          <!-- Etiquetas de horas -->
          <div class="hour-labels">
            <div
              v-for="interval in 96"
              :key="`label-${interval - 1}`"
              class="hour-label"
              :class="{ 'quarter-hour': (interval - 1) % 4 !== 0 }"
            >
              {{
                Math.floor((interval - 1) / 4)
                  .toString()
                  .padStart(2, "0") +
                ":" +
                (((interval - 1) % 4) * 15).toString().padStart(2, "0")
              }}
            </div>
          </div>

          <!-- Barras de cobertura -->
          <div class="coverage-bars">
            <div
              v-for="interval in 96"
              :key="`bar-${interval - 1}`"
              class="hour-bar"
              :class="getHourCoverageClass(selectedDayIndex, interval - 1)"
              :title="getHourTooltip(selectedDayIndex, interval - 1)"
            >
              <div class="coverage-bar-horizontal">
                <div
                  class="coverage-fill"
                  :style="{ height: getCoverageHeight(selectedDayIndex, interval - 1) + '%' }"
                ></div>
              </div>
              <span class="worker-count" v-if="getWorkerCount(selectedDayIndex, interval - 1) > 0">
                {{ getWorkerCount(selectedDayIndex, interval - 1) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="timeline-legend mt-4">
          <div class="legend-items">
            <div class="legend-item no-coverage">
              <div class="legend-color"></div>
              <span>Sin cobertura</span>
            </div>
            <div class="legend-item low-coverage">
              <div class="legend-color"></div>
              <span>1 trabajador</span>
            </div>
            <div class="legend-item medium-coverage">
              <div class="legend-color"></div>
              <span>2-3 trabajadores</span>
            </div>
            <div class="legend-item high-coverage">
              <div class="legend-color"></div>
              <span>4+ trabajadores</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <ModalCopiarTurnosSemana ref="modalCopiarTurnos" :id-tienda="selectedTienda?.id || 0" />

  <ModalEditarTurnoIndividual
    ref="modalEditarTurnoIndividual"
    :plantillas-turno="plantillasTurno"
    @turno-guardado="reloadCuadrante"
  />

  <PlantillasTurnoModal
    v-if="selectedTienda?.id"
    ref="plantillasModal"
    :idTienda="selectedTienda.id"
    @plantillas-updated="cargarPlantillasTurno"
  />

  <!-- Modal de selección de tienda -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modalSeleccionTienda"
        class="modal fade show modal-seleccion-tienda-overlay"
        tabindex="-1"
        role="dialog"
        style="display: block; z-index: 2060;"
        @click.self="cerrarModalSeleccionTienda"
      >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
          <div class="modal-content modal-seleccion-tienda">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-store me-2"></i>
                Seleccionar Tienda
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="cerrarModalSeleccionTienda"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body p-0">
              <div class="search-container p-3 border-bottom">
                <div class="search-wrapper">
                  <i class="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    class="form-control ps-5"
                    placeholder="Buscar tienda..."
                    v-model="busquedaTienda"
                    @input="filtrarTiendas"
                    ref="inputBusquedaTiendaModal"
                  />
                </div>
              </div>
              <div class="tiendas-list">
                <div
                  v-for="tienda in tiendasFiltradas"
                  :key="tienda.id"
                  class="tienda-item"
                  :class="{ 'selected': selectedTienda?.id === tienda.id }"
                  @click="seleccionarTiendaModal(tienda)"
                >
                  <div class="tienda-item-content">
                    <i class="fas fa-store me-2"></i>
                    <span class="tienda-nombre">{{ tienda.nombre }}</span>
                  </div>
                  <i v-if="selectedTienda?.id === tienda.id" class="fas fa-check-circle text-success"></i>
                </div>
                <div v-if="tiendasFiltradas.length === 0" class="text-center p-4 text-muted">
                  <i class="fas fa-search fa-2x mb-2"></i>
                  <p>No se encontraron tiendas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="backdrop-fade">
      <div v-if="modalSeleccionTienda" class="modal-backdrop fade show" style="z-index: 2055;"></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, type Ref, watch } from "vue";
import { DateTime } from "luxon";
import { hasPermission, hasRole } from "@/components/rolesPermisos";
import BsButton from "@/components/365/BsButton.vue";
import type { TTienda } from "@/interfaces/Tienda.interface";
import BsButtonGroup from "@/components/365/BsButtonGroup.vue";
import BsSpinner from "@/components/365/BsSpinner.vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { useUserStore } from "@/stores/user";
import { useTiendaStore } from "@/stores/tienda";
import ModalCopiarTurnosSemana from "@/components/ModalCopiarTurnosSemana.vue";
import ModalEditarTurnoIndividual from "@/components/ModalEditarTurnoIndividual.vue";
import PlantillasTurnoModal from "@/components/ModalPlantillasTurno.vue";
import { estructurarTurnosConTrabajador } from "@/components/auxCuadrantes";
import { Turno } from "@/components/kernel/Turno";
import { filtrarTrabajadoresSinTablets } from "@/utils/cuadrantes.utils";

const userStore = useUserStore();
const tiendaStore = useTiendaStore();
const modalCopiarTurnos = ref<InstanceType<typeof ModalCopiarTurnosSemana> | null>(null);
const modalEditarTurnoIndividual = ref<InstanceType<typeof ModalEditarTurnoIndividual> | null>(
  null,
);
const plantillasModal = ref<InstanceType<typeof PlantillasTurnoModal> | null>(null);
const tiendas: Ref<TTienda[]> = computed(() => tiendaStore.tiendas);
const selectedDate = ref(DateTime.now().startOf("week"));
const selectedTienda: Ref<TTienda | null> = ref(null);
const loadingCuadrantes = ref(false);
const loadingTiendas = ref(false);
const arrayTurnos: Ref<any[]> = ref([]);
const searchText = ref("");
const viewMode = ref("table"); // "table" o "timeline"
const coverageData: Ref<any[][]> = ref([]); // [dayIndex][quarterHourIndex] = workerCount (96 intervalos de 15min)
const selectedDayIndex = ref(0); // 0-6 para los días de la semana actual
const plantillasTurno: Ref<any[]> = ref([]);

// Variables para modal de selección de tienda
const modalSeleccionTienda = ref(false);
const busquedaTienda = ref("");
const tiendasFiltradas: Ref<TTienda[]> = ref([]);
const inputBusquedaTiendaModal = ref<HTMLInputElement | null>(null);

// Variables para modo edición con PIN
const modoEdicionActivo = ref(false);

const restarSemana = () => (selectedDate.value = selectedDate.value.minus({ weeks: 1 }));
const sumarSemana = () => (selectedDate.value = selectedDate.value.plus({ weeks: 1 }));

async function toggleModoEdicion() {
  if (modoEdicionActivo.value) {
    // El usuario quiere activar la edición, validar PIN
    const pinValido = await validarPINCoordinadora();
    if (!pinValido) {
      // Si el PIN no es válido, desactivar el switch
      modoEdicionActivo.value = false;
    }
  }
  // Si se desactiva, no hace falta validar nada
}

async function validarPINCoordinadora(): Promise<boolean> {
  if (!selectedTienda.value) {
    Swal.fire({
      icon: "warning",
      title: "Selecciona una tienda",
      text: "Debes seleccionar una tienda primero.",
    });
    return false;
  }

  const { value: pin } = await Swal.fire({
    title: "Verificación de PIN",
    text: "Introduce tu PIN de coordinadora:",
    input: "number",
    inputPlaceholder: "Introduce el PIN de 4 dígitos",
    inputAttributes: {
      maxlength: "4",
      autocapitalize: "off",
      autocorrect: "off",
    },
    showCancelButton: true,
    confirmButtonText: "Verificar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    inputValidator: (value) => {
      if (!value) {
        return "Debes introducir un PIN";
      }
      if (!/^\d{4}$/.test(value)) {
        return "El PIN debe tener exactamente 4 dígitos";
      }
      return null;
    },
  });

  if (!pin) return false;

  try {
    const response = await axiosInstance.post("check-pin-coordinadora", {
      idTienda: selectedTienda.value.id,
      pin: parseInt(pin),
    });

    if (response.data === true) {
      return true;
    } else {
      Swal.fire({
        icon: "error",
        title: "PIN incorrecto",
        text: "El PIN introducido no es válido. Inténtalo de nuevo.",
        confirmButtonText: "Entendido",
      });
      return false;
    }
  } catch (error: any) {
    console.error("Error al verificar PIN:", error);
    Swal.fire({
      icon: "error",
      title: "Error de verificación",
      text:
        error.response?.data?.message ||
        "Ha ocurrido un error al verificar el PIN. Inténtalo de nuevo.",
      confirmButtonText: "Entendido",
    });
    return false;
  }
}

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

    // Luego obtener los turnos usando el método de Turno
    const turnosEquipo = await Turno.getTurnosEquipoCoordinadoraDeLaTienda(
      selectedTienda.value.id,
      selectedDate.value,
    );

    // Si no hay turnos, continuar con array vacío
    if (!turnosEquipo || turnosEquipo.length === 0) {
      console.log("No se encontraron turnos para esta tienda y fecha");
    }

    // Estructurar los turnos usando la nueva función que maneja información del trabajador
    const turnosEstructurados = estructurarTurnosConTrabajador(
      turnosEquipo,
      selectedDate.value.startOf("week"),
    );

    // Crear un mapa de turnos por trabajador ID
    const turnosPorTrabajador = new Map();
    turnosEstructurados.forEach((turno) => {
      turnosPorTrabajador.set(turno.idTrabajador, turno);
    });

    // Crear un conjunto de IDs de trabajadores del equipo
    const trabajadoresDelEquipo = new Set(resEquipo.data.map((emp: any) => emp.id));

    // Crear array con todos los empleados del equipo
    const trabajadoresEquipo = resEquipo.data.map((empleado: any) => {
      const turnosEmpleado = turnosPorTrabajador.get(empleado.id);

      if (turnosEmpleado) {
        return {
          ...turnosEmpleado,
          esDelEquipo: true, // Marcar como del equipo
        };
      } else {
        // Si no tiene turnos, crear estructura vacía
        return {
          idTrabajador: empleado.id,
          nombre: empleado.nombreApellidos,
          esDelEquipo: true, // Marcar como del equipo
          turnos: Array(7)
            .fill(null)
            .map(() => []),
        };
      }
    });

    // Agregar trabajadores externos que tienen turnos pero no están en el equipo
    const trabajadoresExternos = turnosEstructurados
      .filter((turno) => !trabajadoresDelEquipo.has(turno.idTrabajador))
      .map((turno) => ({
        ...turno,
        esDelEquipo: false, // Marcar como externo
      }));

    // Combinar ambos arrays y filtrar tablets de tienda
    arrayTurnos.value = filtrarTrabajadoresSinTablets([...trabajadoresEquipo, ...trabajadoresExternos]);

    // Ordenar para que el usuario actual aparezca primero
    ordenarCuadrante(arrayTurnos.value);

    // Calcular datos de cobertura para timeline
    calculateCoverageData();

    return turnosEquipo;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as any).response === "object" &&
      (error as any).response !== null &&
      "data" in (error as any).response &&
      typeof (error as any).response.data === "object" &&
      (error as any).response.data !== null &&
      "code" in (error as any).response.data &&
      (error as any).response.data.code == "SIN_COORDINADORA"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Sin coordinadora asignada",
        text: "No hay coordinadora asignada a esta tienda.",
      });
      return;
    }

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

function getHorasContrato(turno: any): number {
  for (let i = 0; i < turno.turnos.length; i++) {
    for (let j = 0; j < turno.turnos[i].length; j++) {
      const t = turno.turnos[i][j];
      if (t && t.horasContrato) {
        // 👇 Si es vacaciones Mongo → ya viene en horas reales
        if (t.ausencia?.tipo === "VACACIONES") {
          return t.horasContrato;
        }

        // 👇 Si no, sigue siendo porcentaje y hay que convertir
        return 40 * (t.horasContrato / 100);
      }
    }
  }
  return 0;
}

function getDiferenciaHoras(turno: any) {
  const totalHoras = getTotalHorasCuadranteLinea(turno);
  const horasContrato = getHorasContrato(turno);
  return totalHoras - horasContrato;
}

function getNombreTienda(idTienda: number) {
  for (let i = 0; i < tiendas.value.length; i += 1) {
    if (tiendas.value[i].id === idTienda) return tiendas.value[i].nombre;
  }
  return "¿?";
}

function formatTurnoHora(fecha: string | Date | DateTime) {
  if (typeof fecha === "string") {
    return DateTime.fromISO(fecha).toFormat("HH:mm");
  } else if (fecha instanceof Date) {
    return DateTime.fromJSDate(fecha).toFormat("HH:mm");
  } else if (fecha && typeof fecha === "object" && "toFormat" in fecha) {
    // Es un objeto DateTime de Luxon
    return fecha.toFormat("HH:mm");
  }
  return "N/A";
}

function getTotalHorasCuadranteLinea(data: any) {
  const horasContrato = getHorasContrato(data);
  let totalHoras = 0;
  let diasVacaciones = 0;
  let todosMaternidad = true;

  for (let i = 0; i < data.turnos.length; i++) {
    for (let j = 0; j < data.turnos[i].length; j++) {
      const turno = data.turnos[i][j];
      if (!turno) continue;

      const tipoAusencia = turno.ausencia?.tipo
        ? String(turno.ausencia.tipo).trim().toUpperCase()
        : null;

      // Caso maternidad/paternidad → toda la semana cuenta como contrato
      if (tipoAusencia === "PERMISO MATERNIDAD/PATERNIDAD") {
        continue;
      } else {
        todosMaternidad = false;
      }

      if (tipoAusencia === "VACACIONES") {
        // Contar solo vacaciones de lunes a viernes
        if (i < 5) {
          diasVacaciones++;
        }
      } else {
        // Horas reales trabajadas
        totalHoras += turno.totalHoras || 0;
      }
    }
  }

  // Caso 1: toda la semana maternidad
  if (todosMaternidad) {
    return horasContrato; // cuenta como contrato completo
  }

  // Caso 2: vacaciones proporcionales (solo lunes–viernes)
  if (diasVacaciones > 0) {
    const horasPorDia = horasContrato / 5;
    totalHoras += diasVacaciones * horasPorDia;
  }

  return totalHoras;
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

async function abrirModalCopiarTurnos() {
  // Validar PIN antes de abrir modal
  const pinValido = await validarPINCoordinadora();
  if (!pinValido) return;

  modalCopiarTurnos.value?.abrirModal();
}

async function abrirModalEditarTurno(trabajador: any, diaIndex: number) {
  if (!selectedTienda.value) {
    Swal.fire({
      icon: "warning",
      text: "No hay tienda seleccionada.",
    });
    return;
  }

  // Solo permitir edición si el modo edición está activo
  if (!modoEdicionActivo.value) {
    return; // No hacer nada si el modo edición no está activo
  }

  const fechaDia = selectedDate.value.plus({ days: diaIndex });

  // Validar que no se puedan editar turnos de más de 3 semanas atrás
  const hacesTresSemanas = DateTime.now().startOf("day").minus({ weeks: 3 });

  if (fechaDia < hacesTresSemanas) {
    Swal.fire({
      icon: "warning",
      title: "Edición no permitida",
      text: "Solo se pueden editar turnos de las últimas 3 semanas.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  await modalEditarTurnoIndividual.value?.abrirModal(
    trabajador.idTrabajador,
    trabajador.nombre,
    fechaDia,
    selectedTienda.value,
  );
}

async function abrirModalPlantillas() {
  if (!selectedTienda.value?.id) {
    Swal.fire({
      icon: "warning",
      text: "No hay tienda seleccionada.",
    });
    return;
  }

  plantillasModal.value?.abrirModal();
}

async function cargarPlantillasTurno() {
  if (!selectedTienda.value?.id) return;

  try {
    const response = await axiosInstance.get("plantilla-turno", {
      params: { idTienda: selectedTienda.value.id },
    });

    plantillasTurno.value = response.data || [];
  } catch (error) {
    console.error("Error al cargar plantillas:", error);
    plantillasTurno.value = [];
  }
}

// Funciones del modal de selección de tienda
function abrirModalSeleccionTienda() {
  modalSeleccionTienda.value = true;
  busquedaTienda.value = "";
  tiendasFiltradas.value = tiendas.value;

  // Focus en el input después de abrir el modal
  setTimeout(() => {
    inputBusquedaTiendaModal.value?.focus();
  }, 100);
}

function cerrarModalSeleccionTienda() {
  modalSeleccionTienda.value = false;
  busquedaTienda.value = "";
}

function filtrarTiendas() {
  const busqueda = busquedaTienda.value.toLowerCase().trim();

  if (!busqueda) {
    tiendasFiltradas.value = tiendas.value;
  } else {
    tiendasFiltradas.value = tiendas.value.filter((tienda) =>
      tienda.nombre.toLowerCase().includes(busqueda),
    );
  }
}

function seleccionarTiendaModal(tienda: TTienda) {
  selectedTienda.value = tienda;
  cerrarModalSeleccionTienda();
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
    cargarPlantillasTurno();
  }
});

// Watch para cuando se cargan las tiendas (solo para roles que no sean Supervisora)
watch(
  tiendas,
  (newTiendas) => {
    // Solo ejecutar este watcher si no es Supervisora (ya que Supervisora carga tiendas manualmente)
    if (!hasRole("Supervisora") && !selectedTienda.value && newTiendas.length > 0) {
      if (userStore.user.coordinadoraDeLaTienda) {
        selectedTienda.value = userStore.user.coordinadoraDeLaTienda;
      } else if (userStore.user.idTienda) {
        const tiendaUsuario = newTiendas.find((t) => t.id === userStore.user.idTienda);
        if (tiendaUsuario) {
          selectedTienda.value = tiendaUsuario;
        }
      } else {
        selectedTienda.value = newTiendas[0];
      }
    }
  },
  { immediate: true },
);

provide("reloadCuadrante", reloadCuadrante);

async function loadTiendasBasedOnRole() {
  if (loadingTiendas.value) return; // Prevenir múltiples llamadas simultáneas

  try {
    loadingTiendas.value = true;
    let tiendasData = [];

    if (hasRole("Super_Admin")) {
      // Si es Super_Admin, usar las tiendas ya cargadas desde el store
      tiendasData = tiendaStore.tiendas;

      // Si no hay tiendas en el store, esperar a que se carguen
      if (tiendasData.length === 0) {
        console.log("Esperando a que se carguen las tiendas en el store...");
        // Esperar un momento y volver a intentar
        await new Promise((resolve) => setTimeout(resolve, 1000));
        tiendasData = tiendaStore.tiendas;
      }
    } else if (hasRole("Supervisora")) {
      // Si es Supervisora, cargar tiendas desde el endpoint específico
      console.log("Cargando tiendas del supervisor...");
      console.log("idSql del usuario:", userStore.user.idSql);

      if (!userStore.user.idSql) {
        throw new Error("No se encontró el ID del usuario para cargar las tiendas");
      }

      const response = await axiosInstance.get("get-tiendas-del-supervisor", {
        params: { idSupervisor: userStore.user.idSql },
      });

      console.log("Respuesta del servidor:", response.data);

      if (response.data && Array.isArray(response.data)) {
        tiendasData = response.data;
        // Actualizar el store con las tiendas del supervisor
        tiendaStore.setTiendas(tiendasData);
        console.log(`Tiendas del supervisor cargadas: ${tiendasData.length}`);

        if (tiendasData.length === 0) {
          console.warn("El supervisor no tiene tiendas asignadas");
          Swal.fire({
            icon: "info",
            title: "Sin tiendas asignadas",
            text: "No tienes tiendas asignadas como supervisor.",
          });
        }
      } else {
        console.warn("Respuesta inesperada del servidor:", response.data);
        throw new Error("Formato de respuesta inválido del servidor");
      }
    } else {
      // Para otros roles, usar las tiendas del store
      tiendasData = tiendaStore.tiendas;
    }

    // Seleccionar tienda inicial después de cargar
    if (tiendasData.length > 0) {
      if (userStore.user.coordinadoraDeLaTienda?.id) {
        const tiendaCoordinadora = tiendasData.find(
          (t) => t.id === userStore.user.coordinadoraDeLaTienda?.id,
        );
        selectedTienda.value = tiendaCoordinadora || tiendasData[0];
      } else if (userStore.user.idTienda) {
        const tiendaUsuario = tiendasData.find((t) => t.id === userStore.user.idTienda);
        selectedTienda.value = tiendaUsuario || tiendasData[0];
      } else {
        selectedTienda.value = tiendasData[0];
      }

      console.log(`Tienda seleccionada: ${selectedTienda.value?.nombre}`);
    } else {
      console.warn("No se encontraron tiendas disponibles");
    }

    return tiendasData;
  } catch (error) {
    console.error("Error al cargar tiendas basado en rol:", error);
    Swal.fire({
      icon: "error",
      title: "Error al cargar tiendas",
      text: "No se pudieron cargar las tiendas disponibles. Por favor, inténtalo de nuevo.",
    });
    return [];
  } finally {
    loadingTiendas.value = false;
  }
}

onMounted(async () => {
  handleVista();

  // Cargar tiendas basado en el rol del usuario
  await loadTiendasBasedOnRole();

  if (selectedTienda.value) {
    reloadCuadrante();
  }

  // Escuchar evento de recarga del cuadrante
  window.addEventListener("recargar-cuadrante", () => {
    if (selectedTienda.value) {
      reloadCuadrante();
    }
  });
});

// Funciones para Timeline
function calculateCoverageData() {
  // Inicializar matriz 7x96 (7 días, 96 intervalos de 15min)
  coverageData.value = Array(7)
    .fill(null)
    .map(() => Array(96).fill(0));

  // Iterar sobre todos los trabajadores y sus turnos
  arrayTurnos.value.forEach((trabajador) => {
    trabajador.turnos.forEach((turnosDelDia: any[], dayIndex: number) => {
      turnosDelDia.forEach((turno) => {
        if (turno && turno.totalHoras > 0) {
          // Obtener horas de inicio y fin
          const inicio = turno.inicio;
          const final = turno.final;

          if (inicio.isValid && final.isValid) {
            // Convertir a intervalos de 15 minutos
            const inicioIntervals = inicio.hour * 4 + Math.floor(inicio.minute / 15);
            const finalIntervals = final.hour * 4 + Math.floor(final.minute / 15);

            // Incrementar contador para cada intervalo de 15min cubierto
            for (
              let interval = inicioIntervals;
              interval < finalIntervals && interval < 96;
              interval++
            ) {
              coverageData.value[dayIndex][interval]++;
            }
          }
        }
      });
    });
  });
}

function getWorkerCount(dayIndex: number, intervalIndex: number): number {
  return coverageData.value[dayIndex]?.[intervalIndex] || 0;
}

function getCoverageHeight(dayIndex: number, intervalIndex: number): number {
  const count = getWorkerCount(dayIndex, intervalIndex);
  if (count === 0) return 0;

  // Calcular máximo para normalizar altura
  const maxWorkers = Math.max(...coverageData.value.flat());
  return Math.min((count / Math.max(maxWorkers, 1)) * 100, 100);
}

function getHourCoverageClass(dayIndex: number, intervalIndex: number): string {
  const count = getWorkerCount(dayIndex, intervalIndex);
  if (count === 0) return "no-coverage";
  if (count === 1) return "low-coverage";
  if (count <= 3) return "medium-coverage";
  return "high-coverage";
}

function getHourTooltip(dayIndex: number, intervalIndex: number): string {
  const count = getWorkerCount(dayIndex, intervalIndex);
  const dayName = selectedDate.value.plus({ days: dayIndex }).toFormat("EEEE", { locale: "es" });

  // Convertir índice de intervalo a horas y minutos (15 minutos)
  const hour = Math.floor(intervalIndex / 4);
  const minutes = (intervalIndex % 4) * 15;
  const nextHour = Math.floor((intervalIndex + 1) / 4);
  const nextMinutes = ((intervalIndex + 1) % 4) * 15;

  const timeStart = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const timeEnd = `${String(nextHour).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
  const timeRange = `${timeStart} - ${timeEnd}`;

  if (count === 0) {
    return `${dayName} ${timeRange}: Sin cobertura`;
  }

  return `${dayName} ${timeRange}: ${count} trabajador${count > 1 ? "es" : ""}`;
}
</script>

<style lang="scss" scoped>
@use "sass:color";

// Variables de diseño moderno
$primary-color: #e66c5a;
$secondary-color: #333;
$success-color: #10b981;
$danger-color: #ef4444;
$warning-color: #f59e0b;
$neutral-50: #f9fafb;

// Botones corporativos con color sólido
:deep(.btn-corporate) {
  background-color: $primary-color !important;
  border-color: $primary-color !important;
  color: white !important;
  transition: all 0.3s ease;

  &:hover {
    background-color: color.adjust($primary-color, $lightness: -8%) !important;
    border-color: color.adjust($primary-color, $lightness: -8%) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

:deep(.btn-nav-corporate) {
  border-color: $primary-color !important;
  color: $primary-color !important;
  background-color: white !important;
  transition: all 0.3s ease;

  &:hover {
    background-color: $primary-color !important;
    color: white !important;
    border-color: $primary-color !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

// Botones secundarios corporativos (gris oscuro)
:deep(.btn-secondary-corporate) {
  border-color: $secondary-color !important;
  color: $secondary-color !important;
  background-color: white !important;
  transition: all 0.3s ease;

  &:hover {
    background-color: $secondary-color !important;
    color: white !important;
    border-color: $secondary-color !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($secondary-color, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

// Botones de modo de vista (Tabla/Línea temporal)
:deep(.btn-view-mode) {
  border-color: $secondary-color !important;
  color: $secondary-color !important;
  transition: all 0.3s ease;

  &:hover {
    background-color: $secondary-color !important;
    color: white !important;
    border-color: $secondary-color !important;
  }

  // Cuando está activo (checked)
  &.active,
  input:checked + & {
    background-color: $secondary-color !important;
    color: white !important;
    border-color: $secondary-color !important;
  }
}

// Botones de navegación de timeline
:deep(.btn-timeline-nav) {
  border-color: $secondary-color !important;
  color: $secondary-color !important;

  &:hover:not(:disabled) {
    background-color: $secondary-color !important;
    color: white !important;
    border-color: $secondary-color !important;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

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

// Main content específico para cuadrantes
.main-content-cuadrantes {
  padding-bottom: 80px !important; // Más espacio para tablets/desktop
  overflow-y: visible; // Usar scroll natural de la ventana
  overflow-x: hidden; // Ocultar scroll horizontal
  max-height: none; // Sin limitación de altura para usar scroll natural
}

// Contenedor de tabla moderno
.modern-table-container {
  height: auto; // Altura automática
  display: flex;
  flex-direction: column;
  min-height: 400px; // Altura mínima para evitar colapso
  max-height: none; // Sin limitación de altura para usar scroll natural
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
  margin-bottom: 40px; // Espacio adicional debajo de la tabla
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
      padding: 0.75rem 0.5rem;
      font-weight: 600;
      text-align: left;
      font-size: 0.8rem;
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

      &.row-externo {
        background: linear-gradient(to right, rgba(255, 165, 0, 0.08), rgba(255, 140, 0, 0.05));
        border-left: 3px solid #ff8c00;

        .empleado-nombre {
          color: #ff8c00;
          font-style: italic;

          &::after {
            content: " (externo)";
            font-size: 0.7rem;
            color: #999;
            font-weight: normal;
          }
        }
      }
    }

    td {
      padding: 0.5rem 0.3rem;
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

// Columnas específicas optimizadas para tablet horizontal
.th-empleado {
  width: 200px;
  text-align: left !important;
}

.th-dia {
  width: 100px;
}

.th-horas,
.th-contrato,
.th-diferencia {
  width: 85px;
}

// Información del empleado
.empleado-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empleado-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: $primary-color;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.empleado-datos {
  .empleado-nombre {
    font-weight: 500;
    color: $neutral-800;
    font-size: 0.85rem;
    line-height: 1.2;
  }

  .empleado-id {
    font-size: 0.7rem;
    color: $neutral-500;
    margin-top: 0.05rem;
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
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-bottom: 0.15rem;

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
  background: rgba($warning-color, 0.15);
  color: color.adjust($warning-color, $lightness: -10%);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border: 1px solid rgba($warning-color, 0.3);

  .ausencia-tipo {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    text-align: center;
  }

  .ausencia-horas {
    font-size: 0.7rem;
    opacity: 0.8;
  }

  // Estilo especial para fiestas
  &.fiesta-badge-custom {
    background: linear-gradient(135deg, rgba($success-color, 0.2) 0%, rgba($success-color, 0.15) 100%);
    color: color.adjust($success-color, $lightness: -15%);
    border: 1.5px solid rgba($success-color, 0.5);
    font-weight: 700;
    box-shadow: 0 2px 4px rgba($success-color, 0.15);

    i {
      color: $success-color;
    }
  }
}

// Badges de horas
.horas-badge,
.contrato-badge {
  background: $neutral-100;
  color: $neutral-700;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  display: inline-block;
}

// Badges de diferencia
.diferencia-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
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

// Estilos móviles eliminados - solo tablet/desktop

// Scrollbar personalizado
.table-responsive {
  overflow-y: visible; // Usar scroll natural de la ventana
  overflow-x: auto; // Mantener scroll horizontal para tablas anchas
  max-height: none; // Sin limitación de altura para usar scroll natural
  border-radius: 16px; // Mantener bordes redondeados

  &::-webkit-scrollbar {
    height: 8px;
    width: 8px; // También para scroll vertical
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

// Optimización específica para tablets en horizontal (768px - 1024px)
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .modern-table {
    th {
      padding: 0.6rem 0.4rem;
      font-size: 0.75rem;
    }

    td {
      padding: 0.4rem 0.25rem;
    }
  }

  .th-empleado {
    width: 180px;
  }

  .th-dia {
    width: 90px;
  }

  .th-horas,
  .th-contrato,
  .th-diferencia {
    width: 75px;
  }

  .empleado-info {
    gap: 0.4rem;
  }

  .empleado-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .empleado-datos {
    .empleado-nombre {
      font-size: 0.8rem;
    }

    .empleado-id {
      font-size: 0.65rem;
    }
  }

  .turno-horario {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    margin-bottom: 0.1rem;
  }

  .ausencia-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }

  .horas-badge,
  .contrato-badge,
  .diferencia-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

// Estilos para Timeline View
.timeline-container {
  padding: 1.5rem;
  background: $neutral-50;
  border-radius: 16px;
  border: 1px solid $neutral-200;
  max-height: none; // Sin limitación de altura para usar scroll natural
  overflow-y: visible; // Usar scroll natural de la ventana
}

.timeline-header {
  h6 {
    color: $primary-color;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
}

.day-navigation {
  .current-day-display {
    padding: 0.375rem 1rem;
    background: white;
    border: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    min-width: 160px;

    .day-name {
      font-weight: 600;
      color: $primary-color;
      text-transform: capitalize;
      white-space: nowrap;
    }
  }

  .btn-group {
    .btn:disabled {
      opacity: 0.3;
    }
  }
}

.horizontal-timeline {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid $neutral-200;
  overflow-x: auto;
  overflow-y: hidden;

  // Ocultar scrollbars pero mantener funcionalidad
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $neutral-300;
    border-radius: 4px;

    &:hover {
      background: $neutral-400;
    }
  }

  // Para Firefox
  scrollbar-width: thin;
  scrollbar-color: $neutral-300 transparent;

  .hour-labels {
    display: flex;
    gap: 2px;
    margin-bottom: 1rem;
    min-width: max-content;

    .hour-label {
      min-width: 50px;
      text-align: center;
      font-size: 0.65rem;
      color: $neutral-600;
      font-weight: 500;
      padding: 0.25rem 0;

      // Estilo para intervalos de 15 minutos (no en hora completa)
      &.quarter-hour {
        font-size: 0.55rem;
        color: $neutral-500;
        font-weight: 400;
      }
    }
  }

  .coverage-bars {
    display: flex;
    gap: 2px;
    align-items: end;
    height: 200px;
    min-width: max-content;

    .hour-bar {
      min-width: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: scaleX(1.1);
        z-index: 2;
      }

      .coverage-bar-horizontal {
        width: 100%;
        height: 180px;
        background: $neutral-200;
        border-radius: 4px 4px 0 0;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: end;

        .coverage-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
          min-height: 2px;
        }
      }

      .worker-count {
        position: absolute;
        top: -25px;
        font-size: 0.65rem;
        font-weight: 600;
        color: white;
        background: $primary-color;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      // Clases de cobertura
      &.no-coverage {
        .coverage-bar-horizontal .coverage-fill {
          background: transparent;
        }
      }

      &.low-coverage {
        .coverage-bar-horizontal .coverage-fill {
          background: linear-gradient(180deg, #fbbf24, #f59e0b);
        }
      }

      &.medium-coverage {
        .coverage-bar-horizontal .coverage-fill {
          background: linear-gradient(180deg, #10b981, #059669);
        }
      }

      &.high-coverage {
        .coverage-bar-horizontal .coverage-fill {
          background: linear-gradient(180deg, $primary-color, $secondary-color);
        }
      }
    }
  }
}

.timeline-legend {
  display: flex;
  justify-content: center;

  .legend-items {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 1px solid $neutral-300;
      }

      &.no-coverage .legend-color {
        background: $neutral-200;
      }

      &.low-coverage .legend-color {
        background: linear-gradient(45deg, #fbbf24, #f59e0b);
      }

      &.medium-coverage .legend-color {
        background: linear-gradient(45deg, #10b981, #059669);
      }

      &.high-coverage .legend-color {
        background: linear-gradient(45deg, $primary-color, $secondary-color);
      }
    }
  }
}

// Estilos del switch de vista
.view-switch {
  .btn-check:checked + .btn-outline-primary {
    background-color: $primary-color;
    border-color: $primary-color;
    color: white;
  }
}

.fiesta-badge {
  background: rgba($success-color, 0.1);
  color: $success-color;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

// Celdas clickeables
.clickeable-celda {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba($primary-color, 0.08) !important;
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba($primary-color, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }

  .sin-turno {
    color: $primary-color;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

// Estilos del botón selector de tienda principal
.btn-tienda-selector-main {
  border: 2px solid $primary-color;
  color: $primary-color;
  background-color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover:not(:disabled) {
    background-color: rgba($primary-color, 0.05);
    border-color: color.adjust($primary-color, $lightness: -8%);
    color: color.adjust($primary-color, $lightness: -8%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
    border-color: $primary-color;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Estilos del modal de selección de tienda
.modal-seleccion-tienda-overlay {
  z-index: 2060;
}

.modal-seleccion-tienda {
  max-width: 500px;
  border-radius: 12px;

  .modal-header {
    background: linear-gradient(90deg, $primary-color 0%, $secondary-color 100%);
    color: white;
    border-bottom: none;
    padding: 1.25rem 1.5rem;
    border-radius: 12px 12px 0 0;

    .modal-title {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0;
    }

    .btn-close {
      filter: brightness(0) invert(1);
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }
  }

  .search-container {
    background: #f8f9fa;

    .search-wrapper {
      position: relative;

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: $neutral-400;
        z-index: 1;
      }

      .form-control {
        padding-left: 2.5rem;
        border: 2px solid $neutral-200;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:focus {
          border-color: $primary-color;
          box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
        }
      }
    }
  }

  .tiendas-list {
    max-height: 400px;
    overflow-y: auto;

    // Scrollbar personalizado para la lista
    &::-webkit-scrollbar {
      width: 8px;
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

    // Para Firefox
    scrollbar-width: thin;
    scrollbar-color: $neutral-300 $neutral-100;

    .tienda-item {
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid $neutral-100;

      &:hover {
        background-color: rgba($primary-color, 0.05);
      }

      &.selected {
        background-color: rgba($primary-color, 0.1);
        border-left: 3px solid $primary-color;
      }

      .tienda-item-content {
        display: flex;
        align-items: center;
        flex: 1;

        .tienda-nombre {
          font-size: 0.95rem;
          color: #2d3748;
          font-weight: 500;
        }

        i {
          color: $primary-color;
        }
      }

      i.fa-check-circle {
        font-size: 1.2rem;
      }
    }
  }
}

// Transiciones del modal
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s linear;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.15s linear;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}
</style>
