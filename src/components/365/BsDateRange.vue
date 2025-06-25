<template>
  <div class="bs-daterange" ref="daterangeRef">
    <div class="input-group">
      <input
        type="text"
        class="form-control"
        :value="formattedDateRange"
        @click="toggleCalendar"
        @focus="showCalendar = true"
        readonly
        :placeholder="placeholder"
      />
      <span class="input-group-text" @click="toggleCalendar">
        <i class="bi bi-calendar-range"></i>
      </span>
    </div>

    <div v-if="showCalendar" class="calendar-dropdown calendar-range">
      <div class="calendars-container">
        <!-- Calendario Izquierdo -->
        <div class="calendar-section">
          <div class="calendar-header">
            <button class="btn btn-sm" @click="previousMonth('left')">
              <i class="bi bi-chevron-left"></i>
            </button>
            <div class="month-year">
              <span>{{ months[leftMonth] }} {{ leftYear }}</span>
            </div>
            <div style="width: 32px"></div>
          </div>

          <div class="calendar-body">
            <div class="weekdays">
              <div v-for="day in weekDays" :key="day" class="weekday">
                {{ day }}
              </div>
            </div>
            <div class="days">
              <div
                v-for="day in leftCalendarDays"
                :key="day.date"
                class="day"
                :class="{
                  'other-month': !day.currentMonth,
                  selected: isSelected(day),
                  'in-range': isInRange(day),
                  'range-start': isRangeStart(day),
                  'range-end': isRangeEnd(day),
                  today: isToday(day),
                }"
                @click="selectDate(day)"
                @mouseenter="hoverDate(day)"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
        </div>

        <!-- Calendario Derecho -->
        <div class="calendar-section">
          <div class="calendar-header">
            <div style="width: 32px"></div>
            <div class="month-year">
              <span>{{ months[rightMonth] }} {{ rightYear }}</span>
            </div>
            <button class="btn btn-sm" @click="nextMonth('right')">
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
                v-for="day in rightCalendarDays"
                :key="day.date"
                class="day"
                :class="{
                  'other-month': !day.currentMonth,
                  selected: isSelected(day),
                  'in-range': isInRange(day),
                  'range-start': isRangeStart(day),
                  'range-end': isRangeEnd(day),
                  today: isToday(day),
                }"
                @click="selectDate(day)"
                @mouseenter="hoverDate(day)"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-footer">
        <div class="quick-ranges">
          <button class="btn btn-sm btn-link" @click="selectQuickRange('today')">Hoy</button>
          <button class="btn btn-sm btn-link" @click="selectQuickRange('yesterday')">Ayer</button>
          <button class="btn btn-sm btn-link" @click="selectQuickRange('last7days')">
            Últimos 7 días
          </button>
          <button class="btn btn-sm btn-link" @click="selectQuickRange('last30days')">
            Últimos 30 días
          </button>
          <button class="btn btn-sm btn-link" @click="selectQuickRange('thisMonth')">
            Este mes
          </button>
        </div>
        <div class="actions">
          <button class="btn btn-sm btn-link" @click="clearDates">Limpiar</button>
          <button class="btn btn-sm btn-primary" @click="applyRange">Aplicar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { DateTime } from "luxon";

interface CalendarDay {
  day: number;
  month: number;
  year: number;
  date: string;
  currentMonth: boolean;
}

export interface DateRange {
  start: DateTime | null;
  end: DateTime | null;
}

const props = defineProps({
  modelValue: {
    type: Object as () => DateRange,
    default: () => ({ start: null, end: null }),
  },
  placeholder: {
    type: String,
    default: "Seleccionar rango de fechas",
  },
  format: {
    type: String,
    default: "dd/MM/yyyy",
  },
});

const emit = defineEmits(["update:modelValue"]);

const daterangeRef = ref<HTMLElement>();
const showCalendar = ref(false);
const startDate = ref<DateTime | null>(null);
const endDate = ref<DateTime | null>(null);
const hoverDate_ = ref<DateTime | null>(null);
const selectingStart = ref(true);

const now = DateTime.now();
const leftMonth = ref(now.month - 1);
const leftYear = ref(now.year);
const rightMonth = ref(now.month > 11 ? 0 : now.month);
const rightYear = ref(now.month > 11 ? now.year + 1 : now.year);

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

const formattedDateRange = computed(() => {
  if (!startDate.value && !endDate.value) return "";

  if (startDate.value && !endDate.value) {
    return startDate.value.toFormat(props.format);
  }

  if (startDate.value && endDate.value) {
    return `${startDate.value.toFormat(props.format)} - ${endDate.value.toFormat(props.format)}`;
  }

  return "";
});

const generateCalendarDays = (month: number, year: number): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = DateTime.local(year, month + 1, 1);
  const lastDay = firstDay.endOf("month");
  const prevLastDay = firstDay.minus({ days: 1 });

  const firstDayOfWeek = firstDay.weekday % 7;
  const lastDayOfMonth = lastDay.day;
  const prevLastDayOfMonth = prevLastDay.day;

  // Días del mes anterior
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDayOfMonth - i;
    days.push({
      day,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      date: `${year}-${month}-${day}`,
      currentMonth: false,
    });
  }

  // Días del mes actual
  for (let i = 1; i <= lastDayOfMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      date: `${year}-${month + 1}-${i}`,
      currentMonth: true,
    });
  }

  // Días del mes siguiente
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      date: `${year}-${month + 2}-${i}`,
      currentMonth: false,
    });
  }

  return days;
};

const leftCalendarDays = computed(() => generateCalendarDays(leftMonth.value, leftYear.value));
const rightCalendarDays = computed(() => generateCalendarDays(rightMonth.value, rightYear.value));

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value;
};

const previousMonth = (calendar: "left" | "right") => {
  if (calendar === "left") {
    if (leftMonth.value === 0) {
      leftMonth.value = 11;
      leftYear.value--;
    } else {
      leftMonth.value--;
    }

    // Ajustar calendario derecho
    if (rightMonth.value === 0) {
      rightMonth.value = 11;
      rightYear.value--;
    } else {
      rightMonth.value--;
    }
  }
};

const nextMonth = (calendar: "left" | "right") => {
  if (calendar === "right") {
    if (rightMonth.value === 11) {
      rightMonth.value = 0;
      rightYear.value++;
    } else {
      rightMonth.value++;
    }

    // Ajustar calendario izquierdo
    if (leftMonth.value === 11) {
      leftMonth.value = 0;
      leftYear.value++;
    } else {
      leftMonth.value++;
    }
  }
};

const selectDate = (day: CalendarDay) => {
  const selectedDate = DateTime.local(day.year, day.month + 1, day.day).startOf("day");

  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = selectedDate;
    endDate.value = null;
    selectingStart.value = false;
  } else {
    if (selectedDate < startDate.value) {
      endDate.value = startDate.value;
      startDate.value = selectedDate;
    } else {
      endDate.value = selectedDate;
    }
    selectingStart.value = true;
  }
};

const hoverDate = (day: CalendarDay) => {
  if (startDate.value && !endDate.value) {
    hoverDate_.value = DateTime.local(day.year, day.month + 1, day.day).startOf("day");
  }
};

const isSelected = (day: CalendarDay) => {
  const date = DateTime.local(day.year, day.month + 1, day.day).startOf("day");

  if (startDate.value && date.equals(startDate.value)) return true;
  if (endDate.value && date.equals(endDate.value)) return true;

  return false;
};

const isInRange = (day: CalendarDay) => {
  if (!startDate.value) return false;

  const date = DateTime.local(day.year, day.month + 1, day.day).startOf("day");
  const end = endDate.value || hoverDate_.value;

  if (!end) return false;

  const start = startDate.value < end ? startDate.value : end;
  const finish = startDate.value < end ? end : startDate.value;

  return date > start && date < finish;
};

const isRangeStart = (day: CalendarDay) => {
  if (!startDate.value) return false;
  const date = DateTime.local(day.year, day.month + 1, day.day).startOf("day");
  return date.equals(startDate.value);
};

const isRangeEnd = (day: CalendarDay) => {
  if (!endDate.value) return false;
  const date = DateTime.local(day.year, day.month + 1, day.day).startOf("day");
  return date.equals(endDate.value);
};

const isToday = (day: CalendarDay) => {
  const today = DateTime.now();
  return day.day === today.day && day.month === today.month - 1 && day.year === today.year;
};

const selectQuickRange = (range: string) => {
  const today = DateTime.now().startOf("day");

  switch (range) {
    case "today":
      startDate.value = today;
      endDate.value = today;
      break;
    case "yesterday":
      const yesterday = today.minus({ days: 1 });
      startDate.value = yesterday;
      endDate.value = yesterday;
      break;
    case "last7days":
      startDate.value = today.minus({ days: 6 });
      endDate.value = today;
      break;
    case "last30days":
      startDate.value = today.minus({ days: 29 });
      endDate.value = today;
      break;
    case "thisMonth":
      startDate.value = today.startOf("month");
      endDate.value = today.endOf("month").startOf("day");
      break;
  }

  applyRange();
};

const clearDates = () => {
  startDate.value = null;
  endDate.value = null;
  emit("update:modelValue", { start: null, end: null });
};

const applyRange = () => {
  if (startDate.value && endDate.value) {
    emit("update:modelValue", {
      start: startDate.value,
      end: endDate.value,
    });

    showCalendar.value = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (daterangeRef.value && !daterangeRef.value.contains(event.target as Node)) {
    showCalendar.value = false;
  }
};

// Watch para sincronizar con el modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.start && DateTime.isDateTime(newValue.start)) {
      startDate.value = newValue.start;
    } else {
      startDate.value = null;
    }

    if (newValue && newValue.end && DateTime.isDateTime(newValue.end)) {
      endDate.value = newValue.end;
    } else {
      endDate.value = null;
    }
  },
  { immediate: true, deep: true },
);

watch(endDate, (newEnd) => {
  if (startDate.value && newEnd) {
    emit("update:modelValue", {
      start: startDate.value,
      end: newEnd,
    });
    showCalendar.value = false;
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
.bs-daterange {
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
  min-width: 280px;
}

.calendar-range {
  min-width: 600px;
}

.calendars-container {
  display: flex;
  border-bottom: 1px solid #dee2e6;
}

.calendar-section {
  flex: 1;
  padding: 0.75rem;
}

.calendar-section:first-child {
  border-right: 1px solid #dee2e6;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.month-year {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  font-weight: 600;
}

.calendar-body {
  padding: 0;
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
  position: relative;
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
  z-index: 2;
}

.day.in-range {
  background-color: #e7f1ff;
  border-radius: 0;
}

.day.range-start {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}

.day.range-end {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

.day.today {
  font-weight: bold;
  border: 1px solid #0d6efd;
}

.calendar-footer {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-ranges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #dee2e6;
  padding-top: 0.5rem;
}

.btn-link {
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-range {
    min-width: auto;
    left: 50%;
    transform: translateX(-50%);
    width: 95vw;
  }

  .calendars-container {
    flex-direction: column;
  }

  .calendar-section:first-child {
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }

  .quick-ranges {
    font-size: 0.875rem;
  }

  .btn-link {
    padding: 0.125rem 0.25rem;
  }
}

@media (max-width: 576px) {
  .calendar-dropdown {
    left: 50%;
    transform: translateX(-50%);
    min-width: 90vw;
  }

  .day {
    font-size: 0.75rem;
  }

  .weekday {
    font-size: 0.75rem;
  }
}
</style>
