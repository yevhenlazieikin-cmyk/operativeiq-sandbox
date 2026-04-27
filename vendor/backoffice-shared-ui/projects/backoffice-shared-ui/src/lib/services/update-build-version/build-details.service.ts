import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseDialog } from '@backoffice/shared-ui';
import { BuildDetails } from '@backoffice/shared-ui/lib/services/update-build-version/build-details';

@Injectable({ providedIn: 'root' })
export class BuildDetailsService {
  public buildDetails: BuildDetails;
  private dialogRef: MatDialogRef<BaseDialog> | null = null;

  private readonly dialog = inject(MatDialog);

  constructor() {
    this.buildDetails = new BuildDetails();
  }

  public showAppUpdateAlert(version: string): void {
    const message = 'Operative IQ Back Office has been updated.  The page will be reloaded.';
    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
    this.dialogRef = this.dialog.open(BaseDialog, {
      data: {
        header: 'Confirmation',
        message,
        primaryButton: {
          text: 'OK',
          return: true,
          disabled: false
        }
      },
      disableClose: true
    });

    this.dialogRef?.afterClosed().subscribe(res => {
      if (res) {
        this._updateManually(version);
      }
    });
  }

  private _updateManually(version: string): void {
    this.buildDetails.setBuildNumber(version);
    window.location.reload();
  }
}
