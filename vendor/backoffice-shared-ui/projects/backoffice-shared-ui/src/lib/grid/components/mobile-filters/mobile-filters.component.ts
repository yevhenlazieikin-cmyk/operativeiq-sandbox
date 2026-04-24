import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';

import { fromEvent, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';

import { GridHelperService, FilterService, MobileFiltersFocusService } from '../../services';

import { GeneralConst } from '../../constants';
import { FilterData } from '../../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { menuType } from '../../../header/menu-type.enum';

@Component({
  selector: 'bo-mobile-filters',
  standalone: false,
  templateUrl: './mobile-filters.component.html',
  styleUrls: ['./mobile-filters.component.scss']
})
export class MobileFiltersComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() public filterData!: FilterData;
  @Input() public mobileQueryTemplate!: string;
  @Input() public isMobileFilterActive!: boolean;
  @Input() public clearInput!: Observable<boolean>;
  @Input() public serverFiltering = false;
  @Output() public readonly mobileQueryEvent = new EventEmitter<string>();
  @Output() public readonly mobileSearchEvent = new EventEmitter<Record<string, any>>();
  @Output() public readonly sortEvent = new EventEmitter();
  @Output() public readonly filterStateChanged = new EventEmitter<boolean>();
  @Output() public readonly filtersChanged = new EventEmitter<any>();
  @ViewChild('mobileSearchInput', { static: false }) public mobileSearchInput!: ElementRef;

  public filterDialogRef!: MatDialogRef<FilterDialogComponent, any>;
  public mobileSearch!: string;
  public customQuery!: string;
  public readonly menuType = menuType;

  private readonly onDestroy = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly filterService = inject(FilterService);
  private readonly dataHelperService = inject(GridHelperService);
  private readonly _cd = inject(ChangeDetectorRef);
  private readonly mobileFiltersFocusService = inject(MobileFiltersFocusService);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterData']?.currentValue && changes['filterData'].firstChange) {
      if (this.filterData.mobSearch || this.filterData.proceedEmptySearch) {
        this.mobileSearch = this.filterData.mobSearch as any;
        setTimeout(() => this.onMobileSearch());
      }
    }
  }

  public ngOnInit(): void {
    this.clearInput?.pipe(takeUntilDestroyed(this.onDestroy)).subscribe((skipSorting = false) => {
      this.clearMobileFilter(skipSorting);
    });
  }

  public ngAfterViewInit(): void {
    fromEvent<KeyboardEvent>(this.mobileSearchInput.nativeElement, 'keydown')
      .pipe(
        filter((event: KeyboardEvent) => event.key === 'Enter'),
        takeUntilDestroyed(this.onDestroy)
      )
      .subscribe((e: KeyboardEvent) => {
        this.onMobileSearch();
      });
  }

  public onMobileSearch(): void {
    const encodedQuery = this.dataHelperService.prepareForFiltering(this.mobileSearch);
    this.filterData.mobSearch = this.mobileSearch;
    if (this.mobileQueryTemplate) {
      this.customQuery = this.mobileQueryTemplate.replace(/query/g, encodedQuery);
    }
    this.mobileQueryEvent.emit(this.customQuery);
    this.mobileSearchEvent.emit({ search: this.mobileSearch, skipSorting: false });
  }

  public clearMobileFilter(skipSorting: boolean): void {
    this.mobileSearch = '';
    this.customQuery = '';
    this.filterData.mobSearch = '';
    this.mobileQueryEvent.emit(this.customQuery);
    this.mobileSearchEvent.emit({ search: this.mobileSearch, skipSorting });
    this._cd.detectChanges();
  }

  public openFilter(): void {
    this.filterDialogRef = this.dialog.open<FilterDialogComponent>(FilterDialogComponent, {
      panelClass: 'filter-dialog-panel',
      data: { ...this.filterData, isMobileFilterActive: this.isMobileFilterActive }
    });

    this.filterDialogRef.componentInstance.filterParamChanged.pipe(takeUntilDestroyed(this.onDestroy)).subscribe(result => {
      this.filtersChanged.emit(result);
    });

    this.filterDialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.onDestroy))
      .subscribe((result: { isDataChanged: boolean; data: any }) => {
        if (result?.isDataChanged) {
          result.data.inputs = result.data.inputs.map((item: any) => {
            if (typeof item.value === 'string' && !item.value.trim()) {
              return { ...item, value: item.value.trim() };
            } else {
              return item;
            }
          });
          const selectedFilters = result.data.inputs.map((item: any) => ({ ...item }));

          const filters = selectedFilters.map((item: any) => {
            const filterObject: any = {};

            if (item.dataType === 'custom' || item.customFilter) {
              let custom = JSON.parse(item.customFilter);
              custom.find((elem: any) => elem.name === item.name).value = item.value;

              if (item.value) {
                custom = custom.some((elem: any) => elem.status !== undefined)
                  ? custom
                      .filter((x: any) => x.status)
                      .map((x: any) => ({
                        name: x.name,
                        type: x.type,
                        value: this.dataHelperService.prepareForFiltering(x.value),
                        query: x.query || null
                      }))
                  : custom;

                filterObject.customFilter = custom;
              } else {
                filterObject.customFilter = [];
              }
            }

            return { ...filterObject, name: item.name, type: item.dataType, value: item.value };
          });

          if (Object.keys(filters).every(key => !filters[key].value && filters[key].value !== 0)) {
            this.filterService.clear(filters);
            this.isMobileFilterActive = false;
          } else {
            this.filterService.change(filters);
            this.isMobileFilterActive = true;
          }

          this.filterStateChanged.emit(this.isMobileFilterActive);

          const sort: Sort = { active: result.data.sortOptions.value, direction: result.data.sortOptions.order };
          const dataType =
            result.data.inputs.find((item: any) => item.customSortHeading === result.data.sortOptions.value)?.customSortDataType ||
            result.data.inputs.find((item: any) => item.name === result.data.sortOptions.value)?.dataType;
          this.sortEvent.emit({ ...sort, dataType });
        }
      });
  }

  public searchFieldFocusOut(): void {
    this.mobileFiltersFocusService.focused$.next(false);
  }

  public searchFieldFocusIn(): void {
    this.mobileFiltersFocusService.focused$.next(true);
  }
}
