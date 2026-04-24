import { InjectionToken } from '@angular/core';

export interface TimeZone {
  Id?: number;
  Abr?: string;
  GMT?: number;
  IsServerTimeZone?: boolean;
  timeZoneListId?: number;
  MicrosoftTimeZoneName?: string;
  Iana_TimeZoneName?: string;
}

export class CurrentTimezoneService {
  public currentTz!: TimeZone;
}

export const CURRENT_TIMEZONE = new InjectionToken<CurrentTimezoneService>('CurrentTimezone', {
  providedIn: 'root',
  factory: () => new CurrentTimezoneService()
});
