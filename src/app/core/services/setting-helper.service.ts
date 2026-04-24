import { Injectable } from '@angular/core';
import moment from 'moment';

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
