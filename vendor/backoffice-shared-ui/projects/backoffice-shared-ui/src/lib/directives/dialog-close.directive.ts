import { Directive, inject, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Directive({
  selector: '[boDialogClose]'
})
export class DialogCloseDirective implements OnInit {
  @Input('boDialogClose') disableClose!: boolean;

  public dialogRef = inject(MatDialogRef<any>);

  public ngOnInit() {
    if (!this.disableClose) {
      Array.from(document.querySelectorAll('.cdk-global-overlay-wrapper')).forEach(
        overlay =>
          ((overlay as HTMLElement).onclick = e => {
            if ((e.target as HTMLElement).classList.contains('cdk-global-overlay-wrapper')) {
              this.dialogRef.close();
            }
          })
      );
    }
  }
}
