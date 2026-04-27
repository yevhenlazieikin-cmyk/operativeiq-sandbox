import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[appHoverClass]'
})
export class HoverClassDirective {
  public hoverClass = input.required<string>();
  public svgName = input.required<string>();

  private readonly elRef = inject(ElementRef);

  @HostListener('mouseenter') onMouseEnter() {
    if (this.hoverClass()) {
      const condition = this.elRef.nativeElement.classList.contains(`svg-${this.svgName()}`);

      if (condition) {
        this.elRef.nativeElement.classList.remove(`svg-${this.svgName()}`);
      }
      this.elRef.nativeElement.classList.add(this.hoverClass());
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.hoverClass()) {
      this.elRef.nativeElement.classList.remove(this.hoverClass());
      this.elRef.nativeElement.classList.add(`svg-${this.svgName()}`);
    }
  }
}
