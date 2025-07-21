import type { DateTime } from "luxon";

export interface AusenciaBackendOLD {
  _id: string;
  idUsuario: number;
  nombre: string;
  dni?: string;
  tipo: TiposAusencia;
  fechaInicio: string;
  fechaFinal?: string;
  fechaRevision?: string;
  comentario: string;
  enviado?: boolean;
  completa: boolean;
  horas?: number;
  tienda?: string;
  horasContrato?: number;
}

export interface AusenciaFrontendOLD {
  _id: string;
  idUsuario: number;
  nombre: string;
  dni?: string;
  tipo: TiposAusencia;
  fechaInicio: DateTime;
  fechaFinal?: DateTime;
  fechaRevision?: DateTime;
  comentario: string;
  enviado?: boolean;
  completa: boolean;
  horas?: number;
  tienda?: string;
  horasContrato?: number;
}

export type TiposAusencia =
  | "BAJA"
  | "PERMISO MATERNIDAD/PATERNIDAD"
  | "DIA_PERSONAL"
  | "VACACIONES"
  | "SANCIÓN"
  | "ABSENTISMO"
  | "REM"
  | "HORAS_JUSTIFICADAS";
