import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ResetEvent {
  resetAll: boolean;
  formIds?: string[];
}

@Injectable({ providedIn: 'root' })
export class FormValidationService {
  private readonly submitSource = new Subject<string[]>();
  private readonly resetSource = new Subject<ResetEvent>();
  public readonly submitRequested$ = this.submitSource.asObservable();
  public readonly resetRequested$ = this.resetSource.asObservable();

  public submitForm(formIds: string[]): void {
    this.submitSource.next(formIds);
  }

  public resetForm(resetAll: boolean, formIds?: string[]): void {
    this.resetSource.next({ resetAll, formIds });
  }
}
