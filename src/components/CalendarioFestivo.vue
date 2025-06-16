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
      <div><div class="spinner-border" role="status" style="width: 5rem; height: 5rem">
  <span class="visually-hidden">Loading...</span>
</div></div>
    </div>
    <template v-else>
      <div class="row mt-2">
        <div class="col-md-4 mb-3" v-for="(month, index) in months" :key="month">
          <div class="calendar-container">
            <div class="calendar-grid-semanas">
              <div
                class="week-number"
                v-for="semanas in calculateWeekNumbers(year)[index + 1]"
                :key="`semana-${index}-${semanas}`"
              >
                {{ semanas }}
              </div>
            </div>

            <!-- Grid para el calendario-->
            <div class="calendar-grid">
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
  <div class="modal" tabindex="-1"
    id="exampleModalCenter"
    labelledby="exampleModalCenterTitle"
    centered
  >
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalCenterTitle">Configurar Evento </h5>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <span for="titulo" class="form-label">Titulo:</span>
        <div class="input-group mb-3">
  <span class="input-group-text" id="basic-addon1">@</span>
  <input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
</div>
      </div>
      <div class="mb-3">
        <span for="descripcion" class="form-label">Descripcion:</span>
        <div class="input-group mb-3">
  <span class="input-group-text" id="basic-addon1">@</span>
  <input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
</div>
      </div>

      <div class="mb-3">
  <label for="fechaInicio" class="form-label">Fecha de inicio:</label>
  <input
    id="fechaInicio"
    type="date"
    class="form-control"
    v-model="fechaInicio"
    required
  />
</div>
<div class="mb-3">
  <label for="fechaFinal" class="form-label">Fecha de finalización:</label>
  <input
    id="fechaFinal"
    type="date"
    class="form-control"
    v-model="fechaFinal"
    required
  />
</div>

      <div class="mb-3">
        <div class="form-text">
          <span>Color del evento:</span>
        </div>

        <input type="color" id="colorEvento" class="form-control" v-model="colorEvento" />
      </div>
      <div class="input-group mb-3">
        <div class="form-check">
  <input class="form-check-input" type="checkbox" value="" id="checkDefault">
  <label class="form-check-label" for="checkDefault">
    Todas las tiendas
  </label>
      </div>
      <label v-if="!todas" for="basic-url" class="form-label">Enviar a la tienda: </label>
      <div v-if="!todas" class="input-group mb-3">
        <select class="form-select"
          multiple
          filter
          :select-all="false"
          :search-placeholder="'Buscar'"
          options-selected-label="tienda/s seleccionada/s"
        />
      </div>

      <div class="form-text">
        <span>Categoria</span>
      </div>
      <select v-model="categoriaRes" class="form-select" aria-label="Default select example">
        <option value="Fiesta">Fiesta</option>
        <option value="Reunión">Reunión</option>
        <option value="General">General</option>
        <option value="Pluses">Pluses</option>
      </select>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn" color="secondary" @click="exampleModalCenter = false"> Cerrar </button>
      <button type="button" class="btn" color="primary" @click="guardarFinal()"> Confirmar </button>
    </div>
  </div>
  </div>

  <!-- Modal editar evento -->
  <div class="modal" tabindex="-1"
    id="modalEditarEvento"
    labelledby="modalEditarEventoTitle"
    centered
  >
    <div class="modal-body">
      <div class="row">
        <div class="card-title">
          <div class="fs-4 mb-3">
  <span class="input-group-text" id="basic-addon1">@</span>
  <input type="text" class="form-control" placeholder="Titulo" aria-label="Titulo" aria-describedby="basic-addon1" style="outline: none">
</div>
        </div>
        <div class="mb-3">
          <span for="descripcion" class="form-label">Descripcion:</span>
          <div class="input-group mb-3">
  <span class="input-group-text" id="basic-addon1"></span>
  <input type="text" class="form-control" placeholder="Descripcion" aria-describedby="basic-addon1">
</div>
        </div>
        <!-- Selector de fecha de inicio -->
        <div class="mb-3">
          <span for="fechaInicio" class="form-label">Fecha de inicio:</span>
          <MDBDatepicker
            v-model="fechaInicio"
            label="Selecciona una fecha"
            input-toggle
            format="DD/MM/YYYY"
          />
        </div>

        <!-- Selector de fecha de finalización -->
        <div class="mb-3">
  <label for="fechaFinal" class="form-label">Selecciona una fecha:</label>
  <input
    id="fechaInicio"
    type="date"
    class="form-control"
    v-model="fechaInicio"
    required
  />
        </div>

        <!-- Selector de color del evento -->
        <div class="mb-3">
          <div class="form-text">
            <span>Color del evento:</span>
          </div>

          <input type="color" id="colorEvento" class="form-control" v-model="colorEvento" />
        </div>
        <div class="input-group mb-3">
          <div class="form-check">
  <input class="form-check-input" type="checkbox" value="" id="checkDefault">
  <label class="form-check-label" for="checkDefault">
    Todas las tiendas
  </label>
        </div>
        <label v-if="!todas" for="basic-url" class="form-label">Enviar a la tienda: </label>
        <div v-if="!todas" class="input-group mb-3">
          <select class="form-select"
            multiple
            filter
            :select-all="false"
            :search-placeholder="'Buscar'"
            options-selected-label="tienda/s seleccionada/s"
          />
        </div>

        <div class="form-text">
          <span>Categoria</span>
        </div>
        <select v-model="categoriaRes" class="form-select" aria-label="Default select example">
          <option value="Fiesta">Fiesta</option>
          <option value="Reunión">Reunión</option>
          <option value="General">General</option>
          <option value="Cierre pluses">Cierre pluses</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn" color="secondary" @click="modalEditarEvento = false"> Descartar </button>
      <button type="button" class="btn" color="danger" @click="borrarFestivo()"> Borrar </button>
      <button type="button" class="btn" color="primary" @click="confirmarEdicion()"> Modificar </button>
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
const exampleModalCenter = ref(false);
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

    return; // Sale de la función para evitar mostrar el Swal
  }

  const eventInfo: string = getEventInfo(day.date);

  // Divide la información de eventos en eventos individuales
  const events = eventInfo.split(/Evento:/g).slice(1);

  // Filtra eventos vacíos o no válidos
  const validEvents = events.filter((event: any) => event.trim().length > 0);

  if (validEvents.length > 0) {
    const formattedEvents = validEvents.map((event: any) => {
      return `<div>
    <strong>Evento:</strong>${event}
  </div>`;
    });

    const formattedEventInfo = formattedEvents
      .join("<hr>") // Usa una línea horizontal como separador entre eventos
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
    // No hay eventos válidos para mostrar
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
    // let backgroundColor = eventsForDay[0].color;
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
    return {}; // Devuelve un objeto vacío si no hay eventos
  }
}

//Informacion de eventos/festivos
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
  // Obtener el día de la semana del primer día del mes (1 = lunes, 7 = domingo)
  const firstDayOfMonth = DateTime.local(year.value, monthIndex + 1, 1);
  const dayOfWeek = firstDayOfMonth.weekday;
  // Alinea los días vacíos para que el lunes sea el inicio de la semana
  const emptyDays = dayOfWeek === 7 ? 6 : dayOfWeek - 1;
  return Array.from({ length: emptyDays }, () => "");
}

//Nuevo festivo
async function nuevoFestivo() {
  titulo.value = "";
  descripcion.value = "";
  fechaInicio.value = "";
  fechaFinal.value = "";
  categoriaRes.value = "";
  colorEvento.value = "#FFFFFF";
  tiendaSeleccionada.value = "";
  exampleModalCenter.value = true;
}

//Abrir modal
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

//Verificar el editado
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

//Editar evento
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

//Borrar festivo/Evento
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

//Confirmar si hay eventos para editar
function checkEventAndEdit(day: any) {
  const eventForDay = events.value.find((event) => {
    const eventStartDate = DateTime.fromFormat(event.fechaInicio, "dd/MM/yyyy");
    const eventEndDate = DateTime.fromFormat(event.fechaFinal, "dd/MM/yyyy");
    // Comprobar si la fecha del día está dentro del rango (incluyendo ambas fechas)
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
          // Cierra el modal
          exampleModalCenter.value = false;
          console.log("Evento añadido con éxito");

          // Actualizar la lista de eventos
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

//Obtener festivos / pluses de año
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

        // Filtra los eventos por el año seleccionado y el año anterior
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

    // Inicio de un nuevo evento
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }

    // Fin del evento actual
    if (line === "END:VEVENT") {
      if (currentEvent) {
        events.push(currentEvent);
      }
      currentEvent = null;
      continue;
    }

    // Si estamos dentro de un evento, procesamos la línea
    if (currentEvent) {
      // Manejar líneas continuadas (las que empiezan con espacio o tabulador)
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
  // Limpiamos el string de fecha
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
          color: "#FFFFFF", // Color por defecto para festivos
          categoria: "Fiesta",
          tienda: [-1], // Todas las tiendas por defecto
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

// Función para guardar los festivos en la base de datos
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

// Función principal que maneja la importación del archivo
async function importarFestivosICS(file: any, año: any, axiosInstance: any) {
  try {
    loading.value = true;
    // Leer el archivo
    const fileContent = await file.text();

    // Procesar festivos del año especificado
    const festivos = await procesarFestivosICS(fileContent, año);

    if (festivos.length === 0) {
      throw new Error(`No se encontraron festivos para el año ${año}`);
    }

    // Guardar los festivos procesados
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

.month-header {
  padding: 0.2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #000000;
  grid-column: 1 / -1; /* Ocupa todas las columnas */
  background-color: rgb(180, 180, 180);
}

.calendar-day-header,
.empty {
  padding: 0.1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day-header {
  background-color: rgb(223, 223, 223);
}

.calendar-grid {
  grid-column: 2 / 3; /* Coloca los días del mes en la segunda columna */
  grid-row: 2 / -1; /* Extiende desde la segunda fila hasta el final */
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7 días de la semana */
  grid-template-rows: repeat(6, var(--calendar-row-height)); /* 6 filas para las semanas */
  gap: 0.1rem;
  border: 1px solid #000000;
  min-height: 250px;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--calendar-row-height);
}

.calendar-grid-semanas {
  grid-column: 1 / 2; /* Coloca los números de las semanas en la primera columna */
  grid-row: 2 / -1; /* Extiende desde la segunda fila hasta el final */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.1rem 0;
}
.calendar-container {
  display: grid;
  grid-template-columns: 30px 1fr;
  grid-template-rows: auto repeat(6, var(--calendar-row-height));
  gap: 0.2rem;
}

.week-number {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--calendar-row-height);

  margin-top: 0.199rem;
  margin-bottom: 0.528rem;
}

:root {
  --calendar-row-height: 40px; // Esta es la altura de las filas del calendario
}

.calendar-month-container {
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

/* Contenedor del calendario */
.calendar-container {
  flex: 1; /* Que el calendario ocupe la mayor parte del espacio */
  min-width: 250px;
}

/* Contenedor de eventos al lado del mes */
.event-category {
  margin-left: 30px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
  font-size: 1rem;
  max-width: 160px;
  align-self: flex-start; /* Mantenerlo arriba */
}

/* Diseño responsivo para pantallas pequeñas */
@media (max-width: 768px) {
  .col-md-4 {
    flex-direction: column;
    max-width: 100%;
  }

  .event-category {
    margin-left: 30px;
    margin-top: 10px;
    width: 100%;
  }
}
</style>
