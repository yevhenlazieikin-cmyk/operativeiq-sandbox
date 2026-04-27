import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { TimePicker } from '@backoffice/shared-ui/lib/time-picker/time-picker';
import { createCustomElement } from '@angular/elements';

createApplication(appConfig)
  .then(appRef => {
    const customElement = createCustomElement(TimePicker, {
      injector: appRef.injector
    });
    customElements.define('time-picker', customElement);
  })
  .catch(err => console.error('~errorAngular app bootstrap', err));
