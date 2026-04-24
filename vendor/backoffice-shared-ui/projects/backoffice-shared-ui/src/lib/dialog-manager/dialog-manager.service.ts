import { Injectable, inject, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';

const STACK_CLASS_PREFIX = 'dialog-stack-';

export interface DialogStackEntry {
  id: string;
  ref: MatDialogRef<unknown>;
  panelClass: string;
  /** Data passed when this dialog was hidden; emitted on show. */
  hideData: unknown;
  /** Emits when this dialog is shown again, with the data to pass (from hide or from child result). */
  onShowData$: BehaviorSubject<unknown>;
}

export interface DialogManagerEvent {
  dialogRef: MatDialogRef<unknown>;
  panelClass: string;
}

/**
 * Manages a stack of dialogs so that only one is visible at a time.
 * When opening a "child" dialog, the parent is hidden (not closed) and can receive data when the child closes.
 * Each dialog has its own hide/show data channel: pass data on hide, read it when the dialog is shown again.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogManagerService {
  private readonly dialog = inject(MatDialog);
  private idCounter = 0;
  private readonly stack: DialogStackEntry[] = [];

  /**
   * Returns an observable that emits each time this dialog is shown again (e.g. after a child closed).
   * The emitted value is the data passed when the dialog was hidden, or the child's result when the child closed.
   * Subscribe from the dialog component to read data on show.
   */
  public getOnShowData$(dialogRef: MatDialogRef<unknown>): Observable<unknown> {
    const entry = this.stack.find(e => e.ref === dialogRef);

    return entry ? entry.onShowData$.asObservable() : new BehaviorSubject(null).asObservable();
  }

  /**
   * Pass data that will be emitted when this dialog is shown again.
   * Call before opening a child (e.g. before openAsChild) so that when this dialog is shown again it receives this data.
   */
  public passDataOnHide(dialogRef: MatDialogRef<unknown>, data: unknown): void {
    const entry = this.stack.find(e => e.ref === dialogRef);
    if (entry) {
      entry.hideData = data;
    }
  }

  /**
   * Opens a root dialog and registers it in the stack. Use this for the top-level dialog (e.g. Profile Edit).
   * The dialog will get a unique panelClass so it can be hidden when a child is shown.
   */
  public open<T, R = unknown>(
    component: Type<T>,
    config: Record<string, unknown> & { panelClass?: string | string[] }
  ): MatDialogRef<T, R> {
    const id = this.nextId();
    const panelClass = this.mergePanelClass(config.panelClass, id);
    const ref = this.dialog.open(component, { ...config, panelClass });
    this.stack.push({
      id,
      ref: ref as MatDialogRef<unknown>,
      panelClass: id,
      hideData: null,
      onShowData$: new BehaviorSubject<unknown>(null)
    });

    ref.afterClosed().subscribe(() => this.removeFromStack(ref as MatDialogRef<unknown>));

    return ref as MatDialogRef<T, R>;
  }

  /**
   * Opens a child dialog: hides the parent, opens the child, and when the child closes
   * shows the parent again (or the returnToRef ancestor) and calls onChildClosed with the child's result.
   * Only one dialog is visible at a time.
   *
   * @param parentRef - The ref of the parent dialog (must have been opened via this manager).
   * @param openChild - Function that opens the child dialog. Receives the stack panelClass to add to the child config.
   * @param onChildClosed - Called when the child closes, with the child's result. Parent can use this data.
   * @param options - returnToRef: show this ref when child closes. parentHideData: data for parent when shown again.
   * @returns The child dialog ref.
   */
  public openAsChild<T, R = unknown>(
    parentRef: MatDialogRef<unknown>,
    openChild: (stackPanelClass: string) => MatDialogRef<T, R>,
    onChildClosed?: (result: R | undefined) => void,
    options?: { returnToRef?: MatDialogRef<unknown>; parentHideData?: unknown }
  ): MatDialogRef<T, R> {
    const parentEntry = this.stack.find(e => e.ref === parentRef);
    if (!parentEntry) {
      const ref = openChild(this.nextId());

      ref.afterClosed().subscribe(result => onChildClosed?.(result));

      return ref;
    }
    if (options?.parentHideData !== undefined) {
      parentEntry.hideData = options.parentHideData;
    }
    this.hidePane(parentEntry.panelClass);
    const childId = this.nextId();
    const childRef = openChild(childId);
    this.stack.push({
      id: childId,
      ref: childRef as MatDialogRef<unknown>,
      panelClass: childId,
      hideData: null,
      onShowData$: new BehaviorSubject<unknown>(null)
    });
    childRef.afterClosed().subscribe(result => {
      this.removeFromStack(childRef as MatDialogRef<unknown>);
      const returnToRef = options?.returnToRef;
      if (returnToRef != null && returnToRef !== parentRef) {
        const returnToEntry = this.stack.find(e => e.ref === returnToRef);
        if (returnToEntry) {
          returnToEntry.hideData = result;
          returnToEntry.onShowData$.next(result);
        }
        parentRef.close();
      } else {
        this.showPane(parentEntry.panelClass, result);
      }
      onChildClosed?.(result);
    });

    return childRef;
  }

  /**
   * Closes the given parent dialog and all dialogs that were opened as its children (everything on top of it in the stack).
   * Closes from topmost child down to the parent so that only one dialog is closed at a time.
   */
  public closeWithChildren(parentRef: MatDialogRef<unknown>): void {
    const parentIdx = this.stack.findIndex(e => e.ref === parentRef);

    if (parentIdx < 0) {
      parentRef.close();

      return;
    }

    const toClose = this.stack
      .slice(parentIdx)
      .map(e => e.ref)
      .reverse();

    toClose.forEach(ref => ref.close());
  }

  private nextId(): string {
    this.idCounter += 1;

    return STACK_CLASS_PREFIX + this.idCounter;
  }

  private mergePanelClass(existing: string | string[] | undefined, stackClass: string): string[] {
    let arr: string[];
    if (Array.isArray(existing)) {
      arr = [...existing];
    } else if (existing) {
      arr = [existing];
    } else {
      arr = [];
    }

    arr.push(stackClass);

    return arr;
  }

  private hidePane(panelClass: string): void {
    const el = document.querySelector(`.${panelClass}`);
    if (el instanceof HTMLElement) {
      el.style.visibility = 'hidden';
    }
  }

  private showPane(panelClass: string, showData?: unknown): void {
    const el = document.querySelector(`.${panelClass}`);
    if (el instanceof HTMLElement) {
      el.style.visibility = '';
    }
    const entry = this.stack.find(e => e.panelClass === panelClass);
    if (entry) {
      const data = showData !== undefined ? showData : entry.hideData;
      entry.onShowData$.next(data);
    }
  }

  private removeFromStack(ref: MatDialogRef<unknown>): void {
    const idx = this.stack.findIndex(e => e.ref === ref);

    if (idx >= 0) {
      this.stack.splice(idx, 1);
    }
  }
}
