import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BaseFilterSortingService } from './base-filter-sorting.service';
import { ODataHelpersService } from '@backoffice/shared-ui/lib/services/odata-helpers.service';

@Injectable()
export class ServerFilterSortingService<T> extends BaseFilterSortingService<T> {
  public startOfObj: Record<string, { startOf: Date | moment.Moment }> = {};
  public endOfObj: Record<string, { endOf: Date | moment.Moment }> = {};

  //eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(public override injector: Injector) {
    super(injector);
    // this.isDesktop = true;
  }

  // eslint-disable-next-line complexity
  public override getFilteredSortedData({ ...serverOption }): Observable<{ data: T[]; meta?: any }> | Observable<{ data: T; meta?: any }> {
    const {
      cancelCurrentRequest,
      customQueryInitial,
      filterOptions,
      mobileFilterQuery,
      customQueryFilter,
      orderBy,
      orderDirection,
      filterQueryChangeEvent,
      infiniteScroll,
      itemsQuery,
      URLParam,
      serviceTitle,
      serviceMethod
    } = serverOption;

    cancelCurrentRequest();
    for (const key in filterOptions) {
      if (filterOptions[key]?.type === 'date') {
        this.dateHandler(filterOptions[key], key);
      }
    }

    let query = '';
    let filterQuery = customQueryInitial || '';
    let orderQuery = '';
    filterQuery = this._setFilterQuery(filterQuery, filterOptions);

    if (mobileFilterQuery) {
      if (filterQuery.includes('$filter')) {
        filterQuery = `${filterQuery} and ${mobileFilterQuery}`;
      } else {
        filterQuery = `${filterQuery}&$filter=${mobileFilterQuery}`;
      }
    }

    if (filterQuery && filterQuery.toLocaleLowerCase().includes('$orderby') && !filterQuery.toLocaleLowerCase().includes('$filter')) {
      // OrderBy custom filtering
      filterQuery = customQueryFilter ? `${filterQuery}&$filter=${customQueryFilter}` : filterQuery;
    } else if (customQueryFilter) {
      filterQuery = filterQuery ? `${filterQuery} and ${customQueryFilter}` : `$filter=${customQueryFilter}`;
    }
    const directions: string[] = typeof orderDirection === 'string' ? orderDirection.split(',').map(d => d.trim().toLowerCase()) : ['asc'];

    const directionQuery = orderBy
      .split(',')
      .map((prop: string, index: number) => `${prop} ${directions[index] ?? directions[directions.length - 1]}`)
      .join(',');
    orderQuery = orderBy ? `$orderby=${directionQuery}` : '';
    query = `${filterQuery}${filterQuery && orderBy ? '&' : ''}${orderQuery}`;
    filterQueryChangeEvent(query);

    if (infiniteScroll) {
      query = `${itemsQuery}${itemsQuery && query ? '&' : ''}${query}`;
      this.spinnerService.start();

      if (URLParam) {
        return serviceTitle[serviceMethod](query, URLParam).pipe(
          map((data: T[]) => ({ data })),
          finalize(() => this.spinnerService.stop())
        );
      } else {
        return serviceTitle[serviceMethod](query).pipe(
          map((data: T[]) => ({ data })),
          finalize(() => this.spinnerService.stop())
        );
      }
    } else {
      this.spinnerService.start();

      return ODataHelpersService.syncData<any>(serviceTitle, query, serviceMethod).pipe(
        map((data: T[]) => ({ data })),
        finalize(() => this.spinnerService.stop())
      );
    }
  }

  // eslint-disable-next-line complexity
  private _setFilterQuery(query: string, filterOptions: any): string | any {
    let filterQuery = query;
    for (const key in filterOptions) {
      if (filterOptions[key] === null) {
        continue;
      }
      if (key.includes('customFilter')) {
        filterQuery = this.buildCustomFilter(filterQuery, filterOptions[key]);
      } else if (filterOptions[key].type === 'string') {
        filterQuery = `${
          filterQuery ? `${filterQuery} ${filterQuery.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}` : '$filter='
        }contains(tolower(${key}),${filterOptions[key].value.toLowerCase()})`;
      } else if (filterOptions[key].type === 'date') {
        const dateQuery = `${
          this.startOfObj[key].startOf ? `${key} ge ${this.startOfObj[key].startOf}${this.endOfObj[key].endOf ? ' and ' : ''}` : ''
        }${this.endOfObj[key].endOf ? `${key} le ${this.endOfObj[key].endOf}` : ''}`;
        if (this.startOfObj[key].startOf) {
          filterQuery = `${
            filterQuery ? `${filterQuery} ${filterQuery.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}` : '$filter='
          }${dateQuery}`;
        }
      } else if (filterOptions[key].type === 'number') {
        filterQuery = `${
          filterQuery ? `${filterQuery} ${filterQuery.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}` : '$filter='
        }${key} eq ${filterOptions[key].value}`;
      } else if (filterOptions[key].type === 'multiIds') {
        filterQuery = `${
          filterQuery ? `${filterQuery} ${filterQuery.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}` : '$filter='
        }${key} in (${filterOptions[key].value.join(',')})`;
      } else if (filterOptions[key].type === 'number-as-string') {
        filterQuery = `${
          filterQuery ? `${filterQuery} ${filterQuery.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}` : '$filter='
        }contains(cast(${key}, Edm.String),tolower('${filterOptions[key].value.toLowerCase()}'))`;
      } else if (filterOptions[key].type === 'date-time') {
        filterQuery = `${
          filterQuery ? `${filterQuery} ${filterQuery.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}` : '$filter='
        }(${key} ge ${filterOptions[key].value.startDate} and ${key} lt ${filterOptions[key].value.endDate})`;
      }
    }

    return filterQuery;
  }

  private buildCustomFilter(filterQuery: string, filters: any[]) {
    const customFilterParts: any = [];
    if (!filters.length) {
      return filterQuery;
    }
    filterQuery = filterQuery ? `${filterQuery} ${filterQuery.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}` : '$filter=';
    filters.forEach(filter => {
      if (filter.type === 'string') {
        customFilterParts.push(`contains(tolower(${filter.name}),'${filter.value.toLowerCase()}')`);
      } else if (filter.type === 'number') {
        customFilterParts.push(`${filter.name} eq ${filter.value}`);
      } else if (filter.type === 'boolean') {
        customFilterParts.push(`${filter.name} eq ${filter.value}`);
      } else if (filter.type === 'custom') {
        const mapObj: any = {
          name: filter.name,
          value: filter.value
        };

        const query = filter.value ? filter.query.replace(/\b(?:name|value)\b/gi, (matched: string) => mapObj[matched]) : '';
        customFilterParts.push(query);
      }
    });
    filterQuery += `(${customFilterParts.join(' or ')}) `;

    return filterQuery;
  }

  private dateHandler(info: any, key: string) {
    const dateValues = info.highlightSettName
      ? this.filterSelectService.dateHandler(info.value, info.highlightSettName)
      : this.filterSelectService.dateHandler(info.value);
    this.startOfObj[key] = { startOf: dateValues.startOf };
    this.endOfObj[key] = { endOf: dateValues.endOf };
  }
}
