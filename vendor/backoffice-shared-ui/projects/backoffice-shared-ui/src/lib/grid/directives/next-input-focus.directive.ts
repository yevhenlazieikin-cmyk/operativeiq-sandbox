import { DestroyRef, Directive, ElementRef, HostListener, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject } from 'rxjs';

const FOOTER_HEIGHT = 55;

@Directive({
  selector: '[appNextInputFocus]',
  standalone: false
})
export class NextInputFocusDirective implements OnInit {
  public appNextInputFocus = input<boolean>(true);
  public classSelector = input<string>('next-input');
  public idPrefix = input<string>();

  public enterEvent$ = new Subject<void>();
  public readonly element = inject(ElementRef);

  private readonly _destroy$ = inject(DestroyRef);

  @HostListener('window:keydown.enter', ['$event'])
  public onEnter(event: KeyboardEvent): void {
    if ((event.target as HTMLInputElement).id === this.idPrefix()) {
      this.enterEvent$.next();
    }
  }

  public ngOnInit(): void {
    if (this.appNextInputFocus()) {
      fromEvent(this.element.nativeElement, 'focus')
        .pipe(takeUntilDestroyed(this._destroy$))
        .subscribe((e: any) => {
          const clientRect = this.element.nativeElement.getBoundingClientRect();

          if (clientRect.top > window.innerHeight - clientRect.height - FOOTER_HEIGHT) {
            e.preventDefault();

            const y = clientRect.top + window.scrollY - clientRect.height - FOOTER_HEIGHT;

            window.scrollTo({ top: y });
          }
        });
    }
  }
}
