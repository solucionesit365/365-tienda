import type { TCuadranteBackend, TCuadranteFrontend } from "@/interfaces/Cuadrante.interface";
import { axiosInstance } from "../axios/axios";
import Swal from "sweetalert2";
import { DateTime } from "luxon";

export class Cuadrante {
  static async getCuadrantes(fechaISO: string, idTienda: number) {
    const resTurnos = await axiosInstance.get("cuadrantes", {
      params: {
        fecha: fechaISO,
        idTienda: idTienda,
      },
    });

    if (!resTurnos.data.ok) throw Error("No se ha podido cargar el cuadrante");

    return resTurnos.data.data as TCuadranteBackend[];
  }

  static async getCuadrantesTiendaSemanal(fechaISO: string) {
    try {
      const resCuadrantes = await axiosInstance.get("cuadrantes/getTiendasUnaSemana", {
        params: {
          fecha: fechaISO,
        },
      });

      return resCuadrantes.data as TCuadranteBackend[];
    } catch (error) {
      console.error("Error al obtener los cuadrantes por semana:", error);
      Swal.fire("Oops!", "Ha habido un error", "error");
    }
  }

  // Devolverá el cuadrante de la semana de "fecha"
  static async getCuadranteIndividual(
    fecha: DateTime,
    idTrabajador: number,
  ): Promise<TCuadranteFrontend[]> {
    try {
      const resCuadrantes: { data: TCuadranteBackend[] } = await axiosInstance.get(
        "cuadrantes/individual",
        {
          params: {
            fecha: fecha.toJSDate().toISOString(),
            idTrabajador,
          },
        },
      );

      if (resCuadrantes.data && resCuadrantes.data.length === 0) return [];

      return resCuadrantes.data.map((turno: TCuadranteBackend) => ({
        ...turno,
        inicio: DateTime.fromISO(turno.inicio),
        final: DateTime.fromISO(turno.final),
      })) as TCuadranteFrontend[];
    } catch (error) {
      console.log(error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response &&
        (error as any).response.status === 401
      ) {
        Swal.fire("Oops...", "No tienes permisos para ver este cuadrante", "error");
      } else Swal.fire("Oops...", "Ha habido un error", "error");
      return [];
    }
  }
}
