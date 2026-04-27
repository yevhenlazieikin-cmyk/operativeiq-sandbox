import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { ProgressBarMode } from '../progress-bar/progress-bar-mode.enum';
import { ProgressBar } from '../progress-bar/progress-bar';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { menuType } from '../header/menu-type.enum';

@Component({
  selector: 'bo-base-dialog',
  standalone: true,
  imports: [MatDialogModule, MatProgressBarModule, CommonModule, ProgressBar, SvgIconComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './base-dialog.html',
  styleUrl: './base-dialog.scss'
})
export class BaseDialog {
  @HostListener('document:keydown.escape', ['$event'])
  public onEscapePressed(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dialogRef.close(null);
  }

  public dialogRef = inject(MatDialogRef<BaseDialog>);
  public data = inject(MAT_DIALOG_DATA);

  public readonly progressBarMode = ProgressBarMode;
  public readonly menuType = menuType;

  public get isAdministration(): boolean {
    if (!this.data.userMenu) return false;

    // Handle both enum value and string value (in case it gets serialized)
    return (
      this.data.userMenu === menuType.administration ||
      this.data.userMenu === 'ADMINISTRATION' ||
      String(this.data.userMenu) === String(menuType.administration)
    );
  }

  public get isOperation(): boolean {
    if (!this.data.userMenu) return false;

    // Handle both enum value and string value (in case it gets serialized)
    return (
      this.data.userMenu === menuType.operation ||
      this.data.userMenu === 'OPERATION' ||
      String(this.data.userMenu) === String(menuType.operation)
    );
  }

  public onTopButtonClick(button: any): void {
    if (button.actionCallback) {
      button.actionCallback();
    }
    // Only close if autoClose is explicitly true
    // If autoClose is undefined or false, don't close
    if (button.autoClose === true) {
      this.dialogRef.close(button.return || null);
    }
  }
}
