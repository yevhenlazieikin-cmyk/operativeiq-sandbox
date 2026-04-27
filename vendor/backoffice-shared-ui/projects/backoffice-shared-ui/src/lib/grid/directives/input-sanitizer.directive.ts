import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appInputSanitizer]',
  standalone: false
})
export class InputSanitizerDirective {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly ngModel = inject(NgModel);

  @HostListener('input', ['$event'])
  public onInput(event: Event): void {
    if (this.ngModel) {
      const inputValue = (event.target as HTMLInputElement).value;
      const trimmedValue = this.trimWhitespace(inputValue);

      this.ngModel.viewModel = trimmedValue;
      this.ngModel.update.emit(trimmedValue);
    }
  }

  @HostListener('paste', ['$event'])
  public onPaste(event: ClipboardEvent): void {
    if (this.ngModel) {
      event.preventDefault();
      const clipboardData = event.clipboardData?.getData('text') || '';
      const trimmedValue = this.trimWhitespace(clipboardData);

      this.renderer.setProperty(this.el.nativeElement, 'value', clipboardData);
      this.ngModel.viewModel = trimmedValue;
      this.ngModel.update.emit(trimmedValue);
    }
  }

  private trimWhitespace(value: string): string {
    return value.replace(/^\s+|\s+$/g, '');
  }
}
