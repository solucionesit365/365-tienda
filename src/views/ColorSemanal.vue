<template>
  <div>
    <div class="color-container">
      <div v-if="colorIn" class="color-display">
        <p class="color-label">Color que ENTRA:</p>
        <div class="color-box" :style="{ backgroundColor: getColorHex(colorIn) }"></div>
        <p class="color-name">{{ translateColor(colorIn) }}</p>
      </div>
      <div v-if="colorOut" class="color-display">
        <p class="color-label">Color a ELIMINAR:</p>
        <div class="color-box" :style="{ backgroundColor: getColorHex(colorOut) }"></div>
        <p class="color-name">{{ translateColor(colorOut) }}</p>
      </div>

      <p>
        Última actualización:
        <span class="fw-bold">semana {{ updatedAt }}</span> <br />
      </p>

      <!-- Sección de selección de color para el responsable -->
      <div v-if="isResponsible" class="color-selection">
        <p class="color-label text-center">Selecciona el nuevo color que entrará esta semana</p>
        <div class="color-options">
          <div v-for="(color, index) in availableColors" :key="color" class="color-option-wrapper">
            <div
              class="color-option"
              :style="{ backgroundColor: getColorHex(color) }"
              @click="confirmColorChange(color)"
            ></div>
            <div v-if="index < availableColors.length - 1" class="color-connector"></div>
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

const getColors = async () => {
  try {
    const resColors = await axiosInstance.get("color-semanal/getColors");

    colorIn.value = resColors.data.colorIn;
    colorOut.value = resColors.data.colorOut;
    // Show week only
    updatedAt.value = DateTime.fromISO(resColors.data.updatedAt).toFormat("W");
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error al cargar los colores",
      text: "Por favor, intenta de nuevo",
    });
  }
};

// Función para confirmar el cambio de color
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

      // colorOut.value = color;

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

// Función para traducir el color al castellano
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

// Función para obtener el valor hexadecimal personalizado del color
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
      return "#FFFFFF"; // Color blanco por defecto si el valor es desconocido
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
}

.color-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-box {
  width: 150px;
  height: 150px;
  border: 0px;
  margin-bottom: 10px; /*Espacio entre el cuadrado y el texto*/
}

.color-name {
  font-size: 20px;
  font-weight: bold;
}

.color-label {
  font-size: 18px;
  margin-bottom: 5px;
}

.color-selection {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-options {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.color-option-wrapper {
  display: flex;
  align-items: center;
}

.color-option {
  width: 50px;
  height: 50px;
  cursor: pointer;
  border: 2px solid black;
  transition: transform 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-connector {
  width: 30px; /* Longitud de la línea que conecta los colores */
  height: 2px; /* Grosor de la línea */
  background-color: black; /* Color de la línea */
  position: relative;
  margin-left: 5px;
  margin-right: 5px;
}

.color-connector::after {
  content: "";
  position: absolute;
  top: 50%; /* Centra verticalmente la flecha */
  right: -5px; /* Ajusta la posición horizontal de la flecha */
  transform: translateY(-50%) rotate(45deg);
  width: 6px;
  height: 6px;
  border-right: 2px solid black;
  border-top: 2px solid black;
}
</style>
