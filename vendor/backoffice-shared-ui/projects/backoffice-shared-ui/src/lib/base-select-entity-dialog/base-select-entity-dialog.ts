import { BreakpointObserver } from '@angular/cdk/layout';
import {
  AfterViewInit,
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
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { GridComponent } from '../grid/grid.component';
import { breakpoints } from '../grid/constants';
import { BaseGridDialog } from './base-grid-dialog';
import { GridModule } from '../grid/grid.module';
import { MatDialogModule } from '@angular/material/dialog';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';

@Component({
  selector: 'bo-base-select-entity-dialog',
  templateUrl: './base-select-entity-dialog.html',
  styleUrls: ['./base-select-entity-dialog.scss'],
  imports: [CommonModule, GridModule, MatDialogModule, OverlayscrollbarsModule, SvgIconComponent, DialogMessagesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseSelectEntityDialog<T extends { id?: number }>
  extends BaseGridDialog<T>
  implements OnInit, AfterViewInit, DoCheck, OnDestroy
{
  @Output() public readonly filtersChanged = new EventEmitter<any>();
  @Output() public readonly headerButtonAction = new EventEmitter<string>();

  @ViewChild('gridRef') public gridRef!: GridComponent;
  public activeItem!: number;
  public scrollSettingsEvent = new Subject<any>();
  public override initialData: T[] = this.data.gridOptions.items ? [...this.data.gridOptions.items] : [];
  public customUniqId!: any | string;
  public desktop = true;

  private readonly iterableDiffer: IterableDiffer<any>;

  private readonly iterableDiffers = inject(IterableDiffers);
  public readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointObserver = inject(BreakpointObserver);

  constructor() {
    super();
    this.iterableDiffer = this.iterableDiffers.find([]).create(undefined);
  }

  public ngOnInit(): void {
    if (this.data.gridOptions.customUniqId) {
      this.customUniqId = this.data.gridOptions.customUniqId;
    } else {
      this.customUniqId = 'id';
    }
    this.setResolution();
    this.disableSubmit = true;

    if (this.data.gridOptions.activeItem) {
      this.activeItem = this.data.gridOptions.activeItem;
      const selectedItem = this.items.find((el: any) => el[this.customUniqId] === this.activeItem);
      this.disableSubmit = !selectedItem;
    }
    this.cdr.detectChanges();
  }

  public onDataChanged(data: T[]): void {
    if (this.data.gridOptions.serviceTitle) {
      const ids = new Set(this.initialData.map((d: any) => d[this.customUniqId]));
      this.initialData = [...this.initialData, ...data.filter((d: any) => !ids.has(d[this.customUniqId]))];
    }
  }

  public onHeaderButtonClick(action: string): void {
    if (action === 'cancel') {
      this.dialogRef.close();
    } else {
      this.headerButtonAction.emit(action);
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

  public ngAfterViewInit(): void {
    if (this.data.gridOptions.activeItem) {
      setTimeout(() => {
        const id = String(this.data.gridOptions.activeItem);
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          this.scrollSettingsEvent.next({ key: 'scrollToCoordinates', value: { x: rect.left, y: rect.top } });
        }
      }, 700);
    }
  }

  public onClick(item: T): void {
    //@ts-expect-error error
    this.activeItem = item[this.customUniqId];
    const selectedItem = this.items.find((el: any) => el[this.customUniqId] === this.activeItem);
    this.disableSubmit = !selectedItem;

    this.itemSelected();
  }

  public itemSelected(): void {
    if (this.activeItem !== undefined && this.activeItem !== null) {
      const selectedItem = this.initialData.find((el: any) => el[this.customUniqId] === this.activeItem);
      this.dialogRef.close({
        selectedItem
      });
    }
  }

  public onFilterChanged(filters: any) {
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
}
