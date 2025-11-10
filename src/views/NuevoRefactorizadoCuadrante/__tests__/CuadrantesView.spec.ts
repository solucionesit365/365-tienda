import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { DateTime } from 'luxon'
import CuadrantesView from '../CuadrantesView.vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock de SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true, value: '1234' }),
  },
}))

// Mock del axiosInstance
vi.mock('@/components/axios/axiosInstance', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: true }),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock de Turno
vi.mock('@/components/kernel/Turno', () => ({
  default: {
    getTurnosSemanales: vi.fn().mockResolvedValue([]),
    getTurnosIndividuales: vi.fn().mockResolvedValue([]),
  },
}))

// Mock de Trabajador
vi.mock('@/components/kernel/Trabajador', () => ({
  default: {
    getTrabajadoresTienda: vi.fn().mockResolvedValue([
      {
        id: 1,
        nombre: 'Juan',
        apellidos: 'Pérez',
        idTienda: 1,
      },
      {
        id: 2,
        nombre: 'María',
        apellidos: 'García',
        idTienda: 1,
      },
    ]),
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
    setTiendas: vi.fn(),
  }),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: {
      id: 1,
      idSql: 123,
      nombre: 'Usuario Test',
      coordinadoraDeLaTienda: { id: 1, nombre: 'Tienda Test 1' },
      idTienda: 1,
    },
    getRoles: [{ name: 'User' }],
    hasRole: vi.fn((role: string) => role !== 'Super_Admin'),
    hasPermission: vi.fn().mockReturnValue(false),
  }),
}))

describe('CuadrantesView.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Renderizado inicial', () => {
    it('debe renderizarse correctamente', () => {
      wrapper = mount(CuadrantesView, {
        global: {
          stubs: {
            Teleport: true,
            ModalEditarTurnoIndividual: true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('debe mostrar un título h2', () => {
      wrapper = mount(CuadrantesView, {
        global: {
          stubs: {
            Teleport: true,
            ModalEditarTurnoIndividual: true,
          },
        },
      })

      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text().length).toBeGreaterThan(0)
    })

    it('debe tener el switch de edición', () => {
      wrapper = mount(CuadrantesView, {
        global: {
          stubs: {
            Teleport: true,
            ModalEditarTurnoIndividual: true,
          },
        },
      })

      const switchElement = wrapper.find('#switchEdicion')
      expect(switchElement.exists()).toBe(true)
    })

    it('debe renderizar el input de búsqueda', () => {
      wrapper = mount(CuadrantesView, {
        global: {
          stubs: {
            Teleport: true,
            ModalEditarTurnoIndividual: true,
          },
        },
      })

      const searchInput = wrapper.find('input[type="text"]')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toContain('Buscar')
    })
  })

  describe('Botones de navegación', () => {
    beforeEach(() => {
      wrapper = mount(CuadrantesView, {
        global: {
          stubs: {
            Teleport: true,
            ModalEditarTurnoIndividual: true,
          },
        },
      })
    })

    it('debe tener botones de navegación de semana', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('debe tener un componente ModalEditarTurnoIndividual', () => {
      const modal = wrapper.findComponent({ name: 'ModalEditarTurnoIndividual' })
      expect(modal.exists()).toBe(true)
    })
  })

  describe('Estructura del componente', () => {
    beforeEach(() => {
      wrapper = mount(CuadrantesView, {
        global: {
          stubs: {
            Teleport: true,
            ModalEditarTurnoIndividual: true,
          },
        },
      })
    })

    it('debe renderizar con estructura válida', () => {
      expect(wrapper.html()).toBeTruthy()
      expect(wrapper.html().length).toBeGreaterThan(0)
    })
  })
})
