import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { Subject } from 'rxjs';
import * as _ from 'lodash-es';
import { FilterData, FilterDataInputs } from '../../models';
import { FilterFieldTypeEnum } from '../../enum';

@Component({
  selector: 'bo-filter-dialog',
  standalone: false,
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit {
  @Output() public readonly filterParamChanged = new EventEmitter<FilterData>();

  public filterFieldType: typeof FilterFieldTypeEnum = FilterFieldTypeEnum;
  public clearSortingEvent = new Subject<void>();
  public isMobileFilterActive: boolean | undefined;

  public dialogRef = inject(MatDialogRef<FilterDialogComponent>);
  public data = inject<FilterData>(MAT_DIALOG_DATA);

  private isDataChanged = false;
  private _prevFilterData: Record<string, any>[] = [];
  private _prevSortOptions!: {
    value?: string;
    order?: SortDirection;
  };

  ngOnInit(): void {
    this.isMobileFilterActive = this.data.isMobileFilterActive;
    this._setPreviousData();
  }

  public onSelectionChange(e: any): void {
    this.isDataChanged = true;
    this.filterParamChanged.emit(this.data);
  }

  public onClear(name: string): void {
    const clearedSelect = this.data.inputs.find(item => item.name === name);
    if (clearedSelect) {
      clearedSelect.value = '';
      this.filterParamChanged.emit(this.data);
    }
  }

  public onInputChange(input: FilterDataInputs): void {
    this.isDataChanged = true;

    if (input.customFilter) {
      const customFilter = JSON.parse(input.customFilter);
      if (customFilter) {
        this.prepareFilterData(input, customFilter);
      }
    }
  }

  public clearFields(): void {
    this.data.inputs.forEach(input => {
      input.value = '';
    });

    this.isDataChanged = true;

    this.dialogRef.close({ isDataChanged: this.isDataChanged, data: this.data });
  }

  public applyFilter(): void {
    this.isDataChanged = true;
    this._setPreviousData();

    this.dialogRef.close({ isDataChanged: this.isDataChanged, data: this.data });
  }

  public onCancel(): void {
    if (!this.isMobileFilterActive) {
      this.data.inputs.forEach(input => {
        input.value = '';
      });
    } else {
      if (!this._checkIfDataChanged()) {
        this.data.inputs.forEach(item => {
          const input = this._prevFilterData.find(elem => elem['name'] === item.name);
          if (input) {
            item.value = input['value'];
          }
        });
      }
    }

    if (!_.isEqual(this._prevSortOptions, this.data.sortOptions)) {
      this.data.sortOptions.value = this._prevSortOptions.value;
      this.data.sortOptions.order = this._prevSortOptions.order;
    }

    this.isDataChanged = false;
    this.dialogRef.close({ isDataChanged: this.isDataChanged, data: this.data });
  }

  private prepareFilterData(input: any, customFilter: any) {
    if (customFilter !== undefined && Array.isArray(customFilter)) {
      customFilter.forEach(filter => {
        filter.status = true;
        if (filter.condition) {
          if (!eval(filter.condition.replace('<value>', input.value))) {
            filter.status = false;
          }
        } else {
          filter.value = input.value;
        }
      });

      input.customFilter = JSON.stringify(customFilter);
    } else {
      delete input.customFilter;
    }
  }

  private _checkIfDataChanged(): boolean {
    return this._prevFilterData.every(item => {
      const input = this.data.inputs.find(elem => elem.name === item['name']);

      return !!(item['value'] === input?.value);
    });
  }

  private _setPreviousData(): void {
    this._prevFilterData = this.data.inputs.map(item => ({
      name: item.name,
      value: item.value
    }));

    if (this.data.sortOptions) {
      this._prevSortOptions = { ...this.data.sortOptions };
    }
  }
}
