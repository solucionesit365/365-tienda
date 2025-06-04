import { createRouter, createWebHistory } from "vue-router";
import MainTrabajadores from "../views/MainTrabajadores.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: MainTrabajadores,
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/privacidad",
      name: "Privacidad",
      component: () => import("../views/PoliticasView.vue"),
    },
  ],
});

export default router;
