import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: "prompt", // Cambiado de "autoUpdate" a "prompt" para mostrar el diálogo
      strategies: "injectManifest",
      // tu SW vive en src/sw.ts
      srcDir: "src",
      filename: "sw.ts",
      // (opcional) registra automáticamente el SW en dev/prod
      injectRegister: "auto",
      // Configuración para mejor detección de actualizaciones
      workbox: {
        skipWaiting: false, // No actualizar automáticamente, esperar confirmación
        clientsClaim: false,
      },
      // Generar SW con número de versión en el nombre para forzar actualización
      devOptions: {
        enabled: false
      },
      includeAssets: ["favicon.ico", "robots.txt", "logo.png", "192x192.png", "512x512.png"],
      manifest: {
        name: "365 Tienda",
        short_name: "365 Tienda",
        description: "App para gestionar tu tablet 365 Tienda",
        theme_color: "#e66c5a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      // si quieres opciones de build del injectManifest:
      injectManifest: {
        // ajusta si quieres: qué ficheros precachear
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    allowedHosts: ["07c5-213-96-8-96.ngrok-free.app"],
  },
});
