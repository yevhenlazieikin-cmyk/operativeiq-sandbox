import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'resolveErrorMessage',
  standalone: true
})
export class ResolveErrorMessagePipe implements PipeTransform {
  public transform(message: string, errorData: ValidationErrors): string {
    if (!message || !errorData || typeof errorData !== 'object') {
      return message;
    }

    let result = message;
    Object.keys(errorData).forEach(key => {
      const pattern = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(pattern, String(errorData[key]));
    });

    return result;
  }
}
