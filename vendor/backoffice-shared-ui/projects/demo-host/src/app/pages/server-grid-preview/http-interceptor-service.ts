import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const sessionService = {
    access_token: 'TODO provide here token'
  };

  const applyTokenToHeaders = (): any => {
    try {
      return `Bearer ${sessionService.access_token}`;
    } catch (e) {
      // this.sessionService.closeSession(true, true);
    }
  };

  const needApplyTokenToHeaders = (url: string) => url.indexOf('logIdentity') === -1;

  const applySignalRConnectionId = (): any => '';
  // sessionService.session?.signalRConnectionId ? sessionService.session.signalRConnectionId : '';

  const newHeaders = req.headers
    .append('Authorization', needApplyTokenToHeaders(req.url) ? applyTokenToHeaders() : '')
    .append('Cache-Control', 'no-cache')
    .append('Pragma', 'no-cache')
    .append('X-SignalR-ConnectionId', applySignalRConnectionId());
  req = req.clone({ headers: newHeaders });

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        // this.sessionService.closeSession(true, true);

        return of(err.message);
      }

      return throwError(err);
    })
  );
}
