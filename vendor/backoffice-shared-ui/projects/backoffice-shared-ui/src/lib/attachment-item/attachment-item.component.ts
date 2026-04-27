import { Component, DestroyRef, inject, input, output, TemplateRef } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { CommentAttachment, isCommentAttachmentMetadata } from '@backoffice/shared-ui/lib/comment-item/comment-item.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-attachment-item',
  imports: [MatIconButton, MatTooltip, NgTemplateOutlet, SvgIconComponent],
  templateUrl: './attachment-item.component.html',
  styleUrl: './attachment-item.component.scss'
})
export class AttachmentItemComponent {
  private readonly http = inject(HttpClient);

  public readonly attachment = input.required<CommentAttachment>();
  public readonly readonly = input<boolean>(true);
  public readonly invalid = input<boolean>(false);
  public readonly canRemove = input<boolean>(false);
  public readonly customTemplate = input<TemplateRef<any>>();

  public readonly removeAttachment = output<void>();

  protected readonly isMetadata = isCommentAttachmentMetadata;
  public readonly destroyRef = inject(DestroyRef)

  /** Display name: File.name or metadata.originalFileName */
  getAttachmentName(att: CommentAttachment): string {
    return isCommentAttachmentMetadata(att) ? att.originalFileName : att.name;
  }

  /** Same-origin URLs require auth; open via fetch so the app sends the token (align with example app: open/display or download). */
  private isSameOrigin(url: string): boolean {
    try {
      return new URL(url, window.location.href).origin === window.location.origin;
    } catch {
      return false;
    }
  }

  onAttachmentLinkClick(event: MouseEvent): void {
    const att = this.attachment();
    if (!isCommentAttachmentMetadata(att) || !att.downloadUrl) return;
    if (!this.isSameOrigin(att.downloadUrl)) return;
    event.preventDefault();
    this.http
      .get(att.downloadUrl, { responseType: 'blob' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank', 'noopener,noreferrer');
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: () => {
          window.open(att.downloadUrl, '_blank', 'noopener,noreferrer');
        }
      });
  }
}
