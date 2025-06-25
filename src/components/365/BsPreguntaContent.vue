<template>
  <div class="mb-4">
    <p>
      <strong>Pregunta {{ index + 1 }}:</strong> {{ pregunta.pregunta }}
    </p>

    <!-- SINO -->
    <div v-if="pregunta.tipo === 'SINO'" class="btn-group btn-group-toggle" data-toggle="buttons">
      <label class="btn btn-secondary" :class="{ active: modelValue === 'SI' }">
        <input type="radio" :name="pregunta.pregunta" value="SI" @change="update('SI')" />
        SI
      </label>
      <label class="btn btn-secondary" :class="{ active: modelValue === 'NO' }">
        <input type="radio" :name="pregunta.pregunta" value="NO" @change="update('NO')" />
        NO
      </label>
    </div>

    <!-- ROJOVERDE -->
    <div
      v-else-if="pregunta.tipo === 'ROJOVERDE'"
      class="btn-group btn-group-toggle"
      data-toggle="buttons"
    >
      <label class="btn btn-success" :class="{ active: modelValue === 'VERDE' }">
        <input type="radio" :name="pregunta.pregunta" value="VERDE" @change="update('VERDE')" />
        VERDE
      </label>
      <label class="btn btn-danger" :class="{ active: modelValue === 'ROJO' }">
        <input type="radio" :name="pregunta.pregunta" value="ROJO" @change="update('ROJO')" />
        ROJO
      </label>
    </div>

    <!-- RESP ESCRITA -->
    <textarea
      v-else-if="pregunta.tipo === 'RespESCRITA'"
      class="form-control"
      rows="2"
      :value="modelValue"
      @input="update(($event.target as HTMLTextAreaElement).value)"
      placeholder="Escribe tu respuesta"
    />

    <!-- RANGO -->
    <select
      v-else-if="pregunta.tipo === 'rango'"
      class="form-control"
      :value="modelValue"
      @change="update($event.target && ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
    </select>

    <!-- ARCHIVO -->
    <div v-if="pregunta.archivo" class="form-group mt-2">
      <div class="custom-file">
        <input
          type="file"
          class="custom-file-input"
          @change="$emit('set-file', $event.target && ($event.target as HTMLInputElement).files)"
        />
        <label class="custom-file-label">Haz click para agregar una foto</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pregunta: any;
  index: number;
  modelValue: any;
}>();

const emit = defineEmits(["update:modelValue", "set-file"]);

const update = (val: any) => emit("update:modelValue", val);
</script>
