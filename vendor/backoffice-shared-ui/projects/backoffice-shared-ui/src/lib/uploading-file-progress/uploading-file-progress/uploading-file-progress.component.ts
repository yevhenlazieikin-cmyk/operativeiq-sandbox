import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmsEntityAttachmentsContext, EntityAttachUpload, UploadFileData } from '../ems-entity-attachments-context.interface';
import { BaseDialog, GridModule } from '@backoffice/shared-ui';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { UploadFileProgressBarComponent } from '../components/upload-file-progress-bar/upload-file-progress-bar.component';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';

@Component({
  selector: 'bo-uploading-file-progress',
  templateUrl: './uploading-file-progress.component.html',
  styleUrls: ['./uploading-file-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [OverlayscrollbarsModule, UploadFileProgressBarComponent, SvgIconComponent, GridModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, height: '0' }),
        animate('400ms', style({ height: '*' })),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '*' }),
        animate('200ms', style({ opacity: 0 })),
        animate('400ms', style({ height: '0' }))
      ])
    ])
  ]
})
export class UploadingFileProgressComponent<T extends EntityAttachUpload, R = unknown> implements OnInit {
  public readonly dialogRef = inject(MatDialogRef<UploadingFileProgressComponent<T, R>>);
  public readonly data = inject<UploadFileData<T, R>>(MAT_DIALOG_DATA);
  public title = 'Attaching files';
  public wrappedFiles: EmsEntityAttachmentsContext[] = [];
  public method!: (file: File, entityId: number) => Observable<HttpEvent<R>>;
  public baseDialogRef!: MatDialogRef<BaseDialog, string>;

  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  private _uploadedFileCounter = 0;
  private _initialFilesCount = 0;
  private _isCanceledOrFailed = false;
  private _successfulUploadedCount = 0;
  private readonly _successfulFiles: File[] = [];
  private readonly _uploadResponses: R[] = [];

  public ngOnInit(): void {
    if (this.data?.context?.multipleEntities?.length) {
      this.data.context.multipleEntities.forEach(item => {
        item.files.forEach(file => {
          this.wrappedFiles.push({
            entityId: item.entityId,
            file
          });
        });
      });
    }

    if (this.data.context?.files?.length) {
      this.data.context.files.forEach(file => {
        this.wrappedFiles.push({
          entityId: this.data.context?.entityId,
          file
        });
      });
    }

    this._initialFilesCount = this.wrappedFiles.length;
    this.method = this.data.method;
  }

  public closePopup(): void {
    this.dialogRef.close({
      filesCount: this._successfulUploadedCount,
      successfulFiles: this._successfulFiles,
      uploadResponses: this._uploadResponses
    });
  }

  public closeNotLoaded(): void {
    if (this._uploadedFileCounter === this._initialFilesCount) {
      this.closePopup();

      return;
    }

    this.baseDialogRef = this.dialog.open(BaseDialog, {
      data: {
        header: 'Warning',
        message: 'Files are not uploaded yet. Do you want to cancel?',
        primaryButton: {
          text: 'Go back',
          return: 'Go back'
        },
        secondaryButton: {
          text: 'Close',
          return: 'Close',
          disabled: true
        }
      }
    });

    this.baseDialogRef.afterClosed().subscribe(result => {
      if (result === 'Close') {
        this.closePopup();
      }
    });
  }

  public onFileUploaded(i: number, responseBody?: R): void {
    const wrapped = this.wrappedFiles[i];
    if (wrapped?.file) {
      this._successfulFiles.push(wrapped.file);
    }
    if (responseBody) {
      this._uploadResponses.push(responseBody);
    }
    this._uploadedFileCounter++;
    this._successfulUploadedCount++;
    this._cdr.detectChanges();

    this._isAllFilesDone();
  }

  public onCancelUpload(): void {
    this._uploadedFileCounter++;
    this._isCanceledOrFailed = true;
    this._cdr.detectChanges();
    this._isAllFilesDone();
  }

  public onFailedUpload(): void {
    this._uploadedFileCounter++;
    this._isCanceledOrFailed = true;
    this._cdr.detectChanges();
    this._isAllFilesDone();
  }

  private _isAllFilesDone(delay = 600): void {
    if (this._uploadedFileCounter === this._initialFilesCount && !this._isCanceledOrFailed) {
      setTimeout(() => this.closePopup(), delay);
    }
  }
}
