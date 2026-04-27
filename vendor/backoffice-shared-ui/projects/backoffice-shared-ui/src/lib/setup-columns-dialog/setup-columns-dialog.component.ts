import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SlideToggle } from '../slide-toggle/slide-toggle';
import { menuType } from '../header/menu-type.enum';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { DialogMessagesComponent } from '../dialog-notifications/dialog-messages.component';
import { MessageService } from '../services/messages.service';

export interface ColumnConfig {
  label: string;
  key: string;
  enabled: boolean;
  disabled: boolean;
}

export interface SetupColumnsDialogData {
  columns: ColumnConfig[];
  userMenu?: menuType;
  title?: string;
}

@Component({
  selector: 'bo-setup-columns-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SlideToggle,
    SvgIconComponent,
    DialogMessagesComponent
  ],
  templateUrl: './setup-columns-dialog.component.html',
  styleUrl: './setup-columns-dialog.component.scss'
})
export class SetupColumnsDialogComponent {
  public dialogRef = inject(MatDialogRef<SetupColumnsDialogComponent>);
  public data: SetupColumnsDialogData = inject(MAT_DIALOG_DATA);

  public menuType = menuType;
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;

  private readonly messageService = inject(MessageService);
  public readonly messages = {
    SETUP_COLUMNS_VALIDATION: this.messageService.get('SETUP_COLUMNS_VALIDATION')
  };

  get userMenu(): menuType {
    return this.data.userMenu || menuType.operation;
  }

  get title(): string {
    return this.data.title || 'Setup Columns';
  }

  getColumnLabel(label: string): string {
    // Add colon to label if not already present
    return label.endsWith(':') ? label : `${label}:`;
  }

  onSave(): void {
    // Validate that at least one column is enabled
    const enabledColumns = this.data.columns.filter(col => col.enabled);

    if (enabledColumns.length === 0) {
      this.validationMessage = this.messages.SETUP_COLUMNS_VALIDATION;

      return;
    }

    this.validationMessage = null;
    this.dialogRef.close(this.data.columns);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
