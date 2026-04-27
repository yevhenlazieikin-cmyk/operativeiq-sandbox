import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatHint, MatInput } from '@angular/material/input';
import { menuType } from '@backoffice/shared-ui';

@Component({
  selector: 'bo-text-area-control',
  imports: [MatFormField, MatInput, ReactiveFormsModule, MatHint, NgClass],
  templateUrl: './text-area-control.component.html',
  styleUrl: './text-area-control.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TextAreaControl,
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaControl implements ControlValueAccessor {
  @ViewChild('textarea') private readonly textarea?: ElementRef<HTMLTextAreaElement>;
  public value = '';
  public isDisabled = false;

  public readonly menuType = menuType;
  public readonly maxLength = input<number>(500);
  public readonly placeholder = input<string>('Enter...');
  public readonly userMenu = input<menuType>(this.menuType.administration);
  public readonly autoFocus = input<boolean>(false);

  private readonly cdr = inject(ChangeDetectorRef);

  private onChange = (val: string) => {};
  private onTouched = () => {};

  public writeValue(val: string | null | undefined): void {
    this.value = val || '';
    this.cdr.markForCheck();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onTextChange(event: Event): void {
    const newText = (event.target as HTMLTextAreaElement).value;
    this.value = newText;
    this.onChange(this.value);
    this.onTouched();
  }

  public autofocusApply(): void {
    if (this.autoFocus() && this.textarea?.nativeElement) {
      this.textarea?.nativeElement.focus();
    }
  }
}
