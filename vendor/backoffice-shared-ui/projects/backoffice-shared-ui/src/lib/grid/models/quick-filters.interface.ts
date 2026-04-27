export interface QuickFilterItem {
  label: string;
  value: string;
  count?: number;
  color?: 'all' | 'green' | 'green-medium' | 'teal' | 'purple' | 'blue' | 'yellow' | 'red' | 'grey';
  isActive?: boolean;
}

export interface QuickFilterGroupItem {
  filters: QuickFilterItem[];
  label?: string;
  multiSelect?: boolean;
  showClearFilters?: boolean;
  filterSelected: (filter: QuickFilterItem) => void;
  clearFilters?: () => void;
}
