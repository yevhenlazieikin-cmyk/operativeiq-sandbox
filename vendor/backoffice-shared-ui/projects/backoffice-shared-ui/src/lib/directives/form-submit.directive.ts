import { Directive, ElementRef, inject, DestroyRef } from '@angular/core';
import { fromEvent, Observable, BehaviorSubject } from 'rxjs';
import { FormValidationService, ResetEvent } from '../services/form-validation.service';
import { FormGroupDirective } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: 'form[formGroup], form[ngForm]',
  standalone: true,
  exportAs: 'boFormSubmit'
})
export class BoFormSubmitDirective {
  private readonly element = inject<ElementRef<HTMLFormElement>>(ElementRef).nativeElement;
  private readonly formGroupDir = inject(FormGroupDirective);
  private readonly fvs = inject(FormValidationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly submitSubject = new BehaviorSubject<boolean>(false);
  public readonly submit$: Observable<boolean> = this.submitSubject.asObservable();

  constructor() {
    fromEvent(this.element, 'submit')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.submitSubject.next(true);
      });

    this.fvs.submitRequested$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((formIds: string[]) => {
      if (formIds.includes(this.element.id) && this.element.isConnected) {
        this.element.requestSubmit();
      }
    });

    this.fvs.resetRequested$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ resetAll, formIds = [] }: ResetEvent) => {
      if (resetAll) {
        this.resetValidationState();
      } else {
        for (const formId of formIds) {
          if (this.element.id === formId) {
            this.resetValidationState();
          }
        }
      }
    });
  }

  private resetValidationState(): void {
    this.formGroupDir.control.markAsUntouched();
    this.formGroupDir.control.markAsPristine();
    this.submitSubject.next(false);
  }
}
