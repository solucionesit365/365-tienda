import type { TCuadranteBackend } from "@/interfaces/Cuadrante.interface";
import { DateTime, type WeekdayNumbers } from "luxon";

function getDayOfWeek(dateStr: string) {
  return DateTime.fromISO(dateStr).weekday;
}

export function estructurarTurnos(arrayTurnos: TCuadranteBackend[]) {
  // Agrupa los turnos por trabajador
  const groupedByWorker: Record<TCuadranteBackend["idTrabajador"], TCuadranteBackend[]> =
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
        const foundTurnos = workerTurnos.filter((turno) => getDayOfWeek(turno.inicio) === day);
        if (foundTurnos.length) return foundTurnos;

        // Si no existen turnos para el día, crea un turno "vacío"
        const dateStr = DateTime.fromISO(workerTurnos[0]!.inicio)
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
      nombre: workerTurnos[0].nombre,
      turnos: weekTurnos,
    };
  });
  return structuredByWeek;
}
