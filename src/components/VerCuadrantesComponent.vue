<template>
  <i class="fas fa-arrow-circle-left fs-2 mt-3 pe-auto" @click="$router.go(-1)" />
  <div class="d-inline-flex mt-2">
    <span class="fs-6 ms-1 me-1">Semana </span>
    <span class="me-1" style="font-weight: bold">{{ punteroFecha.weekNumber }} </span>
    de
    {{ punteroFecha.year }}
    <MDBBtn class="btn-responsive" size="lg" color="secondary" @click="restarSemana()">-</MDBBtn>
    <MDBBtn class="btn-responsive" size="lg" color="secondary" @click="sumarSemana()">+</MDBBtn>
    <MDBBtn color="primary" @click="getTurnos()">Ver</MDBBtn>
  </div>
  <div class="row justify-content-center mt-2">
    <div class="col">
      <div class="card border-top border-5">
        <div class="card-body">
          <div class="navegacion" v-if="!hasPermission('ModoTienda')">
            <div class="col">
              <MDBBtn
                v-if="hasPermission('CrearCuadrante')"
                class="w-100"
                color="success"
                @click="abrirModalCrearCuadrante()"
                >+ Turno</MDBBtn
              >
            </div>
            <div class="col ms-2">
              <MDBBtn
                v-if="hasPermission('CrearCuadrante')"
                class="w-100"
                color="warning"
                @click="
                  modalCopiarSemanasRef.abrirModal(currentUser.idTienda, punteroFecha.weekNumber)
                "
                >Copiar</MDBBtn
              >
            </div>
          </div>
          <div class="navegacion" v-if="hasPermission('ModoTienda')">
            <div class="col">
              <MDBBtn class="w-25" color="success" @click="authCoordi('Crear cuadrantes')"
                ><i class="fas fa-lock"></i> Crear cuadrante</MDBBtn
              >
            </div>
          </div>

          <div class="mt-3" v-if="hasPermission('ConsultarCuadrante')">
            <div class="mb-3 row">
              <div class="col-auto">
                <div class="form-text">Tiendas</div>
                <div class="input-group">
                  <MDBSelect
                    v-model:options="arrayTiendas"
                    v-model:selected="tiendaSeleccionada"
                    filter
                    :select-all="true"
                    :search-placeholder="'Buscar'"
                    options-selected-label="tienda/s seleccionada/s"
                    :preselect="false"
                  />
                </div>
              </div>

              <div class="col-auto">
                <MDBBtn class="w-100, mt-4" color="success" @click="buscarCuadrante()"
                  >buscar</MDBBtn
                >
              </div>
              <div
                v-if="getRole('Super_Admin', 'RRHH_ADMIN', 'Analisis_Datos', 'Procesos')"
                class="col-auto"
              >
                <MDBBtn class="w-100, mt-4" color="primary" @click="getInformeTiendas()"
                  >todas</MDBBtn
                >
              </div>

              <div
                v-if="getRole('Super_Admin', 'RRHH_ADMIN', 'Analisis_Datos', 'Procesos')"
                class="col-auto mt-3"
              >
                <MDBBtn
                  v-if="getRole('Super_Admin', 'RRHH_ADMIN', 'Analisis_Datos', 'Procesos')"
                  :class="{ disabled: resCuadrantes2.length == 0 }"
                  class="w-100"
                  color="primary"
                  @click="nombreExcelModal = true"
                >
                  <i class="fa-sharp fa-solid fa-file-excel fs-3"></i>
                </MDBBtn>
              </div>

              <div class="col-auto mt-4">
                <MDBBtn
                  v-if="hasPermission('VerResumCuadrantes')"
                  class="w-100"
                  color="info"
                  @click="router.push('/resumenCuadrantes')"
                >
                  Resumen
                </MDBBtn>
              </div>
            </div>
          </div>

          <div v-if="!loadingCuadrantes" class="table-responsive mt-2">
            <div class="col-12 col-xl-12 col-sm-12 mb-2">
              <MDBInput
                id="buscador"
                input-group
                :form-outline="false"
                aria-label="buscar por nombre"
                placeholder="Buscar por nombre"
                @keyup="searchByName()"
              >
                <span class="input-group-text"><i class="fas fa-search" /></span>
              </MDBInput>
            </div>
            <table id="tabla" class="table">
              <thead class="fw-bold">
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col" v-for="(_, index) in 7" v-bind:key="index" class="wider-col">
                    {{ punteroFecha.plus({ days: index }).toFormat("EEEE dd/MM") }}
                  </th>
                  <th scope="col">Horas cuadrante</th>
                  <th scope="col">Horas contrato</th>
                  <!-- <th scope="col">Bolsa horas inicial</th> -->
                  <th scope="col">Horas +/-</th>
                  <!-- <th scope="col">Bolsa final</th> -->
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(turno, index) in arrayTurnos"
                  v-bind:key="index"
                  :class="{ soyYo: currentUser.idSql === turno.idTrabajador }"
                >
                  <td data-th="Nombre">{{ cleanName(turno.nombre) }}</td>

                  <!-- Aquí hemos añadido el atributo :data-th -->
                  <td
                    v-for="(turnos2, index2) in turno.turnos"
                    v-bind:key="index2"
                    :data-th="punteroFecha.plus({ days: index2 }).toFormat('EEEE dd')"
                  >
                    <div v-for="(turnoDia, index3) in turnos2" :key="index3">
                      <!-- Ver si hay una ausencia -->
                      <template v-if="turnoDia.ausencia">
                        <span v-if="turnoDia?.ausencia.tipo">{{ turnoDia.ausencia.tipo }}</span>
                        <span v-if="!turnoDia.ausencia.completa"
                          >Ausencia {{ turnoDia.ausencia.horas }}h</span
                        >
                      </template>

                      <!-- Si no hay ausencia, entonces mostrar la hora del turno -->
                      <template v-else-if="turnoDia.totalHoras > 0">
                        {{ DateTime.fromISO(turnoDia.inicio).toFormat("HH:mm") }}/{{
                          DateTime.fromISO(turnoDia.final).toFormat("HH:mm")
                        }}
                        <span style="font-weight: bold">{{
                          getNombreTienda(turnoDia.idTienda)
                        }}</span>
                      </template>

                      <!-- Si no hay ni ausencia ni horas de turno, mostrar '-' -->
                      <span v-else>-</span>
                    </div>
                  </td>

                  <td data-th="Horas cuadrante">
                    {{ getTotalHorasCuadranteLinea(turno).toFixed(2) }}
                  </td>
                  <td v-if="turno.turnos[0][0].horasContrato" data-th="Horas contrato">
                    {{ turno.turnos[0][0].horasContrato.toFixed(2) }}
                  </td>
                  <td data-th="Horas contrato" v-else>-</td>
                  <!-- <td
                    v-if="turno.turnos[0][0].bolsaHorasInicial"
                    data-th="Bolsa Inicial"
                  >
                    {{ turno.turnos[0][0].bolsaHorasInicial }}
                  </td>
                  <td data-th="Bolsa Inicial" v-else>-</td> -->
                  <td data-th="Horas +/-">
                    {{
                      (
                        getTotalHorasCuadranteLinea(turno) - turno.turnos[0][0].horasContrato
                      ).toFixed(2)
                    }}
                  </td>
                  <!-- <td data-th="Bolsa final">
                    {{
                      getTotalHorasCuadranteLinea(turno) -
                      turno.turnos[0][0].horasContrato +
                      (turno.turnos[0][0].bolsaHorasInicial
                        ? turno.turnos[0][0].bolsaHorasInicial
                        : 0)
                    }}
                  </td> -->
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="row text-center mt-3">
            <div><MDBSpinner style="width: 5rem; height: 5rem" /></div>
          </div>
          <div
            v-if="!loadingCuadrantes && arrayTurnos?.length === 0"
            class="row text-center text-center"
          >
            <figure class="figure">
              <img
                src="@/assets/img/nodata.png"
                class="rounded mx-auto d-block mt-3 img-fluid"
                alt="..."
                style="width: 60%"
              />
              <figcaption class="figure-caption text-center">
                No hay datos que mostrar, haz una nueva busqueda.
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>

  <MDBModal
    id="nombreExcelModal"
    tabindex="-1"
    labelledby="nombreExcelModalTitle"
    v-model="nombreExcelModal"
    centered
  >
    <MDBModalHeader>
      <MDBModalTitle id="nombreExcelModalTitle"> ¿Cómo quieres llamar al archivo? </MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <MDBInput label="Nombre de archivo" v-model="nombreExcel" />
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="secondary" @click="nombreExcelModal = false"> Close </MDBBtn>
      <MDBBtn @click="importExcelxD()" color="success"> Descargar </MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <ModalCrearCuadrante2Component ref="modalCrearCuadrante2Ref" />
  <ModalCopiarSemanas ref="modalCopiarSemanasRef" />

  <MDBModal
    id="codigoEmpleadoModal"
    v-model="codigoEmpleadoModal"
    tabindex="-1"
    labelledby="codigoEmpleadoModalLabel"
  >
    <MDBModalHeader>
      <MDBModalTitle id="codigoEmpleadoModalLabel"> Introducir Código de Empleado </MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <div class="row justify-content-center">
        <div class="col-12 col-xl-6 col-md-6">
          <h4 class="text-center mt-3">
            Ingresa tu código de empleado
            <span
              class="tooltip-icon"
              title="Puedes encontrar tu código de empleado en tu apartado principal."
              style="color: #007bff; cursor: pointer; margin-left: 5px"
            ></span>
          </h4>
          <div class="input-group mt-4">
            <input id="inputCodigo" type="text" class="form-control" v-model="codigoEmpleado" />
          </div>
        </div>
      </div>
      <div class="text-center">
        <MDBBtn
          class="text-light mt-4 m-auto rounded-8 w-auto"
          color="success"
          @click="validarCodigoEmpleado"
        >
          Validar
        </MDBBtn>
      </div>
    </MDBModalBody>
  </MDBModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide, type Ref } from "vue";
import { DateTime } from "luxon";
import ModalCopiarSemanas from "./ModalCopiarSemanas.vue";
import { hasPermission } from "@/components/rolesPermisos";
import {
  MDBSpinner,
  MDBBtn,
  MDBInput,
  MDBSelect,
  MDBModal,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-vue-ui-kit";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { getTipoUsuario } from "@/components/equipoGeneral";
import { estructurarTurnos } from "@/components/auxCuadrantes";
import ModalCrearCuadrante2Component from "./ModalCrearCuadranteNew.vue";
import { getEquipoDe } from "@/components/equipoGeneral";
import * as XLSX from "xlsx";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { searchByName } from "./kernel/Generic";

const userStore = useUserStore();
const punteroFecha = ref(DateTime.now().startOf("week").setLocale("es"));
const arrayTiendas: Ref<any[]> = ref([]);
const arrayTiendasFiltradas: Ref<any[]> = ref([]);
const arrayTurnos: Ref<any[]> = ref([]);
const modalCopiarSemanasRef: Ref<any> = ref(null);
const currentUser = computed(() => userStore.user);
const user = computed(() => userStore.user);
const loadingCuadrantes = ref(false);
const modalCrearCuadrante2Ref: Ref<any> = ref(null);
const semanaBuscar: Ref<any> = ref();
const tiendaSeleccionada = ref();
const tipoUsuario = computed(() => {
  return getTipoUsuario({ idTienda: user.value.idTienda!, llevaEquipo: user.value.llevaEquipo });
});
const objSemana: Ref<any[]> = ref([]);
const resCuadrantes2: Ref<any[]> = ref([]);
const nombreExcel: Ref<any> = ref(null);
const nombreExcelModal = ref(false);
const codigoEmpleado = ref("");
const accionPendiente = ref("");
const uidCoordinadora: Ref<any> = ref(null);
const codigoEmpleadoModal = ref(false);

function restarSemana() {
  punteroFecha.value = punteroFecha.value.minus({ days: 7 });
}

function sumarSemana() {
  punteroFecha.value = punteroFecha.value.plus({ days: 7 });
}

function abrirModalCrearCuadrante() {
  modalCrearCuadrante2Ref.value.abrirModal(
    punteroFecha.value.toJSDate(),
    arrayTiendas.value,
    user.value.idTienda,
  );
  codigoEmpleadoModal.value = false;
}

function getNombreTienda(idTienda: number) {
  for (let i = 0; i < arrayTiendas.value.length; i += 1) {
    if (arrayTiendas.value[i].value === idTienda) return arrayTiendas.value[i].text;
  }
  return "¿?";
}

async function buscarCuadrante() {
  if (!tiendaSeleccionada.value) {
    Swal.fire({
      icon: "error",
      title: "Upss...",
      text: "Debes seleccionar una tienda.",
      showConfirmButton: true,
      timer: 2000,
      timerProgressBar: true,
    });
    throw Error("Error, No ha seleccionado tienda");
  }
  if (!tiendaSeleccionada.value) {
    Swal.fire({
      icon: "error",
      title: "Upss...",
      text: "Debes seleccionar una semana.",
      showConfirmButton: true,
      timer: 2000,
      timerProgressBar: true,
    });
    throw Error("Error, No ha seleccionado semana");
  }

  if (tiendaSeleccionada.value == "todas" && semanaBuscar.value == "todas") {
    // caso 1: todas las tiendas todas las semanas
    try {
      loadingCuadrantes.value = true;
      const resTodos = await axiosInstance.get("cuadrantes/getTodos");
      ordenarCuadrante(resTodos.data.data);
      pintarSemana(resTodos.data.data);

      if (resTodos.data.ok) {
        loadingCuadrantes.value = false;
        ordenarCuadrante(resTodos.data.data);
        pintarSemana(resTodos.data.data);
      }
    } catch (err) {
      console.log(err);
      Swal.fire("Oops...", "Ha habido un problema...", "error");
    }
  } else if (tiendaSeleccionada.value == "todas" && semanaBuscar.value != "todas") {
    // caso 2: todas las tiendas 1 semana
    try {
      loadingCuadrantes.value = true;
      const resCuadrantes = await axiosInstance.get("cuadrantes/getTiendasUnaSemana", {
        params: {
          semana: parseInt(semanaBuscar.value),
          year: punteroFecha.value.year,
        },
      });
      if (resCuadrantes.data.ok) {
        loadingCuadrantes.value = false;
        ordenarCuadrante(resCuadrantes.data.data);
        pintarSemana(resCuadrantes.data.data);
      } else {
        loadingCuadrantes.value = false;
      }
    } catch (err) {
      console.log(err);
      Swal.fire("Oops...", "Ha habido un problema...", "error");
    }
  } else if (tiendaSeleccionada.value != "todas") {
    // Caso 3: 1 tienda todas las semanas
    try {
      loadingCuadrantes.value = true;
      const resCuadrantes = await axiosInstance.get("cuadrantes/getTiendaTodasSemanas", {
        params: {
          idTienda: parseInt(tiendaSeleccionada.value),
        },
      });
      if (resCuadrantes.data.ok) {
        loadingCuadrantes.value = false;
        const cuadrantesSemanaActual = filtrarCuadrantesSemanaActual(
          resCuadrantes.data.data,
          punteroFecha.value,
        );

        arrayTurnos.value = estructurarTurnos(cuadrantesSemanaActual);
        ordenarCuadrante(cuadrantesSemanaActual);
        pintarSemana(cuadrantesSemanaActual);
      } else {
        loadingCuadrantes.value = false;
      }
    } catch (err) {
      console.log(err);
      Swal.fire("Oops...", "Ha habido un problema...", "error");
    }
  }
}
//Filtrar cuadrantes para la busqueda de idTienda
function filtrarCuadrantesSemanaActual(cuadrantes: any, fechaSeleccionada: any) {
  const inicioSemana = fechaSeleccionada.startOf("week").toUTC();
  const finSemana = fechaSeleccionada.endOf("week").toUTC();

  return cuadrantes.filter((cuadrante: any) => {
    const inicioCuadrante = DateTime.fromISO(cuadrante.inicio).toUTC();
    const finalCuadrante = DateTime.fromISO(cuadrante.final).toUTC();

    return inicioCuadrante <= finSemana && finalCuadrante >= inicioSemana;
  });
}

async function getTiendas() {
  try {
    const resTiendas = await axiosInstance.get("tiendas");

    let tiendasFiltradas;
    if (tipoUsuario.value === "SUPERVISORA") {
      if (getRole("Super_Admin", "RRHH_ADMIN", "Analisis_Datos", "Procesos")) {
        tiendasFiltradas = resTiendas.data;
        arrayTiendasFiltradas.value = resTiendas.data;
      } else {
        const equipo = await getEquipoDe(currentUser.value.uid!);
        const idsTiendasDelEquipo = equipo.map((miembro: any) => miembro.idTienda);

        tiendasFiltradas = resTiendas.data.filter((tienda: any) =>
          idsTiendasDelEquipo.includes(tienda.id),
        );

        arrayTiendasFiltradas.value = tiendasFiltradas;
      }
    } else {
      tiendasFiltradas = resTiendas.data;
      arrayTiendasFiltradas.value = resTiendas.data;
    }

    arrayTiendas.value = tiendasFiltradas.map((tienda: any) => ({
      text: tienda.nombre,
      value: tienda.id,
      idTienda: tienda.id,
    }));
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un problema...", "error");
  }
}

async function getTurnos() {
  loadingCuadrantes.value = true;
  try {
    const resTurnos = await axiosInstance.get("cuadrantes", {
      params: {
        fecha: punteroFecha.value.toISO(),
        idTienda: currentUser.value.idTienda,
      },
    });
    if (!resTurnos.data.ok) throw Error("No se ha podido cargar el cuadrante");

    arrayTurnos.value = estructurarTurnos(resTurnos.data.data);
    ordenarCuadrante(resTurnos.data.data);
    pintarSemana(resTurnos.data.data);
  } catch (err) {
    if (!user.value.llevaEquipo) {
      console.log(err);

      Swal.fire("Oops...", "Ha habido un problema", "error");
    }
  } finally {
    loadingCuadrantes.value = false;
  }
}

// function getTotalHorasCuadranteLinea(data) {
//   let sum = 0;

//   for (let i = 0; i < data.turnos.length; i += 1) {
//     for (let j = 0; j < data.turnos[i].length; j += 1) {
//       sum += data.turnos[i][j].totalHoras;
//     }
//   }
//   return sum;
// }

function getTotalHorasCuadranteLinea(data: any) {
  let todosTienenPermisoMaternidad = true;
  let horasContrato = 0;

  for (let i = 0; i < data.turnos.length; i++) {
    for (let j = 0; j < data.turnos[i].length; j++) {
      const turno = data.turnos[i][j];

      if (turno.ausencia && turno.ausencia.tipo === "PERMISO MATERNIDAD/PATERNIDAD") {
        horasContrato = turno.horasContrato;
      } else {
        todosTienenPermisoMaternidad = false;
        break;
      }
    }
    if (!todosTienenPermisoMaternidad) {
      break;
    }
  }

  if (todosTienenPermisoMaternidad && horasContrato != null) {
    return horasContrato;
  }

  // Si no todos los turnos tienen la ausencia, sumar las horas normalmente
  let sum = 0;
  for (let i = 0; i < data.turnos.length; i++) {
    for (let j = 0; j < data.turnos[i].length; j++) {
      sum += data.turnos[i][j].totalHoras;
    }
  }
  return sum;
}

function cleanName(nombre: any) {
  const arrayNombres = nombre.split(" ");
  if (arrayNombres.length > 1) {
    return arrayNombres[0].substr(0, 4) + " " + arrayNombres[1].substr(0, 1);
  } else {
    return nombre;
  }
}

function pintarSemana(arrayTurnos: any) {
  objSemana.value = arrayTurnos;
  objSemana.value.forEach((cuadrante: any, index) => {
    arrayTiendas.value.forEach((tienda: any) => {
      if (cuadrante.idTienda == tienda.id) {
        objSemana.value[index].idTienda = tienda.nombre;
      }
    });
  });
}

function ordenarCuadrante(resTurnos: any) {
  for (let i = 0; i < resTurnos.length; i++) {
    if (resTurnos[i].idTrabajador === currentUser.value.idSql) {
      const first = currentUser.value.idSql;
      resTurnos.sort(function (x: any, y: any) {
        return x.idTrabajador == first ? -1 : y.idTrabajador == first ? 1 : 0;
      });
      break;
    }
  }
}

//function para los roles poner mas de uno
function getRole(...validRoles: any) {
  if (!currentUser.value || !currentUser.value || !currentUser.value.roles) {
    console.error("Error: No se ha definido correctamente el usuario o sus roles.");
    return false;
  }
  const userRoles = currentUser.value.roles.map((role) => role.name);
  return validRoles.some((role: any) => userRoles.includes(role));
}

async function getInformeTiendas() {
  try {
    loadingCuadrantes.value = true;
    const resCuadrantes = await axiosInstance.get("cuadrantes/getTiendasUnaSemana", {
      params: {
        fecha: punteroFecha.value.toISO(),
      },
    });
    if (resCuadrantes.data.ok) {
      resCuadrantes2.value = resCuadrantes.data.data.reduce((acc: any, item: any) => {
        const nombreTienda = getNombreTienda(item.idTienda); // Obtiene el nombre de la tienda
        // Verificar si el nombre de la tienda comienza con 'T--' o 'M--'
        if (/^(t--|m--)/i.test(nombreTienda)) {
          if (acc[item.idTienda]) {
            acc[item.idTienda].totalHoras += item.totalHoras;
          } else {
            acc[item.idTienda] = {
              nombreTienda: nombreTienda,
              totalHoras: item.totalHoras,
            };
          }
        }
        return acc;
      }, {});

      loadingCuadrantes.value = false;
      ordenarCuadrante(resCuadrantes.data.data);
      pintarSemana(resCuadrantes.data.data);
    } else {
      loadingCuadrantes.value = false;
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un problema...", "error");
  }
}

//Excel
function importExcelxD() {
  if (nombreExcel.value) {
    const arrayDeDatos = Object.values(resCuadrantes2.value);

    const datosTransformados = arrayDeDatos.map((item) => ({
      NombreTienda: item.nombreTienda,
      totalHoras: item.totalHoras,
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosTransformados, {
      cellDates: true,
      dateNF: "dd/mm/yyyy",
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, `${nombreExcel.value}.xlsx`);
    nombreExcelModal.value = false;
  } else {
    Swal.fire("Oops...", "Pon un nombre al archivo, por favor.", "error");
  }
}

function authCoordi(accion: any) {
  accionPendiente.value = accion;
  codigoEmpleado.value = "";
  codigoEmpleadoModal.value = true;
}

async function validarCodigoEmpleado() {
  if (!codigoEmpleado.value) {
    Swal.fire("Error", "Debe ingresar un código de empleado", "error");
    return;
  }
  // Mostrar loading
  Swal.fire({
    title: "Validando...",
    text: "Por favor, espere",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await axiosInstance.post("trabajadores/validarCodigo", {
      codigoEmpleado: codigoEmpleado.value,
    });

    Swal.close();

    if (response.data.ok) {
      const usuario = response.data.usuario;

      if (usuario.rol === "Coordinadora_A") {
        uidCoordinadora.value = usuario.uid;
        localStorage.setItem("uidCoordinadora", usuario.uid);

        Swal.fire("Acceso concedido", "Redirigiendo...", "success").then(() => {
          if (accionPendiente.value === "Crear cuadrantes") {
            abrirModalCrearCuadrante();
          }
        });
      } else {
        Swal.fire("Acceso denegado", "No tienes permisos", "error");
      }
    } else {
      Swal.fire("Código incorrecto", response.data.message, "error");
    }
  } catch (error) {
    Swal.fire("Error", "Hubo un problema en la validación", "error");
    console.log(error);
  }
}

provide("getCuadrantes", getTurnos);

onMounted(() => {
  getTiendas();
  getTurnos();
});
</script>

<style lang="scss" scoped>
.turnoActivo {
  background-color: rgb(78, 78, 78);
  color: #ddd;
}
.tituloSemana {
  font-size: 1.3rem;
  font-weight: bold;
}

.card {
  padding: 0.5em;
  border-radius: 1em;
  border: 1em;
  border-top-color: #3381bd !important;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}
//Responsive table
.table tbody {
  font-size: 0.8rem !important;
}
table {
  width: 100%;
  border-spacing: 3px;
  border-collapse: separate;
}

th:first-child,
td:first-child {
  color: rgb(0, 0, 0);
  font-weight: bold;
  background: #f5b95e;
}

th,
td {
  padding: 0.3em;
  text-align: center;
  background: white;
}

@media screen and (max-width: 640px) {
  thead {
    display: none;
  }
  .btn-responsive {
    font-size: 14px;
    padding: 10px 16px;
  }

  td {
    display: block;
    position: relative;
    padding-left: 50%;
    margin-bottom: 3px;
    text-align: right;

    &:first-child {
      font-weight: bold;
    }

    &:before {
      content: attr(data-th);
      position: absolute;
      top: 0.75em;
      left: 0.75em;
      width: 50%;
      font-weight: inherit;
      text-align: left;
    }
  }
}

.navegacion {
  display: flex;
  justify-content: space-between;
}
.soyYo {
  color: rgb(54, 121, 247);
  font-weight: bold;
}
// .wider-col {
//   min-width: 13rem;
// }
</style>
