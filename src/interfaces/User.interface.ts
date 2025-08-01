import type { TRole } from "./Role.interface";
import type { TPermission } from "./Permission.interface";
import type { TTienda } from "./Tienda.interface";

export interface TUser {
  logeado: boolean | null;
  uid: string | null;
  displayName: string | null;
  email: string | null;
  idSql: number | null;
  idTienda: number | null;
  nombreTienda: string | null;
  coordinadoraDeLaTienda: TTienda | null;
  nombre: string | null;
  llevaEquipo: boolean;
  tienda: TTienda | null;
  displayFoto: string | null;
  dni: string | null;
  roles: TRole[];
  telefono: string | null;
  permissions: TPermission[];
}
