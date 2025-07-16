import type {
  IAusenciaCompletaBackend,
  IAusenciaParcialBackend,
  IAusenciaCompletaFrontend,
  IAusenciaParcialFrontend,
} from "@/interfaces/Ausencia.interface";
import { axiosInstance } from "../axios/axios";
import { DateTime } from "luxon";

export class Ausencia {
  static async getAusencias(
    year: number,
  ): Promise<(IAusenciaCompletaFrontend | IAusenciaParcialFrontend)[]> {
    // 1) Le decimos a axios que esperamos un array plano:
    const { data: ausenciasBackend } = await axiosInstance.get<
      (IAusenciaCompletaBackend | IAusenciaParcialBackend)[]
    >("get-ausencias", {
      params: { year },
    });

    // 2) Type guard para diferenciar completa / parcial
    function isCompleta(
      a: IAusenciaCompletaBackend | IAusenciaParcialBackend,
    ): a is IAusenciaCompletaBackend {
      return "fechaRevision" in a;
    }

    // 3) Mapeamos uno a uno, sin hacer spread, para no arrastrar strings de fecha
    return ausenciasBackend.map((a) => {
      if (isCompleta(a)) {
        // === Ausencia completa ===
        const {
          id,
          tipo,
          comentario,
          idTrabajador,
          fechaInicio: fIni,
          fechaFinal: fFin,
          fechaRevision: fRev,
        } = a;
        return {
          id,
          tipo,
          comentario,
          idTrabajador,
          fechaInicio: DateTime.fromISO(fIni),
          fechaFinal: fFin ? DateTime.fromISO(fFin) : null,
          fechaRevision: fRev ? DateTime.fromISO(fRev) : null,
        };
      } else {
        // === Ausencia parcial ===
        const { id, tipo, comentario, idTrabajador, fechaInicio: fIni, fechaFinal: fFin } = a;
        return {
          id,
          tipo,
          comentario,
          idTrabajador,
          fechaInicio: DateTime.fromISO(fIni),
          fechaFinal: DateTime.fromISO(fFin),
        };
      }
    });
  }
}
