<script setup lang="ts">
import { RouterView } from "vue-router";
// import HelloWorld from "./components/HelloWorld.vue";
import BackButton from "./components/BackButton.vue";
</script>

<template>
  <div class="container">
    <BackButton />
    <RouterView />
  </div>
</template>

<style scoped></style>
