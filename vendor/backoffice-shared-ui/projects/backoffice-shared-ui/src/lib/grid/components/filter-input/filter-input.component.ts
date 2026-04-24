import { AfterViewInit, Component, DestroyRef, ElementRef, inject, Input, OnInit, input, output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { GeneralConst } from '../../constants';
import { FilterDataInputs } from '../../models';
import { FilterService, GridHelperService } from '../../services';

@Component({
  selector: 'bo-filter-input',
  standalone: false,
  templateUrl: './filter-input.component.html',
  styleUrls: ['./filter-input.component.scss']
})
export class FilterInputComponent implements OnInit, AfterViewInit {
  @ViewChild('filterInput') public filterInput!: ElementRef;

  @Input() public value: any;
  public serverFiltering = input<boolean>(false);
  public hasSortFn = input<boolean>(true);
  public input = input<FilterDataInputs>();
  public customClass = input<string>('');
  public mask = input<boolean | null>(null);
  public readonly clearFilterInput = output<any>();
  public readonly valueChange = output<any>();

  public info = { name: '', type: '', value: '', grid: '', customFilter: undefined, customFilterFunction: undefined };
  public customFilter: any;

  public filterService = inject(FilterService);
  private readonly _destroy$ = inject(DestroyRef);
  private readonly elRef = inject(ElementRef);
  private readonly dataHelperService = inject(GridHelperService);

  public ngOnInit(): void {
    const element = this.elRef.nativeElement.previousSibling;

    if (this.hasSortFn()) {
      this.info.grid = element.closest('.table');
      this.info.name = this.input()?.name || element.getAttribute('mat-sort-header') || element.getAttribute('mat-header-data-id');
      this.info.type = element.getAttribute('mat-header-data-type');
    } else {
      this.info.grid = element.closest('.table');
      this.info.name = this.input()?.name as string;
      this.info.type = this.input()?.dataType as string;
    }

    if (element && element.nodeType !== 8) {
      const customFilter = element?.getAttribute('custom-filter');
      if (customFilter) {
        this.customFilter = JSON.parse(customFilter);
      }
    }

    if (this.value) {
      this.info.value = this.value;
    }

    if (this.input()?.customFilterFunction) {
      this.info.customFilterFunction = this.input()?.customFilterFunction as any;
    }
  }

  public ngAfterViewInit(): void {
    const debounce = this.serverFiltering() ? GeneralConst.THROTTLING_TIME : 0;
    fromEvent(this.filterInput.nativeElement, 'input')
      .pipe(debounceTime(debounce), takeUntilDestroyed(this._destroy$))
      .subscribe(e => {
        // Event
        this.onInput(e);
      });
  }

  public onInput(e: any): void {
    if (e.target.value) {
      const copiedValue = e.target.value;
      const trimmedValue = copiedValue.trim();
      if (trimmedValue) {
        this.info.value = this.mask() ? this.value : e.target.value;
        this.prepareFilterData(this.mask() ? this.value : e.target.value);
        this.filterService.change(this.info);
        this.valueChange.emit(this.value);
      }
    } else {
      this.clear();
    }
  }

  public clear(): void {
    if (this.info.value || this.value || this.value === '' || this.info.value === '') {
      this.info.value = '';
      this.value = '';
      this.prepareFilterData('');
      this.clearFilterInput.emit(null);
      this.valueChange.emit(this.value);
      this.filterService.clear(this.info);
    }
  }

  private prepareFilterData(inputValue: any) {
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
}
