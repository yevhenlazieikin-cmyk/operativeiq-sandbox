import { Directive, inject, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appAdHost]',
  standalone: false
})
export class AdDirective {
  public viewContainerRef = inject(ViewContainerRef);
}
