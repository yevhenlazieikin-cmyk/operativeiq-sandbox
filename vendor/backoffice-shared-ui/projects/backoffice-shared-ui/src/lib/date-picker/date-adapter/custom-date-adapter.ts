import { inject, Injectable } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { Moment } from 'moment';
import { SettingHelperService } from '@backoffice/shared-ui/lib/grid/services';

@Injectable()
export class CustomDateAdapter extends MomentDateAdapter {
  public settingsService = inject(SettingHelperService);
  public dateFormat = this.settingsService.getDate().formatAdapter;

  public override parse(value: any, parseFormat: string | string[]): Moment | null {
    return super.parse(value, this.dateFormat);
  }

  public override format(date: Moment, displayFormat: string): string {
    return super.format(date, this.dateFormat);
  }
}
