import { Pipe, PipeTransform } from '@angular/core';
import { FieldConfig } from '../../details-panel/field-config.interface';

@Pipe({
  name: 'fieldProperty',
  standalone: true,
  pure: false
})
export class FieldPropertyPipe implements PipeTransform {
  public transform(field: FieldConfig, propertyType: 'value' | 'display'): string | null {
    if (!field.options || field.options.length === 0) return null;

    const [firstOption] = field.options;

    if (typeof firstOption === 'string') return null;

    if (typeof firstOption === 'object') {
      if (propertyType === 'value' && 'value' in firstOption) return 'value';
      if (propertyType === 'display' && 'label' in firstOption) return 'label';
    }

    return null;
  }
}
