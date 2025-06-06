import type { TCuadranteBackend } from "@/interfaces/Cuadrante.interface";
import { axiosInstance } from "../axios/axios";

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


}
