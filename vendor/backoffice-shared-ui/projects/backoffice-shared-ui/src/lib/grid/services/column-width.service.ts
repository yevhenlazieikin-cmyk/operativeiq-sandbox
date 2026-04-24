import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ColumnWidthService {
  private readonly widthChanges$ = new BehaviorSubject<Map<string, string>>(new Map());

  public updateColumnWidths(widths: Map<string, string>): void {
    this.widthChanges$.next(new Map(widths));
  }

  public getWidthChanges$(): Observable<Map<string, string>> {
    return this.widthChanges$.asObservable();
  }

  public getAllColumnWidths(): Map<string, string> {
    return new Map(this.widthChanges$.getValue());
  }
}
