<template>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row">
        <div class="col-4 mb-2" v-if="hasPermission('ValidarHoras')">
          <BsButton
            class="w-100"
            :class="{
              colorActive: validar == true,
              colorInactive: validar == false,
            }"
            @click="moverMenu('validar')"
          >
            VALIDAR
          </BsButton>
        </div>
        <div class="text-start col-4 mb-2" v-if="hasPermission('ValidarHorasValidadas')">
          <BsButton
            class="w-100"
            :class="{
              colorActive: aprobadas == true,
              colorInactive: aprobadas == false,
            }"
            @click="moverMenu('validadas')"
          >
            VALIDADAS
          </BsButton>
        </div>
        <div v-if="hasPermission('ValidarPagos')" class="text-start col-4 mb-2">
          <BsButton
            class="w-100"
            :class="{
              colorActive: pagos == true,
              colorInactive: pagos == false,
            }"
            @click="moverMenu('pagos')"
          >
            PAGOS
          </BsButton>
        </div>
        <div v-if="hasPermission('ResumenHorasValidadas')" class="text-start col-4 mb-2">
          <BsButton
            class="w-100"
            :class="{
              colorActive: resumen == true,
              colorInactive: resumen == false,
            }"
            @click="moverMenu('resumen')"
          >
            RESUMEN
          </BsButton>
        </div>
      </div>

      <div class="row">
        <template v-if="validar">
          <div class="row" v-if="!loading">
            <template v-if="!loading && datos.length > 0">
              <div
                v-for="(item, index) in datos"
                v-bind:key="index"
                class="col-12 col-sm-12 col-xl-4 col-md-4 mt-4"
              >
                <div v-if="!item.validado" class="card border border-danger">
                  <div class="card-header">
                    <div class="row">
                      <div class="col-6">
                        {{ parseFecha2(item.fichajeEntrada).toFormat("dd-LL-y") }}
                      </div>
                      <div class="col-6 text-end">
                        Semana {{ obtenerNumeroSemana(item.fichajeEntrada) }}
                      </div>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">{{ item.nombre }}</div>
                    <div class="mb-2">
                      Cuadrante:
                      <span
                        v-if="
                          item.cuadrante &&
                          item.cuadrante.inicio &&
                          item.cuadrante.final &&
                          item.cuadrante.inicio !== item.cuadrante.final
                        "
                      >
                        {{
                          parseFecha(
                            item.cuadrante.inicio ? item.cuadrante.inicio : item.cuadrante.entrada,
                          )
                        }}
                        -
                        {{
                          parseFecha(
                            item.cuadrante.final ? item.cuadrante.final : item.cuadrante.salida,
                          )
                        }}
                        ({{ item.horasCuadrante }})
                      </span>
                      <span class="text-warning" v-else>SIN CUADRANTE DEFINIDO</span>
                      <br />
                    </div>
                    Fichaje:
                    <span v-if="item.fichajeEntrada" class="fichajeCorrecto">{{
                      DateTime.fromJSDate(item.fichajeEntrada, {
                        zone: "local",
                      }).toFormat("HH:mm")
                    }}</span>
                    <span v-else class="text-danger">ENTRADA NO FICHADA</span> -
                    <span
                      v-if="!esSalidaFinalDelDia(item.fichajeSalida)"
                      :class="{
                        salidaAutomatica: item.salidaAutomatica === true,
                        fichajeCorrecto: !item.salidaAutomatica,
                      }"
                    >
                      {{
                        DateTime.fromJSDate(item.fichajeSalida, {
                          zone: "local",
                        }).toFormat("HH:mm")
                      }}
                    </span>
                    <span v-else class="text-danger">
                      <i class="fas fa-exclamation-circle"></i>
                      <!-- No mostrar nada -->
                    </span>
                    <span v-if="item.fichajeEntrada && !esSalidaFinalDelDia(item.fichajeSalida)">
                      ({{ convertDecimalToFormattedHours(item.horasfichajeMostrar) }})</span
                    >
                  </div>
                  <div class="card-footer">
                    <div class="row">
                      <div class="col-6">
                        <BsButton class="me-2"
                          :class="{
                            textDanger: item.horasFichaje > item.horasCuadrante,
                            textNormal: item.horasFichaje <= item.horasCuadrante,
                          }"
                          @click="modificarHorasModal(item)"
                          color="white"
                        >
                          <span>
                            {{ item.horasFichaje + item.horasExtra + item.horasCoordinacion }}
                          </span>
                        </BsButton>
                        <span v-if="item.comentario.entrada">{{ item.comentario.entrada }}</span>
                        <span v-else>{{ item.comentario.salida }}</span>
                        <span v-if="!item.comentario.entrada && !item.comentario.salida">App</span>
                      </div>
                      <div class="col-6">
                        <div class="text-end">
                          <BsButton @click="validarAjustes(item)" color="success">
                            <i class="fas fa-check-circle"></i>
                          </BsButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="card text-center" v-if="hasPermission('ValidarHoras')">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="fab fa-angellist fs-1"></i>
                  </h5>
                  <p class="card-text" v-if="!loading">Estás al día, buen trabajo!</p>
                  <div v-else class="d-flex justify-content-center">
                    <div class="spinner-border" role="status" style="width: 5rem; height: 5rem">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else class="row text-center mt-3">
            <div class="d-flex justify-content-center">
              <div class="spinner-border" role="status" style="width: 5rem; height: 5rem">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
          </div>
        </template>

        <!-- LAS QUE YA ESTÁN VALIDADAS -->
        <template v-if="aprobadas">
          <HorasValidadasComponent ref="horasValidadasComponentRef" />
        </template>

        <!-- LAS QUE YA ESTÁN VALIDADAS -->
        <template v-if="pagos">
          <ValidarPagosComponent ref="validarPagosComponentRef" />
        </template>

        <!-- RESUMEN DE HORAS PACTADAS VS REALES -->
        <template v-if="resumen">
          <ResumenHoras ref="resumenHorasRef" @cambiarMenu="moverMenu" />
        </template>
      </div>

      <!-- Modal editar horas -->

      <div
        v-if="tarjetaEditar"
        class="modal fade"
        id="modalEditarHoras"
        tabindex="-1"
        aria-labelledby="modalEditarHorasTitle"
        aria-hidden="true"
        :class="{ show: modalEditarHoras }"
        :style="{ display: modalEditarHoras ? 'block' : 'none' }"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <!-- HEADER -->
            <div class="modal-header">
              <h5 class="modal-title" id="modalEditarHorasTitle">Ajuste de horas</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Close"
                @click="modalEditarHoras = false"
              ></button>
            </div>

            <!-- BODY -->
            <div class="modal-body">
              <div class="row">
                <!-- HORAS EXTRAS -->
                <div class="col-5">Ajuste horas:</div>
                <div class="col-7">
                  <div class="input-group">
                    <button
                      type="button"
                      @click="tarjetaEditar.horasExtra = tarjetaEditar.horasExtra - 0.25"
                      :disabled="aprendizClicked"
                      class="input-group-text bg-warning text-light"
                    >
                      <i class="fas fa-minus"></i>
                    </button>

                    <input
                      type="number"
                      class="form-control"
                      v-model="tarjetaEditar.horasExtra"
                      :step="0.25"
                      aria-label="Amount (to the nearest dollar)"
                      disabled
                    />

                    <button
                      type="button"
                      @click="tarjetaEditar.horasExtra = tarjetaEditar.horasExtra + 0.25"
                      :disabled="aprendizClicked"
                      class="input-group-text bg-success text-light"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                <!-- HORAS COORDINACIÓN -->
                <div class="col-5 mt-4">Coordinación:</div>
                <div class="col-7 mt-4">
                  <div class="input-group">
                    <button
                      type="button"
                      @click="
                        tarjetaEditar.horasCoordinacion = tarjetaEditar.horasCoordinacion - 0.25
                      "
                      :disabled="aprendizClicked"
                      class="input-group-text bg-warning text-light"
                    >
                      <i class="fas fa-minus"></i>
                    </button>

                    <input
                      type="number"
                      class="form-control"
                      v-model="tarjetaEditar.horasCoordinacion"
                      :step="0.25"
                      aria-label="Amount (to the nearest dollar)"
                      disabled
                    />

                    <button
                      type="button"
                      @click="
                        tarjetaEditar.horasCoordinacion = tarjetaEditar.horasCoordinacion + 0.25
                      "
                      :disabled="aprendizClicked"
                      class="input-group-text bg-success text-light"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- FOOTER -->
            <div class="modal-footer">
              <div v-if="mostrarBotonAprendiz()" class="form-check me-auto">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="aprendizCheck"
                  v-model="aprendizClicked"
                />
                <label class="form-check-label" for="aprendizCheck">Aprendiz</label>
              </div>

              <button type="button" class="btn btn-secondary" @click="cancelarAjuste()">
                Descartar
              </button>
              <button type="button" class="btn btn-primary" @click="modalEditarHoras = false">
                Ajustar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import BsButton from "@/components/365/BsButton.vue";
import Swal from "sweetalert2";
import { DateTime } from "luxon";
import HorasValidadasComponent from "../ValidarHoras/HorasValidadas.vue";
import ValidarPagosComponent from "../ValidarHoras/ValidarPagos.vue";
import ResumenHoras from "../ValidarHoras/ResumenHoras.vue";
import router from "@/router";
import { hasPermission } from "@/components/rolesPermisos";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const currentUser = userStore.user;
const aprobadas = ref(false);
const validar = ref(true);
const pagos = ref(false);
const resumen = ref(false);
const arraySubordinados: Ref<any[]> = ref([]);
const tarjetaEditar: Ref<any> = ref(null);
const modalEditarHoras = ref(false);
const horasValidadasComponentRef: Ref<any> = ref(null);
const validarPagosComponentRef: Ref<any> = ref(null);
const loading = ref(true);
const datos: Ref<any[]> = ref([]);
const resumenHorasRef: Ref<any> = ref(null);
const aprendizClicked = ref(false);

function convertDecimalToFormattedHours(decimalTime: number) {
  let hours = Math.floor(decimalTime); // Obtiene la parte entera para las horas
  let minutes: any = Math.round((decimalTime - hours) * 60); // Convierte la parte decimal a minutos y redondea

  // Añade un cero al inicio si los minutos son menos de 10 para el formato correcto
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  // Si los minutos son 60, deberíamos incrementar la hora y resetear los minutos a 0
  if (minutes === 60) {
    hours += 1;
    minutes = "00";
  }

  // Retorna la cadena de tiempo formateada correctamente
  return `${hours}h:${minutes}m`;
}

// Esta función se usa para verificar si la salida es a las 23:59 en la fecha actual
function esSalidaFinalDelDia(fechaSalida: Date) {
  const salida = DateTime.fromJSDate(fechaSalida);
  const ahora = DateTime.now();
  return salida.hasSame(ahora, "day") && salida.hour === 23 && salida.minute === 59;
}

function obtenerNumeroSemana(fechaISO: Date) {
  const fecha = DateTime.fromJSDate(fechaISO);
  return fecha.weekNumber;
}

function parseFecha(fecha: any) {
  let dt;
  if (!fecha) {
    // Usar la fecha y hora actual si no se proporciona una fecha
    dt = DateTime.now();
  } else if (typeof fecha === "string" && fecha.includes("/")) {
    // Si la fecha está en formato DD/MM/YYYY
    const [day, month, year] = fecha.split("/");
    dt = DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else if (fecha instanceof Date) {
    // Si fecha es un objeto Date
    dt = DateTime.fromJSDate(fecha);
  } else {
    // Si la fecha está en otro formato de string (asumiendo ISO)
    dt = DateTime.fromISO(fecha);
  }

  // Convertir a formato HH:mm
  return dt.toFormat("HH:mm");
}

function parseFecha2(fecha: any) {
  if (!fecha) {
    return DateTime.now(); // O cualquier otro valor por defecto
  }

  if (typeof fecha === "string" && fecha.includes("/")) {
    // Formato DD/MM/YYYY
    const [day, month, year] = fecha.split("/");
    return DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else if (fecha instanceof Date) {
    // Si fecha es un objeto Date
    return DateTime.fromJSDate(fecha);
  } else {
    // Formato ISO
    return DateTime.fromISO(fecha);
  }
}

function moverMenu(opcion: string) {
  switch (opcion) {
    case "validar":
      validar.value = true;
      aprobadas.value = false;
      pagos.value = false;
      resumen.value = false;
      break;
    case "validadas":
      aprobadas.value = true;
      pagos.value = false;
      validar.value = false;
      resumen.value = false;
      break;
    case "pagos":
      aprobadas.value = false;
      pagos.value = true;
      validar.value = false;
      resumen.value = false;
      break;
    case "resumen":
      resumen.value = true;
      aprobadas.value = false;
      pagos.value = false;
      validar.value = false;
      break;
    default:
      break;
  }
}

function calcularAntiguedad(fechaInicio: any) {
  const inicio = DateTime.fromISO(fechaInicio);
  const hoy = DateTime.now();
  return hoy.diff(inicio, "days").days;
}

function mostrarBotonAprendiz() {
  return (
    tarjetaEditar.value &&
    tarjetaEditar.value.antiguedadDias >= 1 &&
    tarjetaEditar.value.antiguedadDias <= 15
  );
}

async function getSubordinados() {
  arraySubordinados.value = [];
  // Recuperar UID de Coordinadora desde localStorage si existe
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || currentUser.uid;

  try {
    const subordinados = await axiosInstance.get("trabajadores/getSubordinados", {
      params: { uid: uidParaConsultar },
    });

    if (subordinados.data.ok) {
      const promesasDNI = subordinados.data.data.map(async (subordinado: any) => {
        subordinado.antiguedadDias = calcularAntiguedad(subordinado.contratos[0].fechaAntiguedad);

        // subordinado.dni = await obtenerDniPorIdTrabajador(subordinado.id);
        return subordinado;
      });

      arraySubordinados.value = await Promise.all(promesasDNI);
    } else throw new Error("No tienes personas a tu cargo");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function getHorasValidar() {
  try {
    datos.value = [];
    loading.value = true;
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const idsqlGuardado = localStorage.getItem("idSqlCoordinadora");
    const uidParaConsultar = uidGuardado || currentUser.uid;
    const idSqlParaConsultar = Number(idsqlGuardado || currentUser.idSql);

    const fichaje: any = await axiosInstance.get("fichajes/sinValidar", {
      params: { uid: uidParaConsultar },
    });

    if (fichaje.data && fichaje.data.data && fichaje.data.data.length > 0) {
      const fichajesPorFechaYTrabajador: any = {};
      //junto cada documento de fichaje en pares según la fecha de este y agrego entrada y salida como atributos
      fichaje.data.data.forEach((fichaje: any) => {
        const fechaEntrada = fichaje.entrada
          ? DateTime.fromISO(fichaje.entrada.hora).toJSDate()
          : null;
        const fechaSalida = fichaje.salida
          ? DateTime.fromISO(fichaje.salida.hora).toJSDate()
          : null;
        const fechaStr: any = fechaEntrada ? fechaEntrada : null;
        const idTrabajador = fichaje.entrada ? fichaje.entrada.idTrabajador : null;
        const salidaAutomatica = !!fichaje.salida.salidaAutomatica;

        if (fechaStr && idTrabajador) {
          if (!fichajesPorFechaYTrabajador[fechaStr]) {
            fichajesPorFechaYTrabajador[fechaStr] = {};
          }

          if (!fichajesPorFechaYTrabajador[fechaStr][idTrabajador]) {
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador] = {
              entrada: null,
              salida: null,
              cuadrante: {
                inicio: null,
                final: null,
                nombre: null,
                idTrabajador: null,
                idTienda: null,
                dni: null, // este es el nuevo
              },
              nombre: null,
              dni: null, // este es el malo que se calculaba en el frontend
              aPagar: false,
              pagado: false,
              validado: false,
              enviado: false,
              idtienda: currentUser.idTienda ? currentUser.idTienda : null,
              idResponsable: idSqlParaConsultar,
              idFichajes: {
                entrada: null,
                salida: null,
              },
              comentario: {
                entrada: null,
                salida: null,
              },
              salidaAutomatica,
              horasPagar: {
                total: 0,
                comentario: null,
                respSuper: "",
                estadoValidado: "PENDIENTE",
              },
            };
          }

          // Establecer los datos de entrada, salida y cuadrante
          if (fichaje.entrada && fichaje.entrada.idTrabajador == fichaje.entrada.idTrabajador) {
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].entrada = fechaEntrada; // Extraer la hora (hh:mm)
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].idFichajes.entrada =
              fichaje.entrada._id;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].idTrabajador =
              fichaje.entrada.idTrabajador;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].nombre = fichaje?.entrada?.nombre;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].dni = fichaje?.entrada?.dni;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].comentario.entrada =
              fichaje.entrada.comentario;
          }
          if (fichaje.salida && fichaje.salida.idTrabajador) {
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].salida = fechaSalida; // Extraer la hora (hh:mm)
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].idTrabajador =
              fichaje.salida.idTrabajador;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].nombre = fichaje?.entrada?.nombre;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].dni = fichaje?.entrada?.dni;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].idFichajes.salida =
              fichaje.salida._id;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].comentario.salida =
              fichaje.salida.comentario;
          }

          // Añadir datos del cuadrante si están presentes

          if (fichaje.cuadrante && fichaje.cuadrante.idTrabajador) {
            if (!fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante) {
              fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante = {
                inicio: null,
                final: null,
                nombre: null,
                idTrabajador: null,
                idTienda: null,
              };
            }
            // Ahora puedes asignar valores ya que sabes que cuadrante está inicializado
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante.inicio = DateTime.fromISO(
              fichaje.cuadrante.inicio,
            ).toJSDate();

            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante.final = DateTime.fromISO(
              fichaje.cuadrante.final,
            ).toJSDate();

            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante.totalHoras =
              fichaje.cuadrante.totalHoras;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante.nombre =
              fichaje.cuadrante.nombre;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante.idTrabajador =
              fichaje.cuadrante.idTrabajador;
            fichajesPorFechaYTrabajador[fechaStr][idTrabajador].cuadrante.idTienda =
              fichaje.cuadrante.idTienda;
            if (!fichajesPorFechaYTrabajador[fechaStr][idTrabajador].idtienda) {
              fichajesPorFechaYTrabajador[fechaStr][idTrabajador].idtienda =
                fichaje.cuadrante.idTienda;
            }
          }
        }
      });

      const fichajesUnificados = Object.keys(fichajesPorFechaYTrabajador).flatMap((fecha) => {
        return Object.keys(fichajesPorFechaYTrabajador[fecha]).map((idTrabajador) => {
          const fichajes = fichajesPorFechaYTrabajador[fecha][idTrabajador];

          let horasFichaje = 0;
          let horasCuadrante = 0;
          // Calcular horas fichaje
          if (fichajes.entrada && fichajes.salida) {
            const entrada = DateTime.fromJSDate(fichajes.entrada);
            const salida = DateTime.fromJSDate(fichajes.salida);

            horasFichaje = salida.diff(entrada, "hours").hours; // Calcular diferencias en horas
            horasFichaje = Number(horasFichaje.toFixed(2)); // Redondear a la hora más cercana
          }

          // Suponiendo que cuadrante es un objeto y no una colección
          if (fichajes.cuadrante && fichajes.cuadrante.inicio && fichajes.cuadrante.final) {
            const entradaCuadrante = DateTime.fromJSDate(fichajes.cuadrante.inicio);
            const salidaCuadrante = DateTime.fromJSDate(fichajes.cuadrante.final);
            // Calcula la diferencia en minutos
            const totalMinutos = salidaCuadrante.diff(entradaCuadrante, "minutes").minutes;

            horasCuadrante = totalMinutos / 60;
            // horasCuadrante = salidaCuadrante.diff(
            //   entradaCuadrante,
            //   "hours"
            // ).hours;
            // horasCuadrante = Math.round(horasCuadrante); // Redondear a la hora más cercana
          }

          const horasfichajeMostrar = horasFichaje;
          horasFichaje = adjustHoursBasedOnQuadrant(horasFichaje, horasCuadrante);

          return {
            fichajeEntrada: fichajes.entrada,
            fichajeSalida: fichajes.salida,
            idFichajes: fichajes.idFichajes,
            comentario: fichajes.comentario,
            horasPagar: fichajes.horasPagar,
            cuadrante: fichajes.cuadrante,
            dni: fichajes.dni,
            nombre: fichajes.nombre,
            idTrabajador: fichajes.idTrabajador,
            salidaAutomatica: fichajes.salidaAutomatica,
            validado: fichajes.validado,
            idResponsable: fichajes.idResponsable,
            horasFichaje: horasFichaje,
            horasCuadrante: horasCuadrante,
            horasExtra: 0,
            horasAprendiz: 0,
            horasCoordinacion: 0,
            aprendiz: aprendizClicked,
            aPagar: fichajes.aPagar,
            pagado: fichajes.pagado,
            idTienda: fichajes.idtienda,
            enviado: fichajes.enviado,
            horasfichajeMostrar: horasfichajeMostrar,
          };
        });
      });

      fichajesUnificados.forEach((element: any) => {
        const subordinado = arraySubordinados.value.find((s) => s.id === element.idTrabajador);
        if (subordinado) {
          element.antiguedadDias = subordinado.antiguedadDias;
        }
        datos.value.push(element);
      });

      //Ordeno de manera descendente
      datos.value.sort((a, b) => {
        const fechaA: any = new Date(b.fichajeEntrada);
        const fechaB: any = new Date(a.fichajeEntrada);
        return fechaB - fechaA;
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

// function modificarHorasModal(item) {
//   tarjetaEditar.value = item;
//   console.log(item);
//   let fechaObjeto = moment(tarjetaEditar.value.fecha, "YYYY-MM-DD");
//   let fechaActual = moment();
//   if (
//     (tarjetaEditar.value.fichajes.fichajeEntrada &&
//       tarjetaEditar.value.fichajes.fichajeSalida) ||
//     !fechaObjeto.isSame(fechaActual, "day")
//   ) {
//     modalEditarHoras.value = true;
//   } else {
//     Swal.fire(
//       "Upss!",
//       "No se pueden validar estas horas, falta fichar la entrada o la salida",
//       "warning"
//     );
//   }
// }

function modificarHorasModal(item: any) {
  tarjetaEditar.value = item;

  // Si 'fecha' no está directamente en 'item', usamos 'fichajeEntrada' para obtener la fecha
  const fechaObjeto = DateTime.fromISO(item.fichajeEntrada);
  const fechaActual = DateTime.now();

  // Verificar si existe un cuadrante definido
  const tieneCuadranteDefinido = item.cuadrante && item.cuadrante.inicio && item.cuadrante.final;

  if (!tieneCuadranteDefinido) {
    Swal.fire({
      title: "Trabajador sin cuadrante ",
      text: "Para ajustar las horas debe de tener cuadrante, quieres crear el cuadrante?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/cuadrantes-tienda");
      }
    });
    return;
  }
  // Verificar si fichajeEntrada y fichajeSalida están presentes y si no son el mismo día que hoy
  if (
    (item.fichajeEntrada && !esSalidaFinalDelDia(item.fichajeSalida)) ||
    !fechaObjeto.hasSame(fechaActual, "day")
  ) {
    modalEditarHoras.value = true;
  } else {
    Swal.fire(
      "Upss!",
      "No se pueden validar estas horas, falta fichar la entrada o la salida",
      "warning",
    );
  }
}

function cancelarAjuste() {
  // tarjetaEditar.value.horasAprendiz = 0;
  tarjetaEditar.value.horasCoordinacion = 0;
  tarjetaEditar.value.horasExtra = 0;
  aprendizClicked.value = false;
  modalEditarHoras.value = false;
}

// function horasAprendiz() {
//   aprendizClicked.value = true;
//   tarjetaEditar.value.horasAprendiz = tarjetaEditar.value.horasFichaje;
// }

// const calculateTotalHours = (item) => {
//   if (aprendizClicked.value) {
//     return item.horasExtra + item.horasAprendiz + item.horasCoordinacion;
//   }
//   return (
//     item.horasFichaje +
//     item.horasExtra +
//     item.horasAprendiz +
//     item.horasCoordinacion
//   );
// };

async function editarFichajes(id: string) {
  try {
    const respFichajes = await axiosInstance.post("/fichajes/updateFichaje", {
      id: id,
      validado: true,
    });
    if (respFichajes.data) {
      Swal.fire(`Perfecto`, "Fichaje actualizado: " + respFichajes, "success");
    }
  } catch (error) {
    console.log(error);
  }
}

async function guardarAjuste() {
  try {
    // Asegurarse de que horasPagar.comentario sea una cadena
    if (!tarjetaEditar.value.horasPagar.comentario) {
      tarjetaEditar.value.horasPagar.comentario = "";
    }

    // Lógica existente para editar fichajes
    if (tarjetaEditar.value.idFichajes.entrada) {
      editarFichajes(tarjetaEditar.value.idFichajes.entrada);
    }
    if (tarjetaEditar.value.idFichajes.salida) {
      editarFichajes(tarjetaEditar.value.idFichajes.salida);
    }

    //set horas aprendiz
    if (aprendizClicked.value) {
      tarjetaEditar.value.horasAprendiz = tarjetaEditar.value.horasFichaje;
    }

    // Realizar la petición POST
    const resPost = await axiosInstance.post(
      "/fichajes-validados/addFichajeValidado",
      tarjetaEditar.value,
    );

    // Resto de la lógica de la función
    if (resPost) {
      // getHorasValidar();
      Swal.fire(
        `Horas de ${tarjetaEditar.value.nombre} validadas!`,
        "Si quieres proponer horas a pagar ve a 'VALIDADAS'",
        "success",
      );
    }
  } catch (error) {
    console.error("Error al guardar horas validadas:", error);
    Swal.fire("Error", "No se pudieron validar las horas.", "error");
  }
}

function validarAjustes(item: any) {
  tarjetaEditar.value = item;
  const totalAjustado =
    tarjetaEditar.value.horasFichaje +
    tarjetaEditar.value.horasExtra +
    tarjetaEditar.value.horasCoordinacion;
  const fechaObjeto = DateTime.fromISO(tarjetaEditar.value.fichajeEntrada);
  const fechaActual = DateTime.now();
  // Verificar si existe un cuadrante definido
  const tieneCuadranteDefinido =
    tarjetaEditar.value.cuadrante &&
    tarjetaEditar.value.cuadrante.inicio &&
    tarjetaEditar.value.cuadrante.final;

  if (!tieneCuadranteDefinido) {
    Swal.fire({
      title: "Trabajador sin cuadrante ",
      text: "Para validar las horas debe de tener cuadrante, quieres crear el cuadrante?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/cuadrantes-tienda");
      }
    });
    return;
  }
  const causa = DateTime.now();
  if (!causa.hasSame(tarjetaEditar.value.fichajeEntrada, "day")) {
    if (
      tarjetaEditar.value.fichajeEntrada &&
      !esSalidaFinalDelDia(tarjetaEditar.value.fichajeSalida) &&
      !fechaObjeto.hasSame(fechaActual, "day")
    ) {
      if (totalAjustado > tarjetaEditar.value.horasFichaje) {
        Swal.fire({
          title: "Estas segur@?",
          text: `El total del ajuste (${convertDecimalToFormattedHours(
            totalAjustado,
          )}H) es MAYOR que lo fichado (${tarjetaEditar.value.horasFichaje}H), esto es correcto?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, es correcto!",
        }).then((result) => {
          if (result.isConfirmed) {
            guardarAjuste().then(() => {
              getHorasValidar();
            });
          }
        });
      } else if (totalAjustado < tarjetaEditar.value.horasFichaje) {
        Swal.fire({
          title: "Estas segur@?",
          text: `El total del ajuste (${convertDecimalToFormattedHours(
            totalAjustado,
          )}H) es MENOR que lo fichado (${tarjetaEditar.value.horasFichaje}H), esto es correcto?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, es correcto!",
        }).then((result) => {
          if (result.isConfirmed) {
            // guardarAjuste()
            guardarAjuste().then(() => {
              getHorasValidar();
            });
          }
        });
      } else if (tarjetaEditar.value.horasFichaje > tarjetaEditar.value.horasCuadrante) {
        Swal.fire({
          title: "Estas segur@?",
          text: `El total del fichaje (${convertDecimalToFormattedHours(
            tarjetaEditar.value.horasFichaje,
          )}H) es MAYOR que las horas del cuadrante (${
            tarjetaEditar.value.horasCuadrante
          }H), esto es correcto?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, es correcto!",
        }).then((result) => {
          if (result.isConfirmed) {
            if (!aprendizClicked.value) {
              //Colocamos la diferencia en ajuste de horas (horas extras)
              tarjetaEditar.value.horasExtra = Number(
                tarjetaEditar.value.horasFichaje - tarjetaEditar.value.horasCuadrante,
              );

              if (tarjetaEditar.value.horasFichaje == tarjetaEditar.value.horasCuadrante) {
                tarjetaEditar.value.horasFichaje = tarjetaEditar.value.horasCuadrante;
              }

              //Igualamos horas fichajes a horas cuadrante

              guardarAjuste().then(() => {
                getHorasValidar();
              });
            } else
              guardarAjuste().then(() => {
                getHorasValidar();
              });
          }
        });
      } else if (tarjetaEditar.value.horasFichaje < tarjetaEditar.value.horasCuadrante) {
        Swal.fire({
          title: "Estas segur@?",
          text: `El total del fichaje (${convertDecimalToFormattedHours(
            tarjetaEditar.value.horasFichaje,
          )}H) es MENOR que las horas del cuadrante (${
            tarjetaEditar.value.horasCuadrante
          }H), esto es correcto?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, es correcto!",
        }).then((result) => {
          if (result.isConfirmed) {
            if (!aprendizClicked.value) {
              //Colocamos la diferencia en ajuste de horas (horas extras)
              tarjetaEditar.value.horasExtra = Number(
                tarjetaEditar.value.horasFichaje - tarjetaEditar.value.horasCuadrante,
              );

              //Igualamos horas fichajes a horas cuadrante
              if (tarjetaEditar.value.horasFichaje == tarjetaEditar.value.horasCuadrante) {
                tarjetaEditar.value.horasFichaje = tarjetaEditar.value.horasCuadrante;
              }
              guardarAjuste().then(() => {
                getHorasValidar();
              });
            } else
              guardarAjuste().then(() => {
                getHorasValidar();
              });
          }
        });
      } else
        guardarAjuste().then(() => {
          getHorasValidar();
        });
    } else {
      Swal.fire(
        "Upss!",
        "No se pueden validar estas horas, falta fichar la entrada o la salida",
        "warning",
      );
    }
  } else Swal.fire("Upss!", "No puedes validar fichajes de hoy", "warning");
}

function adjustHoursBasedOnQuadrant(fichajeTime: any, quadrantTime: any) {
  // Convertir ambos tiempos a minutos totales
  const fichajeHours = Math.floor(fichajeTime);
  const fichajeMinutes = Math.round((fichajeTime - fichajeHours) * 60);
  const fichajeTotalMinutes = fichajeHours * 60 + fichajeMinutes;

  const quadrantHours = Math.floor(quadrantTime);
  const quadrantMinutes = Math.round((quadrantTime - quadrantHours) * 60);
  const quadrantTotalMinutes = quadrantHours * 60 + quadrantMinutes;

  // Calcular la diferencia en minutos
  const differenceInMinutes = fichajeTotalMinutes - quadrantTotalMinutes;

  // Aplicar las reglas según la diferencia
  if (differenceInMinutes > 40) {
    // Fichaje supera 40 min después del cuadrante
    return quadrantTime + 1;
  } else if (differenceInMinutes >= -40 && differenceInMinutes <= 40) {
    // Fichaje está dentro de los primeros 40 min antes o después
    return quadrantTime;
  } else {
    // Fichaje es inferior a 40 min antes del cuadrante
    return quadrantTime - 1;
  }
}

defineExpose({ moverMenu });

onMounted(async () => {
  await getSubordinados();

  if (hasPermission("ValidarHoras")) {
    await getHorasValidar();
  }
  if (hasPermission("ValidarPagos")) {
    loading.value = false;
    pagos.value = true;
  }
});
</script>

<style lang="scss" scoped>
.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.colorActive {
  background-color: #e66c5a !important;
  color: #fff !important;
  font-weight: bold;
  border: none;
  box-shadow: 0 2px 8px rgba(230, 108, 90, 0.08);
  transition:
    background 0.2s,
    color 0.2s;
}

.colorInactive {
  background-color: #d7d9e7 !important;
  color: #777 !important;
  border: none;
}

button {
  touch-action: manipulation;
  transition: all 0.2s ease;
}

/* Estilo general de la tarjeta */
.card.border-danger {
  border: 2px solid #e57373;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}
.card.border-danger:hover {
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

/* Header bonito */
.card-header {
  background-color: #ffffff;
  font-size: 1rem;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

/* Cuerpo del contenido */
.card-body {
  font-size: 1rem;
  padding: 1rem 1.5rem;
}

/* Etiquetas de fichaje */
.fichajeCorrecto {
  background-color: #d0f0c0;
  color: black;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
}

.salidaAutomatica {
  background-color: #ffecb3;
  color: #ef6c00;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
}

/* Footer */
.card-footer {
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

/* Botón de cantidad de horas */
.textDanger,
.textNormal {
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 6px;
}

.textDanger {
  background-color: #ff0400;
  color: #fff;
}

.textNormal {
  background-color: #66bb6a;
  color: #fff;
}

/* Botón verde con icono (check) */
.btn-success {
  border-radius: 50% !important;
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 0.9rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.btn:focus {
  box-shadow: 0 0 0 0.2rem #d7d9e7 !important;
  border-color: #d7d9e7 !important;
  outline: none !important;
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
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
