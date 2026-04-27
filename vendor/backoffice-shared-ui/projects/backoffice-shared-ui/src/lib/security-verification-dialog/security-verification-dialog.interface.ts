import { MatDialogRef } from '@angular/material/dialog';
import { UserVerificationMethodEnum } from '../shared/enums/user-verification-method.enum';
import { menuType } from '../header/menu-type.enum';

export interface SecurityVerificationDialogData {
  verificationMethod: UserVerificationMethodEnum;
  userMenu?: menuType;
  /** Pre-filled login ID for Digital Signature + PIN (e.g. "test_user"). */
  loginId?: string;
  /** Display name for user section (e.g. "Test User"). */
  userName?: string;
  /**
   * When provided and user clicks Continue with verified, this is called instead of closing the dialog.
   * Caller can open a child dialog (e.g. enroll) so verification stays in the stack and Back on child shows verification.
   */
  onVerified?: (dialogRef: MatDialogRef<unknown>, result: SecurityVerificationDialogResult) => void;
  /**
   * Verification-code flow hook. Called automatically on dialog open (manual=false) and when the user clicks
   * "Regenerate Code" (manual=true). The host owns the token, performs the HTTP call, and can surface a
   * success/error banner by calling `dialogRef.componentInstance.showValidationError(...)`.
   */
  onGenerateCode?: (dialogRef: MatDialogRef<unknown>, manual: boolean) => void;
  [key: string]: unknown;
}

export interface SecurityVerificationDialogResult {
  verified: boolean;
  [key: string]: unknown;
}
