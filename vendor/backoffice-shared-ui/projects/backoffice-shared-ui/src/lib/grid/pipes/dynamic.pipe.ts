import { inject, Injector, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamic',
  standalone: false
})
export class DynamicPipe implements PipeTransform {
  private readonly injector = inject(Injector);

  public transform(value: any, pipeToken: any, pipeArgs?: any[] | any): any {
    if (!pipeToken) {
      return value;
    } else {
      if (Array.isArray(pipeArgs)) {
        return pipeToken.transform(value, ...pipeArgs);
      } else {
        return pipeToken.transform(value, pipeArgs);
      }
    }
  }
}
