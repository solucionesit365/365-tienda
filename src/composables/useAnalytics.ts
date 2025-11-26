// src/composables/useAnalytics.ts
/// <reference path="../types/global.d.ts" />
import type {
    GaEventName,
    ModuleSection,
    FileMeta,
    InteractionContext,
    GtmPayload
} from '@/types/analytics';

import { useUserStore } from '@/stores/user';

export function useAnalytics() {

    // Helper: Init DataLayer
    const initDataLayer = () => {
      if (typeof window !== 'undefined' && !window.dataLayer) {
        window.dataLayer = [];
      }
    };

    // Helper: Gets the current user's roles.
    const getUserRole = (): string => {
      return useUserStore().getRoles.map((rol) => rol.name).join()
    };

    /**
     * Tracking function.
     */
    const trackAction = (
      eventName: GaEventName,
      section: ModuleSection,
      componentName: string,
      details: {
        file?: FileMeta;
        context?: InteractionContext;
      } = {}
    ) => {
      initDataLayer();

      const payload: GtmPayload = {
        event: eventName,
        module_section: section,
        ui_component: componentName,
        user_role: getUserRole(),
        timestamp: new Date().toISOString(),
        page_location: window.location.href,
        ...(details.file && { file_meta: details.file }),
        ...(details.context && { interaction_context: details.context })
      };

      try {
        const gtagFn = (window as any).gtag;
        if (typeof gtagFn === 'function') {
          const gaParams: Record<string, unknown> = {
            module_section: payload.module_section,
            ui_component: payload.ui_component,
            user_role: payload.user_role,
            page_location: payload.page_location,
            timestamp: payload.timestamp,
          };
          if (payload.file_meta) {
            gaParams.file_name = payload.file_meta.name;
            gaParams.file_extension = payload.file_meta.extension;
            if (payload.file_meta.category) gaParams.file_category = payload.file_meta.category;
          }
          if (payload.interaction_context) {
            const ctx = payload.interaction_context;
            if (ctx.target) gaParams.target = ctx.target;
            if (ctx.status) gaParams.status = ctx.status;
            if (typeof ctx.value !== 'undefined') gaParams.value = ctx.value;
            if (ctx.filter_used) gaParams.filter_used = ctx.filter_used;
            if (ctx.method) gaParams.method = ctx.method;
          }
          gtagFn('event', eventName, gaParams);
        }
      } catch {
        // ignore gtag failures
      }

      if (typeof window !== 'undefined') {
        window.dataLayer.push(payload);

        // Develop logs for debugging
        if (import.meta.env.DEV) {
          console.groupCollapsed(`📊 [GTM] ${eventName}`);
          console.table(payload);
          console.groupEnd();
        }
      }
    };

    return { trackAction };
  }
