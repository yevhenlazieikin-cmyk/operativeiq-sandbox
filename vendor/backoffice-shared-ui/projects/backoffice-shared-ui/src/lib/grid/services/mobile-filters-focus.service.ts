import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileFiltersFocusService {
  public focused$ = new Subject<boolean>();
}
