import { axiosInstance } from "../axios/axios";
import Swal from "sweetalert2";
import { DateTime } from "luxon";
import type { TTurnoBackend, TTurnoFrontend } from "@/interfaces/Turno.interface";

export class Turno {
  /**
   * Turnos de todo el equipo de la tienda de la coordinadora x
   */
  static async getTurnosEquipoCoordinadoraDeLaTienda(
    idTienda: number,
    fecha: DateTime,
  ): Promise<TTurnoFrontend[]> {
    try {
      const { data }: { data: TTurnoBackend[] } = await axiosInstance.get(
        "GetTurnosEquipoCoordinadora",
        {
          params: {
            idTienda,
            fecha: fecha.toISO(),
          },
        },
      );

      return this.convertBackendToFrontendData(data);
    } catch (error) {
      console.log(error);
      Swal.fire("Oops...", "Ha habido un error", "error");
      return [];
    }
  }

  /**
   * Turnos individuales del trabajador x de la semana de la fecha x
   */
  static async getTurnosIndividuales(
    fecha: DateTime,
    idTrabajador: number,
  ): Promise<TTurnoFrontend[]> {
    try {
      const { data }: { data: TTurnoBackend[] } = await axiosInstance.get(
        "get-turnos-semanales-trabajador",
        {
          params: {
            idTrabajador,
            fecha: fecha.toISO(),
          },
        },
      );

      return this.convertBackendToFrontendData(data);
    } catch (error) {
      console.log(error);
      Swal.fire("Oops...", "Ha habido un error", "error");
      return [];
    }
  }

  /**
   * Convierte a formato frontend los turnos del backend
   */
  private static convertBackendToFrontendData(turnos: TTurnoBackend[]): TTurnoFrontend[] {
    if (turnos && turnos.length > 0) {
      const turnosParaFrontend = turnos.map((turno: any) => {
        return {
          ...turno,
          inicio: DateTime.fromISO(turno.inicio),
          final: DateTime.fromISO(turno.final),
          // Preservar la información del trabajador si existe
          trabajador: turno.trabajador,
        };
      });

      return turnosParaFrontend;
    } else return [];
  }
}
