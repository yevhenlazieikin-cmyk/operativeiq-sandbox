import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly http = inject(HttpClient);
  routePrefix = '/api/logs';
  get(query?: string, headers?: HttpHeaders | Record<string, string | string[]>): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`https://clientdev.operativeiqfrontline.com/FrontlineV_dev${this.routePrefix}?${query || ''}`, {
      observe: 'response',
      headers
    });
  }
  getByPost(query?: string, headers?: HttpHeaders | Record<string, string | string[]>): Observable<HttpResponse<any[]>> {
    return this.http.post<any[]>(`'https://clientdev.operativeiqfrontline.com/FrontlineV_dev'${this.routePrefix}/$query`, query, {
      observe: 'response',
      headers
    });
  }
  getById(id: any): Observable<any> {
    return this.http.get<any>(`'https://clientdev.operativeiqfrontline.com/FrontlineV_dev'${this.routePrefix}/${id}`);
  }
  head(query?: string) {
    return this.http.head(`'https://clientdev.operativeiqfrontline.com/FrontlineV_dev'${this.routePrefix}${query || ''}`, {
      observe: 'response'
    });
  }
  post(item: any): Observable<any> {
    throw new Error('Method not implemented.');
  }
  put(item: any) {
    throw new Error('Method not implemented.');
  }
}
