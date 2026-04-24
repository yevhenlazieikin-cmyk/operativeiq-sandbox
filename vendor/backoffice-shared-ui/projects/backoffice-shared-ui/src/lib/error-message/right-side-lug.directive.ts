import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  ViewContainerRef,
  ComponentRef,
  Injector,
  NgZone,
  inject,
  input,
  signal,
  DestroyRef
} from '@angular/core';
import { of, Subscription } from 'rxjs';
import { BOErrorStateMatcher } from '../details-panel/details-panel.matcher';
import { BoFormSubmitDirective } from '../directives/form-submit.directive';
import { AbstractControl, NgControl } from '@angular/forms';
import { ValidationStrategy } from '../details-panel/field-config.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[appAbsoluteDivPopout]',
  standalone: true,
  exportAs: 'boPopout'
})
export class AbsoluteDivPopoutDirective implements OnInit, OnDestroy {
  public readonly popoutContent = input<string>('');
  public readonly displayLower = signal<boolean>(false);
  public readonly insideDialog = input<boolean | undefined>(false);
  public readonly strategy = input<ValidationStrategy>('default');
  public readonly control = input<AbstractControl | null>(null);

  private componentRef: ComponentRef<any> | null = null;
  private animationFrameId: number | null = null;
  private scrollParent: HTMLElement | null = null;

  private lastTop = 0;
  private lastLeft = 0;
  private isHidden = false;
  private showError = false;

  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formSubmit = inject(BoFormSubmitDirective, { optional: true });
  private readonly ngControl = inject(NgControl, { optional: true });
  private readonly matcher = inject(BOErrorStateMatcher);
  private subscription?: Subscription;

  public ngOnInit(): void {
    const control = this.ngControl?.control || this.control();
    if (!control) return;

    const submitStream$ = this.formSubmit ? this.formSubmit.submit$ : of(false);

    const errorState$ = this.matcher.isErrorVisible(control, submitStream$, this.strategy());

    this.subscription = errorState$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async visible => {
      this.showError = visible;
      if (visible && this.popoutContent() !== '') {
        await this.show();
        this.updateInputs();
      } else {
        this.hide();
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.hide();
  }

  private async show(): Promise<void> {
    if (this.componentRef) return;

    this.scrollParent = this.getScrollParent(this.elementRef.nativeElement);

    const { ErrorMessageComponent } = await import('./error-message.component');

    if (this.componentRef) return;

    this.componentRef = this.viewContainerRef.createComponent(ErrorMessageComponent, {
      injector: this.injector
    });

    const nativeEl = this.componentRef.location.nativeElement;

    this.renderer.setStyle(nativeEl, 'position', 'absolute');
    this.renderer.setStyle(nativeEl, 'top', '0px');
    this.renderer.setStyle(nativeEl, 'left', '0px');
    this.renderer.setStyle(nativeEl, 'z-index', !this.insideDialog() ? '999' : '10000');
    this.renderer.setStyle(nativeEl, 'opacity', '0');

    this.renderer.appendChild(document.body, nativeEl);

    setTimeout(() => {
      if (this.componentRef) {
        this.startPositionLoop();
        this.renderer.setStyle(nativeEl, 'opacity', '1');
      }
    }, 150);
  }

  private updateInputs(): void {
    if (this.componentRef) {
      this.componentRef.setInput('errorMessage', this.popoutContent());
      this.componentRef.setInput('displayLower', this.displayLower());
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }

  private startPositionLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        if (!this.componentRef) return;
        this.updatePosition();
        this.animationFrameId = requestAnimationFrame(loop);
      };
      loop();
    });
  }

  private updatePosition(): void {
    if (!this.componentRef) return;

    const nativeEl = this.componentRef.location.nativeElement;
    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    const { innerHeight } = window;

    let clipTop = 0;
    let clipBottom = innerHeight;

    if (this.scrollParent && this.scrollParent !== document.body) {
      const parentRect = this.scrollParent.getBoundingClientRect();
      clipTop = parentRect.top;
      clipBottom = parentRect.bottom;
    }

    const shouldDisplayLower = bodyRect.right - hostRect.right < 150;

    if (this.displayLower() !== shouldDisplayLower) {
      this.displayLower.set(shouldDisplayLower);
      this.componentRef.setInput('displayLower', shouldDisplayLower);
      this.componentRef.changeDetectorRef.detectChanges();
    }

    const isAnchorVisible = hostRect.top > clipTop - 5 && hostRect.bottom < clipBottom + 5;

    if (!isAnchorVisible) {
      if (!this.isHidden) {
        this.renderer.setStyle(nativeEl, 'display', 'none');
        this.isHidden = true;
      }

      return;
    } else {
      if (this.isHidden) {
        this.renderer.removeStyle(nativeEl, 'display');
        this.isHidden = false;
      }
    }

    let targetTop = 0;
    let targetLeft = 0;

    if (this.displayLower()) {
      targetTop = hostRect.bottom - bodyRect.top + 1;
      targetLeft = hostRect.right - bodyRect.left;
    } else {
      const innerDiv = nativeEl.querySelector('.error-message') as HTMLElement;
      const messageHeight = innerDiv ? innerDiv.offsetHeight : null;
      targetTop = hostRect.top - bodyRect.top;

      if (messageHeight && hostRect.height < 40) {
        targetTop += hostRect.height / 2 - messageHeight / 2;
      }

      targetLeft = hostRect.right - bodyRect.left + 1;
    }

    if (Math.abs(targetTop - this.lastTop) > 0.5 || Math.abs(targetLeft - this.lastLeft) > 0.5) {
      this.renderer.setStyle(nativeEl, 'top', `${targetTop}px`);
      this.renderer.setStyle(nativeEl, 'left', `${targetLeft}px`);

      this.lastTop = targetTop;
      this.lastLeft = targetLeft;
    }
  }

  private hide(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.componentRef) {
      this.renderer.removeChild(document.body, this.componentRef.location.nativeElement);
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.isHidden = false;
    this.lastTop = 0;
    this.lastLeft = 0;
  }

  private getScrollParent(node: HTMLElement): HTMLElement {
    if (!node) return document.body;
    let parent = node.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (['auto', 'scroll'].includes(style.overflowY) || ['auto', 'scroll'].includes(style.overflow)) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return document.body;
  }

  public isErrorState(): boolean {
    return this.showError;
  }
}
