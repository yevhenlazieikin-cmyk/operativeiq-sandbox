import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  spinnerEvent: Subject<any> = new Subject<any>();
  inProgress = 0;

  public get InProgress(): boolean {
    return this.inProgress > 0;
  }

  start() {
    this.inProgress++;
    if (this.inProgress === 1) {
      this.spinnerEvent.next(true);
    }
  }

  stop() {
    if (this.inProgress - 1 < 0) {
      this.spinnerEvent.next(false);
    } else {
      this.inProgress--;
      if (this.inProgress === 0) {
        this.spinnerEvent.next(false);
      }
    }
  }

  resetStatus() {
    this.inProgress = 0;
    this.spinnerEvent.next(false);
  }
}
