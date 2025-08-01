// import type { DateTime } from "luxon";

// import type { TPlantilla } from "@/components/ModalCrearCuadranteNew.vue";
import type { DateTime } from "luxon";

// export interface TTurnoFrontend {
//   id: string;
//   inicio: string; // ISO string
//   final: string; // ISO string
//   tiendaId: number;
//   idTrabajador: number;
//   borrable: boolean;
// }

export interface TTurnoFrontend {
  id: string;
  inicio: DateTime; // ISO string
  final: DateTime; // ISO string
  tiendaId: number | null;
  idTrabajador: number;
  borrable: boolean;
  // plantillaSelected?: TPlantilla;
}

export interface TTurnoBackend {
  id: string;
  inicio: string; // ISO string
  final: string; // ISO string
  tiendaId: number;
  idTrabajador: number;
  borrable: boolean;
}
