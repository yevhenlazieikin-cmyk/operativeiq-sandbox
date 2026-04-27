import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'callTemplateExpression',
  standalone: false
})
export class CallTemplateExpressionPipe implements PipeTransform {
  public transform(event: any, cb: (...args: any[]) => any, entity: any): any {
    if (cb && cb.constructor.name === 'Function') {
      return cb(entity);
    }

    return null;
  }
}
