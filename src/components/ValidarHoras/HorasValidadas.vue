<template>
  <div>
    <div>
      <h6 class="fs-5 mt-3">
        <i @click="restarSemana()" class="fas fa-angles-left"></i>
        SEMANA
        {{ semanaActual.weekNumber }}
        <i @click="sumarSemana()" class="fas fa-angles-right"></i>
        <span class="ms-3 me-3"></span>
        <i @click="restarAño()" class="fas fa-angles-left"></i>
        AÑO
        {{ añoActual.year }}
        <i @click="sumarAño()" class="fas fa-angles-right"></i>
        <BsButton
          class="ms-4 text-white btn-primary"
          :disabled="loading"
          @click="consultarFichajes()"
        >
          CONSULTAR
        </BsButton>
      </h6>
    </div>
  </div>
  <div class="row" v-if="!loading">
    <div
      v-for="(item, index) in datos"
      v-bind:key="index"
      class="col-12 col-sm-12 col-xl-4 col-md-4 mb-2"
    >
      <div v-if="!item.validado" class="card border border-success">
        <div class="card-header">
          <div class="row">
            <div class="col-6">
              {{ parseFecha2(item.fichajeEntrada).toFormat("dd-LL-y") }}
            </div>
            <div class="col-6 text-end">Semana {{ obtenerNumeroSemana(item.fichajeEntrada) }}</div>
          </div>
        </div>
        <div class="card-body">
          <div>{{ item.nombre }}</div>
          Cuadrante:
          <span
            v-if="
              item.cuadrante &&
              item.cuadrante.inicio &&
              item.cuadrante.final &&
              item.cuadrante.inicio !== item.cuadrante.final
            "
          >
            {{ parseFecha(item.cuadrante.inicio ? item.cuadrante.inicio : item.cuadrante.entrada) }}
            -
            {{ parseFecha(item.cuadrante.final ? item.cuadrante.final : item.cuadrante.salida) }}
            ({{ item.horasCuadrante }})
          </span>
          <span class="text-warning" v-else>SIN CUADRANTE DEFINIDO</span>
          <br />
          Fichaje:
          <span v-if="item.fichajeEntrada">{{ parseFecha(item.fichajeEntrada) }}</span>
          <span v-else class="text-danger">ENTRADA NO FICHADA</span> -
          <span v-if="item.fichajeSalida">{{ parseFecha(item.fichajeSalida) }}</span>
          <span v-else class="text-danger"><i class="fas fa-exclamation-circle"></i></span>
          <span v-if="item.fichajeEntrada && item.fichajeSalida"
            >({{ item.horasfichajeMostrar ? item.horasfichajeMostrar : item.horasFichaje }})</span
          >
          <br />
          Ajustes:
          <span>{{ item.horasExtra }}</span>
        </div>
        <div class="card-footer">
          <div class="row">
            <div class="col-5">
              <BsButton class="me-2">
                {{ item.horasFichaje + item.horasExtra + item.horasCoordinacion }}
              </BsButton>
              <span v-if="item.comentario.entrada">{{ item.comentario.entrada }}</span>
              <span v-else>{{ item.comentario.salida }}</span>
              <span v-if="!item.comentario.entrada && !item.comentario.salida">App</span>
            </div>

            <div class="col-7">
              <div v-if="!item.aPagar" class="text-end">
                <BsButton @click="definirHoras(item)" color="info"> A PAGAR </BsButton>
              </div>
              <div v-else class="text-end">
                <BsButton
                  v-if="item.horasPagar.estadoValidado == 'PENDIENTE'"
                  @click="verSolicitud(item)"
                  color="warning"
                >
                  Pendiente: {{ item.horasPagar.total }}H
                </BsButton>
                <BsButton
                  v-if="item.horasPagar.estadoValidado == 'RECHAZADAS'"
                  @click="verSolicitud(item)"
                  color="danger"
                >
                  Denegada: {{ item.horasPagar.total }}H
                </BsButton>
                <BsButton
                  v-if="item.horasPagar.estadoValidado == 'APROBADAS'"
                  @click="verSolicitud(item)"
                  color="success"
                >
                  Aprobada: {{ item.horasPagar.total }}H
                </BsButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="d-flex justify-content-center mt-3">
    <div class="spinner-border" role="status" style="width: 5rem; height: 5rem">
      <span class="visually-hidden">Cargando...</span>
    </div>
  </div>

  <div v-if="!loading">
    <div v-if="datos.length <= 0" class="row justify-content-center">
      <div class="col-xl-6 col-xs-12 col-12 col-lg-6 text-center">
        <figure class="figure">
          <img
            src="@/assets/img/nodata.png"
            class="rounded mx-auto d-block mt-3 img-fluid"
            alt="..."
            style="width: 70%"
          />
          <figcaption class="figure-caption text-center">
            No hay horas validadas para la semana
            {{ semanaActual.weekNumber }} y el año {{ añoActual.year }}
          </figcaption>
        </figure>
      </div>
    </div>
  </div>

  <!-- MODAL PAGAR HORAS -->
  <div
    v-if="tarjetaPagar"
    class="modal fade"
    :class="{ show: modalPagarHoras }"
    :style="{ display: modalPagarHoras ? 'block' : 'none' }"
    id="modalPagarHoras"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modalPagarHorasTitle"
    aria-modal="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalPagarHorasTitle">Proponer horas a pagar</h5>
          <button type="button" class="btn-close" @click="modalPagarHoras = false"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-6 mt-4">¿Cuántas horas propones a pagar?</div>
            <div class="col-6 mt-4">
              <div class="input-group">
                <button
                  class="input-group-text bg-warning text-light"
                  @click="tarjetaPagar.horasPagar.total -= 0.25"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  class="form-control"
                  v-model="tarjetaPagar.horasPagar.total"
                  step="0.25"
                  disabled
                />
                <button
                  class="input-group-text bg-success text-light"
                  @click="tarjetaPagar.horasPagar.total += 0.25"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div class="col-12 mt-4">
              Comentario:
              <select class="form-select mt-2" v-model="tarjetaPagar.horasPagar.comentario">
                <option disabled value="">Selecciona un comentario</option>
                <option v-for="opt in options1" :key="opt.value" :value="opt.value">
                  {{ opt.text }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <BsButton color="danger" @click="modalPagarHoras = false">Descartar</BsButton>
          <BsButton color="primary" @click="enviarPropuesta()">Proponer</BsButton>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal ya enviados a pagar -->

  <div
    v-if="tarjetaPagar"
    class="modal fade"
    :class="{ show: modalVerSolicitud }"
    :style="{ display: modalVerSolicitud ? 'block' : 'none' }"
    id="modalVerSolicitud"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modalVerSolicitudTitle"
    aria-modal="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalVerSolicitudTitle">Solicitud de pago:</h5>
          <button type="button" class="btn-close" @click="modalVerSolicitud = false"></button>
        </div>
        <div class="modal-body">
          <div class="text-start mb-3">
            COORDINADOR/A: <br />
            <span class="text-muted">{{ tarjetaPagar.horasPagar.comentario }}</span>
          </div>
          <div class="text-end">
            SUPERVISOR/A: <br />
            <span class="text-muted">{{ tarjetaPagar.horasPagar.respSuper }}</span>
            <br />
            <span
              class="badge"
              :class="{
                'bg-warning text-dark': tarjetaPagar.horasPagar.estadoValidado === 'PENDIENTE',
                'bg-success': tarjetaPagar.horasPagar.estadoValidado === 'APROBADAS',
                'bg-danger': tarjetaPagar.horasPagar.estadoValidado === 'RECHAZADAS',
              }"
            >
              {{ tarjetaPagar.horasPagar.estadoValidado }}
            </span>
          </div>
          <div class="row" v-if="tarjetaPagar.horasPagar.estadoValidado !== 'APROBADAS'">
            <div class="mt-4">Editar:</div>
            <div class="col-6 mt-4">¿Cuántas horas propones a pagar?</div>
            <div class="col-6 mt-4">
              <div class="input-group">
                <button
                  class="input-group-text bg-warning text-light"
                  @click="tarjetaPagar.horasPagar.total -= 0.25"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  class="form-control"
                  v-model="tarjetaPagar.horasPagar.total"
                  step="0.25"
                  disabled
                />
                <button
                  class="input-group-text bg-success text-light"
                  @click="tarjetaPagar.horasPagar.total += 0.25"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div class="col-12 mt-4">
              Comentario:
              <select class="form-select mt-2" v-model="tarjetaPagar.horasPagar.comentario">
                <option disabled value="">Selecciona un comentario</option>
                <option v-for="opt in options1" :key="opt.value" :value="opt.value">
                  {{ opt.text }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <BsButton color="secondary" @click="modalVerSolicitud = false">Cerrar</BsButton>
          <BsButton
            color="primary"
            v-if="tarjetaPagar.horasPagar.estadoValidado !== 'APROBADAS'"
            @click="enviarPropuesta()"
            >Proponer</BsButton
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, computed, ref, type Ref } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { DateTime } from "luxon";
import BsButton from "@/components/365/BsButton.vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const currentUser = computed(() => userStore.user);
const arraySubordinados: Ref<any[]> = ref([]);
const datos: Ref<any[]> = ref([]);
const loading = ref(false);
const tarjetaPagar: Ref<any> = ref(null);
const modalPagarHoras = ref(false);
const modalVerSolicitud = ref(false);
const semanaActual: Ref<DateTime> = ref(DateTime.now().startOf("week").setLocale("es"));
const añoActual: Ref<DateTime> = ref(DateTime.now().startOf("year").setLocale("es"));
const options1 = ref([
  { text: "Baja médica", value: "Baja médica" },
  { text: "Permisos", value: "Permisos" },
  { text: "Formación", value: "Formación" },
  { text: "Incremento de Trabajo", value: "Incremento de Trabajo" },
  {
    text: "Asistencia reunión coordinadora",
    value: "Asistencia reunión coordinadora",
  },
  { text: "Limpieza", value: "Limpieza" },
  { text: "Vacaciones", value: "Vacaciones" },
  { text: "Baja voluntaria", value: "Baja voluntaria" },
  { text: "Despido", value: "Despido" },
]);

function obtenerNumeroSemana(fechaISO: string) {
  const fecha = DateTime.fromISO(fechaISO);
  return fecha.weekNumber;
}

function parseFecha(fecha: any) {
  let dt;

  if (!fecha) {
    // Usar la fecha y hora actual si no se proporciona una fecha
    dt = DateTime.now();
  } else if (fecha.includes("/")) {
    // Si la fecha está en formato DD/MM/YYYY
    const [day, month, year] = fecha.split("/");
    dt = DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else {
    // Si la fecha está en formato ISO
    dt = DateTime.fromISO(fecha);
  }

  // Convertir a formato HH:mm
  return dt.toFormat("HH:mm");
}

function parseFecha2(fecha: any) {
  if (!fecha) {
    return DateTime.now(); // O cualquier otro valor por defecto
  }

  if (fecha.includes("/")) {
    // Formato DD/MM/YYYY
    const [day, month, year] = fecha.split("/");
    return DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else {
    // Formato ISO
    return DateTime.fromISO(fecha);
  }
}

// async function getSubordinados() {
//   arraySubordinados.value = [];
//   // Recuperar UID de Coordinadora desde localStorage si existe
//   const uidGuardado = localStorage.getItem("uidCoordinadora");
//   const uidParaConsultar = uidGuardado || currentUser.value.uid;
//   try {
//     const subordinados = await axiosInstance.get("trabajadores/getSubordinados", {
//       params: {
//         uid: uidParaConsultar,
//       },
//     });
//     if (subordinados.data.ok) {
//       arraySubordinados.value = subordinados.data.data;
//     } else throw Error("No tienes personas a tu cargo");
//   } catch (err) {
//     console.log(err);
//     Swal.fire("Oops...", "Ha habido un error", "error");
//   }
// }

async function getSubordinados() {
  arraySubordinados.value = [];

  // Recuperar UID de Coordinadora desde localStorage si existe
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || currentUser.value.uid;

  try {
    const { data } = await axiosInstance.get("trabajadores/getSubordinados", {
      params: { uid: uidParaConsultar },
    });

    if (!data.ok || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error("No tienes personas a tu cargo");
    }

    // ✅ Solo guardamos los subordinados tal cual vienen del backend
    arraySubordinados.value = data.data;
  } catch (err) {
    console.error("❌ Error al obtener subordinados:", err);
    Swal.fire("Oops...", "Ha habido un error al cargar subordinados", "error");
  }
}

async function consultarFichajes() {
  if (loading.value) return;
  await getSubordinados();
  await getFichajesValidados(semanaActual.value.weekNumber, añoActual.value.year);
}

// async function getFichajesValidados(semana: any, año: any) {
//   datos.value = [];
//   loading.value = true;

//   if (arraySubordinados.value.length > 0) {
//     try {
//       for (const element of arraySubordinados.value) {
//         console.log(element);

//         const respValidados = await axiosInstance.get("/fichajes-validados/getFichajesValidados", {
//           params: {
//             idTrabajador: element.id,
//           },
//         });

//         if (respValidados.data.ok) {
//           const datosFiltrados = respValidados.data.data.filter((validado: any) => {
//             // Filtrar por semana y año
//             const fechaFichaje = new Date(validado.fichajeEntrada);
//             return fechaFichaje.getUTCFullYear() === año && getWeekNumber(fechaFichaje) === semana;
//           });

//           datosFiltrados.forEach((validado: any) => {
//             datos.value.push(validado);
//           });
//         }
//       }

//       // Ordeno de manera descendente
//       datos.value.sort((a, b) => {
//         const fechaA: any = new Date(a.fichajeEntrada);
//         const fechaB: any = new Date(b.fichajeEntrada);
//         return fechaB - fechaA;
//       });

//       loading.value = false;
//     } catch (error) {
//       console.log(error);
//     }
//   } else {
//     Swal.fire("Oops...", "No tienes subordinados a cargo", "error");
//   }
// }

async function getFichajesValidados(semana: any, año: any) {
  datos.value = [];
  loading.value = true;

  if (arraySubordinados.value.length > 0) {
    try {
      // Crear un array de promesas para todas las peticiones
      const promesas = arraySubordinados.value.map((element) =>
        axiosInstance.get("/fichajes-validados/getFichajesValidados", {
          params: { idTrabajador: element.id },
        }),
      );

      // Esperar a que terminen
      const respuestas = await Promise.all(promesas);

      for (const respValidados of respuestas) {
        if (respValidados.data.ok) {
          const datosFiltrados = respValidados.data.data.filter((validado: any) => {
            // Filtrar por semana y año
            const fechaFichaje = new Date(validado.fichajeEntrada);
            return fechaFichaje.getUTCFullYear() === año && getWeekNumber(fechaFichaje) === semana;
          });

          datosFiltrados.forEach((validado: any) => {
            datos.value.push(validado);
          });
        }
      }

      // 🔹 Ordenar
      datos.value.sort((a, b) => {
        const fechaA: any = new Date(a.fichajeEntrada);
        const fechaB: any = new Date(b.fichajeEntrada);
        return fechaB - fechaA;
      });
    } catch (error) {
      console.error("Error al cargar fichajes:", error);
    } finally {
      loading.value = false;
    }
  } else {
    Swal.fire("Oops...", "No tienes subordinados a cargo", "error");
  }
}

function getWeekNumber(date: Date) {
  const luxonDate = DateTime.fromJSDate(date);
  return luxonDate.weekNumber;
}

function definirHoras(item: any) {
  modalPagarHoras.value = true;
  tarjetaPagar.value = item;
}

function verSolicitud(item: any) {
  modalVerSolicitud.value = true;
  tarjetaPagar.value = item;
}

async function enviarPropuesta() {
  tarjetaPagar.value.aPagar = true;
  tarjetaPagar.value.horasPagar.marcaTemporalCreacionPropuesta = DateTime.now()
    .setLocale("es")
    .toFormat("dd/MM/yyyy - HH:mm:ss");
  if (!tarjetaPagar.value.horasPagar.comentario) {
    Swal.fire("Oops...", "Falta el comentario, es obligatorio", "error");
  } else {
    if (tarjetaPagar.value.horasPagar.total > 0) {
      try {
        const respEnvio = await axiosInstance.post(
          "/fichajes-validados/actualizarValidados",
          tarjetaPagar.value,
        );
        if (respEnvio) {
          Swal.fire(
            "Perfecto...",
            "Tu propuesta ha sido enviada. Tu supervisora la revisará para autorizar",
            "success",
          );
          // getFichajesValidados();
          modalPagarHoras.value = false;
        }
      } catch (err) {
        console.log(err);
        Swal.fire("Oops...", "Ha habido un error", "error");
      }
    } else {
      Swal.fire("Oops...", "Las horas propuestas deben ser mayores a 0", "error");
    }
  }
}

function restarSemana() {
  semanaActual.value = semanaActual.value.minus({ weeks: 1 });
}

function sumarSemana() {
  semanaActual.value = semanaActual.value.plus({ weeks: 1 });
}
function restarAño() {
  añoActual.value = añoActual.value.minus({ year: 1 });
}

function sumarAño() {
  añoActual.value = añoActual.value.plus({ year: 1 });
}

onMounted(async () => {
  try {
    await getSubordinados();
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
});
</script>

<style lang="scss" scoped>
.card-transparent {
  background-color: transparent !important;
  border: 1px solid #e0e0e0; /* Opcional, puedes quitarlo */
  border-radius: 0.5rem;
}
.card-header {
  background-color: #ffffff;
  font-size: 1rem;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border: none;
}

/* Footer */
.card-footer {
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

.btn-info {
  color: #ffffff;
  background: #54b4d3;
}
.btn-warning {
  color: #ffffff;
  background: #e4a11b;
}
.btn-outline-primary {
  padding: 0.5rem 1.2rem;
  border: 2px solid;
}

.modal {
  background: rgba(0, 0, 0, 0.35);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  overflow-y: auto;
  padding: 1.5rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.modal-dialog {
  margin: 0 auto;
  max-width: 650px;
  width: 95vw;
  border-radius: 1rem;
  background: transparent;
  display: flex;
  flex-direction: column;
}

.modal-content {
  border-radius: 1rem;
  border: none;
  background: #fff;
  box-shadow: 0 4px 24px rgba(230, 108, 90, 0.1);
  animation: modalIn 0.25s;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

@keyframes modalIn {
  from {
    transform: translateY(40px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

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

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff !important;
  opacity: 1;
  margin-left: 1rem;
  position: relative;
  transition:
    background 0.2s,
    color 0.2s;
}

.btn-close::before {
  content: "✕";
  font-size: 1.5rem;
  color: #fff;
  line-height: 1;
  font-weight: bold;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.btn-close:hover,
.btn-close:focus {
  background: rgba(230, 108, 90, 0.15);
  color: #fff;
  outline: none;
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
