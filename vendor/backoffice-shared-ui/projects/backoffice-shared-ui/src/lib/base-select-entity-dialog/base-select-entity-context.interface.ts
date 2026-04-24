import { TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CustomSort, FilterData, GridCell } from './../grid/models';
import { DialogButton } from '../configurable-dialog/configurable-dialog.interface';
import { FieldConfig } from '../details-panel/field-config.interface';
import { menuType } from '../header/menu-type.enum';

export interface MultipleSelectDetailsPanelOptions {
  form: FormGroup;
  fields: FieldConfig[];
  title: string;
  userMenu?: menuType;
  accessControlName?: string;
}

export interface BaseSelectEntityContext<T> {
  hideClearButton?: boolean;
  hideSaveButton?: boolean;
  gridTitle?: string;
  buttons?: DialogButton[];
  title: string;
  subTitle?: string;
  tableDescription?: string;
  gridHeight?: string;
  gridOptions: Partial<SelectDialogGrid<T>>;
  selectButtonTitle?: string;
  classList?: string[];
  primaryButtonHidden?: boolean;
  cancelButtonHidden?: boolean;
  applyButtonHidden?: boolean;
  sortButtonHidden?: boolean;
  mobSubtitle?: string;
  footerButtonStaticWidth?: boolean;
  hasMasterCheckbox?: boolean;
  onlyClose?: boolean;
  gridType: 'SERVER' | 'CLIENT';
  sortColumnName?: string;
  additionalSortColumn?: string;
  menuTypeButtons?: 'OPERATION' | 'ADMINISTRATION';
  customBackPathCB?(): void;
  itemPostProcessingCB?(): void;
  clientGridPagination?: boolean;
  filterOptions?: any;
  columnNameSortAZ?: string;
  columnDirectionSortAZ?: string;
  allowFlexRow?: boolean;
  detailsPanel?: MultipleSelectDetailsPanelOptions;
}

export interface SelectDialogGrid<T> {
  items: T[];
  activeItem: number;
  customQueryInitial: string;
  serviceTitle: any;
  serviceMethod: string;
  serviceSort: boolean;
  itemsPerLoad: number;
  filterData: FilterData;
  scrollWindow: boolean;
  infiniteScroll: boolean;
  mobileContentRef: TemplateRef<any>;
  desktopContentRef: TemplateRef<any>;
  mobileQueryTempKeys: string[];
  mobileSortingCondition: boolean;
  filtersCondition: boolean;
  mobileFilterCondition: boolean;
  orderEvent: Subject<CustomSort>;
  scrollCoordinates: any;
  searchEnum: any;
  customUniqId: string;
  search: string;
  mobileQueryTemplate: string;
  proceedInitQueryOnInit: boolean;
  mobileExtraHeaderRef: TemplateRef<any>;
  cellSchema: GridCell;
  selectedItems: T[];
  onCheckboxChange?: (row: any, isChecked: boolean) => void;
}
