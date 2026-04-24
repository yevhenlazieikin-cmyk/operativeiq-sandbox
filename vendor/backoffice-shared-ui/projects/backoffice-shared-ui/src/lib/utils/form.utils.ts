import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export const getControlName = (control: AbstractControl): string | null | undefined => {
  const formGroup = control.parent?.controls as any;
  if (!formGroup) {
    return undefined;
  }

  return Object.keys(formGroup).find(name => control === formGroup[name]) || null;
};

// mark form as dirty and revalidate for display errors

export const markAsTouched = (form: FormGroup | FormArray): void => {
  Object.values(form.controls).forEach(control => {
    control.markAsTouched();
  });
};

//mark as untouched specific control

export const markControlAsUntouched = (control: AbstractControl): void => {
  control.markAsUntouched();
  control.markAsPristine();
};

// mark form as untouched for reset errors

export const markAsUntouched = (form: FormGroup | FormArray): void => {
  Object.values(form.controls).forEach(control => {
    markControlAsUntouched(control);
  });
};

// remove controls

export const removeControls = (form: FormGroup, controls: string[]): void => {
  controls.forEach(control => {
    if (form.get(control)) {
      form.removeControl(control, { emitEvent: false });
    }
  });
};

export const markAsTouchedAndValidate = (form: FormGroup | FormArray): void => {
  Object.values(form.controls).forEach(control => {
    control.markAsTouched();
    control.updateValueAndValidity();
  });
};

export const touchAndValidateAllControls = (control: AbstractControl) => {
  if (control instanceof FormGroup || control instanceof FormArray) {
    Object.values(control.controls).forEach(childControl => {
      touchAndValidateAllControls(childControl);
    });
  }

  control.markAsTouched({ onlySelf: true });
  control.updateValueAndValidity({ onlySelf: true });
};

export const hasRequiredError = (control: AbstractControl): boolean => {
  if (control instanceof FormGroup || control instanceof FormArray) {
    return Object.values(control.controls).some(child => hasRequiredError(child));
  }

  return control.hasError('required');
};
