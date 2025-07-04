import "@/assets/css/main.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { registerSW } from "virtual:pwa-register";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount("#app");
// Registra el Service Worker
registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});
