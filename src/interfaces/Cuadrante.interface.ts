import type { DateTime } from "luxon";

export interface TCuadranteFrontend {
  _id: string;
  idTrabajador: number;
  idPlan: string;
  idTienda: number;
  inicio: DateTime;
  final: DateTime;
  nombre: string;
  totalHoras: number;
  horasContrato: number;
  ausencia: TAusenciaMin;
  bolsaHorasInicial: number;
  borrable?: boolean;
  dni?: string;
}

export interface TCuadranteBackend {
  _id: string;
  idTrabajador: number;
  idPlan: string;
  idTienda: number;
  inicio: string;
  final: string;
  nombre: string;
  totalHoras: number;
  horasContrato: number;
  ausencia: TAusenciaMin | null;
  bolsaHorasInicial: number;
  borrable?: boolean;
  dni?: string;
}

type TAusenciaMin = {
  tipo: TiposAusencia;
  horas?: number;
  completa: boolean;
  idAusencia: string;
};

export type TiposAusencia =
  | "BAJA"
  | "PERMISO MATERNIDAD/PATERNIDAD"
  | "DIA_PERSONAL"
  | "VACACIONES"
  | "SANCIÓN"
  | "ABSENTISMO"
  | "REM"
  | "HORAS_JUSTIFICADAS";
