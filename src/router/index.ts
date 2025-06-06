import { createRouter, createWebHistory } from "vue-router";
import { checkLogin } from "@/components/firebase/authentication";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../views/MainTrabajadores.vue"),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/cuadrantes-tienda",
      name: "crearcuadrantes tienda",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../views/VerCuadrante.vue"),
    },
    {
      path: "/privacidad",
      name: "Privacidad",
      component: () => import("../views/PoliticasView.vue"),
    },
    {
      path: "/abrir-incidencia",
      name: "Abrir Incidencias",
      meta: {
        requiresAuth: false,
      },
      component: () => import("../components/Incidencias/IncidenciasComponent.vue"),
    },
    {
      path: "/abrirIncidenciaInvitado",
      name: "abrirIncidenciaInvitado",
      meta: {
        requiresAuth: false,
      },
      component: () => import("../components/Incidencias/IncidenciasInvitadosComponents.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const logeado = await checkLogin();

  if (requiresAuth && !logeado) {
    next("login");
  } else if (to.path === "/login" && logeado) {
    next(from.path);
  } else {
    next();
  }
});

export default router;
