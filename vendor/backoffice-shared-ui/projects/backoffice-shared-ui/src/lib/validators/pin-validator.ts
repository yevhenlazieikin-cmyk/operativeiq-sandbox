import { AbstractControl, ValidatorFn } from '@angular/forms';

const PIN_PATTERN = /^$|^\d{4,50}$/;

export interface PinValidatorOptions {
  maskValue?: string;
}

export const pinValidator =
  (options?: PinValidatorOptions): ValidatorFn =>
  (control: AbstractControl) => {
    const value = control.value;
    const maskValue = options?.maskValue;

    if (!value || (maskValue && value === maskValue)) {
      return null;
    }

    if (!PIN_PATTERN.test(value)) {
      return { pinFormat: 'PIN must be at least 4 digits.' };
    }

    return null;
  };
