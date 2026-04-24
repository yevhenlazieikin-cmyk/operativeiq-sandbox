import { Directive, ElementRef, HostListener, inject, input, OnInit } from '@angular/core';
import { MatRipple } from '@angular/material/core';

const BASIC_RIPPLE_RADIUS = 15;

@Directive({
  selector: '[appRippleOnHover]',
  providers: [MatRipple],
  standalone: false
})
export class RippleOnhoverDirective implements OnInit {
  public rippleRef: any;
  public rippeRadius = input<number>(BASIC_RIPPLE_RADIUS);

  @HostListener('mouseenter') onMouseEnter(): void {
    if (this.elementRef && this.elementRef.nativeElement) {
      this.elementRef.nativeElement.style.overflow = 'hidden';
    }

    if (this.ripple) {
      this.rippleRef = this.ripple.launch({ centered: true, persistent: true, radius: this.rippeRadius() });
    }
  }
  @HostListener('mouseleave') onMouseLeave(): void {
    if (this.rippleRef) {
      this.rippleRef.fadeOut();
    }
  }

  private readonly elementRef = inject(ElementRef);
  private readonly ripple = inject(MatRipple);

  ngOnInit(): void {
    this.elementRef.nativeElement.classList.add('app-mat-ripple');
  }
}
