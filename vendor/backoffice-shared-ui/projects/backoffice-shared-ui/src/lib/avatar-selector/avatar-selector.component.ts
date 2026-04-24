import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImageCropperDialog } from '@backoffice/shared-ui/lib/image-cropper-dialog/image-cropper-dialog';
import { menuType } from '@backoffice/shared-ui/lib/header/menu-type.enum';
import { DialogManagerService } from '@backoffice/shared-ui/lib/dialog-manager/dialog-manager.service';
import type { CrewPhotoCropResult } from '@backoffice/shared-ui/lib/profile-edit-dialog/crew-photo-crop-result.interface';

@Component({
  selector: 'bo-avatar-selector',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AvatarSelectorComponent,
      multi: true
    }
  ],
  templateUrl: './avatar-selector.component.html',
  styleUrl: './avatar-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarSelectorComponent implements ControlValueAccessor, OnDestroy {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  public readonly accept = input<string>('image/*');
  public readonly disabled = input<boolean>(false);
  public readonly userMenu = input<menuType>(menuType.administration);
  /** When set with a string form value (flat/root blob URL), load this URL first; on error fall back to the form value. */
  public readonly avatarUrlCrewPhotoFolder = input<string | undefined>(undefined);
  /** Shown when there is no profile photo (or remote image failed to load). Default path matches library assets packaged under {@code assets/backoffice-shared-ui}. */
  public readonly noImageUrl = input<string>('assets/backoffice-shared-ui/images/no-image.png');

  public previewUrl: string | null = null;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private value: CrewPhotoCropResult | string | null = null;
  private flatBlobUrlForFallback: string | null = null;
  private pendingCrewToFlatFallback = false;
  private readonly dialog = inject(MatDialog);
  private readonly dialogManager = inject(DialogManagerService);
  private readonly dialogRef = inject(MatDialogRef, { skipSelf: true });

  public constructor() {
    effect(() => {
      void this.avatarUrlCrewPhotoFolder();
      if (typeof this.value === 'string' && this.value.length > 0) {
        this.applyStringUrlPreview(this.value);
        this.cdr.markForCheck();
      }
    });
  }

  public onChange = (value: CrewPhotoCropResult | string | null): void => {};
  public onTouched = (): void => {};

  public registerOnChange(fn: (value: CrewPhotoCropResult | string | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public writeValue(value: CrewPhotoCropResult | string | null): void {
    this.value = value;
    this.updatePreview(value);
    this.cdr.markForCheck();
  }

  public onFileSelected(file: File | null): void {
    if (file && this.isImageFile(file)) {
      this.onTouched();
      this.dialogManager.openAsChild(
        this.dialogRef,
        p =>
          this.dialog.open(ImageCropperDialog, {
            disableClose: true,
            width: '575px',
            panelClass: [p, 'image-cropper-dialog-panel'],
            data: {
              file,
              userMenu: this.userMenu()
            }
          }),
        (cropped: CrewPhotoCropResult | null | undefined) => {
          this.applyCroppedFile(cropped);
        }
      );
      this.cdr.markForCheck();
    }
  }

  public onContainerClick(): void {
    if (!this.disabled() && this.fileInputRef) {
      this.fileInputRef.nativeElement.click();
    }
  }

  private applyCroppedFile(cropped: CrewPhotoCropResult | null | undefined): void {
    if (!this.fileInputRef?.nativeElement) {
      return;
    }

    if (!cropped) {
      this.fileInputRef.nativeElement.value = '';

      return;
    }

    this.value = cropped;
    this.onChange(cropped);
    this.updatePreview(cropped);
    this.cdr.markForCheck();
    this.fileInputRef.nativeElement.value = '';
  }

  public displayImageSrc(): string {
    return this.previewUrl ?? this.noImageUrl();
  }

  public onPreviewImageError(): void {
    if (this.previewUrl === null) {
      return;
    }

    if (this.pendingCrewToFlatFallback && this.flatBlobUrlForFallback && this.previewUrl !== this.flatBlobUrlForFallback) {
      this.previewUrl = this.flatBlobUrlForFallback;
      this.pendingCrewToFlatFallback = false;
      this.cdr.markForCheck();

      return;
    }

    this.previewUrl = null;
    this.pendingCrewToFlatFallback = false;
    this.flatBlobUrlForFallback = null;
    this.cdr.markForCheck();
  }

  private updatePreview(value: CrewPhotoCropResult | string | null): void {
    // Clean up previous object URL if it exists
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.flatBlobUrlForFallback = null;
    this.pendingCrewToFlatFallback = false;

    if (!value) {
      this.previewUrl = null;

      return;
    }

    if (this.isCrewPhotoCropResult(value)) {
      this.previewUrl = URL.createObjectURL(value.blob250);
    } else if (typeof value === 'string') {
      this.applyStringUrlPreview(value);
    } else {
      this.previewUrl = null;
    }
  }

  private applyStringUrlPreview(flatUrl: string): void {
    const crew = this.avatarUrlCrewPhotoFolder()?.trim();
    this.flatBlobUrlForFallback = flatUrl;
    if (crew && crew !== flatUrl) {
      this.previewUrl = crew;
      this.pendingCrewToFlatFallback = true;
    } else {
      this.previewUrl = flatUrl;
      this.pendingCrewToFlatFallback = false;
    }
  }

  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private isCrewPhotoCropResult(value: CrewPhotoCropResult | string | null): value is CrewPhotoCropResult {
    return value !== null && typeof value === 'object' && 'blob250' in value && 'blob35' in value;
  }

  public ngOnDestroy(): void {
    // Clean up object URL on destroy
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
