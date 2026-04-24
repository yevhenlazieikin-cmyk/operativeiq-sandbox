import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  signal,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { menuType } from '@backoffice/shared-ui/lib/header/menu-type.enum';

// Import Cropper.js v2 to register custom elements automatically
import 'cropperjs';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActionButtonSubPanel } from '@backoffice/shared-ui/lib/action-button-sub-panel/action-button-sub-panel';
import { ActionButton } from '@backoffice/shared-ui/lib/action-buttons-panel/action-button-panel.interface';
import type { CrewPhotoCropResult } from '@backoffice/shared-ui/lib/profile-edit-dialog/crew-photo-crop-result.interface';

@Component({
  selector: 'bo-image-cropper-dialog',
  imports: [
    CommonModule,
    DialogMessagesComponent,
    MatDialogContent,
    SvgIconComponent,
    ReactiveFormsModule,
    MatDialogActions,
    MatIcon,
    ActionButtonSubPanel
  ],
  templateUrl: './image-cropper-dialog.html',
  styleUrl: './image-cropper-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageCropperDialog implements AfterViewInit {
  @ViewChild('fileInput') public fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageEl') public imageEl!: ElementRef;
  @ViewChild('selectionEl') public selectionEl!: ElementRef;

  public imageSrc = signal<string | null>(null);
  public readonly menuType = menuType;
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;
  public readonly data = inject(MAT_DIALOG_DATA);
  public readonly dialogRef = inject(MatDialogRef<ImageCropperDialog>);
  public readonly userMenu = signal<menuType>(this.data.userMenu || menuType.administration);
  public actionButtons: ActionButton[] = [
    { name: 'Zoom In', actionCB: () => this.zoomIn() },
    { name: 'Zoom Out', actionCB: () => this.zoomOut() },
    { name: 'Select', actionCB: () => this.fileInput.nativeElement.click() }
  ];

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.data && this.data.file) {
        this.loadFile(this.data.file);
      }
    }, 100);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loadFile(file);
    }
  }

  loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc.set(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Zoom In
   * V2 Logic: Access the <cropper-image> and use the $scale() or $zoom() method
   */
  zoomIn() {
    if (this.imageEl?.nativeElement?.$zoom) {
      this.imageEl.nativeElement.$zoom(0.1); // Zoom in by 0.1
    }
  }

  /**
   * Zoom Out
   */
  zoomOut() {
    if (this.imageEl?.nativeElement?.$zoom) {
      this.imageEl.nativeElement.$zoom(-0.1); // Zoom out by 0.1
    }
  }

  /**
   * Crop and Export
   * V2 Logic: Access the <cropper-selection> and use $toCanvas()
   */
  /** Same sizes as checksheet-2020 {@code EditPhotoComponent.createBlobObservable} (250 / 35). */
  private static readonly crewPhotoSizeLarge = 250;
  private static readonly crewPhotoSizeSmall = 35;

  async crop(): Promise<void> {
    const selection = this.selectionEl?.nativeElement;
    if (!selection?.$toCanvas) {
      this.dialogRef.close(null);

      return;
    }

    try {
      const canvas250: HTMLCanvasElement = await selection.$toCanvas({
        width: ImageCropperDialog.crewPhotoSizeLarge,
        height: ImageCropperDialog.crewPhotoSizeLarge
      });
      const canvas35: HTMLCanvasElement = await selection.$toCanvas({
        width: ImageCropperDialog.crewPhotoSizeSmall,
        height: ImageCropperDialog.crewPhotoSizeSmall
      });

      const originalName: string = this.data?.file?.name ?? 'image';
      const baseName = originalName.replace(/\.[^.]+$/, '');
      const outputName = `${baseName}.png`;

      const blob250 = await ImageCropperDialog.canvasToPngBlob(canvas250);
      const blob35 = await ImageCropperDialog.canvasToPngBlob(canvas35);

      const result: CrewPhotoCropResult = { blob250, blob35, fileName: outputName };
      this.dialogRef.close(result);
      this.fileInput.nativeElement.value = '';
    } catch (error) {
      console.error('Cropping failed', error);
      this.dialogRef.close(null);
    }
  }

  private static canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
    this.fileInput.nativeElement.value = '';
  }
}
