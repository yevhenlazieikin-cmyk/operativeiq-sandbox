import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { BaseFilterSortingService } from './base-filter-sorting.service';

@Injectable()
export class ClientFilterSortingService<T> extends BaseFilterSortingService<T> {
  // @ts-expect-error can show ts error
  //eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(public injector: Injector) {
    super(injector);
    // this.isDesktop = false;
  }

  // eslint-disable-next-line complexity
  public getFilteredSortedData({ ...clientOption }): Observable<{ data: T[]; meta?: any }> {
    const {
      data,
      filterOptions,
      searchEnum,
      orderBy,
      orderDirection,
      sortType,
      sortedDataChange,
      uniqueCompProp,
      sortNestedKey,
      nestedSortingConditionKeys,
      paginationContext
    } = clientOption;

    let { mobileSearch } = clientOption;

    let filters = false;
    let search = false;
    if (Object.keys(filterOptions).length) {
      filters = true;
    }
    if (mobileSearch) {
      search = true;
      mobileSearch = mobileSearch.trim();
    }

    let filteredData: any[] = [];
    if (filters) {
      if (Object.entries(filterOptions).length && Array.isArray(data)) {
        // eslint-disable-next-line complexity
        data.forEach(item => {
          let matches = 0;
          for (const key in filterOptions) {
            if (Object.prototype.hasOwnProperty.call(filterOptions, key)) {
              if (key.includes('customFilter')) {
                if (filterOptions[key].length === 0) {
                  delete filterOptions[key];
                } else {
                  const found = this.clientFoundByCustomFilter(item, filterOptions[key]);
                  matches += found ? 1 : 0;
                }
              } else {
                if (typeof item[key] !== 'undefined') {
                  if (filterOptions[key].type === 'date') {
                    if (this.filterSelectService.dateHandler(filterOptions[key].value).endOf) {
                      matches += moment(item[key]).isBetween(
                        filterOptions[key].highlightSettName
                          ? this.filterSelectService.dateHandler(filterOptions[key].value, filterOptions[key].highlightSettName).startOf
                          : this.filterSelectService.dateHandler(filterOptions[key].value).startOf,
                        filterOptions[key].highlightSettName
                          ? this.filterSelectService.dateHandler(filterOptions[key].value, filterOptions[key].highlightSettName).endOf
                          : this.filterSelectService.dateHandler(filterOptions[key].value).endOf
                      )
                        ? 1
                        : 0;
                    } else {
                      matches += Math.abs(moment().diff(item[key], 'month')) > 12 ? 1 : 0;
                    }
                  } else if (filterOptions[key].type === 'date-time') {
                    matches += filterOptions[key].value.isSame(new Date(item[key]), 'day') ? 1 : 0;
                  } else if (filterOptions[key].type === 'exact-match-string') {
                    matches += this.matchExact(filterOptions[key].value, item[key]) ? 1 : 0;
                  } else if (filterOptions[key].type === 'multiIds') {
                    const filterOptionValue = filterOptions[key].value;
                    matches += filterOptionValue.includes(item[key]);
                  } else if (filterOptions[key].type === 'custom') {
                    matches += filterOptions[key].customFilterFunction(filterOptions[key].value, item[key]);
                  } else {
                    const filterOptionValue = filterOptions[key].value.toString().trim();
                    if (filterOptions[key].type === 'number') {
                      matches +=
                        item[key]?.toString().toLowerCase() === filterOptionValue.toLowerCase() || filterOptionValue === '' ? 1 : 0;
                    } else {
                      matches += item[key]?.toString().toLowerCase().includes(filterOptionValue.toLowerCase()) ? 1 : 0;
                    }
                  }
                }
              }
              if (matches === Object.entries(filterOptions).length) {
                filteredData.push(item);
              }
            }
          }
        });
      } else {
        filteredData = data;
      }
    }

    if (search) {
      const dataArray = filteredData.length || filters ? filteredData : data;
      dataArray.forEach((item: any) => {
        const mapItem: any = {};
        for (const elem in searchEnum) {
          if (Number.isNaN(Number(item))) {
            mapItem[elem] = item[elem];
          }
        }
        const isAdministerSearch = this.isEmptyVialSearch(mobileSearch);
        if (isAdministerSearch) {
          mapItem.isAdministered = true;
        }
        let matches = 0;

        for (const key in mapItem) {
          if (Object.prototype.hasOwnProperty.call(mapItem, key)) {
            if (typeof mapItem[key] === 'boolean') {
              matches = item[key] ? 1 : 0;
            } else {
              matches += item[key]?.toString().toLowerCase().includes(mobileSearch.toLowerCase()) ? 1 : 0;
            }
            if (matches > 0) {
              if (!filteredData.find(elem => elem[uniqueCompProp] === item[uniqueCompProp])) {
                filteredData.push(item);
              }
            } else if (filters) {
              filteredData = filteredData.filter(elem => elem[uniqueCompProp] !== item[uniqueCompProp]);
            }
          }
        }
      });
    }

    if (!search && !filters) {
      filteredData = data;
    }

    if (orderBy) {
      const orderProps = orderBy.split(',').map((prop: any) => (prop as string).trim());
      const directions: string[] =
        typeof orderDirection === 'string' && orderDirection.length > 1
          ? orderDirection.split(',').map(d => d.trim().toLowerCase())
          : ['asc'];

      // eslint-disable-next-line complexity
      filteredData = filteredData.sort((a, b) => {
        for (const [index, prop] of orderProps.entries()) {
          const aSortValue =
            sortNestedKey && a[sortNestedKey] && nestedSortingConditionKeys?.includes(prop) ? a[sortNestedKey][prop] : a[prop];
          const bSortValue =
            sortNestedKey && b[sortNestedKey] && nestedSortingConditionKeys?.includes(prop) ? b[sortNestedKey][prop] : b[prop];
          const type =
            sortType?.split(',')[index] ||
            document.querySelector(`[mat-sort-header="${prop}"]`)?.getAttribute('mat-header-data-type') ||
            typeof aSortValue;

          const isAsc = (directions[index] ?? directions[directions.length - 1]) === 'asc';
          let comparison = 0;

          switch (type) {
            case 'number':
              comparison = this.compare(this.undefToNum(aSortValue), this.undefToNum(bSortValue), isAsc);
              break;
            case 'string':
            case 'exact-match-string':
            case 'multiIds':
              // Select filter headers use dataType multiIds; row values are still comparable as strings.
              comparison = this.compare(this.undefToString(aSortValue).toLowerCase(), this.undefToString(bSortValue).toLowerCase(), isAsc);
              break;
            case 'date':
              const compare = aSortValue ? new Date(this.undefToNum(aSortValue)).getTime() : 0;
              const comparer = bSortValue ? new Date(this.undefToNum(bSortValue)).getTime() : 0;
              comparison = this.compare(compare, comparer, isAsc);
              break;
            case 'boolean':
              comparison = this.compare(+this.undefToNum(aSortValue), +this.undefToNum(bSortValue), isAsc);
              break;
            default:
              comparison = 0;
          }

          if (comparison !== 0) return comparison;
        }

        return 0;
      });
    }

    sortedDataChange(filteredData);

    if (paginationContext) {
      const total = filteredData.length;
      let reqPage = paginationContext.pageIndex || 1;
      const itemsPerPageRaw = paginationContext.pageSize;

      const oldPage = paginationContext.pageIndex;
      if (!Number.isNaN(oldPage)) {
        paginationContext.previousPage = oldPage;
      }

      if (!Number.isFinite(itemsPerPageRaw) || itemsPerPageRaw <= 0) {
        paginationContext.pageIndex = 1;

        return of({ data: filteredData, meta: { totalCount: filteredData.length } });
      }
      const itemsPerPage = Math.max(1, Math.floor(itemsPerPageRaw));
      const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

      if (reqPage < 1) {
        reqPage = 1;
      }
      if (reqPage > totalPages) {
        reqPage = totalPages;
      }

      paginationContext.pageIndex = reqPage;

      const start = (reqPage - 1) * itemsPerPage;
      const endExclusive = Math.min(start + itemsPerPage, total);

      return of({ data: filteredData.slice(start, endExclusive), meta: { totalCount: filteredData.length } });
    } else {
      return of({ data: filteredData, meta: { totalCount: filteredData.length } });
    }
  }

  public clientFoundByCustomFilter(item: any, filters: any[]): boolean {
    return filters.some(filter => {
      if (filter.type === 'string') {
        return item[filter.name].toString().toLowerCase().includes(decodeURIComponent(filter.value.toString()).trim().toLowerCase());
      } else if (filter.type === 'number') {
        return !!item[filter.name].toString().includes(filter.value.toString());
      } else if (filter.type === 'boolean') {
        return item[filter.name].toString() === filter.value.toString();
      }
    });
  }

  public isEmptyVialSearch(query: string): boolean {
    return query.trim() === '' ? false : 'empty vial'.indexOf(query.trim().toLowerCase()) !== -1;
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return a === b ? 0 : (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  private undefToNum(value: any) {
    return typeof value === 'undefined' || value === null ? Number.NEGATIVE_INFINITY : value;
  }

  private undefToString(value: any): string {
    return typeof value === 'undefined' || value === null ? '' : value === '' ? ' ' : value;
  }

  private matchExact(r: string, str: string): boolean {
    const strToLower = str.toLowerCase();
    const rToLower = r.toLowerCase();

    return strToLower === rToLower;
  }
}
