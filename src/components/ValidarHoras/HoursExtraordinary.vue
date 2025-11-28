<template>
  <div class="p-4 bg-gray-100 min-h-screen flex items-start justify-center">
    <BsCard class="shadow-lg rounded-xl w-full max-w-md">
      <BsCardBody class="p-4">
        <p class="text-muted mb-4 text-sm">
          Define las asignaciones máximas para cada tipo de tiempo dedicado del trabajador
          seleccionado.
        </p>

        <div class="mb-4">
          <label class="form-label">Trabajador:</label>
          <BsSelect
            v-model:options="arrayTeam"
            v-model:selected="selectedUser"
            filter
            :label-key="'text'"
            :preselect="false"
          />
        </div>

        <form v-if="selectedUser" @submit.prevent="saveConfiguration">
          <div class="mb-4">
            <label for="extraHoursDate" class="form-label fw-bold d-flex align-items-center">
              <i class="bi bi-calendar-check me-2"></i> Fecha de las horas
            </label>
            <input
              type="date"
              id="extraHoursDate"
              class="form-control"
              v-model="selectedDate"
              :max="maxSelectableDate"
              required
            />
          </div>

          <!-- Trade Union Hours -->
          <div class="mb-4">
            <label for="tradeUnionHours" class="form-label fw-bold d-flex align-items-center">
              <i class="bi bi-people-fill me-2"></i> Horas Sindicales
            </label>
            <div class="input-group">
              <button
                type="button"
                @click="tradeUnionHours = tradeUnionHours - 0.25"
                class="input-group-text bg-warning text-light"
              >
                <i class="fas fa-minus"></i>
              </button>
              <input
                type="number"
                class="form-control"
                id="tradeUnionHours"
                v-model.number="tradeUnionHours"
                min="0"
                disabled
              />
              <button
                type="button"
                @click="tradeUnionHours = tradeUnionHours + 0.25"
                class="input-group-text bg-success text-light"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <!-- Coordination Hours -->
          <div class="mb-4">
            <label for="coordinationHours" class="form-label fw-bold d-flex align-items-center">
              <i class="bi bi-diagram-3-fill me-2"></i> Horas de Coordinación
            </label>
            <div class="input-group">
              <button
                type="button"
                @click="coordinationHours = coordinationHours - 0.25"
                class="input-group-text bg-warning text-light"
              >
                <i class="fas fa-minus"></i>
              </button>
              <input
                type="number"
                class="form-control"
                id="coordinationHours"
                v-model.number="coordinationHours"
                min="0"
                disabled
              />
              <button
                type="button"
                @click="coordinationHours = coordinationHours + 0.25"
                class="input-group-text bg-success text-light"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <!-- Training Hours -->
          <div class="mb-5">
            <label for="trainingHours" class="form-label fw-bold d-flex align-items-center">
              <i class="bi bi-book-half me-2"></i> Horas de Formación
            </label>
            <div class="input-group">
              <button
                type="button"
                @click="trainingHours = trainingHours - 0.25"
                class="input-group-text bg-warning text-light"
              >
                <i class="fas fa-minus"></i>
              </button>
              <input
                type="number"
                class="form-control"
                id="trainingHours"
                v-model.number="trainingHours"
                min="0"
                disabled
              />
              <button
                type="button"
                @click="trainingHours = trainingHours + 0.25"
                class="input-group-text bg-success text-light"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <!-- Save Button -->
          <div class="d-grid">
            <button type="submit" class="btn btn-success btn-lg rounded-pill shadow">
              Guardar horas
            </button>
          </div>
        </form>

        <!-- Confirmation message (using v-if to show/hide) -->
        <div
          v-if="confirmationMessage"
          class="mt-4 p-3 bg-success text-white rounded-lg text-center"
        >
          {{ confirmationMessage }}
        </div>
      </BsCardBody>
    </BsCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getEquipoDe } from "@/components/equipoGeneral";
import BsSelect from "../365/BsSelect.vue";
import BsCard from "../365/BsCard.vue";
import BsCardBody from "../365/BsCardBody.vue";
import { useUserStore } from "@/stores/user";
import { axiosInstance } from "@/components/axios/axios";
import { DateTime } from "luxon";
import Swal from "sweetalert2";

const userStore = useUserStore();
const tradeUnionHours = ref(0);
const coordinationHours = ref(0);
const trainingHours = ref(0);
const confirmationMessage = ref("");
const arrayTeam = ref<Array<{ text: string; value: any }>>([]);
const selectedUser = ref<any>("");
const todayIso =
  DateTime.now().toISODate() ?? DateTime.now().setLocale("es").toFormat("yyyy-LL-dd");
const selectedDate = ref<string>(todayIso);
const maxSelectableDate = todayIso;

function calcularAntiguedad(fechaInicio: any) {
  const inicio = DateTime.fromISO(fechaInicio);
  const hoy = DateTime.now();
  return hoy.diff(inicio, "days").days;
}

async function getTeam() {
  try {
    const uidSave = localStorage.getItem("uidCoordinadora");
    const uidConsulting = uidSave || userStore.getUid!;
    const team = await getEquipoDe(uidConsulting);
    if (team && team.length > 0) {
      const users = team.map((user: any) => ({
        text: user.nombreApellidos,
        value: user,
      }));
      // Sort
      users.sort((a: any, b: any) => a.text.localeCompare(b.text));
      arrayTeam.value = users;
    }
  } catch (error) {
    console.log(error);
  }
}

const saveConfiguration = async () => {
  try {
    const userData = selectedUser.value.value;

    if (!userData) {
      console.error("No valid user data found");
      return;
    }

    if (!selectedDate.value) {
      Swal.fire("Fecha requerida", "Selecciona la fecha de las horas a registrar", "warning");
      return;
    }

    const selectedDateTime = DateTime.fromISO(selectedDate.value);

    if (!selectedDateTime.isValid) {
      Swal.fire("Fecha inválida", "Selecciona una fecha válida", "warning");
      return;
    }

    console.log("Extracted user data:", userData);

    const senorityDays =
      userData.contratos && userData.contratos[0]
        ? calcularAntiguedad(userData.contratos[0].fechaAntiguedad)
        : 0;

    const selectedDayStart = selectedDateTime.startOf("day");
    const selectedDayEnd = selectedDateTime.endOf("day");

    const payload = {
      fichajeEntrada: selectedDayStart.toJSDate(),
      fichajeSalida: selectedDayEnd.toJSDate(),
      idFichajes: {
        entrada: "",
        salida: "",
      },
      comentario: {
        entrada: "",
        salida: "",
      },
      horasPagar: {
        total: 0,
        estadoValidado: "PENDIENTE",
        comentario: "",
        respSuper: "",
        marcaTemporal: DateTime.now().toJSDate(),
      },
      cuadrante: {
        inicio: selectedDayStart.toJSDate(),
        final: selectedDayEnd.toJSDate(),
        idTrabajador: Number(userData.id),
        idTienda: Number(userData.idTienda),
        nombre: userData.nombreApellidos || "",
        totalHoras: 0,
      },
      dni: userData.dni || "",
      nombre: userData.nombreApellidos || "",
      idTrabajador: Number(userData.id),
      salidaAutomatica: false,
      validado: false,
      idResponsable: Number(userData.idResponsable),
      horasFichaje: 0,
      horasCuadrante: 0,
      horasExtra: 0,
      horasAprendiz: 0,
      horasCoordinacion: coordinationHours.value,
      tradeUnionHours: tradeUnionHours.value,
      trainingHours: trainingHours.value,
      aprendiz: false,
      aPagar: false,
      pagado: false,
      idTienda: Number(userData.idTienda),
      enviado: false,
      horasfichajeMostrar: 0,
      creacion: DateTime.now().setLocale("es").toFormat("dd/MM/yyyy - HH:mm:ss"),
      antiguedadDias: senorityDays,
      nPerceptor: userData.nPerceptor,
    };

    console.log("Data to save:", payload);

    const resPost = await axiosInstance.post("/fichajes-validados/addFichajeValidado", payload);

    if (resPost.data) {
      confirmationMessage.value = `✅ Configuración guardada para ${selectedDateTime.toFormat("dd/LL/yyyy")}: Sindicales ${tradeUnionHours.value}h, Coordinación ${coordinationHours.value}h, Formación ${trainingHours.value}h.`;

      Swal.fire({
        icon: "success",
        title: "Guardado",
        text: "Las horas han sido registradas correctamente",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset values if needed
      tradeUnionHours.value = 0;
      coordinationHours.value = 0;
      trainingHours.value = 0;
    }

    // Hide message after 5 seconds
    setTimeout(() => {
      confirmationMessage.value = "";
    }, 5000);
  } catch (error) {
    console.error("Error saving:", error);
    Swal.fire("Error", "Could not save hours.", "error");
  }
};

onMounted(() => {
  getTeam();
});
</script>

<style scoped>
.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #0d6efd;
}
</style>
