<template>
  <div class="container-fluid d-flex flex-column vh-100 p-0">
    <!-- HEADER -->
    <header
      class="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm flex-wrap"
    >
      <div class="d-flex align-items-center mb-2 mb-md-0">
        <h2 class="h4 mb-0 me-3">Semana {{ punteroFecha.weekNumber }} – {{ punteroFecha.year }}</h2>
        <div class="btn-group" role="group" aria-label="Navegación semana">
          <BsButton variant="outline-secondary" size="lg" @click="restarSemana()">
            <i class="fas fa-chevron-left"></i>
          </BsButton>
          <BsButton variant="outline-secondary" size="lg" @click="sumarSemana()">
            <i class="fas fa-chevron-right"></i>
          </BsButton>
          <BsButton color="success" size="lg" @click="getTurnos()">
            <i class="fas fa-redo-alt"></i>
          </BsButton>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <template v-if="!hasPermission('ModoTienda')">
          <BsButton
            v-if="hasPermission('CrearCuadrante')"
            color="success"
            size="lg"
            @click="abrirModalCrearCuadrante()"
          >
            <i class="fas fa-plus me-1"></i> Turno
          </BsButton>
          <BsButton
            v-if="hasPermission('CrearCuadrante')"
            color="warning"
            size="lg"
            @click="
              modalCopiarSemanasRef?.abrirModal(currentUser.idTienda!, punteroFecha.weekNumber)
            "
          >
            <i class="fas fa-copy me-1"></i> Copiar
          </BsButton>
        </template>
        <template v-else>
          <BsButton color="success" size="sm" @click="authCoordi('Crear cuadrantes')">
            <i class="fas fa-lock me-1"></i> Crear cuadrante
          </BsButton>
        </template>
      </div>
    </header>

    <!-- FILTROS -->
    <section v-if="hasPermission('ConsultarCuadrante')" class="p-3">
      <BsButtonGroup class="gap-3 flex-wrap">
        <div class="flex-grow-1">
          <BsSelect
            v-model:options="arrayTiendas"
            v-model:selected="tiendaSeleccionada"
            :filter="true"
            :select-all="true"
            size="lg"
            label="Tienda"
            label-position="left"
            :search-placeholder="'Buscar tienda'"
            :options-selected-label="'tienda/s seleccionada/s'"
            :preselect="false"
            class="w-100"
          />
        </div>

        <BsButton outline icon="search" color="success" @click="buscarCuadrante()">
          Buscar
        </BsButton>

        <BsButton
          outline
          v-if="getRole('Super_Admin', 'RRHH_ADMIN', 'Analisis_Datos', 'Procesos')"
          icon="store"
          color="primary"
          @click="getInformeTiendas()"
        >
          Todas las tiendas
        </BsButton>

        <BsButton
          outline
          v-if="getRole('Super_Admin', 'RRHH_ADMIN', 'Analisis_Datos', 'Procesos')"
          :disabled="Object.keys(resCuadrantes2).length === 0"
          icon="file-excel"
          color="success"
          @click="nombreExcelModal = true"
        >
          Descargar excel
        </BsButton>

        <BsButton
          outline
          v-if="hasPermission('VerResumCuadrantes')"
          icon="chart-bar"
          color="info"
          @click="router.push('/resumenCuadrantes')"
        >
          Resumen
        </BsButton>
      </BsButtonGroup>
    </section>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-fill overflow-auto p-3">
      <!-- Buscador -->
      <div v-if="!loadingCuadrantes" class="mb-3">
        <BsInput
          :input-group="true"
          :form-outline="false"
          placeholder="Buscar empleado por nombre..."
          @keyup="searchByName()"
          class="w-100"
        >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </BsInput>
      </div>

      <!-- Tabla -->
      <div v-if="!loadingCuadrantes" class="table-responsive">
        <table class="table table-bordered table-hover mb-0">
          <thead class="table-dark position-sticky top-0">
            <tr>
              <th class="sticky-left bg-dark">Empleado</th>
              <th v-for="(_, index) in 7" :key="index" class="text-center">
                <div>
                  {{ punteroFecha.plus({ days: index }).toFormat("EEE", { locale: "es" }) }}
                </div>
                <div>{{ punteroFecha.plus({ days: index }).toFormat("dd/MM") }}</div>
              </th>
              <th class="text-center">H. Cuadrante</th>
              <th class="text-center">H. Contrato</th>
              <th class="text-center">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(turno, index) in arrayTurnos"
              :key="index"
              :class="{ 'table-warning': currentUser.idSql === turno.idTrabajador }"
            >
              <td class="sticky-left bg-white">{{ cleanName(turno.nombre) }}</td>
              <td v-for="(turnos2, i2) in turno.turnos" :key="i2">
                <div v-if="turnos2.length">
                  <div v-for="(turnoDia, i3) in turnos2" :key="i3" class="mb-1">
                    <template v-if="turnoDia.ausencia">
                      <span class="badge bg-warning text-dark">
                        {{ turnoDia.ausencia.tipo }}
                        <span v-if="!turnoDia.ausencia.completa">
                          {{ turnoDia.ausencia.horas }}h
                        </span>
                      </span>
                    </template>
                    <template v-else-if="turnoDia.totalHoras > 0">
                      <div class="d-flex flex-column small">
                        <span>
                          {{ DateTime.fromISO(turnoDia.inicio).toFormat("HH:mm") }}
                          –
                          {{ DateTime.fromISO(turnoDia.final).toFormat("HH:mm") }}
                        </span>
                        <span
                          class="badge"
                          :class="
                            turnoDia.idTienda !== (tiendaSeleccionada || currentUser.idTienda)
                              ? 'bg-danger'
                              : 'bg-success'
                          "
                        >
                          {{ getNombreTienda(turnoDia.idTienda) }}
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="text-muted">-</span>
                    </template>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <strong>{{ getTotalHorasCuadranteLinea(turno).toFixed(2) }}h</strong>
              </td>
              <td class="text-center">
                <span v-if="turno.turnos[0][0].horasContrato">
                  {{ turno.turnos[0][0].horasContrato.toFixed(2) }}h
                </span>
                <span v-else>-</span>
              </td>
              <td class="text-center">
                <span
                  :class="
                    getTotalHorasCuadranteLinea(turno) - turno.turnos[0][0].horasContrato > 0
                      ? 'text-success'
                      : 'text-danger'
                  "
                >
                  {{
                    (getTotalHorasCuadranteLinea(turno) - turno.turnos[0][0].horasContrato).toFixed(
                      2,
                    )
                  }}h
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading -->
      <div
        v-if="loadingCuadrantes"
        class="d-flex flex-column align-items-center justify-content-center h-100"
      >
        <BsSpinner style="width: 3rem; height: 3rem" />
        <p>Cargando cuadrantes...</p>
      </div>

      <!-- Empty -->
      <div
        v-if="!loadingCuadrantes && !arrayTurnos.length"
        class="d-flex flex-column align-items-center justify-content-center h-100"
      >
        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
        <h5>No hay datos disponibles</h5>
        <p>No se encontraron cuadrantes para los filtros seleccionados.</p>
        <BsButton color="primary" @click="getTurnos()">Intentar de nuevo</BsButton>
      </div>
    </main>

    <!-- MODALES -->
    <BsModal id="nombreExcelModal" v-model="nombreExcelModal" centered>
      <BsModalHeader @close="nombreExcelModal = false">
        <BsModalTitle>¿Cómo quieres llamar al archivo?</BsModalTitle>
      </BsModalHeader>
      <BsModalBody>
        <BsInput label="Nombre de archivo" v-model="nombreExcel" />
      </BsModalBody>
      <BsModalFooter>
        <BsButton color="secondary" @click="nombreExcelModal = false">Cancelar</BsButton>
        <BsButton color="success" @click="importExcelxD()">Descargar</BsButton>
      </BsModalFooter>
    </BsModal>

    <ModalCrearCuadrante2Component
      ref="modalCrearCuadrante2Ref"
      :selected-date="punteroFecha"
      :selected-tienda="null"
    />
    <ModalCopiarSemanas ref="modalCopiarSemanasRef" />

    <BsModal id="codigoEmpleadoModal" v-model="codigoEmpleadoModal">
      <BsModalHeader @close="codigoEmpleadoModal = false">
        <BsModalTitle>Introducir Código de Empleado</BsModalTitle>
      </BsModalHeader>
      <BsModalBody>
        <div class="row justify-content-center">
          <div class="col-12 col-md-6">
            <h5 class="text-center">Ingresa tu código de empleado</h5>
            <div class="input-group mt-3">
              <input type="text" class="form-control" v-model="codigoEmpleado" />
            </div>
          </div>
        </div>
      </BsModalBody>
      <BsModalFooter>
        <BsButton color="secondary" @click="codigoEmpleadoModal = false"> Cancelar </BsButton>
        <BsButton color="success" @click="validarCodigoEmpleado"> Validar </BsButton>
      </BsModalFooter>
    </BsModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide, type Ref } from "vue";
import { DateTime } from "luxon";
import ModalCopiarSemanas from "./ModalCopiarSemanas.vue";
import { hasPermission } from "@/components/rolesPermisos";
import BsButton from "@/components/365/BsButton.vue";
import BsInput from "@/components/365/BsInput.vue";
import BsSelect from "@/components/365/BsSelect.vue";
import BsSpinner from "@/components/365/BsSpinner.vue";
import BsModal from "@/components/365/BsModal.vue";
import BsModalHeader from "@/components/365/BsModalHeader.vue";
import BsModalTitle from "@/components/365/BsModalTitle.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";

import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { getTipoUsuario } from "@/components/equipoGeneral";
import { estructurarTurnos } from "@/components/auxCuadrantes";
import ModalCrearCuadrante2Component from "./ModalCrearCuadranteNew.vue";
import { getEquipoDe } from "@/components/equipoGeneral";
import * as XLSX from "xlsx";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import BsButtonGroup from "./365/BsButtonGroup.vue";
import { Tienda } from "@/components/kernel/Tienda";
import type { TTienda } from "@/interfaces/Tienda.interface";
import { Cuadrante } from "./kernel/Cuadrante";
import type { TCuadranteBackend } from "@/interfaces/Cuadrante.interface";

const userStore = useUserStore();
const punteroFecha = ref(DateTime.now().startOf("week").setLocale("es"));
const arrayTiendas: Ref<TTienda[]> = ref([]);
const arrayTiendasFiltradas: Ref<TTienda[]> = ref([]);
const arrayTurnos: Ref<any[]> = ref([]);
const modalCopiarSemanasRef = ref<InstanceType<typeof ModalCopiarSemanas> | null>(null);
const currentUser = computed(() => userStore.user);
const user = computed(() => userStore.user);
const loadingCuadrantes = ref(false);
const modalCrearCuadrante2Ref = ref<InstanceType<typeof ModalCrearCuadrante2Component> | null>(
  null,
);
const semanaBuscar: Ref<string> = ref("todas");
const tiendaSeleccionada: Ref<string> = ref("");
const tipoUsuario = computed(() => {
  return getTipoUsuario({ idTienda: user.value.idTienda!, llevaEquipo: user.value.llevaEquipo });
});
const objSemana: Ref<any[]> = ref([]);
const resCuadrantes2: Ref<
  Record<TCuadranteBackend["idTienda"], { nombreTienda: string; totalHoras: number }>
> = ref([]);
const nombreExcel: Ref<any> = ref(null);
const nombreExcelModal = ref(false);
const codigoEmpleado = ref("");
const accionPendiente = ref("");
const uidCoordinadora: Ref<any> = ref(null);
const codigoEmpleadoModal = ref(false);

// Función searchByName corregida
function searchByName() {
  const input = document.getElementById("buscador") as HTMLInputElement;
  if (!input) return;

  const filter = input.value.toUpperCase().trim();
  const table = document.querySelector(".cuadrantes-table");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = tbody.getElementsByTagName("tr");

  // Si no hay filtro, mostrar todas las filas
  if (!filter) {
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display = "";
    }
    return;
  }

  for (let i = 0; i < rows.length; i++) {
    const nombreCell = rows[i].querySelector(".col-nombre .empleado-nombre") as HTMLElement;

    if (nombreCell && nombreCell.textContent) {
      const txtValue = nombreCell.textContent.toUpperCase();

      // Búsqueda más flexible: busca si el filtro está contenido en el nombre
      if (txtValue.includes(filter)) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  }
}

function restarSemana() {
  punteroFecha.value = punteroFecha.value.minus({ days: 7 });
}

function sumarSemana() {
  punteroFecha.value = punteroFecha.value.plus({ days: 7 });
}

function abrirModalCrearCuadrante() {
  try {
    if (!user.value.idTienda) throw new Error("El trabajador actual no tiene una tienda asignada");
    modalCrearCuadrante2Ref.value?.abrirModal(punteroFecha.value);
    codigoEmpleadoModal.value = false;
  } catch (error) {
    console.log(error);
    Swal.fire("Oops...", "Ha habido un problema, inténtalo más tarde", "error");
  }
}

function getNombreTienda(idTienda: number) {
  for (let i = 0; i < arrayTiendas.value.length; i += 1) {
    if (arrayTiendas.value[i].id === idTienda) return arrayTiendas.value[i].nombre;
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
  const resTiendas = await Tienda.getTiendas();

  if (!resTiendas || resTiendas.length == 0) return;

  let tiendasFiltradas: TTienda[] = [];

  if (tipoUsuario.value === "SUPERVISORA") {
    if (getRole("Super_Admin", "RRHH_ADMIN", "Analisis_Datos", "Procesos")) {
      tiendasFiltradas = resTiendas;
      arrayTiendasFiltradas.value = resTiendas;
    } else {
      const equipo = await getEquipoDe(currentUser.value.uid!);
      const idsTiendasDelEquipo = equipo.map((miembro: any) => miembro.idTienda);

      tiendasFiltradas = resTiendas.filter((tienda) => idsTiendasDelEquipo.includes(tienda.id));

      arrayTiendasFiltradas.value = tiendasFiltradas;
    }
  } else {
    tiendasFiltradas = resTiendas;
    arrayTiendasFiltradas.value = resTiendas;
  }

  arrayTiendas.value = tiendasFiltradas;
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
    console.log("arrayTurnos.value", arrayTurnos.value);
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
    const resCuadrantes = await Cuadrante.getCuadrantesTiendaSemanal(punteroFecha.value.toISO());

    if (!resCuadrantes) throw new Error("No se han encontrado cuadrantes para esta semana");

    resCuadrantes2.value = resCuadrantes.reduce((acc: any, item: any) => {
      const nombreTienda = getNombreTienda(item.idTienda);
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
    ordenarCuadrante(resCuadrantes);
    pintarSemana(resCuadrantes);
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un problema...", "error");
  } finally {
    loadingCuadrantes.value = false;
  }
}

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

        Swal.fire({
          icon: "success",
          title: "Acceso concedido",
          text: "Redirigiendo...",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
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
// Contenedor principal optimizado para tablet
.cuadrantes-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

// Header optimizado
.cuadrantes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 2px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-back {
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #495057;
      transform: scale(1.05);
    }
  }

  .semana-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .semana-titulo {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .week-navigation {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .nav-btn {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
}

// Sección de filtros
.filtros-section {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.filtros-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
}

.filtros-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.filtro-item {
  flex: 1;
  min-width: 200px;
}

.filtro-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.filtros-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

// Contenido principal
.cuadrantes-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tabla-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  max-width: 400px;
}

// Tabla optimizada para tablet landscape
.cuadrantes-table-wrapper {
  flex: 1;
  overflow: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cuadrantes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #e9ecef;
    text-align: center;
    vertical-align: middle;
  }

  thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    position: sticky;
    top: 0;
    z-index: 10;

    th {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }
  }

  // Columnas responsive
  .col-nombre {
    min-width: 120px;
    text-align: left;

    &.sticky-col {
      position: sticky;
      left: 0;
      background: white;
      z-index: 5;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }
  }

  .col-dia {
    min-width: 100px;
    width: 100px;
  }

  .col-horas {
    min-width: 80px;
    width: 80px;

    &.diferencia {
      min-width: 90px;
    }
  }
}

// Elementos de la tabla
.dia-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.dia-nombre {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.dia-fecha {
  font-size: 0.7rem;
  opacity: 0.9;
}

.empleado-info {
  display: flex;
  align-items: center;
}

.empleado-nombre {
  font-weight: 500;
  color: #2c3e50;
}

.turno-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 50px;
  justify-content: center;
}

.turno-item {
  border-radius: 4px;
  padding: 0.25rem;
}

.turno-horario {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  padding: 0.25rem;
}

.horario {
  font-weight: 600;
  color: #1976d2;
  font-size: 0.75rem;
}

.tienda-badge {
  background: #4caf50;
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  margin-top: 0.125rem;
  transition: all 0.3s ease;

  // Cuando es una tienda diferente
  &.tienda-diferente {
    background: #dc3545; // Rojo
    animation: pulse 2s infinite;
  }
}

// Animación opcional para llamar la atención
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.ausencia-badge {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.25rem;
}

.ausencia-tipo,
.ausencia-horas {
  display: block;
  font-size: 0.7rem;
  color: #856404;
  font-weight: 500;
}

.sin-turno {
  color: #6c757d;
  font-style: italic;
}

// Fila del usuario actual
.fila-usuario {
  background: linear-gradient(90deg, #fff3e0 0%, #ffffff 100%);

  .col-nombre.sticky-col {
    background: linear-gradient(90deg, #fff3e0 0%, #ffffff 100%);
  }

  .empleado-nombre {
    color: #f57c00;
    font-weight: 600;
  }
}

// Diferencias de horas
.diferencia-positiva {
  color: #28a745;
  font-weight: 600;
}

.diferencia-negativa {
  color: #dc3545;
  font-weight: 600;
}

// Estados de carga y vacío
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner {
  color: #e66c5a; /* azul Bootstrap por defecto */
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.2rem;
  color: #555;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
}

.empty-state h3 {
  color: #495057;
  margin: 0;
}

.empty-state p {
  color: #6c757d;
  text-align: center;
  margin: 0;
}

// Responsive para tablets más pequeñas
@media (max-width: 1024px) {
  .cuadrantes-header {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .semana-titulo {
    font-size: 1.25rem;
  }

  .filtros-section {
    padding: 0.75rem 1rem;
  }

  .tabla-container {
    padding: 0.75rem 1rem;
  }

  .cuadrantes-table {
    font-size: 0.8rem;

    th,
    td {
      padding: 0.5rem 0.25rem;
    }

    .col-nombre {
      min-width: 100px;
    }

    .col-dia {
      min-width: 80px;
      width: 80px;
    }
  }
}

// Responsive para móviles
@media (max-width: 768px) {
  .cuadrantes-table-wrapper {
    overflow-x: auto;
  }

  .cuadrantes-table {
    min-width: 800px;
  }

  .filtros-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filtros-actions {
    justify-content: center;
  }
}

// Scrollbar personalizado
.cuadrantes-table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.cuadrantes-table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.cuadrantes-table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.cuadrantes-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
