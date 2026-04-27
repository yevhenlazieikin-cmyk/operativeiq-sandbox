import { DatePipe } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { CURRENT_TIMEZONE } from '../shared/tokens/current-timezone.token';

@Pipe({
  name: 'customDateUtc',
  pure: false
})
export class CustomDateUtcPipe extends DatePipe implements PipeTransform {
  private readonly _currentTZ = inject(CURRENT_TIMEZONE);

  constructor() {
    super(inject(LOCALE_ID));
  }

  public override transform(value: any, format?: string, timezone?: string, locale?: string): any {
    if (value) {
      const aTime = moment.tz(value, 'UTC').clone().tz(moment.tz.guess()).toDate();
      const currentTimezone = this._currentTZ.currentTz;

      const timezoneName = timezone || currentTimezone?.Iana_TimeZoneName;
      if (!timezoneName) {
        return;
      }

      const timezoneOffset = moment(value).tz(timezoneName).format('Z');

      return super.transform(aTime, format, timezoneOffset, locale);
    }

    return '';
  }
}
