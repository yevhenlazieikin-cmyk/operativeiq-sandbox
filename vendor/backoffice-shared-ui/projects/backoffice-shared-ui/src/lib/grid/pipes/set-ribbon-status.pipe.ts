import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'setRibbonStatus',
  standalone: false
})
export class SetRibbonStatusPipe implements PipeTransform {
  public transform(value: any, row: any, ribbonStatuses: Record<string, (...args: any[]) => boolean>): any {
    if (!ribbonStatuses || !row) {
      return [];
    }
    const classList = [];
    Object.keys(ribbonStatuses).forEach(key => {
      if (ribbonStatuses[key](row)) {
        classList.push(key);
      }
    });

    if (classList.length) {
      classList.push('extra-top-padding');
    }

    return classList;
  }
}
