import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageService } from '../services/messages.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkUtil {
  private readonly messageService = inject(MessageService);

  isNetworkError(error: HttpErrorResponse): boolean {
    return error.status === 0 || !navigator.onLine;
  }

  getErrorMessage(): { error: string } {
    return { error: this.messageService.get('NETWORK_ERROR') };
  }
}
