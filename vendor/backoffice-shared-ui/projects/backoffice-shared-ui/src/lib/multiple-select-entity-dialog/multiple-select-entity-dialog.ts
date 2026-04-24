import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogClose } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ODataHelpersService } from '../services/odata-helpers.service';
import { GridCellType } from '../grid/enum';
import { GridModule } from '../grid/grid.module';
import { BaseGridDialog } from '../base-select-entity-dialog/base-grid-dialog';
import { menuType } from '../header/menu-type.enum';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { DialogButton } from '@backoffice/shared-ui/lib/configurable-dialog/configurable-dialog.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DetailsPanel } from '../details-panel/details-panel';

@Component({
  selector: 'app-multiple-select-entity-dialog',
  standalone: true,
  templateUrl: './multiple-select-entity-dialog.html',
  styleUrls: ['./multiple-select-entity-dialog.scss'],
  imports: [
    CommonModule,
    GridModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogClose,
    SvgIconComponent,
    DialogMessagesComponent,
    DetailsPanel
  ]
})
export class MultipleSelectEntityDialog<T extends { id?: number | undefined; checked?: boolean }>
  extends BaseGridDialog<T>
  implements OnInit, OnDestroy
{
  @ViewChild('checkAllRef', { static: true }) public checkAllRef!: TemplateRef<any>;
  @ViewChild('mobExtraHeader', { static: true }) public mobExtraHeader!: TemplateRef<any>;
  @Output() public readonly buttonClicked = new EventEmitter<{ action: string; selectedItems: T[] }>();

  public customUniqId = 'id';
  public override initialData: T[] = this.data.gridOptions.items ? [...this.data.gridOptions.items] : [];
  public selectedItems: T[] = this.data.gridOptions.selectedItems ? [...this.data.gridOptions.selectedItems] : [];
  public checkedAll = false;
  public customFilterQuery!: string;
  public masterCheckboxInProcess = false;
  public accessLockActive = false;
  public menuTypeEnum = menuType;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.appendCheckedSorting();

    if (this.data.gridOptions.filterData?.inputs?.length && this.data.hasMasterCheckbox) {
      this.data.gridOptions.filterData.inputs[0].customTemplate = this.checkAllRef;
    }

    if (this.data.gridOptions.customUniqId) {
      this.customUniqId = this.data.gridOptions.customUniqId;
    }

    const checkboxCell = this.data.gridOptions.cellSchema?.mainRow.find(el => el.type === GridCellType.checkboxText);
    if (checkboxCell) {
      checkboxCell.changeCB = (e, i, row) => this.onChange(e, i, row);
      checkboxCell.style = { ...checkboxCell.style };
    }
    this.updateMasterCheckboxState();

    const panel = this.data.detailsPanel;
    if (panel?.form) {
      const controlName = panel.accessControlName ?? 'allDivisionsAccess';
      const ctl = panel.form.get(controlName);
      if (ctl) {
        this.applyAccessLockMode(ctl.value === true);
        ctl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
          this.applyAccessLockMode(v === true);
        });
      }
    }
  }

  private applyAccessLockMode(lock: boolean): void {
    this.accessLockActive = lock;
    for (const row of this.initialData) {
      const r = row as T & { checked?: boolean; disabled?: boolean };
      if (lock) {
        r.checked = true;
        r.disabled = true;
      } else {
        r.disabled = false;
        r.checked = false;
      }
    }
    this.updateMasterCheckboxState();
    this.cdr.markForCheck();
  }

  public ngOnDestroy(): void {
    this.data.gridOptions.filterData?.inputs.forEach(input => (input.value = ''));
  }

  public onCustomButtonClick(button: DialogButton): void {
    if (button.action === 'cancel') {
      this.dialogRef.close({ action: 'cancel' });

      return;
    }

    const selectedItems = this.initialData.filter(item => item.checked);
    const result = { action: button.action, selectedItems };

    this.buttonClicked.emit(result);

    if (typeof button.actionCallback === 'function') {
      button.actionCallback(result);
    }

    if (!!button.autoClose !== false) {
      this.dialogRef.close(result);
    }
  }

  public onDataChanged(data: T[]): void {
    if (this.initialData.some((item: any) => item.checked)) {
      this.items.forEach((item: any) => {
        const findItem = this.initialData.find((el: any) => el[this.customUniqId] === item[this.customUniqId]);
        if (findItem && findItem.checked) {
          item.checked = true;
        }
      });
    } else {
      this.items.forEach((item: any) => (item.checked = false));
    }

    if (this.data.gridOptions.serviceTitle) {
      const ids = new Set(this.initialData.map((d: any) => d[this.customUniqId]));
      this.initialData = [...this.initialData, ...data.filter((d: any) => !ids.has(d[this.customUniqId]))];
    }
    this.updateMasterCheckboxState();
  }

  public onChange(e: any, i: any, row: any): void {
    row.checked = e.checked;
    const findItem = this.initialData.find((item: any) => item[this.customUniqId] === row[this.customUniqId]);
    if (findItem) {
      findItem.checked = e.checked;
    }

    if (this.data.gridOptions.onCheckboxChange) {
      this.data.gridOptions.onCheckboxChange(row, e.checked);
      if (findItem && findItem !== row) {
        this.data.gridOptions.onCheckboxChange(findItem, e.checked);
      }
    }

    this.updateMasterCheckboxState();
  }

  public itemsSelected(): void {
    const selectedItems = this.initialData.filter(item => item.checked);

    this.dialogRef.close({
      selectedItems
    });
  }

  public checkAll(): void {
    if (this.accessLockActive) {
      return;
    }
    if (this.data.gridOptions.serviceTitle && !this.data.gridOptions.items) {
      this.masterCheckboxInProcess = true;
      this._getAllItems()
        .pipe(
          takeUntilDestroyed(this.destroy$),
          finalize(() => (this.masterCheckboxInProcess = false))
        )
        .subscribe(results => {
          if (this.checkedAll) {
            this.initialData = [...results];
            this.initialData.forEach((el: any) => {
              if (!el.disabled) {
                el.checked = true;
                // Call onCheckboxChange callback if provided
                if (this.data.gridOptions.onCheckboxChange) {
                  this.data.gridOptions.onCheckboxChange(el, true);
                }
              }
            });
            this.items.forEach((el: any) => {
              if (!el.disabled) {
                el.checked = true;
                // Call onCheckboxChange callback if provided
                if (this.data.gridOptions.onCheckboxChange) {
                  this.data.gridOptions.onCheckboxChange(el, true);
                }
              }
            });
          } else {
            this._resetSelected();
          }
        });
    } else {
      if (this.checkedAll) {
        this.initialData.forEach((el: any) => {
          if (!el.disabled) {
            el.checked = true;
            // Call onCheckboxChange callback if provided
            if (this.data.gridOptions.onCheckboxChange) {
              this.data.gridOptions.onCheckboxChange(el, true);
            }
          }
        });
        this.items.forEach((el: any) => {
          if (!el.disabled) {
            el.checked = true;
            // Call onCheckboxChange callback if provided
            if (this.data.gridOptions.onCheckboxChange) {
              this.data.gridOptions.onCheckboxChange(el, true);
            }
          }
        });
      } else {
        this._resetSelected();
      }
    }
  }

  public onFilterQueryChange(query: string): void {
    this.customFilterQuery = query;
  }

  public onCancel(): void {
    this._resetSelected();
  }

  private _getAllItems(): Observable<T[]> {
    return ODataHelpersService.syncData(
      this.data.gridOptions.serviceTitle,
      `${this.customFilterQuery ? this.customFilterQuery : this.data.gridOptions.customQueryInitial}`,
      this.data.gridOptions.serviceMethod
    );
  }

  private _resetSelected(): void {
    const { onCheckboxChange } = this.data.gridOptions;
    this.initialData.forEach((el: any) => {
      if (!el.disabled) {
        el.checked = false;
        if (onCheckboxChange) {
          onCheckboxChange(el, false);
        }
      }
    });
    this.items.forEach((el: any) => {
      if (!el.disabled) {
        el.checked = false;
        if (onCheckboxChange) {
          onCheckboxChange(el, false);
        }
      }
    });
  }

  private updateMasterCheckboxState(): void {
    if (!this.initialData.every(item => item.checked === true)) {
      this.checkedAll = false;
    } else {
      this.checkedAll = true;
    }
  }

  private appendCheckedSorting(): void {
    const { gridOptions } = this.data;
    const filterData = gridOptions?.filterData;
    const sortOptions = filterData?.sortOptions;
    const defaultSort = sortOptions?.default;

    if (gridOptions && filterData && sortOptions && defaultSort && !defaultSort.key.includes('checked')) {
      this.data = {
        ...this.data,
        gridOptions: {
          ...gridOptions,
          filterData: {
            ...filterData,
            sortOptions: {
              ...sortOptions,
              default: {
                direction: `desc,${defaultSort.direction}`,
                key: `checked,${defaultSort.key}`
              }
            }
          }
        }
      };
    }
  }
}
