<template>
  <div class="card mt-2">
    <div class="card-body cardDocs">
      <h5 class="mt-4 fw-bold textColor">Vacaciones de:</h5>
      <BsSelect
        v-model:selected="trabajadorSelect"
        v-model:options="trabajadores"
        :filter="true"
        :preselect="false"
        :select-all="false"
        :search-placeholder="'Buscar trabajador...'"
        :placeholder="'Selecciona un trabajador...'"
        text-key="nombreApellidos"
        value-key="id"
        class="mb-3"
      />

      <!-- Saldo vacaciones -->
      <div v-if="trabajadorSelect">
        <div v-if="!loading" class="row justify-content-center">
          <div class="col-xl-8 col-sm-12 col-12">
            <div class="card shadow-sm mt-3 border-0">
              <div class="card-body">
                <div class="fs-6 text-dark">
                  <div class="row g-3 align-items-center">
                    <div class="col-10">
                      <i class="fas fa-calendar-day text-success me-2"></i> Días aprobados
                    </div>
                    <div class="col-2 fw-bold text-end">
                      {{ diasAprobados }}
                    </div>

                    <div class="col-10">
                      <i class="fas fa-calendar-minus text-warning me-2"></i> Ptes de aprobación
                    </div>
                    <div class="col-2 fw-bold text-end">
                      {{ ptesAprobacion }}
                    </div>

                    <div class="col-10">
                      <i class="fas fa-calendar-check text-secondary me-2"></i> Días disponibles
                      {{ currentYear2 }}
                    </div>
                    <div class="col-2 fw-bold text-end">
                      {{ diasDisponibles }}
                    </div>

                    <div class="col-10">
                      <i class="fas fa-calendar-check text-secondary me-2"></i> Días disponibles
                      {{ parseInt(currentYear2) - 1 }}
                    </div>
                    <div class="col-2 fw-bold text-end">
                      {{ diasDisponiblesAñoAnterior }}
                    </div>

                    <div class="col-10 text-muted pt-3 border-top">Año {{ currentYear2 }}</div>
                    <div class="col-2 fw-bold pt-3 border-top text-end">
                      {{ vacacionesDisp }}
                    </div>

                    <div class="col-10 text-muted">Total días disponibles</div>
                    <div class="col-2 fw-bold text-end">
                      {{ diasDisponibles + diasDisponiblesAñoAnterior }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="row justify-content-center mt-3">
          <BsSpinner style="width: 5rem; height: 5rem" />
        </div>
      </div>

      <!-- Selección de fechas -->
      <div v-if="!stop">
        <h5 class="mt-4 fw-bold textColor">Selecciona las fechas</h5>

        <div class="d-flex gap-2 mb-3">
          <button
            class="btn"
            :class="VacacionesAÑo ? 'btn-outline-primary active' : 'btn-outline-secondary'"
            @click="chucha(currentYear2)"
          >
            {{ currentYear2 }}
          </button>
          <button
            class="btn"
            :class="!VacacionesAÑo ? 'btn-outline-primary active' : 'btn-outline-secondary'"
            @click="chucha(parseInt(currentYear2) - 1)"
          >
            {{ currentYear2 - 1 }}
          </button>
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <BsDatepicker
              v-model="fechaInicio"
              input-toggle
              label="Inicio"
              class="w-100"
              placeholder="Inicio"
              :months-full="mesesFull"
              :months-short="mesesShort"
              :weekdays-full="diasFull"
              :weekdays-short="diasShort"
              :weekdays-narrow="inicialesDias"
              :clear-btn-text="'Reset'"
              :cancel-btn-text="'Cancelar'"
              :start-day="1"
            />
          </div>

          <div class="col-md-6">
            <BsDatepicker
              v-model="fechaFinal"
              input-toggle
              label="Fin"
              class="w-100"
              placeholder="Fin"
              :months-full="mesesFull"
              :months-short="mesesShort"
              :weekdays-full="diasFull"
              :weekdays-short="diasShort"
              :weekdays-narrow="inicialesDias"
              :clear-btn-text="'Reset'"
              :cancel-btn-text="'Cancelar'"
              :start-day="1"
            />
          </div>
        </div>

        <!-- Observaciones -->
        <div class="mt-4">
          <textarea
            v-model="observaciones"
            class="form-control"
            rows="3"
            placeholder="Si lo necesitas, escribe un comentario..."
          />
        </div>

        <div class="col-xl-12 col-sm-12 col-12 text-center mt-4 mb-4">
          <BsButton color="success" @click="mostrarModal()"> Comprobar </BsButton>
        </div>
        <!-- Abrir modal con datos de las vacaciones -->
      </div>
      <BsModal
        id="exampleModalCenter"
        tabindex="-1"
        labelledby="exampleModalCenterTitle"
        v-model="modalVacaciones"
        centered
      >
        <BsModalHeader @close="modalVacaciones = false">
          <BsModalTitle id="exampleModalCenterTitle">
            Vacaciones de: {{ nombreTrabajadorSelect }}
          </BsModalTitle>
        </BsModalHeader>
        <BsModalBody>
          <div>
            <span> Fecha inicio: {{ fechaInicio }}</span>
          </div>
          <div>
            <span> Fecha final: {{ fechaFinal }}</span>
          </div>
          <div>
            <span>Fecha incorporación: {{ fechaIncorporacion }} </span>
          </div>
          <div>
            <span>Observacion: {{ observaciones }}</span>
          </div>
          <div>
            <span>Total de dias: {{ totalDias }}</span>
          </div>
        </BsModalBody>
        <BsModalFooter>
          <!-- Enviar solicitut -->
          <div class="col-xl-12 col-sm-12 col-12 text-center mt-4 mb-4">
            <BsButton color="success" :class="{ disabled: guardando }" @click="finalizarPeticion()">
              <span
                v-if="guardando"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span
              >Enviar solicitud</BsButton
            >
          </div>
        </BsModalFooter>
      </BsModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from "vue";
import Swal from "sweetalert2";
import BsButton from "@/components/365/BsButton.vue";

import { calcularSaldoEmpleado, getEquipoDe } from "@/components/equipoGeneral";
import { mesesFull, mesesShort, diasFull, diasShort, inicialesDias } from "@/components/constantes";
import { axiosInstance } from "@/components/axios/axios";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { DateTime } from "luxon";
import BsModal from "@/components/365/BsModal.vue";
import BsModalBody from "@/components/365/BsModalBody.vue";
import BsModalFooter from "@/components/365/BsModalFooter.vue";
import BsDatepicker from "@/components/365/BsDatepicker.vue";
import BsSelect from "@/components/365/BsSelect.vue";
import BsModalHeader from "@/components//365/BsModalHeader.vue";
import BsModalTitle from "@/components//365/BsModalTitle.vue";
import BsSpinner from "@/components//365/BsSpinner.vue";

const userStore = useUserStore();
const fechaInicio: Ref<any> = ref(null);
const fechaFinal: Ref<any> = ref(null);
const fechaIncorporacion: Ref<any> = ref(null);
const modalVacaciones = ref(false);
const totalDias = ref(0);
const observaciones = ref("");
const trabajadorSelect = ref<{ id: number; [key: string]: any } | string>("");
const tiendaTrabajadorSelect = ref("");
const trabajadores: Ref<any[]> = ref([]);
const loading = ref(false);
const router = useRouter();
const diasDisponibles = ref(0);
const stop = ref(false);
const guardando = ref(false);
const emailTrabajadorSelect = ref("");
const nombreTrabajadorSelect = ref("");
const nombreResponsableTrabajadorSelect = ref("");
const currentYear2: Ref<any> = ref();
const vacacionesDisp = ref(0);
const diasAprobados = ref(0);
const ptesAprobacion = ref(0);
const currentUser = userStore.user;
currentYear2.value = DateTime.now().toFormat("yyyy");
observaciones.value = `Vacaciones ${currentYear2.value}`;
const VacacionesAÑo = ref(true);
const year = ref(currentYear2.value);
const diasDisponiblesAñoAnterior = ref(0);
const now = DateTime.now();
const hoy = now.startOf("day");

const ultimoMesFebrero = DateTime.local(currentYear2.value, 2)
  .endOf("month")
  .toFormat("dd/MM/yyyy");
const fechaLimite = DateTime.fromFormat(ultimoMesFebrero, "dd/MM/yyyy").startOf("day");

function mostrarModal() {
  const inicioMoment = fechaInicio.value.startOf("day");
  const finalMoment = fechaFinal.value.startOf("day");

  fechaInicio.value = inicioMoment.toFormat("dd/MM/yyyy");
  fechaFinal.value = finalMoment.toFormat("dd/MM/yyyy");
  fechaIncorporacion.value = finalMoment.plus({ days: 1 }).toFormat("dd/MM/yyyy");

  totalDias.value = Math.abs(finalMoment.diff(inicioMoment, "days").days) + 1;

  if (totalDias.value > 30) {
    Swal.fire({
      icon: "error",
      text: "El total de días no puede ser superior a 30 días",
      showConfirmButton: true,
      timer: 4000,
      timerProgressBar: true,
    });
    return;
  }

  if (totalDias.value > diasDisponibles.value) {
    Swal.fire({
      icon: "error",
      text: "No puedes solicitar más días de los disponibles",
      showConfirmButton: true,
      timer: 4000,
      timerProgressBar: true,
    });
    return;
  }

  modalVacaciones.value = true;
}

async function finalizarPeticion() {
  guardando.value = true;

  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || currentUser.uid;
  const uidGuardado2 = localStorage.getItem("uidCoordinadora2");
  const uidParaConsultar2 = uidGuardado2;
  const idsqlGuardado = localStorage.getItem("idSqlCoordinadora");
  const idSqlParaConsultar = Number(idsqlGuardado || currentUser.idSql);

  try {
    const inicio = DateTime.fromFormat(fechaInicio.value, "dd/MM/yyyy").startOf("day");
    const final = DateTime.fromFormat(fechaFinal.value, "dd/MM/yyyy").startOf("day");

    /* VALIDACIONES */
    if (!inicio.isValid || !final.isValid) throw Error("Las fechas no son correctas");

    const diasSolicitados = final.diff(inicio, "days").days + 1;

    if (diasDisponiblesAñoAnterior.value > 0) {
      if (diasSolicitados > diasDisponiblesAñoAnterior.value)
        throw Error("No puedes solicitar más días de los disponibles del año anterior");
    } else {
      if (diasSolicitados > diasDisponibles.value)
        throw Error("No puedes solicitar más días de los disponibles");
    }

    if (final < inicio) throw Error("La fecha final debe ser igual o posterior a la inicial");

    if (!trabajadorSelect.value || trabajadorSelect.value === "")
      throw Error("Debes seleccionar el nombre de una persona");

    if (diasSolicitados > 30) throw Error("No puedes pedir más de 30 días");

    const fechaIncorporacion = final.plus({ days: 1 }).toFormat("dd/MM/yyyy");
    const fechaCreacion = DateTime.now().toFormat("dd/MM/yyyy");

    const resVacaciones = await axiosInstance.post("solicitud-vacaciones/nuevaSolicitud", {
      idBeneficiario: trabajadorSelect.value,
      nombreApellidos: nombreTrabajadorSelect.value,
      fechaInicio: inicio.toFormat("dd/MM/yyyy"),
      fechaFinal: final.toFormat("dd/MM/yyyy"),
      fechaIncorporacion,
      fechaCreacion,
      totalDias: diasSolicitados,
      tienda: tiendaTrabajadorSelect.value,
      observaciones: observaciones.value,
      estado: "PENDIENTE",
      creador: idSqlParaConsultar,
      creadasPor: nombreResponsableTrabajadorSelect.value,
      creadorReal: nombreResponsableTrabajadorSelect.value,
      enviado: false,
      year: parseInt(year.value),
      idAppResponsable: uidParaConsultar,
      idAppResponsableB: uidParaConsultar2,
    });

    if (resVacaciones.data.ok) {
      Swal.fire({
        icon: "success",
        title: "Perfecto",
        text: "Tu solicitud ha sido enviada y está pendiente de aprobación, hemos enviado una copia a tu correo.",
        showConfirmButton: true,
        timer: 4000,
        timerProgressBar: true,
      });
      router.push("/vacaciones");
    } else {
      throw Error("No se ha podido guardar la solicitud de vacaciones");
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  } finally {
    guardando.value = false;
  }
}

async function getInfoTrabajadorSelected() {
  try {
    loading.value = true;
    chucha(currentYear2.value);
    const idTrabajador =
      typeof trabajadorSelect.value === "object" && trabajadorSelect.value !== null
        ? trabajadorSelect.value.id
        : trabajadorSelect.value;

    VacacionesAÑo.value = true;
    if (trabajadorSelect.value) {
      const infoTrabajadorSelect = await axiosInstance.get("trabajadores/getTrabajadorBySqlId", {
        params: { id: idTrabajador },
      });

      if (!infoTrabajadorSelect.data)
        throw Error("No se ha podido obtener la información de este empleado");

      // solicitudes year actual
      const arraySolicitudes = await axiosInstance.get(
        "solicitud-vacaciones/solicitudesTrabajador",
        {
          params: {
            idBeneficiario: idTrabajador,
            year: currentYear2.value,
          },
        },
      );

      // info year actual
      const resVacaciones = calcularSaldoEmpleado(
        infoTrabajadorSelect.data,
        arraySolicitudes.data.data,
        "calculoAñoActual",
      );

      // solicitudes year anterior

      if (fechaLimite > hoy) {
        const arraySolicitudesAñoAnterior = await axiosInstance.get(
          "solicitud-vacaciones/solicitudesTrabajador",
          {
            params: {
              idBeneficiario: idTrabajador,
              year: currentYear2.value - 1,
            },
          },
        );

        // info year year anterior
        if (arraySolicitudesAñoAnterior.data.ok) {
          const resVacacionesAñoAnterior = calcularSaldoEmpleado(
            infoTrabajadorSelect.data,
            arraySolicitudesAñoAnterior.data.data,
            "calculoAñoAnterior",
          );

          diasDisponiblesAñoAnterior.value = resVacacionesAñoAnterior.diasDisponibles;

          //si hay disponibles del year anterior
        }
      }

      if (!arraySolicitudes.data.ok)
        throw Error("No se ha podido obtener la lista de solicitudes de este empleado");
      emailTrabajadorSelect.value = infoTrabajadorSelect.data.emails;
      nombreTrabajadorSelect.value = infoTrabajadorSelect.data.nombreApellidos;
      tiendaTrabajadorSelect.value = infoTrabajadorSelect.data.tienda?.nombre ?? null;
      nombreResponsableTrabajadorSelect.value =
        infoTrabajadorSelect.data.responsable?.nombreApellidos ?? null;

      diasAprobados.value = resVacaciones.aprobados;
      ptesAprobacion.value = resVacaciones.totalPendienteValidar;
      diasDisponibles.value = resVacaciones.diasDisponibles;
      vacacionesDisp.value = resVacaciones.totalDiasYear;
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  } finally {
    loading.value = false;
  }
}

function chucha(param: any) {
  if (param == currentYear2.value) {
    VacacionesAÑo.value = true;
    year.value = param;
    observaciones.value = `Vacaciones ${param}`;
  } else if (param == currentYear2.value - 1) {
    if (diasDisponiblesAñoAnterior.value > 0) {
      VacacionesAÑo.value = false;
      year.value = param;
      observaciones.value = `Vacaciones ${param}`;
    } else
      Swal.fire({
        icon: "info",
        title: "Upss...",
        text: "No tienes vacaciones disponibles del year anterior",
        showConfirmButton: true,
        timer: 5000,
        timerProgressBar: true,
      });
  }
}

watch(trabajadorSelect, () => {
  getInfoTrabajadorSelected();
});

watch(diasDisponiblesAñoAnterior, () => {
  if (diasDisponiblesAñoAnterior.value > 0) {
    chucha(currentYear2.value - 1);
    VacacionesAÑo.value = false;
    //Limitar vacaciones del year anterior.
    if (fechaLimite > hoy) {
      Swal.fire({
        icon: "info",
        title: "IMPORTANTE",
        html: `Tienes hasta el ${fechaLimite.toFormat(
          "dd/MM/yyyy",
        )} para solicitar las vacaciones del ${
          currentYear2.value - 1
        }. Si pasa esta fecha las vacaciones caducarán. <span class="text-danger fw-bold">GASTA PRIMERO LOS DÍAS DEL ${
          currentYear2.value - 1
        }</span>`,
        showConfirmButton: true,
        timerProgressBar: false,
      });
    }
  }
});

onMounted(async () => {
  try {
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || userStore.getUid!;
    const equipo = await getEquipoDe(uidParaConsultar);

    if (equipo && equipo.length > 0) {
      trabajadores.value = equipo;
    } else {
      trabajadores.value = [];
      throw Error("Es necesario un equipo de trabajo a tu cargo para solicitar vacaciones");
    }
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
});
</script>

<style lang="scss" scoped>
.card-detalles {
  border-radius: 1em;
  border: 1em;
  border-top-color: #57a791 !important;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}
.colorActiveAño {
  background-color: #30cae6;
  color: black;
  padding: 0.6rem;
}

.colorInactiveAño {
  background-color: #d7d9e7;
  color: rgb(119, 119, 119);
}

.flus {
  border-radius: 1em;
  border: 1em;
  border-top-color: #14babd !important;
  text-align: center;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}
.textColor {
  color: #e66c5a;
}

.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #e66c5a 0%, #333 100%);
  color: #fff;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  background: #fafbfc;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  overflow-y: auto;
  flex: 1 1 auto;
}

.modal-footer {
  border-top: 1px solid #e0e0e0;
  background: #f7f7f7;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

.card {
  padding: 0.5em 0.5em;
  border-radius: 1em;
  border: 1em;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}

@media (max-width: 900px) {
  .modal-dialog {
    max-width: 98vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.8rem !important;
    padding: 0 !important;
  }
  .modal-header {
    padding: 1.1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.15rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2.1rem;
    height: 2.1rem;
    font-size: 1.2rem;
    margin-left: 0.7rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.8rem 0.8rem !important;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 600px) {
  .modal-dialog {
    max-width: 99vw;
    min-width: 0;
    padding: 0;
  }
  .modal-content {
    border-radius: 0.7rem !important;
    padding: 0 !important;
  }
  .modal-header {
    padding: 1rem !important;
    min-height: 56px;
    box-sizing: border-box;
  }
  .modal-title {
    font-size: 1.1rem;
    word-break: break-word;
  }
  .btn-close {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
    margin-left: 0.5rem;
  }
  .modal-body,
  .modal-footer {
    border-radius: 0 0 0.7rem 0.7rem !important;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
}

@media (max-width: 400px) {
  .modal-title {
    font-size: 1rem;
  }
  .modal-header {
    padding: 0.7rem !important;
  }
  .modal-body,
  .modal-footer {
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }
}
</style>
