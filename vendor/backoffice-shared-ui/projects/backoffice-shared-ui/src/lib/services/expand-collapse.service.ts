import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExpandCollapseService {
  private readonly storagePrefix = 'expand_collapse_';
  private readonly stateByStorageKey = new Map<string, BehaviorSubject<boolean>>();

  public getIsExpanded(name = ''): boolean {
    return this.getOrCreateState(name).value;
  }

  public setIsExpanded(value: boolean, name = ''): void {
    const storageKey = this.getStorageKey(name);
    const state = this.getOrCreateState(name);

    state.next(value);
    this.writeToStorage(value, storageKey);
  }

  public observeIsExpanded(name = ''): BehaviorSubject<boolean> {
    return this.getOrCreateState(name);
  }

  private getOrCreateState(name = ''): BehaviorSubject<boolean> {
    const storageKey = this.getStorageKey(name);
    const existingState = this.stateByStorageKey.get(storageKey);

    if (existingState) {
      return existingState;
    }

    const state = new BehaviorSubject<boolean>(this.readFromStorage(storageKey));
    this.stateByStorageKey.set(storageKey, state);

    return state;
  }

  private getStorageKey(name = ''): string {
    return `${this.storagePrefix}${name}`;
  }

  private readFromStorage(storageKey: string): boolean {
    const value = localStorage.getItem(storageKey);

    return value ? JSON.parse(value) : true;
  }

  private writeToStorage(value: boolean, storageKey: string): void {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }
}
