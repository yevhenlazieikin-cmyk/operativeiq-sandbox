import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  input,
  Input,
  IterableDiffer,
  IterableDiffers,
  KeyValueDiffers,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import * as _ from 'lodash-es';
import moment from 'moment';

import { StickyHeaderDirective } from './directives';
import {
  ClientFilterSortingService,
  ServerFilterSortingService,
  FilterSelectService,
  BaseFilterSortingService,
  SpinnerService,
  FilterService,
  GridHelperService,
  UpdatePaginationService,
  ColumnWidthService
} from './services';

import { breakpoints } from './constants';
import { FilterData, PaginationInterface, SelectedRow } from './models';
import { FilterFieldTypeEnum } from './enum';
import { ODataHelpersService } from '../services/odata-helpers.service';
import { menuType } from '../header/menu-type.enum';
import { ClearFilters } from '@backoffice/shared-ui/lib/grid/models/clear-filters.interface';

/**
 *@description
 * Grid component with desktop and mobile view and general server and client filter and sorting functions.
 *
 * @usageNotes
 * Example of usage can find in UnitDetailsComponent.
 * Base example
 * Component includes desktop and mobile view. Desktop view uses <ng-content><ng-content> content projection. Mobile template should
 * pass as @Input() mobileContentRef property:
 *
 *       <app-grid
 *         [(sortedDataStore)]="sortedData"
 *         [serviceTitle]="serviceTitle"
 *         [serviceMethod]="serviceMethod"
 *         [URLParam]="URLParam"
 *         [itemsPerLoad]="itemsPerLoad"
 *         (sortedDataChange)="itemsLoaded($event)"
 *         [customQueryFilter]="customQueryFilter"
 *         [customQueryEvent]="customQueryEvent.asObservable()"
 *         [infiniteScroll]="true"
 *         [filterOptions]="filterOptions"
 *         [mobileFilterQuery]="mobileFilterQuery"
 *         [mobileQueryTemplate]="mobileQueryTemplate"
 *         [filtersIncluded]="true"
 *         [filterData]="filterData$ | async"
 *         [mobileContentRef]="mobileContent"
 *         (mobileInfiniteDataEvent)="itemsLoaded($event)"
 *         [mobileQueryTempKeys]="mobileQueryTempKeys" // for search component
 *         [mobileSortingCondition]="true/false"       // "Sort panel" visibility
 *       >
 *       <!-- desktop template here-->
 *       </app-grid>
 *
 *       <ng-template #mobileContent>
 *          <!-- mobile template here-->
 *       </ng-template>
 *
 * Component can use filters inside itself. For this should pass [filtersIncluded]="true" and [filterData]="filterData$ | async" properties.
 * filterData$ type is Observable<FilterData>. Base on FilterData object will be created grid and mobiles filters.
 *
 *  interface FilterData {
 *   filterHeader: string;
 *   inputs: FilterDataInputs[];
 * }
 *
 * interface FilterDataInputs {
 *   label: string;
 *   type: FilterFieldTypeEnum;
 *   options?: any[]; - select options
 *   value?: any;
 *   name: string;
 *   hasSorting: boolean;
 *   customSortHeading?: string; - use custom sort heading if sorting parameter is not equal to input name
 *   dataType?: 'multiIds' | 'string' | 'date' | 'number' | 'custom';
 *   valueProperty?: string; - custom value property for <app-search-component>
 *   displayProperty?: string; - custom display property for <app-search-component>
 *   style: { [key: string]: string }; - styles object for table header td
 *   hasSearch?: boolean; - select search function
 *   multiple?: boolean; - multiple select
 *   itemKeys?: { [key: string]: string }; - custom value and display property for FilterSelectComponent
 *   customFilter?: string;
 * }
 *
 * If you want to use client filtering/sorting pass [outerService]="true". In this case will create provider for
 * BaseFilterSortingService using ClientFilterSortingService otherwise ServerFilterSortingService.
 */

const filterSortingFactory = (serverService: any, clientService: any, self: GridComponent) =>
  self.outerService ? clientService : serverService;

/** TODO mocked total count until we have total in responce */
const BASIC_TOTAL_COUNT_FOR_PAGINATION = 0;

@Component({
  selector: 'bo-grid',
  standalone: false,
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  providers: [
    {
      provide: BaseFilterSortingService,
      useFactory: filterSortingFactory,
      deps: [ServerFilterSortingService, ClientFilterSortingService, GridComponent]
    },
    FilterService,
    ColumnWidthService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
export class GridComponent implements OnInit, OnChanges, DoCheck {
  @ViewChild(StickyHeaderDirective) public stickyHeader!: StickyHeaderDirective;
  gridData = [];
  sortedData = [];
  sortedDataItems = [];
  orderBy = '';
  orderDirection = '';
  skip = 0;
  itemsQuery = '';
  initialQuery = true;
  notAllData = true;
  spinnerDisabled!: boolean;
  startOf: any;
  endOf: any;
  scrollSettingsEventGrid: Subject<any> = new Subject<any>();
  loadItemsEvent: Subject<any> = new Subject<any>();
  public clearInput = new Subject<boolean>();
  orderFirstTime = true;
  changeEventSubscription!: Subscription;
  clearEventSubscription!: Subscription;
  resetEventSubscription!: Subscription;
  scrollSettingsEventSubscription!: Subscription;
  currentSubscription: any;
  //  set desktop is true as default
  public desktop = true;
  public mobileSearch!: string;
  public isMobileFilterActive!: boolean;
  public sortDataType!: string;
  public elementCount = signal<number>(BASIC_TOTAL_COUNT_FOR_PAGINATION);

  disabled = false;

  @Output() public readonly sortedDataStoreChange = new EventEmitter();
  @Output() public readonly sortedDataChange = new EventEmitter();
  @Output() public readonly filterQueryChange = new EventEmitter();
  @Output() public readonly detectChanges = new EventEmitter();
  @Output() public readonly updateInfiniteData = new EventEmitter();
  @Output() public readonly mobileInfiniteDataEvent = new EventEmitter();
  @Output() public readonly mobileSearchEvent = new EventEmitter<string>();
  @Output() public readonly mobileQueryEvent = new EventEmitter<string>();
  @Output() public readonly filtersChanged = new EventEmitter<any>();
  @Output() public readonly serverPageEvent = new EventEmitter<PaginationInterface>();
  @Output() public readonly serverSortEvent = new EventEmitter<{ active: string; direction: string }>();
  @Output() public readonly actionClick = new EventEmitter<void>();
  @Input() public orderEvent!: Observable<Sort>;
  @Input() public resetEvent!: Observable<any>;
  @Input() public customQueryEvent!: Observable<any>;
  @Input() public scrollSettingsEvent!: Observable<any>;
  @Input() public clearAllFilters!: Observable<ClearFilters>;
  @Input() public mobileQueryTemplate!: string;
  @Input() public mobileFilterQuery: string | null = null;
  @Input() public itemsPerLoad = 50;
  @Input() public outerService = false;
  @Input() public filterOptions: Partial<{ customFilter: any[] }> & Record<string, any> = {};
  @Input() public customQueryFilter = '';
  @Input() public customQueryInitial = '';
  @Input() public serviceTitle: any;
  @Input() public serviceSort: any;
  @Input() public filterData: FilterData | any;
  public serviceMethod = input<any>();
  public URLParam = input<any>();
  public customQuerySingle = input<string>('');
  public customQueryHeaders = input<any[]>([]);
  public scrollWindow = input<boolean>(true);
  public infiniteScroll = input<boolean>(false);
  public filtersIncluded = input(false);
  public mobileContentRef = input<TemplateRef<any>>();
  public mobileQueryTempKeys = input<string[]>([]);
  public searchEnum = input<any>();
  public mobileFilterCondition = input<boolean>(true);
  public mobileSortingCondition = input<boolean>(true);
  public filtersCondition = input<boolean>(false);
  public searchCompareProp = input<string>('id');
  public mobTemplContext = input<any>(null);
  public proceedInitQueryOnInit = input<boolean>(true);
  public generalView = input<boolean>(false);
  public originalWrapperHeight = input<boolean>(false);
  public outerSearch = input<boolean>();
  public gridId = input<string>('grid');
  public gridType = input.required<'SERVER' | 'CLIENT' | 'CUSTOM_SERVER'>();
  public clientGridPagination = input(false);
  public headerColor = input<string>('');
  public headerTextColor = input<string>('');
  public customActionTemplate = input<any>();
  public customMiddleTemplate = input<any>();
  public buttonLabel = input<string>('');
  public userMenu = input<menuType>(menuType.operation);
  public initialPageSize = input<number>(25);
  public allowFlexRow = input<boolean>(false);
  public includeOuterFilter = input<boolean>(false);
  public selectedRow = input<SelectedRow | null>(null);
  private fullFilteredCount = 0;
  private isInternalUpdate = false;
  private isFilteringInProgress = false;
  private filteringCallCount = 0;
  private readonly MAX_FILTERING_CALLS = 10;
  private hasScrolledInitially = false;

  @ViewChild('scroll') public scroll!: ElementRef;

  @Input() get sortedDataStore() {
    return this.sortedDataItems;
  }
  set sortedDataStore(val) {
    const previousItems = this.sortedDataItems;
    const previousLength = this.sortedDataItems?.length || 0;
    this.sortedDataItems = val;
    const newLength = val?.length || 0;

    if (!this.isInternalUpdate && this.clientGridPagination() && (previousLength !== newLength || previousItems !== val)) {
      this.gridData = [];
      this.fullFilteredCount = newLength;
      this.elementCount.set(newLength);
    }

    if (
      this.outerService &&
      this.filterOptions &&
      Object.keys(this.filterOptions).length === 0 &&
      !this.clientGridPagination() &&
      !this.mobileSearch
    ) {
      this.gridData = [];
    }
    this.sortedDataStoreChange.emit(this.sortedDataItems);
  }
  public get onlySorting(): boolean {
    return !this.filterData?.inputs.every((item: any) => item.type === FilterFieldTypeEnum.Default);
  }

  public get gridTopPosition() {
    return this.host.nativeElement.getBoundingClientRect().top;
  }

  private baseFilterSortingService!: BaseFilterSortingService<any>;
  private filterService!: FilterService | any;
  private readonly iterableDiffer: IterableDiffer<any>;
  private isSortedInitially = false;
  private _suppressFilterEmit = false;
  private _prevFilterData!: FilterData;
  private paginationData: Partial<PaginationInterface> = {
    previousPageIndex: 0,
    pageIndex: 1,
    pageSize: this.initialPageSize(),
    length: this.initialPageSize()
  };

  public readonly spinnerService = inject(SpinnerService);
  public readonly filterNewInstanceService = inject(FilterService);
  private readonly onDestroy = inject(DestroyRef);
  private readonly filterSelectService = inject(FilterSelectService);
  private readonly host = inject(ElementRef);
  private readonly dataHelperService = inject(GridHelperService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly _cd = inject(ChangeDetectorRef);
  private readonly iterableDiffers = inject(IterableDiffers);
  private readonly _differsService = inject(KeyValueDiffers);
  private readonly injector = inject(Injector);
  private readonly baseFilterService = inject(FilterService, { optional: true, skipSelf: true });
  private readonly paginationService = inject(UpdatePaginationService);

  constructor() {
    this.iterableDiffer = this.iterableDiffers.find([]).create(null as any);
  }

  /**
   * Checks if the provided sortedDataStore data is already filtered according to FilterData inputs values.
   * @param sortedDataStore - The data to check if it's filtered
   * @returns true if data is already filtered, false if not
   */
  public checkIfDataFiltered(sortedDataStore: any[]): boolean {
    // If no filterData or no inputs, data is not filtered
    if (!this.filterData || !this.filterData.inputs || !Array.isArray(this.filterData.inputs)) {
      return false;
    }

    // Build filterOptions from filterData.inputs (matching runInitialFilter logic)
    const filterOptions = this.buildFilterOptionsFromInputs();

    // If no data provided, cannot determine if filtered
    if (!sortedDataStore || sortedDataStore.length === 0) {
      return false;
    }

    // Check if all items in sortedDataStore match all filter criteria
    return this.checkAllItemsMatchFilters(sortedDataStore, filterOptions);
  }

  /**
   * Builds filterOptions from filterData.inputs
   */
  private buildFilterOptionsFromInputs(): any {
    const filterOptions: any = {};

    for (const filterItem of this.filterData.inputs) {
      if (
        Object.prototype.hasOwnProperty.call(filterItem, 'value') &&
        filterItem.value !== '' &&
        filterItem.value !== null &&
        filterItem.value !== undefined
      ) {
        if (filterItem.customFilter && Array.isArray(filterItem.customFilter)) {
          filterOptions[`${filterItem.name}_customFilter`] = filterItem.customFilter;
        } else {
          filterOptions[filterItem.name] = {
            value: filterItem.value,
            type: filterItem.dataType || filterItem.type
          };
          if (filterItem.highlightSettName) {
            filterOptions[filterItem.name].highlightSettName = filterItem.highlightSettName;
          }

          if (filterItem.customFilterFunction) {
            filterOptions[filterItem.name].customFilterFunction = filterItem.customFilterFunction;
          }
        }
      }
    }

    return filterOptions;
  }

  /**
   * Checks if all items match all filter criteria
   */
  private checkAllItemsMatchFilters(sortedDataStore: any[], filterOptions: any): boolean {
    const totalFilters = Object.keys(filterOptions).length;

    for (const item of sortedDataStore) {
      const matches = this.countFilterMatches(item, filterOptions);

      // If this item doesn't match all filters, data is not filtered
      if (matches < totalFilters) {
        return false;
      }
    }

    // All items match all filters, data is already filtered
    return true;
  }

  /**
   * Counts how many filters an item matches
   */
  private countFilterMatches(item: any, filterOptions: any): number {
    let matches = 0;

    for (const key in filterOptions) {
      if (Object.prototype.hasOwnProperty.call(filterOptions, key)) {
        if (key.includes('customFilter')) {
          if (filterOptions[key].length > 0) {
            const found = this.checkCustomFilter(item, filterOptions[key]);
            matches += found ? 1 : 0;
          }
        } else if (typeof item[key] !== 'undefined') {
          const match = this.checkItemMatchesFilter(item, key, filterOptions[key]);
          matches += match ? 1 : 0;
        }
      }
    }

    return matches;
  }

  /**
   * Checks if an item matches a specific filter
   */
  private checkItemMatchesFilter(item: any, key: string, filterOption: any): boolean {
    if (filterOption.type === 'date') {
      return this.checkDateFilter(item, key, filterOption);
    }

    if (filterOption.type === 'date-time') {
      return moment(filterOption.value).isSame(new Date(item[key]), 'day');
    }

    if (filterOption.type === 'exact-match-string') {
      return this.matchExact(filterOption.value, item[key]);
    }

    if (filterOption.type === 'multiIds') {
      const filterOptionValue = filterOption.value;

      return Array.isArray(filterOptionValue) && filterOptionValue.includes(item[key]);
    }

    if (filterOption.type === 'custom') {
      if (filterOption.customFilterFunction) {
        return filterOption.customFilterFunction(filterOption.value, item[key]);
      }

      return false;
    }

    const filterOptionValue = filterOption.value.toString().trim();
    if (filterOption.type === 'number') {
      return item[key]?.toString().toLowerCase() === filterOptionValue.toLowerCase() || filterOptionValue === '';
    }

    return item[key]?.toString().toLowerCase().includes(filterOptionValue.toLowerCase());
  }

  /**
   * Checks if an item matches a date filter
   */
  private checkDateFilter(item: any, key: string, filterOption: any): boolean {
    const dateHandlerResult = filterOption.highlightSettName
      ? this.filterSelectService.dateHandler(filterOption.value, filterOption.highlightSettName)
      : this.filterSelectService.dateHandler(filterOption.value);

    if (dateHandlerResult?.endOf) {
      return moment(item[key]).isBetween(dateHandlerResult.startOf, dateHandlerResult.endOf);
    }

    return Math.abs(moment().diff(item[key], 'month')) > 12;
  }

  /**
   * Helper method to check if an item matches custom filter criteria
   */
  private checkCustomFilter(item: any, filters: any[]): boolean {
    return filters.some(filter => {
      if (filter.type === 'string') {
        return item[filter.name]?.toString().toLowerCase().includes(decodeURIComponent(filter.value.toString()).trim().toLowerCase());
      }

      if (filter.type === 'number') {
        return !!item[filter.name]?.toString().includes(filter.value.toString());
      }

      if (filter.type === 'boolean') {
        return item[filter.name]?.toString() === filter.value.toString();
      }

      return false;
    });
  }

  /**
   * Helper method to match exact string (matching ClientFilterSortingService logic)
   */
  private matchExact(r: string, str: string): boolean {
    const strToLower = str?.toLowerCase() || '';
    const rToLower = r?.toLowerCase() || '';

    return strToLower === rToLower;
  }

  // eslint-disable-next-line complexity
  public ngOnChanges(changes: SimpleChanges): void {
    if (this.filtersIncluded() && changes['filterData']?.currentValue) {
      this.runInitialFilter();
    }

    if (changes['mobileFilterQuery'] && this.outerSearch() && !changes['mobileFilterQuery'].firstChange) {
      this.onMobileQueryChanged(changes['mobileFilterQuery'].currentValue);
    }

    if (changes['filterData']?.currentValue && changes['filterData']?.firstChange && this.filterData.sortOptions) {
      if (!this.filterData.sortOptions.value && this.filterData.sortOptions.default) {
        this.filterData.sortOptions.value = this.filterData.sortOptions.default.key;
        this.filterData.sortOptions.order = this.filterData.sortOptions.default.direction;
      }
    }

    if (changes['filterData']?.currentValue && !changes['filterData']?.firstChange) {
      this.filterService = this.filtersIncluded() ? this.filterNewInstanceService : this.baseFilterService;
      this.getSortData();
      if (!this.desktop && this.filterData.inputs.some((item: any) => item.value)) {
        this.isMobileFilterActive = true;
      }
    }

    if (
      changes['sortedDataStore'] &&
      changes['sortedDataStore'].currentValue.length > 0 &&
      this.outerService &&
      this.filtersIncluded() &&
      !this.includeOuterFilter() &&
      this.baseFilterSortingService &&
      !this.isFilteringInProgress &&
      this.filteringCallCount < this.MAX_FILTERING_CALLS &&
      !this.checkIfDataFiltered(changes['sortedDataStore'].currentValue)
    ) {
      this.isFilteringInProgress = true;
      this.filteringCallCount++;
      this.gridData = changes['sortedDataStore'].currentValue;
      this.runInitialFilter();
      this.getSortData();
      // Reset counter after a delay to allow normal operation to resume if limit reached
      if (this.filteringCallCount >= this.MAX_FILTERING_CALLS) {
        setTimeout(() => {
          this.filteringCallCount = 0;
        }, 1000);
      }
    } else if (
      changes['sortedDataStore'] &&
      changes['sortedDataStore'].currentValue?.length > 0 &&
      this.outerService &&
      this.isSortedInitially &&
      this.filterData?.sortOptions?.value
    ) {
      this.isSortedInitially = false;
    }

    if (changes['filterData']?.currentValue) {
      if (!this.outerService && this.filterData.sortOptions?.value && !this.orderBy) {
        const orders = this.filterData.sortOptions.order.split(',');
        const query = this.filterData.sortOptions.value
          .split(',')
          .map((prop: any, index: number) => `${prop} ${orders[index] ?? orders[orders.length - 1]}`)
          .join(',');
        this.customQueryInitial = this.customQueryInitial?.toLowerCase().includes('$orderby')
          ? this.customQueryInitial
          : this.customQueryInitial
            ? Array.from(this.customQueryInitial)[0] === '&'
              ? `$orderby=${query} ${this.customQueryInitial}`
              : `$orderby=${query} & ${this.customQueryInitial}`
            : `$orderby=${query}`;
      }
    }

    if (!changes['filterData']?.firstChange && changes['filterData']?.currentValue.pagination) {
      this.paginationService.paginationData$.next({
        currentPage: changes['filterData']?.currentValue.pagination.pageIndex,
        previousPage: changes['filterData']?.currentValue.pagination.pageSize,
        rowsPerPage: changes['filterData']?.currentValue.pagination.pageSize
      });
    }
  }

  public ngDoCheck(): void {
    const changes = this.iterableDiffer.diff(this.sortedDataStore);
    if (changes && !this.isSortedInitially && this.sortedDataStore.length > 0) {
      this.isSortedInitially = true;
      if (this.gridType() === 'CUSTOM_SERVER') return;
      if (this.filterData?.sortOptions?.value) {
        if (this.outerService) {
          const dataType = [];
          for (const prop of this.filterData.sortOptions.value.split(',')) {
            dataType.push(
              this.filterData.inputs.find((fd: any) => fd.name === prop)?.customSortDataType ||
                this.filterData.inputs.find((fd: any) => fd.name === prop)?.dataType
            );
          }

          const stringDataType = dataType.join(',');
          if (stringDataType) {
            this.orderData({
              active: this.filterData.sortOptions.value,
              direction: this.filterData.sortOptions.order,
              dataType: stringDataType
            });
          }
        }
      }
    }

    // If data is not filtered, trigger filtering
    if (!this.isFilteringInProgress && this.filteringCallCount < this.MAX_FILTERING_CALLS && this.shouldTriggerFilteringOnObjectChange()) {
      this.isFilteringInProgress = true;
      this.filteringCallCount++;
      this.gridData = this.sortedDataStore.slice();
      this.runInitialFilter();
      this.getSortData();
      // Reset counter after a delay to allow normal operation to resume if limit reached
      if (this.filteringCallCount >= this.MAX_FILTERING_CALLS) {
        setTimeout(() => {
          this.filteringCallCount = 0;
        }, 1000);
      }
    }
  }

  /**
   * Checks if filtering should be triggered when objects change
   */
  private shouldTriggerFilteringOnObjectChange(): boolean {
    return (
      this.sortedDataStore &&
      this.sortedDataStore.length > 0 &&
      this.outerService &&
      this.filtersIncluded() &&
      !this.includeOuterFilter() &&
      this.baseFilterSortingService &&
      !this.checkIfDataFiltered(this.sortedDataStore)
    );
  }

  // eslint-disable-next-line complexity
  public ngOnInit(): void {
    this.baseFilterSortingService = this.injector.get(BaseFilterSortingService);
    this.filterService = this.filtersIncluded() ? this.filterNewInstanceService : this.baseFilterService;

    this.setResolution();
    this._buildMobileSearchQuery();
    if (!this.outerService) {
      const query = this.customQuerySingle()
        ? this.customQuerySingle()
        : this.customQueryInitial && this.customQueryFilter
          ? `${this.customQueryInitial} ${this.customQueryInitial.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}${
              this.customQueryFilter
            }`
          : `${this.customQueryInitial}${this.customQueryFilter ? `$filter=${this.customQueryFilter}` : ''}`;

      if (this.infiniteScroll()) {
        if (this.proceedInitQueryOnInit()) {
          setTimeout(() => this.spinnerService.start(), 0);
          if (this.URLParam()) {
            this.currentSubscription = this.serviceTitle[this.serviceMethod()](
              `$top=${this.itemsPerLoad}${query ? `&${query}` : ''}`,
              this.URLParam()
            ).subscribe((data: any) => {
              this.spinnerService.stop();
              this.dataHandle(data);
            });
          } else {
            this.currentSubscription = this.serviceTitle[this.serviceMethod()](
              `$top=${this.itemsPerLoad}${query ? `&${query}` : ''}`
            ).subscribe((data: any) => {
              this.spinnerService.stop();
              this.dataHandle(data);
            });
          }
        }
      } else {
        setTimeout(() => this.spinnerService.start(), 0);
        let updatedQuery = query;
        if (!query.includes('$top')) {
          updatedQuery = `&$top=${25}${query ? `&${query}` : ''}`;
          this.itemsPerLoad = 25;
        }
        this.currentSubscription = ODataHelpersService.syncData<any>(this.serviceTitle, updatedQuery, this.serviceMethod()).subscribe(
          (data: any) => {
            this.gridData = data;
            this.sortedDataStore = this.gridData.slice();
            this.sortedDataChange.emit(this.gridData);
          }
        );
      }

      for (const key in this.filterOptions) {
        if (this.filterOptions[key].type === 'date') {
          this.dateHandler(this.filterOptions[key]);
        }
      }
    }

    this.orderEvent?.pipe(takeUntilDestroyed(this.onDestroy)).subscribe(sort => this.orderData(sort));
    this.filterService.changeEvent.pipe(takeUntilDestroyed(this.onDestroy)).subscribe((changeInfo: any) => {
      this.updateFilterOptions(changeInfo);
      if (this._suppressFilterEmit) return;
      setTimeout(() => {
        this.filtersChanged.emit(this.filterData);
      }, 0);
    });
    this.filterService.clearEvent.pipe(takeUntilDestroyed(this.onDestroy)).subscribe((clearInfo: any) => {
      this.deleteFromFilterOptions(clearInfo);
      if (this._suppressFilterEmit) return;
      setTimeout(() => {
        this.filtersChanged.emit(this.filterData);
      }, 0);
    });
    this.clearAllFilters?.pipe(takeUntilDestroyed(this.onDestroy)).subscribe(({ skipSorting, keepFilters }) => {
      if (this.gridType() === 'CUSTOM_SERVER') {
        this._suppressFilterEmit = true;
      }

      this.filterData.inputs = this.filterData.inputs.map((item: any) => {
        if ((item.value && !keepFilters) || (item.value && keepFilters?.length && !keepFilters.includes(item.name))) {
          return { ...item, value: '' };
        } else {
          return item;
        }
      });

      this.resetHandle(keepFilters);
      this.getSortData(skipSorting);
      this.isMobileFilterActive = false;
      this.clearInput.next(skipSorting || false);

      if (this._suppressFilterEmit) {
        setTimeout(() => (this._suppressFilterEmit = false), 0);
      }
    });

    if (this.resetEvent) {
      this.resetEvent.pipe(takeUntilDestroyed(this.onDestroy)).subscribe(() => this.resetHandle());
    }
    if (this.customQueryEvent) {
      this.customQueryEvent.pipe(takeUntilDestroyed(this.onDestroy)).subscribe(customQuery => this.customQueryHandle(customQuery));
    }
    if (this.scrollSettingsEvent) {
      this.scrollSettingsEventSubscription = this.scrollSettingsEvent
        .pipe(takeUntilDestroyed(this.onDestroy))
        .subscribe(scrollSettings => this.scrollSettingsUpdate(scrollSettings));
    }

    this._setRelatedFilters();

    // Initialize pagination with initialPageSize for CLIENT grids, restoring stored state when available
    if (this.gridType() === 'CLIENT' && this.clientGridPagination()) {
      const stored = this.filterData?.pagination;
      const pageSize = stored?.pageSize ?? this.initialPageSize();
      const pageIndex = stored?.pageIndex ?? 1;

      this.paginationData = {
        previousPageIndex: 0,
        pageIndex,
        pageSize,
        length: pageSize
      };
      this.paginationService.paginationData$.next({
        currentPage: pageIndex,
        previousPage: 0,
        rowsPerPage: pageSize
      });

      if (this.filterData) {
        this.filterData.pagination = { pageIndex, pageSize };
      }
    }

    if (this.gridType() === 'SERVER' && this.clientGridPagination()) {
      const stored = this.filterData?.pagination;
      if (stored) {
        this.itemsPerLoad = stored.pageSize;
        this.skip = (stored.pageIndex - 1) * stored.pageSize;
        this.itemsQuery = `$skip=${this.skip}&$top=${this.itemsPerLoad}`;
        this.paginationService.paginationData$.next({
          currentPage: stored.pageIndex,
          previousPage: 0,
          rowsPerPage: stored.pageSize
        });

        if (this.filterData) {
          this.filterData.pagination = { pageIndex: stored.pageIndex, pageSize: stored.pageSize };
        }
      }
    }
  }

  public assignIds(rootElement: HTMLElement) {
    const rows = rootElement.querySelectorAll('.tr');

    rows.forEach((row, rowIndex) => {
      const rowId = `row_${rowIndex + 1}`;
      if (!row.id) {
        row.id = rowId;
      }

      const tds = this.desktop ? row.querySelectorAll('.td') : row.querySelectorAll('.td-mob');
      tds.forEach((td, tdIndex) => {
        const tdId = `${rowId}_td_${tdIndex + 1}`;
        if (!(td as HTMLElement).id) {
          (td as HTMLElement).id = tdId;
        }

        const inputs = td.querySelectorAll('input');
        inputs.forEach((e, inputIndex) => {
          const inputId = `${tdId}_input_${inputIndex + 1}`;
          if (!e.id) {
            e.id = inputId;
          }
        });

        const cellValues = td.querySelectorAll('.cell-value');
        cellValues.forEach((cellValue, cellValueIndex) => {
          const cellValueId = `${tdId}_value_${cellValueIndex + 1}`;
          if (!(cellValue as HTMLElement).id) {
            (cellValue as HTMLElement).id = cellValueId;
          }
        });
      });
    });

    const selectedRowData = this.selectedRow();
    if (
      selectedRowData &&
      selectedRowData.activeRow &&
      Array.isArray(selectedRowData.activeRow) &&
      selectedRowData.activeRow.length > 0 &&
      !this.hasScrolledInitially
    ) {
      setTimeout(() => {
        this.scrollToActiveRow();
        this.hasScrolledInitially = true;
      }, 300);
    }
  }

  private scrollToActiveRow(): void {
    const selectedRowData = this.selectedRow();

    if (
      !selectedRowData ||
      !selectedRowData.activeRow ||
      !Array.isArray(selectedRowData.activeRow) ||
      selectedRowData.activeRow.length === 0
    ) {
      return;
    }

    if (!this.scroll?.nativeElement) {
      return;
    }

    const scrollContainer = this.scroll.nativeElement;
    const rowId = selectedRowData.rowId || 'id';
    const activeRowId = selectedRowData.activeRow[selectedRowData.activeRow.length - 1];

    if (!activeRowId || activeRowId === '') {
      return;
    }

    if (!this.sortedDataStore || this.sortedDataStore.length === 0) {
      return;
    }

    const targetRow = this.findTargetRow(scrollContainer, activeRowId, rowId);

    if (!targetRow) {
      return;
    }

    this.scrollToRow(scrollContainer, targetRow);
  }

  private findTargetRow(scrollContainer: HTMLElement, activeRowId: string | number, rowId: string): HTMLElement | null {
    let targetRow: HTMLElement | null = scrollContainer.querySelector(`[data-row-id="${activeRowId}"]`) as HTMLElement;

    if (!targetRow) {
      const activeRowIndex = this.sortedDataStore.findIndex((item: any) => {
        const rowValue = item[rowId];

        return String(rowValue) === String(activeRowId);
      });

      if (activeRowIndex < 0) {
        return null;
      }

      const allRows = this.findAllRows(scrollContainer);

      if (allRows.length === 0 || activeRowIndex >= allRows.length || !allRows[activeRowIndex]) {
        return null;
      }

      targetRow = allRows[activeRowIndex] as HTMLElement;
    }

    return targetRow;
  }

  private findAllRows(scrollContainer: HTMLElement): Element[] {
    let allRows: Element[] = Array.from<Element>(
      scrollContainer.querySelectorAll('.row-wrapper, .grid-row, .tr, div.grid-row, div.tr')
    ).filter((row: Element) => scrollContainer.contains(row));

    if (allRows.length === 0) {
      allRows = Array.from<Element>(scrollContainer.querySelectorAll('div:has(bo-grid-cell), div:has(.grid-cell)')).filter((row: Element) =>
        scrollContainer.contains(row)
      );
    }

    if (allRows.length === 0) {
      const children = Array.from<Element>(scrollContainer.children);
      allRows = children.filter(
        (child: Element) =>
          scrollContainer.contains(child) &&
          (child.classList.contains('tr') ||
            child.classList.contains('grid-row') ||
            child.classList.contains('row-wrapper') ||
            child.querySelector('bo-grid-cell') !== null)
      );
    }

    return allRows;
  }

  private scrollToRow(scrollContainer: HTMLElement, targetRow: HTMLElement): void {
    const gridElement = this.host.nativeElement;
    const gridRect = gridElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const isGridAboveViewport = gridRect.bottom < 0;
    const isGridBelowViewport = gridRect.top > viewportHeight;

    if (isGridAboveViewport || isGridBelowViewport) {
      gridElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });

      setTimeout(() => {
        this.scrollToRowInContainer(scrollContainer, targetRow);
      }, 400);
    } else {
      this.scrollToRowInContainer(scrollContainer, targetRow);
    }
  }

  private scrollToRowInContainer(scrollContainer: HTMLElement, targetRow: HTMLElement): void {
    setTimeout(() => {
      if (!document.body.contains(targetRow)) {
        return;
      }

      targetRow.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }, 100);
  }

  public onFilterValueChanged(filters: any): void {
    this.filtersChanged.emit(filters);
  }

  public onActionClick(): void {
    this.actionClick.emit();
  }

  resetHandle(keepFilters?: string[]) {
    if (keepFilters && keepFilters.length) {
      for (const key in this.filterOptions) {
        if (!keepFilters.includes(key)) {
          delete this.filterOptions[key];
        }
      }
    } else {
      this.filterOptions = {};
    }
  }

  customQueryHandle(customQuery: any) {
    this.customQueryFilter = customQuery;
    this.getSortData();
  }

  dataHandle(data: any) {
    this.spinnerDisabled = false;
    this.scrollSettingsEventGrid.next({ key: 'loading', value: false });
    if (data.body.length < this.itemsPerLoad) {
      this.notAllData = false;
      this.scrollSettingsEventGrid.next({ key: 'notAllData', value: false });
    } else {
      this.scrollSettingsEventGrid.next({ key: 'notAllData', value: true });
    }

    this.gridData = this.initialQuery ? data.body : this.gridData.concat(data.body);
    this.sortedData = this.gridData.slice();
    this.sortedDataStore = this.sortedData;
    this.sortedDataChange.emit(this.sortedData);

    this.scrollSettingsEventGrid.next({ key: 'scroll', value: true });
    this.loadItemsEvent.next(null);

    setTimeout(() => {
      if (this.scroll?.nativeElement) {
        this.assignIds(this.scroll.nativeElement);
      }
    }, 200);
  }

  /** TODO work-around for handling pagination until we have all counts in response  */
  public handlePagination(e: PaginationInterface) {
    if (this.filterData) {
      this.filterData.pagination = {
        pageIndex: e.pageIndex,
        previousPageIndex: e.previousPageIndex,
        pageSize: e.pageSize as number
      };
    }

    if (this.gridType() === 'CUSTOM_SERVER') {
      this.serverPageEvent.emit(e);

      return;
    }
    if (this.gridType() === 'SERVER') {
      this.serverGridPagination(e);
    }
    if (this.gridType() === 'CLIENT' && this.clientGridPagination()) {
      this.clientGridPaginationHandler(e);
    }
  }

  private serverGridPagination(pagination: PaginationInterface) {
    if (typeof pagination.pageSize === 'number') {
      this.itemsPerLoad = pagination.pageSize;
    } else {
      this.itemsPerLoad = BASIC_TOTAL_COUNT_FOR_PAGINATION;
    }

    if (pagination.previousPageIndex > pagination.pageIndex) {
      this.skip -= this.itemsPerLoad;
      if (pagination.pageIndex === 1) {
        this.skip = 0;
      }
    } else {
      this.skip += this.itemsPerLoad;
    }

    this.itemsQuery = `$skip=${this.skip}&$top=${this.itemsPerLoad}`;
    this.getServiceSortData(true);
  }

  private clientGridPaginationHandler(pagination: PaginationInterface) {
    this.paginationData = pagination;
    if (!this.gridData.length) {
      this.gridData = this.sortedDataStore;
    }
    this.getClientSortData(this.gridData.slice(), false);
  }

  updateInfiniteDataGrid() {
    if (!this.outerService) {
      if (this.gridData.length) {
        this.spinnerDisabled = true;
        this.initialQuery = false;
        this.skip += this.itemsPerLoad;
        this.itemsQuery = `$skip=${this.skip}&$top=${this.itemsPerLoad}`;
        this.getServiceSortData();
      } else {
        this.scrollSettingsEventGrid.next({ key: 'loading', value: false });
        this.scrollSettingsEventGrid.next({ key: 'scroll', value: true });
      }
    } else {
      this.updateInfiniteData.emit();
      this.scrollSettingsEventGrid.next({ key: 'loading', value: false });
      this.scrollSettingsEventGrid.next({ key: 'scroll', value: true });
    }
  }

  orderData(sort: any) {
    if (this.gridType() === 'CUSTOM_SERVER') {
      this.serverSortEvent.emit({ active: sort.active, direction: sort.direction });

      return;
    }

    this.scrollSettingsEventGrid.next({ key: 'scrollToTop', value: true });
    this.itemsQuery = `$top=${this.itemsPerLoad}`;
    this.initialQuery = true;
    this.skip = 0;

    if (!this.gridData.length) {
      this.gridData = this.sortedDataStore;
    }
    const data = this.gridData.slice();

    if (!sort.active || sort.direction === '') {
      this.orderBy = '';
      this.orderDirection = '';
    } else {
      this.orderBy = sort.active;
      this.orderDirection = sort.direction;
      this.sortDataType = sort.dataType;
    }

    if (this.orderFirstTime && this.customQueryInitial) {
      this.orderFirstTime = false;
      if (this.customQueryInitial.toLowerCase().includes('$orderby')) {
        if (this.customQueryInitial.includes('&')) {
          this.customQueryInitial = this.customQueryInitial.substring(
            this.customQueryInitial.toLowerCase().indexOf('$filter'),
            this.customQueryInitial.length
          );
        } else {
          this.customQueryInitial = '';
        }
      }
    }

    if (!this.infiniteScroll()) {
      this.serviceSort ? this.getServiceSortData(true) : this.getClientSortData(data);
      if (this.gridType() !== 'CLIENT') {
        this.paginationService.paginationData$.next({ currentPage: 1, previousPage: 0, rowsPerPage: this.itemsPerLoad });
      }
    } else {
      this.serviceSort ? this.getServiceSortData() : this.getClientSortData(data);
    }
  }

  cancelCurrentRequest(): void {
    if (this.currentSubscription && this.spinnerService.inProgress === 1) {
      this.currentSubscription.unsubscribe();
      this.spinnerService.stop();
    }
  }

  // eslint-disable-next-line complexity
  getSortData(skipSorting?: boolean) {
    if (this.gridType() === 'CUSTOM_SERVER') return;
    this.cancelCurrentRequest();
    if (this.orderBy && this.orderBy !== this.filterData.sortOptions.value && typeof this.filterData.sortOptions.value === 'string') {
      this.orderBy = this.filterData.sortOptions.value;
    }

    if (
      this.orderDirection &&
      this.orderDirection !== this.filterData.sortOptions.order &&
      typeof this.filterData.sortOptions.order === 'string'
    ) {
      this.orderDirection = this.filterData.sortOptions.order;
    }

    const currentSortDataType = this.filterData.inputs.find((i: any) => i.name === this.filterData.sortOptions?.value)?.dataType;
    const currentCustomSortDataType = this.filterData.inputs.find(
      (i: any) => i.customSortHeading === this.filterData.sortOptions?.value
    )?.customSortDataType;

    if (
      this.sortDataType &&
      this.outerService &&
      !currentCustomSortDataType &&
      currentSortDataType &&
      this.sortDataType !== currentSortDataType
    ) {
      this.sortDataType = currentSortDataType;
    } else if (this.sortDataType && this.outerService && currentCustomSortDataType && this.sortDataType !== currentCustomSortDataType) {
      this.sortDataType = currentCustomSortDataType;
    }

    if (this.serviceSort) {
      this.itemsQuery = `$top=${this.itemsPerLoad}`;
      this.initialQuery = true;
      this.skip = 0;
      if (!this.infiniteScroll()) {
        this.getServiceSortData(true);
        this.paginationService.paginationData$.next({ currentPage: 1, previousPage: 0, rowsPerPage: this.itemsPerLoad });
      } else {
        this.getServiceSortData();
      }
    } else {
      if (!this.gridData.length) {
        this.gridData = this.sortedDataStore;
      }
      const data = this.gridData.slice();
      this.getClientSortData(data, skipSorting);
    }
  }

  getServiceSortData(withPagination?: boolean) {
    this.currentSubscription = this.baseFilterSortingService
      .getFilteredSortedData({
        cancelCurrentRequest: this.cancelCurrentRequest.bind(this),
        customQueryInitial: this.customQueryInitial,
        filterOptions: this.filterOptions,
        mobileFilterQuery: this.mobileFilterQuery,
        customQueryFilter: this.customQueryFilter,
        orderBy: this.orderBy,
        orderDirection: this.orderDirection,
        filterQueryChangeEvent: (value: any) => this.filterQueryChange.emit(value),
        infiniteScroll: !withPagination ? this.infiniteScroll() : true,
        itemsQuery: this.itemsQuery,
        URLParam: this.URLParam(),
        serviceTitle: this.serviceTitle,
        serviceMethod: this.serviceMethod()
      })
      .subscribe({
        next: (result: any) => {
          if (result.data.body) {
            this.dataHandle(result.data);
          } else {
            this.gridData = result.data;
            this.sortedDataStore = this.gridData.slice();
            this.sortedDataChange.emit(this.gridData);
          }
          this._cd.detectChanges();
          setTimeout(() => {
            if (this.scroll?.nativeElement) {
              this.assignIds(this.scroll.nativeElement);
            }
          }, 0);
        },
        error: () => {
          this.isFilteringInProgress = false;
        },
        complete: () => {
          this.isFilteringInProgress = false;
        }
      });
  }

  getClientSortData(data: any, skipSorting = false) {
    if (this.gridType() === 'CUSTOM_SERVER') return;
    let paginationCon = null;

    if (this.clientGridPagination()) {
      const storedPagination = this.filterData?.pagination;
      paginationCon = storedPagination
        ? { ...this.paginationData, pageIndex: storedPagination.pageIndex, pageSize: storedPagination.pageSize }
        : this.paginationData;
      this.fullFilteredCount = this.gridData.length;
      this.elementCount.set(this.fullFilteredCount);
    }

    this.baseFilterSortingService
      .getFilteredSortedData({
        data: this.gridData.slice(),
        filterOptions: this.filterOptions,
        mobileSearch: this.mobileSearch,
        searchEnum: this.searchEnum(),
        orderBy: skipSorting ? '' : this.orderBy,
        orderDirection: skipSorting ? '' : this.orderDirection,
        sortType: this.sortDataType,
        sortedDataChange: (value: any) => this.sortedDataChange.emit(value),
        uniqueCompProp: this.searchCompareProp(),
        sortNestedKey: this.filterData?.sortOptions?.nestedSortKey,
        nestedSortingConditionKeys: this.filterData?.sortOptions?.nestedSortingConditionKeys,
        paginationContext: paginationCon
      })
      .subscribe({
        next: result => {
          this.isInternalUpdate = true;
          this.sortedDataStore = this.sortedData = result.data;
          this.isInternalUpdate = false;
          if (this.clientGridPagination()) {
            this.elementCount.set(result.meta.totalCount);
          }
          this._cd.detectChanges();
          setTimeout(() => {
            if (this.scroll?.nativeElement) {
              this.assignIds(this.scroll.nativeElement);
            }
          }, 0);
        },
        error: () => {
          this.isFilteringInProgress = false;
        },
        complete: () => {
          this.isFilteringInProgress = false;
        }
      });
  }

  updateFilterOptions(info: any) {
    // eslint-disable-next-line complexity
    const generateFilters = (elem: any, shouldCall = true) => {
      if (
        ((elem.grid?.isSameNode(this.host.nativeElement.parentElement) ||
          elem.grid?.isSameNode(this.host.nativeElement.parentElement.parentElement)) &&
          //@ts-nocheck
          !this.customQueryHeaders().includes(elem.name)) ||
        elem.isFilterDialog ||
        this.filtersIncluded()
      ) {
        if (elem?.customFilter) {
          if (elem?.type === 'custom') {
            if (String(elem?.value).trim() !== '') {
              this.filterOptions[`${elem.name}_customFilter`] = elem.customFilter;
            } else {
              delete this.filterOptions[`${elem.name}_customFilter`];
            }
          } else {
            this.filterOptions[`${elem.name}_customFilter`] = elem.customFilter;
          }
        } else if (elem.value !== null && elem.value !== undefined && elem.value !== '') {
          if (elem.type !== 'date' || elem.value !== 'all' || elem.type !== 'date-time') {
            this.filterOptions[elem.name] = {
              type: elem.type,
              value: typeof elem.value === 'string' ? elem.value?.trim() : elem.value
            };
            if (elem.type === 'string' || (elem.type === 'number' && this.serviceSort) || elem.type === 'exact-match-string') {
              // isNaN() used for number type check
              this.filterOptions[elem.name].value =
                (!Number.isNaN(Number(this.filterOptions[elem.name].value)) && elem.type === 'number') || Array.isArray(elem.value)
                  ? elem.value
                  : this.outerService
                    ? elem.value.trim()
                    : `'${this.dataHelperService.prepareForFiltering(elem.value)}'`;
            } else if (elem.type === 'date') {
              this.dateHandler(elem);
              if (elem.highlightSettName) {
                this.filterOptions[elem.name] = { ...this.filterOptions[elem.name], highlightSettName: elem.highlightSettName };
              }
            } else if (elem.type === 'date-time') {
              // not ui format
              const startDate = elem.value.clone().utc();
              const endDate = startDate.clone().add(1, 'days');
              this.filterOptions[elem.name].value = {
                startDate: `${startDate.format('YYYY-MM-DDTHH:mm:SS.SSS')}Z`,
                endDate: `${endDate.format('YYYY-MM-DDTHH:mm:SS.SSS')}Z`
              };
            } else if (elem.type === 'custom') {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              this.filterOptions[elem.name].customFilterFunction = elem.customFilterFunction;
            }
          } else {
            delete this.filterOptions[elem.name];
          }
        } else {
          delete this.filterOptions[elem.name];
        }

        if (shouldCall) {
          this.getSortData();
        }
      }
    };

    if (Array.isArray(info)) {
      info.forEach(item => generateFilters(item, false));
      if (Object.keys(this.filterOptions).length) {
        this.getSortData();
      }
    } else {
      generateFilters(info);
    }

    this.scrollSettingsEventGrid.next({ key: 'scrollToTop', value: true });
  }

  dateHandler(info: any) {
    const dateValues = this.filterSelectService.dateHandler(info.value);
    this.startOf = dateValues.startOf;
    this.endOf = dateValues.endOf;
  }

  deleteFromFilterOptions(info: any) {
    const resetFilters = (elem: any, shouldCall = true) => {
      if (elem.grid?.isSameNode(this.host.nativeElement.parentElement) || elem.isFilterDialog || this.filtersIncluded()) {
        if (elem.customFilter) {
          delete this.filterOptions[`${elem.name}_customFilter`];
          //@ts-nocheck
        } else if (!this.customQueryHeaders().includes(elem.name)) {
          delete this.filterOptions[elem.name];
        } else {
          this.customQueryFilter = '';
        }
        if (shouldCall) {
          this.getSortData();
        }
      }
    };

    if (Array.isArray(info)) {
      info.forEach(item => resetFilters(item, false));
      this.getSortData();
    } else {
      resetFilters(info);
    }

    this.scrollSettingsEventGrid.next({ key: 'scrollToTop', value: true });
  }

  scrollSettingsUpdate(e: any) {
    if (e.key === 'loading') {
      this.scrollSettingsEventGrid.next({ key: 'loading', value: e.value });
    } else if (e.key === 'notAllData') {
      this.scrollSettingsEventGrid.next({ key: 'notAllData', value: e.value });
    } else if (e.key === 'scrollToCoordinates') {
      this.scrollSettingsEventGrid.next({ key: 'scrollToCoordinates', value: e.value });
    } else {
      this.scrollSettingsEventGrid.next({ key: 'scroll', value: e.value });
    }
  }

  public onSortChange(sort: any): void {
    this.orderData(sort);
  }

  public mobileInfiniteDataChange(items: unknown[]): void {
    this.mobileInfiniteDataEvent.emit(items);
  }

  public onMobileQueryChanged(query: string): void {
    this.mobileFilterQuery = query;
    this.mobileQueryEvent.emit(query);
    if (!this.outerService) {
      this.getSortData();
    }
  }

  onMobileSearchChanged({ search, skipSorting }: any): void {
    this.mobileSearch = search;
    this.mobileSearchEvent.next(this.mobileSearch);
    if (this.outerService) {
      this.getSortData(skipSorting);
    }
  }

  private setResolution(): void {
    this.breakpointObserver
      .observe(`(min-width: ${breakpoints.lg.min}px)`)
      .pipe(takeUntilDestroyed(this.onDestroy))
      .subscribe(result => {
        this.desktop = !!result.matches;

        if (this.filtersIncluded() && this.desktop && (this.mobileSearch || this.mobileFilterQuery)) {
          this.mobileFilterQuery = '';
          this.mobileSearch = '';
          this.getSortData();
        }

        if (this.filtersIncluded() && Object.keys(this.filterOptions).length) {
          this.getSortData();
          this.isMobileFilterActive = true;
        } else {
          this.isMobileFilterActive = false;
        }

        this._cd.detectChanges();
      });
  }

  private runInitialFilter(): void {
    for (const filterItem of this.filterData.inputs) {
      if (
        Object.prototype.hasOwnProperty.call(filterItem, 'value') &&
        filterItem.value !== '' &&
        filterItem.value !== null &&
        filterItem.value !== undefined
      ) {
        this.filterOptions = {
          ...this.filterOptions,
          [filterItem.name]: filterItem.customFilterFunction
            ? {
                value: filterItem.value,
                type: filterItem.dataType,
                customFilterFunction: filterItem.customFilterFunction
              }
            : {
                value: filterItem.value,
                type: filterItem.dataType
              }
        };
      }
    }
  }

  private _buildMobileSearchQuery(): void {
    if (!this.mobileQueryTemplate && this.mobileQueryTempKeys()) {
      this.mobileQueryTemplate = `(${this.mobileQueryTempKeys()
        .map(key => {
          const dataType = this.filterData?.inputs.filter((f: any) => f.name == key)[0]?.dataType;
          switch (dataType) {
            case 'number-as-string':
              return `contains(cast(${key}, Edm.String),tolower('query'))`;
            default:
              return `contains(tolower(${key}),'query')`;
          }
        })
        .join(' or ')})`;
    }
  }

  private _setRelatedFilters(): void {
    const parentFilters = this.filterData.inputs.filter((item: any) => item.parentFilterFor);
    const childFilters = this.filterData.inputs.filter((item: any) => item.childFilterFor);

    this.filtersChanged
      .pipe(
        switchMap(filters => {
          const parentSource$: any[] = [];
          const childSource$: any[] = [];

          parentFilters.forEach((item: any) => {
            const childFilter = this.filterData.inputs.filter((elem: any) => item.parentFilterFor?.includes(elem.name));
            if (childFilter.length > 0) {
              if (!this._prevFilterData) {
                this._prevFilterData = _.cloneDeep(this.filterData);
              } else {
                //@ts-expect-error expect some error
                this._prevFilterData.inputs.find(elem => elem.name === item.name).value = filters.inputs.find(
                  (f: any) => f.name === item.name
                ).value;
              }
              childFilter.forEach((chFilter: any) => {
                if (chFilter.childFilterOptions) {
                  parentSource$.push(
                    chFilter.childFilterOptions.getSource(item, this.filterData).pipe(
                      map(childFilterOptions => ({ options: childFilterOptions, filter: chFilter })),
                      tap(({ options, filter }) => {
                        if (filter.name) {
                          filter.options = options;
                          this._cd.detectChanges();
                        }
                      }),
                      finalize(() => {
                        if (chFilter.disabled) {
                          chFilter.disabled = false;
                        }
                        chFilter.childFilterFor?.split(',').forEach((el: any) => {
                          const relatedFilter = this.filterData.inputs.find((i: any) => i.name === el);
                          if (relatedFilter?.disabled) {
                            relatedFilter.disabled = false;
                          }
                        });

                        this._cd.detectChanges();
                      })
                    )
                  );
                }
              });
            }
          });

          childFilters.forEach((item: any) => {
            const parentFilter = this.filterData.inputs.filter((elem: any) => item.childFilterFor?.includes(elem.name));
            if (parentFilter) {
              if (!this._prevFilterData) {
                this._prevFilterData = _.cloneDeep(this.filterData);
              } else {
                //@ts-expect-error expect some error
                this._prevFilterData.inputs.find(elem => elem.name === item.name).value = filters.inputs.find(
                  (f: any) => f.name === item.name
                ).value;
              }

              parentFilter.forEach((parFilter: any) => {
                if (parFilter.parentFilterOptions) {
                  childSource$.push(
                    parFilter.parentFilterOptions.getSource(item, this.filterData).pipe(
                      map(parentFilterOptions => ({ options: parentFilterOptions, filter: parFilter })),
                      tap(({ options, filter }) => {
                        if (filter.name) {
                          filter.options = options;
                          this._cd.detectChanges();
                        }
                      }),
                      finalize(() => {
                        if (parFilter.disabled) {
                          parFilter.disabled = false;

                          parFilter.parentFilterFor?.split(',').forEach((el: any) => {
                            const relatedFilter = this.filterData.inputs.find((i: any) => i.name === el);
                            if (relatedFilter?.disabled) {
                              relatedFilter.disabled = false;
                            }
                          });
                        }

                        this._cd.detectChanges();
                      })
                    )
                  );
                }
              });
            }
          });

          return combineLatest([...parentSource$, ...childSource$]);
        }),
        takeUntilDestroyed(this.onDestroy)
      )
      .subscribe();
  }
}
