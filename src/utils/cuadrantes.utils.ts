import { DateTime } from 'luxon'

/**
 * Formatea un DateTime a formato de hora HH:mm
 */
export function formatHour(date: DateTime): string {
  return date.toFormat('HH:mm')
}

/**
 * Calcula la duración en horas entre dos fechas
 */
export function calcularDuracionHoras(inicio: DateTime, final: DateTime): number {
  return final.diff(inicio, 'hours').hours
}

/**
 * Calcula el ancho de un turno en porcentaje (0-100)
 */
export function calcularAnchoTurno(inicio: DateTime, final: DateTime): number {
  const duracionHoras = final.diff(inicio, 'hours').hours
  return (duracionHoras / 24) * 100
}

/**
 * Calcula la posición de inicio de un turno en porcentaje (0-100)
 */
export function calcularPosicionTurno(inicio: DateTime): number {
  const horaInicio = inicio.hour + inicio.minute / 60
  return (horaInicio / 24) * 100
}

/**
 * Obtiene el rango de semana formateado
 */
export function getWeekRange(date: DateTime): string {
  const startOfWeek = date.startOf('week')
  const endOfWeek = date.endOf('week')

  return `${startOfWeek.toFormat('d')} - ${endOfWeek.toFormat('d')} de ${startOfWeek.toFormat('MMMM', { locale: 'es' })}`
}

/**
 * Filtra trabajadores por texto de búsqueda
 */
export function filtrarTrabajadores<T extends { nombre: string; apellidos: string }>(
  trabajadores: T[],
  searchText: string
): T[] {
  if (!searchText.trim()) {
    return trabajadores
  }

  const searchLower = searchText.toLowerCase()
  return trabajadores.filter((trabajador) => {
    const nombreCompleto = `${trabajador.nombre} ${trabajador.apellidos}`.toLowerCase()
    return nombreCompleto.includes(searchLower)
  })
}

/**
 * Verifica si una fecha está dentro del rango de edición permitido (últimas 3 semanas)
 */
export function puedeEditarFecha(fecha: DateTime): boolean {
  const hacesTresSemanas = DateTime.now().startOf('day').minus({ weeks: 3 })
  return fecha >= hacesTresSemanas
}

/**
 * Calcula el número de trabajadores en un intervalo de tiempo
 */
export function contarTrabajadoresEnIntervalo(
  turnos: Array<{ inicio: DateTime; final: DateTime }>,
  intervaloInicio: DateTime,
  intervaloFinal: DateTime
): number {
  return turnos.filter((turno) => {
    // Verificar si hay solapamiento
    return turno.inicio < intervaloFinal && turno.final > intervaloInicio
  }).length
}

/**
 * Obtiene la clase CSS según el nivel de cobertura
 */
export function getHourCoverageClass(count: number): string {
  if (count === 0) return 'no-coverage'
  if (count === 1) return 'low-coverage'
  if (count <= 3) return 'medium-coverage'
  return 'high-coverage'
}

/**
 * Genera el tooltip para un intervalo horario
 */
export function getHourTooltip(
  dayName: string,
  intervalIndex: number,
  workerCount: number
): string {
  const hour = Math.floor(intervalIndex / 4)
  const minutes = (intervalIndex % 4) * 15
  const nextHour = Math.floor((intervalIndex + 1) / 4)
  const nextMinutes = ((intervalIndex + 1) % 4) * 15

  const timeStart = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  const timeEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`
  const timeRange = `${timeStart} - ${timeEnd}`

  if (workerCount === 0) {
    return `${dayName} ${timeRange}: Sin cobertura`
  }

  return `${dayName} ${timeRange}: ${workerCount} trabajador${workerCount > 1 ? 'es' : ''}`
}

/**
 * Formatea la diferencia de minutos a formato "Xh Ym"
 */
export function formatearDiferenciaHoras(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const mins = Math.round(minutos % 60)
  return `${horas}h ${mins}m`
}

/**
 * Verifica si una fecha está en un periodo de ausencia
 */
export function estaDiaEnPeriodoAusencia(
  fecha: DateTime,
  ausencias: Array<{ fechaInicio: DateTime; fechaFinal: DateTime | null }>
): boolean {
  return ausencias.some((ausencia) => {
    const inicioAusencia = ausencia.fechaInicio.startOf('day')
    const finAusencia = ausencia.fechaFinal
      ? ausencia.fechaFinal.endOf('day')
      : inicioAusencia.endOf('day')

    return fecha >= inicioAusencia && fecha <= finAusencia
  })
}
