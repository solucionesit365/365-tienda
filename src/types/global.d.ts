export {}; // Esto convierte el archivo en un módulo para permitir aumentos globales

declare global {
  interface Window {
    // Definimos dataLayer como un array genérico para evitar conflictos estrictos
    dataLayer: Array<Record<string, any>>;
    gtag: (...args: any[]) => void;
  }
}
