import { Injectable } from '@angular/core';
import moment from 'moment';

/**
 * Sandbox shim for task-list-fe's SettingHelperService. Skills call
 * `getDate()` to format dates against the user's preferred timezone; we
 * just return the local-time moment.
 */
@Injectable({ providedIn: 'root' })
export class SettingHelperService {
  getDate(value?: string | Date | moment.Moment | null): moment.Moment {
    return moment(value ?? undefined);
  }

  getDateFormat(): string {
    return 'MM/DD/YYYY';
  }

  getTimeFormat(): string {
    return 'HH:mm';
  }
}
