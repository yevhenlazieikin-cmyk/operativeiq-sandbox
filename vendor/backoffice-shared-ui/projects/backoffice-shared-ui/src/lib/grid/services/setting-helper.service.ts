import { Injectable } from '@angular/core';

interface DateFormat {
  locale: string;
  formatAdapter: string;
  formatPipe: string;
  formatPipeFull: string;
  formatPipeShort: string;
  formatPipeDateTime: string;
}

export const DATE_FORMAT = 'Date_Format';

@Injectable({
  providedIn: 'root'
})
export class SettingHelperService {
  private _settings: Record<string, boolean> | undefined;
  constructor() {}

  public setSettings(settings: Record<string, boolean>) {
    this._settings = settings;
  }

  getSettingByName(name: string, settings?: Record<string, boolean>): any {
    this._settings = settings || this._settings;
    if (!this._settings) {
      return;
    }
    const value = this._settings[name];

    if (value === undefined || value === null) {
      return;
    }

    return {
      value,
      boolValue: value,
      numValue: value ? +value : null
    };
  }

  getDate(): DateFormat {
    const value = this.getSettingByName(DATE_FORMAT)?.boolValue;

    if (value === undefined || value === null) {
      return {
        locale: 'en-us',
        formatAdapter: 'MM/DD/YYYY',
        formatPipe: 'MM/dd/yyyy',
        formatPipeFull: 'MM/dd/yyyy hh:mm:ss a',
        formatPipeShort: 'MM/dd/yyyy h:mm a',
        formatPipeDateTime: 'MM/dd/yyyy hh:mm a'
      };
    }

    return {
      locale: value ? 'en-gb' : 'en-us',
      formatAdapter: value ? 'DD/MM/YYYY' : 'MM/DD/YYYY',
      formatPipe: value ? 'dd/MM/yyyy' : 'MM/dd/yyyy',
      formatPipeFull: value ? 'dd/MM/yyyy hh:mm:ss a' : 'MM/dd/yyyy hh:mm:ss a',
      formatPipeShort: value ? 'dd/MM/yyyy h:mm a' : 'MM/dd/yyyy h:mm a',
      formatPipeDateTime: value ? 'dd/MM/yyyy hh:mm a' : 'MM/dd/yyyy hh:mm a'
    };
  }

  public getStandardFormat(): string {
    return 'YYYY-MM-DDTHH:mm:ss.SSS';
  }
}
