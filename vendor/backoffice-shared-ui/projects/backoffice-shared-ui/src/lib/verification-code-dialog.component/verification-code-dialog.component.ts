import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { CustomHeaderButton, DetailsPanel, FieldConfig, FieldType, markAsTouchedAndValidate, menuType } from '@backoffice/shared-ui';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import type {
  SecurityVerificationDialogData,
  SecurityVerificationDialogResult
} from '@backoffice/shared-ui/lib/security-verification-dialog/security-verification-dialog.interface';
import { DialogInputNavigationDirective } from '../directives/dialog-input-navigation.directive';

@Component({
  selector: 'bo-verification-code-dialog',
  imports: [DialogMessagesComponent, MatDialogContent, SvgIconComponent, CommonModule, DetailsPanel, DialogInputNavigationDirective],
  templateUrl: './verification-code-dialog.component.html',
  styleUrl: './verification-code-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationCodeDialog implements OnInit {
  public data = inject<SecurityVerificationDialogData>(MAT_DIALOG_DATA);
  public readonly userMenu = signal<menuType>(this.data?.userMenu ?? menuType.administration);
  public readonly menuType = menuType;
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;
  public readonly dialogRef = inject(MatDialogRef<VerificationCodeDialog>);

  // Gates both buttons while an in-flight generate/verify call is pending.
  public readonly isBusy = signal<boolean>(false);

  constructor() {
    this.dialogRef.disableClose = true;
  }

  public readonly userName = signal<string>(this.data?.userName ?? 'Current Crew');
  public userVerificationDetailsPanel: FieldConfig[] = [
    {
      label: 'Code:',
      required: true,
      type: FieldType.TextField,
      formControlName: 'code',
      customRequiredValidationMessage: 'Code is required.'
    }
  ];

  // Rebuilt whenever isBusy changes so the <bo-details-panel> input signal re-evaluates and
  // both buttons get their disabled attribute updated.
  public readonly actionButtons = computed<CustomHeaderButton[]>(() => {
    const disabled = this.isBusy();

    return [
      {
        label: 'Regenerate Code',
        state: disabled,
        action: () => this.onRegenerateClick()
      },
      {
        label: 'Continue',
        state: disabled,
        action: () => this.onContinueClick()
      }
    ];
  });

  public form!: FormGroup;

  private readonly formBuilder = inject(FormBuilder);
  private readonly _cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.createForm();
    // Request an initial token from the host when the dialog opens so the user can submit a code.
    // Lock buttons until the host reports the call finished via setBusy(false) / showValidationError().
    this.isBusy.set(true);
    this.data?.onGenerateCode?.(this.dialogRef as MatDialogRef<unknown>, false);
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
    // A banner implies the in-flight request has produced its final result, so release the buttons.
    this.isBusy.set(false);
    this._cdr.markForCheck();
  }

  // Public hook so the host can explicitly toggle the busy/disabled state around async work
  // (e.g. clear it in a rxjs finalize after a silent generate call that does not surface a banner).
  public setBusy(busy: boolean): void {
    this.isBusy.set(busy);
    this._cdr.markForCheck();
  }

  private onRegenerateClick(): void {
    if (this.isBusy()) {
      return;
    }
    this.form?.controls['code']?.setValue('');
    this.validationMessage = null;
    this.isBusy.set(true);
    this._cdr.markForCheck();
    this.data?.onGenerateCode?.(this.dialogRef as MatDialogRef<unknown>, true);
  }

  private onContinueClick(): void {
    if (this.isBusy()) {
      return;
    }
    markAsTouchedAndValidate(this.form);
    if (!this.form.valid) {
      this.validationMessage = 'Code is required.';
      this.validationMessageClass = 'error-message';
      this._cdr.markForCheck();

      return;
    }
    this.validationMessage = null;
    this.isBusy.set(true);
    this._cdr.markForCheck();
    const result: SecurityVerificationDialogResult = {
      verified: true,
      verificationCode: this.form.value.code
    };
    if (this.data?.onVerified) {
      this.data.onVerified(this.dialogRef as MatDialogRef<unknown>, result);
    } else {
      this.dialogRef.close(result);
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      code: ['', [Validators.required]]
    });
  }
}
