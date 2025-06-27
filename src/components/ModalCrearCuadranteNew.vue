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
            <div class="semana-info">Semana {{ semanaActual }} - {{ yearActual }}</div>
          </div>

          <div class="selector-trabajador">
            <label class="selector-label">Trabajador</label>
            <select class="form-select" v-model="trabajadorSelected">
              <option :value="null" disabled>Selecciona un trabajador</option>
              <option v-for="(item, index) in trabajadores" v-bind:key="index" :value="item.value">
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
            <BsButton
              color="primary"
              class="w-100 mb-2"
              :disabled="!trabajadorSelected || !turnoSeleccionado"
              @click="añadirDobleTurno"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Añadir Doble Turno
            </BsButton>

            <BsButton
              color="success"
              class="w-100 mb-2"
              :disabled="guardando || !trabajadorSelected"
              @click="guardarFinal()"
            >
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-check-circle me-2"></i>
              Guardar Cambios
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
                <div class="col-dia">Día</div>
                <div class="col-horario">Horario</div>
                <div class="col-tienda">Tienda</div>
                <div class="col-horas">Horas</div>
              </div>

              <div class="tabla-body">
                <div
                  v-for="turno in arrayCuadrantesOrdenados"
                  :key="turno._id"
                  class="tabla-row"
                  :class="{
                    'row-ausencia': turno.ausencia,
                    'row-seleccionada': turnoSeleccionado && turnoSeleccionado._id === turno._id,
                  }"
                  @click="seleccionarTurno(turno)"
                >
                  <div class="col-dia">
                    <div class="dia-info">
                      <span class="dia-nombre">{{ formatearDia(turno.inicio) }}</span>
                      <span class="dia-fecha">{{ formatearFecha(turno.inicio) }}</span>
                    </div>
                  </div>

                  <div class="col-horario">
                    <div class="horario-wrapper">
                      <input
                        type="time"
                        class="time-input"
                        :value="formatearHora(turno.inicio)"
                        @change="actualizarHora(turno, 'inicio', $event)"
                        :disabled="turno.ausencia"
                      />
                      <span class="horario-separador">-</span>
                      <input
                        type="time"
                        class="time-input"
                        :value="formatearHora(turno.final)"
                        @change="actualizarHora(turno, 'final', $event)"
                        :disabled="turno.ausencia"
                      />
                    </div>
                    <div v-if="turno.ausencia" class="ausencia-badge">
                      {{ turno.ausencia.tipo }}
                    </div>
                  </div>

                  <div class="col-tienda">
                    <select
                      :value="turno.idTienda"
                      @change="
                        actualizarTiendaTurno(
                          turno,
                          parseInt(($event.target as HTMLSelectElement).value),
                        )
                      "
                      class="form-select tienda-select-native"
                    >
                      <option value="">Seleccionar tienda</option>
                      <option
                        v-for="tienda in arrayTiendasFormateado"
                        :key="tienda.value"
                        :value="tienda.value"
                      >
                        {{ tienda.text }}
                      </option>
                    </select>
                  </div>

                  <div class="col-horas">
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
import type { TCuadranteFrontend, TCuadranteBackend } from "@/interfaces/Cuadrante.interface";
import type { TTrabajador } from "@/interfaces/Trabajador.interface";

// Estado
const userStore = useUserStore();
const arrayTiendas: Ref<any[]> = ref([]);
const arrayTiendasFormateado: Ref<any[]> = ref([]);
const idTiendaDefault = ref(0);
const trabajadorSelected = ref(null);
const inicioSemana: Ref<DateTime | null> = ref(null);
const modalCrearCuadrante = ref(false);
const semanaActual = DateTime.now().weekNumber;
const yearActual = DateTime.now().year;
const guardando = ref(false);
const trabajadores: Ref<{ text: string; value: number }[]> = ref([]);
const currentUser = computed(() => userStore.user);
const arrayCuadrantes: Ref<any[]> = ref([]);
const cargando = ref(false);
const turnoSeleccionado: Ref<any> = ref(null);
const getCuadrantes = inject<() => TCuadranteFrontend[]>("getCuadrantes");

// Computed
const totalHoras = computed(() => {
  let total = 0;
  for (let i = 0; i < arrayCuadrantes.value.length; i += 1) {
    if (arrayCuadrantes.value[i].ausencia) continue;
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
    if (!turno.ausencia) {
      const dia = turno.inicio.toFormat("EEE", { locale: "es" });
      const horasTurno = turno.final.diff(turno.inicio, "hours").hours;
      horas[dia] = (horas[dia] || 0) + horasTurno;
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
  if (turnoSeleccionado.value && turnoSeleccionado.value._id === turno._id) {
    turnoSeleccionado.value = null;
  } else {
    turnoSeleccionado.value = turno;
  }
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
    idTienda: idTiendaDefault.value,
    ausencia: null,
  });
}

function actualizarTiendaTurno(turno: any, nuevaIdTienda: number) {
  const index = buscarIndexFromTurno(turno._id);
  if (index !== -1) {
    arrayCuadrantes.value[index].idTienda = nuevaIdTienda;
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
    await borrarTurno({ idTurno: turnoSeleccionado.value._id });
    turnoSeleccionado.value = null;
  }
}

// Funciones existentes
async function abrirModal(fechaBetween: Date, tiendas: any[], idTienda: number) {
  if (fechaBetween && tiendas.length > 0 && idTienda) {
    arrayTiendas.value = tiendas;
    // Las tiendas ya vienen con la estructura correcta {text, value, idTienda}
    arrayTiendasFormateado.value = tiendas;
    console.log("Tiendas recibidas:", tiendas);

    idTiendaDefault.value = idTienda;
    inicioSemana.value = DateTime.fromJSDate(fechaBetween).startOf("week");

    await iniciarDatos(inicioSemana.value);
    modalCrearCuadrante.value = true;
  } else Swal.fire("Oops...", "Datos iniciales incorrectos", "error");
}

async function iniciarDatos(fecha: DateTime) {
  try {
    if (trabajadorSelected.value) {
      const auxCuadrantes = await getCuadranteEmpleado(fecha, trabajadorSelected.value);
      arrayCuadrantes.value = auxCuadrantes;
      turnoSeleccionado.value = null;
    }
  } catch (err) {
    cargando.value = false;
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function guardarFinal() {
  try {
    guardando.value = true;
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || currentUser.value.uid;

    const sendRequestCuadrantes = arrayCuadrantes.value.map((turno) => {
      return {
        bloqueado: turno.ausencia?.completa ? true : false,
        horaEntrada: turno.inicio.toISO(),
        horaSalida: turno.final.toISO(),
        idPlan: turno.idPlan,
        idTienda: turno.idTienda,
        idCuadrante: turno._id,
        ausencia: turno.ausencia,
        borrable: turno.borrable,
      };
    });

    if (!inicioSemana.value) throw Error("No se ha podido obtener la fecha de inicio de semana");

    const resGuardar = await axiosInstance.post("cuadrantes/saveCuadrante", {
      idTrabajador: trabajadorSelected.value,
      arraySemanalHoras: sendRequestCuadrantes,
      totalHoras: totalHoras.value,
      idTiendaDefault: idTiendaDefault.value,
      fecha: inicioSemana.value.toISO(),
      uid: uidParaConsultar,
      semana: semanaActual,
      year: yearActual,
    });

    if (resGuardar.data.ok) {
      if (!getCuadrantes) {
        throw new Error("No se encontró la inyección 'getCuadrantes'");
      }
      getCuadrantes();
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

async function getTrabajadores() {
  try {
    trabajadores.value = [];
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || currentUser.value.uid;

    const resEquipo = await axiosInstance.get("trabajadores/getSubordinados", {
      params: { uid: uidParaConsultar },
    });

    if (resEquipo.data.ok) {
      trabajadores.value = resEquipo.data.data.map((trabajador: TTrabajador) => {
        return {
          text: trabajador.nombreApellidos,
          value: trabajador.id,
        };
      });

      if (
        currentUser.value.llevaEquipo &&
        currentUser.value.idTienda &&
        !trabajadores.value.some((t) => t.value === currentUser.value.idSql)
      ) {
        if (currentUser.value.displayName && currentUser.value.idSql)
          trabajadores.value.push({
            text: currentUser.value.displayName,
            value: currentUser.value.idSql,
          });
      }
    } else throw Error("No se ha podido obtener la lista de tu equipo de trabajo");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function getCuadranteEmpleado(fecha: DateTime, idTrabajador: number) {
  cargando.value = true;
  // Recuperar UID de Coordinadora desde localStorage si existe
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || currentUser.value.uid;

  try {
    const resCuadrantes = await axiosInstance.get("cuadrantes/individual", {
      params: {
        fecha: fecha.toJSDate().toISOString(),
        idTrabajador,
        uid: uidParaConsultar,
      },
    });

    cargando.value = false;

    return resCuadrantes.data.map((turno: TCuadranteBackend) => ({
      ...turno,
      inicio: DateTime.fromJSDate(new Date(turno.inicio)),
      final: DateTime.fromJSDate(new Date(turno.final)),
    }));
  } catch (error) {
    console.log(error);
    // Type guard for Axios error
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as any).response &&
      (error as any).response.status === 401
    ) {
      Swal.fire("Oops...", "No tienes permisos para ver este cuadrante", "error");
    } else Swal.fire("Oops...", "Ha habido un error", "error");
  }
}
function updateTurno(updatedTurno: any) {
  const index = buscarIndexFromTurno(updatedTurno._id);
  arrayCuadrantes.value[index] = updatedTurno;
  arrayCuadrantes.value = [...arrayCuadrantes.value];
}

async function handleAddCuadrante({ dia, idTienda, ausencia }: any) {
  const nuevoCuadrante: any = {
    _id: (await axiosInstance.get("cuadrantes/getNewId")).data,
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

function buscarIndexFromTurno(idTurno: any) {
  return arrayCuadrantes.value.findIndex((element) => element._id === idTurno);
}

async function borrarTurno({ idTurno }: any) {
  const index = buscarIndexFromTurno(idTurno);

  if (arrayCuadrantes.value[index]?.borrable) {
    const resBorrado = await axiosInstance.post("cuadrantes/borrarTurno", {
      idTurno: arrayCuadrantes.value[index]._id,
    });

    if (resBorrado.data.ok) {
      arrayCuadrantes.value.splice(index, 1);
      Swal.fire("Borrado", "El turno ha sido borrado.", "success");
    } else Swal.fire("Oops...", "No se ha podido borrar este turno", "error");
  } else {
    arrayCuadrantes.value[index]._id = 1;
    arrayCuadrantes.value[index].inicio = arrayCuadrantes.value[index].inicio.startOf("day");
    arrayCuadrantes.value[index].final = arrayCuadrantes.value[index].inicio.startOf("day");
    arrayCuadrantes.value[index].idTienda = null;
    arrayCuadrantes.value[index].ausencia = null;
  }
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
  await getTrabajadores();
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

.col-tienda {
  width: 30%;
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

  .col-tienda {
    width: 32%;
  }

  .col-horario {
    width: 35%;
  }

  .col-horas {
    width: 15%;
  }
}
</style>
