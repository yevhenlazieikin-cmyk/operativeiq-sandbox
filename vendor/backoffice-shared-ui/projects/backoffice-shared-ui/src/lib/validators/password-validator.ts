import { AbstractControl, ValidatorFn } from '@angular/forms';
import { PasswordValidatorOptions } from './password-validator-options.interface';

const specialCharRegex = /[!#$%&'()*+,\-./:;=?@^_`{|}~/"\\]/;

interface PasswordRule {
  enabled: boolean;
  isSatisfied: (value: string) => boolean;
  message: string;
}

function passwordComplexityErrors(value: string, options?: PasswordValidatorOptions): { passwordComplexity: string } | null {
  const minLength = options?.minLength ?? 4;
  const rules: PasswordRule[] = [
    {
      enabled: true,
      isSatisfied: v => v.length >= minLength,
      message: `- Password length must be at least ${minLength} characters long`
    },
    {
      enabled: options?.requireUppercase === true,
      isSatisfied: v => /[A-Z]/.test(v),
      message: '- Require an upper case letter'
    },
    {
      enabled: options?.requireLowercase === true,
      isSatisfied: v => /[a-z]/.test(v),
      message: '- Require a lower case letter'
    },
    {
      enabled: options?.requireNumber === true,
      isSatisfied: v => /[0-9]/.test(v),
      message: '- Require a number'
    },
    {
      enabled: options?.requireSpecialCharacter === true,
      isSatisfied: v => specialCharRegex.test(v),
      message: '- Require a special symbol'
    }
  ];

  const hasExtendedRules = rules.slice(1).some(r => r.enabled);
  const enabledRules = rules.filter(r => r.enabled);
  const violations = enabledRules.filter(r => !r.isSatisfied(value)).map(r => r.message);

  if (violations.length === 0) {
    return null;
  }

  if (hasExtendedRules) {
    const policyRulesHtml = `<span class="policy-rules">${enabledRules.map(r => r.message).join('<br>')}</span>`;
    const message = `Password does not meet the security policy set by your system administrator.<br>${policyRulesHtml}`;

    return { passwordComplexity: message };
  }

  return { passwordComplexity: `${violations[0].replace(/^- /, '')}.` };
}

export const passwordValidator =
  (options?: PasswordValidatorOptions): ValidatorFn =>
  (control: AbstractControl) => {
    const value = control.value as string | null | undefined;
    const maskValue = options?.maskValue;

    if (!value || (maskValue && value === maskValue)) {
      return null;
    }

    const loginId = options?.loginId;
    if (loginId && value === loginId) {
      return { passwordComplexity: "Password can't be the same as user login." };
    }

    return passwordComplexityErrors(value, options);
  };
