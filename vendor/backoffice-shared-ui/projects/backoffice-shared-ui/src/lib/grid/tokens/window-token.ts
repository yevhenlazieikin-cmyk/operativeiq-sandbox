import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

/**
 * @description
 * Token for inject browser `window` object into service or component
 *
 * @usage
 * Use browser window object in component or service:
 * ```
 * import { Inject, Injectable } from '@angular/core';
 * import { WINDOW } from '@app/core/utils/window-token';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(@Inject(WINDOW) private readonly window: Window) {}
 *   // now `this.window` represent browser's window object
 * }
 * ```
 */
export const WINDOW = new InjectionToken<Window>('An abstraction over global window object', {
  factory: () => {
    const { defaultView } = inject(DOCUMENT);

    if (!defaultView) {
      throw new Error('Window is not available');
    }

    return defaultView;
  }
});
