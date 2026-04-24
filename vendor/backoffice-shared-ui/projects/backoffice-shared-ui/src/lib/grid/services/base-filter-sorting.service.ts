import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterSelectService } from './filter-select.service';
import { SpinnerService } from './spinner.service';

@Injectable()
export abstract class BaseFilterSortingService<T> {
  protected filterSelectService: FilterSelectService;
  protected spinnerService: SpinnerService;

  //eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(public injector: Injector) {
    this.filterSelectService = this.injector.get(FilterSelectService);
    this.spinnerService = this.injector.get(SpinnerService);
  }

  public abstract getFilteredSortedData({ ...args }): Observable<{ data: T[]; meta?: any }> | Observable<{ data: T; meta?: any }>;
}
