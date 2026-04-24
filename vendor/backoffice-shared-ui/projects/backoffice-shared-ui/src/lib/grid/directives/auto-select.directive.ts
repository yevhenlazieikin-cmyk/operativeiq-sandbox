import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appAutoSelect]'
})
export class AutoSelectDirective {
  private readonly el = inject(ElementRef);

  @HostListener('focus') onFocus() {
    if (this.el.nativeElement.select) {
      this.el.nativeElement.select();
    }
  }

  @HostListener('click') onClick() {
    if (document.activeElement === this.el.nativeElement) {
      this.el.nativeElement.select();
    }
  }
}
