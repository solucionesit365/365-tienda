<template>
  <div class="row row-cols-2 justify-content-center mt-4">
    <div class="col-12 col-xl col-sm-12 mt-2">
      <div class="card">
        <div class="card-body">
          <label for="basic-url" class="form-label">Titulo del video de formación</label>
          <div class="input-group mb-3">
            <input
              id="basic-url"
              v-model="titulo"
              type="text"
              class="form-control"
              aria-describedby="basic-addon3"
            />
          </div>
          <div class="row mb-3">
            <div class="col">
              <label for="basic-url" class="form-label">Descripción del video</label>
              <div class="input-group">
                <input
                  v-model="descripcion"
                  type="text"
                  class="form-control"
                  aria-describedby="basic-addon3"
                />
              </div>
            </div>
            <div class="col">
              <label for="basic-url" class="form-label">Categoría del video</label>
              <select
                id="basic-url"
                v-model="categoria"
                type="text"
                class="form-control"
                aria-describedby="basic-addon3"
              >
                <option value="Elaboración">Elaboración</option>
                <option value="Starters">Starters</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Gestión Tienda">Gestión Tienda</option>
                <option value="Sanidad e Higiene">Sanidad e Higiene</option>
                <option value="PRL">PRL</option>
                <option value="Accidentes">Accidentes</option>
              </select>
            </div>
            <div class="col">
              <label v-if="!todas" for="basic-url" class="form-label">Enviar a la tienda:</label>
              <div v-if="!todas" class="input-group mb-3">
                <select v-model="tienda" class="form-select" style="outline: none" required>
                  <option value="" disabled selected>Selecciona una tienda</option>
                  <option v-for="tienda in arrayTiendas" :key="tienda.value" :value="tienda.value">
                    {{ tienda.text }}
                  </option>
                </select>
              </div>
              <div class="form-check mt-2">
                <input class="form-check-input" type="checkbox" id="todasTiendas" v-model="todas" />
                <label class="form-check-label" for="todasTiendas"> Todas las Tiendas </label>
              </div>
            </div>
          </div>

          <label for="basic-url" class="form-label">Copia el IFRAME del video desde Youtube</label>
          <div class="input-group mb-3">
            <div class="input-group mb-3">
              <input
                id="basic-url"
                v-model="urlVideo"
                type="text"
                class="form-control"
                aria-describedby="basic-addon3"
              />
            </div>
          </div>

          <div class="col-xl-12 col-sm-12 col-12 text-center mt-2">
            <button
              class="btn text-light rounded-8"
              style="background: #5ebea3"
              @click="subirVideo()"
            >
              <i class="fas fa-paper-plane" /> ENVIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const titulo = ref("");
const descripcion = ref("");
const categoria = ref("");
const urlVideo = ref("");
const router = useRouter();
interface Tienda {
  value: number;
  text: string;
}
const arrayTiendas = ref<Tienda[]>([]);
const todas = ref(false);
const tienda = ref("");

async function subirVideo() {
  try {
    if (titulo.value === "") {
      throw Error("Introduce el título del video");
    }

    if (urlVideo.value === "") {
      throw Error("Introduce la url del video");
    }
    const doc = {
      titulo: titulo.value,
      descripcion: descripcion.value,
      categoria: categoria.value,
      urlVideo: urlVideo.value,
      tiendas: todas.value ? [-1] : tienda.value.split(",").map((idTienda) => Number(idTienda)),
    };

    const res = await axiosInstance.post("videos-formacion/nuevoVideoFormacion", doc);

    if (!res.data?.ok) throw Error(res.data.message);

    Swal.fire({
      icon: "success",
      title: "Perfecto",
      showCancelButton: false,
      timer: 2000,
    });
    router.push("/videoFormacion");
  } catch (err) {
    console.log(err);
    const errorMessage = err instanceof Error ? err.message : "Ha ocurrido un error inesperado";
    Swal.fire("Oops...", errorMessage, "error");
  }
}

function getTiendas() {
  axiosInstance
    .get("tiendas")
    .then((resTiendas) => {
      const tiendasOrdenadas = resTiendas.data
        .filter((tienda: { nombre: string; id: number }) => {
          const nombre = tienda.nombre.toLowerCase();
          return (nombre.startsWith("t--") || nombre.startsWith("m--")) && nombre !== "t--000";
        })
        .sort((a: { nombre: string }, b: { nombre: string }) => {
          const nombreA = a.nombre.toLowerCase();
          const nombreB = b.nombre.toLowerCase();
          if (nombreA.startsWith("t--") && !nombreB.startsWith("t--")) return -1;
          if (!nombreA.startsWith("t--") && nombreB.startsWith("t--")) return 1;
          if (nombreA < nombreB) return -1;
          if (nombreA > nombreB) return 1;
          return 0;
        });

      arrayTiendas.value = tiendasOrdenadas.map((tienda: { id: number; nombre: string }) => {
        return { value: tienda.id, text: tienda.nombre };
      });
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Oops...", err.message, "error");
    });
}

onMounted(() => {
  getTiendas();
});
</script>

<style lang="scss" scoped>
.cardDocs {
  background-color: #ffffff;
}

.roundIcon {
  background-color: #c6f5d5;
}

label {
  color: #e66c5a;
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
