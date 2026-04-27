import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  EventEmitter,
  inject,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

import { GridComponent } from '../grid/grid.component';
import { breakpoints } from '../grid/constants';
import { GridModule } from '../grid/grid.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseGridDialog } from '../base-select-entity-dialog/base-grid-dialog';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { SortDialog } from './sort-dialog/sort-dialog';
import { GridCellType, MobGridTileType } from '../grid/enum';
import { FilterDataInputs, MainRow } from '../grid/models';
import * as _ from 'lodash-es';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { menuType } from '../header/menu-type.enum';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';

const CELL_FOR_INDEX: FilterDataInputs = {
  label: '',
  type: 5,
  value: '',
  name: 'sortOrder',
  dataType: 'string',
  hasSorting: false,
  style: { width: '6%' }
};

const ROW_FOR_INDEX: MainRow = {
  type: GridCellType.customView,
  key: 'sortOrder',
  classList: ['semi-bold-font'],
  mobView: {
    type: MobGridTileType.mainTitle
  }
};

@Component({
  selector: 'bo-generic-sort-dialog',
  templateUrl: './generic-sort-dialog.html',
  styleUrls: ['./generic-sort-dialog.scss'],
  imports: [
    CommonModule,
    GridModule,
    CdkDropList,
    CdkDrag,
    MatDialogModule,
    OverlayscrollbarsModule,
    SvgIconComponent,
    DialogMessagesComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericSortDialog<T extends { id?: number }> extends BaseGridDialog<T> implements OnInit, DoCheck, OnDestroy {
  @Output() public readonly filtersChanged = new EventEmitter<any>();
  @Output() public readonly appliedValue = new EventEmitter<any>();
  @ViewChild('gridRef') public gridRef!: GridComponent;
  @ViewChild('indexTempl', { static: true }) public indexTempl!: TemplateRef<any>;

  public scrollSettingsEvent = new Subject<any>();
  public orderEvent = new Subject<any>();
  public override initialData: T[] = this.data.gridOptions.items ? [...this.data.gridOptions.items] : [];
  public readonly tableDescription = this.data?.tableDescription ? this.data.tableDescription : '';
  public customUniqId!: any | string;
  public desktop = true;
  public sortColumnName = 'sortOrder';
  public sortDubleColumnName: any = 'sortOrder';
  public menuTypeEnum = menuType;

  private readonly iterableDiffer: IterableDiffer<any>;

  private readonly iterableDiffers = inject(IterableDiffers);
  public readonly cdr = inject(ChangeDetectorRef);
  public readonly matDialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);

  constructor() {
    super();
    this.iterableDiffer = this.iterableDiffers.find([]).create(undefined);
    this.setSortColumnName();
    this.data.gridOptions.filterData?.inputs.unshift(CELL_FOR_INDEX);
    this.data.gridOptions.cellSchema?.mainRow.unshift(ROW_FOR_INDEX);
  }

  public ngOnInit(): void {
    if (this.data.gridOptions.customUniqId) {
      this.customUniqId = this.data.gridOptions.customUniqId;
    } else {
      this.customUniqId = 'id';
    }

    this.setResolution();
    this.disableSubmit = true;

    this.updateElementSortOrder(true);
    this.setCustomCell();

    this.cdr.detectChanges();
  }

  public onDataChanged(data: T[]): void {
    if (this.data.gridOptions.serviceTitle) {
      const ids = new Set(this.initialData.map((d: any) => d[this.customUniqId]));
      this.initialData = [...this.initialData, ...data.filter((d: any) => !ids.has(d[this.customUniqId]))];
    }
  }

  public ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.items);
    if (changes) {
      this.cdr.detectChanges();
      const ids = new Set(this.initialData.map((d: any) => d[this.customUniqId]));
      this.initialData = [...this.initialData, ...this.items.filter((d: any) => !ids.has(d[this.customUniqId]))];
    }
  }

  public ngOnDestroy(): void {
    this.data.gridOptions.filterData?.inputs.forEach(input => (input.value = ''));
  }

  public onFilterChanged(filters: any): void {
    this.filtersChanged.emit(filters);
  }

  private setResolution(): void {
    this.breakpointObserver
      .observe(`(min-width: ${breakpoints.lg.min}px)`)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe(result => {
        /* TODO commented until mobile approach
        this.desktop = !!result.matches;*/
      });
  }

  private updateElementSortOrder(firstAction?:boolean): void {
    this.items = this.items.map((item: any, index: any) => ({
      ...item,
      [this.sortColumnName]: firstAction ? item[this.sortColumnName].toString() : (index + 1).toString(),
      [this.data.additionalSortColumn || 'sortOrder']: firstAction ? item[this.sortColumnName] : index + 1
    }));
  }

  private setCustomCell(): void {
    const indexRow = this.data.gridOptions.cellSchema?.mainRow.find(item => item.key === this.sortColumnName);
    if (indexRow) {
      indexRow.content = this.indexTempl;
    }
  }

  private setSortColumnName(): void {
    if (this.data?.sortColumnName) {
      this.sortColumnName = this.data.sortColumnName;
      CELL_FOR_INDEX.name = this.data.sortColumnName;
      ROW_FOR_INDEX.key = this.data.sortColumnName;
    }

    const defaultSortColumnName = this.data.gridOptions.filterData?.sortOptions.default.key;
    if (defaultSortColumnName) {
      const sortedColumn = this.data.gridOptions.filterData?.inputs.find(i => i.name === defaultSortColumnName);
      CELL_FOR_INDEX.dataType = sortedColumn?.dataType;
    }
  }

  public drop(event: CdkDragDrop<any>): void {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    this.updateElementSortOrder();
  }

  public save(): void {
    this.dialogRef.close(this.items);
  }

  public apply(): void {
    this.appliedValue.emit(this.items);
  }

  public sort(): void {
    this.data.columnDirectionSortAZ = this.data.columnDirectionSortAZ === 'asc' ? 'desc' : 'asc';
    this.orderEvent.next({
      active: this.data?.columnNameSortAZ,
      direction: this.data.columnDirectionSortAZ
    });
    this.updateElementSortOrder();
  }

  public getDisplayIndex(row: any): number {
    return this.items.findIndex((item: any) => item[this.customUniqId] === row[this.customUniqId]) + 1;
  }

  public openDialog(listItem: any): void {
    const currentIndex = this.items.findIndex((item: any) => _.isEqual(item, listItem));

    const nestedDialog = this.matDialog.open(SortDialog, {
      data: {
        element: listItem,
        currentElementIndex: currentIndex,
        elementsLength: this.items.length
      },
      width: '250px',
      minWidth: 200,
      maxWidth: 300,
      minHeight: '100px',
      disableClose: false,
      autoFocus: false
    });

    nestedDialog.afterClosed().subscribe(result => {
      if (result) {
        moveItemInArray(this.items, result?.previousIndex, result?.updatedIndex);
        this.updateElementSortOrder();
        this.cdr.detectChanges();
      }
    });
  }
}
