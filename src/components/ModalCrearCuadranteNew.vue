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

          <div class="resumen-horas">
            <div class="horas-card">
              <div class="horas-titulo">Total horas</div>
              <!-- Antes: {{ totalHoras.toFixed(2) }} -->
              <div class="horas-valor">{{ formatHoras(totalHoras) }}</div>
            </div>
            <div class="horas-desglose" v-if="trabajadorSelected">
              <div class="desglose-item" v-for="(horas, dia) in horasPorDia" :key="dia">
                <span class="dia-nombre">{{ dia }}</span>
                <!-- Antes: {{ horas.toFixed(1) }}h -->
                <span class="dia-horas">{{ formatHoras(horas) }}</span>
              </div>
            </div>
          </div>

          <div class="acciones-sidebar">
            <BsButton
              icon="file-pen"
              color="warning"
              class="w-100 mb-2 text-start"
              @click="administrarPlantillasTurno()"
            >
              Administrar plantillas
            </BsButton>
            <BsButton
              color="primary"
              class="w-100 mb-2 text-start"
              icon="plus"
              :loading="loadingDobleTurno"
              :disabled="!trabajadorSelected || !turnoSeleccionado"
              @click="addDobleTurno"
            >
              Añadir doble turno
            </BsButton>
            <BsButton
              color="primary"
              class="w-100 mb-2 text-start"
              icon="clipboard"
              :loading="loadingDobleTurno"
              :disabled="!trabajadorSelected || !turnoSeleccionado"
              @click="introducirManualmente()"
            >
              <span v-if="estadoBotonEsCustom">Introducir desde plantilla</span>
              <span v-else>Introducir manualmente</span>
            </BsButton>

            <BsButton
              color="success"
              class="w-100 mb-2 text-start"
              icon="floppy-disk"
              :disabled="guardando || !trabajadorSelected"
              :loading="guardando"
              @click="guardarFinal()"
            >
              Guardar cambios
            </BsButton>

            <BsButton
              v-if="turnoSeleccionado"
              icon="arrow-rotate-left"
              color="secondary"
              class="w-100 mb-2 text-start"
              @click="restablecerTurnoSeleccionado"
            >
              Restablecer turno
            </BsButton>

            <BsButton
              v-if="turnoSeleccionado && esTurnoBorrable(turnoSeleccionado)"
              icon="trash"
              color="danger"
              class="w-100 mb-2 text-start"
              @click="eliminarTurnoSeleccionado"
            >
              Eliminar turno
            </BsButton>

            <BsButton
              icon="cancel"
              color="danger"
              class="w-100 text-start"
              @click="handleCancelar()"
            >
              Cancelar
            </BsButton>
          </div>
        </aside>

        <!-- Área principal con la tabla -->
        <main class="main-content">
          <!-- Selector de trabajador siempre visible -->
          <div class="selector-trabajador-main">
            <label class="selector-label">Seleccionar trabajador/a</label>
            <BsSelect
              v-model="trabajadorSelected"
              :options="equipoCoordinadora"
              text-key="nombreApellidos"
              value-key="id"
              size="lg"
              placeholder="Seleccione un trabajador para ver sus turnos"
            />
          </div>

          <div v-if="!cargando" class="tabla-wrapper">
            <!-- Vista de tabla cuando hay trabajador seleccionado -->
            <div v-if="trabajadorSelected" class="tabla-cuadrante">
              <div class="tabla-header">
                <div class="col">Día</div>
                <div class="col">Horario</div>
                <div class="col">Tienda</div>
                <div class="col">Horas</div>
              </div>

              <div class="tabla-body">
                <div
                  v-for="turno in arrayTurnosTrabajadorOrdenados"
                  :key="turno.id"
                  class="tabla-row"
                  :class="{
                    'row-seleccionada': turnoSeleccionado && turnoSeleccionado.id === turno.id,
                  }"
                  @click="seleccionarTurno(turno)"
                >
                  <div class="col">
                    <div class="dia-info">
                      <span class="dia-nombre">{{ formatearDia(turno.inicio) }}</span>
                      <span class="dia-fecha">{{
                        formatearFechaConRango(turno.inicio, turno.final)
                      }}</span>
                    </div>
                  </div>

                  <div class="col">
                    <div class="horario-wrapper">
                      <span v-if="isCustomTurno(turno.inicio, turno.final)"
                        >{{ formatearHora(turno.inicio) }} a {{ formatearHora(turno.final) }}</span
                      >
                      <BsSelect
                        v-else
                        :options="plantillasTurnoTextoCompuesto"
                        :model-value="getPlantillaSeleccionada(turno)"
                        value-key="id"
                        text-key="nombre"
                        @change="onChangePlantilla"
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
                    <BsSelect
                      :options="arrayTiendas"
                      :model-value="getTiendaOption(turno.tiendaId)"
                      filter
                      size="md"
                      class="w-100"
                      text-key="nombre"
                      value-key="id"
                      @update:modelValue="(opt) => actualizarTiendaTurno(turno, opt.id)"
                    />
                  </div>

                  <div class="col">
                    <span class="horas-turno"> {{ calcularHorasTurno(turno) }} </span>
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

  <ModalSetTurno
    v-model="modalSetTurno"
    :plantillas-turno="plantillasTurno"
    initial-inicio="09:00"
    initial-fin="17:00"
    @apply="onApplyModalSetTurno"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onUnmounted, type Ref, type ComputedRef } from "vue";
import Swal from "sweetalert2";
import { DateTime } from "luxon";
import { axiosInstance } from "@/components/axios/axios";
import { AxiosError } from "axios";

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
import ModalSetTurno from "./ModalSetTurno.vue";
import BsSelect from "./365/BsSelect.vue";
import type { AusenciaBackendOLD, AusenciaFrontendOLD } from "@/interfaces/AusenciasOLD.interface";
// import BsModalHeader from "./365/BsModalHeader.vue";

export interface TPlantilla {
  id: string;
  nombre: string;
  inicio: string;
  final: string;
}

const props = defineProps<{
  selectedDate: DateTime;
  selectedTienda: TTienda | null;
}>();
const userStore = useUserStore();
const tiendaStore = useTiendaStore();
const plantillasModal = ref<InstanceType<typeof PlantillasTurnoModal> | null>(null);
const arrayTiendas = computed(() => tiendaStore.tiendas);
const trabajadorSelected: Ref<TTrabajador | null> = ref(null);
const inicioSemana: Ref<DateTime | null> = ref(null);
const modalCrearCuadrante = ref(false);
const modalSetTurno = ref(false);
const guardando = ref(false);
const equipoCoordinadora: Ref<TTrabajador[]> = ref([]);
const currentUser = computed(() => userStore.user);
const arrayTurnosTrabajador: Ref<TTurnoFrontend[]> = ref([]);
const cargando = ref(false);
let ausenciasTrabajador: AusenciaFrontendOLD[] = [];
const turnoSeleccionado: Ref<TTurnoFrontend | null> = ref(null);
const plantillasTurno = ref<TPlantilla[]>([]);
const loadingDobleTurno = ref(false);
const plantillasTurnoTextoCompuesto: ComputedRef<TPlantilla[]> = computed(() => {
  return plantillasTurno.value.map((plantilla: TPlantilla) => ({
    nombre: `${plantilla.nombre} (${plantilla.inicio} - ${plantilla.final})`,
    id: plantilla.id,
    inicio: plantilla.inicio,
    final: plantilla.final,
  }));
});
const reloadCuadrante = inject<() => TCuadranteFrontend[]>("reloadCuadrante");

// Computed
const totalHoras = computed(() => {
  let total = 0;
  for (let i = 0; i < arrayTurnosTrabajador.value.length; i += 1) {
    total += arrayTurnosTrabajador.value[i].final.diff(
      arrayTurnosTrabajador.value[i].inicio,
      "hours",
    ).hours;
  }
  return total;
});

const arrayTurnosTrabajadorOrdenados = computed(() => {
  return [...arrayTurnosTrabajador.value].sort((a, b) => {
    return a.inicio.toMillis() - b.inicio.toMillis();
  });
});

function formatHoras(hoursDecimal: number): string {
  const h = Math.floor(hoursDecimal);
  const m = Math.round((hoursDecimal - h) * 60);
  return `${h} h ${m} min`;
}

function isCustomTurno(inicio: DateTime, final: DateTime) {
  // Prioridad máxima para estos casos, son los iniciales
  if (inicio.toFormat("HH:mm") === "00:00" && final.toFormat("HH:mm") === "00:00") {
    return false;
  }

  for (let i = 0; i < plantillasTurno.value.length; i++) {
    const plantilla = plantillasTurno.value[i];
    if (
      plantilla.inicio === inicio.toFormat("HH:mm") &&
      plantilla.final === final.toFormat("HH:mm")
    ) {
      return false;
    }
  }

  return true;
}

function onChangePlantilla(newPlantilla: TPlantilla) {
  if (!turnoSeleccionado.value) return;

  const [hIni, mIni] = newPlantilla.inicio.split(":").map(Number);
  const [hFin, mFin] = newPlantilla.final.split(":").map(Number);

  // muta el mismo objeto
  turnoSeleccionado.value.inicio = turnoSeleccionado.value.inicio.set({ hour: hIni, minute: mIni });

  // Si la hora final es menor que la inicial, es un turno nocturno que termina al día siguiente
  let fechaFinal = turnoSeleccionado.value.inicio.set({ hour: hFin, minute: mFin });
  if (hFin < hIni || (hFin === hIni && mFin < mIni)) {
    fechaFinal = fechaFinal.plus({ days: 1 });
  }

  turnoSeleccionado.value.final = fechaFinal;

  // y vuelve a asignar el array para que Vue lo detecte
  arrayTurnosTrabajador.value = [...arrayTurnosTrabajador.value];
}

const estadoBotonEsCustom = computed(() => {
  if (turnoSeleccionado.value) {
    return isCustomTurno(turnoSeleccionado.value.inicio, turnoSeleccionado.value.final);
  }

  return false;
});

const horasPorDia = computed(() => {
  const horas: Record<string, number> = {};
  arrayTurnosTrabajador.value.forEach((turno) => {
    // Siempre usar la fecha de inicio del turno para agrupar, según el día que empieza a trabajar
    const dia = turno.inicio.toFormat("EEE", { locale: "es" });
    const hrs = turno.final.diff(turno.inicio, "hours").hours;
    horas[dia] = (horas[dia] || 0) + hrs;
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

function formatearFechaConRango(inicio: DateTime, final: DateTime) {
  const fechaInicio = inicio.toFormat("dd/MM");
  const fechaFinal = final.toFormat("dd/MM");

  // Si las fechas son diferentes, mostrar el rango
  if (fechaInicio !== fechaFinal) {
    return `${fechaInicio} - ${fechaFinal}`;
  }

  return fechaInicio;
}

function getTiendaOption(tiendaId: number | null) {
  return tiendaId != null ? (arrayTiendas.value.find((t) => t.id === tiendaId) ?? null) : null;
}

function getPlantillaSeleccionada(turno: TTurnoFrontend) {
  const horaInicio = turno.inicio.toFormat("HH:mm");
  const horaFinal = turno.final.toFormat("HH:mm");

  const plantillaEncontrada = plantillasTurnoTextoCompuesto.value.find(
    (plantilla) => plantilla.inicio === horaInicio && plantilla.final === horaFinal,
  );

  return plantillaEncontrada || null;
}

function calcularHorasTurno(turno: TTurnoFrontend) {
  // if (turno.ausencia) return "0 h 0 min";
  const diff = turno.final.diff(turno.inicio, "minutes").minutes;
  const horas = Math.floor(diff / 60);
  const minutos = Math.round(diff % 60);
  return `${horas} h ${minutos} min`;
}

// Funciones de actualización
// function actualizarHora(turno: any, tipo: "inicio" | "final", event: Event) {
//   const input = event.target as HTMLInputElement;
//   const [horas, minutos] = input.value.split(":").map(Number);

//   const nuevaFecha = turno[tipo].set({ hour: horas, minute: minutos });
//   turno[tipo] = nuevaFecha;

//   updateTurno(turno);
// }

function seleccionarTurno(turno: any) {
  turnoSeleccionado.value = turno;
}

function formatearHora(fecha: DateTime) {
  return fecha.toFormat("HH:mm");
}

function esTurnoBorrable(turno: any): boolean {
  return turno && turno.borrable === true;
}

function addDobleTurno() {
  loadingDobleTurno.value = true;

  // Si no hay turno activo o fecha de inicio, abortamos
  if (!turnoSeleccionado.value || !inicioSemana.value) {
    loadingDobleTurno.value = false;
    return;
  }

  // Obtenemos el día en cuestión (00:00 del día)
  const diaSeleccionado = turnoSeleccionado.value.inicio.startOf("day");

  // Comprobamos cuántos turnos ya hay ese día
  const turnosDelDia = arrayTurnosTrabajador.value.filter(
    (t) => t.inicio.startOf("day").toMillis() === diaSeleccionado.toMillis(),
  );

  if (turnosDelDia.length >= 2) {
    Swal.fire({
      icon: "warning",
      title: "Máximo alcanzado",
      text: "Ya existen 2 turnos para este día.",
    });
    loadingDobleTurno.value = false;
    return;
  }

  // ---- Aquí la clave: creamos el placeholder a las 00:00–00:00 ----
  const inicio = diaSeleccionado;
  const final = diaSeleccionado;

  const nuevoTurno: TTurnoFrontend = {
    id: `tmp-${Date.now()}`, // ID único provisional
    inicio,
    final,
    tiendaId: userStore.getIdTienda,
    ausencia: null,
    borrable: true,
  } as any;

  // Lo insertamos en la posición mantenida ordenada
  const idx = arrayTurnosTrabajador.value.findIndex((t) => t.inicio > nuevoTurno.inicio);
  if (idx === -1) {
    arrayTurnosTrabajador.value.push(nuevoTurno);
  } else {
    arrayTurnosTrabajador.value.splice(idx, 0, nuevoTurno);
  }

  // ---- Seleccionamos automáticamente el nuevo turno ----
  turnoSeleccionado.value = nuevoTurno;

  // Forzamos la reactividad para que Vue actualice la tabla
  arrayTurnosTrabajador.value = [...arrayTurnosTrabajador.value];
  loadingDobleTurno.value = false;
}

async function handleCancelar() {
  const result = await Swal.fire({
    title: "¿Cerrar ventana?",
    text: "Perderás el progreso no guardado. ¿Estás seguro?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cerrar",
    cancelButtonText: "Cancelar",
  });
  if (result.isConfirmed) {
    modalCrearCuadrante.value = false;
    limpiarDatosModal();
  }
}

function actualizarTiendaTurno(turno: TTurnoFrontend, nuevaIdTienda: number) {
  try {
    if (!turno.id) throw new Error("El turno.id es nulo");

    const index = buscarIndexFromTurno(turno.id);
    if (index !== -1) {
      arrayTurnosTrabajador.value[index].tiendaId = nuevaIdTienda;
      arrayTurnosTrabajador.value = [...arrayTurnosTrabajador.value];
    }
  } catch (error) {
    console.log(error);
    Swal.fire("Oops...", "Ha habido un problema, inténtalo más tarde", "error");
  }
}

async function eliminarTurnoSeleccionado() {
  if (!turnoSeleccionado.value) return;

  const index = buscarIndexFromTurno(turnoSeleccionado.value.id);

  if (arrayTurnosTrabajador.value[index]?.borrable) {
    arrayTurnosTrabajador.value.splice(index, 1);
    Swal.fire({
      icon: "success",
      title: "Borrado",
      text: "El turno ha sido borrado.",
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true,
    });
  } else {
    arrayTurnosTrabajador.value[index].id = `tmp-${Date.now()}`;
    arrayTurnosTrabajador.value[index].inicio =
      arrayTurnosTrabajador.value[index].inicio.startOf("day");
    arrayTurnosTrabajador.value[index].final =
      arrayTurnosTrabajador.value[index].inicio.startOf("day");
    arrayTurnosTrabajador.value[index].tiendaId = null;
  }
  turnoSeleccionado.value = null;
}

// Funciones existentes
async function abrirModal(fechaBetween: DateTime) {
  if (!fechaBetween) {
    Swal.fire("Oops...", "Datos iniciales incorrectos", "error");
    return;
  }

  getEquipoCoordinadoraDeLaTienda();

  inicioSemana.value = fechaBetween.startOf("week");

  await iniciarDatos(inicioSemana.value);
  modalCrearCuadrante.value = true;
}

// Se ejecuta al cambiar el trabajadorSelected
async function iniciarDatos(fecha: DateTime) {
  try {
    cargando.value = true;

    console.log("muahaha", trabajadorSelected.value);
    if (!trabajadorSelected.value || !trabajadorSelected.value.id) {
      Swal.fire({
        icon: "info",
        title: "Selecciona un trabajador",
        text: "Debes seleccionar un trabajador para ver sus turnos.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    // 1) Traigo los turnos reales (puede venir [] si no hay datos)
    const turnosTrabajador: TTurnoFrontend[] = trabajadorSelected.value
      ? await Turno.getTurnosIndividuales(fecha, trabajadorSelected.value.id)
      : [];

    // 1.5 Traigo las ausencias del trabajador
    await getAusenciasTrabajador(trabajadorSelected.value.id);

    // 2) Calculo los 7 días de lunes a domingo
    const inicioSemana = fecha.startOf("week");
    const diasSemana = Array.from({ length: 7 }, (_, i) => inicioSemana.plus({ days: i }));

    // 3) Agrupo los turnos reales por día (key = milis del inicio de día)
    const turnosPorDia = new Map<number, TTurnoFrontend[]>();
    turnosTrabajador.forEach((turno) => {
      const key = turno.inicio.startOf("day").toMillis();
      if (!turnosPorDia.has(key)) {
        turnosPorDia.set(key, []);
      }
      turnosPorDia.get(key)!.push(turno);
    });

    // 4) Construyo arrayTurnosTrabajador: turnos reales o placeholders
    arrayTurnosTrabajador.value = [];
    diasSemana.forEach((dia) => {
      const key = dia.startOf("day").toMillis();
      const turnosDelDia = turnosPorDia.get(key);

      if (turnosDelDia && turnosDelDia.length > 0) {
        // Agregar todos los turnos de este día
        arrayTurnosTrabajador.value.push(...turnosDelDia);
      } else {
        // placeholder para días sin turno
        arrayTurnosTrabajador.value.push({
          id: `tmp-${key}`,
          inicio: dia,
          final: dia, // mismo día sin horas
          tiendaId: props.selectedTienda?.id,
          borrable: false, // así los distinguirás
        } as TTurnoFrontend);
      }
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

    if (!trabajadorSelected.value || !inicioSemana.value) throw new Error();

    await axiosInstance.post("save-turnos-trabajador-semanal", {
      idTrabajador: trabajadorSelected.value.id,
      inicioSemanaISO: inicioSemana.value.toISO(),
      arrayTurnos: arrayTurnosTrabajador.value.map((turno) => ({
        id: turno.id,
        inicioISO: turno.inicio.toISO(),
        finalISO: turno.final.toISO(),
        tiendaId: turno.tiendaId,
        borrable: turno.borrable,
      })),
    });

    Swal.fire({
      icon: "success",
      title: "Guardado",
      text: "Los turnos se han guardado correctamente.",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });

    reloadCuadrante!();
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

    plantillasTurno.value = [];
    plantillasTurno.value = resPlantillas.data.map((plantilla: any) => {
      return {
        id: plantilla.id,
        nombre: plantilla.nombre,
        inicio: plantilla.inicio,
        final: plantilla.final,
      };
    });
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

    equipoCoordinadora.value = resEquipo.data.map((trabajador: TTrabajador) => ({
      dni: trabajador.dni!,
      emails: trabajador.emails!,
      excedencia: trabajador.excedencia,
      id: trabajador.id,
      llevaEquipo: trabajador.llevaEquipo,
      nombreApellidos: trabajador.nombreApellidos,
      tipoTrabajador: trabajador.tipoTrabajador,
    }));

    if (
      currentUser.value.llevaEquipo &&
      currentUser.value.idTienda &&
      !equipoCoordinadora.value.some((t) => t.id === currentUser.value.idSql)
    ) {
      if (currentUser.value.displayName && currentUser.value.idSql)
        equipoCoordinadora.value.push({
          dni: currentUser.value.dni!,
          emails: currentUser.value.email!,
          excedencia: false,
          id: currentUser.value.idSql,
          llevaEquipo: currentUser.value.llevaEquipo,
          nombreApellidos: currentUser.value.displayName!,
          tipoTrabajador: "COORDINADORA",
        });
    }
  } catch (e) {
    const error = e as AxiosError;

    if (
      error.response?.data &&
      typeof error.response.data === "object" &&
      "code" in error.response.data
    ) {
      if (error.response.data.code == "SIN_COORDINADORA") {
        Swal.fire("Oops...", "La tienda no tiene coordinadora", "error").then(() => {
          modalCrearCuadrante.value = false;
        });
      } else {
        Swal.fire("Oops...", "Ha habido un error", "error");
        console.log(e);
      }
    }
  }
}

function buscarIndexFromTurno(idTurno: string) {
  return arrayTurnosTrabajador.value.findIndex((element) => element.id === idTurno);
}

function administrarPlantillasTurno() {
  plantillasModal.value?.abrirModal();
}

function setTurnoModal() {
  modalSetTurno.value = true;
}

function modificarHorasTurno(idTurno: string, horaInicioHHmm: string, horaFinalHHmm: string) {
  const indexTurno = buscarIndexFromTurno(idTurno);

  // Cambio el inicio
  const [horasInicio, minutosInicio] = horaInicioHHmm.split(":").map(Number);
  arrayTurnosTrabajador.value[indexTurno].inicio = arrayTurnosTrabajador.value[
    indexTurno
  ].inicio.set({ hour: horasInicio, minute: minutosInicio });

  // Cambio el final - si la hora final es menor que la inicial, es un turno nocturno
  const [horasFinal, minutosFinal] = horaFinalHHmm.split(":").map(Number);
  let fechaFinal = arrayTurnosTrabajador.value[indexTurno].inicio.set({
    hour: horasFinal,
    minute: minutosFinal,
  });

  if (horasFinal < horasInicio || (horasFinal === horasInicio && minutosFinal < minutosInicio)) {
    fechaFinal = fechaFinal.plus({ days: 1 });
  }

  arrayTurnosTrabajador.value[indexTurno].final = fechaFinal;
  turnoSeleccionado.value = { ...arrayTurnosTrabajador.value[indexTurno] };
}

function onApplyModalSetTurno(dataEvent: { inicio: string; final: string }) {
  if (!turnoSeleccionado.value || !turnoSeleccionado.value.id)
    throw new Error("Primero selecciona un turno");

  // Necesitamos cambiar lo seleccionado en el objeto real de turnos
  modificarHorasTurno(turnoSeleccionado.value.id, dataEvent.inicio, dataEvent.final);
  modalSetTurno.value = false;
}

function introducirManualmente() {
  if (!turnoSeleccionado.value) return;

  if (estadoBotonEsCustom.value) {
    setTurnoSeleccionado("00:00", "00:00");
  } else setTurnoModal();
}

function setTurnoSeleccionado(inicio: string, final: string) {
  if (!turnoSeleccionado.value || !turnoSeleccionado.value.id) return;

  const index = buscarIndexFromTurno(turnoSeleccionado.value.id);
  if (index === -1) return;

  // Cambia la hora de inicio
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  arrayTurnosTrabajador.value[index].inicio = arrayTurnosTrabajador.value[index].inicio.set({
    hour: horaInicio,
    minute: minutoInicio,
  });

  // Cambia la hora de finalización - si la hora final es menor que la inicial, es un turno nocturno
  const [horaFinal, minutoFinal] = final.split(":").map(Number);
  let fechaFinal = arrayTurnosTrabajador.value[index].inicio.set({
    hour: horaFinal,
    minute: minutoFinal,
  });

  if (horaFinal < horaInicio || (horaFinal === horaInicio && minutoFinal < minutoInicio)) {
    fechaFinal = fechaFinal.plus({ days: 1 });
  }

  arrayTurnosTrabajador.value[index].final = fechaFinal;

  // Actualiza el array para reactividad
  arrayTurnosTrabajador.value = [...arrayTurnosTrabajador.value];

  // Actualiza turnoSeleccionado también
  turnoSeleccionado.value = { ...arrayTurnosTrabajador.value[index] };
}

function restablecerTurnoSeleccionado() {
  if (!turnoSeleccionado.value || !turnoSeleccionado.value.id) return;

  const index = buscarIndexFromTurno(turnoSeleccionado.value.id);
  if (index === -1) return;

  // Restablecer a 00:00 - 00:00 (mismo día)
  const fechaInicio = arrayTurnosTrabajador.value[index].inicio.startOf("day");
  arrayTurnosTrabajador.value[index].inicio = fechaInicio;
  arrayTurnosTrabajador.value[index].final = fechaInicio;

  // Actualiza el array para reactividad
  arrayTurnosTrabajador.value = [...arrayTurnosTrabajador.value];

  // Actualiza turnoSeleccionado también
  turnoSeleccionado.value = { ...arrayTurnosTrabajador.value[index] };
}

const watchTrabajadorSelected = watch(trabajadorSelected, () => {
  if (inicioSemana.value) {
    iniciarDatos(inicioSemana.value);
    turnoSeleccionado.value = null;
  }
});

// Función para limpiar datos al cerrar el modal
function limpiarDatosModal() {
  trabajadorSelected.value = null;
  arrayTurnosTrabajador.value = [];
  turnoSeleccionado.value = null;
  equipoCoordinadora.value = [];
  plantillasTurno.value = [];
  inicioSemana.value = null;
  cargando.value = false;
  guardando.value = false;
  loadingDobleTurno.value = false;
}

async function getAusenciasTrabajador(idTrabajador: number) {
  try {
    if (!idTrabajador) throw new Error("ID del trabajador no proporcionado");
    if (!inicioSemana.value) throw new Error("Fecha de inicio de semana no establecida");
    if (!inicioSemana.value.isValid) throw new Error("Fecha de inicio de semana no válida");

    const { data }: { data: AusenciaBackendOLD[] } = await axiosInstance.get(
      "ausencias/getAusenciasTrabajador",
      {
        params: {
          idTrabajador,
          fechaInicio: inicioSemana.value?.toISO(),
          fechaFinal: inicioSemana.value?.endOf("week").toISO(),
        },
      },
    );

    ausenciasTrabajador = data.map((ausencia) => ({
      ...ausencia,
      fechaInicio: DateTime.fromISO(ausencia.fechaInicio),
      fechaFinal: ausencia.fechaFinal ? DateTime.fromISO(ausencia.fechaFinal) : undefined,
      fechaRevision: ausencia.fechaRevision ? DateTime.fromISO(ausencia.fechaRevision) : undefined,
    })) as AusenciaFrontendOLD[];

    console.log("Ausencias del trabajador:", ausenciasTrabajador);
  } catch (error) {
    console.log(error);
    Swal.fire("Oops...", "Ha habido un error al cargar las ausencias", "error");
  }
}

// Watcher para limpiar datos cuando se cierre el modal
watch(modalCrearCuadrante, (newValue) => {
  if (newValue) {
    // Modal se está abriendo - deshabilitar scroll del body
    document.body.style.overflow = "hidden";
  } else {
    // Modal se está cerrando - restaurar scroll del body
    document.body.style.overflow = "";
    limpiarDatosModal();
  }
});

// Limpiar watchers al desmontar el componente
onUnmounted(() => {
  watchTrabajadorSelected();
  // Restaurar scroll del body por si el componente se desmonta con el modal abierto
  document.body.style.overflow = "";
});

defineExpose({
  abrirModal,
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

/* Selector de trabajador en área principal */
.selector-trabajador-main {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.selector-trabajador-main .selector-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
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
