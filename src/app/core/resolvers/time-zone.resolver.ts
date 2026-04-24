import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export interface TimeZoneOption {
  Id: string;
  DisplayName: string;
  Iana_TimeZoneName: string;
}

export const timeZoneResolver: ResolveFn<TimeZoneOption[]> = () =>
  of([
    { Id: 'UTC', DisplayName: 'UTC', Iana_TimeZoneName: 'UTC' },
    { Id: 'EST', DisplayName: 'Eastern Time', Iana_TimeZoneName: 'America/New_York' },
  ]);
