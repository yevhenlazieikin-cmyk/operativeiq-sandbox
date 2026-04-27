import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

export type notificationType = 'ERROR' | 'SUCCESS';

export interface NotificationInterface {
  type: notificationType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService implements OnDestroy {
  private readonly _notifications$ = new BehaviorSubject<NotificationInterface[]>([]);
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private previousUrl: string;

  constructor() {
    this.previousUrl = this.router.url.slice(1);
  }

  public get notifications(): Observable<NotificationInterface[]> {
    return this._notifications$.asObservable();
  }

  public setMessage(message: string, error: boolean = false): void {
    const newMessage: NotificationInterface = {
      type: error ? 'ERROR' : 'SUCCESS',
      message
    };
    this._notifications$.next([newMessage]);
  }

  public setMessages(messages: NotificationInterface[]): void {
    this._notifications$.next(messages);
  }

  public resetMessage(): void {
    this._notifications$.next([]);
  }

  public resetMessageOnRouteChange(routerUrls: string[] = []): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.urlAfterRedirects.slice(1)),
        takeUntil(this.destroy$)
      )
      .subscribe(url => {
        if (!routerUrls.includes(this.previousUrl)) {
          this.resetMessage();
        }
        this.previousUrl = url;
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
