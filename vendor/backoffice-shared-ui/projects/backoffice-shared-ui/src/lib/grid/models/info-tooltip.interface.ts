import { Direction } from '@angular/cdk/bidi';

export interface InfoTooltip {
  style?: Record<string, string>;
  direction?: Direction;
  offsetY?: number;
}
