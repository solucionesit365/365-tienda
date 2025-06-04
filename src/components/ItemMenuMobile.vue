<template>
  <div class="col-4 px-2">
    <router-link :to="props.link" class="text-decoration-none">
      <div class="menu-card-wrapper">
        <div class="menu-card" :style="{ '--card-color': props.color }">
          <i :class="props.icono" class="menu-icon"></i>
        </div>
        <div class="menu-title">{{ props.titulo }}</div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ItemMenuComponent" });

interface Props {
  color: string;
  titulo: string;
  icono: string;
  link: string;
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.menu-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.menu-card {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    // background-color: var(--card-color);
  }

  .menu-icon {
    font-size: 3.2rem !important;
    color: var(--card-color);
    transition: all 0.2s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
}

.menu-title {
  margin-top: 10px;
  font-size: 1rem !important;
  color: #000000;
  opacity: 0.6 !important;
  text-align: center;
}

@media (max-width: 767px) {
  .menu-icon {
    font-size: 2.8rem !important;
  }
}

@media (max-width: 575px) {
  .menu-icon {
    font-size: 2.2rem !important;
    opacity: 0.7;
  }

  .menu-title {
    font-size: 0.8rem;
  }
}
</style>
