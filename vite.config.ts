import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      // tu SW vive en src/sw.ts
      srcDir: "src",
      filename: "sw.ts",
      // (opcional) registra automáticamente el SW en dev/prod
      injectRegister: "auto",
      // ojo: aquí tenías una cadena con comas dentro del mismo string
      includeAssets: ["favicon.ico", "robots.txt", "logo.png", "192x192.png", "512x512.png"],
      manifest: {
        name: "365 GDT",
        short_name: "365 GDT",
        description: "App para gestionar tu tablet 365",
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
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    allowedHosts: ["07c5-213-96-8-96.ngrok-free.app"],
  },
});
