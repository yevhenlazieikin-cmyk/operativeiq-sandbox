import { AfterViewInit, Directive, ElementRef, HostListener, inject, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appStickyHeader]',
  standalone: false
})
export class StickyHeaderDirective implements OnInit, AfterViewInit {
  @Input() public condition!: boolean;
  @Input() public anchor!: HTMLElement;
  @Input() public originalWrapperHeight = false;
  public element!: HTMLElement;
  public originalHeight!: number;
  public parentElement: any;

  public get gridWidth(): number {
    return this.parentElement.offsetWidth as number;
  }

  public get constrainedGridWidth(): number {
    const wrapper = this.parentElement?.closest('.grid-container__wrapper');
    const visibleWidth = wrapper?.clientWidth ?? this.gridWidth;

    return Math.min(this.gridWidth, visibleWidth);
  }

  public get originalPosition(): number {
    const bodyTop = document.body.getBoundingClientRect().top;

    return this.parentElement.getBoundingClientRect().top - bodyTop;
  }

  public get gridHeight(): number {
    const bodyTop = document.body.getBoundingClientRect().top;

    return this.anchor.getBoundingClientRect().top - bodyTop;
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.recalculateDimensions();
  }

  private readonly _element = inject(ElementRef<HTMLElement>);
  private readonly _renderer = inject(Renderer2);

  public isFixed(el: any) {
    const style = window.getComputedStyle(el);

    return style.position === 'fixed';
  }

  public ngOnInit() {
    this.element = this._element.nativeElement;
    if (this.condition) {
      this.wrapElement();
    }
  }

  public ngAfterViewInit(): void {
    if (!this.condition) {
      return;
    }

    setTimeout(() => {
      this.originalHeight = this.element.offsetHeight;
      this._renderer.setStyle(
        this.parentElement,
        'height',
        `${this.originalWrapperHeight ? this.originalHeight : this.originalHeight - 1}px`
      );
    });
  }

  public wrapElement(): void {
    this.parentElement = this.element.parentElement?.getElementsByClassName('stick-header')[0];

    if (!this.parentElement) {
      this.parentElement = this._renderer.createElement('div');
      this._renderer.addClass(this.parentElement, 'stick-header');
    }

    const containerElement = this.element.parentNode;
    this._renderer.appendChild(this.parentElement, this.element);
    this._renderer.insertBefore(containerElement, this.parentElement, containerElement?.firstChild);
  }

  public recalculateDimensions(): void {
    this.originalHeight = this.element.offsetHeight;

    if (this.element.offsetWidth !== this.parentElement.offsetWidth) {
      this._renderer.setStyle(this.element, 'width', `${this.parentElement.offsetWidth}px`);
    }

    if (this.parentElement.height !== this.originalHeight) {
      this._renderer.setStyle(
        this.parentElement,
        'height',
        `${this.originalWrapperHeight ? this.originalHeight : this.originalHeight - 1}px`
      );
    }
  }
}
