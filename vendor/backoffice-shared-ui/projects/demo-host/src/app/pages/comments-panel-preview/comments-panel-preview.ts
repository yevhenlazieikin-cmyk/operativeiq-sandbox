import { Component, inject, OnInit } from '@angular/core';
import { CommentsPanelComponent } from '@backoffice/shared-ui/lib/comments-panel/comments-panel.component';
import { CommentItemComponent } from '@backoffice/shared-ui/lib/comment-item/comment-item.component';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Comment } from '@backoffice/shared-ui/lib/comment-item/comment-item.interface';

@Component({
  selector: 'app-comments-panel-preview',
  imports: [CommentsPanelComponent, CommentItemComponent],
  templateUrl: './comments-panel-preview.html',
  styleUrl: './comments-panel-preview.scss'
})
export class CommentsPanelPreview implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  public comments: Comment[] = [
    {
      author: 'Mr. Goofy',
      comment: 'Did a lot of work tooday.',
      timestamp: new Date('2025-01-10T11:00:00')
    },
    {
      author: 'Lumberjack',
      comment: 'Cut many trees.',
      timestamp: new Date('2025-01-15T04:30:00'),
      attachments: [
        {
          name: 'Forest_before_me.pdf'
        },
        {
          name: 'trees_variety.xlsx'
        }
      ] as File[]
    }
  ];

  public commentForm = this.formBuilder.group({
    comment: this.formBuilder.nonNullable.control(''),
    attachments: this.formBuilder.array([])
  });

  public fileAttachmentsControl = this.formBuilder.control<File | File[] | null>(null);

  public get attachmentsArray(): FormArray<FormControl<File>> {
    return this.commentForm.get('attachments') as FormArray<FormControl<File>>;
  }

  public onAttachmentUpload(files: File | File[]): void {
    (files as File[]).forEach((file: File) => {
      this.attachmentsArray.push(this.createAttachmentControl(file));
    });
  }

  public removeAt(index: number, attachmentsArray: FormArray<FormControl<File>>): void {
    attachmentsArray.removeAt(index);
  }

  private createAttachmentControl(attachment: File): FormControl<File> {
    return this.formBuilder.nonNullable.control<File>(attachment);
  }

  public onSubmitComment(): void {
    const control = this.commentForm.get('comment');
    if (!control || !control.value) {
      return;
    }

    const newComment: Comment = {
      author: 'Mr. Goofy',
      comment: control.value,
      status: 'Complete',
      timestamp: new Date(),
      attachments: this.attachmentsArray?.value.length > 0 ? this.attachmentsArray?.value : undefined
    };

    this.comments.push(newComment);

    this.commentForm.reset();
    this.attachmentsArray.clear();
  }

  ngOnInit(): void {
    this.fileAttachmentsControl.valueChanges.subscribe(value => {
      if (value) {
        this.onAttachmentUpload(value);
      }
    });
  }
}
