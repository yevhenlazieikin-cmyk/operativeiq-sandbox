import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  provideZoneChangeDetection,
  inject,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MessageService } from '@backoffice/shared-ui';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Hash-location keeps deep-link navigation robust inside the preview iframe
    // (no need to serve index.html for every path during dev).
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideNativeDateAdapter(),
    provideAppInitializer(() => {
      const messages = inject(MessageService);
      return messages.loadMessages('/assets/data/messages.json');
    }),
  ],
};
