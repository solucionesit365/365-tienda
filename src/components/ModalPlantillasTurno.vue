<template>
  <BsModal id="modalPlantillas" tabindex="-1" v-model="modalVisible" fullscreen>
    <div class="plantilla-container">
      <!-- Header con descripción y botón Volver -->
      <div class="header-section">
        <div class="header-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="header-content">
          <h3 class="header-title">Plantillas de Turno</h3>
          <p class="header-subtitle">Crea y gestiona las plantillas de horarios para tu tienda</p>
        </div>
        <button class="btn-back" @click="modalVisible = false" aria-label="Volver">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>
      </div>

      <!-- Contenedor principal para dos columnas -->
      <div class="main-content">
        <!-- Formulario de creación -->
        <div class="form-section">
          <div class="form-header">
            <h4>
              <i class="fas fa-plus-circle"></i>
              Nueva Plantilla
            </h4>
          </div>

          <form class="modern-form" @submit.prevent="createPlantilla">
            <div class="form-grid">
              <!-- Nombre -->
              <div class="form-group form-group-wide">
                <label class="form-label">
                  <i class="fas fa-tag"></i>
                  Nombre de la plantilla
                </label>
                <input
                  type="text"
                  class="form-input"
                  v-model="newPlantilla.nombre"
                  placeholder="Ej: Turno mañana, Turno tarde..."
                  :class="{ error: !newPlantilla.nombre.trim() && creating }"
                />
              </div>

              <!-- Hora de inicio -->
              <div class="form-group">
                <label class="form-label">
                  <i class="far fa-play-circle"></i>
                  Hora de inicio
                </label>
                <div class="time-selector">
                  <select class="time-input" v-model="hourInicio">
                    <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <span class="time-separator">:</span>
                  <select class="time-input" v-model="minuteInicio">
                    <option v-for="m in minutesOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
              </div>

              <!-- Hora de fin -->
              <div class="form-group">
                <label class="form-label">
                  <i class="far fa-stop-circle"></i>
                  Hora de fin
                </label>
                <div class="time-selector">
                  <select class="time-input" v-model="hourFinal">
                    <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <span class="time-separator">:</span>
                  <select class="time-input" v-model="minuteFinal">
                    <option v-for="m in minutesOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
              </div>

              <!-- Orden -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-sort-numeric-up"></i>
                  Orden
                </label>
                <input
                  type="number"
                  class="form-input text-center"
                  v-model.number="newPlantilla.order"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <!-- Botón crear -->
            <div class="form-actions">
              <button
                type="submit"
                class="btn-create"
                :disabled="creating"
                :class="{ loading: creating }"
              >
                <span v-if="creating" class="spinner"></span>
                <i v-else class="fas fa-plus"></i>
                {{ creating ? "Creando..." : "Crear Plantilla" }}
              </button>
            </div>
          </form>
        </div>

        <!-- Listado de plantillas -->
        <div class="list-section">
          <div class="list-header">
            <h4>
              <i class="fas fa-list"></i>
              Plantillas Existentes
            </h4>
            <span class="count-badge" v-if="!loading">
              {{ plantillas.length }} plantilla{{ plantillas.length !== 1 ? "s" : "" }}
            </span>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="loading-spinner">
              <LoaderComponent />
            </div>
            <p>Cargando plantillas...</p>
          </div>

          <div v-else-if="!plantillas.length" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h5>No hay plantillas creadas</h5>
            <p>Crea tu primera plantilla de turno usando el formulario de arriba</p>
          </div>

          <div v-else class="plantillas-grid">
            <div v-for="item in plantillas" :key="item.id" class="plantilla-card">
              <div class="card-content">
                <div class="card-header">
                  <h5 class="plantilla-name">{{ item.nombre }}</h5>
                  <span class="order-badge">{{ item.order }}</span>
                </div>

                <div class="time-info">
                  <div class="time-block">
                    <i class="far fa-play-circle"></i>
                    <span class="time">{{ item.inicio }}</span>
                  </div>
                  <div class="time-arrow">
                    <i class="fas fa-arrow-right"></i>
                  </div>
                  <div class="time-block">
                    <i class="far fa-stop-circle"></i>
                    <span class="time">{{ item.final }}</span>
                  </div>
                </div>

                <div class="duration-info">
                  <i class="far fa-clock"></i>
                  <span>{{ calculateDuration(item.inicio, item.final) }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="btn-delete"
                  @click="deletePlantilla(item.id)"
                  title="Eliminar plantilla"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- end main-content -->
    </div>
  </BsModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";

import BsModal from "@/components/365/BsModal.vue";
import LoaderComponent from "@/components/LoaderCuadrantes.vue";

const props = defineProps<{
  idTienda: number;
}>();
const emit = defineEmits<{
  (e: "plantillas-updated"): void;
}>();

// Estado general
const modalVisible = ref(false);
const plantillas = ref<
  { id: number; nombre: string; inicio: string; final: string; order: number }[]
>([]);
const loading = ref(false);
const creating = ref(false);

// Datos del formulario
const newPlantilla = ref({
  nombre: "",
  inicio: "00:00",
  final: "00:00",
  order: 0,
  idTienda: props.idTienda,
});

// Opciones de hora/minuto
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutesOptions = ["00", "15", "30", "45"];

const hourInicio = ref(newPlantilla.value.inicio.slice(0, 2));
const minuteInicio = ref(newPlantilla.value.inicio.slice(3, 5));
const hourFinal = ref(newPlantilla.value.final.slice(0, 2));
const minuteFinal = ref(newPlantilla.value.final.slice(3, 5));

// Sincronizar selects con el string "HH:mm"
watch([hourInicio, minuteInicio], () => {
  newPlantilla.value.inicio = `${hourInicio.value}:${minuteInicio.value}`;
});
watch([hourFinal, minuteFinal], () => {
  newPlantilla.value.final = `${hourFinal.value}:${minuteFinal.value}`;
});

// Función para calcular duración
function calculateDuration(inicio: string, final: string): string {
  const [startH, startM] = inicio.split(":").map((n) => parseInt(n));
  const [endH, endM] = final.split(":").map((n) => parseInt(n));

  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Suma un día si cruza medianoche
  }

  const duration = endMinutes - startMinutes;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

// Cargar listado
async function loadPlantillas() {
  loading.value = true;
  try {
    const res = await axiosInstance.get("plantilla-turno", {
      params: { idTienda: props.idTienda },
    });
    plantillas.value = res.data.sort((a: any, b: any) => a.order - b.order);
  } catch {
    Swal.fire({
      title: "Error",
      text: "No se pudieron cargar las plantillas",
      icon: "error",
      confirmButtonColor: "#e66c5a",
    });
  } finally {
    loading.value = false;
  }
}

// Crear nueva plantilla
async function createPlantilla() {
  if (!newPlantilla.value.nombre.trim()) {
    return Swal.fire({
      title: "Campo requerido",
      text: "El nombre de la plantilla es obligatorio",
      icon: "warning",
      confirmButtonColor: "#e66c5a",
    });
  }

  // 2. Validación horas iguales
  if (newPlantilla.value.inicio === newPlantilla.value.final) {
    return Swal.fire({
      title: "Horario inválido",
      text: "La hora de inicio y fin no pueden ser iguales",
      icon: "warning",
      confirmButtonColor: "#e66c5a",
    });
  }

  creating.value = true;
  try {
    console.log({
      nombre: newPlantilla.value.nombre,
      inicio: newPlantilla.value.inicio,
      final: newPlantilla.value.final,
      order: newPlantilla.value.order,
      idTienda: props.idTienda,
    });
    await axiosInstance.post("plantilla-turno/create", {
      nombre: newPlantilla.value.nombre,
      inicio: newPlantilla.value.inicio,
      final: newPlantilla.value.final,
      order: newPlantilla.value.order,
      idTienda: props.idTienda,
    });

    Swal.fire({
      title: "¡Perfecto!",
      text: "Plantilla creada exitosamente",
      icon: "success",
      confirmButtonColor: "#10b981",
      timer: 2000,
      timerProgressBar: true,
    });

    // Reset form
    newPlantilla.value.nombre = "";
    newPlantilla.value.order = 0;
    hourInicio.value = "00";
    minuteInicio.value = "00";
    hourFinal.value = "00";
    minuteFinal.value = "00";

    await loadPlantillas();
    emit("plantillas-updated");
  } catch (err) {
    console.log(err);
    Swal.fire({
      title: "Error",
      text: "No se pudo crear la plantilla",
      icon: "error",
      confirmButtonColor: "#e66c5a",
    });
  } finally {
    creating.value = false;
  }
}

// Eliminar plantilla
async function deletePlantilla(id: number) {
  const { isConfirmed } = await Swal.fire({
    title: "¿Eliminar plantilla?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
  });

  if (!isConfirmed) return;

  try {
    await axiosInstance.post("plantilla-turno/delete", {
      idPlantilla: id,
    });

    Swal.fire({
      title: "Eliminado",
      text: "Plantilla eliminada correctamente",
      icon: "success",
      confirmButtonColor: "#10b981",
      timer: 2000,
      timerProgressBar: true,
    });
    await loadPlantillas();
    emit("plantillas-updated");
  } catch {
    Swal.fire({
      title: "Error",
      text: "No se pudo eliminar la plantilla",
      icon: "error",
      confirmButtonColor: "#e66c5a",
    });
  }
}

// Exponer método para abrir el modal
function abrirModal() {
  loadPlantillas();
  modalVisible.value = true;
}
defineExpose({ abrirModal });
</script>

<style scoped>
/* Variables corporativas */
$primary-color: #e66c5a;
$secondary-color: #333;

.plantilla-container {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 600px;
}

/* Header Section */
.header-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #e66c5a 0%, #333 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 25px rgba(230, 108, 90, 0.3);
}

.header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-content {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

/* Main content wrapper */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.form-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.form-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-header i {
  color: #e66c5a;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.form-group-wide {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #6b7280;
  width: 16px;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #e66c5a;
  background: white;
  box-shadow: 0 0 0 3px rgba(230, 108, 90, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.time-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fafafa;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.time-selector:focus-within {
  border-color: #e66c5a;
  background: white;
  box-shadow: 0 0 0 3px rgba(230, 108, 90, 0.1);
}

.time-input {
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  padding: 0.25rem;
  width: 50px;
}

.time-input:focus {
  outline: none;
}

.time-separator {
  font-weight: bold;
  color: #6b7280;
  font-size: 1.1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-create {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-create:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-create:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-create.loading {
  position: relative;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* List Section */
.list-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.list-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.list-header i {
  color: #e66c5a;
}

.count-badge {
  background: rgba(230, 108, 90, 0.1);
  color: #e66c5a;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  color: #9ca3af;
}

.empty-state h5 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.plantillas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.plantilla-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.plantilla-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #e66c5a, #333);
}

.plantilla-card:hover {
  transform: translateY(-4px);
  border-color: #e66c5a;
  box-shadow: 0 12px 24px rgba(230, 108, 90, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.plantilla-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}

.order-badge {
  background: rgba(230, 108, 90, 0.15);
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 32px;
  text-align: center;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.time-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.time-block i {
  color: #6b7280;
}

.time {
  font-family: "Courier New", monospace;
  font-size: 1.1rem;
  color: #1f2937;
}

.time-arrow {
  color: #9ca3af;
  font-size: 0.875rem;
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.btn-delete:hover {
  background: #fecaca;
  transform: scale(1.1);
  opacity: 1;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 768px) {
  .plantilla-container {
    padding: 1rem;
  }

  .header-section {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .plantillas-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .time-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .time-arrow {
    transform: rotate(90deg);
  }
}

/* Vista horizontal (tablet en adelante) */
@media (min-width: 768px) {
  .main-content {
    flex-direction: row;
  }
  .form-section,
  .list-section {
    flex: 1;
  }
  .form-section {
    margin-right: 1rem;
  }
  .list-section {
    margin-left: 1rem;
  }
}

.btn-back {
  margin-left: auto;
  background: transparent;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.btn-back i {
  font-size: 1rem;
}
.btn-back:hover {
  opacity: 0.8;
}
</style>
