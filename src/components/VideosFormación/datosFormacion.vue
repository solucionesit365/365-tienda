<template>
  <div class="card border-0 shadow-lg rounded-4 mt-4">
    <div class="card-body cardDocs">
      <h4 class="mb-4 fw-bold text-center" style="color: #e66c5a">
        <i class="fas fa-graduation-cap me-2" style="color: #e66c5a"></i>Datos Formación
      </h4>
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 mb-4">
          <div class="input-group shadow-sm">
            <span class="input-group-text bg-white border-end-0" style="color: #e66c5a">
              <i class="fas fa-search" style="color: #e66c5a" />
            </span>
            <input
              id="buscador"
              type="text"
              class="form-control border-start-0"
              placeholder="Buscar por nombre"
              v-model="search3"
              aria-label="Buscar por nombre"
            />
          </div>
        </div>
        <div class="col-12">
          <div v-if="loading" class="text-center my-5">
            <div
              class="spinner-border text-primary"
              style="width: 3rem; height: 3rem"
              role="status"
            >
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <div v-else>
            <BsTable :items="filteredRows" :rowsPerPage=10>
              <template #head>
                <tr>
                  <th>Título Video</th>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Tienda</th>
                  <th>Quién lo ha visto</th>
                </tr>
              </template>

              <template #body="{ item, index }">
                <tr :key="index">
                  <td class="fw-semibold">{{ item.titulo }}</td>
                  <td>{{ item.visto }}</td>
                  <td>
                    <span
                      class="badge bg-primary bg-opacity-10 text-primary border border-primary"
                      >{{ item.categoria }}</span
                    >
                  </td>
                  <td>
                    <span
                      class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary"
                      >{{ item.tienda }}</span
                    >
                  </td>
                  <td>{{ item.nombre }}</td>
                </tr>
                <tr v-if="filteredRows.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle me-2"></i>No hay resultados
                  </td>
                </tr>
              </template>
            </BsTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { axiosInstance } from "@/components/axios/axios";
import { DateTime } from "luxon";
import BsTable from "@/components/365/BsTable.vue";

const vistosFormacion = ref<any[]>([]);
const search3 = ref("");
const loading = ref(false);

function getVideoVistosFormacion() {
  loading.value = true;
  axiosInstance
    .get("videos-formacion/getVideosFormacionVistos")
    .then((resVideos: any) => {
      loading.value = false;
      if (!resVideos.data.ok) throw Error(resVideos.data.message);
      vistosFormacion.value = resVideos.data.data.map((video: any) => ({
        titulo: video.titulo,
        visto: parseFecha2(video.visto).toFormat("dd/LL/yyyy HH:mm"),
        categoria: video.categoria,
        tienda: video.tienda,
        nombre: video.nombre,
      }));
    })
    .catch((err: unknown) => {
      loading.value = false;
      console.error("Error al obtener los registros:", err);
    });
}

function parseFecha2(fecha: any) {
  if (!fecha) {
    return DateTime.now();
  }
  if (typeof fecha === "string" && fecha.includes("/")) {
    const [day, month, year] = fecha.split("/");
    return DateTime.local(parseInt(year), parseInt(month), parseInt(day));
  } else if (fecha instanceof Date) {
    return DateTime.fromJSDate(fecha);
  } else {
    return DateTime.fromISO(fecha);
  }
}

const filteredRows = computed(() => {
  if (!search3.value) return vistosFormacion.value;
  const search = search3.value.toLowerCase();
  return vistosFormacion.value.filter((row: any) =>
    Object.values(row).some((val: any) => String(val).toLowerCase().includes(search)),
  );
});

onMounted(() => {
  getVideoVistosFormacion();
});
</script>

<style scoped>
.cardDocs {
  background-color: #f8f9fa;
  border-radius: 1.2rem;
}
.table-primary th {
  background-color: #e6f0fa !important;
  color: #2b3e5c;
  font-weight: 600;
  border-top: none;
}
.table-hover tbody tr:hover {
  background-color: #f3f6fb;
}
.input-group-text {
  border-radius: 1rem 0 0 1rem !important;
}
.form-control {
  border-radius: 0 1rem 1rem 0 !important;
}
.form-control:focus {
  border-color: #e66c5a !important;
  box-shadow: 0 0 0 0.2rem rgba(230, 108, 90, 0.15) !important;
}
.input-group-text {
  color: #e66c5a !important;
}
</style>
