import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SiteInfo } from '../site-info.interface';
import { LinkInfo } from '../link-info.interface';
import { MessageService } from '@backoffice/shared-ui';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  getSiteInfo(siteInfoUrl: string): Observable<SiteInfo> {
    return this.http.get<SiteInfo>(`${siteInfoUrl}/SiteInfo`);
  }

  getInternalHelpLinkInfo(getLinkUrl: string): Observable<LinkInfo> {
    return this.http
      .get<LinkInfo>(`${getLinkUrl}`, {
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((response: HttpResponse<LinkInfo>) => {
          if (response.status === 302) {
            window.location.href = '/security/login.aspx?action=logout';
            throw new Error(this.messageService.get('REDIRECT_TO_LOGOUT'));
          }

          return response.body!;
        }),
        catchError(() => {
          window.location.href = '/security/login.aspx?action=logout';

          return throwError(() => new Error(this.messageService.get('ERROR_RESPONSE_REDIRECTING_TO_LOGOUT')));
        })
      );
  }

  getHtmlContent(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text', withCredentials: true });
  }

  getJsonContent(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'json', withCredentials: true });
  }
}
