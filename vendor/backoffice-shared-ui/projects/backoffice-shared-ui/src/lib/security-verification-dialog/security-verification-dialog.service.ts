import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserVerificationMethodEnum } from '../shared/enums/user-verification-method.enum';
import { SecurityVerificationDialogData, SecurityVerificationDialogResult } from './security-verification-dialog.interface';
import { VerificationCodeDialog } from '@backoffice/shared-ui/lib/verification-code-dialog.component/verification-code-dialog.component';
import { DigitalSignaturePinSecurityVerificationDialog } from '../digital-signature-pin-security-verification-dialog/digital-signature-pin-security-verification-dialog';
import { PasswordPinSecurityVerificationDialog } from '../password-pin-security-verification-dialog/password-pin-security-verification-dialog';

const DIALOG_CONFIG = {
  disableClose: true,
  width: '485px',
  maxHeight: '95vh',
  panelClass: 'security-verification-dialog-panel'
};

export interface SecurityVerificationDialogMergeConfig {
  panelClass?: string | string[];
}

@Injectable({
  providedIn: 'root'
})
export class SecurityVerificationDialogService {
  public dialogRef!: MatDialogRef<unknown, SecurityVerificationDialogResult | undefined>;
  private readonly dialog = inject(MatDialog);

  /**
   * Opens the Security Verification dialog appropriate for the given verification method.
   * @param data - Must include verificationMethod; userMenu and other fields are optional.
   * @param mergeConfig - Optional config to merge (e.g. panelClass for dialog stack manager).
   * @returns MatDialogRef for the opened dialog. Subscribe to afterClosed() for result.
   */
  public openVerificationDialog(
    data: SecurityVerificationDialogData,
    mergeConfig?: SecurityVerificationDialogMergeConfig
  ): MatDialogRef<unknown, SecurityVerificationDialogResult | undefined> {
    const { verificationMethod, ...rest } = data;
    const panelClass = this.mergePanelClass(DIALOG_CONFIG.panelClass, mergeConfig?.panelClass);

    const baseConfig = { ...DIALOG_CONFIG, panelClass, data: { ...rest, verificationMethod } };

    switch (verificationMethod) {
      case UserVerificationMethodEnum.DigitalSignatureAndPin:
        return this.dialog.open(DigitalSignaturePinSecurityVerificationDialog, {
          ...baseConfig,
          height: '545px',
          data: { ...rest, verificationMethod }
        }) as MatDialogRef<unknown, SecurityVerificationDialogResult | undefined>;

      case UserVerificationMethodEnum.PasswordAndPin:
        return this.dialog.open(PasswordPinSecurityVerificationDialog, {
          ...baseConfig,
          minHeight: '403px',
          data: { ...rest, verificationMethod }
        }) as MatDialogRef<unknown, SecurityVerificationDialogResult | undefined>;

      case UserVerificationMethodEnum.VerificationCode:
        return this.dialog.open(VerificationCodeDialog, {
          ...baseConfig,
          minHeight: '363px',
          data: { ...rest, verificationMethod, userMenu: rest.userMenu }
        }) as MatDialogRef<unknown, SecurityVerificationDialogResult | undefined>;

      default:
        throw new Error(`Unknown verification method: ${verificationMethod}`);
    }
  }

  private mergePanelClass(defaultClass: string | string[], merge?: string | string[]): string | string[] {
    const base = Array.isArray(defaultClass) ? defaultClass : [defaultClass];
    if (!merge) return base;
    const extra = Array.isArray(merge) ? merge : [merge];

    return [...base, ...extra];
  }

  /**
   * Opens the verification dialog and returns an Observable that emits when the dialog is closed.
   */
  public openVerificationDialogAndAfterClosed(
    data: SecurityVerificationDialogData,
    mergeConfig?: SecurityVerificationDialogMergeConfig
  ): Observable<SecurityVerificationDialogResult | undefined> {
    this.dialogRef = this.openVerificationDialog(data, mergeConfig);

    return this.dialogRef?.afterClosed();
  }
}
