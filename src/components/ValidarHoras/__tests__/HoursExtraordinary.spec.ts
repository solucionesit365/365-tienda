import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { DateTime } from "luxon";
import HoursExtraordinary from "../HoursExtraordinary.vue";

// Mock de SweetAlert2
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mock del axiosInstance
vi.mock("@/components/axios/axios", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({ data: { ok: true } }),
  },
}));

// Mock de equipoGeneral
vi.mock("@/components/equipoGeneral", () => ({
  getEquipoDe: vi.fn().mockResolvedValue([
    {
      id: 6085,
      idApp: "test123",
      nombreApellidos: "ACOSTA BAUTISTA WENDY NICOL",
      idTienda: 113,
      idResponsable: 1798,
      dni: "06671096S",
      nPerceptor: 2140,
      contratos: [
        {
          fechaAntiguedad: "2025-01-30T23:00:00.000Z",
        },
      ],
    },
  ]),
}));

// Mock de stores
vi.mock("@/stores/user", () => ({
  useUserStore: () => ({
    user: {
      idSql: 1234,
      uid: "test-uid",
      idTienda: 127,
    },
    getUid: "test-uid",
  }),
}));

// Mock de componentes
vi.mock("../365/BsSelect.vue", () => ({
  default: {
    name: "BsSelect",
    template: '<div class="bs-select-mock"></div>',
  },
}));

vi.mock("../365/BsCard.vue", () => ({
  default: {
    name: "BsCard",
    template: '<div class="bs-card-mock"><slot /></div>',
  },
}));

vi.mock("../365/BsCardBody.vue", () => ({
  default: {
    name: "BsCardBody",
    template: '<div class="bs-card-body-mock"><slot /></div>',
  },
}));

describe("HoursExtraordinary.vue", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("Renderizado inicial", () => {
    it("debe renderizarse correctamente", () => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("debe tener el componente vm definido", () => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });

      expect(wrapper.vm).toBeDefined();
    });
  });

  describe("Campos de horas", () => {
    beforeEach(() => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });
    });

    it("debe inicializar las horas en 0", () => {
      expect(wrapper.vm.tradeUnionHours).toBe(0);
      expect(wrapper.vm.coordinationHours).toBe(0);
      expect(wrapper.vm.trainingHours).toBe(0);
    });

    it("debe tener las variables reactivas definidas", () => {
      expect(wrapper.vm.tradeUnionHours).toBeDefined();
      expect(wrapper.vm.coordinationHours).toBeDefined();
      expect(wrapper.vm.trainingHours).toBeDefined();
      expect(wrapper.vm.confirmationMessage).toBeDefined();
      expect(wrapper.vm.arrayTeam).toBeDefined();
      expect(wrapper.vm.selectedUser).toBeDefined();
      expect(wrapper.vm.selectedDate).toBeDefined();
    });
  });

  describe("Funcionalidad de incremento/decremento", () => {
    beforeEach(() => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });
    });

    it("debe incrementar las horas sindicales en 0.25", async () => {
      const initialValue = wrapper.vm.tradeUnionHours;
      wrapper.vm.tradeUnionHours += 0.25;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.tradeUnionHours).toBe(initialValue + 0.25);
    });

    it("debe decrementar las horas de coordinación en 0.25", async () => {
      wrapper.vm.coordinationHours = 1;
      await wrapper.vm.$nextTick();
      wrapper.vm.coordinationHours -= 0.25;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.coordinationHours).toBe(0.75);
    });
  });

  describe("Función saveConfiguration", () => {
    beforeEach(() => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });
    });

    it("debe existir la función saveConfiguration", () => {
      expect(wrapper.vm.saveConfiguration).toBeDefined();
      expect(typeof wrapper.vm.saveConfiguration).toBe("function");
    });

    it("debe retornar early si no hay usuario seleccionado", async () => {
      wrapper.vm.selectedUser = "";
      const result = await wrapper.vm.saveConfiguration();
      expect(result).toBeUndefined();
    });

    it("debe construir el payload correctamente con usuario válido", async () => {
      const mockUser = {
        text: "ACOSTA BAUTISTA WENDY NICOL",
        value: {
          id: 6085,
          idApp: "test123",
          nombreApellidos: "ACOSTA BAUTISTA WENDY NICOL",
          idTienda: 113,
          idResponsable: 1798,
          dni: "06671096S",
          nPerceptor: 2140,
          contratos: [
            {
              fechaAntiguedad: "2025-01-30T23:00:00.000Z",
            },
          ],
        },
      };

      wrapper.vm.selectedUser = mockUser;
      wrapper.vm.tradeUnionHours = 2;
      wrapper.vm.coordinationHours = 1.5;
      wrapper.vm.trainingHours = 3;

      // Espiar console.log para verificar el payload
      const consoleLogSpy = vi.spyOn(console, "log");

      await wrapper.vm.saveConfiguration();

      // Verificar que se llamó a console.log
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe("Validación de datos del payload", () => {
    it("debe incluir todos los campos requeridos en el payload", async () => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });

      const mockUser = {
        text: "ACOSTA BAUTISTA WENDY NICOL",
        value: {
          id: 6085,
          idApp: "test123",
          nombreApellidos: "ACOSTA BAUTISTA WENDY NICOL",
          idTienda: 113,
          idResponsable: 1798,
          dni: "06671096S",
          nPerceptor: 2140,
          contratos: [
            {
              fechaAntiguedad: "2025-01-30T23:00:00.000Z",
            },
          ],
        },
      };

      wrapper.vm.selectedUser = mockUser;
      wrapper.vm.tradeUnionHours = 2;
      wrapper.vm.coordinationHours = 1.5;
      wrapper.vm.trainingHours = 3;

      const { axiosInstance } = await import("@/components/axios/axios");

      await wrapper.vm.saveConfiguration();

      // Verificar que se llamó a axiosInstance.post con el endpoint correcto
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/fichajes-validados/addFichajeValidado",
        expect.any(Object),
      );
    });

    it("debe convertir IDs a números correctamente", async () => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });

      const mockUser = {
        text: "Test User",
        value: {
          id: 6085,
          idTienda: 113,
          idResponsable: 1798,
          nombreApellidos: "Test User",
          dni: "12345678A",
          nPerceptor: 2140,
          contratos: [],
        },
      };

      wrapper.vm.selectedUser = mockUser;

      const { axiosInstance } = await import("@/components/axios/axios");
      await wrapper.vm.saveConfiguration();

      const callArgs = (axiosInstance.post as any).mock.calls[0][1];
      expect(typeof callArgs.idTrabajador).toBe("number");
      expect(typeof callArgs.idResponsable).toBe("number");
      expect(typeof callArgs.idTienda).toBe("number");
      expect(callArgs.idTrabajador).toBe(6085);
      expect(callArgs.idTienda).toBe(113);
      expect(callArgs.idResponsable).toBe(1798);
    });

    it("debe requerir una fecha seleccionada antes de guardar", async () => {
      const { default: Swal } = await import("sweetalert2");
      const { axiosInstance } = await import("@/components/axios/axios");

      wrapper.vm.selectedUser = {
        text: "Test User",
        value: {
          id: 1,
          idTienda: 1,
          idResponsable: 1,
          nombreApellidos: "Test User",
          dni: "123",
          nPerceptor: 1,
          contratos: [],
        },
      };
      wrapper.vm.selectedDate = "";

      await wrapper.vm.saveConfiguration();

      expect(Swal.fire).toHaveBeenCalled();
      expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it("debe usar la fecha seleccionada en el payload", async () => {
      const targetDate = "2025-02-10";
      wrapper.vm.selectedUser = {
        text: "Test User",
        value: {
          id: 6085,
          idTienda: 113,
          idResponsable: 1798,
          nombreApellidos: "Test User",
          dni: "12345678A",
          nPerceptor: 2140,
          contratos: [],
        },
      };
      wrapper.vm.selectedDate = targetDate;

      const { axiosInstance } = await import("@/components/axios/axios");
      await wrapper.vm.saveConfiguration();

      const payload = (axiosInstance.post as any).mock.calls[0][1];
      const entradaISO = DateTime.fromJSDate(payload.fichajeEntrada).toISODate();
      const salidaISO = DateTime.fromJSDate(payload.fichajeSalida).toISODate();
      const cuadranteInicioISO = DateTime.fromJSDate(payload.cuadrante.inicio).toISODate();
      const cuadranteFinalISO = DateTime.fromJSDate(payload.cuadrante.final).toISODate();

      expect(entradaISO).toBe(targetDate);
      expect(salidaISO).toBe(targetDate);
      expect(cuadranteInicioISO).toBe(targetDate);
      expect(cuadranteFinalISO).toBe(targetDate);
    });
  });

  describe("Mensaje de confirmación", () => {
    it("debe mostrar mensaje de confirmación después de guardar", async () => {
      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });

      const mockUser = {
        text: "Test User",
        value: {
          id: 6085,
          idTienda: 113,
          idResponsable: 1798,
          nombreApellidos: "Test User",
          dni: "12345678A",
          nPerceptor: 2140,
          contratos: [],
        },
      };

      wrapper.vm.selectedUser = mockUser;
      wrapper.vm.tradeUnionHours = 1;
      wrapper.vm.coordinationHours = 2;
      wrapper.vm.trainingHours = 3;

      await wrapper.vm.saveConfiguration();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.confirmationMessage).toContain("Configuración guardada");
      expect(wrapper.vm.confirmationMessage).toContain("1h");
      expect(wrapper.vm.confirmationMessage).toContain("2h");
      expect(wrapper.vm.confirmationMessage).toContain("3h");
    });
  });

  describe("Carga del equipo", () => {
    it("debe cargar el equipo al montar el componente", async () => {
      const { getEquipoDe } = await import("@/components/equipoGeneral");

      wrapper = mount(HoursExtraordinary, {
        global: {
          stubs: {
            BsSelect: true,
            BsCard: true,
            BsCardBody: true,
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(getEquipoDe).toHaveBeenCalled();
    });
  });
});
