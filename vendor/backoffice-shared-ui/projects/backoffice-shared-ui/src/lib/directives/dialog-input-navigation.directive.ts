import { AfterViewInit, Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomHeaderButton, FieldConfig } from '../details-panel/field-config.interface';
import { FieldType } from '../details-panel/field-type.enum';

export const DEFAULT_EDITABLE_FIELD_TYPES = new Set<FieldType>([
  FieldType.TextField,
  FieldType.Password,
  FieldType.NumberField,
  FieldType.TextArea,
  FieldType.InputWithSelect
]);

@Directive({
  selector: '[boDialogInputNavigation]',
  standalone: true
})
export class DialogInputNavigationDirective implements AfterViewInit {
  public readonly fields = input.required<FieldConfig[]>({ alias: 'boDialogInputNavigation' });
  public readonly actionButtons = input.required<CustomHeaderButton[]>();
  public readonly editableFieldTypes = input<Set<FieldType>>(DEFAULT_EDITABLE_FIELD_TYPES);

  private readonly elRef = inject(ElementRef);
  private readonly dialogRef = inject(MatDialogRef);

  public ngAfterViewInit(): void {
    this.dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        const inputs = this.getEditableInputs();
        if (inputs.length > 0) {
          inputs[0].focus();
        }
      }, 100);
    });
  }

  @HostListener('keydown.enter', ['$event'])
  public onEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;
    event.preventDefault();
    const inputs = this.getEditableInputs();
    const currentIndex = inputs.indexOf(target as HTMLInputElement);
    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    } else {
      const continueBtn = this.actionButtons().find(b => b.label === 'Continue');
      if (continueBtn) {
        continueBtn.action(undefined!);
      }
    }
  }

  private getEditableInputs(): HTMLInputElement[] {
    const el: HTMLElement = this.elRef.nativeElement;

    return this.fields()
      .filter(f => this.editableFieldTypes().has(f.type))
      .map(f => el.querySelector<HTMLInputElement>(`#${f.formControlName}`))
      .filter((foundInput): foundInput is HTMLInputElement => foundInput !== null);
  }
}
