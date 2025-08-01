import type { TTurnoFrontend } from "@/interfaces/Turno.interface";
import { DateTime, type WeekdayNumbers } from "luxon";

function getDayOfWeek(dateStr: string) {
  return DateTime.fromISO(dateStr).weekday;
}

export function estructurarTurnos(arrayTurnos: TTurnoFrontend[]) {
  // Agrupa los turnos por trabajador
  const groupedByWorker: Record<TTurnoFrontend["idTrabajador"], TTurnoFrontend[]> =
    arrayTurnos.reduce((acc: any, turno) => {
      if (!acc[turno.idTrabajador]) {
        acc[turno.idTrabajador] = [];
      }
      acc[turno.idTrabajador].push(turno);
      return acc;
    }, {});

  // Estructura los turnos por días de la semana
  const structuredByWeek = Object.values(groupedByWorker).map((workerTurnos) => {
    const weekTurnos = Array(7)
      .fill(null)
      .map((_, dayIndex) => {
        const day = (dayIndex + 1) as WeekdayNumbers;
        // Busca los turnos para este día
        const foundTurnos = workerTurnos.filter(
          (turno) => getDayOfWeek(turno.inicio.toISO()!) === day,
        );
        if (foundTurnos.length) return foundTurnos;

        // Si no existen turnos para el día, crea un turno "vacío"
        const dateStr = DateTime.fromISO(workerTurnos[0]!.inicio.toISO()!)
          .set({ weekday: day })
          .toISO()!
          .split("T")[0];
        const emptyDateStr = dateStr + "T00:00:00.000Z";
        return [
          {
            ...workerTurnos[0], // toma los valores comunes de un turno existente
            inicio: emptyDateStr,
            final: emptyDateStr,
            totalHoras: 0,
            ausencia: null, // evita que el resto de la semana se printe como ausencia(si no son los dias concretos que estara ausente/vacaciones)
          },
        ];
      });

    return {
      idTrabajador: workerTurnos[0].idTrabajador,
      turnos: weekTurnos,
    };
  });
  return structuredByWeek;
}

// Nueva función para estructurar turnos con el formato del endpoint get-equipo-coordinadora-por-tienda
export function estructurarTurnosNuevoFormato(rawData: any[]) {
  // Primero verificar si es una lista de trabajadores o una lista de turnos
  const esTurno = rawData.length > 0 && rawData[0].hasOwnProperty("inicio");

  if (!esTurno) {
    // Si es una lista de trabajadores sin turnos, crear estructura vacía
    return rawData.map((trabajador) => {
      return {
        idTrabajador: trabajador.id,
        nombre: trabajador.nombreApellidos,
        turnos: Array(7)
          .fill(null)
          .map(() => []), // Array vacío para cada día
      };
    });
  }

  // Si son turnos, agrupar por trabajador
  const groupedByWorker: Record<number, any[]> = rawData.reduce((acc: any, turno) => {
    if (!acc[turno.idTrabajador]) {
      acc[turno.idTrabajador] = [];
    }
    acc[turno.idTrabajador].push(turno);
    return acc;
  }, {});

  // Estructura los turnos por días de la semana
  const structuredByWeek = Object.entries(groupedByWorker).map(([idTrabajador, workerTurnos]) => {
    const trabajador = workerTurnos[0].Trabajador;

    const weekTurnos = Array(7)
      .fill(null)
      .map((_, dayIndex) => {
        const day = (dayIndex + 1) as WeekdayNumbers;
        // Busca los turnos para este día
        const foundTurnos = workerTurnos.filter((turno) => getDayOfWeek(turno.inicio) === day);

        if (foundTurnos.length) {
          return foundTurnos.map((turno) => ({
            ...turno,
            inicio: DateTime.fromISO(turno.inicio),
            final: DateTime.fromISO(turno.final),
            totalHoras:
              turno.inicio === turno.final
                ? 0
                : DateTime.fromISO(turno.final).diff(DateTime.fromISO(turno.inicio), "hours").hours,
            horasContrato: trabajador.contratos?.[0]?.horasContrato || 0,
            ausencia: turno.inicio === turno.final ? "DESCANSO" : null,
          }));
        }

        // Si no existen turnos para el día, crear turno vacío
        return [];
      });

    return {
      idTrabajador: parseInt(idTrabajador),
      nombre: trabajador.nombreApellidos,
      turnos: weekTurnos,
    };
  });

  return structuredByWeek;
}

// Función para estructurar turnos con información del trabajador incluida
export function estructurarTurnosConTrabajador(arrayTurnos: any[]) {
  // Agrupa los turnos por trabajador
  const groupedByWorker: Record<number, any[]> = arrayTurnos.reduce((acc: any, turno) => {
    if (!acc[turno.idTrabajador]) {
      acc[turno.idTrabajador] = [];
    }
    acc[turno.idTrabajador].push(turno);
    return acc;
  }, {});

  // Estructura los turnos por días de la semana
  const structuredByWeek = Object.values(groupedByWorker).map((workerTurnos) => {
    // Obtener el nombre del trabajador si está disponible - usar 'trabajador' (minúscula) como viene del backend
    const nombreTrabajador =
      workerTurnos[0].trabajador?.nombreApellidos || 
      workerTurnos[0].Trabajador?.nombreApellidos || 
      workerTurnos[0].nombre || 
      "Sin nombre";

    const weekTurnos = Array(7)
      .fill(null)
      .map((_, dayIndex) => {
        const day = (dayIndex + 1) as WeekdayNumbers;
        // Busca los turnos para este día
        const foundTurnos = workerTurnos.filter((turno) => {
          const turnoDate =
            typeof turno.inicio === "string" ? DateTime.fromISO(turno.inicio) : turno.inicio;
          return turnoDate.weekday === day;
        });

        if (foundTurnos.length) {
          return foundTurnos.map((turno) => {
            const inicio =
              typeof turno.inicio === "string" ? DateTime.fromISO(turno.inicio) : turno.inicio;
            const final =
              typeof turno.final === "string" ? DateTime.fromISO(turno.final) : turno.final;

            return {
              ...turno,
              inicio,
              final,
              totalHoras:
                !inicio.isValid || !final.isValid
                  ? 0
                  : inicio.toISO() === final.toISO()
                    ? 0
                    : final.diff(inicio, "hours").hours,
              horasContrato:
                turno.trabajador?.contratos?.[0]?.horasContrato || 
                turno.Trabajador?.contratos?.[0]?.horasContrato || 
                turno.horasContrato || 0,
              ausencia:
                !inicio.isValid || !final.isValid
                  ? null
                  : inicio.toISO() === final.toISO()
                    ? "DESCANSO"
                    : null,
            };
          });
        }

        // Si no existen turnos para el día, devolver array vacío
        return [];
      });

    return {
      idTrabajador: workerTurnos[0].idTrabajador,
      nombre: nombreTrabajador,
      turnos: weekTurnos,
    };
  });
  return structuredByWeek;
}
