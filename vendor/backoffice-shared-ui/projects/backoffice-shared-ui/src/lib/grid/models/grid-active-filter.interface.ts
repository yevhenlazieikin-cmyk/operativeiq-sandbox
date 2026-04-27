import { SelectedRow } from './grid-cell.interface';
import { FilterData } from './filter-data.interface';

export interface ActiveFilters {
  gridTabName: string;
  activeRow?: SelectedRow;
  filters?: FilterData;
}
