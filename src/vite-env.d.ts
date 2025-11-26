/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;

// Google Analytics / GTM DataLayer
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare module "virtual:pwa-register" {
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegisteredSW?: (
      swScriptUrl: string,
      registration: ServiceWorkerRegistration | undefined,
    ) => void;
    onRegisterError?: (error: any) => void;
  }): void;
}
