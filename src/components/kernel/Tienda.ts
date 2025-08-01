import type { TTienda } from "@/interfaces/Tienda.interface";
import { axiosInstance } from "../axios/axios";
import Swal from "sweetalert2";

export class Tienda {
  static async getTiendas() {
    try {
      const resTurnos = await axiosInstance.get("tiendas");
      return resTurnos.data as TTienda[];
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No se ha podido obtener el listado de tiendas", "error");
    }
  }
}
