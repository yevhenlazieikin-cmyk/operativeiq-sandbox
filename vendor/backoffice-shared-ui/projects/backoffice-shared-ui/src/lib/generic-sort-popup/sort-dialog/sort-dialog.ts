import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';

@Component({
  templateUrl: './sort-dialog.html',
  styleUrls: ['./sort-dialog.scss'],
  imports: [MatDialogClose, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortDialog {
  public dialogRef = inject(MatDialogRef<SortDialog>);
  public data = inject(MAT_DIALOG_DATA);

  save(newIndex: string) {
    const data = {
      previousIndex: this.data.currentElementIndex,
      updatedIndex: +newIndex - 1
    };
    this.dialogRef.close(data);
  }
}
