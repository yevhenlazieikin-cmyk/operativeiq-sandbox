import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  private requestCount = 0;

  public get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  public show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  public hide(): void {
    if (this.requestCount > 0) {
      this.requestCount--;
    }
    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  public reset(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }
}
