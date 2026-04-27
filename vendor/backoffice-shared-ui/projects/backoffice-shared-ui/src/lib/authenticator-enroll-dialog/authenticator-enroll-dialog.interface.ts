import { MatDialogRef } from '@angular/material/dialog';
import { menuType } from '../header/menu-type.enum';

export interface AuthenticatorEnrollDialogData {
  userMenu?: menuType;
  /** Display name for the user section (e.g. "Test User"). */
  userName?: string;
  /** Pre-filled login ID (e.g. "test_user"). */
  loginId?: string;
  /** Auth link encoded in the QR code (e.g. otpauth://totp/...). Mock if not from backend. */
  authLink?: string;
  /** Secret key for manual entry. Shown when user clicks View. Mock if not from backend. */
  secretKey?: string;
  /**
   * enrollSecret is the Base32 secret shown in this dialog (same as QR). Use it for the API so it cannot drift from currentSecret in the host.
   */
  onVerifyEnroll?: (code: string, enrollSecret: string, dialogRef: MatDialogRef<unknown>) => boolean | void | Promise<boolean>;
}

export interface AuthenticatorEnrollDialogResult {
  enrolled: boolean;
  verifyCode?: string;
}
