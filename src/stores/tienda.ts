import { ref, computed, type Ref } from "vue";
import { defineStore } from "pinia";
import type { TTienda } from "@/interfaces/Tienda.interface";

export const useTiendaStore = defineStore("tienda", () => {
  const tiendas: Ref<TTienda[]> = ref([]);

  // Getters
  const getTiendas = computed(() => tiendas.value);

  const clearTiendas = () => {
    tiendas.value = [];
  };

  // Actions
  const setTiendas = (newTiendas: TTienda[]) => {
    tiendas.value = newTiendas;
  };
  const getTienda = (id: number): TTienda | null => {
    const tienda = tiendas.value.find((tienda) => tienda.id === id);
    if (tienda) {
      return tienda;
    } else {
      console.warn(`Tienda with id ${id} not found`);
      return null;
    }
  };

  return {
    tiendas,
    getTiendas,
    clearTiendas,
    setTiendas,
    getTienda,
  };
});
