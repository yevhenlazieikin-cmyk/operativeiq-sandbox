import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, forkJoin, lastValueFrom, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private messages: any = {};

  private readonly http = inject(HttpClient);

  loadMessages(url: string): Promise<void> {
    const sharedMessages$ = this.http.get('assets/backoffice-shared-ui/data/messages.json').pipe(catchError(() => of({})));
    const appMessages$ = this.http.get(url).pipe(catchError(() => of({})));

    return lastValueFrom(
      forkJoin([sharedMessages$, appMessages$]).pipe(
        map(([shared, app]) => {
          this.messages = { ...shared, ...app };
        })
      )
    );
  }

  get(key: string): string {
    return this.messages[key] || key;
  }
}
