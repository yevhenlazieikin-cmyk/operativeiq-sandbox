import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, FormsModule, ReactiveFormsModule, ControlContainer } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MatNativeDateModule, MatRippleModule, ErrorStateMatcher } from '@angular/material/core';
import { InputMaskModule, InputmaskOptions } from '@ngneat/input-mask';
import moment from 'moment';
import { Moment } from 'moment-timezone';
import { DataHelperService } from '../services/data-helper.service';
import { MatIconModule } from '@angular/material/icon';
import { DateInputMask } from '../shared/utils/input-mask.utils';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { CustomDateAdapter } from '@backoffice/shared-ui/lib/date-picker/date-adapter/custom-date-adapter';
import { DATE_FORMAT, SettingHelperService } from '@backoffice/shared-ui/lib/grid/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, merge } from 'rxjs';
import { BoFormSubmitDirective } from '../directives/form-submit.directive';

@Component({
  selector: 'bo-date-picker',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    InputMaskModule,
    MatIconModule,
    MatRippleModule,
    SvgIconComponent,
    MatMomentDateModule
  ],
  standalone: true,
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DatePickerComponent,
      multi: true
    },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent implements OnInit, ControlValueAccessor, AfterViewInit {
  public controlContainer = inject(ControlContainer, { optional: true });
  public readonly dateInput = viewChild.required<ElementRef>('dateInput');

  public id = input<string>('');
  public formControlName = input<string>('');
  public disabled = input(false);
  public placeholder = input('');
  public standaloneOptions = input(false);
  public classesCB = input<() => Record<string, boolean>>(() => ({}));
  public classList = input<string[]>([]);
  public errorStateMatcher = input<ErrorStateMatcher | null>(null);
  public showError = input(false);
  public returnedType = input<'date' | 'moment' | 'string'>('moment');
  public readonly hasPicker = input(true);
  public dateInputMask = signal<InputmaskOptions<Date> | undefined>(undefined);

  public selectValue = model<Date | Moment | null>(null);
  public readonly blurEvent = output<Event>();
  public readonly selectValueChange = output<Date | Moment | string | null>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly formSubmit = inject(BoFormSubmitDirective, { optional: true });
  private readonly dataHelper = inject(DataHelperService);
  private readonly settingsService = inject(SettingHelperService);
  private hasManualInputAttempt = false;

  public control = signal<FormControl | null>(null);
  public readonly getClasses = computed(() => this.classesCB()());
  private readonly alwaysShowErrorMatcher: ErrorStateMatcher = { isErrorState: () => true };
  public readonly localErrorStateMatcher = computed(() => (this.showError() ? this.alwaysShowErrorMatcher : this.errorStateMatcher()));

  public readonly maxDate = computed(() => moment(new Date()).add(100, 'year'));

  public readonly minDate = computed(() => moment(new Date()).add(-115, 'year'));

  public onChange = (v: Moment | null): void => {};
  public onTouched = (): void => {};

  public ngOnInit(): void {
    if (this.formControlName() && this.controlContainer?.control) {
      const controlName = this.formControlName();
      const formControl = this.controlContainer.control.get(controlName);
      if (formControl instanceof FormControl) {
        this.control.set(formControl);
      }
    }
    const formatValue = this.settingsService.getSettingByName(DATE_FORMAT)?.value || 0;

    this.dateInputMask.set(DateInputMask(this.settingsService.getDate().formatAdapter, formatValue));
    this.setupMatcherRefresh();
  }

  public ngAfterViewInit(): void {
    this.checkInputValue();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {}

  public writeValue(value: Moment | Date | string | null): void {
    let processedValue: Moment | null = null;

    if (value) {
      if (moment.isMoment(value)) {
        processedValue = value;
      } else if (value instanceof Date) {
        processedValue = moment(value);
      } else if (typeof value === 'string') {
        // Always parse dates as local to avoid timezone conversion issues
        // This prevents dates from shifting by a day in US timezones
        // If it's a date-only string (YYYY-MM-DD), parse it as local date components
        // to preserve the calendar date regardless of timezone
        if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
          // Parse the date components and create a moment in local timezone
          const [year, month, day] = value.split('-').map(Number);
          // Create moment in local timezone (not UTC) to preserve the date
          processedValue = moment([year, month - 1, day]);
        } else {
          // For other formats, parse in local time (not UTC)
          processedValue = moment(value);
        }
      }
    }

    this.selectValue.set(processedValue);
    this.checkInputValue();
  }

  public dateChanged(newValue: Moment | null): void {
    if (newValue && !moment.isMoment(newValue)) {
      newValue = moment(newValue);
    }

    if (newValue) {
      newValue = newValue.clone().startOf('day');
    }

    this.selectValue.set(newValue);
    this.onChange(newValue);
    this.onTouched();

    if (newValue) {
      this.emitValueBasedOnType(newValue);
    } else {
      this.selectValueChange.emit(null);
    }

    this.checkInputValue();
  }

  public manualDateChanged(e: Event): void {
    const currentValue = this.selectValue();

    if (currentValue && moment.isMoment(currentValue) && currentValue.isValid()) {
      let adjustedValue = currentValue;
      const maxDate = this.maxDate();
      const minDate = this.minDate();

      if (adjustedValue.isAfter(maxDate)) {
        adjustedValue = maxDate;
      } else if (adjustedValue.isBefore(minDate)) {
        adjustedValue = minDate;
      }

      this.selectValue.set(adjustedValue);
      this.emitValueBasedOnType(adjustedValue);
      this.onChange(adjustedValue);
    }

    this.checkInputValue();
  }

  public onBlur(event: Event): void {
    this.blurEvent.emit(event);
    this.onTouched();

    const inputMask = this.dateInputMask();
    const inputElement = this.dateInput().nativeElement;
    const hasManualInputAttempt = this.hasManualInputAttempt;
    this.hasManualInputAttempt = false;
    const hasIncompleteInput = !!inputMask?.isComplete && !inputMask.isComplete(inputElement.value.split(''), {});

    if (hasManualInputAttempt && (hasIncompleteInput || !this.selectValue())) {
      this.clearValue();
    }

    setTimeout(() => {
      this.checkInputValue();
    }, 0);
  }

  public checkInputValue(): void {
    const inputElement = this.dateInput()?.nativeElement;
    if (!inputElement) return;

    const datepickerElement = inputElement.closest('.datepicker');
    const maskInstance = inputElement.inputmask;

    const hasValue = this.selectValue() || (maskInstance?._valueGet && maskInstance._valueGet()) || inputElement.value;

    if (hasValue) {
      datepickerElement?.classList.add('filled');
    } else {
      datepickerElement?.classList.remove('filled');
    }
  }

  public onInputKeydown(event: KeyboardEvent): void {
    if (event.key.length === 1) {
      this.hasManualInputAttempt = true;
    }
  }

  public onInputInteraction(): void {
    this.hasManualInputAttempt = true;
  }

  private clearValue(): void {
    this.onChange(null);
    this.selectValue.set(null);
    this.selectValueChange.emit(null);
  }

  private emitValueBasedOnType(value: Moment): void {
    const returnType = this.returnedType();

    switch (returnType) {
      case 'date':
        this.selectValueChange.emit(value.toDate());
        break;
      case 'string':
        this.selectValueChange.emit(value.format());
        break;
      case 'moment':
      default:
        this.selectValueChange.emit(value);
        break;
    }
  }

  private setupMatcherRefresh(): void {
    const control = this.control();
    if (!control) return;

    merge(control.statusChanges, control.valueChanges, control.events, this.formSubmit?.submit$ ?? EMPTY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }
}
