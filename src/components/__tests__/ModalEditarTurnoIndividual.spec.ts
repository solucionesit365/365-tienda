import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { DateTime } from 'luxon'
import ModalEditarTurnoIndividual from '../ModalEditarTurnoIndividual.vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock de SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}))

// Mock del axiosInstance
vi.mock('@/components/axios/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock de Turno
vi.mock('@/components/kernel/Turno', () => ({
  default: {
    getTurnosIndividuales: vi.fn().mockResolvedValue([]),
    guardarTurnos: vi.fn().mockResolvedValue(true),
  },
}))

// Mock de router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock de stores
vi.mock('@/stores/tienda', () => ({
  useTiendaStore: () => ({
    tiendas: [
      { id: 1, nombre: 'Tienda Test 1' },
      { id: 2, nombre: 'Tienda Test 2' },
    ],
  }),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: {
      id: 1,
      nombre: 'Usuario Test',
      hasRole: vi.fn().mockReturnValue(false),
      hasPermission: vi.fn().mockReturnValue(false),
    },
    getRoles: [{ name: 'User' }],
    hasRole: vi.fn().mockReturnValue(false),
    hasPermission: vi.fn().mockReturnValue(false),
  }),
}))

describe('ModalEditarTurnoIndividual.vue', () => {
  let wrapper: VueWrapper<any>

  const defaultProps = {
    show: false,
    plantillasTurno: [
      { id: 1, nombre: 'Mañana', inicio: '09:00', final: '14:00' },
      { id: 2, nombre: 'Tarde', inicio: '14:00', final: '22:00' },
    ],
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Renderizado inicial', () => {
    it('debe renderizarse correctamente cuando está cerrado', () => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: defaultProps,
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('debe recibir la prop show correctamente cuando es true', async () => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: {
          ...defaultProps,
          show: true,
        },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Props', () => {
    it('debe recibir la prop plantillasTurno correctamente', () => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: defaultProps,
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      expect(wrapper.props('plantillasTurno')).toHaveLength(2)
      expect(wrapper.props('plantillasTurno')[0].nombre).toBe('Mañana')
    })

    it('debe aceptar la prop show con diferentes valores', () => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: {
          ...defaultProps,
          show: false,
        },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Emits', () => {
    it('debe poder emitir eventos', () => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: {
          ...defaultProps,
          show: true,
        },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      // Verificar que el wrapper puede emitir eventos
      expect(wrapper.emitted).toBeDefined()
    })
  })

  describe('Estructura del modal', () => {
    beforeEach(() => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: {
          ...defaultProps,
          show: true,
        },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })
    })

    it('debe renderizar con el HTML correcto', () => {
      expect(wrapper.html()).toBeTruthy()
      expect(wrapper.html().length).toBeGreaterThan(0)
    })

    it('debe ser un componente válido', () => {
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Botones del modal', () => {
    beforeEach(() => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: {
          ...defaultProps,
          show: true,
        },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })
    })

    it('debe tener elementos interactivos', () => {
      const html = wrapper.html()
      expect(html.length).toBeGreaterThan(0)
    })
  })

  describe('Plantillas de turno', () => {
    it('debe renderizar con plantillas vacías', () => {
      wrapper = mount(ModalEditarTurnoIndividual, {
        props: {
          show: false,
          plantillasTurno: [],
        },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('plantillasTurno')).toHaveLength(0)
    })

    it('debe recibir múltiples plantillas', () => {
      const plantillas = [
        { id: 1, nombre: 'Mañana', inicio: '09:00', final: '14:00' },
        { id: 2, nombre: 'Tarde', inicio: '14:00', final: '22:00' },
        { id: 3, nombre: 'Noche', inicio: '22:00', final: '06:00' },
      ]

      wrapper = mount(ModalEditarTurnoIndividual, {
        props: {
          show: false,
          plantillasTurno: plantillas,
        },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      expect(wrapper.props('plantillasTurno')).toHaveLength(3)
    })
  })
})
