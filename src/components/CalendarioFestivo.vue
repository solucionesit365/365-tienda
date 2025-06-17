<template>
  <div class="card border-top border-5 mt-3">
    <div class="text-center mb-2 mt-1" v-if="!hasPermission('GestionCalendarioFestivo')">
      <h5>
        <strong>CALENDARIO PLUSES {{ añoSelect }}</strong>
      </h5>
    </div>
    <div
      class="row align-items-center justify-content-center"
      v-if="hasPermission('GestionCalendarioFestivo')"
    >
      <div class="col-auto">
        <select v-model="añoSelect" class="form-select form-select-lg mb-3">
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <!-- Botón de evento -->
      <div class="col-auto">
        <button class="btn btn-primary mb-3" @click="nuevoFestivo">Crear Evento</button>
      </div>
      <div class="col-auto">
        <input
          type="file"
          accept=".ics"
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
        />
        <button class="btn btn-primary mb-3 ms-2" @click="fileInput && fileInput.click()">
          Importar Festivos
        </button>
      </div>
    </div>
    <div v-if="loading" class="row text-center mt-2">
      <div>
        <div class="spinner-border" role="status" style="width: 5rem; height: 5rem">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
    <template v-else>
      <div class="row mt-2">
        <div class="col-md-4 mb-3" v-for="(month, index) in months" :key="month">
          <div class="calendar-container d-flex">
            <!-- Números de semana -->
            <div
              class="calendar-week-numbers d-flex flex-column align-items-center justify-content-end me-2"
            >
              <div class="calendar-week-header"></div>
              <div
                v-for="semanas in calculateWeekNumbers(year)[index + 1]"
                :key="`semana-${index}-${semanas}`"
                class="week-number"
              >
                {{ semanas }}
              </div>
            </div>
            <!-- Calendario -->
            <div class="calendar-grid flex-grow-1">
              <div class="month-header">
                {{ month }}
              </div>
              <div class="calendar-day-header" v-for="day in daysOfWeek" :key="day">
                {{ day }}
              </div>
              <div
                v-for="emptyDay in getEmptyDaysBeforeStartOfMonth(index)"
                :key="`empty-${emptyDay}`"
                class="calendar-day empty"
              ></div>

              <div
                v-for="day in getDaysInMonth(index)"
                :key="day.date.toISO() || day.date.toString()"
                :style="getEventClass(day.date)"
                class="calendar-day"
                :title="getEventInfo(day.date)"
                @click="handleDayTouch(day)"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
          <!-- Mostrar categorías -->
          <div
            class="event-category"
            v-if="showCategoryForMonth(index)"
            :style="{
              backgroundColor: getCategoryEventsForMonth(index)[0]?.color || '#FFFFFF',
            }"
          >
            <p v-for="event in getCategoryEventsForMonth(index)" :key="event.titulo">
              <strong>{{ event.titulo }}</strong>
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Modal crear evento -->
  <div
    class="modal fade"
    tabindex="-1"
    id="modalCrearEvento"
    aria-labelledby="exampleModalCenterTitle"
    aria-modal="true"
    role="dialog"
    :class="{ show: modalCrearEvento }"
    :style="modalCrearEvento ? 'display: block; background: rgba(0,0,0,0.5);' : ''"
    v-if="modalCrearEvento"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow rounded-4">
        <div class="modal-header bg-primary bg-opacity-10 border-0 rounded-top-4">
          <h5 class="modal-title" id="modalEditarEventoTitle">Editar Evento</h5>
          <button type="button" class="btn-close" @click="modalCrearEvento = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="tituloEdit" class="form-label">Título:</label>
            <input
              id="tituloEdit"
              type="text"
              class="form-control"
              placeholder="Título"
              v-model="titulo"
              required
            />
          </div>
          <div class="mb-3">
            <label for="descripcionEdit" class="form-label">Descripción:</label>
            <input
              id="descripcionEdit"
              type="text"
              class="form-control"
              placeholder="Descripción"
              v-model="descripcion"
              required
            />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="fechaInicioEdit" class="form-label">Fecha de inicio:</label>
              <input
                id="fechaInicioEdit"
                type="date"
                class="form-control"
                v-model="fechaInicio"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="fechaFinalEdit" class="form-label">Fecha de finalización:</label>
              <input
                id="fechaFinalEdit"
                type="date"
                class="form-control"
                v-model="fechaFinal"
                required
              />
            </div>
          </div>
          <div class="mb-3">
            <label for="colorEventoEdit" class="form-label">Color del evento:</label>
            <input
              type="color"
              id="colorEventoEdit"
              class="form-control form-control-color"
              v-model="colorEvento"
              style="width: 3rem; height: 2.5rem; padding: 0.2rem"
            />
          </div>
          <div class="mb-3">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="checkTodasTiendasEdit"
                v-model="todas"
              />
              <label class="form-check-label" for="checkTodasTiendasEdit">
                Todas las tiendas
              </label>
            </div>
          </div>
          <div class="mb-3" v-if="!todas">
            <label for="tiendaSeleccionadaEdit" class="form-label">Enviar a la tienda:</label>
            <select
              id="tiendaSeleccionadaEdit"
              class="form-select"
              v-model="tiendaSeleccionada"
              multiple
              required
            >
              <option v-for="tienda in tiendas" :key="tienda.value" :value="tienda.value">
                {{ tienda.text }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label for="categoriaEdit" class="form-label">Categoría</label>
            <select id="categoriaEdit" v-model="categoriaRes" class="form-select" required>
              <option value="Fiesta">Fiesta</option>
              <option value="Reunión">Reunión</option>
              <option value="General">General</option>
              <option value="Cierre pluses">Cierre pluses</option>
            </select>
          </div>
        </div>
        <div class="modal-footer bg-light border-0 rounded-bottom-4">
          <button type="button" class="btn" color="primary" @click="guardarFinal()">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal editar evento -->
  <div
    class="modal fade"
    tabindex="-1"
    id="modalEditarEvento"
    aria-labelledby="modalEditarEventoTitle"
    aria-modal="true"
    role="dialog"
    :class="{ show: modalEditarEvento }"
    :style="modalEditarEvento ? 'display: block; background: rgba(0,0,0,0.5);' : ''"
    v-if="modalEditarEvento"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow rounded-4">
        <div class="modal-header bg-primary bg-opacity-10 border-0 rounded-top-4">
          <h5 class="modal-title" id="modalEditarEventoTitle">Editar Evento</h5>
          <button type="button" class="btn-close" @click="modalEditarEvento = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="tituloEdit" class="form-label">Título:</label>
            <input
              id="tituloEdit"
              type="text"
              class="form-control"
              placeholder="Título"
              v-model="titulo"
              required
            />
          </div>
          <div class="mb-3">
            <label for="descripcionEdit" class="form-label">Descripción:</label>
            <input
              id="descripcionEdit"
              type="text"
              class="form-control"
              placeholder="Descripción"
              v-model="descripcion"
              required
            />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="fechaInicioEdit" class="form-label">Fecha de inicio:</label>
              <input
                id="fechaInicioEdit"
                type="date"
                class="form-control"
                v-model="fechaInicio"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="fechaFinalEdit" class="form-label">Fecha de finalización:</label>
              <input
                id="fechaFinalEdit"
                type="date"
                class="form-control"
                v-model="fechaFinal"
                required
              />
            </div>
          </div>
          <div class="mb-3">
            <label for="colorEventoEdit" class="form-label">Color del evento:</label>
            <input
              type="color"
              id="colorEventoEdit"
              class="form-control form-control-color"
              v-model="colorEvento"
              style="width: 3rem; height: 2.5rem; padding: 0.2rem"
            />
          </div>
          <div class="mb-3">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="checkTodasTiendasEdit"
                v-model="todas"
              />
              <label class="form-check-label" for="checkTodasTiendasEdit">
                Todas las tiendas
              </label>
            </div>
          </div>
          <div class="mb-3" v-if="!todas">
            <label for="tiendaSeleccionadaEdit" class="form-label">Enviar a la tienda:</label>
            <select
              id="tiendaSeleccionadaEdit"
              class="form-select"
              v-model="tiendaSeleccionada"
              multiple
              required
            >
              <option v-for="tienda in tiendas" :key="tienda.value" :value="tienda.value">
                {{ tienda.text }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label for="categoriaEdit" class="form-label">Categoría</label>
            <select id="categoriaEdit" v-model="categoriaRes" class="form-select" required>
              <option value="Fiesta">Fiesta</option>
              <option value="Reunión">Reunión</option>
              <option value="General">General</option>
              <option value="Cierre pluses">Cierre pluses</option>
            </select>
          </div>
        </div>
        <div class="modal-footer bg-light border-0 rounded-bottom-4">
          <button type="button" class="btn btn-danger" @click="borrarFestivo()">Borrar</button>
          <button type="button" class="btn btn-primary" @click="confirmarEdicion()">
            Modificar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, type Ref } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import { hasPermission } from "@/components/rolesPermisos";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const fileInput = ref<HTMLInputElement | null>(null);
const modalCrearEvento = ref(false);
const modalEditarEvento = ref(false);
const categoriaRes = ref("");
const todas = ref(true);
const tiendas: Ref<any[]> = ref([]);
const tiendaSeleccionada = ref("");
const titulo = ref("");
const descripcion = ref("");
const fechaInicio = ref("");
const fechaFinal = ref("");
const colorEvento = ref("");
const loading = ref(true);
const error = ref(false);
const currentUser = computed(() => userStore.user);
let eventoActual: any;

const months = [
  "GENER",
  "FEBRER",
  "MARÇ",
  "ABRIL",
  "MAIG",
  "JUNY",
  "JULIOL",
  "AGOST",
  "SETEMBRE",
  "OCTUBRE",
  "NOVEMBRE",
  "DESEMBRE",
];
const year = ref(DateTime.now().year);
const añoSelect = ref(year.value);
const daysOfWeek = ref(["L", "M", "X", "J", "V", "S", "D"]);

interface Event {
  fechaInicio: string;
  fechaFinal: string;
  titulo: string;
  descripcion: string;
  color: string;
  categoria: string;
  tienda: number[];
}

const events = ref<Event[]>([]);

// const emptyDaysCount = (monthIndex: any) => {
//   return getEmptyDaysBeforeStartOfMonth(monthIndex).length;
// };

// const emptyDayRowStart = (monthIndex: any) => {
//   //Calcular la fila de inicio para los días vacíos basándose en el mes
//   let firstDayOfMonth = DateTime.local(year.value, monthIndex + 1, 1).weekday;
//   firstDayOfMonth = firstDayOfMonth === 7 ? 0 : firstDayOfMonth;
//   return Math.ceil(firstDayOfMonth / 7);
// };

function getDaysInMonth(monthIndex: any) {
  const daysInMonth = DateTime.local(Number(year.value), monthIndex + 1).daysInMonth || 0;
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = DateTime.local(year.value, monthIndex + 1, i + 1);
    return { date, day: i + 1 };
  });
}

function handleDayTouch(day: any) {
  if (hasPermission("GestionCalendarioFestivo")) {
    checkEventAndEdit(day);

    return;
  }

  const eventInfo: string = getEventInfo(day.date);

  const events = eventInfo.split(/Evento:/g).slice(1);

  const validEvents = events.filter((event: any) => event.trim().length > 0);

  if (validEvents.length > 0) {
    const formattedEvents = validEvents.map((event: any) => {
      return `<div>
    <strong>Evento:</strong>${event}
  </div>`;
    });

    const formattedEventInfo = formattedEvents
      .join("<hr>")
      .replace(/Descripción:/g, "<br><strong>Descripción:</strong>")
      .replace(/Fecha:/g, "<br><strong>Fecha:</strong>")
      .replace(/Categoría:/g, "<br><strong>Categoría:</strong>");

    Swal.fire({
      title: "Información del Evento ",
      html: formattedEventInfo,
      icon: "info",
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  } else {
    Swal.fire({
      text: "No hay eventos programados para este día.",
      icon: "info",
    });
  }
}

function getEventClass(date: any) {
  const dateString = date.toISODate();
  const eventsForDay = events.value.filter((event) => {
    const eventStart = DateTime.fromFormat(event.fechaInicio, "dd/MM/yyyy").toISODate();
    const eventEnd = DateTime.fromFormat(event.fechaFinal, "dd/MM/yyyy").endOf("day").toISODate();
    return eventStart && eventEnd && dateString >= eventStart && dateString <= eventEnd;
  });

  if (eventsForDay.length > 0) {
    // eventsForDay.sort((a, b) => {
    //   //Categoria determina la prioridad
    //   return b.categoria.localeCompare(a.categoria);
    // });
    eventsForDay.sort((a, b) => {
      // Aquí usamos 'fechaInicio' como ejemplo, reemplázalo por el campo correspondiente
      return (
        DateTime.fromFormat(a.fechaInicio, "dd/MM/yyyy").toMillis() -
        DateTime.fromFormat(b.fechaInicio, "dd/MM/yyyy").toMillis()
      );
    });
    const backgroundColor = eventsForDay[eventsForDay.length - 1].color;
    const borderCerrar: string[] = [];
    const foreground: string[] = [];

    eventsForDay.forEach((event) => {
      if (event.categoria === "Fiesta") {
        foreground.push("color: red; font-weight: bold;");
      }
      // if (event.categoria === "Cierre bolsa de horas") {
      //   borderCerrar.push("5px solid red"); // Estilo para Cierre bolsa de horas
      // }
    });

    // Combina los estilos de borde
    const combinedBorderStyle = borderCerrar.join(", ");

    // return {
    //   backgroundColor: backgroundColor,
    //   color: foreground,
    //   border: combinedBorderStyle,
    // };
    return `background-color: ${backgroundColor}; border: ${combinedBorderStyle}; ${foreground.join(
      " ",
    )}`;
  } else {
    return {};
  }
}

function getEventInfo(date: any) {
  const dateString = date.toISODate();
  const eventsForDay = events.value.filter((event) => {
    const eventStart = DateTime.fromFormat(event.fechaInicio, "dd/MM/yyyy").toISODate();
    const eventEnd = DateTime.fromFormat(event.fechaFinal, "dd/MM/yyyy").endOf("day").toISODate();
    return eventStart && eventEnd && dateString >= eventStart && dateString <= eventEnd;
  });

  if (eventsForDay.length > 0) {
    const eventInfo = eventsForDay
      .map((event) => {
        return `Evento: ${event.titulo}\nDescripción: ${event.descripcion}\nFecha: ${event.fechaInicio} - ${event.fechaFinal}\nCategoría: ${event.categoria}`;
      })
      .join("\n\n");

    return eventInfo;
  } else {
    return "No hay eventos programados para este día.";
  }
}

interface WeekNumbers {
  [month: number]: number[];
}

function calculateWeekNumbers(year: number): WeekNumbers {
  let currentDay = DateTime.local(year, 1, 1);
  const weeks: WeekNumbers = {};

  while (currentDay.year === year) {
    const month = currentDay.month;
    const weekNumber = currentDay.weekNumber;

    if (!weeks[month]) {
      weeks[month] = [];
    }

    if (!weeks[month].includes(weekNumber)) {
      weeks[month].push(weekNumber);
    }

    currentDay = currentDay.plus({ days: 7 });
  }

  return weeks;
}

function getEmptyDaysBeforeStartOfMonth(monthIndex: any) {
  const firstDayOfMonth = DateTime.local(year.value, monthIndex + 1, 1);
  const dayOfWeek = firstDayOfMonth.weekday;
  const emptyDays = dayOfWeek === 7 ? 6 : dayOfWeek - 1;
  return Array.from({ length: emptyDays }, () => "");
}

async function nuevoFestivo() {
  titulo.value = "";
  descripcion.value = "";
  fechaInicio.value = "";
  fechaFinal.value = "";
  categoriaRes.value = "";
  colorEvento.value = "#FFFFFF";
  tiendaSeleccionada.value = "";
  modalCrearEvento.value = true;
}

function abrirModalEdita(evento: any) {
  titulo.value = evento.titulo;
  descripcion.value = evento.descripcion;
  fechaInicio.value = evento.fechaInicio;
  fechaFinal.value = evento.fechaFinal;
  todas.value = evento.todas;
  tiendaSeleccionada.value = evento.tiendaSeleccionada;
  categoriaRes.value = evento.categoria;
  colorEvento.value = evento.color;

  eventoActual = evento;
  modalEditarEvento.value = true;
}

function confirmarEdicion() {
  const eventoEditado = {
    ...eventoActual,
    titulo: titulo.value,
    descripcion: descripcion.value,
    fechaInicio: fechaInicio.value,
    fechaFinal: fechaFinal.value,
    color: colorEvento.value,
    categoria: categoriaRes.value,
    tienda: todas.value
      ? [-1]
      : tiendaSeleccionada.value.split(",").map((idTienda) => Number(idTienda)),
  };
  editarEvento(eventoEditado);
}

function editarEvento(evento: any) {
  axiosInstance
    .post("calendario-festivos/updateFestivo", evento)
    .then((response) => {
      const data = response.data;
      if (data.ok) {
        modalEditarEvento.value = false;
        getFestivos(añoSelect.value);
      } else {
        throw new Error("No se ha podido editar el evento");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function borrarFestivo() {
  if (!eventoActual || !eventoActual._id) {
    Swal.fire("Oops...", "No se ha seleccionado un evento válido para borrar.", "error");
    return;
  }

  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, borrarlo!",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      axiosInstance
        .post("calendario-festivos/deleteFestivo", {
          idFestivo: eventoActual._id,
        })
        .then((response) => {
          if (response.data.ok) {
            modalEditarEvento.value = false;
            getFestivos(añoSelect.value);
            Swal.fire("Borrado!", "El evento ha sido borrado.", "success");
          } else {
            Swal.fire("Error", "Error al borrar el evento.", "error");
          }
        })
        .catch((error) => {
          console.error("Error al borrar el evento: ", error);
          Swal.fire("Error", "Error al borrar el evento.", "error");
        });
    }
  });
}

function checkEventAndEdit(day: any) {
  const eventForDay = events.value.find((event) => {
    const eventStartDate = DateTime.fromFormat(event.fechaInicio, "dd/MM/yyyy");
    const eventEndDate = DateTime.fromFormat(event.fechaFinal, "dd/MM/yyyy");
    return day.date >= eventStartDate && day.date <= eventEndDate;
  });

  if (eventForDay) {
    abrirModalEdita(eventForDay);
  } else {
    nuevoFestivo();
  }
}

function guardarFinal() {
  error.value = false;
  if (!titulo.value) {
    error.value = true;
    Swal.fire("Oops...", "Introduce el titulo", "error");
  }
  if (!fechaInicio.value) {
    error.value = true;
    Swal.fire("Oops...", "Introduce la fecha de inicio", "error");
  }
  if (!fechaFinal.value) {
    error.value = true;
    Swal.fire("Oops...", "Introduce la fecha de finalización", "error");
  }

  if (!categoriaRes.value) {
    error.value = true;
    Swal.fire("Oops...", "Introduce la categoria", "error");
  }
  if (!error.value) {
    const objEnviar = {
      titulo: titulo.value,
      descripcion: descripcion.value,
      fechaInicio: fechaInicio.value,
      fechaFinal: fechaFinal.value,
      color: colorEvento.value,
      categoria: categoriaRes.value,
      tienda: todas.value
        ? [-1]
        : tiendaSeleccionada.value.split(",").map((idTienda) => Number(idTienda)),
    };
    axiosInstance
      .post("calendario-festivos/nuevoFestivo", objEnviar)
      .then((response) => {
        if (response.data.ok) {
          modalCrearEvento.value = false;
          console.log("Evento añadido con éxito");

          getFestivos(añoSelect.value);
        } else {
          console.log("Error al añadir evento", response);
        }
      })
      .catch((error) => {
        console.error("Error al guardar el evento: ", error);
      });
  }
}

function getFestivos(año: any) {
  loading.value = true;
  axiosInstance
    .get("calendario-festivos/getFestivosByTienda", {
      params: {
        tienda: currentUser.value.idTienda,
      },
    })
    .then((response) => {
      if (response.data.ok) {
        loading.value = false;
        const añoSeleccionadoNumero = Number(año);
        const añoAnterior = añoSeleccionadoNumero - 1;

        const eventosFiltrados = response.data.data.filter((evento: any) => {
          const fechaEvento = DateTime.fromFormat(evento.fechaInicio, "dd/MM/yyyy");
          return fechaEvento.year === añoSeleccionadoNumero || fechaEvento.year === añoAnterior;
        });

        events.value = eventosFiltrados.map((evento: any) => ({
          ...evento,
          fechaInicio: evento.fechaInicio,
          fechaFinal: evento.fechaFinal,
          color: evento.color,
        }));
      } else {
        console.error("Error al obtener los eventos: ", response);
      }
    })
    .catch((error) => {
      console.error("Error al obtener los festivos: ", error);
    });
}

function getTiendas() {
  axiosInstance
    .get("tiendas")
    .then((resTiendas) => {
      tiendas.value = resTiendas.data.map((tienda: any) => {
        return { value: tienda.id, text: tienda.nombre };
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

async function handleFileUpload(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const resultado = await importarFestivosICS(file, Number(añoSelect.value), axiosInstance);

    if (resultado.ok) {
      Swal.fire({
        title: "Éxito",
        text: resultado.mensaje,
        icon: "success",
      });

      getFestivos(añoSelect.value);
    } else {
      Swal.fire({
        title: "Error",
        text: resultado.mensaje,
        icon: "error",
      });
    }

    event.target.value = "";
  } catch (error) {
    console.error("Error al importar archivo:", error);
    Swal.fire({
      title: "Error",
      text: "Error al procesar el archivo ICS",
      icon: "error",
    });
  }
}

// Función para parsear el contenido ICS
function parseICS(content: any) {
  const lines = content.split(/\r\n|\n|\r/);
  const events = [];
  interface IcsEvent {
    start?: DateTime;
    end?: DateTime;
    summary?: string;
    description?: string;
  }

  let currentEvent: IcsEvent | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (currentEvent) {
        events.push(currentEvent);
      }
      currentEvent = null;
      continue;
    }

    if (currentEvent) {
      let fullLine = line;
      while (
        i + 1 < lines.length &&
        (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))
      ) {
        fullLine += lines[i + 1].substr(1);
        i++;
      }

      const [key, ...values] = fullLine.split(":");
      const value = values.join(":");

      switch (key) {
        case "DTSTART":
        case "DTSTART;VALUE=DATE":
          currentEvent.start = parseICSDate(value);
          break;
        case "DTEND":
        case "DTEND;VALUE=DATE":
          currentEvent.end = parseICSDate(value);
          break;
        case "SUMMARY":
          currentEvent.summary = value;
          break;
        case "DESCRIPTION":
          currentEvent.description = value;
          break;
      }
    }
  }

  return events;
}

// Función auxiliar para parsear fechas ICS
function parseICSDate(dateStr: any) {
  dateStr = dateStr.replace(/\s+/g, "");

  // Formato básico: YYYYMMDD
  if (dateStr.length === 8) {
    return DateTime.fromFormat(dateStr, "yyyyMMdd");
  }

  // Formato con tiempo: YYYYMMDDTHHmmssZ
  const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})(T\d{6}Z)?$/);
  if (match) {
    const [year, month, day] = match;
    return DateTime.fromFormat(`${year}${month}${day}`, "yyyyMMdd");
  }

  throw new Error(`Formato de fecha no soportado: ${dateStr}`);
}

// Función principal para procesar archivo ICS
async function procesarFestivosICS(fileContent: any, año: any) {
  try {
    const eventos = parseICS(fileContent);
    const festivosAñoSeleccionado = [];

    for (const evento of eventos) {
      const fechaInicio = evento.start;

      // Solo procesar eventos del año especificado
      if (fechaInicio && fechaInicio.year === año) {
        const fechaFin = evento.start || fechaInicio;

        const nuevoFestivo = {
          titulo: evento.summary || "Festivo sin título",
          descripcion: evento.description || "",
          fechaInicio: fechaInicio.toFormat("dd/MM/yyyy"),
          fechaFinal: fechaFin.toFormat("dd/MM/yyyy"),
          color: "#FFFFFF",
          categoria: "Fiesta",
          tienda: [-1],
        };

        festivosAñoSeleccionado.push(nuevoFestivo);
      }
    }

    return festivosAñoSeleccionado;
  } catch (error) {
    console.error("Error al procesar archivo ICS:", error);
    throw error;
  }
}

async function guardarFestivosICS(festivos: any, axiosInstance: any) {
  try {
    const resultados = [];

    for (const festivo of festivos) {
      const response = await axiosInstance.post("calendario-festivos/nuevoFestivo", festivo);
      resultados.push({
        festivo: festivo.titulo,
        exito: response.data.ok,
      });
    }

    return resultados;
  } catch (error) {
    console.error("Error al guardar festivos:", error);
    throw error;
  }
}

async function importarFestivosICS(file: any, año: any, axiosInstance: any) {
  try {
    loading.value = true;
    const fileContent = await file.text();

    const festivos = await procesarFestivosICS(fileContent, año);

    if (festivos.length === 0) {
      throw new Error(`No se encontraron festivos para el año ${año}`);
    }

    const resultados = await guardarFestivosICS(festivos, axiosInstance);

    return {
      ok: true,
      mensaje: `Se procesaron ${festivos.length} festivos para el año ${año}`,
      resultados,
    };
  } catch (error) {
    return {
      ok: false,
      mensaje: "Error al procesar el archivo ICS",
      error,
    };
  } finally {
    loading.value = false;
  }
}

function showCategoryForMonth(monthIndex: any) {
  if (!Array.isArray(events.value) || events.value.length === 0) {
    console.warn("No hay eventos disponibles.");
    return false;
  }

  const firstDayOfMonth = DateTime.local(year.value, monthIndex + 1, 1);

  const hasGeneralEvent = events.value.some((event) => {
    if (!event.fechaInicio || !event.fechaFinal) return false;

    const eventStart = DateTime.fromFormat(event.fechaInicio, "dd/MM/yyyy");
    const eventEnd = DateTime.fromFormat(event.fechaFinal, "dd/MM/yyyy");

    const isGeneral =
      eventStart <= firstDayOfMonth && eventEnd >= firstDayOfMonth && event.categoria === "General";

    return isGeneral;
  });

  return hasGeneralEvent;
}

function getCategoryEventsForMonth(monthIndex: any) {
  const firstDayOfMonth = DateTime.local(year.value, monthIndex + 1, 1);
  return events.value.filter((event) => {
    if (!event.fechaInicio || !event.fechaFinal) return false;

    const eventStart = DateTime.fromFormat(event.fechaInicio, "dd/MM/yyyy");
    const eventEnd = DateTime.fromFormat(event.fechaFinal, "dd/MM/yyyy");

    return (
      eventStart <= firstDayOfMonth && eventEnd >= firstDayOfMonth && event.categoria === "General"
    );
  });
}

watch(añoSelect, (nuevoAño) => {
  year.value = Number(nuevoAño);
  getFestivos(nuevoAño);
});

onMounted(() => {
  getFestivos(añoSelect.value);
  getTiendas();
});
</script>

<style lang="scss" scoped>
.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  margin: 0;
}

.cardDocs {
  background-color: #ffffff;
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  border-top-color: #6b03f4 !important;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

:root {
  --calendar-row-height: 44px;
}

.calendar-container {
  background: #fff;
  border-radius: 1.2em;
  box-shadow: 0 4px 18px rgba(94, 190, 163, 0.1);
  padding: 1.2em 0.7em 0.7em 0.7em;
  margin-bottom: 1.5em;
  border: 1px solid #e66c5a22;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: var(--calendar-row-height, 44px);
  gap: 0.2rem;
}

.month-header {
  grid-column: 1 / -1;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  border-radius: 0.7em 0.7em 0 0;
  letter-spacing: 1px;
  margin-bottom: 0.2em;
  box-shadow: 0 2px 6px rgba(230, 108, 90, 0.07);
  text-align: center;
  padding: 0.5em 0;
}

.calendar-day-header {
  background: #fbeee7;
  color: #e66c5a;
  font-weight: bold;
  border-radius: 0.4em;
  font-size: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}

.calendar-day.empty {
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: default;
}

.calendar-day {
  background: #f8f9fa;
  border-radius: 0.5em;
  font-size: 1.05rem;
  min-height: var(--calendar-row-height);
  box-shadow: 0 1px 3px rgba(230, 108, 90, 0.03);
  position: relative;
  cursor: pointer;
  transition:
    background 0.15s,
    box-shadow 0.15s;
  border: 1px solid #f3e3de;
  display: flex;
  align-items: center;
  justify-content: center;
}
.calendar-day:hover {
  background: #fbeee7;
  box-shadow: 0 2px 8px rgba(230, 108, 90, 0.1);
  z-index: 2;
}

.calendar-day.today {
  border: 2px solid #e66c5a;
  background: #fff7f3;
}

.calendar-grid-semanas {
  grid-column: 1 / 2;
  grid-row: 2 / -1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.1rem 0;
}
.week-number {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--calendar-row-height);
  color: #bdbdbd;
  font-size: 0.95rem;
  font-weight: 500;
  margin-top: 0.199rem;
  margin-bottom: 0.528rem;
}

.event-category {
  margin-left: 30px;
  padding: 10px;
  border: 1px solid #e66c5a44;
  border-radius: 8px;
  background: #fff7f3;
  font-size: 1rem;
  max-width: 180px;
  align-self: flex-start;
  box-shadow: 0 2px 8px rgba(230, 108, 90, 0.07);
}
.event-category p {
  margin-bottom: 0.5em;
  color: #000000;
}
.modal-body {
  padding: 1.5rem;
  background: #fafbfc;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  overflow-y: auto;
  flex: 1 1 auto;
}

.modal-footer {
  border-top: 1px solid #e0e0e0;
  background: #f7f7f7;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .modal-dialog {
    max-width: 98vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.8rem !important;
    padding: 0 !important;
  }
  .modal-header {
    border-top-left-radius: 0.8rem !important;
    border-top-right-radius: 0.8rem !important;
    padding: 1.1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.15rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2.1rem;
    height: 2.1rem;
    font-size: 1.2rem;
    margin-left: 0.7rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.8rem 0.8rem !important;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 600px) {
  .modal-dialog {
    max-width: 99vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.7rem !important;
    padding: 0 !important;
  }
  .modal-header {
    border-top-left-radius: 0.7rem !important;
    border-top-right-radius: 0.7rem !important;
    padding: 1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.1rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
    margin-left: 0.5rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.7rem 0.7rem !important;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
}

@media (max-width: 400px) {
  .modal-title {
    font-size: 1rem;
  }
  .modal-header {
    padding: 0.7rem !important;
  }
  .modal-body,
  .modal-footer {
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }
}
</style>
