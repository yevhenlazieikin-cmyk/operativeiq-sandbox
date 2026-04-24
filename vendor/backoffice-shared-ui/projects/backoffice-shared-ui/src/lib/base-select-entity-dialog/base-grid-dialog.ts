import { DestroyRef, Directive, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BaseSelectEntityContext } from './base-select-entity-context.interface';
import { BaseSelectEntityDialog } from './base-select-entity-dialog';

@Directive()
export abstract class BaseGridDialog<T extends { id?: number | undefined }> {
  public data: BaseSelectEntityContext<T> = inject(MAT_DIALOG_DATA);
  public items: any = this.data.gridOptions.items || [];
  public disableSubmit = false;
  public initialData: T[] = this.data.gridOptions.items ? [...this.data.gridOptions.items] : [];
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;

  protected readonly dialogRef: MatDialogRef<BaseSelectEntityDialog<T>> = inject(MatDialogRef);
  protected readonly destroy$ = inject(DestroyRef);

  @HostListener('document:keydown.escape', ['$event'])
  public onEscapePressed(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dialogRef.close('');
  }

  public get mobileSortingCondition(): boolean {
    if (this.data.gridOptions.mobileSortingCondition === undefined) {
      return true;
    }

    return this.data.gridOptions.mobileSortingCondition;
  }
  public get filtersCondition(): boolean {
    if (this.data.gridOptions.filtersCondition === undefined) {
      return false;
    }

    return this.data.gridOptions.filtersCondition;
  }
  public get mobileFilterCondition(): boolean {
    if (this.data.gridOptions.mobileFilterCondition === undefined) {
      return true;
    }

    return this.data.gridOptions.mobileFilterCondition;
  }

  public get proceedInitQuery(): boolean {
    if (this.data.gridOptions.proceedInitQueryOnInit === undefined) {
      return true;
    }

    return this.data.gridOptions.proceedInitQueryOnInit;
  }

  public abstract onDataChanged(data: T[]): void;
}
