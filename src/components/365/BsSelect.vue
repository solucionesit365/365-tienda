<template>
  <!-- INPUT GROUP (label left o right) -->
  <div v-if="useInputGroup" :class="['input-group', inputGroupSizeClass]">
    <!-- Label a la izquierda -->
    <span v-if="label && labelPosition === 'left'" class="input-group-text">{{ label }}</span>

    <!-- Dropdown como “input” -->
    <div class="dropdown flex-fill" ref="dropdownRef">
      <div
        class="form-select d-flex justify-content-between align-items-center"
        :class="[sizeClass, { show: isOpen }]"
        role="button"
        tabindex="0"
        @click="toggleDropdown"
        @keydown.enter.prevent="toggleDropdown"
        @keydown.escape="closeDropdown"
      >
        <span class="selected-text">{{ displayText }}</span>
        <i class="bi bi-chevron-down ms-2"></i>
      </div>
      <div class="dropdown-menu w-100" :class="{ show: isOpen }" @click.stop>
        <!-- Search -->
        <div v-if="filter" class="p-2">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            :class="controlSizeClass"
            :placeholder="searchPlaceholder"
            @input="handleSearch"
            @click.stop
            ref="searchInput"
          />
        </div>
        <!-- “Seleccionar todos” -->
        <div v-if="multi && selectAll && filteredOptions.length" class="dropdown-item">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              :id="`select-all-${uid}`"
            />
            <label class="form-check-label w-100" :for="`select-all-${uid}`">
              Seleccionar todos
            </label>
          </div>
        </div>
        <div v-if="multi && selectAll && filteredOptions.length" class="dropdown-divider"></div>

        <!-- Opciones -->
        <div class="dropdown-options" style="max-height: 300px; overflow-y: auto">
          <div v-if="!filteredOptions.length" class="dropdown-item-text text-muted">
            No se encontraron resultados
          </div>
          <template v-else-if="multi">
            <div
              v-for="option in filteredOptions"
              :key="`multi-${getOptionValue(option)}`"
              class="dropdown-item"
              @click.stop
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="isOptionSelected(option)"
                  @change="toggleOption(option)"
                  :id="`option-${uid}-${getOptionValue(option)}`"
                />
                <label
                  class="form-check-label w-100"
                  :for="`option-${uid}-${getOptionValue(option)}`"
                >
                  {{ getOptionText(option) }}
                </label>
              </div>
            </div>
          </template>
          <template v-else>
            <button
              v-for="option in filteredOptions"
              :key="`single-${getOptionValue(option)}`"
              type="button"
              class="dropdown-item"
              :class="{ active: isOptionSelected(option) }"
              @click="selectOption(option)"
            >
              {{ getOptionText(option) }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Label a la derecha -->
    <span v-if="label && labelPosition === 'right'" class="input-group-text">{{ label }}</span>
  </div>

  <!-- LAYOUT “top” (por defecto) -->
  <div v-else :class="['bs-select-wrapper', wrapperClass]">
    <label v-if="label" :class="labelClass">{{ label }}</label>
    <div class="dropdown" ref="dropdownRef">
      <div
        class="form-select d-flex justify-content-between align-items-center"
        :class="[sizeClass, { show: isOpen }]"
        role="button"
        tabindex="0"
        @click="toggleDropdown"
        @keydown.enter.prevent="toggleDropdown"
        @keydown.escape="closeDropdown"
      >
        <span class="selected-text">{{ displayText }}</span>
        <i class="bi bi-chevron-down ms-2"></i>
      </div>
      <div class="dropdown-menu w-100" :class="{ show: isOpen }" @click.stop>
        <div v-if="filter" class="p-2">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            :class="controlSizeClass"
            :placeholder="searchPlaceholder"
            @input="handleSearch"
            @click.stop
            ref="searchInput"
          />
        </div>
        <div v-if="multi && selectAll && filteredOptions.length" class="dropdown-item">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              :id="`select-all-${uid}`"
            />
            <label class="form-check-label w-100" :for="`select-all-${uid}`">
              Seleccionar todos
            </label>
          </div>
        </div>
        <div v-if="multi && selectAll && filteredOptions.length" class="dropdown-divider"></div>
        <div class="dropdown-options" style="max-height: 300px; overflow-y: auto">
          <div v-if="!filteredOptions.length" class="dropdown-item-text text-muted">
            No se encontraron resultados
          </div>
          <template v-else-if="multi">
            <div
              v-for="option in filteredOptions"
              :key="`multi-${getOptionValue(option)}`"
              class="dropdown-item"
              @click.stop
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="isOptionSelected(option)"
                  @change="toggleOption(option)"
                  :id="`option-${uid}-${getOptionValue(option)}`"
                />
                <label
                  class="form-check-label w-100"
                  :for="`option-${uid}-${getOptionValue(option)}`"
                >
                  {{ getOptionText(option) }}
                </label>
              </div>
            </div>
          </template>
          <template v-else>
            <button
              v-for="option in filteredOptions"
              :key="`single-${getOptionValue(option)}`"
              type="button"
              class="dropdown-item"
              :class="{ active: isOptionSelected(option) }"
              @click="selectOption(option)"
            >
              {{ getOptionText(option) }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

// Props
interface Props {
  options?: Record<string, any>[];
  selected?: any;
  modelValue?: any;
  filter?: boolean;
  selectAll?: boolean;
  placeholder?: string;
  labelPosition?: "top" | "left" | "right";
  searchPlaceholder?: string;
  optionsSelectedLabel?: string;
  label?: string;
  multi?: boolean;
  size?: "sm" | "md" | "lg";
  textKey?: string;
  valueKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  filter: false,
  selectAll: false,
  searchPlaceholder: "Buscar...",
  labelPosition: "top",
  placeholder: "Seleccione una opción",
  optionsSelectedLabel: "opciones seleccionadas",
  multi: false,
  size: "md",
  textKey: "text",
  valueKey: "value",
});

// Layout y clases
const useInputGroup = computed(
  () => props.labelPosition === "left" || props.labelPosition === "right",
);
const inputGroupSizeClass = computed(() => {
  if (props.size === "sm") return "input-group-sm";
  if (props.size === "lg") return "input-group-lg";
  return "";
});
const sizeClass = computed(() => {
  if (props.size === "sm") return "form-select-sm";
  if (props.size === "lg") return "form-select-lg";
  return "";
});
const controlSizeClass = computed(() => {
  if (props.size === "sm") return "form-control-sm";
  if (props.size === "lg") return "form-control-lg";
  return "";
});
const wrapperClass = computed(() => "d-flex flex-column");
const labelClass = computed(() => "form-label mb-1");

// Emits
const emit = defineEmits<{
  "update:selected": [value: any];
  "update:modelValue": [value: any];
  change: [newValue: any];
}>();

// Refs y estado
const isOpen = ref(false);
const searchQuery = ref("");
const dropdownRef = ref<HTMLElement>();
const searchInput = ref<HTMLInputElement>();
const uid = Math.random().toString(36).substring(2, 9);
const internalSelected = ref<any>(props.multi ? [] : null);

// Soporte v-model
const externalValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : props.selected,
);
watch(
  externalValue,
  (val) => {
    internalSelected.value = val;
  },
  { immediate: true, deep: true },
);

// Filtrado y visualización
const filteredOptions = computed(() => {
  if (!props.filter || !searchQuery.value) return props.options!;
  const q = searchQuery.value.toLowerCase();
  return props.options!.filter((opt) => String(opt[props.textKey]!).toLowerCase().includes(q));
});
const displayText = computed(() => {
  if (props.multi) {
    const cnt = Array.isArray(internalSelected.value) ? internalSelected.value.length : 0;
    return cnt === 0 ? props.placeholder : `${cnt} ${props.optionsSelectedLabel}`;
  }
  return internalSelected.value
    ? String(internalSelected.value[props.textKey]!)
    : props.placeholder;
});
const isAllSelected = computed(() => {
  if (!props.multi || !Array.isArray(internalSelected.value)) return false;
  if (!filteredOptions.value.length) return false;
  return filteredOptions.value.every((opt) =>
    internalSelected.value.some((sel: any) => sel[props.valueKey] === opt[props.valueKey]),
  );
});

// Helpers
const getOptionText = (opt: Record<string, any>) => String(opt[props.textKey]!);
const getOptionValue = (opt: Record<string, any>) => opt[props.valueKey];
const isOptionSelected = (opt: Record<string, any>) => {
  if (props.multi) {
    return (
      Array.isArray(internalSelected.value) &&
      internalSelected.value.some((sel: any) => sel[props.valueKey] === opt[props.valueKey])
    );
  }
  return internalSelected.value && internalSelected.value[props.valueKey] === opt[props.valueKey];
};

// Emitters
const emitUpdate = (val: any) => {
  emit("update:selected", val);
  emit("update:modelValue", val);
  emit("change", val);
};

// Métodos principales
const handleSearch = () => {
  // No hace falta nada: el v-model de searchQuery + filteredOptions reactivo
};

const selectOption = (opt: Record<string, any>) => {
  if (!props.multi) {
    internalSelected.value = opt;
    emitUpdate(opt);
    closeDropdown();
  }
};

const toggleOption = (opt: Record<string, any>) => {
  if (!props.multi) return;
  const arr = Array.isArray(internalSelected.value) ? [...internalSelected.value] : [];
  const idx = arr.findIndex((sel) => sel[props.valueKey] === opt[props.valueKey]);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(opt);
  internalSelected.value = arr;
  emitUpdate(arr);
};

const toggleSelectAll = () => {
  if (!props.multi) return;
  if (isAllSelected.value) {
    const vals = new Set(filteredOptions.value.map((o) => o[props.valueKey]));
    internalSelected.value = internalSelected.value.filter(
      (sel: any) => !vals.has(sel[props.valueKey]),
    );
  } else {
    const curr = Array.isArray(internalSelected.value) ? [...internalSelected.value] : [];
    const existing = new Set(curr.map((sel: any) => sel[props.valueKey]));
    filteredOptions.value.forEach((o) => {
      if (!existing.has(o[props.valueKey])) curr.push(o);
    });
    internalSelected.value = curr;
  }
  emitUpdate(internalSelected.value);
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.filter) {
    setTimeout(() => searchInput.value?.focus(), 100);
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value?.contains(e.target as Node) === false) {
    closeDropdown();
  }
};
onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));
</script>

<style scoped>
.bs-select-wrapper {
  position: relative;
}
.dropdown {
  position: relative;
}
.form-select {
  cursor: pointer;
  user-select: none;
}
.form-select.show {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  width: 100%;
  min-width: max-content;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
.dropdown-menu.show {
  display: block;
}
.dropdown-item {
  display: block;
  width: 100%;
  min-width: max-content;
  padding: 0.25rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}
.dropdown-item:hover,
.dropdown-item:focus {
  background-color: #e9ecef;
}
.dropdown-item.active {
  color: #fff;
  background-color: #0d6efd;
}
.dropdown-item-text {
  padding: 0.25rem 1rem;
  color: #6c757d;
}
.form-check {
  margin-bottom: 0;
}
.form-check-label {
  cursor: pointer;
  margin-bottom: 0;
}
.selected-text {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.selected-text::-webkit-scrollbar {
  height: 6px;
}

.selected-text::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.selected-text::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.selected-text::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.bi-chevron-down {
  transition: transform 0.2s;
}
.show .bi-chevron-down {
  transform: rotate(180deg);
}
.dropdown-options {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: auto;
}
.dropdown-options::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.dropdown-options::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.dropdown-options::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.dropdown-options::-webkit-scrollbar-corner {
  background: #f1f1f1;
}
</style>
