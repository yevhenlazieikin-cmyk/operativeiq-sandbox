import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { CustomHeaderButton, DetailsPanel, FieldConfig, FieldType, markAsTouchedAndValidate, menuType } from '@backoffice/shared-ui';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QrCodeComponent } from 'ng-qrcode';
import { AuthenticatorEnrollDialogData } from './authenticator-enroll-dialog.interface';
import { DialogInputNavigationDirective } from '../directives/dialog-input-navigation.directive';

@Component({
  selector: 'bo-authenticator-enroll-dialog',
  imports: [
    DialogMessagesComponent,
    MatDialogContent,
    SvgIconComponent,
    CommonModule,
    DetailsPanel,
    QrCodeComponent,
    DialogInputNavigationDirective
  ],
  templateUrl: './authenticator-enroll-dialog.html',
  styleUrl: './authenticator-enroll-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthenticatorEnrollDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('keyRowTemplate', { static: false })
  public keyRowTemplate!: TemplateRef<unknown>;

  public data = inject<AuthenticatorEnrollDialogData>(MAT_DIALOG_DATA);
  public readonly userMenu = signal<menuType>(this.data?.userMenu ?? menuType.administration);
  public readonly menuType = menuType;
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;
  public readonly dialogRef = inject(MatDialogRef<AuthenticatorEnrollDialogComponent>);

  constructor() {
    this.dialogRef.disableClose = true;
  }

  public readonly userName = signal<string>(this.data?.userName ?? 'User');
  /** Auth link for QR code. */
  public readonly authLink = signal<string>(this.data.authLink ?? '');
  /** Base32 secret (same bytes as QR); passed to enroll API with the typed code. */
  public readonly secretKey = signal<string>(this.data.secretKey ?? '');
  /** When true, key is revealed and button shows Copy; otherwise button shows Show. */
  public readonly keyVisible = signal<boolean>(false);

  public readonly userEnrollFields: WritableSignal<FieldConfig[]> = signal([
    {
      label: 'Verify',
      required: true,
      type: FieldType.TextField,
      formControlName: 'verify',
      customRequiredValidationMessage: 'Verify code is required.'
    }
  ]);

  public actionButtons: CustomHeaderButton[] = [
    {
      label: 'Continue',
      state: false,
      action: (): void => {
        void this.onContinueClick();
      }
    }
  ];

  public form!: FormGroup;

  private readonly formBuilder = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.createForm();
  }

  public ngAfterViewInit(): void {
    this.userEnrollFields.set([
      {
        label: 'Key',
        required: false,
        type: FieldType.CustomTemplate,
        formControlName: 'key',
        customTemplate: this.keyRowTemplate,
        fullWidth: true
      },
      {
        label: 'Verify',
        required: true,
        type: FieldType.TextField,
        formControlName: 'verify',
        maxLength: 6,
        customRequiredValidationMessage: 'Code is required.'
      }
    ]);
    this.cdr.markForCheck();
  }

  @HostListener('keydown.escape')
  public onEscapeKey(): void {
    this.onCancel();
  }

  public onCancel(): void {
    this.dialogRef.close({ enrolled: false });
  }

  /** Reveal key; button then shows Copy. */
  public showKey(): void {
    this.keyVisible.set(true);
  }

  /** Copy secret key to clipboard. */
  public copyKey(): void {
    const key = this.secretKey();
    if (key && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(key);
    }
  }

  /** Key display value: masked or actual secret. */
  public keyDisplayValue(): string {
    return this.keyVisible() ? this.secretKey() : '';
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      key: [{ value: this.secretKey(), disabled: true }],
      verify: ['', [Validators.required]]
    });
  }

  private async onContinueClick(): Promise<void> {
    markAsTouchedAndValidate(this.form);
    if (!this.form.valid) {
      return;
    }

    this.validationMessage = null;
    this.cdr.markForCheck();

    const verifyCode = String(this.form.get('verify')?.value ?? '');

    let enrollSucceeded = true;
    if (this.data.onVerifyEnroll) {
      const out = this.data.onVerifyEnroll(verifyCode, this.secretKey(), this.dialogRef);
      if (out !== undefined && out !== null && typeof (out as Promise<boolean>).then === 'function') {
        enrollSucceeded = await (out as Promise<boolean>);
      } else if (out === false) {
        enrollSucceeded = false;
      }
    }

    if (enrollSucceeded) {
      this.dialogRef.close({
        enrolled: true,
        verifyCode
      });
    } else {
      if (!this.validationMessage) {
        this.validationMessage = 'Verification code is not valid';
      }
      this.validationMessageClass = 'error-message';
      this.cdr.markForCheck();
    }
  }
}
