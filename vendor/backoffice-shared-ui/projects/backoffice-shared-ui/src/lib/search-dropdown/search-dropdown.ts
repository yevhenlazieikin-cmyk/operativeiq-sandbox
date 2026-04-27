import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { menuType } from '../header/menu-type.enum';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
// import { markControlAsUntouched } from '../../_utils/form.utils';

@Component({
  selector: 'bo-search-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    SvgIconComponent
  ],
  templateUrl: './search-dropdown.html',
  styleUrls: ['./search-dropdown.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchDropdown),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDropdown implements ControlValueAccessor, OnInit {
  public readonly formControlName = input<string>();
  public readonly options = input<any[]>([]);
  public readonly valueProperty = input<string | null>(null);
  public readonly displayProperty = input<string | null>();
  public readonly disabled = input<boolean>(false);
  public readonly placeholder = input<string>('');
  public readonly iconName = input<string>('');
  public readonly svgs = input({});
  public readonly hasSearch = input<boolean>(true);
  public readonly hasClear = input<boolean>(true);
  public readonly customTemplate = input<TemplateRef<any> | null>(null);
  public readonly applyTemplateForSelectedValue = input<boolean>(true);
  public readonly userMenu = input<menuType>(menuType.operation);

  public readonly menuType = menuType;

  public selectValue = model<any>(null);

  public readonly multiple = input<boolean>(false);
  public readonly _multiple = computed<boolean>(() => this.coerceBooleanProperty(this.multiple()));

  public readonly selectValueChange = output<any>();
  public readonly clearValue = output<void>();

  public optionsFiltered = signal<any[]>([]);
  public readonly searchText = signal<string>('');
  public readonly clearToggle = signal<boolean>(false);
  public selectedOption = signal<any>(null);
  public readonly control = signal<AbstractControl | null>(null);

  public isClearable = computed(() => {
    const currentValue = this.selectValue();

    const checkBaseCondition = (val: any) =>
      val !== null && val !== undefined && val !== '' && val !== -1 && val?.length !== 0 && !this.disabled() && !this.clearToggle();

    const controlDisabled = this.control()?.disabled ?? false;

    return checkBaseCondition(currentValue) && !controlDisabled;
  });

  public onChange = (v: any): void => {};
  public onTouched = (): void => {};

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly controlContainer = inject(ControlContainer, { optional: true, host: true, skipSelf: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly inputFilter = viewChild<HTMLInputElement>('inputFilter');
  private pendingValue: any = null;

  constructor() {
    effect(() => {
      const opts = this.options();
      if (opts && opts.length) {
        this.optionsFiltered.set(opts);

        if (this.pendingValue !== null) {
          this.trySetValue(this.pendingValue);
          this.pendingValue = null;
        } else if (this.selectValue() !== null) {
          this.trySetValue(this.selectValue());
        }
      }
    });

    effect(() => {
      const value = this.selectValue();
      this.selectValueChange.emit(value);
    });
  }

  public ngOnInit(): void {
    const controlName = this.formControlName();
    if (controlName) {
      const ctrl = this.controlContainer?.control?.get(controlName.toString());
      this.control.set(ctrl || null);
    }

    const opts = this.options();
    if (opts && opts.length) {
      this.optionsFiltered.set(opts);
    }
  }

  public writeValue(value: any): void {
    if (value === null || value === undefined || value === '' || value === -1 || (Array.isArray(value) && value.length === 0)) {
      this.selectValue.set(value);
      this.setSelectedOption(value);
      this.onChange(value);
    } else if (!this.options() || this.options().length === 0) {
      this.pendingValue = value;
    } else {
      this.trySetValue(value);
    }
    this.cdr.detectChanges();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.cdr.detectChanges();
  }

  public onSelectValueChange(newValue: any): void {
    this.selectValue.set(newValue);
    this.trySetValue(newValue);
    this.onTouched();
  }

  public clear(): void {
    this.selectValue.set(null);
    this.selectedOption.set(null);
    this.onChange(null);
    this.clearValue.emit();

    const ctrl = this.control();
    if (ctrl) {
      ctrl.setValue(null);
    }

    this.cdr.detectChanges();
  }

  public filterList(event: Event): void {
    const filterParam = (event.target as HTMLInputElement).value.trim();
    this.searchText.set(filterParam);
    const filtered = this.options().filter(obj => this.filter(obj, filterParam));
    this.optionsFiltered.set(filtered);
  }

  public stopEventProp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.stopPropagation();
    }
  }

  public onOpen(toggle: boolean): void {
    this.clearToggle.set(toggle);
    const el = document.getElementsByClassName('input-filter')[0] as HTMLElement;
    if (el) {
      el.focus();
    }
    this.searchText.set('');
    this.optionsFiltered.set(this.options());
  }

  private trySetValue(value: any): void {
    const opts = this.options();
    const valueProp = this.valueProperty();

    let isValidValue = false;

    if (this._multiple()) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          isValidValue = true;
        } else {
          const allFound = value.every(val => opts?.some(opt => (valueProp ? opt[valueProp] === val : opt === val)));
          isValidValue = allFound;
        }
      }
    } else {
      const found = opts?.find(opt => (valueProp ? opt[valueProp] === value : opt === value));
      isValidValue = !!found;
    }

    if (isValidValue) {
      this.selectValue.set(value);
      this.setSelectedOption(value);
      this.onChange(value);
    } else if (value === null || value === undefined || value === '') {
      this.selectValue.set(null);
      this.selectedOption.set(null);
      this.onChange(null);
    } else {
      const resetValue = this._multiple() ? [] : null;

      this.selectValue.set(resetValue);
      this.selectedOption.set(null);
      this.onChange(resetValue);

      const ctrl = this.control();
      if (ctrl) {
        ctrl.setValue(resetValue);
        // markControlAsUntouched(ctrl);
      }
    }
  }

  private setSelectedOption(value: any): void {
    const filtered = this.optionsFiltered();
    if (!filtered) return;

    const valueProp = this.valueProperty();
    const selected = filtered.find(item => (valueProp ? item[valueProp] === value : item === value));
    this.selectedOption.set(selected || null);
  }

  private coerceBooleanProperty(value: any): boolean {
    return value != null && `${value}` !== 'false';
  }

  private filter(obj: any, filter: string): boolean {
    const displayProp = this.displayProperty();
    if (displayProp && obj[displayProp]) {
      return obj[displayProp].toLowerCase().includes(filter.toLowerCase());
    } else {
      return obj?.toLowerCase?.().includes?.(filter.toLowerCase?.());
    }
  }
}
