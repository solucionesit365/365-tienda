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
      name: "Cuadrantes",
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
      name: "Abrir incidencias",
      meta: {
        requiresAuth: false,
      },
      component: () => import("../components/Incidencias/IncidenciasComponent.vue"),
    },
    {
      path: "/abrirIncidenciaInvitado",
      name: "Abrir incidencia invitado",
      meta: {
        requiresAuth: false,
      },
      component: () => import("../components/Incidencias/IncidenciasInvitadosComponents.vue"),
    },
    {
      path: "/colorSemanal",
      name: "Color semanal",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../views/ColorSemanal.vue"),
    },
    {
      path: "/anuncios",
      name: "Anuncios",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../views/TablonAnuncios.vue"),
    },
    {
      path: "/videoCultura",
      name: "Cultura 365",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../views/CulturaView.vue"),
    },
    {
      path: "/encargosview",
      name: "Encargos",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../components/EncargosView.vue"),
    },
    {
      path: "/calendarioFestivos",
      name: "Calendario festivos",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../components/CalendarioFestivo.vue"),
    },
    {
      path: "/NotasInformativas",
      name: "Notas informativas",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../components/NotasInformativas.vue"),
    },
    {
      path: "/validar-horas",
      name: "Validar Horas",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../components/ValidarHoras.vue"),
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
