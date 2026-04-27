import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NotificationInterface, NotificationsService } from '@backoffice/shared-ui/lib/services/notifications.service';
import { NgClass } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BaseDialog } from '@backoffice/shared-ui';

export interface NotificationSegment {
  text: string;
  type: 'ERROR' | 'SUCCESS';
}

@Component({
  selector: 'app-notifications',
  imports: [NgClass],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  public readonly notifications$ = new BehaviorSubject<NotificationInterface[]>([]);
  public readonly notificationService = inject(NotificationsService);
  public readonly dialog = inject(MatDialog);

  public truncatedMessage = '';
  public segments: NotificationSegment[] = [];
  public hasOverflow = false;
  public notificationType: 'ERROR' | 'SUCCESS' = 'SUCCESS';

  private multiSub!: Subscription;
  private readonly MAX_LENGTH = 130;

  public ngOnInit(): void {
    this.multiSub = this.notificationService.notifications.subscribe(notifications => {
      this.notifications$.next(notifications);
      this._buildTruncatedMessage(notifications);
    });
  }

  public ngOnDestroy(): void {
    if (this.multiSub) {
      this.multiSub.unsubscribe();
    }
  }

  public showAll(): void {
    const allMessages = this.notifications$.value.map(n => n.message).join('\n');
    this.dialog.open(BaseDialog, {
      panelClass: 'exception-modal',
      height: '440px',
      width: '575px',
      data: {
        header: 'Validation Exceptions',
        message: allMessages
      }
    });
  }

  private _buildTruncatedMessage(notifications: NotificationInterface[]): void {
    if (!notifications.length) {
      this.truncatedMessage = '';
      this.segments = [];
      this.hasOverflow = false;

      return;
    }

    this.notificationType = notifications.some(n => n.type === 'ERROR') ? 'ERROR' : 'SUCCESS';

    const segments: NotificationSegment[] = [];
    let totalLength = 0;
    let i = 0;

    while (i < notifications.length) {
      const separatorLength = totalLength > 0 ? 1 : 0;
      const nextLength = separatorLength + notifications[i].message.length;

      if (totalLength + nextLength > this.MAX_LENGTH) {
        const remaining = this.MAX_LENGTH - totalLength - separatorLength;
        if (remaining > 0) {
          if (segments.length > 0) {
            segments[segments.length - 1].text += ' ';
          }
          segments.push({
            text: `${notifications[i].message.substring(0, remaining)}...`,
            type: notifications[i].type
          });
        }
        this.segments = segments;
        this.truncatedMessage = segments.map(s => s.text).join('');
        this.hasOverflow = true;

        return;
      }

      if (segments.length > 0) {
        segments[segments.length - 1].text += ' ';
      }
      segments.push({
        text: notifications[i].message,
        type: notifications[i].type
      });
      totalLength += nextLength;
      i++;
    }

    this.segments = segments;
    this.truncatedMessage = segments.map(s => s.text).join('');
    this.hasOverflow = false;
  }
}
