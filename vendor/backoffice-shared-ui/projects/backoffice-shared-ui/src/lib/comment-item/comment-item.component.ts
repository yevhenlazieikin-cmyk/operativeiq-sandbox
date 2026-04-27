import { Component, inject, input, output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  Comment,
  CommentAttachment,
  CommentAttachmentMetadata,
  isCommentAttachmentMetadata
} from '@backoffice/shared-ui/lib/comment-item/comment-item.interface';
import { AttachmentItemComponent } from '@backoffice/shared-ui/lib/attachment-item/attachment-item.component';
import { CustomDateUtcPipe } from '@backoffice/shared-ui';
import { CURRENT_TIMEZONE } from '@backoffice/shared-ui/lib/shared/tokens/current-timezone.token';
import { SettingHelperService } from '../grid/services/setting-helper.service';
import { CollapsableContentDirective, ExpandCollapseDirective, StaticContentDirective } from '../directives/expand-collapse.directive';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TruncatePipe } from '../shared/pipes/truncate-pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-comment-item',
  imports: [
    NgTemplateOutlet,
    AttachmentItemComponent,
    CustomDateUtcPipe,
    ExpandCollapseDirective,
    StaticContentDirective,
    CollapsableContentDirective,
    SvgIconComponent,
    TruncatePipe,
    MatTooltipModule
  ],
  templateUrl: './comment-item.component.html',
  styleUrl: './comment-item.component.scss'
})
export class CommentItemComponent {
  public readonly comment = input.required<Comment>();
  public readonly customTemplate = input<TemplateRef<any>>();
  public readonly canRemoveAttachmentFn = input<(attachment: CommentAttachmentMetadata) => boolean>();
  private readonly settingHelperService = inject(SettingHelperService);
  public readonly dateFormat = input<string>('MM/dd/yyyy hh:mm a');
  public readonly currentTZ = inject(CURRENT_TIMEZONE);
  public readonly isExpandable = input<boolean>(false);
  public readonly storageName = input<string>('');
  public readonly initialExpanded = input<boolean | null>(null);

  public readonly removeAttachment = output<CommentAttachmentMetadata>();

  public getDateFormat(): string {
    return this.settingHelperService.getDate().formatPipeDateTime || this.dateFormat();
  }

  /** Track by for attachments: id for metadata, name+index for File */
  public getAttachmentTrackId(attachment: CommentAttachment, index: number): string {
    if (isCommentAttachmentMetadata(attachment) && attachment.id != null) {
      return `meta-${attachment.id}`;
    }
    const name = isCommentAttachmentMetadata(attachment) ? attachment.originalFileName : attachment.name;

    return `${name}_${index}`;
  }

  public canRemoveAttachment(attachment: CommentAttachment): boolean {
    if (!isCommentAttachmentMetadata(attachment)) {
      return false;
    }
    const fn = this.canRemoveAttachmentFn();

    return fn ? fn(attachment) : false;
  }

  public onRemoveAttachment(attachment: CommentAttachment): void {
    if (isCommentAttachmentMetadata(attachment)) {
      this.removeAttachment.emit(attachment);
    }
  }
}
