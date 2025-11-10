<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modalEditarTurno"
        class="modal fade show"
        tabindex="-1"
        role="dialog"
        aria-labelledby="modalEditarTurnoIndividualLabel"
        aria-modal="true"
        style="display: block"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div
          class="modal-dialog modal-dialog-scrollable"
          :class="{ 'modal-fullscreen': isMobile, 'modal-lg': !isMobile }"
          role="document"
        >
          <div class="modal-content" :class="{ 'modal-minimized': isMinimized }">
            <div class="modal-header" @click="isMinimized && toggleMinimize()">
              <h5 class="modal-title" id="modalEditarTurnoIndividualLabel">
                {{ tituloModal }}
                <span v-if="isMinimized" class="minimized-hint ms-2">
                  <i class="fas fa-hand-pointer"></i>
                  Clic para expandir
                </span>
              </h5>
              <div class="header-buttons" @click.stop>
                <button
                  type="button"
                  class="btn-minimize"
                  @click="toggleMinimize"
                  :aria-label="isMinimized ? 'Maximizar' : 'Minimizar'"
                  :title="isMinimized ? 'Maximizar' : 'Minimizar'"
                >
                  <i :class="isMinimized ? 'fas fa-window-maximize' : 'fas fa-minus'"></i>
                </button>
              </div>
            </div>

            <div v-show="!isMinimized" class="modal-body modal-body-turno">
              <div v-if="cargando" class="loading-container">
                <BsSpinner style="width: 3rem; height: 3rem" />
                <p class="mt-3">Cargando turnos...</p>
              </div>

              <div v-else class="contenido-turno">
                <!-- Información del trabajador y día -->
                <div class="info-card mb-3">
                  <div class="info-item">
                    <i class="fas fa-user me-2"></i>
                    <strong>{{ trabajadorNombre }}</strong>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-calendar me-2"></i>
                    <span>{{ fechaFormateada }}</span>
                  </div>
                </div>

                <!-- Lista de turnos del día -->
                <div class="turnos-list mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">Turnos del día</h6>
                    <BsButton
                      color="primary"
                      size="sm"
                      icon="plus"
                      class="btn-corporate"
                      @click="agregarNuevoTurno"
                      :disabled="estaDiaEnPeriodoAusencia"
                    >
                      Añadir turno
                    </BsButton>
                  </div>

                  <!-- Mensaje de ausencia -->
                  <div v-if="estaDiaEnPeriodoAusencia" class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Este día tiene una ausencia: <strong>{{ ausenciaDelDia?.tipo }}</strong>
                  </div>

                  <!-- Turnos existentes -->
                  <div
                    v-if="turnosDelDia.length === 0 && !estaDiaEnPeriodoAusencia"
                    class="empty-turnos"
                  >
                    <i class="fas fa-calendar-times fa-2x mb-2"></i>
                    <p>No hay turnos para este día</p>
                    <small>Haz clic en "Añadir turno" para crear uno</small>
                  </div>

                  <div
                    v-for="(turno, index) in turnosDelDia"
                    :key="turno.id"
                    class="turno-card mb-2"
                    :class="{ 'turno-seleccionado': turnoSeleccionadoIndex === index }"
                    @click="seleccionarTurno(index)"
                  >
                    <div class="turno-content">
                      <div class="turno-horario">
                        <i class="fas fa-clock me-2"></i>
                        <strong>
                          {{ formatearHora(turno.inicio) }} - {{ formatearHora(turno.final) }}
                        </strong>
                        <span class="turno-duracion ms-2">({{ calcularDuracion(turno) }})</span>
                      </div>
                      <div class="turno-tienda">
                        <i class="fas fa-store me-2"></i>
                        {{ getNombreTienda(turno.tiendaId) }}
                      </div>
                    </div>
                    <div class="turno-actions">
                      <BsButton
                        color="danger"
                        size="sm"
                        icon="trash"
                        @click.stop="eliminarTurno(index)"
                        v-if="turno.borrable !== false"
                      />
                    </div>
                  </div>
                </div>

                <!-- Editor de turno seleccionado -->
                <div
                  v-if="turnoSeleccionadoIndex !== null && !estaDiaEnPeriodoAusencia"
                  class="editor-turno"
                >
                  <h6 class="mb-3">Editar turno seleccionado</h6>

                  <div class="row g-3">
                    <!-- Selector de plantilla o personalizado -->
                    <div class="col-12">
                      <label class="form-label">Horario</label>
                      <div class="d-flex gap-2 mb-2">
                        <BsButton
                          color="primary"
                          size="sm"
                          :class="!esHorarioPersonalizado ? 'btn-corporate' : 'btn-corporate-outline'"
                          @click="cambiarModoHorario(false)"
                        >
                          <i class="fas fa-list me-1"></i> Plantilla
                        </BsButton>
                        <BsButton
                          color="primary"
                          size="sm"
                          :class="esHorarioPersonalizado ? 'btn-corporate' : 'btn-corporate-outline'"
                          @click="cambiarModoHorario(true)"
                        >
                          <i class="fas fa-edit me-1"></i> Personalizado
                        </BsButton>
                      </div>

                      <!-- Selector de plantilla vía modal -->
                      <button
                        v-if="!esHorarioPersonalizado"
                        type="button"
                        class="btn btn-plantilla-selector w-100 text-start d-flex align-items-center justify-content-between"
                        @click="abrirModalSeleccionPlantilla"
                      >
                        <span>
                          <i class="fas fa-clock me-2"></i>
                          {{ plantillaSeleccionada?.nombre || 'Seleccionar plantilla...' }}
                        </span>
                        <i class="fas fa-chevron-down"></i>
                      </button>

                      <!-- Inputs personalizados -->
                      <div v-else class="row g-2">
                        <div class="col-6">
                          <label class="form-label-small">Inicio</label>
                          <input
                            type="time"
                            class="form-control"
                            v-model="horaInicio"
                            @change="actualizarHoraPersonalizada"
                          />
                        </div>
                        <div class="col-6">
                          <label class="form-label-small">Final</label>
                          <input
                            type="time"
                            class="form-control"
                            v-model="horaFinal"
                            @change="actualizarHoraPersonalizada"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Selector de tienda - botón para abrir modal -->
                    <div class="col-12">
                      <label class="form-label">Tienda</label>
                      <button
                        type="button"
                        class="btn btn-tienda-selector w-100 text-start d-flex align-items-center justify-content-between"
                        @click="abrirModalSeleccionTienda"
                      >
                        <span>
                          <i class="fas fa-store me-2"></i>
                          {{ tiendaSeleccionada?.nombre || 'Seleccionar tienda...' }}
                        </span>
                        <i class="fas fa-chevron-down"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="!isMinimized" class="modal-footer modal-footer-custom">
              <button type="button" class="btn btn-secondary" @click="cerrarModal">
                <i class="fas fa-times me-2"></i>
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary btn-guardar-principal btn-corporate"
                @click="guardarCambios"
                :disabled="guardando"
              >
                <span
                  v-if="guardando"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <i v-else class="fas fa-save me-2"></i>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop overlay -->
    <Transition name="backdrop-fade">
      <div
        v-if="modalEditarTurno"
        class="modal-backdrop fade show"
        :class="{ 'backdrop-minimized': isMinimized }"
      ></div>
    </Transition>
  </Teleport>

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
              <!-- Buscador -->
              <div class="search-container p-3 border-bottom">
                <div class="input-group">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-muted"></i>
                  </span>
                  <input
                    ref="inputBusquedaTiendaModal"
                    type="text"
                    class="form-control border-start-0"
                    v-model="busquedaTienda"
                    @input="filtrarTiendas"
                    placeholder="Buscar por nombre..."
                    autocomplete="off"
                  />
                  <button
                    v-if="busquedaTienda"
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="busquedaTienda = ''; filtrarTiendas();"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Lista de tiendas -->
              <div class="tiendas-list">
                <div
                  v-if="tiendasFiltradas.length === 0"
                  class="text-center py-5 text-muted"
                >
                  <i class="fas fa-search fa-2x mb-3"></i>
                  <p>No se encontraron tiendas</p>
                </div>

                <div
                  v-for="tienda in tiendasFiltradas"
                  :key="tienda.id"
                  class="tienda-item"
                  :class="{ 'selected': tiendaSeleccionada?.id === tienda.id }"
                  @click="seleccionarTiendaModal(tienda)"
                >
                  <div class="tienda-item-content">
                    <i class="fas fa-store me-3 text-primary"></i>
                    <span class="tienda-nombre">{{ tienda.nombre }}</span>
                  </div>
                  <i
                    v-if="tiendaSeleccionada?.id === tienda.id"
                    class="fas fa-check-circle text-success"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop para modal de selección de tienda -->
    <Transition name="backdrop-fade">
      <div v-if="modalSeleccionTienda" class="modal-backdrop fade show" style="z-index: 2055;"></div>
    </Transition>
  </Teleport>

  <!-- Modal de selección de plantilla -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modalSeleccionPlantilla"
        class="modal fade show modal-seleccion-plantilla-overlay"
        tabindex="-1"
        role="dialog"
        style="display: block; z-index: 2060;"
        @click.self="cerrarModalSeleccionPlantilla"
      >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
          <div class="modal-content modal-seleccion-plantilla">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-clock me-2"></i>
                Seleccionar Plantilla de Turno
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="cerrarModalSeleccionPlantilla"
                aria-label="Close"
              ></button>
            </div>

            <div class="modal-body p-0">
              <!-- Buscador -->
              <div class="search-container p-3 border-bottom">
                <div class="input-group">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-muted"></i>
                  </span>
                  <input
                    ref="inputBusquedaPlantillaModal"
                    type="text"
                    class="form-control border-start-0"
                    v-model="busquedaPlantilla"
                    @input="filtrarPlantillas"
                    placeholder="Buscar por nombre..."
                    autocomplete="off"
                  />
                  <button
                    v-if="busquedaPlantilla"
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="busquedaPlantilla = ''; filtrarPlantillas();"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Lista de plantillas -->
              <div class="plantillas-list">
                <div
                  v-if="plantillasFiltradas.length === 0"
                  class="text-center py-5 text-muted"
                >
                  <i class="fas fa-search fa-2x mb-3"></i>
                  <p>No se encontraron plantillas</p>
                </div>

                <div
                  v-for="plantilla in plantillasFiltradas"
                  :key="plantilla.id"
                  class="plantilla-item"
                  :class="{ 'selected': plantillaSeleccionada?.id === plantilla.id }"
                  @click="seleccionarPlantillaModal(plantilla)"
                >
                  <div class="plantilla-item-content">
                    <i class="fas fa-clock me-3 text-primary"></i>
                    <div>
                      <span class="plantilla-nombre">{{ plantilla.nombre }}</span>
                      <span class="plantilla-horario">({{ plantilla.inicio }} - {{ plantilla.final }})</span>
                    </div>
                  </div>
                  <i
                    v-if="plantillaSeleccionada?.id === plantilla.id"
                    class="fas fa-check-circle text-success"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop para modal de selección de plantilla -->
    <Transition name="backdrop-fade">
      <div v-if="modalSeleccionPlantilla" class="modal-backdrop fade show" style="z-index: 2055;"></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Ref, onMounted, onUnmounted } from "vue";
import { DateTime } from "luxon";
import BsButton from "@/components/365/BsButton.vue";
import BsSpinner from "@/components/365/BsSpinner.vue";
import type { TTienda } from "@/interfaces/Tienda.interface";
import type { TTurnoFrontend } from "@/interfaces/Turno.interface";
import type { AusenciaFrontendOLD } from "@/interfaces/AusenciasOLD.interface";
import { useTiendaStore } from "@/stores/tienda";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import { Turno } from "@/components/kernel/Turno";

export interface TPlantilla {
  id: string;
  nombre: string;
  inicio: string;
  final: string;
}

interface Props {
  plantillasTurno: TPlantilla[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "turno-guardado"): void;
}>();

const tiendaStore = useTiendaStore();

// Estado del modal
const modalEditarTurno = ref(false);
const cargando = ref(false);
const guardando = ref(false);
const isMobile = ref(window.innerWidth < 768);
const isMinimized = ref(false);

// Datos del turno
const idTrabajador: Ref<number | null> = ref(null);
const trabajadorNombre = ref("");
const fechaDia: Ref<DateTime | null> = ref(null);
const turnosDelDia: Ref<TTurnoFrontend[]> = ref([]);
const turnoSeleccionadoIndex: Ref<number | null> = ref(null);
const ausencias: Ref<AusenciaFrontendOLD[]> = ref([]);

// Editor de turno
const esHorarioPersonalizado = ref(false);
const horaInicio = ref("09:00");
const horaFinal = ref("17:00");
const plantillaSeleccionada: Ref<TPlantilla | null> = ref(null);
const tiendaSeleccionada: Ref<TTienda | null> = ref(null);

// Modal de selección de tienda
const modalSeleccionTienda = ref(false);
const busquedaTienda = ref("");
const tiendasFiltradas: Ref<TTienda[]> = ref([]);
const inputBusquedaTiendaModal = ref<HTMLInputElement | null>(null);

// Modal de selección de plantilla
const modalSeleccionPlantilla = ref(false);
const busquedaPlantilla = ref("");
const plantillasFiltradas: Ref<TPlantilla[]> = ref([]);
const inputBusquedaPlantillaModal = ref<HTMLInputElement | null>(null);

// Computeds
const tiendas = computed(() => tiendaStore.tiendas);

const plantillasTurnoTextoCompuesto = computed(() => {
  return props.plantillasTurno.map((plantilla: TPlantilla) => ({
    nombre: `${plantilla.nombre} (${plantilla.inicio} - ${plantilla.final})`,
    id: plantilla.id,
    inicio: plantilla.inicio,
    final: plantilla.final,
  }));
});

const tituloModal = computed(() => {
  if (!trabajadorNombre.value || !fechaDia.value) return "Editar turnos";
  return `Turnos de ${trabajadorNombre.value}`;
});

const fechaFormateada = computed(() => {
  if (!fechaDia.value) return "";
  return fechaDia.value.toFormat("EEEE dd 'de' MMMM", { locale: "es" });
});

const ausenciaDelDia = computed(() => {
  if (!fechaDia.value) return null;

  return ausencias.value.find((ausencia) => {
    const inicio = ausencia.fechaInicio;
    const final = ausencia.fechaFinal;
    if (!final) return false;
    return fechaDia.value! >= inicio && fechaDia.value! <= final;
  });
});

const estaDiaEnPeriodoAusencia = computed(() => !!ausenciaDelDia.value);

const turnoSeleccionado = computed(() => {
  if (turnoSeleccionadoIndex.value === null) return null;
  return turnosDelDia.value[turnoSeleccionadoIndex.value];
});

// Watchers
watch(turnoSeleccionado, (nuevoTurno) => {
  if (!nuevoTurno) return;

  // Actualizar los campos del editor
  horaInicio.value = nuevoTurno.inicio.toFormat("HH:mm");
  horaFinal.value = nuevoTurno.final.toFormat("HH:mm");

  // Buscar si corresponde a una plantilla
  const plantilla = props.plantillasTurno.find(
    (p) => p.inicio === horaInicio.value && p.final === horaFinal.value,
  );

  if (plantilla) {
    esHorarioPersonalizado.value = false;
    plantillaSeleccionada.value = plantilla;
  } else {
    esHorarioPersonalizado.value = true;
    plantillaSeleccionada.value = null;
  }

  // Actualizar tienda seleccionada
  tiendaSeleccionada.value = tiendas.value.find((t) => t.id === nuevoTurno.tiendaId) || null;
});

// Métodos públicos
async function abrirModal(
  trabajadorId: number,
  trabajadorName: string,
  dia: DateTime,
  tiendaDefecto: TTienda,
) {
  idTrabajador.value = trabajadorId;
  trabajadorNombre.value = trabajadorName;
  fechaDia.value = dia.startOf("day");
  tiendaSeleccionada.value = tiendaDefecto;

  modalEditarTurno.value = true;
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";

  await cargarTurnosDelDia();
}

function cerrarModal() {
  modalEditarTurno.value = false;
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
  resetearEstado();
}

// Manejar tecla ESC - Deshabilitado para evitar cierre accidental
// function handleEscape(event: KeyboardEvent) {
//   if (event.key === "Escape" && modalEditarTurno.value) {
//     cerrarModal();
//   }
// }

// Métodos privados
async function cargarTurnosDelDia() {
  if (!idTrabajador.value || !fechaDia.value) return;

  try {
    cargando.value = true;

    // Cargar turnos del trabajador para esa semana
    const inicioSemana = fechaDia.value.startOf("week");
    const turnosCargados = await Turno.getTurnosIndividuales(inicioSemana, idTrabajador.value);

    // Filtrar solo los turnos del día específico
    turnosDelDia.value = turnosCargados.filter((turno: TTurnoFrontend) => {
      return turno.inicio.hasSame(fechaDia.value!, "day");
    });

    // Cargar ausencias de la semana (opcional, no bloquea si falla)
    try {
      const finSemana = inicioSemana.plus({ days: 6 });
      const response = await axiosInstance.get("ausencias/getAusenciasTrabajador", {
        params: {
          idTrabajador: idTrabajador.value,
          fechaInicio: inicioSemana.toISO(),
          fechaFinal: finSemana.toISO(),
        },
      });

      // Convertir fechas a DateTime si vienen como strings
      ausencias.value = (response.data || []).map((ausencia: any) => ({
        ...ausencia,
        fechaInicio:
          typeof ausencia.fechaInicio === "string"
            ? DateTime.fromISO(ausencia.fechaInicio)
            : ausencia.fechaInicio,
        fechaFinal: ausencia.fechaFinal
          ? typeof ausencia.fechaFinal === "string"
            ? DateTime.fromISO(ausencia.fechaFinal)
            : ausencia.fechaFinal
          : null,
      }));
    } catch (error) {
      console.warn("No se pudieron cargar las ausencias, continuando sin ellas:", error);
      ausencias.value = [];
    }

    // Seleccionar el primer turno si existe
    if (turnosDelDia.value.length > 0) {
      seleccionarTurno(0);
    }
  } catch (error) {
    console.error("Error al cargar turnos:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los turnos del día",
    });
  } finally {
    cargando.value = false;
  }
}

function seleccionarTurno(index: number) {
  if (estaDiaEnPeriodoAusencia.value) return;
  turnoSeleccionadoIndex.value = index;
}

function agregarNuevoTurno() {
  if (!fechaDia.value || !tiendaSeleccionada.value || !idTrabajador.value) return;

  // Crear un nuevo turno temporal
  const nuevoTurno: TTurnoFrontend = {
    id: `tmp-${Date.now()}`,
    idTrabajador: idTrabajador.value,
    inicio: fechaDia.value.set({ hour: 9, minute: 0 }),
    final: fechaDia.value.set({ hour: 17, minute: 0 }),
    tiendaId: tiendaSeleccionada.value.id,
    borrable: true,
  };

  turnosDelDia.value.push(nuevoTurno);
  seleccionarTurno(turnosDelDia.value.length - 1);
}

function eliminarTurno(index: number) {
  Swal.fire({
    title: "¿Eliminar turno?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      turnosDelDia.value.splice(index, 1);

      if (turnoSeleccionadoIndex.value === index) {
        turnoSeleccionadoIndex.value = turnosDelDia.value.length > 0 ? 0 : null;
      } else if (turnoSeleccionadoIndex.value !== null && turnoSeleccionadoIndex.value > index) {
        turnoSeleccionadoIndex.value--;
      }
    }
  });
}

function cambiarModoHorario(personalizado: boolean) {
  esHorarioPersonalizado.value = personalizado;

  if (!personalizado && plantillasTurnoTextoCompuesto.value.length > 0) {
    plantillaSeleccionada.value = plantillasTurnoTextoCompuesto.value[0];
    aplicarPlantilla(plantillaSeleccionada.value);
  }
}

function aplicarPlantilla(plantilla: TPlantilla | null) {
  if (!plantilla || turnoSeleccionadoIndex.value === null) return;

  const turno = turnosDelDia.value[turnoSeleccionadoIndex.value];
  const [hIni, mIni] = plantilla.inicio.split(":").map(Number);
  const [hFin, mFin] = plantilla.final.split(":").map(Number);

  turno.inicio = turno.inicio.set({ hour: hIni, minute: mIni });

  // Si la hora final es menor que la inicial, es un turno nocturno
  let fechaFinal = turno.inicio.set({ hour: hFin, minute: mFin });
  if (hFin < hIni || (hFin === hIni && mFin < mIni)) {
    fechaFinal = fechaFinal.plus({ days: 1 });
  }

  turno.final = fechaFinal;

  horaInicio.value = plantilla.inicio;
  horaFinal.value = plantilla.final;
}

function actualizarHoraPersonalizada() {
  if (turnoSeleccionadoIndex.value === null) return;

  const turno = turnosDelDia.value[turnoSeleccionadoIndex.value];
  const [hIni, mIni] = horaInicio.value.split(":").map(Number);
  const [hFin, mFin] = horaFinal.value.split(":").map(Number);

  turno.inicio = turno.inicio.set({ hour: hIni, minute: mIni });

  let fechaFinal = turno.inicio.set({ hour: hFin, minute: mFin });
  if (hFin < hIni || (hFin === hIni && mFin < mIni)) {
    fechaFinal = fechaFinal.plus({ days: 1 });
  }

  turno.final = fechaFinal;
}

// function actualizarTienda(tienda: TTienda | null) {
//   if (!tienda || turnoSeleccionadoIndex.value === null) return;
//   turnosDelDia.value[turnoSeleccionadoIndex.value].tiendaId = tienda.id;
// }

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
  tiendaSeleccionada.value = tienda;

  // Actualizar el turno seleccionado
  if (turnoSeleccionadoIndex.value !== null) {
    turnosDelDia.value[turnoSeleccionadoIndex.value].tiendaId = tienda.id;
  }

  cerrarModalSeleccionTienda();
}

// Funciones del modal de selección de plantilla
function abrirModalSeleccionPlantilla() {
  modalSeleccionPlantilla.value = true;
  busquedaPlantilla.value = "";
  plantillasFiltradas.value = plantillasTurnoTextoCompuesto.value;

  // Focus en el input después de abrir el modal
  setTimeout(() => {
    inputBusquedaPlantillaModal.value?.focus();
  }, 100);
}

function cerrarModalSeleccionPlantilla() {
  modalSeleccionPlantilla.value = false;
  busquedaPlantilla.value = "";
}

function filtrarPlantillas() {
  const busqueda = busquedaPlantilla.value.toLowerCase().trim();

  if (!busqueda) {
    plantillasFiltradas.value = plantillasTurnoTextoCompuesto.value;
  } else {
    plantillasFiltradas.value = plantillasTurnoTextoCompuesto.value.filter((plantilla) =>
      plantilla.nombre.toLowerCase().includes(busqueda),
    );
  }
}

function seleccionarPlantillaModal(plantilla: TPlantilla) {
  plantillaSeleccionada.value = plantilla;
  aplicarPlantilla(plantilla);
  cerrarModalSeleccionPlantilla();
}

async function guardarCambios() {
  if (!idTrabajador.value || !fechaDia.value) return;

  try {
    guardando.value = true;

    // Validar que todos los turnos tengan datos válidos
    const turnosValidos = turnosDelDia.value.every((turno) => {
      const duracion = turno.final.diff(turno.inicio, "minutes").minutes;
      return duracion > 0 && turno.tiendaId;
    });

    if (!turnosValidos) {
      Swal.fire({
        icon: "warning",
        title: "Turnos inválidos",
        text: "Todos los turnos deben tener una duración válida y una tienda asignada",
      });
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      idTrabajador: idTrabajador.value,
      dia: fechaDia.value.toISODate(),
      turnos: turnosDelDia.value.map((turno) => ({
        id: turno.id,
        inicioISO: turno.inicio.toISO(),
        finalISO: turno.final.toISO(),
        tiendaId: turno.tiendaId,
        borrable: turno.borrable ?? true,
      })),
    };

    console.log("Guardando turnos individuales:", dataToSend);

    // Llamar al endpoint para guardar el turno individual
    const response = await axiosInstance.post("save-turno-trabajador-individual", dataToSend);

    if (response.data) {
      await Swal.fire({
        icon: "success",
        title: "Guardado",
        text: "Los turnos se han guardado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      emit("turno-guardado");
      cerrarModal();
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron guardar los turnos",
    });
  } finally {
    guardando.value = false;
  }
}

function formatearHora(fecha: DateTime) {
  return fecha.toFormat("HH:mm");
}

function calcularDuracion(turno: TTurnoFrontend) {
  const diff = turno.final.diff(turno.inicio, "minutes").minutes;
  const horas = Math.floor(diff / 60);
  const minutos = Math.round(diff % 60);
  return `${horas}h ${minutos}m`;
}

function getNombreTienda(idTienda: number | null) {
  if (!idTienda) return "Sin tienda";
  const tienda = tiendas.value.find((t) => t.id === idTienda);
  return tienda?.nombre || "¿?";
}

function resetearEstado() {
  idTrabajador.value = null;
  trabajadorNombre.value = "";
  fechaDia.value = null;
  turnosDelDia.value = [];
  turnoSeleccionadoIndex.value = null;
  ausencias.value = [];
  esHorarioPersonalizado.value = false;
  plantillaSeleccionada.value = null;
  tiendaSeleccionada.value = null;
  busquedaTienda.value = "";
  modalSeleccionTienda.value = false;
  tiendasFiltradas.value = tiendas.value;
  busquedaPlantilla.value = "";
  modalSeleccionPlantilla.value = false;
  plantillasFiltradas.value = plantillasTurnoTextoCompuesto.value;
  isMinimized.value = false;
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value;
}

// Exponer métodos para el componente padre
defineExpose({
  abrirModal,
  cerrarModal,
});

// Lifecycle hooks
onMounted(() => {
  // window.addEventListener("keydown", handleEscape); // Deshabilitado para evitar cierre accidental
  window.addEventListener("resize", handleResize);

  // Inicializar tiendas y plantillas filtradas
  tiendasFiltradas.value = tiendas.value;
  plantillasFiltradas.value = plantillasTurnoTextoCompuesto.value;
});

onUnmounted(() => {
  // window.removeEventListener("keydown", handleEscape); // Deshabilitado para evitar cierre accidental
  window.removeEventListener("resize", handleResize);

  // Asegurar que se limpie el body al desmontar
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
});

// Listener para resize
function handleResize() {
  isMobile.value = window.innerWidth < 768;
}
</script>

<style scoped lang="scss">
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

// Estilos del modal
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;

  &.backdrop-minimized {
    opacity: 0.1 !important;
    pointer-events: none;
  }
}

.modal-dialog {
  margin: 1.75rem auto;
  max-width: 800px;
}

.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .modal-title {
    font-weight: 600;
    font-size: 1.25rem;
    margin: 0;
    display: flex;
    align-items: center;

    .minimized-hint {
      font-size: 0.85rem;
      font-weight: 400;
      opacity: 0.9;
      animation: pulse 2s ease-in-out infinite;

      i {
        font-size: 0.75rem;
        margin-right: 0.25rem;
      }
    }
  }

  .header-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-minimize {
    background: transparent;
    border: none;
    color: white;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    opacity: 0.9;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      opacity: 1;
    }

    &:active {
      transform: scale(0.95);
    }

    i {
      pointer-events: none;
    }
  }
}

// Estilos para modal minimizado
.modal-content.modal-minimized {
  width: auto;
  min-width: 500px;
  max-width: 800px;

  .modal-header {
    border-radius: 12px;
    cursor: pointer;
    border-bottom: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover {
      background: linear-gradient(90deg, darken(#e66c5a, 5%) 0%, darken(#333, 5%) 100%);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
  }
}

// Posicionamiento del modal cuando está minimizado
.modal-dialog:has(.modal-minimized) {
  margin: 1.75rem auto;
  transition: all 0.3s ease;
}

// En móvil, asegurar que el modal minimizado no sea demasiado ancho
@media (max-width: 767px) {
  .modal-content.modal-minimized {
    min-width: auto;
    width: 100%;
  }
}

.modal-body-turno {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  flex-wrap: wrap;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn-guardar-principal {
  font-weight: 600;
  white-space: nowrap;
}

// Móviles (< 768px)
@media (max-width: 767px) {
  .modal-footer-custom {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;

    .btn {
      width: 100%;
      justify-content: center;
    }

    .btn-guardar-principal {
      order: -1; // Guardar primero en móvil
      font-size: 1rem;
      padding: 0.75rem;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.info-card {
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: white;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.empty-turnos {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
}

.turno-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background-color: #f8f9fa;
  }

  &.turno-seleccionado {
    border-color: #667eea;
    background-color: #e7e9fc;
  }
}

.turno-content {
  flex: 1;
}

.turno-horario {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.turno-duracion {
  font-size: 0.85rem;
  color: #6c757d;
}

.turno-tienda {
  font-size: 0.9rem;
  color: #495057;
}

.turno-actions {
  display: flex;
  gap: 0.5rem;
}

.editor-turno {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #dee2e6;

  h6 {
    color: #495057;
    margin-bottom: 1rem;
  }
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-label-small {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

// Modal de selección de tienda
.modal-seleccion-tienda {
  max-width: 500px;
  margin: 0 auto;

  .modal-header {
    background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
    color: white;
    border-radius: 12px 12px 0 0;

    .modal-title {
      font-weight: 600;
      font-size: 1.1rem;
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

    .input-group-text {
      border-right: 0;
    }

    .form-control {
      border-left: 0;

      &:focus {
        border-color: #ced4da;
        box-shadow: none;
      }
    }
  }

  .tiendas-list {
    max-height: 400px;
    overflow-y: auto;

    /* Scrollbar personalizado */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 4px;

      &:hover {
        background: #a0aec0;
      }
    }
  }

  .tienda-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid #f1f1f1;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f8f9fa;
    }

    &.selected {
      background-color: #e7f5ff;
      border-left: 4px solid #667eea;
    }

    .tienda-item-content {
      display: flex;
      align-items: center;
      flex: 1;

      .tienda-nombre {
        font-size: 0.95rem;
        color: #2d3748;
      }
    }

    i.fa-check-circle {
      font-size: 1.2rem;
    }
  }
}

@media (max-width: 767px) {
  .modal-body-turno {
    padding: 1rem;
  }

  .info-card {
    padding: 0.75rem;
  }

  .turno-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .turno-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .editor-turno {
    padding: 1rem;
  }
}

// Estilos corporativos
$primary-color: #e66c5a;
$secondary-color: #333;

// Botones corporativos principales (relleno)
:deep(.btn-corporate) {
  background-color: $primary-color !important;
  border-color: $primary-color !important;
  color: white !important;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 8%) !important;
    border-color: darken($primary-color, 8%) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// Botones corporativos outline
:deep(.btn-corporate-outline) {
  background-color: white !important;
  border-color: $primary-color !important;
  color: $primary-color !important;
  transition: all 0.3s ease;

  &:hover {
    background-color: $primary-color !important;
    border-color: $primary-color !important;
    color: white !important;
  }
}

// Botón selector de tienda
.btn-tienda-selector {
  border: 1px solid $primary-color;
  color: $primary-color;
  background-color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba($primary-color, 0.05);
    border-color: darken($primary-color, 8%);
    color: darken($primary-color, 8%);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
    border-color: $primary-color;
  }
}

// Botón guardar principal
.btn-guardar-principal {
  font-weight: 600;
  padding: 0.5rem 1.5rem;
}

// Animación pulse para el hint de minimizado
@keyframes pulse {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 0.6;
  }
}

// Botón selector de plantilla
.btn-plantilla-selector {
  border: 1px solid $primary-color;
  color: $primary-color;
  background-color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba($primary-color, 0.05);
    border-color: darken($primary-color, 8%);
    color: darken($primary-color, 8%);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
    border-color: $primary-color;
  }
}

// Modal de selección de plantilla (estilos similares al de tienda)
.modal-seleccion-plantilla {
  max-width: 500px;
  margin: 0 auto;

  .modal-header {
    background: linear-gradient(90deg, $primary-color 0%, $secondary-color 100%);
    color: white;
    border-radius: 12px 12px 0 0;

    .modal-title {
      font-weight: 600;
      font-size: 1.1rem;
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

    .input-group-text {
      border-right: 0;
    }

    .form-control {
      border-left: 0;

      &:focus {
        border-color: #ced4da;
        box-shadow: none;
      }
    }
  }

  .plantillas-list {
    max-height: 400px;
    overflow-y: auto;

    /* Scrollbar personalizado */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 4px;

      &:hover {
        background: #a0aec0;
      }
    }
  }

  .plantilla-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid #f1f1f1;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f8f9fa;
    }

    &.selected {
      background-color: #e7f5ff;
      border-left: 4px solid #667eea;
    }

    .plantilla-item-content {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 0.5rem;

      > div {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .plantilla-nombre {
        font-size: 0.95rem;
        color: #2d3748;
        font-weight: 600;
      }

      .plantilla-horario {
        font-size: 0.8rem;
        color: #718096;
      }
    }

    i.fa-check-circle {
      font-size: 1.2rem;
    }
  }
}
</style>
