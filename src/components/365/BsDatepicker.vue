<template>
  <div class="bs-datepicker" ref="datepickerRef">
    <div class="input-group">
      <input
        type="text"
        class="form-control"
        ref="inputRef"
        :value="formattedDate"
        @click="openCalendar"
        readonly
        :placeholder="placeholder"
      />
      <span class="input-group-text" @click="toggleCalendar">
        <i class="bi bi-calendar3"></i>
      </span>
    </div>

    <!-- Teleportamos el dropdown al body -->
    <teleport to="body">
      <div v-if="showCalendar" ref="dropdownRef" class="calendar-dropdown" :style="dropdownStyle">
        <div class="calendar-header">
          <button class="btn btn-sm" @click="previousMonth">
            <i class="bi bi-chevron-left"></i>
          </button>
          <div class="month-year">
            <select v-model="currentMonth" class="form-select form-select-sm">
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }}
              </option>
            </select>
            <select v-model="currentYear" class="form-select form-select-sm">
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <button class="btn btn-sm" @click="nextMonth">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <div class="calendar-body">
          <div class="weekdays">
            <div v-for="day in weekDays" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>
          <div class="days">
            <div
              v-for="day in calendarDays"
              :key="day.date"
              class="day"
              :class="{
                'other-month': !day.currentMonth,
                selected: isSelected(day),
                today: isToday(day),
                disabled: day.disabled,
              }"
              @click="!day.disabled && selectDate(day)"
            >
              {{ day.day }}
            </div>
          </div>
        </div>

        <div class="calendar-footer">
          <button class="btn btn-sm btn-link" @click="selectToday">Hoy</button>
          <button class="btn btn-sm btn-link" @click="clearDate">Limpiar</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { DateTime } from "luxon";

interface CalendarDay {
  day: number;
  month: number;
  year: number;
  date: string;
  currentMonth: boolean;
  disabled: boolean;
}

const props = defineProps({
  modelValue: {
    type: Object as () => DateTime | null,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Seleccionar fecha",
  },
  minDate: {
    type: Object as () => DateTime | null,
    default: null,
  },
  maxDate: {
    type: Object as () => DateTime | null,
    default: null,
  },
  format: {
    type: String,
    default: "dd/MM/yyyy",
  },
  disablePast: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const inputRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});
const dropdownRef = ref<HTMLElement | null>(null);
const datepickerRef = ref<HTMLElement>();
const showCalendar = ref(false);
const selectedDate = ref<DateTime | null>(null);
const currentMonth = ref(DateTime.now().month - 1);
const currentYear = ref(DateTime.now().year);

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const years = computed(() => {
  const currentYear = DateTime.now().year;
  const years = [];
  for (let i = currentYear - 50; i <= currentYear + 50; i++) {
    years.push(i);
  }
  return years;
});

const formattedDate = computed(() => {
  if (!selectedDate.value) return "";
  return selectedDate.value.toFormat(props.format);
});

const MIN_WIDTH_DESKTOP = 280;
const MARGIN = 16; // píxeles de margen en móvil

const updateDropdownPosition = () => {
  if (!inputRef.value || !dropdownRef.value) return;
  const rect = inputRef.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const isMobile = vw <= 576;

  let width: number;
  let left: number;

  if (isMobile) {
    // en móvil: ancho casi total, con margen
    width = vw - MARGIN * 2;
    left = MARGIN;
  } else {
    // en escritorio: ancho = max(inputWidth, MIN_WIDTH)
    width = Math.max(rect.width, MIN_WIDTH_DESKTOP);
    left = rect.left;
    // ajustamos para que no se salga por la derecha
    if (left + width > vw - MARGIN) {
      left = vw - MARGIN - width;
      if (left < MARGIN) left = MARGIN;
    }
  }

  dropdownStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${left}px`,
    width: `${width}px`,
    minWidth: "0px", // anula cualquier min-width CSS
    maxHeight: "80vh",
    overflowY: "auto",
    zIndex: "2000",
  };
};

const calendarDays = computed(() => {
  const days: CalendarDay[] = [];
  const firstDay = DateTime.local(currentYear.value, currentMonth.value + 1, 1);
  const lastDay = firstDay.endOf("month");
  const prevLastDay = firstDay.minus({ days: 1 });
  const today = DateTime.now().startOf("day");
  const firstDayOfWeek = firstDay.weekday % 7;
  const lastDayOfMonth = lastDay.day;
  const prevLastDayOfMonth = prevLastDay.day;

  // Días del mes anterior
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDayOfMonth - i;
    days.push({
      day,
      month: currentMonth.value - 1,
      year: currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value,
      date: `${currentYear.value}-${currentMonth.value}-${day}`,
      currentMonth: false,
      disabled: false,
    });
  }

  // Días del mes actual
  for (let i = 1; i <= lastDayOfMonth; i++) {
    const dateObj = DateTime.local(currentYear.value, currentMonth.value + 1, i);
    const disabled = props.disablePast && dateObj < today;

    days.push({
      day: i,
      month: currentMonth.value,
      year: currentYear.value,
      date: `${currentYear.value}-${currentMonth.value + 1}-${i}`,
      currentMonth: true,
      disabled,
    });
  }

  // Días del mes siguiente
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: currentMonth.value + 1,
      year: currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value,
      date: `${currentYear.value}-${currentMonth.value + 2}-${i}`,
      currentMonth: false,
      disabled: false,
    });
  }

  return days;
});

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value;
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const openCalendar = () => {
  showCalendar.value = true;
};

const selectDate = (day: CalendarDay) => {
  if (!day.currentMonth) {
    currentMonth.value = day.month;
    currentYear.value = day.year;
  }

  selectedDate.value = DateTime.local(day.year, day.month + 1, day.day);
  emit("update:modelValue", selectedDate.value);
  showCalendar.value = false;
};

const selectToday = () => {
  const today = DateTime.now().startOf("day");
  selectedDate.value = today;
  currentMonth.value = today.month - 1;
  currentYear.value = today.year;
  emit("update:modelValue", selectedDate.value);
  showCalendar.value = false;
};

const clearDate = () => {
  selectedDate.value = null;
  emit("update:modelValue", null);
  showCalendar.value = false;
};

const isSelected = (day: CalendarDay) => {
  if (!selectedDate.value) return false;
  return (
    day.day === selectedDate.value.day &&
    day.month === selectedDate.value.month - 1 &&
    day.year === selectedDate.value.year
  );
};

const isToday = (day: CalendarDay) => {
  const today = DateTime.now();
  return day.day === today.day && day.month === today.month - 1 && day.year === today.year;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  // Si clicas dentro del input/icono O dentro del dropdown no cerramos
  if (datepickerRef.value?.contains(target) || dropdownRef.value?.contains(target)) {
    return;
  }
  showCalendar.value = false;
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && DateTime.isDateTime(newValue)) {
      selectedDate.value = newValue;
      currentMonth.value = newValue.month - 1;
      currentYear.value = newValue.year;
    } else {
      selectedDate.value = null;
    }
  },
  { immediate: true },
);

watch(showCalendar, async (val) => {
  if (val) {
    // esperamos a que el DOM pinte el dropdown
    await nextTick();
    updateDropdownPosition();
    // y también al redimensionar ventana
    window.addEventListener("resize", updateDropdownPosition);
  } else {
    window.removeEventListener("resize", updateDropdownPosition);
  }
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.bs-datepicker {
  position: relative;
  width: 100%;
}

.input-group {
  cursor: pointer;
}

.input-group input {
  background-color: white;
  cursor: pointer;
}

.input-group-text {
  background-color: white;
  cursor: pointer;
}

.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1050;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin-top: 0.25rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.month-year {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  margin: 0 0.5rem;
}

.month-year select {
  cursor: pointer;
}

.calendar-body {
  padding: 0.75rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6c757d;
  padding: 0.25rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.day:hover {
  background-color: #f8f9fa;
}

.day.other-month {
  color: #dee2e6;
}

.day.selected {
  background-color: #0d6efd;
  color: white;
}

.day.selected:hover {
  background-color: #0b5ed7;
}

.day.today {
  font-weight: bold;
  border: 1px solid #0d6efd;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #dee2e6;
}

.btn-link {
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

.day.disabled {
  color: #ccc;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
