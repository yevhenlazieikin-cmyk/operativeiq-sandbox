import { Injectable } from '@angular/core';
import { ActiveFilters, FilterData, SelectedRow } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GridFilterStorage {
  public setActiveFilter(activeFilter: ActiveFilters): void {
    try {
      localStorage.setItem(activeFilter.gridTabName, JSON.stringify(activeFilter));
    } catch (error) {
      console.warn('Unable to save:', error);
    }
  }

  public getActiveFilter(gridTabName: string): ActiveFilters | null {
    try {
      const gridFilters = localStorage.getItem(gridTabName);
      if (!gridFilters) {
        return null;
      }

      return JSON.parse(gridFilters) as ActiveFilters;
    } catch (error) {
      console.warn('Unable to read:', error);

      return null;
    }
  }

  public removeActiveFilter(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith('grid_filter_'))
      .forEach(key => localStorage.removeItem(key));
  }

  public updateFilterState(filterData?: FilterData, activeRow?: SelectedRow): void {
    const filterHeader = filterData?.filterHeader;
    if (!filterHeader) return;

    const currentFilter = this.getActiveFilter(filterHeader);
    if (!currentFilter) return;

    if (filterData) currentFilter.filters = filterData;
    if (activeRow) currentFilter.activeRow = activeRow;

    this.setActiveFilter(currentFilter);
  }

  public storeOrRestoreFilter(
    filterData: FilterData,
    activeRow: SelectedRow,
    options?: {
      restoreFunctions?: (storedFilters: FilterData, originalFilterData: FilterData) => void;
      migrate?: (storedFilters: FilterData) => void;
    }
  ): void {
    const currentFilter = this.getActiveFilter(filterData.filterHeader!);

    if (!currentFilter) {
      const newFilter: ActiveFilters = {
        gridTabName: filterData.filterHeader!,
        filters: filterData,
        activeRow
      };
      this.setActiveFilter(newFilter);
    } else {
      currentFilter.filters = filterData;

      if (options?.migrate) {
        options.migrate(currentFilter.filters);
      }

      if (options?.restoreFunctions) {
        options.restoreFunctions(currentFilter.filters, filterData);
      }

      const restoredActiveRow = activeRow || currentFilter.activeRow;

      this.updateFilterState(currentFilter.filters, restoredActiveRow);
    }
  }

  public restoreFilterValues(filterData: FilterData): boolean {
    const currentFilter = this.getActiveFilter(filterData.filterHeader!);
    if (!currentFilter?.filters) {
      return false;
    }

    const storedFilters = currentFilter.filters;
    filterData.inputs.forEach(input => {
      const storedInput = storedFilters.inputs.find((e: any) => e.name === input.name);
      if (storedInput) {
        input.value = storedInput.value;
      }
    });

    return true;
  }

  public getActiveRow(filterHeader: string): SelectedRow | null {
    const currentFilter = this.getActiveFilter(filterHeader);

    return currentFilter?.activeRow || null;
  }
}
