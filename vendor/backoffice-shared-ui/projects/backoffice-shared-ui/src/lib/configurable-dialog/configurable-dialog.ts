import { CommonModule } from '@angular/common';
import { Component, computed, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DetailsPanel } from '../details-panel/details-panel';
import { menuType } from '../header/menu-type.enum';
import { DialogConfig, DialogResult, DialogButton } from './configurable-dialog.interface';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { Subject } from 'rxjs';
import { FormValidationService, ValidationAction } from '@backoffice/shared-ui';

@Component({
  selector: 'bo-configurable-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DetailsPanel,
    SvgIconComponent,
    DialogMessagesComponent
  ],
  templateUrl: './configurable-dialog.html',
  styleUrl: './configurable-dialog.scss'
})
export class ConfigurableDialog {
  public readonly buttonClicked = output<DialogResult>();
  public config: DialogConfig = inject(MAT_DIALOG_DATA);
  public menuType = menuType;
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;

  private readonly dialogRef = inject(MatDialogRef<ConfigurableDialog>);
  private readonly fvs = inject(FormValidationService);

  public get form(): FormGroup {
    return this.config.form;
  }

  public get buttons(): DialogButton[] {
    return (
      this.config.buttons || [
        { label: 'Back', action: 'cancel' },
        { label: 'Save', action: 'save' }
      ]
    );
  }

  public onButtonClick(button: DialogButton): void {
    if ((button.action === 'save' || button.action === 'apply') && !this.form.valid) {
      this.form.markAllAsTouched();

      if (this.config.fields.some(field => field.validationStrategy === 'submit')) {
        this.fvs.submitForm([`bo-details-panel-form-${this.config?.subTitle?.toLowerCase().replace(/ /g, '-')}`]);
      }

      return;
    }

    const result: DialogResult = {
      action: button.action,
      data: button.action === 'save' || button.action === 'apply' ? this.form.value : undefined
    };

    this.buttonClicked.emit(result);

    if (button.autoClose !== false) {
      this.dialogRef.close(result);
    }
  }

  public isButtonDisabled(button: DialogButton): boolean {
    if (typeof button.disabled === 'function') {
      return button.disabled();
    }

    return button.disabled || false;
  }
}
