import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as _ from 'lodash-es';
import { GridHelperService, FilterService } from '../../services';
import { FilterDataInputs } from '../../models';
import { menuType } from '../../../header/menu-type.enum';

@Component({
  selector: 'bo-filter-select',
  standalone: false,
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.scss']
})
export class FilterSelectComponent implements OnChanges, OnInit, AfterViewInit {
  info = { name: '', type: '', value: '', grid: '', highlightSettName: null, customFilter: undefined, customFilterFunction: undefined };

  /*TODO think about correct signal */
  @Input() public optionSelected!: string;
  public options = input<any>();
  // public optionSelected = input<any>('')
  public hasSearch = input<boolean>(false);
  public multiple = input<boolean>(false);
  public itemKeys = input<any | null>(null);
  public hasSortFn = input<boolean>(true);
  public input = input<FilterDataInputs>();
  public customClass = input<string>('');
  public optionsCustomClass = input<string>('');
  // for single select, but id is array of numbers
  public multiIds = input<boolean>(false);
  public disabled = input<boolean>(false);
  public readonly clearFilterSelect = output<any>();
  public readonly optionSelectedChange = output<any>();

  public optionsFiltered!: any[];
  public searchText = '';
  public clearToggle = false;
  public customFilter: any;
  protected readonly menuType = menuType;

  @ViewChild('filterSelect') public someInput!: ElementRef;

  private readonly elRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly filterService = inject(FilterService);
  private readonly dataHelperService = inject(GridHelperService);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      if ((this.options() && this.options().length) || this.input()?.clearable) {
        if (!_.isEqual(changes['options'].currentValue, changes['options'].previousValue)) {
          this.optionsFiltered = this.getSortedOptions(this.options());
        }

        if (this.multiIds()) {
          const uniqueId = this.itemKeys() ? this.itemKeys().id : 'id';
        }
      }
    }

    if (changes['optionSelected'] && !changes['optionSelected'].firstChange) {
      const newValue = changes['optionSelected'].currentValue;
      const oldValue = changes['optionSelected'].previousValue;

      if (newValue !== oldValue) {
        this.info.value = newValue;
        this.prepareFilterData(newValue);

        if (newValue === '' || newValue === null || newValue === undefined) {
          this.filterService.clear(this.info);
        } else {
          this.filterService.change(this.info);
        }
      }
    }
  }

  ngOnInit(): void {
    const element = this.elRef.nativeElement.previousSibling;

    if (this.hasSortFn()) {
      this.info.grid = element.closest('.table');
      this.info.name = element.getAttribute('mat-header-data-id') || element.getAttribute('mat-sort-header');
      this.info.type = element.getAttribute('mat-header-data-type');
    } else {
      this.info.grid = element.closest('.table');
      this.info.name = this.input()?.name as string;
      this.info.type = this.input()?.dataType as string;
    }

    if (this.input()?.highlightSettName) {
      this.info.highlightSettName = this.input()?.highlightSettName as any;
    }

    if (this.input()?.customFilterFunction) {
      this.info.customFilterFunction = this.input()?.customFilterFunction as any;
    }

    if (this.options() && this.options().length) {
      this.optionsFiltered = this.getSortedOptions(this.options());
    }

    if (element && element.nodeType !== 8) {
      const customFilter = element?.getAttribute('custom-filter');
      if (customFilter) {
        this.customFilter = JSON.parse(customFilter);
      }
    }
  }

  onSelectionChange(e: any): void {
    this.info.value = e.value;
    this.filterService.change(this.info);
  }

  onChange(e: any): void {
    if (this.multiple() || this.info.type === 'multiIds' || (this.info.type === 'custom' && this.multiIds())) {
      if (e.value?.length === 0 || e.target?.value?.length === 0) {
        this.clear();

        return;
      }
    }

    if (!e) {
      return;
    }
    const value = (e.value !== undefined && e.value !== null) || e.value === 0 ? e.value : e.target ? e.target.value : '';
    this.info.value = value;
    this.prepareFilterData(value);
    this.filterService.change(this.info);
    this.optionSelectedChange.emit(this.optionSelected);
  }

  clear(): void {
    this.info.value = this.optionSelected = '';
    this.prepareFilterData('');
    this.clearFilterSelect.emit(this.info);
    this.optionSelectedChange.emit(this.optionSelected);
    this.filterService.clear(this.info);
  }

  onOpen(toggle: boolean): void {
    this.clearToggle = toggle;
    if (this.hasSearch()) {
      this.searchText = '';
      this.optionsFiltered = this.getSortedOptions(this.options());
    }
  }

  filterList(filterParam: string): void {
    const filtered = this.options().filter(
      (unit: any) =>
        (this.itemKeys()?.value ? unit[this.itemKeys().value] : unit.value).toLowerCase().indexOf(filterParam.trim().toLowerCase()) > -1
    );
    this.optionsFiltered = this.getSortedOptions(filtered);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  private prepareFilterData(inputValue: any): void {
    if (this.customFilter !== undefined && Array.isArray(this.customFilter)) {
      this.customFilter.forEach(filter => {
        filter.status = true;
        if (filter.condition) {
          if (!eval(filter.condition.replace('<value>', inputValue))) {
            filter.status = false;
          }
        } else {
          filter.value = inputValue;
        }
      });

      this.info.customFilter = this.customFilter
        .filter(x => x.status)
        .map(x => ({
          name: x.name,
          type: x.type,
          value: this.dataHelperService.prepareForFiltering(x.value),
          query: x.query || null
        })) as any;
    } else {
      delete this.info.customFilter;
      this.info.value = inputValue;
    }
  }

  public stopEventProp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.stopPropagation();
    }
  }

  private getSortedOptions(options: any[]): any[] {
    if (!options || !options.length) {
      return options;
    }

    const sortFn = this.input()?.optionsSortFn;
    if (sortFn) {
      return [...options].sort(sortFn);
    }

    return options;
  }
}
