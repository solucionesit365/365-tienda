// import type { DateTime } from "luxon";

// export interface TTurnoFrontend {
//   id: string;
//   inicio: string; // ISO string
//   final: string; // ISO string
//   tiendaId: number;
//   idTrabajador: number;
//   borrable: boolean;
// }

export interface TTurnoBackend {
  id: string;
  inicio: string; // ISO string
  final: string; // ISO string
  tiendaId: number;
  idTrabajador: number;
  borrable: boolean;
}
