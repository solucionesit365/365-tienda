<template>
  <div class="bs-select-wrapper">
    <div v-if="label" class="form-text">{{ label }}</div>
    <div class="dropdown" :class="{ show: isOpen }">
      <button
        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
        type="button"
        @click="toggleDropdown"
      >
        {{ displayText }}
      </button>
      <div class="dropdown-menu w-100" :class="{ show: isOpen }">
        <div v-if="filter" class="px-3 py-2">
          <input
            v-model="searchTerm"
            type="text"
            class="form-control form-control-sm"
            :placeholder="searchPlaceholder"
          />
        </div>
        <div class="dropdown-divider" v-if="filter"></div>
        <div class="dropdown-items-container">
          <button v-if="selectAll" class="dropdown-item" type="button" @click="toggleSelectAll">
            <input type="checkbox" class="form-check-input me-2" :checked="allSelected" />
            Seleccionar todos
          </button>
          <div class="dropdown-divider" v-if="selectAll"></div>
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            class="dropdown-item"
            type="button"
            @click="toggleOption(option)"
          >
            <input type="checkbox" class="form-check-input me-2" :checked="isSelected(option)" />
            {{ option.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

interface Option {
  text: string;
  value: any;
}

interface Props {
  options?: Option[];
  selected?: any;
  filter?: boolean;
  selectAll?: boolean;
  searchPlaceholder?: string;
  optionsSelectedLabel?: string;
  preselect?: boolean;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  filter: false,
  selectAll: false,
  searchPlaceholder: "Buscar...",
  optionsSelectedLabel: "seleccionado(s)",
  preselect: true,
});

const emit = defineEmits(["update:options", "update:selected"]);

const isOpen = ref(false);
const searchTerm = ref("");
const selectedValues = ref<any[]>([]);

const filteredOptions = computed(() => {
  if (!searchTerm.value) return props.options;
  return props.options.filter((option) =>
    option.text.toLowerCase().includes(searchTerm.value.toLowerCase()),
  );
});

const displayText = computed(() => {
  if (selectedValues.value.length === 0) return "Seleccionar...";
  if (selectedValues.value.length === 1) {
    const selected = props.options.find((opt) => opt.value === selectedValues.value[0]);
    return selected ? selected.text : "";
  }
  return `${selectedValues.value.length} ${props.optionsSelectedLabel}`;
});

const allSelected = computed(() => {
  return props.options.length > 0 && selectedValues.value.length === props.options.length;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const isSelected = (option: Option) => {
  return selectedValues.value.includes(option.value);
};

const toggleOption = (option: Option) => {
  const index = selectedValues.value.indexOf(option.value);
  if (index > -1) {
    selectedValues.value.splice(index, 1);
  } else {
    selectedValues.value.push(option.value);
  }
  updateSelected();
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedValues.value = [];
  } else {
    selectedValues.value = props.options.map((opt) => opt.value);
  }
  updateSelected();
};

const updateSelected = () => {
  if (selectedValues.value.length === 1) {
    emit("update:selected", selectedValues.value[0]);
  } else {
    emit("update:selected", selectedValues.value);
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".bs-select-wrapper")) {
    isOpen.value = false;
  }
};

watch(
  () => props.selected,
  (newVal) => {
    if (Array.isArray(newVal)) {
      selectedValues.value = [...newVal];
    } else if (newVal !== undefined) {
      selectedValues.value = [newVal];
    }
  },
);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  if (props.preselect && props.selected) {
    if (Array.isArray(props.selected)) {
      selectedValues.value = [...props.selected];
    } else {
      selectedValues.value = [props.selected];
    }
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.bs-select-wrapper {
  position: relative;
}

.dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
}

.dropdown-items-container {
  max-height: 250px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}
</style>
