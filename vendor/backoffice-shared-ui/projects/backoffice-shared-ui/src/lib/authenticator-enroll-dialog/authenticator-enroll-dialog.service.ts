import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthenticatorEnrollDialogComponent } from './authenticator-enroll-dialog';
import { AuthenticatorEnrollDialogData, AuthenticatorEnrollDialogResult } from './authenticator-enroll-dialog.interface';

const DIALOG_CONFIG = {
  disableClose: true,
  width: '485px',
  minHeight: '563px',
  maxHeight: '95vh',
  panelClass: 'authenticator-enroll-dialog-panel'
};

export interface AuthenticatorEnrollDialogMergeConfig {
  panelClass?: string | string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorEnrollDialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Opens the Enroll Authenticator dialog (e.g. after successful security verification).
   * @param data - Dialog data.
   * @param mergeConfig - Optional config to merge (e.g. panelClass for dialog stack manager).
   */
  public openEnrollDialog(
    data: AuthenticatorEnrollDialogData,
    mergeConfig?: AuthenticatorEnrollDialogMergeConfig
  ): MatDialogRef<AuthenticatorEnrollDialogComponent, AuthenticatorEnrollDialogResult | undefined> {
    const panelClass = this.mergePanelClass(DIALOG_CONFIG.panelClass, mergeConfig?.panelClass);

    return this.dialog.open(AuthenticatorEnrollDialogComponent, {
      ...DIALOG_CONFIG,
      panelClass,
      data
    });
  }

  private mergePanelClass(defaultClass: string | string[], merge?: string | string[]): string | string[] {
    const base = Array.isArray(defaultClass) ? defaultClass : [defaultClass];
    if (!merge) return base;
    const extra = Array.isArray(merge) ? merge : [merge];

    return [...base, ...extra];
  }

  /**
   * Opens the enroll dialog and returns an Observable that emits when the dialog is closed.
   */
  public openEnrollDialogAndAfterClosed(
    data: AuthenticatorEnrollDialogData,
    mergeConfig?: AuthenticatorEnrollDialogMergeConfig
  ): Observable<AuthenticatorEnrollDialogResult | undefined> {
    return this.openEnrollDialog(data, mergeConfig).afterClosed();
  }
}
