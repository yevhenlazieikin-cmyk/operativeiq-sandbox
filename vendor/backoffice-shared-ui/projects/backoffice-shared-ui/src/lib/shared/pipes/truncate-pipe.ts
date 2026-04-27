import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  public transform(value: string | null | undefined, limit: number = 50): string {
    if (!value) {
      return '';
    }

    return value.length > limit ? `${value.substring(0, limit)}...` : value;
  }
}
