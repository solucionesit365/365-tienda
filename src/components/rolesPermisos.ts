import { useUserStore } from "@/stores/user";

export function allowedRoute(route: string) {
  const userStore = useUserStore();
  const userRoles = userStore.getRoles;
  const userPermissions = userStore.getPermissions;

  // Obtenemos los permisos necesarios para la ruta dada
  const rolesNecesarios = rolesPorRuta[route];
  const permissionsNecesarios = permissionsPorRuta[route];

  // Verificamos si algún rol del usuario está en los roles necesarios para la ruta
  return (
    userRoles.some((rol) => rolesNecesarios.includes(rol.name)) ||
    userPermissions.some((permission) => permissionsNecesarios.includes(permission.name))
  );
}

const rolesPorRuta: { [key: string]: string[] } = {
  "/admin": ["admin"],
  "/dashboard": ["admin", "editor"],
  "/profile": ["usuario", "editor"],
};

const permissionsPorRuta: { [key: string]: string[] } = {
  "/admin": ["fdasfdas"],
  "/dashboard": ["agdfhd", "fasohoas"],
  "/profile": ["rewtaew", "ghdlasg"],
};

export function hasPermission(...validPermisos: string[]) {
  const userStore = useUserStore();
  const currentUserPermissions = (userStore.getPermissions ?? []).map((permiso) => permiso.name);
  return validPermisos.some((permissionName) => currentUserPermissions.includes(permissionName));
}

export function hasRole(...rolesNecesarios: string[]) {
  const userStore = useUserStore();
  const currentUserRoles = userStore.getRoles.map((rol) => rol.name);
  return rolesNecesarios.some((role) => currentUserRoles.includes(role));
}
