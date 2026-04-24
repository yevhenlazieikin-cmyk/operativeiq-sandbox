import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  changeEvent: Subject<any> = new Subject<any>();
  clearEvent: Subject<any> = new Subject<any>();

  change(changeInfo: any) {
    this.changeEvent.next(changeInfo);
  }

  clear(clearInfo: any) {
    this.clearEvent.next(clearInfo);
  }
}
