import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TruncatePipe } from '@backoffice/shared-ui/lib/shared/pipes/truncate-pipe';
import { BaseDialog } from '@backoffice/shared-ui';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'bo-dialog-messages',
  imports: [NgClass, TruncatePipe],
  templateUrl: './dialog-messages.component.html',
  styleUrl: './dialog-messages.component.scss'
})
export class DialogMessagesComponent {
  public readonly message = input.required<string>();
  public readonly class = input<string>('');
  public readonly maxLength = input<number>(30);

  private readonly dialog = inject(MatDialog);

  public showAll(): void {
    this.dialog.open(BaseDialog, {
      panelClass: 'exception-modal',
      height: '440px',
      width: '575px',
      data: {
        header: 'Validation Exceptions',
        message: this.message()
      }
    });
  }
}
