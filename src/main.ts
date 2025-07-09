import "@/assets/css/main.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { registerSW } from "virtual:pwa-register";
import packageInfo from "../package.json";

const app = createApp(App);
app.config.globalProperties.$appVersion = packageInfo.version;
app.use(createPinia());
app.use(router);
app.mount("#app");
// Registra el Service Worker
registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});
