import { Injectable } from '@angular/core';
import { AbstractControl, TouchedChangeEvent } from '@angular/forms';
import { Observable, combineLatest, filter, map, merge, of, scan, startWith } from 'rxjs';
import { ValidationStrategy } from './field-config.interface';

@Injectable({ providedIn: 'root' })
export class BOErrorStateMatcher {
  isErrorVisible(
    control: AbstractControl | null,
    submit$: Observable<boolean>,
    strategy: ValidationStrategy = 'default'
  ): Observable<boolean> {
    if (!control) return of(false);

    const touchedChanges$ = control.events.pipe(
      filter(event => event instanceof TouchedChangeEvent),
      map(() => control.touched),
      startWith(control.touched)
    );

    const submitStrategyVisible$ = merge(
      submit$.pipe(map(isSubmitted => ({ type: 'submit' as const, isSubmitted }))),
      control.valueChanges.pipe(map(() => ({ type: 'valueChange' as const })))
    ).pipe(
      scan((isVisible, event) => {
        if (event.type === 'submit') {
          return event.isSubmitted ? control.invalid : false;
        }

        return false;
      }, false),
      startWith(false)
    );

    return combineLatest([
      control.statusChanges.pipe(startWith(control.status)),
      control.valueChanges.pipe(startWith(control.value)),
      touchedChanges$,
      submit$,
      submitStrategyVisible$
    ]).pipe(
      map(([status, value, blur, isSubmitted, submitStrategyVisible]) => {
        const invalid = control.invalid;
        const touched = control.touched;
        const dirty = control.dirty;

        if (!invalid) return false;

        switch (strategy) {
          case 'submit':
            return submitStrategyVisible;

          case 'change':
            // Aggressive: Show if user typed anything (dirty) OR submitted
            return dirty || isSubmitted;

          case 'touched':
            // Standard: Show on blur OR submitted
            return touched || isSubmitted;

          case 'default':
          default:
            // Hybrid: Show if user typed anything (dirty) OR on blur OR submitted
            return dirty || touched || isSubmitted;
        }
      })
    );
  }
}
