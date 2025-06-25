<template>
  <div>
    <div class="color-container">
      <div v-if="isLoading" class="loading-spinner">
        <i class="fas fa-spinner fa-spin text-primary fa-2x"></i>
      </div>
      <div v-else>
        <div class="color-row mb-4">
          <div v-if="colorIn" class="color-display me-4">
            <p class="color-label">Color que ENTRA:</p>
            <div class="color-box" :style="{ backgroundColor: getColorHex(colorIn) }"></div>
            <p class="color-name">{{ translateColor(colorIn) }}</p>
          </div>
          <div v-if="colorOut" class="color-display">
            <p class="color-label">Color a ELIMINAR:</p>
            <div class="color-box" :style="{ backgroundColor: getColorHex(colorOut) }"></div>
            <p class="color-name">{{ translateColor(colorOut) }}</p>
          </div>
        </div>

        <p class="mt-3 text-center">
          Última actualización:
          <span class="fw-bold">semana {{ updatedAt }}</span>
        </p>

        <div v-if="isResponsible" class="color-selection">
          <p class="color-label text-center mb-3">Selecciona el nuevo color que entrará esta semana</p>
          <div class="color-options-row">
            <div
              v-for="(color, index) in availableColors"
              :key="color"
              class="color-option-wrapper"
            >
              <div
                class="color-option"
                :style="{ backgroundColor: getColorHex(color) }"
                @click="confirmColorChange(color)"
                :title="translateColor(color)"
              ></div>
              <div v-if="index < availableColors.length - 1" class="color-connector"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { axiosInstance } from "@/components/axios/axios";
import { hasPermission } from "@/components/rolesPermisos";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import { onMounted, ref } from "vue";

const colorIn = ref("");
const colorOut = ref("");
const updatedAt = ref("");
const isResponsible = ref(false);
const availableColors = ["green", "orange", "blue", "brown"];
const isLoading = ref(true);

const getColors = async () => {
  try {
    isLoading.value = true;
    const resColors = await axiosInstance.get("color-semanal/getColors");

    colorIn.value = resColors.data.colorIn;
    colorOut.value = resColors.data.colorOut;
    updatedAt.value = DateTime.fromISO(resColors.data.updatedAt).toFormat("W");
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error al cargar los colores",
      text: "Por favor, intenta de nuevo",
    });
  } finally {
    isLoading.value = false;
  }
};

const confirmColorChange = async (color: any) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `¿Va a entrar el color ${translateColor(color)}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, cambiar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      await axiosInstance.post("color-semanal/saveColorIn", {
        color,
      });

      getColors();

      Swal.fire(
        "¡Cambiado!",
        `El color semanal que entra ahora es el ${translateColor(color)}.`,
        "success",
      );
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error al cambiar el color",
        text: "Por favor, intenta de nuevo",
      });
    }
  }
};

const translateColor = (color: any) => {
  switch (color) {
    case "green":
      return "Verde";
    case "orange":
      return "Naranja";
    case "blue":
      return "Azul";
    case "brown":
      return "Marrón";
    default:
      return color;
  }
};

const getColorHex = (color: any) => {
  switch (color) {
    case "green":
      return "#4CAF50";
    case "orange":
      return "#FF9800";
    case "blue":
      return "#2196F3";
    case "brown":
      return "#8D6E63";
    default:
      return "#FFFFFF";
  }
};

onMounted(() => {
  isResponsible.value = hasPermission("GestionarColorSemanal");
  getColors();
});
</script>

<style scoped>
.color-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  max-width: 700px;
  margin: 0 auto;
  min-height: 80vh;
}

.color-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 40px;
  width: 100%;
}

.color-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px;
}

.color-box {
  width: 110px;
  height: 110px;
  border-radius: 1.2em;
  border: 2px solid #e0e0e0;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.color-name {
  font-size: 20px;
  font-weight: bold;
  margin-top: 0.5em;
}

.color-label {
  font-size: 18px;
  margin-bottom: 5px;
  font-weight: 500;
}

.color-selection {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-options-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-option-wrapper {
  display: flex;
  align-items: center;
}

.color-option {
  width: 50px;
  height: 50px;
  cursor: pointer;
  border: 3px solid #333;
  border-radius: 0.7em;
  transition: transform 0.2s, border-color 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.color-option:hover {
  transform: scale(1.13);
  border-color: #e66c5a;
}

.color-connector {
  width: 30px;
  height: 2px;
  background-color: #333;
  position: relative;
  margin-left: 5px;
  margin-right: 5px;
}

.color-connector::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%) rotate(45deg);
  width: 6px;
  height: 6px;
  border-right: 2px solid #333;
  border-top: 2px solid #333;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

@media (max-width: 700px) {
  .color-row {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .color-display {
    min-width: 0;
  }
  .color-box {
    width: 90px;
    height: 90px;
  }
  .color-options-row {
    gap: 10px;
  }
}
</style>
