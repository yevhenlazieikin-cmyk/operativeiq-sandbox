import { TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { menuType } from '../header/menu-type.enum';
import type { CrewPhotoCropResult } from './crew-photo-crop-result.interface';

export type { CrewPhotoCropResult } from './crew-photo-crop-result.interface';
import { SecurityVerificationDialogResult } from '@backoffice/shared-ui/lib/security-verification-dialog/security-verification-dialog.interface';

export interface ProfileSubmitOptions {
  /** When true (default), host may close the profile dialog after a successful save. */
  closeOnSuccess?: boolean;
}

export interface ProfileData {
  firstName?: string; // readonly
  lastName?: string; // readonly
  email?: string;
  phone?: string;
  loginId?: string; // readonly
  password?: string;
  pin?: string;
  /** New crew photo: two blobs like checksheet-2020; string = existing blob URL for display. */
  avatar?: CrewPhotoCropResult | string;
  /** Stored file name in crew.Photo / FileManager; sent on JSON update, never a full URL. */
  avatarFileName?: string;
  /** Legacy crew-folder blob URL; avatar selector tries this before the flat `avatar` URL when both exist. */
  avatarUrlCrewPhotoFolder?: string;
  defaultApplication?: string;
  biometricFingerprint?: string; // readonly
  template?: string;
  passwordAuthenticator?: string; // readonly - 'On File' or 'Not Available'
  digitalSignature?: string; // readonly
  role?: string; // readonly
  division?: string; // readonly
}

export interface ProfileInfo {
  profileData: ProfileData;
  defaultApplicationOptions?: { label: string; value: string }[];
  permissions?: ProfilePermissions;
  passwordRules?: PasswordRules;
  displayOTP?: boolean;
  fingerprintEnrollVerification?: number;
}

export interface ProfilePermissions {
  canEditEmail: boolean;
  canEditEmailImage: boolean;
  canEditPassword: boolean;
  canEditPin: boolean;
  canEditDefaultApplication: boolean;
  canEditVerificationSetup: boolean;
}

export interface PasswordRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialCharacter: boolean;
  validationMessage: string;
}

/** Return from `onVerify` when verification failed; optional server `errorMessage` is shown in the popup. */
export interface ProfileVerificationFailure {
  success: false;
  errorMessage?: string;
}

/**
 * Called before hiding a dialog and opening the next (e.g. before opening enroll after verification).
 * Receives the data from the dialog that will be hidden (e.g. verification result: code, pin+password, etc.)
 * and that dialog's ref. Return true (or resolve to true) to allow hide and open next; false to cancel.
 * Return `{ success: false, errorMessage }` to cancel and show a specific message.
 */
export type OnBeforeOpenChild = (
  data: SecurityVerificationDialogResult,
  dialogRef: MatDialogRef<unknown>
) => boolean | void | ProfileVerificationFailure | Promise<boolean | void | ProfileVerificationFailure>;

export interface ProfileEditDialogData {
  profileData?: ProfileData;
  userMenu?: menuType;
  defaultApplicationOptions?: { label: string; value: string }[];
  permissions?: ProfilePermissions;
  passwordRules?: PasswordRules;
  displayOTP?: boolean;
  fingerprintEnrollVerification?: number;
  /**
   * Persist profile changes. Return an Observable so the dialog can wait for save (e.g. before enrollment).
   * When `options.closeOnSuccess` is false, the host must not close the dialog on success.
   */
  onSubmit?: (data: ProfileData, dialogRef?: MatDialogRef<any>, options?: ProfileSubmitOptions) => Observable<unknown> | void;
  /**
   * Called before hiding the current verification dialog and opening the next (e.g. enroll).
   * Receives verification result (code, pin+password, etc.) and the dialog ref that will be hidden.
   * Return true or Promise<true> to proceed; false to cancel (dialog stays visible, next is not opened).
   */
  onVerify?: OnBeforeOpenChild;
  onDeleteAuthenticator?: (dialogRef: MatDialogRef<unknown>) => void;
  /**
   * Verification-code flow hook. Invoked by the verification-code dialog on open (`manual === false`)
   * and when the user clicks "Regenerate Code" (`manual === true`). The host owns the current
   * `verificationCodeToken`, performs the HTTP call, and can call `dialogRef.componentInstance.showValidationError(...)`
   * to surface a success/error banner.
   */
  onGenerateCode?: (dialogRef: MatDialogRef<unknown>, manual: boolean) => void;
  /** Return false (or a promise that resolves to false) to keep the enroll dialog open and show errors. */
  onVerifyEnroll?: (code: string, enrollSecret: string, dialogRef: MatDialogRef<unknown>) => boolean | void | Promise<boolean>;
  onGenerateOtp?: () => Promise<{ secret: string; authUri: string }>;
  template?: TemplateRef<any>;
}
