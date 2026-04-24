import { TemplateRef } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { menuType } from '../../header/menu-type.enum';

import { Observable } from 'rxjs';

// import { InputmaskOptions } from '@ngneat/input-mask/lib/types';

import { FilterFieldTypeEnum } from '../enum';

export interface FilterData {
  filterHeader?: string;
  inputs: FilterDataInputs[];
  mobSearch?: string;
  mobSearchPlaceholder?: string;
  sortOptions: SortOptions;
  isMobileFilterActive?: boolean;
  proceedEmptySearch?: boolean;
  userMenu?: menuType;
  pagination?: { pageIndex: number; pageSize: number; previousPageIndex: number };
}

export interface FilterDataInputs {
  label: string;
  type: FilterFieldTypeEnum;
  options?: any[];
  optionsSortFn?: (a: any, b: any) => number;
  value?: any;
  name: string;
  hasSorting: boolean;
  customSortHeading?: string;
  customSortDataType?: 'boolean' | 'string' | 'date' | 'number' | 'custom' | 'date-time' | 'exact-match-string' | 'number-as-string';
  dataType?: 'multiIds' | 'string' | 'date' | 'number' | 'custom' | 'date-time' | 'exact-match-string' | 'number-as-string';
  valueProperty?: string;
  resizeNameColumn?: string;
  displayProperty?: string;
  style?: Record<string, string | number>;
  hasSearch?: boolean;
  multiple?: boolean;
  itemKeys?: Record<string, string>;
  customFilter?: string;
  placeholder?: string;
  customTemplate?: TemplateRef<any>;
  customClassName?: string;
  icon?: string;
  clearable?: boolean;
  multiIds?: boolean;
  parentFilterFor?: string;
  childFilterFor?: string;
  disabled?: boolean | any;
  hiddenColumn?: boolean;
  // mask?: InputmaskOptions<any>;
  mask?: any;
  highlightSettName?: string;
  childFilterOptions?: {
    getSource(entity: any, parent?: FilterData): Observable<any>;
    sourceIdName?: string;
    sourceName?: string;
  };
  parentFilterOptions?: {
    getSource(entity: any, parent?: FilterData): Observable<any>;
    sourceIdName?: string;
    sourceName?: string;
  };
  customFilterFunction?: (...args: any[]) => boolean;
}

export interface MobSortingOptions {
  value: string;
  id: string;
  dataType: 'multiIds' | 'string' | 'date' | 'number' | 'custom' | 'date-time' | 'boolean' | 'exact-match-string' | 'number-as-string';
}

export interface SortOptions {
  value?: string;
  order?: SortDirection;
  nestedSortKey?: string;
  nestedSortingConditionKeys?: string[];
  hideDirChangeSortKey?: string;
  default: {
    key: string;
    direction: string;
  };
}
