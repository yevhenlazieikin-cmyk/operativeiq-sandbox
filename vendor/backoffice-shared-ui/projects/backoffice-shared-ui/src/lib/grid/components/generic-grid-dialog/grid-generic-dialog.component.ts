import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { GridModule } from '@backoffice/shared-ui';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { SvgIconComponent } from '../../../svg-icon/svg-icon.component';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'bo-generic-grid-dialog',
  imports: [GridModule, ReactiveFormsModule, MatDialogClose, NgTemplateOutlet, NgClass, SvgIconComponent, DialogMessagesComponent],
  templateUrl: './grid-generic-dialog.component.html',
  styleUrl: './grid-generic-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridGenericDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA);
  readonly destroyRef = inject(DestroyRef);
  public readonly tableDescription = this.data?.tableDescription ? this.data.tableDescription : '';

  filteredItems: any[] = [];
  form: FormGroup;

  constructor() {
    this.form = this.data.form;
    this.filteredItems = this.data?.items ? [...this.data.items] : [];

    if (this.form) {
      this.form
        .get(this.data.callbackControlName)
        ?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          this.filteredItems = this.data.callback(this.filteredItems, value);
        });
    }
  }
}
