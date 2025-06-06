<template>
  <MDBModal
    id="modalCrearCuadrante"
    tabindex="-1"
    labelledby="modalLabel"
    v-model="modalCrearCuadrante"
    fullscreen
  >
    <MDBModalBody>
      <div class="row">
        <div class="col">
          <select class="form-select form-select-lg mb-3" v-model="trabajadorSelected">
            <option v-for="(item, index) in trabajadores" v-bind:key="index" :value="item.value">
              {{ item.text }}
            </option>
          </select>
        </div>
        <div class="col">
          <span>Total horas: {{ totalHoras.toFixed(2) }}</span>
        </div>
      </div>

      <div class="row mt-2" v-if="!cargando">
        <div class="table-responsive">
          <table v-if="trabajadorSelected" class="table">
            <thead>
              <tr>
                <th style="width: 19%">Día</th>
                <th style="width: 27%">Entrada</th>
                <th style="width: 27%">Salida</th>
                <th style="width: 27%">-</th>
              </tr>
            </thead>
            <tbody>
              <RowDia
                v-for="turno in arrayCuadrantes"
                v-bind:key="turno._id"
                :turno="turno"
                @update:turno="updateTurno($event)"
                @configurador:abrir="abrirConfigurador(turno)"
              />
            </tbody>
          </table>
          <div v-else>
            <MDBCard text="white" bg="warning" class="mb-3">
              <MDBCardBody>
                <!-- <MDBCardTitle>Selecciona primero a una persona</MDBCardTitle> -->
                <MDBCardText>
                  Selecciona primero a una persona para poder configurar su cuadrante semanal
                </MDBCardText>
              </MDBCardBody>
            </MDBCard>
          </div>
        </div>
      </div>

      <div v-else>
        <LoaderComponent />
      </div>
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="warning" @click="modalCrearCuadrante = false">Salir</MDBBtn>
      <MDBBtn color="dark" :class="{ disabled: guardando }" @click="guardarFinal()">
        <span
          v-if="guardando"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span
        >Guardar</MDBBtn
      >
    </MDBModalFooter>
  </MDBModal>
  <ConfiguradorTurnoComponent
    ref="configuradorRef"
    @add-cuadrante="handleAddCuadrante"
    @update:tienda="updateTienda"
    @borrar:turno="borrarTurno"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, inject, type Ref } from "vue";

import Swal from "sweetalert2";
import { DateTime } from "luxon";
import { axiosInstance } from "@/components/axios/axios";
import {
  MDBModal,
  MDBBtn,
  MDBModalBody,
  MDBModalFooter,
  MDBCard,
  MDBCardBody,
  MDBCardText,
} from "mdb-vue-ui-kit";
import RowDia from "@/components/RowDiaCrear.vue";
import ConfiguradorTurnoComponent from "@/components/ConfiguradorTurno.vue";
import LoaderComponent from "@/components/LoaderCuadrantes.vue";
import { useUserStore } from "@/stores/user";
import type { TCuadranteFrontend, TCuadranteBackend } from "@/interfaces/Cuadrante.interface";
import type { TTienda } from "@/interfaces/Tienda.interface";
import type { TTrabajador } from "@/interfaces/Trabajador.interface";

const userStore = useUserStore();
const arrayTiendas: Ref<any[]> = ref([]);
const idTiendaDefault = ref(0);
const trabajadorSelected = ref(null);
const inicioSemana: Ref<DateTime | null> = ref(null);
const modalCrearCuadrante = ref(false);
const semanaActual = DateTime.now().weekNumber;
const yearActual = DateTime.now().year;
const guardando = ref(false);
const trabajadores: Ref<{ text: string; value: number }[]> = ref([]);
const currentUser = computed(() => userStore.user);
const arrayCuadrantes: Ref<any[]> = ref([]);
const configuradorRef: Ref<InstanceType<typeof ConfiguradorTurnoComponent> | null> = ref(null);
const cargando = ref(false);
const getCuadrantes = inject<() => TCuadranteFrontend[]>("getCuadrantes");
const totalHoras = computed(() => {
  let total = 0;

  for (let i = 0; i < arrayCuadrantes.value.length; i += 1) {
    // Si tiene ausencia no se suman las horas totales
    if (arrayCuadrantes.value[i].ausencia) continue;
    //Si no tiene ausencia si se suma las horas totales
    total += arrayCuadrantes.value[i].final.diff(arrayCuadrantes.value[i].inicio, "hours").hours;
  }

  return total;
});

async function abrirModal(fechaBetween: Date, tiendas: TTienda[], idTienda: number) {
  if (fechaBetween && tiendas.length > 0 && idTienda) {
    arrayTiendas.value = tiendas;
    idTiendaDefault.value = idTienda;
    inicioSemana.value = DateTime.fromJSDate(fechaBetween).startOf("week");

    await iniciarDatos(inicioSemana.value);
    modalCrearCuadrante.value = true;
  } else Swal.fire("Oops...", "Datos iniciales incorrectos", "error");
}

async function iniciarDatos(fecha: DateTime) {
  try {
    if (trabajadorSelected.value) {
      const auxCuadrantes = await getCuadranteEmpleado(fecha, trabajadorSelected.value);
      arrayCuadrantes.value = auxCuadrantes;
    }
  } catch (err) {
    cargando.value = false;
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function guardarFinal() {
  try {
    guardando.value = true;
    // Recuperar UID de Coordinadora desde localStorage si existe
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || currentUser.value.uid;

    const sendRequestCuadrantes = arrayCuadrantes.value.map((turno) => {
      return {
        bloqueado: turno.ausencia?.completa ? true : false,
        horaEntrada: turno.inicio.toISO(),
        horaSalida: turno.final.toISO(),
        idPlan: turno.idPlan,
        idTienda: turno.idTienda,
        idCuadrante: turno._id,
        ausencia: turno.ausencia,
        borrable: turno.borrable,
      };
    });

    if (!inicioSemana.value) throw Error("No se ha podido obtener la fecha de inicio de semana");

    const resGuardar = await axiosInstance.post("cuadrantes/saveCuadrante", {
      idTrabajador: trabajadorSelected.value,
      arraySemanalHoras: sendRequestCuadrantes,
      totalHoras: totalHoras.value,
      idTiendaDefault: idTiendaDefault.value,
      fecha: inicioSemana.value.toISO(),
      uid: uidParaConsultar,
      semana: semanaActual,
      year: yearActual,
    });

    if (resGuardar.data.ok) {
      if (!getCuadrantes) {
        throw new Error("No se encontró la inyección 'getCuadrantes'");
      }
      getCuadrantes();
      modalCrearCuadrante.value = false;

      Swal.fire({
        icon: "success",
        title: "Perfecto",
        text: "Turnos guardados correctamente",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } else throw Error();
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "No se han podido guardar los turnos", "error");
  } finally {
    guardando.value = false;
  }
}

async function getTrabajadores() {
  try {
    trabajadores.value = [];

    // Recuperar UID de Coordinadora desde localStorage si existe
    const uidGuardado = localStorage.getItem("uidCoordinadora");
    const uidParaConsultar = uidGuardado || currentUser.value.uid;

    /* NUEVO CODIGO */
    const resEquipo = await axiosInstance.get("trabajadores/getSubordinados", {
      params: { uid: uidParaConsultar },
    });

    if (resEquipo.data.ok) {
      trabajadores.value = resEquipo.data.data.map((trabajador: TTrabajador) => {
        return {
          text: trabajador.nombreApellidos,
          value: trabajador.id,
        };
      });

      if (
        currentUser.value.llevaEquipo &&
        currentUser.value.idTienda &&
        !trabajadores.value.some((t) => t.value === currentUser.value.idSql)
      ) {
        if (currentUser.value.displayName && currentUser.value.idSql)
          trabajadores.value.push({
            text: currentUser.value.displayName,
            value: currentUser.value.idSql,
          });
      }
    } else throw Error("No se ha podido obtener la lista de tu equipo de trabajo");

    /*FINAL NUEVO CODIGO */
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Ha habido un error", "error");
  }
}

async function getCuadranteEmpleado(fecha: DateTime, idTrabajador: number) {
  cargando.value = true;
  // Recuperar UID de Coordinadora desde localStorage si existe
  const uidGuardado = localStorage.getItem("uidCoordinadora");
  const uidParaConsultar = uidGuardado || currentUser.value.uid;
  const resCuadrantes = await axiosInstance.get("cuadrantes/individual", {
    params: {
      fecha: fecha.toJSDate().toISOString(),
      idTrabajador,
      uid: uidParaConsultar,
    },
  });

  if (resCuadrantes.data.ok) {
    cargando.value = false;
    return resCuadrantes.data.data.map((turno: TCuadranteBackend) => ({
      ...turno,
      inicio: DateTime.fromJSDate(new Date(turno.inicio)),
      final: DateTime.fromJSDate(new Date(turno.final)),
    }));
  } else throw Error("No se ha podido cargar el cuadrante individual");
}

function updateTurno(updatedTurno: any) {
  const index = buscarIndexFromTurno(updatedTurno._id);
  arrayCuadrantes.value[index] = updatedTurno;
  arrayCuadrantes.value = [...arrayCuadrantes.value];
}

// function ordenarArrayCuadrantes() {
//   arrayCuadrantes.value.sort((a, b) => {
//     if (a.inicio < b.inicio) return -1;
//     if (a.inicio > b.inicio) return 1;
//     return 0;
//   });
// }

async function handleAddCuadrante({ dia, idTienda, ausencia }: any) {
  const nuevoCuadrante: any = {
    _id: (await axiosInstance.get("cuadrantes/getNewId")).data,
    inicio: dia,
    final: dia.plus({ minute: 1 }),
    idTienda,
    ausencia,
    borrable: true,
  };

  const posicionInsertar = arrayCuadrantes.value.findIndex(
    (cuadrante) => cuadrante.inicio > nuevoCuadrante.inicio,
  );

  if (posicionInsertar === -1) {
    arrayCuadrantes.value.push(nuevoCuadrante);
  } else {
    arrayCuadrantes.value.splice(posicionInsertar, 0, nuevoCuadrante);
  }
}

function abrirConfigurador(turno: any) {
  configuradorRef.value?.abrirModal(turno, arrayTiendas.value);
}

function updateTienda({ idTurno, idTienda }: any) {
  const index = buscarIndexFromTurno(idTurno);
  arrayCuadrantes.value[index].idTienda = idTienda;
}

function buscarIndexFromTurno(idTurno: any) {
  return arrayCuadrantes.value.findIndex((element) => element._id === idTurno);
}

async function borrarTurno({ idTurno }: any) {
  const index = buscarIndexFromTurno(idTurno);

  if (arrayCuadrantes.value[index]?.borrable) {
    const resBorrado = await axiosInstance.post("cuadrantes/borrarTurno", {
      idTurno: arrayCuadrantes.value[index]._id,
    });

    if (resBorrado.data.ok) {
      arrayCuadrantes.value.splice(index, 1);
      Swal.fire("Borrado", "El turno ha sido borrado.", "success");
    } else Swal.fire("Oops...", "No se ha podido borrar este turno", "error");
  } else {
    arrayCuadrantes.value[index]._id = 1;
    arrayCuadrantes.value[index].inicio = arrayCuadrantes.value[index].inicio.startOf("day");
    arrayCuadrantes.value[index].final = arrayCuadrantes.value[index].inicio.startOf("day");
    arrayCuadrantes.value[index].idTienda = null;
    arrayCuadrantes.value[index].ausencia = null;
  }
}

// function borrarTest() {
//   console.log(arrayCuadrantes.value);
// }

watch(trabajadorSelected, () => {
  if (inicioSemana.value) iniciarDatos(inicioSemana.value);
});

defineExpose({
  abrirModal,
});

onMounted(async () => {
  await getTrabajadores();
});
</script>

<style scoped></style>
