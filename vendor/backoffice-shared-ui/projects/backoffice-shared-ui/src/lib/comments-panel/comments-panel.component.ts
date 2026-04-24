import { ChangeDetectionStrategy, Component, effect, ElementRef, input, output, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { SubmissionPanelComponent } from '@backoffice/shared-ui/lib/submission-panel/submission-panel.component';
import { menuType } from '@backoffice/shared-ui';
import { ExpandCollapseToggle } from '../expand-collapse-toggle/expand-collapse-toggle.component';

@Component({
  selector: 'bo-comments-panel',
  imports: [ReactiveFormsModule, SubmissionPanelComponent, NgTemplateOutlet, NgStyle, OverlayscrollbarsModule, ExpandCollapseToggle],
  templateUrl: './comments-panel.component.html',
  styleUrl: './comments-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsPanelComponent {
  @ViewChild('Anchor') private readonly anchor!: ElementRef;

  public readonly form = input.required<FormGroup>();
  public readonly customTemplate = input.required<TemplateRef<any>>();
  public readonly textControlName = input.required<string>();

  public readonly attachmentControl = input<FormControl[]>();
  public readonly fileAttachmentControl = input<FormControl<any>>();
  public readonly items = input<any[]>();
  public readonly title = input<string>('');
  public readonly label = input<string>();
  public readonly buttonLabel = input<string>('Submit');
  public readonly textAreaPlaceholder = input<string>('');
  public readonly itemStatus = input<string | undefined>(undefined);
  public readonly maxLength = input<number>(500);
  public readonly maxCommentsHeight = input<number>(300);
  public readonly showSubmissionPanel = input<boolean>(true);
  public readonly userMenu = input<menuType>(menuType.administration);
  public readonly storageName = input<string>('');
  public readonly isExpandable = input<boolean>(false);

  public readonly options = signal<any>({
    scrollbars: {
      autoHide: 'never'
    }
  });

  public readonly submitComment = output<void>();
  public readonly removeAttachment = output<number>();

  constructor() {
    effect(() => {
      this.items();
      setTimeout(() => {
        this.scrollIntoView();
      }, 0);
    });
  }

  public onSubmitComment(): void {
    this.submitComment.emit();
  }

  public scrollIntoView(): void {
    if (this.anchor) {
      this.anchor.nativeElement.scrollIntoView({
        behavior: 'auto',
        block: 'end'
      });
    }
  }
}
