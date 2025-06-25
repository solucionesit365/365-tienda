<template>
  <div class="row justify-content-center mt-3">
    <div class="co-12 col-sm-12 col-xl-12">
      <div class="card border-top border-5">
        <div class="card-header">
          <div class="card-body">
            <div class="row">
              <div class="col-6">
                <div class="input-group mb-3">
                  <span class="input-group-text" id="basic-addon1">@</span>
                  <input
                    type="text"
                    class="form-control"
                    aria-label="Titulo"
                    aria-describedby="basic-addon1"
                  />
                </div>
              </div>
              <div class="col-6">
                <div class="input-group mb-3">
                  <span class="input-group-text" id="basic-addon1">@</span>
                  <input
                    type="text"
                    class="form-control"
                    aria-label="Descripción"
                    aria-describedby="basic-addon1"
                  />
                </div>
              </div>

              <div class="col-sm-6 col-6 col-xl-4">
                <div class="form-text">
                  Caducidad
                  <MDBPopover v-model="popover2" direction="right">
                    <template #reference>
                      <i class="fas fa-question-circle text-info" @click="popover2 = !popover2" />
                    </template>
                    <template #body>
                      Finalizada esta fecha la auditoría será deshabilitada.
                    </template>
                  </MDBPopover>
                </div>
                <MDBDatepicker
                  v-model="caducidad"
                  input-toggle
                  label="Inicio"
                  class="w-100"
                  :months-full="mesesFull"
                  :months-short="mesesShort"
                  :weekdays-full="diasFull"
                  :weekdays-short="diasShort"
                  :weekdays-narrow="inicialesDias"
                  :clear-btn-text="'Reset'"
                  :cancel-btn-text="'Cancelar'"
                  :start-day="1"
                  format="DD/MM/YYYY"
                />
              </div>
              <div class="col-sm-6 col-6 col-xl-4">
                <div class="form-text">Tienda</div>
                  v-model:options="listaTiendas"
                  v-model:selected="tienda"
                  filter
                  :select-all="false"
                  :search-placeholder="'Buscar'"
                  options-selected-label="tienda/s seleccionada/s"
                />
              </div>
              <div class="col-sm-6 col-6 col-xl-4">
                <div class="form-text">Categoría</div>
                <select v-model="categoria" class="form-select" aria-label="Default select example">
                  <option value="Coordinadora A">Coordinadora A</option>
                  <option value="Coordinadora B">Coordinadora B</option>
                  <option value="Supervisora">Supervisora</option>
                  <option value="Dependienta A">Dependienta A</option>
                  <option value="Dependienta B">Dependienta B</option>
                  <option value="Dependienta C">Dependienta C</option>
                  <option value="Barista">Barista</option>
                  <option value="Aprendiz">Aprendiz</option>
                  <option value="Todas">Todas</option>
                </select>
              </div>
            </div>
            <!-- Preguntas generales -->
            <div>
              <div class="mb-3">
                <h4 class="mt-3">
                  Preguntas
                  <button color="success" floating @click="agregarPregunta()">
                    <i icon="plus" />
                  </button>
                </h4>
                <div class="row">
                  <div class="col-sm-12 col-12 col-xl-5">
                    <div class="input-group mb-3">
                      <span class="input-group-text" id="basic-addon1">@</span>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Username"
                        aria-label="Username"
                        aria-describedby="basic-addon1"
                      />
                    </div>
                    label="Pregunta" v-model="pregunta" />
                  </div>
                  <div class="col-sm-12 col-12 col-xl-3">
                    <MDBSelect v-model:options="options2" v-model:selected="tipo" />
                  </div>
                  <div class="col-sm-6 col-7 col-xl-2">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" value="" />
                    </div>
                  </div>
                </div>
                <!-- Continuacion preguntas -->
                <div class="accordion" id="accordionExample" borderless>
                  <div class="accordion-item border border-info"
                    headerTitle="PREGUNTAS"
                    collapseId="collapseOne"
                  >
                    <ul
                      class="list-group"
                      light
                      v-for="(pregunta, index) in preguntas"
                      v-bind:key="index"
                    >
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-12 col-sm-12 col-xl-4">
                            <MDBBadge class="badge-primary" pill>{{ index + 1 }}</MDBBadge>
                            {{ pregunta.pregunta }}
                          </div>
                          <div class="col-12 col-sm-12 col-xl-3">
                            <!-- Si es rojo y verde -->
                            <MDBBtnGroup v-if="pregunta.tipo == 'ROJOVERDE'">
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-success"
                                label="VERDE"
                                name="options"
                              />
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-danger"
                                label="ROJO"
                                name="options"
                              />
                            </MDBBtnGroup>
                            <!-- Si es SI/NO -->
                            <MDBBtnGroup v-if="pregunta.tipo == 'SINO'">
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-secondary"
                                label="SI"
                                name="options"
                              />
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-secondary"
                                label="NO"
                                name="options"
                              />
                            </MDBBtnGroup>
                            <!-- Si es respuesta escrita -->
                            <div class="input-group mb-3">
                              <span class="input-group-text" id="basic-addon1">@</span>
                              <input
                                type="text"
                                class="form-control"
                                placeholder="Username"
                                aria-label="Username"
                                aria-describedby="basic-addon1"
                              />
                            </div>
                            v-if="pregunta.tipo == 'RespESCRITA'" label="Respuesta escrita" disabled
                            aria-label="Respuesta escrita" />
                            <!-- Si es valor del 1 al 10 -->
                            <div v-if="pregunta.tipo === 'rango'">
                              <MDBBadge class="badge-warning" pill> Rango (1 - 10) </MDBBadge>
                            </div>
                          </div>
                          <div class="col-6 col-sm-6 col-xl-3">
                            <MDBCheckbox
                              disabled
                              v-if="pregunta.archivo"
                              label="Permite foto"
                              v-model="pregunta.archivo"
                            />
                          </div>
                          <div class="col-12 col-sm-12 col-xl-2">
                            <button @click="adiosVaquero(index)" color="danger" floating>
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <hr />
              <!-- Configuracion -->
              <div class="mt-3">
                <h4>Configuración</h4>
                <MDBCheckbox v-model="dependientaA" label="Preguntas Dependienta A" inline />
                <MDBCheckbox v-model="dependientaB_C" label="Preguntas Dependienta B/C" inline />
                <MDBCheckbox v-model="responsable" label="Preguntas Responsable" inline />
              </div>
              <!-- Preguntas Dependienta A -->
              <div v-if="dependientaA" class="mb-2">
                <h4 class="mt-3">
                  Preguntas Dependienta A
                  <button color="success" floating @click="agregarPreguntaDpendientaA()">
                    <MDBIcon icon="plus" />
                  </button>
                </h4>
                <div class="row">
                  <div class="col-sm-12 col-12 col-xl-5">
                    <div class="input-group mb-3">
                      <span class="input-group-text" id="basic-addon1">@</span>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Username"
                        aria-label="Username"
                        aria-describedby="basic-addon1"
                      />
                    </div>
                    label="Pregunta" v-model="preguntaDA" />
                  </div>
                  <div class="col-sm-12 col-12 col-xl-3">
                    <!-- <MDBSelect :options="options2" v-model="" /> -->
                    <select v-model="tipoDependientaA" class="form-select">
                      <option v-for="option in options2" :value="option.value" :key="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                  <div class="col-sm-6 col-7 col-xl-2">
                    <MDBCheckbox label="Permitir foto" v-model="archivoDependiantaA" />
                  </div>
                </div>
              </div>

              <!-- Continuacion Preguntas Dependienta A -->
              <div class="accordion" id="accordionExample" v-if="dependientaA" borderless>
                <div class="accordion-item border border-info"
                  headerTitle="PREGUNTAS Dependienta A"
                  collapseId="collapseOne"
                >
                  <div>
                    <ul
                      class="list-group"
                      light
                      v-for="(preguntaDA, index) in preguntasDependientaA"
                      v-bind:key="index"
                    >
                      <li class="list-group-item">
                        <div class="row">
                          <div class="col-12 col-sm-12 col-xl-4">
                            <MDBBadge class="badge-primary" pill>{{ index + 1 }}</MDBBadge>
                            {{ preguntaDA.pregunta }}
                          </div>
                          <div class="col-12 col-sm-12 col-xl-3">
                            <!-- Si es rojo y verde -->
                            <MDBBtnGroup v-if="preguntaDA.tipo == 'ROJOVERDE'">
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-success"
                                label="VERDE"
                                name="options"
                              />
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-danger"
                                label="ROJO"
                                name="options"
                              />
                            </MDBBtnGroup>
                            <!-- Si es SI/NO -->
                            <MDBBtnGroup v-if="preguntaDA.tipo == 'SINO'">
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-secondary"
                                label="SI"
                                name="options"
                              />
                              <MDBRadio
                                disabled
                                :btnCheck="true"
                                :wrap="false"
                                labelClass="btn btn-secondary"
                                label="NO"
                                name="options"
                              />
                            </MDBBtnGroup>
                            <!-- Si es respuesta escrita -->
                            <div class="input-group mb-3">
                              <span class="input-group-text" id="basic-addon1">@</span>
                              <input
                                v-if="preguntaDA.tipo == 'RespESCRITA'"
                                type="text"
                                class="form-control"
                                aria-label="Respuesta escrita"
                                aria-describedby="basic-addon1"
                                disabled
                              />
                            </div>

                            />
                            <!-- Si es valor del 1 al 10 -->
                            <div v-if="preguntaDA.tipo === 'rango'">
                              <MDBBadge class="badge-warning" pill> Rango (1 - 10) </MDBBadge>
                            </div>
                          </div>
                          <div class="col-6 col-sm-6 col-xl-3">
                            <MDBCheckbox
                              disabled
                              v-if="preguntaDA.archivo"
                              label="Permite foto"
                              v-model="preguntaDA.archivo"
                            />
                          </div>
                          <div class="col-12 col-sm-12 col-xl-2">
                            <button @click="adiosVaquero2(index)" color="danger" floating>
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- Preguntas Dependienta B/C -->
              <div v-if="dependientaB_C" class="mb-2">
                <h4 class="mt-3">
                  Preguntas Dependienta B/C
                  <button color="success" floating @click="agregarPreguntaDependientaB_C()">
                    <MDBIcon icon="plus" />
                  </button>
                </h4>
                <div class="row">
                  <div class="col-sm-12 col-12 col-xl-5">
                    <div class="input-group mb-3">
                      <span class="input-group-text" id="basic-addon1">@</span>
                      <input
                        type="text"
                        class="form-control"
                        aria-label="Pregunta"
                        aria-describedby="basic-addon1"
                      />
                    </div>
                  </div>
                  <div class="col-sm-12 col-12 col-xl-3">
                    <!-- <MDBSelect :options="options2" v-model="" /> -->
                    <select v-model="tipoDependientaB_C" class="form-select">
                      <option v-for="option in options2" :value="option.value" :key="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                  <div class="col-sm-6 col-7 col-xl-2">
                    <MDBCheckbox label="Permitir foto" v-model="archivoDependiantaB_C" />
                  </div>
                </div>
              </div>

              <!-- Continuacion Preguntas Dependienta B/C -->
              <div class="accordion" id="accordionExample" v-if="dependientaB_C" borderless>
                <div class="accordion-item border border-info"
                  headerTitle="PREGUNTAS Dependienta B/C"
                  collapseId="collapseOne"
                >
                  <ul
                    class="list-group"
                    light
                    v-for="(preguntaDBC, index) in preguntasDependientaB_C"
                    v-bind:key="index"
                  >
                    <li class="list-group-item">
                      <div class="row">
                        <div class="col-12 col-sm-12 col-xl-4">
                          <MDBBadge class="badge-primary" pill>{{ index + 1 }}</MDBBadge>
                          {{ preguntaDBC.pregunta }}
                        </div>
                        <div class="col-12 col-sm-12 col-xl-3">
                          <!-- Si es rojo y verde -->
                          <MDBBtnGroup v-if="preguntaDBC.tipo == 'ROJOVERDE'">
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-success"
                              label="VERDE"
                              name="options"
                            />
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-danger"
                              label="ROJO"
                              name="options"
                            />
                          </MDBBtnGroup>
                          <!-- Si es SI/NO -->
                          <MDBBtnGroup v-if="preguntaDBC.tipo == 'SINO'">
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-secondary"
                              label="SI"
                              name="options"
                            />
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-secondary"
                              label="NO"
                              name="options"
                            />
                          </MDBBtnGroup>
                          <!-- Si es respuesta escrita -->
                          <div class="input-group mb-3">
                            <span class="input-group-text" id="basic-addon1">@</span>
                            <input
                              v-if="preguntaDBC.tipo == 'RespESCRITA'"
                              type="text"
                              class="form-control"
                              placeholder="Username"
                              aria-label="Respuesta escrita"
                              aria-describedby="basic-addon1"
                              disabled
                            />
                            <!-- Si es valor del 1 al 10 -->
                            <div v-if="preguntaDBC.tipo === 'rango'">
                              <MDBBadge class="badge-warning" pill> Rango (1 - 10) </MDBBadge>
                            </div>
                          </div>
                          <div class="col-6 col-sm-6 col-xl-3">
                            <MDBCheckbox
                              disabled
                              v-if="preguntaDBC.archivo"
                              label="Permite foto"
                              v-model="preguntaDBC.archivo"
                            />
                          </div>
                          <div class="col-12 col-sm-12 col-xl-2">
                            <button @click="adiosVaquero3(index)" color="danger" floating>
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Responsable -->

              <div v-if="responsable" class="mb-2">
                <h4 class="mt-3">
                  Preguntas Responsable
                  <button color="success" floating @click="agregarPreguntaResponsable()">
                    <MDBIcon icon="plus" />
                  </button>
                </h4>
                <div class="row">
                  <div class="col-sm-12 col-12 col-xl-5">
                    <div class="input-group mb-3">
                      <span class="input-group-text" id="basic-addon1">@</span>
                      <input
                        type="text"
                        class="form-control"
                        aria-label="Pregunta"
                        aria-describedby="basic-addon1"
                      />
                    </div>
                  </div>
                  <div class="col-sm-12 col-12 col-xl-3">
                    <select v-model="tipoResponsable" class="form-select">
                      <option v-for="option in options2" :value="option.value" :key="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                  <div class="col-sm-6 col-7 col-xl-2">
                    <MDBCheckbox label="Permitir foto" v-model="archivoResponsable" />
                  </div>
                </div>
              </div>

              <!--  Continuacion Responsable -->
              <div class="accordion" id="accordionExample" v-if="responsable" borderless>
                <div class="accordion-item border border-info"
                  headerTitle="PREGUNTAS Dependienta B/C"
                  collapseId="collapseOne"
                >
                  <ul
                    class="list-group"
                    light
                    v-for="(preguntaRes, index) in preguntasResponsable"
                    v-bind:key="index"
                  >
                    <li class="list-group-item">
                      <div class="row">
                        <div class="col-12 col-sm-12 col-xl-4">
                          <MDBBadge class="badge-primary" pill>{{ index + 1 }}</MDBBadge>
                          {{ preguntaRes.pregunta }}
                        </div>
                        <div class="col-12 col-sm-12 col-xl-3">
                          <!-- Si es rojo y verde -->
                          <MDBBtnGroup v-if="preguntaRes.tipo == 'ROJOVERDE'">
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-success"
                              label="VERDE"
                              name="options"
                            />
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-danger"
                              label="ROJO"
                              name="options"
                            />
                          </MDBBtnGroup>
                          <!-- Si es SI/NO -->
                          <MDBBtnGroup v-if="preguntaRes.tipo == 'SINO'">
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-secondary"
                              label="SI"
                              name="options"
                            />
                            <MDBRadio
                              disabled
                              :btnCheck="true"
                              :wrap="false"
                              labelClass="btn btn-secondary"
                              label="NO"
                              name="options"
                            />
                          </MDBBtnGroup>
                          <!-- Si es respuesta escrita -->
                          <div class="input-group mb-3">
                            <span class="input-group-text" id="basic-addon1">@</span>
                            <input
                              v-if="preguntaRes.tipo == 'RespESCRITA'"
                              type="text"
                              class="form-control"
                              placeholder="Username"
                              aria-label="respuesta escrita"
                              aria-describedby="basic-addon1"
                              disabled
                            />
                          </div>
                          <!-- Si es valor del 1 al 10 -->
                          <div v-if="preguntaRes.tipo === 'rango'">
                            <MDBBadge class="badge-warning" pill> Rango (1 - 10) </MDBBadge>
                          </div>
                        </div>
                        <div class="col-6 col-sm-6 col-xl-3">
                          <MDBCheckbox
                            disabled
                            v-if="preguntaRes.archivo"
                            label="Permite foto"
                            v-model="preguntaRes.archivo"
                          />
                        </div>
                        <div class="col-12 col-sm-12 col-xl-2">
                          <button @click="adiosVaquero4(index)" color="danger" floating>
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer text-center">
            <button color="success" @click="nuevaAuditoria()">Enviar auditoria</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import Swal from "sweetalert2";
import { axiosInstance } from "@/components/axios/axios";
import router from "@/router/index";
import { mesesFull, mesesShort, diasFull, diasShort, inicialesDias } from "@/components/constantes";
import { useUserStore } from "@/stores/user";

const useStore = useUserStore();
const popover2 = ref(false);
const tituloAuditoria = ref("");
const descripcion = ref("");
const caducidad = ref("");
const tienda = ref("");
const tipoDependientaB_C = ref("");
const tipoResponsable = ref("");
const tipoDependientaA = ref("");
const activeItem = ref();
const activeItemDependientaA = ref();
const activeItemDependientaB_C = ref();
const activeItemResponsable = ref();

//La pregunta
const pregunta = ref("");
const preguntaDA = ref("");
const preguntaDBC = ref("");
const preguntaRes = ref("");
const tipo = ref("");
const archivo = ref(false);
const archivoDependiantaA = ref(false);
const archivoDependiantaB_C = ref(false);
const archivoResponsable = ref(false);

interface Pregunta {
  pregunta: string;
  tipo: string;
  archivo: boolean;
}

const preguntas = ref<Pregunta[]>([]);
interface PreguntaDependientaA {
  pregunta: string;
  tipo: string;
  archivo: boolean;
}

const preguntasDependientaA = ref<PreguntaDependientaA[]>([]);
interface PreguntaDependientaB_C {
  pregunta: string;
  tipo: string;
  archivo: boolean;
}

const preguntasDependientaB_C = ref<PreguntaDependientaB_C[]>([]);
interface PreguntaResponsable {
  pregunta: string;
  tipo: string;
  archivo: boolean;
}

const preguntasResponsable = ref<PreguntaResponsable[]>([]);
const fallo = ref(false);
const falloF = ref(false);
const listaTiendas = ref([]);
const dependientaA = ref(false);
const dependientaB_C = ref(false);
const responsable = ref(false);
const categoria = ref(null);
const currentUser = computed(() => useStore.user);

function mensaje(icono: any, title: any, text: any) {
  Swal.fire({
    icon: icono,
    title: title,
    text: text,
    showConfirmButton: true,
    timer: 3000,
    timerProgressBar: false,
  });
}

const options2 = ref([
  { text: "Rojo / Verde", value: "ROJOVERDE" },
  { text: "SI / NO", value: "SINO" },
  { text: "Respuesta escrita", value: "RespESCRITA" },
  { text: "Valor 1-10", value: "rango" },
]);

function agregarPregunta() {
  fallo.value = false;
  if (pregunta.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de introducir una pregunta");
  }

  if (tipo.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de seleccionar un tipo");
  }
  if (!fallo.value) {
    activeItem.value = "collapseOne";
    preguntas.value.push({
      pregunta: pregunta.value,
      tipo: tipo.value,
      archivo: archivo.value,
    });
    pregunta.value = "";
  }
}

function agregarPreguntaDpendientaA() {
  fallo.value = false;
  if (preguntaDA.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de introducir una pregunta");
  }

  if (tipoDependientaA.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de seleccionar un tipo");
  }
  if (!fallo.value) {
    activeItemDependientaA.value = "collapseOne";
    preguntasDependientaA.value.push({
      pregunta: preguntaDA.value,
      tipo: tipoDependientaA.value,
      archivo: archivoDependiantaA.value,
    });
    preguntaDA.value = "";
  }
}

function agregarPreguntaDependientaB_C() {
  fallo.value = false;
  if (preguntaDBC.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de introducir una pregunta");
  }

  if (tipoDependientaB_C.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de seleccionar un tipo");
  }
  if (!fallo.value) {
    activeItemDependientaB_C.value = "collapseOne";
    preguntasDependientaB_C.value.push({
      pregunta: preguntaDBC.value,
      tipo: tipoDependientaB_C.value,
      archivo: archivoDependiantaB_C.value,
    });
    preguntaDBC.value = "";
  }
}

function agregarPreguntaResponsable() {
  fallo.value = false;
  if (preguntaRes.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de introducir una pregunta");
  }

  if (tipoResponsable.value == "") {
    fallo.value = true;
    mensaje("error", "Upss...", "Debes de seleccionar un tipo");
  }
  if (!fallo.value) {
    activeItemResponsable.value = "collapseOne";
    preguntasResponsable.value.push({
      pregunta: preguntaRes.value,
      tipo: tipoResponsable.value,
      archivo: archivoResponsable.value,
    });
    preguntaRes.value = "";
  }
}

//Guardar completo en mongo
async function nuevaAuditoria() {
  const partesDeFecha = caducidad.value.split("/");

  falloF.value = false;
  if (tituloAuditoria.value == "") {
    falloF.value = true;
    mensaje("error", "Upss...", "Debes de ponerle un titulo a la auditoría");
  }
  if (tienda.value == "") {
    falloF.value = true;
    mensaje("error", "Upss...", "Debes seleccionar al menos una tienda");
  }
  if (pregunta.value && preguntas.value.length == 0) {
    falloF.value = true;
    mensaje("error", "Upss...", "Debes agregar al menos una pregunta");
  }
  if (dependientaA.value && preguntasDependientaA.value.length == 0) {
    falloF.value = true;
    mensaje("error", "Upss...", "Debes agregar al menos una pregunta");
  }
  if (dependientaB_C.value && preguntasDependientaB_C.value.length == 0) {
    falloF.value = true;
    mensaje("error", "Upss...", "Debes agregar al menos una pregunta");
  }
  if (responsable.value && preguntasResponsable.value.length == 0) {
    falloF.value = true;
    mensaje("error", "Upss...", "Debes agregar al menos una pregunta");
  }
  if (!falloF.value) {
    const data = {
      tituloAuditoria: tituloAuditoria.value,
      descripcion: descripcion.value,
      caducidad: new Date(
        Number(partesDeFecha[2]),
        Number(partesDeFecha[1]) - 1,
        Number(partesDeFecha[0]),
      ).toISOString(),
      tienda: tienda.value,
      categoria: categoria.value,
      preguntas: preguntas.value,
      preguntasDependientaA: preguntasDependientaA.value,
      preguntasDependientaB_C: preguntasDependientaB_C.value,
      preguntasResponsable: preguntasResponsable.value,
      habilitado: true,
      deptCreador: currentUser.value.roles[0].name,
      configuracion: {
        preguntasDependientaA: dependientaA.value,
        preguntasDependientaB_C: dependientaB_C.value,
        preguntasResponsable: responsable.value,
      },
    };
    axiosInstance.post("auditorias/nuevaAuditoria", data).then((response) => {
      if (response.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Perfecto...",
          text: "Auditoría enviada",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          router.push("/auditorias");
        });
      }
    });
  }
}

// mostrar tiendas
async function mostrarTiendas() {
  axiosInstance
    .get("auditorias/tiendasAuditoria")
    .then((resTiendas) => {
      if (!resTiendas.data?.ok) throw Error(resTiendas.data?.message);

      listaTiendas.value = resTiendas.data.data.map((tienda: any) => {
        return { value: tienda.id, text: tienda.nombre };
      });
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Oops...", "Ha habido un problema", "error");
    });
}
// eliminar de array preguntas
function adiosVaquero(index: any) {
  preguntas.value.splice(index, 1);
}

function adiosVaquero2(index: any) {
  preguntasDependientaA.value.splice(index, 1);
}

function adiosVaquero3(index: any) {
  preguntasDependientaB_C.value.splice(index, 1);
}

function adiosVaquero4(index: any) {
  preguntasResponsable.value.splice(index, 1);
}

onMounted(() => {
  mostrarTiendas();
});
</script>

<style scoped>
.card {
  border-radius: 1em;
  border: 1em;
  border-top-color: #03a9f4 !important;
  box-shadow: 0 5px 17px rgba(0, 0, 0, 0.2);
}
</style>
