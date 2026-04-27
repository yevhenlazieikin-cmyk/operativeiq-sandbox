import { inject, Injectable, signal } from '@angular/core';
import { MessageService } from './messages.service';
import moment from 'moment-timezone';
import { CURRENT_TIMEZONE, TimeZone } from '../shared/tokens/current-timezone.token';
import { filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

const DEFAULT_TIMEZONE: TimeZone = {
  Iana_TimeZoneName: moment.tz?.guess()
};

export interface getEntityServiceDescriptor {
  service: Record<string, () => Observable<any>>;
  method: string;
}

export class Session {
  access_token!: string;
  refresh_token?: string;
  expires_in!: number;
  initiated!: string;
  firstName!: string;
  lastName!: string;
  userId!: number;
  isSuperAdmin?: boolean;
  customer!: {
    siteId: string;
    identifier: string;
    company: string;
  };
  signalRConnectionId!: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataHelperService {
  public timeZones = signal<TimeZone[]>([]);
  private readonly _currentTZ = inject(CURRENT_TIMEZONE);
  private readonly messageService = inject(MessageService);

  public setDynamicDefaultSiteTimezone(timeZone: getEntityServiceDescriptor): Observable<any> {
    if (timeZone.service && timeZone.method) {
      const timezone = this.timeZones()?.length ? of(this.timeZones()) : timeZone.service[timeZone.method]();

      return timezone.pipe(
        map(tz => ({ defaultTimezone: tz.find((item: { IsServerTimeZone: boolean }) => item.IsServerTimeZone), timeZones: tz })),
        tap(data => {
          this._currentTZ.currentTz = data.defaultTimezone;
          this.timeZones.set(data.timeZones);
        })
      );
    }

    return of(DEFAULT_TIMEZONE);
  }

  public getDynamicDefaultTimezone(timeZone: getEntityServiceDescriptor, supplyRoom: getEntityServiceDescriptor): Observable<any> {
    if (supplyRoom.service && supplyRoom.method && timeZone.service && timeZone.method) {
      return supplyRoom.service[supplyRoom.method]().pipe(
        map((x: any) => x?.filter((y: any) => y.DefaultRoom)[0]),
        switchMap((defaultRoom: any) => {
          const timezone = this.timeZones()?.length ? of(this.timeZones()) : timeZone.service[timeZone.method]();

          return timezone.pipe(map(tz => ({ timeZones: tz, defaultRoom })));
        }),
        map((data: { timeZones: TimeZone[]; defaultRoom: any }) => ({
          defaultTimezone: data.timeZones?.filter((tz: any) => tz.Id === data.defaultRoom?.TimeZoneId)[0],
          timeZones: data.timeZones
        }))
      );
    }

    return of({ defaultTimezone: DEFAULT_TIMEZONE, timeZones: [] });
  }

  public setDynamicDefaultTimeZone(
    timeZone: getEntityServiceDescriptor,
    supplyRoom: getEntityServiceDescriptor
  ): Observable<{ defaultTimezone: TimeZone; timeZones: TimeZone[] }> {
    return this.getDynamicDefaultTimezone(timeZone, supplyRoom).pipe(
      tap(data => {
        this._currentTZ.currentTz = data.defaultTimezone;
        this.timeZones.set(data.timeZones);
      })
    );
  }

  public setDynamicSupplyRoomTimeZone(supplyRoomId: number, timeZone: getEntityServiceDescriptor, supplyRoom: getEntityServiceDescriptor) {
    if (supplyRoom.service && supplyRoom.method && timeZone.service && timeZone.method) {
      return supplyRoom.service[supplyRoom.method]().pipe(
        map((x: any) => x?.filter((y: any) => y.Id === supplyRoomId)[0]),
        switchMap((defaultRoom: any) => {
          const timezone = this.timeZones()?.length ? of(this.timeZones()) : timeZone.service[timeZone.method]();

          return timezone.pipe(map(tz => ({ timeZones: tz, defaultRoom })));
        }),
        map((data: { timeZones: TimeZone[]; defaultRoom: any }) => ({
          defaultTimezone: data.timeZones?.filter((tz: any) => tz.Id === data.defaultRoom?.TimeZoneId)[0],
          timeZones: data.timeZones
        })),
        tap(data => {
          this._currentTZ.currentTz = data.defaultTimezone;
          this.timeZones.set(data.timeZones);
        })
      );
    }

    return of({ defaultTimezone: DEFAULT_TIMEZONE, timeZones: [] });
  }

  public setDynamicUnitTimeZone(
    unitId: number,
    timeZone: getEntityServiceDescriptor,
    unitService: getEntityServiceDescriptor,
    supplyRoom: getEntityServiceDescriptor
  ) {
    if (unitService.service && unitService.method && timeZone.service && timeZone.method && supplyRoom.service && supplyRoom.method) {
      const supplyRoom$ = supplyRoom.service[supplyRoom.method]();
      const unit$ = unitService.service[unitService.method]();

      return forkJoin([supplyRoom$, unit$]).pipe(
        map(([sr, units]) => {
          const unit = units.filter((unt: { Id: number }) => unt.Id === unitId)[0];
          if (unit) {
            const unitSR = sr.filter((room: { Id: number }) => room.Id === unit.RoomId)[0];

            return unitSR;
          }

          return of(null);
        }),
        switchMap((defaultRoom: any) => {
          const timezone = this.timeZones()?.length ? of(this.timeZones()) : timeZone.service[timeZone.method]();

          return timezone.pipe(map(tz => ({ timeZones: tz, defaultRoom })));
        }),
        map((data: { timeZones: TimeZone[]; defaultRoom: any }) => ({
          defaultTimezone: data.timeZones?.filter((tz: any) => tz.Id === data.defaultRoom?.TimeZoneId)[0],
          timeZones: data.timeZones
        })),
        tap(data => {
          this._currentTZ.currentTz = data.defaultTimezone;
          this.timeZones.set(data.timeZones);
        })
      );
    }

    return of({ defaultTimezone: DEFAULT_TIMEZONE, timeZones: [] });
  }

  public setStaticSupplyRoomTimeZone(supplyRoomId: number, timeZones: any[], supplyRooms: any) {
    const defaultRoom = supplyRooms.filter((room: { Id: number }) => room.Id === supplyRoomId)[0];
    const defaultTimezone = timeZones.filter((tz: { Id: number }) => tz.Id === defaultRoom.TimeZoneId)[0];

    this._currentTZ.currentTz = defaultTimezone;
    this.timeZones.set(timeZones);

    return defaultTimezone;
  }

  public setStaticDefaultSiteTimezone(timeZones: any[]) {
    const defaultTimezone = timeZones.find((item: { IsServerTimeZone: boolean }) => item.IsServerTimeZone);

    this._currentTZ.currentTz = defaultTimezone;
    this.timeZones.set(timeZones);

    return defaultTimezone;
  }

  public setStaticDefaultTimeZone(timeZones: any[], supplyRooms: any[]) {
    const defaultRoom = supplyRooms.filter((room: { DefaultRoom: boolean }) => room.DefaultRoom)[0];
    const defaultTimezone = timeZones.filter((tz: { Id: number }) => tz.Id === defaultRoom?.TimeZoneId)[0];

    this._currentTZ.currentTz = defaultTimezone;
    this.timeZones.set(timeZones);

    return defaultTimezone;
  }

  public setStaticUnitTimeZone(unitId: number, timeZones: any[], units: any[], supplyRooms: any[]) {
    const unit = units.filter((unt: { Id: number }) => unt.Id === unitId)[0];
    if (unit) {
      const unitSupplyRoom = supplyRooms.filter((room: { Id: number }) => room.Id === unit.RoomId)[0];
      const defaultTimezone = timeZones.filter((tz: { Id: number }) => tz.Id === unitSupplyRoom?.TimeZoneId)[0];

      this._currentTZ.currentTz = defaultTimezone;
      this.timeZones.set(timeZones);

      return defaultTimezone;
    }
  }

  public getDateInTimeZone(timeZoneId: number, timeZones: any[]): Date {
    const timeZone = timeZones.filter((tz: any) => tz.Id == timeZoneId)[0] ?? '';

    return new Date(moment.tz(timeZone.Iana_TimeZoneName).format('YYYY-MM-DDTHH:mm:ss'));
  }

  public getSomeUTCDateInTimeZone(dateTime: string, timeZoneId: number, timeZones: any[]): Date {
    const timeZone = timeZones.find(tz => tz.Id === timeZoneId);

    if (!timeZone?.Iana_TimeZoneName) {
      throw new Error(this.messageService.get('INVALID_TIMEZONE'));
    }

    // Parse the UTC ISO string and convert to the target timezone
    // moment.utc() parses the string as UTC, then .tz() converts it to the target timezone
    return moment.utc(dateTime).tz(timeZone.Iana_TimeZoneName).toDate();
  }

  public getServerTzName(timeZones: any[]): string {
    const serverTzName = timeZones?.filter((x: any) => x.IsServerTimeZone == true)[0]?.Iana_TimeZoneName || moment.tz.guess();

    return serverTzName;
  }
}
