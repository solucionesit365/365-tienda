<template>
  <div class="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <p class="footerText text-muted fs-6">365 Equipo - {{ appVersion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from "vue";
const instance = getCurrentInstance();
const appVersion = instance?.appContext.config.globalProperties.$appVersion;
</script>

<style scoped>
.footerText {
  text-align: center;
  color: #000000;
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
