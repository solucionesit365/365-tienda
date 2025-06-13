<template>
  <div v-if="loading" class="row text-center mt-2">
    <div>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
  <div v-if="!hayResultados" class="text-center">
    <figure class="figure">
      <img
        src="@/assets/img/nodata.png"
        class="rounded mx-auto d-block mt-3 img-fluid"
        alt="..."
        style="width: 80%"
      />
      <figcaption class="figure-caption text-center">No hay encargos disponibles</figcaption>
    </figure>
  </div>
  <div v-if="hayResultados && !loading">
    <div v-if="hasPermission('ExcelEncargos')" class="col-6 col-sm-6 col-xl-3">
      <!-- <button type="button" class="btn, w-50" color="primary" @click="handleExcelDownload()">
        <i class="fa-sharp fa-solid fa-file-excel fs-3"></i>
      </button> -->
      <button
        type="button"
        class="btn btn-success d-flex align-items-center gap-2 mb-3 ms-2"
        style="font-weight: bold"
        @click="handleExcelDownload()"
      >
        <i class="fa-sharp fa-solid fa-file-excel fs-4"></i>
      </button>
    </div>

    <div class="col-12 col-xl-12 col-sm-12 p-2">
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          aria-describedby="basic-addon1"
          id="buscador"
          input-group
          :form-outline="false"
          @keyup="searchByName()"
        />
        <span class="input-group-text"><i class="fas fa-search" /></span>
      </div>
    </div>
    <table
      class="table table-hover table-striped align-middle shadow-sm rounded bg-white mt-2"
      id="tabla"
    >
      <thead class="bg-info text-white">
        <tr>
          <th scope="col">Cliente</th>
          <th scope="col">Teléfono</th>
          <th scope="col">Fecha a recoger</th>
          <th scope="col">Rango recogida</th>
          <th scope="col">Hora de entrega</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in encargos" :key="index">
          <tr @click="mostrarEncargoModal(item)" style="cursor: pointer">
            <td class="fw-semibold">{{ item.nombre }}</td>
            <td>
              <span class="badge bg-light text-dark border">
                <i class="fas fa-phone-alt me-1"></i>{{ item.telefono }}
              </span>
            </td>
            <td>
              <span class="badge bg-primary bg-opacity-10 text-primary border border-primary">
                {{ DateTime.fromISO(item.fechaEntrega).toFormat("dd/MM/yyyy") }}
              </span>
            </td>
            <td>
              <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">
                {{ item.rangoRecogida }}
              </span>
            </td>
            <td>
              <span
                v-if="!item.horaEntrega"
                class="badge bg-danger bg-opacity-10 text-danger border border-danger"
              >
                <strong>PENDIENTE</strong>
              </span>
              <span
                v-else
                class="badge bg-success bg-opacity-10 text-success border border-success"
              >
                {{ item.horaEntrega }}
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>

  <!-- Mostrar encargos -->
     <ModalEncargos ref="refModalEncargos" />
  <!-- <div
    class="modal"
    tabindex="-1"
    v-if="encargoMostrar"
    id="mostrarEncargo"
    labelledby="mostrarEncargoTitle"
    centered
  >
    <div class="modal-header">
      <h5 class="modal-title" id="mostrarEncargoTitle">
        {{ encargoMostrar.nombre }}
      </h5>
    </div>
    <div class="modal-body">
      <ul class="list-group" light v-for="(item, index) in encargoMostrar.productos" :key="index">
        <li
          class="d-flex justify-content-between align-items-center, list-group-item"
          color="secondary"
          noBorder
          spacing
        >
          <h1>
            <span class="badge text-bg-secondary">{{ item.cantidad }}</span>
          </h1>
          {{ item.nombreProducto }}
        </li>
      </ul>
      <div v-if="!encargoMostrar.recogido">
        <hr />
        <p>Marca la hora que se ha recogido el encargo:</p>
        <div class="mb-3">
          <label for="horaEntrega" class="form-label">Hora entrega</label>
          <input
            id="horaEntrega"
            v-model="updateHoraEntrega"
            type="time"
            class="form-control"
            :max="getMaxTime()"
            required
          />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn" color="secondary" @click="mostrarEncargo = false">
        Cerrar
      </button>
      <button
        type="button"
        class="btn"
        v-if="!encargoMostrar.recogido"
        @click="updateEncargo()"
        color="success"
      >
        marcar como recogido
      </button>
    </div>
  </div> -->
  <!-- Excel -->
  <ModalAbrirExcel ref="refModalAbrirExcel" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Ref, provide } from "vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import * as XLSX from "xlsx";
import { hasPermission } from "@/components/rolesPermisos";
import { useUserStore } from "@/stores/user";
import { DateTime } from "luxon";
import ModalAbrirExcel from "./ModalAbrirExcel.vue";

const userStore = useUserStore();
const hayResultados = ref(true);
const currentUser = computed(() => userStore.user);
const loading = ref(true);
const encargos: Ref<any> = ref();
const mostrarEncargo = ref(false);
const encargoMostrar: Ref<any> = ref(null);
const updateHoraEntrega = ref("");
const nombreExcel: Ref<any> = ref(null);
const nombreExcelModal = ref(false);
const encargosAll: Ref<any> = ref();
const tiendas: Ref<any> = ref();
const refModalAbrirExcel = ref();
const refModalEncargos = ref();
async function getEncargos() {
  try {
    await axiosInstance
      .get("encargos/getEncargos", {
        params: { idTienda: currentUser.value.idTienda },
      })
      .then((response: any) => {
        if (response.data.length > 0) {
          encargos.value = response.data;
          loading.value = false;
        } else {
          loading.value = false;
          hayResultados.value = false;
        }
      });
  } catch (error) {
    console.log(error);
  }
}

async function updateEncargo() {
  try {
    encargoMostrar.value.recogido = true;
    encargoMostrar.value.horaEntrega = updateHoraEntrega.value;

    await axiosInstance
      .post("encargos/updateEncargo", encargoMostrar.value)
      .then((response: any) => {
        if (response) {
          Swal.fire("Perfecto", "Encargo entregado", "success");
          console.log(response);
          mostrarEncargo.value = false;
        } else {
          Swal.fire("Error", "No se ha podido entregar el encargo", "error");
        }
      });
  } catch (error) {
    console.log(error);
  }
}

function mostrarEncargoModal(encargo: any) {
  encargoMostrar.value = encargo;
  mostrarEncargo.value = true;
}

function formatDate(isoStr: string) {
  if (!isoStr) return null;
  // Parsear la fecha ISO en un objeto Date
  const date = DateTime.fromISO(isoStr).toJSDate();
  // Ajustar al comienzo del día en UTC para evitar problemas de zona horaria
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return utcDate;
}

function descargarExcel() {
  try {
    if (!refModalAbrirExcel.value) throw new Error("Modal de Excel no está definido");

    if (
      !refModalAbrirExcel.value.nombreArchivo ||
      refModalAbrirExcel.value.nombreArchivo.trim() == ""
    )
      throw new Error("El nombre del archivo no puede estar vacío");
    refModalAbrirExcel.value.abrirModal();
    nombreExcelModal.value = true;
    nombreExcel.value = refModalAbrirExcel.value.nombreArchivo || "";

    const datosTransformados = encargosAll.value.flatMap((item: any) => {
      const tienda = tiendas.value.find((tienda: any) => tienda.id === item.idTienda);
      const nombreTienda = tienda ? tienda.nombre : "-";
      return item.productos.map((producto: any) => ({
        tienda: nombreTienda,
        productos: producto.nombreProducto ? producto.nombreProducto : "-",
        cantidad: producto.cantidad,
        fechaEntrega: item.fechaEntrega ? formatDate(item.fechaEntrega) : null,
      }));
    });
    const worksheet = XLSX.utils.json_to_sheet(datosTransformados, {
      cellDates: true,
      dateNF: "dd/mm/yyyy", // formato de fecha
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${nombreExcel.value}.xlsx`);
    nombreExcelModal.value = false;
    nombreExcel.value = "";
  } catch (error) {
    console.log(error);
    Swal.fire("Error", "No se ha podido descargar el Excel", "error");
  }
}

//   //if (nombreExcel.value) {
//   if (encargosAll.value && encargosAll.value.length > 0) {
//     const datosTransformados = encargosAll.value.flatMap((item: any) => {
//       // Busca el nombre de la tienda utilizando el idTienda
//       const tienda = tiendas.value.find((tienda: any) => tienda.id === item.idTienda);
//       const nombreTienda = tienda ? tienda.nombre : "-";
//       return item.productos.map((producto: any) => ({
//         tienda: nombreTienda,
//         productos: producto.nombreProducto ? producto.nombreProducto : "-",
//         cantidad: producto.cantidad,
//         fechaEntrega: item.fechaEntrega ? formatDate(item.fechaEntrega) : null,
//       }));
//     });
//     const worksheet = XLSX.utils.json_to_sheet(datosTransformados, {
//       cellDates: true,
//       dateNF: "dd/mm/yyyy", // formato de fecha
//     });
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
//     XLSX.writeFile(workbook, `${nombreExcel.value}.xlsx`);
//     nombreExcelModal.value = false;
//     nombreExcel.value = "";
//   } else {
//     Swal.fire("Oops...", "No hay encargos para exportar.", "error");
//   }
//   //   } else {
//   //     Swal.fire("Oops...", "Pon un nombre al archivo, por favor.", "error");
//   //   }

async function getAllEncargos() {
  try {
    await axiosInstance.get("encargos/getAllEncargos").then((response: any) => {
      if (response.data.length > 0) {
        encargosAll.value = response.data;
        loading.value = false;
      } else {
        loading.value = false;
        hayResultados.value = false;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function handleExcelDownload() {
  // Cargar todos los encargos antes de exportar
  await getAllEncargos();

  // Verificar si hay datos para exportar
  if (encargosAll.value && encargosAll.value.length > 0) {
    refModalAbrirExcel.value.abrirModal();
  } else {
    Swal.fire("Oops...", "No hay encargos disponibles para exportar.", "error");
  }
}

async function getTiendas() {
  try {
    const res = await axiosInstance.get("tiendas");

    tiendas.value = res.data;
  } catch (error) {
    console.log(error);
  }
}

function getMaxTime() {
  // Devuelve la hora máxima permitida para la entrega, por ejemplo la hora current
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function searchByName() {
  const input =
    (document.getElementById("buscador") as HTMLInputElement)?.value?.toLowerCase() || "";
  if (!input) {
    encargos.value = encargosAll.value ? [...encargosAll.value] : [];
    hayResultados.value = encargos.value.length > 0;
    return;
  }
  if (encargosAll.value) {
    encargos.value = encargosAll.value.filter((item: any) =>
      item.nombre?.toLowerCase().includes(input),
    );
    hayResultados.value = encargos.value.length > 0;
  }
}

provide("descargarExcel", descargarExcel);

onMounted(() => {
  getEncargos();
  getTiendas();
});
</script>

<style scoped>
.cardDocs {
  background-color: #fafafa;
}

.roundIcon {
  background-color: #c6f5d5;
}

.accordion-button {
  font-weight: bold;
}
.list-group-item {
  font-size: 1rem;
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem #d7d9e7 !important;
  border-color: #d7d9e7 !important;
  outline: none !important;
}
</style>
