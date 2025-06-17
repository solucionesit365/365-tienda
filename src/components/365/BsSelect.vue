<template>
  <div class="bs-select-wrapper">
    <!-- Label -->
    <label v-if="label" class="form-label">{{ label }}</label>

    <!-- Select Container -->
    <div class="dropdown" ref="dropdownRef">
      <!-- Select Input -->
      <div
        class="form-select d-flex justify-content-between align-items-center"
        :class="{ show: isOpen }"
        @click="toggleDropdown"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="toggleDropdown"
        @keydown.escape="closeDropdown"
      >
        <span class="selected-text">
          {{ displayText }}
        </span>
        <i class="bi bi-chevron-down ms-2"></i>
      </div>

      <!-- Dropdown Menu -->
      <div class="dropdown-menu w-100" :class="{ show: isOpen }" @click.stop>
        <!-- Search Input -->
        <div v-if="filter" class="p-2">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm"
            :placeholder="searchPlaceholder || 'Buscar...'"
            @input="handleSearch"
            @click.stop
            ref="searchInput"
          />
        </div>

        <!-- Select All Option -->
        <div v-if="multi && selectAll && filteredOptions.length > 0" class="dropdown-item">
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

        <div v-if="multi && selectAll && filteredOptions.length > 0" class="dropdown-divider"></div>

        <!-- Options List -->
        <div class="dropdown-options" style="max-height: 300px; overflow-y: auto">
          <!-- No Results -->
          <div v-if="filteredOptions.length === 0" class="dropdown-item-text text-muted">
            No se encontraron resultados
          </div>

          <!-- Multi Select Options -->
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

          <!-- Single Select Options -->
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
  modelValue?: any; // Add modelValue for v-model support
  filter?: boolean;
  selectAll?: boolean;
  searchPlaceholder?: string;
  optionsSelectedLabel?: string;
  label?: string;
  multi?: boolean;
  textKey?: string;
  valueKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  filter: false,
  selectAll: false,
  searchPlaceholder: "Buscar...",
  optionsSelectedLabel: "opciones seleccionadas",
  multi: false,
  textKey: "text",
  valueKey: "value",
});

// Emits
const emit = defineEmits<{
  "update:selected": [value: any];
  "update:modelValue": [value: any]; // Add for v-model support
}>();

// Refs
const isOpen = ref(false);
const searchQuery = ref("");
const dropdownRef = ref<HTMLElement>();
const searchInput = ref<HTMLInputElement>();

// Generate unique ID for form elements
const uid = Math.random().toString(36).substring(2, 9);

// Internal selected state - now stores complete objects
const internalSelected = ref<any>(props.multi ? [] : null);

// Watch for external selected changes (support both v-model and :selected)
const externalValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : props.selected,
);

watch(
  externalValue,
  (newVal) => {
    internalSelected.value = newVal;
  },
  { immediate: true, deep: true },
);

// Computed
const filteredOptions = computed(() => {
  if (!props.filter || !searchQuery.value) {
    return props.options || [];
  }

  const query = searchQuery.value.toLowerCase();
  return (props.options || []).filter((option) => {
    const text = getOptionText(option).toLowerCase();
    return text.includes(query);
  });
});

const displayText = computed(() => {
  if (props.multi) {
    const selectedCount = Array.isArray(internalSelected.value) ? internalSelected.value.length : 0;
    if (selectedCount === 0) {
      return "Seleccione una opción";
    }
    return `${selectedCount} ${props.optionsSelectedLabel}`;
  } else {
    // For single select, show the text of the selected object
    if (internalSelected.value) {
      return getOptionText(internalSelected.value);
    }
    return "Seleccione una opción";
  }
});

const isAllSelected = computed(() => {
  if (!props.multi || !Array.isArray(internalSelected.value)) return false;
  if (filteredOptions.value.length === 0) return false;

  // Check if all filtered options are in the selected array
  return filteredOptions.value.every((option) =>
    internalSelected.value.some(
      (selected: any) => getOptionValue(selected) === getOptionValue(option),
    ),
  );
});

// Methods
const getOptionText = (option: Record<string, any>): string => {
  if (!option || typeof option !== "object") return "";
  return String(option[props.textKey] || "");
};

const getOptionValue = (option: Record<string, any>): any => {
  if (!option || typeof option !== "object") return null;
  return option[props.valueKey];
};

const isOptionSelected = (option: Record<string, any>): boolean => {
  if (props.multi) {
    return (
      Array.isArray(internalSelected.value) &&
      internalSelected.value.some(
        (selected: any) => getOptionValue(selected) === getOptionValue(option),
      )
    );
  }
  // For single select, compare by value
  return (
    internalSelected.value && getOptionValue(internalSelected.value) === getOptionValue(option)
  );
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.filter) {
    setTimeout(() => {
      searchInput.value?.focus();
    }, 100);
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const emitUpdate = (value: any) => {
  emit("update:selected", value);
  emit("update:modelValue", value);
};

const selectOption = (option: Record<string, any>) => {
  if (!props.multi) {
    // Store the complete object
    internalSelected.value = option;
    emitUpdate(option);
    closeDropdown();
  }
};

const toggleOption = (option: Record<string, any>) => {
  if (!props.multi) return;

  const currentSelected = Array.isArray(internalSelected.value) ? [...internalSelected.value] : [];

  // Find if the option is already selected by comparing values
  const index = currentSelected.findIndex(
    (selected: any) => getOptionValue(selected) === getOptionValue(option),
  );

  if (index > -1) {
    // Remove the object
    currentSelected.splice(index, 1);
  } else {
    // Add the complete object
    currentSelected.push(option);
  }

  internalSelected.value = currentSelected;
  emitUpdate(currentSelected);
};

const toggleSelectAll = () => {
  if (!props.multi) return;

  if (isAllSelected.value) {
    // Remove all filtered options from selection
    const filteredValues = new Set(filteredOptions.value.map((opt) => getOptionValue(opt)));
    const currentSelected = Array.isArray(internalSelected.value)
      ? internalSelected.value.filter(
          (selected: any) => !filteredValues.has(getOptionValue(selected)),
        )
      : [];
    internalSelected.value = currentSelected;
  } else {
    // Add all filtered options to selection
    const currentSelected = Array.isArray(internalSelected.value)
      ? [...internalSelected.value]
      : [];

    // Create a Set of already selected values for efficient lookup
    const selectedValues = new Set(
      currentSelected.map((selected: any) => getOptionValue(selected)),
    );

    // Add only options that aren't already selected
    filteredOptions.value.forEach((option) => {
      if (!selectedValues.has(getOptionValue(option))) {
        currentSelected.push(option);
      }
    });

    internalSelected.value = currentSelected;
  }

  emitUpdate(internalSelected.value);
};

const handleSearch = () => {
  // Search is handled reactively through computed property
};

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  console.log("BsSelect mounted with options:", props.options);
  console.log("Initial selected:", externalValue.value);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
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
  min-width: 100%;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
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
  padding: 0.25rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #1e2125;
  background-color: #e9ecef;
}

.dropdown-item.active {
  color: #fff;
  background-color: #0d6efd;
}

.dropdown-item-text {
  display: block;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bi-chevron-down {
  transition: transform 0.2s;
}

.show .bi-chevron-down {
  transform: rotate(180deg);
}

.dropdown-options::-webkit-scrollbar {
  width: 8px;
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
</style>
