export interface TTrabajador {
  id: number;
  idApp?: string | null;
  nombreApellidos: string;
  displayName?: string | null;
  emails: string;
  dni: string;
  direccion?: string | null;
  ciudad?: string | null;
  telefonos?: string | null;
  fechaNacimiento?: Date | null;
  nacionalidad?: string | null;
  nSeguridadSocial?: string | null;
  codigoPostal?: string | null;
  cuentaCorriente?: string | null;
  tipoTrabajador: string;
  idResponsable?: number | null;
  idTienda?: number | null;
  llevaEquipo: boolean;
  tokenQR?: string | null;
  displayFoto?: string | null;
  excedencia: boolean;
  dispositivo?: string | null;
  empresaId?: string | null;
}
