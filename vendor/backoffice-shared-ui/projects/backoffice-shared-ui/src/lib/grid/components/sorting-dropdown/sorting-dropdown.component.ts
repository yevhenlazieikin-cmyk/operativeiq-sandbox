import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CustomSort, FilterData, MobSortingOptions } from '../../models';

@Component({
  selector: 'bo-sorting-dropdown',
  standalone: false,
  templateUrl: './sorting-dropdown.component.html',
  styleUrls: ['./sorting-dropdown.component.scss']
})
export class SortingDropdownComponent implements OnInit {
  @Input() public clearSorting!: Observable<void>;
  @Input() public className!: string;
  @Output() public readonly sortEvent = new EventEmitter<CustomSort>();
  public orderDirection: SortDirection = 'asc';
  public options!: MobSortingOptions[];
  @Input() public set data(value: FilterData) {
    this._data = value;

    this.options = this._data.inputs
      .filter(item => item.hasSorting)
      .map(item => ({
        id: item.customSortHeading || item.name,
        value: item.label,
        dataType: item.customSortDataType || item.dataType
      })) as any;
    this.orderDirection = this.data.sortOptions?.order || this.orderDirection;
  }
  public get data(): FilterData {
    return this._data;
  }

  private _data!: FilterData;
  private readonly _destroy$ = inject(DestroyRef);

  public ngOnInit(): void {
    this.clearSorting?.pipe(takeUntilDestroyed(this._destroy$)).subscribe(() => {
      this.onClearSorting();
    });
  }

  public onClearSorting(): void {
    this.data.sortOptions.value = '';
  }

  public changeOrder(): void {
    this.orderDirection = this.orderDirection === 'desc' ? 'asc' : 'desc';
    this.data.sortOptions.order = this.orderDirection;
    this.sortEvent.emit({
      active: this.data.sortOptions.value!,
      direction: this.orderDirection,
      dataType: this._getCurrentDataType(this.data.sortOptions.value!)
    });
  }

  public onValueChange(sort: any): void {
    this.orderDirection = sort === 'sortOrder' || sort === this.data.sortOptions.hideDirChangeSortKey ? 'asc' : this.orderDirection;
    this.data.sortOptions.order = this.orderDirection;

    this.sortEvent.emit({ active: sort, direction: this.orderDirection, dataType: this._getCurrentDataType(sort) });
  }

  private _getCurrentDataType(value: string): string {
    return (
      (this.data.inputs.find(item => item.name === value)?.customSortDataType as string) ||
      (this.data.inputs.find(item => item.name === value)?.dataType as string)
    );
  }
}
