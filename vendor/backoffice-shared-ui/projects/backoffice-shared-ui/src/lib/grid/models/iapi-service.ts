import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface IApiService<T> {
  routePrefix: string;

  get(query?: string, headers?: HttpHeaders | Record<string, string | string[]>): Observable<HttpResponse<T[]>>;

  getByPost(query?: string, headers?: HttpHeaders | Record<string, string | string[]>): Observable<HttpResponse<T[]>>;

  getById(id: any): Observable<T>;

  head(query?: string): any;

  post(item: T): Observable<T>;

  put(item: T): any;
}
