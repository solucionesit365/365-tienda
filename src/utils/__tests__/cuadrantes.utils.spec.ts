import { describe, it, expect } from 'vitest'
import { DateTime } from 'luxon'
import {
  formatHour,
  calcularDuracionHoras,
  calcularAnchoTurno,
  calcularPosicionTurno,
  getWeekRange,
  filtrarTrabajadores,
  puedeEditarFecha,
  contarTrabajadoresEnIntervalo,
  getHourCoverageClass,
  getHourTooltip,
  formatearDiferenciaHoras,
  estaDiaEnPeriodoAusencia,
} from '../cuadrantes.utils'

describe('cuadrantes.utils', () => {
  describe('formatHour', () => {
    it('debe formatear correctamente una hora', () => {
      const fecha = DateTime.fromISO('2025-01-15T14:30:00')
      expect(formatHour(fecha)).toBe('14:30')
    })

    it('debe formatear correctamente la medianoche', () => {
      const fecha = DateTime.fromISO('2025-01-15T00:00:00')
      expect(formatHour(fecha)).toBe('00:00')
    })

    it('debe formatear correctamente las horas de la mañana', () => {
      const fecha = DateTime.fromISO('2025-01-15T09:05:00')
      expect(formatHour(fecha)).toBe('09:05')
    })
  })

  describe('calcularDuracionHoras', () => {
    it('debe calcular correctamente la duración de 8 horas', () => {
      const inicio = DateTime.fromISO('2025-01-15T09:00:00')
      const final = DateTime.fromISO('2025-01-15T17:00:00')
      expect(calcularDuracionHoras(inicio, final)).toBe(8)
    })

    it('debe calcular correctamente la duración de media hora', () => {
      const inicio = DateTime.fromISO('2025-01-15T09:00:00')
      const final = DateTime.fromISO('2025-01-15T09:30:00')
      expect(calcularDuracionHoras(inicio, final)).toBe(0.5)
    })

    it('debe retornar 0 para mismo inicio y fin', () => {
      const inicio = DateTime.fromISO('2025-01-15T09:00:00')
      const final = DateTime.fromISO('2025-01-15T09:00:00')
      expect(calcularDuracionHoras(inicio, final)).toBe(0)
    })

    it('debe manejar turnos que cruzan medianoche', () => {
      const inicio = DateTime.fromISO('2025-01-15T22:00:00')
      const final = DateTime.fromISO('2025-01-16T02:00:00')
      expect(calcularDuracionHoras(inicio, final)).toBe(4)
    })
  })

  describe('calcularAnchoTurno', () => {
    it('debe calcular correctamente el ancho de un turno de 4 horas', () => {
      const inicio = DateTime.fromISO('2025-01-15T09:00:00')
      const final = DateTime.fromISO('2025-01-15T13:00:00')
      const ancho = calcularAnchoTurno(inicio, final)
      expect(ancho).toBeCloseTo(16.67, 1)
    })

    it('debe calcular correctamente el ancho de un turno de 8 horas', () => {
      const inicio = DateTime.fromISO('2025-01-15T09:00:00')
      const final = DateTime.fromISO('2025-01-15T17:00:00')
      const ancho = calcularAnchoTurno(inicio, final)
      expect(ancho).toBeCloseTo(33.33, 1)
    })

    it('debe calcular correctamente el ancho de un turno de 24 horas', () => {
      const inicio = DateTime.fromISO('2025-01-15T00:00:00')
      const final = DateTime.fromISO('2025-01-16T00:00:00')
      expect(calcularAnchoTurno(inicio, final)).toBe(100)
    })

    it('debe calcular correctamente el ancho de un turno de 1 hora', () => {
      const inicio = DateTime.fromISO('2025-01-15T09:00:00')
      const final = DateTime.fromISO('2025-01-15T10:00:00')
      const ancho = calcularAnchoTurno(inicio, final)
      expect(ancho).toBeCloseTo(4.17, 1)
    })
  })

  describe('calcularPosicionTurno', () => {
    it('debe calcular correctamente la posición a las 9:00', () => {
      const inicio = DateTime.fromISO('2025-01-15T09:00:00')
      expect(calcularPosicionTurno(inicio)).toBeCloseTo(37.5, 1)
    })

    it('debe calcular correctamente la posición a medianoche', () => {
      const inicio = DateTime.fromISO('2025-01-15T00:00:00')
      expect(calcularPosicionTurno(inicio)).toBe(0)
    })

    it('debe calcular correctamente la posición a mediodía', () => {
      const inicio = DateTime.fromISO('2025-01-15T12:00:00')
      expect(calcularPosicionTurno(inicio)).toBe(50)
    })

    it('debe calcular correctamente la posición a las 18:30', () => {
      const inicio = DateTime.fromISO('2025-01-15T18:30:00')
      const posicion = calcularPosicionTurno(inicio)
      expect(posicion).toBeCloseTo(77.08, 1)
    })
  })

  describe('getWeekRange', () => {
    it('debe formatear correctamente el rango de semana', () => {
      const fecha = DateTime.fromISO('2025-01-15')
      const range = getWeekRange(fecha)
      expect(range).toContain('-')
      expect(range).toContain('de')
    })

    it('debe incluir el mes en el rango', () => {
      const fecha = DateTime.fromISO('2025-01-15')
      const range = getWeekRange(fecha)
      expect(range.toLowerCase()).toContain('enero')
    })
  })

  describe('filtrarTrabajadores', () => {
    const trabajadores = [
      { id: 1, nombre: 'Juan', apellidos: 'Pérez' },
      { id: 2, nombre: 'María', apellidos: 'García' },
      { id: 3, nombre: 'Pedro', apellidos: 'Martínez' },
      { id: 4, nombre: 'Ana', apellidos: 'López' },
    ]

    it('debe retornar todos los trabajadores con búsqueda vacía', () => {
      expect(filtrarTrabajadores(trabajadores, '')).toHaveLength(4)
    })

    it('debe filtrar por nombre correctamente', () => {
      const resultado = filtrarTrabajadores(trabajadores, 'Juan')
      expect(resultado).toHaveLength(1)
      expect(resultado[0].nombre).toBe('Juan')
    })

    it('debe filtrar por apellido correctamente', () => {
      const resultado = filtrarTrabajadores(trabajadores, 'García')
      expect(resultado).toHaveLength(1)
      expect(resultado[0].apellidos).toBe('García')
    })

    it('debe ser case-insensitive', () => {
      const resultado = filtrarTrabajadores(trabajadores, 'juan')
      expect(resultado).toHaveLength(1)
      expect(resultado[0].nombre).toBe('Juan')
    })

    it('debe buscar en nombre completo', () => {
      const resultado = filtrarTrabajadores(trabajadores, 'ría garc')
      expect(resultado).toHaveLength(1)
      expect(resultado[0].nombre).toBe('María')
    })

    it('debe retornar array vacío si no hay coincidencias', () => {
      expect(filtrarTrabajadores(trabajadores, 'NoExiste')).toHaveLength(0)
    })

    it('debe ignorar espacios en blanco', () => {
      expect(filtrarTrabajadores(trabajadores, '   ')).toHaveLength(4)
    })
  })

  describe('puedeEditarFecha', () => {
    it('debe permitir editar fecha de hoy', () => {
      const hoy = DateTime.now()
      expect(puedeEditarFecha(hoy)).toBe(true)
    })

    it('debe permitir editar fecha de hace 2 semanas', () => {
      const haceDos = DateTime.now().minus({ weeks: 2 })
      expect(puedeEditarFecha(haceDos)).toBe(true)
    })

    it('debe permitir editar fecha de hace exactamente 3 semanas', () => {
      const hacesTres = DateTime.now().startOf('day').minus({ weeks: 3 })
      expect(puedeEditarFecha(hacesTres)).toBe(true)
    })

    it('no debe permitir editar fecha de hace más de 3 semanas', () => {
      const haceCuatro = DateTime.now().minus({ weeks: 4 })
      expect(puedeEditarFecha(haceCuatro)).toBe(false)
    })

    it('debe permitir editar fechas futuras', () => {
      const futuro = DateTime.now().plus({ weeks: 1 })
      expect(puedeEditarFecha(futuro)).toBe(true)
    })
  })

  describe('contarTrabajadoresEnIntervalo', () => {
    const turnos = [
      {
        inicio: DateTime.fromISO('2025-01-15T09:00:00'),
        final: DateTime.fromISO('2025-01-15T17:00:00'),
      },
      {
        inicio: DateTime.fromISO('2025-01-15T14:00:00'),
        final: DateTime.fromISO('2025-01-15T22:00:00'),
      },
      {
        inicio: DateTime.fromISO('2025-01-15T22:00:00'),
        final: DateTime.fromISO('2025-01-16T06:00:00'),
      },
    ]

    it('debe contar correctamente trabajadores en intervalo de la mañana', () => {
      const inicio = DateTime.fromISO('2025-01-15T10:00:00')
      const final = DateTime.fromISO('2025-01-15T11:00:00')
      expect(contarTrabajadoresEnIntervalo(turnos, inicio, final)).toBe(1)
    })

    it('debe contar correctamente trabajadores en intervalo con solapamiento', () => {
      const inicio = DateTime.fromISO('2025-01-15T15:00:00')
      const final = DateTime.fromISO('2025-01-15T16:00:00')
      expect(contarTrabajadoresEnIntervalo(turnos, inicio, final)).toBe(2)
    })

    it('debe retornar 0 si no hay trabajadores en el intervalo', () => {
      const inicio = DateTime.fromISO('2025-01-15T06:00:00')
      const final = DateTime.fromISO('2025-01-15T07:00:00')
      expect(contarTrabajadoresEnIntervalo(turnos, inicio, final)).toBe(0)
    })

    it('debe contar trabajadores en intervalo nocturno', () => {
      const inicio = DateTime.fromISO('2025-01-15T23:00:00')
      const final = DateTime.fromISO('2025-01-16T00:00:00')
      expect(contarTrabajadoresEnIntervalo(turnos, inicio, final)).toBe(1)
    })
  })

  describe('getHourCoverageClass', () => {
    it('debe retornar "no-coverage" para 0 trabajadores', () => {
      expect(getHourCoverageClass(0)).toBe('no-coverage')
    })

    it('debe retornar "low-coverage" para 1 trabajador', () => {
      expect(getHourCoverageClass(1)).toBe('low-coverage')
    })

    it('debe retornar "medium-coverage" para 2 trabajadores', () => {
      expect(getHourCoverageClass(2)).toBe('medium-coverage')
    })

    it('debe retornar "medium-coverage" para 3 trabajadores', () => {
      expect(getHourCoverageClass(3)).toBe('medium-coverage')
    })

    it('debe retornar "high-coverage" para 4 trabajadores', () => {
      expect(getHourCoverageClass(4)).toBe('high-coverage')
    })

    it('debe retornar "high-coverage" para más de 4 trabajadores', () => {
      expect(getHourCoverageClass(10)).toBe('high-coverage')
    })
  })

  describe('getHourTooltip', () => {
    it('debe generar tooltip correcto para intervalo con trabajadores', () => {
      const tooltip = getHourTooltip('lunes', 36, 2)
      expect(tooltip).toContain('lunes')
      expect(tooltip).toContain('09:00')
      expect(tooltip).toContain('2 trabajadores')
    })

    it('debe generar tooltip correcto para intervalo sin trabajadores', () => {
      const tooltip = getHourTooltip('martes', 40, 0)
      expect(tooltip).toContain('martes')
      expect(tooltip).toContain('Sin cobertura')
    })

    it('debe usar singular para 1 trabajador', () => {
      const tooltip = getHourTooltip('miércoles', 50, 1)
      expect(tooltip).toContain('1 trabajador')
      expect(tooltip).not.toContain('trabajadores')
    })

    it('debe formatear correctamente el intervalo de medianoche', () => {
      const tooltip = getHourTooltip('jueves', 0, 2)
      expect(tooltip).toContain('00:00')
      expect(tooltip).toContain('00:15')
    })

    it('debe formatear correctamente el intervalo de mediodía', () => {
      const tooltip = getHourTooltip('viernes', 48, 3)
      expect(tooltip).toContain('12:00')
      expect(tooltip).toContain('12:15')
    })
  })

  describe('formatearDiferenciaHoras', () => {
    it('debe formatear correctamente 0 minutos', () => {
      expect(formatearDiferenciaHoras(0)).toBe('0h 0m')
    })

    it('debe formatear correctamente 30 minutos', () => {
      expect(formatearDiferenciaHoras(30)).toBe('0h 30m')
    })

    it('debe formatear correctamente 60 minutos', () => {
      expect(formatearDiferenciaHoras(60)).toBe('1h 0m')
    })

    it('debe formatear correctamente 125 minutos', () => {
      expect(formatearDiferenciaHoras(125)).toBe('2h 5m')
    })

    it('debe formatear correctamente 480 minutos (8 horas)', () => {
      expect(formatearDiferenciaHoras(480)).toBe('8h 0m')
    })

    it('debe redondear correctamente los minutos', () => {
      expect(formatearDiferenciaHoras(65.6)).toBe('1h 6m')
    })
  })

  describe('estaDiaEnPeriodoAusencia', () => {
    const hoy = DateTime.fromISO('2025-01-15')

    it('debe detectar ausencia de un solo día', () => {
      const ausencias = [
        {
          fechaInicio: hoy,
          fechaFinal: hoy,
        },
      ]
      expect(estaDiaEnPeriodoAusencia(hoy, ausencias)).toBe(true)
    })

    it('debe detectar ausencia en rango de varios días', () => {
      const ausencias = [
        {
          fechaInicio: hoy.minus({ days: 2 }),
          fechaFinal: hoy.plus({ days: 2 }),
        },
      ]
      expect(estaDiaEnPeriodoAusencia(hoy, ausencias)).toBe(true)
    })

    it('debe detectar ausencia al inicio del periodo', () => {
      const ausencias = [
        {
          fechaInicio: hoy,
          fechaFinal: hoy.plus({ days: 5 }),
        },
      ]
      expect(estaDiaEnPeriodoAusencia(hoy, ausencias)).toBe(true)
    })

    it('debe detectar ausencia al final del periodo', () => {
      const ausencias = [
        {
          fechaInicio: hoy.minus({ days: 5 }),
          fechaFinal: hoy,
        },
      ]
      expect(estaDiaEnPeriodoAusencia(hoy, ausencias)).toBe(true)
    })

    it('no debe detectar ausencia fuera del periodo', () => {
      const ausencias = [
        {
          fechaInicio: hoy.minus({ days: 10 }),
          fechaFinal: hoy.minus({ days: 5 }),
        },
      ]
      expect(estaDiaEnPeriodoAusencia(hoy, ausencias)).toBe(false)
    })

    it('debe manejar ausencias sin fecha final', () => {
      const ausencias = [
        {
          fechaInicio: hoy,
          fechaFinal: null,
        },
      ]
      expect(estaDiaEnPeriodoAusencia(hoy, ausencias)).toBe(true)
    })

    it('no debe detectar ausencia si array está vacío', () => {
      expect(estaDiaEnPeriodoAusencia(hoy, [])).toBe(false)
    })

    it('debe manejar múltiples ausencias', () => {
      const ausencias = [
        {
          fechaInicio: hoy.minus({ days: 10 }),
          fechaFinal: hoy.minus({ days: 8 }),
        },
        {
          fechaInicio: hoy.minus({ days: 2 }),
          fechaFinal: hoy.plus({ days: 2 }),
        },
        {
          fechaInicio: hoy.plus({ days: 10 }),
          fechaFinal: hoy.plus({ days: 12 }),
        },
      ]
      expect(estaDiaEnPeriodoAusencia(hoy, ausencias)).toBe(true)
    })
  })
})
