export interface PasswordValidatorOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialCharacter?: boolean;
  loginId?: string;
  maskValue?: string;
}
