<template>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <h5 class="fw-bold mb-4 text-center">Consulta de Fichajes</h5>
      <div class="row g-3 align-items-end">
        <!-- Selector de trabajador -->
        <div class="col-md-4">
          <label class="form-label">Trabajador:</label>
          <BsSelect
            v-model:options="datosTrabajadores"
            v-model:selected="seleccionarTrabajador"
            filter
            :label-key="'text'"
            :preselect="false"
          />
        </div>

        <!-- Fecha inicio -->
        <div class="col-md-3">
          <label class="form-label">Fecha inicio:</label>
          <BsDatepicker
            v-model="fechaInicio"
            input-toggle
            :months-full="mesesFull"
            :months-short="mesesShort"
            :weekdays-full="diasFull"
            :weekdays-short="diasShort"
            :weekdays-narrow="inicialesDias"
            :clear-btn-text="'Reset'"
            :cancel-btn-text="'Cancelar'"
            :start-day="1"
          />
        </div>

        <!-- Fecha fin -->
        <div class="col-md-3">
          <label class="form-label">Fecha fin:</label>
          <BsDatepicker
            v-model="fechaFinal"
            input-toggle
            :months-full="mesesFull"
            :months-short="mesesShort"
            :weekdays-full="diasFull"
            :weekdays-short="diasShort"
            :weekdays-narrow="inicialesDias"
            :clear-btn-text="'Reset'"
            :cancel-btn-text="'Cancelar'"
            :start-day="1"
          />
        </div>

        <!-- Botón "ver" -->
        <div class="col-md-2 d-flex">
          <button class="btn btn-primary w-100" @click="getFichajes">
            <i class="fas fa-search me-1"></i> Ver
          </button>
        </div>
      </div>

      <!-- Botones adicionales -->
      <div class="mt-4 d-flex flex-wrap gap-2">
        <button class="btn btn-success" @click="exportarPDF">
          <i class="fas fa-file-pdf me-1"></i> Exportar PDF
        </button>
      </div>

      <!-- Cargando -->
      <div v-if="loading2" class="text-center my-5">
        <div
          class="spinner-border text-primary"
          style="width: 3rem; height: 3rem"
          role="status"
        ></div>
        <p class="mt-3">Cargando datos...</p>
      </div>

      <!-- Calendario -->
      <div v-else-if="mostrarCalendario" class="mt-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <button class="btn btn-light" @click="irMesAnterior" :disabled="!puedeIrMesAnterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h5 class="mb-0 text text-center flex-grow-1">{{ mesActualNombre }} {{ añoActual }}</h5>
          <button class="btn btn-light" @click="irMesSiguiente" :disabled="!puedeIrMesSiguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- Aquí se mantiene tu calendario -->
        <div class="calendar-grid">
          <div class="calendar-day-header" v-for="dia in diasSemana" :key="dia">
            {{ dia }}
          </div>

          <div v-for="(dia, index) in diasMes" :key="index" :class="['calendar-day', dia.clase]">
            <div class="day-number">{{ dia.numero }}</div>

            <div v-if="dia.fichajes">
              <p v-if="dia.fichajes.entrada">
                Entrada: {{ dia.fichajes.entrada }}
                <i class="fas fa-sign-in-alt text-success"></i>
              </p>
              <p v-if="dia.fichajes.salida">
                Salida: {{ dia.fichajes.salida }}
                <i class="fas fa-sign-out-alt text-warning"></i>
              </p>
              <p v-if="dia.fichajes.entrada && dia.fichajes.salida">
                Horas: {{ calcularHorasTotales(dia.fichajes.entrada, dia.fichajes.salida) }}
                <i class="fas fa-clock text-info"></i>
              </p>
              <p v-if="dia.tienda">{{ dia.tienda.toUpperCase() }}</p>
            </div>

            <div v-if="dia.ausencias && dia.ausencias.length > 0">
              <p v-for="ausencia in dia.ausencias" :key="ausencia.tipo" :class="ausencia.class">
                {{ ausencia.tipo }}
              </p>
            </div>

            <div v-if="dia.vacaciones && dia.vacaciones.length > 0">
              <p v-for="vacacion in dia.vacaciones" :key="vacacion.tipo" :class="vacacion.class">
                {{ vacacion.tipo }}
              </p>
            </div>

            <div v-else-if="dia.mensaje">
              <p class="text-danger">{{ dia.mensaje }}</p>
            </div>
          </div>
        </div>
        <div
          class="mt-4"
          v-if="resumenSemanal.length && hasPermission('VerHorasTrabajadasSemanaEmpresa')"
        >
          <h5 class="fw-bold">Resumen semanal de horas trabajadas</h5>
          <BsTable id="tabla" :items="resumenSemanal" class="table-bordered table-sm">
            <template #head>
              <tr>
                <th class="text-center">Semana</th>
                <th class="text-center">Total horas</th>
              </tr>
            </template>

            <template #body="{ item, index }">
              <tr :key="index">
                <td class="text-center" data-th="Semana">{{ item.semana }}</td>
                <td class="text-center" data-th="Total horas">{{ item.horas }}</td>
              </tr>
            </template>
          </BsTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { axiosInstanceAnonymous } from "../axios/axiosAnonymous";
import { ref, onMounted, computed, defineProps } from "vue";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import { mesesFull, mesesShort, diasFull, diasShort, inicialesDias } from "@/components/constantes";
import { hasPermission } from "@/components/rolesPermisos";
import BsDatepicker from "@/components/365/BsDatepicker.vue";
import BsSelect from "../365/BsSelect.vue";
import BsTable from "../365/BsTable.vue";

const datosTrabajadores = ref<Trabajador[]>([]);
const seleccionarTrabajador = ref<string | Trabajador>("");
interface Fichaje {
  fichajeEntrada: string | null;
  fichajeSalida: string | null;
  idFichajes: { entrada: string | null; salida: string | null };
  comentarios: { entrada: string | null; salida: string | null };
  horasPagar: {
    total: number;
    comentario: string | null;
    respSuper: string;
    estadoValidado: string;
  };
  cuadrante: {
    inicio: string | null;
    final: string | null;
    nombre: string | null;
    idTrabajador: string | null;
  };
  nombre: string | null;
  horasFichaje: number;
  horasExtra: number;
  horasAprendiz: number;
  horasCoordinacion: number;
  aPagar: boolean;
  pagado: boolean;
  hitManual: boolean;
  tienda: string | null;
}

const datosFichajesEmpresa = ref<Fichaje[]>([]);
const fechaInicio = ref(DateTime.now().startOf("month").toFormat("dd/MM/yyyy"));
const fechaFinal = ref(DateTime.now().toFormat("dd/MM/yyyy"));
const loading2 = ref(false);
const datosCargados = ref(false);
const mostrarCalendario = ref(false);

const mesActualNombre = computed(() => {
  const mes = DateTime.fromFormat(mesActual.value, "dd/MM/yyyy").month;
  return mesesFull[mes - 1];
});

interface Ausencia {
  fecha: string;
  tipo: string;
  class: string;
}

const ausenciasTemp = ref<Ausencia[]>([]);
interface Vacacion {
  fecha: string;
  tipo: string;
  class: string;
}

type Trabajador = {
  value: string;
  text: string;
  dni: string;
};

const vacacionesTemp = ref<Vacacion[]>([]);

//Aquí me llega el ID tienda del componente padre
const props = defineProps({
  pinTienda: {
    type: String,
    required: true,
  },
});

const añoActual = computed(() =>
  DateTime.fromFormat(mesActual.value, "dd/MM/yyyy").toFormat("yyyy"),
);

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const mesActual = ref(
  DateTime.fromFormat(fechaInicio.value, "dd/MM/yyyy").startOf("month").toFormat("dd/MM/yyyy"),
);

function calcularHorasTotales(entrada: any, salida: any) {
  const entradaHora = DateTime.fromFormat(entrada, "HH:mm");
  const salidaHora = DateTime.fromFormat(salida, "HH:mm");

  // Calcular la diferencia en horas y minutos
  const diferencia = salidaHora.diff(entradaHora, ["hours", "minutes"]);
  const horas = Math.floor(diferencia.as("hours"));
  const minutos = diferencia.minutes % 60;

  return `${horas}h ${minutos}m`;
}

function calcularHorasTotalesSemana(jornadaSemanal: { entrada: string; salida: string }[]) {
  let totalMinutos = 0;

  jornadaSemanal.forEach((dia) => {
    const entradaHora = DateTime.fromFormat(dia.entrada, "HH:mm");
    const salidaHora = DateTime.fromFormat(dia.salida, "HH:mm");

    const diferencia = salidaHora.diff(entradaHora, ["minutes"]);
    totalMinutos += diferencia.as("minutes");
  });

  const horasTotales = Math.floor(totalMinutos / 60);
  const minutosRestantes = Math.round(totalMinutos % 60);

  return `${horasTotales}h ${minutosRestantes}m`;
}

const resumenSemanal = computed(() => {
  return calcularHorasPorSemanaDesdeFichajes(datosFichajesEmpresa.value);
});

function calcularHorasPorSemanaDesdeFichajes(fichajes: Fichaje[]) {
  const semanas: Record<string, { entrada: string; salida: string }[]> = {};

  // Asignar fichajes a su semana correspondiente
  fichajes.forEach((fichaje) => {
    if (fichaje.fichajeEntrada && fichaje.fichajeSalida) {
      const fechaEntrada = DateTime.fromISO(fichaje.fichajeEntrada);
      const semanaClave = `${fechaEntrada.weekNumber.toString().padStart(2, "0")}`;

      if (!semanas[semanaClave]) semanas[semanaClave] = [];

      semanas[semanaClave].push({
        entrada: fechaEntrada.toFormat("HH:mm"),
        salida: DateTime.fromISO(fichaje.fichajeSalida).toFormat("HH:mm"),
      });
    }
  });

  return Object.entries(semanas)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semana, jornadas]) => ({
      semana,
      horas: jornadas.length > 0 ? calcularHorasTotalesSemana(jornadas) : "0h 0m",
    }));
}

const puedeIrMesAnterior = computed(() => {
  const inicioMesActual = DateTime.fromFormat(mesActual.value, "dd/MM/yyyy").startOf("month");
  const inicioRango = DateTime.fromFormat(fechaInicio.value, "dd/MM/yyyy").startOf("month");
  return inicioMesActual > inicioRango; // Permitir si hay meses anteriores dentro del rango
});

const puedeIrMesSiguiente = computed(() => {
  const finMesActual = DateTime.fromFormat(mesActual.value, "dd/MM/yyyy").endOf("month");
  const finRango = DateTime.fromFormat(fechaFinal.value, "dd/MM/yyyy").endOf("month");
  return finMesActual < finRango; // Permitir si hay meses siguientes dentro del rango
});

function irMesAnterior() {
  if (puedeIrMesAnterior.value) {
    mesActual.value = DateTime.fromFormat(mesActual.value, "dd/MM/yyyy")
      .minus({ months: 1 })
      .toFormat("dd/MM/yyyy");
  }
}

function irMesSiguiente() {
  if (puedeIrMesSiguiente.value) {
    mesActual.value = DateTime.fromFormat(mesActual.value, "dd/MM/yyyy")
      .plus({ months: 1 })
      .toFormat("dd/MM/yyyy");
  }
}

// Generar los días del mes con datos
const diasMes = computed(() => {
  const inicioRango = DateTime.fromFormat(fechaInicio.value, "dd/MM/yyyy");
  const finRango = DateTime.fromFormat(fechaFinal.value, "dd/MM/yyyy").endOf("day");
  const inicioMes = DateTime.fromFormat(mesActual.value, "dd/MM/yyyy").startOf("month");
  const diasEnMes = inicioMes.daysInMonth ?? 0;
  const inicioSemana = inicioMes.weekday;

  const dias = [];

  for (let i = 1; i < inicioSemana; i++) {
    dias.push({ numero: "", clase: "empty" });
  }

  for (let i = 1; i <= diasEnMes; i++) {
    const fecha = inicioMes.plus({ days: i - 1 });
    const fechaFormateada = fecha.toFormat("dd/MM/yyyy");

    // Aplicar el rango de fechas
    if (fecha >= inicioRango && fecha <= finRango) {
      const fichaje = datosFichajesEmpresa.value.find(
        (f) =>
          f.fichajeEntrada &&
          DateTime.fromISO(f.fichajeEntrada).toFormat("dd/MM/yyyy") === fechaFormateada,
      );

      const ausenciasDia = ausenciasTemp.value.filter((a) => a.fecha === fechaFormateada);
      const vacacionesDia = vacacionesTemp.value.filter((v) => v.fecha === fechaFormateada);

      dias.push({
        numero: i,
        fecha: fechaFormateada,
        clase: "active",
        fichajes: fichaje
          ? {
              entrada: fichaje.fichajeEntrada
                ? DateTime.fromISO(fichaje.fichajeEntrada).toFormat("HH:mm")
                : null,
              salida: fichaje.fichajeSalida
                ? DateTime.fromISO(fichaje.fichajeSalida).toFormat("HH:mm")
                : null,
            }
          : null,
        ausencias: ausenciasDia,
        vacaciones: vacacionesDia,
        tienda: fichaje?.comentarios?.entrada ?? fichaje?.comentarios?.salida ?? "App",
        mensaje:
          datosCargados.value && !fichaje && ausenciasDia.length === 0 && vacacionesDia.length === 0
            ? ""
            : null,
      });
    } else {
      dias.push({ numero: "", clase: "empty" });
    }
  }

  return dias;
});

// async function getTrabajadores() {
//   try {
//     const response = await axiosInstanceAnonymous.get("trabajadores");
//     console.log(response.data);

//     datosTrabajadores.value = response.data.map((item: any) => ({
//       value: item.id,
//       text: item.nombreApellidos,
//       dni: item.dni,
//       rol: item.roles[0]?.name,
//     }));
//   } catch (error) {
//     console.log(error);
//     Swal.fire("Oops...", "Ha habido un problema", "error");
//   }
// }

async function getTrabajadoresTienda() {
  try {
    const response = await axiosInstanceAnonymous.get("trabajadores/getTrabajadoresByTienda", {
      params: { idTienda: props.pinTienda },
    });

    datosTrabajadores.value = response.data.data.map((item: any) => ({
      value: item.id,
      text: item.nombreApellidos,
      dni: item.dni,
      rol: item.roles?.[0]?.name ?? "Sin rol",
      idTienda: item.idTienda,
    }));
  } catch (error) {
    console.log(error);
    Swal.fire("Oops...", "Ha habido un problema", "error");
  }
}

async function getFichajes() {
  datosFichajesEmpresa.value = [];
  loading2.value = true;
  datosCargados.value = false;
  mostrarCalendario.value = false;

  const inicio = DateTime.fromFormat(fechaInicio.value, "dd/MM/yyyy").startOf("week");
  const final = DateTime.fromFormat(fechaFinal.value, "dd/MM/yyyy").endOf("week");

  if (inicio > final) {
    Swal.fire("Error", "La fecha de inicio no puede ser mayor que la fecha final", "error");
    loading2.value = false;
    return;
  }

  if (
    seleccionarTrabajador.value &&
    typeof seleccionarTrabajador.value === "object" &&
    seleccionarTrabajador.value.value
  ) {
    try {
      // Accede al 'value' del objeto seleccionado
      const idTrabajador = seleccionarTrabajador.value.value;
      console.log("ID del trabajador seleccionado:", idTrabajador);

      const response = await axiosInstanceAnonymous.get("fichajes/fichajesResto", {
        params: { idSql: Number(idTrabajador) },
      });

      const fichajeData = response.data.data;

      // Filtrar fichajes por fecha
      const fichajesFiltradosPorFecha = fichajeData.filter((fichaje: any) => {
        const fechaFichaje = DateTime.fromISO(fichaje.hora);
        return fechaFichaje >= inicio && fechaFichaje <= final;
      });

      if (fichajesFiltradosPorFecha.length > 0) {
        const fichajesPorFecha: { [key: string]: any } = {};
        fichajesFiltradosPorFecha.forEach((fichaje: any) => {
          const fechaStr = DateTime.fromISO(fichaje.hora).toISODate();
          if (fechaStr != null) {
            if (!fichajesPorFecha[fechaStr]) {
              fichajesPorFecha[fechaStr] = {
                entrada: null,
                salida: null,
                cuadrante: {
                  inicio: null,
                  final: null,
                  nombre: null,
                  idTrabajador: null,
                },
                nombre: null,
                aPagar: false,
                pagado: false,
                validado: null,
                hitManual: false,
                idFichajes: {
                  entrada: null,
                  salida: null,
                },
                comentarios: {
                  entrada: null,
                  salida: null,
                },
                horasPagar: {
                  total: 0,
                  comentario: null,
                  respSuper: "",
                  estadoValidado: "PENDIENTE",
                },
              };
            }
            fichajesPorFecha[fechaStr].nombre = fichaje.nombre;
            if (fichaje.tipo === "ENTRADA") {
              fichajesPorFecha[fechaStr].entrada = DateTime.fromISO(fichaje.hora)
                .toJSDate()
                .toISOString(); // Fecha y hora de entrada
              fichajesPorFecha[fechaStr].idFichajes.entrada = fichaje._id;
              fichajesPorFecha[fechaStr].comentarios.entrada = fichaje.comentario;
            } else if (fichaje.tipo === "SALIDA") {
              fichajesPorFecha[fechaStr].salida = DateTime.fromISO(fichaje.hora)
                .toJSDate()
                .toISOString(); // Fecha y hora de salida
              fichajesPorFecha[fechaStr].idFichajes.salida = fichaje._id;
              fichajesPorFecha[fechaStr].comentarios.salida = fichaje.comentario;
            }
          }
        });

        const fichajesUnificados = Object.keys(fichajesPorFecha).map((fecha) => {
          const horasFichaje =
            fichajesPorFecha[fecha].entrada && fichajesPorFecha[fecha].salida
              ? Math.round(
                  DateTime.fromISO(fichajesPorFecha[fecha].salida).diff(
                    DateTime.fromISO(fichajesPorFecha[fecha].entrada),
                    "hours",
                  ).hours,
                )
              : 0;

          return {
            fichajeEntrada: fichajesPorFecha[fecha].entrada,
            fichajeSalida: fichajesPorFecha[fecha].salida,
            idFichajes: fichajesPorFecha[fecha].idFichajes,
            comentarios: fichajesPorFecha[fecha].comentarios,
            horasPagar: fichajesPorFecha[fecha].horasPagar,
            cuadrante: fichajesPorFecha[fecha].cuadrante,
            nombre: fichajesPorFecha[fecha].nombre,
            horasFichaje,
            horasExtra: 0,
            horasAprendiz: 0,
            horasCoordinacion: 0,
            aPagar: fichajesPorFecha[fecha].aPagar,
            pagado: fichajesPorFecha[fecha].pagado,
            hitManual: fichajesPorFecha[fecha].hitManual,
            tienda: fichajesPorFecha[fecha].comentarios.entrada,
          };
        });

        datosFichajesEmpresa.value.push(...fichajesUnificados);
      }

      await getAusencias(inicio, final, seleccionarTrabajador);
      await cargarSolicitudes(inicio, final, seleccionarTrabajador);

      mostrarCalendario.value = true;
    } catch (error) {
      console.error("Error al obtener los fichajes:", error);
    } finally {
      loading2.value = false;
      datosCargados.value = true;
    }
  }
}

//Posible solucion faltaria ajustar cosas
function exportarPDF() {
  const ventanaImpresion = window.open("", "", "height=1600,width=1200");
  const inicioRango = DateTime.fromFormat(fechaInicio.value, "dd/MM/yyyy").setLocale("es");
  const finRango = DateTime.fromFormat(fechaFinal.value, "dd/MM/yyyy").setLocale("es");
  const añoActual = inicioRango.year;

  const trabajadorSeleccionado = datosTrabajadores.value.find(
    (trabajador: { value: string }) => trabajador.value === seleccionarTrabajador.value,
  );

  const nombreTrabajadorSeleccionado = trabajadorSeleccionado?.text || "Desconocido";
  const dniTrabajadorSeleccionado = trabajadorSeleccionado?.dni || "Desconocido";
  const periodoSolicitado: string = `${fechaInicio.value} - ${fechaFinal.value}`;

  if (ventanaImpresion) {
    ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Calendario Fichajes - ${añoActual}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; padding: 10px; }
              h1 { font-size: 1.2rem; text-align: center; margin-bottom: 10px; }
              .header-info { text-align: left; }
              .header-info p { font-size: 0.8rem; }
              .calendar-container {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 5px;
                  justify-content: center;
                  align-items: start;
              }
              .calendar-month {
                  border: 1px solid #000;
                  padding: 2px;
                  text-align: center;
                  box-sizing: border-box;
                  height: auto;
                  min-height: 250px;
              }
              .calendar-grid {
                  display: grid;
                  grid-template-columns: repeat(7, 1fr);
                  gap: 3px;
              }
              .calendar-day {
                  border: 1px solid #000;
                  text-align: center;
                  aspect-ratio: 1/1;
                  font-size: 10px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  flex-direction: column;
                  min-width: 30px;
                  min-height: 30px;
              }
              .calendar-day-header {
                  font-weight: bold;
                  background-color: #f0f0f0;
                  padding: 3px;
                  font-size: 7px;
              }
              .calendar-day.vacation { background-color: #ffcc66; border: 2px solid #ffcc66; }
              .calendar-day.absence-dia-personal { background-color: #ccffccff; border: 2px solid #4caf50; }
              .calendar-day.absence-horas-justificadas { background-color: #cbedf5ff; border: 2px solid #03a9f4; }
              .calendar-day.absence-absentismo { background-color: #9966ffff; border: 2px solid #673ab7; }
              .calendar-day.absence-sancion { background-color: #ba0000ff; border: 2px solid #d32f2f; }
              .calendar-day.absence-maternidad-paternidad { background-color: #00bfffff; border: 2px solid #00acc1; }
              .calendar-day.absence-baixa { background-color: #ff6666; border: 2px solid #d32f2f; }
              .calendar-day.active { background-color: #b3e5fc;; border: 2px solid #0288d1; font-size: 7px; }
              .calendar-day.out-of-range { background-color: #e0e0e0; color: #9e9e9e; }
              .calendar-day.empty { background-color: #f5f5f5; }
              @media print {
                  @page { size: A4 portrait; margin: 5px; }
                  body { font-size: 10px; }
                  .calendar-container { grid-template-columns: repeat(3, 1fr); }
                   .calendar-month { min-height: 250px; }
                   .calendar-day { font-size: 8px; min-width: 30px; min-height: 30px; }
                   .calendar-day.active { background-color: #b3e5fc; border: 2px solid #0288d1; font-size: 4px; }
                  .calendar-day-header {
                     font-size: 7px;
                      padding: 3px;
              }
                       /* Estilo para la leyenda */
            .legend-container {
               display: grid;
               grid-template-columns: repeat(2, 1fr);
               gap: 10px;
               padding: 0 10px;
               justify-content: center;
               align-items: start;
               text-align: left;
               font-size: 10px;
            }
            .legend-container ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            </style>
          </head>
          <body>
            <div class="header-info">
                <p><strong>Nombre:</strong> ${nombreTrabajadorSeleccionado}</p>
                <p><strong>DNI:</strong> ${dniTrabajadorSeleccionado}</p>
                <p><strong>Periodo:</strong> ${periodoSolicitado}</p>
            </div>
            <h1>Calendario Fichajes - ${añoActual}</h1>
            <div class="calendar-container">
    `);

    // Generar los meses dentro del rango solicitado
    for (let mes = inicioRango.month; mes <= finRango.month; mes++) {
      const inicioMes = DateTime.fromObject({
        year: añoActual,
        month: mes,
        day: 1,
      }).setLocale("es");
      const nombreMes = inicioMes.toFormat("MMMM");
      const diasEnMes = inicioMes.daysInMonth ?? 0;
      const inicioSemana = inicioMes.weekday;

      ventanaImpresion.document.write(`
            <div class="calendar-month">
                <h2>${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</h2>
                <div class="calendar-grid">
                    <div class="calendar-day-header">Lun</div>
                    <div class="calendar-day-header">Mar</div>
                    <div class="calendar-day-header">Mié</div>
                    <div class="calendar-day-header">Jue</div>
                    <div class="calendar-day-header">Vie</div>
                    <div class="calendar-day-header">Sáb</div>
                    <div class="calendar-day-header">Dom</div>
        `);

      // Días vacíos al inicio del mes
      for (let i = 1; i < inicioSemana; i++) {
        ventanaImpresion.document.write(`<div class="calendar-day empty"></div>`);
      }

      // Días del mes con fichajes, vacaciones y ausencias solo si están dentro del rango
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaActual = DateTime.fromObject({
          year: añoActual,
          month: mes,
          day: dia,
        }).setLocale("es");
        const dentroDelRango = fechaActual >= inicioRango && fechaActual <= finRango;

        if (!dentroDelRango) {
          ventanaImpresion.document.write(`
                    <div class="calendar-day out-of-range">
                        <p><strong>${dia}</strong></p>
                    </div>
                `);
          continue; // Evitar mostrar información fuera del rango
        }

        const esVacacion = vacacionesTemp.value.some(
          (v) => DateTime.fromFormat(v.fecha, "dd/MM/yyyy").toISODate() === fechaActual.toISODate(),
        );
        const esAusencia = ausenciasTemp.value.find(
          (a) => DateTime.fromFormat(a.fecha, "dd/MM/yyyy").toISODate() === fechaActual.toISODate(),
        );
        const tipoAusencia = esAusencia ? esAusencia.tipo : null;

        const fichajeDia = datosFichajesEmpresa.value.find(
          (f: Fichaje) =>
            f.fichajeEntrada &&
            DateTime.fromISO(f.fichajeEntrada).toISODate() === fechaActual.toISODate(),
        );

        const entradaFormateada = fichajeDia?.fichajeEntrada
          ? DateTime.fromISO(fichajeDia.fichajeEntrada).toFormat("HH:mm")
          : null;
        const salidaFormateada = fichajeDia?.fichajeSalida
          ? DateTime.fromISO(fichajeDia.fichajeSalida).toFormat("HH:mm")
          : null;
        const horas =
          entradaFormateada && salidaFormateada
            ? calcularHorasTotales(entradaFormateada, salidaFormateada)
            : null;

        const tiendaFormateada = fichajeDia?.comentarios
          ? fichajeDia.comentarios.entrada || fichajeDia.comentarios.salida || "APP"
          : "APP";

        const claseDia = esVacacion
          ? "vacation"
          : tipoAusencia === "DIA_PERSONAL"
            ? "absence-dia-personal"
            : tipoAusencia === "HORAS_JUSTIFICADAS"
              ? "absence-horas-justificadas"
              : tipoAusencia === "ABSENTISMO"
                ? "absence-absentismo"
                : tipoAusencia === "SANCIÓN"
                  ? "absence-sancion"
                  : tipoAusencia === "PERMISO MATERNIDAD/PATERNIDAD"
                    ? "absence-maternidad-paternidad"
                    : tipoAusencia === "BAJA"
                      ? "absence-baixa"
                      : fichajeDia
                        ? "active"
                        : "";

        ventanaImpresion.document.write(`
                <div class="calendar-day ${claseDia}">
                    <p><strong>${dia}</strong></p>
                    ${entradaFormateada ? `<p>Entrada: ${entradaFormateada}</p>` : ""}
                    ${salidaFormateada ? `<p>Salida: ${salidaFormateada}</p>` : ""}
                    ${horas ? `<p>Horas: ${horas}</p>` : ""}
                    ${fichajeDia && tiendaFormateada ? `<p>${tiendaFormateada}</p>` : ""}
                </div>
            `);
      }
      ventanaImpresion.document.write(`</div></div>`);
    }

    // Leyenda de permisos al final
    ventanaImpresion.document.write(`
    <div class="legend-container">
        <div>
            <ul>
                <li><span style="color: #ffcc66ff;">Vacaciones:</span>
                    ${
                      vacacionesTemp.value.length > 0
                        ? vacacionesTemp.value
                            .reduce(
                              (agrupado: { inicio: string; fin: string }[], vacacion) => {
                                const ultimaSolicitud = agrupado[agrupado.length - 1];
                                if (
                                  ultimaSolicitud &&
                                  DateTime.fromFormat(ultimaSolicitud.fin, "dd/MM/yyyy")
                                    .plus({ days: 1 })
                                    .toISODate() ===
                                    DateTime.fromFormat(vacacion.fecha, "dd/MM/yyyy").toISODate()
                                ) {
                                  ultimaSolicitud.fin = vacacion.fecha;
                                } else {
                                  agrupado.push({
                                    inicio: vacacion.fecha,
                                    fin: vacacion.fecha,
                                  });
                                }
                                return agrupado;
                              },
                              [] as { inicio: string; fin: string }[],
                            )
                            .map((rango) => `${rango.inicio} al ${rango.fin}`)
                            .join(", ")
                        : "Ninguna"
                    }
                </li>
                <li><span style="color: #ff6666;">Ausencias:</span>
                     ${
                       ausenciasTemp.value.filter((a) => a.tipo === "BAJA").length > 0
                         ? ausenciasTemp.value
                             .filter((a) => a.tipo === "BAJA")
                             .reduce((agrupado: { inicio: string; fin: string }[], ausencia) => {
                               const ultimaSolicitud = agrupado[agrupado.length - 1];
                               if (
                                 ultimaSolicitud &&
                                 DateTime.fromFormat(ultimaSolicitud.fin, "dd/MM/yyyy")
                                   .plus({ days: 1 })
                                   .toISODate() ===
                                   DateTime.fromFormat(ausencia.fecha, "dd/MM/yyyy").toISODate()
                               ) {
                                 ultimaSolicitud.fin = ausencia.fecha;
                               } else {
                                 agrupado.push({
                                   inicio: ausencia.fecha,
                                   fin: ausencia.fecha,
                                 });
                               }
                               return agrupado;
                             }, [])
                             .map((rango) => `${rango.inicio} al ${rango.fin}`)
                             .join(", ")
                         : "Ninguna"
                     }
                </li>
            </ul>
        </div>
        <div>
            <ul>
                <li><span style="color: #ccffcc;">Día Personal:</span>
     ${
       ausenciasTemp.value.filter((a) => a.tipo === "DIA_PERSONAL").length > 0
         ? ausenciasTemp.value
             .filter((a) => a.tipo === "DIA_PERSONAL")
             .sort(
               (a, b) =>
                 DateTime.fromFormat(a.fecha, "dd/MM/yyyy").toMillis() -
                 DateTime.fromFormat(b.fecha, "dd/MM/yyyy").toMillis(),
             )
             .reduce((agrupado: { inicio: string; fin: string }[], ausencia) => {
               const ultimaSolicitud = agrupado[agrupado.length - 1];
               if (
                 ultimaSolicitud &&
                 DateTime.fromFormat(ultimaSolicitud.fin, "dd/MM/yyyy")
                   .plus({ days: 1 })
                   .toISODate() === DateTime.fromFormat(ausencia.fecha, "dd/MM/yyyy").toISODate()
               ) {
                 ultimaSolicitud.fin = ausencia.fecha;
               } else {
                 agrupado.push({
                   inicio: ausencia.fecha,
                   fin: ausencia.fecha,
                 });
               }
               return agrupado;
             }, [])
             .map((rango) =>
               rango.inicio === rango.fin ? `${rango.inicio}` : `${rango.inicio} al ${rango.fin}`,
             )
             .join(", ")
         : "Ninguno"
     }
</li>
<li><span style="color: #caecf4;">Horas Justificadas:</span>
    ${
      ausenciasTemp.value.filter((a) => a.tipo === "HORAS_JUSTIFICADAS").length > 0
        ? ausenciasTemp.value
            .filter((a) => a.tipo === "HORAS_JUSTIFICADAS")
            .reduce((agrupado: { inicio: string; fin: string }[], ausencia) => {
              const ultimaSolicitud = agrupado[agrupado.length - 1];
              if (
                ultimaSolicitud &&
                DateTime.fromFormat(ultimaSolicitud.fin, "dd/MM/yyyy")
                  .plus({ days: 1 })
                  .toISODate() === DateTime.fromFormat(ausencia.fecha, "dd/MM/yyyy").toISODate()
              ) {
                ultimaSolicitud.fin = ausencia.fecha;
              } else {
                agrupado.push({
                  inicio: ausencia.fecha,
                  fin: ausencia.fecha,
                });
              }
              return agrupado;
            }, [])
            .map((rango) => `${rango.inicio} al ${rango.fin}`)
            .join(", ")
        : "Ninguna"
    }
</li>
            </ul>
        </div>
        <div>
            <ul>
                <li><span style="color: #9966ff;">Absentismo:</span>
    ${
      ausenciasTemp.value.filter((a) => a.tipo === "ABSENTISMO").length > 0
        ? ausenciasTemp.value
            .filter((a) => a.tipo === "ABSENTISMO")
            .reduce((agrupado: { inicio: string; fin: string }[], ausencia) => {
              const ultimaSolicitud = agrupado[agrupado.length - 1];
              if (
                ultimaSolicitud &&
                DateTime.fromFormat(ultimaSolicitud.fin, "dd/MM/yyyy")
                  .plus({ days: 1 })
                  .toISODate() === DateTime.fromFormat(ausencia.fecha, "dd/MM/yyyy").toISODate()
              ) {
                ultimaSolicitud.fin = ausencia.fecha;
              } else {
                agrupado.push({
                  inicio: ausencia.fecha,
                  fin: ausencia.fecha,
                });
              }
              return agrupado;
            }, [])
            .map((rango) => `${rango.inicio} al ${rango.fin}`)
            .join(", ")
        : "Ninguno"
    }
</li>
<li><span style="color: #bb0000;">Sanción:</span>
    ${
      ausenciasTemp.value.filter((a) => a.tipo === "SANCIÓN").length > 0
        ? ausenciasTemp.value
            .filter((a) => a.tipo === "SANCIÓN")
            .reduce((agrupado: { inicio: string; fin: string }[], ausencia) => {
              const ultimaSolicitud = agrupado[agrupado.length - 1];
              if (
                ultimaSolicitud &&
                DateTime.fromFormat(ultimaSolicitud.fin, "dd/MM/yyyy")
                  .plus({ days: 1 })
                  .toISODate() === DateTime.fromFormat(ausencia.fecha, "dd/MM/yyyy").toISODate()
              ) {
                ultimaSolicitud.fin = ausencia.fecha;
              } else {
                agrupado.push({
                  inicio: ausencia.fecha,
                  fin: ausencia.fecha,
                });
              }
              return agrupado;
            }, [])
            .map((rango) => `${rango.inicio} al ${rango.fin}`)
            .join(", ")
        : "Ninguno"
    }
</li>
            </ul>
        </div>
        <div>
            <ul>
                <li><span style="color: #00bfff">Permiso Maternidad/Paternidad:</span>
    ${
      ausenciasTemp.value.filter((a) => a.tipo === "PERMISO MATERNIDAD/PATERNIDAD").length > 0
        ? ausenciasTemp.value
            .filter((a) => a.tipo === "PERMISO MATERNIDAD/PATERNIDAD")
            .reduce((agrupado: { inicio: string; fin: string }[], ausencia) => {
              const ultimaSolicitud = agrupado[agrupado.length - 1];
              if (
                ultimaSolicitud &&
                DateTime.fromFormat(ultimaSolicitud.fin, "dd/MM/yyyy")
                  .plus({ days: 1 })
                  .toISODate() === DateTime.fromFormat(ausencia.fecha, "dd/MM/yyyy").toISODate()
              ) {
                ultimaSolicitud.fin = ausencia.fecha;
              } else {
                agrupado.push({
                  inicio: ausencia.fecha,
                  fin: ausencia.fecha,
                });
              }
              return agrupado;
            }, [])
            .map((rango) => `${rango.inicio} al ${rango.fin}`)
            .join(", ")
        : "Ninguno"
    }
</li>

            </ul>
        </div>
    </div>
`);
    ventanaImpresion.document.write(`</div></body></html>`);
    ventanaImpresion.document.close();
    if (ventanaImpresion) {
      if (ventanaImpresion) {
        ventanaImpresion.print();
      }
    }
  }
  ventanaImpresion!.print();
}

async function getAusencias(fechaInicio: any, fechaFinal: any, seleccionarTrabajador: any) {
  try {
    console.log(seleccionarTrabajador.value.value);

    ausenciasTemp.value = [];
    const inicioRango =
      typeof fechaInicio === "string"
        ? DateTime.fromFormat(fechaInicio, "dd/MM/yyyy")
        : fechaInicio;
    const finRango =
      typeof fechaFinal === "string"
        ? DateTime.fromFormat(fechaFinal, "dd/MM/yyyy").endOf("day")
        : fechaFinal;

    if (!inicioRango.isValid || !finRango.isValid) {
      throw new Error("Formato de fecha inválido. Usa 'dd/MM/yyyy'.");
    }

    const respGetAusencia = await axiosInstanceAnonymous.get("ausencias/getAusencias");

    if (respGetAusencia.data.ok) {
      const ausenciasFiltradas = respGetAusencia.data.data.filter((ausencia: any) => {
        const fechaInicioAus = DateTime.fromISO(ausencia.fechaInicio);
        const fechaFinalAus = DateTime.fromISO(ausencia.fechaFinal);
        return (
          ausencia.idUsuario === seleccionarTrabajador.value.value &&
          fechaInicioAus <= finRango &&
          fechaFinalAus >= inicioRango
        );
      });

      // Guardar en la variable temporal
      ausenciasFiltradas.forEach((ausencia: any) => {
        let fechaActual = DateTime.fromISO(ausencia.fechaInicio);
        const fechaFin = DateTime.fromISO(ausencia.fechaFinal);

        while (fechaActual <= fechaFin) {
          ausenciasTemp.value.push({
            fecha: fechaActual.toFormat("dd/MM/yyyy"),
            tipo: ausencia.tipo,
            class: determinarClaseAusencia(ausencia.tipo),
          });
          fechaActual = fechaActual.plus({ days: 1 });
        }
      });
    }
  } catch (error) {
    console.error("Error al obtener ausencias:" + error);
    Swal.fire("Error al obtener ausencias", "Ha habido un error", "error");
  }
}

async function cargarSolicitudes(fechaInicio: any, fechaFinal: any, seleccionarTrabajador: any) {
  try {
    vacacionesTemp.value = [];
    const inicioRango =
      typeof fechaInicio === "string"
        ? DateTime.fromFormat(fechaInicio, "dd/MM/yyyy")
        : fechaInicio;
    const finRango =
      typeof fechaFinal === "string"
        ? DateTime.fromFormat(fechaFinal, "dd/MM/yyyy").endOf("day")
        : fechaFinal;

    if (!inicioRango.isValid || !finRango.isValid) {
      throw new Error("Formato de fecha inválido. Usa 'dd/MM/yyyy'.");
    }
    const year = inicioRango.year;

    const response = await axiosInstanceAnonymous.get("solicitud-vacaciones/getSolicitudes", {
      params: {
        year: year,
      },
    });

    if (response.data.ok) {
      const solicitudesFiltradas = response.data.data.filter((solicitud: any) => {
        const fechaInicioSol = DateTime.fromFormat(solicitud.fechaInicio, "dd/MM/yyyy");
        const fechaFinSol = DateTime.fromFormat(solicitud.fechaFinal, "dd/MM/yyyy");
        return (
          solicitud.idBeneficiario === seleccionarTrabajador.value.value &&
          solicitud.estado === "APROBADA" &&
          fechaInicioSol <= finRango &&
          fechaFinSol >= inicioRango
        );
      });

      // Guardar en la variable temporal
      solicitudesFiltradas.forEach((solicitud: any) => {
        let fechaActual = DateTime.fromFormat(solicitud.fechaInicio, "dd/MM/yyyy");
        const fechaFin = DateTime.fromFormat(solicitud.fechaFinal, "dd/MM/yyyy");

        while (fechaActual <= fechaFin) {
          vacacionesTemp.value.push({
            fecha: fechaActual.toFormat("dd/MM/yyyy"),
            tipo: "VACACIONES",
            class: "evento-vacaciones",
          });
          fechaActual = fechaActual.plus({ days: 1 });
        }
      });
    }
  } catch (error) {
    console.error("Error al cargar solicitudes:" + error);
    Swal.fire("Error al cargar solicitudes" + error, "error");
  }
}

// Función para determinar clase CSS según el tipo de ausencia
function determinarClaseAusencia(tipo: any) {
  switch (tipo) {
    case "BAJA":
      return "evento-ausencia";
    case "DIA_PERSONAL":
      return "evento-DiaPersonal";
    case "HORAS_JUSTIFICADAS":
      return "evento-HorasJustificadas";
    case "PERMISO MATERNIDAD/PATERNIDAD":
      return "evento-MaternidadPaternidad";
    case "ABSENTISMO":
      return "evento-Absentisme";
    case "SANCIÓN":
      return "evento-Sanció";
    default:
      return "evento-otros";
  }
}

onMounted(() => {
  // getTrabajadores();
  getTrabajadoresTienda();
});
</script>

<style lang="scss" scoped>
.roundIcon {
  background-color: #c6f5d5;
}

.calendar-header {
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header h3 {
  font-size: 1.5rem;
  flex-grow: 1;
  text-align: center;
  margin: 0;
}

.calendar-header button {
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.calendar-header button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* Siete columnas siempre */
  gap: 0.5rem;
  width: 100%;
  margin: 0 auto;
}

.calendar-day-header {
  font-weight: bold;
  text-align: center;
  font-size: 1rem;
  padding: 0.5rem 0;
  background-color: #f4f4f4;
}

.calendar-day {
  border: 1px solid #ccc;
  padding: 0.5rem;
  min-height: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calendar-day.empty {
  background-color: #f9f9f9;
}

.calendar-day.active {
  background-color: #fff;
}

.day-number {
  font-size: 1.2rem;
  font-weight: bold;
}

.calendar-day p {
  font-size: 0.8rem;
  margin: 0.2rem 0;
}

/* Estilos responsivos */
@media (max-width: 1024px) {
  /* Tablets */
  .calendar-grid {
    grid-template-columns: repeat(7, 1fr); /* Siete columnas para tablets también */
  }

  .calendar-header h3 {
    font-size: 1.3rem;
  }

  .calendar-day {
    min-height: 4.5rem;
    padding: 0.4rem;
  }

  .day-number {
    font-size: 1.1rem;
  }

  .calendar-day p {
    font-size: 0.7rem;
  }
}

@media (max-width: 768px) {
  /* Pantallas medianas */
  .calendar-grid {
    grid-template-columns: repeat(7, 1fr); /* Mantener siete columnas para evitar desajustes */
    gap: 0.3rem;
  }

  .calendar-header h3 {
    font-size: 1.2rem;
  }

  .calendar-day {
    min-height: 4rem;
    padding: 0.3rem;
  }

  .day-number {
    font-size: 1rem;
  }

  .calendar-day p {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  /* Pantallas pequeñas (móviles) */
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(40px, 1fr));
    overflow-x: auto;
  }

  .calendar-day-header {
    font-size: 0.6rem;
  }

  .calendar-day p {
    font-size: 0.5rem;
    word-break: break-word;
    text-align: center;
  }

  .day-number {
    font-size: 0.9rem;
  }

  .calendar-day p {
    font-size: 0.5rem;
  }
}
.evento-ausencia {
  background-color: #ff6666;
}

.evento-vacaciones {
  background-color: #ffcc66;
}

.evento-DiaPersonal {
  background-color: #ccffcc;
}

.evento-HorasJustificadas {
  background-color: #caecf4;
}

.evento-Absentisme {
  background-color: #9966ff;
}

.evento-Sanció {
  background-color: #bb0000;
}

.evento-MaternidadPaternidad {
  background-color: deepskyblue;
}

h5 {
  color: #e66c5a;
}

label {
  color: #e66c5a;
  font-weight: bold;
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

@media screen and (max-width: 768px) {
  .table-responsive:not(.no-responsive) thead {
    display: none !important;
  }

  .table-responsive:not(.no-responsive) tbody tr {
    display: block;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: #fff;
    margin-bottom: 1rem;
  }

  .table-responsive:not(.no-responsive) td {
    display: flex;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  .table-responsive:not(.no-responsive) td::before {
    content: attr(data-th);
    font-weight: bold;
    color: #6c757d;
    flex: 1;
    text-align: left;
  }

  .table-responsive:not(.no-responsive) td:last-child {
    border-bottom: none;
  }
}
</style>
