import { ref, computed, type Ref } from "vue";
import { defineStore } from "pinia";
import type { TPermission } from "@/interfaces/Permission.interface";
import type { TRole } from "@/interfaces/Role.interface";
import type { TUser } from "@/interfaces/User.interface";

export const useUserStore = defineStore("user", () => {
  const user: Ref<TUser> = ref({
    logeado: false,
    uid: null,
    displayName: null,
    email: null,
    idSql: null,
    idTienda: null,
    nombreTienda: null,
    nombre: null,
    llevaEquipo: false,
    token: null,
    displayFoto: null,
    dni: null,
    telefono: null,
    roles: [] as TRole[],
    permissions: [] as TPermission[],
  });

  // Getters
  const isLogeado = computed(() => user.value.logeado);
  const getUid = computed(() => user.value.uid);
  const getDisplayName = computed(() => user.value.displayName);
  const getEmail = computed(() => user.value.email);
  const getIdSql = computed(() => user.value.idSql);
  const getIdTienda = computed(() => user.value.idTienda);
  const getNombreTienda = computed(() => user.value.nombreTienda);
  const getNombre = computed(() => user.value.nombre);
  const getLlevaEquipo = computed(() => user.value.llevaEquipo);
  const getDisplayFoto = computed(() => user.value.displayFoto);
  const getDni = computed(() => user.value.dni);
  const getRoles = computed(() => user.value.roles);
  const getPermissions = computed(() => user.value.permissions);
  const getUser = computed(() => user.value);

  // Setter completo, usando Partial
  const setUser = (partialUser: Partial<typeof user.value>) => {
    user.value = { ...user.value, ...partialUser };
  };

  const clearUser = () => {
    user.value = {
      logeado: false,
      uid: null,
      displayName: "",
      email: "",
      idSql: null,
      idTienda: null,
      nombreTienda: null,
      nombre: "",
      llevaEquipo: false,
      displayFoto: null,
      dni: null,
      roles: [],
      telefono: null,
      permissions: [],
    };
  };

  return {
    user,
    isLogeado,
    getUid,
    getDisplayName,
    getEmail,
    getIdSql,
    getIdTienda,
    getNombreTienda,
    getNombre,
    getLlevaEquipo,
    getDisplayFoto,
    getDni,
    getRoles,
    getPermissions,
    setUser,
    getUser,
    clearUser,
  };
});
