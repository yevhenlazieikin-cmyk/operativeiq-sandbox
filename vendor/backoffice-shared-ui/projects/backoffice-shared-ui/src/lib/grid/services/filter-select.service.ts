import { inject, Injectable } from '@angular/core';

import moment from 'moment';
import 'moment-timezone';

import { EmsExpireDateIdEnum, LastCycleCount } from '../enum';
import { SettingHelperService } from './setting-helper.service';
import { CURRENT_TIMEZONE } from '@backoffice/shared-ui/lib/shared/tokens/current-timezone.token';
// import { SettingName } from '../_models/models';

const DAYS_TO_SHOW_EXPIRATION_WARNING = 'Days_To_Show_Expiration_Warning';

@Injectable({
  providedIn: 'root'
})
export class FilterSelectService {
  private readonly settingHelperService = inject(SettingHelperService);
  private readonly _currentTZ = inject(CURRENT_TIMEZONE);

  private readonly defaultFormat = 'YYYY-MM-DD[T]HH:mm:ss[Z]';

  private readonly rangeResult: any = {
    [EmsExpireDateIdEnum.CurrentWeek]: (tz: string) => ({
      startOf: moment().tz(tz).startOf('isoWeek').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('isoWeek').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.NextWeek]: (tz: string) => ({
      startOf: moment().tz(tz).add(1, 'weeks').startOf('isoWeek').format(this.defaultFormat),
      endOf: moment().tz(tz).add(1, 'weeks').endOf('isoWeek').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.LastMonth]: (tz: string) => ({
      startOf: moment().tz(tz).subtract(1, 'months').startOf('month').format(this.defaultFormat),
      endOf: moment().tz(tz).subtract(1, 'months').endOf('month').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.CurrentMonth]: (tz: string) => ({
      startOf: moment().tz(tz).startOf('month').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('month').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.NextMonth]: (tz: string) => ({
      startOf: moment().tz(tz).add(1, 'months').startOf('month').format(this.defaultFormat),
      endOf: moment().tz(tz).add(1, 'months').endOf('month').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.LastQuarter]: (tz: string) => ({
      startOf: moment().tz(tz).subtract(1, 'quarters').startOf('quarter').format(this.defaultFormat),
      endOf: moment().tz(tz).subtract(1, 'quarters').endOf('quarter').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.CurrentQuarter]: (tz: string) => ({
      startOf: moment().tz(tz).startOf('quarter').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('quarter').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.LastYear]: (tz: string) => ({
      startOf: moment().tz(tz).subtract(1, 'years').startOf('year').format(this.defaultFormat),
      endOf: moment().tz(tz).subtract(1, 'years').endOf('year').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.CurrentYear]: (tz: string) => ({
      startOf: moment().tz(tz).startOf('year').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('year').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.NextYear]: (tz: string) => ({
      startOf: moment().tz(tz).add(1, 'years').startOf('year').format(this.defaultFormat),
      endOf: moment().tz(tz).add(1, 'years').endOf('year').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.Last12Month]: (tz: string) => ({
      startOf: moment().tz(tz).subtract(11, 'months').startOf('month').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('month').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.Expired]: (tz: string) => ({
      startOf: moment('1900-01-01').tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.ExpiredBeforeToday]: (tz: string) => ({
      startOf: moment('1900-01-01').tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).add(-1, 'days').endOf('days').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.ExpireNext30Days]: (tz: string) => ({
      startOf: moment().tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).add(30, 'days').endOf('days').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.ExpireNext90Days]: (tz: string) => ({
      startOf: moment().tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).add(90, 'days').endOf('days').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.ExpireNext12Month]: (tz: string) => ({
      startOf: moment().tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).add(12, 'months').startOf('month').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.ExpireOver12Month]: (tz: string) => ({
      startOf: moment().tz(tz).add(12, 'months').startOf('month').format(this.defaultFormat)
    }),
    [EmsExpireDateIdEnum.All]: (tz: string) => ({
      startOf: '',
      endOf: ''
    }),
    [LastCycleCount.countedToday]: (tz: string) => ({
      startOf: moment().tz(tz).startOf('day').format(this.defaultFormat)
    }),
    [LastCycleCount.counted7Days]: (tz: string) => ({
      startOf: moment().tz(tz).subtract(7, 'days').startOf('day').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('day').format(this.defaultFormat)
    }),
    [LastCycleCount.counted30Days]: (tz: string) => ({
      startOf: moment().tz(tz).subtract(30, 'days').startOf('day').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('day').format(this.defaultFormat)
    }),
    [LastCycleCount.counted90Days]: (tz: string) => ({
      startOf: moment().tz(tz).subtract(90, 'days').startOf('day').format(this.defaultFormat),
      endOf: moment().tz(tz).endOf('day').format(this.defaultFormat)
    }),
    [LastCycleCount.notCountedToday]: (tz: string) => ({
      startOf: moment('1900-01-01').tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).subtract(1, 'days').endOf('day').format(this.defaultFormat)
    }),
    [LastCycleCount.notCounted7Days]: (tz: string) => ({
      startOf: moment('1900-01-01').tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).subtract(7, 'days').endOf('day').format(this.defaultFormat)
    }),
    [LastCycleCount.notCounted30Days]: (tz: string) => ({
      startOf: moment('1900-01-01').tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).subtract(30, 'days').endOf('day').format(this.defaultFormat)
    }),
    [LastCycleCount.notCounted90Days]: (tz: string) => ({
      startOf: moment('1900-01-01').tz(tz).format(this.defaultFormat),
      endOf: moment().tz(tz).subtract(90, 'days').endOf('day').format(this.defaultFormat)
    })
  };

  constructor() {}

  public dateHandler(
    value: any,
    settingName: string = DAYS_TO_SHOW_EXPIRATION_WARNING,
    tz = this._currentTZ.currentTz.Iana_TimeZoneName || moment.tz.guess()
  ): any {
    if (Object.values(EmsExpireDateIdEnum).includes(value) || Object.values(LastCycleCount).includes(value)) {
      if (value == EmsExpireDateIdEnum.ExpiredAndExpiredSoon) {
        const daysToExpWarning = this.settingHelperService.getSettingByName(settingName)?.numValue;

        return {
          startOf: moment('1900-01-01').tz(tz).format(this.defaultFormat),
          endOf: moment().tz(tz).add(daysToExpWarning, 'days').endOf('days').format(this.defaultFormat)
        };
      }

      if (value === EmsExpireDateIdEnum.ExpiredSoon) {
        const daysToExpWarning = this.settingHelperService.getSettingByName(settingName)?.numValue;

        return {
          startOf: moment().tz(tz).endOf('day').format(this.defaultFormat),
          endOf: moment().tz(tz).add(daysToExpWarning, 'days').endOf('days').format(this.defaultFormat)
        };
      }

      if (value === EmsExpireDateIdEnum.ExpiredSoonFromToday) {
        const daysToExpWarning = this.settingHelperService.getSettingByName(settingName)?.numValue;

        return {
          startOf: moment().tz(tz).startOf('day').format(this.defaultFormat),
          endOf: moment().tz(tz).add(daysToExpWarning, 'days').endOf('days').format(this.defaultFormat)
        };
      }

      // TODO ndr
      return this.rangeResult[value](tz);
    }
  }
}
