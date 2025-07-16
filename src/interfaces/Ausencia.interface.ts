import type { DateTime } from "luxon";

export type TipoAusenciaCompleta =
  | "ABSENTISMO"
  | "BAJA"
  | "PERMISO_MATERNIDAD_PATERNIDAD"
  | "DIA_PERSONAL"
  | "VACACIONES"
  | "SANCIÓN";

export type TipoAusenciaParcial = "ABSENTISMO" | "HORAS_JUSTIFICADAS";

export interface IAusenciaCompletaBackend {
  id: string;
  tipo: TipoAusenciaCompleta;
  comentario?: string;
  fechaInicio: string;
  fechaFinal?: string | null | undefined;
  fechaRevision?: string | null | undefined;
  idTrabajador: number;
}

export interface IAusenciaParcialBackend {
  id: string;
  tipo: TipoAusenciaParcial;
  comentario?: string;
  fechaInicio: string;
  fechaFinal: string;
  idTrabajador: number;
}

export interface IAusenciaCompletaFrontend {
  id: string;
  tipo: TipoAusenciaCompleta;
  comentario?: string;
  fechaInicio: DateTime;
  fechaFinal?: DateTime | null | undefined;
  fechaRevision?: DateTime | null | undefined;
  idTrabajador: number;
}

export interface IAusenciaParcialFrontend {
  id: string;
  tipo: TipoAusenciaParcial;
  comentario?: string;
  fechaInicio: DateTime;
  fechaFinal: DateTime;
  idTrabajador: number;
}
