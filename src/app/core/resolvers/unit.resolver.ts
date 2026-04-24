import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export interface UnitOption {
  Id: number;
  UnitType: string;
  UnitNumber: string;
}

export const unitResolver: ResolveFn<UnitOption[]> = () =>
  of([
    { Id: 101, UnitType: 'Engine', UnitNumber: 'E-12' },
    { Id: 102, UnitType: 'Engine', UnitNumber: 'E-14' },
    { Id: 201, UnitType: 'Medic', UnitNumber: 'M-22' },
  ]);
