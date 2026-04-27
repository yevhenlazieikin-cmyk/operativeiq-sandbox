import { FilterData } from '../grid/models';
import { QuickFilterItem } from '../grid/models/quick-filters.interface';

/**
 * Utility to connect quick filter selection with grid filter inputs for grids
 * This version only updates filter inputs - the grid will handle data fetching
 * @param filterName - The name of the filter field in filterData.inputs
 * @param filterValue - The value to set (use 'all' to clear the specific filter)
 * @param quickFilters - The array of quick filters to update active state
 * @param filterData - The grid filter data object
 * @param clearOtherFilters - Whether to clear other filter values (default: false)
 * @returns Updated filterData object
 */
export function updateQuickFilterToGridConnection(
  filterName: string,
  filterValue: string,
  quickFilters: QuickFilterItem[],
  filterData: FilterData,
  clearOtherFilters: boolean = false
): FilterData {
  quickFilters.forEach(filter => {
    filter.isActive = filter.value === filterValue;
  });

  const updatedFilterData = {
    ...filterData,
    inputs: filterData.inputs.map(input => {
      if (input.name === filterName) {
        return { ...input, value: filterValue === 'all' ? '' : filterValue };
      } else if (clearOtherFilters) {
        return { ...input, value: '' };
      } else {
        return input;
      }
    })
  };

  return updatedFilterData;
}
