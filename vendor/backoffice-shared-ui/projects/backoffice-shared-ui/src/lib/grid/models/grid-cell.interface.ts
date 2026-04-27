import { TemplateRef } from '@angular/core';

import { GridCellType, MobGridTileType } from '../enum';
import { InfoTooltip } from './info-tooltip.interface';

export interface GridCell {
  mainRow: MainRow[];
  subRow?: MainRow[];
  onClick?: ClickableRow;
}

export interface MainRow {
  type: GridCellType;
  key?: string;
  mobView?: MobView;
  resizeNameColumn?: string;
  style?: Record<string, string | number>;
  classList?: string[];
  classCondition?: Record<string, (...args: any) => boolean>;
  maxValue?: number | ((...args: any) => number);
  minValue?: number | ((...args: any) => number);
  inputFocusClass?: string[];
  iconName?: string;
  dataAttribute?: string;
  hasSearch?: boolean;
  options?: any[];
  valueProperty?: string;
  displayProperty?: string;
  additionalInfo?: {
    displayText: ((...args: any) => string) | string;
    classList: string[];
    condition(row: any): boolean;
  }[];
  tooltipInfo?: {
    message: ((...args: any) => string) | string;
    condition?(row: any): boolean;
    config?: InfoTooltip;
  };
  additionalInfoMobPosition?: 'inside-section' | 'bottom';
  conditionTypes?: {
    trueCondition: GridCellType;
    falseCondition: GridCellType;
  };
  content?: TemplateRef<any>;
  placeholder?: string;
  formatDatePipe?: string;
  useCustomPipe?: boolean;
  showTimeZone?: boolean;
  changeCB?(...args: any): void;
  removeRow?(...args: any): void;
  disableCondition?(...args: any): boolean;
  errorCondition?(...args: any): boolean;
  condition?(...args: any): boolean;
  onFocusOut?(...args: any): void;
  onBlurCB?(...args: any): void;
  typeCondition?(...args: any): boolean;
  searchCB?(...args: any): void;
  iconClickCB?(...args: any): void;
}

export interface MobView {
  type: MobGridTileType;
  mobDef?: string;
  mobDefCondition?(row: any): boolean;
  order?: number;
  conditionTypes?: {
    trueCondition: MobGridTileType;
    falseCondition: MobGridTileType;
  };
  hideZero?: boolean;
  showEmptyLabelValue?: boolean;
  twoEntitiesKeys?: string[];
  twoEntitiesLabels?: string[];
  twoEntitiesOrder?: number[];
  additionalInfoMobKey?: string;
}

export interface ClickableRow {
  allRowClickable?: boolean;
  condition(...args: any): boolean;
  onClickCB(...args: any): any;
}

export interface SelectedRow {
  activeRow: string[] | number[];
  rowId: string;
  activeRowColor?: string;
}
