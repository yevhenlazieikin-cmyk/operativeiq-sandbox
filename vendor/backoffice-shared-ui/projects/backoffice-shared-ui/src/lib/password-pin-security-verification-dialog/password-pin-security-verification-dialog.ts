import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CustomHeaderButton, DetailsPanel, FieldConfig, FieldType, markAsTouchedAndValidate, menuType } from '@backoffice/shared-ui';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  SecurityVerificationDialogData,
  SecurityVerificationDialogResult
} from '../security-verification-dialog/security-verification-dialog.interface';
import { DialogInputNavigationDirective } from '../directives/dialog-input-navigation.directive';

@Component({
  selector: 'bo-password-pin-security-verification-dialog',
  imports: [DialogMessagesComponent, MatDialogContent, SvgIconComponent, CommonModule, DetailsPanel, DialogInputNavigationDirective],
  templateUrl: './password-pin-security-verification-dialog.html',
  styleUrl: './password-pin-security-verification-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordPinSecurityVerificationDialog implements OnInit {
  public data = inject<SecurityVerificationDialogData>(MAT_DIALOG_DATA);
  public readonly userMenu = signal<menuType>(this.data?.userMenu ?? menuType.administration);
  public readonly menuType = menuType;
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;
  public readonly dialogRef = inject(MatDialogRef<PasswordPinSecurityVerificationDialog>);

  constructor() {
    this.dialogRef.disableClose = true;
  }

  /** Display name for the user section (e.g. "Test User"). Pass via dialog data as userName. */
  public readonly userName = signal<string>(this.data?.userName ?? 'User');
  /** Pre-filled read-only login ID (e.g. "test_user"). Pass via dialog data as loginId. */
  public readonly loginId = signal<string>(this.data?.loginId ?? '');

  public userVerificationDetailsPanel: FieldConfig[] = [
    {
      label: 'Login ID:',
      required: false,
      type: FieldType.ReadOnly,
      formControlName: 'loginId'
    },
    {
      label: 'Password:',
      required: true,
      type: FieldType.Password,
      formControlName: 'password',
      customRequiredValidationMessage: 'Password is required.'
    },
    {
      label: 'Pin:',
      required: true,
      type: FieldType.Password,
      formControlName: 'pin',
      customRequiredValidationMessage: 'Pin is required.'
    }
  ];

  public actionButtons: CustomHeaderButton[] = [
    {
      label: 'Continue',
      state: false,
      action: () => {
        markAsTouchedAndValidate(this.form);
        if (!this.form.valid) {
          this.validationMessage = 'Password and PIN are required.';
          this.validationMessageClass = 'error-message';
          this._cdr.markForCheck();

          return;
        }
        this.validationMessage = null;
        const result: SecurityVerificationDialogResult = {
          verified: true,
          password: this.form.value.password,
          pin: this.form.value.pin
        };
        if (this.data?.onVerified) {
          this.data.onVerified(this.dialogRef as MatDialogRef<unknown>, result);
        } else {
          this.dialogRef.close(result);
        }
      }
    }
  ];

  public form!: FormGroup;

  private readonly formBuilder = inject(FormBuilder);
  private readonly _cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.createForm();
  }

  @HostListener('keydown.escape')
  public onEscapeKey(): void {
    this.onCancel();
  }

  public onCancel(): void {
    this.dialogRef.close({ verified: false });
  }

  public showValidationError(message: string, messageClass = 'error-message'): void {
    this.validationMessage = message;
    this.validationMessageClass = messageClass;
    this._cdr.markForCheck();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      loginId: [{ value: this.loginId(), disabled: true }],
      password: ['', [Validators.required]],
      pin: ['', [Validators.required]]
    });
  }
}
