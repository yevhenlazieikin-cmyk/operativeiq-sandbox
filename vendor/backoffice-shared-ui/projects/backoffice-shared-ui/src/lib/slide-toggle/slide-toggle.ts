import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, inject, input, signal, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'bo-slide-toggle',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './slide-toggle.html',
  styleUrl: './slide-toggle.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlideToggle),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideToggle implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);
  public isDisabled = false;

  public readonly customTemplate = input<TemplateRef<any>>();
  public value = signal<boolean>(true);

  public toggle(): void {
    if (this.isDisabled) return;

    this.value.set(!this.value());
    this.onChange(this.value());
    this.onTouched();
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  public writeValue(value: boolean): void {
    this.value.set(value ?? true);
  }

  public registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  private onChange = (value: boolean) => {};
  private onTouched = () => {};
}
