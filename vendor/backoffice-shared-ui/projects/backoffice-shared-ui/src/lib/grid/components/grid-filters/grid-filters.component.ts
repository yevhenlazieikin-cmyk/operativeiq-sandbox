import {
  Component,
  input,
  OnInit,
  output,
  ElementRef,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
  inject,
  AfterViewInit
} from '@angular/core';
import { CustomSort, FilterData, FilterDataInputs } from '../../models';
import { FilterFieldTypeEnum } from '../../enum';
import { menuType } from '../../../header/menu-type.enum';
import { ColumnWidthService } from '../../services/column-width.service';

const MIN_GRID_ROW_WIDTH_PERCENT_WHEN_RESIZE = 5;

@Component({
  selector: 'bo-grid-filters',
  standalone: false,
  templateUrl: './grid-filters.component.html',
  styleUrls: ['./grid-filters.component.scss']
})
export class GridFiltersComponent implements OnInit, AfterViewInit {
  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef<HTMLDivElement>;
  @HostListener('window:resize') windowResize(): void {
    if (this.tableContainer?.nativeElement) {
      const tableEl = this.tableContainer.nativeElement;

      tableEl.style.removeProperty('width');
      tableEl.style.removeProperty('min-width');
      tableEl.style.removeProperty('max-width');

      if (this.rowsContainerElement) {
        this.rowsContainerElement.style.removeProperty('width');
        this.rowsContainerElement.style.removeProperty('min-width');
        this.rowsContainerElement.style.removeProperty('max-width');
      }

      const newContainerWidth = tableEl.offsetWidth;

      if (this.originalContainerWidth === 0) {
        this.tableWidth = newContainerWidth;
        this.originalContainerWidth = newContainerWidth;

        return;
      }

      const ratio = newContainerWidth / this.originalContainerWidth;
      this.columnWidthsPx = new Map(Array.from(this.columnWidthsPx.entries()).map(([name, width]) => [name, width * ratio]));
      if (this.initialColumnWidthsPx.size > 0) {
        this.initialColumnWidthsPx = new Map(Array.from(this.initialColumnWidthsPx.entries()).map(([name, width]) => [name, width * ratio]));
      }
      this.originalContainerWidth = newContainerWidth;
      this.tableWidth = newContainerWidth;

      this.columnDisplayStyles.clear();
      this.columnWidthsPx = new Map(this.initialColumnWidthsPx);
      this.setUpInitialWidth();
      this.cdr.detectChanges();
    }
  }

  public data = input.required<FilterData>();
  public serverFiltering = input<boolean>(false);
  public headerColor = input<string>('');
  public headerTextColor = input<string>('');
  public buttonLabel = input<string>('');
  public userMenu = input<menuType>(menuType.operation);
  public allowFlexRow = input<boolean>(false);
  public readonly sortEvent = output<CustomSort>();

  public readonly actionClick = output<void>();
  public filterFieldType: typeof FilterFieldTypeEnum = FilterFieldTypeEnum;
  public menuType = menuType;

  public hideDirection = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly columnWidthService = inject(ColumnWidthService);
  private readonly minWidthPercent = MIN_GRID_ROW_WIDTH_PERCENT_WHEN_RESIZE;
  private isResizing = false;
  private resizeColumnName = '';
  private resizeSide: 'left' | 'right' = 'right';
  private startX = 0;
  private startWidths = new Map<string, number>();
  private columnWidthsPx = new Map<string, number>();
  private initialColumnWidthsPx = new Map<string, number>();
  private readonly columnDisplayStyles = new Map<string, Record<string, string>>();
  private tableWidth = 0;
  private originalContainerWidth = 0;
  private rowsContainerElement: HTMLElement | null = null;

  public get onlySorting(): boolean {
    return !!this.data()?.inputs.every(item => item.type === FilterFieldTypeEnum.Default);
  }

  private _defaultSortOptions: any;

  public ngOnInit(): void {
    this._defaultSortOptions = { ...this.data().sortOptions };
    this.setUpInitialWidth();
  }

  public ngAfterViewInit(): void {
    if (this.tableContainer?.nativeElement) {
      this.tableWidth = this.tableContainer.nativeElement.offsetWidth;
      this.originalContainerWidth = this.tableWidth;

      this.findRowsContainer();
      this.initializePixelWidths();
      this.initialColumnWidthsPx = new Map(this.columnWidthsPx);
    }
  }

  public onSortChange(data: CustomSort): void {
    if (!data.direction) {
      data = { active: this._defaultSortOptions.default.key, direction: this._defaultSortOptions.default.direction };
      this.data().sortOptions = { ...this._defaultSortOptions, value: data.active, order: data.direction };
      this.hideDirection = true;
    } else if (this.data().sortOptions) {
      this.data().sortOptions = { ...this.data().sortOptions, value: data.active, order: data.direction };
      this.hideDirection = false;
    }
    const dataType = this.findDataType(data.active);
    let updatedData = data;
    if (dataType) {
      updatedData = { ...data, dataType };
    }
    this.sortEvent.emit(updatedData);
  }

  public onActionClick(): void {
    this.actionClick.emit();
  }

  public getColumnStyle(filterInput: FilterDataInputs): Record<string, string | number> {
    const name = this.getColumnName(filterInput);
    const displayStyle = this.columnDisplayStyles.get(name);

    return displayStyle ? { ...filterInput.style, ...displayStyle } : (filterInput.style || {});
  }

  public isColumnResizable(c: FilterDataInputs): boolean {
    return !this.isColumnHidden(c);
  }

  public canResizeLeft(columnName: string): boolean {
    if (!this.allowFlexRow()) {
      return false;
    }
    const resizableNames = this.getResizableColumnNames();
    const position = resizableNames.indexOf(columnName);
    if (position < 0) {
      return false;
    }
    const totalResizable = resizableNames.length;

    return position > 0 && (totalResizable > 2 || position === totalResizable - 1);
  }

  public canResizeRight(columnName: string): boolean {
    if (!this.allowFlexRow()) {
      return false;
    }
    const resizableNames = this.getResizableColumnNames();
    const position = resizableNames.indexOf(columnName);
    if (position < 0) {
      return false;
    }
    const totalResizable = resizableNames.length;

    return position < totalResizable - 1 && (totalResizable > 2 || position === 0);
  }

  public onResizeStart(event: MouseEvent, columnName: string, side: 'left' | 'right'): void {
    if (!this.allowFlexRow()) {
      return;
    }

    const resizableNames = this.getResizableColumnNames();
    if (!resizableNames.includes(columnName)) {
      return;
    }

    const columnToResize = side === 'right' ? columnName : this.getPrevResizableColumnName(columnName);
    if (!columnToResize) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeColumnName = columnToResize;
    this.resizeSide = side;
    this.startX = event.clientX;

    if (this.columnWidthsPx.size === 0) {
      this.initializePixelWidths();
    }

    this.startWidths = new Map(this.columnWidthsPx);

    const onResizeMove = (e: MouseEvent): void => {
      if (!this.isResizing) {
        return;
      }

      const deltaX = e.clientX - this.startX;
      this.updateColumnWidthsPixel(deltaX);
      this.cdr.detectChanges();
    };

    const onResizeEnd = (): void => {
      if (this.columnWidthsPx.size > 0) {
        this.applyDisplayWidths(new Map(this.columnWidthsPx));
      }

      this.isResizing = false;
      this.resizeColumnName = '';
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeEnd);
    };

    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
  }

  private findDataType(type: string): string {
    return this.data().inputs.find(item => item?.customSortHeading === type)?.customSortDataType || '';
  }

  private isColumnHidden(column: FilterDataInputs): boolean {
    if (column.hiddenColumn) {
      return true;
    }
    const { style } = column;
    if (!style) {
      return false;
    }
    const display = String(style['display'] ?? '').toLowerCase();
    const width = String(style['width'] ?? '');

    if (display === 'none' || display === 'hidden' || width === '0') return true;

    return false;
  }

  private getColumnName(column: FilterDataInputs): string {
    return column.resizeNameColumn || column.name;
  }

  private getResizableColumnNames(): string[] {
    const inputs = this.data()?.inputs || [];

    return inputs.filter(i => !this.isColumnHidden(i)).map(e => this.getColumnName(e));
  }

  private getPrevResizableColumnName(columnName: string): string | null {
    const names = this.getResizableColumnNames();
    const pos = names.indexOf(columnName);

    return pos > 0 ? names[pos - 1] : null;
  }

  private setUpInitialWidth(): void {
    const inputs = this.data()?.inputs || [];
    const initialWidthMap = new Map<string, string>();
    inputs.forEach(i => {
      if (this.isColumnHidden(i)) {
        return;
      }
      const columnKey = i.resizeNameColumn || i.name;
      if (columnKey && i.style?.['width']) {
        const width = i.style?.['width'];

        if (columnKey && width) {
          initialWidthMap.set(columnKey, String(width));
        }
      }
    });

    if (initialWidthMap.size > 0) {
      this.columnWidthService.updateColumnWidths(initialWidthMap);
    }
  }

  private parseWidth(width: string): number {
    if (!width) {
      return 0;
    }
    const match = /(\d+\.?\d*)%/.exec(width);

    return match ? parseFloat(match[1]) : 0;
  }

  private updateColumnWidthsPixel(deltaX: number): void {
    if (!this.resizeColumnName) {
      return;
    }

    const widthsPx = new Map(this.startWidths);
    const minWidthPx = (this.minWidthPercent / 100) * this.originalContainerWidth;
    const currentWidth = this.startWidths.get(this.resizeColumnName) ?? 0;
    const newWidth = Math.max(minWidthPx, currentWidth + deltaX);

    widthsPx.set(this.resizeColumnName, newWidth);
    this.applyDisplayWidths(widthsPx);
  }

  private findRowsContainer(): void {
    if (!this.tableContainer?.nativeElement) {
      return;
    }

    let element: HTMLElement | null = this.tableContainer.nativeElement;
    while (element && element.parentElement) {
      element = element.parentElement;
      if (element.classList.contains('grid-container')) {
        this.rowsContainerElement = element;

        return;
      }
    }

    element = this.tableContainer.nativeElement;
    let gridContentElement: HTMLElement | null = null;

    while (element && element.parentElement) {
      element = element.parentElement;
      if (element.classList.contains('grid-content')) {
        gridContentElement = element;
        break;
      }
    }

    if (gridContentElement) {
      const rowsContainer = gridContentElement.querySelector('.grid-container') as HTMLElement;
      if (rowsContainer) {
        this.rowsContainerElement = rowsContainer;
      }
    }
  }

  private initializePixelWidths(): void {
    const inputs = this.data()?.inputs || [];
    this.columnWidthsPx = new Map();

    inputs.forEach(i => {
      if (this.isColumnHidden(i)) {
        return;
      }
      const columnName = this.getColumnName(i);
      const widthStr = i.style?.['width'] || '';
      const widthPercent = this.parseWidth(String(widthStr));
      const widthPx = (widthPercent / 100) * this.originalContainerWidth;

      this.columnWidthsPx.set(columnName, widthPx);
    });
  }

  private applyDisplayWidths(widthsPx: Map<string, number>): void {
    if (!widthsPx || widthsPx.size === 0) {
      return;
    }

    const widthMap = new Map<string, string>();
    const resizableNames = this.getResizableColumnNames();
    const totalWidthPx = resizableNames.reduce((sum, name) => sum + (widthsPx.get(name) ?? 0), 0);
    const widthDifference = Math.abs(totalWidthPx - this.originalContainerWidth);
    const snapThreshold = 25;
    const lastResizableName = resizableNames[resizableNames.length - 1];

    if (totalWidthPx > this.originalContainerWidth && widthDifference <= snapThreshold) {
      this.columnDisplayStyles.clear();
      this.columnWidthsPx = new Map(this.initialColumnWidthsPx);
      this.setUpInitialWidth();
      this.clearContainerWidths();

      return;
    }

    const isExpanded = totalWidthPx > this.originalContainerWidth;

    resizableNames.forEach(name => {
      const widthPx = widthsPx.get(name);
      if (widthPx === undefined) {
        return;
      }
      const widthStr = `${widthPx.toFixed(0)}px`;
      const isLastResizableColumn = name === lastResizableName;

      this.columnDisplayStyles.set(name, {
        width: widthStr,
        'min-width': widthStr,
        'flex-basis': widthStr,
        'flex-shrink': '0',
        'flex-grow': isLastResizableColumn && !isExpanded ? '1' : '0',
        'max-width': isLastResizableColumn && !isExpanded ? 'none' : widthStr
      });

      widthMap.set(name, widthStr);
    });

    this.columnWidthsPx = new Map(widthsPx);

    if (widthMap.size > 0) {
      this.columnWidthService.updateColumnWidths(widthMap);
    }

    this.updateContainerWidths(totalWidthPx);
  }

  private clearContainerWidths(): void {
    if (this.tableContainer?.nativeElement) {
      this.tableContainer.nativeElement.style.removeProperty('width');
      this.tableContainer.nativeElement.style.removeProperty('min-width');
      this.tableContainer.nativeElement.style.removeProperty('max-width');
    }

    if (!this.rowsContainerElement) {
      this.findRowsContainer();
    }

    if (this.rowsContainerElement) {
      this.rowsContainerElement.style.removeProperty('width');
      this.rowsContainerElement.style.removeProperty('min-width');
      this.rowsContainerElement.style.removeProperty('max-width');
    }

    this.cdr.markForCheck();
  }

  private updateContainerWidths(totalWidthPx: number): void {
    const finalWidth = totalWidthPx <= this.originalContainerWidth
      ? this.originalContainerWidth
      : totalWidthPx;

    const widthStr = `${Math.round(finalWidth)}px`;

    if (this.tableContainer?.nativeElement) {
      this.tableContainer.nativeElement.style.setProperty('width', widthStr, 'important');
      this.tableContainer.nativeElement.style.setProperty('min-width', widthStr, 'important');
      this.tableContainer.nativeElement.style.setProperty('max-width', 'none', 'important');
    }

    if (!this.rowsContainerElement) {
      this.findRowsContainer();
    }

    if (this.rowsContainerElement) {
      this.rowsContainerElement.style.setProperty('width', widthStr, 'important');
      this.rowsContainerElement.style.setProperty('min-width', widthStr, 'important');
      this.rowsContainerElement.style.setProperty('max-width', 'none', 'important');
    }

    this.cdr.markForCheck();
  }
}
