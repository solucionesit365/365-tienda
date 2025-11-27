<template>
  <div class="main-container">
    <!-- Panel Izquierdo: Hora, Fecha y botón de lista de trabajadores -->
    <div class="left-panel">
      <div class="time-display">
        <h1 id="current-time">{{ currentTime }}</h1>
        <p id="current-date">{{ currentDate }}</p>
      </div>
      <div class="worker-list">
        <!-- El botón ahora abre el modal -->
        <button class="worker-list-button" @click="showWorkerModal = true">
          <svg class="icon me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-1 .08c.54.53 1.12 1.25 1.54 2.11H21v-2.5c0-2.33-4.67-3.5-7-3.5-.66 0-1.28.09-1.85.26.5.42.92.93 1.25 1.5.31.57.49 1.22.49 1.95v.01z"
              fill="currentColor"
            />
          </svg>
          Lista de trabajadores
          <svg class="arrow ms-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Contenedor principal para las pantallas del panel derecho -->
    <div class="right-panel">
      <div id="app-container" class="card shadow-lg p-5 border-0">
        <!-- Pantalla principal: Selección de método (NFC o PIN) -->
        <div v-if="currentScreen === 'main'">
          <div class="d-flex justify-content-around mt-5 w-100">
            <button class="option-button me-3" @click="changeScreen('nfc')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-wifi"
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.14a6.68 6.68 0 0 1 6.94 0"></path>
                <line x1="12" y1="20" x2="12" y2="20"></line>
              </svg>
              <span>NFC</span>
            </button>
            <button class="option-button" @click="changeScreen('pin')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-key"
              >
                <path
                  d="M19 10a11.14 11.14 0 0 1-5 11c-2.82 0-5.1-1.33-6.14-3a5.57 5.57 0 0 1-2.91-5.14c-1.33-2.82 0-5.1 3-6.14a11.14 11.14 0 0 1 11 5zm-5 0h.01"
                ></path>
                <path d="M16.5 16.5L18 18"></path>
                <path
                  d="M19 14.5A2.5 2.5 0 0 0 16.5 12A2.5 2.5 0 0 0 14 14.5A2.5 2.5 0 0 0 16.5 17A2.5 2.5 0 0 0 19 14.5z"
                ></path>
              </svg>
              <span>PIN</span>
            </button>
          </div>
        </div>

        <!-- Pantalla de ingreso de PIN -->
        <div v-else-if="currentScreen === 'pin'">
          <div class="d-flex flex-column h-100 justify-content-center w-100">
            <input type="password" v-model="pinInput" readonly class="pin-display" />
            <div class="mt-4 keypad">
              <button v-for="n in 9" :key="n" @click="addPin(n)">{{ n }}</button>
              <button @click="backspacePin()" class="backspace-button">Borrar</button>
              <button @click="addPin(0)">0</button>
              <button @click="validatePin()" class="green-button">✅</button>
            </div>
          </div>
        </div>

        <!-- Pantalla de NFC -->
        <div v-else-if="currentScreen === 'nfc'">
          <div class="d-flex flex-column justify-content-center h-100 w-100">
            <p class="nfc-title">Listo para escanear</p>
            <p class="nfc-subtitle">Sostén tu tarjeta cerca del dispositivo</p>
            <button class="cancel-button mt-3" @click="changeScreen('main')">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de lista de trabajadores -->
    <div v-if="showWorkerModal" class="modal-backdrop fade show"></div>
    <div
      v-if="showWorkerModal"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-labelledby="workerModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header border-0">
            <h5 class="modal-title fs-5" id="workerModalLabel">Trabajadores Fichados</h5>
            <button
              type="button"
              class="btn-close"
              @click="showWorkerModal = false"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body p-4">
            <div class="workers-list-container d-flex flex-column gap-3">
              <div
                v-for="worker in fichados"
                :key="worker.id"
                class="worker-item rounded-3 p-3 d-flex align-items-center justify-content-between"
              >
                <span class="fw-bold">{{ worker.name }}</span>
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-warning rounded-pill btn-sm"
                    @click="handleBreak(worker.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-6h2v6zm4 0h-2v-6h2v6z"
                      />
                    </svg>
                  </button>
                  <button
                    class="btn btn-danger rounded-pill btn-sm"
                    @click="handleSignOut(worker.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-6h2v6zm4 0h-2v-6h2v6z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// Variables reactivas para el estado de la aplicación
const currentScreen = ref("main");
const pinInput = ref("");
const currentTime = ref("");
const currentDate = ref("");
const showWorkerModal = ref(false);
const fichados = ref<any[]>([]);

// Datos de ejemplo para los trabajadores
const workers = ref([
  { id: 1, name: "Juan Pérez" },
  { id: 2, name: "María López" },
  { id: 3, name: "Carlos Gómez" },
  { id: 4, name: "Ana Ruiz" },
  { id: 5, name: "Pedro García" },
  { id: 6, name: "Laura Torres" },
  { id: 7, name: "Sofia Fernández" },
  { id: 8, name: "Diego Ramírez" },
]);

// Se pre-populan los trabajadores fichados con datos de ejemplo
fichados.value = [workers.value[0], workers.value[1], workers.value[2]];

// Función para cambiar de pantalla y resetear el PIN
const changeScreen = (screenName: any) => {
  currentScreen.value = screenName;
  pinInput.value = "";
};

// Función para añadir un número al PIN
const addPin = (number: any) => {
  if (pinInput.value.length < 4) {
    pinInput.value += number;
  }
};

// Función para borrar el último número del PIN
const backspacePin = () => {
  pinInput.value = pinInput.value.slice(0, -1);
};

// Función para validar el PIN (lógica de ejemplo)
const validatePin = () => {
  if (pinInput.value.length === 4) {
    console.log("PIN ingresado:", pinInput.value);
    // Lógica de validación de PIN - AHORA SIMULADA
    // Si el PIN es válido, simulamos un fichaje
    const workerToFichar = workers.value.find((w) => w.id === 1); // Fichamos a Juan Pérez de ejemplo
    if (workerToFichar && !fichados.value.some((w) => w.id === workerToFichar.id)) {
      fichados.value.push(workerToFichar);
    }
    pinInput.value = "";
    changeScreen("main"); // Volvemos a la pantalla principal
  } else {
    // Manejar el caso de PIN incompleto
  }
};

// Función para el botón de 'Descanso' del modal
const handleBreak = (workerId: any) => {
  console.log(`Trabajador con ID ${workerId} toma un descanso.`);
};

// Función para el botón de 'Desfichar' del modal
const handleSignOut = (workerId: any) => {
  fichados.value = fichados.value.filter((w) => w.id !== workerId);
  console.log(`Trabajador con ID ${workerId} se desficha.`);
};

// Función para actualizar la hora y la fecha
const updateDateTime = () => {
  const now = new Date();
  const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  currentTime.value = now.toLocaleTimeString("es-ES", timeOptions);
  const dateString = now.toLocaleDateString("es-ES", dateOptions);
  currentDate.value = dateString.charAt(0).toUpperCase() + dateString.slice(1);
};

// Se ejecuta al montar el componente
onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 60000); // Actualiza cada minuto
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");

body,
html {
  height: 100%;
  margin: 0;
  font-family: "Inter", sans-serif;
  background-color: #f0f0f5;
}

.main-container {
  display: flex;
  height: 100vh;
  background-color: #f0f0f5;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4rem;
  text-align: left;
  gap: 2rem;
}

.time-display h1 {
  font-size: 8rem;
  font-weight: 700;
  margin: 0;
}

.time-display p {
  font-size: 1.5rem;
  font-weight: 400;
  color: #888;
  margin-top: 0.5rem;
}

.worker-list-button {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background-color: #e6e6ea;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  transition: background-color 0.3s ease;
}

.worker-list-button:hover {
  background-color: #dcdce0;
}

.icon,
.arrow {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.right-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.card {
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 3rem;
  width: 100%;
  /* max-width: 500px; */
  min-height: 400px;
  text-align: center;
}

.option-button {
  padding: 5rem 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 2rem;
  font-weight: bold;
  flex-grow: 1;
  background-color: #f9f9fc;
  transition: background-color 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.option-button:hover {
  background-color: #e9ecef;
}

.pin-display {
  width: 100%;
  padding: 1rem;
  font-size: 2rem;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  background-color: #f9f9fc;
  color: #333;
  outline: none;
  font-family: monospace;
  box-sizing: border-box;
  margin-bottom: 2rem;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 102%;
}

.keypad button {
  padding: 2.5rem;
  background-color: #e6e6ea;
  border: none;
  border-radius: 12px;
  font-size: 2rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.keypad button:hover {
  background-color: #dcdce0;
  transform: scale(1.05);
}

.backspace-button {
  font-size: 1rem;
}

.green-button {
  background-color: #4caf50;
  color: #fff;
}

.green-button:hover {
  background-color: #45a049;
}

.nfc-dialog {
  padding: 2rem;
}

.nfc-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.nfc-subtitle {
  font-size: 1rem;
  color: #888;
  margin-bottom: 2rem;
}

.cancel-button {
  padding: 0.8rem 2rem;
  background-color: #f0f0f5;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #dcdce0;
}

.modal-backdrop.show {
  opacity: 0.5;
}

/* Estilos de la lista de trabajadores */
.worker-item {
  background-color: #f0f0f5;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
