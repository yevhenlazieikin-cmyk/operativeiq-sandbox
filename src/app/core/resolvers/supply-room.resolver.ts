import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export interface SupplyRoomOption {
  Id: number;
  Name: string;
}

export const supplyRoomResolver: ResolveFn<SupplyRoomOption[]> = () =>
  of([
    { Id: 1, Name: 'Main Supply Room' },
    { Id: 2, Name: 'Secondary Supply' },
  ]);
