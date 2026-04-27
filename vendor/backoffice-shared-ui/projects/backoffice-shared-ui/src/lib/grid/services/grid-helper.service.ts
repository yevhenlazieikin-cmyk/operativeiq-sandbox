import { Inject, Injectable } from '@angular/core';
import { CURRENT_TIMEZONE, CurrentTimezoneService } from '../../shared/tokens/current-timezone.token';

@Injectable({
  providedIn: 'root'
})
export class GridHelperService {
  constructor(
    //eslint-disable-next-line @angular-eslint/prefer-inject
    @Inject(CURRENT_TIMEZONE) private readonly _currentTZ: CurrentTimezoneService //    private readonly unitService: UnitService,
  ) {}

  public escapeStr(str: string): string {
    let escapeStr = encodeURIComponent(str);
    escapeStr = escapeStr.replace(new RegExp("'", 'g'), "''");

    return escapeStr;
  }

  public prepareForFiltering(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }
    const trimStr = str.trim().toLowerCase();

    return this.escapeStr(trimStr);
  }
}
