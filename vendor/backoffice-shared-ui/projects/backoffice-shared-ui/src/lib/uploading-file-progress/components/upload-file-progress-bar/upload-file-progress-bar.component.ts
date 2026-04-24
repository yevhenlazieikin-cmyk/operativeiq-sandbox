import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal
} from '@angular/core';
import { MatProgressBar, ProgressBarMode } from '@angular/material/progress-bar';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { EmsEntityAttachmentsContext } from '../../ems-entity-attachments-context.interface';

@Component({
  selector: 'bo-upload-file-progress-bar',
  standalone: true,
  templateUrl: './upload-file-progress-bar.component.html',
  styleUrls: ['./upload-file-progress-bar.component.scss'],
  imports: [MatProgressBar, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadFileProgressBarComponent implements OnInit, OnDestroy {
  @Input() public wrappedFile!: EmsEntityAttachmentsContext;
  @Input() public method!: (file: File, entityId?: number) => Observable<HttpEvent<unknown>>;
  @Output() public readonly successUploadEvent = new EventEmitter<unknown>();
  @Output() public readonly cancelUploadEvent = new EventEmitter<void>();
  @Output() public readonly failedUploadEvent = new EventEmitter<void>();

  public mode: ProgressBarMode = 'determinate';
  public progress = signal<number>(0);
  public uploadAction = signal<string>('');
  public cancelSubject$ = new ReplaySubject<void>(1);
  public publicFile!: File;

  private readonly _destroy$ = new ReplaySubject<void>(1);
  private readonly _cdr = inject(ChangeDetectorRef);
  private isFileSuccessfullyUploaded = false;

  public ngOnInit(): void {
    const { entityId } = this.wrappedFile;
    this.publicFile = this.wrappedFile.file;
    this.method(this.publicFile, entityId)
      .pipe(
        map((event: HttpEvent<unknown>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = event.total ? Math.round((100 / event.total) * event.loaded) : 0;
            this.progress.set(progress);
          } else if (event.type === HttpEventType.Response) {
            this.progress.set(100);
            this.isFileSuccessfullyUploaded = true;
            this._cdr.detectChanges();
            this.successUploadEvent.emit(event.body);
          }
        }),
        catchError((err: { message: string }) => {
          this.uploadAction.set('Failed');
          this.failedUploadEvent.emit();

          return throwError(() => err.message);
        }),
        takeUntil(this.cancelSubject$),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public onCancel(): void {
    if (!this.isFileSuccessfullyUploaded) {
      this.cancelSubject$.next();
      this.uploadAction.set('Canceled');
      this.cancelUploadEvent.next();
    }
  }
}
