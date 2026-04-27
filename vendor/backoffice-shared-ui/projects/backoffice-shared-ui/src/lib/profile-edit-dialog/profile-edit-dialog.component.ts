import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogContent, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgClass } from '@angular/common';
import { DetailsPanel } from '../details-panel/details-panel';
import { FieldType } from '../details-panel/field-type.enum';
import { FieldConfig } from '../details-panel/field-config.interface';
import { AvatarSelectorComponent } from '../avatar-selector/avatar-selector.component';
import { ProfileEditDialogData, ProfileData } from './profile-edit-dialog.interface';
import type { CrewPhotoCropResult } from './crew-photo-crop-result.interface';
import { isObservable } from 'rxjs';
import { menuType } from '../header/menu-type.enum';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { SecurityVerificationDialogService } from '@backoffice/shared-ui/lib/security-verification-dialog/security-verification-dialog.service';
import { UserVerificationMethodEnum } from '@backoffice/shared-ui/lib/shared/enums/user-verification-method.enum';
import { SecurityVerificationDialogResult } from '@backoffice/shared-ui/lib/security-verification-dialog/security-verification-dialog.interface';
import { AuthenticatorEnrollDialogService } from '@backoffice/shared-ui/lib/authenticator-enroll-dialog/authenticator-enroll-dialog.service';
import { DialogManagerService } from '@backoffice/shared-ui/lib/dialog-manager/dialog-manager.service';
import { passwordValidator } from '../validators/password-validator';
import { pinValidator } from '../validators/pin-validator';

interface FieldsConfig {
  profileInfoFields: FieldConfig[];
  preferencesFields: FieldConfig[];
  biometricFields: FieldConfig[];
  passwordAuthenticatorFields: FieldConfig[];
  digitalSignatureFields: FieldConfig[];
  roleSecurityFields: FieldConfig[];
}

const PASSWORD_MASK = '••••••';

@Component({
  selector: 'bo-profile-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    DetailsPanel,
    AvatarSelectorComponent,
    SvgIconComponent,
    NgClass,
    DialogMessagesComponent
  ],
  templateUrl: './profile-edit-dialog.component.html',
  styleUrl: './profile-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditDialogComponent implements OnInit {
  @ViewChild('passwordAuthenticatorTemplate', { static: true })
  public passwordAuthenticatorTemplate!: TemplateRef<unknown>;

  public readonly profileDialogRef = inject(MatDialogRef<ProfileEditDialogComponent>);
  public verificationCodeDialogRef!: MatDialogRef<unknown, SecurityVerificationDialogResult | undefined>;
  public readonly data = inject<ProfileEditDialogData>(MAT_DIALOG_DATA);
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;

  private readonly formBuilder = inject(FormBuilder);

  public readonly profileForm = signal<FormGroup>(this.createForm());
  public readonly userMenu = signal<menuType>(this.data.userMenu || menuType.administration);
  public readonly fieldConfigs = signal<FieldsConfig | null>(null);
  public readonly menuType = menuType;

  public readonly _cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  private readonly dialogManager = inject(DialogManagerService);
  private readonly securityVerificationDialogService = inject(SecurityVerificationDialogService);
  private readonly authenticatorEnrollDialogService = inject(AuthenticatorEnrollDialogService);

  public ngOnInit(): void {
    this.fieldConfigs.set(this.getFieldConfigs() as FieldsConfig);
  }

  // eslint-disable-next-line complexity
  private createForm(): FormGroup {
    const { profileData, permissions, passwordRules } = this.data;

    const canEditEmail = permissions?.canEditEmail ?? true;
    const canEditPassword = permissions?.canEditPassword ?? true;
    const canEditPin = permissions?.canEditPin ?? true;
    const canEditDefaultApplication = permissions?.canEditDefaultApplication ?? true;

    const emailValidators = [Validators.required, Validators.email];
    const passwordValidators = [
      Validators.required,
      passwordValidator({
        minLength: passwordRules?.minLength,
        requireUppercase: passwordRules?.requireUppercase,
        requireLowercase: passwordRules?.requireLowercase,
        requireNumber: passwordRules?.requireNumber,
        requireSpecialCharacter: passwordRules?.requireSpecialCharacter,
        loginId: profileData?.loginId,
        maskValue: PASSWORD_MASK
      })
    ];
    const pinValidators = [pinValidator({ maskValue: PASSWORD_MASK })];

    return this.formBuilder.group({
      firstName: [{ value: profileData?.firstName || '', disabled: true }],
      lastName: [{ value: profileData?.lastName || '', disabled: true }],
      email: [{ value: profileData?.email || '', disabled: !canEditEmail }, emailValidators],
      phone: [profileData?.phone || ''],
      loginId: [{ value: profileData?.loginId || '', disabled: true }],
      password: [{ value: PASSWORD_MASK, disabled: !canEditPassword }, passwordValidators],
      pin: [{ value: PASSWORD_MASK, disabled: !canEditPin }, pinValidators],
      avatar: [profileData?.avatar || null],
      defaultApplication: [{ value: profileData?.defaultApplication || '', disabled: !canEditDefaultApplication }],
      biometricFingerprint: [{ value: profileData?.biometricFingerprint || 'Not Available', disabled: true }],
      template: [{ value: profileData?.template || '', disabled: true }],
      passwordAuthenticator: [{ value: profileData?.passwordAuthenticator || 'Not Available', disabled: true }],
      digitalSignature: [{ value: profileData?.digitalSignature || 'Not Available', disabled: true }],
      role: [{ value: profileData?.role || '', disabled: true }],
      division: [{ value: profileData?.division || '', disabled: true }]
    });
  }

  private getFieldConfigs(): {
    profileInfoFields: FieldConfig[];
    preferencesFields: FieldConfig[];
    biometricFields: FieldConfig[];
    passwordAuthenticatorFields: FieldConfig[];
    digitalSignatureFields: FieldConfig[];
    roleSecurityFields: FieldConfig[];
  } {
    const defaultApplicationOptions = this.data.defaultApplicationOptions || [];
    const permissions = this.data.permissions;
    const passwordRules = this.data.passwordRules;

    const canEditEmail = permissions?.canEditEmail ?? true;
    const canEditPassword = permissions?.canEditPassword ?? true;
    const canEditPin = permissions?.canEditPin ?? true;
    const canEditDefaultApplication = permissions?.canEditDefaultApplication ?? true;

    return {
      profileInfoFields: [
        {
          label: 'First Name:',
          type: FieldType.ReadOnly,
          formControlName: 'firstName',
          required: true
        },
        {
          label: 'Last Name:',
          type: FieldType.ReadOnly,
          formControlName: 'lastName',
          required: true
        },
        {
          label: 'Email Address:',
          type: canEditEmail ? FieldType.TextField : FieldType.ReadOnly,
          formControlName: 'email',
          required: true,
          customRequiredValidationMessage: 'Email is required.',
          customPatternValidationMessage: 'Email has incorrect format.'
        },
        {
          label: 'Phone Number:',
          type: FieldType.TextField,
          formControlName: 'phone'
        },
        {
          label: 'Login ID:',
          type: FieldType.ReadOnly,
          formControlName: 'loginId',
          required: true
        },
        {
          label: 'Password:',
          type: canEditPassword ? FieldType.Password : FieldType.ReadOnly,
          formControlName: 'password',
          required: true,
          customRequiredValidationMessage: 'Password is required.',
          customPatternValidationMessage: passwordRules?.validationMessage || 'Password does not meet the security policy.'
        },
        {
          label: 'Pin:',
          type: canEditPin ? FieldType.Password : FieldType.ReadOnly,
          formControlName: 'pin',
          customPatternValidationMessage: 'PIN must be at least 4 digits.'
        }
      ],
      preferencesFields: [
        {
          label: 'Default Application:',
          type: canEditDefaultApplication ? FieldType.Select : FieldType.ReadOnly,
          formControlName: 'defaultApplication',
          options: defaultApplicationOptions,
          placeholderLabel: 'Select Default Application'
        }
      ],
      biometricFields: [
        {
          label: 'Biometric Fingerprint Template:',
          type: FieldType.ReadOnly,
          formControlName: 'biometricFingerprint'
        }
      ],
      passwordAuthenticatorFields: [
        {
          label: 'Password Authenticator:',
          type: FieldType.CustomTemplate,
          formControlName: 'passwordAuthenticator',
          customTemplate: this.passwordAuthenticatorTemplate
        }
      ],
      digitalSignatureFields: [
        {
          label: 'Digital Signature:',
          type: FieldType.ReadOnly,
          formControlName: 'digitalSignature'
        }
      ],
      roleSecurityFields: [
        {
          label: 'Role:',
          type: FieldType.ReadOnly,
          formControlName: 'role'
        },
        {
          label: 'Division:',
          type: FieldType.ReadOnly,
          formControlName: 'division'
        }
      ]
    };
  }

  private buildProfileDataFromForm(): ProfileData {
    const formValue = this.profileForm().getRawValue() as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      loginId?: string;
      password?: string;
      pin?: string;
      avatar?: CrewPhotoCropResult | string;
      defaultApplication?: string;
      biometricFingerprint?: string;
      template?: string;
      digitalSignature?: string;
      role?: string;
      division?: string;
    };
    const passwordValue = formValue.password === PASSWORD_MASK ? '' : formValue.password;
    const pinValue = formValue.pin === PASSWORD_MASK ? '' : formValue.pin;

    const seed = this.data.profileData;

    return {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      loginId: formValue.loginId,
      password: passwordValue,
      pin: pinValue,
      avatar: formValue.avatar,
      avatarFileName: seed?.avatarFileName,
      avatarUrlCrewPhotoFolder: seed?.avatarUrlCrewPhotoFolder,
      defaultApplication: formValue.defaultApplication,
      biometricFingerprint: formValue.biometricFingerprint,
      template: formValue.template,
      digitalSignature: formValue.digitalSignature,
      role: formValue.role,
      division: formValue.division
    };
  }

  public onSubmit(): void {
    const form = this.profileForm();
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.get(key)?.markAsTouched();
      });

      return;
    }

    const profileData = this.buildProfileDataFromForm();

    if (this.data.onSubmit) {
      const result = this.data.onSubmit(profileData, this.profileDialogRef, { closeOnSuccess: true });
      if (result && isObservable(result)) {
        result.subscribe({ error: () => {} });
      }
    } else {
      this.profileDialogRef.close(profileData);
    }
  }

  public onCancel(): void {
    this.profileDialogRef.close();
  }

  public onUpdatePasswordAuthenticator(): void {
    const form = this.profileForm();
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.get(key)?.markAsTouched();
      });
      this._cdr.markForCheck();

      return;
    }

    const profileData = this.buildProfileDataFromForm();
    const openEnrollmentFlow = () => {
      const userName =
        [this.data.profileData?.firstName, this.data.profileData?.lastName].filter(Boolean).join(' ') ||
        [this.profileForm().get('firstName')?.value, this.profileForm().get('lastName')?.value].filter(Boolean).join(' ') ||
        'User';
      const loginId = this.data.profileData?.loginId ?? String(this.profileForm().get('loginId')?.value ?? '');

      const verificationMethod = this.getVerificationMethod();

      const verificationData = {
        verificationMethod,
        userMenu: this.userMenu(),
        onVerified: (verificationRef: MatDialogRef<unknown>, result: SecurityVerificationDialogResult) => {
          const proceed = this.data.onVerify?.(result, verificationRef);
          const proceedPromise =
            proceed !== undefined && proceed !== null && typeof (proceed as Promise<unknown>).then === 'function'
              ? (proceed as Promise<unknown>)
              : Promise.resolve(proceed);
          proceedPromise.then(async resolved => {
            let allowProceed: boolean;
            let serverMessage: string | undefined;
            if (resolved === false) {
              allowProceed = false;
            } else if (
              resolved !== null &&
              typeof resolved === 'object' &&
              'success' in resolved &&
              (resolved as { success: boolean }).success === false
            ) {
              allowProceed = false;
              serverMessage = (resolved as { errorMessage?: string }).errorMessage;
            } else {
              allowProceed = true;
            }

            const verificationInst = verificationRef.componentInstance as
              | {
                  showValidationError?: (message: string, messageClass?: string) => void;
                  setBusy?: (busy: boolean) => void;
                }
              | undefined;

            if (!allowProceed) {
              const fallback = 'Verification failed. Please check your credentials and try again.';
              const msg = serverMessage?.trim() ? serverMessage.trim() : fallback;
              verificationInst?.showValidationError?.(msg);

              return;
            }

            // Verification succeeded - release the dialog's in-flight lock before it gets hidden
            // behind the enrollment child so its Continue/Regenerate buttons are usable again
            // if the user ever returns to it (e.g. cancels enrollment).
            verificationInst?.setBusy?.(false);

            let authLink: string | undefined;
            let secretKey: string | undefined;

            if (this.data.onGenerateOtp) {
              try {
                const otpData = await this.data.onGenerateOtp();
                authLink = otpData.authUri;
                secretKey = otpData.secret;
              } catch {
                this.validationMessage = 'Failed to generate OTP. Please try again.';
                this.validationMessageClass = 'error-message';
                this._cdr.markForCheck();

                return;
              }
            }

            const enrollData = {
              userMenu: this.userMenu(),
              userName,
              loginId,
              authLink,
              secretKey,
              onVerifyEnroll: this.data.onVerifyEnroll
            };

            this.dialogManager.openAsChild(
              verificationRef,
              p => this.authenticatorEnrollDialogService.openEnrollDialog(enrollData, { panelClass: p }),
              () => {},
              { returnToRef: this.profileDialogRef }
            );
          });
        },
        onGenerateCode: this.data.onGenerateCode,
        userName,
        loginId
      };

      this.verificationCodeDialogRef = this.dialogManager.openAsChild(
        this.profileDialogRef,
        panelClass => this.securityVerificationDialogService.openVerificationDialog(verificationData, { panelClass }),
        () => {}
      );
    };

    if (this.data.onSubmit) {
      const saveResult = this.data.onSubmit(profileData, this.profileDialogRef, { closeOnSuccess: false });
      if (saveResult && isObservable(saveResult)) {
        saveResult.subscribe({
          next: () => openEnrollmentFlow(),
          error: () => {}
        });

        return;
      }
    }

    openEnrollmentFlow();
  }

  private getVerificationMethod(): UserVerificationMethodEnum {
    const fingerprintEnrollVerification = this.data.fingerprintEnrollVerification;

    switch (fingerprintEnrollVerification) {
      case 4: // ValidationCode
        return UserVerificationMethodEnum.VerificationCode;
      case 3: // PasswordPin
        return UserVerificationMethodEnum.PasswordAndPin;
      case 2: // ScreenInkPin
      default:
        return UserVerificationMethodEnum.DigitalSignatureAndPin;
    }
  }

  public get hasDefaultApplicationOptions(): boolean {
    const options = this.data.defaultApplicationOptions;

    return Array.isArray(options) && options.length > 0;
  }

  public get displayOTP(): boolean {
    return this.data.displayOTP ?? false;
  }

  public get canEditEmailImage(): boolean {
    return this.data.permissions?.canEditEmailImage ?? true;
  }

  public get canEditVerificationSetup(): boolean {
    return this.data.permissions?.canEditVerificationSetup ?? false;
  }

  public get hasPasswordAuthenticator(): boolean {
    return this.data.profileData?.passwordAuthenticator === 'On File';
  }

  public get passwordAuthenticatorStatus(): string {
    return this.data.profileData?.passwordAuthenticator || 'Not Available';
  }

  public onDeletePasswordAuthenticator(): void {
    if (this.data.onDeleteAuthenticator) {
      this.data.onDeleteAuthenticator(this.profileDialogRef);
    }
  }
}
