import { ChangeDetectorRef, Component, ElementRef, inject, Input, input, output, OnInit, ViewChild, signal } from '@angular/core';
import moment, { Moment } from 'moment';

import { SettingHelperService, FilterService } from '../../services';
import { FilterDataInputs } from '../../models';
import { DatePickerComponent } from '../../../date-picker/date-picker';

interface Information {
  name: string;
  type: string;
  value: null | Moment | string;
  grid: string;
  customFilterFunction?: any;
}

@Component({
  selector: 'bo-filter-date',
  standalone: false,
  templateUrl: './filter-date.component.html',
  styleUrls: ['./filter-date.component.scss']
})
export class FilterDateComponent implements OnInit {
  /*TODO think about signal approach */
  @ViewChild('datePicker') public datePicker!: DatePickerComponent;
  @Input() public searchByDate!: Moment;

  public input = input<FilterDataInputs>();
  public customClass = input<string>('');
  public placeholder = input<string>('');
  public hasSortFn = input<boolean>(true);
  public readonly clearFilterInput = output<any>();
  public readonly searchByDateChange = output<any>();

  public info: Information = { name: '', type: '', value: null, grid: '', customFilterFunction: undefined };
  private readonly _dateFormat = signal<string>('');

  private readonly elRef = inject(ElementRef);
  private readonly filterService = inject(FilterService);
  private readonly settingHelperService = inject(SettingHelperService);
  private readonly _cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this._dateFormat.set(this.settingHelperService.getDate()?.formatAdapter);
    const element = this.elRef.nativeElement.previousSibling;
    if (this.hasSortFn()) {
      this.info.grid = element.closest('.table');
      this.info.name = this.input()?.name || element.getAttribute('mat-header-filter-type') || element.getAttribute('mat-header-data-id');
      this.info.type = element.getAttribute('mat-header-data-type');
    } else {
      if (this.input()?.name && this.input()?.dataType) {
        this.info.grid = element.closest('.table');
        this.info.name = this.input()?.name as string;
        this.info.type = this.input()?.dataType as string;
      }
    }

    if (this.input()?.customFilterFunction) {
      this.info.customFilterFunction = this.input()?.customFilterFunction as any;
    }
  }

  public onChange(date: any): void {
    if (date) {
      const momentDate = this.searchByDate ? this.searchByDate : moment(new Date(date));
      this.info.value = momentDate;
      this.filterService.change(this.info);
      this.searchByDateChange.emit(this.searchByDate);
    } else {
      this.clear();
    }
  }

  public clear(): void {
    this.info.value = '';
    this.searchByDate = null as any;
    // this.datePicker.dateInput.nativeElement.value = '';
    this.clearFilterInput.emit(null);
    this.searchByDateChange.emit(this.searchByDate);
    this.filterService.clear(this.info);
    this._cdr.detectChanges();
  }
}
