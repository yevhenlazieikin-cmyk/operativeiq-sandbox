import { Injectable, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfileEditDialogData, ProfileData } from './profile-edit-dialog.interface';
import { ProfileEditDialogComponent } from './profile-edit-dialog.component';
import { DialogManagerService } from '../dialog-manager/dialog-manager.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileEditDialogService {
  private readonly dialogManager = inject(DialogManagerService);

  /**
   * Opens the Profile Edit dialog via the dialog manager so it can be hidden when nested dialogs open.
   */
  public openDialog(data: ProfileEditDialogData): MatDialogRef<ProfileEditDialogComponent, ProfileData | undefined> {
    return this.dialogManager.open(ProfileEditDialogComponent, {
      disableClose: true,
      width: '575px',
      maxHeight: '95vh',
      height: '919px',
      panelClass: 'profile-edit-dialog-panel',
      data
    });
  }
}
