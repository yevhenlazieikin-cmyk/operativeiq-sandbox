import { TemplateRef } from '@angular/core';

import { ClickableRow } from './grid-cell.interface';
import { InfoTooltip } from './info-tooltip.interface';

export interface MobTileOptions {
  title?: string;
  subTitle?: string;
  titleClass?: {
    classCondition: any;
  };
  subTitleClass?: {
    classCondition: any;
  };
  rowTable?: any[];
  labelValue?: any[];
  editableRow?: any[];
  hasCheckbox?: boolean;
  index?: any;
  subIndex?: any;
  subRow?: SubRow;
  row?: any;
  rightAlign?: RightAlign;
  subRightAlign?: SubRightAlign;
  hasDelete?: boolean;
  deleteIconCondition?: any;
  rowClick?: ClickableRow;
  additionalInfo?: AdditionalInfo[] | Record<string, AdditionalInfo[]>;
  tooltip?: {
    message: ((...args: any[]) => string) | string;
    condition?(row: any): boolean;
    config?: InfoTooltip;
  };
  additionalInfoMobPosition?: 'inside-section' | 'bottom';
  mainClass?: string;
  checkboxCB?(e: any, i: any, row: any): any;
  deleteCB?(...args: any[]): any;
  disableCondition?(row: any, i: any, e: any): any;
}

interface SubRow {
  deleteCB(i: any, j: any, row: any): any;
  deleteIconCondition(row: any): any;
}

interface RightAlign {
  rightAlignText: string;
  classCondition?: any;
  transformDate?: boolean;
  classList?: string[];
  customTemplate?: TemplateRef<any>;
  formatDatePipe?: string;
  tooltip?: {
    message: ((...args: any[]) => string) | string;
    condition?(row: any): boolean;
    config?: InfoTooltip;
  };
}
interface SubRightAlign {
  subRightAlignText: string;
  classCondition?: any;
  classList?: string[];
  transformDate?: boolean;
  customTemplate?: TemplateRef<any>;
  formatDatePipe?: string;
  tooltip?: {
    message: ((...args: any[]) => string) | string;
    condition?(row: any): boolean;
    config?: InfoTooltip;
  };
}
export interface AdditionalInfo {
  displayText: ((...args: any[]) => string) | string;
  classList: string[];
  condition(row: any): boolean;
}
