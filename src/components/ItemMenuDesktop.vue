<template>
  <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6">
    <router-link :to="props.link" class="text-decoration-none">
      <div class="desktop-card" :style="{ '--card-color': props.color }">
        <div class="card-content">
          <div class="icon-container">
            <i :class="props.icono"></i>
          </div>
          <div class="title-container">
            <h5 class="card-title">{{ props.titulo }}</h5>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ItemMenuDesktopComponent" });

interface Props {
  color: string;
  titulo: string;
  icono: string;
  link: string;
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.desktop-card {
  position: relative;
  background-color: #fff;
  border-radius: 1rem;
  // border-top: 5px solid var(--card-color);
  margin-bottom: 25px;
  transition: all 0.2s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 5px 10px 20px rgba(0, 0, 0, 0.15);
  }
}

.card-content {
  position: relative;
  padding: 1.5rem;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.icon-container {
  position: absolute;
  right: 1rem;
  top: 1rem;
  opacity: 0.7;

  i {
    font-size: 5rem;
    color: var(--card-color);
  }
}

.title-container {
  position: relative;
  z-index: 2;
}

.card-title {
  color: #000000;
  opacity: 0.6 !important;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

@media (max-width: 991px) {
  .card-content {
    min-height: 120px;
    padding: 1.25rem;
  }

  .icon-container i {
    font-size: 4rem;
  }

  .card-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 767px) {
  .card-content {
    min-height: 110px;
    padding: 1rem;
  }

  .icon-container i {
    font-size: 3.5rem;
  }

  .card-title {
    font-size: 1rem;
  }
}
</style>
