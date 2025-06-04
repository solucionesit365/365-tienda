import type { TPermission } from "./Permission.interface";

export interface TRole {
  id: string;
  name: string;
  permissions: TPermission[];
}
