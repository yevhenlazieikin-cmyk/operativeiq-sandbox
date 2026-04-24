import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maxCounter'
})
export class MaxCounterPipe implements PipeTransform {
  transform(value: number, maxLength: number = 2): any {
    return value > -(10 ** maxLength) && value < 10 ** maxLength ? value : `${value < 0 ? '-' : ''}99`;
  }
}
