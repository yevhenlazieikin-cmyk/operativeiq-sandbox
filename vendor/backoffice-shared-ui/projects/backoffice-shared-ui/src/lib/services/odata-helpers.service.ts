import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Subscriber } from 'rxjs';

// import { environment } from 'src/environments/environment';
// import { SessionService } from './setting.service';
// import { CrossTabCommunicationManager } from '../_managers/cross-tab-communication-manager';
// IResolverService

import { IApiService } from '../grid/models';

@Injectable({
  providedIn: 'root'
})
export class ODataHelpersService {
  public static syncData<T>(service: IApiService<T>, request: string = '', method = '', ...args: any[]): Observable<T[]> {
    let result: T[] = [];
    let page = 1;
    let _obs: Subscriber<T[]>;

    const handler = (srs: any) => {
      const overallCount = Number(srs.headers.get('X-Overall-Count'));
      const internalCount = Number(srs.headers.get('X-Internal-Count'));
      result = result.concat(srs.body);
      if (internalCount < overallCount) {
        // @ts-expect-error can show ts error
        if (service[method] !== undefined) {
          if (args.length === 0) {
            // @ts-expect-error can show ts error
            service[method](`${request}&$skip=${200 * page++}`).subscribe(handler);
          } else {
            // @ts-expect-error can show ts error
            service[method](...args, `${request}&$skip=${200 * page++}`).subscribe(handler);
          }
        } else {
          if (request) service.getByPost(`${request}&$skip=${200 * page++}`).subscribe(handler);
          else service.get(`${request}&$skip=${200 * page++}`).subscribe(handler);
        }
      } else {
        _obs.next(result);
        _obs.complete();
      }
    };

    return new Observable(obs => {
      _obs = obs;
      // @ts-expect-error can show ts error
      if (service[method] !== undefined) {
        if (args.length === 0) {
          // @ts-expect-error can show ts error
          service[method](request).subscribe(handler);
        } else {
          // @ts-expect-error can show ts error
          service[method](...args, request).subscribe(handler);
        }
      } else {
        if (request === '') {
          service.get(request).subscribe(handler);
        } else {
          service.getByPost(request).subscribe(handler);
        }
      }
    });
  }

  /*  public static resolveIfChanged<T>(
    service: IResolverService<T>,
    request: string = '',
    method = '',
    sessionService: SessionService = null
  ): Observable<T[]> {
    let result: T[] = [];
    let page = 1;
    let _obs: Subscriber<T[]>;
    let lastChangeTime: Date = null;

    const resolved = service.getResolved();
    if (resolved) {
      const _lastModificationTime = this.getFreshDateValue(resolved, 'lastModificationTime');
      const _createdTime = this.getFreshDateValue(resolved, 'createdTime');

      lastChangeTime = _lastModificationTime > _createdTime ? _lastModificationTime : _createdTime;
    }

    const requestHeaders =
      lastChangeTime && environment.RESOLVE_DATA ? { 'If-Modified-Since': new Date(`${lastChangeTime}Z`).toUTCString() } : {};

    const handler = srs => {
      const overallCount = Number(srs.headers.get('X-Overall-Count'));
      const internalCount = Number(srs.headers.get('X-Internal-Count'));
      result = result.concat(srs.body);
      if (internalCount < overallCount) {
        const call: Observable<HttpResponse<T[]>> = this.prapareRequest(service, request, method, undefined, page++);
        call.subscribe(handler);
      } else {
        try {
          service.setResolved(result);
        } catch (ex) {
          const storageCapacity = localStorage.length;
          const keys = [];
          for (let i = 0; i < storageCapacity; i++) {
            keys.push(localStorage.key(i));
          }

          keys.forEach(key => {
            if (!key.includes(`${sessionService.session.userId}`) && key !== CrossTabCommunicationManager.key) {
              localStorage.removeItem(key);
            }
          });

          service.setResolved(result);
        }
        _obs.next(result);
        _obs.complete();
      }
    };

    return new Observable(obs => {
      _obs = obs;
      const call: Observable<HttpResponse<T[]>> = this.prapareRequest(service, request, method, requestHeaders, 0);

      call.subscribe(handler, () => {
        _obs.next(service.getResolved());
        _obs.complete();
      });
    });
  }*/

  /* private static prapareRequest<T>(
    service: IResolverService<T>,
    request: string = '',
    method: string = '',
    headers: any = undefined,
    page: number = 0
  ) {
    let call: Observable<HttpResponse<T[]>>;

    if (service[method] !== undefined) {
      call = service[method](`${request}${page > 0 ? `&$skip=${200 * page}` : ''}`, headers);
    } else {
      if (request) {
        call = service.getByPost(`${request}${page > 0 ? `&$skip=${200 * page}` : ''}`, headers);
      } else {
        call = service.get(`${request}${page > 0 ? `&$skip=${200 * page}` : ''}`, headers);
      }
    }

    return call;
  }

  private static getFreshDateValue<T>(resolved: T[], propertyName: string) {
    return resolved
      .map(x => x[propertyName])
      .filter(x => x !== undefined)
      .map(x => new Date(`${x}`))
      .sort((a, b) => (a < b ? 1 : -1))[0];
  }*/
}
