import { AfterViewInit, ChangeDetectionStrategy, Component, effect, input, output, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextAreaControl } from '@backoffice/shared-ui/lib/text-area-control/text-area-control.component';
import { FileUploaderComponent } from '@backoffice/shared-ui/lib/file-uploader/file-uploader.component';
import { AttachmentItemComponent } from '@backoffice/shared-ui/lib/attachment-item/attachment-item.component';
import { NgTemplateOutlet } from '@angular/common';
import { menuType, ValidationStrategy } from '@backoffice/shared-ui';
import { AbsoluteDivPopoutDirective } from '../error-message/right-side-lug.directive';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { BoFormSubmitDirective } from '../directives/form-submit.directive';

@Component({
  selector: 'bo-submission-panel',
  imports: [
    ReactiveFormsModule,
    TextAreaControl,
    FileUploaderComponent,
    AttachmentItemComponent,
    NgTemplateOutlet,
    AbsoluteDivPopoutDirective,
    OverlayscrollbarsModule,
    BoFormSubmitDirective
  ],
  templateUrl: './submission-panel.component.html',
  styleUrl: './submission-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionPanelComponent implements AfterViewInit {
  @ViewChild(TextAreaControl) private readonly textAreaControl?: TextAreaControl;
  public readonly attachmentsScrollOptions = signal<any>({
    overflow: {
      x: 'hidden'
    }
  });
  public readonly form = input.required<FormGroup>();
  public readonly textControlName = input.required<string>();
  public readonly fileAttachmentControl = input<FormControl<any>>();
  public readonly attachmentControl = input<FormControl[]>();
  public readonly maxLength = input<number>(500);
  public readonly label = input<string>();
  public readonly additionalLabel = input<string | TemplateRef<any>>();
  public readonly buttonLabel = input<string>('Submit');
  public readonly textAreaPlaceholder = input<string>('');
  public readonly userMenu = input<menuType>(menuType.administration);
  public readonly autoFocus = input<boolean>(false);
  public readonly isButtonDisabled = input<boolean>(false);
  public readonly validationMessage = input<string>('Field cannot be empty.');
  public readonly insideDialog = input<boolean>(false);
  public readonly strategy = input<ValidationStrategy>('default');

  public readonly submitComment = output<void>();
  public readonly removeAttachment = output<number>();

  public ngAfterViewInit(): void {
    this.textAreaControl?.autofocusApply();
  }

  public onSubmitComment(): void {
    this.textAreaControl?.autofocusApply();
    this.submitComment.emit();
  }
}
