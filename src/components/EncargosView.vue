<template>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <div class="row mb-3">
        <div class="col">
          <button
            type="button"
            class="btn w-100"
            :class="verMisEncargos ? 'colorActive' : 'colorInactive'"
            @click="verMisEncargos = true"
          >
            ENCARGOS TIENDA
          </button>
        </div>
        <div class="col">
          <button
            type="button"
            class="btn w-100"
            :class="!verMisEncargos ? 'colorActive' : 'colorInactive'"
            @click="verMisEncargos = false"
          >
            NUEVO ENCARGO
          </button>
        </div>
      </div>

      <div v-if="verMisEncargos">
        <EncargosList ref="encargoListRef" />
      </div>

      <template v-else>
        <form @submit.prevent="guardarEncargo">
          <div class="row g-2 mb-3">
            <div class="col-md-6">
              <select v-model="selecionarTienda" class="form-select" style="outline: none" required>
                <option value="" disabled selected>Selecciona una tienda</option>
                <option v-for="tienda in tiendas" :key="tienda.value" :value="tienda.value">
                  {{ tienda.text }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Nombre cliente"
                v-model="encargo.nombre"
                required
              />
            </div>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-md-6">
              <input
                type="date"
                class="form-control"
                v-model="encargo.fechaEntrega"
                :min="getToday()"
                required
              />
            </div>
            <div class="col-md-6">
              <select class="form-select" v-model="encargo.rangoRecogida" required>
                <option value="" disabled selected>Selecciona rango</option>
                <option value="06:00h a 12:00h">06:00h a 12:00h</option>
                <option value="12:00h a 17:00h">12:00h a 17:00h</option>
                <option value="17:00h a 21:00h">17:00h a 21:00h</option>
              </select>
            </div>
          </div>
          <div class="row g-2 mb-3">
            <!-- <div class="col-md-6">
              <input
                type="tel"
                class="form-control"
                placeholder="Teléfono"
                v-model="encargo.telefono"
              />
            </div> -->
            <!-- <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">Deja a cuenta</span>
                <input
                  type="number"
                  class="form-control"
                  v-model="encargo.dejaCuenta"
                  min="0"
                />
              </div>
            </div> -->
          </div>

          <div class="accordion mb-3" id="productosAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="productosHeading">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#productosCollapse"
                  aria-expanded="true"
                  aria-controls="productosCollapse"
                >
                  Productos
                </button>
              </h2>
              <div
                id="productosCollapse"
                class="accordion-collapse collapse"
                aria-labelledby="productosHeading"
                data-bs-parent="#productosAccordion"
              >
                <div class="accordion-body p-0">
                  <ul class="list-group list-group-flush">
                    <li
                      v-for="(producto, idx) in productos"
                      :key="producto.value"
                      class="list-group-item d-flex align-items-center justify-content-between"
                    >
                      <span>
                        <strong>{{ idx + 1 }}. {{ producto.text }}</strong>
                      </span>
                      <input
                        type="number"
                        class="form-control form-control-sm ms-2"
                        style="width: 70px"
                        min="0"
                        v-model.number="producto.cantidad"
                      />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-center">
            <button type="submit" class="btn btn-success mt-3">Crear Encargo</button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import EncargosList from "./EncargosList.vue";

const verMisEncargos = ref(true);
const encargoListRef = ref(null);
const tiendas = ref<{ value: string; text: string }[]>([]);
const selecionarTienda = ref("");

const encargo = ref<{
  idTienda: string;
  nombre: string;
  fechaEntrega: string | null;
  horaEntrega: string | null;
  telefono: string;
  dejaCuenta: number;
  recogido: boolean;
  rangoRecogida: string;
  productos: { nombreProducto: string; cantidad: number }[];
}>({
  idTienda: selecionarTienda.value,
  nombre: "",
  fechaEntrega: null,
  horaEntrega: null,
  telefono: "",
  dejaCuenta: 0,
  recogido: false,
  rangoRecogida: "",
  productos: [],
});

const productos = ref([
  {
    text: "Coca briox crema MINI",
    value: "Coca briox crema MINI",
    cantidad: 0,
  },
  {
    text: "Coca briox crema Mitjana",
    value: "Coca briox crema Mitjana",
    cantidad: 0,
  },
  {
    text: "Coca briox crema Gran",
    value: "Coca briox crema Gran",
    cantidad: 0,
  },
  {
    text: "Coca briox Nata",
    value: "Coca briox Nata",
    cantidad: 0,
  },
  {
    text: "Coca briox Fruita Mitjana",
    value: "Coca briox Fruita Mitjana",
    cantidad: 0,
  },
  {
    text: "Coca briox Fruita Gran",
    value: "Coca briox Fruita Gran ",
    cantidad: 0,
  },
  {
    text: "Coca briox Llardons Mitjana",
    value: "Coca briox Llardons Mitjana ",
    cantidad: 0,
  },
  {
    text: "Coca briox Llardons Gran",
    value: "Coca briox Llardons Gran ",
    cantidad: 0,
  },
  {
    text: "Coca Pasta de Full d'àngel",
    value: "Coca Pasta de Full d'àngel",
    cantidad: 0,
  },
  {
    text: "Coca Pasta de Full Crema",
    value: "Coca Pasta de Full Crema",
    cantidad: 0,
  },
  {
    text: "Coca Pasta de Full Xococlata",
    value: "Coca Pasta de Full Xococlata",
    cantidad: 0,
  },
]);

const guardarEncargo = async () => {
  const fallo = ref(false);
  if (encargo.value.rangoRecogida === "") {
    fallo.value = true;
    Swal.fire("Error", "Debes seleccionar el rango de recogida", "error");
  }
  if (encargo.value.nombre === "") {
    fallo.value = true;
    Swal.fire("Error", "Debes introducir el nombre del cliente", "error");
  }
  if (selecionarTienda.value === "") {
    fallo.value = true;
    Swal.fire("Error", "Debes seleccionar una tienda", "error");
  }
  encargo.value.idTienda = selecionarTienda.value;

  /*if (encargo.value.telefono === "") {
        fallo.value = true;
        Swal.fire("Error", "Debes introducir el telefono del cliente", "error");
      }*/

  if (!fallo.value) {
    encargo.value.productos = productos.value
      .filter((producto) => producto.cantidad > 0)
      .map((producto) => ({
        nombreProducto: producto.value,
        cantidad: producto.cantidad,
      }));
    if (encargo.value.productos.length <= 0) {
      fallo.value = true;
      Swal.fire("Error", "Debes de introducir almenos un producto y su cantidad", "error");
    } else {
      await axiosInstance.post("encargos/newEncargo", encargo.value).then((response) => {
        if (response) {
          Swal.fire(
            "Perfecto",
            `Encargo creado. Se recogerá el ${encargo.value.fechaEntrega} de ${encargo.value.rangoRecogida}`,
            "success",
          );
          encargo.value = {
            idTienda: selecionarTienda.value,
            nombre: "",
            fechaEntrega: null,
            horaEntrega: null,
            telefono: "",
            dejaCuenta: 0,
            recogido: false,
            rangoRecogida: "",
            productos: [],
          };
          verMisEncargos.value = true;
        }
      });
    }
  }
};

function getTiendas() {
  axiosInstance
    .get("tiendas")
    .then((resTiendas) => {
      tiendas.value = resTiendas.data.map((tienda: any) => {
        return { value: tienda.id, text: tienda.nombre };
      });

      // Filtrar solo las tiendas que empiezan con "t--" o "m--"
      const filteredTiendas = tiendas.value
        .filter((tienda) => {
          const nombreLower = tienda.text.toLowerCase();
          return (
            (nombreLower.startsWith("t--") || nombreLower.startsWith("m--")) &&
            !nombreLower.startsWith("t--000")
          );
        })
        .sort((a, b) => {
          const nameAStartsWithT = a.text.toLowerCase().startsWith("t--");
          const nameBStartsWithT = b.text.toLowerCase().startsWith("t--");
          const nameAStartsWithM = a.text.toLowerCase().startsWith("m--");
          const nameBStartsWithM = b.text.toLowerCase().startsWith("m--");

          if (nameAStartsWithT && !nameBStartsWithT) {
            return -1;
          } else if (!nameAStartsWithT && nameBStartsWithT) {
            return 1;
          } else if (nameAStartsWithM && !nameBStartsWithM) {
            return -1;
          } else if (!nameAStartsWithM && nameBStartsWithM) {
            return 1;
          } else {
            return a.text.localeCompare(b.text);
          }
        });

      tiendas.value = filteredTiendas;
    })
    .catch((err) => {
      console.log("Error al obtener tiendas:", err);
    });
}

onMounted(() => {
  getTiendas();
});

function getToday(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
</script>

<style scoped>
.cardDocs {
  background-color: #ffffff;
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
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

.accordion-button {
  font-weight: bold;
}

.accordion-button:not(.collapsed) {
  background-color: #fff !important;
  color: #212529;
  box-shadow: none;
}

.list-group-item {
  font-size: 1rem;
}
.btn-encargo {
  background-color: #e66c5a !important;
  color: #fff !important;
}

.form-control:focus,
.form-select:focus,
.btn:focus,
.accordion-button:focus {
  box-shadow: 0 0 0 0.2rem #d7d9e7 !important;
  border-color: #d7d9e7 !important;
  outline: none !important;
}
</style>
