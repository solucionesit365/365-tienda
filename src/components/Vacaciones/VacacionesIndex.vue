<template>
  <div class="justify-content-center mt-2">
    <div class="col-xl-12 col-sm-12 col-12">
      <div class="card">
        <div class="row">
          <div class="col">
            <BsButton
              class="w-100"
              :class="{
                colorActive: saldoVacaciones == true,
                colorInactive: saldoVacaciones == false,
              }"
              @click="saldoVacaciones = true"
            >
              SOLICITUDES
            </BsButton>
          </div>
          <div class="col">
            <BsButton
              class="w-100"
              :class="{
                colorActive: saldoVacaciones == false,
                colorInactive: saldoVacaciones == true,
              }"
              @click="saldoVacaciones = false"
            >
              SALDO
            </BsButton>
          </div>
        </div>
        <template v-if="saldoVacaciones == true">
          <div class="card-content">
            <div class="card-body">
              <div class="row custom-row">
                <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
                  <router-link
                    v-if="llevaEquipo || hasPermission('ModoTienda')"
                    to="/pedir-vacaciones"
                    class="text-decoration-none"
                  >
                    <BsButton color="success" class="me-2"
                      ><i class="fas fa-plus" /> Nueva
                    </BsButton>
                  </router-link>

                  <BsButton
                    class="me-1"
                    :class="vacacionesYear ? 'colorActiveAño' : 'colorInactiveAño'"
                    @click="chucha2(currentYear)"
                  >
                    {{ currentYear }}
                  </BsButton>

                  <BsButton
                    class="me-3"
                    :class="!vacacionesYear ? 'colorActiveAño' : 'colorInactiveAño'"
                    @click="chucha2(parseInt(currentYear) - 1)"
                  >
                    {{ Number(currentYear) - 1 }}
                  </BsButton>

                  <!-- Filtros por estado -->
                  <template>
                    <BsSelect
                      v-model:options="arrayUsuarios"
                      v-model:selected="trabajadorSelect"
                      filter
                      :preselect="false"
                      :select-all="false"
                      :search-placeholder="'Buscar'"
                      options-selected-label="trabajador/s seleccionada/s"
                      @change="getSolicitudesCoordinadora(Number(currentYear))"
                    />
                    <BsButton
                      title="Pendientes"
                      color="warning"
                      @click="getSolicitudesPendientes(Number(currentYear))"
                    >
                      <i class="fas fa-hourglass-half" />
                    </BsButton>
                    <BsButton
                      title="Aprobadas"
                      color="success"
                      @click="getSolicitudesAprobadas(Number(currentYear))"
                    >
                      <i class="fas fa-check" />
                    </BsButton>
                    <BsButton
                      title="Rechazadas"
                      color="danger"
                      @click="getSolicitudesRechazadas(Number(currentYear))"
                    >
                      <i class="fas fa-times" />
                    </BsButton>
                  </template>

                  <!-- Buscador -->
                  <div class="flex-grow-1">
                    <BsInput
                      id="buscador"
                      input-group
                      :form-outline="false"
                      aria-label="Buscar por nombre en la tabla"
                      placeholder="Buscar por nombre"
                      v-model="search3"
                    >
                      <span class="input-group-text"><i class="fas fa-search" /></span>
                    </BsInput>
                  </div>
                </div>
              </div>
              <BsTable
                v-if="!loading"
                :items="listaSolicitudes"
                :search="search3"
                searchKey="nombreApellidos"
                class="align-middle bg-white"
              >
                <template #head>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    <th>Fecha incorporación</th>
                    <th>Fecha de creación</th>
                    <th>Total días</th>
                    <th>Tienda</th>
                    <th>Observaciones</th>
                    <th>Estado</th>
                    <th>Creadas por</th>
                    <th>Respuesta</th>
                    <th>Acción</th>
                  </tr>
                </template>

                <template #body="{ item, index }">
                  <tr :key="index">
                    <td data-th="Nombre">{{ item.nombreApellidos }}</td>
                    <td data-th="Fecha inicio">{{ item.fechaInicio }}</td>
                    <td data-th="Fecha fin">{{ item.fechaFinal }}</td>
                    <td data-th="Fecha incorpor">{{ item.fechaIncorporacion }}</td>
                    <td data-th="Fecha creación">{{ item.fechaCreacion }}</td>
                    <td data-th="Total días">{{ item.totalDias }}</td>
                    <td data-th="Tienda">{{ item.tiendaActual || "-" }}</td>
                    <td data-th="Observaciones">{{ item.observaciones }}</td>
                    <td data-th="Estado">
                      <span
                        class="badge"
                        :class="{
                          'bg-warning': item.estado === 'PENDIENTE',
                          'bg-danger': item.estado === 'RECHAZADA',
                          'bg-success': item.estado === 'APROBADA',
                        }"
                      >
                        {{ item.estado }}
                      </span>
                    </td>

                    <td data-th="Creadas por">{{ item.creadasReal }}</td>
                    <td data-th="Respuesta">{{ item.respuestaSolicitud || "-" }}</td>
                    <td
                      v-if="hasPermission('GestionVacaciones', 'AprobarVacaciones')"
                      data-th="Acción"
                    >
                      <div class="btn-group btn-group-sm" role="group">
                        <button
                          v-if="item.estado === 'PENDIENTE' && hasPermission('AprobarVacaciones')"
                          class="call-btn btn border rounded-0 btn-outline-success btn-floating"
                          @click="accionVacaciones(item, 'APROBAR')"
                        >
                          <i class="fas fa-thumbs-up" />
                        </button>
                        <button
                          v-if="item.estado === 'PENDIENTE' && hasPermission('AprobarVacaciones')"
                          class="message-btn btn border rounded-0 ms-2 btn-outline-danger btn-floating"
                          @click="accionVacaciones(item, 'RECHAZAR')"
                        >
                          <i class="fas fa-thumbs-down" />
                        </button>
                        <button
                          v-if="hasPermission('EnviarMailVacaciones')"
                          class="message-btn btn border rounded-0 ms-2 btn-outline-success btn-floating"
                          @click="enviarMail(item)"
                        >
                          <i class="fas fa-envelope"></i>
                        </button>
                        <button
                          v-if="hasPermission('EnviarCuadranteVacaciones')"
                          class="message-btn btn border rounded-0 ms-2 btn-outline-warning btn-floating"
                          @click="enviarAlCuadrante(item)"
                        >
                          <i class="far fa-calendar-alt"></i>
                        </button>
                        <button
                          v-if="hasPermission('EliminarVacaciones')"
                          class="message-btn btn border rounded-0 ms-2 btn-outline-danger btn-floating"
                          @click="accionVacaciones(item, 'BORRAR')"
                        >
                          <i class="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                    <td data-th="Acción" v-else>-</td>
                  </tr>
                </template>
              </BsTable>
              <div v-if="!hayResultados" class="text-center">
                <figure class="figure">
                  <img
                    src="@/assets/img/nodata.png"
                    class="rounded mx-auto d-block mt-3 img-fluid"
                    alt="..."
                    style="width: 80%"
                  />
                  <figcaption class="figure-caption text-center">
                    Aún no has solicitado vacaciones de nadie, pincha en Nueva para crear una.
                  </figcaption>
                </figure>
              </div>
              <div v-if="loading" class="wrap mt-4 text-center">
                <BsSpinner
                  class="spinner"
                  :style="{ width: '3rem', height: '3rem' }"
                  role="status"
                />
                <p class="loading-text">Cargando...</p>
              </div>
            </div>
          </div>
        </template>
        <template v-if="saldoVacaciones == false">
          <div class="row">
            <BsTable :items="arraySaldos">
              {{ arraySaldos }}
              <template #head>
                <tr>
                  <th>Nombre</th>
                  <th>APROBADOS</th>
                  <th>APROBACIÓN</th>
                  <th>DISPONIBLES</th>
                  <th>AÑO</th>
                </tr>
              </template>
              <template #body="{ item, index }">
                <tr :key="index">
                  <td data-th="NOMBRE">{{ item.nombreApellidos }}</td>
                  <td class="text-success" data-th="APROBADOS">
                    {{ item.aprobados }}
                  </td>
                  <td class="text-warning" data-th="PDTES DE APROBACIÓN">
                    {{ item.totalPendienteValidar }}
                  </td>
                  <td class="text-primary" data-th="DISPONIBLES">
                    {{ item.diasDisponibles }}
                  </td>
                  <td class="text-dark" data-th="AÑO">
                    {{ item.totalDiasYear }}
                  </td>
                </tr>
              </template>
            </BsTable>
          </div>
        </template>
      </div>
    </div>
  </div>
  <ModalComentario ref="modalComentarioRef" />
</template>
<script setup lang="ts">
import ModalComentario from "@/components/ModalComentario.vue";
import { ref, computed, onMounted, provide, type Ref } from "vue";
import BsButton from "@/components/365/BsButton.vue";
import Swal from "sweetalert2";
import { calcularSaldoEmpleado } from "@/components/equipoGeneral";
import { getEquipoDe } from "@/components/equipoGeneral";
import { axiosInstance } from "@/components/axios/axios";
import { hasPermission } from "@/components/rolesPermisos";
import { useUserStore } from "@/stores/user";
import { DateTime } from "luxon";
import BsSelect from "@/components/365/BsSelect.vue";
import BsInput from "@/components/365/BsInput.vue";
import BsTable from "@/components/365/BsTable.vue";
import BsSpinner from "../365/BsSpinner.vue";

const userStore = useUserStore();
const search3 = ref("");
const listaSolicitudes: Ref<any> = ref([]);
const hayResultados = ref(false);
const loading = ref(false);
const llevaEquipo = computed(() => userStore.user.llevaEquipo);
const currentUser = userStore.user;
const modalComentarioRef: Ref<any> = ref(null);
const comentarioRechazo = computed(() => modalComentarioRef.value?.comentario);
const saldoVacaciones = ref(true);
const trabajadorSelect: Ref<any> = ref(null);
const vacacionesYear = ref(true);
const arrayUsuarios: Ref<any[]> = ref([]);
const arraySaldos: Ref<any[]> = ref([]);
const currentYear = ref(DateTime.now().toFormat("yyyy"));

async function accionVacaciones(item: any, accion: any) {
  try {
    if (accion === "APROBAR") {
      const res = await axiosInstance.post("solicitud-vacaciones/setEstadoSolicitud", {
        estado: "APROBADA",
        _id: item._id,
      });
      if (res.data.ok) {
        getSolicitudes(Number(currentYear.value));
        Swal.fire({
          icon: "success",
          title: "Perfecto",
          text: `Solicitud aprobada`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else throw Error("No se ha podido aprobar la solicitud");
    } else if (accion === "RECHAZAR") {
      modalComentarioRef.value.abrirModal("Motivo/comentario", item._id);
    } else if (accion === "BORRAR") {
      Swal.fire({
        title: "Estas segura?",
        text: "No podrás recuperarlo!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, borrar!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await axiosInstance.post("solicitud-vacaciones/borrarSolicitud", {
            _id: item._id,
          });
          if (res.data.ok) {
            getSolicitudes(Number(currentYear));
            Swal.fire({
              icon: "success",
              title: "Perfecto",
              text: `Solicitud borrada`,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          }
        }
      });
    } else throw Error("No se reconoce esta acción");
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function finalizarDenegacion(idSolicitud: string) {
  const res = await axiosInstance.post("solicitud-vacaciones/setEstadoSolicitud", {
    estado: "RECHAZADA",
    _id: idSolicitud,
    respuestaSolicitud: comentarioRechazo.value,
  });

  modalComentarioRef.value.cerrarModal();

  if (res.data.ok) {
    Swal.fire({
      icon: "success",
      title: "Perfecto",
      text: `Solicitud rechazada`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    getSolicitudes(Number(currentYear));
  } else throw Error("No se ha podido rechazar la solicitud");
}

provide("finalizar", finalizarDenegacion);

async function getSolicitudes(year: number) {
  loading.value = true;
  hayResultados.value = true;
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || userStore.getUid;
  try {
    const resSolicitudesEquipo = await axiosInstance.get(
      "solicitud-vacaciones/solicitudesSubordinados",
      { params: { idAppResponsable: uidParaConsultar, year: year } },
    );

    if (resSolicitudesEquipo.data.ok) {
      // Filtrar duplicados
      const uniqueSolicitudes = new Set(
        resSolicitudesEquipo.data.data.map((solicitud: any) => solicitud._id),
      );
      listaSolicitudes.value = Array.from(uniqueSolicitudes).map((uniqueId) =>
        resSolicitudesEquipo.data.data.find((solicitud: any) => solicitud._id === uniqueId),
      );

      axiosInstance.get("trabajadores").then((contratos) => {
        const trabajadoresMap: any = {};
        contratos.data.forEach((contrato: any) => {
          trabajadoresMap[contrato.id] = contrato;
        });
        // Actualizar nombre tienda y creador en listaSolicitudes
        listaSolicitudes.value = listaSolicitudes.value.map((solicitud: any) => {
          const trabajador = trabajadoresMap[solicitud.idBeneficiario];
          const creador = trabajadoresMap[solicitud.creador];
          return {
            ...solicitud,
            tiendaActual:
              trabajador && trabajador.nombreTienda ? trabajador.nombreTienda : solicitud.tienda,
            creadasReal:
              creador && creador.nombreApellidos
                ? creador.nombreApellidos
                : solicitud.creadorReal || solicitud.creadasPor || "Desconocido",
          };
        });
        loading.value = false;
      });
    } else throw Error("No se han podido obtener las solicitudes de tu equipo");
  } catch (err) {
    console.log(err);
    listaSolicitudes.value = [];
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function getSolicitudesPendientes(year: number) {
  listaSolicitudes.value = [];
  loading.value = true;
  hayResultados.value = true;
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || userStore.getUid;
  // const idsqlGuardado = localStorage.getItem("idSqlCoordinadora");
  // const idSqlParaConsultar = Number(
  //   idsqlGuardado || currentUser.value.idSql
  // );
  try {
    const resSolicitudesEquipo = await axiosInstance.get(
      "solicitud-vacaciones/solicitudesSubordinados",
      { params: { idAppResponsable: uidParaConsultar, year: year } },
    );

    if (resSolicitudesEquipo.data.ok) {
      // Filtrar solicitudes con estado 'PENDIENTE'
      const solicitudesPendientes = resSolicitudesEquipo.data.data.filter(
        (solicitud: any) => solicitud.estado === "PENDIENTE",
      );

      // Filtrar duplicados
      const uniqueSolicitudes = new Set(
        solicitudesPendientes.map((solicitud: any) => solicitud._id),
      );
      listaSolicitudes.value = Array.from(uniqueSolicitudes).map((uniqueId) =>
        solicitudesPendientes.find((solicitud: any) => solicitud._id === uniqueId),
      );

      axiosInstance.get("trabajadores").then((contratos) => {
        const trabajadoresMap: any = {};
        contratos.data.forEach((contrato: any) => {
          trabajadoresMap[contrato.id] = contrato;
        });
        // Actualizar nombre tienda y creador en listaSolicitudes
        listaSolicitudes.value = listaSolicitudes.value.map((solicitud: any) => {
          const trabajador = trabajadoresMap[solicitud.idBeneficiario];
          const creador = trabajadoresMap[solicitud.creador];
          return {
            ...solicitud,
            tiendaActual:
              trabajador && trabajador.nombreTienda ? trabajador.nombreTienda : solicitud.tienda,
            creadasReal:
              creador && creador.nombreApellidos
                ? creador.nombreApellidos
                : solicitud.creadorReal || solicitud.creadasPor || "Desconocido",
          };
        });
      });
    } else {
      throw Error("No se han podido obtener las solicitudes de tu equipo pendientes");
    }
  } catch (err) {
    console.log(err);
    listaSolicitudes.value = [];
    Swal.fire("Oops...", "Ha habido un error", "error");
  } finally {
    loading.value = false;
  }
}

async function getSolicitudesAprobadas(year: number) {
  listaSolicitudes.value = [];
  loading.value = true;
  hayResultados.value = true;
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || userStore.getUid;
  try {
    const resSolicitudesEquipo = await axiosInstance.get(
      "solicitud-vacaciones/solicitudesSubordinados",
      { params: { idAppResponsable: uidParaConsultar, year: year } },
    );

    if (resSolicitudesEquipo.data.ok) {
      // Filtrar solicitudes con estado 'APROBADA'
      const solicitudesAprobadas = resSolicitudesEquipo.data.data.filter(
        (solicitud: any) => solicitud.estado === "APROBADA",
      );

      // Filtrar duplicados
      const uniqueSolicitudes = new Set(
        solicitudesAprobadas.map((solicitud: any) => solicitud._id),
      );
      listaSolicitudes.value = Array.from(uniqueSolicitudes).map((uniqueId) =>
        solicitudesAprobadas.find((solicitud: any) => solicitud._id === uniqueId),
      );

      axiosInstance.get("trabajadores").then((contratos) => {
        const trabajadoresMap: any = {};
        contratos.data.forEach((contrato: any) => {
          trabajadoresMap[contrato.id] = contrato;
        });
        // Actualizar nombre tienda y creador en listaSolicitudes
        listaSolicitudes.value = listaSolicitudes.value.map((solicitud: any) => {
          const trabajador = trabajadoresMap[solicitud.idBeneficiario];
          const creador = trabajadoresMap[solicitud.creador];
          return {
            ...solicitud,
            tiendaActual:
              trabajador && trabajador.nombreTienda ? trabajador.nombreTienda : solicitud.tienda,
            creadasReal:
              creador && creador.nombreApellidos
                ? creador.nombreApellidos
                : solicitud.creadorReal || solicitud.creadasPor || "Desconocido",
          };
        });
      });
    } else {
      throw Error("No se han podido obtener las solicitudes de tu equipo aprobadas");
    }
  } catch (err) {
    console.log(err);
    listaSolicitudes.value = [];
    Swal.fire("Oops...", "Ha habido un error", "error");
  } finally {
    loading.value = false;
  }
}

async function getSolicitudesRechazadas(year: number) {
  listaSolicitudes.value = [];
  loading.value = true;
  hayResultados.value = true;
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || userStore.getUid;
  try {
    const resSolicitudesEquipo = await axiosInstance.get(
      "solicitud-vacaciones/solicitudesSubordinados",
      { params: { idAppResponsable: uidParaConsultar, year: year } },
    );

    if (resSolicitudesEquipo.data.ok) {
      // Filtrar solicitudes con estado 'RECHAZADA'
      const solicitudesRechazadas = resSolicitudesEquipo.data.data.filter(
        (solicitud: any) => solicitud.estado === "RECHAZADA",
      );

      // Filtrar duplicados
      const uniqueSolicitudes = new Set(
        solicitudesRechazadas.map((solicitud: any) => solicitud._id),
      );
      listaSolicitudes.value = Array.from(uniqueSolicitudes).map((uniqueId) =>
        solicitudesRechazadas.find((solicitud: any) => solicitud._id === uniqueId),
      );

      axiosInstance.get("trabajadores").then((contratos) => {
        const trabajadoresMap: any = {};
        contratos.data.forEach((contrato: any) => {
          trabajadoresMap[contrato.id] = contrato;
        });
        // Actualizar nombre tienda y creador en listaSolicitudes
        listaSolicitudes.value = listaSolicitudes.value.map((solicitud: any) => {
          const trabajador = trabajadoresMap[solicitud.idBeneficiario];
          const creador = trabajadoresMap[solicitud.creador];
          return {
            ...solicitud,
            tiendaActual:
              trabajador && trabajador.nombreTienda ? trabajador.nombreTienda : solicitud.tienda,
            creadasReal:
              creador && creador.nombreApellidos
                ? creador.nombreApellidos
                : solicitud.creadorReal || solicitud.creadasPor || "Desconocido",
          };
        });
      });
    } else {
      throw Error("No se han podido obtener las solicitudes de tu equipo rechazadas");
    }
  } catch (err) {
    console.log(err);
    listaSolicitudes.value = [];
    Swal.fire("Oops...", "Ha habido un error", "error");
  } finally {
    loading.value = false;
  }
}

function calcularSaldoGlobal(year: number) {
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || userStore.getUid;
  const idsqlGuardado = localStorage.getItem("idSqlCoordinadora");
  const idSqlParaConsultar = Number(idsqlGuardado || currentUser.idSql);
  arraySaldos.value = [];
  axiosInstance
    .get("trabajadores/getSubordinadosByIdsql", {
      params: { idSql: idSqlParaConsultar },
    })
    .then((contratosEquipoDirecto) => {
      if (contratosEquipoDirecto.data.ok) {
        axiosInstance
          .get("solicitud-vacaciones/solicitudesSubordinados", {
            params: { idAppResponsable: uidParaConsultar, year: year },
          })
          .then((solicitudesEquipoDirecto) => {
            if (solicitudesEquipoDirecto.data.ok) {
              // Filtrar duplicados
              const uniqueSolicitudesDirecto = new Set(
                solicitudesEquipoDirecto.data.data.map((solicitud: any) => solicitud._id),
              );
              solicitudesEquipoDirecto.data.data = Array.from(uniqueSolicitudesDirecto).map(
                (uniqueId) =>
                  solicitudesEquipoDirecto.data.data.find(
                    (solicitud: any) => solicitud._id === uniqueId,
                  ),
              );

              for (let i = 0; i < contratosEquipoDirecto.data.data.length; i++) {
                if (year == Number(currentYear.value)) {
                  arraySaldos.value.push({
                    nombreApellidos: contratosEquipoDirecto.data.data[i].nombreApellidos,
                    ...calcularSaldoEmpleado(
                      contratosEquipoDirecto.data.data[i],
                      solicitudesEquipoDirecto.data.data,
                      "calculoAñoActual",
                    ),
                  });
                } else {
                  arraySaldos.value.push({
                    nombreApellidos: contratosEquipoDirecto.data.data[i].nombreApellidos,
                    ...calcularSaldoEmpleado(
                      contratosEquipoDirecto.data.data[i],
                      solicitudesEquipoDirecto.data.data,
                      "calculoAñoAnterior",
                    ),
                  });
                }
              }
            } else {
              throw Error("No se han podido descargar las solicitudes de vacaciones de tu equipo");
            }
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Oops...", err.message, "error");
          });
      }
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Oops...", err.message, "error");
    });
}

function enviarMail(vacaciones: any) {
  if (vacaciones) {
    Swal.fire({
      title: "Estas segur@?",
      text: "Enviarás una copia de las vaciones al correo de esa persona con el estado actual",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, enviar!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.post("solicitud-vacaciones/enviarAlEmail", vacaciones).then((res) => {
          if (res.data.ok) {
            Swal.fire("Enviado!", "La copia de las vacaciones ha sido enviada", "success");
          }
        });
      }
    });
  }
}

function enviarAlCuadrante(vacaciones: any) {
  if (vacaciones) {
    Swal.fire({
      title: "Estas segur@?",
      text: "Forzarás el volcado de estas vacaciones en el cuadrante",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, forzar!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.post("solicitud-vacaciones/enviarAlCuadrante", vacaciones).then((res) => {
          if (res.data.ok) {
            Swal.fire("Forzado!", "Vacaciones volcadas en el cuadrante", "success");
          }
        });
      }
    });
  }
}

function chucha2(param: any) {
  listaSolicitudes.value = [];
  arraySaldos.value = [];
  if (param == currentYear.value) {
    vacacionesYear.value = true;
    getSolicitudes(param).then(() => {
      calcularSaldoGlobal(param);
    });
  } else {
    vacacionesYear.value = false;
    getSolicitudes(param).then(() => {
      calcularSaldoGlobal(param);
    });
  }
}

async function getUsuarios() {
  try {
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || userStore.getUid!;
    const equipo = await getEquipoDe(uidParaConsultar);
    if (equipo && equipo.length > 0) {
      const usuarios = equipo.map((usuario: any) => ({
        text: usuario.nombreApellidos,
        value: usuario.idApp,
      }));
      // Ordenar
      usuarios.sort((a: any, b: any) => a.text.localeCompare(b.text));
      arrayUsuarios.value = usuarios;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getSolicitudesCoordinadora(year: number) {
  listaSolicitudes.value = [];
  loading.value = true;
  hayResultados.value = true;
  try {
    const resSolicitudesEquipo = await axiosInstance.get(
      "solicitud-vacaciones/solicitudesSubordinados",
      {
        params: {
          idAppResponsable: trabajadorSelect.value,
          year: year,
        },
      },
    );

    if (resSolicitudesEquipo.data.ok) {
      // Filtrar duplicados
      const uniqueSolicitudes = new Set(
        resSolicitudesEquipo.data.data.map((solicitud: any) => solicitud._id),
      );
      listaSolicitudes.value = Array.from(uniqueSolicitudes).map((uniqueId) =>
        resSolicitudesEquipo.data.data.find((solicitud: any) => solicitud._id === uniqueId),
      );
      axiosInstance.get("trabajadores").then((contratos) => {
        const trabajadoresMap: any = {};
        contratos.data.forEach((contrato: any) => {
          trabajadoresMap[contrato.id] = contrato;
        });
        // Actualizar nombre tienda y creador en listaSolicitudes
        listaSolicitudes.value = listaSolicitudes.value.map((solicitud: any) => {
          const trabajador = trabajadoresMap[solicitud.idBeneficiario];
          const creador = trabajadoresMap[solicitud.creador];
          return {
            ...solicitud,
            tiendaActual:
              trabajador && trabajador.nombreTienda ? trabajador.nombreTienda : solicitud.tienda,
            creadasReal:
              creador && creador.nombreApellidos
                ? creador.nombreApellidos
                : solicitud.creadorReal || solicitud.creadasPor || "Desconocido",
            validador: userStore.getUid,
          };
        });
      });
    } else throw Error("No se han podido obtener las solicitudes de la coordinadora");
  } catch (err) {
    console.log(err);
    listaSolicitudes.value = [];
    Swal.fire("Oops...", "Ha habido un mensaje", "error");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (hasPermission("SolicitudesCoordinadoras")) {
    getUsuarios();
  } else {
    getSolicitudes(Number(currentYear.value)).then(() => {
      calcularSaldoGlobal(Number(currentYear.value));
    });
  }
});
</script>

<style lang="scss" scoped>
.colorActive {
  background: #e66c5a !important;
  color: white;
  padding: 0.6rem;
  font-weight: bold;
  border: none;
  border-radius: 0.3rem;
}

.spinner {
  color: #e66c5a; /* azul Bootstrap por defecto */
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.2rem;
  color: #555;
}

.colorInactive {
  background-color: #d7d9e7;
  color: rgb(119, 119, 119);
  padding: 0.6rem;
  font-weight: bold;
  border: none;
  border-radius: 0.3rem;
}
.colorActiveAño {
  background-color: #0d6efd; /* azul Bootstrap */
  color: white;
  border: 1px solid #0d6efd;
}

.colorInactiveAño {
  background-color: white;
  color: #0d6efd;
  border: 1px solid #0d6efd;
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: none;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

//Responsive table
table tbody {
  font-size: 0.8rem !important;
}

table {
  margin-top: 0.5rem;
  width: 100%;
  border-spacing: 3px;
  border-collapse: separate;
}

th:first-child,
td:first-child {
  color: white;
  font-weight: bold;
  background: #6c7472;
}

th,
td {
  padding: 0.3em;
  text-align: center;
  background: white;
}

@media screen and (max-width: 650px) {
  thead {
    display: none;
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

// Responsive table end

//loader
.text {
  color: #fbae17;
  display: inline-block;
  margin-left: 5px;
}

.bounceball {
  position: relative;
  display: inline-block;
  height: 37px;
  width: 15px;
}

.bounceball:before {
  position: absolute;
  content: "";
  display: block;
  top: 0;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #fbae17;
  transform-origin: 50%;
  -webkit-animation: bounce 500ms alternate infinite ease;
  animation: bounce 500ms alternate infinite ease;
}

@-webkit-keyframes bounce {
  0% {
    top: 30px;
    height: 5px;
    border-radius: 60px 60px 20px 20px;
    transform: scaleX(2);
  }

  35% {
    height: 15px;
    border-radius: 50%;
    transform: scaleX(1);
  }

  100% {
    top: 0;
  }
}

.custom-row .col-auto {
  margin-right: -1.5rem;
}

@keyframes bounce {
  0% {
    top: 30px;
    height: 5px;
    border-radius: 60px 60px 20px 20px;
    transform: scaleX(2);
  }

  35% {
    height: 15px;
    border-radius: 50%;
    transform: scaleX(1);
  }

  100% {
    top: 0;
  }
}
</style>
