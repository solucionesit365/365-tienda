<template>
  <BsModal
    id="modalCrearCuadrante"
    tabindex="-1"
    labelledby="modalLabel"
    v-model="modalCrearCuadrante"
    :fullscreen="true"
  >
    <div class="modal-cuadrante-tablet">
      <div class="cuadrante-container">
        <!-- Sidebar izquierdo con información y controles -->
        <aside class="sidebar-info">
          <div class="sidebar-header">
            <h5 class="titulo">Cuadrante Semanal</h5>
            <br />
            <h6>{{ props.selectedTienda?.nombre }}</h6>
            <div class="semana-info">
              Semana {{ props.selectedDate.weekNumber }} - {{ props.selectedDate.year }}
            </div>
          </div>

          <div class="selector-trabajador">
            <label class="selector-label">Trabajador</label>
            <select class="form-select" v-model="trabajadorSelected">
              <option :value="null" disabled>Selecciona un trabajador</option>
              <option
                v-for="(item, index) in equipoCoordinadora"
                v-bind:key="index"
                :value="item.value"
              >
                {{ item.text }}
              </option>
            </select>
          </div>

          <div class="resumen-horas">
            <div class="horas-card">
              <div class="horas-titulo">Total Horas</div>
              <div class="horas-valor">{{ totalHoras.toFixed(2) }}</div>
            </div>
            <div class="horas-desglose" v-if="trabajadorSelected">
              <div class="desglose-item" v-for="(horas, dia) in horasPorDia" :key="dia">
                <span class="dia-nombre">{{ dia }}</span>
                <span class="dia-horas">{{ horas.toFixed(1) }}h</span>
              </div>
            </div>
          </div>

          <div class="acciones-sidebar">
            <BsButton color="warning" class="w-100 mb-2" @click="administrarPlantillasTurno()">
              <i class="bi bi-plus-circle me-2"></i>
              Administrar plantillas
            </BsButton>
            <BsButton
              color="primary"
              class="w-100 mb-2"
              :disabled="!trabajadorSelected || !turnoSeleccionado"
              @click="añadirDobleTurno"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Añadir doble Turno
            </BsButton>

            <BsButton
              color="success"
              class="w-100 mb-2"
              :disabled="guardando || !trabajadorSelected"
              @click="guardarFinal()"
            >
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-check-circle me-2"></i>
              Guardar cambios
            </BsButton>

            <BsButton
              v-if="turnoSeleccionado && esTurnoBorrable(turnoSeleccionado)"
              color="danger"
              class="w-100 mb-2"
              @click="eliminarTurnoSeleccionado"
            >
              <i class="bi bi-trash me-2"></i>
              Eliminar Turno
            </BsButton>

            <BsButton color="secondary" class="w-100" @click="modalCrearCuadrante = false">
              <i class="bi bi-x-circle me-2"></i>
              Cancelar
            </BsButton>
          </div>
        </aside>

        <!-- Área principal con la tabla -->
        <main class="main-content">
          <div v-if="!cargando" class="tabla-wrapper">
            <!-- Vista de tabla cuando hay trabajador seleccionado -->
            <div v-if="trabajadorSelected" class="tabla-cuadrante">
              <div class="tabla-header">
                <div class="col">Día</div>
                <div class="col">Horario</div>
                <div class="col">Nuevo</div>
                <div class="col">Tienda</div>
                <div class="col">Horas</div>
              </div>

              <div class="tabla-body">
                <div
                  v-for="(turno, index) in arrayCuadrantesOrdenados"
                  :key="index"
                  class="tabla-row"
                  :class="{
                    'row-seleccionada': turnoSeleccionado && turnoSeleccionado.id === turno.id,
                  }"
                  @click="seleccionarTurno(turno)"
                  @dblclick="setTurnoModal(turno, index)"
                >
                  <div class="col">
                    <div class="dia-info">
                      <span class="dia-nombre">{{ formatearDia(turno.inicio) }}</span>
                      <span class="dia-fecha">{{ formatearFecha(turno.inicio) }}</span>
                    </div>
                  </div>

                  <div class="col">
                    <div class="horario-wrapper">
                      <BsSelect :options="plantillasTurno" text-key="nombre" value-key="id" />
                      <input
                        type="time"
                        class="time-input"
                        :value="formatearHora(turno.inicio)"
                        @change="actualizarHora(turno, 'inicio', $event)"
                        :disabled="turno.id === 'CAMBIAR ESTO POR EL DISABLED CORRESPONDIENTE'"
                      />
                      <span class="horario-separador">-</span>
                      <input
                        type="time"
                        class="time-input"
                        :value="formatearHora(turno.final)"
                        @change="actualizarHora(turno, 'final', $event)"
                        :disabled="turno.id === 'CAMBIAR ESTO POR EL DISABLED CORRESPONDIENTE'"
                      />
                    </div>
                    <div
                      v-if="turno.id === 'CAMBIAR ESTO POR EL DISABLED CORRESPONDIENTE'"
                      class="ausencia-badge"
                    >
                      <!-- {{ turno.ausencia.tipo }} -->
                      Aquí el tipo de ausencia
                    </div>
                  </div>

                  <div class="col">
                    <!-- <BsCheckBox v-model="false" /> -->
                  </div>

                  <div class="col">
                    <select
                      :value="turno.tiendaId"
                      @change="
                        actualizarTiendaTurno(
                          turno,
                          parseInt(($event.target as HTMLSelectElement).value),
                        )
                      "
                      class="form-select tienda-select-native"
                    >
                      <option value="">Seleccionar tienda</option>
                      <option v-for="tienda in arrayTiendas" :key="tienda.id" :value="tienda.id">
                        {{ tienda.nombre }}
                      </option>
                    </select>
                  </div>

                  <div class="col">
                    <span class="horas-turno"> {{ calcularHorasTurno(turno) }}h </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensaje cuando no hay trabajador seleccionado -->
            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-person-badge"></i>
              </div>
              <h4>Selecciona un trabajador</h4>
              <p>
                Para comenzar a configurar el cuadrante semanal, selecciona un trabajador del menú
                lateral
              </p>
            </div>
          </div>

          <!-- Loader -->
          <div v-else class="loader-wrapper">
            <LoaderComponent />
          </div>
        </main>
      </div>
    </div>
  </BsModal>

  <PlantillasTurnoModal
    ref="plantillasModal"
    :idTienda="props.selectedTienda?.id!"
    @plantillas-updated="getPlantillasTurno(props.selectedTienda!.id)"
  />

  <BsModal class="dark" id="modalSetTurno" tabindex="-2" v-model="modalSetTurno">
    <BsModalHeader>Establecer turno</BsModalHeader>
    <!-- Header -->
    <template #header>
      <h5 class="modal-title">Configurar Turno</h5>
      <button type="button" class="btn-close" @click="modalSetTurno = false" />
    </template>

    <!-- Body -->
    <div class="modal-body">
      <!-- Switch para turno personalizado -->
      <div class="form-check form-switch mb-3">
        <input
          class="form-check-input"
          type="checkbox"
          id="switchCustomTurno"
          v-model="customTurno"
        />
        <label class="form-check-label" for="switchCustomTurno"> Turno personalizado </label>
      </div>

      <!-- Selección de plantilla -->
      <div v-if="!customTurno" class="mb-3">
        <label class="form-label">Plantilla de Turno</label>
        <BsSelect
          :options="plantillasTurno"
          text-key="nombre"
          value-key="id"
          v-model="selectedPlantillaId"
        />
      </div>

      <!-- Inputs de hora para turno personalizado -->
      <div v-else class="d-flex gap-3">
        <div class="flex-fill">
          <label class="form-label">Hora Inicio</label>
          <input type="time" class="time-input" v-model="localInicio" />
        </div>
        <div class="flex-fill">
          <label class="form-label">Hora Fin</label>
          <input type="time" class="time-input" v-model="localFinal" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <BsButton color="secondary" @click="modalSetTurno = false"> Cancelar </BsButton>
      <BsButton
        color="primary"
        :disabled="
          (!customTurno && !selectedPlantillaId) || (customTurno && (!localInicio || !localFinal))
        "
        @click="applyTurno"
      >
        Guardar
      </BsButton>
    </template>
  </BsModal>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, inject, type Ref } from "vue";
import Swal from "sweetalert2";
import { DateTime } from "luxon";
import { axiosInstance } from "@/components/axios/axios";

// Componentes
import BsModal from "@/components/365/BsModal.vue";
import BsButton from "@/components/365/BsButton.vue";
import LoaderComponent from "@/components/LoaderCuadrantes.vue";

// Stores e interfaces
import { useUserStore } from "@/stores/user";
import type { TCuadranteFrontend } from "@/interfaces/Cuadrante.interface";
import type { TTrabajador } from "@/interfaces/Trabajador.interface";
import { useTiendaStore } from "@/stores/tienda";
import type { TTienda } from "@/interfaces/Tienda.interface";
import PlantillasTurnoModal from "@/components/ModalPlantillasTurno.vue";
import { Turno } from "./kernel/Turno";
import type { TTurnoFrontend } from "@/interfaces/Turno.interface";
import BsSelect from "./365/BsSelect.vue";
import BsModalHeader from "./365/BsModalHeader.vue";

const props = defineProps<{
  selectedDate: DateTime;
  selectedTienda: TTienda | null;
}>();
const customTurno = ref(false);
const selectedPlantillaId = ref<string | null>(null);
const localInicio = ref<string>("");
const localFinal = ref<string>("");
const userStore = useUserStore();
const tiendaStore = useTiendaStore();
const plantillasModal = ref<InstanceType<typeof PlantillasTurnoModal> | null>(null);
const arrayTiendas = computed(() => tiendaStore.tiendas);
const trabajadorSelected = ref(null);
const inicioSemana: Ref<DateTime | null> = ref(null);
const modalCrearCuadrante = ref(false);
const modalSetTurno = ref(false);
const guardando = ref(false);
const equipoCoordinadora: Ref<{ text: string; value: number }[]> = ref([]);
const currentUser = computed(() => userStore.user);
const arrayCuadrantes: Ref<TTurnoFrontend[]> = ref([]);
const cargando = ref(false);
const turnoSeleccionado: Ref<any> = ref(null);
const plantillasTurno = ref<{ id: string; nombre: string }[]>([]);
const reloadCuadrante = inject<() => TCuadranteFrontend[]>("reloadCuadrante");

// Computed
const totalHoras = computed(() => {
  let total = 0;
  for (let i = 0; i < arrayCuadrantes.value.length; i += 1) {
    total += arrayCuadrantes.value[i].final.diff(arrayCuadrantes.value[i].inicio, "hours").hours;
  }
  return total;
});

const arrayCuadrantesOrdenados = computed(() => {
  return [...arrayCuadrantes.value].sort((a, b) => {
    return a.inicio.toMillis() - b.inicio.toMillis();
  });
});

const horasPorDia = computed(() => {
  const horas: Record<string, number> = {};
  arrayCuadrantes.value.forEach((turno) => {
    if (turno.borrable) {
      const dia = turno.inicio.toFormat("EEE", { locale: "es" });
      const hrs = turno.final.diff(turno.inicio, "hours").hours;
      horas[dia] = (horas[dia] || 0) + hrs;
    }
  });
  return horas;
});

// Funciones de formato
function formatearDia(fecha: DateTime) {
  return (
    fecha.toFormat("EEEE", { locale: "es" }).charAt(0).toUpperCase() +
    fecha.toFormat("EEEE", { locale: "es" }).slice(1)
  );
}

function formatearFecha(fecha: DateTime) {
  return fecha.toFormat("dd/MM");
}

function formatearHora(fecha: DateTime) {
  return fecha.toFormat("HH:mm");
}

function calcularHorasTurno(turno: any) {
  if (turno.ausencia) return 0;
  return turno.final.diff(turno.inicio, "hours").hours.toFixed(1);
}

// Funciones de actualización
function actualizarHora(turno: any, tipo: "inicio" | "final", event: Event) {
  const input = event.target as HTMLInputElement;
  const [horas, minutos] = input.value.split(":").map(Number);

  const nuevaFecha = turno[tipo].set({ hour: horas, minute: minutos });
  turno[tipo] = nuevaFecha;

  updateTurno(turno);
}

function seleccionarTurno(turno: any) {
  turnoSeleccionado.value = turno;
}

function esTurnoBorrable(turno: any): boolean {
  return turno && turno.borrable === true;
}

function añadirDobleTurno() {
  if (!turnoSeleccionado.value || !inicioSemana.value) return;

  const diaSeleccionado = turnoSeleccionado.value.inicio.startOf("day");

  // Buscar si ya existe un segundo turno ese día
  const turnosDelDia = arrayCuadrantes.value.filter(
    (t) => t.inicio.startOf("day").toMillis() === diaSeleccionado.toMillis(),
  );

  if (turnosDelDia.length >= 2) {
    Swal.fire({
      icon: "warning",
      title: "Máximo alcanzado",
      text: "Ya existen 2 turnos para este día.",
    });
    return;
  }

  // Crear nuevo turno en el mismo día
  const horaInicio = turnosDelDia.length === 1 ? 16 : 9; // Si ya hay un turno, empezar a las 16:00

  handleAddCuadrante({
    dia: diaSeleccionado.set({ hour: horaInicio, minute: 0 }),
    idTienda: userStore.getIdTienda,
    ausencia: null,
  });
}

function actualizarTiendaTurno(turno: any, nuevaIdTienda: number) {
  const index = buscarIndexFromTurno(turno.id);
  if (index !== -1) {
    arrayCuadrantes.value[index].tiendaId = nuevaIdTienda;
    arrayCuadrantes.value = [...arrayCuadrantes.value];
  }
}

async function eliminarTurnoSeleccionado() {
  if (!turnoSeleccionado.value) return;

  const confirmResult = await Swal.fire({
    title: "¿Eliminar turno?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (confirmResult.isConfirmed) {
    await borrarTurno({ idTurno: turnoSeleccionado.value.id });
    turnoSeleccionado.value = null;
  }
}

// Funciones existentes
async function abrirModal(fechaBetween: DateTime) {
  if (!fechaBetween) {
    Swal.fire("Oops...", "Datos iniciales incorrectos", "error");
    return;
  }

  inicioSemana.value = fechaBetween.startOf("week");

  await iniciarDatos(inicioSemana.value);
  modalCrearCuadrante.value = true;
}

// Se ejecuta al cambiar el trabajadorSelected
async function iniciarDatos(fecha: DateTime) {
  try {
    cargando.value = true;

    // 1) Traigo los turnos reales (puede venir [] si no hay datos)
    const turnosTrabajador: TTurnoFrontend[] = trabajadorSelected.value
      ? await Turno.getTurnosIndividuales(fecha, trabajadorSelected.value)
      : [];

    // 2) Calculo los 7 días de lunes a domingo
    const inicioSemana = fecha.startOf("week");
    const diasSemana = Array.from({ length: 7 }, (_, i) => inicioSemana.plus({ days: i }));

    // 3) Mapeo los turnos reales por día (key = milis del inicio de día)
    const mapaTurnos = new Map<number, TTurnoFrontend>(
      turnosTrabajador.map((t) => [t.inicio.startOf("day").toMillis(), t]),
    );

    // 4) Construyo arrayCuadrantes: turnos reales o placeholders
    arrayCuadrantes.value = diasSemana.map((dia) => {
      const key = dia.startOf("day").toMillis();
      const real = mapaTurnos.get(key);
      if (real) return real;

      // placeholder para días sin turno
      return {
        id: `placeholder-${key}`,
        inicio: dia,
        final: dia, // mismo día sin horas
        tiendaId: null,
        borrable: false, // así los distinguirás
      } as TTurnoFrontend;
    });

    turnoSeleccionado.value = null;
  } catch (err) {
    console.error(err);
    Swal.fire("Oops...", "Ha habido un error cargando los turnos", "error");
  } finally {
    cargando.value = false;
  }

  // cargar plantillas tras montar el array
  if (props.selectedTienda) {
    await getPlantillasTurno(props.selectedTienda.id);
  }
}

async function guardarFinal() {
  try {
    guardando.value = true;
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || currentUser.value.uid;

    const sendRequestCuadrantes = arrayCuadrantes.value.map((turno) => {
      return {
        horaEntrada: turno.inicio.toISO(),
        horaSalida: turno.final.toISO(),
        idTienda: turno.tiendaId,
        idTurno: turno.id,
        borrable: turno.borrable,
      };
    });

    if (!inicioSemana.value) throw Error("No se ha podido obtener la fecha de inicio de semana");

    const resGuardar = await axiosInstance.post("cuadrantes/saveCuadrante", {
      idTrabajador: trabajadorSelected.value,
      arraySemanalHoras: sendRequestCuadrantes,
      totalHoras: totalHoras.value,
      idTiendaDefault: userStore.getIdTienda,
      fecha: inicioSemana.value.toISO(),
      uid: uidParaConsultar,
      semana: props.selectedDate.weekNumber,
      year: props.selectedDate.year,
    });

    if (resGuardar.data.ok) {
      if (!reloadCuadrante) throw new Error("No se encontró la inyección 'reloadCuadrante'");

      reloadCuadrante();
      modalCrearCuadrante.value = false;

      Swal.fire({
        icon: "success",
        title: "Perfecto",
        text: "Turnos guardados correctamente",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } else throw Error();
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "No se han podido guardar los turnos", "error");
  } finally {
    guardando.value = false;
  }
}

async function getPlantillasTurno(idTienda: number) {
  try {
    const resPlantillas = await axiosInstance.get("plantilla-turno", {
      params: { idTienda },
    });

    plantillasTurno.value = resPlantillas.data.map((plantilla: any) => {
      return {
        id: plantilla.id,
        nombre: plantilla.nombre,
      };
    });

    console.log("Plantillas de turno cargadas:", plantillasTurno.value);
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error al cargar las plantillas", "error");
  }
}

// Necesitamos cargar la lista del equipo en el select
async function getEquipoCoordinadoraDeLaTienda() {
  try {
    equipoCoordinadora.value = [];

    if (!props.selectedTienda || !props.selectedTienda.id) throw new Error();

    const resEquipo = await axiosInstance.get("get-equipo-coordinadora-por-tienda", {
      params: { idTienda: props.selectedTienda.id },
    });

    equipoCoordinadora.value = resEquipo.data.map((trabajador: TTrabajador) => {
      return {
        text: trabajador.nombreApellidos,
        value: trabajador.id,
      };
    });

    if (
      currentUser.value.llevaEquipo &&
      currentUser.value.idTienda &&
      !equipoCoordinadora.value.some((t) => t.value === currentUser.value.idSql)
    ) {
      if (currentUser.value.displayName && currentUser.value.idSql)
        equipoCoordinadora.value.push({
          text: currentUser.value.displayName,
          value: currentUser.value.idSql,
        });
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

function updateTurno(updatedTurno: any) {
  const index = buscarIndexFromTurno(updatedTurno.id);
  arrayCuadrantes.value[index] = updatedTurno;
  arrayCuadrantes.value = [...arrayCuadrantes.value];
}

async function handleAddCuadrante({ dia, idTienda, ausencia }: any) {
  const nuevoCuadrante: any = {
    id: (await axiosInstance.get("cuadrantes/getNewId")).data,
    inicio: dia,
    final: dia.plus({ minute: 1 }),
    idTienda,
    ausencia,
    borrable: true,
  };

  const posicionInsertar = arrayCuadrantes.value.findIndex(
    (cuadrante) => cuadrante.inicio > nuevoCuadrante.inicio,
  );

  if (posicionInsertar === -1) {
    arrayCuadrantes.value.push(nuevoCuadrante);
  } else {
    arrayCuadrantes.value.splice(posicionInsertar, 0, nuevoCuadrante);
  }
}

function buscarIndexFromTurno(idTurno: string) {
  return arrayCuadrantes.value.findIndex((element) => element.id === idTurno);
}

async function borrarTurno({ idTurno }: { idTurno: string }) {
  const index = buscarIndexFromTurno(idTurno);

  if (arrayCuadrantes.value[index]?.borrable) {
    const resBorrado = await axiosInstance.post("cuadrantes/borrarTurno", {
      idTurno: arrayCuadrantes.value[index].id,
    });

    if (resBorrado.data.ok) {
      arrayCuadrantes.value.splice(index, 1);
      Swal.fire("Borrado", "El turno ha sido borrado.", "success");
    } else Swal.fire("Oops...", "No se ha podido borrar este turno", "error");
  } else {
    arrayCuadrantes.value[index].id = null;
    arrayCuadrantes.value[index].inicio = arrayCuadrantes.value[index].inicio.startOf("day");
    arrayCuadrantes.value[index].final = arrayCuadrantes.value[index].inicio.startOf("day");
    arrayCuadrantes.value[index].tiendaId = null;
  }
}

function administrarPlantillasTurno() {
  plantillasModal.value?.abrirModal();
}

function setTurnoModal(turno: TTurnoFrontend, index: number) {
  console.log(index);
  turnoSeleccionado.value = turno;
  // Inicializar el modal:
  customTurno.value = false;
  selectedPlantillaId.value = null;
  localInicio.value = formatearHora(turno.inicio);
  localFinal.value = formatearHora(turno.final);
  modalSetTurno.value = true;
}
function applyTurno() {
  if (!turnoSeleccionado.value) return;

  if (customTurno.value) {
    // Parsear y aplicar horas personalizadas
    const [hI, mI] = localInicio.value.split(":").map(Number);
    const [hF, mF] = localFinal.value.split(":").map(Number);
    turnoSeleccionado.value.inicio = turnoSeleccionado.value.inicio.set({ hour: hI, minute: mI });
    turnoSeleccionado.value.final = turnoSeleccionado.value.inicio.set({ hour: hF, minute: mF });
  } else {
    // Aplicar plantilla elegida (aquí asumo que las plantillas traen horas)
    const plantilla = plantillasTurno.value.find((p) => p.id === selectedPlantillaId.value);
    if (plantilla && (plantilla as any).horaInicio && (plantilla as any).horaFin) {
      const { horaInicio, horaFin } = plantilla as any;
      turnoSeleccionado.value.inicio = turnoSeleccionado.value.inicio.set(horaInicio);
      turnoSeleccionado.value.final = turnoSeleccionado.value.inicio.set(horaFin);
    }
  }

  // Actualizar y cerrar modal
  updateTurno(turnoSeleccionado.value);
  modalSetTurno.value = false;
}

watch(trabajadorSelected, () => {
  if (inicioSemana.value) {
    iniciarDatos(inicioSemana.value);
    turnoSeleccionado.value = null;
  }
});

defineExpose({
  abrirModal,
});

onMounted(async () => {
  await getEquipoCoordinadoraDeLaTienda();
});
</script>

<style scoped>
/* Wrapper para aplicar estilos al modal */
.modal-cuadrante-tablet {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Contenedor principal */
.cuadrante-container {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

/* Sidebar */
.sidebar-info {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e0e0e0;
}

.titulo {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.semana-info {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.selector-trabajador {
  padding: 1.25rem;
  border-bottom: 1px solid #e0e0e0;
}

.selector-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.selector-trabajador .form-select {
  font-size: 0.95rem;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
}

/* Resumen de horas */
.resumen-horas {
  padding: 1.25rem;
  flex: 1;
}

.horas-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 1rem;
}

.horas-titulo {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.horas-valor {
  font-size: 2rem;
  font-weight: 700;
}

.horas-desglose {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
}

.desglose-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  border-bottom: 1px solid #e9ecef;
}

.desglose-item:last-child {
  border-bottom: none;
}

.dia-nombre {
  font-weight: 500;
  color: #495057;
}

.dia-horas {
  color: #6c757d;
}

/* Acciones sidebar */
.acciones-sidebar {
  padding: 1.25rem;
  border-top: 1px solid #e0e0e0;
}

/* Área principal */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabla-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Tabla personalizada */
.tabla-cuadrante {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabla-header {
  display: flex;
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  padding: 0;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #495057;
}

.tabla-header > div {
  padding: 1rem;
  display: flex;
  align-items: center;
}

.tabla-body {
  flex: 1;
  overflow-y: auto;
}

.tabla-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.tabla-row:hover {
  background: #f8f9fa;
}

.tabla-row.row-ausencia {
  background: #fff3cd;
}

.tabla-row.row-seleccionada {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.tabla-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.tabla-row:hover {
  background: #f8f9fa;
}

.tabla-row > div {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
}

/* Columnas */
.col-dia {
  width: 20%;
}

.col-horario {
  width: 35%;
}

.col-personalizado {
  width: 12%;
}

.col-tienda {
  width: 20%;
}

.col-horas {
  width: 15%;
  justify-content: center;
}

/* Elementos de la tabla */
.dia-info {
  display: flex;
  flex-direction: column;
}

.dia-nombre {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.dia-fecha {
  font-size: 0.8rem;
  color: #6c757d;
}

.horario-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.time-input {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  width: 80px;
}

.time-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.horario-separador {
  color: #6c757d;
}

.ausencia-badge {
  background: #ffc107;
  color: #856404;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.tienda-select {
  width: 100%;

  :deep(.form-control) {
    font-size: 0.85rem;
    padding: 0.375rem 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
  }
}

.tienda-select-native {
  width: 100%;
  font-size: 0.85rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    outline: none;
  }
}

.horas-turno {
  font-weight: 500;
  color: #495057;
}

/* Selecciones mejoradas */
.tabla-row.row-seleccionada:hover {
  background: #e1f5fe;
}

/* Estado vacío */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  text-align: center;
  max-width: 400px;
}

/* Loader */
.loader-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollbar personalizado */
.tabla-body::-webkit-scrollbar,
.sidebar-info::-webkit-scrollbar {
  width: 6px;
}

.tabla-body::-webkit-scrollbar-track,
.sidebar-info::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tabla-body::-webkit-scrollbar-thumb,
.sidebar-info::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tabla-body::-webkit-scrollbar-thumb:hover,
.sidebar-info::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive para tablets más pequeñas */
@media (max-width: 1024px) {
  .sidebar-info {
    width: 240px;
  }

  .col-dia {
    width: 18%;
  }

  .col-personalizado {
    width: 12%;
  }

  .col-tienda {
    width: 20%;
  }

  .col-horario {
    width: 35%;
  }

  .col-horas {
    width: 15%;
  }
}

.row-placeholder {
  background: #f8f9fa;
  opacity: 0.7;
}
</style>
